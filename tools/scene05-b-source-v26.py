#!/usr/bin/env python3
from pathlib import Path

ROOT=Path.cwd()
src=ROOT/'output'/'scene05-b-v252.js'
out=ROOT/'output'/'scene05-b-v26.js'
text=src.read_text('utf-8')


def patch(old,new,label,count=1):
    global text
    n=text.count(old)
    if n<count:raise SystemExit(f'{label}: expected >= {count}, found {n}')
    text=text.replace(old,new,count)


def patch_all(old,new,label):
    global text
    n=text.count(old)
    if n<1:raise SystemExit(f'{label}: token not found')
    text=text.replace(old,new)
    print(label,n)

# ---------------------------------------------------------------------------
# v2.6 LOOK: texture-led surface becomes the image; 3D relief is only a shallow cue.
# ---------------------------------------------------------------------------
patch("renderer.toneMappingExposure = 1.02;","renderer.toneMappingExposure = 1.08;",'slightly brighter filmic exposure')
patch("./assets/peninsula_surface_v25.png","./assets/peninsula_surface_v26.png",'v26 texture url')
patch("./assets/peninsula_surface_v25.json","./assets/peninsula_surface_v26.json",'v26 texture meta url')
patch("terrainGroup.scale.y = .30;","terrainGroup.scale.y = .09;",'very shallow relief')
patch(
"dawnTerrainMat = new THREE.MeshBasicMaterial({ map: dawnTex, color: '#d8e1e2', transparent: false, depthWrite: true, fog: true });",
"dawnTerrainMat = new THREE.MeshBasicMaterial({ map: dawnTex, color: '#d8e1e2', transparent: true, opacity: .22, depthWrite: false, fog: true });",
'dawn relief translucency')
patch("  dawnTerrainMat.opacity = 1;","  dawnTerrainMat.opacity = .22;",'initial dawn relief')
patch_all("dayTerrainMat, { opacity: 1,","dayTerrainMat, { opacity: .32,",'cap day relief')
patch_all("dayTerrainMat, { opacity: .58,","dayTerrainMat, { opacity: .20,",'cap morning relief')
patch_all("dayTerrainMat, { opacity: .34,","dayTerrainMat, { opacity: .15,",'cap sunset day residue')
patch_all("dayTerrainMat, { opacity: .12,","dayTerrainMat, { opacity: .05,",'cap finish day residue')
patch_all("sunsetTerrainMat, { opacity: .88,","sunsetTerrainMat, { opacity: .23,",'cap warm relief')
patch_all("sunsetTerrainMat, { opacity: 1,","sunsetTerrainMat, { opacity: .29,",'cap sunset relief')

# Texture material receives time-of-day grading directly, so the same canonical
# peninsula survives every chapter without a visible material swap.
patch(
"const mat = new THREE.MeshBasicMaterial({ map: texture, transparent: true, alphaTest: .012, depthWrite: true, depthTest: true, fog: true });",
"const mat = new THREE.MeshBasicMaterial({ map: texture, color: 0x9fb1a5, transparent: true, alphaTest: .012, depthWrite: true, depthTest: true, fog: true });",
'peninsula material grading')
patch(
"  if (sunSprite) sunSprite.material.opacity = 0;",
"  if (sunSprite) sunSprite.material.opacity = 0;\n  if (peninsulaSurface) peninsulaSurface.material.color.set(0x7c918d);",
'initial peninsula tone')
# Insert phase grading alongside the existing background transitions.
patch(
"  tl.to(scene.background, { r: .30, g: .46, b: .54, duration: 4.6, ease: 'sine.inOut' }, 16.5)",
"  if (peninsulaSurface) tl.to(peninsulaSurface.material.color, { r: 1.0, g: 1.0, b: 1.0, duration: 4.2, ease: 'sine.inOut' }, 16.2);\n  tl.to(scene.background, { r: .30, g: .46, b: .54, duration: 4.6, ease: 'sine.inOut' }, 16.5)",
'day texture grade')
patch(
"  tl.to(scene.background, { r: .30, g: .19, b: .24, duration: 6.0, ease: 'sine.inOut' }, 24.0)",
"  if (peninsulaSurface) tl.to(peninsulaSurface.material.color, { r: .90, g: .72, b: .57, duration: 5.0, ease: 'sine.inOut' }, 24.0);\n  tl.to(scene.background, { r: .30, g: .19, b: .24, duration: 6.0, ease: 'sine.inOut' }, 24.0)",
'sunset texture grade')
patch(
"  tl.to(scene.background, { r: .025, g: .045, b: .085, duration: 3.6, ease: 'sine.inOut' }, 34.2)",
"  if (peninsulaSurface) tl.to(peninsulaSurface.material.color, { r: .39, g: .49, b: .58, duration: 3.4, ease: 'sine.inOut' }, 34.2);\n  tl.to(scene.background, { r: .025, g: .045, b: .085, duration: 3.6, ease: 'sine.inOut' }, 34.2)",
'night texture grade')

# ---------------------------------------------------------------------------
# Ocean: deep aerial water, no conspicuous sine-band / cyan-map look.
# ---------------------------------------------------------------------------
patch("vec3 dawn=vec3(0.035,0.125,0.190);","vec3 dawn=vec3(0.025,0.090,0.145);",'ocean dawn')
patch("vec3 day=vec3(0.035,0.235,0.360);","vec3 day=vec3(0.022,0.135,0.225);",'ocean day')
patch("vec3 sunset=vec3(0.080,0.105,0.165);","vec3 sunset=vec3(0.040,0.070,0.125);",'ocean sunset')
patch("vec3 night=vec3(0.015,0.038,0.075);","vec3 night=vec3(0.010,0.026,0.058);",'ocean night')
patch("base=mix(base,vec3(0.045,0.315,0.390),coast*0.62*coastDay);","base=mix(base,vec3(0.030,0.205,0.285),coast*0.40*coastDay);",'restrained shallow water')
patch(
"float micro=sin(vUv.x*210.0+uTime*0.42)*sin(vUv.y*170.0-uTime*0.34);\n      float broad=sin(vUv.x*41.0+vUv.y*35.0+uTime*0.13);",
"float micro=sin(vUv.x*173.0+vUv.y*61.0+uTime*0.29)*sin(vUv.y*139.0-vUv.x*37.0-uTime*0.19);\n      float broad=sin(vUv.x*23.0+vUv.y*31.0+uTime*0.08)*sin(vUv.x*13.0-vUv.y*17.0-uTime*0.04);",
'irregular ocean texture')
patch("c+=vec3(0.015,0.035,0.050)*(broad*0.5+0.5);","c+=vec3(0.010,0.022,0.034)*(broad*0.5+0.5);",'subtle broad water')
patch("c+=vec3(0.025,0.045,0.060)*shimmer*0.16;","c+=vec3(0.018,0.031,0.043)*shimmer*0.11;",'subtle water shimmer')

# ---------------------------------------------------------------------------
# Routes: real road web = neutral possibility; gold = individual rider decisions.
# Smoothing removes the remaining angular / polyline storyboard look.
# ---------------------------------------------------------------------------
old_smooth="""function smoothVisualPoints(points) {
  if (!points || points.length < 5) return points;
  const src = points.map(vec);
  const curve = new THREE.CatmullRomCurve3(src, false, 'centripetal', 0.08);
  const count = Math.min(1250, Math.max(points.length * 3, 360));
  return curve.getPoints(count).map(p => [p.x, p.y, p.z]);
}"""
new_smooth="""function smoothVisualPoints(points) {
  if (!points || points.length < 5) return points;
  let src = points.map(vec);
  for (let pass = 0; pass < 2; pass++) {
    const next = src.map(p => p.clone());
    for (let i = 1; i < src.length - 1; i++) {
      next[i].copy(src[i - 1]).multiplyScalar(.20).addScaledVector(src[i], .60).addScaledVector(src[i + 1], .20);
    }
    src = next;
  }
  const curve = new THREE.CatmullRomCurve3(src, false, 'centripetal', 0.28);
  const count = Math.min(1500, Math.max(points.length * 5, 520));
  return curve.getPoints(count).map(p => [p.x, p.y, p.z]);
}"""
patch(old_smooth,new_smooth,'organic visual route smoothing')
patch("color: 0xc9c2aa, linewidth: .62","color: 0x76817a, linewidth: .52",'neutral road possibility')
patch("const glow = lineFromPoints(r.points, { color: 0xf1ad56, width: 2.8, opacity: 0, order: 6, depthTest: false });","const glow = lineFromPoints(r.points, { color: 0xf0a84f, width: 3.4, opacity: 0, order: 6, depthTest: false });",'choice glow presence')
patch("const core = lineFromPoints(r.points, { color: 0xffd58a, width: 1.05, opacity: 0, order: 7, depthTest: true });","const core = lineFromPoints(r.points, { color: 0xffd98a, width: 1.35, opacity: 0, order: 7, depthTest: true });",'choice core presence')
patch("const glow = lineFromPoints(r.points, { color: 0xffb94f, width: 5.6, opacity: 0, order: 8, depthTest: false });","const glow = lineFromPoints(r.points, { color: 0xffb94f, width: 4.2, opacity: 0, order: 8, depthTest: false });",'main glow restraint')
patch("const core = lineFromPoints(r.points, { color: 0xffd98a, width: 2.25, opacity: 0, order: 10, depthTest: true });","const core = lineFromPoints(r.points, { color: 0xffd98a, width: 1.78, opacity: 0, order: 10, depthTest: true });",'main core restraint')

# Possibility appears during the chase, and individual alternatives enter sooner so
# the viewer sees a fork rather than a single mandatory course.
patch("{ opacity: .075, duration: 1.0, ease: 'sine.out' }, 10.6","{ opacity: .080, duration: 1.0, ease: 'sine.out' }, 8.4",'roads appear during chase')
patch("{ opacity: .180, duration: 3.2, ease: 'sine.inOut' }, 13.0","{ opacity: .205, duration: 3.4, ease: 'sine.inOut' }, 11.2",'road possibility peak earlier')
patch("const t = 9.6 + (i % 5) * .46 + Math.floor(i / 5) * .58;","const t = 8.25 + (i % 5) * .31 + Math.floor(i / 5) * .43;",'choice traces branch earlier')
patch("{ opacity: .50, duration: .26 }","{ opacity: .58, duration: .26 }",'choice trace legibility')

# More aerial room for the freedom network without restoring a static beauty shot.
patch("const cranePos = center.clone().add(new THREE.Vector3(diag * .18, diag * .48, diag * .42));","const cranePos = center.clone().add(new THREE.Vector3(diag * .18, diag * .56, diag * .48));",'higher crane reveal')
patch("const networkA = center.clone().add(new THREE.Vector3(diag * .34, diag * .34, diag * .20));","const networkA = center.clone().add(new THREE.Vector3(diag * .34, diag * .40, diag * .23));",'higher network A')
patch("const networkB = center.clone().add(new THREE.Vector3(-diag * .18, diag * .30, -diag * .28));","const networkB = center.clone().add(new THREE.Vector3(-diag * .18, diag * .36, -diag * .28));",'higher network B')
patch("tweenCamera(tl, 17.0, 5.0, cranePos, center.clone().add(new THREE.Vector3(0, .26, 0)), 35.0, 'power2.inOut');","tweenCamera(tl, 17.0, 5.0, cranePos, center.clone().add(new THREE.Vector3(0, .22, 0)), 38.0, 'power2.inOut');",'wider crane reveal')
patch("tweenCamera(tl, 22.0, 3.0, networkA, center.clone().add(new THREE.Vector3(diag * .05, .18, diag * .01)), 32.5, 'sine.inOut');","tweenCamera(tl, 22.0, 3.0, networkA, center.clone().add(new THREE.Vector3(diag * .05, .16, diag * .01)), 35.5, 'sine.inOut');",'network flight wider A')
patch("tweenCamera(tl, 25.0, 3.0, networkB, center.clone().add(new THREE.Vector3(-diag * .09, .14, -diag * .05)), 31.0, 'sine.inOut');","tweenCamera(tl, 25.0, 3.0, networkB, center.clone().add(new THREE.Vector3(-diag * .09, .13, -diag * .05)), 34.0, 'sine.inOut');",'network flight wider B')

# Cloud masses are framing / depth, not tiny decals.
patch("const w = d * s[3] * .46;","const w = d * s[3] * .54;",'larger cloud banks')
patch("targetOpacity: Math.min(.50, s[4] * 1.75)","targetOpacity: Math.min(.56, s[4] * 2.00)",'stronger cloud banks')

out.write_text('// Scene 05 B v2.6 — natural 2D terrain surface, deep ocean, autonomous rider-choice network and cinematic aerial framing.\n'+text,encoding='utf-8')
print(out)
