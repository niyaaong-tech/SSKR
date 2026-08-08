# South Korea Hero Terrain v0.1 — provisional

Actual terrain generated from Copernicus DEM GLO-30 for Scene 05.

This is a real DEM-derived development asset, but it is **not the final geographic silhouette** yet.

- Actual mountain/elevation source: Copernicus DEM GLO-30
- Vertical exaggeration: 1.5x
- Web mesh: `terrain_lod.glb`
- Height/normal/albedo/hillshade/slope textures included
- Current land/ocean separation: provisional elevation threshold for QA
- Final coastline: must be replaced by the project canonical `korean_peninsula_precise.svg` after verified SVG↔WGS84 georeferencing
- Raw/derived GeoTIFF remains in the workflow artifact and is intentionally not committed here

Do not treat this v0.1 silhouette as the final map master. The purpose of this version is to verify that the real Korean mountain relief can be built and used in WebGL.
