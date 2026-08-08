# Scene 05 B — Extended One-Take Production Plan v2.0

Status: production implementation start / 2026-08-08

## 1. Goal

Scene 05 B is a roughly 60-second cinematic one-take version of the Journey Map.

It does not replace the accepted Scene 05 A v1.8 yet. A remains the stable production master while B is developed and reviewed in a separate build path.

The revised priority is:

1. art direction and visual satisfaction
2. real Korean terrain credibility
3. cinematic oblique aerial photography feeling
4. route storytelling on top of that landscape

Core production principle:

> Reality in structure, Art in appearance.

The terrain, coastline and road topology remain data-grounded. The visible result must feel like a living aerial landscape rather than a GIS render, game board or technical terrain demo.

## 2. Visual target

The current aerial reference is used for its visual language only:

- oblique high-altitude camera feeling
- deep ocean with tonal variation
- coastal water separation
- cloud framing and parallax
- atmospheric depth
- terrain that reads as living land, not a flat map

The internal route pattern in that reference is explicitly not a route-design reference.

## 3. One-take rule

The one-take rule applies inside each presentation Scene.

Scene 05 B must not use editorial cuts, camera resets or teleporting views. Instead one virtual camera follows one continuous path while its composition changes aggressively through position, target, height and a restrained FOV shift.

Camera flow:

```text
High altitude overview
→ South Korea dive
→ East coast descent
→ coastal truck across Start nodes
→ inland Route chase
→ crane reveal to national network
→ diagonal network flight
→ westward sweep
→ Finish descent
→ sunset hold
→ blue-hour reframe
→ tilt up into festival fireworks
```

Camera roll remains prohibited. Dynamism comes from travel, elevation, look target and scale.

## 4. 60-second sequence

| Time | Beat | Camera | Environment / graphics |
| --- | --- | --- | --- |
| 0–6s | High Altitude Approach | forward + descent toward South Korea | near-darkness, thin cloud layers, first eastern horizon light |
| 6–12s | East Coast Descent | lower oblique aerial + long coastal truck | east/southeast Starts ignite north→south |
| 12–20s | Route Chase | camera follows one representative route inland | terrain relief, first routes, restrained road context |
| 20–28s | Crane Reveal | rise away from followed route | morning→day, the route is revealed as one of many choices |
| 28–36s | Network Flight | diagonal flight over the network | strongest daylight terrain, merge/split/checkpoints |
| 36–44s | Westward Sweep | camera, routes and lighting all turn west | daylight→sunset, network simplifies into major flows |
| 44–49s | Finish Descent | descend toward west-coast Finish | sunset sea reflection, final convergence |
| 49–52s | Sunset Hold | almost still after long movement | sun falls below horizon, route/road context settles |
| 52–56s | Blue-Hour Reframe | slowly compose more horizon and sky | orange→violet→deep blue, Finish festival lights remain |
| 56–60s | Festival Fireworks | follow first launch with a tilt up | realistic ordinary festival fireworks, smoke and ocean reflection |

## 5. Environment production targets

### Terrain

- Reuse Copernicus GLO-30 terrain and canonical coastline assets.
- Keep geographic structure authoritative.
- Present terrain with cinematic, naturalistic forest / earth / rock / lowland values rather than satellite-map complexity.
- Atmospheric distance must separate near, mid and far relief.

### Ocean

The old single-color plane is not sufficient.

B v2.0 introduces a procedural ocean material with:

- low-frequency ripple movement
- deep-water tonal variation
- directional warm reflection during dawn/sunset
- cooler daylight response
- dark blue-hour/night response
- subtle highlight movement rather than visible game-water waves

### Clouds and atmosphere

- lightweight procedural cloud sprites around the frame and terrain bounds
- multiple depth layers for parallax
- very slow drift
- exponential fog / haze transition by time of day
- clouds should frame geography, not cover it

### Route graphics

- retain real-road-grounded route data
- route graphics remain separate from realistic landscape
- main route must dominate road context
- use a bright core plus low-opacity underglow rather than thick neon
- merges, splits and convergence communicate choice; decorative network density is not a goal

## 6. Ending

B does not use Personal Recall or Solar Corona.

The revised ending is:

```text
Sunset Finish
→ route and road context settle
→ blue hour
→ Finish festival lighting
→ ordinary realistic fireworks
→ final embers / smoke / dark West Sea
```

Fireworks are a visual metaphor for the finish festival, not a confirmed operational promise that the real event will include fireworks. Do not force branded firework colors, logo shapes or complex controlled patterns.

## 7. Implementation path

Scene A is preserved:

```text
final/scene05/   = accepted v1.8
```

Scene B is isolated:

```text
final/scene05-b/ = Extended One-Take Art Pass v2.0
```

B v2.0 implementation scope:

- 60-second GSAP master timeline
- continuous dynamic camera path with independent look target and FOV
- procedural ocean shader
- fog / atmospheric depth
- procedural cloud parallax
- dawn → day → sunset → blue hour → night transition
- route/node/checkpoint staged appearance and disappearance
- west Finish convergence
- lightweight procedural festival fireworks
- exact keyframe capture for visual QA

## 8. First QA frames

- 3.0s — High Altitude Approach
- 9.0s — East Coast Start Ignition
- 16.0s — Route Chase
- 24.0s — Crane Reveal
- 32.0s — Daylight Network Flight
- 40.0s — Westward Sweep
- 47.0s — Sunset Finish Descent
- 51.0s — Sunset Hold
- 55.0s — Blue Hour Reframe
- 58.5s — Festival Fireworks

## 9. Acceptance gate

B v2.0 passes only when:

- the terrain reads first as a believable Korean aerial landscape, not a map;
- ocean, clouds and haze create meaningful depth;
- the 60-second camera path feels like one continuous shot with multiple strong compositions;
- time of day changes physically through sky, haze, terrain and sea rather than only color grading;
- routes remain readable without turning the landscape into a circuit board;
- the final sunset, blue hour and fireworks feel like the completion of one day;
- full playback is more satisfying than any individual still frame.
