# SSKR Scene 05 B — Three-Reference Sunset Finale v3.8.3

This focused pass keeps the accepted v3.8.2 0–22 second participant-route choreography unchanged and refines only the West Sea finale. Three user-provided images are preserved as normalized project working references; the two storyboard sheets remain reference-only, while the clean West Sea sunset image becomes the visible finale plate.

Scene 05 A v1.8 remains accepted and untouched under `final/scene05/`.

## v3.8.3 scope

1. retain the complete v3.8.2 0–22s dawn/map/route choreography
2. retain the v3.8.1 high-resolution canonical Korean peninsula coastline
3. retain `korean_peninsula_precise.svg` as the single coastline authority
4. preserve the two storyboard sheets as reference-only assets
5. use the clean user-provided West Sea sunset reference as the visible 22–30s finale plate
6. keep sky, sun, sea, natural reflection and coastline authored together as one image
7. keep synthetic sun and procedural sunset reflection disabled
8. make the map→matte handoff shorter and more decisive
9. provide a clean sunset appreciation beat before the message enters
10. strengthen the core message around individual route, shared completion and lasting rider memory

## v3.8.3 reference assets

Repository reference directory:

`assets/scene05/finale_v383_refs/`

- `concept_01.webp` — `05컨셉1.png`, storyboard/timing/lighting reference only
- `concept_02.webp` — `05컨셉2.png`, storyboard/composition/message-placement reference only
- `concept_03.webp` — `CC65DB36-D551-40D2-A2B7-8B473AF491C0.jpeg`, selected visible finale plate

The three files are normalized WebP working copies derived from the user-provided attachments. The original attachments remain the source authority. Repository normalization is limited to resize + WebP compression; the build validates all three and upscales only `concept_03.webp` to the 4K runtime matte without repainting or procedural reconstruction.

## Peninsula / coastline

`assets/vector/korean_peninsula_precise.svg` remains the coastline authority. The accepted v3.8.1 coastline build is untouched in this pass:

- direct high-resolution rasterization of the canonical SVG
- anti-aliased edge coverage retained
- neighboring land RGB extrapolated under transparent edge texels
- mipmaps disabled for the peninsula texture
- linear sampling with a low alpha cutoff
- old shallow-water coastline reduced to a trace

No generated map image replaces the canonical coastline or the established WorldCover / South DEM surface pipeline.

## Finale architecture

- `sunSprite` remains disabled
- procedural sunset reflection strength remains forced to zero
- the visible final sun and sea reflection are authored inside `concept_03.webp`
- the matte stays outside the Three.js `EffectComposer`
- the live HTML scene mark exits before the authored finale becomes dominant
- the baked upper-left mark in the selected artwork therefore never doubles with the live mark
- no additional cloud, horizon glow, wave, shoreline, island or reflection is painted over the finale

## 30-second one-take

- 0–3s — full Korean peninsula
- 3–6s — East Coast dawn approach
- 6–9s — Start-point cascade
- 9–19s — participant routes travel westward
- 19–22s — Finish convergence
- 21.72–22.20s — live HTML scene mark exits
- 22.16–23.80s — decisive map/aerial → West Sea sunset handoff
- 23.80–25.35s — unobstructed sunset settle / appreciation beat
- 25.35–26.20s — core message reveal
- 26.20–30s — readable final hold

## Core message

```text
각자의 길이 하나의 완주로 모이고,
함께한 하루는 오래 남는 라이더의 기억이 됩니다.
```

The copy replaces the more absolute “기억은 영원이 됩니다” wording with a stronger but less advertising-like statement that keeps the Scene 05 completion / shared experience / memory axis.

## Data / resource authority

- coastline: `assets/vector/korean_peninsula_precise.svg`
- South terrain detail: Copernicus GLO-30 based South Korea Hero Terrain v0.2
- full-peninsula surface material: ESA WorldCover-informed custom surface pipeline
- 0–22s dawn environment: Poly Haven CC0 `Umhlanga Sunrise`
- 22–30s visible finale: `assets/scene05/finale_v383_refs/concept_03.webp`
- route topology: actual-road participant-route data

## QA

Mandatory captures:

- accepted journey regression: 1.5 / 4.5 / 7.2 / 12.0 / 16.5 / 18.9 / 21.0 seconds
- v3.8.3 finale: 22.4 / 23.4 / 24.5 / 25.25 / 26.2 / 29.5 seconds
- surface diagnostics: full / South / East / West / land-only / land+ocean / texture-only / canonical mask

Structural finale assertions require:

- generated matte fully visible after the handoff
- WebGL map stage fully faded out by the settled matte frame
- live HTML scene mark fully absent before the authored plate hold
- clean sunset hold occurs before statement reveal
- final statement opacity reaches the readable hold threshold
- synthetic sun invisible
- procedural sunset reflection disabled
- timeline remains 30 seconds

Status before main merge: **feature-branch visual QA required; do not merge on automation alone.**
