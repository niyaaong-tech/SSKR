#!/usr/bin/env python3
from pathlib import Path

ROOT = Path.cwd()
src = ROOT / 'output' / 'scene05-b-v251.js'
out = ROOT / 'output' / 'scene05-b-v252.js'
text = src.read_text('utf-8')


def patch(old: str, new: str, label: str, count: int = 1):
    global text
    found = text.count(old)
    if found < count:
        raise SystemExit(f'{label}: expected >= {count}, found {found}')
    text = text.replace(old, new, count)


# Keep every burst comfortably inside the 16:9 frame. The fireworks are an ending
# accent, not a camera target worth losing the Finish / horizon composition over.
patch(
"finish.clone().add(new THREE.Vector3(-diag * .025, diag * .078, .0)),",
"finish.clone().add(new THREE.Vector3(-diag * .018, diag * .066, .0)),",
'burst 1 origin')
patch(
"finish.clone().add(new THREE.Vector3(diag * .035, diag * .096, -diag * .015)),",
"finish.clone().add(new THREE.Vector3(diag * .020, diag * .078, -diag * .010)),",
'burst 2 origin')
patch(
"finish.clone().add(new THREE.Vector3(-diag * .055, diag * .116, -diag * .02)),",
"finish.clone().add(new THREE.Vector3(-diag * .032, diag * .090, -diag * .012)),",
'burst 3 origin')
patch(
"finish.clone().add(new THREE.Vector3(diag * .065, diag * .136, .018 * diag))",
"finish.clone().add(new THREE.Vector3(diag * .030, diag * .102, .010 * diag))",
'burst 4 origin')
patch(
"const skyTarget = finish.clone().add(new THREE.Vector3(-diag * .070, diag * .086, -diag * .018));",
"const skyTarget = finish.clone().add(new THREE.Vector3(-diag * .040, diag * .070, -diag * .015));",
'festival lower target')
patch(
"tweenCamera(tl, 36.05, 3.95, bluePos.clone().add(new THREE.Vector3(0, -diag * .004, 0)), skyTarget, 50.0, 'power2.inOut');",
"tweenCamera(tl, 35.75, 4.25, bluePos.clone().add(new THREE.Vector3(0, -diag * .003, 0)), skyTarget, 53.0, 'power2.inOut');",
'festival earlier wider camera')

out.write_text('// Scene 05 B v2.5.2 — final fireworks safe-frame correction.\n' + text, encoding='utf-8')
print(out)
