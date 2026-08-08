#!/usr/bin/env python3
from __future__ import annotations

import json
import math
from pathlib import Path

import numpy as np
from PIL import Image
from pyproj import CRS, Transformer

ROOT=Path.cwd()
ROUTE3D=ROOT/'assets'/'scene05'/'route_network_v0.1'/'scene05_route_network_3d_v01.json'
ROUTE_RAW=ROOT/'assets'/'scene05'/'route_network_v0.1'/'scene05_route_network_v01.json'
ROAD_HINTS_SOURCE=ROOT/'assets'/'scene05'/'road_hints_source_v1.geojson'
TERRAIN=ROOT/'assets'/'scene05'/'south_korea_hero_v0.2'
OUT=ROOT/'output'/'scene05_final_v1'
MAIN_ROUTE_IDS={'route_start_n01','route_start_n02','route_start_n04','route_start_n07','route_start_n09'}
PERSONAL_ROUTE_ID='route_start_n02'
MERGED_LIMIT=260
MERGED_GRID_SCENE=1.05
MERGED_OFFSET_M=72.0
VISUAL_LIFT_SCENE=0.045
ROAD_HINT_LIFT_SCENE=0.027
ROAD_HINT_CLASSES={'motorway','trunk','primary'}


def bilinear(arr,x,y):
    h,w=arr.shape
    x=float(np.clip(x,0,w-1));y=float(np.clip(y,0,h-1))
    x0=int(math.floor(x));x1=min(x0+1,w-1);y0=int(math.floor(y));y1=min(y0+1,h-1)
    tx=x-x0;ty=y-y0
    return float(arr[y0,x0]*(1-tx)*(1-ty)+arr[y0,x1]*tx*(1-ty)+arr[y1,x0]*(1-tx)*ty+arr[y1,x1]*tx*ty)


def lift_point(p,amount=VISUAL_LIFT_SCENE):
    return [float(p[0]),float(p[1])+amount,float(p[2])]


def scene_point(lon,lat,tf,height,meta,offset_m,visual_lift=VISUAL_LIFT_SCENE):
    x,y=tf.transform(lon,lat)
    minx,miny,maxx,maxy=meta['local_bounds_m'];w,h=meta['raster_size']
    px=(x-minx)/(maxx-minx)*(w-1);py=(maxy-y)/(maxy-miny)*(h-1)
    q=bilinear(height,px,py)/65535.0
    elev=max(0.0,q*float(meta['mesh']['max_elevation_m']))
    scene=float(meta['scene_m_per_unit']);ve=float(meta['vertical_exaggeration'])
    return [x/scene,(elev*ve+offset_m)/scene+visual_lift,-y/scene]


def dist2(a,b):
    return (a[0]-b[0])**2+(a[2]-b[2])**2


def build_shared_segments(raw,tf,height,meta):
    cells={}
    for s in raw.get('shared_segments',[]):
        if int(s.get('count',0))<2:continue
        a=s.get('a');b=s.get('b')
        if not a or not b:continue
        pa=scene_point(a[1],a[0],tf,height,meta,MERGED_OFFSET_M)
        pb=scene_point(b[1],b[0],tf,height,meta,MERGED_OFFSET_M)
        mx=(pa[0]+pb[0])*.5;mz=(pa[2]+pb[2])*.5
        key=(round(mx/MERGED_GRID_SCENE),round(mz/MERGED_GRID_SCENE))
        item={'count':int(s['count']),'a':pa,'b':pb}
        old=cells.get(key)
        if old is None or item['count']>old['count']:
            cells[key]=item
    return sorted(cells.values(),key=lambda x:(-x['count'],x['a'][2]))[:MERGED_LIMIT]


def infer_shared_from_routes(routes):
    out=[];seen=set()
    for i,r1 in enumerate(routes):
        p1=r1['points']
        for r2 in routes[i+1:]:
            p2=r2['points']
            for ia in range(8,len(p1)-8,8):
                best=None
                for ib in range(8,len(p2)-8,8):
                    d=dist2(p1[ia],p2[ib])
                    if d<.18 and (best is None or d<best[0]):best=(d,ib)
                if best:
                    ib=best[1];a=p1[ia];b=p2[ib];k=(round((a[0]+b[0])*2),round((a[2]+b[2])*2))
                    if k not in seen:
                        seen.add(k);out.append({'count':2,'a':a,'b':b})
    return out[:120]


def build_start_seeds(starts,routes):
    main_start_ids={r['start_id'] for r in routes}
    route_points=[p for r in routes for p in r['points']]
    seeds=[]
    for s in starts:
        if s['id'] in main_start_ids:continue
        start=s['position']
        best=min(route_points,key=lambda p:dist2(start,p))
        dx=best[0]-start[0];dz=best[2]-start[2];d=math.sqrt(dx*dx+dz*dz)
        t=min(1.0,3.1/max(d,1e-6))
        end=[start[0]+dx*t,max(start[1],best[1])+.012,start[2]+dz*t]
        mid=[(start[0]+end[0])*.5,max(start[1],end[1])+.018,(start[2]+end[2])*.5]
        seeds.append({'start_id':s['id'],'points':[start,mid,end],'role':'subtle_feeder_to_main_network'})
    return seeds


def build_checkpoints(routes):
    candidates=[]
    for r in routes:
        pts=r['points']
        for f in (.28,.48,.68):
            candidates.append({'route_id':r['id'],'position':pts[min(len(pts)-1,int((len(pts)-1)*f))]})
    chosen=[]
    for c in candidates:
        if all(dist2(c['position'],q['position'])>.55 for q in chosen):chosen.append(c)
        if len(chosen)>=11:break
    return chosen


def build_road_hints(tf,height,meta):
    """Keep the full curated OSM major-road source so adjacent OSM way fragments reconnect visually.

    Density is controlled in the renderer by very low opacity/width. Dropping individual way
    fragments here made the network look like random dashes instead of a coherent road web.
    """
    if not ROAD_HINTS_SOURCE.exists():return []
    geo=json.loads(ROAD_HINTS_SOURCE.read_text('utf-8'))
    hints=[]
    for f in geo.get('features',[]):
        props=f.get('properties',{})
        highway=props.get('highway')
        if highway not in ROAD_HINT_CLASSES:continue
        geom=f.get('geometry',{})
        if geom.get('type')!='LineString':continue
        coords=geom.get('coordinates') or []
        if len(coords)<2:continue
        pts=[scene_point(lon,lat,tf,height,meta,34.0,visual_lift=ROAD_HINT_LIFT_SCENE) for lon,lat in coords]
        hints.append({
            'osm_way_id':props.get('osm_way_id'),
            'highway':highway,
            'length_km':props.get('length_km'),
            'points':pts
        })
    return hints


def main():
    OUT.mkdir(parents=True,exist_ok=True)
    route3d=json.loads(ROUTE3D.read_text('utf-8'))
    raw=json.loads(ROUTE_RAW.read_text('utf-8')) if ROUTE_RAW.exists() else {}
    meta=json.loads((TERRAIN/'terrain_metadata.json').read_text('utf-8'))
    height=np.array(Image.open(TERRAIN/'height_u16.png'),dtype=np.float64)
    tf=Transformer.from_crs('EPSG:4326',CRS.from_proj4(meta['local_crs_proj4']),always_xy=True)

    routes=[]
    for r in route3d['routes']:
        if r['id'] not in MAIN_ROUTE_IDS:continue
        pts=[lift_point(p) for p in r['points']]
        routes.append({'id':r['id'],'start_id':r['start_id'],'distance_km':r['distance_km'],'points':pts,'convergence_from_index':int(len(pts)*.67)})

    merged=build_shared_segments(raw,tf,height,meta)
    if not merged:merged=infer_shared_from_routes(routes)
    starts=[{**s,'position':lift_point(s['position'])} for s in route3d['starts']]
    seeds=build_start_seeds(starts,routes)
    checkpoints=build_checkpoints(routes)
    road_hints=build_road_hints(tf,height,meta)
    finish={**route3d['finish'],'position':lift_point(route3d['finish']['position'])}
    counts={k:sum(1 for r in road_hints if r['highway']==k) for k in sorted(ROAD_HINT_CLASSES)}

    result={
        'schema_version':'1.4','status':'FINAL_SCENE_PRESENTATION_DATA','terrain_asset':'South Korea Hero Terrain v0.2','coastline_authority':'korean_peninsula_precise.svg','coordinate_system':route3d['coordinate_system'],'visual_route_lift_scene_units':VISUAL_LIFT_SCENE,'road_hint_lift_scene_units':ROAD_HINT_LIFT_SCENE,
        'policy':[
            'This is a cinematic presentation visualization, not an SSKR navigation engine.',
            'Start references and West Finish remain visual placeholders until product planning confirms official coordinates.',
            'Main routes are grounded in the real-road source topology and terrain-following DEM coordinates.',
            'Merged segments are sampled from shared real-road topology where available.',
            'Road Hint retains the full curated OSM motorway/trunk/primary source to preserve visual continuity; low renderer opacity controls density.',
            'Every visible Dawn Start is connected to the journey network: five by Main Routes and four by subtle feeder lines.',
            'Uniform visual lifts prevent graphic layers from being buried by the decimated relief mesh; they do not alter source geography.'
        ],
        'storyboard':{'duration_s':12.8,'personal_route_id':PERSONAL_ROUTE_ID,'beats':[['scale',0.0,0.8],['south_korea_hero',0.8,2.2],['dawn_start',2.2,3.5],['morning_crossing',3.5,5.5],['daylight_network',5.5,7.8],['sunset_convergence',7.8,10.2],['personal_recall',10.2,11.6],['match_cut',11.6,12.8]]},
        'starts':starts,'finish':finish,'main_routes':routes,'start_seeds':seeds,'merged_segments':merged,'road_hints':road_hints,'road_hint_counts':counts,'checkpoints':checkpoints
    }
    (OUT/'scene05_final_data_v1.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'main_routes':len(routes),'starts':len(starts),'start_seeds':len(seeds),'merged_segments':len(merged),'road_hints':len(road_hints),'road_hint_counts':counts,'checkpoints':len(checkpoints),'personal_route':PERSONAL_ROUTE_ID,'visual_lift':VISUAL_LIFT_SCENE},indent=2))

if __name__=='__main__':main()
