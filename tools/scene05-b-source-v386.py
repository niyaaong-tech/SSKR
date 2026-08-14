#!/usr/bin/env python3
from pathlib import Path

ROOT = Path.cwd()
src = ROOT / 'output' / 'scene05-b-v384.js'
out = ROOT / 'output' / 'scene05-b-v386.js'
text = src.read_text('utf-8')


def fail(label: str, detail: str) -> None:
    message = f'{label}: {detail}'
    print(f'::error title=Scene 05 B v3.8.6 patch::{message}')
    raise SystemExit(message)


def patch(old: str, new: str, label: str, count: int = 1) -> None:
    global text
    found = text.count(old)
    if found != count:
        fail(label, f'expected {count}, found {found}')
    text = text.replace(old, new, count)


patch(
    "const finaleCross23V384 = { value: 0 };",
    "const finaleCross23V384 = { value: 0 };\n"
    "const finaleBlackoutV386 = $('#finale-blackout-v386');\n"
    "const journeyCopyV386_1 = $('#journey-copy-v386-1');\n"
    "const journeyCopyV386_2 = $('#journey-copy-v386-2');\n"
    "const journeyCopyV386_3 = $('#journey-copy-v386-3');",
    'v386 narrative and blackout DOM references'
)

old_timeline = r'''  if (sceneMarkV384) {
    tl.to(sceneMarkV384, { opacity: 0, duration: .48, ease: 'sine.inOut' }, 21.72);
  }
  if (finaleMatteV384) {
    gsap.set(finaleMatteV384, { opacity: 0, scale: 1.018 });
    gsap.set(finaleStillV384_1, { opacity: 1 });
    gsap.set([finaleStillV384_2, finaleStillV384_3], { opacity: 0 });
    finaleCross12V384.value = 0;
    finaleCross23V384.value = 0;

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
      // still 02, then exactly two seconds later smooth switch to still 03.
      // One shared progress tween drives each pair so their opacities remain
      // complementary during normal playback and arbitrary QA timeline seeks.
      .to(finaleCross12V384, {
        value: 1,
        duration: .72,
        ease: 'sine.inOut',
        onUpdate: () => {
          const p = finaleCross12V384.value;
          if (finaleStillV384_1) finaleStillV384_1.style.opacity = String(1 - p);
          if (finaleStillV384_2) finaleStillV384_2.style.opacity = String(p);
        }
      }, 25.16)
      .to(finaleCross23V384, {
        value: 1,
        duration: .72,
        ease: 'sine.inOut',
        onUpdate: () => {
          const p = finaleCross23V384.value;
          if (finaleStillV384_2) finaleStillV384_2.style.opacity = String(1 - p);
          if (finaleStillV384_3) finaleStillV384_3.style.opacity = String(p);
        }
      }, 27.16);
  }

  window.__scene05V384State = () => ({
    matteOpacity: finaleMatteV384 ? Number(getComputedStyle(finaleMatteV384).opacity) : -1,
    matteVisible: !!finaleMatteV384,
    still1Opacity: finaleStillV384_1 ? Number(getComputedStyle(finaleStillV384_1).opacity) : -1,
    still2Opacity: finaleStillV384_2 ? Number(getComputedStyle(finaleStillV384_2).opacity) : -1,
    still3Opacity: finaleStillV384_3 ? Number(getComputedStyle(finaleStillV384_3).opacity) : -1,
    cross12Progress: finaleCross12V384.value,
    cross23Progress: finaleCross23V384.value,
    mapStageOpacity: stage ? Number(getComputedStyle(stage).opacity) : -1,
    sceneMarkOpacity: sceneMarkV384 ? Number(getComputedStyle(sceneMarkV384).opacity) : -1,
    statementOpacity: statement ? Number(getComputedStyle(statement).opacity) : -1,
    syntheticSunVisible: !!(typeof sunSprite !== 'undefined' && sunSprite && sunSprite.visible),
    reflectionStrength: oceanUniforms.uReflectionStrength ? oceanUniforms.uReflectionStrength.value : -1
  });
'''

new_timeline = r'''  const journeyCopiesV386 = [journeyCopyV386_1, journeyCopyV386_2, journeyCopyV386_3].filter(Boolean);
  if (journeyCopiesV386.length) {
    gsap.set(journeyCopiesV386, { opacity: 0, y: 10, filter: 'blur(2px)' });
  }
  if (journeyCopyV386_1) {
    tl.to(journeyCopyV386_1, { opacity: .97, y: 0, filter: 'blur(0px)', duration: .55, ease: 'power2.out' }, 3.55)
      .to(journeyCopyV386_1, { opacity: 0, y: -6, filter: 'blur(1.5px)', duration: .45, ease: 'sine.in' }, 7.70);
  }
  if (journeyCopyV386_2) {
    tl.to(journeyCopyV386_2, { opacity: .97, y: 0, filter: 'blur(0px)', duration: .50, ease: 'power2.out' }, 9.55)
      .to(journeyCopyV386_2, { opacity: 0, y: -6, filter: 'blur(1.5px)', duration: .45, ease: 'sine.in' }, 14.20);
  }
  if (journeyCopyV386_3) {
    tl.to(journeyCopyV386_3, { opacity: .98, y: 0, filter: 'blur(0px)', duration: .55, ease: 'power2.out' }, 18.95)
      .to(journeyCopyV386_3, { opacity: 0, y: -4, filter: 'blur(1.2px)', duration: .50, ease: 'sine.in' }, 21.55);
  }

  if (sceneMarkV384) {
    tl.to(sceneMarkV384, { opacity: 0, duration: .35, ease: 'sine.inOut' }, 20.60);
  }
  if (finaleBlackoutV386) {
    gsap.set(finaleBlackoutV386, { opacity: 0 });
    tl.to(finaleBlackoutV386, { opacity: 1, duration: .40, ease: 'sine.inOut' }, 20.95)
      .to(stage, { opacity: 0, duration: .40, ease: 'sine.inOut' }, 20.95);
  }

  if (finaleMatteV384) {
    gsap.set(finaleMatteV384, { opacity: 0, scale: 1.008 });
    gsap.set(finaleStillV384_1, { opacity: 1 });
    gsap.set([finaleStillV384_2, finaleStillV384_3], { opacity: 0 });
    finaleCross12V384.value = 0;
    finaleCross23V384.value = 0;

    // v3.8.6: the Finish resolves into a full blackout before the authored
    // West Sea sunset appears. The map disappears under black; still 01 is
    // prepared underneath the blackout, then revealed only after the hold.
    tl.set(finaleMatteV384, { opacity: 1 }, 23.30)
      .to(finaleBlackoutV386, { opacity: 0, duration: .60, ease: 'sine.inOut' }, 23.45)
      .to(finaleMatteV384, { scale: 1.0, duration: .75, ease: 'sine.out' }, 23.45)
      .to(finaleCross12V384, {
        value: 1,
        duration: .72,
        ease: 'sine.inOut',
        onUpdate: () => {
          const p = finaleCross12V384.value;
          if (finaleStillV384_1) finaleStillV384_1.style.opacity = String(1 - p);
          if (finaleStillV384_2) finaleStillV384_2.style.opacity = String(p);
        }
      }, 25.65)
      .to(finaleCross23V384, {
        value: 1,
        duration: .72,
        ease: 'sine.inOut',
        onUpdate: () => {
          const p = finaleCross23V384.value;
          if (finaleStillV384_2) finaleStillV384_2.style.opacity = String(1 - p);
          if (finaleStillV384_3) finaleStillV384_3.style.opacity = String(p);
        }
      }, 27.65);
  }

  const scene05V386State = () => ({
    matteOpacity: finaleMatteV384 ? Number(getComputedStyle(finaleMatteV384).opacity) : -1,
    matteVisible: !!finaleMatteV384,
    blackoutOpacity: finaleBlackoutV386 ? Number(getComputedStyle(finaleBlackoutV386).opacity) : -1,
    narration1Opacity: journeyCopyV386_1 ? Number(getComputedStyle(journeyCopyV386_1).opacity) : -1,
    narration2Opacity: journeyCopyV386_2 ? Number(getComputedStyle(journeyCopyV386_2).opacity) : -1,
    narration3Opacity: journeyCopyV386_3 ? Number(getComputedStyle(journeyCopyV386_3).opacity) : -1,
    still1Opacity: finaleStillV384_1 ? Number(getComputedStyle(finaleStillV384_1).opacity) : -1,
    still2Opacity: finaleStillV384_2 ? Number(getComputedStyle(finaleStillV384_2).opacity) : -1,
    still3Opacity: finaleStillV384_3 ? Number(getComputedStyle(finaleStillV384_3).opacity) : -1,
    cross12Progress: finaleCross12V384.value,
    cross23Progress: finaleCross23V384.value,
    mapStageOpacity: stage ? Number(getComputedStyle(stage).opacity) : -1,
    sceneMarkOpacity: sceneMarkV384 ? Number(getComputedStyle(sceneMarkV384).opacity) : -1,
    statementOpacity: statement ? Number(getComputedStyle(statement).opacity) : -1,
    syntheticSunVisible: !!(typeof sunSprite !== 'undefined' && sunSprite && sunSprite.visible),
    reflectionStrength: oceanUniforms.uReflectionStrength ? oceanUniforms.uReflectionStrength.value : -1
  });
  window.__scene05V386State = scene05V386State;
  window.__scene05V384State = scene05V386State;
'''

patch(old_timeline, new_timeline, 'v386 narrative blackout finale timeline')

old_statement = r'''    .to(statement, {
      opacity: .97,
      clipPath: 'inset(0 0% 0 0)',
      filter: 'blur(0px)',
      letterSpacing: '-.035em',
      duration: .55,
      ease: 'power2.out'
    }, 23.65);'''
new_statement = r'''    .to(statement, {
      opacity: .97,
      clipPath: 'inset(0 0% 0 0)',
      filter: 'blur(0px)',
      letterSpacing: '-.035em',
      duration: .55,
      ease: 'power2.out'
    }, 26.65);'''
patch(old_statement, new_statement, 'v386 closing statement timing')

patch(
    "    finaleMatteV384.style.opacity = '0';\n  }",
    "    finaleMatteV384.style.opacity = '0';\n  }\n"
    "  if (finaleBlackoutV386) finaleBlackoutV386.style.opacity = '0';\n"
    "  [journeyCopyV386_1, journeyCopyV386_2, journeyCopyV386_3].forEach(el => { if (el) el.style.opacity = '0'; });",
    'v386 diagnostics hide narrative layers'
)

out.write_text(
    '// Scene 05 B v3.8.6 — three narrative beats + 2.5s blackout bridge; 30s runtime preserved.\n'
    + text,
    encoding='utf-8'
)
print(out)
