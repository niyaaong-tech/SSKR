#!/usr/bin/env python3
from pathlib import Path

ROOT=Path.cwd()
src=ROOT/'output'/'scene05-b-v27.js'
out=ROOT/'output'/'scene05-b-v28.js'
text=src.read_text('utf-8')


def patch(old,new,label,count=1):
    global text
    n=text.count(old)
    if n<count:raise SystemExit(f'{label}: expected >= {count}, found {n}')
    text=text.replace(old,new,count)

# New seamless physical-relief texture. Canonical alpha remains unchanged.
patch('./assets/peninsula_surface_v26.png','./assets/peninsula_surface_v28.png','v28 texture url')
patch('./assets/peninsula_surface_v26.json','./assets/peninsula_surface_v28.json','v28 texture meta')

# The dense actual road web must become visible at decision scale. Render above the
# shallow terrain with a quiet warm-neutral line, never as a bright HUD overlay.
patch("function roadPossibilityFromHints(hints, maxSegments = 15000) {","function roadPossibilityFromHints(hints, maxSegments = 32000) {",'denser actual road web')
patch("color: 0x76817a, linewidth: .52, transparent: true, opacity: 0, depthTest: true","color: 0xb9b7a4, linewidth: .62, transparent: true, opacity: 0, depthTest: false",'road web visibility')
patch("lines.renderOrder = 5;","lines.renderOrder = 5;",'road render order')
patch("{ opacity: .080, duration: 1.0, ease: 'sine.out' }, 8.4","{ opacity: .095, duration: 1.0, ease: 'sine.out' }, 7.8",'roads before first decision')
patch("{ opacity: .115, duration: 3.4, ease: 'sine.inOut' }, 11.2","{ opacity: .175, duration: 3.4, ease: 'sine.inOut' }, 10.3",'road web decision peak')
patch("{ opacity: .095, duration: 6.0, ease: 'sine.inOut' }, 17.0","{ opacity: .135, duration: 6.0, ease: 'sine.inOut' }, 16.2",'road web network sustain')
patch("{ opacity: .035, duration: 2.2, ease: 'sine.inOut' }, 25.5","{ opacity: .055, duration: 2.2, ease: 'sine.inOut' }, 25.0",'road web west fade')

# Actual-road exploration highlights are a little smaller/brighter than the five
# long Main Routes: they read as chosen local detours, not another nationwide overlay.
patch("color: 0xeaa04e, width: 2.7","color: 0xf0a84f, width: 2.25",'exploration glow styling')
patch("color: 0xffd58a, width: 1.05","color: 0xffdf9c, width: .92",'exploration core styling')
patch("{ opacity: .66, duration: .20 }","{ opacity: .76, duration: .20 }",'hero branch visibility')
patch("{ opacity: .48, duration: .22 }","{ opacity: .55, duration: .22 }",'field branch visibility')

# Main long-form routes are examples, not prescribed courses. Lower their weight in
# the nationwide reveal so the neutral road field + local choices remain readable.
patch("{ opacity: .88, duration: .26 }","{ opacity: .76, duration: .26 }",'main route examples restraint')
patch("{ opacity: .96, duration: .25 }","{ opacity: .91, duration: .25 }",'hero route restraint')
patch("{ opacity: .50, duration: 2.0, ease: 'sine.inOut' }, 14.0","{ opacity: .31, duration: 2.0, ease: 'sine.inOut' }, 14.0",'merged network restraint')

# Sunset sun is smaller and fades at the horizon rather than descending visibly onto
# the water surface. The sunset should feel spatial, not like another Finish node.
patch("sunSprite.scale.set(diag * .082, diag * .082, 1);","sunSprite.scale.set(diag * .052, diag * .052, 1);",'smaller sun')
patch(".to(sunSprite.position, { y: finish.y + diag * .014, duration: 8.0, ease: 'sine.inOut' }, 27.0)",".to(sunSprite.position, { y: finish.y + diag * .046, duration: 6.0, ease: 'sine.inOut' }, 27.0)",'sun stays at horizon')
patch(".to(sunSprite.material, { opacity: 0, duration: 1.8, ease: 'sine.in' }, 34.4);",".to(sunSprite.material, { opacity: 0, duration: 1.35, ease: 'sine.in' }, 32.85);",'sun fades before water artifact')

# Tone: slightly brighter land in the daylight choice chapter and more filmic blue sea.
patch("{ r: 1.08, g: 1.02, b: .91, duration: 4.2","{ r: 1.14, g: 1.08, b: .98, duration: 4.2",'day texture brightness')
patch("renderer.toneMappingExposure = 1.08;","renderer.toneMappingExposure = 1.12;",'final exposure lift')

out.write_text('// Scene 05 B v2.8 — seamless DEM-led aerial texture, legible actual-road choice field and restrained sunset.\n'+text,encoding='utf-8')
print(out)
