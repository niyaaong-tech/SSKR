# SSKR Scene 05 B — 30s Journey Choreography v3.5

This is the revised production-candidate B version of Scene 05.

Scene 05 A v1.8 remains accepted and untouched under `final/scene05/`.

## Visual target

> Reality in structure, Art in appearance.

The scene should read as a cinematic aerial landscape of real Korean terrain rather than a GIS render or game board. v3.5 focuses first on choreography and narrative clarity, before another visual-asset pass.

Priority:

1. clear journey storytelling
2. one continuous cinematic camera move
3. real terrain / route credibility
4. restrained presentation graphics
5. later visual-art improvements to surface, sky and sunset assets

## 30-second one-take

The entire scene is one continuous virtual-camera shot:

- 0–3s — Korean peninsula centered in frame
- 3–6s — gradual approach toward the north/mid East Coast of South Korea
- 6–9s — East Coast Start points ignite in rapid succession, with a wider framing than previous versions
- 9–19s — no single hero Route; complete participant journeys begin with short offsets and draw slowly for about ten seconds while the camera pulls back and rotates
- 19–22s — routes reach one West Coast Finish within one beat; a symbolic Finish/festival light pulse appears and daylight begins warming into sunset
- 22–26s — camera descends and lowers its pitch toward the West Coast sunset horizon
- 26–30s — fireworks are removed; the sunset color settles and the core message is revealed in the center

There are no editorial cuts inside the scene.

## Core message

```text
모두의 라이딩이 한 장소에서 마무리되며,
현장은 축제가 되고 기억은 영원이 됩니다.
```

## Removed from the previous 60-second structure

- hero Route chase
- separate representative Route before the participant journeys
- daylight network-flight chapter
- checkpoint reaction showcase
- convergence-only route chapter
- blue-hour reframe
- firework launches and firework finale

## Retained systems

- canonical Korean peninsula / South Korea terrain geometry
- Copernicus DEM-based relief
- ESA WorldCover-informed terrain texture
- real-road route graph and complete participant journeys
- ocean shader
- simple atmospheric fog / color progression
- lightweight cloud framing
- Finish festival light cluster, used only as a restrained symbolic light event

## Data authority

- coastline: `assets/vector/korean_peninsula_precise.svg`
- terrain: Copernicus GLO-30 based South Korea Hero Terrain v0.2 / final UV rebuild
- surface: ESA WorldCover-informed texture pass
- route topology: actual-road participant-route data
- finish coordinate: current west-coast visual placeholder only

## QA keyframes

- 0.0s — peninsula centered
- 4.5s — East Coast approach
- 7.2s — Start cascade
- 12.0s — participant journeys in progress
- 18.9s — near-simultaneous Finish
- 21.0s — Finish light pulse / sunset transition
- 24.0s — low West Coast sunset approach
- 27.5s — core message reveal
