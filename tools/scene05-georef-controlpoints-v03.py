#!/usr/bin/env python3
from __future__ import annotations
import importlib.util, json, math
from pathlib import Path

import cv2
import geopandas as gpd
import numpy as np
from PIL import Image, ImageDraw
from pyproj import Transformer
from scipy.spatial import cKDTree
from shapely.ops import unary_union, transform as shp_transform

ROOT=Path.cwd()
V02_PATH=ROOT/'tools'/'scene05-georef-build-v02.py'
CP_PATH=ROOT/'assets'/'scene05'/'control_points_v0.3.json'
OUT=ROOT/'output'/'south_korea_hero_v0.3'
TMP=ROOT/'.tmp_scene05_v03'

spec=importlib.util.spec_from_file_location('scene05_v02',V02_PATH)
v02=importlib.util.module_from_spec(spec);spec.loader.exec_module(v02)
v02.OUT=OUT;v02.TMP=TMP


def load_points():
    return json.loads(CP_PATH.read_text('utf-8'))['points']


def south_korea_geom_3857():
    z=TMP/'natural_earth.zip';d=TMP/'ne';d.mkdir(parents=True,exist_ok=True)
    if not z.exists():
        import requests
        r=requests.get(v02.NE_URL,timeout=60,headers={'User-Agent':'SSKR-terrain-builder/1.0'});r.raise_for_status();z.write_bytes(r.content)
    shp=next(d.glob('*.shp'),None)
    if shp is None:
        import zipfile
        with zipfile.ZipFile(z) as q:q.extractall(d)
        shp=next(d.glob('*.shp'))
    g=gpd.read_file(shp);col='ADMIN' if 'ADMIN' in g.columns else 'NAME'
    sel=g[g[col].eq('South Korea')]
    if len(sel)==0:sel=g[g[col].astype(str).str.contains('South Korea',case=False,na=False)]
    geom=unary_union(sel.geometry.tolist())
    tf=Transformer.from_crs(sel.crs or 'EPSG:4326','EPSG:3857',always_xy=True)
    return shp_transform(tf.transform,geom)


def poly_features(x,y):
    return np.column_stack([np.ones_like(x),x,y,x*y,x*x,y*y])


def fit_poly(mx,my,sx,sy):
    cx=float(np.mean(mx));cy=float(np.mean(my));scale=max(float(np.std(mx)),float(np.std(my)),1.0)
    xn=(mx-cx)/scale;yn=(my-cy)/scale;A=poly_features(xn,yn)
    reg=np.diag([0,1e-6,1e-6,2e-6,2e-6,2e-6])
    bx=np.linalg.solve(A.T@A+reg,A.T@sx);by=np.linalg.solve(A.T@A+reg,A.T@sy)
    return {'center':[cx,cy],'scale':scale,'bx':bx,'by':by}


def apply_poly(model,mx,my):
    mx=np.asarray(mx,float);my=np.asarray(my,float);cx,cy=model['center'];sc=model['scale']
    A=poly_features((mx-cx)/sc,(my-cy)/sc)
    return A@model['bx'],A@model['by']


def snap_control_points(svg,Gi,points):
    edge=cv2.Canny((svg*255).astype(np.uint8),50,150)>0
    yy,xx=np.where(edge);tree=cKDTree(np.column_stack([xx,yy]))
    tf=Transformer.from_crs('EPSG:4326','EPSG:3857',always_xy=True)
    rows=[]
    for p in points:
        mx,my=tf.transform(p['lon'],p['lat'])
        q=Gi@np.array([mx,my,1.0]);gx,gy=float(q[0]),float(q[1])
        dist,idx=tree.query([gx,gy],k=1)
        sx,sy=float(xx[idx]),float(yy[idx])
        rows.append({**p,'mx':mx,'my':my,'seed_svg_px':[gx,gy],'snap_svg_px':[sx,sy],'snap_distance_px':float(dist)})
    return rows


def cv_error(rows,G):
    mx=np.array([r['mx'] for r in rows]);my=np.array([r['my'] for r in rows]);sx=np.array([r['snap_svg_px'][0] for r in rows]);sy=np.array([r['snap_svg_px'][1] for r in rows])
    m_per_px=math.sqrt(abs(np.linalg.det(np.asarray(G)[:2,:2])))
    errs=[]
    for i in range(len(rows)):
        keep=np.arange(len(rows))!=i;m=fit_poly(mx[keep],my[keep],sx[keep],sy[keep]);px,py=apply_poly(m,[mx[i]],[my[i]])
        epx=float(math.hypot(px[0]-sx[i],py[0]-sy[i]));errs.append({'id':rows[i]['id'],'error_px':epx,'error_km':epx*m_per_px/1000.0})
    return errs,m_per_px


def aligned_from_geo_to_svg(svg,rbounds,model,w=v02.CANVAS_W,h=v02.CANVAS_H):
    minx,miny,maxx,maxy=rbounds
    xs=np.linspace(minx,maxx,w,endpoint=False)+(maxx-minx)/(2*w)
    ys=np.linspace(maxy,miny,h,endpoint=False)-(maxy-miny)/(2*h)
    X,Y=np.meshgrid(xs,ys);sx,sy=apply_poly(model,X.ravel(),Y.ravel());xi=np.rint(sx).astype(np.int32);yi=np.rint(sy).astype(np.int32)
    valid=(xi>=0)&(xi<svg.shape[1])&(yi>=0)&(yi<svg.shape[0]);o=np.zeros(w*h,np.uint8);o[valid]=svg[yi[valid],xi[valid]];return o.reshape(h,w)


def cp_overlay(svg,rows,model):
    base=np.dstack([svg*44+8,svg*54+10,svg*46+9]).astype(np.uint8);im=Image.fromarray(base);dr=ImageDraw.Draw(im)
    mx=np.array([r['mx'] for r in rows]);my=np.array([r['my'] for r in rows]);px,py=apply_poly(model,mx,my)
    for r,x,y in zip(rows,px,py):
        rr=8;dr.ellipse([x-rr,y-rr,x+rr,y+rr],fill=(255,209,102),outline=(255,255,255),width=2);dr.text((x+10,y-7),r['id'],fill=(255,255,255))
    im.save(OUT/'control_points_svg_overlay_v03.png')


def refined_mask(shape,crs,tr,model,svg):
    import rasterio
    h,w=shape;rows,cols=np.indices((h,w));xs,ys=rasterio.transform.xy(tr,rows,cols,offset='center');X=np.asarray(xs).reshape(h,w);Y=np.asarray(ys).reshape(h,w)
    t1=Transformer.from_crs(crs,'EPSG:3857',always_xy=True);mx,my=t1.transform(X,Y);sx,sy=apply_poly(model,np.asarray(mx).ravel(),np.asarray(my).ravel());xi=np.rint(sx).astype(np.int32);yi=np.rint(sy).astype(np.int32);valid=(xi>=0)&(xi<svg.shape[1])&(yi>=0)&(yi<svg.shape[0]);o=np.zeros(h*w,np.uint8);o[valid]=svg[yi[valid],xi[valid]];return o.reshape(h,w)


def terrain_cp_overlay(rows,crs,tr):
    p=OUT/'terrain_qa_preview_v03.png'
    if not p.exists():return
    im=Image.open(p).convert('RGB');ow,oh=im.size
    import rasterio
    with rasterio.open(OUT/'dem_scene_float32.tif') as ds:fw,fh=ds.width,ds.height
    tf=Transformer.from_crs('EPSG:4326',crs,always_xy=True);dr=ImageDraw.Draw(im)
    for r in rows:
        x,y=tf.transform(r['lon'],r['lat']);row,col=rasterio.transform.rowcol(tr,x,y);px=col*ow/fw;py=row*oh/fh
        rr=5;dr.ellipse([px-rr,py-rr,px+rr,py+rr],fill=(255,209,102),outline=(255,255,255),width=1);dr.text((px+7,py-6),r['id'],fill=(255,255,255))
    im.save(OUT/'control_points_terrain_overlay_v03.png')


def main():
    OUT.mkdir(parents=True,exist_ok=True);TMP.mkdir(exist_ok=True);v02.fetch_svg();svg,_=v02.render_svg_mask()
    # v0.2 affine seed using the full peninsula reference.
    geom0=v02.reference_korea_3857();ref0,rb0=v02.raster_reference(geom0);G,Gi,aligned0,seed_metrics=v02.fit_georef(svg,ref0,rb0)
    points=load_points();rows=snap_control_points(svg,Gi,points)
    mx=np.array([r['mx'] for r in rows]);my=np.array([r['my'] for r in rows]);sx=np.array([r['snap_svg_px'][0] for r in rows]);sy=np.array([r['snap_svg_px'][1] for r in rows]);model=fit_poly(mx,my,sx,sy)
    predx,predy=apply_poly(model,mx,my)
    for r,x,y in zip(rows,predx,predy):r['fit_residual_px']=float(math.hypot(x-r['snap_svg_px'][0],y-r['snap_svg_px'][1]))
    cv,m_per_px=cv_error(rows,G)
    cp_overlay(svg,rows,model)

    # South-Korea-only independent QA against Natural Earth; final coastline still comes solely from canonical SVG.
    sk=south_korea_geom_3857();ref,rb=v02.raster_reference(sk);aligned=aligned_from_geo_to_svg(svg,rb,model);iou=v02.iou(aligned*255,ref*255);dp=v02.bdist(aligned*255,ref*255);pxm=((rb[2]-rb[0])/v02.CANVAS_W+(rb[3]-rb[1])/v02.CANVAS_H)/2
    qa={'iou_south_korea_natural_earth':float(iou),'mean_symmetric_boundary_distance_px':float(dp),'mean_symmetric_boundary_distance_km':float(dp*pxm/1000.0)}
    c=np.zeros((v02.CANVAS_H,v02.CANVAS_W,3),np.uint8);c[ref>0]=(50,165,210);c[aligned>0]=np.maximum(c[aligned>0],np.array([230,145,45],np.uint8));Image.fromarray(c).save(OUT/'georef_reference_overlay_v03.png')

    d,crs,bounds,tr=v02.dem();land=refined_mask(d.shape,crs,tr,model,svg);land=(land & np.isfinite(d) & (d>-500)).astype(np.uint8);mesh=v02.build_maps_mesh(d,land,crs,bounds,tr)
    # Preserve v0.2 builder output name, then add explicit v0.3 copy.
    src=OUT/'terrain_qa_preview_v02.png'
    if src.exists():src.replace(OUT/'terrain_qa_preview_v03.png')
    terrain_cp_overlay(rows,crs,tr)
    stats={'schema_version':3,'asset':'South Korea Hero Terrain v0.3','source_elevation':'Copernicus DEM GLO-30 Public','source_coastline':'SSKR canonical korean_peninsula_precise.svg','georef_model':'quadratic WGS84/WebMercator -> canonical SVG pixels, seeded by v0.2 affine and 13 coastline control points','seed_metrics_v02':seed_metrics,'south_korea_reference_qa':qa,'approx_seed_m_per_svg_px':m_per_px,'control_point_cv':{'mean_km':float(np.mean([e['error_km'] for e in cv])),'max_km':float(np.max([e['error_km'] for e in cv])),'points':cv},'control_points':rows,'poly_model':{'center':model['center'],'scale':model['scale'],'bx':model['bx'].tolist(),'by':model['by'].tolist()},'mesh':mesh}
    (OUT/'georef_control_points_v03.json').write_text(json.dumps(stats,ensure_ascii=False,indent=2),encoding='utf-8')
    meta={'schema_version':3,'asset':'South Korea Hero Terrain v0.3','bbox_wgs84':list(v02.BBOX),'vertical_exaggeration':v02.VE,'scene_m_per_unit':v02.SCENE_M_PER_UNIT,'coastline_clip':'APPLIED_FROM_CONTROLPOINT_GEOREFERENCED_CANONICAL_SVG','south_korea_reference_qa':qa,'control_point_cv_mean_km':stats['control_point_cv']['mean_km'],'control_point_cv_max_km':stats['control_point_cv']['max_km'],'mesh':mesh}
    (OUT/'terrain_metadata_v03.json').write_text(json.dumps(meta,indent=2),encoding='utf-8')
    (OUT/'BUILD_PROVENANCE_v03.json').write_text(json.dumps({'canonical_svg_sha256':v02.sha256(v02.SVG),'control_points_sha256':v02.sha256(CP_PATH),'builder':'tools/scene05-georef-controlpoints-v03.py'},indent=2),encoding='utf-8')
    print(json.dumps(meta,indent=2));print('CONTROL_POINT_CV_KM',stats['control_point_cv']['mean_km'],stats['control_point_cv']['max_km'])

if __name__=='__main__':main()
