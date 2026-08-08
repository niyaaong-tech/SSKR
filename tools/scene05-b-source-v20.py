#!/usr/bin/env python3
from pathlib import Path

ROOT=Path.cwd()
src=ROOT/'final'/'scene05-b'/'src'/'scene05-b-v20.js'
out=ROOT/'output'/'scene05-b-v20.js'
text=src.read_text('utf-8')


def patch(old:str,new:str,label:str,count:int=1):
    global text
    found=text.count(old)
    if found < count:
        raise SystemExit(f'Patch token not found for {label}: expected >= {count}, found {found}')
    text=text.replace(old,new,count)

# Ocean shader uses its own atmosphere. Three.js fog uniforms are not injected into this custom shader.
patch(
    "  fog: true,\n  uniforms: oceanUniforms,",
    "  fog: false,\n  uniforms: oceanUniforms,",
    'ocean fog'
)

# Ensure the post-processing canvas has a real sky color instead of falling to opaque black.
patch(
    "const scene = new THREE.Scene();\nscene.fog = new THREE.FogExp2(0x122331, 0.0105);",
    "const scene = new THREE.Scene();\nscene.background = new THREE.Color(0x07111c);\nscene.fog = new THREE.FogExp2(0x122331, 0.0105);",
    'scene background'
)

# Smooth only the presentation polyline. Source geometry remains real-road grounded; this removes visible GIS segment faceting.
patch(
    "function lineFromPoints(points, { color = 0xffd166, width = 3, opacity = 1, order = 7, depthTest = true } = {}) {\n  const flat = [];\n  for (const p of points) flat.push(p[0], p[1], p[2]);",
    "function smoothVisualPoints(points) {\n  if (!points || points.length < 5) return points;\n  const src = points.map(vec);\n  const curve = new THREE.CatmullRomCurve3(src, false, 'centripetal', 0.08);\n  const count = Math.min(1250, Math.max(points.length * 3, 360));\n  return curve.getPoints(count).map(p => [p.x, p.y, p.z]);\n}\n\nfunction lineFromPoints(points, { color = 0xffd166, width = 3, opacity = 1, order = 7, depthTest = true } = {}) {\n  const flat = [];\n  const visualPoints = smoothVisualPoints(points);\n  for (const p of visualPoints) flat.push(p[0], p[1], p[2]);",
    'route smoothing'
)
patch(
    "  line.userData.segments = Math.max(1, points.length - 1);",
    "  line.userData.segments = Math.max(1, visualPoints.length - 1);",
    'smoothed segment count'
)

# Clouds are aerial framing, not terrain decals: render above depth and let foreground layers create parallax.
patch(
    "const mat = new THREE.SpriteMaterial({ map: cloudTex, color: i % 3 === 0 ? 0xeaf1f2 : 0xf4f6f5, transparent: true, opacity: 0, depthWrite: false, depthTest: true });",
    "const mat = new THREE.SpriteMaterial({ map: cloudTex, color: i % 3 === 0 ? 0xeaf1f2 : 0xf4f6f5, transparent: true, opacity: 0, depthWrite: false, depthTest: false });",
    'cloud depth'
)
patch(
    "    sp.userData = { baseX: sp.position.x, baseY: sp.position.y, baseZ: sp.position.z, phase: i * .83, speed: .022 + (i % 4) * .006, targetOpacity: s[4] };\n    cloudSprites.push(sp);",
    "    sp.renderOrder = 6;\n    sp.userData = { baseX: sp.position.x, baseY: sp.position.y, baseZ: sp.position.z, phase: i * .83, speed: .022 + (i % 4) * .006, targetOpacity: Math.min(.42, s[4] * 1.38) };\n    cloudSprites.push(sp);",
    'cloud visibility'
)

# Fireworks should read as ordinary radial streaks instead of point-cloud pixels.
start=text.index("function makeFireworkBurst(origin, color, seed, count = 130) {")
end=text.index("\n\nfunction buildFestival",start)
old=text[start:end]
new="""function makeFireworkBurst(origin, color, seed, count = 72) {
  const rand = seededRandom(seed);
  const positions = [];
  for (let i = 0; i < count; i++) {
    const a = rand() * Math.PI * 2;
    const elev = (rand() * .70 + .18) * Math.PI * .5;
    const r = .72 + rand() * .42;
    const x = Math.cos(a) * Math.cos(elev) * r;
    const y = Math.sin(elev) * r * (.80 + rand() * .28) - .10;
    const z = Math.sin(a) * Math.cos(elev) * r;
    const inner = .16 + rand() * .12;
    positions.push(x * inner, y * inner, z * inner, x, y, z);
  }
  const geo = new LineSegmentsGeometry();
  geo.setPositions(positions);
  const mat = new LineMaterial({ color, linewidth: 1.28, transparent: true, opacity: 0, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending });
  mat.resolution.set(stage.clientWidth, stage.clientHeight);
  const burst = new LineSegments2(geo, mat);
  burst.position.copy(origin);
  burst.scale.setScalar(.02);
  burst.renderOrder = 30;
  fireworkGroup.add(burst);
  fireworkBursts.push(burst);
  return burst;
}"""
text=text[:start]+new+text[end:]

# Add an actual low western sun so Finish glow is not forced to impersonate the sunset.
patch(
    "let finishNode = null;\nlet dawnTerrainMat = null;",
    "let finishNode = null;\nlet sunSprite = null;\nlet dawnTerrainMat = null;",
    'sun global'
)
patch(
    "  origins.forEach((o, i) => {\n    const burst = makeFireworkBurst(o, colors[i], 8041 + i * 73, 118 + i * 14);",
    "  origins.forEach((o, i) => {\n    const burst = makeFireworkBurst(o, colors[i], 8041 + i * 73, 62 + i * 8);",
    'firework density'
)
patch(
    "  return cluster;\n}\n\nfunction animateFirework",
    "  const sunMat = new THREE.SpriteMaterial({ map: nodeGlow, color: 0xffc47a, transparent: true, opacity: 0, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending });\n  sunSprite = new THREE.Sprite(sunMat);\n  sunSprite.position.copy(finish).add(new THREE.Vector3(-diag * .30, diag * .050, -diag * .025));\n  sunSprite.scale.set(diag * .105, diag * .105, 1);\n  sunSprite.renderOrder = 12;\n  scene.add(sunSprite);\n  return cluster;\n}\n\nfunction animateFirework",
    'western sun'
)

# Recompose the west-coast chapter from a near-horizontal inland-to-sea viewpoint.
patch(
    "  const westSweep = finish.clone().add(new THREE.Vector3(diag * .30, diag * .33, diag * .37));\n  const finishDesc = finish.clone().add(new THREE.Vector3(diag * .075, diag * .17, diag * .20));\n  const bluePos = finish.clone().add(new THREE.Vector3(diag * .05, diag * .12, diag * .24));\n  const skyTarget = finish.clone().add(new THREE.Vector3(0, diag * .19, -diag * .01));",
    "  const westSweep = finish.clone().add(new THREE.Vector3(diag * .31, diag * .28, diag * .25));\n  const finishDesc = finish.clone().add(new THREE.Vector3(diag * .155, diag * .070, diag * .125));\n  const finishLook = finish.clone().add(new THREE.Vector3(-diag * .235, diag * .013, -diag * .018));\n  const bluePos = finish.clone().add(new THREE.Vector3(diag * .125, diag * .052, diag * .155));\n  const blueLook = finish.clone().add(new THREE.Vector3(-diag * .275, diag * .040, -diag * .020));\n  const skyTarget = finish.clone().add(new THREE.Vector3(-diag * .085, diag * .195, -diag * .020));",
    'finish camera composition'
)
patch(
    "  tweenCamera(tl, 44.0, 5.0, finishDesc, finish.clone().add(new THREE.Vector3(0, .18, 0)), 27.5, 'power2.inOut');",
    "  tweenCamera(tl, 44.0, 5.0, finishDesc, finishLook, 33.0, 'power2.inOut');",
    'finish descent target'
)
patch(
    "  tweenCamera(tl, 49.0, 3.0, finishDesc.clone().add(new THREE.Vector3(-diag * .008, diag * .006, -diag * .004)), finish.clone().add(new THREE.Vector3(0, .16, 0)), 27.5, 'sine.inOut');",
    "  tweenCamera(tl, 49.0, 3.0, finishDesc.clone().add(new THREE.Vector3(-diag * .008, diag * .004, -diag * .004)), finishLook.clone().add(new THREE.Vector3(-diag * .020, 0, 0)), 33.0, 'sine.inOut');",
    'sunset hold target'
)
patch(
    "  tweenCamera(tl, 52.0, 4.0, bluePos, finish.clone().add(new THREE.Vector3(0, diag * .035, -diag * .01)), 30.5, 'sine.inOut');",
    "  tweenCamera(tl, 52.0, 4.0, bluePos, blueLook, 35.0, 'sine.inOut');",
    'blue hour target'
)
patch(
    "  tweenCamera(tl, 55.0, 5.0, bluePos.clone().add(new THREE.Vector3(0, -diag * .01, 0)), skyTarget, 33.5, 'power2.inOut');",
    "  tweenCamera(tl, 55.0, 5.0, bluePos.clone().add(new THREE.Vector3(0, -diag * .008, 0)), skyTarget, 38.0, 'power2.inOut');",
    'firework tilt'
)

# Finish node stays a place marker, not a giant substitute sun.
patch(
    "  tl.to(finishNode.scale, { x: 1.55, y: 1.55, z: 1.55, duration: 2.2, ease: 'power2.out' }, 44.5);\n  nodeOpacity(tl, finishNode, 44.4, { core: .98, ring: .72, glow: .82, duration: 1.1 });",
    "  tl.to(finishNode.scale, { x: 1.02, y: 1.02, z: 1.02, duration: 2.2, ease: 'power2.out' }, 44.5);\n  nodeOpacity(tl, finishNode, 44.4, { core: .82, ring: .38, glow: .30, duration: 1.1 });",
    'finish beacon restraint'
)

# Physical sky/color progression for the opaque post-processing canvas.
patch(
    "  bloom.strength = .56;\n\n  for (const n of startNodes.values()) {",
    "  bloom.strength = .56;\n  scene.background.set(0x07111c);\n\n  for (const n of startNodes.values()) {",
    'initial background'
)
patch(
    "  tl.to(skyNight, { opacity: .48, duration: 5.2, ease: 'sine.inOut' }, .5)",
    "  tl.to(scene.background, { r: .035, g: .095, b: .125, duration: 6.0, ease: 'sine.inOut' }, 0)\n    .to(skyNight, { opacity: .48, duration: 5.2, ease: 'sine.inOut' }, .5)",
    'dawn background'
)
patch(
    "  tl.to(dayTerrainMat, { opacity: 1, duration: 5.4 }, 20.0)",
    "  tl.to(scene.background, { r: .30, g: .46, b: .54, duration: 7.0, ease: 'sine.inOut' }, 19.0)\n    .to(dayTerrainMat, { opacity: 1, duration: 5.4 }, 20.0)",
    'day background'
)
patch(
    "  tl.to(sunsetTerrainMat, { opacity: 1, duration: 7.0, ease: 'sine.inOut' }, 36.0)",
    "  tl.to(scene.background, { r: .30, g: .19, b: .24, duration: 8.0, ease: 'sine.inOut' }, 35.0)\n    .to(sunsetTerrainMat, { opacity: 1, duration: 7.0, ease: 'sine.inOut' }, 36.0)",
    'sunset background'
)
patch(
    "  tl.to(skyBluehour, { opacity: .98, duration: 5.2, ease: 'sine.inOut' }, 50.4)",
    "  tl.to(scene.background, { r: .025, g: .045, b: .085, duration: 5.3, ease: 'sine.inOut' }, 50.3)\n    .to(skyBluehour, { opacity: .98, duration: 5.2, ease: 'sine.inOut' }, 50.4)",
    'blue background'
)

# Animate the real sun independently of the Finish marker, then let it set below the horizon.
patch(
    "  for (const n of startNodes.values()) {\n    tl.to(n.userData.core.material, { opacity: .10, duration: 3.0 }, 37.0)",
    "  if (sunSprite) {\n    tl.to(sunSprite.material, { opacity: .60, duration: 2.6, ease: 'sine.out' }, 36.5)\n      .to(sunSprite.material, { opacity: .88, duration: 3.4, ease: 'sine.inOut' }, 42.0)\n      .to(sunSprite.position, { y: finish.y + diag * .014, duration: 10.5, ease: 'sine.inOut' }, 41.0)\n      .to(sunSprite.material, { opacity: 0, duration: 2.6, ease: 'sine.in' }, 50.0);\n  }\n  for (const n of startNodes.values()) {\n    tl.to(n.userData.core.material, { opacity: .10, duration: 3.0 }, 37.0)",
    'sun animation'
)

# Firework line materials need viewport resolution updates.
patch(
    "  launchLines.forEach(l => l.material.resolution.set(w, h));\n  if (mergedNetwork)",
    "  launchLines.forEach(l => l.material.resolution.set(w, h));\n  fireworkBursts.forEach(b => { if (b.material && b.material.resolution) b.material.resolution.set(w, h); });\n  if (mergedNetwork)",
    'firework resize'
)

out.parent.mkdir(parents=True,exist_ok=True)
out.write_text('// Scene 05 B v2.1 generated art-pass build source. Real geography preserved; presentation rendering refined after exact-frame QA.\n'+text,encoding='utf-8')
print(out)
