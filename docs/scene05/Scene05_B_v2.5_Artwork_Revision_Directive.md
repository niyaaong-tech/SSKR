# Scene 05 B v2.5 — Artwork Revision Directive

Status: implementation directive / 2026-08-08

## 1. Revision trigger

Scene 05 B v2.4 is retained as the 40-second journey-first previs baseline, but three visual defects block further art approval:

1. peninsula integrity failure — North Korea can disappear into sea and land holes can appear;
2. route choice reads too simple — the scene implies a small number of prescribed courses instead of rider-led route discovery;
3. festival finale framing failure — the final fireworks can burst outside the visible frame.

The map-rendering strategy therefore changes from 3D-terrain-led presentation to a 2.5D texture-led presentation.

## 2. New visual objective

> Preserve one geographically credible Korean stage, then let camera motion, route choice, time-of-day and convergence create the spectacle.

The terrain itself no longer has to carry the emotional beauty of the scene.

Priority order:

1. peninsula / land-mask integrity;
2. readable rider choice and route discovery;
3. strong continuous one-take camera staging;
4. sunrise → day → sunset → festival-night progression;
5. ocean / atmosphere / texture polish;
6. shallow 3D relief only where it improves depth.

## 3. Map rendering rule — texture first, relief second

### Master land surface

- `assets/vector/korean_peninsula_precise.svg` remains the single coastline / silhouette authority.
- A full-peninsula RGBA texture is generated from the canonical SVG.
- The generated texture is the always-present land underlay.
- Outside the canonical land mask is transparent; the ocean remains a separate shader.
- The land underlay is not allowed to contain internal alpha holes.
- North Korea must remain visible as land in every full-peninsula / approach composition.

### 2.5D composition

- The full-peninsula texture sits on a shallow horizontal plane.
- Existing South Korea Copernicus DEM geometry is retained only as a low-profile relief overlay.
- The 2D land texture is always underneath the DEM overlay so mesh gaps, clipping defects or mask errors can never expose ocean inside the country.
- South Korea may receive stronger albedo / hillshade detail; North Korea may be quieter and less detailed, but it cannot be deleted or recolored as water.

### Surface styling

- South Korea texture: real source albedo + real hillshade influence, restrained cinematic grading.
- North Korea texture: subdued natural green / earth texture generated inside the canonical land mask; no invented operational detail is implied.
- No satellite-map UI styling, borders, labels or political boundary lines.

## 4. Route storytelling rule — choice before prescribed course

The viewer should understand:

> many Starts exist, many roads remain possible, each rider composes a different crossing, and all journeys eventually converge west.

Three route layers are required.

### A. Road possibility layer

- Use the curated OSM major-road source already stored in the project.
- Render as a faint neutral network during the middle daylight chapter only.
- It must read as available road structure, not as a UI grid.
- It fades before the Finish chapter.

### B. Rider choice layer

- Add multiple secondary journey paths derived from the real-road-grounded Main Routes.
- Secondary paths are cinematic route-choice visualizations, not navigation recommendations.
- They branch, drift toward neighboring route corridors, rejoin, and separate again.
- They remain thinner and dimmer than the five Main Routes.

### C. Main / convergence layer

- Five Main Routes remain dominant enough to explain east→west travel.
- Only late in the scene do they visually simplify into several major westward flows.
- Final convergence must feel like many self-selected journeys reaching one Finish, not one official fixed course.

## 5. 40-second sequence lock

The v2.4 timing structure remains the base:

| Time | Beat | v2.5 role |
| --- | --- | --- |
| 0–3s | Korea Establish | full peninsula texture integrity is clearly visible |
| 3–7s | East Coast Starts | multiple Starts ignite over stable land |
| 7–12s | Route Chase | one rider journey becomes tangible |
| 12–17s | Encounter / Merge | secondary choice routes enter, split and rejoin |
| 17–22s | Crane Reveal | faint real road possibility network is revealed |
| 22–28s | Westward Network Flight | maximum feeling of rider-led route freedom |
| 28–33s | Convergence / Finish Descent | possible-road layer fades; journeys simplify westward |
| 33–36s | Sunset Arrival | short arrival punctuation |
| 36–40s | Festival Night | safe-frame fireworks; horizon remains visible |

No landscape-appreciation hold is reintroduced.

## 6. Fireworks safe-frame rule

- Firework origins are lowered relative to v2.4.
- Camera tilt begins before the first burst.
- Final fireworks camera uses a wider FOV.
- Every primary burst must remain within the 16:9 title-safe frame.
- The frame must retain some Finish / horizon context; the camera does not chase fireworks into empty sky.

## 7. QA gates

### Geography QA

- full peninsula visible as contiguous land at Establish;
- no inland transparent / ocean holes;
- Jeju and visible islands remain land;
- ocean never replaces North Korea.

### Route QA

- viewer can identify more possible paths than the five dominant Main Routes;
- the middle chapter communicates branch / merge / alternative choice;
- faint road network remains subordinate to gold rider journeys;
- the result does not read like a fixed official course map.

### Finale QA

- first launch is visible from the Finish area;
- all main bursts stay on-screen;
- final burst is fully readable without clipping;
- horizon / Finish context remains visible below the fireworks.

## 8. Version policy

- A v1.8 remains the historic accepted technical master.
- B v2.4 remains the journey-first previs reference.
- B v2.5 is the first 2.5D texture-led artwork candidate.
- Do not promote v2.5 to final art until geography, route-choice and fireworks QA all pass.
