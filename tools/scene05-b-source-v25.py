#!/usr/bin/env python3
from pathlib import Path

ROOT = Path.cwd()
src = ROOT / 'output' / 'scene05-b-v24.js'
out = ROOT / 'output' / 'scene05-b-v25.js'
text = src.read_text('utf-8')


def patch(old: str, new: str, label: str, count: int = 1):
    global text
    found = text.count(old)
    if found < count:
        raise SystemExit(f'{label}: expected >= {count}, found {found}')
    text = text.replace(old, new, count)


# ---------------------------------------------------------------------------
# Full-peninsula 2D texture underlay + shallow South Korea relief overlay.
# ---------------------------------------------------------------------------
patch(
"const terrainGroup = new THREE.Group();\nconst routeGlowGroup = new THREE.Group();",
"const peninsulaSurfaceGroup = new THREE.Group();\nconst terrainGroup = new THREE.Group();\nconst roadChoiceGroup = new THREE.Group();\nconst choiceRouteGroup = new THREE.Group();\nconst choiceGlowGroup = new THREE.Group();\nconst routeGlowGroup = new THREE.Group();",
'v25 groups')
patch(
"scene.add(terrainGroup, routeGlowGroup, routeGroup, seedGroup, mergedGroup, convergenceGroup, nodeGroup, checkpointGroup, cloudGroup, festivalGroup, fireworkGroup);",
"scene.add(peninsulaSurfaceGroup, terrainGroup, roadChoiceGroup, choiceGlowGroup, choiceRouteGroup, routeGlowGroup, routeGroup, seedGroup, mergedGroup, convergenceGroup, nodeGroup, checkpointGroup, cloudGroup, festivalGroup, fireworkGroup);",
'v25 scene group order')
patch(
"const routePairs = [];\nconst seedLines = [];",
"const routePairs = [];\nconst choiceRoutePairs = [];\nconst seedLines = [];",
'choice route array')
patch(
"let mergedNetwork = null;\nlet finishNode = null;",
"let mergedNetwork = null;\nlet roadChoiceNetwork = null;\nlet peninsulaSurface = null;\nlet peninsulaSurfaceBounds = null;\nlet finishNode = null;",
'v25 globals')

# Helpers for the projected texture grid and faint real-road possibility layer.
insert_anchor = "function vec(a) { return new THREE.Vector3(a[0], a[1], a[2]); }"
helpers = r'''function buildPeninsulaSurface(meta, texture) {
  const cols = meta.grid.cols, rows = meta.grid.rows;
  const positions = [];
  const uvs = [];
  const indices = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const p = meta.grid.positions[r * cols + c];
      positions.push(p[0], p[1], p[2]);
      uvs.push(c / (cols - 1), 1 - r / (rows - 1));
    }
  }
  for (let r = 0; r < rows - 1; r++) {
    for (let c = 0; c < cols - 1; c++) {
      const a = r * cols + c, b = a + 1, d = (r + 1) * cols + c, e = d + 1;
      indices.push(a, d, b, b, d, e);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeBoundingBox();
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const mat = new THREE.MeshBasicMaterial({ map: texture, transparent: true, alphaTest: .012, depthWrite: true, depthTest: true, fog: true });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.renderOrder = 1;
  peninsulaSurfaceGroup.add(mesh);
  peninsulaSurface = mesh;
  peninsulaSurfaceBounds = new THREE.Box3().setFromObject(mesh);
  return mesh;
}

function roadPossibilityFromHints(hints, maxSegments = 15000) {
  const raw = [];
  let total = 0;
  for (const h of hints || []) total += Math.max(0, (h.points || []).length - 1);
  const stride = Math.max(1, Math.ceil(total / maxSegments));
  let cursor = 0;
  for (const h of hints || []) {
    const pts = h.points || [];
    for (let i = 0; i < pts.length - 1; i++, cursor++) {
      if (cursor % stride) continue;
      raw.push(...pts[i], ...pts[i + 1]);
    }
  }
  const geo = new LineSegmentsGeometry();
  geo.setPositions(raw);
  const mat = new LineMaterial({ color: 0xc9c2aa, linewidth: .62, transparent: true, opacity: 0, depthTest: true, depthWrite: false });
  mat.resolution.set(stage.clientWidth, stage.clientHeight);
  const lines = new LineSegments2(geo, mat);
  lines.renderOrder = 5;
  roadChoiceGroup.add(lines);
  return lines;
}

'''
patch(insert_anchor, helpers + insert_anchor, 'v25 helpers')

# Add texture and projection metadata to the existing asset Promise.
patch(
"  loadTexture('./assets/coast_shallow.png'),\n  loadJSON('./assets/scene05_final_data_v1.json')\n]).then(([gltf, dawnTex, dayTex, sunsetTex, coastTex, data]) => {",
"  loadTexture('./assets/coast_shallow.png'),\n  loadTexture('./assets/peninsula_surface_v25.png'),\n  loadJSON('./assets/peninsula_surface_v25.json'),\n  loadJSON('./assets/scene05_final_data_v1.json')\n]).then(([gltf, dawnTex, dayTex, sunsetTex, coastTex, peninsulaTex, peninsulaMeta, data]) => {",
'v25 asset load')
patch(
"  coastTex.wrapS = THREE.ClampToEdgeWrapping;\n  coastTex.wrapT = THREE.ClampToEdgeWrapping;\n  oceanUniforms.uCoastMap.value = coastTex;",
"  coastTex.wrapS = THREE.ClampToEdgeWrapping;\n  coastTex.wrapT = THREE.ClampToEdgeWrapping;\n  oceanUniforms.uCoastMap.value = coastTex;\n  buildPeninsulaSurface(peninsulaMeta, peninsulaTex);",
'build peninsula surface')

# DEM is now shallow relief, not the land-coverage authority.
patch(
"  terrainGroup.add(dawnScene, dayScene, sunsetScene, nightScene);",
"  terrainGroup.add(dawnScene, dayScene, sunsetScene, nightScene);\n  terrainGroup.scale.y = .30;",
'shallow relief')

# Secondary rider-choice routes and real road possibility network.
route_anchor = "  for (const s of data.start_seeds) {"
choice_build = r'''  for (const r of (data.choice_routes || [])) {
    const glow = lineFromPoints(r.points, { color: 0xf1ad56, width: 2.8, opacity: 0, order: 6, depthTest: false });
    const core = lineFromPoints(r.points, { color: 0xffd58a, width: 1.05, opacity: 0, order: 7, depthTest: true });
    setProgress(glow, 0); setProgress(core, 0);
    choiceRoutePairs.push({ id: r.id, points: r.points, glow, core });
    choiceGlowGroup.add(glow); choiceRouteGroup.add(core);
  }
  roadChoiceNetwork = roadPossibilityFromHints(data.road_hints || []);

'''
patch(route_anchor, choice_build + route_anchor, 'choice route build')

# Initialise the new visual layers cleanly.
patch(
"  routePairs.forEach(p => {\n    p.core.material.opacity = 0; p.glow.material.opacity = 0;\n    setProgress(p.core, 0); setProgress(p.glow, 0);\n  });",
"  routePairs.forEach(p => {\n    p.core.material.opacity = 0; p.glow.material.opacity = 0;\n    setProgress(p.core, 0); setProgress(p.glow, 0);\n  });\n  choiceRoutePairs.forEach(p => {\n    p.core.material.opacity = 0; p.glow.material.opacity = 0;\n    setProgress(p.core, 0); setProgress(p.glow, 0);\n  });\n  if (roadChoiceNetwork) roadChoiceNetwork.material.opacity = 0;",
'choice init')

# Full peninsula establishes the spatial context; then camera dives into South Korea.
patch(
"  const establishPos = center.clone().add(new THREE.Vector3(diag * .19, diag * .54, diag * .66));",
"  const peninsulaCenter = peninsulaSurfaceBounds ? peninsulaSurfaceBounds.getCenter(new THREE.Vector3()) : center.clone();\n  const peninsulaSize = peninsulaSurfaceBounds ? peninsulaSurfaceBounds.getSize(new THREE.Vector3()) : size.clone();\n  const peninsulaDiag = Math.max(peninsulaSize.x, peninsulaSize.z);\n  const establishPos = peninsulaCenter.clone().add(new THREE.Vector3(peninsulaDiag * .19, peninsulaDiag * .58, peninsulaDiag * .70));",
'full peninsula establish pos')
patch(
"  tweenCamera(tl, 0.0, 1.35, establishPos, center.clone().add(new THREE.Vector3(diag * .035, 0, diag * .035)), 34.0, 'power1.inOut');",
"  tweenCamera(tl, 0.0, 1.35, establishPos, peninsulaCenter.clone().add(new THREE.Vector3(peninsulaDiag * .01, 0, peninsulaDiag * .01)), 36.0, 'power1.inOut');",
'full peninsula establish target')

# Bring the faint OSM road possibility layer and derived rider alternatives into the
# same moving composition. They peak only during the choice chapter.
encounter_marker = "  // 12–17s — ENCOUNTER & MERGE: other Routes enter the same moving composition; local interactions replace the old relief showcase."
choice_timeline = r'''  // v2.5 route freedom: faint real-road possibility + multiple rider-choice paths.
  if (roadChoiceNetwork) {
    tl.to(roadChoiceNetwork.material, { opacity: .075, duration: 1.0, ease: 'sine.out' }, 10.6)
      .to(roadChoiceNetwork.material, { opacity: .145, duration: 3.2, ease: 'sine.inOut' }, 13.0)
      .to(roadChoiceNetwork.material, { opacity: .115, duration: 6.0, ease: 'sine.inOut' }, 17.0)
      .to(roadChoiceNetwork.material, { opacity: .035, duration: 2.2, ease: 'sine.inOut' }, 25.5)
      .to(roadChoiceNetwork.material, { opacity: 0, duration: 1.3, ease: 'sine.in' }, 28.2);
  }
  choiceRoutePairs.forEach((pair, i) => {
    const prog = { v: 0 };
    const t = 9.6 + (i % 5) * .46 + Math.floor(i / 5) * .58;
    tl.to(pair.core.material, { opacity: .42, duration: .26 }, t)
      .to(pair.glow.material, { opacity: .045, duration: .32 }, t)
      .to(prog, { v: 1, duration: 8.0 + (i % 3) * .55, ease: 'power1.inOut', onUpdate: () => { setProgress(pair.core, prog.v); setProgress(pair.glow, prog.v); } }, t + .05)
      .to(pair.core.material, { opacity: .24, duration: 2.3 }, 25.8 + i * .025)
      .to(pair.glow.material, { opacity: .020, duration: 2.3 }, 25.8 + i * .025)
      .to(pair.core.material, { opacity: .055, duration: 2.2 }, 29.7 + i * .02)
      .to(pair.glow.material, { opacity: 0, duration: 2.0 }, 29.7 + i * .02);
  });

'''
patch(encounter_marker, choice_timeline + encounter_marker, 'choice timeline')

# Keep the possibility layer out of the Finish chapter even if timeline seek happens.
patch(
"  // 28–33s — CONVERGENCE / FINISH DESCENT: sweep west and descend without a separate landscape shot.",
"  // 28–33s — CONVERGENCE / FINISH DESCENT: sweep west and descend without a separate landscape shot.\n  if (roadChoiceNetwork) tl.to(roadChoiceNetwork.material, { opacity: 0, duration: 1.0 }, 28.0);",
'road fade finish')

# Fireworks: lower the physical bursts and widen / lower the camera target so every
# important explosion stays inside the 16:9 frame with horizon context.
for old, new, label in [
    ("diag * .135", "diag * .102", 'firework origin 1'),
    ("diag * .165", "diag * .124", 'firework origin 2'),
    ("diag * .195", "diag * .146", 'firework origin 3'),
    ("diag * .215", "diag * .164", 'firework origin 4'),
]:
    patch(old, new, label)
patch(
"  const skyTarget = finish.clone().add(new THREE.Vector3(-diag * .090, diag * .130, -diag * .020));",
"  const skyTarget = finish.clone().add(new THREE.Vector3(-diag * .070, diag * .086, -diag * .018));",
'firework safe target')
patch(
"  tweenCamera(tl, 37.0, 3.0, bluePos.clone().add(new THREE.Vector3(0, -diag * .006, 0)), skyTarget, 42.0, 'power2.inOut');",
"  tweenCamera(tl, 36.45, 3.55, bluePos.clone().add(new THREE.Vector3(0, -diag * .004, 0)), skyTarget, 49.0, 'power2.inOut');",
'firework safe camera')

# Resize support for new line layers.
patch(
"  routePairs.forEach(p => { p.core.material.resolution.set(w, h); p.glow.material.resolution.set(w, h); });",
"  routePairs.forEach(p => { p.core.material.resolution.set(w, h); p.glow.material.resolution.set(w, h); });\n  choiceRoutePairs.forEach(p => { p.core.material.resolution.set(w, h); p.glow.material.resolution.set(w, h); });\n  if (roadChoiceNetwork && roadChoiceNetwork.material.resolution) roadChoiceNetwork.material.resolution.set(w, h);",
'choice resize')

out.write_text('// Scene 05 B v2.5 — texture-led 2.5D map, rider-choice network and safe-frame festival finale.\n' + text, encoding='utf-8')
print(out)
