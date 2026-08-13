#!/usr/bin/env python3
import re
from pathlib import Path

ROOT = Path.cwd()
src = ROOT / 'output' / 'scene05-b-v384.js'
out = ROOT / 'output' / 'scene05-c-v01.js'
text = src.read_text('utf-8')


def fail(label: str, detail: str) -> None:
    message = f'{label}: {detail}'
    print(f'::error title=Scene 05 C ocean texture patch::{message}')
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
# Scene 05 C v0.1
# Ocean-only experiment on top of the accepted B v3.8.4 choreography.
# Geography, terrain assets, route topology, camera timing and finale are untouched.
# The sea is deliberately rendered as a near-flat 2D aerial texture plate.
# ---------------------------------------------------------------------------

# Keep the ocean plane effectively flat. Perspective now comes from the camera,
# lighting and texture only, not from visible 3D wave geometry.
patch(
    '      p.z+=vWave;',
    '      p.z+=vWave*0.015;',
    'flatten ocean geometry'
)

# Slightly more opaque water gives the texture plate enough body against the
# photographic atmosphere without turning it into a solid cyan map.
patch(
    '  uOpacity: { value: 0.94 },',
    '  uOpacity: { value: 0.985 },',
    'ocean opacity'
)

# Rich aerial-water palette: deep blue offshore, cooler dawn, natural day blue,
# restrained dusk. This remains time-aware but avoids the former flat dark fill.
patch_re(
    r'''      vec3 dawn=vec3\([^\n]+\);\n      vec3 day=vec3\([^\n]+\);\n      vec3 sunset=vec3\([^\n]+\);\n      vec3 night=vec3\([^\n]+\);''',
    '''      vec3 dawn=vec3(0.018,0.105,0.170);\n      vec3 day=vec3(0.020,0.205,0.315);\n      vec3 sunset=vec3(0.040,0.110,0.175);\n      vec3 night=vec3(0.010,0.040,0.078);''',
    'c ocean phase palette'
)

# Add compact procedural 2D noise helpers inside the ocean fragment shader.
# They create photographic-looking surface grain without external image assets.
patch(
    '''      return mix(sunset,night,smoothstep(2.0,3.0,p));\n    }\n    void main(){''',
    '''      return mix(sunset,night,smoothstep(2.0,3.0,p));\n    }\n    float hash21(vec2 p){\n      p=fract(p*vec2(123.34,456.21));\n      p+=dot(p,p+45.32);\n      return fract(p.x*p.y);\n    }\n    float noise21(vec2 p){\n      vec2 i=floor(p);\n      vec2 f=fract(p);\n      f=f*f*(3.0-2.0*f);\n      return mix(mix(hash21(i),hash21(i+vec2(1.0,0.0)),f.x),\n                 mix(hash21(i+vec2(0.0,1.0)),hash21(i+vec2(1.0,1.0)),f.x),f.y);\n    }\n    float fbm21(vec2 p){\n      float v=0.0;\n      float a=0.52;\n      mat2 r=mat2(0.80,-0.60,0.60,0.80);\n      for(int i=0;i<4;i++){\n        v+=a*noise21(p);\n        p=r*p*2.03+vec2(13.7,7.9);\n        a*=0.48;\n      }\n      return v;\n    }\n    void main(){''',
    '2d ocean noise helpers'
)

# Make the coast read as translucent shallow water rather than a neon outline.
# coast_shallow.png remains tied to the existing terrain bounds, so this changes
# color only; it does not modify the canonical coastline or peninsula geometry.
patch_re(
    r'''      base=mix\(base,(vec3\([^\n;]+?\)),coast\*[0-9.]+\*coastDay\);''',
    '''      float shallow=pow(clamp(coast,0.0,1.0),0.72);\n      base=mix(base,vec3(0.018,0.330,0.390),shallow*0.36*coastDay);\n      base+=vec3(0.010,0.055,0.060)*shallow*(1.0-shallow)*0.22*coastDay;''',
    'translucent coastal water'
)

# Replace the former sine-only micro pattern with layered slow 2D water texture.
patch_re(
    r'''      float micro=[^\n]+;''',
    '''      vec2 flowUv=vUv*vec2(1.0,1.12);\n      float field=fbm21(flowUv*13.0+vec2(uTime*0.006,-uTime*0.004));\n      float fine=fbm21(flowUv*67.0+vec2(-uTime*0.010,uTime*0.008)+field*1.9);\n      float rippleA=0.5+0.5*sin((vUv.x*410.0+vUv.y*118.0)+uTime*0.10+field*5.0);\n      float rippleB=0.5+0.5*sin((vUv.y*335.0-vUv.x*76.0)-uTime*0.075+fine*4.0);\n      float micro=clamp(fine*0.72+field*0.28,0.0,1.0);''',
    'layered 2d ocean texture'
)

patch(
    '      float broad=0.0;',
    '      float broad=(field-0.5)*1.34;',
    'soft large-scale ocean variation'
)

patch(
    '      float shimmer=0.5+0.5*micro;',
    '''      float shimmer=smoothstep(0.36,0.86,micro);\n      float glint=pow(max(0.0,rippleA*rippleB),5.5);''',
    'water shimmer and glint'
)

# Keep surface texture restrained, then add tiny cool-white reflection flecks.
patch_re(
    r'''      c\+=vec3\(0\.018,0\.031,0\.043\)\*shimmer\*0\.11;''',
    '''      c+=vec3(0.014,0.030,0.042)*(0.35+0.65*shimmer)*0.16;\n      float sheenMask=smoothstep(0.02,0.98,1.0-length((vUv-vec2(0.15,0.14))*vec2(0.72,1.06)));\n      c+=vec3(0.42,0.55,0.62)*glint*sheenMask*(0.025+0.055*(1.0-warm));''',
    'aerial surface reflection flecks'
)

# Disable every cloud system for C. B's photographic sky remains available as an
# atmosphere source, but no legacy sprites or photo cloud planes may be visible.
patch(
    '  buildPhotoEnvironment(photoDawnTex, photoSunsetTex, photoCloudTex);',
    '''  buildPhotoEnvironment(photoDawnTex, photoSunsetTex, photoCloudTex);\n  cloudGroup.visible = false;\n  photoCloudPlanes.forEach(p => { p.visible = false; p.material.opacity = 0; });''',
    'disable all clouds after environment build'
)

patch(
    '  if (photoSkySphere) photoSkySphere.position.copy(camera.position);',
    '''  if (photoSkySphere) photoSkySphere.position.copy(camera.position);\n  cloudGroup.visible = false;\n  photoCloudPlanes.forEach(p => { p.visible = false; p.material.opacity = 0; });''',
    'hold clouds disabled during render'
)

# Small inspection hook for automated C smoke QA.
patch(
    'let timeline = null;',
    '''let timeline = null;\nwindow.__scene05COceanState = () => ({\n  oceanOpacity: oceanUniforms.uOpacity.value,\n  oceanPhase: oceanUniforms.uPhase.value,\n  legacyCloudGroupVisible: cloudGroup.visible,\n  photoCloudVisible: (typeof photoCloudPlanes !== 'undefined') ? photoCloudPlanes.some(p => p.visible && p.material.opacity > .001) : false\n});''',
    'C ocean QA state hook'
)

text = '// Scene 05 C v0.1 — near-flat 2D aerial ocean texture study; B v3.8.4 geography/choreography preserved.\n' + text
out.write_text(text, encoding='utf-8')
print(out)
