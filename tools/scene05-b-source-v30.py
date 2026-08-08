#!/usr/bin/env python3
from pathlib import Path
ROOT=Path.cwd();src=ROOT/'output/scene05-b-v29.js';out=ROOT/'output/scene05-b-v30.js';text=src.read_text('utf-8')
def patch(old,new,label,count=1):
 global text;n=text.count(old)
 if n<count:raise SystemExit(f'{label}: expected >= {count}, found {n}')
 text=text.replace(old,new,count)
# Richer seamless terrain art.
patch('./assets/peninsula_surface_v28.png','./assets/peninsula_surface_v30.png','v30 surface texture')
patch('./assets/peninsula_surface_v28.json','./assets/peninsula_surface_v30.json','v30 surface meta')
patch('renderer.toneMappingExposure = 1.12;','renderer.toneMappingExposure = 1.07;','filmic exposure')
patch('{ r: 1.14, g: 1.08, b: .98, duration: 4.2','{ r: 1.02, g: 1.00, b: .94, duration: 4.2','richer daylight grade')
# Rider-trail scene groups.
patch('const explorationRouteGroup = new THREE.Group();\nconst routeGlowGroup = new THREE.Group();','const explorationRouteGroup = new THREE.Group();\nconst riderTrailGlowGroup = new THREE.Group();\nconst riderTrailRouteGroup = new THREE.Group();\nconst routeGlowGroup = new THREE.Group();','rider groups')
patch('explorationGlowGroup, explorationRouteGroup, routeGlowGroup','explorationGlowGroup, explorationRouteGroup, riderTrailGlowGroup, riderTrailRouteGroup, routeGlowGroup','rider scene order')
patch('const explorationPairs = [];\nconst seedLines = [];','const explorationPairs = [];\nconst riderTrailPairs = [];\nconst seedLines = [];','rider array')
# Build longer connected actual-road participant trails before seed lines.
anchor='  for (const s of data.start_seeds) {'
insert=r'''  for (const r of (data.rider_trails || [])) {
    const glow = lineFromPoints(r.points, { color: 0xe9a24b, width: 2.85, opacity: 0, order: 7, depthTest: false });
    const core = lineFromPoints(r.points, { color: 0xffd98d, width: 1.10, opacity: 0, order: 9, depthTest: true });
    setProgress(glow, 0); setProgress(core, 0);
    riderTrailPairs.push({ id: r.id, glow, core });
    riderTrailGlowGroup.add(glow); riderTrailRouteGroup.add(core);
  }

'''
patch(anchor,insert+anchor,'build connected rider trails')
# Deterministic reset.
patch('  explorationPairs.forEach(p => {\n    p.core.material.opacity = 0; p.glow.material.opacity = 0;\n    setProgress(p.core, 0); setProgress(p.glow, 0);\n  });\n  if (roadOverlayMat) roadOverlayMat.opacity = 0;', '  explorationPairs.forEach(p => {\n    p.core.material.opacity = 0; p.glow.material.opacity = 0;\n    setProgress(p.core, 0); setProgress(p.glow, 0);\n  });\n  riderTrailPairs.forEach(p => { p.core.material.opacity = 0; p.glow.material.opacity = 0; setProgress(p.core, 0); setProgress(p.glow, 0); });\n  if (roadOverlayMat) roadOverlayMat.opacity = 0;','rider reset')
# If v29 reset still refers via roadChoiceNetwork rather than overlay mat, patch fallback.
if 'if (roadOverlayMat) roadOverlayMat.opacity = 0;' not in text:
 patch('  if (roadChoiceNetwork) roadChoiceNetwork.material.opacity = 0;','  riderTrailPairs.forEach(p => { p.core.material.opacity = 0; p.glow.material.opacity = 0; setProgress(p.core, 0); setProgress(p.glow, 0); });\n  if (roadChoiceNetwork) roadChoiceNetwork.material.opacity = 0;','rider reset fallback')
# Baked road field slightly restrained once long actual rider trails are present.
patch('{ opacity: .31, duration: 3.1, ease: \'sine.inOut\' }, 9.8','{ opacity: .255, duration: 3.1, ease: \'sine.inOut\' }, 9.8','road backdrop restraint')
patch('{ opacity: .23, duration: 6.0, ease: \'sine.inOut\' }, 16.0','{ opacity: .19, duration: 6.0, ease: \'sine.inOut\' }, 16.0','road backdrop reveal restraint')
# Animate 18 connected rider journeys across the middle act. Their different start
# times and lengths make the scene feel populated without becoming particle traffic.
marker='  // 12–17s — ENCOUNTER & MERGE: other Routes enter the same moving composition; local interactions replace the old relief showcase.'
anim=r'''  // v3.0 connected rider trails: actual road sequences, independently chosen.
  riderTrailPairs.forEach((pair, i) => {
    const prog = { v: 0 };
    const t = 10.4 + (i % 6) * .42 + Math.floor(i / 6) * 1.05;
    tl.to(pair.core.material, { opacity: .63, duration: .24 }, t)
      .to(pair.glow.material, { opacity: .050, duration: .28 }, t)
      .to(prog, { v: 1, duration: 6.0 + (i % 5) * .65, ease: 'power1.inOut', onUpdate: () => { setProgress(pair.core, prog.v); setProgress(pair.glow, prog.v); } }, t + .04)
      .to(pair.core.material, { opacity: .34, duration: 2.0 }, 23.8 + (i % 4) * .10)
      .to(pair.glow.material, { opacity: .018, duration: 2.0 }, 23.8 + (i % 4) * .10)
      .to(pair.core.material, { opacity: 0, duration: 1.65 }, 27.6 + (i % 3) * .06)
      .to(pair.glow.material, { opacity: 0, duration: 1.45 }, 27.6 + (i % 3) * .06);
  });

'''
patch(marker,anim+marker,'connected rider timeline')
# Five long routes read as examples rather than the whole service.
patch('{ opacity: .76, duration: .26 }','{ opacity: .68, duration: .26 }','main examples quieter')
# Resize rider line materials.
patch('  explorationPairs.forEach(p => { p.core.material.resolution.set(w, h); p.glow.material.resolution.set(w, h); });','  explorationPairs.forEach(p => { p.core.material.resolution.set(w, h); p.glow.material.resolution.set(w, h); });\n  riderTrailPairs.forEach(p => { p.core.material.resolution.set(w, h); p.glow.material.resolution.set(w, h); });','rider resize')
out.write_text('// Scene 05 B v3.0 — richer aerial terrain plus many connected actual-road rider journeys.\n'+text,encoding='utf-8');print(out)
