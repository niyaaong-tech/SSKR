# South Korea Hero Terrain v0.3 — EXPERIMENTAL / REJECTED

This build tested a quadratic control-point correction. It is **not** the production georeference.

## QA result

- South Korea / Natural Earth mean symmetric boundary distance: **8.93 km**
- Control-point leave-one-out CV mean: **4.06 km**
- Control-point leave-one-out CV max: **11.86 km**

## Decision

- Reject the quadratic regional warp because it over-corrects the canonical SVG.
- Keep **South Korea Hero Terrain v0.2** as the current canonical terrain/georeference base.
- Before any further correction, resolve each reference landmark to the nearest **actual coastline geometry** rather than using lighthouse/place center coordinates as coastline points.
- The next correction test must use only a small global affine/homography adjustment and must be accepted only when cross-validation improves without visible shape distortion.

The final coastline geometry remains the SSKR canonical `korean_peninsula_precise.svg`. Natural Earth is QA/reference only and never the final coastline.

Control points are georeferencing references only. They are **not** confirmed SSKR event Start/Checkpoint/Finish spots.
