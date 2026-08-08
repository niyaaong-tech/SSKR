#!/usr/bin/env python3
from __future__ import annotations

import json, math, time
from pathlib import Path
import requests

ROOT=Path.cwd(); OUT=ROOT/'output'/'scene05_choice_roads_source_v1'
BBOX=(34.15,126.0,38.45,129.75)
OVERPASS=['https://overpass-api.de/api/interpreter','https://overpass.kumi.systems/api/interpreter']
CLASSES=('trunk','primary','secondary')


def hav(a,b):
    lon1,lat1=a;lon2,lat2=b;r=6371000.;p1=math.radians(lat1);p2=math.radians(lat2);dp=math.radians(lat2-lat1);dl=math.radians(lon2-lon1);q=math.sin(dp/2)**2+math.cos(p1)*math.cos(p2)*math.sin(dl/2)**2;return 2*r*math.asin(min(1,math.sqrt(q)))

def length(coords):return sum(hav(a,b) for a,b in zip(coords,coords[1:]))

def rdp(coords,tol_m):
    if len(coords)<3:return coords
    lat0=sum(p[1] for p in coords)/len(coords);c=math.cos(math.radians(lat0))
    xy=[(p[0]*111320*c,p[1]*110540) for p in coords]
    keep=[False]*len(coords);keep[0]=keep[-1]=True;stack=[(0,len(coords)-1)]
    while stack:
        a,b=stack.pop();
        if b<=a+1:continue
        ax,ay=xy[a];bx,by=xy[b];vx=bx-ax;vy=by-ay;den=vx*vx+vy*vy;best=(-1,-1)
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
    body='\n'.join(f'way["highway"="{hw}"]({s},{w},{n},{e});' for hw in CLASSES)
    q=f'[out:json][timeout:300][maxsize:805306368];(\n{body}\n);out tags geom;'
    last=None
    for ep in OVERPASS:
        for attempt in range(3):
            try:
                r=requests.post(ep,data={'data':q},timeout=340,headers={'User-Agent':'SSKR-scene05-choice-roads/1.0'});r.raise_for_status();d=r.json()
                if d.get('elements'):return d,ep
            except Exception as ex:last=ex;time.sleep(5*(attempt+1))
    raise RuntimeError(f'Overpass failed: {last}')


def main():
    OUT.mkdir(parents=True,exist_ok=True);data,ep=query();features=[];counts={x:0 for x in CLASSES}
    for el in data.get('elements',[]):
        hw=el.get('tags',{}).get('highway','');geom=el.get('geometry') or []
        if hw not in counts or len(geom)<2:continue
        coords=[[float(p['lon']),float(p['lat'])] for p in geom];km=length(coords)/1000
        # Keep all fragments to preserve junction topology; stronger simplification is
        # acceptable at national presentation scale and controls artifact size.
        tol={'trunk':260,'primary':330,'secondary':430}[hw]
        simp=rdp(coords,tol)
        if len(simp)<2:continue
        features.append({'type':'Feature','properties':{'osm_way_id':int(el['id']),'highway':hw,'length_km':round(km,3)},'geometry':{'type':'LineString','coordinates':simp}});counts[hw]+=1
    features.sort(key=lambda x:(x['properties']['highway'],x['properties']['osm_way_id']))
    out={'type':'FeatureCollection','metadata':{'schema_version':'1.0','source':'OpenStreetMap via Overpass','endpoint':ep,'bbox':BBOX,'purpose':'Scene 05 B rider-choice possibility layer','policy':'Trunk/primary/secondary road geometry is presentation context only, not official SSKR navigation or recommended routing.'},'features':features}
    path=OUT/'scene05_choice_roads_source_v1.geojson';path.write_text(json.dumps(out,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
    print(json.dumps({'selected':len(features),'by_class':counts,'bytes':path.stat().st_size,'endpoint':ep},indent=2))

if __name__=='__main__':main()
