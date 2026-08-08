#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageDraw
from pyproj import CRS, Transformer

ROOT=Path.cwd()
ROAD_SOURCE=ROOT/'assets'/'scene05'/'road_hints_source_v1.geojson'
TERRAIN_META=ROOT/'assets'/'scene05'/'south_korea_hero_v0.2'/'terrain_metadata.json'
OUT=ROOT/'output'/'scene05_final_v1'
DAY=OUT/'terrain_day_final.png'
STATIC=OUT/'terrain_surface_final.png'
PREVIEW=OUT/'terrain_day_roadhints_preview.png'
SCALE=2

# At national scale, the road web must survive projection/antialiasing but remain
# clearly below the gold Main Route hierarchy. These are dark terrain-ink values,
# not luminous HUD lines.
STYLE={
    'motorway': {'fill':(34,58,52,76),'width':9},
    'trunk':    {'fill':(39,64,58,68),'width':8},
    'primary':  {'fill':(50,76,69,44),'width':5},
}


def main():
    if not ROAD_SOURCE.exists():raise SystemExit(f'Missing {ROAD_SOURCE}')
    if not DAY.exists():raise SystemExit(f'Missing {DAY}; run terrain builder first')
    meta=json.loads(TERRAIN_META.read_text('utf-8'))
    roads=json.loads(ROAD_SOURCE.read_text('utf-8'))
    base=Image.open(DAY).convert('RGBA')
    w,h=base.size
    overlay=Image.new('RGBA',(w*SCALE,h*SCALE),(0,0,0,0))
    draw=ImageDraw.Draw(overlay,'RGBA')

    minx,miny,maxx,maxy=meta['local_bounds_m']
    tf=Transformer.from_crs('EPSG:4326',CRS.from_proj4(meta['local_crs_proj4']),always_xy=True)

    def px(lon,lat):
        x,y=tf.transform(lon,lat)
        u=(x-minx)/(maxx-minx)*(w-1)
        v=(maxy-y)/(maxy-miny)*(h-1)
        return (u*SCALE,v*SCALE)

    counts={k:0 for k in STYLE}
    for f in roads.get('features',[]):
        props=f.get('properties',{});hw=props.get('highway')
        if hw not in STYLE:continue
        geom=f.get('geometry',{})
        if geom.get('type')!='LineString':continue
        coords=geom.get('coordinates') or []
        if len(coords)<2:continue
        pts=[px(float(lon),float(lat)) for lon,lat in coords]
        st=STYLE[hw]
        draw.line(pts,fill=st['fill'],width=st['width'],joint='curve')
        counts[hw]+=1

    overlay=overlay.resize((w,h),Image.Resampling.LANCZOS)
    baked=Image.alpha_composite(base,overlay).convert('RGB')
    baked.save(DAY,quality=95)
    baked.save(STATIC,quality=95)
    baked.resize((1152,round(1152*h/w)),Image.Resampling.LANCZOS).save(PREVIEW,quality=92)

    report={
        'schema_version':'1.1',
        'source':'OpenStreetMap curated major-road source',
        'feature_counts':counts,
        'style':STYLE,
        'policy':'Road Hint is baked only into daylight terrain as a continuous dark, low-contrast real-road context layer. Main Route/Merged Segment remain separate gold graphic layers and must dominate first-read.'
    }
    (OUT/'terrain_day_roadhints_metadata.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(report,ensure_ascii=False,indent=2))

if __name__=='__main__':main()
