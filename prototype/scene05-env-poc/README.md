# Scene 05 ENV POC — bundled

Purpose: validate a production-style environment rendering path before touching Scene 05 B v3.4.

This POC deliberately excludes Route, Node, Fireworks, and the legacy sprite-cloud/ocean shaders.
It keeps only:
- SSKR South Korea DEM terrain/albedo
- Takram precomputed atmospheric scattering
- Takram volumetric clouds
- Dawn / Day / Sunset sun directions
- a slow inspection camera

Dependencies are installed and bundled at build time. The browser receives a single `app.js`; it does not resolve npm modules or CDN import graphs at runtime.

Build:
```bash
npm install
npm run build
```

The deployment workflow copies the finished POC under the existing Scene 05 Pages artifact as `/env-poc/`, so the v3.4 root remains unchanged.
