# SSKR Scene 05 B — Three-Still Sunset Finale v3.8.4

This pass keeps the accepted v3.8.3 0–22 second map/route choreography and handoff architecture, and changes only the final visual sequence and closing copy according to the approved user direction.

Scene 05 A v1.8 remains accepted and untouched under `final/scene05/`.

## v3.8.4 scope

1. retain the complete accepted 0–22s dawn/map/participant-route choreography
2. retain `assets/vector/korean_peninsula_precise.svg` as the single coastline authority
3. replace the former single finale plate with three user-provided stills
4. show still 01 first, then smoothly crossfade to still 02 after 3 seconds
5. smoothly crossfade from still 02 to still 03 two seconds later
6. keep the centered closing statement fixed while the stills change
7. keep the synthetic finale sun disabled
8. keep procedural sunset reflection disabled
9. preserve the 30-second total runtime

## v3.8.4 finale assets

Repository directory:

`assets/scene05/finale_v384_stills/`

- `finale_still_01_v384.webp` — sunset landscape, first finale still
- `finale_still_02_v384.webp` — riders celebrating at sunset, second finale still
- `finale_still_03_v384.webp` — evening rider festival, third finale still

The files are normalized WebP working copies of the three attachments supplied for this pass. Their sequence and narrative role are fixed by the user request.

## Peninsula / coastline

The geographic source remains unchanged:

- coastline authority: `assets/vector/korean_peninsula_precise.svg`
- South terrain detail: Copernicus GLO-30 based South Korea Hero Terrain v0.2
- full-peninsula surface material: ESA WorldCover-informed custom surface pipeline
- route topology: actual-road participant-route data

No v3.8.4 finale work changes the coastline, terrain, road network or 0–22s route choreography.

## Finale architecture

The three-still layer stays outside the Three.js `EffectComposer`.

- `sunSprite` remains disabled
- procedural sunset reflection remains forced to zero
- the live HTML scene mark exits before the finale dominates
- the first still participates in the accepted map→finale handoff
- still crossfades use matched opacity tweens to prevent a black/brightness dip
- the centered closing copy reveals once and is not reanimated during either still transition

## 30-second one-take

- 0–3s — full Korean peninsula
- 3–6s — East Coast dawn approach
- 6–9s — Start-point cascade
- 9–19s — participant routes travel westward
- 19–22s — Finish convergence
- 21.72–22.20s — live HTML scene mark exits
- 22.16–23.80s — accepted map/aerial → finale handoff with still 01
- 23.65–24.20s — centered closing statement reveals once
- 22.16–25.16s — still 01 exposure window
- 25.16–25.88s — smooth still 01 → still 02 crossfade
- 25.88–27.16s — still 02 hold
- 27.16–27.88s — smooth still 02 → still 03 crossfade
- 27.88–30.00s — still 03 final hold

## Closing copy

```text
해질무렵 라이딩이 마무리되면,
현장은 축제가 되고 기억은 영원이 됩니다.
```

The copy remains fixed at the center while the three finale stills change behind it.

## QA

Mandatory finale captures:

- 22.4s — handoff start
- 23.4s — handoff resolve
- 24.4s — still 01 + fixed message
- 25.52s — still 01→02 crossfade
- 26.05s — still 02 hold
- 27.52s — still 02→03 crossfade
- 28.1s — still 03 hold
- 29.5s — final hold

Structural assertions require:

- map stage fully absent after handoff
- live HTML scene mark absent during finale
- still 01/02/03 opacity order matches the specified timing
- both crossfade midpoint frames contain both adjacent stills
- closing statement stays above the readability threshold throughout both transitions
- exact closing copy matches the approved wording
- synthetic sun invisible
- procedural sunset reflection disabled
- timeline remains 30 seconds
- coastline diagnostics remain clean

Status before main merge: **feature-branch automated QA + manual screenshot review required.**
