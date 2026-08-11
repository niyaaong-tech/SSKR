# SSKR Scene 05 B — Generated Sunset Finale v3.8.2

This pass keeps the accepted 30-second participant-route choreography and replaces the generic photographic West Sea ending with the SSKR-generated cinematic sunset artwork approved for the Scene 05 visual direction.

Scene 05 A v1.8 remains accepted and untouched under `final/scene05/`.

## v3.8.2 scope

1. retain the v3.8.1 high-resolution canonical Korean peninsula coastline
2. retain single coastline authority from `korean_peninsula_precise.svg`
3. retain suppression of the legacy shallow-water parallel coast band
4. keep the existing dawn/map environment for 0–22s
5. replace the visible 22–30s finale with the generated SSKR sunset artwork
6. preserve the authored sky, sun, sea, natural reflection, islands and rocky shore as one image
7. fade the live HTML scene mark before the artwork handoff because the generated artwork already contains its own restrained scene mark
8. no route choreography change
9. no Takram, fireworks, canvas-painted clouds, synthetic finale sun or procedural sunset reflection

## Peninsula / coastline

`assets/vector/korean_peninsula_precise.svg` remains the coastline authority.

The retained v3.8.1 coastline build:

- rasterizes the canonical SVG directly at 2688px width rather than upscaling the previous binary alpha
- preserves anti-aliased edge coverage
- extrapolates neighboring land RGB beneath transparent edge texels
- disables mipmaps for the peninsula texture
- uses linear sampling with a low alpha cutoff
- reduces the old shallow-water coastline contribution to a trace so it does not read as a second shore

The accepted WorldCover / South DEM material treatment remains the base surface; this pass does not replace the Korean peninsula with a downloaded map image.

## Finale artwork source

The visible finale is reconstructed from the project source under:

`assets/scene05/finale_generated_v382/q50-part00.b64` … `q50-part06.b64`

The split base64 files encode one 1280×720 WebP copy of the approved generated artwork. The build script reconstructs the image and performs only a source-preserving Lanczos upscale to the existing 3840×2160 runtime plate path:

`west_sunset_matte_v381.jpg`

No additional sun, horizon glow, cloud layer, wave highlight, shoreline, island or sea reflection is painted by the build script.

## Sunset finale architecture

- `sunSprite` remains disabled
- procedural sunset reflection strength remains forced to zero
- the visible final sun is the sun authored in the SSKR artwork
- the visible sea reflection is the reflection authored in the same artwork
- sky, clouds, horizon, sea, sun, reflection and foreground coastline therefore remain one art-directed visual system
- the finale matte remains a DOM/CSS layer outside Three.js `EffectComposer`, preventing UnrealBloom or map tone mapping from altering the artwork
- the original HTML scene mark fades out just before the finale crossfade, preventing a duplicate label over the artwork's baked scene mark

## 30-second one-take

- 0–3s — full Korean peninsula
- 3–6s — East Coast dawn approach
- 6–9s — Start-point cascade
- 9–19s — participant routes travel westward
- 19–22s — Finish convergence
- 21.86–22.38s — live HTML scene mark exits
- 22–24.3s — map/aerial view hands off to the generated West Sea sunset artwork
- 24.3–26s — generated sunset settles
- 26–30s — core message over the sunset artwork

## Core message

```text
모두의 라이딩이 한 장소에서 마무리되며,
현장은 축제가 되고 기억은 영원이 됩니다.
```

## Data / resource authority

- coastline: `assets/vector/korean_peninsula_precise.svg`
- South terrain detail: Copernicus GLO-30 based South Korea Hero Terrain v0.2
- full-peninsula surface material: ESA WorldCover-informed custom surface pipeline
- 0–22s dawn environment: Poly Haven CC0 `Umhlanga Sunrise`
- 22–30s visible finale: SSKR generated project artwork
- route topology: actual-road participant-route data

## QA

Mandatory captures:

- journey: 1.5 / 4.5 / 7.2 / 12.0 / 16.5 / 18.9 / 21.0 / 24.0 / 27.5 / 29.5 seconds
- surface diagnostics: full / South / East / West / land-only / land+ocean / texture-only / canonical mask

Structural finale assertions require:

- generated matte fully visible by final hold
- WebGL map stage fully faded out by final hold
- live HTML scene mark faded out before the artwork becomes dominant
- synthetic sun invisible
- procedural sunset reflection disabled

Status before main merge: **feature-branch visual QA required; do not merge on automation alone.**