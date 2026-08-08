#!/usr/bin/env python3
from pathlib import Path

ROOT=Path.cwd();src=ROOT/'output'/'scene05-b-v28.js';out=ROOT/'output'/'scene05-b-v29.js';text=src.read_text('utf-8')

def patch(old,new,label,count=1):
    global text
    n=text.count(old)
    if n<count:raise SystemExit(f'{label}: expected >= {count}, found {n}')
    text=text.replace(old,new,count)

# A dense actual-road field is now a baked 2D texture aligned to the canonical
# peninsula mesh. This gives route-choice density without a GIS-like 100k-line mesh.
patch("let roadChoiceNetwork = null;\nlet peninsulaSurface = null;","let roadChoiceNetwork = null;\nlet roadOverlayMat = null;\nlet roadOverlayMesh = null;\nlet peninsulaSurface = null;",'road overlay globals')
patch(
"  loadTexture('./assets/peninsula_surface_v28.png'),\n  loadJSON('./assets/peninsula_surface_v28.json'),\n  loadJSON('./assets/scene05_final_data_v1.json')\n]).then(([gltf, dawnTex, dayTex, sunsetTex, coastTex, peninsulaTex, peninsulaMeta, data]) => {",
"  loadTexture('./assets/peninsula_surface_v28.png'),\n  loadTexture('./assets/road_choice_overlay_v29.png'),\n  loadJSON('./assets/peninsula_surface_v28.json'),\n  loadJSON('./assets/scene05_final_data_v1.json')\n]).then(([gltf, dawnTex, dayTex, sunsetTex, coastTex, peninsulaTex, roadOverlayTex, peninsulaMeta, data]) => {",
'load road overlay')
patch(
"  buildPeninsulaSurface(peninsulaMeta, peninsulaTex);",
"  buildPeninsulaSurface(peninsulaMeta, peninsulaTex);\n  roadOverlayTex.colorSpace = THREE.SRGBColorSpace;\n  roadOverlayTex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());\n  roadOverlayMat = new THREE.MeshBasicMaterial({ map: roadOverlayTex, transparent: true, opacity: 0, depthWrite: false, depthTest: true, fog: true });\n  roadOverlayMesh = new THREE.Mesh(peninsulaSurface.geometry.clone(), roadOverlayMat);\n  roadOverlayMesh.position.y = .032; roadOverlayMesh.renderOrder = 4; roadChoiceGroup.add(roadOverlayMesh);",
'build road overlay mesh')
patch("  roadChoiceNetwork = roadPossibilityFromHints(data.road_hints || []);","  roadChoiceNetwork = { material: roadOverlayMat };",'use texture as possibility network')

# Fine-tune opacity for a baked dense network. It should become legible during the
# chase, peak during choice/reveal, then disappear before Finish convergence.
patch("{ opacity: .095, duration: 1.0, ease: 'sine.out' }, 7.8","{ opacity: .16, duration: 1.0, ease: 'sine.out' }, 7.65",'road overlay enters')
patch("{ opacity: .175, duration: 3.4, ease: 'sine.inOut' }, 10.3","{ opacity: .31, duration: 3.1, ease: 'sine.inOut' }, 9.8",'road overlay choice peak')
patch("{ opacity: .135, duration: 6.0, ease: 'sine.inOut' }, 16.2","{ opacity: .23, duration: 6.0, ease: 'sine.inOut' }, 16.0",'road overlay reveal sustain')
patch("{ opacity: .055, duration: 2.2, ease: 'sine.inOut' }, 25.0","{ opacity: .08, duration: 2.2, ease: 'sine.inOut' }, 25.0",'road overlay west fade')

# Gold local choices sit just above the road texture and are intentionally selective.
patch("color: 0xf0a84f, width: 2.25","color: 0xeea34d, width: 2.0",'local choice glow')
patch("color: 0xffdf9c, width: .92","color: 0xffdda0, width: .86",'local choice core')

# Routes now conform to the shallow visual surface in the v2.9 data pass. Slightly
# lower bloom keeps them embedded in the landscape rather than hovering above it.
patch("const glow = lineFromPoints(r.points, { color: 0xffb94f, width: 4.2, opacity: 0, order: 8, depthTest: false });","const glow = lineFromPoints(r.points, { color: 0xffb94f, width: 3.6, opacity: 0, order: 8, depthTest: false });",'main route integrated glow')

out.write_text('// Scene 05 B v2.9 — baked real-road possibility field, shallow-conformed routes and integrated aerial map art.\n'+text,encoding='utf-8')
print(out)
