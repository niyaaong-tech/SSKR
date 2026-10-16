"""Build SSKR's directed road routes from a local Korean OSM extract.

Install tools/route-requirements.txt in an isolated Python environment.
Pass --work outside the repository; only the final compact data is published.
The input is a South Korea OSM extract, never a public routing API.
"""
from __future__ import annotations

import argparse
from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor, as_completed
import gzip
import hashlib
import json
import math
import re
import os
from pathlib import Path
import subprocess
import sys
import threading
import time

import osmium
import valhalla
from valhalla import Actor, get_config

ROOT = Path(__file__).resolve().parents[1]
POLICY_VERSION = "kr-motorcycle-1"
ROAD_TYPES = {"trunk", "trunk_link", "primary", "primary_link", "secondary",
              "secondary_link", "tertiary", "tertiary_link", "unclassified",
              "residential", "living_street", "service"}
DENIED = {"no", "private", "permit", "emergency", "agricultural", "forestry",
          "delivery", "military", "restricted"}
UNPAVED = {"unpaved", "gravel", "fine_gravel", "dirt", "earth", "ground", "sand",
           "mud", "grass", "grass_paver", "woodchips"}
ACCESS_KEYS = ("motorcycle", "motor_vehicle", "vehicle", "access")


def access_value(tags):
    return next((tags[key] for key in ACCESS_KEYS if tags.get(key)), None)


def node_forbidden(tags):
    return access_value(tags) in DENIED or any(tags.get(key + ":conditional") for key in ACCESS_KEYS)


def forbidden(tags):
    """A hard motorcycle denial survives shortest-distance cost settings."""
    road = tags.get("highway", "")
    if road not in ROAD_TYPES or tags.get("motorroad") == "yes":
        return True
    if tags.get("route") in {"ferry", "shuttle_train"} or tags.get("surface") in UNPAVED:
        return True
    # Specific mode access overrides general access; legal road-class exclusions
    # above cannot be overridden by an erroneous motorcycle=yes.
    return node_forbidden(tags)


def dump(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(path.name + ".tmp")
    temporary.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    for attempt in range(8):
        try:
            temporary.replace(path)
            break
        except PermissionError:
            if attempt == 7:
                raise
            time.sleep(.05 * (attempt + 1))


def pack_shapes(legs):
    """Lossless prefix references share the long roads leaving each origin."""
    packed, previous_id, previous_shape = {}, None, ""
    for target, leg in sorted(legs.items(), key=lambda item: item[1]["shape"]):
        shape = leg["shape"]
        prefix = len(os.path.commonprefix([previous_shape, shape]))
        packed[target] = ({"base": previous_id, "prefix": prefix, "shape": shape[prefix:]}
                          if prefix > 64 else {"shape": shape})
        previous_id, previous_shape = target, shape
    return packed


def catalog(catalog_path=None):
    if catalog_path:
        value = json.loads(catalog_path.read_text(encoding="utf-8"))
        places = value.get("records") if isinstance(value, dict) else value
        if not isinstance(places, list) or not places:
            raise ValueError("Catalog must contain a nonempty place list")
        for p in places:
            if not isinstance(p, dict) or not isinstance(p.get("id"), str) or not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", p["id"]):
                raise ValueError("Catalog place IDs must be safe lowercase slugs")
            if p.get("kind") not in {"start", "spot", "finish"} or any(not isinstance(p.get(k), (int, float)) or isinstance(p.get(k), bool) or not math.isfinite(p[k]) for k in ("lat", "lng")):
                raise ValueError("Catalog places require a kind and finite coordinates")
        if len({p["id"] for p in places}) != len(places):
            raise ValueError("Duplicate catalog place IDs")
        return places
    raw = subprocess.check_output(["node", "-e", "process.stdout.write(JSON.stringify(require('./web/app/spot-catalog.js')))"], cwd=ROOT)
    return json.loads(raw.decode("utf-8"))


def prepare(work, source, source_url, bounds=None):
    with osmium.io.Reader(str(source)) as reader:
        snapshot = reader.header().get("osmosis_replication_timestamp")
    snapshot_basis = "replication-header" if snapshot else "latest-object-timestamp"
    latest_timestamp = None

    def observe_timestamp(obj):
        nonlocal latest_timestamp
        if not snapshot:
            timestamp = obj.timestamp
            if timestamp.year > 1970 and (latest_timestamp is None or timestamp > latest_timestamp):
                latest_timestamp = timestamp

    target = work / "korea-motorcycle.osm.pbf"
    if target.exists():
        target.unlink()  # Replace only this named generated file in external work.
    allowed, denied = set(), set()
    class Filter(osmium.SimpleHandler):
        def node(self, n):
            observe_timestamp(n)
            tags = dict(n.tags)
            if node_forbidden(tags):
                tags["motorcycle"] = "no"
                writer.add_node(n.replace(tags=tags))
            else:
                writer.add_node(n)

        def way(self, w):
            if bounds and ('highway' not in w.tags or not all(n.location.valid() and bounds[0] <= n.lat <= bounds[2] and bounds[1] <= n.lon <= bounds[3] for n in w.nodes)):
                return
            observe_timestamp(w)
            tags = dict(w.tags)
            if "highway" in tags or tags.get("route") in {"ferry", "shuttle_train"}:
                blocked = forbidden(tags)
                (denied if blocked else allowed).add(w.id)
                # Country-specific motorway/motorroad restrictions are explicit,
                # independent of the engine's generic country defaults.
                if blocked:
                    tags["motorcycle"] = "no"
                else:
                    tags["motorcycle"] = access_value(tags) or "yes"
                writer.add_way(w.replace(tags=tags))
            else:
                writer.add_way(w)

        def relation(self, r):
            observe_timestamp(r)
            if not bounds or (r.tags.get('type') == 'restriction' and all(m.ref in allowed or m.ref in denied for m in r.members if m.type == 'w')):
                writer.add_relation(r)  # Preserve applicable turn restrictions and boundaries.

    started = time.time()
    with osmium.SimpleWriter(str(target)) as writer:
        Filter().apply_file(str(source), locations=bool(bounds))
    if not snapshot and latest_timestamp is not None:
        snapshot = latest_timestamp.isoformat().replace("+00:00", "Z")
    with source.open("rb") as stream:
        digest = hashlib.file_digest(stream, "sha256").hexdigest()
    dump(work / "input.json", {"source": source_url,
         "snapshot": snapshot, "snapshotBasis": snapshot_basis, "sha256": digest, "policyVersion": POLICY_VERSION,
         "allowedWayCount": len(allowed), "blockedWayCount": len(denied), "bounds": bounds})
    dump(work / "allowed-ways.json", sorted(allowed))
    dump(work / "blocked-ways.json", sorted(denied))
    print(json.dumps({"stage": "prepare", "seconds": round(time.time()-started), "allowed": len(allowed), "blocked": len(denied)}), flush=True)


def graph(work, resume="initialize"):
    tile_dir = work / "tiles"
    tile_dir.mkdir(exist_ok=True)
    config = get_config(tile_dir=tile_dir, tile_extract="", verbose=True)
    config["mjolnir"].update({"tile_dir": str(tile_dir), "tile_extract": "", "concurrency": 1})
    config["mjolnir"]["logging"] = {"type": "std_out", "color": False}
    for section in ("loki", "thor", "odin"):
        config[section]["logging"] = {"type": "std_out", "color": False}
    config["service_limits"]["motorcycle"]["max_distance"] = 2_000_000
    config["service_limits"]["motorcycle"]["max_locations"] = 160
    config["service_limits"]["max_radius"] = 2000
    dump(work / "config.json", config)
    executable = Path(valhalla.__file__).parent / "bin" / ("valhalla_build_tiles.exe" if os.name == "nt" else "valhalla_build_tiles")
    environment = os.environ.copy()
    if os.name == "nt":
        environment["PATH"] = str(Path(valhalla.__file__).parent.parent / "pyvalhalla.libs") + os.pathsep + environment.get("PATH", "")
    with (work / "graph.log").open("w", encoding="utf-8") as output:
        subprocess.run([str(executable), "-c", str(work / "config.json"), "-s", resume, str(work / "korea-motorcycle.osm.pbf")], stdout=output, stderr=subprocess.STDOUT, check=True, env=environment)
    print("Graph built", flush=True)


def make_actor(work):
    config = json.loads((work / "config.json").read_text(encoding="utf-8"))
    config["logging"]["type"] = ""
    config["service_limits"]["trace"].update({"max_shape": 100000, "max_distance": 2_000_000})
    config["service_limits"]["motorcycle"]["max_distance"] = 2_000_000
    # Disable distance-based hierarchy fallback for the entire Korean extract.
    config["service_limits"]["max_distance_disable_hierarchy_culling"] = 2_000_000
    config["service_limits"]["allow_hard_exclusions"] = True
    return Actor(config)


def access_points(work, places, allowed):
    actor = make_actor(work)
    points = {}
    for p in places:
        request = {"locations": [{"lat": p["lat"], "lon": p["lng"], "radius": 750, "search_cutoff": 750}],
                   "costing": "motorcycle", "verbose": True}
        try:
            edges = actor.locate(request)[0]["edges"]
            choices = [e for e in edges if e["edge_info"]["way_id"] in allowed
                       and e["edge"]["access"]["motorcycle"] and e["distance"] <= 750
                       and min(e.get("outbound_reach", 0), e.get("inbound_reach", 0)) >= 50
                       and not e["edge"].get("tunnel")]
            if not choices:
                points[p["id"]] = {"status": "unavailable", "reason": "접근 가능한 도로를 확인하지 못했습니다."}
                continue
            e = min(choices, key=lambda e: e["distance"])
            points[p["id"]] = {"status": "ready", "lat": e["correlated_lat"], "lng": e["correlated_lon"],
                               "snapDistanceMeters": round(e["distance"]), "wayId": e["edge_info"]["way_id"]}
        except valhalla.ValhallaError as error:
            points[p["id"]] = {"status": "unavailable", "reason": str(error)}
    dump(work / "access-points.json", points)
    print(json.dumps({"stage": "access", "ready": sum(p["status"] == "ready" for p in points.values()),
                      "unavailable": [id for id, p in points.items() if p["status"] != "ready"]}), flush=True)
    return points


def worker_init(work_path, points, version):
    global ROUTER, ALLOWED, POINTS, VERSION, WORK
    WORK = Path(work_path)
    ROUTER = make_actor(WORK)
    ALLOWED = set(json.loads((WORK / "allowed-ways.json").read_text()))
    POINTS, VERSION = points, version


def route_origin(job):
    # Exact edge walking recurses along long roads. The Windows main thread's
    # small native stack overflows on cross-country routes; use a sized stack.
    if os.name == "nt":
        threading.stack_size(64 * 1024 * 1024)
        with ThreadPoolExecutor(max_workers=1) as thread:
            return thread.submit(route_origin_impl, job).result()
    return route_origin_impl(job)


def geometry_vertices(encoded):
    if not isinstance(encoded, str):
        raise ValueError("Missing polyline")
    def vertices(encoded):
        index = lat = lon = 0
        points = []
        while index < len(encoded):
            values = []
            for _ in range(2):
                value = shift = 0
                while True:
                    byte = ord(encoded[index]) - 63
                    index += 1
                    if not 0 <= byte <= 63:
                        raise ValueError("Invalid polyline")
                    value |= (byte & 31) << shift
                    shift += 5
                    if byte < 32:
                        break
                values.append(~(value >> 1) if value & 1 else value >> 1)
            lat += values[0]
            lon += values[1]
            point = (lat, lon)
            if not points or points[-1] != point:
                points.append(point)
        return points

    return vertices(encoded)


def same_geometry(first, second):
    if not isinstance(first, str) or not isinstance(second, str):
        return False
    if first == second:
        return True
    try:
        return geometry_vertices(first) == geometry_vertices(second)
    except (IndexError, ValueError):
        return False


def trace_covers_geometry(original, matched):
    if same_geometry(original, matched):
        return True
    try:
        route, trace = geometry_vertices(original), geometry_vertices(matched)
    except (IndexError, ValueError):
        return False
    if not route or len(trace) <= len(route):
        return False
    prefix = suffix = 0
    for first, second in zip(route, trace):
        if first != second:
            break
        prefix += 1
    for first, second in zip(reversed(route), reversed(trace)):
        if first != second:
            break
        suffix += 1
    # A partial loop edge can be serialized in full by the matching API.
    # All original segments must remain verbatim, in order, on either side
    # of one extra closed loop. No original segment is dropped or snapped.
    return (prefix > 0 and suffix > 0 and prefix + suffix - 1 == len(route)
            and trace[prefix - 1] == trace[len(trace) - suffix])


def reversed_polyline(shape):
    encoded = []
    previous = (0, 0)
    for point in reversed(geometry_vertices(shape)):
        for coordinate, last in zip(point, previous):
            delta = coordinate - last
            value = ~(delta << 1) if delta < 0 else delta << 1
            while value >= 32:
                encoded.append(chr((32 | (value & 31)) + 63))
                value >>= 5
            encoded.append(chr(value + 63))
        previous = point
    return "".join(encoded)


def exact_trace(actor, shape):
    request = {"encoded_polyline": shape, "shape_match": "edge_walk", "costing": "motorcycle",
               "filters": {"action": "include", "attributes": ["edge.way_id", "edge.road_class", "edge.use"]}}
    try:
        return actor.trace_attributes(request)
    except valhalla.ValhallaError as error:
        if "edge_walk" not in str(error):
            raise
        # Some partial service-road origins cannot initialize edge walking.
        # Accept the documented fallback only when every original segment is
        # preserved in order. The API may serialize a partial loop edge in
        # full; that extra closed loop is checked but is never published.
        request["shape_match"] = "walk_or_snap"
        request["filters"]["attributes"].append("shape")
        trace = actor.trace_attributes(request)
        if not trace_covers_geometry(shape, trace.get("shape")):
            # Attribute lookup can round a partial destination differently.
            # Walking the exact reversed geometry avoids that correlation.
            # Only this read-only lookup ignores direction; actual routing
            # always respects one-ways and keeps its original geometry.
            try:
                reverse = reversed_polyline(shape)
                reverse_trace = actor.trace_attributes({**request, "encoded_polyline": reverse,
                    "shape_match": "edge_walk", "costing_options": {"motorcycle": {"ignore_oneways": True}}})
                if same_geometry(reverse, reverse_trace.get("shape")):
                    return reverse_trace
            except (IndexError, ValueError, valhalla.ValhallaError):
                pass
            raise RuntimeError("Road matching changed the route geometry") from error
        return trace


def route_origin_impl(job):
    origin, destinations = job
    path = WORK / "rows" / (origin + ".json")
    if path.exists():
        previous = json.loads(path.read_text(encoding="utf-8"))
        if previous.get("version") == VERSION and not previous.get("unavailable"):
            return origin, len(previous["legs"]), len(previous["unavailable"])
    result = {"version": VERSION, "fromId": origin, "legs": {}, "unavailable": {}}
    costing = {"shortest": True, "disable_hierarchy_pruning": True, "ignore_access": False,
               "ignore_oneways": False, "ignore_restrictions": False, "exclude_highways": True,
               "exclude_ferries": True, "exclude_unpaved": True}
    for target in destinations:
        if POINTS[origin]["status"] != "ready" or POINTS[target]["status"] != "ready":
            result["unavailable"][target] = "ACCESS_POINT_UNAVAILABLE"
            continue
        locations = [{"lat": POINTS[id]["lat"], "lon": POINTS[id]["lng"], "type": "break",
                      "radius": 10, "search_cutoff": 40} for id in (origin, target)]
        try:
            dump(WORK / "progress" / (origin + ".json"), {"target": target, "stage": "route"})
            trip = ROUTER.route({"locations": locations, "costing": "motorcycle", "costing_options": {"motorcycle": costing},
                                 "directions_options": {"units": "kilometers"}})["trip"]
            leg = trip["legs"][0]
            if trip["status"] != 0 or len(trip["legs"]) != 1:
                raise RuntimeError("Incomplete route " + origin + " -> " + target)
            if leg["summary"].get("has_highway") or leg["summary"].get("has_ferry") or leg["summary"].get("has_time_restrictions"):
                result["unavailable"][target] = "RESTRICTED_ROAD"
                continue
            # Edge-walk the exact returned geometry, not a loose map match.
            # Route-search hierarchy options are not needed for an exact edge
            # walk (and crash the Windows 3.9 binding when used for tracing).
            dump(WORK / "progress" / (origin + ".json"), {"target": target, "stage": "trace"})
            trace = exact_trace(ROUTER, leg["shape"])
            ways = {e["way_id"] for e in trace["edges"]}
            if not ways or 0 in ways:
                raise RuntimeError("Graph did not retain source road IDs: " + origin + " -> " + target)
            if not ways.issubset(ALLOWED):
                result["unavailable"][target] = "ACCESS_VALIDATION_FAILED"
                continue
            result["legs"][target] = {"shape": leg["shape"], "distanceMeters": round(leg["summary"]["length"] * 1000),
                                      "durationSeconds": round(leg["summary"]["time"]), "validatedWayCount": len(ways)}
        except valhalla.ValhallaError as error:
            result["unavailable"][target] = str(error)
    dump(path, result)
    return origin, len(result["legs"]), len(result["unavailable"])


def routes(work, workers, only, catalog_path=None, output=None, parent_manifest=None):
    places = catalog(catalog_path)
    source = json.loads((work / "input.json").read_text())
    catalog_json = json.dumps([{k: p[k] for k in ("id", "kind", "lat", "lng")} for p in places], separators=(",", ":"))
    catalog_version = hashlib.sha256(catalog_json.encode()).hexdigest()[:16]
    allowed = set(json.loads((work / "allowed-ways.json").read_text()))
    points = access_points(work, places, allowed)
    parent = json.loads(parent_manifest.read_text(encoding="utf-8")) if parent_manifest else None
    if parent:
        for place_id, point in list(points.items()):
            original = parent.get("accessPoints", {}).get(place_id)
            if original:
                if original["wayId"] not in allowed or point.get("status") != "ready":
                    raise RuntimeError("Supplement anchor no longer exists: " + place_id)
                points[place_id] = original
    access_version = hashlib.sha256(json.dumps(points, sort_keys=True).encode()).hexdigest()
    graph_scope = json.dumps(source.get("bounds"), separators=(",", ":")) if source.get("bounds") else ""
    version = hashlib.sha256((source["sha256"] + POLICY_VERSION + graph_scope + catalog_version + access_version).encode()).hexdigest()[:20]
    if sum(p["status"] == "ready" for p in points.values()) < len(places) * .8:
        raise RuntimeError("Too few road access points; inspect graph metadata before publishing")
    jobs = [(p["id"], [q["id"] for q in places if q["kind"] in {"spot", "finish"} and p["id"] != q["id"]])
            for p in places if p["kind"] != "finish" and (not only or p["id"] in only)]
    started = time.time()
    with ProcessPoolExecutor(max_workers=workers, initializer=worker_init, initargs=(str(work), points, version)) as pool:
        futures = [pool.submit(route_origin, job) for job in jobs]
        for i, future in enumerate(as_completed(futures), 1):
            origin, success, failed = future.result()
            print(json.dumps({"origin": origin, "done": i, "total": len(jobs), "ready": success, "unavailable": failed,
                              "seconds": round(time.time() - started)}), flush=True)
    if only:
        return
    output = output or ROOT / "web" / "shared" / "routes"
    publication = output
    ids = [p["id"] for p in places]
    distances = [[0 if a == b else None for b in ids] for a in ids]
    durations = [[0 if a == b else None for b in ids] for a in ids]
    unavailable = {}
    for place in places:
        origin = place["id"]
        if place["kind"] == "finish":
            continue
        row = json.loads((work / "rows" / (origin + ".json")).read_text(encoding="utf-8"))
        if row["version"] != version:
            raise RuntimeError("Mixed graph versions")
        for target, leg in row["legs"].items():
            distances[ids.index(origin)][ids.index(target)] = leg["distanceMeters"]
            durations[ids.index(origin)][ids.index(target)] = leg["durationSeconds"]
        unavailable[origin] = row["unavailable"]
        public_row = {"version": version, "fromId": origin, "legs": pack_shapes(row["legs"])}
        target = publication / "legs" / (origin + ".json.gz")
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(gzip.compress(json.dumps(public_row, ensure_ascii=False, separators=(",", ":")).encode(), compresslevel=9, mtime=0))
    dump(publication / "manifest.json", {"schemaVersion": 1, "version": version, "catalogVersion": catalog_version,
          "parentVersion": parent["version"] if parent else None, "placeIds": ids, "distances": distances, "durations": durations, "accessPoints": points,
          "dataFileSuffix": ".json.gz", "geometryEncoding": "polyline6-prefix", "source": source, "engine": "Valhalla " + str(valhalla.__version__),
          "accessPolicy": {"maxSnapMeters": 750, "minReachableEdges": 50, "tunnelAccess": False},
          "license": "ODbL-1.0", "attribution": "© OpenStreetMap contributors", "policyVersion": POLICY_VERSION})
    dump(publication / "validation.json", {"version": version, "routeCount": sum(v is not None and v > 0 for row in distances for v in row),
          "unavailable": unavailable, "policy": "Every published route was edge-walked or matched with all original segments unchanged and in order, then checked against permitted OSM way IDs. Duplicate vertices and an extra closed serialization loop are allowed only in the validation response; the original route is always published."})
    # Removed catalog origins must not leave unused public geometry behind.
    active_origins = {p["id"] for p in places if p["kind"] != "finish"}
    for path in (publication / "legs").glob("*.json.gz"):
        if path.name.removesuffix(".json.gz") not in active_origins:
            path.unlink()
    print(json.dumps({"stage": "publish", "version": version, "bytes": sum(p.stat().st_size for p in output.rglob("*") if p.is_file())}), flush=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--work", type=Path, required=True)
    parser.add_argument("--input", type=Path)
    parser.add_argument("--parent-manifest", type=Path, help="National manifest for shared supplemental access points")
    parser.add_argument("--bounds", nargs=4, type=float, metavar=("SOUTH", "WEST", "NORTH", "EAST"), help="Optional regional graph bounds for supplemental places")
    parser.add_argument("--source-url", default="https://download.geofabrik.de/asia/south-korea-latest.osm.pbf")
    parser.add_argument("--stage", choices=["prepare", "graph", "routes"], required=True)
    parser.add_argument("--resume", default="initialize")
    parser.add_argument("--workers", type=int, default=3)
    parser.add_argument("--only", nargs="*")
    parser.add_argument("--catalog", type=Path, help="Validated staged catalog JSON, or an export with records")
    parser.add_argument("--output", type=Path, help="Publish verified roads to a staging directory before catalog promotion")
    args = parser.parse_args()
    work = args.work.resolve()
    if work == ROOT or ROOT in work.parents:
        raise SystemExit("Use a work directory outside the repository")
    work.mkdir(parents=True, exist_ok=True)
    if args.stage == "prepare":
        if not args.input:
            parser.error("--input is required for prepare")
        prepare(work, args.input, args.source_url, args.bounds)
    elif args.stage == "graph":
        graph(work, args.resume)
    elif args.stage == "routes":
        routes(work, args.workers, args.only, args.catalog, args.output, args.parent_manifest)


if __name__ == "__main__":
    main()
