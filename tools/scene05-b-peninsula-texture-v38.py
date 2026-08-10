#!/usr/bin/env python3
from __future__ import annotations

import io
import json
import re
from pathlib import Path

import cairosvg
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter, ImageOps
from pyproj import CRS, Transformer

ROOT = Path.cwd()
SVG = ROOT / 'assets/vector/korean_peninsula_precise.svg'
TERRAIN = ROOT / 'assets/scene05/south_korea_hero_v0.2'
WC = ROOT / 'assets/scene05/worldcover_v1/worldcover_peninsula_v1.png'
WC_META = ROOT / 'assets/scene05/worldcover_v1/worldcover_local_v1.json'
OUT = ROOT / 'output/scene05_final_v1'
W = 1792
COLS = 29
ROWS = 55
BASE_Y = -.018
RELIEF_SCALE = .16


def ss(a, b, x):
    t = np.clip((x - a) / max(b - a, 1e-9), 0, 1)
    return t * t * (3 - 2 * t)


def svgsize(txt):
    m = re.search(r'viewBox="\s*0\s+0\s+([0-9.]+)\s+([0-9.]+)"', txt)
    if not m:
        raise SystemExit('canonical SVG viewBox not found')
    return float(m.group(1)), float(m.group(2))


def affine(m, x, y):
    return m[0, 0] * x + m[0, 1] * y + m[0, 2], m[1, 0] * x + m[1, 1] * y + m[1, 2]


def bilinear(a, x, y):
    h, w = a.shape
    x = float(np.clip(x, 0, w - 1)); y = float(np.clip(y, 0, h - 1))
    x0 = int(x); y0 = int(y); x1 = min(x0 + 1, w - 1); y1 = min(y0 + 1, h - 1)
    tx = x - x0; ty = y - y0
    return float(a[y0, x0] * (1 - tx) * (1 - ty) + a[y0, x1] * tx * (1 - ty) + a[y1, x0] * (1 - tx) * ty + a[y1, x1] * tx * ty)


def canonical_alpha(txt, sw, sh):
    """Supersample the approved SVG, then downsample to preserve one antialiased coast."""
    hi_w = W * 2
    hi_h = round(hi_w * sh / sw)
    raw = cairosvg.svg2png(bytestring=txt.encode(), output_width=hi_w, output_height=hi_h)
    hi = Image.open(io.BytesIO(raw)).convert('RGBA')
    lo_h = round(W * sh / sw)
    lo = hi.resize((W, lo_h), Image.Resampling.LANCZOS)
    return np.asarray(lo.getchannel('A'), dtype=np.uint8), lo_h


def palette(wc):
    # Naturalized aerial palette. Class membership still comes exclusively from WorldCover.
    out = np.empty(wc.shape + (3,), dtype=np.float32)
    out[:] = [92, 104, 70]
    colors = {
        10: (48, 77, 45),    # tree cover
        20: (86, 102, 63),   # shrubland
        30: (103, 119, 73),  # grassland
        40: (139, 131, 82),  # cropland
        50: (126, 119, 109), # built-up
        60: (143, 132, 105), # sparse vegetation
        70: (180, 186, 178), # snow/ice
        80: (72, 94, 94),    # water; replaced inside canonical land
        90: (75, 101, 72),   # herbaceous wetland
        95: (54, 85, 58),    # mangrove
        100: (91, 108, 71),  # moss/lichen
    }
    for k, c in colors.items():
        out[wc == k] = c
    return out


def normalized_blur_rgb(rgb, valid, radius):
    weight_img = Image.fromarray((valid.astype(np.uint8) * 255), 'L').filter(ImageFilter.GaussianBlur(radius))
    weight = np.asarray(weight_img, np.float32) / 255.0
    out = np.zeros_like(rgb, dtype=np.float32)
    for ch in range(3):
        src = np.where(valid, rgb[..., ch], 0.0)
        num_img = Image.fromarray(np.clip(src, 0, 255).astype(np.uint8), 'L').filter(ImageFilter.GaussianBlur(radius))
        out[..., ch] = np.asarray(num_img, np.float32) / np.maximum(weight, .006)
    return out, weight


def fill_raster_disagreement(rgb, wc, land):
    """Remove class-0 and class-80 ribbons inside the canonical silhouette."""
    invalid = land & ((wc == 0) | (wc == 80))
    valid = land & (wc > 0) & (wc != 80)
    if not invalid.any():
        return rgb, 0, 0

    out = rgb.copy()
    extrap, weight = normalized_blur_rgb(out, valid, 16)
    fill = invalid & (weight > .014)
    out[fill] = np.clip(extrap[fill], 0, 255)

    residue = invalid & ~fill
    if residue.any():
        extrap2, weight2 = normalized_blur_rgb(out, valid | fill, 42)
        fill2 = residue & (weight2 > .008)
        out[fill2] = np.clip(extrap2[fill2], 0, 255)
        fill |= fill2
    return out, int(invalid.sum()), int(fill.sum())


def smooth_mask(mask, radius):
    im = Image.fromarray((mask.astype(np.uint8) * 255), 'L').filter(ImageFilter.GaussianBlur(radius))
    return np.asarray(im, np.float32) / 255.0


def material_microtexture(h, w):
    """Low-amplitude paper-free aerial grain; never interpreted as topography."""
    rng = np.random.default_rng(3805)
    a = Image.fromarray(rng.integers(0, 256, (max(12, h // 48), max(12, w // 48)), dtype=np.uint8), 'L')
    b = Image.fromarray(rng.integers(0, 256, (max(18, h // 18), max(18, w // 18)), dtype=np.uint8), 'L')
    a = a.resize((w, h), Image.Resampling.BICUBIC).filter(ImageFilter.GaussianBlur(4.0))
    b = b.resize((w, h), Image.Resampling.BICUBIC).filter(ImageFilter.GaussianBlur(1.6))
    n1 = np.asarray(a, np.float32) / 255.0 - .5
    n2 = np.asarray(b, np.float32) / 255.0 - .5
    return np.clip(1.0 + n1 * .045 + n2 * .022, .965, 1.035)


def dem_fields(height, meta):
    h, w = height.shape
    minx, miny, maxx, maxy = meta['local_bounds_m']
    dx = (maxx - minx) / max(w - 1, 1)
    dy = (maxy - miny) / max(h - 1, 1)
    gy, gx = np.gradient(height, dy, dx)
    ve = float(meta['vertical_exaggeration'])
    nx = -gx * ve; ny = np.ones_like(nx); nz = -gy * ve
    n = np.maximum(np.sqrt(nx * nx + ny * ny + nz * nz), 1e-9)
    nx /= n; ny /= n; nz /= n
    key = np.array([-.62, .70, -.35], np.float32); key /= np.linalg.norm(key)
    fill = np.array([.34, .84, .42], np.float32); fill /= np.linalg.norm(fill)
    d1 = np.clip(nx * key[0] + ny * key[1] + nz * key[2], 0, 1)
    d2 = np.clip(nx * fill[0] + ny * fill[1] + nz * fill[2], 0, 1)
    hill = np.clip(.72 + .42 * np.power(d1, .82) + .08 * np.power(d2, .95), .76, 1.13)
    slope = np.sqrt(gx * gx + gy * gy)
    return hill, slope


def edge_bleed_rgb(rgb, alpha):
    """Populate transparent texels near the coast with adjacent land RGB.

    Alpha remains the canonical SVG. The RGB bleed exists only to prevent black/grey
    texture colors from entering bilinear and mipmap samples at the coastline.
    """
    valid = alpha >= 96
    out = rgb.copy()
    near, weight = normalized_blur_rgb(out, valid, 9)
    edge = (alpha < 8) & (weight > .012)
    out[edge] = np.clip(near[edge], 0, 255)

    farther = (alpha < 8) & ~edge
    coarse, weight2 = normalized_blur_rgb(out, valid | edge, 22)
    edge2 = farther & (weight2 > .020)
    out[edge2] = np.clip(coarse[edge2], 0, 255)
    edge |= edge2
    black_near = edge & np.all(out < 3, axis=2)
    return out, int(edge.sum()), int(black_near.sum())


def save_diagnostics(rgb, alpha):
    qa = OUT / 'v38_surface_qa'
    qa.mkdir(parents=True, exist_ok=True)
    rgba = np.dstack([np.clip(rgb, 0, 255).astype(np.uint8), alpha])
    surface = Image.fromarray(rgba, 'RGBA')
    surface.save(qa / 'surface_texture_only.png', optimize=True)

    ocean = np.zeros((*alpha.shape, 3), dtype=np.float32)
    ocean[:] = [49, 78, 90]
    af = alpha.astype(np.float32) / 255.0
    comp = rgb * af[..., None] + ocean * (1 - af[..., None])
    composite = Image.fromarray(np.clip(comp, 0, 255).astype(np.uint8), 'RGB')
    composite.save(qa / 'land_plus_ocean.png', quality=92)
    Image.fromarray(alpha, 'L').save(qa / 'canonical_mask.png', optimize=True)

    aim = Image.fromarray(alpha, 'L')
    outer = aim.filter(ImageFilter.MaxFilter(5))
    inner = aim.filter(ImageFilter.MinFilter(5))
    outline = np.asarray(outer, np.int16) - np.asarray(inner, np.int16)
    Image.fromarray(np.clip(outline, 0, 255).astype(np.uint8), 'L').save(qa / 'canonical_mask_outline.png', optimize=True)

    ys, xs = np.where(alpha >= 128)
    x0, x1 = int(xs.min()), int(xs.max()); y0, y1 = int(ys.min()), int(ys.max())
    bw = x1 - x0 + 1; bh = y1 - y0 + 1
    pad = max(20, int(min(bw, bh) * .025))
    box_all = (max(0, x0-pad), max(0, y0-pad), min(W, x1+pad), min(alpha.shape[0], y1+pad))
    composite.crop(box_all).save(qa / 'orthographic_peninsula.png', quality=94)

    south_y = y0 + int(bh * .43)
    composite.crop((max(0, x0-pad), max(0, south_y-pad), min(W, x1+pad), min(alpha.shape[0], y1+pad))).save(qa / 'orthographic_south.png', quality=94)
    mid0 = y0 + int(bh * .48); mid1 = min(alpha.shape[0], y1 + pad)
    west_x1 = x0 + int(bw * .46)
    east_x0 = x0 + int(bw * .54)
    composite.crop((max(0, x0-pad), max(0, mid0-pad), min(W, west_x1+pad), mid1)).save(qa / 'coast_west.png', quality=94)
    composite.crop((max(0, east_x0-pad), max(0, mid0-pad), min(W, x1+pad), mid1)).save(qa / 'coast_east.png', quality=94)

    # Contact sheet without text dependency; order: whole / south / west / east.
    thumbs = []
    for name in ['orthographic_peninsula.png', 'orthographic_south.png', 'coast_west.png', 'coast_east.png']:
        im = Image.open(qa / name).convert('RGB')
        im.thumbnail((720, 480), Image.Resampling.LANCZOS)
        canvas = Image.new('RGB', (720, 480), (24, 31, 34))
        canvas.paste(im, ((720-im.width)//2, (480-im.height)//2))
        thumbs.append(canvas)
    sheet = Image.new('RGB', (1440, 960), (20, 27, 30))
    sheet.paste(thumbs[0], (0, 0)); sheet.paste(thumbs[1], (720, 0)); sheet.paste(thumbs[2], (0, 480)); sheet.paste(thumbs[3], (720, 480))
    sheet.save(qa / 'surface_contact_sheet.jpg', quality=92)


def main():
    if not WC.exists():
        raise SystemExit('ESA WorldCover peninsula source missing')
    OUT.mkdir(parents=True, exist_ok=True)

    txt = SVG.read_text('utf-8')
    sw, sh = svgsize(txt)
    alpha, H = canonical_alpha(txt, sw, sh)
    land = alpha > 1
    land_core = alpha >= 128

    wc_img = Image.open(WC).convert('L')
    if wc_img.size != (W, H):
        wc_img = wc_img.resize((W, H), Image.Resampling.NEAREST)
    wc = np.asarray(wc_img, dtype=np.uint8)

    classrgb = palette(wc)
    classrgb, mismatch_pixels, mismatch_filled = fill_raster_disagreement(classrgb, wc, land)
    lowfreq, low_weight = normalized_blur_rgb(classrgb, land, 3.2)
    lowfreq = np.where((low_weight > .01)[..., None], lowfreq, classrgb)
    rgb = classrgb * .42 + lowfreq * .58
    rgb *= material_microtexture(H, W)[..., None]

    # WorldCover-driven material nuance uses blurred masks so class boundaries do not
    # read as GIS polygons.
    forest = smooth_mask(wc == 10, 2.6)[..., None]
    crop = smooth_mask(wc == 40, 2.8)[..., None]
    urban = smooth_mask(wc == 50, 2.5)[..., None]
    rgb = rgb * (1 - forest * .075) + np.array([45, 73, 43], np.float32) * forest * .075
    rgb = rgb * (1 - crop * .085) + np.array([151, 139, 88], np.float32) * crop * .085
    rgb = rgb * (1 - urban * .12) + np.array([139, 132, 123], np.float32) * urban * .12

    # Project every canonical peninsula texel into the South Korea DEM space.
    xs = (np.arange(W) + .5) / W * sw
    ys = (np.arange(H) + .5) / H * sh
    gx, gy = np.meshgrid(xs, ys)
    v = gy / sh

    georef = json.loads((TERRAIN / 'svg_georef.json').read_text())
    meta = json.loads((TERRAIN / 'terrain_metadata.json').read_text())
    M = np.asarray(georef['svg_px_to_epsg3857_matrix'])
    tf = Transformer.from_crs('EPSG:3857', CRS.from_proj4(meta['local_crs_proj4']), always_xy=True)
    mx, my = affine(M, gx, gy)
    lx, ly = tf.transform(mx, my)

    alb_img = Image.open(TERRAIN / 'albedo.png').convert('RGB')
    alb = np.asarray(alb_img, np.float32)
    alb_blur = np.asarray(alb_img.filter(ImageFilter.GaussianBlur(9)), np.float32)
    detail = np.mean((alb + 16) / (alb_blur + 16), axis=2)

    h16 = np.asarray(Image.open(TERRAIN / 'height_u16.png'), np.float32)
    maxe = float(meta['mesh']['max_elevation_m'])
    height = h16 / 65535. * maxe
    hill, slope = dem_fields(height, meta)

    rw, rh = meta['raster_size']
    minx, miny, maxx, maxy = meta['local_bounds_m']
    px = (lx - minx) / (maxx - minx) * (rw - 1)
    py = (maxy - ly) / (maxy - miny) * (rh - 1)
    inside = (px >= 0) & (px <= rw - 1) & (py >= 0) & (py <= rh - 1) & land
    xi = np.clip(np.rint(px).astype(int), 0, rw - 1)
    yi = np.clip(np.rint(py).astype(int), 0, rh - 1)

    elev = np.clip(height[yi, xi] / maxe, 0, 1)
    shd = hill[yi, xi]
    slp = slope[yi, xi]
    det = detail[yi, xi]
    mount = ss(.06, .45, elev)[..., None]
    high = ss(.42, .82, elev)[..., None]
    rock = ss(.045, .20, slp)[..., None] * mount
    mountain = np.array([61, 84, 53], np.float32)
    highland = np.array([118, 116, 99], np.float32)
    physical = rgb * (1 - mount * .16) + mountain * mount * .16
    physical = physical * (1 - high * .16) + highland * high * .16
    physical = physical * (1 - rock * .07) + np.array([113, 111, 98], np.float32) * rock * .07
    physical *= np.clip(.80 + shd[..., None] * .24, .88, 1.08)
    physical *= np.clip(1.0 + (det[..., None] - 1.0) * .34, .94, 1.06)

    # Fade DEM contribution at all raster edges. No rectangular footprint survives.
    xn = px / max(rw - 1, 1); yn = py / max(rh - 1, 1)
    edge_dist = np.minimum.reduce([xn, 1 - xn, yn, 1 - yn])
    edge_feather = ss(.018, .105, edge_dist) * inside.astype(np.float32)
    north_to_south = ss(.31, .56, v)
    dem_weight = edge_feather * north_to_south
    rgb = rgb * (1 - dem_weight[..., None]) + physical * dem_weight[..., None]

    # One continuous grade across the peninsula. North remains lower-detail, not a
    # separate texture family, while South receives only data-supported DEM structure.
    rgb = rgb * np.array([1.015, 1.005, .975], np.float32)
    rgb = np.clip(rgb, 0, 255)
    rgb_img = Image.fromarray(rgb.astype(np.uint8), 'RGB')
    rgb_img = ImageEnhance.Color(rgb_img).enhance(1.08)
    rgb_img = ImageEnhance.Contrast(rgb_img).enhance(1.06)
    rgb_img = ImageEnhance.Brightness(rgb_img).enhance(1.035)
    rgb = np.asarray(rgb_img, np.float32)

    # Critical coastline fix: preserve canonical AA alpha and bleed land RGB under
    # transparent texels. This removes texture-filter fringe without moving the coast.
    rgb, edge_bleed_pixels, black_near_edge_pixels = edge_bleed_rgb(rgb, alpha)
    rgba = np.zeros((H, W, 4), dtype=np.uint8)
    rgba[..., :3] = np.clip(rgb, 0, 255).astype(np.uint8)
    rgba[..., 3] = alpha
    Image.fromarray(rgba, 'RGBA').save(OUT / 'peninsula_surface_v38.png', optimize=True)
    save_diagnostics(rgb, alpha)

    scene = float(meta['scene_m_per_unit'])
    ve = float(meta['vertical_exaggeration'])
    grid = []
    raised = 0
    max_surface_y = BASE_Y
    for r in range(ROWS):
        sy = sh * r / (ROWS - 1)
        for c in range(COLS):
            sx = sw * c / (COLS - 1)
            emx = M[0, 0] * sx + M[0, 1] * sy + M[0, 2]
            emy = M[1, 0] * sx + M[1, 1] * sy + M[1, 2]
            qx, qy = tf.transform(emx, emy)
            yy = BASE_Y
            if minx <= qx <= maxx and miny <= qy <= maxy:
                pxg = (qx - minx) / (maxx - minx) * (rw - 1)
                pyg = (maxy - qy) / (maxy - miny) * (rh - 1)
                e = max(0.0, bilinear(h16, pxg, pyg) / 65535.0 * maxe)
                yy = BASE_Y + (e * ve / scene) * RELIEF_SCALE
                if e > 2:
                    raised += 1
                    max_surface_y = max(max_surface_y, yy)
            grid.append([float(qx / scene), float(yy), float(-qy / scene)])

    wcmd = json.loads(WC_META.read_text())
    md = {
        'schema_version': '3.8',
        'texture': 'peninsula_surface_v38.png',
        'texture_size': [W, H],
        'source_svg': str(SVG.relative_to(ROOT)),
        'worldcover_source': str(WC.relative_to(ROOT)),
        'worldcover_attribution': wcmd['attribution'],
        'worldcover_license': wcmd['license'],
        'svg_viewbox': [0, 0, sw, sh],
        'grid': {'cols': COLS, 'rows': ROWS, 'positions': grid},
        'scene_m_per_unit': scene,
        'surface_relief': {
            'base_y': BASE_Y,
            'dem_relief_scale': RELIEF_SCALE,
            'authority': 'Copernicus GLO-30 only where the existing Scene05 DEM is available',
            'raised_grid_vertices': raised,
            'max_surface_y': max_surface_y,
        },
        'policy': [
            'Canonical precise SVG antialiased alpha is the sole coastline authority.',
            'Transparent texels near the coast carry extrapolated land RGB only to protect bilinear/mipmap sampling; alpha is unchanged.',
            'ESA WorldCover 2021 controls full-peninsula material distribution; class boundaries are low-frequency blended for aerial readability.',
            'WorldCover class-0/class-80 disagreement inside canonical land is extrapolated from neighboring land materials.',
            'Copernicus GLO-30 and source albedo control South Korea relief/detail with four-edge feathering.',
            'North Korea uses real WorldCover material distribution plus restrained non-directional microtexture; no synthetic mountain relief is invented.',
            'No texture-side coastline outline or near-shore band is painted.'
        ]
    }
    (OUT / 'peninsula_surface_v38.json').write_text(json.dumps(md, ensure_ascii=False, indent=2))

    qa = {
        'land_soft_pixels': int(land.sum()),
        'land_core_pixels': int(land_core.sum()),
        'antialiased_alpha_pixels': int(((alpha > 0) & (alpha < 255)).sum()),
        'worldcover_water_inside_canonical_land_pixels': int((land & (wc == 80)).sum()),
        'canonical_land_raster_mismatch_pixels': mismatch_pixels,
        'canonical_land_raster_mismatch_filled_pixels': mismatch_filled,
        'dem_inside_pixels': int(inside.sum()),
        'dem_full_weight_pixels': int((dem_weight > .98).sum()),
        'dem_feather_pixels': int(((dem_weight > .02) & (dem_weight < .98)).sum()),
        'edge_rgb_bleed_pixels': edge_bleed_pixels,
        'transparent_black_near_edge_pixels': black_near_edge_pixels,
        'coast_outline_painted': False,
        'coastline_authority': 'canonical SVG antialiased alpha only',
        'north_fake_relief': False,
        'diagnostics': [
            'v38_surface_qa/surface_texture_only.png',
            'v38_surface_qa/land_plus_ocean.png',
            'v38_surface_qa/canonical_mask.png',
            'v38_surface_qa/canonical_mask_outline.png',
            'v38_surface_qa/orthographic_peninsula.png',
            'v38_surface_qa/orthographic_south.png',
            'v38_surface_qa/coast_west.png',
            'v38_surface_qa/coast_east.png',
            'v38_surface_qa/surface_contact_sheet.jpg',
        ]
    }
    (OUT / 'peninsula_surface_v38_qa.json').write_text(json.dumps(qa, ensure_ascii=False, indent=2))
    if black_near_edge_pixels:
        raise SystemExit(f'v3.8 coastline RGB bleed incomplete: {black_near_edge_pixels} black near-edge pixels')
    if qa['antialiased_alpha_pixels'] < 1000:
        raise SystemExit('v3.8 canonical alpha lost antialiasing')
    print(json.dumps(qa, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
