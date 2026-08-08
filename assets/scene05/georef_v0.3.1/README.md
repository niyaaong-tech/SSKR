# Scene 05 Georef Diagnostic v0.3.1

Status: **KEEP_V02_SEED**

This diagnostic resolves the 13 reference landmarks to actual OpenStreetMap `natural=coastline` geometry before comparing them with the canonical SSKR SVG boundary.

- Seed error mean: **3.691 km**
- Seed error max: **8.201 km**
- Affine inliers: **8 / 13**
- Leave-one-out affine error mean: **1.104 km**
- Leave-one-out affine error max: **1.567 km**
- Max sampled correction displacement: **16.813 px**

The canonical `korean_peninsula_precise.svg` remains the final coastline. OSM is used only to resolve real-world geographic control coordinates. Control points are not confirmed SSKR event spots.
