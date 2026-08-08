# SSKR Scene 05 — Final Journey Map v1.8

This is the production-target Scene 05 sample, not a prototype pass.

## Scene claim

> 여러 해안에서 출발하고, 각자의 길을 지나, 하나의 피니시에 모여, 개인 기록으로 남긴다.

## Visual sequence

1. Korea scale recognition in near-darkness
2. One deliberate Dolly + Zoom into South Korea
3. East/East-Southeast dawn starts
4. Morning route generation
5. Daylight route network with real terrain relief and continuous real-road context
6. Shared-road / merge / split structure
7. Sunset convergence to one west finish
8. Personal route recall
9. Start-node sun match cut for Scene 06

## Production assets

- Coastline authority: `assets/vector/korean_peninsula_precise.svg`
- Terrain source: Copernicus GLO-30 derived South Korea Hero Terrain v0.2
- Final mesh: UV-enabled 640-wide rebuild from the v0.2 height/land assets
- Terrain light: analytical DEM-normal dawn / daylight / sunset textures
- Road Hint: complete queried OSM motorway / trunk / primary way topology baked only into the daylight terrain at low contrast
- Main routes: real-road-source, terrain-following route data
- Merged segments: sampled shared real-road topology where available

## Art rules

- Reality belongs to terrain/ocean.
- Graphic abstraction belongs to Main Route / Merged Segment / checkpoints.
- Dawn / Daylight / Sunset must be visibly different without captions.
- Road Hint must read as optional route structure, never circuitry or a game HUD.
- The scene must read as journey/choice/completion, never racing/speed competition.
- UI is subordinate to the landscape and route story.
- Scene 06 handoff uses a screen-space Start-node sun match cut rather than a second large camera move.

## Final QA keyframes

The build captures six exact GSAP timeline states:

- 1.0s — scale
- 2.9s — dawn starts
- 6.7s — daylight network
- 9.65s — sunset finish / statement
- 10.85s — personal route recall
- 12.62s — Scene 06 match-cut orb

These keyframes are review aids only. Final acceptance is based on the full 12.8-second playback and the Scene 05 Final Storyboard QA gate.
