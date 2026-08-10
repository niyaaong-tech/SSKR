#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageEnhance, ImageFilter

ROOT = Path.cwd()
OUT = ROOT / 'output/scene05_final_v1'
WC = ROOT / 'assets/scene05/worldcover_v1/worldcover_peninsula_v1.png'
SRC = OUT / 'peninsula_surface_v36.png'
SRC_QA = OUT / 'peninsula_surface_v36_qa.json'

DST = OUT / 'peninsula_surface_v38.png'
MASK_DEBUG = OUT / 'peninsula_mask_debug_v38.png'
QA = OUT / 'peninsula_surface_v38_qa.json'


PALETTE = {
    10: (45, 73, 45),
    20: (76, 91, 57),
    30: (92, 108, 67),
    40: (128, 124, 78),
    50: (116, 110, 102),
    60: (132, 120, 96),
    70: (166, 171, 164),
    90: (76, 101, 78),
    95: (52, 82, 61),
    100: (91, 105, 72),
}


def smoothstep(a: float, b: float, x: np.ndarray) -> np.ndarray:
    t = np.clip((x - a) / max(b - a, 1e-9), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def pil_blur_gray(a: np.ndarray, radius: float) -> np.ndarray:
    img = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), 'L')
    return np.asarray(img.filter(ImageFilter.GaussianBlur(radius)), dtype=np.float32)


def blurred_noise(h: int, w: int, seed: int, small_w: int, blur: float) -> np.ndarray:
    rng = np.random.default_rng(seed)
    small_h = max(8, round(small_w * h / w))
    src = rng.integers(0, 256, (small_h, small_w), dtype=np.uint8)
    img = Image.fromarray(src, 'L').resize((w, h), Image.Resampling.BICUBIC)
    if blur:
        img = img.filter(ImageFilter.GaussianBlur(blur))
    a = np.asarray(img, dtype=np.float32) / 255.0
    return (a - a.mean()) / max(a.std(), 1e-6)


def edge_rgb_extrapolate(rgb: np.ndarray, land: np.ndarray, radius: int = 14):
    """Continue land RGB outside alpha so filtering cannot sample a dark/foreign edge."""
    weight = pil_blur_gray(land.astype(np.float32) * 255.0, radius) / 255.0
    extrap = np.empty_like(rgb, dtype=np.float32)
    for ch in range(3):
        src = np.where(land, rgb[..., ch], 0.0)
        num = pil_blur_gray(src, radius)
        extrap[..., ch] = num / np.maximum(weight, .006)

    outer = (~land) & (weight > .012)
    out = rgb.copy()
    out[outer] = np.clip(extrap[outer], 0, 255)
    return out, outer


def main():
    if not SRC.exists():
        raise SystemExit(f'missing prerequisite: {SRC}')
    if not WC.exists():
        raise SystemExit(f'missing WorldCover source: {WC}')

    base_img = Image.open(SRC).convert('RGBA')
    rgba = np.asarray(base_img, dtype=np.uint8).copy()
    base = rgba[..., :3].astype(np.float32)
    alpha = rgba[..., 3]
    land = alpha >= 128
    h, w = land.shape

    wc_img = Image.open(WC).convert('L')
    if wc_img.size != (w, h):
        wc_img = wc_img.resize((w, h), Image.Resampling.NEAREST)
    wc = np.asarray(wc_img, dtype=np.uint8)

    # Preserve v3.6 real-data detail in South Korea, but soften categorical
    # WorldCover blocks into broad material families across the full peninsula.
    target = base.copy()
    valid_class = np.zeros_like(land)
    for code, color in PALETTE.items():
        m = land & (wc == code)
        target[m] = color
        valid_class |= m

    # Never reintroduce class-0 / class-80 disagreement at the canonical coast.
    target[land & ~valid_class] = base[land & ~valid_class]
    target_img = Image.fromarray(np.clip(target, 0, 255).astype(np.uint8), 'RGB')
    target_soft = np.asarray(target_img.filter(ImageFilter.GaussianBlur(3.2)), dtype=np.float32)

    # v3.6 contains real DEM/albedo detail in South Korea but also a legacy random
    # contextual-shade continuity cue in the North. Do not let that cue define v3.8
    # geography: North is overwhelmingly WorldCover material, while the contribution
    # of the v3.6 physical surface rises smoothly only into the South DEM region.
    y01 = np.linspace(0.0, 1.0, h, dtype=np.float32)[:, None]
    south_detail = smoothstep(.34, .60, y01)[..., None]
    base_weight = .06 + south_detail * .72
    rgb = base * base_weight + target_soft * (1.0 - base_weight)

    # Recover medium-scale information already present in the v3.6 physical surface,
    # but gate it to the real South Korea DEM/albedo coverage. No directional pseudo
    # relief is carried into North Korea.
    lum = base[..., 0] * .2126 + base[..., 1] * .7152 + base[..., 2] * .0722
    lum_low = pil_blur_gray(lum, 13.0)
    rel = np.clip((lum + 18.0) / (lum_low + 18.0), .86, 1.14)
    detail_gain = 0.94 + rel * .06
    rgb *= 1.0 + (detail_gain[..., None] - 1.0) * south_detail

    # Deterministic low-amplitude material breakup only; this never defines geography.
    n_low = blurred_noise(h, w, 3801, 76, 4.0)
    n_mid = blurred_noise(h, w, 3817, 190, 1.7)
    breakup = np.clip(1.0 + n_low * .018 + n_mid * .010, .955, 1.045)
    rgb *= breakup[..., None]

    forest = land & (wc == 10)
    crop = land & (wc == 40)
    built = land & (wc == 50)
    grass = land & ((wc == 20) | (wc == 30) | (wc == 100))
    rgb[forest] *= np.array([.965, .995, .955], np.float32)
    rgb[crop] = rgb[crop] * .965 + np.array([132, 126, 82], np.float32) * .035
    rgb[built] = rgb[built] * .94 + np.array([137, 132, 124], np.float32) * .06
    rgb[grass] *= np.array([.985, 1.005, .975], np.float32)

    # One broad grade across North/South so the two source-detail levels share a world.
    north_unify = (1.0 - smoothstep(.34, .60, y01))[..., None]
    neutral = np.array([91, 104, 72], np.float32)
    rgb = rgb * (1.0 - north_unify * .045) + neutral * (north_unify * .045)
    rgb[~land] = base[~land]

    # Keep canonical binary alpha untouched, but continue adjacent land RGB into
    # transparent texels. This prevents a second dark/grey shoreline under filtering.
    rgb, outer_extrap = edge_rgb_extrapolate(rgb, land, radius=14)

    out_rgba = rgba.copy()
    out_rgba[..., :3] = np.clip(rgb, 0, 255).astype(np.uint8)
    out_rgba[..., 3] = np.where(land, 255, 0).astype(np.uint8)

    result = Image.fromarray(out_rgba, 'RGBA')
    result = ImageEnhance.Color(result).enhance(1.045)
    result = ImageEnhance.Contrast(result).enhance(1.035)
    result = ImageEnhance.Brightness(result).enhance(1.018)
    result.save(DST, optimize=True)

    # Debug texture uses exactly the same binary alpha authority as production.
    land_img = Image.fromarray((land.astype(np.uint8) * 255), 'L')
    eroded = np.asarray(land_img.filter(ImageFilter.MinFilter(3)), dtype=np.uint8) > 127
    coast = land & ~eroded
    debug = np.zeros((h, w, 4), dtype=np.uint8)
    debug[..., :3] = np.array([20, 26, 30], np.uint8)
    debug[..., 3] = 255
    debug[land, :3] = np.array([194, 199, 194], np.uint8)
    debug[coast, :3] = np.array([255, 82, 58], np.uint8)
    Image.fromarray(debug, 'RGBA').save(MASK_DEBUG, optimize=True)

    previous = json.loads(SRC_QA.read_text('utf-8')) if SRC_QA.exists() else {}
    unique_alpha = sorted(int(x) for x in np.unique(out_rgba[..., 3]))
    report = {
        'schema_version': '3.8',
        'source_surface': SRC.name,
        'production_surface': DST.name,
        'mask_debug': MASK_DEBUG.name,
        'land_pixels': int(land.sum()),
        'transparent_pixels': int((~land).sum()),
        'canonical_coast_pixels': int(coast.sum()),
        'edge_rgb_extrapolated_transparent_pixels': int(outer_extrap.sum()),
        'alpha_unique_values': unique_alpha,
        'alpha_is_binary': unique_alpha == [0, 255],
        'north_v36_base_weight': 0.06,
        'north_v36_directional_detail_weight': 0.0,
        'south_v36_base_weight_max': 0.78,
        'worldcover_class_counts_on_land': {
            str(code): int((land & (wc == code)).sum())
            for code in sorted(set(PALETTE) | {0, 80})
        },
        'runtime_sampling_policy_required': {
            'generateMipmaps': False,
            'minFilter': 'LinearFilter',
            'magFilter': 'LinearFilter',
            'alphaTest': 0.42
        },
        'policy': [
            'Canonical SVG-derived binary alpha remains the only coastline authority.',
            'Class-0 and WorldCover-water disagreements are not used to define the coastline.',
            'WorldCover categories are softened into low-frequency material families rather than displayed as raw categorical blocks.',
            'v3.6 real DEM/albedo relief remains the physical detail authority in South Korea.',
            'North Korea is driven by WorldCover low-frequency material plus non-directional microtexture; legacy random contextual shade is reduced to a 6% color-continuity seed and carries zero directional-detail gain.',
            'Procedural noise is low-amplitude material breakup only and does not invent geographic relief.',
            'Land RGB is extrapolated into transparent edge texels to prevent linear-filter dark fringe.'
        ],
        'v36_reference': previous
    }
    QA.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({
        'surface': str(DST),
        'size': [w, h],
        'land_pixels': report['land_pixels'],
        'edge_rgb_extrapolated_transparent_pixels': report['edge_rgb_extrapolated_transparent_pixels'],
        'alpha_unique_values': unique_alpha,
        'north_v36_base_weight': report['north_v36_base_weight'],
        'north_v36_directional_detail_weight': report['north_v36_directional_detail_weight'],
    }, indent=2))


if __name__ == '__main__':
    main()
