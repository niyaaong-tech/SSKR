#!/usr/bin/env python3
from __future__ import annotations

import json
import math
from pathlib import Path

import cv2
import numpy as np
from pyproj import CRS, Transformer

ROOT=Path.cwd()
SRC=ROOT/'assets'/'scene05'/'georef_v0.3.1'/'georef_diagnostic_v031.json'
OUT=ROOT/'output'/'scene05_georef_v0.3.2'
SEED=ROOT/'assets'/'scene05'/'south_korea_hero_v0.2'/'svg_georef.json'

MODELS={
    'equirectangular_lonlat': None,
    'web_mercator_epsg3857': 'EPSG:3857',
    'utm52n_epsg32652': 'EPSG:32652',
    'korea2000_unified_epsg5179': 'EPSG:5179',
    'korea2000_central2010_epsg5186': 'EPSG:5186',
    'local_aeqd_36_1276': '+proj=aeqd +lat_0=36 +lon_0=127.6 +datum=WGS84 +units=m +no_defs',
    'korea_lcc_reference': '+proj=lcc +lat_1=30 +lat_2=60 +lat_0=38 +lon_0=127.5 +datum=WGS84 +units=m +no_defs',
}


def xy_for(model, lon, lat):
    lon=np.asarray(lon,float);lat=np.asarray(lat,float)
    if model is None:
        # Scale degrees to roughly metric magnitudes only for numerical conditioning;
        # affine fit absorbs this scale and does not change the projection model.
        lat0=36.0
        return lon*111320.0*math.cos(math.radians(lat0)), lat*110540.0
    t=Transformer.from_crs('EPSG:4326',CRS.from_user_input(model),always_xy=True)
    return t.transform(lon,lat)


def fit_affine(src,dst):
    src=np.asarray(src,float);dst=np.asarray(dst,float)
    A=np.column_stack([src[:,0],src[:,1],np.ones(len(src))])
    bx,*_=np.linalg.lstsq(A,dst[:,0],rcond=None);by,*_=np.linalg.lstsq(A,dst[:,1],rcond=None)
    return np.array([[bx[0],bx[1],bx[2]],[by[0],by[1],by[2]]],float)


def apply(M,src):
    src=np.asarray(src,float);A=np.column_stack([src[:,0],src[:,1],np.ones(len(src))]);return A@M.T


def loo(src,dst,inliers,m_per_px):
    idx=np.where(inliers)[0];errs=[]
    for held in idx:
        train=idx[idx!=held];M=fit_affine(src[train],dst[train]);pred=apply(M,src[[held]])[0]
        e=float(np.linalg.norm(pred-dst[held]));errs.append({'index':int(held),'error_px':e,'error_km':e*m_per_px/1000.0})
    return errs


def main():
    OUT.mkdir(parents=True,exist_ok=True)
    d=json.loads(SRC.read_text('utf-8'));pts=d['points']
    seed=json.loads(SEED.read_text('utf-8'));G=np.asarray(seed['svg_px_to_epsg3857_matrix'],float);m_per_px=math.sqrt(abs(np.linalg.det(G[:2,:2])))
    lon=np.array([p['resolved_coast_lon'] for p in pts]);lat=np.array([p['resolved_coast_lat'] for p in pts]);dst=np.array([p['canonical_boundary_svg_px'] for p in pts],float)
    results=[]
    for name,crs in MODELS.items():
        x,y=xy_for(crs,lon,lat);src=np.column_stack([x,y])
        # Normalize before OpenCV RANSAC to avoid large-coordinate conditioning issues.
        center=src.mean(0);scale=max(float(src.std(0).max()),1.0);sn=(src-center)/scale
        R,mask=cv2.estimateAffine2D(sn.astype(np.float32),dst.astype(np.float32),method=cv2.RANSAC,ransacReprojThreshold=2.5,maxIters=10000,confidence=.999,refineIters=50)
        if mask is None:mask=np.ones((len(src),1),np.uint8)
        inl=mask.ravel().astype(bool)
        if inl.sum()<7:inl[:]=True
        M=fit_affine(src[inl],dst[inl]);pred=apply(M,src);err=np.linalg.norm(pred-dst,axis=1)*m_per_px/1000.0;cv=loo(src,dst,inl,m_per_px);cvv=np.array([q['error_km'] for q in cv])
        fit=err[inl]
        results.append({
            'model':name,'crs':crs or 'lon/lat equirectangular approximation','inliers':int(inl.sum()),
            'inlier_ids':[pts[i]['id'] for i in np.where(inl)[0]],
            'fit_error_km':{'mean':float(fit.mean()),'max':float(fit.max()),'median':float(np.median(fit))},
            'loo_error_km':{'mean':float(cvv.mean()),'max':float(cvv.max()),'median':float(np.median(cvv))},
            'affine_projected_to_svg':M.tolist(),
            'projected_center':center.tolist(),'projected_scale_for_ransac':scale,
            'all_point_error_km':[{'id':p['id'],'error_km':float(e)} for p,e in zip(pts,err)],
            'loo':cv,
        })
    # Rank primarily by broad support, then CV mean/max. Prefer >=9 inliers.
    eligible=[r for r in results if r['inliers']>=9]
    pool=eligible if eligible else results
    best=min(pool,key=lambda r:(r['loo_error_km']['mean'],r['loo_error_km']['max'],-r['inliers']))
    report={'schema_version':'0.3.2','purpose':'Projection model selection without local/nonlinear warping','approx_m_per_svg_px':m_per_px,'best_model':best['model'],'best_model_metrics':{k:best[k] for k in ['inliers','fit_error_km','loo_error_km']},'decision':'PROJECTION_CANDIDATE_FOUND' if best['loo_error_km']['mean']<2.0 and best['loo_error_km']['max']<4.0 and best['inliers']>=9 else 'KEEP_V02_AND_STOP_GEOREF_REFINEMENT','models':results}
    (OUT/'georef_model_selection_v032.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({k:v for k,v in report.items() if k!='models'},ensure_ascii=False,indent=2))
    for r in sorted(results,key=lambda q:(q['loo_error_km']['mean'],q['loo_error_km']['max'])):
        print(r['model'],r['inliers'],r['loo_error_km'])

if __name__=='__main__':main()
