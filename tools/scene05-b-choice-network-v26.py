#!/usr/bin/env python3
from __future__ import annotations

import json
import math
from pathlib import Path

import numpy as np

ROOT=Path.cwd()
DATA=ROOT/'output'/'scene05_final_v1'/'scene05_final_data_v1.json'


def resample(points,n=360):
    p=np.asarray(points,dtype=np.float64)
    d=np.linalg.norm(np.diff(p[:,[0,2]],axis=0),axis=1)
    s=np.concatenate([[0.0],np.cumsum(d)])
    if s[-1]<1e-8:return np.repeat(p[:1],n,axis=0)
    q=np.linspace(0,s[-1],n)
    out=np.empty((n,3),dtype=np.float64)
    for k in range(3):out[:,k]=np.interp(q,s,p[:,k])
    return out


def ss(a,b,x):
    t=np.clip((x-a)/max(b-a,1e-8),0,1)
    return t*t*(3-2*t)


def route_mosaic(a,b,c,variant,n=360):
    pa,pb,pc=(resample(x,n) for x in (a,b,c))
    t=np.linspace(0,1,n)
    out=pa.copy()

    # Each rider stays on one corridor for meaningful stretches, changes direction,
    # then rejoins late. This reads as independent route making instead of parallel interpolation.
    shift=(variant-1)*.025
    a1=.17+shift; a2=.30+shift
    b1=.48-shift*.4; b2=.61-shift*.3
    c1=.76+shift*.2; c2=.90
    w1=ss(a1,a2,t)
    out=pa*(1-w1[:,None])+pb*w1[:,None]
    w2=ss(b1,b2,t)
    out=out*(1-w2[:,None])+pc*w2[:,None]
    w3=ss(c1,c2,t)
    out=out*(1-w3[:,None])+pa*w3[:,None]

    # A restrained lateral excursion breaks the rail-like look while retaining the
    # underlying real-road corridors. Presentation only, never navigation geometry.
    xz=out[:,[0,2]]
    tang=np.gradient(xz,axis=0)
    norm=np.maximum(np.linalg.norm(tang,axis=1,keepdims=True),1e-8)
    tang=tang/norm
    perp=np.stack([-tang[:,1],tang[:,0]],axis=1)
    env=ss(.20,.34,t)*(1-ss(.70,.86,t))
    amp=.13+.055*variant
    wave=np.sin(t*math.pi*(2.2+.35*variant)+(variant*1.31))*env*amp
    out[:,0]+=perp[:,0]*wave
    out[:,2]+=perp[:,1]*wave

    # Graphics float slightly above relief. Ends are exact so Starts/Finish remain stable.
    out[:,1]=np.maximum.reduce([pa[:,1],pb[:,1],pc[:,1]])+.020
    out[0]=pa[0];out[-1]=pa[-1]
    return out


def main():
    data=json.loads(DATA.read_text('utf-8'))
    routes=data.get('main_routes',[])
    if len(routes)<5:raise SystemExit('v2.6 expects five real-road-grounded main routes')

    choices=[]
    # Fifteen distinct journey traces. They are deliberately not one route with ten
    # near-parallel offsets: each trace switches between different real-road corridors.
    patterns=[(1,2),(2,-1),(-1,-2)]
    for i,r in enumerate(routes):
        for variant,(o1,o2) in enumerate(patterns,1):
            b=routes[(i+o1)%len(routes)]
            c=routes[(i+o2)%len(routes)]
            pts=route_mosaic(r['points'],b['points'],c['points'],variant)
            choices.append({
              'id':f"freedom_{r['start_id']}_{variant}",
              'start_id':r['start_id'],
              'source_route_ids':[r['id'],b['id'],c['id']],
              'role':'cinematic_independent_rider_trace_not_navigation',
              'points':pts.round(6).tolist(),
            })

    data['schema_version']='1.6-v26-freedom-network'
    data['choice_routes']=choices
    data['choice_network_design']={
      'main_routes':len(routes),'rider_choice_traces':len(choices),
      'principle':'long independent corridor sections, visible branching and late convergence',
      'navigation_status':'presentation_only'
    }
    data.setdefault('policy',[]).extend([
      'v2.6 choice traces are cinematic mosaics of real-road-grounded route corridors and are never official or recommended courses.',
      'The visual objective is autonomous route discovery: branch, detour, rejoin and late Finish convergence.'
    ])
    DATA.write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'main_routes':len(routes),'choice_routes':len(choices),'road_hints':len(data.get('road_hints',[]))},indent=2))

if __name__=='__main__':main()
