#!/usr/bin/env python3
from pathlib import Path
ROOT=Path.cwd();src=ROOT/'output/scene05-b-v31.js';out=ROOT/'output/scene05-b-v32.js';text=src.read_text('utf-8')
def patch(old,new,label,count=1):
 global text;n=text.count(old)
 if n<count:raise SystemExit(f'{label}: expected >= {count}, found {n}')
 text=text.replace(old,new,count)
# Long participant journeys replace the short distributed rider trails as the main
# autonomy storytelling layer. Every path is an actual-road graph route to the same Finish.
patch('const riderTrailRouteGroup = new THREE.Group();\nconst routeGlowGroup = new THREE.Group();','const riderTrailRouteGroup = new THREE.Group();\nconst participantGlowGroup = new THREE.Group();\nconst participantRouteGroup = new THREE.Group();\nconst routeGlowGroup = new THREE.Group();','participant groups')
patch('riderTrailGlowGroup, riderTrailRouteGroup, routeGlowGroup','riderTrailGlowGroup, riderTrailRouteGroup, participantGlowGroup, participantRouteGroup, routeGlowGroup','participant scene order')
patch('const riderTrailPairs = [];\nconst seedLines = [];','const riderTrailPairs = [];\nconst participantRoutePairs = [];\nconst seedLines = [];','participant array')
# Hide the old local random walks in v3.2; they solved density but did not communicate
# complete participant journeys strongly enough.
patch('  for (const r of (data.rider_trails || [])) {','  for (const r of []) {','retire short rider trails')
anchor='  for (const s of data.start_seeds) {'
insert=r'''  for (const r of (data.participant_routes || [])) {
    const pts = smoothVisualPoints(r.points);
    const glow = lineFromPoints(pts, { color: 0xe8a14b, width: 2.55, opacity: 0, order: 7, depthTest: false });
    const core = lineFromPoints(pts, { color: 0xffd993, width: 1.02, opacity: 0, order: 10, depthTest: true });
    setProgress(glow, 0); setProgress(core, 0);
    participantRoutePairs.push({ id: r.id, startId: r.start_id, glow, core });
    participantGlowGroup.add(glow); participantRouteGroup.add(core);
  }

'''
patch(anchor,insert+anchor,'build participant actual-road journeys')
# Reset participant lines.
patch('  riderTrailPairs.forEach(p => { p.core.material.opacity = 0; p.glow.material.opacity = 0; setProgress(p.core, 0); setProgress(p.glow, 0); });\n  if (roadChoiceNetwork) roadChoiceNetwork.material.opacity = 0;','  riderTrailPairs.forEach(p => { p.core.material.opacity = 0; p.glow.material.opacity = 0; setProgress(p.core, 0); setProgress(p.glow, 0); });\n  participantRoutePairs.forEach(p => { p.core.material.opacity = 0; p.glow.material.opacity = 0; setProgress(p.core, 0); setProgress(p.glow, 0); });\n  if (roadChoiceNetwork) roadChoiceNetwork.material.opacity = 0;','participant reset')
# Animate complete journeys. Two routes from the same Start share the early geography,
# then visibly diverge through different intermediate regions and reconverge near Finish.
marker='  // v3.0 connected rider trails: actual road sequences, independently chosen.'
anim=r'''  // v3.2 complete participant journeys: actual-road alternatives to one Finish.
  participantRoutePairs.forEach((pair, i) => {
    const prog = { v: 0 };
    const group = Math.floor(i / 2);
    const variant = i % 2;
    const t = 7.15 + group * .42 + variant * .30;
    tl.to(pair.core.material, { opacity: .78, duration: .25 }, t)
      .to(pair.glow.material, { opacity: .050, duration: .28 }, t)
      .to(prog, { v: 1, duration: 11.4 + variant * 1.1 + (group % 3) * .55, ease: 'power1.inOut', onUpdate: () => { setProgress(pair.core, prog.v); setProgress(pair.glow, prog.v); } }, t + .04)
      .to(pair.core.material, { opacity: .52, duration: 1.5 }, 21.4 + group * .08)
      .to(pair.glow.material, { opacity: .020, duration: 1.5 }, 21.4 + group * .08)
      .to(pair.core.material, { opacity: .22, duration: 2.0 }, 25.0 + group * .05)
      .to(pair.glow.material, { opacity: .006, duration: 2.0 }, 25.0 + group * .05)
      .to(pair.core.material, { opacity: 0, duration: 1.4 }, 28.0 + variant * .08)
      .to(pair.glow.material, { opacity: 0, duration: 1.2 }, 28.0 + variant * .08);
  });

'''
patch(marker,anim+marker,'participant journey timeline')
# Main routes become faint structural reference only; participant decisions carry the scene.
patch("{ opacity: .56, duration: .26 }","{ opacity: .34, duration: .26 }",'main route reference only')
patch("{ opacity: .82, duration: .25 }","{ opacity: .62, duration: .25 }",'hero route reference only')
# Road texture peaks slightly lower now that actual full participant courses are visible.
patch("{ opacity: .68, duration: 3.1, ease: 'sine.inOut' }, 9.8","{ opacity: .56, duration: 3.1, ease: 'sine.inOut' }, 9.8",'road context balance')
patch("{ opacity: .53, duration: 6.0, ease: 'sine.inOut' }, 16.0","{ opacity: .44, duration: 6.0, ease: 'sine.inOut' }, 16.0",'road context reveal balance')
# Resize support.
patch('  riderTrailPairs.forEach(p => { p.core.material.resolution.set(w, h); p.glow.material.resolution.set(w, h); });','  riderTrailPairs.forEach(p => { p.core.material.resolution.set(w, h); p.glow.material.resolution.set(w, h); });\n  participantRoutePairs.forEach(p => { p.core.material.resolution.set(w, h); p.glow.material.resolution.set(w, h); });','participant resize')
out.write_text('// Scene 05 B v3.2 — ten diverse complete participant journeys on actual road graph, one Finish.\n'+text,encoding='utf-8');print(out)
