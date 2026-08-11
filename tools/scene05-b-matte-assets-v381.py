#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageEnhance, ImageFilter

ROOT = Path.cwd()
OUT = ROOT / 'output' / 'scene05_final_v1'

DAWN_SRC = OUT / 'polyhaven_umhlanga_sunrise.jpg'
SUNSET_ENV_SRC = OUT / 'polyhaven_the_sky_is_on_fire.jpg'
SUNSET_PLATE_SRC = OUT / 'polyhaven_umhlanga_sunrise_DSC08482.jpg'

DAWN_OUT = OUT / 'sky_dawn_v381.jpg'
SUNSET_ENV_OUT = OUT / 'sky_sunset_env_v381.jpg'
SUNSET_MATTE_OUT = OUT / 'west_sunset_matte_v381.jpg'
CLOUD_NULL_OUT = OUT / 'cloud_veil_v381.png'
REPORT_OUT = OUT / 'scene05_b_matte_assets_v381.json'

DAWN_URL = 'https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/umhlanga_sunrise.jpg'
SUNSET_ENV_URL = 'https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/the_sky_is_on_fire.jpg'
SUNSET_PLATE_URL = 'https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Backplates/umhlanga_sunrise/jpg_pretty/DSC08482.jpg'


def _check_source(path: Path) -> None:
    if not path.exists() or path.stat().st_size < 100_000:
        raise SystemExit(f'missing downloaded Poly Haven source: {path}')


def _tint(im: Image.Image, rgb_scale: tuple[float, float, float]) -> Image.Image:
    arr = np.asarray(im.convert('RGB'), np.float32)
    arr *= np.asarray(rgb_scale, np.float32)[None, None, :]
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), 'RGB')


def _fit_equirect(
    src: Path,
    dst: Path,
    *,
    tint: tuple[float, float, float],
    brightness: float,
    contrast: float,
    saturation: float,
) -> None:
    im = Image.open(src).convert('RGB').resize((4096, 2048), Image.Resampling.LANCZOS)
    im = _tint(im, tint)
    im = ImageEnhance.Brightness(im).enhance(brightness)
    im = ImageEnhance.Contrast(im).enhance(contrast)
    im = ImageEnhance.Color(im).enhance(saturation)
    im.save(dst, 'JPEG', quality=90, optimize=True, progressive=True, subsampling=1)


def _detect_sun(im: Image.Image) -> tuple[float, float]:
    """Find the local warm highlight that represents the real photographed sun.

    The detector intentionally searches only the horizon half of the frame and uses
    local highlight contrast rather than drawing or synthesizing a sun. If the plate
    changes in a later pass, the crop remains tied to the photographed light source.
    """
    w, h = im.size
    sample_w = min(1600, w)
    sample_h = max(16, round(h * sample_w / w))
    small = im.resize((sample_w, sample_h), Image.Resampling.LANCZOS)
    a = np.asarray(small, np.float32) / 255.0
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    lum = r * .2126 + g * .7152 + b * .0722
    warm = np.clip(r - b * .72 - g * .10, 0.0, 1.0)
    lum_img = Image.fromarray(np.clip(lum * 255.0, 0, 255).astype(np.uint8), 'L')
    broad = np.asarray(lum_img.filter(ImageFilter.GaussianBlur(max(10, sample_w // 45))), np.float32) / 255.0
    local = np.clip(lum - broad, 0.0, 1.0)
    score = lum * .32 + warm * .52 + local * 1.35

    yy = np.linspace(0.0, 1.0, sample_h, dtype=np.float32)[:, None]
    xx = np.linspace(0.0, 1.0, sample_w, dtype=np.float32)[None, :]
    allowed = (yy > .20) & (yy < .70) & (xx > .06) & (xx < .94)
    score = np.where(allowed, score, -1.0)
    sy, sx = np.unravel_index(int(np.argmax(score)), score.shape)
    return sx / max(sample_w - 1, 1) * w, sy / max(sample_h - 1, 1) * h


def _crop_sunset_plate(src: Path, dst: Path) -> dict:
    im = Image.open(src).convert('RGB')
    w, h = im.size
    sun_x, sun_y = _detect_sun(im)

    # Maximum 16:9 crop inside the source. Place the photographed sun slightly left
    # of center and above the visual horizon so its real reflection remains below it.
    if w / h >= 16 / 9:
        crop_h = h
        crop_w = round(h * 16 / 9)
    else:
        crop_w = w
        crop_h = round(w * 9 / 16)

    left = round(sun_x - crop_w * .43)
    top = round(sun_y - crop_h * .39)
    left = max(0, min(w - crop_w, left))
    top = max(0, min(h - crop_h, top))
    crop = im.crop((left, top, left + crop_w, top + crop_h))

    # Sunset grade only. No painted sun, no generated reflection, no artificial
    # horizon band: all visible light relationships remain from the source photograph.
    crop = _tint(crop, (1.075, 1.005, .925))
    crop = ImageEnhance.Color(crop).enhance(1.12)
    crop = ImageEnhance.Contrast(crop).enhance(1.055)
    crop = ImageEnhance.Brightness(crop).enhance(.975)
    crop = crop.resize((3840, 2160), Image.Resampling.LANCZOS)
    crop.save(dst, 'JPEG', quality=91, optimize=True, progressive=True, subsampling=1)

    return {
        'source_size': [w, h],
        'detected_sun_px': [round(sun_x, 1), round(sun_y, 1)],
        'crop_box': [left, top, left + crop_w, top + crop_h],
        'output_size': [3840, 2160],
    }


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for p in (DAWN_SRC, SUNSET_ENV_SRC, SUNSET_PLATE_SRC):
        _check_source(p)

    _fit_equirect(
        DAWN_SRC,
        DAWN_OUT,
        tint=(.965, .995, 1.035),
        brightness=.91,
        contrast=1.00,
        saturation=.98,
    )
    _fit_equirect(
        SUNSET_ENV_SRC,
        SUNSET_ENV_OUT,
        tint=(1.035, .995, .965),
        brightness=.94,
        contrast=1.025,
        saturation=1.05,
    )
    plate = _crop_sunset_plate(SUNSET_PLATE_SRC, SUNSET_MATTE_OUT)

    # v3.7 code expects a cloud texture. v3.8.1 keeps that load slot but supplies
    # a transparent texture; the visible finale cloud/sky structure comes from the
    # photographic environment and backplate instead of extracted cloud decals.
    Image.new('RGBA', (32, 32), (255, 255, 255, 0)).save(CLOUD_NULL_OUT, optimize=True)

    report = {
        'schema_version': '3.8.1',
        'purpose': 'Photographic coastal environment and west-sea matte for Scene 05 B.',
        'license': 'CC0 — Poly Haven.',
        'sources': [
            {'name': 'Umhlanga Sunrise HDRI tonemapped panorama', 'url': DAWN_URL, 'role': 'East dawn photographic environment'},
            {'name': 'The Sky Is On Fire HDRI tonemapped panorama', 'url': SUNSET_ENV_URL, 'role': 'West sunset transition environment'},
            {'name': 'Umhlanga Sunrise backplate DSC08482', 'url': SUNSET_PLATE_URL, 'role': 'Visible sky + real sun + sea + real reflection finale matte'},
        ],
        'outputs': [DAWN_OUT.name, SUNSET_ENV_OUT.name, SUNSET_MATTE_OUT.name, CLOUD_NULL_OUT.name],
        'sunset_plate': plate,
        'policy': [
            'The finale sun is the photographed sun in the backplate; no sprite sun is drawn.',
            'The finale sea reflection is the photographed reflection; no procedural reflection lane is added.',
            'The visible finale sky, sun and sea therefore share one photographic exposure and art style.',
            'High-resolution deployment derivatives are kept at 4K-class resolution rather than the v3.7 2K sky size.',
        ],
    }
    REPORT_OUT.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({
        'dawn_bytes': DAWN_OUT.stat().st_size,
        'sunset_env_bytes': SUNSET_ENV_OUT.stat().st_size,
        'sunset_matte_bytes': SUNSET_MATTE_OUT.stat().st_size,
        'plate': plate,
    }, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
