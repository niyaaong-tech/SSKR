#!/usr/bin/env python3
from pathlib import Path

ROOT=Path.cwd()
src=ROOT/'output'/'scene05-b-v20.js'
out=ROOT/'output'/'scene05-b-v22.js'
text=src.read_text('utf-8')


def patch(old,new,label,count=1):
    global text
    n=text.count(old)
    if n<count:
        raise SystemExit(f'{label}: expected {count}, found {n}')
    text=text.replace(old,new,count)

patch(
"const oceanUniforms = {\n  uTime: { value: 0 },\n  uPhase: { value: 0 },\n  uOpacity: { value: 0.94 }\n};",
"const coastFallback = new THREE.DataTexture(new Uint8Array([0,0,0,255]), 1, 1, THREE.RGBAFormat);\ncoastFallback.needsUpdate = true;\nconst oceanUniforms = {\n  uTime: { value: 0 },\n  uPhase: { value: 0 },\n  uOpacity: { value: 0.94 },\n  uCoastMap: { value: coastFallback },\n  uTerrainBounds: { value: new THREE.Vector4(-34,34,-34,34) }\n};",
'ocean uniforms')

patch(
"    varying vec2 vUv;\n    varying float vWave;",
"    varying vec2 vUv;\n    varying float vWave;\n    varying vec3 vWorld;",
'ocean vertex varying')
patch(
"      p.z+=vWave;\n      gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);",
"      p.z+=vWave;\n      vWorld=(modelMatrix*vec4(p,1.0)).xyz;\n      gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);",
'ocean world position')

patch(
"    uniform float uOpacity;\n    varying vec2 vUv;\n    varying float vWave;",
"    uniform float uOpacity;\n    uniform sampler2D uCoastMap;\n    uniform vec4 uTerrainBounds;\n    varying vec2 vUv;\n    varying float vWave;\n    varying vec3 vWorld;",
'ocean fragment uniforms')
patch(
"      vec3 base=phaseColor(uPhase);\n      float micro=sin(vUv.x*210.0+uTime*0.42)*sin(vUv.y*170.0-uTime*0.34);",
"      vec3 base=phaseColor(uPhase);\n      vec2 coastUv=vec2(\n        (vWorld.x-uTerrainBounds.x)/max(0.001,uTerrainBounds.y-uTerrainBounds.x),\n        (vWorld.z-uTerrainBounds.z)/max(0.001,uTerrainBounds.w-uTerrainBounds.z)\n      );\n      float inside=step(0.0,coastUv.x)*step(coastUv.x,1.0)*step(0.0,coastUv.y)*step(coastUv.y,1.0);\n      float coast=texture2D(uCoastMap,clamp(coastUv,0.0,1.0)).r*inside;\n      float coastDay=1.0-smoothstep(2.35,3.0,uPhase);\n      base=mix(base,vec3(0.045,0.315,0.390),coast*0.62*coastDay);\n      float micro=sin(vUv.x*210.0+uTime*0.42)*sin(vUv.y*170.0-uTime*0.34);",
'coastal tint')

patch(
"  loadTexture('./assets/terrain_sunset_final.png'),\n  loadJSON('./assets/scene05_final_data_v1.json')\n]).then(([gltf, dawnTex, dayTex, sunsetTex, data]) => {",
"  loadTexture('./assets/terrain_sunset_final.png'),\n  loadTexture('./assets/coast_shallow.png'),\n  loadJSON('./assets/scene05_final_data_v1.json')\n]).then(([gltf, dawnTex, dayTex, sunsetTex, coastTex, data]) => {\n  coastTex.wrapS = THREE.ClampToEdgeWrapping;\n  coastTex.wrapT = THREE.ClampToEdgeWrapping;\n  oceanUniforms.uCoastMap.value = coastTex;",
'coast texture load')

patch(
"  terrainBounds = new THREE.Box3().setFromObject(dawnScene);\n  buildClouds(terrainBounds);",
"  terrainBounds = new THREE.Box3().setFromObject(dawnScene);\n  oceanUniforms.uTerrainBounds.value.set(terrainBounds.min.x, terrainBounds.max.x, terrainBounds.min.z, terrainBounds.max.z);\n  buildClouds(terrainBounds);",
'ocean terrain bounds')

out.write_text('// Scene 05 B v2.2 coastal-water build source.\n'+text,encoding='utf-8')
print(out)
