# Scene 05 — Final Storyboard & Shot Design v1.0

Scene 05는 프로토타입 검증 장면이 아니라 본편에 그대로 투입 가능한 완성형 Master Scene으로 제작한다.

## Single claim

> **여러 해안에서 출발하고, 각자의 길을 지나, 하나의 피니시에 모여, 개인 기록으로 남긴다.**

## Final timeline — 12.8s

| Time | Beat | Visual goal | Light | Route state |
|---|---|---|---|---|
| 0.0–0.8 | SCALE | 한반도 전체를 거의 암전 상태에서 인지 | Night / east cyan | none |
| 0.8–2.2 | SOUTH KOREA HERO | 한 번의 느린 Dolly + Zoom으로 남한 Hero | Dawn cyan + low amber | none |
| 2.2–3.5 | DAWN START | 동·남동해안 육지 Start 7–9개 북→남 점등 | East low-angle dawn | route seeds only |
| 3.5–5.5 | MORNING CROSSING | 실제 도로처럼 꺾이는 서로 다른 Route 생성 | Dawn → Morning | Main Route + faint hints |
| 5.5–7.8 | DAYLIGHT NETWORK | 합류→공유→분기→재합류, 선택 가능한 네트워크 최대 | neutral daylight / terrain relief max | Main > Merged > Checkpoint > Hint |
| 7.8–10.2 | SUNSET CONVERGENCE | 3–4개의 큰 흐름으로 정리되어 서해 Finish 수렴 | West amber/orange/rose | Finish > Convergence > Main |
| 10.2–11.6 | PERSONAL RECALL | 전체 망이 가라앉고 개인 Route 하나 회수 | sunset afterglow | one personal route |
| 11.6–12.8 | MATCH CUT | 동해 Start node가 화면 전체 원형광으로 확대, Scene 06 일출 태양과 연결 | afterglow → dawn sun | route absorbed into start |

## Camera

- Opening camera: 한반도 전체가 읽히는 동쪽 30–40° 사선 상공.
- Main camera move: 0.8–2.2초 South Korea Hero Dolly + Zoom 한 번.
- Scene 06 handoff에서는 두 번째 큰 3D 카메라 이동을 쓰지 않는다.
- 선택된 Start node의 screen-space 원형광 확대를 이용해 Scene 06 실제 일출 태양과 match cut한다.

## Route hierarchy

### Main Route
- 5–6 representative journeys.
- Route Gold #ffd166.
- Actual-road-like turns and detours; no decorative Bezier arcs.

### Merged Segment
- Real shared-road sections or visually verified shared trunks.
- Thicker common line while multiple journeys share the section.
- Brief brightness rise on merge, stable during shared travel, then split again.

### Road Hint
- Faint land-road structure only during daylight.
- Must never read as circuitry, HUD, or game map.

### Checkpoint
- Only selected merge/split/region-discovery points.
- No ranking/score/A-B-C labels in the main deck.

## Lighting lock

### Dawn
- Deep navy/cyan atmosphere.
- Pale amber east horizon.
- East low directional light and long mountain shadows.
- Visual priority: Start nodes.

### Daylight
- Neutral blue-gray atmosphere.
- Terrain mountain/valley/plain relief at maximum readability.
- Visual priority: Main Route and Merged Segment.

### Sunset
- West amber → orange → rose.
- West low directional light and ocean reflection.
- East side cooler/darker.
- Visual priority: Finish and convergence routes.

## Terrain / material

- Geometry: Copernicus GLO-30 South Korea Hero Terrain v0.2.
- Coastline visual authority: `korean_peninsula_precise.svg`.
- Vertical exaggeration: 1.5x.
- Use actual DEM normals + grazing light; do not paint fake mountain chains.
- Use low-saturation forest/earth/stone surface and derived terrain maps.
- Route graphics remain visually separate from the realistic terrain.

## Typography

No explanatory copy before the scene visually communicates the experience.

The full claim appears only near the finish climax:

> **여러 해안에서 출발하고, 각자의 길을 지나, 하나의 피니시에 모여, 개인 기록으로 남긴다.**

Two lines, lower-left safe area, then removed before Scene 06 match cut.

## Final QA gate

- Dawn / Daylight / Sunset are clearly different in still frames.
- 7–9 starts are on South Korea east/east-southeast coastal land.
- Multiple journey choices are immediately legible.
- At least two merge/shared/split structures are visibly understandable.
- Road Hint does not look like a circuit board.
- Daylight terrain clearly shows eastern mountainous relief and western lowlands.
- West Finish is the scene climax.
- After climax there is a short still/quiet beat.
- Personal Route recall naturally leads to Scene 06 Start.
- 1920×1080, offline, reduced-motion/static fallback, Chrome/Safari/Edge target.

## Current asset decision

Reusable: terrain, coastline, geographic coordinate pipeline, terrain-height sampling, real-road source topology, Three.js/GSAP runtime foundation.

Not reusable as final art: v0.2 prototype composition/keyframes. They are technology proof only and are replaced by the final staging defined here.
