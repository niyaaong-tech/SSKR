#!/usr/bin/env python3
from pathlib import Path

ROOT = Path.cwd()
src = ROOT / 'output' / 'scene05-b-v25.js'
out = ROOT / 'output' / 'scene05-b-v251.js'
text = src.read_text('utf-8')


def patch(old: str, new: str, label: str, count: int = 1):
    global text
    found = text.count(old)
    if found < count:
        raise SystemExit(f'{label}: expected >= {count}, found {found}')
    text = text.replace(old, new, count)


# Ocean geometry must never rise through the 2D land underlay. Keep visual water
# motion primarily in fragment shimmer / reflection instead of large vertex waves.
patch("float w1=sin((p.x+uTime*0.34)*0.24)*0.035;", "float w1=sin((p.x+uTime*0.34)*0.24)*0.0050;", 'ocean wave 1')
patch("float w2=sin((p.y-uTime*0.21)*0.31)*0.025;", "float w2=sin((p.y-uTime*0.21)*0.31)*0.0038;", 'ocean wave 2')
patch("float w3=sin((p.x+p.y+uTime*0.16)*0.13)*0.018;", "float w3=sin((p.x+p.y+uTime*0.16)*0.13)*0.0028;", 'ocean wave 3')

# Give the canonical full-peninsula texture a slightly safer establishing frame.
patch(
    "tweenCamera(tl, 0.0, 1.35, establishPos, peninsulaCenter.clone().add(new THREE.Vector3(peninsulaDiag * .01, 0, peninsulaDiag * .01)), 36.0, 'power1.inOut');",
    "tweenCamera(tl, 0.0, 1.35, establishPos, peninsulaCenter.clone().add(new THREE.Vector3(peninsulaDiag * .01, 0, peninsulaDiag * .01)), 39.0, 'power1.inOut');",
    'establish framing')

# Route-freedom layer should be legible enough to read as optional road choice,
# while remaining subordinate to the gold Main Routes.
patch("{ opacity: .145, duration: 3.2", "{ opacity: .180, duration: 3.2", 'road possibility peak')
patch("{ opacity: .115, duration: 6.0", "{ opacity: .145, duration: 6.0", 'road possibility sustain')
patch("{ opacity: .42, duration: .26 }", "{ opacity: .50, duration: .26 }", 'choice route core', count=1)

# Earlier bursts were still vulnerable to top-frame clipping before the camera
# completed its tilt. Lower all festival burst origins and keep the wider v2.5 FOV.
for old, new, label in [
    ("diag * .102", "diag * .078", 'firework origin 1 safe'),
    ("diag * .124", "diag * .096", 'firework origin 2 safe'),
    ("diag * .146", "diag * .116", 'firework origin 3 safe'),
    ("diag * .164", "diag * .136", 'firework origin 4 safe'),
]:
    patch(old, new, label)
patch(
    "tweenCamera(tl, 36.45, 3.55, bluePos.clone().add(new THREE.Vector3(0, -diag * .004, 0)), skyTarget, 49.0, 'power2.inOut');",
    "tweenCamera(tl, 36.05, 3.95, bluePos.clone().add(new THREE.Vector3(0, -diag * .004, 0)), skyTarget, 50.0, 'power2.inOut');",
    'firework earlier safe tilt')

out.write_text('// Scene 05 B v2.5.1 — land/ocean integrity, stronger route freedom and fireworks safe-frame corrections.\n' + text, encoding='utf-8')
print(out)
