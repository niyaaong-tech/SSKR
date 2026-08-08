#!/usr/bin/env python3
from __future__ import annotations

import json,re,tempfile
from pathlib import Path

import boto3
import numpy as np
import rasterio
from botocore import UNSIGNED
from botocore.config import Config
from PIL import Image
from rasterio.merge import merge
from rasterio.enums import Resampling
from rasterio.transform import from_bounds
from rasterio.warp import reproject

ROOT=Path.cwd();TERRAIN=ROOT/'assets/scene05/south_korea_hero_v0.2';OUT=ROOT/'output/scene05_worldcover_v1';BUCKET='esa-worldcover';PREFIX='v200/2021/map/';BBOX=(124.0,33.0,131.25,39.0)
PAT=re.compile(r'ESA_WorldCover_10m_2021_v200_([NS])(\d{2})([EW])(\d{3})_Map\.tif$')

def origin(name):
 m=PAT.search(name)
 if not m:return None
 lat=int(m.group(2))*(1 if m.group(1)=='N' else -1);lon=int(m.group(4))*(1 if m.group(3)=='E' else -1);return lon,lat

def intersects(lon,lat,bbox):
 # WorldCover map tiles are 3x3 degrees with southwest origin.
 w,s,e,n=bbox;return not (lon+3<=w or lon>=e or lat+3<=s or lat>=n)

def main():
 OUT.mkdir(parents=True,exist_ok=True);meta=json.loads((TERRAIN/'terrain_metadata.json').read_text());client=boto3.client('s3',region_name='eu-central-1',config=Config(signature_version=UNSIGNED));keys=[];token=None
 while True:
  kw={'Bucket':BUCKET,'Prefix':PREFIX,'MaxKeys':1000}
  if token:kw['ContinuationToken']=token
  r=client.list_objects_v2(**kw)
  for o in r.get('Contents',[]):
   org=origin(o['Key'])
   if org and intersects(*org,BBOX):keys.append(o['Key'])
  if not r.get('IsTruncated'):break
  token=r['NextContinuationToken']
 if not keys:raise SystemExit('No WorldCover tiles found for Korea bbox')
 print('tiles',len(keys),*[Path(k).name for k in keys],sep='\n')
 with tempfile.TemporaryDirectory() as td:
  paths=[]
  for k in keys:
   p=Path(td)/Path(k).name;client.download_file(BUCKET,k,str(p));paths.append(p)
  srcs=[rasterio.open(p) for p in paths]
  try:
   # Downsample at merge time. This preserves categorical class boundaries while
   # avoiding 10m full-resolution memory pressure.
   mosaic,transform=merge(srcs,bounds=BBOX,res=(0.0022,0.0022),resampling=Resampling.nearest,nodata=0,dtype='uint8')
  finally:
   for s in srcs:s.close()
  arr=mosaic[0]
 local_bounds=meta['local_bounds_m'];w,h=meta['raster_size'];dst=np.zeros((h,w),dtype=np.uint8);dst_transform=from_bounds(*local_bounds,w,h)
 reproject(source=arr,destination=dst,src_transform=transform,src_crs='EPSG:4326',dst_transform=dst_transform,dst_crs=meta['local_crs_proj4'],src_nodata=0,dst_nodata=0,resampling=Resampling.nearest)
 Image.fromarray(dst,'L').save(OUT/'worldcover_local_v1.png',optimize=True)
 classes={int(v):int((dst==v).sum()) for v in np.unique(dst)}
 md={'schema_version':'1.0','source':'ESA WorldCover 10m 2021 v200','license':'CC BY 4.0','attribution':'© ESA WorldCover project 2021 / Contains modified Copernicus Sentinel data (2021) processed by ESA WorldCover consortium','source_bucket':'s3://esa-worldcover/v200/2021/map','source_tiles':[Path(k).name for k in keys],'bbox_wgs84':BBOX,'local_crs':meta['local_crs_proj4'],'local_bounds_m':local_bounds,'raster_size':[w,h],'class_pixel_counts':classes,'purpose':'Scene 05 cinematic land-material classification; not navigation'}
 (OUT/'worldcover_local_v1.json').write_text(json.dumps(md,ensure_ascii=False,indent=2));print(json.dumps({'tiles':len(keys),'classes':classes,'size':[w,h]},indent=2))
if __name__=='__main__':main()
