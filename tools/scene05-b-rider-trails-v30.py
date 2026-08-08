#!/usr/bin/env python3
from __future__ import annotations
import collections,json,math,random
from pathlib import Path
import numpy as np
from PIL import Image
from pyproj import CRS,Transformer
ROOT=Path.cwd();DATA=ROOT/'output/scene05_final_v1/scene05_final_data_v1.json';SRC=ROOT/'assets/scene05/choice_roads_source_v1.geojson';TERRAIN=ROOT/'assets/scene05/south_korea_hero_v0.2';NTRAILS=18;BASE=.053;RELIEF=.09

def key(p):return (round(float(p[0]),5),round(float(p[1]),5))
def dist2(a,b):return (a[0]-b[0])**2+(a[2]-b[2])**2
def main():
 data=json.loads(DATA.read_text());geo=json.loads(SRC.read_text());features=geo['features'];adj=collections.defaultdict(list);ends=[]
 for i,f in enumerate(features):
  c=f['geometry']['coordinates'];a,b=key(c[0]),key(c[-1]);ends.append((a,b));adj[a].append(i);adj[b].append(i)
 meta=json.loads((TERRAIN/'terrain_metadata.json').read_text());height=np.asarray(Image.open(TERRAIN/'height_u16.png'),dtype=np.float64);tf=Transformer.from_crs('EPSG:4326',CRS.from_proj4(meta['local_crs_proj4']),always_xy=True);minx,miny,maxx,maxy=meta['local_bounds_m'];rw,rh=meta['raster_size'];scene=float(meta['scene_m_per_unit']);ve=float(meta['vertical_exaggeration']);maxe=float(meta['mesh']['max_elevation_m'])
 def bil(x,y):
  x=float(np.clip(x,0,rw-1));y=float(np.clip(y,0,rh-1));x0=int(x);y0=int(y);x1=min(x0+1,rw-1);y1=min(y0+1,rh-1);tx=x-x0;ty=y-y0;return float(height[y0,x0]*(1-tx)*(1-ty)+height[y0,x1]*tx*(1-ty)+height[y1,x0]*(1-tx)*ty+height[y1,x1]*tx*ty)
 def sp(lon,lat):
  x,y=tf.transform(lon,lat);px=(x-minx)/(maxx-minx)*(rw-1);py=(maxy-y)/(maxy-miny)*(rh-1);e=max(0,bil(px,py)/65535*maxe);return [x/scene,BASE+(e*ve/scene)*RELIEF,-y/scene]
 rng=random.Random(3005);secondary=[i for i,f in enumerate(features) if f['properties']['highway']=='secondary' and .25<float(f['properties']['length_km'])<6.0];rng.shuffle(secondary);used=set();trails=[];cells=set()
 for start_edge in secondary:
  if start_edge in used:continue
  c0=features[start_edge]['geometry']['coordinates'];mid=c0[len(c0)//2];start_scene=sp(mid[0],mid[1]);gx=int((start_scene[0]+34)/9);gz=int((start_scene[2]+34)/8);cell=(gx,gz)
  if cell in cells:continue
  a,b=ends[start_edge];cur=b if rng.random()>.5 else a;prev=None;edge=start_edge;seq=[];coords=[];total=0
  for step in range(30):
   f=features[edge];raw=f['geometry']['coordinates'];ea,eb=ends[edge]
   if prev is None:
    oriented=raw if key(raw[-1])==cur else list(reversed(raw))
   else:
    # cur is where we enter this edge; append away from cur.
    oriented=raw if ea==cur else list(reversed(raw))
   if coords and key(coords[-1])==key(oriented[0]):coords.extend(oriented[1:])
   else:coords.extend(oriented)
   total+=float(f['properties']['length_km']);seq.append(edge);used.add(edge)
   next_key=key(oriented[-1]);opts=[j for j in adj[next_key] if j!=edge and j not in seq and features[j]['properties']['highway'] in {'secondary','primary','trunk'}]
   if total>=15 and (total>=38 or not opts or rng.random()<.12):break
   if not opts:break
   # Prefer secondary but allow major-road joins. Favor longer fragments for readable trails.
   opts.sort(key=lambda j:((features[j]['properties']['highway']=='secondary'),min(float(features[j]['properties']['length_km']),5.0),rng.random()),reverse=True);prev=edge;cur=next_key;edge=opts[0]
  if total<11 or len(seq)<7 or len(coords)<10:continue
  pts=[sp(lon,lat) for lon,lat in coords];trails.append({'id':f'rider_trail_{len(trails)+1:02d}','source_osm_way_ids':[features[i]['properties']['osm_way_id'] for i in seq],'length_km':round(total,2),'role':'actual_connected_rider_exploration_trace','points':pts});cells.add(cell)
  if len(trails)>=NTRAILS:break
 data['rider_trails']=trails;data['schema_version']='2.0-v30-connected-rider-trails';data.setdefault('policy',[]).append('v3.0 rider trails are connected sequences of actual OSM trunk/primary/secondary road ways; they are cinematic examples, never official routing.')
 DATA.write_text(json.dumps(data,ensure_ascii=False,indent=2));print(json.dumps({'rider_trails':len(trails),'lengths_km':[t['length_km'] for t in trails]},indent=2))
if __name__=='__main__':main()
