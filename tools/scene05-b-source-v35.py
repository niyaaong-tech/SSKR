#!/usr/bin/env python3
from pathlib import Path

ROOT = Path.cwd()
src = ROOT / 'output' / 'scene05-b-v34.js'
out = ROOT / 'output' / 'scene05-b-v35.js'
text = src.read_text('utf-8')

start = text.index('function play(data) {')
end = text.index('\nfunction showStatic(data) {', start)

play = r"""function play(data) {
  const tl = gsap.timeline({ paused: qaMode, defaults: { ease: 'power2.inOut' } });
  timeline = tl;
  window.__scene05Timeline = tl;

  const bounds = terrainBounds;
  const center = bounds.getCenter(new THREE.Vector3());
  const size = bounds.getSize(new THREE.Vector3());
  const diag = Math.max(size.x, size.z);
  const starts = data.starts.map(s => vec(s.position));
  const finish = vec(data.finish.position);
  const northCount = Math.max(2, Math.ceil(starts.length * .55));
  const eastNorthFocus = average(starts.slice(0, northCount));
  const journeys = (typeof participantRoutePairs !== 'undefined' && participantRoutePairs.length)
    ? participantRoutePairs
    : routePairs;

  const introStart = center.clone().add(new THREE.Vector3(diag * .02, diag * 1.12, diag * .88));
  const introEnd = center.clone().add(new THREE.Vector3(diag * .035, diag * 1.00, diag * .80));
  const introTarget = center.clone().add(new THREE.Vector3(0, diag * .015, 0));

  const eastFocusPos = eastNorthFocus.clone().add(new THREE.Vector3(diag * .23, diag * .54, diag * .38));
  const eastFocusTarget = eastNorthFocus.clone().add(new THREE.Vector3(-diag * .025, diag * .012, 0));
  const eastStartsPos = eastNorthFocus.clone().add(new THREE.Vector3(diag * .28, diag * .64, diag * .42));

  const routeRevealPos = center.clone().add(new THREE.Vector3(diag * .50, diag * .76, diag * .05));
  const routeRevealTarget = center.clone().add(new THREE.Vector3(-diag * .045, diag * .025, 0));

  const finishOverviewPos = finish.clone().add(new THREE.Vector3(diag * .34, diag * .40, diag * .14));
  const finishOverviewTarget = finish.clone().add(new THREE.Vector3(-diag * .075, diag * .025, -diag * .005));

  const sunsetPos = finish.clone().add(new THREE.Vector3(diag * .20, diag * .095, diag * .12));
  const sunsetTarget = finish.clone().add(new THREE.Vector3(-diag * .31, diag * .034, -diag * .028));
  const sunsetHoldPos = finish.clone().add(new THREE.Vector3(diag * .175, diag * .082, diag * .10));
  const sunsetHoldTarget = finish.clone().add(new THREE.Vector3(-diag * .33, diag * .032, -diag * .030));

  gsap.set(overviewLayer, { opacity: 0 });
  gsap.set(stage, { opacity: 1 });
  gsap.set(statement, {
    opacity: 0,
    clipPath: 'inset(0 100% 0 0)',
    filter: 'blur(2px)',
    letterSpacing: '-.015em'
  });
  gsap.set(sceneMark, { opacity: .24 });
  gsap.set(lightWash, { opacity: .05 });
  gsap.set(skyNight, { opacity: .18 });
  gsap.set(skyDawn, { opacity: .45 });
  gsap.set([skyDay, skySunset, skyBluehour, eastGlow, westGlow], { opacity: 0 });

  if (scene.background) scene.background.setRGB(.07, .13, .16);
  scene.fog.density = .0060;
  scene.fog.color.setRGB(.12, .19, .21);
  oceanUniforms.uPhase.value = .22;
  oceanUniforms.uOpacity.value = .94;
  bloom.strength = .52;

  dawnTerrainMat.opacity = .22;
  dayTerrainMat.opacity = 0;
  sunsetTerrainMat.opacity = 0;
  nightTerrainMat.opacity = 0;
  if (typeof peninsulaSurface !== 'undefined' && peninsulaSurface) {
    peninsulaSurface.material.color.setRGB(.72, .78, .76);
  }
  if (typeof roadChoiceNetwork !== 'undefined' && roadChoiceNetwork) {
    roadChoiceNetwork.material.opacity = 0;
  }

  for (const n of startNodes.values()) {
    n.scale.setScalar(0);
    n.userData.core.material.opacity = 0;
    n.userData.ring.material.opacity = 0;
    n.userData.sprite.material.opacity = 0;
  }

  const pairSets = [
    routePairs,
    (typeof explorationPairs !== 'undefined' ? explorationPairs : []),
    (typeof riderTrailPairs !== 'undefined' ? riderTrailPairs : []),
    (typeof participantRoutePairs !== 'undefined' ? participantRoutePairs : [])
  ];
  pairSets.forEach(set => set.forEach(p => {
    p.core.material.opacity = 0;
    p.glow.material.opacity = 0;
    setProgress(p.core, 0);
    setProgress(p.glow, 0);
  }));

  seedLines.forEach(l => { l.material.opacity = 0; setProgress(l, 0); });
  convergenceLines.forEach(l => { l.material.opacity = 0; setProgress(l, 0); });
  mergedNetwork.material.opacity = 0;
  checkpointNodes.forEach(n => {
    n.userData.core.material.opacity = 0;
    n.userData.ring.material.opacity = 0;
    n.userData.sprite.material.opacity = 0;
  });

  finishNode.scale.setScalar(.48);
  finishNode.userData.ring.scale.setScalar(1);
  finishNode.userData.core.material.opacity = 0;
  finishNode.userData.ring.material.opacity = 0;
  finishNode.userData.sprite.material.opacity = 0;
  festivalGroup.traverse(o => { if (o.material) o.material.opacity = 0; });
  launchLines.forEach(l => { l.material.opacity = 0; setProgress(l, 0); });
  fireworkBursts.forEach(b => { b.material.opacity = 0; b.scale.setScalar(.02); });
  if (typeof sunSprite !== 'undefined' && sunSprite) {
    sunSprite.material.opacity = 0;
    sunSprite.position.copy(finish).add(new THREE.Vector3(-diag * .30, diag * .060, -diag * .028));
  }
  cloudSprites.forEach(s => s.material.opacity = 0);

  Object.assign(cam, {
    x: introStart.x, y: introStart.y, z: introStart.z,
    tx: introTarget.x, ty: introTarget.y, tz: introTarget.z,
    fov: 37.0
  });
  syncCamera();

  // 0-3s — centered peninsula.
  tweenCamera(tl, 0, 3.0, introEnd, introTarget, 35.5, 'sine.inOut');
  tl.to(scene.background, { r: .10, g: .18, b: .21, duration: 3.0, ease: 'sine.inOut' }, 0)
    .to(scene.fog, { density: .0055, duration: 3.0, ease: 'sine.inOut' }, 0)
    .to(scene.fog.color, { r: .15, g: .23, b: .24, duration: 3.0 }, 0);
  cloudSprites.forEach((s, i) => {
    tl.to(s.material, { opacity: s.userData.targetOpacity * .17, duration: 2.2 }, .4 + i * .05);
  });

  // 3-6s — gentle approach to the north/mid East Coast.
  tweenCamera(tl, 3.0, 3.0, eastFocusPos, eastFocusTarget, 33.5, 'power2.inOut');
  tl.to(eastGlow, { opacity: .54, duration: 2.5, ease: 'sine.out' }, 3.2)
    .to(skyDawn, { opacity: .68, duration: 2.7 }, 3.0)
    .to(oceanUniforms.uPhase, { value: .60, duration: 3.0, ease: 'sine.inOut' }, 3.0);

  // 6-9s — widen a little; Start points fire in rapid sequence.
  tweenCamera(tl, 6.0, 3.0, eastStartsPos, eastFocusTarget, 35.5, 'sine.inOut');
  [...startNodes.values()].forEach((n, i) => {
    const t = 6.18 + i * .22;
    tl.to(n.scale, { x: 1.22, y: 1.22, z: 1.22, duration: .20, ease: 'power2.out' }, t)
      .to(n.scale, { x: 1, y: 1, z: 1, duration: .34, ease: 'sine.out' }, t + .20);
    nodeOpacity(tl, n, t, { core: .96, ring: .52, glow: .62, duration: .20 });
  });
  if (typeof peninsulaSurface !== 'undefined' && peninsulaSurface) {
    tl.to(peninsulaSurface.material.color, { r: 1.0, g: 1.0, b: 1.0, duration: 3.4, ease: 'sine.inOut' }, 5.6);
  }
  tl.to(scene.background, { r: .28, g: .43, b: .50, duration: 3.8, ease: 'sine.inOut' }, 5.2)
    .to(skyDay, { opacity: .78, duration: 3.5 }, 5.3)
    .to(skyNight, { opacity: .04, duration: 2.8 }, 5.5)
    .to(oceanUniforms.uPhase, { value: 1.0, duration: 3.4, ease: 'sine.inOut' }, 5.5)
    .to(scene.fog, { density: .0046, duration: 3.4 }, 5.5)
    .to(scene.fog.color, { r: .30, g: .40, b: .43, duration: 3.4 }, 5.5);

  // 9-19s — no hero route. Complete journeys launch with short offsets and resolve together.
  tweenCamera(tl, 9.0, 10.0, routeRevealPos, routeRevealTarget, 37.5, 'sine.inOut');
  const finishBeat = 18.92;
  journeys.forEach((pair, i) => {
    const startTime = 9.0 + i * .13;
    const duration = Math.max(7.7, finishBeat - startTime);
    const prog = { v: 0 };
    tl.to(pair.core.material, { opacity: .74, duration: .24 }, startTime)
      .to(pair.glow.material, { opacity: .052, duration: .26 }, startTime)
      .to(prog, {
        v: 1,
        duration,
        ease: 'power1.inOut',
        onUpdate: () => { setProgress(pair.core, prog.v); setProgress(pair.glow, prog.v); }
      }, startTime + .03);
  });
  if (typeof roadChoiceNetwork !== 'undefined' && roadChoiceNetwork) {
    tl.to(roadChoiceNetwork.material, { opacity: .12, duration: 2.2, ease: 'sine.out' }, 9.4)
      .to(roadChoiceNetwork.material, { opacity: .04, duration: 3.0, ease: 'sine.inOut' }, 15.5)
      .to(roadChoiceNetwork.material, { opacity: 0, duration: 1.2 }, 18.3);
  }
  for (const n of startNodes.values()) {
    tl.to(n.userData.core.material, { opacity: .20, duration: 2.3 }, 10.6)
      .to(n.userData.ring.material, { opacity: .06, duration: 2.3 }, 10.6)
      .to(n.userData.sprite.material, { opacity: .07, duration: 2.3 }, 10.6);
  }

  // 19-22s — near-simultaneous Finish and one symbolic light pulse.
  tweenCamera(tl, 19.0, 3.0, finishOverviewPos, finishOverviewTarget, 34.0, 'power2.inOut');
  tl.to(finishNode.scale, { x: 1.16, y: 1.16, z: 1.16, duration: .55, ease: 'power2.out' }, 18.82)
    .to(finishNode.scale, { x: 1.0, y: 1.0, z: 1.0, duration: .70, ease: 'sine.out' }, 19.37);
  nodeOpacity(tl, finishNode, 18.78, { core: .94, ring: .70, glow: .62, duration: .42 });
  tl.to(finishNode.userData.ring.scale, { x: 4.8, y: 4.8, z: 4.8, duration: 1.55, ease: 'power2.out' }, 19.05)
    .to(finishNode.userData.ring.material, { opacity: 0, duration: 1.35, ease: 'sine.out' }, 19.22)
    .to(bloom, { strength: .70, duration: .70, ease: 'power2.out' }, 19.0)
    .to(bloom, { strength: .56, duration: 1.5, ease: 'sine.out' }, 19.75);

  let festivalIndex = 0;
  festivalGroup.traverse(o => {
    if (!o.material) return;
    const t = 19.35 + (festivalIndex++ % 9) * .055;
    tl.to(o.material, { opacity: (o.userData.baseOpacity || .42) * .74, duration: .85, ease: 'sine.out' }, t);
  });

  if (typeof peninsulaSurface !== 'undefined' && peninsulaSurface) {
    tl.to(peninsulaSurface.material.color, { r: .93, g: .73, b: .59, duration: 5.2, ease: 'sine.inOut' }, 18.7);
  }
  tl.to(scene.background, { r: .32, g: .19, b: .20, duration: 5.2, ease: 'sine.inOut' }, 18.7)
    .to(skySunset, { opacity: .92, duration: 5.0, ease: 'sine.inOut' }, 18.8)
    .to(skyDay, { opacity: .22, duration: 5.0 }, 18.8)
    .to(westGlow, { opacity: .84, duration: 4.8, ease: 'sine.out' }, 18.9)
    .to(eastGlow, { opacity: .04, duration: 3.2 }, 18.8)
    .to(oceanUniforms.uPhase, { value: 2.0, duration: 5.0, ease: 'sine.inOut' }, 18.8)
    .to(scene.fog, { density: .0061, duration: 4.8 }, 18.8)
    .to(scene.fog.color, { r: .30, g: .20, b: .20, duration: 4.8 }, 18.8);

  if (typeof sunSprite !== 'undefined' && sunSprite) {
    tl.to(sunSprite.material, { opacity: .58, duration: 1.8, ease: 'sine.out' }, 20.0)
      .to(sunSprite.material, { opacity: .84, duration: 1.8, ease: 'sine.inOut' }, 21.5)
      .to(sunSprite.position, { y: finish.y + diag * .043, duration: 5.2, ease: 'sine.inOut' }, 21.0)
      .to(sunSprite.material, { opacity: .52, duration: 3.0, ease: 'sine.inOut' }, 26.0);
  }

  journeys.forEach((pair, i) => {
    tl.to(pair.core.material, { opacity: .20, duration: 2.2 }, 20.2 + i * .015)
      .to(pair.glow.material, { opacity: .012, duration: 2.2 }, 20.2 + i * .015)
      .to(pair.core.material, { opacity: 0, duration: 1.8 }, 23.7 + i * .01)
      .to(pair.glow.material, { opacity: 0, duration: 1.5 }, 23.7 + i * .01);
  });
  for (const n of startNodes.values()) {
    tl.to(n.userData.core.material, { opacity: 0, duration: 1.6 }, 20.5)
      .to(n.userData.ring.material, { opacity: 0, duration: 1.6 }, 20.5)
      .to(n.userData.sprite.material, { opacity: 0, duration: 1.6 }, 20.5);
  }

  // 22-26s — descend toward the west-coast horizon.
  tweenCamera(tl, 22.0, 4.0, sunsetPos, sunsetTarget, 34.0, 'power2.inOut');
  tl.to(lightWash, { opacity: .12, duration: 3.6, ease: 'sine.inOut' }, 22.0);
  cloudSprites.forEach((s, i) => {
    tl.to(s.material, { opacity: s.userData.targetOpacity * .10, duration: 3.2 }, 22.3 + i * .04);
  });

  // 26-30s — no fireworks. Hold sunset and engrave the core message into the center.
  tweenCamera(tl, 26.0, 4.0, sunsetHoldPos, sunsetHoldTarget, 35.5, 'sine.inOut');
  tl.to(scene.background, { r: .23, g: .105, b: .12, duration: 3.8, ease: 'sine.inOut' }, 25.7)
    .to(westGlow, { opacity: .64, duration: 3.6, ease: 'sine.inOut' }, 25.7)
    .to(sceneMark, { opacity: .08, duration: 1.4 }, 25.7)
    .to(statement, {
      opacity: 1,
      clipPath: 'inset(0 0% 0 0)',
      filter: 'blur(0px)',
      letterSpacing: '-.035em',
      duration: 2.25,
      ease: 'power2.out'
    }, 26.15);

  tl.to({}, { duration: .10 }, 29.90);
  return tl;
}"""

text = text[:start] + play + text[end:]
out.write_text(
    '// Scene 05 B v3.5 — 30s choreography: centered peninsula, East Coast start cascade, many simultaneous journeys, one Finish, west-coast sunset and core message. Fireworks removed from the timeline.\n'
    + text,
    encoding='utf-8'
)
print(out)
