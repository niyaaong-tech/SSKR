#!/usr/bin/env python3
import re
from pathlib import Path

ROOT = Path.cwd()
src = ROOT / 'output' / 'scene05-b-v38.js'
out = ROOT / 'output' / 'scene05-b-v381.js'
text = src.read_text('utf-8')


def fail(label: str, detail: str) -> None:
    message = f'{label}: {detail}'
    print(f'::error title=Scene 05 B v3.8.1 patch::{message}')
    raise SystemExit(message)


def patch(old: str, new: str, label: str, count: int = 1):
    global text
    found = text.count(old)
    if found != count:
        fail(label, f'expected {count}, found {found}')
    text = text.replace(old, new, count)


def patch_re(pattern: str, repl: str, label: str, count: int = 1):
    global text
    text2, found = re.subn(pattern, repl, text, count=count)
    if found != count:
        fail(label, f'expected regex {count}, found {found}')
    text = text2


# ---------------------------------------------------------------------------
# 1) Higher-resolution canonical peninsula surface and photographic environment.
# ---------------------------------------------------------------------------
patch('./assets/peninsula_surface_v38.png', './assets/peninsula_surface_v381.png', 'v381 surface path')
patch('./assets/peninsula_mask_debug_v38.png', './assets/peninsula_mask_debug_v381.png', 'v381 mask path')
patch('./assets/sky_dawn_v37.jpg', './assets/sky_dawn_v381.jpg', 'v381 dawn path')
patch('./assets/sky_sunset_v37.jpg', './assets/sky_sunset_env_v381.jpg', 'v381 sunset environment path')
patch('./assets/cloud_veil_v37.png', './assets/cloud_veil_v381.png', 'v381 transparent cloud slot')

# v3.8 used a binary cutoff. v3.8.1 preserves the canonical SVG's high-resolution
# anti-alias coverage, with extrapolated land RGB underneath to avoid a dark fringe.
patch('    alphaTest: .42,', '    alphaTest: .08,', 'v381 antialiased canonical coast cutoff')

# Earlier passes changed the shallow-water RGB and strength more than once. Match the
# semantic shader expression instead of one historical color literal, preserve its
# tuned RGB, and reduce only the coastline-band strength.
patch_re(
    r'base=mix\(base,(vec3\([^\n;]+?\)),coast\*[0-9.]+\*coastDay\);',
    r'base=mix(base,\1,coast*0.045*coastDay);',
    'v381 shallow water restraint'
)

# The sunset panorama is now a photographic environment. Do not paint a second
# synthetic orange horizon over it.
patch(
    '''        float hdist=abs(vUv.y-.50);
        float horizon=1.0-smoothstep(.015,.30,hdist);
        float core=1.0-smoothstep(.010,.080,hdist);
        float warm=smoothstep(.42,1.0,uMix);
        c += vec3(.24,.075,.012)*horizon*warm*.34;
        c += vec3(.52,.16,.025)*core*warm*.30;
        float upper=smoothstep(.58,.92,vUv.y);
        c=mix(c,c*vec3(.88,.96,1.08),upper*.15);''',
    '''        // v3.8.1: visible horizon color is carried by the photographic source.
        // No synthetic warm band is added here.''',
    'remove synthetic v38 sky horizon'
)

# ---------------------------------------------------------------------------
# 2) Visible finale is DOM/CSS matte, intentionally outside EffectComposer.
#    This prevents UnrealBloom/tone mapping from blowing out the source photograph.
# ---------------------------------------------------------------------------
patch(
    "const stage = $('#three-stage');",
    "const stage = $('#three-stage');\nconst finaleMatteV381 = $('#finale-matte-v381');",
    'v381 DOM matte reference'
)

# The old sprite sun is the exact cause of the floating-in-front-of-the-sea error.
patch(
    '  sunSprite = new THREE.Sprite(sunMat);',
    '  sunSprite = new THREE.Sprite(sunMat);\n  sunSprite.visible = false;',
    'disable synthetic sun sprite'
)

# Keep procedural ocean only for the map/aerial phase. Never draw the synthetic
# sunset reflection lane: the photographic plate owns the visible final reflection.
patch(
    '  oceanUniforms.uCameraXZ.value.set(camera.position.x, camera.position.z);',
    '''  oceanUniforms.uCameraXZ.value.set(camera.position.x, camera.position.z);
  oceanUniforms.uReflectionStrength.value = 0.0;''',
    'disable synthetic reflection'
)

# The old westGlow was a screen-space substitute for sunset atmosphere. Restrain it
# once the photographic plate takes over.
patch(
    ".to(westGlow, { opacity: .46, duration: 3.6, ease: 'sine.inOut' }, 25.7)",
    ".to(westGlow, { opacity: .06, duration: 3.6, ease: 'sine.inOut' }, 25.7)",
    'v381 west glow restraint'
)

# A decisive photographic handoff avoids the long ghosted double-exposure seen in
# earlier iterations. The WebGL map stage fades out in lockstep as the 2D coastal
# photograph becomes dominant. By 24.3s no transparent map/island residue remains.
return_anchor = '  return tl;'
matte_timeline = r'''  if (finaleMatteV381) {
    gsap.set(finaleMatteV381, { opacity: 0, scale: 1.025 });
    tl.to(finaleMatteV381, { opacity: .08, duration: .35, ease: 'sine.inOut' }, 22.30)
      .to(stage, { opacity: .92, duration: .35, ease: 'sine.inOut' }, 22.30)
      .to(finaleMatteV381, { opacity: .24, duration: .42, ease: 'sine.inOut' }, 22.65)
      .to(stage, { opacity: .72, duration: .42, ease: 'sine.inOut' }, 22.65)
      .to(finaleMatteV381, { opacity: .72, duration: .60, ease: 'power2.inOut' }, 23.07)
      .to(stage, { opacity: .22, duration: .60, ease: 'power2.inOut' }, 23.07)
      .to(finaleMatteV381, { opacity: .96, duration: .62, ease: 'sine.inOut' }, 23.67)
      .to(stage, { opacity: 0, duration: .62, ease: 'sine.inOut' }, 23.67)
      .to(finaleMatteV381, { opacity: 1.0, scale: 1.0, duration: 1.15, ease: 'sine.out' }, 24.29);
  }

  window.__scene05V381State = () => ({
    matteOpacity: finaleMatteV381 ? Number(getComputedStyle(finaleMatteV381).opacity) : -1,
    matteVisible: !!finaleMatteV381,
    mapStageOpacity: stage ? Number(getComputedStyle(stage).opacity) : -1,
    syntheticSunVisible: !!(typeof sunSprite !== 'undefined' && sunSprite && sunSprite.visible),
    reflectionStrength: oceanUniforms.uReflectionStrength ? oceanUniforms.uReflectionStrength.value : -1
  });
'''
patch(return_anchor, matte_timeline + return_anchor, 'v381 DOM matte timeline')

# Surface diagnostic mode must never be hidden behind the photographic finale.
patch(
    '  if (photoSkySphere) photoSkySphere.visible = false;',
    '''  if (photoSkySphere) photoSkySphere.visible = false;
  if (stage) stage.style.opacity = '1';
  if (finaleMatteV381) {
    finaleMatteV381.style.display = 'none';
    finaleMatteV381.style.opacity = '0';
  }''',
    'hide DOM matte in coast diagnostics'
)

out.write_text(
    '// Scene 05 B v3.8.1 — high-resolution canonical coastline + post-process-free photographic finale.\n'
    '// Finale DOM asset: west_sunset_matte_v381.jpg\n'
    + text,
    encoding='utf-8'
)
print(out)