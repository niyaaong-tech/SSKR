#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path
import numpy as np
from PIL import Image

ROOT=Path.cwd();OUT=ROOT/'output/scene05_final_v1';TERRAIN=ROOT/'assets/scene05/south_korea_hero_v0.2';RELIEF=.16;BASE=-.018

def bilinear(a,x,y):
 h,w=a.shape;x=float(np.clip(x,0,w-1));y=float(np.clip(y,0,h-1));x0=int(x);y0=int(y);x1=min(x0+1,w-1);y1=min(y0+1,h-1);tx=x-x0;ty=y-y0;return float(a[y0,x0]*(1-tx)*(1-ty)+a[y0,x1]*tx*(1-ty)+a[y1,x0]*(1-tx)*ty+a[y1,x1]*tx*ty)
def main():
 src=json.loads((OUT/'peninsula_surface_v33.json').read_text());meta=json.loads((TERRAIN/'terrain_metadata.json').read_text());h16=np.asarray(Image.open(TERRAIN/'height_u16.png'),dtype=np.float64);scene=float(meta['scene_m_per_unit']);ve=float(meta['vertical_exaggeration']);maxe=float(meta['mesh']['max_elevation_m']);minx,miny,maxx,maxy=meta['local_bounds_m'];rw,rh=meta['raster_size'];positions=src['grid']['positions'];raised=0;maxy=BASE
 for p in positions:
  lx=float(p[0])*scene;ly=-float(p[2])*scene
  if minx<=lx<=maxx and miny<=ly<=maxy:
   px=(lx-minx)/(maxx-minx)*(rw-1);py=(maxy-ly)/(maxy-miny)*(rh-1);e=max(0.,bilinear(h16,px,py)/65535.*maxe);p[1]=BASE+(e*ve/scene)*RELIEF
   if e>2:raised+=1;maxy=max(maxy,p[1])
  else:p[1]=BASE
 src['schema_version']='3.4';src['surface_relief']={'base_y':BASE,'dem_relief_scale':RELIEF,'authority':'Copernicus GLO-30 where Scene05 DEM exists','raised_grid_vertices':raised};src['texture']='peninsula_surface_v33.png';(OUT/'peninsula_surface_v34.json').write_text(json.dumps(src,ensure_ascii=False,indent=2));print(json.dumps({'grid_vertices':len(positions),'raised':raised,'max_surface_y':maxy,'relief_scale':RELIEF},indent=2))
if __name__=='__main__':main()
