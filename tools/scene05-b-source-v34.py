#!/usr/bin/env python3
from pathlib import Path
ROOT=Path.cwd();src=ROOT/'output/scene05-b-v33.js';out=ROOT/'output/scene05-b-v34.js';text=src.read_text('utf-8')
def patch(old,new,label,count=1):
 global text;n=text.count(old)
 if n<count:raise SystemExit(f'{label}: expected >= {count}, found {n}')
 text=text.replace(old,new,count)
# Canonical texture mesh now carries actual shallow DEM relief itself.
patch('./assets/peninsula_surface_v33.json','./assets/peninsula_surface_v34.json','relief mesh meta')
# Separate GLB terrain layers are no longer the visible surface; retaining them only
# for camera bounds avoids double relief and z-fighting.
patch('terrainGroup.scale.y = .09;','terrainGroup.scale.y = .09; terrainGroup.visible = false;','hide legacy terrain overlay')
# Smaller graphic nodes: geographic events, not glowing UI buttons.
patch('const n = makeNode(s.position, .13);','const n = makeNode(s.position, .095);','smaller start nodes')
patch('finishNode = makeNode(data.finish.position, .24);','finishNode = makeNode(data.finish.position, .18);','smaller finish node')
patch('const fb = finishNode.userData.sprite.userData.baseScale * 1.75;','const fb = finishNode.userData.sprite.userData.baseScale * 1.38;','finish glow restraint')
patch('const n = makeNode(c.position, .062);','const n = makeNode(c.position, .048);','smaller checkpoints')
# Cloud sprites become a foreground atmospheric layer. They remain low opacity but
# are no longer hidden behind the land mesh, restoring the aerial-camera feeling.
patch("new THREE.SpriteMaterial({ map: cloudTex, color: i % 3 === 0 ? 0xeaf1f2 : 0xf4f6f5, transparent: true, opacity: 0, depthWrite: false, depthTest: true })","new THREE.SpriteMaterial({ map: cloudTex, color: i % 3 === 0 ? 0xeaf1f2 : 0xf4f6f5, transparent: true, opacity: 0, depthWrite: false, depthTest: false })",'cloud foreground material')
patch('sp.userData = { baseX: sp.position.x, baseY: sp.position.y, baseZ: sp.position.z, phase: i * .83, speed: .022 + (i % 4) * .006, targetOpacity: s[4] };','sp.renderOrder = 6;\n    sp.userData = { baseX: sp.position.x, baseY: sp.position.y, baseZ: sp.position.z, phase: i * .83, speed: .022 + (i % 4) * .006, targetOpacity: s[4] };','cloud render order')
# Network/reveal cameras become more oblique and lateral. The viewer should fly over
# a place, not look straight down at a GIS canvas.
patch('const cranePos = center.clone().add(new THREE.Vector3(diag * .18, diag * .56, diag * .48));','const cranePos = center.clone().add(new THREE.Vector3(diag * .30, diag * .43, diag * .62));','oblique crane')
patch('const networkA = center.clone().add(new THREE.Vector3(diag * .34, diag * .40, diag * .23));','const networkA = center.clone().add(new THREE.Vector3(diag * .43, diag * .32, diag * .41));','oblique network A')
patch('const networkB = center.clone().add(new THREE.Vector3(-diag * .18, diag * .36, -diag * .28));','const networkB = center.clone().add(new THREE.Vector3(-diag * .29, diag * .31, -diag * .43));','oblique network B')
# Preserve network readability with a modestly wider lens while lowering camera height.
patch("tweenCamera(tl, 17.0, 5.0, cranePos, center.clone().add(new THREE.Vector3(0, .22, 0)), 38.0, 'power2.inOut');","tweenCamera(tl, 17.0, 5.0, cranePos, center.clone().add(new THREE.Vector3(0, .16, 0)), 39.0, 'power2.inOut');",'crane look')
patch("tweenCamera(tl, 22.0, 3.0, networkA, center.clone().add(new THREE.Vector3(diag * .05, .16, diag * .01)), 35.5, 'sine.inOut');","tweenCamera(tl, 22.0, 3.0, networkA, center.clone().add(new THREE.Vector3(diag * .04, .12, diag * .01)), 37.0, 'sine.inOut');",'network A look')
patch("tweenCamera(tl, 25.0, 3.0, networkB, center.clone().add(new THREE.Vector3(-diag * .09, .13, -diag * .05)), 34.0, 'sine.inOut');","tweenCamera(tl, 25.0, 3.0, networkB, center.clone().add(new THREE.Vector3(-diag * .08, .10, -diag * .05)), 36.0, 'sine.inOut');",'network B look')
# Tone down route bloom slightly because oblique relief naturally separates paths.
patch('const glow = lineFromPoints(pts, { color: 0xe8a14b, width: 2.55, opacity: 0, order: 7, depthTest: false });','const glow = lineFromPoints(pts, { color: 0xe8a14b, width: 2.30, opacity: 0, order: 7, depthTest: false });','participant glow integration')
# Aerial atmosphere can be a touch denser at distance now that the geometry has real relief.
patch(".to(scene.fog, { density: .00525, duration: 3.6 }, 16.7)",".to(scene.fog, { density: .0057, duration: 3.6 }, 16.7)",'atmospheric depth')
out.write_text('// Scene 05 B v3.4 — canonical WorldCover texture mesh with actual shallow DEM relief, oblique aerial camera and visible cloud depth.\n'+text,encoding='utf-8');print(out)
