#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path
import numpy as np
from PIL import Image

ROOT=Path.cwd();DATA=ROOT/'output/scene05_final_v1/scene05_final_data_v1.json';TERRAIN=ROOT/'assets/scene05/south_korea_hero_v0.2';BASE=.052;RELIEF=.16

def bilinear(a,x,y):
 h,w=a.shape;x=float(np.clip(x,0,w-1));y=float(np.clip(y,0,h-1));x0=int(x);y0=int(y);x1=min(x0+1,w-1);y1=min(y0+1,h-1);tx=x-x0;ty=y-y0;return float(a[y0,x0]*(1-tx)*(1-ty)+a[y0,x1]*tx*(1-ty)+a[y1,x0]*(1-tx)*ty+a[y1,x1]*tx*ty)
def main():
 data=json.loads(DATA.read_text());meta=json.loads((TERRAIN/'terrain_metadata.json').read_text());h16=np.asarray(Image.open(TERRAIN/'height_u16.png'),dtype=np.float64);scene=float(meta['scene_m_per_unit']);ve=float(meta['vertical_exaggeration']);maxe=float(meta['mesh']['max_elevation_m']);minx,miny,maxx,maxy=meta['local_bounds_m'];rw,rh=meta['raster_size']
 def conform(p,lift=BASE):
  lx=float(p[0])*scene;ly=-float(p[2])*scene;e=0.
  if minx<=lx<=maxx and miny<=ly<=maxy:
   px=(lx-minx)/(maxx-minx)*(rw-1);py=(maxy-ly)/(maxy-miny)*(rh-1);e=max(0.,bilinear(h16,px,py)/65535.*maxe)
  return [float(p[0]),lift+(e*ve/scene)*RELIEF,float(p[2])]
 def points(items,key='points',lift=BASE):
  for x in items:
   if key in x:x[key]=[conform(p,lift) for p in x[key]]
 points(data.get('main_routes',[]));points(data.get('participant_routes',[]),lift=BASE+.006);points(data.get('exploration_branches',[]),lift=BASE+.004);points(data.get('start_seeds',[]),lift=BASE+.002)
 for s in data.get('starts',[]):s['position']=conform(s['position'],BASE+.002)
 if data.get('finish'):data['finish']['position']=conform(data['finish']['position'],BASE+.004)
 for c in data.get('checkpoints',[]):c['position']=conform(c['position'],BASE+.005)
 for m in data.get('merged_segments',[]):m['a']=conform(m['a'],BASE+.003);m['b']=conform(m['b'],BASE+.003)
 data['schema_version']='2.2-v34-surface-conformed';data['surface_conform']={'relief_scale':RELIEF,'base_graphic_lift':BASE,'authority':'same Copernicus GLO-30 shallow relief as canonical peninsula texture mesh'};data.setdefault('policy',[]).append('v3.4 all route/node/checkpoint graphics are conformed to the same shallow DEM relief as the texture-led land surface.')
 DATA.write_text(json.dumps(data,ensure_ascii=False,indent=2));print(json.dumps({'main_routes':len(data.get('main_routes',[])),'participant_routes':len(data.get('participant_routes',[])),'starts':len(data.get('starts',[])),'relief_scale':RELIEF},indent=2))
if __name__=='__main__':main()
