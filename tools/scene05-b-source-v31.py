#!/usr/bin/env python3
from pathlib import Path
ROOT=Path.cwd();src=ROOT/'output/scene05-b-v30.js';out=ROOT/'output/scene05-b-v31.js';text=src.read_text('utf-8')
def patch(old,new,label,count=1):
 global text;n=text.count(old)
 if n<count:raise SystemExit(f'{label}: expected >= {count}, found {n}')
 text=text.replace(old,new,count)
# Road backdrop becomes a dark embedded landscape texture, not a beige road map.
patch('./assets/road_choice_overlay_v29.png','./assets/road_choice_overlay_v31.png','v31 road texture')
patch("{ opacity: .16, duration: 1.0, ease: 'sine.out' }, 7.65","{ opacity: .42, duration: 1.0, ease: 'sine.out' }, 7.65",'dark roads enter')
patch("{ opacity: .255, duration: 3.1, ease: 'sine.inOut' }, 9.8","{ opacity: .68, duration: 3.1, ease: 'sine.inOut' }, 9.8",'dark roads decision peak')
patch("{ opacity: .19, duration: 6.0, ease: 'sine.inOut' }, 16.0","{ opacity: .53, duration: 6.0, ease: 'sine.inOut' }, 16.0",'dark roads reveal')
patch("{ opacity: .08, duration: 2.2, ease: 'sine.inOut' }, 25.0","{ opacity: .20, duration: 2.2, ease: 'sine.inOut' }, 25.0",'dark roads fade')
# Remove the short gold fragment confetti now that connected rider trails exist.
patch("  for (const r of (data.exploration_branches || [])) {","  for (const r of []) {",'hide short exploration fragments')
# Multiple connected riders are the expressive route layer; keep them elegant and distinct.
patch("color: 0xe9a24b, width: 2.85","color: 0xeaa650, width: 2.35",'rider trail glow')
patch("color: 0xffd98d, width: 1.10","color: 0xffdc96, width: .98",'rider trail core')
patch("{ opacity: .63, duration: .24 }","{ opacity: .71, duration: .24 }",'rider trail visibility')
patch("{ opacity: .34, duration: 2.0 }","{ opacity: .30, duration: 2.0 }",'rider trail settle')
# Five long coast-to-Finish routes are only reference journeys, no longer the dominant network.
patch("{ opacity: .68, duration: .26 }","{ opacity: .56, duration: .26 }",'main route restraint')
patch("{ opacity: .91, duration: .25 }","{ opacity: .82, duration: .25 }",'hero route restraint')
# The first establishing shot previously exposed the finite ocean sheet. Make the sea
# effectively infinite for every planned one-take camera position.
patch("new THREE.PlaneGeometry(160, 160, 120, 120)","new THREE.PlaneGeometry(360, 360, 160, 160)",'ocean plane expansion')
# More atmospheric cloud framing at the edges; still sparse enough not to hide Korea.
patch("const w = d * s[3] * .60;","const w = d * s[3] * .68;",'cloud bank scale')
patch("targetOpacity: Math.min(.64, s[4] * 2.25)","targetOpacity: Math.min(.68, s[4] * 2.40)",'cloud bank opacity')
# Slightly deeper day sea / earth separation.
patch("vec3 day=vec3(0.022,0.135,0.225);","vec3 day=vec3(0.018,0.105,0.185);",'deeper day ocean')
# Reduce the residual wide terrain overlay even further so the baked surface controls art.
patch("dayTerrainMat, { opacity: .32,","dayTerrainMat, { opacity: .22,",'day relief overlay down')
patch("sunsetTerrainMat, { opacity: .29,","sunsetTerrainMat, { opacity: .21,",'sunset relief overlay down')
out.write_text('// Scene 05 B v3.1 — dark embedded real-road field, connected rider journeys, infinite ocean and cleaner aerial art.\n'+text,encoding='utf-8');print(out)
