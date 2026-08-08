#!/usr/bin/env python3
from __future__ import annotations

import json
import math
from pathlib import Path

import numpy as np
from PIL import Image
from pyproj import CRS, Transformer

ROOT=Path.cwd()
ROUTE_GEO=ROOT/'assets'/'scene05'/'route_network_v0.1'/'scene05_route_network_v01.geojson'
TERRAIN=ROOT/'assets'/'scene05'/'south_korea_hero_v0.2'
OUT=ROOT/'output'/'scene05_route3d_v0.1'
ROUTE_IDS={'route_start_n01','route_start_n02','route_start_n04','route_start_n07','route_start_n09'}
ROUTE_OFFSET_M=60.0
NODE_OFFSET_M=70.0
DENSIFY_M=1500.0


def hav(a,b):
    lon1,lat1=a;lon2,lat2=b;r=6371000.;p1=math.radians(lat1);p2=math.radians(lat2);dp=math.radians(lat2-lat1);dl=math.radians(lon2-lon1);q=math.sin(dp/2)**2+math.cos(p1)*math.cos(p2)*math.sin(dl/2)**2;return 2*r*math.asin(min(1,math.sqrt(q)))


def densify(coords,step_m=DENSIFY_M):
    out=[]
    for i,(a,b) in enumerate(zip(coords,coords[1:])):
        if i==0:out.append(a)
        d=hav(a,b);n=max(1,int(math.ceil(d/step_m)))
        for j in range(1,n+1):
            t=j/n;out.append([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t])
    return out


def bilinear(arr,x,y):
    h,w=arr.shape;x=float(np.clip(x,0,w-1));y=float(np.clip(y,0,h-1));x0=int(math.floor(x));x1=min(x0+1,w-1);y0=int(math.floor(y));y1=min(y0+1,h-1);tx=x-x0;ty=y-y0
    return float(arr[y0,x0]*(1-tx)*(1-ty)+arr[y0,x1]*tx*(1-ty)+arr[y1,x0]*(1-tx)*ty+arr[y1,x1]*tx*ty)


def scene_point(lon,lat,tf,height_u16,meta,offset_m):
    x,y=tf.transform(lon,lat);minx,miny,maxx,maxy=meta['local_bounds_m'];w,h=meta['raster_size'];px=(x-minx)/(maxx-minx)*(w-1);py=(maxy-y)/(maxy-miny)*(h-1)
    q=bilinear(height_u16,px,py)/65535.0;max_elev=float(meta['mesh']['max_elevation_m']);elev=max(0.0,q*max_elev);scene=float(meta['scene_m_per_unit']);ve=float(meta['vertical_exaggeration'])
    return [x/scene,(elev*ve+offset_m)/scene,-y/scene],elev


def main():
    OUT.mkdir(parents=True,exist_ok=True)
    geo=json.loads(ROUTE_GEO.read_text('utf-8'));meta=json.loads((TERRAIN/'terrain_metadata.json').read_text('utf-8'));height=np.array(Image.open(TERRAIN/'height_u16.png'),dtype=np.float64)
    tf=Transformer.from_crs('EPSG:4326',CRS.from_proj4(meta['local_crs_proj4']),always_xy=True)
    routes=[];starts=[];finish=None
    for f in geo['features']:
        p=f.get('properties',{});g=f.get('geometry',{});fid=p.get('id')
        if g.get('type')=='LineString' and fid in ROUTE_IDS:
            coords=densify(g['coordinates']);pts=[];elev=[]
            for lon,lat in coords:
                q,h=scene_point(lon,lat,tf,height,meta,ROUTE_OFFSET_M);pts.append(q);elev.append(h)
            routes.append({'id':fid,'start_id':p.get('start_id'),'distance_km':p.get('distance_km'),'points':pts,'sample_count':len(pts),'elevation_m':{'min':min(elev),'max':max(elev),'mean':sum(elev)/len(elev)}})
        elif g.get('type')=='Point':
            lon,lat=g['coordinates'];q,h=scene_point(lon,lat,tf,height,meta,NODE_OFFSET_M);item={'id':fid,'role':p.get('role'),'lon':lon,'lat':lat,'position':q,'terrain_elevation_m':h}
            if p.get('role')=='finish_placeholder':finish=item
            else:starts.append(item)
    # Preserve the semantic names and non-final finish warning from the route JSON if available.
    raw_path=ROOT/'assets'/'scene05'/'route_network_v0.1'/'scene05_route_network_v01.json'
    if raw_path.exists() and raw_path.stat().st_size:
        raw=json.loads(raw_path.read_text('utf-8'));names={p['id']:p.get('name') for p in raw.get('starts',[])}
        for s in starts:s['name']=names.get(s['id'],s['id'])
        if finish and raw.get('finish'):
            finish['name']=raw['finish'].get('name',finish['id']);finish['policy']=raw['finish'].get('policy')
    result={'schema_version':'0.1','terrain_asset':'South Korea Hero Terrain v0.2','route_asset':'Scene 05 Route Network v0.1','coordinate_system':{'x':'local AEQD east / scene_m_per_unit','y':'terrain elevation * vertical_exaggeration + visual offset','z':'negative local AEQD north / scene_m_per_unit','local_crs_proj4':meta['local_crs_proj4'],'scene_m_per_unit':meta['scene_m_per_unit'],'vertical_exaggeration':meta['vertical_exaggeration']},'policy':['Five representative routes are used in prototype v0.1.','Homigot reference start remains visible but its route is omitted because the major-road snap was too distant.','Start and finish nodes are visual references/placeholders, not confirmed event coordinates.','All route samples are terrain-following and use the same DEM coordinate space as the Scene 05 terrain mesh.'],'routes':routes,'starts':sorted(starts,key=lambda x:x['lat'],reverse=True),'finish':finish}
    (OUT/'scene05_route_network_3d_v01.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'routes':len(routes),'starts':len(starts),'route_samples':{r['id']:r['sample_count'] for r in routes},'finish':finish['id'] if finish else None},indent=2))

if __name__=='__main__':main()
