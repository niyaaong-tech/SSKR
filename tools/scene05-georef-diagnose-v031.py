#!/usr/bin/env python3
from __future__ import annotations

import io
import json
import math
import time
import xml.etree.ElementTree as ET
from pathlib import Path

import cairosvg
import cv2
import numpy as np
from PIL import Image, ImageDraw
from pyproj import Transformer
import requests
from scipy.spatial import cKDTree

ROOT = Path.cwd()
CP_PATH = ROOT / 'assets' / 'scene05' / 'control_points_v0.3.json'
SVG_PATH = ROOT / 'assets' / 'vector' / 'korean_peninsula_precise.svg'
SEED_PATH = ROOT / 'assets' / 'scene05' / 'south_korea_hero_v0.2' / 'svg_georef.json'
OUT = ROOT / 'output' / 'scene05_georef_v0.3.1'
RADIUS_M = 15000
OVERPASS_ENDPOINTS = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
]


def render_svg_mask():
    root = ET.parse(SVG_PATH).getroot()
    w = int(float(root.attrib.get('width', '744')))
    h = int(float(root.attrib.get('height', '1373')))
    png = cairosvg.svg2png(url=str(SVG_PATH), output_width=w, output_height=h, background_color='white')
    arr = np.array(Image.open(io.BytesIO(png)).convert('L'))
    return (arr < 128).astype(np.uint8)


def build_overpass_query(points):
    clauses = []
    for p in points:
        clauses.append(f'way["natural"="coastline"](around:{RADIUS_M},{p["lat"]},{p["lon"]});')
    return '[out:json][timeout:180];(' + ''.join(clauses) + ');out geom;'


def fetch_overpass(points):
    query = build_overpass_query(points)
    last = None
    for endpoint in OVERPASS_ENDPOINTS:
        for attempt in range(3):
            try:
                r = requests.post(endpoint, data={'data': query}, timeout=210,
                                  headers={'User-Agent': 'SSKR-scene05-georef-diagnostic/0.3.1'})
                r.raise_for_status()
                data = r.json()
                if data.get('elements'):
                    return data, endpoint
                last = RuntimeError(f'Overpass returned no elements from {endpoint}')
            except Exception as e:
                last = e
                time.sleep(3 * (attempt + 1))
    raise RuntimeError(f'Overpass query failed: {last}')


def collect_segments(data):
    tf = Transformer.from_crs('EPSG:4326', 'EPSG:3857', always_xy=True)
    segs = []
    for el in data.get('elements', []):
        geom = el.get('geometry') or []
        if len(geom) < 2:
            continue
        lon = np.array([q['lon'] for q in geom], dtype=float)
        lat = np.array([q['lat'] for q in geom], dtype=float)
        x, y = tf.transform(lon, lat)
        for i in range(len(geom) - 1):
            a = np.array([x[i], y[i]], dtype=float)
            b = np.array([x[i+1], y[i+1]], dtype=float)
            if np.linalg.norm(b-a) > 0:
                segs.append((a, b, int(el.get('id', 0))))
    if not segs:
        raise RuntimeError('No coastline segments parsed from Overpass data')
    return segs


def nearest_on_segment(p, a, b):
    ab = b - a
    t = float(np.dot(p-a, ab) / max(np.dot(ab, ab), 1e-12))
    t = min(1.0, max(0.0, t))
    q = a + t * ab
    return q, float(np.linalg.norm(q-p))


def resolve_landmarks_to_coast(points, segs):
    fwd = Transformer.from_crs('EPSG:4326', 'EPSG:3857', always_xy=True)
    inv = Transformer.from_crs('EPSG:3857', 'EPSG:4326', always_xy=True)
    out = []
    for p in points:
        x, y = fwd.transform(p['lon'], p['lat'])
        pt = np.array([x, y], dtype=float)
        best = None
        for a, b, way_id in segs:
            # Fast bounding-box pruning by 20 km around the landmark.
            if pt[0] < min(a[0], b[0])-20000 or pt[0] > max(a[0], b[0])+20000 or pt[1] < min(a[1], b[1])-20000 or pt[1] > max(a[1], b[1])+20000:
                continue
            q, d = nearest_on_segment(pt, a, b)
            if best is None or d < best[0]:
                best = (d, q, way_id)
        if best is None:
            raise RuntimeError(f'No coastline segment near {p["id"]}')
        d, q, way_id = best
        lon, lat = inv.transform(q[0], q[1])
        out.append({**p,
                    'resolved_coast_lon': float(lon),
                    'resolved_coast_lat': float(lat),
                    'landmark_to_coast_m': float(d),
                    'osm_coastline_way_id': way_id})
    return out


def seed_to_svg(Gi, lon, lat):
    tf = Transformer.from_crs('EPSG:4326', 'EPSG:3857', always_xy=True)
    mx, my = tf.transform(lon, lat)
    q = Gi @ np.array([mx, my, 1.0], dtype=float)
    return np.array([q[0], q[1]], dtype=float), (float(mx), float(my))


def fit_affine(src, dst):
    src = np.asarray(src, dtype=float)
    dst = np.asarray(dst, dtype=float)
    A = np.column_stack([src[:,0], src[:,1], np.ones(len(src))])
    bx, *_ = np.linalg.lstsq(A, dst[:,0], rcond=None)
    by, *_ = np.linalg.lstsq(A, dst[:,1], rcond=None)
    return np.array([[bx[0], bx[1], bx[2]], [by[0], by[1], by[2]]], dtype=float)


def apply_affine(M, pts):
    pts = np.asarray(pts, dtype=float)
    A = np.column_stack([pts[:,0], pts[:,1], np.ones(len(pts))])
    return A @ M.T


def leave_one_out(src, dst, m_per_px):
    rows = []
    for i in range(len(src)):
        keep = np.arange(len(src)) != i
        M = fit_affine(src[keep], dst[keep])
        pred = apply_affine(M, src[[i]])[0]
        epx = float(np.linalg.norm(pred-dst[i]))
        rows.append({'index': int(i), 'error_px': epx, 'error_km': epx*m_per_px/1000.0})
    return rows


def transform_metrics(M, svg_shape):
    h, w = svg_shape
    L = M[:,:2]
    sv = np.linalg.svd(L, compute_uv=False)
    rot = math.degrees(math.atan2(L[1,0]-L[0,1], L[0,0]+L[1,1]))
    corners = np.array([[0,0],[w,0],[0,h],[w,h],[w/2,h/2]], dtype=float)
    moved = apply_affine(M, corners)
    disp = np.linalg.norm(moved-corners, axis=1)
    return {
        'singular_values': [float(x) for x in sv],
        'rotation_deg_approx': float(rot),
        'translation_px': [float(M[0,2]), float(M[1,2])],
        'sample_displacement_px': [float(x) for x in disp],
        'max_sample_displacement_px': float(disp.max()),
    }


def make_overlay(mask, rows, src, dst, refined):
    base = np.zeros((*mask.shape, 3), dtype=np.uint8)
    base[mask > 0] = [22, 35, 31]
    edge = cv2.Canny((mask*255).astype(np.uint8), 50, 150) > 0
    base[edge] = [105, 126, 112]
    im = Image.fromarray(base)
    dr = ImageDraw.Draw(im)
    for r, s, d, q in zip(rows, src, dst, refined):
        dr.line([tuple(s), tuple(d)], fill=(220,100,80), width=2)
        dr.line([tuple(s), tuple(q)], fill=(80,180,230), width=2)
        for xy, fill, rad in [(s,(255,255,255),4),(d,(255,209,102),6),(q,(90,205,255),4)]:
            dr.ellipse([xy[0]-rad,xy[1]-rad,xy[0]+rad,xy[1]+rad], fill=fill)
        dr.text((d[0]+8,d[1]-6), r['id'], fill=(255,255,255))
    im.save(OUT/'georef_v031_controlpoint_overlay.png')


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    points = json.loads(CP_PATH.read_text('utf-8'))['points']
    seed = json.loads(SEED_PATH.read_text('utf-8'))
    G = np.asarray(seed['svg_px_to_epsg3857_matrix'], dtype=float)
    Gi = np.asarray(seed['epsg3857_to_svg_px_matrix'], dtype=float)
    m_per_px = math.sqrt(abs(np.linalg.det(G[:2,:2])))
    mask = render_svg_mask()
    edge = cv2.Canny((mask*255).astype(np.uint8), 50, 150) > 0
    yy, xx = np.where(edge)
    tree = cKDTree(np.column_stack([xx, yy]))

    overpass, endpoint = fetch_overpass(points)
    segs = collect_segments(overpass)
    rows = resolve_landmarks_to_coast(points, segs)

    src = []
    dst = []
    for r in rows:
        s, merc = seed_to_svg(Gi, r['resolved_coast_lon'], r['resolved_coast_lat'])
        dist, idx = tree.query(s, k=1)
        d = np.array([xx[idx], yy[idx]], dtype=float)
        r['resolved_coast_mercator'] = [merc[0], merc[1]]
        r['seed_svg_px'] = [float(s[0]), float(s[1])]
        r['canonical_boundary_svg_px'] = [float(d[0]), float(d[1])]
        r['seed_boundary_error_px'] = float(dist)
        r['seed_boundary_error_km'] = float(dist*m_per_px/1000.0)
        src.append(s); dst.append(d)
    src = np.asarray(src); dst = np.asarray(dst)

    # Robust inlier selection first; final transform is ordinary affine on accepted inliers.
    robust, inlier_mask = cv2.estimateAffine2D(src.astype(np.float32), dst.astype(np.float32), method=cv2.RANSAC, ransacReprojThreshold=2.5, maxIters=5000, confidence=0.995, refineIters=25)
    if robust is None:
        robust = fit_affine(src, dst)
        inlier_mask = np.ones((len(src),1), dtype=np.uint8)
    inliers = inlier_mask.ravel().astype(bool)
    if inliers.sum() < 6:
        inliers[:] = True
    M = fit_affine(src[inliers], dst[inliers])
    refined = apply_affine(M, src)
    refined_err_px = np.linalg.norm(refined-dst, axis=1)
    loo = leave_one_out(src[inliers], dst[inliers], m_per_px)

    for i, r in enumerate(rows):
        r['ransac_inlier'] = bool(inliers[i])
        r['refined_svg_px'] = [float(refined[i,0]), float(refined[i,1])]
        r['refined_boundary_error_px'] = float(refined_err_px[i])
        r['refined_boundary_error_km'] = float(refined_err_px[i]*m_per_px/1000.0)

    seed_err = np.array([r['seed_boundary_error_km'] for r in rows])
    ref_err = np.array([r['refined_boundary_error_km'] for r in rows])
    inlier_ref = ref_err[inliers]
    loo_km = np.array([x['error_km'] for x in loo])
    tm = transform_metrics(M, mask.shape)

    # Conservative acceptance gate: cross-validation must beat the raw seed substantially,
    # and the correction itself must remain visually/global-affine-small.
    seed_inlier = seed_err[inliers]
    accepted = bool(
        inliers.sum() >= 8 and
        loo_km.mean() < seed_inlier.mean()*0.85 and
        loo_km.max() < max(6.0, seed_inlier.max()*1.10) and
        tm['max_sample_displacement_px'] < 8.0 and
        max(abs(x-1.0) for x in tm['singular_values']) < 0.015 and
        abs(tm['rotation_deg_approx']) < 0.75
    )

    report = {
        'schema_version': '0.3.1',
        'status': 'ACCEPT_AFFINE_REFINEMENT' if accepted else 'KEEP_V02_SEED',
        'policy': 'Diagnostic only. Final coastline remains canonical SVG. OSM coastline is used only to resolve real geographic control coordinates.',
        'overpass_endpoint': endpoint,
        'coastline_segment_count': len(segs),
        'control_point_count': len(rows),
        'inlier_count': int(inliers.sum()),
        'approx_m_per_svg_px': float(m_per_px),
        'seed_error_km': {'mean': float(seed_err.mean()), 'max': float(seed_err.max()), 'median': float(np.median(seed_err))},
        'seed_inlier_error_km': {'mean': float(seed_inlier.mean()), 'max': float(seed_inlier.max())},
        'refined_inlier_fit_error_km': {'mean': float(inlier_ref.mean()), 'max': float(inlier_ref.max())},
        'leave_one_out_inlier_error_km': {'mean': float(loo_km.mean()), 'max': float(loo_km.max()), 'median': float(np.median(loo_km))},
        'affine_matrix_seed_svg_to_refined_svg': M.tolist(),
        'affine_transform_metrics': tm,
        'points': rows,
        'leave_one_out': loo,
    }
    (OUT/'georef_diagnostic_v031.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    resolved = {'schema_version':'0.3.1','purpose':'OSM coastline-resolved geographic reference points for Scene 05 georeferencing QA','points':[{k:v for k,v in r.items() if k not in {'seed_svg_px','canonical_boundary_svg_px','refined_svg_px','resolved_coast_mercator'}} for r in rows]}
    (OUT/'control_points_coast_resolved_v031.json').write_text(json.dumps(resolved, ensure_ascii=False, indent=2), encoding='utf-8')
    make_overlay(mask, rows, src, dst, refined)
    print(json.dumps({k:v for k,v in report.items() if k not in {'points','leave_one_out'}}, ensure_ascii=False, indent=2))

if __name__ == '__main__':
    main()
