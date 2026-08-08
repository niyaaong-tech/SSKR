#!/usr/bin/env python3
from pathlib import Path

ROOT=Path.cwd()
src=ROOT/'output'/'scene05-b-v26.js'
out=ROOT/'output'/'scene05-b-v27.js'
text=src.read_text('utf-8')


def patch(old,new,label,count=1):
    global text
    n=text.count(old)
    if n<count:raise SystemExit(f'{label}: expected >= {count}, found {n}')
    text=text.replace(old,new,count)

# v2.7 removes synthetic cross-country choice mosaics from the data and renders
# partial gold traces only on actual OSM trunk/primary/secondary road geometry.
patch(
"const choiceGlowGroup = new THREE.Group();\nconst routeGlowGroup = new THREE.Group();",
"const choiceGlowGroup = new THREE.Group();\nconst explorationGlowGroup = new THREE.Group();\nconst explorationRouteGroup = new THREE.Group();\nconst routeGlowGroup = new THREE.Group();",
'exploration groups')
patch(
"scene.add(peninsulaSurfaceGroup, terrainGroup, roadChoiceGroup, choiceGlowGroup, choiceRouteGroup, routeGlowGroup, routeGroup, seedGroup, mergedGroup, convergenceGroup, nodeGroup, checkpointGroup, cloudGroup, festivalGroup, fireworkGroup);",
"scene.add(peninsulaSurfaceGroup, terrainGroup, roadChoiceGroup, choiceGlowGroup, choiceRouteGroup, explorationGlowGroup, explorationRouteGroup, routeGlowGroup, routeGroup, seedGroup, mergedGroup, convergenceGroup, nodeGroup, checkpointGroup, cloudGroup, festivalGroup, fireworkGroup);",
'exploration scene order')
patch(
"const choiceRoutePairs = [];\nconst seedLines = [];",
"const choiceRoutePairs = [];\nconst explorationPairs = [];\nconst seedLines = [];",
'exploration array')

# Build selected actual-road fragments as rider exploration traces.
anchor="  for (const s of data.start_seeds) {"
insert=r'''  for (const r of (data.exploration_branches || [])) {
    const glow = lineFromPoints(r.points, { color: 0xeaa04e, width: 2.7, opacity: 0, order: 6, depthTest: false });
    const core = lineFromPoints(r.points, { color: 0xffd58a, width: 1.05, opacity: 0, order: 8, depthTest: true });
    setProgress(glow, 0); setProgress(core, 0);
    explorationPairs.push({ id: r.id, nearHero: !!r.near_hero, glow, core });
    explorationGlowGroup.add(glow); explorationRouteGroup.add(core);
  }

'''
patch(anchor,insert+anchor,'build actual-road exploration branches')

# Reset exploration traces for deterministic QA / replay.
patch(
"  choiceRoutePairs.forEach(p => {\n    p.core.material.opacity = 0; p.glow.material.opacity = 0;\n    setProgress(p.core, 0); setProgress(p.glow, 0);\n  });\n  if (roadChoiceNetwork) roadChoiceNetwork.material.opacity = 0;",
"  choiceRoutePairs.forEach(p => {\n    p.core.material.opacity = 0; p.glow.material.opacity = 0;\n    setProgress(p.core, 0); setProgress(p.glow, 0);\n  });\n  explorationPairs.forEach(p => {\n    p.core.material.opacity = 0; p.glow.material.opacity = 0;\n    setProgress(p.core, 0); setProgress(p.glow, 0);\n  });\n  if (roadChoiceNetwork) roadChoiceNetwork.material.opacity = 0;",
'exploration init')

# The dense secondary-road context should be felt, not read as a navigation map.
patch("{ opacity: .205, duration: 3.4, ease: 'sine.inOut' }, 11.2","{ opacity: .115, duration: 3.4, ease: 'sine.inOut' }, 11.2",'dense road web restraint')
patch("{ opacity: .145, duration: 6.0, ease: 'sine.inOut' }, 17.0","{ opacity: .095, duration: 6.0, ease: 'sine.inOut' }, 17.0",'dense road web sustain restraint')

# Animate genuine local road choices. Hero-near branches arrive during the chase;
# distributed branches then light up across the national reveal.
marker="  // 12–17s — ENCOUNTER & MERGE: other Routes enter the same moving composition; local interactions replace the old relief showcase."
anim=r'''  // v2.7 actual-road exploration: partial local choices, not fake full courses.
  const heroBranches = explorationPairs.filter(p => p.nearHero);
  const fieldBranches = explorationPairs.filter(p => !p.nearHero);
  heroBranches.forEach((pair, i) => {
    const prog = { v: 0 };
    const t = 8.55 + (i % 7) * .46;
    tl.to(pair.core.material, { opacity: .66, duration: .20 }, t)
      .to(pair.glow.material, { opacity: .055, duration: .24 }, t)
      .to(prog, { v: 1, duration: 2.4 + (i % 3) * .35, ease: 'power1.inOut', onUpdate: () => { setProgress(pair.core, prog.v); setProgress(pair.glow, prog.v); } }, t + .04)
      .to(pair.core.material, { opacity: .28, duration: 2.0 }, t + 3.2)
      .to(pair.glow.material, { opacity: .012, duration: 2.0 }, t + 3.2);
  });
  fieldBranches.forEach((pair, i) => {
    const prog = { v: 0 };
    const t = 13.4 + (i % 9) * .34 + Math.floor(i / 9) * .78;
    tl.to(pair.core.material, { opacity: .48, duration: .22 }, t)
      .to(pair.glow.material, { opacity: .035, duration: .25 }, t)
      .to(prog, { v: 1, duration: 3.4 + (i % 4) * .30, ease: 'power1.inOut', onUpdate: () => { setProgress(pair.core, prog.v); setProgress(pair.glow, prog.v); } }, t + .04)
      .to(pair.core.material, { opacity: .19, duration: 2.3 }, 25.0 + (i % 5) * .08)
      .to(pair.glow.material, { opacity: .008, duration: 2.3 }, 25.0 + (i % 5) * .08)
      .to(pair.core.material, { opacity: 0, duration: 1.4 }, 28.0 + (i % 3) * .06)
      .to(pair.glow.material, { opacity: 0, duration: 1.2 }, 28.0 + (i % 3) * .06);
  });

'''
patch(marker,anim+marker,'actual-road exploration timeline')

# Remove the remaining large-scale ocean stripe completely. Fine shimmer and coast
# tint are enough for aerial water; broad bands made the scene look synthetic.
patch("float broad=sin(vUv.x*23.0+vUv.y*31.0+uTime*0.08)*sin(vUv.x*13.0-vUv.y*17.0-uTime*0.04);","float broad=0.0;",'remove ocean banding')

# Slightly warmer daytime land and brighter dawn context so North Korea remains
# visible as land instead of collapsing into a black silhouette.
patch("if (peninsulaSurface) peninsulaSurface.material.color.set(0x7c918d);","if (peninsulaSurface) peninsulaSurface.material.color.set(0x9aa89a);",'lift dawn peninsula')
patch("{ r: 1.0, g: 1.0, b: 1.0, duration: 4.2","{ r: 1.08, g: 1.02, b: .91, duration: 4.2",'warmer day surface')

# A little more cloud density only at the edges / aerial layers.
patch("const w = d * s[3] * .54;","const w = d * s[3] * .60;",'larger cloud depth')
patch("targetOpacity: Math.min(.56, s[4] * 2.00)","targetOpacity: Math.min(.64, s[4] * 2.25)",'cloud depth opacity')

# Resize newly added line materials.
patch(
"  choiceRoutePairs.forEach(p => { p.core.material.resolution.set(w, h); p.glow.material.resolution.set(w, h); });",
"  choiceRoutePairs.forEach(p => { p.core.material.resolution.set(w, h); p.glow.material.resolution.set(w, h); });\n  explorationPairs.forEach(p => { p.core.material.resolution.set(w, h); p.glow.material.resolution.set(w, h); });",
'exploration resize')

out.write_text('// Scene 05 B v2.7 — actual-road exploration traces, clean deep ocean and warmer texture-led aerial art.\n'+text,encoding='utf-8')
print(out)
