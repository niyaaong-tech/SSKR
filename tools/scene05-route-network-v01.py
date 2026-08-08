#!/usr/bin/env python3
from __future__ import annotations

import io
import json
import math
import time
import xml.etree.ElementTree as ET
from collections import Counter
from pathlib import Path

import cairosvg
import networkx as nx
import numpy as np
from PIL import Image, ImageDraw
from pyproj import Transformer
import requests
from scipy.spatial import cKDTree

ROOT=Path.cwd()
OUT=ROOT/'output'/'scene05_route_network_v0.1'
GEOREF=ROOT/'assets'/'scene05'/'south_korea_hero_v0.2'/'svg_georef.json'
SVG=ROOT/'assets'/'vector'/'korean_peninsula_precise.svg'

STARTS=[
    {'id':'start_n01','name':'Sokcho coast reference','lat':38.201699714849525,'lon':128.60026244400336},
    {'id':'start_n02','name':'Jeongdongjin coast reference','lat':37.690087283748895,'lon':129.03584724368278},
    {'id':'start_n03','name':'Mukho coast reference','lat':37.5542262,'lon':129.1203598},
    {'id':'start_n04','name':'Uljin coast reference','lat':36.8934046,'lon':129.4181111},
    {'id':'start_n05','name':'Yeongdeok coast reference','lat':36.5077464,'lon':129.4495191},
    {'id':'start_n06','name':'Homigot coast reference','lat':36.0762627,'lon':129.5695203},
    {'id':'start_n07','name':'Gampo coast reference','lat':35.807202592147405,'lon':129.51166688563615},
    {'id':'start_n08','name':'Ganjeolgot coast reference','lat':35.35933070737411,'lon':129.3618425107857},
    {'id':'start_n09','name':'Yeongdo coast reference','lat':35.0526985,'lon':129.0925233},
]
ROUTE_START_IDS={'start_n01','start_n02','start_n04','start_n06','start_n07','start_n09'}
FINISH={'id':'finish_w01','name':'West Coast Finish visual placeholder','lat':36.31125,'lon':126.51131,'policy':'Current visual placeholder near the draft west-coast candidate; not a confirmed event finish.'}
BBOX=(34.0,126.0,38.7,129.8)
OVERPASS=['https://overpass-api.de/api/interpreter','https://overpass.kumi.systems/api/interpreter']


def hav(a,b):
    lat1,lon1=a;lat2,lon2=b;r=6371000.;p1=math.radians(lat1);p2=math.radians(lat2);dp=math.radians(lat2-lat1);dl=math.radians(lon2-lon1);q=math.sin(dp/2)**2+math.cos(p1)*math.cos(p2)*math.sin(dl/2)**2;return 2*r*math.asin(min(1,math.sqrt(q)))


def query_osm():
    s,w,n,e=BBOX
    q=f'''[out:json][timeout:240][maxsize:1073741824];
    way["highway"~"^(motorway|trunk|primary|secondary)$"]({s},{w},{n},{e});
    out body;
    >;
    out skel qt;'''
    last=None
    for ep in OVERPASS:
        for attempt in range(3):
            try:
                r=requests.post(ep,data={'data':q},timeout=280,headers={'User-Agent':'SSKR-scene05-route-builder/0.1'});r.raise_for_status();d=r.json()
                if d.get('elements'):return d,ep
            except Exception as ex:
                last=ex;time.sleep(4*(attempt+1))
    raise RuntimeError(f'OSM road query failed: {last}')


def graph_from_osm(data):
    nodes={};ways=[]
    for el in data['elements']:
        if el['type']=='node':nodes[int(el['id'])]=(float(el['lat']),float(el['lon']))
        elif el['type']=='way':ways.append(el)
    g=nx.Graph();classes=Counter()
    for way in ways:
        ids=[int(x) for x in way.get('nodes',[])];hw=way.get('tags',{}).get('highway','unknown');classes[hw]+=1
        for a,b in zip(ids,ids[1:]):
            if a not in nodes or b not in nodes:continue
            wt=hav(nodes[a],nodes[b]);
            if wt<=0:continue
            if g.has_edge(a,b):
                if wt<g[a][b]['weight']:g[a][b].update(weight=wt,highway=hw,way_id=int(way['id']))
            else:g.add_edge(a,b,weight=wt,highway=hw,way_id=int(way['id']))
    # Keep the largest connected component: the South Korean mainland road graph.
    cc=max(nx.connected_components(g),key=len);g=g.subgraph(cc).copy();return g,nodes,ways,classes


def nearest_graph_nodes(g,nodes,places):
    ids=np.array(list(g.nodes()),dtype=np.int64);lat=np.array([nodes[int(i)][0] for i in ids]);lon=np.array([nodes[int(i)][1] for i in ids]);lat0=36.4;x=lon*np.cos(np.radians(lat0));y=lat;tree=cKDTree(np.column_stack([x,y]));out={}
    for p in places:
        _,i=tree.query([p['lon']*math.cos(math.radians(lat0)),p['lat']]);nid=int(ids[i]);out[p['id']]={'node_id':nid,'snap_lat':nodes[nid][0],'snap_lon':nodes[nid][1],'snap_distance_m':hav((p['lat'],p['lon']),nodes[nid])}
    return out


def simplify(points,tol_m=1800):
    # Ramer-Douglas-Peucker in approximate local metric coordinates.
    if len(points)<3:return points
    lat0=sum(p[0] for p in points)/len(points);xy=np.array([[p[1]*111320*math.cos(math.radians(lat0)),p[0]*110540] for p in points])
    keep=np.zeros(len(points),bool);keep[0]=keep[-1]=True
    stack=[(0,len(points)-1)]
    while stack:
        a,b=stack.pop();A=xy[a];B=xy[b];v=B-A;den=np.dot(v,v)
        if b<=a+1:continue
        P=xy[a+1:b]
        if den<1e-9:d=np.linalg.norm(P-A,axis=1)
        else:
            t=np.clip(((P-A)@v)/den,0,1);proj=A+t[:,None]*v;d=np.linalg.norm(P-proj,axis=1)
        j=int(np.argmax(d));mx=float(d[j])
        if mx>tol_m:
            k=a+1+j;keep[k]=True;stack.extend([(a,k),(k,b)])
    return [p for p,k in zip(points,keep) if k]


def route_data(g,nodes,snaps):
    finish_node=snaps[FINISH['id']]['node_id'];routes=[];edge_use=Counter()
    for p in STARTS:
        if p['id'] not in ROUTE_START_IDS:continue
        src=snaps[p['id']]['node_id'];path=nx.shortest_path(g,src,finish_node,weight='weight');dist=sum(g[a][b]['weight'] for a,b in zip(path,path[1:]));
        for a,b in zip(path,path[1:]):edge_use[tuple(sorted((a,b)))]+=1
        pts=[nodes[i] for i in path];simp=simplify(pts,1800)
        routes.append({'id':'route_'+p['id'],'start_id':p['id'],'distance_km':dist/1000,'road_node_count':len(path),'polyline_wgs84':[[lat,lon] for lat,lon in simp]})
    shared=[]
    for (a,b),count in edge_use.items():
        if count>=2:shared.append({'count':count,'a':[nodes[a][0],nodes[a][1]],'b':[nodes[b][0],nodes[b][1]]})
    return routes,shared,edge_use


def render_svg_mask():
    root=ET.parse(SVG).getroot();w=int(float(root.attrib.get('width','744')));h=int(float(root.attrib.get('height','1373')));png=cairosvg.svg2png(url=str(SVG),output_width=w,output_height=h,background_color='white');arr=np.array(Image.open(io.BytesIO(png)).convert('L'));return (arr<128).astype(np.uint8)


def project_svg(lon,lat,Gi):
    t=Transformer.from_crs('EPSG:4326','EPSG:3857',always_xy=True);mx,my=t.transform(lon,lat);q=Gi@np.array([mx,my,1.]);return float(q[0]),float(q[1])


def preview(mask,Gi,routes,shared,snaps,g,nodes):
    h,w=mask.shape;base=np.zeros((h,w,3),np.uint8);base[:]=[8,17,31];base[mask>0]=[22,34,31];im=Image.fromarray(base);dr=ImageDraw.Draw(im,'RGBA')
    # Sparse road hint layer: major graph edges only, low alpha.
    step=max(1,g.number_of_edges()//18000)
    for idx,(a,b,d) in enumerate(g.edges(data=True)):
        if idx%step:continue
        if d.get('highway') not in {'motorway','trunk','primary'}:continue
        la,loa=nodes[a];lb,lob=nodes[b];pa=project_svg(loa,la,Gi);pb=project_svg(lob,lb,Gi)
        if (-5<pa[0]<w+5 and -5<pa[1]<h+5) or (-5<pb[0]<w+5 and -5<pb[1]<h+5):dr.line([pa,pb],fill=(140,150,130,28),width=1)
    # Shared trunks behind the main route layer.
    for e in shared:
        a=e['a'];b=e['b'];pa=project_svg(a[1],a[0],Gi);pb=project_svg(b[1],b[0],Gi);alpha=min(210,70+e['count']*35);dr.line([pa,pb],fill=(255,190,74,alpha),width=4)
    # Main routes.
    for r in routes:
        pts=[project_svg(lon,lat,Gi) for lat,lon in r['polyline_wgs84']];dr.line(pts,fill=(255,209,102,238),width=3,joint='curve')
    # All start nodes.
    for p in STARTS:
        q=project_svg(p['lon'],p['lat'],Gi);rad=5;dr.ellipse([q[0]-rad,q[1]-rad,q[0]+rad,q[1]+rad],fill=(255,199,107,255),outline=(255,245,220,255),width=1)
    q=project_svg(FINISH['lon'],FINISH['lat'],Gi);rad=9;dr.ellipse([q[0]-rad,q[1]-rad,q[0]+rad,q[1]+rad],fill=(255,209,102,255),outline=(255,255,255,255),width=2)
    im.save(OUT/'scene05_route_network_preview_v01.png')


def main():
    OUT.mkdir(parents=True,exist_ok=True);data,ep=query_osm();g,nodes,ways,classes=graph_from_osm(data);places=STARTS+[FINISH];snaps=nearest_graph_nodes(g,nodes,places);routes,shared,edge_use=route_data(g,nodes,snaps)
    georef=json.loads(GEOREF.read_text('utf-8'));Gi=np.asarray(georef['epsg3857_to_svg_px_matrix'],float);mask=render_svg_mask();preview(mask,Gi,routes,shared,snaps,g,nodes)
    result={'schema_version':'0.1','status':'VISUAL_ROUTE_NETWORK_DRAFT','policy':['Start nodes are representative east/east-southeast coastal references, not confirmed event start spots.','Finish is a visual placeholder near the current draft west-coast candidate, not a confirmed finish.','Routes use real OSM motorway/trunk/primary/secondary topology, then are simplified for presentation.','External navigation remains the product policy; this network is a presentation visual, not an SSKR navigation engine.'],'source':'OpenStreetMap via Overpass API','overpass_endpoint':ep,'bbox':BBOX,'road_graph':{'nodes':g.number_of_nodes(),'edges':g.number_of_edges(),'way_class_counts':dict(classes)},'starts':STARTS,'finish':FINISH,'road_snaps':snaps,'routes':routes,'shared_segment_count':len(shared),'shared_segments':shared}
    (OUT/'scene05_route_network_v01.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
    geo={'type':'FeatureCollection','features':[]}
    for r in routes:geo['features'].append({'type':'Feature','properties':{'id':r['id'],'start_id':r['start_id'],'distance_km':r['distance_km']},'geometry':{'type':'LineString','coordinates':[[lon,lat] for lat,lon in r['polyline_wgs84']]}})
    for p in STARTS:geo['features'].append({'type':'Feature','properties':{'id':p['id'],'role':'start_reference'},'geometry':{'type':'Point','coordinates':[p['lon'],p['lat']]}})
    geo['features'].append({'type':'Feature','properties':{'id':FINISH['id'],'role':'finish_placeholder'},'geometry':{'type':'Point','coordinates':[FINISH['lon'],FINISH['lat']]}})
    (OUT/'scene05_route_network_v01.geojson').write_text(json.dumps(geo,ensure_ascii=False,indent=2),encoding='utf-8')
    summary={'graph_nodes':g.number_of_nodes(),'graph_edges':g.number_of_edges(),'routes':len(routes),'shared_segments':len(shared),'route_distances_km':{r['id']:round(r['distance_km'],1) for r in routes},'max_start_road_snap_m':max(v['snap_distance_m'] for k,v in snaps.items() if k.startswith('start_')),'finish_road_snap_m':snaps[FINISH['id']]['snap_distance_m']}
    print(json.dumps(summary,indent=2))

if __name__=='__main__':main()
