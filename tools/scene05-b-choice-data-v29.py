#!/usr/bin/env python3
from __future__ import annotations

import json, math
from pathlib import Path
import numpy as np
from PIL import Image
from pyproj import CRS, Transformer

ROOT=Path.cwd(); DATA=ROOT/'output'/'scene05_final_v1'/'scene05_final_data_v1.json'; SRC=ROOT/'assets'/'scene05'/'choice_roads_source_v1.geojson'; TERRAIN=ROOT/'assets'/'scene05'/'south_korea_hero_v0.2'
BASE_LIFT=.050; RELIEF_SCALE=.09; MAX_BRANCHES=58


def bilinear(arr,x,y):
    h,w=arr.shape;x=float(np.clip(x,0,w-1));y=float(np.clip(y,0,h-1));x0=int(x);y0=int(y);x1=min(x0+1,w-1);y1=min(y0+1,h-1);tx=x-x0;ty=y-y0
    return float(arr[y0,x0]*(1-tx)*(1-ty)+arr[y0,x1]*tx*(1-ty)+arr[y1,x0]*(1-tx)*ty+arr[y1,x1]*tx*ty)

def dist2(a,b):return (a[0]-b[0])**2+(a[2]-b[2])**2

def hav(a,b):
    lon1,lat1=a;lon2,lat2=b;r=6371000.;p1=math.radians(lat1);p2=math.radians(lat2);dp=math.radians(lat2-lat1);dl=math.radians(lon2-lon1);q=math.sin(dp/2)**2+math.cos(p1)*math.cos(p2)*math.sin(dl/2)**2;return 2*r*math.asin(min(1,math.sqrt(q)))

def line_km(coords):return sum(hav(a,b) for a,b in zip(coords,coords[1:]))/1000

def flatten_point(p):return [float(p[0]),BASE_LIFT+(float(p[1])-.045)*RELIEF_SCALE,float(p[2])]


def main():
    data=json.loads(DATA.read_text('utf-8'));geo=json.loads(SRC.read_text('utf-8'));meta=json.loads((TERRAIN/'terrain_metadata.json').read_text('utf-8'));height=np.asarray(Image.open(TERRAIN/'height_u16.png'),dtype=np.float64)
    local=CRS.from_proj4(meta['local_crs_proj4']);tf=Transformer.from_crs('EPSG:4326',local,always_xy=True);minx,miny,maxx,maxy=meta['local_bounds_m'];w,h=meta['raster_size'];scene=float(meta['scene_m_per_unit']);ve=float(meta['vertical_exaggeration']);maxe=float(meta['mesh']['max_elevation_m'])
    def scene_pt(lon,lat):
        x,y=tf.transform(lon,lat);px=(x-minx)/(maxx-minx)*(w-1);py=(maxy-y)/(maxy-miny)*(h-1);q=bilinear(height,px,py)/65535.;e=max(0,q*maxe);return [x/scene,BASE_LIFT+(e*ve/scene)*RELIEF_SCALE,-y/scene]
    # Flatten all existing graphic layers to the new shallow-relief visual surface.
    for r in data.get('main_routes',[]):r['points']=[flatten_point(p) for p in r['points']]
    for s in data.get('starts',[]):s['position']=flatten_point(s['position'])
    data['finish']['position']=flatten_point(data['finish']['position'])
    for s in data.get('start_seeds',[]):s['points']=[flatten_point(p) for p in s['points']]
    for m in data.get('merged_segments',[]):m['a']=flatten_point(m['a']);m['b']=flatten_point(m['b'])
    for c in data.get('checkpoints',[]):c['position']=flatten_point(c['position'])

    hero=next((r for r in data['main_routes'] if r['id']=='route_start_n02'),data['main_routes'][0]);hero_sample=hero['points'][::max(1,len(hero['points'])//100)]
    cands=[]
    for f in geo.get('features',[]):
        props=f.get('properties',{});coords=f.get('geometry',{}).get('coordinates') or []
        if len(coords)<2:continue
        km=float(props.get('length_km') or line_km(coords))
        if km<.65 or km>38:continue
        mid=coords[len(coords)//2];sp=scene_pt(mid[0],mid[1]);near=min((dist2(sp,p) for p in hero_sample),default=999)
        cands.append({'feature':f,'mid':sp,'km':km,'near':near,'highway':props.get('highway','secondary')})
    if not cands:raise SystemExit('no choice road candidates')
    xs=[c['mid'][0] for c in cands];zs=[c['mid'][2] for c in cands];minX,maxX=min(xs),max(xs);minZ,maxZ=min(zs),max(zs)
    rank={'secondary':3,'primary':2,'trunk':1}
    cands.sort(key=lambda c:(c['near']<3.0,rank.get(c['highway'],0),min(c['km'],12),-c['near']),reverse=True)
    chosen=[];cells={};hero_n=0
    for c in cands:
        gx=min(11,max(0,int((c['mid'][0]-minX)/max(maxX-minX,1e-9)*12)));gz=min(13,max(0,int((c['mid'][2]-minZ)/max(maxZ-minZ,1e-9)*14)));key=(gx,gz)
        near=c['near']<3.0
        limit=2 if near else 1
        if cells.get(key,0)>=limit:continue
        if near and hero_n>=15:near=False
        cells[key]=cells.get(key,0)+1;hero_n+=1 if near else 0
        f=c['feature'];pts=[scene_pt(lon,lat) for lon,lat in f['geometry']['coordinates']]
        chosen.append({'id':f"choice_{f['properties']['osm_way_id']}",'osm_way_id':f['properties']['osm_way_id'],'highway':c['highway'],'length_km':round(c['km'],3),'near_hero':near,'role':'actual_osm_local_choice_trace','points':pts})
        if len(chosen)>=MAX_BRANCHES:break
    # Dense road context is baked into a 2D texture; do not ship 100k dynamic line fragments.
    counts={}
    for f in geo.get('features',[]):counts[f['properties']['highway']]=counts.get(f['properties']['highway'],0)+1
    data['road_hints']=[];data['road_hint_counts']=counts;data['exploration_branches']=chosen;data['choice_routes']=[]
    data['schema_version']='1.9-v29-texture-road-choice';data['visual_route_lift_scene_units']=BASE_LIFT
    data['exploration_design']={'branch_count':len(chosen),'hero_near_count':hero_n,'source':'actual OSM trunk/primary/secondary roads','road_context':'baked 2D texture','principle':'dense real possibility field + selected local gold choices + five long journey examples','navigation_status':'presentation_only'}
    data.setdefault('policy',[]).extend(['v2.9 dynamic routes are vertically conformed to the shallow-relief presentation surface.','Dense road choice context is baked from actual OSM roads rather than rendered as a GIS line mesh.'])
    DATA.write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'source_features':len(geo.get('features',[])),'source_counts':counts,'exploration_branches':len(chosen),'hero_near':hero_n,'road_hints_runtime':0},indent=2))

if __name__=='__main__':main()
