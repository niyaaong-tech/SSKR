#!/usr/bin/env python3
from pathlib import Path

ROOT=Path.cwd()
src=ROOT/'output'/'scene05-b-v22.js'
out=ROOT/'output'/'scene05-b-v23.js'
text=src.read_text('utf-8')


def patch(old,new,label,count=1):
    global text
    n=text.count(old)
    if n<count:
        raise SystemExit(f'{label}: expected {count}, found {n}')
    text=text.replace(old,new,count)

patch(
"    const w = d * s[3] * .34;",
"    const w = d * s[3] * .46;",
'larger cloud framing')
patch(
"targetOpacity: Math.min(.42, s[4] * 1.38)",
"targetOpacity: Math.min(.50, s[4] * 1.75)",
'stronger cloud opacity')
patch(
"  sunSprite.scale.set(diag * .105, diag * .105, 1);",
"  sunSprite.scale.set(diag * .082, diag * .082, 1);",
'restrained sunset halo')
patch(
"  const skyTarget = finish.clone().add(new THREE.Vector3(-diag * .085, diag * .195, -diag * .020));",
"  const skyTarget = finish.clone().add(new THREE.Vector3(-diag * .090, diag * .130, -diag * .020));",
'fireworks keep horizon')
patch(
"  tweenCamera(tl, 55.0, 5.0, bluePos.clone().add(new THREE.Vector3(0, -diag * .008, 0)), skyTarget, 38.0, 'power2.inOut');",
"  tweenCamera(tl, 55.0, 5.0, bluePos.clone().add(new THREE.Vector3(0, -diag * .008, 0)), skyTarget, 42.0, 'power2.inOut');",
'fireworks wider composition')
patch(
"const glow = lineFromPoints(r.points, { color: 0xffb94f, width: 7.2, opacity: 0, order: 8, depthTest: false });\n    const core = lineFromPoints(r.points, { color: 0xffd166, width: 2.75, opacity: 0, order: 10, depthTest: true });",
"const glow = lineFromPoints(r.points, { color: 0xffb94f, width: 5.6, opacity: 0, order: 8, depthTest: false });\n    const core = lineFromPoints(r.points, { color: 0xffd98a, width: 2.25, opacity: 0, order: 10, depthTest: true });",
'route refinement')

out.write_text('// Scene 05 B v2.3 naturalized cinematic build source.\n'+text,encoding='utf-8')
print(out)
