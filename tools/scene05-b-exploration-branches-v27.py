#!/usr/bin/env python3
from __future__ import annotations

import json
import math
from pathlib import Path

ROOT=Path.cwd()
DATA=ROOT/'output'/'scene05_final_v1'/'scene05_final_data_v1.json'
MAX_BRANCHES=34


def dist2(a,b):
    return (a[0]-b[0])**2+(a[2]-b[2])**2


def poly_length(points):
    s=0.0
    for a,b in zip(points,points[1:]):
        s+=math.sqrt(dist2(a,b))
    return s


def midpoint(points):
    if not points:return [0,0,0]
    return points[len(points)//2]


def main():
    data=json.loads(DATA.read_text('utf-8'))
    hints=data.get('road_hints',[])
    main_routes=data.get('main_routes',[])
    hero=next((r for r in main_routes if r['id']=='route_start_n02'),main_routes[0])
    hero_sample=hero['points'][::max(1,len(hero['points'])//80)]

    candidates=[]
    for h in hints:
        pts=h.get('points') or []
        if len(pts)<4:continue
        plen=poly_length(pts)
        if plen<.40:continue
        m=midpoint(pts)
        nearest=min((dist2(m,p) for p in hero_sample),default=999)
        candidates.append({
          'id':f"road_branch_{h.get('osm_way_id')}",
          'osm_way_id':h.get('osm_way_id'),
          'highway':h.get('highway'),
          'length_scene':plen,
          'near_hero':nearest<4.8,
          'midpoint':m,
          'points':pts,
          'role':'actual_osm_exploration_branch_visual'
        })

    if not candidates:raise SystemExit('no exploration road candidates')
    xs=[c['midpoint'][0] for c in candidates];zs=[c['midpoint'][2] for c in candidates]
    minx,maxx=min(xs),max(xs);minz,maxz=min(zs),max(zs)
    # Spatially distribute long actual-road fragments. At most two per coarse cell.
    candidates.sort(key=lambda c:(c['near_hero'],c['length_scene']),reverse=True)
    cells={};chosen=[]
    for c in candidates:
        gx=int((c['midpoint'][0]-minx)/max(maxx-minx,1e-8)*7)
        gz=int((c['midpoint'][2]-minz)/max(maxz-minz,1e-8)*7)
        key=(min(gx,6),min(gz,6))
        count=cells.get(key,0)
        limit=2 if c['near_hero'] else 1
        if count>=limit:continue
        cells[key]=count+1
        chosen.append(c)
        if len(chosen)>=MAX_BRANCHES:break

    # Hero-near branches first so the chase can visibly encounter genuine road choices.
    chosen.sort(key=lambda c:(not c['near_hero'],-c['length_scene']))
    data['choice_routes']=[]
    data['exploration_branches']=chosen
    data['schema_version']='1.8-v27-osm-exploration'
    data['exploration_design']={
      'branch_count':len(chosen),
      'source':'actual OSM trunk/primary/secondary road fragments from road_hints_source_v1.geojson',
      'principle':'local road choices appear as partial rider traces; five Main Routes remain long-form journey examples',
      'navigation_status':'presentation_only'
    }
    data.setdefault('policy',[]).extend([
      'v2.7 removes synthetic cross-country choice mosaics from the visible scene.',
      'Gold exploration branches are selected from actual OSM road geometry and appear as partial local choices rather than official full courses.'
    ])
    DATA.write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'road_hints':len(hints),'candidates':len(candidates),'exploration_branches':len(chosen),'hero_near':sum(1 for c in chosen if c['near_hero'])},indent=2))

if __name__=='__main__':main()
