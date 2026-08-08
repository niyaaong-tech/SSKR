#!/usr/bin/env python3
from pathlib import Path

ROOT=Path.cwd()
src=ROOT/'output'/'scene05-b-v23.js'
out=ROOT/'output'/'scene05-b-v24.js'
text=src.read_text('utf-8')

play_start=text.index('function play(data) {')
timeline_start=text.index('  // 0–6s:', play_start)
show_start=text.index('\nfunction showStatic(data) {', play_start)
head=text[play_start:timeline_start]

new_timeline=r'''  // v2.4 / ~40s: journey-first reconstruction. No terrain-appreciation hold.
  // The continuous camera is the main cinematic device; terrain remains geographic credibility.
  if (sunSprite) sunSprite.material.opacity = 0;

  const heroPair = routePairs.find(p => p.id === heroRoute.id) || routePairs[0];
  const chaseD = chasePose(route, .82, diag, -1);
  const establishPos = center.clone().add(new THREE.Vector3(diag * .19, diag * .54, diag * .66));
  const encounterTarget = chaseD.target.clone().add(new THREE.Vector3(-diag * .025, diag * .006, diag * .020));

  // 0–3s — KOREA ESTABLISH: context only, then immediately bend the camera toward the East Coast.
  tweenCamera(tl, 0.0, 1.35, establishPos, center.clone().add(new THREE.Vector3(diag * .035, 0, diag * .035)), 34.0, 'power1.inOut');
  tweenCamera(tl, 1.35, 1.75, eastNorthPos, northStart.clone().add(new THREE.Vector3(0, .28, 0)), 30.5, 'power2.inOut');
  tl.to(scene.background, { r: .035, g: .095, b: .125, duration: 3.1, ease: 'sine.inOut' }, 0)
    .to(skyNight, { opacity: .42, duration: 2.7, ease: 'sine.inOut' }, .2)
    .to(skyDawn, { opacity: .90, duration: 2.6, ease: 'sine.inOut' }, .35)
    .to(eastGlow, { opacity: .66, duration: 2.2, ease: 'sine.out' }, .7)
    .to(scene.fog, { density: .0074, duration: 2.7, ease: 'sine.inOut' }, .25);
  tl.to(scene.fog.color, { r: .075, g: .145, b: .18, duration: 2.7 }, .3);
  cloudSprites.forEach((s, i) => tl.to(s.material, { opacity: s.userData.targetOpacity * .72, duration: 1.8 }, .45 + i * .07));

  // 3–7s — EAST COAST STARTS: one long coastal truck, Starts ignite north→south as the camera passes.
  tweenCamera(tl, 3.1, 3.9, eastSouthPos, southStart.clone().add(new THREE.Vector3(0, .22, 0)), 29.0, 'sine.inOut');
  tl.to(eastGlow, { opacity: .90, duration: 1.5 }, 3.0).to(skyDawn, { opacity: .98, duration: 1.0 }, 3.0);
  [...startNodes.values()].forEach((n, i) => {
    const t = 3.15 + i * .37;
    tl.to(n.scale, { x: 1, y: 1, z: 1, duration: .30, ease: 'power2.out' }, t);
    nodeOpacity(tl, n, t, { core: .92, ring: .44, glow: .52, duration: .28 });
  });
  seedLines.forEach((l, i) => {
    const p = { v: 0 };
    const t = 5.15 + i * .30;
    tl.to(l.material, { opacity: .20, duration: .20 }, t)
      .to(p, { v: 1, duration: .78, ease: 'power1.inOut', onUpdate: () => setProgress(l, p.v) }, t + .05);
  });

  // 7–12s — ROUTE CHASE: enter the journey instead of stopping to admire terrain.
  tweenCamera(tl, 7.0, 1.25, chaseA.pos, chaseA.target, 27.0, 'power2.inOut');
  tweenCamera(tl, 8.25, 1.75, chaseB.pos, chaseB.target, 25.5, 'sine.inOut');
  tweenCamera(tl, 10.0, 2.0, chaseC.pos, chaseC.target, 26.5, 'sine.inOut');
  if (heroPair) {
    const p = { v: 0 };
    tl.to(heroPair.core.material, { opacity: .96, duration: .25 }, 6.8)
      .to(heroPair.glow.material, { opacity: .18, duration: .30 }, 6.8)
      .to(p, { v: 1, duration: 5.0, ease: 'power1.inOut', onUpdate: () => { setProgress(heroPair.core, p.v); setProgress(heroPair.glow, p.v); } }, 6.9);
  }
  tl.to(dayTerrainMat, { opacity: .58, duration: 4.4, ease: 'sine.inOut' }, 7.0)
    .to(skyDay, { opacity: .52, duration: 4.2, ease: 'sine.inOut' }, 7.0)
    .to(skyNight, { opacity: .08, duration: 3.8 }, 7.2)
    .to(oceanUniforms.uPhase, { value: .72, duration: 4.2, ease: 'sine.inOut' }, 7.0);
  if (checkpointNodes[0]) {
    nodeOpacity(tl, checkpointNodes[0], 9.2, { core: .62, ring: .24, glow: .18, duration: .20 });
    tl.to(checkpointNodes[0].scale, { x: 1.28, y: 1.28, z: 1.28, duration: .22, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 9.2);
  }

  // 12–17s — ENCOUNTER & MERGE: other Routes enter the same moving composition; local interactions replace the old relief showcase.
  tweenCamera(tl, 12.0, 2.1, chaseD.pos, encounterTarget, 27.5, 'sine.inOut');
  tweenCamera(tl, 14.1, 2.9, cranePos.clone().lerp(chaseD.pos, .56), center.clone().lerp(encounterTarget, .44), 31.0, 'power2.inOut');
  routePairs.filter(p => p !== heroPair).forEach((pair, i) => {
    const prog = { v: 0 };
    const t = 10.7 + i * .72;
    tl.to(pair.core.material, { opacity: .88, duration: .26 }, t)
      .to(pair.glow.material, { opacity: .12, duration: .30 }, t)
      .to(prog, { v: 1, duration: 5.7 + i * .18, ease: 'power1.inOut', onUpdate: () => { setProgress(pair.core, prog.v); setProgress(pair.glow, prog.v); } }, t + .05);
  });
  tl.to(mergedNetwork.material, { opacity: .20, duration: 1.0, ease: 'sine.out' }, 12.2)
    .to(mergedNetwork.material, { opacity: .50, duration: 2.0, ease: 'sine.inOut' }, 14.0);
  [1,2,3].forEach((idx, j) => {
    const n = checkpointNodes[idx];
    if (!n) return;
    const t = 12.4 + j * 1.05;
    nodeOpacity(tl, n, t, { core: .52, ring: .18, glow: .13, duration: .18 });
    tl.to(n.scale, { x: 1.18, y: 1.18, z: 1.18, duration: .20, yoyo: true, repeat: 1, ease: 'sine.inOut' }, t);
  });

  // 17–22s — CRANE REVEAL: one followed journey becomes a national choice structure.
  tweenCamera(tl, 17.0, 5.0, cranePos, center.clone().add(new THREE.Vector3(0, .26, 0)), 35.0, 'power2.inOut');
  tl.to(scene.background, { r: .30, g: .46, b: .54, duration: 4.6, ease: 'sine.inOut' }, 16.5)
    .to(dayTerrainMat, { opacity: 1, duration: 3.8 }, 16.7)
    .to(skyDay, { opacity: 1, duration: 3.6 }, 16.7)
    .to(skyDawn, { opacity: 0, duration: 3.4 }, 16.7)
    .to(eastGlow, { opacity: .05, duration: 3.0 }, 16.7)
    .to(oceanUniforms.uPhase, { value: 1.0, duration: 3.5 }, 16.7)
    .to(scene.fog, { density: .0048, duration: 3.6 }, 16.7)
    .to(scene.fog.color, { r: .33, g: .43, b: .46, duration: 3.6 }, 16.7);
  checkpointNodes.slice(4).forEach((n, i) => {
    const t = 17.5 + (i % 4) * .66 + Math.floor(i / 4) * .34;
    nodeOpacity(tl, n, t, { core: .44, ring: .15, glow: .10, duration: .17 });
  });

  // 22–28s — WESTWARD NETWORK FLIGHT: active camera replaces a static Day Hero hold.
  tweenCamera(tl, 22.0, 3.0, networkA, center.clone().add(new THREE.Vector3(diag * .05, .18, diag * .01)), 32.5, 'sine.inOut');
  tweenCamera(tl, 25.0, 3.0, networkB, center.clone().add(new THREE.Vector3(-diag * .09, .14, -diag * .05)), 31.0, 'sine.inOut');
  cloudSprites.forEach((s, i) => tl.to(s.material, { opacity: s.userData.targetOpacity * .44, duration: 1.8 }, 21.5 + i * .035));
  tl.to(lightWash, { opacity: .035, duration: 1.0 }, 22.4);
  tl.to(scene.background, { r: .30, g: .19, b: .24, duration: 6.0, ease: 'sine.inOut' }, 24.0)
    .to(sunsetTerrainMat, { opacity: .88, duration: 5.2, ease: 'sine.inOut' }, 24.6)
    .to(dayTerrainMat, { opacity: .34, duration: 5.2, ease: 'sine.inOut' }, 24.6)
    .to(skySunset, { opacity: .76, duration: 4.8 }, 24.5)
    .to(skyDay, { opacity: .38, duration: 4.8 }, 24.5)
    .to(westGlow, { opacity: .72, duration: 4.2 }, 24.8)
    .to(oceanUniforms.uPhase, { value: 1.72, duration: 4.8, ease: 'sine.inOut' }, 24.5);
  if (sunSprite) {
    tl.to(sunSprite.material, { opacity: .54, duration: 1.5, ease: 'sine.out' }, 25.3)
      .to(sunSprite.material, { opacity: .84, duration: 2.4, ease: 'sine.inOut' }, 27.0)
      .to(sunSprite.position, { y: finish.y + diag * .014, duration: 8.0, ease: 'sine.inOut' }, 27.0)
      .to(sunSprite.material, { opacity: 0, duration: 1.8, ease: 'sine.in' }, 34.4);
  }

  // 28–33s — CONVERGENCE / FINISH DESCENT: sweep west and descend without a separate landscape shot.
  tweenCamera(tl, 28.0, 2.5, westSweep, finish.clone().add(new THREE.Vector3(-diag * .08, .16, 0)), 31.0, 'power2.inOut');
  tweenCamera(tl, 30.5, 2.5, finishDesc, finishLook, 33.0, 'power2.inOut');
  tl.to(sunsetTerrainMat, { opacity: 1, duration: 2.5 }, 28.0)
    .to(dayTerrainMat, { opacity: .12, duration: 2.5 }, 28.0)
    .to(skySunset, { opacity: .96, duration: 2.4 }, 28.0)
    .to(westGlow, { opacity: .92, duration: 2.2 }, 28.0)
    .to(oceanUniforms.uPhase, { value: 2.0, duration: 2.5 }, 28.0)
    .to(scene.fog, { density: .0062, duration: 2.4 }, 28.0)
    .to(scene.fog.color, { r: .29, g: .20, b: .22, duration: 2.4 }, 28.0);
  for (const n of startNodes.values()) {
    tl.to(n.userData.core.material, { opacity: .08, duration: 1.7 }, 28.2)
      .to(n.userData.ring.material, { opacity: .018, duration: 1.7 }, 28.2)
      .to(n.userData.sprite.material, { opacity: .012, duration: 1.7 }, 28.2)
      .to(n.scale, { x: .70, y: .70, z: .70, duration: 1.7 }, 28.2);
  }
  routePairs.forEach((pair, i) => {
    tl.to(pair.core.material, { opacity: .34, duration: 1.8 }, 28.4 + i * .04)
      .to(pair.glow.material, { opacity: .045, duration: 1.8 }, 28.4 + i * .04);
  });
  tl.to(mergedNetwork.material, { opacity: .15, duration: 1.8 }, 28.4);
  convergenceLines.forEach((l, i) => {
    const p = { v: 0 };
    const t = 27.8 + i * .28;
    tl.to(l.material, { opacity: .88, duration: .22 }, t)
      .to(p, { v: 1, duration: 3.3, ease: 'power2.inOut', onUpdate: () => setProgress(l, p.v) }, t + .04);
  });
  tl.to(finishNode.scale, { x: 1.02, y: 1.02, z: 1.02, duration: 1.1, ease: 'power2.out' }, 30.1);
  nodeOpacity(tl, finishNode, 30.0, { core: .82, ring: .38, glow: .30, duration: .65 });
  tl.to(statement, { opacity: 1, y: 0, duration: .75, ease: 'power2.out' }, 30.6);
  tl.to(bloom, { strength: .68, duration: 1.5 }, 30.2);

  // 33–36s — SUNSET ARRIVAL: a short arrival punctuation, not a scenic beauty hold.
  tweenCamera(tl, 33.0, 3.0, finishDesc.clone().add(new THREE.Vector3(-diag * .006, diag * .003, -diag * .004)), finishLook.clone().add(new THREE.Vector3(-diag * .018, 0, 0)), 33.5, 'sine.inOut');
  routePairs.forEach(pair => {
    tl.to(pair.core.material, { opacity: .075, duration: 1.7 }, 33.0)
      .to(pair.glow.material, { opacity: .010, duration: 1.7 }, 33.0);
  });
  convergenceLines.forEach(l => tl.to(l.material, { opacity: .13, duration: 1.7 }, 33.0));
  tl.to(mergedNetwork.material, { opacity: 0, duration: 1.2 }, 33.0);
  checkpointNodes.forEach(n => {
    tl.to(n.userData.core.material, { opacity: 0, duration: .9 }, 33.0);
    tl.to(n.userData.ring.material, { opacity: 0, duration: .9 }, 33.0);
    tl.to(n.userData.sprite.material, { opacity: 0, duration: .9 }, 33.0);
  });
  tl.to(statement, { opacity: 0, y: -8, duration: .65 }, 34.3);

  // 34.5–40s — FESTIVAL NIGHT: sunset completes, blue hour arrives, then camera tilts into ordinary fireworks.
  tweenCamera(tl, 35.0, 2.0, bluePos, blueLook, 36.0, 'sine.inOut');
  tweenCamera(tl, 37.0, 3.0, bluePos.clone().add(new THREE.Vector3(0, -diag * .006, 0)), skyTarget, 42.0, 'power2.inOut');
  tl.to(scene.background, { r: .025, g: .045, b: .085, duration: 3.6, ease: 'sine.inOut' }, 34.2)
    .to(skyBluehour, { opacity: .98, duration: 3.5, ease: 'sine.inOut' }, 34.2)
    .to(skySunset, { opacity: .14, duration: 3.4 }, 34.2)
    .to(skyNight, { opacity: .48, duration: 3.4 }, 34.2)
    .to(westGlow, { opacity: .14, duration: 3.1 }, 34.3)
    .to(nightTerrainMat, { opacity: .90, duration: 3.4 }, 34.2)
    .to(sunsetTerrainMat, { opacity: .20, duration: 3.4 }, 34.2)
    .to(oceanUniforms.uPhase, { value: 3.0, duration: 3.4, ease: 'sine.inOut' }, 34.2)
    .to(scene.fog, { density: .0080, duration: 3.2 }, 34.2)
    .to(scene.fog.color, { r: .055, g: .075, b: .12, duration: 3.2 }, 34.2)
    .to(sceneMark, { opacity: .10, duration: .8 }, 34.5);
  let festivalIndex = 0;
  festivalGroup.traverse(o => {
    if (o.material) {
      const t = 35.2 + (festivalIndex++ % 7) * .055;
      tl.to(o.material, { opacity: o.userData.baseOpacity || .42, duration: .85, ease: 'sine.out' }, t);
    }
  });
  cloudSprites.forEach((s, i) => tl.to(s.material, { opacity: s.userData.targetOpacity * .24, duration: 2.0 }, 34.8 + i * .03));
  animateFirework(tl, 0, 36.10, diag * .052);
  animateFirework(tl, 1, 36.85, diag * .058);
  animateFirework(tl, 2, 37.55, diag * .064);
  animateFirework(tl, 3, 38.25, diag * .071);
  tl.to(bloom, { strength: .78, duration: 1.2 }, 36.4).to(bloom, { strength: .56, duration: .9 }, 39.4);
  tl.to(finishNode.userData.sprite.material, { opacity: .20, duration: 2.0 }, 35.6)
    .to(finishNode.userData.ring.material, { opacity: .14, duration: 2.0 }, 35.6)
    .to(finishNode.userData.core.material, { opacity: .40, duration: 2.0 }, 35.6);

  // Firework #4 fades just after 40s. Keep a tiny deterministic tail for final ember state.
  tl.to({}, { duration: .10 }, 40.35);
  return tl;'''

new_play=head+new_timeline+'\n}\n'
text=text[:play_start]+new_play+text[show_start:]
out.parent.mkdir(parents=True,exist_ok=True)
out.write_text('// Scene 05 B v2.4 40-second journey-first one-take build source.\n'+text,encoding='utf-8')
print(out)
