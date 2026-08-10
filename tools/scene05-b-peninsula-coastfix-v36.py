#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path.cwd()
OUT = ROOT / 'output/scene05_final_v1'
WC = ROOT / 'assets/scene05/worldcover_v1/worldcover_peninsula_v1.png'
TEX = OUT / 'peninsula_surface_v36.png'
QA = OUT / 'peninsula_surface_v36_qa.json'


def weighted_extrapolate(rgb, valid, invalid, radius):
    weight_img = Image.fromarray((valid.astype(np.uint8) * 255), 'L').filter(ImageFilter.GaussianBlur(radius))
    weight = np.asarray(weight_img, np.float32) / 255.0
    out = np.zeros_like(rgb, dtype=np.float32)
    for ch in range(3):
        src = np.where(valid, rgb[..., ch], 0.0)
        num_img = Image.fromarray(np.clip(src, 0, 255).astype(np.uint8), 'L').filter(ImageFilter.GaussianBlur(radius))
        num = np.asarray(num_img, np.float32)
        out[..., ch] = num / np.maximum(weight, .010)
    fill = invalid & (weight > .015)
    return out, fill


def main():
    img = Image.open(TEX).convert('RGBA')
    a = np.asarray(img, dtype=np.uint8).copy()
    rgb = a[..., :3].astype(np.float32)
    land = a[..., 3] > 8

    wc_img = Image.open(WC).convert('L')
    if wc_img.size != img.size:
        wc_img = wc_img.resize(img.size, Image.Resampling.NEAREST)
    wc = np.asarray(wc_img, dtype=np.uint8)

    # WorldCover class 80 is water. Where it falls inside the canonical SVG land
    # silhouette it produces a muted blue/grey ribbon parallel to the shoreline.
    # For this presentation surface the canonical SVG wins: extrapolate surrounding
    # *land* material across both class-0 gaps and class-80 raster disagreement.
    invalid = land & ((wc == 0) | (wc == 80))
    valid = land & (wc > 0) & (wc != 80)

    extrap, fill = weighted_extrapolate(rgb, valid, invalid, 18)
    rgb[fill] = np.clip(extrap[fill], 0, 255)

    residue = invalid & ~fill
    if residue.any():
        coarse, fill2 = weighted_extrapolate(rgb, valid | fill, residue, 44)
        rgb[fill2] = np.clip(coarse[fill2], 0, 255)
        fill |= fill2

    a[..., :3] = np.clip(rgb, 0, 255).astype(np.uint8)
    Image.fromarray(a, 'RGBA').save(TEX, optimize=True)

    report = json.loads(QA.read_text('utf-8')) if QA.exists() else {}
    report.update({
        'worldcover_water_inside_canonical_land_pixels': int((land & (wc == 80)).sum()),
        'canonical_land_raster_mismatch_pixels': int(invalid.sum()),
        'canonical_land_raster_mismatch_filled_pixels': int(fill.sum()),
        'coastline_authority': 'canonical SVG alpha only; class-0/class-80 raster disagreement extrapolated from adjacent land material'
    })
    QA.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({
        'invalid_land_pixels': int(invalid.sum()),
        'filled_pixels': int(fill.sum()),
        'water_inside_land': int((land & (wc == 80)).sum())
    }, indent=2))


if __name__ == '__main__':
    main()
