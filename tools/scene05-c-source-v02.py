#!/usr/bin/env python3
import re
from pathlib import Path

ROOT = Path.cwd()
src = ROOT / 'output' / 'scene05-b-v384.js'
out = ROOT / 'output' / 'scene05-c-v02.js'
text = src.read_text('utf-8')


def fail(label: str, detail: str) -> None:
    message = f'{label}: {detail}'
    print(f'::error title=Scene 05 C v0.2 ocean cleanup::{message}')
    raise SystemExit(message)


def patch(old: str, new: str, label: str, count: int = 1) -> None:
    global text
    found = text.count(old)
    if found != count:
        fail(label, f'expected {count}, found {found}')
    text = text.replace(old, new, count)


def patch_re(pattern: str, repl: str, label: str, count: int = 1, flags: int = 0) -> None:
    global text
    text2, found = re.subn(pattern, repl, text, count=count, flags=flags)
    if found != count:
        fail(label, f'expected regex {count}, found {found}')
    text = text2


# ---------------------------------------------------------------------------
# Scene 05 C v0.2
# Rebuild the ocean as a clean 2D map surface on top of the accepted B v3.8.4.
# No geography, route topology, camera choreography, finale timing or copy changes.
# ---------------------------------------------------------------------------

# Completely flatten the ocean mesh. C v0.1 still retained enough displaced
# geometry to reveal large faceted forms on mobile; v0.2 removes that source.
patch(
    '      p.z+=vWave;',
    '      p.z+=0.0;',
    'fully flatten ocean geometry'
)

# Make the plate fully opaque so the low-poly mesh / underlying atmosphere cannot
# bleed through as triangular or wedge-shaped patches.
patch(
    '  uOpacity: { value: 0.94 },',
    '  uOpacity: { value: 1.0 },',
    'opaque 2d ocean plate'
)

# B contains two explicit synthetic-reflection locks in its render/diagnostic paths.
# C owns the sea as an opaque 2D plate, so both paths re-lock opacity as well. This
# prevents the inherited timeline from reopening transparency after a seek.
patch(
    '  oceanUniforms.uReflectionStrength.value = 0.0;',
    '''  oceanUniforms.uReflectionStrength.value = 0.0;\n  oceanUniforms.uOpacity.value = 1.0;''',
    'lock 2d ocean opacity during render',
    count=2
)

# Restrained aerial palette. The sea should read as a clean map texture rather than
# a synthetic cyan effect.
patch_re(
    r'''      vec3 dawn=vec3\([^\n]+\);\n      vec3 day=vec3\([^\n]+\);\n      vec3 sunset=vec3\([^\n]+\);\n      vec3 night=vec3\([^\n]+\);''',
    '''      vec3 dawn=vec3(0.018,0.090,0.140);\n      vec3 day=vec3(0.026,0.170,0.245);\n      vec3 sunset=vec3(0.036,0.090,0.130);\n      vec3 night=vec3(0.008,0.030,0.060);''',
    'clean ocean phase palette'
)

# C v0.1 over-emphasised the inherited shallow-water data. Keep only a faint
# coastal hue cue so there is no glowing or polygonal offshore band.
patch_re(
    r'''      base=mix\(base,(vec3\([^\n;]+?\)),coast\*[0-9.]+\*coastDay\);''',
    '''      base=mix(base,vec3(0.030,0.255,0.295),coast*0.025*coastDay);''',
    'restrained shallow-water tint'
)

# Replace large FBM fields with extremely small, high-frequency 2D ripple grain.
# No broad cloud-like variation and no low-frequency texture islands.
patch_re(
    r'''      float micro=[^\n]+;''',
    '''      vec2 texUv=vUv*vec2(1.0,1.08);\n      float rippleA=0.5+0.5*sin(texUv.x*520.0+texUv.y*74.0+uTime*0.045);\n      float rippleB=0.5+0.5*sin(texUv.y*610.0-texUv.x*96.0-uTime*0.032);\n      float micro=rippleA*rippleB;''',
    'fine 2d ocean grain'
)

# Keep broad variation disabled and reduce shimmer to a near-print texture level.
patch(
    '      float broad=0.0;',
    '      float broad=0.0;',
    'confirm broad variation disabled'
)
patch(
    '      float shimmer=0.5+0.5*micro;',
    '      float shimmer=micro;',
    'restrain ocean shimmer'
)
patch_re(
    r'''      c\+=vec3\(0\.018,0\.031,0\.043\)\*shimmer\*0\.11;''',
    '''      c+=vec3(0.010,0.020,0.028)*shimmer*0.035;''',
    'low-contrast ocean micro texture'
)

# C policy: no cloud sprite group and no photographic cloud planes.
patch(
    '  buildPhotoEnvironment(photoDawnTex, photoSunsetTex, photoCloudTex);',
    '''  buildPhotoEnvironment(photoDawnTex, photoSunsetTex, photoCloudTex);\n  cloudGroup.visible = false;\n  photoCloudPlanes.forEach(p => { p.visible = false; p.material.opacity = 0; });''',
    'disable clouds after environment build'
)
patch(
    '  if (photoSkySphere) photoSkySphere.position.copy(camera.position);',
    '''  if (photoSkySphere) photoSkySphere.position.copy(camera.position);\n  cloudGroup.visible = false;\n  photoCloudPlanes.forEach(p => { p.visible = false; p.material.opacity = 0; });''',
    'hold clouds disabled during render'
)

# Inspection hook for QA.
patch(
    'let timeline = null;',
    '''let timeline = null;\nwindow.__scene05COceanState = () => ({\n  version: '0.2',\n  oceanOpacity: oceanUniforms.uOpacity.value,\n  oceanPhase: oceanUniforms.uPhase.value,\n  legacyCloudGroupVisible: cloudGroup.visible,\n  photoCloudVisible: (typeof photoCloudPlanes !== 'undefined') ? photoCloudPlanes.some(p => p.visible && p.material.opacity > .001) : false\n});''',
    'C v0.2 ocean QA state hook'
)

text = '// Scene 05 C v0.2 — fully flat, opaque, low-contrast 2D ocean texture; B v3.8.4 choreography/finale preserved.\n' + text
out.write_text(text, encoding='utf-8')
print(out)
