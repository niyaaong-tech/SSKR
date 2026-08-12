#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
from pathlib import Path

from PIL import Image, ImageEnhance

ROOT = Path.cwd()
OUT = ROOT / 'output' / 'scene05_final_v1'
REF_DIR = ROOT / 'assets' / 'scene05' / 'finale_v383_refs'

# Poly Haven remains only as the photographic environment for the 0-22s map phase.
COAST_SRC = OUT / 'polyhaven_umhlanga_sunrise.jpg'
DAWN_OUT = OUT / 'sky_dawn_v381.jpg'
SUNSET_ENV_OUT = OUT / 'sky_sunset_env_v381.jpg'
SUNSET_MATTE_OUT = OUT / 'west_sunset_matte_v383.jpg'
CLOUD_NULL_OUT = OUT / 'cloud_veil_v381.png'
REPORT_OUT = OUT / 'scene05_b_matte_assets_v383.json'

COAST_URL = 'https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/umhlanga_sunrise.jpg'
FINAL_SIZE = (3840, 2160)
VISIBLE_ASSET = REF_DIR / 'concept_03.jpg'
MIN_REF_BYTES = 4_000
MIN_REF_WIDTH = 640
MIN_REF_HEIGHT = 360


def _check_source(path: Path) -> None:
    if not path.exists() or path.stat().st_size < 100_000:
        raise SystemExit(f'missing downloaded Poly Haven source: {path}')


def _fit_equirect(src: Path, dst: Path, *, tint, brightness: float, contrast: float, saturation: float) -> None:
    im = Image.open(src).convert('RGB').resize((4096, 2048), Image.Resampling.LANCZOS)
    r, g, b = im.split()
    r = r.point(lambda v: max(0, min(255, round(v * tint[0]))))
    g = g.point(lambda v: max(0, min(255, round(v * tint[1]))))
    b = b.point(lambda v: max(0, min(255, round(v * tint[2]))))
    im = Image.merge('RGB', (r, g, b))
    im = ImageEnhance.Brightness(im).enhance(brightness)
    im = ImageEnhance.Contrast(im).enhance(contrast)
    im = ImageEnhance.Color(im).enhance(saturation)
    im.save(dst, 'JPEG', quality=90, optimize=True, progressive=True, subsampling=1)


def _load_ref(name: str) -> tuple[Image.Image, dict]:
    path = REF_DIR / name
    if not path.exists():
        raise SystemExit(f'missing Scene 05 v3.8.3 reference asset: {path}')
    raw = path.read_bytes()
    if len(raw) < MIN_REF_BYTES:
        raise SystemExit(f'reference asset unexpectedly small: {path} ({len(raw)} bytes)')
    try:
        with Image.open(path) as opened:
            opened.verify()
        with Image.open(path) as opened:
            opened.load()
            im = opened.convert('RGB')
    except Exception as exc:
        raise SystemExit(f'invalid Scene 05 v3.8.3 reference image: {path}: {exc}') from exc
    if im.width < MIN_REF_WIDTH or im.height < MIN_REF_HEIGHT:
        raise SystemExit(
            f'reference asset resolution too small: {path} ({im.width}x{im.height}; '
            f'minimum {MIN_REF_WIDTH}x{MIN_REF_HEIGHT})'
        )
    return im, {
        'asset': name,
        'source_size': list(im.size),
        'source_bytes': len(raw),
        'sha256': hashlib.sha256(raw).hexdigest(),
        'encoding': 'repository-jpeg-working-copy',
    }


def _ref_meta(asset: str, source_name: str, role: str) -> dict:
    _im, meta = _load_ref(asset)
    return {**meta, 'source_name': source_name, 'role': role}


def _build_finale(dst: Path) -> dict:
    im, source = _load_ref(VISIBLE_ASSET.name)
    if im.size != FINAL_SIZE:
        im = im.resize(FINAL_SIZE, Image.Resampling.LANCZOS)
    # Source-preserving upscale only: no synthetic sun, reflection, clouds, shoreline or re-grade.
    im.save(dst, 'JPEG', quality=95, optimize=True, progressive=True, subsampling=0)
    return {
        **source,
        'source_asset': VISIBLE_ASSET.name,
        'output_size': list(im.size),
        'output': dst.name,
        'treatment': 'source-preserving upscale only',
        'visual_authority': 'SSKR user-provided West Sea sunset reference working copy',
    }


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    _check_source(COAST_SRC)

    references = [
        _ref_meta('concept_01.jpg', '05컨셉1.png', 'reference-only storyboard / timing and lighting direction'),
        _ref_meta('concept_02.jpg', '05컨셉2.png', 'reference-only storyboard / finale composition direction'),
        _ref_meta('concept_03.jpg', 'CC65DB36-D551-40D2-A2B7-8B473AF491C0.jpeg', 'selected visible 22-30s West Sea sunset finale plate'),
    ]

    # 0-22s resources are intentionally identical to v3.8.2.
    _fit_equirect(COAST_SRC, DAWN_OUT, tint=(.965, .995, 1.035), brightness=.91, contrast=1.00, saturation=.98)
    _fit_equirect(COAST_SRC, SUNSET_ENV_OUT, tint=(1.055, .965, .885), brightness=.90, contrast=1.045, saturation=1.08)
    plate = _build_finale(SUNSET_MATTE_OUT)
    Image.new('RGBA', (32, 32), (255, 255, 255, 0)).save(CLOUD_NULL_OUT, optimize=True)

    report = {
        'schema_version': '3.8.3',
        'purpose': 'Scene 05 B finale-only still replacement and timing polish; 0-22s map/route choreography unchanged.',
        'references': references,
        'sources': [
            {
                'name': 'Umhlanga Sunrise HDRI tonemapped panorama',
                'url': COAST_URL,
                'license': 'CC0 — Poly Haven',
                'role': '0-22s dawn/map environment only',
            },
            {
                'name': 'SSKR v3.8.3 user-provided finale reference working copies',
                'source_location': 'assets/scene05/finale_v383_refs/concept_01.jpg .. concept_03.jpg',
                'role': 'three imported candidates; concept_03 selected for the visible 22-30s plate',
            },
        ],
        'outputs': [DAWN_OUT.name, SUNSET_ENV_OUT.name, SUNSET_MATTE_OUT.name, CLOUD_NULL_OUT.name],
        'sunset_plate': plate,
        'policy': [
            'The 0-22s route choreography and dawn/map environment are unchanged from v3.8.2.',
            'The two storyboard sheets are reference-only and never shown as runtime finale plates.',
            'The visible finale uses the imported third image working copy as one authored image containing sky, sun, sea, reflection and coastline.',
            'No synthetic sun sprite or procedural sunset reflection is introduced.',
            'The finale remains outside WebGL bloom/tone-mapping and is only upscaled to the 4K delivery frame.',
        ],
    }
    REPORT_OUT.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({'plate': plate, 'references': references}, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
