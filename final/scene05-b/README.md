# SSKR Scene 05 B — Resource Polish Pass 1 v3.7

This pass keeps the accepted v3.5 choreography and v3.6 foundation corrections, then raises visible quality with lightweight photographic atmosphere resources rather than a heavy geospatial renderer.

Scene 05 A v1.8 remains accepted and untouched under `final/scene05/`.

## v3.7 scope

1. photographic dawn / sunset sky resources
2. real-photo-derived lightweight cloud veil
3. explicit cinematic dawn grade through the Start cascade
4. softer sea motion and sunset reflection
5. restrained Start / Finish presentation FX
6. no Takram or other large runtime environment system

## Sky resources

Build-time CC0 sources from Poly Haven:

- `Qwantani Dawn (Pure Sky)` — dawn / East Coast atmosphere
- `Industrial Sunset (Pure Sky)` — West Coast evening atmosphere

The large source panoramas are build inputs only. The deployed scene uses compressed 2048×1024 presentation derivatives and a small transparent cloud veil derived from the sunset panorama.

## Atmosphere behavior

- 0–9s — cool photographic dawn atmosphere; the Start cascade remains visibly pre-daylight
- 9–12s — dawn camera grade recedes as participant routes launch
- 12–15s — neutral daylight emphasizes terrain and Route travel
- 15–19s — sunset resource returns gradually
- 19–26s — sunset becomes the dominant horizon environment while the camera descends west
- 26–30s — cloud veil recedes so the core message and sunset remain clean

The old canvas-painted cloud sprites are disabled in v3.7.

## Sea polish

The lightweight existing ocean remains, but its art treatment is softened:

- reduced high-frequency procedural shimmer
- broader low-frequency visual rhythm
- darker dawn/day/sunset palette
- broader and less game-like warm sunset reflection
- v3.6 single-coastline authority remains unchanged

## FX polish

- Start pulses keep their rapid-cascade timing but use smaller ring/glow weight
- Finish halo remains symbolic rather than explosive
- fireworks remain removed
- Route choreography remains unchanged

## 30-second one-take

- 0–3s — full Korean peninsula centered
- 3–6s — East Coast dawn approach
- 6–9s — Start points ignite in rapid succession under dawn grade
- 9–19s — participant routes cross the country as dawn becomes day, then late afternoon
- 19–22s — near-simultaneous West Coast Finish in evening light
- 22–26s — low West Coast sunset approach
- 26–30s — core message over photographic sunset

## Core message

```text
모두의 라이딩이 한 장소에서 마무리되며,
현장은 축제가 되고 기억은 영원이 됩니다.
```

## Data / resource authority

- coastline: `assets/vector/korean_peninsula_precise.svg`
- terrain: Copernicus GLO-30 based South Korea Hero Terrain v0.2
- surface: ESA WorldCover-informed full-peninsula material
- sky: Poly Haven CC0 pure-sky photographic resources, processed at build time
- route topology: actual-road participant-route data

## QA result

Feature-branch Visual QA passed after direct frame review:

- 7.2s — darker/cooler dawn Start
- 12.0s — daylight recovered cleanly for Route travel
- 18.9s — evening Finish retained
- 27.5s — photographic sky/horizon visible behind the core message

Current status: **Resource Polish QA Candidate — ready for main deployment check**.
