#!/usr/bin/env python3
from __future__ import annotations

import json
import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageEnhance

ROOT = Path.cwd()
OUT = ROOT / 'output' / 'scene05_final_v1'

# One real coastal photo panorama is intentionally reused for the visible dawn and
# west finale derivatives. The finale is warm-graded, but its sun, clouds, horizon,
# waves and reflection remain the photographed relationships from the same exposure.
COAST_SRC = OUT / 'polyhaven_umhlanga_sunrise.jpg'

DAWN_OUT = OUT / 'sky_dawn_v381.jpg'
SUNSET_ENV_OUT = OUT / 'sky_sunset_env_v381.jpg'
SUNSET_MATTE_OUT = OUT / 'west_sunset_matte_v381.jpg'
CLOUD_NULL_OUT = OUT / 'cloud_veil_v381.png'
REPORT_OUT = OUT / 'scene05_b_matte_assets_v381.json'

COAST_URL = 'https://dl.polyhaven.org/file/ph-assets/HDRIs/extra/Tonemapped%20JPG/umhlanga_sunrise.jpg'


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
    """Locate the photographed warm solar highlight around the panorama horizon."""
    w, h = im.size
    sw = min(1600, w)
    sh = max(32, round(h * sw / w))
    a = np.asarray(im.resize((sw, sh), Image.Resampling.LANCZOS), np.float32) / 255.0
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    lum = r * .2126 + g * .7152 + b * .0722
    warm = np.clip(r - b * .64 - g * .04, 0.0, 1.0)
    yy = np.linspace(0.0, 1.0, sh, dtype=np.float32)[:, None]
    score = lum * .55 + warm * .65
    score = np.where((yy > .20) & (yy < .72), score, -1.0)
    sy, sx = np.unravel_index(int(np.argmax(score)), score.shape)
    return sx / max(sw - 1, 1) * w, sy / max(sh - 1, 1) * h


def _project_equirect(
    im: Image.Image,
    *,
    yaw_deg: float,
    pitch_arg_deg: float,
    hfov_deg: float,
    out_size: tuple[int, int],
) -> Image.Image:
    """Rectilinear perspective projection in row chunks to keep Actions memory sane."""
    src = np.asarray(im.convert('RGB'), dtype=np.uint8)
    sh, sw = src.shape[:2]
    ow, oh = out_size
    hfov = math.radians(hfov_deg)
    vfov = 2.0 * math.atan(math.tan(hfov * .5) * (oh / ow))
    tan_h = math.tan(hfov * .5)
    tan_v = math.tan(vfov * .5)
    xs = np.linspace(-tan_h, tan_h, ow, dtype=np.float32)[None, :]

    yaw = math.radians(yaw_deg)
    pitch = math.radians(pitch_arg_deg)
    cy, sy = math.cos(yaw), math.sin(yaw)
    cp, sp = math.cos(pitch), math.sin(pitch)

    dst = np.empty((oh, ow, 3), dtype=np.uint8)
    chunk = 96
    for y0 in range(0, oh, chunk):
        y1 = min(oh, y0 + chunk)
        ys = np.linspace(tan_v - (2 * tan_v) * y0 / max(oh - 1, 1),
                         tan_v - (2 * tan_v) * (y1 - 1) / max(oh - 1, 1),
                         y1 - y0, dtype=np.float32)[:, None]
        x = np.broadcast_to(xs, (y1 - y0, ow)).copy()
        y = np.broadcast_to(ys, (y1 - y0, ow)).copy()
        z = np.ones_like(x)
        norm = np.sqrt(x * x + y * y + z * z)
        x /= norm; y /= norm; z /= norm

        y2 = y * cp - z * sp
        z2 = y * sp + z * cp
        y, z = y2, z2
        x2 = x * cy + z * sy
        z2 = -x * sy + z * cy
        x, z = x2, z2

        lon = np.arctan2(x, z)
        lat = np.arcsin(np.clip(y, -1.0, 1.0))
        u = np.mod((lon / (2 * math.pi) + .5) * sw, sw)
        v = np.clip((.5 - lat / math.pi) * sh, 0, sh - 1.001)

        ix0 = np.floor(u).astype(np.int32)
        iy0 = np.floor(v).astype(np.int32)
        ix1 = (ix0 + 1) % sw
        iy1 = np.minimum(iy0 + 1, sh - 1)
        dx = (u - ix0)[..., None]
        dy = (v - iy0)[..., None]
        a = src[iy0, ix0].astype(np.float32) * (1 - dx) + src[iy0, ix1].astype(np.float32) * dx
        b = src[iy1, ix0].astype(np.float32) * (1 - dx) + src[iy1, ix1].astype(np.float32) * dx
        dst[y0:y1] = np.clip(a * (1 - dy) + b * dy, 0, 255).astype(np.uint8)

    return Image.fromarray(dst, 'RGB')


def _build_sunset_plate(src: Path, dst: Path) -> dict:
    im = Image.open(src).convert('RGB')
    w, h = im.size
    sun_x, sun_y = _detect_sun(im)
    sun_yaw = (sun_x / w - .5) * 360.0
    sun_lat = (.5 - sun_y / h) * 180.0

    # Match the accepted concept composition: broad clouded sky, low sea horizon,
    # sun left-of-center with its real reflection below. This is rectilinear camera
    # projection of the photo panorama, not a crop of an equirectangular image.
    hfov = 84.0
    target_x = .30
    target_y = .70
    desired_h = math.degrees(math.atan(math.tan(math.radians(hfov) * .5) * (2 * target_x - 1)))
    vfov = 2 * math.atan(math.tan(math.radians(hfov) * .5) * (2160 / 3840))
    desired_v = math.degrees(math.atan(math.tan(vfov * .5) * (1 - 2 * target_y)))
    camera_yaw = sun_yaw - desired_h
    pitch_arg = desired_v - sun_lat

    plate = _project_equirect(
        im,
        yaw_deg=camera_yaw,
        pitch_arg_deg=pitch_arg,
        hfov_deg=hfov,
        out_size=(3840, 2160),
    )

    # Re-time sunrise capture into SSKR's west sunset palette without repainting any
    # spatial light. Sun disk, haze, clouds, wave highlights and reflection stay real.
    plate = _tint(plate, (1.06, .96, .88))
    plate = ImageEnhance.Contrast(plate).enhance(1.06)
    plate = ImageEnhance.Color(plate).enhance(1.09)
    plate = ImageEnhance.Brightness(plate).enhance(.91)
    plate.save(dst, 'JPEG', quality=92, optimize=True, progressive=True, subsampling=1)

    return {
        'source_size': [w, h],
        'detected_sun_px': [round(sun_x, 1), round(sun_y, 1)],
        'sun_yaw_deg': round(sun_yaw, 3),
        'sun_lat_deg': round(sun_lat, 3),
        'projection': {
            'type': 'rectilinear',
            'hfov_deg': hfov,
            'camera_yaw_deg': round(camera_yaw, 3),
            'pitch_arg_deg': round(pitch_arg, 3),
            'target_sun_normalized': [target_x, target_y],
        },
        'output_size': [3840, 2160],
    }


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    _check_source(COAST_SRC)

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
    plate = _build_sunset_plate(COAST_SRC, SUNSET_MATTE_OUT)

    # Legacy v3.7 cloud slot remains transparent. All visible cloud structure now
    # belongs to the photographic panorama / matte itself.
    Image.new('RGBA', (32, 32), (255, 255, 255, 0)).save(CLOUD_NULL_OUT, optimize=True)

    report = {
        'schema_version': '3.8.1',
        'purpose': 'One-source coastal photographic environment and west-sea finale matte for Scene 05 B.',
        'license': 'CC0 — Poly Haven.',
        'sources': [
            {
                'name': 'Umhlanga Sunrise HDRI tonemapped panorama',
                'url': COAST_URL,
                'role': 'East dawn environment + warm-graded west sunset environment + visible rectilinear finale plate',
            }
        ],
        'outputs': [DAWN_OUT.name, SUNSET_ENV_OUT.name, SUNSET_MATTE_OUT.name, CLOUD_NULL_OUT.name],
        'sunset_plate': plate,
        'policy': [
            'The finale uses one real coastal panorama for sky, photographed sun, sea, waves and photographed reflection.',
            'The west treatment is a color grade and perspective projection only; no sun or reflection is painted or synthesized.',
            'The visible finale plate is rendered outside WebGL post-processing so UnrealBloom cannot blow out the photograph.',
            'High-resolution derivatives remain 4K-class rather than the v3.7 2K pure-sky pipeline.',
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
