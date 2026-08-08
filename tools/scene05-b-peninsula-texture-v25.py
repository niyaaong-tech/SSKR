#!/usr/bin/env python3
from __future__ import annotations

import io
import json
import math
import re
from pathlib import Path

import cairosvg
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter
from pyproj import CRS, Transformer

ROOT = Path.cwd()
SVG = ROOT / 'assets' / 'vector' / 'korean_peninsula_precise.svg'
TERRAIN = ROOT / 'assets' / 'scene05' / 'south_korea_hero_v0.2'
OUT = ROOT / 'output' / 'scene05_final_v1'

TEX_W = 1024
GRID_COLS = 17
GRID_ROWS = 33


def parse_svg_size(text: str) -> tuple[int, int]:
    m = re.search(r'viewBox="\s*0\s+0\s+([0-9.]+)\s+([0-9.]+)"', text)
    if not m:
        raise SystemExit('canonical SVG viewBox not found')
    return int(round(float(m.group(1)))), int(round(float(m.group(2))))


def apply_affine(matrix: np.ndarray, x: np.ndarray, y: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    xx = matrix[0, 0] * x + matrix[0, 1] * y + matrix[0, 2]
    yy = matrix[1, 0] * x + matrix[1, 1] * y + matrix[1, 2]
    return xx, yy


def resize_nearest(arr: np.ndarray, shape: tuple[int, int]) -> np.ndarray:
    h, w = shape
    im = Image.fromarray(arr)
    return np.asarray(im.resize((w, h), Image.Resampling.NEAREST))


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    svg_text = SVG.read_text('utf-8')
    svg_w, svg_h = parse_svg_size(svg_text)
    tex_h = int(round(TEX_W * svg_h / svg_w))

    # Canonical SVG is the only alpha / land authority. The raster alpha is never
    # intersected with DEM masks, so North Korea and interior land cannot disappear.
    png_bytes = cairosvg.svg2png(bytestring=svg_text.encode('utf-8'), output_width=TEX_W, output_height=tex_h)
    svg_rgba = np.asarray(Image.open(io.BytesIO(png_bytes)).convert('RGBA'))
    land = svg_rgba[..., 3] > 8

    georef = json.loads((TERRAIN / 'svg_georef.json').read_text('utf-8'))
    terrain_meta = json.loads((TERRAIN / 'terrain_metadata.json').read_text('utf-8'))
    mat = np.asarray(georef['svg_px_to_epsg3857_matrix'], dtype=np.float64)
    local_crs = CRS.from_proj4(terrain_meta['local_crs_proj4'])
    tf_3857_local = Transformer.from_crs('EPSG:3857', local_crs, always_xy=True)

    # Pixel centers in canonical SVG coordinates.
    xs = (np.arange(TEX_W, dtype=np.float64) + 0.5) / TEX_W * svg_w
    ys = (np.arange(tex_h, dtype=np.float64) + 0.5) / tex_h * svg_h
    gx, gy = np.meshgrid(xs, ys)
    mx, my = apply_affine(mat, gx, gy)
    lx, ly = tf_3857_local.transform(mx, my)

    # Base art texture: subdued natural land variation. This is not a land-cover map.
    u = gx / max(svg_w, 1)
    v = gy / max(svg_h, 1)
    broad = (
        np.sin(u * math.pi * 6.0 + v * 2.1) * 0.45
        + np.cos(v * math.pi * 8.0 - u * 1.7) * 0.30
        + np.sin((u + v) * math.pi * 11.0) * 0.18
    )
    broad = np.clip((broad + 1.0) * 0.5, 0.0, 1.0)
    north_south = np.clip(v, 0.0, 1.0)
    c0 = np.array([57.0, 82.0, 48.0], dtype=np.float32)
    c1 = np.array([91.0, 108.0, 67.0], dtype=np.float32)
    base = c0[None, None, :] * (1.0 - broad[..., None]) + c1[None, None, :] * broad[..., None]
    base *= (0.94 + 0.08 * north_south[..., None])

    # South / available DEM footprint receives the real source albedo + hillshade signal.
    albedo = np.asarray(Image.open(TERRAIN / 'albedo.png').convert('RGB'), dtype=np.float32)
    hill = np.asarray(Image.open(TERRAIN / 'hillshade.png').convert('L'), dtype=np.float32)
    precise = np.asarray(Image.open(TERRAIN / 'land_mask_precise_svg.png').convert('L')) > 127
    src_h, src_w = hill.shape
    minx, miny, maxx, maxy = terrain_meta['local_bounds_m']
    px = (lx - minx) / (maxx - minx) * (src_w - 1)
    py = (maxy - ly) / (maxy - miny) * (src_h - 1)
    inside = (px >= 0) & (px <= src_w - 1) & (py >= 0) & (py <= src_h - 1)
    xi = np.clip(np.rint(px).astype(np.int32), 0, src_w - 1)
    yi = np.clip(np.rint(py).astype(np.int32), 0, src_h - 1)
    src_land = precise[yi, xi] & inside

    src = albedo[yi, xi]
    hs = hill[yi, xi] / 255.0
    # Keep the source visually dominant where it exists, but normalize it into the
    # cinematic natural-land palette rather than reproducing satellite-map clutter.
    src_lum = np.clip(src.mean(axis=-1, keepdims=True) / 255.0, 0.0, 1.0)
    src_tinted = base * (0.72 + src_lum * 0.62)
    src_tinted *= (0.70 + hs[..., None] * 0.58)
    mix = src_land[..., None].astype(np.float32) * 0.76
    rgb = base * (1.0 - mix) + src_tinted * mix

    # Coastline legibility comes from a tiny alpha-edge darkening, not from cutting holes.
    mask_img = Image.fromarray((land.astype(np.uint8) * 255), 'L')
    inner = np.asarray(mask_img.filter(ImageFilter.GaussianBlur(2.1)), dtype=np.float32) / 255.0
    coast = np.clip(1.0 - inner, 0.0, 1.0) * land.astype(np.float32)
    rgb *= (1.0 - coast[..., None] * 0.14)

    rgba = np.zeros((tex_h, TEX_W, 4), dtype=np.uint8)
    rgba[..., :3] = np.clip(rgb, 0, 255).astype(np.uint8)
    rgba[..., 3] = land.astype(np.uint8) * 255
    tex = Image.fromarray(rgba, 'RGBA')
    tex = ImageEnhance.Color(tex).enhance(1.08)
    tex = ImageEnhance.Contrast(tex).enhance(1.05)
    tex.save(OUT / 'peninsula_surface_v25.png', optimize=True)

    # Build a projected UV grid so the full-peninsula texture follows the same AEQD
    # scene coordinate space as routes and the South Korea DEM overlay.
    scene_m = float(terrain_meta['scene_m_per_unit'])
    grid_positions: list[list[float]] = []
    for row in range(GRID_ROWS):
        sy = svg_h * row / (GRID_ROWS - 1)
        for col in range(GRID_COLS):
            sx = svg_w * col / (GRID_COLS - 1)
            emx = mat[0, 0] * sx + mat[0, 1] * sy + mat[0, 2]
            emy = mat[1, 0] * sx + mat[1, 1] * sy + mat[1, 2]
            qx, qy = tf_3857_local.transform(emx, emy)
            grid_positions.append([float(qx / scene_m), -0.020, float(-qy / scene_m)])

    meta = {
        'schema_version': '2.5',
        'source_svg': str(SVG.relative_to(ROOT)),
        'texture': 'peninsula_surface_v25.png',
        'texture_size': [TEX_W, tex_h],
        'svg_viewbox': [0, 0, svg_w, svg_h],
        'grid': {'cols': GRID_COLS, 'rows': GRID_ROWS, 'positions': grid_positions},
        'scene_m_per_unit': scene_m,
        'policy': [
            'Canonical SVG alpha is the single land-coverage authority.',
            'DEM masks never subtract from the full-peninsula underlay.',
            'South / available DEM footprint uses real source albedo and hillshade as art inputs.',
            'Northern texture outside the DEM footprint is subdued art direction, not a land-cover claim.'
        ]
    }
    (OUT / 'peninsula_surface_v25.json').write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding='utf-8')

    # Hard QA: canonical raster must have no transparent holes enclosed by the largest
    # mainland silhouette at this stage. We avoid brittle island filling; instead report
    # alpha coverage and guarantee no DEM operation modified alpha.
    report = {
        'texture_size': [TEX_W, tex_h],
        'land_pixels': int(land.sum()),
        'alpha_authority': 'canonical_svg_only',
        'south_source_pixels': int((src_land & land).sum()),
        'grid_vertices': GRID_COLS * GRID_ROWS,
    }
    (OUT / 'peninsula_surface_v25_qa.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
    print(json.dumps(report, indent=2))


if __name__ == '__main__':
    main()
