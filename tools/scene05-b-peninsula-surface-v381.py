#!/usr/bin/env python3
from __future__ import annotations

import io
import json
import re
from pathlib import Path

import cairosvg
import numpy as np
from PIL import Image, ImageFilter

ROOT = Path.cwd()
OUT = ROOT / 'output' / 'scene05_final_v1'
SVG = ROOT / 'assets/vector/korean_peninsula_precise.svg'
SRC = OUT / 'peninsula_surface_v38.png'

DST = OUT / 'peninsula_surface_v381.png'
MASK_DEBUG = OUT / 'peninsula_mask_debug_v381.png'
QA = OUT / 'peninsula_surface_v381_qa.json'

# 1.5x the v3.8 width. This substantially improves islands/coast sampling while
# keeping decoded GPU memory below the cost of a 4K-wide ~1:1.85 peninsula map.
W = 2688


def svg_size(txt: str) -> tuple[float, float]:
    m = re.search(r'viewBox="\s*0\s+0\s+([0-9.]+)\s+([0-9.]+)"', txt)
    if not m:
        raise SystemExit('canonical SVG viewBox not found')
    return float(m.group(1)), float(m.group(2))


def blur_gray(a: np.ndarray, radius: float) -> np.ndarray:
    return np.asarray(
        Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), 'L').filter(ImageFilter.GaussianBlur(radius)),
        dtype=np.float32,
    )


def edge_rgb_extrapolate(rgb: np.ndarray, land: np.ndarray, radius: int) -> tuple[np.ndarray, np.ndarray]:
    """Carry neighboring land color beneath transparent anti-aliased edge texels."""
    weight = blur_gray(land.astype(np.float32) * 255.0, radius) / 255.0
    extrap = np.empty_like(rgb, dtype=np.float32)
    for ch in range(3):
        src = np.where(land, rgb[..., ch], 0.0)
        num = blur_gray(src, radius)
        extrap[..., ch] = num / np.maximum(weight, .006)
    outer = (~land) & (weight > .010)
    out = rgb.copy()
    out[outer] = np.clip(extrap[outer], 0, 255)
    return out, outer


def main() -> None:
    if not SRC.exists():
        raise SystemExit(f'missing prerequisite: {SRC}')
    if not SVG.exists():
        raise SystemExit(f'missing canonical SVG: {SVG}')

    txt = SVG.read_text('utf-8')
    sw, sh = svg_size(txt)
    h = round(W * sh / sw)

    # Re-rasterize the canonical vector directly at final texture resolution.
    # Do not upscale the old 1792px binary alpha: the SVG remains the coastline authority.
    raw = cairosvg.svg2png(bytestring=txt.encode(), output_width=W, output_height=h)
    svg_rgba = np.asarray(Image.open(io.BytesIO(raw)).convert('RGBA'), dtype=np.uint8)
    canonical_alpha = svg_rgba[..., 3].copy()
    canonical_alpha[canonical_alpha < 8] = 0
    land = canonical_alpha > 0

    # v3.8 already contains the accepted WorldCover / South DEM art direction.
    # Upsample only its RGB material field, then replace alpha with the freshly
    # rasterized canonical vector. A restrained unsharp pass recovers texture clarity.
    src = Image.open(SRC).convert('RGB')
    rgb_img = src.resize((W, h), Image.Resampling.LANCZOS)
    rgb_img = rgb_img.filter(ImageFilter.UnsharpMask(radius=1.1, percent=52, threshold=3))
    rgb = np.asarray(rgb_img, dtype=np.float32)

    # 14px at v3.8 resolution scales to ~21px at 1.5x.
    rgb, outer = edge_rgb_extrapolate(rgb, land, radius=21)

    out = np.zeros((h, W, 4), dtype=np.uint8)
    out[..., :3] = np.clip(rgb, 0, 255).astype(np.uint8)
    out[..., 3] = canonical_alpha
    Image.fromarray(out, 'RGBA').save(DST, optimize=True)

    # Debug view: the white contour is generated from the exact same high-res alpha.
    # It intentionally shows one edge only, not shallow-water coloration.
    a_img = Image.fromarray(canonical_alpha, 'L')
    eroded = np.asarray(a_img.filter(ImageFilter.MinFilter(3)), dtype=np.uint8)
    coast = (canonical_alpha > 8) & (eroded <= 8)
    debug = np.zeros((h, W, 4), dtype=np.uint8)
    debug[..., :3] = [18, 24, 28]
    debug[..., 3] = 255
    debug[land, :3] = [194, 199, 194]
    debug[coast, :3] = [255, 82, 58]
    Image.fromarray(debug, 'RGBA').save(MASK_DEBUG, optimize=True)

    transition = canonical_alpha[(canonical_alpha > 0) & (canonical_alpha < 255)]
    report = {
        'schema_version': '3.8.1',
        'source_surface': SRC.name,
        'production_surface': DST.name,
        'source_svg': str(SVG.relative_to(ROOT)),
        'texture_size': [W, h],
        'scale_vs_v38': round(W / src.width, 4),
        'land_pixels': int(land.sum()),
        'canonical_coast_pixels': int(coast.sum()),
        'edge_rgb_extrapolated_transparent_pixels': int(outer.sum()),
        'alpha_min': int(canonical_alpha.min()),
        'alpha_max': int(canonical_alpha.max()),
        'alpha_transition_pixel_count': int(transition.size),
        'runtime_sampling_policy_required': {
            'generateMipmaps': False,
            'minFilter': 'LinearFilter',
            'magFilter': 'LinearFilter',
            'alphaTest': 0.08,
        },
        'policy': [
            'The canonical SVG is rasterized directly at v3.8.1 final texture resolution.',
            'The v3.8 low-resolution binary alpha is not upscaled or reused as coastline geometry.',
            'SVG anti-alias coverage is preserved for one smooth coastline rather than a jagged binary stair-step.',
            'Land RGB is extrapolated under transparent edge texels so anti-aliasing cannot reveal a dark fringe.',
            'The shallow-water texture is not a coastline authority and must be visually restrained in the renderer.',
        ],
    }
    QA.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
