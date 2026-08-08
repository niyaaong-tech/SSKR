# SSKR Scene 05 — Journey Map Prototype v0.2

Standalone 1920×1080-oriented Three.js prototype for the master journey-map scene.

## Production basis

- Terrain: `assets/scene05/south_korea_hero_v0.2/terrain_lod.glb`
- Coastline authority: `assets/vector/korean_peninsula_precise.svg`
- Route topology: real OpenStreetMap motorway/trunk/primary/secondary network
- Route placement: terrain-following 3D samples generated from the same AEQD/DEM coordinate space as the terrain mesh

## Visual rules implemented

- Whole peninsula overview → one slow South Korea Dolly/Zoom
- 9 East/East-Southeast coastal start reference nodes, South Korea only
- 5 representative real-road journeys; Homigot route remains a visible Start node but is omitted from the representative route set because its major-road snap exceeded the visual QA threshold
- Roads bend across actual road topology rather than decorative Bezier arcs
- Overlapping real-road sections naturally create merge / shared-trunk / split / rejoin behavior
- One generic West Coast finish visual placeholder
- Dawn → daylight → sunset lighting transition
- Ending selects one eastern start and Dollies toward it for the Scene 06 handoff

## v0.2 visual-quality changes

- Terrain readability is increased by grazing key light, cool rim light, weak fill, reduced fog density, and a slightly brighter low-saturation terrain material. The DEM geometry and 1.5× vertical exaggeration remain unchanged.
- Hero camera is lowered slightly so real relief reads without inventing mountains.
- Final East-start Dolly stops farther/higher than v0.1 so the current 480-wide terrain LOD does not expose coarse polygon facets.
- CI installs Noto CJK fonts before visual QA so Korean presentation copy is captured correctly.
- QA now captures four useful beats: South Korea reveal, full route network, finish/statement, and Scene 06 handoff framing.
- CI also packages a reproducible single-file standalone HTML in addition to the normal portable folder build.

## Policy

The start references and west finish are presentation placeholders, not confirmed event coordinates. Scene 05 is a cinematic visualization and does not replace the product policy of using external navigation.

## Build / QA

The GitHub Action `Scene 05 Prototype v0.2` generates the terrain-following route JSON, bundles Three.js/GSAP with esbuild, copies the canonical terrain/SVG assets, runs headed Chromium under Xvfb for real WebGL QA, captures four keyframes, packages a single-file standalone HTML, and uploads the portable build artifact.

Press `R` while viewing to restart the animation.
