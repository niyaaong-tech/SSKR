#!/usr/bin/env python3
from pathlib import Path

ROOT = Path.cwd()
src = ROOT / 'output' / 'scene05-b-v381.js'
out = ROOT / 'output' / 'scene05-b-v383.js'
text = src.read_text('utf-8')


def fail(label: str, detail: str) -> None:
    message = f'{label}: {detail}'
    print(f'::error title=Scene 05 B v3.8.3 patch::{message}')
    raise SystemExit(message)


def patch(old: str, new: str, label: str, count: int = 1) -> None:
    global text
    found = text.count(old)
    if found != count:
        fail(label, f'expected {count}, found {found}')
    text = text.replace(old, new, count)


# Finale-only v3.8.3 pass. Everything before the existing 22s handoff remains untouched.
# The visible matte URL itself lives in index.html; generated JS carries the asset banner.
patch('// Finale DOM asset: west_sunset_matte_v381.jpg', '// Finale DOM asset: west_sunset_matte_v383.jpg', 'v383 finale matte banner')
patch("const finaleMatteV381 = $('#finale-matte-v381');", "const finaleMatteV383 = $('#finale-matte-v383');", 'v383 matte DOM reference')
patch("const sceneMarkV382 = document.querySelector('.scene-mark');", "const sceneMarkV383 = document.querySelector('.scene-mark');", 'v383 scene mark reference')

old_timeline = r'''  if (sceneMarkV382) {
    tl.to(sceneMarkV382, { opacity: 0, duration: .52, ease: 'sine.inOut' }, 21.86);
  }
  if (finaleMatteV381) {
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
    sceneMarkOpacity: sceneMarkV382 ? Number(getComputedStyle(sceneMarkV382).opacity) : -1,
    syntheticSunVisible: !!(typeof sunSprite !== 'undefined' && sunSprite && sunSprite.visible),
    reflectionStrength: oceanUniforms.uReflectionStrength ? oceanUniforms.uReflectionStrength.value : -1
  });
'''
new_timeline = r'''  if (sceneMarkV383) {
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
patch(old_timeline, new_timeline, 'v383 matte handoff timeline')

# The inherited v3.5/v3.8.2 finale tries to bring the live scene mark back to .08 at
# 25.7s. The selected artwork already contains its own restrained scene mark, so keep
# the HTML mark at zero throughout the matte hold.
patch(
    ".to(sceneMark, { opacity: .08, duration: 1.4 }, 25.7)",
    ".to(sceneMark, { opacity: 0, duration: .01 }, 25.7)",
    'v383 prevent live scene mark re-entry'
)

# v3.8.2's actual statement tween is a multiline block inherited from v3.5:
# 26.15s start / 2.25s reveal. Replace that exact block, leaving a clean sunset
# appreciation beat after the matte settles and a ~3.8s readable hold at the end.
old_statement = r'''    .to(statement, {
      opacity: 1,
      clipPath: 'inset(0 0% 0 0)',
      filter: 'blur(0px)',
      letterSpacing: '-.035em',
      duration: 2.25,
      ease: 'power2.out'
    }, 26.15);'''
new_statement = r'''    .to(statement, {
      opacity: .97,
      clipPath: 'inset(0 0% 0 0)',
      filter: 'blur(0px)',
      letterSpacing: '-.035em',
      duration: .85,
      ease: 'power2.out'
    }, 25.35);'''
patch(old_statement, new_statement, 'v383 message reveal timing')

# Diagnostic mode stays authoritative: no finale matte or live mark can cover coastline checks.
patch("if (sceneMarkV382) sceneMarkV382.style.opacity = '0';", "if (sceneMarkV383) sceneMarkV383.style.opacity = '0';", 'v383 diagnostic scene mark')
patch('if (finaleMatteV381) {', 'if (finaleMatteV383) {', 'v383 diagnostic matte guard')
patch("finaleMatteV381.style.display = 'none';", "finaleMatteV383.style.display = 'none';", 'v383 diagnostic matte display')
patch("finaleMatteV381.style.opacity = '0';", "finaleMatteV383.style.opacity = '0';", 'v383 diagnostic matte opacity')

# Normalize generated-source banner only; no 0-22s choreography code is changed here.
text = text.replace('Scene 05 B v3.8.2 — canonical coastline + SSKR generated-art sunset finale.',
                    'Scene 05 B v3.8.3 — v3.8.2 map choreography + user-provided West Sea sunset finale.', 1)

out.write_text(text, encoding='utf-8')
print(out)
