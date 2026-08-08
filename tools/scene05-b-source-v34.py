#!/usr/bin/env python3
from pathlib import Path
ROOT=Path.cwd();src=ROOT/'output/scene05-b-v33.js';out=ROOT/'output/scene05-b-v34.js';text=src.read_text('utf-8')
def patch(old,new,label,count=1):
 global text;n=text.count(old)
 if n<count:raise SystemExit(f'{label}: expected >= {count}, found {n}')
 text=text.replace(old,new,count)
patch('./assets/peninsula_surface_v33.json','./assets/peninsula_surface_v34.json','relief mesh meta')
patch('terrainGroup.scale.y = .09;','terrainGroup.scale.y = .09; terrainGroup.visible = false;','hide legacy terrain overlay')
patch('const n = makeNode(s.position, .13);','const n = makeNode(s.position, .095);','smaller start nodes')
patch('finishNode = makeNode(data.finish.position, .24);','finishNode = makeNode(data.finish.position, .18);','smaller finish node')
patch('const fb = finishNode.userData.sprite.userData.baseScale * 1.75;','const fb = finishNode.userData.sprite.userData.baseScale * 1.38;','finish glow restraint')
patch('const n = makeNode(c.position, .062);','const n = makeNode(c.position, .048);','smaller checkpoints')
# Clouds must read as aerial depth instead of being occluded by the shallow land mesh.
# Set the material property after construction so earlier source formatting cannot break this patch.
patch('    const sp = new THREE.Sprite(mat);','    mat.depthTest = false;\n    const sp = new THREE.Sprite(mat);','cloud foreground material')
patch('sp.userData = { baseX: sp.position.x, baseY: sp.position.y, baseZ: sp.position.z, phase: i * .83, speed: .022 + (i % 4) * .006, targetOpacity: Math.min(.68, s[4] * 2.40) };','sp.renderOrder = 6;\n    sp.userData = { baseX: sp.position.x, baseY: sp.position.y, baseZ: sp.position.z, phase: i * .83, speed: .022 + (i % 4) * .006, targetOpacity: Math.min(.68, s[4] * 2.40) };','cloud render order')
patch('const cranePos = center.clone().add(new THREE.Vector3(diag * .18, diag * .56, diag * .48));','const cranePos = center.clone().add(new THREE.Vector3(diag * .30, diag * .43, diag * .62));','oblique crane')
patch('const networkA = center.clone().add(new THREE.Vector3(diag * .34, diag * .40, diag * .23));','const networkA = center.clone().add(new THREE.Vector3(diag * .43, diag * .32, diag * .41));','oblique network A')
patch('const networkB = center.clone().add(new THREE.Vector3(-diag * .18, diag * .36, -diag * .28));','const networkB = center.clone().add(new THREE.Vector3(-diag * .29, diag * .31, -diag * .43));','oblique network B')
patch("tweenCamera(tl, 17.0, 5.0, cranePos, center.clone().add(new THREE.Vector3(0, .22, 0)), 38.0, 'power2.inOut');","tweenCamera(tl, 17.0, 5.0, cranePos, center.clone().add(new THREE.Vector3(0, .16, 0)), 39.0, 'power2.inOut');",'crane look')
patch("tweenCamera(tl, 22.0, 3.0, networkA, center.clone().add(new THREE.Vector3(diag * .05, .16, diag * .01)), 35.5, 'sine.inOut');","tweenCamera(tl, 22.0, 3.0, networkA, center.clone().add(new THREE.Vector3(diag * .04, .12, diag * .01)), 37.0, 'sine.inOut');",'network A look')
patch("tweenCamera(tl, 25.0, 3.0, networkB, center.clone().add(new THREE.Vector3(-diag * .09, .13, -diag * .05)), 34.0, 'sine.inOut');","tweenCamera(tl, 25.0, 3.0, networkB, center.clone().add(new THREE.Vector3(-diag * .08, .10, -diag * .05)), 36.0, 'sine.inOut');",'network B look')
patch('const glow = lineFromPoints(pts, { color: 0xe8a14b, width: 2.55, opacity: 0, order: 7, depthTest: false });','const glow = lineFromPoints(pts, { color: 0xe8a14b, width: 2.30, opacity: 0, order: 7, depthTest: false });','participant glow integration')
patch(".to(scene.fog, { density: .00525, duration: 3.6 }, 16.7)",".to(scene.fog, { density: .0057, duration: 3.6 }, 16.7)",'atmospheric depth')
out.write_text('// Scene 05 B v3.4 — canonical WorldCover texture mesh with actual shallow DEM relief, oblique aerial camera and visible cloud depth.\n'+text,encoding='utf-8');print(out)
