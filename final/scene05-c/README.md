# SSKR Scene 05 C — 2D Ocean Texture Study v0.1

Scene 05 C is a visual experiment branched from the accepted Scene 05 B v3.8.4 line.

## Purpose

Test whether the sea around the Korean Peninsula can read more like a premium aerial 2D texture while preserving the exact accepted geography and route choreography.

Reference qualities to reproduce in HTML/WebGL:

- rich deep-blue ocean body
- subtle micro-ripple texture
- restrained cool-white surface reflection
- translucent teal / aqua shallow-water coloration around the coastline
- no visible cloud layer
- no obvious synthetic sine bands
- no large 3D waves

## Hard constraints

The following are inherited unchanged from B v3.8.4:

- canonical coastline authority: `assets/vector/korean_peninsula_precise.svg`
- South terrain geometry and relief
- full-peninsula surface material
- participant-route data and topology
- start/checkpoint/finish data
- 0–22s camera and route choreography
- 22–30s three-still finale sequence
- closing copy and timing

C v0.1 changes only the ocean rendering and cloud visibility.

## Ocean treatment

- retain the existing terrain-bound `coast_shallow.png` data
- flatten the ocean mesh displacement to a near-zero cue
- use layered procedural 2D noise for surface texture
- use slow fine ripple interference only for highlight breakup
- strengthen shallow-water color as a translucent teal gradient rather than a neon coastline
- keep reflection flecks cool, sparse and screen-light rather than bloom-heavy
- keep the existing time-of-day color progression

## Cloud policy

Both cloud systems are disabled in C:

1. legacy sprite cloud group
2. photographic cloud planes

The photographic sky environment remains available; only clouds are removed.

## Branch

`feature/scene05-c-ocean-texture-v01`

Base:

`feature/scene05-v384-three-still-finale`

C is an isolated experiment. Scene 05 B files and its branch remain untouched.
