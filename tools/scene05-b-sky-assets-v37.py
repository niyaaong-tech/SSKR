#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageEnhance, ImageFilter

ROOT = Path.cwd()
OUT = ROOT / 'output' / 'scene05_final_v1'
DAWN_SRC = OUT / 'polyhaven_qwantani_dawn_puresky.jpg'
SUNSET_SRC = OUT / 'polyhaven_industrial_sunset_puresky.jpg'
SIZE = (2048, 1024)

DAWN_URL = 'https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/qwantani_dawn_puresky.jpg'
SUNSET_URL = 'https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/industrial_sunset_puresky.jpg'


def fit_equirect(src: Path, out: Path, *, brightness: float, contrast: float, saturation: float, tint: tuple[float, float, float]):
    im = Image.open(src).convert('RGB').resize(SIZE, Image.Resampling.LANCZOS)
    arr = np.asarray(im, np.float32)
    arr *= np.asarray(tint, np.float32)[None, None, :]
    im = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), 'RGB')
    im = ImageEnhance.Brightness(im).enhance(brightness)
    im = ImageEnhance.Contrast(im).enhance(contrast)
    im = ImageEnhance.Color(im).enhance(saturation)
    im.save(out, 'JPEG', quality=84, optimize=True, progressive=True, subsampling=1)
    return im


def cloud_veil(src: Image.Image, out: Path):
    # Extract real photographic cloud structure from the CC0 pure-sky panorama.
    # This is deliberately low-opacity atmospheric texture, not a hero cloud render.
    crop = src.crop((0, 70, src.width, 690)).resize((1536, 512), Image.Resampling.LANCZOS)
    rgb = np.asarray(crop, np.float32)
    gray = np.asarray(crop.convert('L'), np.float32)
    broad = np.asarray(crop.convert('L').filter(ImageFilter.GaussianBlur(30)), np.float32)
    local = np.abs(gray - broad)
    bright = np.clip((gray - 102.0) / 110.0, 0.0, 1.0)
    structure = np.clip((local - 3.0) / 32.0, 0.0, 1.0)
    alpha = np.clip((structure * .72 + bright * .28) * 76.0, 0, 76)
    # Keep the veil away from the extreme vertical edges to avoid a rectangular card read.
    yy = np.linspace(0, 1, alpha.shape[0], dtype=np.float32)[:, None]
    feather = np.sin(np.clip(yy, 0, 1) * np.pi) ** .72
    alpha *= feather
    alpha = np.asarray(Image.fromarray(alpha.astype(np.uint8), 'L').filter(ImageFilter.GaussianBlur(3)), np.uint8)
    cool = rgb * .28 + np.array([224, 232, 235], np.float32)[None, None, :] * .72
    rgba = np.dstack([np.clip(cool, 0, 255).astype(np.uint8), alpha])
    Image.fromarray(rgba, 'RGBA').save(out, optimize=True)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for p in (DAWN_SRC, SUNSET_SRC):
        if not p.exists() or p.stat().st_size < 100_000:
            raise SystemExit(f'missing downloaded Poly Haven source: {p}')

    dawn = fit_equirect(
        DAWN_SRC, OUT / 'sky_dawn_v37.jpg',
        brightness=.84, contrast=.96, saturation=.90, tint=(.91, .96, 1.05)
    )
    sunset = fit_equirect(
        SUNSET_SRC, OUT / 'sky_sunset_v37.jpg',
        brightness=.92, contrast=1.04, saturation=1.06, tint=(1.08, .98, .91)
    )
    cloud_veil(sunset, OUT / 'cloud_veil_v37.png')

    report = {
        'schema_version': '3.7',
        'purpose': 'Lightweight photographic atmosphere assets for Scene 05 B Resource Polish Pass 1.',
        'license': 'CC0 (Poly Haven assets).',
        'sources': [
            {'name': 'Qwantani Dawn (Pure Sky)', 'url': DAWN_URL},
            {'name': 'Industrial Sunset (Pure Sky)', 'url': SUNSET_URL},
        ],
        'outputs': ['sky_dawn_v37.jpg', 'sky_sunset_v37.jpg', 'cloud_veil_v37.png'],
        'policy': [
            'Photographic sky resources replace hand-drawn hero clouds.',
            'Cloud veil is derived from the CC0 sunset panorama and used only at restrained opacity.',
            'All downloaded source panoramas are build-time inputs; deploy output keeps only compressed presentation assets.'
        ]
    }
    (OUT / 'scene05_b_sky_assets_v37.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({
        'dawn_bytes': (OUT / 'sky_dawn_v37.jpg').stat().st_size,
        'sunset_bytes': (OUT / 'sky_sunset_v37.jpg').stat().st_size,
        'cloud_bytes': (OUT / 'cloud_veil_v37.png').stat().st_size,
    }, indent=2))


if __name__ == '__main__':
    main()
