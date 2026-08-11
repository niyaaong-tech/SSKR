# SSKR Scene 05 B — Coast + Photographic Finale v3.8.1

This pass keeps the accepted 30-second participant-route choreography and corrects the three visible v3.8 failures: coastline edge quality, the synthetic sun floating in front of the sea, and the low-quality / mismatched sky-sea-sun finale.

Scene 05 A v1.8 remains accepted and untouched under `final/scene05/`.

## v3.8.1 scope

1. higher-resolution canonical Korean peninsula coastline
2. single coastline authority from `korean_peninsula_precise.svg`
3. strong suppression of the legacy shallow-water parallel coast band
4. 4K-class photographic coastal environment assets
5. photographed sun, sea and reflection instead of a generated sun/reflection pair
6. clean 22–24s handoff from WebGL map space to the photographic West Sea finale
7. no route choreography change
8. no Takram, fireworks, canvas-painted clouds, or synthetic finale sun

## Peninsula / coastline

`assets/vector/korean_peninsula_precise.svg` remains the coastline authority.

The v3.8.1 build:

- rasterizes the canonical SVG directly at 2688px width rather than upscaling the previous binary alpha
- preserves anti-aliased edge coverage
- extrapolates neighboring land RGB beneath transparent edge texels
- disables mipmaps for the peninsula texture
- uses linear sampling with a low alpha cutoff
- reduces the old shallow-water coastline contribution to a trace so it does not read as a second shore

The accepted WorldCover / South DEM material treatment remains the base surface; this pass does not replace the Korean peninsula with a downloaded map image.

## Coastal photographic resource

Build-time source:

- Poly Haven `Umhlanga Sunrise` — CC0 coastal panorama

The same real coastal panorama is used to produce:

- `sky_dawn_v381.jpg` — cool East dawn environment
- `sky_sunset_env_v381.jpg` — warm-graded West transition environment
- `west_sunset_matte_v381.jpg` — 3840×2160 rectilinear photographic finale plate

The finale plate is a perspective projection and color retime of the real panorama. The script does **not** paint a sun, horizon glow, wave highlight, or reflection.

## Sunset finale architecture

v3.8 used separate systems for sky, sprite sun, ocean shader and synthetic reflection. v3.8.1 removes that visual mismatch.

- `sunSprite` remains disabled
- procedural sunset reflection strength is forced to zero
- the visible final sun is the photographed sun
- the visible final reflection is the photographed sea reflection
- sky, horizon, waves, sun and reflection therefore share one photographic exposure and texture style
- the finale matte is a DOM/CSS layer outside Three.js `EffectComposer`, preventing UnrealBloom from blowing out the photographic sky

## 30-second one-take

- 0–3s — full Korean peninsula
- 3–6s — East Coast dawn approach
- 6–9s — Start-point cascade
- 9–19s — participant routes travel westward
- 19–22s — Finish convergence
- 22–24.3s — map/aerial view hands off to the photographic West Sea horizon
- 24.3–26s — full photographic sunset settles
- 26–30s — core message over the West Sea sunset

## Core message

```text
모두의 라이딩이 한 장소에서 마무리되며,
현장은 축제가 되고 기억은 영원이 됩니다.
```

## Data / resource authority

- coastline: `assets/vector/korean_peninsula_precise.svg`
- South terrain detail: Copernicus GLO-30 based South Korea Hero Terrain v0.2
- full-peninsula surface material: ESA WorldCover-informed custom surface pipeline
- coastal photographic source: Poly Haven CC0 `Umhlanga Sunrise`
- route topology: actual-road participant-route data

## QA

Mandatory captures:

- journey: 1.5 / 4.5 / 7.2 / 12.0 / 16.5 / 18.9 / 21.0 / 24.0 / 27.5 / 29.5 seconds
- surface diagnostics: full / South / East / West / land-only / land+ocean / texture-only / canonical mask

Structural finale assertions require:

- photographic matte fully visible by final hold
- WebGL map stage fully faded out by final hold
- synthetic sun invisible
- procedural sunset reflection disabled

Status before main merge: **feature-branch visual QA required; do not merge on automation alone.**
