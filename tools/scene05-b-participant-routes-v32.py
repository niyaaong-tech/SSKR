#!/usr/bin/env python3
from __future__ import annotations

import collections
import heapq
import json
import math
from pathlib import Path

import numpy as np
from PIL import Image
from pyproj import CRS, Transformer

ROOT=Path.cwd()
DATA=ROOT/'output'/'scene05_final_v1'/'scene05_final_data_v1.json'
ROADS=ROOT/'assets'/'scene05'/'choice_roads_source_v1.geojson'
TERRAIN=ROOT/'assets'/'scene05'/'south_korea_hero_v0.2'
BASE_LIFT=.055
RELIEF_SCALE=.09
SNAP_KM=.12
CELL_DEG=.01

STARTS={
 'n01':(128.59,38.20),
 'n02':(129.03,37.69),
 'n04':(129.40,36.99),
 'n07':(129.50,35.80),
 'n09':(129.05,35.08),
}
FINISH=(126.51131,36.31125)
# Two different geographic choices per representative start. These are visual
# waypoints only, used to generate diverse actual-road journeys; not event routes.
WAYPOINTS={
 'n01':[(127.55,37.35),(128.05,36.72)],
 'n02':[(127.82,36.60),(128.18,35.92)],
 'n04':[(128.10,36.48),(127.52,35.94)],
 'n07':[(128.18,35.48),(127.64,36.17)],
 'n09':[(127.82,35.42),(128.38,36.02)],
}


def key(p):return (round(float(p[0]),5),round(float(p[1]),5))
def hav(a,b):
 lon1,lat1=a;lon2,lat2=b;r=6371.;p1=math.radians(lat1);p2=math.radians(lat2);dp=math.radians(lat2-lat1);dl=math.radians(lon2-lon1);q=math.sin(dp/2)**2+math.cos(p1)*math.cos(p2)*math.sin(dl/2)**2;return 2*r*math.asin(min(1.,math.sqrt(q)))
def point_segment_km(p,a,b,coslat):
 px,py=p[0]*coslat,p[1];ax,ay=a[0]*coslat,a[1];bx,by=b[0]*coslat,b[1];vx,vy=bx-ax,by-ay;den=vx*vx+vy*vy
 if den<1e-14:return 1e9,0.
 t=max(0.,min(1.,((px-ax)*vx+(py-ay)*vy)/den));qx=ax+t*vx;qy=ay+t*vy;return math.hypot(px-qx,py-qy)*111.,t


def build_graph(geo):
 adj=collections.defaultdict(list);segments=[]
 class_mult={'trunk':1.00,'primary':1.03,'secondary':1.08}
 for f in geo['features']:
  hw=f['properties']['highway'];coords=[key(p) for p in f['geometry']['coordinates']];m=class_mult.get(hw,1.08)
  for a,b in zip(coords,coords[1:]):
   w=hav(a,b)*m;adj[a].append((b,w));adj[b].append((a,w));segments.append((a,b,w))
 # RDP-compressed source can remove exact intersection points. Reconnect degree<=2
 # graph vertices to a nearby segment within 120m. The visual path still follows
 # actual OSM road geometry; only the tiny junction bridge is inferred.
 grid=collections.defaultdict(list)
 for i,(a,b,w) in enumerate(segments):
  minx,maxx=sorted((a[0],b[0]));miny,maxy=sorted((a[1],b[1]))
  for ix in range(int(minx/CELL_DEG),int(maxx/CELL_DEG)+1):
   for iy in range(int(miny/CELL_DEG),int(maxy/CELL_DEG)+1):grid[(ix,iy)].append(i)
 coslat=math.cos(math.radians(36.4));added=0
 nodes=list(adj)
 for p in nodes:
  if len(adj[p])>2:continue
  ix,iy=int(p[0]/CELL_DEG),int(p[1]/CELL_DEG);best=None
  for dx in (-1,0,1):
   for dy in (-1,0,1):
    for si in grid.get((ix+dx,iy+dy),[]):
     a,b,w=segments[si]
     if p==a or p==b:continue
     dist,t=point_segment_km(p,a,b,coslat)
     if dist<SNAP_KM and (best is None or dist<best[0]):best=(dist,t,a,b,w)
  if best:
   dist,t,a,b,w=best;wa=dist+w*t;wb=dist+w*(1-t);adj[p].append((a,wa));adj[a].append((p,wa));adj[p].append((b,wb));adj[b].append((p,wb));added+=1
 return adj,added


def largest_component(adj):
 seen=set();best=[]
 for n in adj:
  if n in seen:continue
  stack=[n];seen.add(n);comp=[]
  while stack:
   x=stack.pop();comp.append(x)
   for y,_ in adj[x]:
    if y not in seen:seen.add(y);stack.append(y)
  if len(comp)>len(best):best=comp
 return set(best)


def nearest(nodes,lon,lat):
 c=math.cos(math.radians(lat));return min(nodes,key=lambda q:(q[0]-lon)**2*c*c+(q[1]-lat)**2)

def shortest(adj,allowed,start,goal):
 q=[(0.,start)];dist={start:0.};prev={}
 while q:
  du,u=heapq.heappop(q)
  if du!=dist[u]:continue
  if u==goal:break
  for v,w in adj[u]:
   if v not in allowed:continue
   nd=du+w
   if nd<dist.get(v,1e100):dist[v]=nd;prev[v]=u;heapq.heappush(q,(nd,v))
 if goal not in dist:return [],1e100
 path=[goal]
 while path[-1]!=start:path.append(prev[path[-1]])
 return path[::-1],dist[goal]

def dedupe(path):
 out=[]
 for p in path:
  if not out or p!=out[-1]:out.append(p)
 return out

def thin(path,maxn=1250):
 if len(path)<=maxn:return path
 idx=np.linspace(0,len(path)-1,maxn).astype(int);return [path[i] for i in idx]


def main():
 data=json.loads(DATA.read_text('utf-8'));geo=json.loads(ROADS.read_text('utf-8'));adj,snaps=build_graph(geo);giant=largest_component(adj);nodes=list(giant)
 finish=nearest(nodes,*FINISH)
 meta=json.loads((TERRAIN/'terrain_metadata.json').read_text('utf-8'));height=np.asarray(Image.open(TERRAIN/'height_u16.png'),dtype=np.float64);tf=Transformer.from_crs('EPSG:4326',CRS.from_proj4(meta['local_crs_proj4']),always_xy=True);minx,miny,maxx,maxy=meta['local_bounds_m'];rw,rh=meta['raster_size'];scene=float(meta['scene_m_per_unit']);ve=float(meta['vertical_exaggeration']);maxe=float(meta['mesh']['max_elevation_m'])
 def bil(x,y):
  x=float(np.clip(x,0,rw-1));y=float(np.clip(y,0,rh-1));x0=int(x);y0=int(y);x1=min(x0+1,rw-1);y1=min(y0+1,rh-1);tx=x-x0;ty=y-y0;return float(height[y0,x0]*(1-tx)*(1-ty)+height[y0,x1]*tx*(1-ty)+height[y1,x0]*(1-tx)*ty+height[y1,x1]*tx*ty)
 def scenept(p):
  lon,lat=p;x,y=tf.transform(lon,lat);px=(x-minx)/(maxx-minx)*(rw-1);py=(maxy-y)/(maxy-miny)*(rh-1);e=max(0,bil(px,py)/65535*maxe);return [x/scene,BASE_LIFT+(e*ve/scene)*RELIEF_SCALE,-y/scene]
 routes=[];snap_meta={}
 for sid,coord in STARTS.items():
  s=nearest(nodes,*coord);snap_meta[sid]={'source':coord,'graph_node':s,'snap_km':round(hav(coord,s),2)}
  for vi,wpcoord in enumerate(WAYPOINTS[sid],1):
   wp=nearest(nodes,*wpcoord);a,da=shortest(adj,giant,s,wp);b,db=shortest(adj,giant,wp,finish)
   if not a or not b:continue
   ll=thin(dedupe(a+b[1:]));routes.append({'id':f'participant_{sid}_{vi}','start_id':sid,'visual_waypoint':list(wpcoord),'distance_weighted_km':round(da+db,1),'role':'illustrative_self_directed_actual_road_journey','points':[scenept(p) for p in ll]})
 data['participant_routes']=routes;data['schema_version']='2.1-v32-participant-routes';data['participant_route_design']={'count':len(routes),'source':'OSM trunk/primary/secondary road graph','start_snap':snap_meta,'finish_graph_snap_km':round(hav(FINISH,finish),2),'junction_snap_max_m':int(SNAP_KM*1000),'principle':'same Finish, visibly different actual-road choices through different intermediate regions','navigation_status':'presentation_only'}
 data.setdefault('policy',[]).extend(['v3.2 participant routes are illustrative actual-road graph paths generated for visual storytelling, not official, recommended, or navigation routes.','Small <=120m junction snaps reconstruct connectivity lost by national-scale source simplification.'])
 DATA.write_text(json.dumps(data,ensure_ascii=False,indent=2));print(json.dumps({'participant_routes':len(routes),'graph_nodes':len(adj),'giant_nodes':len(giant),'junction_snaps':snaps,'distance_km':[r['distance_weighted_km'] for r in routes],'start_snap':snap_meta},indent=2))
if __name__=='__main__':main()
