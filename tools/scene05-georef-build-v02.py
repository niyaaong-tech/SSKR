#!/usr/bin/env python3
from __future__ import annotations
import io, json, math, subprocess, sys, zipfile, hashlib
from pathlib import Path

import cv2
import numpy as np
from PIL import Image
import requests
import cairosvg
import geopandas as gpd
from shapely.ops import unary_union, transform as shp_transform
from pyproj import Transformer, CRS
from rasterio.features import rasterize
from rasterio.transform import from_bounds
import rasterio
from rasterio.warp import transform_bounds, reproject, Resampling
import trimesh
from scipy.ndimage import distance_transform_edt
import boto3
from botocore import UNSIGNED
from botocore.config import Config

ROOT = Path.cwd()
SVG = ROOT/'assets'/'vector'/'korean_peninsula_precise.svg'
OUT = ROOT/'output'/'south_korea_hero_v0.2'
TMP = ROOT/'.tmp_scene05_v02'
NE_URL='https://naturalearth.s3.amazonaws.com/10m_cultural/ne_10m_admin_0_countries.zip'
CANVAS_W,CANVAS_H=1200,1800
BBOX=(124.0,33.0,131.25,39.0)
VE=1.5
SCENE_M_PER_UNIT=10000.0
TARGET_W=2304
MESH_W=480


def sha256(path):
    h=hashlib.sha256()
    with open(path,'rb') as f:
        for c in iter(lambda:f.read(1<<20),b''): h.update(c)
    return h.hexdigest()


def fetch_svg():
    if SVG.exists() and SVG.stat().st_size>1000:return
    SVG.parent.mkdir(parents=True,exist_ok=True)
    subprocess.check_call([sys.executable,'-m','gdown','16HJnSRYleeXr_a1J1xXUpTFRM6WhTWEw','-O',str(SVG)])
    if SVG.stat().st_size<1000:raise RuntimeError('SVG download failed')


def render_svg_mask():
    import xml.etree.ElementTree as ET
    root=ET.parse(SVG).getroot(); w=int(float(root.attrib.get('width','744'))); h=int(float(root.attrib.get('height','1373')))
    png=cairosvg.svg2png(url=str(SVG),output_width=w,output_height=h,background_color='white')
    arr=np.array(Image.open(io.BytesIO(png)).convert('L'))
    return (arr<128).astype(np.uint8),(w,h)


def reference_korea_3857():
    z=TMP/'natural_earth.zip'; d=TMP/'ne'; d.mkdir(parents=True,exist_ok=True)
    if not z.exists():
        r=requests.get(NE_URL,timeout=60,headers={'User-Agent':'SSKR-terrain-builder/1.0'});r.raise_for_status();z.write_bytes(r.content)
    shp=next(d.glob('*.shp'),None)
    if shp is None:
        with zipfile.ZipFile(z) as q:q.extractall(d)
        shp=next(d.glob('*.shp'))
    g=gpd.read_file(shp); col='ADMIN' if 'ADMIN' in g.columns else 'NAME'
    sel=g[g[col].isin(['South Korea','North Korea'])]
    if len(sel)!=2:sel=g[g[col].astype(str).str.contains('Korea',case=False,na=False)]
    geom=unary_union(sel.geometry.tolist())
    tf=Transformer.from_crs(sel.crs or 'EPSG:4326','EPSG:3857',always_xy=True)
    return shp_transform(tf.transform,geom)


def raster_reference(geom):
    minx,miny,maxx,maxy=geom.bounds;dx=(maxx-minx)*.035;dy=(maxy-miny)*.035
    bounds=(minx-dx,miny-dy,maxx+dx,maxy+dy);tr=from_bounds(*bounds,CANVAS_W,CANVAS_H)
    arr=rasterize([(geom,1)],out_shape=(CANVAS_H,CANVAS_W),transform=tr,fill=0,dtype='uint8',all_touched=True)
    return arr,bounds


def bbox(mask):
    y,x=np.where(mask>0);return x.min(),y.min(),x.max(),y.max()


def m3(m):return np.vstack([m,[0,0,1]]).astype(float)

def iou(a,b):
    a=a>0;b=b>0;u=np.logical_or(a,b).sum();return float(np.logical_and(a,b).sum()/u)

def bdist(a,b):
    ea=cv2.Canny((a>0).astype('uint8')*255,50,150)>0;eb=cv2.Canny((b>0).astype('uint8')*255,50,150)>0
    da=distance_transform_edt(~ea);db=distance_transform_edt(~eb);v=[]
    if ea.any():v.append(float(db[ea].mean()))
    if eb.any():v.append(float(da[eb].mean()))
    return sum(v)/len(v)


def fit_georef(svg,ref,rbounds):
    sx0,sy0,sx1,sy1=bbox(svg);rx0,ry0,rx1,ry1=bbox(ref)
    M0=np.array([[(rx1-rx0)/(sx1-sx0),0,rx0-(rx1-rx0)/(sx1-sx0)*sx0],[0,(ry1-ry0)/(sy1-sy0),ry0-(ry1-ry0)/(sy1-sy0)*sy0]],dtype=np.float32)
    mov0=cv2.warpAffine(svg*255,M0,(CANVAS_W,CANVAS_H),flags=cv2.INTER_NEAREST)
    t=cv2.GaussianBlur((ref*255).astype('float32'),(0,0),5)/255.;m=cv2.GaussianBlur(mov0.astype('float32'),(0,0),5)/255.
    warp=np.array([[1,0,0],[0,1,0]],dtype=np.float32);crit=(cv2.TERM_CRITERIA_EPS|cv2.TERM_CRITERIA_COUNT,1200,1e-8)
    try:cc,warp=cv2.findTransformECC(t,m,warp,cv2.MOTION_AFFINE,crit,None,3)
    except cv2.error:cc=float('nan');warp=np.array([[1,0,0],[0,1,0]],dtype=np.float32)
    cand=[];W=m3(warp)
    for label,H in [('forward',W),('inverse',np.linalg.inv(W))]:
        M=(H@m3(M0))[:2].astype(np.float32);al=cv2.warpAffine(svg*255,M,(CANVAS_W,CANVAS_H),flags=cv2.INTER_NEAREST)
        cand.append((iou(al,ref*255),label,M,al))
    score,label,M,aligned=max(cand,key=lambda z:z[0])
    minx,miny,maxx,maxy=rbounds
    P=np.array([[(maxx-minx)/CANVAS_W,0,minx],[0,-(maxy-miny)/CANVAS_H,maxy],[0,0,1]],float)
    G=P@m3(M);Gi=np.linalg.inv(G);pxm=((maxx-minx)/CANVAS_W+(maxy-miny)/CANVAS_H)/2;dp=bdist(aligned,ref*255)
    metrics={'ecc':None if math.isnan(cc) else float(cc),'convention':label,'iou_natural_earth':score,'mean_symmetric_boundary_distance_px':dp,'mean_symmetric_boundary_distance_km':dp*pxm/1000}
    return G,Gi,aligned,metrics


def save_georef(ref,aligned,G,Gi,metrics,rbounds):
    c=np.zeros((CANVAS_H,CANVAS_W,3),np.uint8);c[ref>0]=(50,165,210);a=aligned>0;c[a]=np.maximum(c[a],np.array([230,145,45],np.uint8));Image.fromarray(c).save(OUT/'georef_reference_overlay.png')
    p={'schema_version':1,'source_svg':'assets/vector/korean_peninsula_precise.svg','reference':'Natural Earth 10m Korea union; calibration/QA only','svg_px_to_epsg3857_matrix':G.tolist(),'epsg3857_to_svg_px_matrix':Gi.tolist(),'reference_bounds_epsg3857':list(map(float,rbounds)),'fit_metrics':metrics,'policy':'Final coastline comes only from canonical SVG.'}
    (OUT/'svg_georef.json').write_text(json.dumps(p,indent=2),encoding='utf-8')


def dem():
    minlon,minlat,maxlon,maxlat=BBOX;raw=TMP/'copernicus';raw.mkdir(exist_ok=True)
    s3=boto3.client('s3',config=Config(signature_version=UNSIGNED,retries={'max_attempts':5}),region_name='eu-central-1');tiles=[];missing=[]
    for lat in range(math.floor(minlat),math.ceil(maxlat)):
      for lon in range(math.floor(minlon),math.ceil(maxlon)):
        ns='N' if lat>=0 else 'S';ew='E' if lon>=0 else 'W';stem=f'Copernicus_DSM_COG_10_{ns}{abs(lat):02d}_00_{ew}{abs(lon):03d}_00_DEM';key=f'{stem}/{stem}.tif';dst=raw/f'{stem}.tif'
        try:
          if not dst.exists():s3.download_file('copernicus-dem-30m',key,str(dst))
          tiles.append(dst)
        except Exception as e:missing.append({'key':key,'error':str(e)})
    if not tiles:raise RuntimeError('No DEM tiles')
    (OUT/'source_tiles.json').write_text(json.dumps({'bbox_wgs84':BBOX,'tiles':[p.name for p in tiles],'missing':missing},indent=2),encoding='utf-8')
    crs=CRS.from_proj4('+proj=aeqd +lat_0=36 +lon_0=127.6 +datum=WGS84 +units=m +no_defs');bounds=transform_bounds('EPSG:4326',crs,*BBOX,densify_pts=41);minx,miny,maxx,maxy=bounds;h=max(2,round(TARGET_W*(maxy-miny)/(maxx-minx)));tr=from_bounds(*bounds,TARGET_W,h);d=np.full((h,TARGET_W),np.nan,np.float32)
    for f in tiles:
      with rasterio.open(f) as src:
        q=np.full_like(d,np.nan);reproject(rasterio.band(src,1),q,src_transform=src.transform,src_crs=src.crs,src_nodata=src.nodata,dst_transform=tr,dst_crs=crs,dst_nodata=np.nan,resampling=Resampling.bilinear,num_threads=2);v=np.isfinite(q);e=~np.isfinite(d);d[v&e]=q[v&e];both=v&~e;d[both]=(d[both]+q[both])*.5
    return d,crs,bounds,tr


def precise_mask(shape,crs,tr,Gi,svg):
    h,w=shape;rows,cols=np.indices((h,w));xs,ys=rasterio.transform.xy(tr,rows,cols,offset='center');X=np.asarray(xs).reshape(h,w);Y=np.asarray(ys).reshape(h,w);t1=Transformer.from_crs(crs,'EPSG:4326',always_xy=True);lon,lat=t1.transform(X,Y);t2=Transformer.from_crs('EPSG:4326','EPSG:3857',always_xy=True);mx,my=t2.transform(lon,lat);sx=Gi[0,0]*mx+Gi[0,1]*my+Gi[0,2];sy=Gi[1,0]*mx+Gi[1,1]*my+Gi[1,2];xi=np.rint(sx).astype(np.int32);yi=np.rint(sy).astype(np.int32);v=(xi>=0)&(xi<svg.shape[1])&(yi>=0)&(yi<svg.shape[0]);o=np.zeros((h,w),np.uint8);o[v]=svg[yi[v],xi[v]];return o


def build_maps_mesh(d,land,crs,bounds,tr):
    h,w=d.shape;d=np.where(land>0,np.maximum(np.nan_to_num(d,nan=0),0),0).astype(np.float32);minx,miny,maxx,maxy=bounds;px=(maxx-minx)/w;py=(maxy-miny)/h;gy,gx=np.gradient(d,py,px);sd=np.degrees(np.arctan(np.hypot(gx,gy)));gxv=gx*VE;gyv=gy*VE;s=np.arctan(np.hypot(gxv,gyv));asp=np.arctan2(-gxv,gyv);az=math.radians(315);alt=math.radians(35);hs=np.clip((np.sin(alt)*np.cos(s)+np.cos(alt)*np.sin(s)*np.cos(az-asp)+1)*127.5,0,255).astype(np.uint8);hs=np.where(land>0,hs,0);s8=np.where(land>0,np.clip(sd/60*255,0,255),0).astype(np.uint8);nx=-gxv;ny=np.ones_like(gxv);nz=gyv;n=np.maximum(np.sqrt(nx*nx+ny*ny+nz*nz),1e-8);normal=np.stack([(nx/n*.5+.5)*255,(ny/n*.5+.5)*255,(nz/n*.5+.5)*255],-1).clip(0,255).astype(np.uint8);normal=np.where((land>0)[...,None],normal,np.array([128,255,128],np.uint8));e=np.clip(d/1900,0,1);sl=np.clip(sd/45,0,1);lo=np.array([65,82,64.]);hi=np.array([116,109,91.]);rock=np.array([130,128,119.]);ocean=np.array([17,43,67.]);alb=lo*(1-e[...,None])+hi*e[...,None];alb=alb*(1-sl[...,None]*.25)+rock*(sl[...,None]*.25);alb=np.where((land>0)[...,None],alb,ocean).clip(0,255).astype(np.uint8)
    Image.fromarray(land*255).save(OUT/'land_mask_precise_svg.png');Image.fromarray(hs).save(OUT/'hillshade.png');Image.fromarray(s8).save(OUT/'slope.png');Image.fromarray(normal).save(OUT/'normal.png');Image.fromarray(alb).save(OUT/'albedo.png');mx=max(float(d[land>0].max()),1);Image.fromarray((np.clip(d/mx,0,1)*65535).astype('uint16'),mode='I;16').save(OUT/'height_u16.png')
    with rasterio.open(OUT/'dem_scene_float32.tif','w',driver='GTiff',height=h,width=w,count=1,dtype='float32',crs=crs,transform=tr,nodata=-9999,compress='DEFLATE') as ds:ds.write(np.where(land>0,d,-9999).astype(np.float32),1)
    shade=cv2.cvtColor(hs,cv2.COLOR_GRAY2RGB).astype(float)/255;prev=np.clip(alb*(.35+.65*shade),0,255).astype(np.uint8);edge=cv2.Canny((land*255).astype(np.uint8),50,150)>0;prev[edge]=[255,196,92];im=Image.fromarray(prev);im.thumbnail((1800,1800),Image.Resampling.LANCZOS);im.save(OUT/'terrain_qa_preview_v02.png')
    mh=max(2,round(MESH_W*h/w));ci=np.linspace(0,w-1,MESH_W).astype(int);ri=np.linspace(0,h-1,mh).astype(int);z=d[np.ix_(ri,ci)]*VE;lm=land[np.ix_(ri,ci)]>0;xs=np.linspace(minx,maxx,MESH_W);ys=np.linspace(maxy,miny,mh);X,Y=np.meshgrid(xs,ys);verts=np.column_stack([X.ravel()/SCENE_M_PER_UNIT,z.ravel()/SCENE_M_PER_UNIT,-Y.ravel()/SCENE_M_PER_UNIT]);faces=[]
    for r in range(mh-1):
      for c in range(MESH_W-1):
        a=r*MESH_W+c;b=a+1;q=(r+1)*MESH_W+c;e0=q+1
        if lm[r,c] and lm[r,c+1] and lm[r+1,c]:faces.append([a,q,b])
        if lm[r,c+1] and lm[r+1,c] and lm[r+1,c+1]:faces.append([b,q,e0])
    mesh=trimesh.Trimesh(vertices=verts,faces=np.asarray(faces,np.int64),process=False);mesh.remove_unreferenced_vertices();mesh.export(OUT/'terrain_lod.glb');return {'mesh_width':MESH_W,'mesh_height':mh,'vertices':len(mesh.vertices),'triangles':len(mesh.faces),'max_elevation_m':mx}


def main():
    OUT.mkdir(parents=True,exist_ok=True);TMP.mkdir(exist_ok=True);fetch_svg();svg,_=render_svg_mask();geom=reference_korea_3857();ref,rb=raster_reference(geom);G,Gi,aligned,metrics=fit_georef(svg,ref,rb);save_georef(ref,aligned,G,Gi,metrics,rb);print(metrics)
    if metrics['iou_natural_earth']<.82 or metrics['mean_symmetric_boundary_distance_km']>18:raise RuntimeError('Georef QA failed: '+str(metrics))
    d,crs,bounds,tr=dem();land=precise_mask(d.shape,crs,tr,Gi,svg);land=(land & np.isfinite(d) & (d>-500)).astype(np.uint8);mesh=build_maps_mesh(d,land,crs,bounds,tr)
    meta={'schema_version':2,'asset':'South Korea Hero Terrain v0.2','source_elevation':'Copernicus DEM GLO-30 Public','source_coastline':'SSKR canonical korean_peninsula_precise.svg','bbox_wgs84':BBOX,'local_crs_proj4':crs.to_proj4(),'local_bounds_m':list(map(float,bounds)),'raster_size':[d.shape[1],d.shape[0]],'vertical_exaggeration':VE,'scene_m_per_unit':SCENE_M_PER_UNIT,'coastline_clip':'APPLIED_FROM_GEOREFERENCED_CANONICAL_SVG','georef_fit_metrics':metrics,'mesh':mesh,'elevation_stats_m':{'min':float(d[land>0].min()),'max':float(d[land>0].max()),'mean':float(d[land>0].mean())}}
    (OUT/'terrain_metadata.json').write_text(json.dumps(meta,indent=2),encoding='utf-8');prov={'asset':'South Korea Hero Terrain v0.2','files':{}}
    for f in OUT.iterdir():
      if f.is_file():prov['files'][f.name]={'bytes':f.stat().st_size,'sha256':sha256(f)}
    (OUT/'BUILD_PROVENANCE.json').write_text(json.dumps(prov,indent=2),encoding='utf-8');print(json.dumps(meta,indent=2))

if __name__=='__main__':main()
