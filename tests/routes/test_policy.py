"""Run with the Python environment from tools/route-requirements.txt.

python -B -m unittest discover -s tests/routes -p test_policy.py -v
The PBF round trip uses a temporary directory outside the repository.
"""
import contextlib
import hashlib
import importlib.util
import io
import json
from pathlib import Path
import sys
import tempfile
import unittest
from xml.sax.saxutils import quoteattr

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location("route_builder", ROOT / "tools" / "build-route-data.py")
builder = importlib.util.module_from_spec(spec)
spec.loader.exec_module(builder)


class MotorcyclePolicyTests(unittest.TestCase):
    def test_shape_prefix_packing_is_lossless_and_acyclic(self):
        shapes = {"west": {"shape": "a" * 100 + "west"},
                  "north": {"shape": "a" * 100 + "north"},
                  "south": {"shape": "a" * 100 + "south"},
                  "other": {"shape": "b" * 100}}
        restored = {}
        for name, leg in builder.pack_shapes(shapes).items():
            prefix = restored[leg["base"]][:leg["prefix"]] if "base" in leg else ""
            restored[name] = prefix + leg["shape"]
        self.assertEqual(restored, {name: leg["shape"] for name, leg in shapes.items()})

    def test_motorway_and_motorroad_are_hard_exclusions(self):
        for road in ("motorway", "motorway_link"):
            for access in (None, "yes", "designated"):
                with self.subTest(road=road, access=access):
                    tags = {"highway": road}
                    if access:
                        tags["motorcycle"] = access
                    self.assertTrue(builder.forbidden(tags))
        for road in ("trunk", "trunk_link", "primary", "service"):
            with self.subTest(road=road):
                self.assertTrue(builder.forbidden({"highway": road, "motorroad": "yes", "motorcycle": "yes"}))

    def test_ordinary_trunk_is_not_confused_with_motorroad(self):
        for road in ("trunk", "trunk_link", "primary", "residential", "service"):
            with self.subTest(road=road):
                self.assertFalse(builder.forbidden({"highway": road}))
                self.assertFalse(builder.forbidden({"highway": road, "motorroad": "no"}))

    def test_transport_specific_access_overrides_general_access(self):
        allowed = [
            {"access": "private", "motorcycle": "yes"},
            {"access": "no", "vehicle": "yes"},
            {"access": "private", "vehicle": "no", "motor_vehicle": "permissive"},
            {"access": "private", "motor_vehicle": "no", "motorcycle": "designated"},
        ]
        denied = [
            {"access": "yes", "vehicle": "no"},
            {"access": "yes", "vehicle": "yes", "motor_vehicle": "private"},
            {"motor_vehicle": "yes", "motorcycle": "no"},
        ]
        for tags in allowed:
            with self.subTest(tags=tags):
                self.assertFalse(builder.forbidden({"highway": "residential", **tags}))
                self.assertFalse(builder.node_forbidden(tags))
        for tags in denied:
            with self.subTest(tags=tags):
                self.assertTrue(builder.forbidden({"highway": "residential", **tags}))
                self.assertTrue(builder.node_forbidden(tags))

    def test_private_and_restricted_access_are_not_public_routes(self):
        for key in ("motorcycle", "motor_vehicle", "vehicle", "access"):
            for value in ("no", "private", "permit", "emergency", "agricultural", "forestry", "delivery", "military", "restricted"):
                with self.subTest(key=key, value=value):
                    self.assertTrue(builder.forbidden({"highway": "service", key: value}))
                    self.assertTrue(builder.node_forbidden({key: value}))

    def test_conditional_access_is_not_assumed_without_a_ride_date(self):
        for key in ("motorcycle", "motor_vehicle", "vehicle", "access"):
            tags = {"motorcycle": "yes", key + ":conditional": "no @ (22:00-06:00)"}
            with self.subTest(key=key):
                self.assertTrue(builder.forbidden({"highway": "primary", **tags}))
                self.assertTrue(builder.node_forbidden(tags))

    def test_non_road_ferry_construction_and_unpaved_exclusions(self):
        for road in ("footway", "pedestrian", "cycleway", "path", "steps", "track", "construction", "proposed"):
            with self.subTest(road=road):
                self.assertTrue(builder.forbidden({"highway": road, "motorcycle": "yes"}))
        for route in ("ferry", "shuttle_train"):
            self.assertTrue(builder.forbidden({"highway": "service", "route": route}))
        for surface in ("unpaved", "gravel", "fine_gravel", "dirt", "earth", "ground", "sand", "mud", "grass", "grass_paver", "woodchips"):
            with self.subTest(surface=surface):
                self.assertTrue(builder.forbidden({"highway": "primary", "surface": surface}))
        for surface in ("asphalt", "concrete", "paving_stones"):
            self.assertFalse(builder.forbidden({"highway": "residential", "surface": surface}))


class PreparedDataTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp = tempfile.TemporaryDirectory(prefix="sskr-route-policy-")
        cls.work = Path(cls.temp.name)
        tag_xml = lambda tags: "".join(f"<tag k={quoteattr(key)} v={quoteattr(value)}/>" for key, value in tags.items())
        node_tags = {1: {"barrier": "gate", "access": "private", "motorcycle": "yes"},
                     2: {"barrier": "gate", "access": "no", "motor_vehicle": "yes"},
                     3: {"barrier": "gate", "vehicle": "private"},
                     4: {"access:conditional": "no @ (22:00-06:00)"}}
        cls.original_ways = {
            101: {"highway": "trunk", "oneway": "yes"},
            102: {"highway": "trunk", "motorroad": "yes", "motorcycle": "yes"},
            103: {"highway": "primary", "access": "private", "motor_vehicle": "yes"},
            104: {"highway": "residential", "oneway": "-1"},
            105: {"highway": "service", "access": "destination"},
            106: {"highway": "service", "access": "customers"},
            107: {"highway": "primary", "vehicle": "no"},
            108: {"highway": "path", "motorcycle": "yes"},
            109: {"highway": "residential", "surface": "gravel"},
            110: {"highway": "motorway", "motorcycle": "yes"},
            111: {"highway": "motorway_link"},
            112: {"highway": "tertiary", "motor_vehicle": "no", "motorcycle": "designated"},
            113: {"highway": "primary", "access": "private", "motorcycle": "permissive"},
            114: {"highway": "tertiary", "oneway": "yes", "oneway:motorcycle": "no"},
            115: {"route": "ferry"},
        }
        cls.original_relations = {
            201: {"type": "restriction", "restriction": "no_left_turn"},
            202: {"type": "restriction", "restriction:motorcycle": "only_right_turn", "except": "bicycle;psv"},
            203: {"type": "restriction", "restriction": "no_right_turn", "except": "motorcycle"},
        }
        nodes = "".join(f'<node id="{n}" version="1" timestamp="2026-09-30T10:00:00Z" lat="{36 + n / 1000}" lon="127">{tag_xml(node_tags.get(n, {}))}</node>' for n in range(1, 7))
        ways = "".join(f'<way id="{wid}" version="1"><nd ref="5"/><nd ref="6"/>{tag_xml(tags)}</way>' for wid, tags in cls.original_ways.items())
        members = '<member type="way" ref="101" role="from"/><member type="node" ref="6" role="via"/><member type="way" ref="104" role="to"/>'
        relations = "".join(f'<relation id="{rid}" version="1">{members}{tag_xml(tags)}</relation>' for rid, tags in cls.original_relations.items())
        cls.source = cls.work / "source.osm"
        cls.source.write_text(f'<?xml version="1.0" encoding="UTF-8"?><osm version="0.6" generator="sskr-policy-test">{nodes}{ways}{relations}</osm>', encoding="utf-8")
        with contextlib.redirect_stdout(io.StringIO()):
            builder.prepare(cls.work, cls.source, "https://example.test/south-korea.osm")

        class Capture(builder.osmium.SimpleHandler):
            def __init__(self):
                super().__init__()
                self.nodes, self.ways, self.relations = {}, {}, {}

            def node(self, obj):
                self.nodes[obj.id] = dict(obj.tags)

            def way(self, obj):
                self.ways[obj.id] = {"tags": dict(obj.tags), "nodes": [node.ref for node in obj.nodes]}

            def relation(self, obj):
                self.relations[obj.id] = {"tags": dict(obj.tags), "members": [(m.type, m.ref, m.role) for m in obj.members]}

        cls.data = Capture()
        cls.data.apply_file(str(cls.work / "korea-motorcycle.osm.pbf"))

    @classmethod
    def tearDownClass(cls):
        cls.temp.cleanup()

    def test_hard_restrictions_survive_as_explicit_motorcycle_no(self):
        for wid in (102, 107, 108, 109, 110, 111, 115):
            with self.subTest(way=wid):
                self.assertEqual(self.data.ways[wid]["tags"]["motorcycle"], "no")
        for wid, value in ((101, "yes"), (103, "yes"), (112, "designated"), (113, "permissive")):
            self.assertEqual(self.data.ways[wid]["tags"]["motorcycle"], value)

    def test_oneway_and_motorcycle_direction_exceptions_are_preserved(self):
        for wid in (101, 104, 114):
            with self.subTest(way=wid):
                for key, value in self.original_ways[wid].items():
                    self.assertEqual(self.data.ways[wid]["tags"][key], value)
                self.assertEqual(self.data.ways[wid]["nodes"], [5, 6])

    def test_turn_restriction_members_and_exceptions_are_preserved(self):
        for rid, tags in self.original_relations.items():
            with self.subTest(relation=rid):
                self.assertEqual(self.data.relations[rid]["tags"], tags)
                self.assertEqual(self.data.relations[rid]["members"], [("w", 101, "from"), ("n", 6, "via"), ("w", 104, "to")])

    def test_destination_and_customer_access_are_not_widened_to_public_access(self):
        for wid, access in ((105, "destination"), (106, "customers")):
            self.assertEqual(self.data.ways[wid]["tags"]["access"], access)
            self.assertEqual(self.data.ways[wid]["tags"]["motorcycle"], access)

    def test_node_access_overrides_and_conditional_restrictions_are_preserved(self):
        self.assertEqual(self.data.nodes[1]["motorcycle"], "yes")
        self.assertEqual(self.data.nodes[2]["motor_vehicle"], "yes")
        self.assertNotEqual(self.data.nodes[2].get("motorcycle"), "no")
        self.assertEqual(self.data.nodes[3]["motorcycle"], "no")
        self.assertEqual(self.data.nodes[4]["motorcycle"], "no")

    def test_published_policy_metadata_matches_prepared_graph_input(self):
        allowed = json.loads((self.work / "allowed-ways.json").read_text())
        blocked = json.loads((self.work / "blocked-ways.json").read_text())
        self.assertEqual(allowed, [101, 103, 104, 105, 106, 112, 113, 114])
        self.assertEqual(blocked, [102, 107, 108, 109, 110, 111, 115])
        self.assertFalse(set(allowed).intersection(blocked))
        metadata = json.loads((self.work / "input.json").read_text())
        self.assertEqual(metadata["source"], "https://example.test/south-korea.osm")
        self.assertEqual(metadata["snapshot"], "2026-09-30T10:00:00Z")
        self.assertEqual(metadata["snapshotBasis"], "latest-object-timestamp")
        self.assertEqual(metadata["sha256"], hashlib.sha256(self.source.read_bytes()).hexdigest())
        self.assertEqual(metadata["policyVersion"], builder.POLICY_VERSION)
        self.assertEqual(metadata["allowedWayCount"], len(allowed))
        self.assertEqual(metadata["blockedWayCount"], len(blocked))


if __name__ == "__main__":
    unittest.main()
