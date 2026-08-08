from __future__ import annotations
import json, math, os, hashlib, datetime
from pathlib import Path
import numpy as np
from PIL import Image, ImageEnhance, ImageChops
from scipy.ndimage import zoom
import rasterio
from rasterio.transform import from_bounds
from rasterio.warp import reproject, Resampling, transform_bounds
from pyproj import CRS
import trimesh, boto3
from botocore import UNSIGNED
from botocore.client import Config

BBOX=(124.0,33.0,130.5,39.0)
CENTER=(127.25,36.0)
WIDTH=2048
MESH_WIDTH=320
VE=1.5
SCENE_M_PER_UNIT=10000.0
HEIGHT_CEILING=3000.0
ROOT=Path.cwd()
RAW=ROOT/'raw_tiles'
OUT=ROOT/'output'/'south_korea_hero_v0.1'
RAW.mkdir(parents=True,exist_ok=True); OUT.mkdir(parents=True,exist_ok=True)

def tile_id(lat,lon):
    return f"Copernicus_DSM_COG_10_{'N' if lat>=0 else 'S'}{abs(lat):02d}_00_{'E' if lon>=0 else 'W'}{abs(lon):03d}_00_DEM"

def download_tiles():
    s3=boto3.client('s3',region_name='eu-central-1',config=Config(signature_version=UNSIGNED,retries={'max_attempts':5}))
    minlon,minlat,maxlon,maxlat=BBOX
    got=[]; missing=[]
    for lat in range(math.floor(minlat),math.ceil(maxlat)):
      for lon in range(math.floor(minlon),math.ceil(maxlon)):
        tid=tile_id(lat,lon); key=f'{tid}/{tid}.tif'; dst=RAW/f'{tid}.tif'
        if dst.exists() and dst.stat().st_size>0:
            got.append(dst); continue
        try:
            s3.head_object(Bucket='copernicus-dem-30m',Key=key)
        except Exception:
            try:
                listing=s3.list_objects_v2(Bucket='copernicus-dem-30m',Prefix=tid+'/')
                cand=[o['Key'] for o in listing.get('Contents',[]) if o['Key'].lower().endswith('.tif')]
                if not cand: missing.append(tid); print('[skip]',tid); continue
                key=cand[0]
            except Exception as e:
                missing.append(tid); print('[skip]',tid,type(e).__name__); continue
        print('[get]',key)
        s3.download_file('copernicus-dem-30m',key,str(dst))
        got.append(dst)
    (OUT/'source_tiles.json').write_text(json.dumps({'bbox_wgs84':BBOX,'tiles':[p.name for p in got],'missing':missing},indent=2),encoding='utf-8')
    if not got: raise SystemExit('No Copernicus tiles downloaded')
    return got

def target_grid():
    crs=CRS.from_proj4(f'+proj=aeqd +lat_0={CENTER[1]} +lon_0={CENTER[0]} +datum=WGS84 +units=m +no_defs')
    bounds=transform_bounds('EPSG:4326',crs,*BBOX,densify_pts=41)
    minx,miny,maxx,maxy=bounds
    height=max(64,int(round(WIDTH*(maxy-miny)/(maxx-minx))))
    transform=from_bounds(*bounds,WIDTH,height)
    return crs,bounds,transform,height

def mosaic(files):
    crs,bounds,transform,height=target_grid()
    dem=np.full((height,WIDTH),np.nan,dtype='float32')
    for i,f in enumerate(files,1):
        with rasterio.open(f) as src:
            tmp=np.full_like(dem,np.nan)
            reproject(rasterio.band(src,1),tmp,src_transform=src.transform,src_crs=src.crs,src_nodata=src.nodata,dst_transform=transform,dst_crs=crs,dst_nodata=np.nan,resampling=Resampling.bilinear,num_threads=2)
            valid=np.isfinite(tmp); empty=~np.isfinite(dem)
            dem[valid & empty]=tmp[valid & empty]
            both=valid & ~empty; dem[both]=(dem[both]+tmp[both])*0.5
        print(f'[mosaic {i}/{len(files)}] {f.name}')
    return dem,crs,bounds,transform

def derived(dem,bounds):
    land=np.isfinite(dem) & (dem>-100)
    dem=np.nan_to_num(dem,nan=0.0); dem=np.where(land,dem,0.0)
    minx,miny,maxx,maxy=bounds; h,w=dem.shape; px=(maxx-minx)/w; py=(maxy-miny)/h
    gy,gx=np.gradient(dem,py,px)
    slope_deg=np.degrees(np.arctan(np.hypot(gx,gy)))
    gxv=gx*VE; gyv=gy*VE
    slope=np.arctan(np.hypot(gxv,gyv)); aspect=np.arctan2(-gxv,gyv)
    az=math.radians(315); alt=math.radians(35)
    hs=np.sin(alt)*np.cos(slope)+np.cos(alt)*np.sin(slope)*np.cos(az-aspect)
    hs=np.clip((hs+1)*127.5,0,255).astype('uint8'); hs=np.where(land,hs,0).astype('uint8')
    slope8=np.clip(slope_deg/60*255,0,255).astype('uint8'); slope8=np.where(land,slope8,0).astype('uint8')
    nx=-gxv; ny=np.ones_like(gxv); nz=gyv; n=np.maximum(np.sqrt(nx*nx+ny*ny+nz*nz),1e-8)
    normal=np.stack([(nx/n*.5+.5)*255,(ny/n*.5+.5)*255,(nz/n*.5+.5)*255],axis=-1)
    normal=np.clip(normal,0,255).astype('uint8'); normal=np.where(land[...,None],normal,np.array([128,255,128],dtype='uint8'))
    elev=np.clip(dem/1800,0,1); sl=np.clip(slope_deg/45,0,1)
    low=np.array([68,86,67],float); high=np.array([115,108,91],float); rock=np.array([128,126,119],float); ocean=np.array([20,50,74],float)
    alb=low[None,None,:]*(1-elev[...,None])+high[None,None,:]*elev[...,None]
    alb=alb*(1-sl[...,None]*.25)+rock[None,None,:]*(sl[...,None]*.25)
    alb=np.where(land[...,None],alb,ocean).clip(0,255).astype('uint8')
    return dem,land,hs,slope8,normal,alb

def write_mesh(dem,land,bounds):
    h,w=dem.shape; mw=min(MESH_WIDTH,w); mh=max(8,int(round(mw*h/w)))
    d=zoom(dem,(mh/h,mw/w),order=1); lm=zoom(land.astype(float),(mh/h,mw/w),order=0)>.5
    minx,miny,maxx,maxy=bounds
    xs=np.linspace(minx,maxx,d.shape[1])/SCENE_M_PER_UNIT; zs=-np.linspace(maxy,miny,d.shape[0])/SCENE_M_PER_UNIT
    X,Z=np.meshgrid(xs,zs); Y=d*VE/SCENE_M_PER_UNIT
    verts=np.column_stack([X.ravel(),Y.ravel(),Z.ravel()]); faces=[]; rows,cols=d.shape
    for r in range(rows-1):
      for c in range(cols-1):
        if not (lm[r,c] or lm[r+1,c] or lm[r,c+1] or lm[r+1,c+1]): continue
        a=r*cols+c; b=a+1; d0=(r+1)*cols+c; e=d0+1
        faces.append((a,d0,b)); faces.append((b,d0,e))
    mesh=trimesh.Trimesh(vertices=verts,faces=np.asarray(faces,dtype=np.int64),process=False); mesh.remove_unreferenced_vertices(); mesh.export(OUT/'terrain_lod.glb')
    return {'mesh_width':cols,'mesh_height':rows,'vertices':len(mesh.vertices),'triangles':len(mesh.faces)}

def main():
    files=download_tiles(); dem,crs,bounds,transform=mosaic(files); dem,land,hs,slope8,normal,alb=derived(dem,bounds)
    profile=dict(driver='GTiff',width=dem.shape[1],height=dem.shape[0],count=1,dtype='float32',crs=crs,transform=transform,nodata=-9999.0,compress='DEFLATE',tiled=True)
    with rasterio.open(OUT/'dem_scene_float32.tif','w',**profile) as ds: ds.write(np.where(land,dem,-9999).astype('float32'),1)
    Image.fromarray(np.where(land,np.clip(np.maximum(dem,0)/HEIGHT_CEILING*65535,0,65535),0).astype('uint16'),mode='I;16').save(OUT/'height_u16.png',optimize=True)
    Image.fromarray(hs,'L').save(OUT/'hillshade.png',optimize=True); Image.fromarray(slope8,'L').save(OUT/'slope.png',optimize=True)
    Image.fromarray(normal,'RGB').save(OUT/'normal.png',optimize=True); Image.fromarray(alb,'RGB').save(OUT/'albedo.png',optimize=True); Image.fromarray((land*255).astype('uint8'),'L').save(OUT/'land_mask.png',optimize=True)
    mesh=write_mesh(dem,land,bounds)
    h=ImageEnhance.Contrast(Image.fromarray(hs,'L')).enhance(.8); h=Image.blend(Image.new('L',h.size,220),h,.55); shade=Image.merge('RGB',(h,h,h)); preview=ImageChops.multiply(Image.fromarray(alb,'RGB'),shade); preview.thumbnail((1800,1800),Image.Resampling.LANCZOS); preview.save(OUT/'terrain_qa_preview.png')
    meta={'schema_version':1,'asset':'South Korea Hero Terrain v0.1','source':'Copernicus DEM GLO-30 Public','bbox_wgs84':BBOX,'local_crs_proj4':crs.to_proj4(),'local_bounds_m':list(map(float,bounds)),'raster_size':[dem.shape[1],dem.shape[0]],'vertical_exaggeration':VE,'scene_m_per_unit':SCENE_M_PER_UNIT,'coastline_clip':'PENDING_VERIFIED_SVG_WGS84_GEOREFERENCE','mesh':mesh,'elevation_stats_m':{'min':float(dem[land].min()),'max':float(dem[land].max()),'mean':float(dem[land].mean())}}
    (OUT/'terrain_metadata.json').write_text(json.dumps(meta,indent=2),encoding='utf-8')
    files_meta={}
    for f in sorted(OUT.iterdir()):
      if f.is_file(): files_meta[f.name]={'bytes':f.stat().st_size,'sha256':hashlib.sha256(f.read_bytes()).hexdigest()}
    prov={'built_at_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'note':'Actual GLO-30 DEM build; final authoritative coastline clip is intentionally deferred until verified SVG↔WGS84 georeferencing.','files':files_meta}
    (OUT/'BUILD_PROVENANCE.json').write_text(json.dumps(prov,indent=2),encoding='utf-8')
    print(json.dumps(meta,indent=2)); print('built',OUT)
if __name__=='__main__': main()
