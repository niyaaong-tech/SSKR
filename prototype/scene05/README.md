# SSKR Scene 05 — Journey Map Prototype v0.1

Standalone 1920×1080-oriented Three.js prototype for the master journey-map scene.

## Production basis

- Terrain: `assets/scene05/south_korea_hero_v0.2/terrain_lod.glb`
- Coastline authority: `assets/vector/korean_peninsula_precise.svg`
- Route topology: real OpenStreetMap motorway/trunk/primary/secondary network
- Route placement: terrain-following 3D samples generated from the same AEQD/DEM coordinate space as the terrain mesh

## Visual rules implemented

- Whole peninsula overview → one slow South Korea Dolly/Zoom
- 9 East/East-Southeast coastal start reference nodes, South Korea only
- 5 representative real-road journeys; Homigot route omitted in v0.1 because its major-road snap exceeded the visual QA threshold
- Roads bend across actual road topology rather than decorative Bezier arcs
- Overlapping real-road sections naturally create merge / shared-trunk / split / rejoin behavior
- One generic West Coast finish visual placeholder
- Dawn → daylight → sunset lighting transition
- Ending selects one eastern start and Dollies toward it for the Scene 06 handoff

## Policy

The start references and west finish are presentation placeholders, not confirmed event coordinates. Scene 05 is a cinematic visualization and does not replace the product policy of using external navigation.

## Build

The GitHub Action `Scene 05 Prototype v0.1` generates the terrain-following route JSON, bundles Three.js/GSAP with esbuild, copies the canonical terrain/SVG assets, runs a headless Chromium visual smoke test, and uploads a portable static build artifact.

Press `R` while viewing to restart the animation.
