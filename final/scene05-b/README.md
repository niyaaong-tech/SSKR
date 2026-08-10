# SSKR Scene 05 B — 30s Journey Foundation Polish v3.6

This pass keeps the accepted v3.5 choreography and corrects three visible foundation defects before adding new visual assets.

Scene 05 A v1.8 remains accepted and untouched under `final/scene05/`.

## v3.6 correction scope

1. full-peninsula surface continuity
2. single coastline authority
3. Dawn → Day → Sunset lighting tied to journey progress

## Surface continuity

- canonical Korean peninsula SVG alpha remains the land/coast authority
- ESA WorldCover remains the material source across the full peninsula
- South Korea Copernicus DEM detail is retained
- DEM contribution now fades at all four raster edges instead of exposing a rectangular material boundary over North Korea
- North Korea intentionally uses restrained lower-detail contextual relief rather than invented fine terrain

## Coastline correction

The previous presentation could show a doubled shoreline because the full-peninsula SVG surface and a South-Korea-bounds shallow-water mask were projected independently.

For v3.6:

- texture-side coastline rim/shelf painting is removed
- the misregistered shallow-water tint is disabled
- the canonical SVG alpha is the one visible coastline boundary

A richer near-shore treatment can be rebuilt later from the same canonical coastline coordinate space.

## Lighting correction

The 30-second choreography remains unchanged, but time-of-day now follows the ride:

- 0–6s — predawn / dawn establishes the peninsula and East Coast
- 6–9s — Start cascade remains visibly dawn-lit; cool ambient + warm East Coast glow
- 9–14s — routes launch while dawn grows naturally into neutral daylight
- 15–19s — daylight gradually bends warm toward late afternoon
- 17–22s — sunset begins before the routes reach Finish so arrival already reads as evening
- 22–30s — West Coast sunset tone settles while Finish event light fades before the core message

## 30-second one-take

- 0–3s — full Korean peninsula centered
- 3–6s — gradual East Coast approach
- 6–9s — Start points ignite in rapid succession
- 9–19s — participant routes draw slowly together while the camera pulls back and rotates
- 19–22s — routes reach one West Coast Finish; restrained symbolic Finish pulse
- 22–26s — camera descends toward the West Coast horizon
- 26–30s — Finish light clears; core message remains over sunset tone

## Core message

```text
모두의 라이딩이 한 장소에서 마무리되며,
현장은 축제가 되고 기억은 영원이 됩니다.
```

## Data authority

- coastline: `assets/vector/korean_peninsula_precise.svg`
- South Korea terrain: Copernicus GLO-30 based South Korea Hero Terrain v0.2
- peninsula surface: ESA WorldCover-informed full-peninsula texture
- route topology: actual-road participant-route data
- Finish coordinate: current west-coast visual placeholder only

## QA keyframes

- 1.5s — full peninsula / seam inspection
- 4.5s — East Coast dawn approach
- 7.2s — dawn Start cascade
- 12.0s — participant journeys / daylight transition
- 18.9s — evening Finish arrival
- 21.0s — Finish pulse / sunset
- 24.0s — West Coast descent
- 27.5s — core message
- 29.5s — final hold
