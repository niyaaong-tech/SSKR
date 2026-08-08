#!/usr/bin/env python3
from __future__ import annotations

import json, math, re
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from pyproj import Transformer

ROOT=Path.cwd(); SRC=ROOT/'assets'/'scene05'/'choice_roads_source_v1.geojson'; TERRAIN=ROOT/'assets'/'scene05'/'south_korea_hero_v0.2'; SVG=ROOT/'assets'/'vector'/'korean_peninsula_precise.svg'; OUT=ROOT/'output'/'scene05_final_v1'
W=1792


def svg_size():
    txt=SVG.read_text('utf-8');m=re.search(r'viewBox="\s*0\s+0\s+([0-9.]+)\s+([0-9.]+)"',txt)
    return float(m.group(1)),float(m.group(2))


def main():
    if not SRC.exists():raise SystemExit('choice road source missing')
    OUT.mkdir(parents=True,exist_ok=True);sw,sh=svg_size();H=round(W*sh/sw)
    geo=json.loads(SRC.read_text('utf-8'));gref=json.loads((TERRAIN/'svg_georef.json').read_text('utf-8'))
    inv=np.asarray(gref['epsg3857_to_svg_px_matrix'],dtype=np.float64);merc=Transformer.from_crs('EPSG:4326','EPSG:3857',always_xy=True)
    layer=Image.new('RGBA',(W,H),(0,0,0,0));draw=ImageDraw.Draw(layer,'RGBA')
    scale=W/sw;counts={};segments=0
    style={'secondary':((211,207,184,58),1),'primary':((226,215,184,82),2),'trunk':((235,221,181,100),2)}
    for f in geo.get('features',[]):
        hw=f.get('properties',{}).get('highway');coords=f.get('geometry',{}).get('coordinates') or []
        if hw not in style or len(coords)<2:continue
        lon=np.asarray([p[0] for p in coords]);lat=np.asarray([p[1] for p in coords]);mx,my=merc.transform(lon,lat)
        sx=inv[0,0]*mx+inv[0,1]*my+inv[0,2];sy=inv[1,0]*mx+inv[1,1]*my+inv[1,2]
        pts=[(float(x*scale),float(y*scale)) for x,y in zip(sx,sy)]
        color,width=style[hw];draw.line(pts,fill=color,width=width,joint='curve');counts[hw]=counts.get(hw,0)+1;segments+=max(0,len(pts)-1)
    # Soften only enough to anti-alias national-scale roads; no neon/glow.
    soft=layer.filter(ImageFilter.GaussianBlur(.35));soft.save(OUT/'road_choice_overlay_v29.png',optimize=True)
    meta={'schema_version':'2.9','source':str(SRC.relative_to(ROOT)),'texture':'road_choice_overlay_v29.png','size':[W,H],'counts':counts,'segments':segments,'policy':'Actual OSM trunk/primary/secondary road backdrop. Presentation context only; not navigation or official SSKR routes.'}
    (OUT/'road_choice_overlay_v29.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(meta,ensure_ascii=False,indent=2))

if __name__=='__main__':main()
