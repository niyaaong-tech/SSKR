#!/usr/bin/env python3
from __future__ import annotations
import json,re
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw,ImageFilter
from pyproj import Transformer
ROOT=Path.cwd();SRC=ROOT/'assets/scene05/choice_roads_source_v1.geojson';TERRAIN=ROOT/'assets/scene05/south_korea_hero_v0.2';SVG=ROOT/'assets/vector/korean_peninsula_precise.svg';OUT=ROOT/'output/scene05_final_v1';W=1792

def svgsize():
 m=re.search(r'viewBox="\s*0\s+0\s+([0-9.]+)\s+([0-9.]+)"',SVG.read_text('utf-8'));return float(m.group(1)),float(m.group(2))
def main():
 sw,sh=svgsize();H=round(W*sh/sw);geo=json.loads(SRC.read_text());g=json.loads((TERRAIN/'svg_georef.json').read_text());inv=np.asarray(g['epsg3857_to_svg_px_matrix']);tf=Transformer.from_crs('EPSG:4326','EPSG:3857',always_xy=True);im=Image.new('RGBA',(W,H),(0,0,0,0));d=ImageDraw.Draw(im,'RGBA');scale=W/sw
 # Roads are deliberately darker than the land texture. The network should be
 # discoverable under gold trails, not read as a beige navigation overlay.
 style={'secondary':((31,43,34,50),1),'primary':((36,48,37,68),1),'trunk':((43,53,40,78),2)};counts={}
 for f in geo['features']:
  hw=f['properties']['highway'];c=f['geometry']['coordinates'];lon=np.asarray([p[0] for p in c]);lat=np.asarray([p[1] for p in c]);mx,my=tf.transform(lon,lat);sx=inv[0,0]*mx+inv[0,1]*my+inv[0,2];sy=inv[1,0]*mx+inv[1,1]*my+inv[1,2];pts=[(float(x*scale),float(y*scale)) for x,y in zip(sx,sy)];col,w=style[hw];d.line(pts,fill=col,width=w,joint='curve');counts[hw]=counts.get(hw,0)+1
 im=im.filter(ImageFilter.GaussianBlur(.18));im.save(OUT/'road_choice_overlay_v31.png',optimize=True);meta={'schema_version':'3.1','texture':'road_choice_overlay_v31.png','source':str(SRC.relative_to(ROOT)),'size':[W,H],'counts':counts,'policy':'Actual OSM trunk/primary/secondary roads, dark integrated context only; not navigation or official routes.'};(OUT/'road_choice_overlay_v31.json').write_text(json.dumps(meta,ensure_ascii=False,indent=2));print(json.dumps(meta,indent=2))
if __name__=='__main__':main()
