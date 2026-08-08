#!/usr/bin/env python3
from __future__ import annotations

import json,re,tempfile
from pathlib import Path
import boto3,numpy as np,rasterio
from botocore import UNSIGNED
from botocore.config import Config
from PIL import Image
from rasterio.merge import merge
from rasterio.enums import Resampling
from rasterio.transform import from_bounds,Affine
from rasterio.warp import reproject

ROOT=Path.cwd();TERRAIN=ROOT/'assets/scene05/south_korea_hero_v0.2';SVG=ROOT/'assets/vector/korean_peninsula_precise.svg';OUT=ROOT/'output/scene05_worldcover_v1';BUCKET='esa-worldcover';PREFIX='v200/2021/map/';FULL_BBOX=(123.5,33.0,132.0,43.6);LOCAL_BBOX=(124.0,33.0,131.25,39.0);PEN_W=1792
PAT=re.compile(r'ESA_WorldCover_10m_2021_v200_([NS])(\d{2})([EW])(\d{3})_Map\.tif$')
def origin(name):
 m=PAT.search(name)
 if not m:return None
 return int(m.group(4))*(1 if m.group(3)=='E' else -1),int(m.group(2))*(1 if m.group(1)=='N' else -1)
def intersects(lon,lat,b):w,s,e,n=b;return not(lon+3<=w or lon>=e or lat+3<=s or lat>=n)
def svg_size():
 m=re.search(r'viewBox="\s*0\s+0\s+([0-9.]+)\s+([0-9.]+)"',SVG.read_text('utf-8'));return float(m.group(1)),float(m.group(2))
def main():
 OUT.mkdir(parents=True,exist_ok=True);meta=json.loads((TERRAIN/'terrain_metadata.json').read_text());gref=json.loads((TERRAIN/'svg_georef.json').read_text());client=boto3.client('s3',region_name='eu-central-1',config=Config(signature_version=UNSIGNED));keys=[];token=None
 while True:
  kw={'Bucket':BUCKET,'Prefix':PREFIX,'MaxKeys':1000}
  if token:kw['ContinuationToken']=token
  r=client.list_objects_v2(**kw)
  for o in r.get('Contents',[]):
   org=origin(o['Key'])
   if org and intersects(*org,FULL_BBOX):keys.append(o['Key'])
  if not r.get('IsTruncated'):break
  token=r['NextContinuationToken']
 if not keys:raise SystemExit('No WorldCover tiles found')
 print('tiles',len(keys),*[Path(k).name for k in keys],sep='\n')
 with tempfile.TemporaryDirectory() as td:
  paths=[]
  for k in keys:
   p=Path(td)/Path(k).name;client.download_file(BUCKET,k,str(p));paths.append(p)
  srcs=[rasterio.open(p) for p in paths]
  try:mosaic,transform=merge(srcs,bounds=FULL_BBOX,res=(0.0030,0.0030),resampling=Resampling.nearest,nodata=0,dtype='uint8')
  finally:
   for s in srcs:s.close()
  arr=mosaic[0]
 # South Korea local-raster product, retained for analytical use.
 local_bounds=meta['local_bounds_m'];w,h=meta['raster_size'];local=np.zeros((h,w),dtype=np.uint8);local_transform=from_bounds(*local_bounds,w,h)
 reproject(source=arr,destination=local,src_transform=transform,src_crs='EPSG:4326',dst_transform=local_transform,dst_crs=meta['local_crs_proj4'],src_nodata=0,dst_nodata=0,resampling=Resampling.nearest)
 Image.fromarray(local,'L').save(OUT/'worldcover_local_v1.png',optimize=True)
 # Full-peninsula product aligned pixel-for-pixel to the canonical SVG art texture.
 sw,sh=svg_size();pen_h=round(PEN_W*sh/sw);M=np.asarray(gref['svg_px_to_epsg3857_matrix'],dtype=np.float64);sx=sw/PEN_W;sy=sh/pen_h;dst_aff=Affine(M[0,0]*sx,M[0,1]*sy,M[0,2],M[1,0]*sx,M[1,1]*sy,M[1,2]);pen=np.zeros((pen_h,PEN_W),dtype=np.uint8)
 reproject(source=arr,destination=pen,src_transform=transform,src_crs='EPSG:4326',dst_transform=dst_aff,dst_crs='EPSG:3857',src_nodata=0,dst_nodata=0,resampling=Resampling.nearest)
 Image.fromarray(pen,'L').save(OUT/'worldcover_peninsula_v1.png',optimize=True)
 classes={int(v):int((pen==v).sum()) for v in np.unique(pen)}
 md={'schema_version':'1.1','source':'ESA WorldCover 10m 2021 v200','license':'CC BY 4.0','attribution':'© ESA WorldCover project 2021 / Contains modified Copernicus Sentinel data (2021) processed by ESA WorldCover consortium','source_bucket':'s3://esa-worldcover/v200/2021/map','source_tiles':[Path(k).name for k in keys],'full_bbox_wgs84':FULL_BBOX,'local_bbox_wgs84':LOCAL_BBOX,'local_crs':meta['local_crs_proj4'],'local_bounds_m':local_bounds,'local_raster_size':[w,h],'peninsula_raster_size':[PEN_W,pen_h],'peninsula_alignment':'canonical SVG pixel grid via svg_px_to_epsg3857 affine','class_pixel_counts_peninsula':classes,'purpose':'Scene 05 cinematic land-material classification; not navigation'}
 (OUT/'worldcover_local_v1.json').write_text(json.dumps(md,ensure_ascii=False,indent=2));print(json.dumps({'tiles':len(keys),'peninsula_size':[PEN_W,pen_h],'classes':classes},indent=2))
if __name__=='__main__':main()
