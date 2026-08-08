#!/usr/bin/env python3
from pathlib import Path
ROOT=Path.cwd();src=ROOT/'output/scene05-b-v32.js';out=ROOT/'output/scene05-b-v33.js';text=src.read_text('utf-8')
def patch(old,new,label,count=1):
 global text;n=text.count(old)
 if n<count:raise SystemExit(f'{label}: expected >= {count}, found {n}')
 text=text.replace(old,new,count)
patch('./assets/peninsula_surface_v30.png','./assets/peninsula_surface_v33.png','WorldCover texture URL')
patch('./assets/peninsula_surface_v30.json','./assets/peninsula_surface_v33.json','WorldCover texture meta')
# The new texture already contains real forest/cropland/built-up variation; remove the
# previous warm-green compensation and let cinematic light grade it more neutrally.
patch("{ r: 1.02, g: 1.00, b: .94, duration: 4.2","{ r: 1.00, g: 1.00, b: 1.00, duration: 4.2",'neutral WorldCover day grade')
patch('renderer.toneMappingExposure = 1.07;','renderer.toneMappingExposure = 1.05;','WorldCover filmic exposure')
# Slight atmospheric veil at the national reveal pushes terrain from GIS-map contrast
# toward aerial photography while preserving the real road-choice structure.
patch(".to(scene.fog, { density: .0048, duration: 3.6 }, 16.7)",".to(scene.fog, { density: .00525, duration: 3.6 }, 16.7)",'aerial atmosphere')
# Route palette: participant paths stay gold but reduce white-hot cores now that the
# land itself carries more information.
patch("color: 0xffd993, width: 1.02","color: 0xfbd18a, width: .96",'participant route material')
patch("{ opacity: .78, duration: .25 }","{ opacity: .72, duration: .25 }",'participant route integration')
out.write_text('// Scene 05 B v3.3 — ESA WorldCover-informed land materials + complete actual-road participant journeys.\n'+text,encoding='utf-8');print(out)
