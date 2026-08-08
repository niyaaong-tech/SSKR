# Scene 05 B — One-Take Production Plan / v2.4 Revision

Status: 40-second journey-first reconstruction / 2026-08-08

## 1. Goal reset

The previous 60-second B plan over-allocated runtime to the idea that the Korean terrain itself should provide a cinematic beauty showcase. That target is no longer a production requirement.

Scene 05 B is now a roughly 40-second cut-free virtual-camera sequence whose job is to communicate the SSKR journey clearly and dynamically:

> Multiple east/east-southeast coastal Starts awaken, individual Routes move inland, encounter / merge / split, the network expands to national scale, and the flows converge on one west-coast Finish before the scene closes in blue hour and festival fireworks.

The current priority is:

1. journey readability and animation density
2. continuous dynamic one-take camera choreography
3. credible Korean geography and spatial scale
4. sunrise → daylight → sunset → night time progression
5. atmosphere / ocean / clouds as depth support

The terrain is no longer expected to create visual wonder by itself.

Core production principle:

> Terrain = credibility. Camera + Route + Time + Finish = spectacle.

## 2. What is explicitly removed

The following goals from the 60-second plan are removed:

- dedicated terrain-beauty hold shots
- Morning Relief Reveal as a standalone beat
- poster-frame QA requiring the Korean terrain itself to look like premium aerial photography
- static daylight landscape appreciation time
- any camera pause whose main purpose is only to admire relief or coastline

Real terrain still matters. Copernicus DEM, the canonical coastline and real-road-grounded route structure remain the geographic foundation.

## 3. One-take rule

The one-take rule applies inside Scene 05.

There are no editorial cuts, camera resets or teleporting views. One virtual camera continuously changes position, target, altitude and restrained FOV.

The camera must remain active. A one-take is not a static master shot.

Camera flow:

```text
High altitude establish
→ dive to East Coast
→ coastal truck across Start nodes
→ inland Route chase
→ checkpoint / route encounter
→ merge / split
→ crane reveal
→ national network flight
→ westward sweep
→ Finish descent
→ sunset horizon
→ blue-hour reframe
→ tilt into festival fireworks
```

Camera roll remains prohibited. Dynamism comes from travel, elevation, look target and scale.

## 4. 40-second master sequence

| Time | Beat | Camera / composition | Key event |
| --- | --- | --- | --- |
| 0–3s | KOREA ESTABLISH | high-altitude approach immediately bending toward the east | Korean spatial context + dawn begins |
| 3–7s | EAST COAST STARTS | descend and truck along the east/east-southeast coast | 7–9 Starts ignite north→south |
| 7–12s | ROUTE CHASE | follow one representative real-road-grounded Route inland | first Route grows + first checkpoint reaction |
| 12–17s | ENCOUNTER & MERGE | continue moving through the interior while other Routes enter frame | another Route appears, shared movement / merge logic becomes visible |
| 17–22s | CRANE REVEAL | rise away from the followed Route | one journey becomes a national multi-route structure |
| 22–28s | WESTWARD NETWORK FLIGHT | diagonal flight over the active network toward the west | route creation / crossings / merges at maximum narrative density; daylight starts warming |
| 28–33s | CONVERGENCE / FINISH DESCENT | westward sweep transitions directly into lower Finish approach | network simplifies into a few major flows and converges |
| 33–36s | SUNSET ARRIVAL | low west-coast horizon composition, movement slows but does not cut | last arrival, sun falls, Route hierarchy settles |
| 36–40s | FESTIVAL NIGHT | blue-hour reframe and upward tilt while horizon context remains | Finish lights + ordinary festival fireworks + final ember |

Target duration: approximately 40 seconds. A small technical tail up to about 40.5 seconds is acceptable for firework fade.

## 5. Visual-role hierarchy

### Terrain — credibility

- real DEM and canonical coastline remain authoritative
- terrain must read as a plausible Korean landmass at the required camera scale
- no dedicated beauty-showcase runtime
- no requirement that relief alone carries a scene

### Camera — motion and scale

- camera is the principal cinematic device
- every 3–6 seconds should produce a materially different composition without a cut
- camera movement must connect information states rather than wander decoratively

### Route / Checkpoint — story

- route creation, checkpoint encounter, merge / split and convergence are now the core middle-act events
- route graphics should remain subordinate to the landscape when inactive and become clear when they carry narrative meaning
- decorative network density is not a goal

### Time — emotional progression

- dawn = multiple departures
- daylight = journey / choice / expansion
- sunset = convergence / arrival
- blue hour + night = completion / festival

### Ocean / cloud / atmosphere — depth support

- these elements should create aerial scale, parallax and time-of-day continuity
- they are not separate showcase subjects

## 6. Ending

Personal Recall and Solar Corona remain removed.

The ending is:

```text
westward convergence
→ sunset Finish arrival
→ sun below horizon
→ blue hour
→ Finish festival lights
→ ordinary fireworks
→ ember / dark West Sea
```

Fireworks are a visual metaphor for finish-festival celebration, not a confirmed operational promise for the real event.

## 7. Implementation path

Stable Scene A remains preserved:

```text
final/scene05/ = accepted v1.8 source
```

Scene B remains isolated:

```text
final/scene05-b/ = one-take production candidate
```

v2.3 is treated as a 60-second 3D previs baseline.

v2.4 implementation scope:

- rebuild the GSAP master timeline to ~40s
- retain the v2.3 geography / material / ocean / cloud / route rendering work
- remove terrain-appreciation holds
- bring checkpoint interaction and merge logic into the former relief-showcase time
- compress establishing and daylight overview beats
- preserve dynamic camera continuity through all phases
- compress sunset → blue hour → fireworks without reversing the day
- update exact-timeline QA keyframes and duration gate

## 8. v2.4 QA frames

- 2.0s — Korea Establish / Dawn approach
- 5.2s — East Coast Start ignition
- 9.5s — Route Chase
- 14.0s — Encounter / Merge
- 19.5s — Crane Reveal
- 25.0s — Westward Network Flight
- 30.5s — Finish Descent / Convergence
- 34.5s — Sunset Arrival
- 37.2s — Blue Hour / first festival action
- 39.3s — Fireworks finale

## 9. Acceptance gate

B v2.4 passes the structural gate only when:

- total runtime is approximately 40 seconds;
- there is no dedicated terrain-beauty hold;
- the shot remains cut-free and camera motion feels continuous;
- multiple Starts are immediately understandable;
- the middle act contains visible Route chase + checkpoint + encounter / merge + national expansion;
- east → interior → west spatial travel is readable;
- dawn → day → sunset → blue hour / night progression remains clear despite compression;
- convergence reads as the climax before the festival ending;
- no section feels like a static terrain demo;
- full playback is more important than the beauty of an isolated terrain still.
