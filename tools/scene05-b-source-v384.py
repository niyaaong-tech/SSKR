#!/usr/bin/env python3
from pathlib import Path

ROOT = Path.cwd()
src = ROOT / 'output' / 'scene05-b-v383.js'
out = ROOT / 'output' / 'scene05-b-v384.js'
text = src.read_text('utf-8')


def fail(label: str, detail: str) -> None:
    message = f'{label}: {detail}'
    print(f'::error title=Scene 05 B v3.8.4 patch::{message}')
    raise SystemExit(message)


def patch(old: str, new: str, label: str, count: int = 1) -> None:
    global text
    found = text.count(old)
    if found != count:
        fail(label, f'expected {count}, found {found}')
    text = text.replace(old, new, count)


# v3.8.4 is finale-only. The accepted 0-22s map/route choreography remains untouched.
patch(
    "const finaleMatteV383 = $('#finale-matte-v383');",
    "const finaleMatteV384 = $('#finale-matte-v384');\nconst finaleStillV384_1 = $('#finale-still-v384-1');\nconst finaleStillV384_2 = $('#finale-still-v384-2');\nconst finaleStillV384_3 = $('#finale-still-v384-3');",
    'v384 finale DOM references'
)
patch(
    "const sceneMarkV383 = document.querySelector('.scene-mark');",
    "const sceneMarkV384 = document.querySelector('.scene-mark');",
    'v384 scene mark reference'
)

old_timeline = r'''  if (sceneMarkV383) {
    tl.to(sceneMarkV383, { opacity: 0, duration: .48, ease: 'sine.inOut' }, 21.72);
  }
  if (finaleMatteV383) {
    gsap.set(finaleMatteV383, { opacity: 0, scale: 1.018 });
    // v3.8.3: short, decisive handoff. The map is completely gone before the
    // authored sunset becomes a hold, avoiding a prolonged ghosted double exposure.
    tl.to(finaleMatteV383, { opacity: .12, duration: .28, ease: 'sine.inOut' }, 22.16)
      .to(stage, { opacity: .88, duration: .28, ease: 'sine.inOut' }, 22.16)
      .to(finaleMatteV383, { opacity: .38, duration: .36, ease: 'sine.inOut' }, 22.44)
      .to(stage, { opacity: .62, duration: .36, ease: 'sine.inOut' }, 22.44)
      .to(finaleMatteV383, { opacity: .78, duration: .46, ease: 'power2.inOut' }, 22.80)
      .to(stage, { opacity: .22, duration: .26, ease: 'power2.inOut' }, 22.80)
      .to(stage, { opacity: 0, duration: .32, ease: 'sine.inOut' }, 23.06)
      .to(finaleMatteV383, { opacity: .98, duration: .54, ease: 'sine.inOut' }, 23.26)
      .to(finaleMatteV383, { opacity: 1.0, scale: 1.0, duration: .65, ease: 'sine.out' }, 23.80);
  }

  window.__scene05V383State = () => ({
    matteOpacity: finaleMatteV383 ? Number(getComputedStyle(finaleMatteV383).opacity) : -1,
    matteVisible: !!finaleMatteV383,
    mapStageOpacity: stage ? Number(getComputedStyle(stage).opacity) : -1,
    sceneMarkOpacity: sceneMarkV383 ? Number(getComputedStyle(sceneMarkV383).opacity) : -1,
    statementOpacity: statement ? Number(getComputedStyle(statement).opacity) : -1,
    syntheticSunVisible: !!(typeof sunSprite !== 'undefined' && sunSprite && sunSprite.visible),
    reflectionStrength: oceanUniforms.uReflectionStrength ? oceanUniforms.uReflectionStrength.value : -1
  });
'''
new_timeline = r'''  if (sceneMarkV384) {
    tl.to(sceneMarkV384, { opacity: 0, duration: .48, ease: 'sine.inOut' }, 21.72);
  }
  if (finaleMatteV384) {
    gsap.set(finaleMatteV384, { opacity: 0, scale: 1.018 });
    gsap.set(finaleStillV384_1, { opacity: 1 });
    gsap.set([finaleStillV384_2, finaleStillV384_3], { opacity: 0 });

    // Keep the accepted v3.8.3 map-to-finale handoff, but make the first
    // user still the authored finale surface.
    tl.to(finaleMatteV384, { opacity: .12, duration: .28, ease: 'sine.inOut' }, 22.16)
      .to(stage, { opacity: .88, duration: .28, ease: 'sine.inOut' }, 22.16)
      .to(finaleMatteV384, { opacity: .38, duration: .36, ease: 'sine.inOut' }, 22.44)
      .to(stage, { opacity: .62, duration: .36, ease: 'sine.inOut' }, 22.44)
      .to(finaleMatteV384, { opacity: .78, duration: .46, ease: 'power2.inOut' }, 22.80)
      .to(stage, { opacity: .22, duration: .26, ease: 'power2.inOut' }, 22.80)
      .to(stage, { opacity: 0, duration: .32, ease: 'sine.inOut' }, 23.06)
      .to(finaleMatteV384, { opacity: .98, duration: .54, ease: 'sine.inOut' }, 23.26)
      .to(finaleMatteV384, { opacity: 1.0, scale: 1.0, duration: .65, ease: 'sine.out' }, 23.80)

      // User direction: still 01 for 3s from finale entry, smooth switch to
      // still 02, then two seconds later smooth switch to still 03.
      .to(finaleStillV384_2, { opacity: 1, duration: .72, ease: 'sine.inOut' }, 25.16)
      .to(finaleStillV384_1, { opacity: 0, duration: .72, ease: 'sine.inOut' }, 25.16)
      .to(finaleStillV384_3, { opacity: 1, duration: .72, ease: 'sine.inOut' }, 27.16)
      .to(finaleStillV384_2, { opacity: 0, duration: .72, ease: 'sine.inOut' }, 27.16);
  }

  window.__scene05V384State = () => ({
    matteOpacity: finaleMatteV384 ? Number(getComputedStyle(finaleMatteV384).opacity) : -1,
    matteVisible: !!finaleMatteV384,
    still1Opacity: finaleStillV384_1 ? Number(getComputedStyle(finaleStillV384_1).opacity) : -1,
    still2Opacity: finaleStillV384_2 ? Number(getComputedStyle(finaleStillV384_2).opacity) : -1,
    still3Opacity: finaleStillV384_3 ? Number(getComputedStyle(finaleStillV384_3).opacity) : -1,
    mapStageOpacity: stage ? Number(getComputedStyle(stage).opacity) : -1,
    sceneMarkOpacity: sceneMarkV384 ? Number(getComputedStyle(sceneMarkV384).opacity) : -1,
    statementOpacity: statement ? Number(getComputedStyle(statement).opacity) : -1,
    syntheticSunVisible: !!(typeof sunSprite !== 'undefined' && sunSprite && sunSprite.visible),
    reflectionStrength: oceanUniforms.uReflectionStrength ? oceanUniforms.uReflectionStrength.value : -1
  });
'''
patch(old_timeline, new_timeline, 'v384 three-still timeline')

# The central copy enters once, then remains fixed while all still transitions occur.
old_statement = r'''    .to(statement, {
      opacity: .97,
      clipPath: 'inset(0 0% 0 0)',
      filter: 'blur(0px)',
      letterSpacing: '-.035em',
      duration: .85,
      ease: 'power2.out'
    }, 25.35);'''
new_statement = r'''    .to(statement, {
      opacity: .97,
      clipPath: 'inset(0 0% 0 0)',
      filter: 'blur(0px)',
      letterSpacing: '-.035em',
      duration: .55,
      ease: 'power2.out'
    }, 23.65);'''
patch(old_statement, new_statement, 'v384 fixed central message timing')

# Diagnostic mode must hide every finale layer so coastline checks remain authoritative.
patch("if (sceneMarkV383) sceneMarkV383.style.opacity = '0';", "if (sceneMarkV384) sceneMarkV384.style.opacity = '0';", 'v384 diagnostic scene mark')
patch('if (finaleMatteV383) {', 'if (finaleMatteV384) {', 'v384 diagnostic matte guard')
patch("finaleMatteV383.style.display = 'none';", "finaleMatteV384.style.display = 'none';", 'v384 diagnostic matte display')
patch("finaleMatteV383.style.opacity = '0';", "finaleMatteV384.style.opacity = '0';", 'v384 diagnostic matte opacity')

text = text.replace(
    'Scene 05 B v3.8.3 — v3.8.2 map choreography + user-provided West Sea sunset finale.',
    'Scene 05 B v3.8.4 — v3.8.2 map choreography + three user-provided finale stills.',
    1
)
text = text.replace('// Finale DOM asset: west_sunset_matte_v383.jpg', '// Finale DOM assets: finale_still_01_v384.webp / finale_still_02_v384.webp / finale_still_03_v384.webp', 1)

out.write_text(text, encoding='utf-8')
print(out)
