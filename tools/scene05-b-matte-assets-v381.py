#!/usr/bin/env python3
from __future__ import annotations

import base64
import io
import json
from pathlib import Path

from PIL import Image, ImageEnhance

ROOT = Path.cwd()
OUT = ROOT / 'output' / 'scene05_final_v1'
GEN_DIR = ROOT / 'assets' / 'scene05' / 'finale_generated_v382'

# Poly Haven remains only as the photographic environment for the early/dawn map
# phase. The visible 22-30s finale is SSKR project artwork generated specifically
# against the approved Scene 05 concept references.
COAST_SRC = OUT / 'polyhaven_umhlanga_sunrise.jpg'

DAWN_OUT = OUT / 'sky_dawn_v381.jpg'
SUNSET_ENV_OUT = OUT / 'sky_sunset_env_v381.jpg'
SUNSET_MATTE_OUT = OUT / 'west_sunset_matte_v381.jpg'
CLOUD_NULL_OUT = OUT / 'cloud_veil_v381.png'
REPORT_OUT = OUT / 'scene05_b_matte_assets_v381.json'

COAST_URL = 'https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/umhlanga_sunrise.jpg'
GEN_PART_COUNT = 7
GEN_SOURCE_SIZE = (1280, 720)
FINAL_SIZE = (3840, 2160)


def _check_source(path: Path) -> None:
    if not path.exists() or path.stat().st_size < 100_000:
        raise SystemExit(f'missing downloaded Poly Haven source: {path}')


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
    r, g, b = im.split()
    # Channel scaling without numpy keeps this builder lightweight and deterministic.
    r = r.point(lambda v: max(0, min(255, round(v * tint[0]))))
    g = g.point(lambda v: max(0, min(255, round(v * tint[1]))))
    b = b.point(lambda v: max(0, min(255, round(v * tint[2]))))
    im = Image.merge('RGB', (r, g, b))
    im = ImageEnhance.Brightness(im).enhance(brightness)
    im = ImageEnhance.Contrast(im).enhance(contrast)
    im = ImageEnhance.Color(im).enhance(saturation)
    im.save(dst, 'JPEG', quality=90, optimize=True, progressive=True, subsampling=1)


def _load_generated_finale() -> tuple[Image.Image, dict]:
    parts = []
    part_names = []
    for i in range(GEN_PART_COUNT):
        path = GEN_DIR / f'q50-part{i:02d}.b64'
        if not path.exists():
            raise SystemExit(f'missing generated finale source part: {path}')
        text = path.read_text(encoding='ascii').strip()
        parts.append(text)
        part_names.append(path.name)

    raw = base64.b64decode(''.join(parts), validate=True)
    if len(raw) < 30_000:
        raise SystemExit(f'generated finale source unexpectedly small: {len(raw)} bytes')

    with Image.open(io.BytesIO(raw)) as opened:
        im = opened.convert('RGB')

    if im.size != GEN_SOURCE_SIZE:
        raise SystemExit(f'generated finale size mismatch: {im.size} != {GEN_SOURCE_SIZE}')

    return im, {
        'encoding': 'base64-split-webp',
        'parts': part_names,
        'source_bytes': len(raw),
        'source_size': list(im.size),
    }


def _build_generated_finale(dst: Path) -> dict:
    # Do not redraw, re-grade, synthesize a sun, or construct a reflection here.
    # The generated SSKR artwork already owns sky, sun, sea, reflection, islands,
    # shoreline and the final cinematic color relationship as one authored image.
    im, source = _load_generated_finale()
    if im.size != FINAL_SIZE:
        im = im.resize(FINAL_SIZE, Image.Resampling.LANCZOS)
    im.save(dst, 'JPEG', quality=95, optimize=True, progressive=True, subsampling=0)

    return {
        **source,
        'output_size': list(im.size),
        'output': dst.name,
        'treatment': 'source-preserving upscale only',
        'visual_authority': 'SSKR generated project artwork',
    }


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    _check_source(COAST_SRC)

    # Existing early-scene dawn environment stays intact so route choreography and
    # map lighting do not regress during this focused finale replacement.
    _fit_equirect(
        COAST_SRC,
        DAWN_OUT,
        tint=(.965, .995, 1.035),
        brightness=.91,
        contrast=1.00,
        saturation=.98,
    )
    _fit_equirect(
        COAST_SRC,
        SUNSET_ENV_OUT,
        tint=(1.055, .965, .885),
        brightness=.90,
        contrast=1.045,
        saturation=1.08,
    )

    plate = _build_generated_finale(SUNSET_MATTE_OUT)

    # No independent cloud layer is allowed over the authored finale.
    Image.new('RGBA', (32, 32), (255, 255, 255, 0)).save(CLOUD_NULL_OUT, optimize=True)

    report = {
        'schema_version': '3.8.2',
        'purpose': 'Scene 05 B generated-art finale replacement while retaining the existing dawn/map environment.',
        'sources': [
            {
                'name': 'Umhlanga Sunrise HDRI tonemapped panorama',
                'url': COAST_URL,
                'license': 'CC0 — Poly Haven',
                'role': '0-22s dawn/map environment only',
            },
            {
                'name': 'SSKR Scene 05 B cinematic sunset project artwork',
                'role': '22-30s visible finale plate',
                'source_location': 'assets/scene05/finale_generated_v382/q50-part00..06.b64',
            },
        ],
        'outputs': [DAWN_OUT.name, SUNSET_ENV_OUT.name, SUNSET_MATTE_OUT.name, CLOUD_NULL_OUT.name],
        'sunset_plate': plate,
        'policy': [
            'The 22-30s visible finale is the approved SSKR-generated project artwork, not a reconstructed stock-photo sunset.',
            'Sky, sun, sea, reflection, islands and foreground shoreline remain authored together in one image.',
            'No synthetic sun sprite or procedural sunset reflection is introduced.',
            'The finale plate remains outside WebGL bloom/tone-mapping and is only scaled to the 4K delivery frame.',
            'The 0-22s route choreography and map lighting pipeline are intentionally unchanged.',
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
