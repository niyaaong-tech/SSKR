#!/usr/bin/env python3
from __future__ import annotations

import json
import math
import time
from pathlib import Path

import requests

ROOT=Path.cwd()
OUT=ROOT/'output'/'scene05_roadhints_source_v1'
BBOX=(34.15,126.0,38.45,129.75)
OVERPASS=['https://overpass-api.de/api/interpreter','https://overpass.kumi.systems/api/interpreter']


def hav(a,b):
    lon1,lat1=a;lon2,lat2=b;r=6371000.;p1=math.radians(lat1);p2=math.radians(lat2);dp=math.radians(lat2-lat1);dl=math.radians(lon2-lon1);q=math.sin(dp/2)**2+math.cos(p1)*math.cos(p2)*math.sin(dl/2)**2;return 2*r*math.asin(min(1,math.sqrt(q)))


def line_length(coords):return sum(hav(a,b) for a,b in zip(coords,coords[1:]))


def rdp(coords,tol_m=350):
    if len(coords)<3:return coords
    lat0=sum(p[1] for p in coords)/len(coords)
    xy=[(p[0]*111320*math.cos(math.radians(lat0)),p[1]*110540) for p in coords]
    keep=[False]*len(coords);keep[0]=keep[-1]=True;stack=[(0,len(coords)-1)]
    while stack:
        a,b=stack.pop()
        if b<=a+1:continue
        ax,ay=xy[a];bx,by=xy[b];vx=bx-ax;vy=by-ay;den=vx*vx+vy*vy
        best=(-1,-1)
        for i in range(a+1,b):
            px,py=xy[i]
            if den<1e-9:d=math.hypot(px-ax,py-ay)
            else:
                t=max(0,min(1,((px-ax)*vx+(py-ay)*vy)/den));qx=ax+t*vx;qy=ay+t*vy;d=math.hypot(px-qx,py-qy)
            if d>best[0]:best=(d,i)
        if best[0]>tol_m:
            keep[best[1]]=True;stack.append((a,best[1]));stack.append((best[1],b))
    return [p for p,k in zip(coords,keep) if k]


def query():
    s,w,n,e=BBOX
    q=f'''[out:json][timeout:240][maxsize:536870912];(
      way["highway"="motorway"]({s},{w},{n},{e});
      way["highway"="trunk"]({s},{w},{n},{e});
      way["highway"="primary"]({s},{w},{n},{e});
    );out tags geom;'''
    last=None
    for ep in OVERPASS:
        for attempt in range(3):
            try:
                r=requests.post(ep,data={'data':q},timeout=280,headers={'User-Agent':'SSKR-scene05-final-roadhints/1.1'});r.raise_for_status();d=r.json()
                if d.get('elements'):return d,ep
            except Exception as ex:last=ex;time.sleep(4*(attempt+1))
    raise RuntimeError(f'Overpass failed: {last}')


def main():
    OUT.mkdir(parents=True,exist_ok=True)
    data,endpoint=query();features=[];counts={'motorway':0,'trunk':0,'primary':0}
    for el in data.get('elements',[]):
        geom=el.get('geometry') or []
        if len(geom)<2:continue
        hw=el.get('tags',{}).get('highway','')
        if hw not in counts:continue
        coords=[[float(p['lon']),float(p['lat'])] for p in geom]
        length=line_length(coords)
        # Preserve every OSM way fragment. Filtering short ways broke continuity and
        # produced dash-like marks at national scale. Geometry is only mildly simplified.
        simp=rdp(coords,260 if hw in {'motorway','trunk'} else 380)
        if len(simp)<2:continue
        features.append({'type':'Feature','properties':{'osm_way_id':int(el['id']),'highway':hw,'length_km':round(length/1000,3)},'geometry':{'type':'LineString','coordinates':simp}})
        counts[hw]+=1
    features=sorted(features,key=lambda x:(x['properties']['highway'],x['properties']['osm_way_id']))
    out={'type':'FeatureCollection','metadata':{
        'schema_version':'1.1',
        'source':'OpenStreetMap via Overpass','endpoint':endpoint,'bbox':BBOX,
        'purpose':'Scene 05 faint Road Hint layer only',
        'policy':'All queried motorway/trunk/primary way fragments are retained to preserve continuous real-road topology. Road Hint is subordinate context, never navigation or an official SSKR route.'
    },'features':features}
    (OUT/'scene05_road_hints_source_v1.geojson').write_text(json.dumps(out,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
    print(json.dumps({'queried':len(data.get('elements',[])),'selected':len(features),'by_class':counts,'endpoint':endpoint},indent=2))

if __name__=='__main__':main()
