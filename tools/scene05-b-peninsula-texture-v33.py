#!/usr/bin/env python3
from __future__ import annotations

import io,json,math,re
from pathlib import Path
import cairosvg,numpy as np
from PIL import Image,ImageEnhance,ImageFilter
from pyproj import CRS,Transformer

ROOT=Path.cwd();SVG=ROOT/'assets/vector/korean_peninsula_precise.svg';TERRAIN=ROOT/'assets/scene05/south_korea_hero_v0.2';WC=ROOT/'assets/scene05/worldcover_v1/worldcover_peninsula_v1.png';WC_META=ROOT/'assets/scene05/worldcover_v1/worldcover_local_v1.json';OUT=ROOT/'output/scene05_final_v1';W=1792;COLS=29;ROWS=55

def ss(a,b,x):t=np.clip((x-a)/max(b-a,1e-9),0,1);return t*t*(3-2*t)
def svgsize(txt):m=re.search(r'viewBox="\s*0\s+0\s+([0-9.]+)\s+([0-9.]+)"',txt);return float(m.group(1)),float(m.group(2))
def affine(m,x,y):return m[0,0]*x+m[0,1]*y+m[0,2],m[1,0]*x+m[1,1]*y+m[1,2]
def dem_relief(height,meta):
 h,w=height.shape;minx,miny,maxx,maxy=meta['local_bounds_m'];dx=(maxx-minx)/max(w-1,1);dy=(maxy-miny)/max(h-1,1);gy,gx=np.gradient(height,dy,dx);ve=float(meta['vertical_exaggeration']);nx=-gx*ve;ny=np.ones_like(nx);nz=-gy*ve;n=np.maximum(np.sqrt(nx*nx+ny*ny+nz*nz),1e-9);nx/=n;ny/=n;nz/=n;s1=np.array([-.58,.70,-.41]);s1/=np.linalg.norm(s1);s2=np.array([.36,.84,.40]);s2/=np.linalg.norm(s2);d1=np.clip(nx*s1[0]+ny*s1[1]+nz*s1[2],0,1);d2=np.clip(nx*s2[0]+ny*s2[1]+nz*s2[2],0,1);return np.clip(.47+.76*np.power(d1,.78)+.13*np.power(d2,.9),.49,1.28)
def contextual_shade(H,W,u,v):
 rng=np.random.default_rng(3305);a=Image.fromarray(rng.integers(0,256,(72,42),dtype=np.uint8)).resize((W,H),Image.Resampling.BICUBIC).filter(ImageFilter.GaussianBlur(20));b=Image.fromarray(rng.integers(0,256,(180,100),dtype=np.uint8)).resize((W,H),Image.Resampling.BICUBIC).filter(ImageFilter.GaussianBlur(8));n1=np.asarray(a,np.float32)/255.;n2=np.asarray(b,np.float32)/255.;topo=np.clip(.50+(n1-.5)*.95+(n2-.5)*.28,0,1);gy,gx=np.gradient(topo);return np.clip(.82+(-gx*.70-gy*.92)*5.0,.62,1.14)
def palette(wc):
 out=np.empty(wc.shape+(3,),dtype=np.float32);out[:]=[86,98,62]
 colors={10:(42,72,42),20:(78,91,56),30:(91,109,65),40:(126,124,75),50:(114,108,98),60:(131,119,94),70:(165,171,162),80:(57,86,91),90:(72,99,75),95:(50,82,59),100:(89,104,70)}
 for k,c in colors.items():out[wc==k]=c
 return out

def main():
 if not WC.exists():raise SystemExit('ESA WorldCover peninsula source missing')
 OUT.mkdir(parents=True,exist_ok=True);txt=SVG.read_text('utf-8');sw,sh=svgsize(txt);H=round(W*sh/sw);raw=cairosvg.svg2png(bytestring=txt.encode(),output_width=W,output_height=H);svg=np.asarray(Image.open(io.BytesIO(raw)).convert('RGBA'));land=svg[...,3]>8
 wc_img=Image.open(WC).convert('L')
 if wc_img.size!=(W,H):wc_img=wc_img.resize((W,H),Image.Resampling.NEAREST)
 wc=np.asarray(wc_img,dtype=np.uint8);classrgb=palette(wc)
 # Real land-cover data now sets the entire peninsula's material family. A restrained
 # low-frequency light field supplies depth north of the available DEM, without fake bands.
 xs=(np.arange(W)+.5)/W*sw;ys=(np.arange(H)+.5)/H*sh;gx,gy=np.meshgrid(xs,ys);u=gx/sw;v=gy/sh;shade_context=contextual_shade(H,W,u,v);rgb=classrgb*shade_context[...,None]
 # Actual GLO-30 relief and source albedo are applied wherever the v0.2 DEM raster exists,
 # which includes all of South Korea and the lower northern peninsula.
 g=json.loads((TERRAIN/'svg_georef.json').read_text());meta=json.loads((TERRAIN/'terrain_metadata.json').read_text());M=np.asarray(g['svg_px_to_epsg3857_matrix']);tf=Transformer.from_crs('EPSG:3857',CRS.from_proj4(meta['local_crs_proj4']),always_xy=True);mx,my=affine(M,gx,gy);lx,ly=tf.transform(mx,my)
 alb_img=Image.open(TERRAIN/'albedo.png').convert('RGB');alb=np.asarray(alb_img,np.float32);blur=np.asarray(alb_img.filter(ImageFilter.GaussianBlur(11)),np.float32);detail=np.clip((alb+14)/(blur+14),.80,1.20);h16=np.asarray(Image.open(TERRAIN/'height_u16.png'),np.float32);maxe=float(meta['mesh']['max_elevation_m']);height=h16/65535.*maxe;rel=dem_relief(height,meta);rw,rh=meta['raster_size'];minx,miny,maxx,maxy=meta['local_bounds_m'];px=(lx-minx)/(maxx-minx)*(rw-1);py=(maxy-ly)/(maxy-miny)*(rh-1);inside=(px>=0)&(px<=rw-1)&(py>=0)&(py<=rh-1)&land;xi=np.clip(np.rint(px).astype(int),0,rw-1);yi=np.clip(np.rint(py).astype(int),0,rh-1)
 elev=np.clip(height[yi,xi]/maxe,0,1);shd=rel[yi,xi];det=detail[yi,xi];mount=ss(.07,.47,elev)[...,None];high=ss(.36,.78,elev)[...,None];elevpal=np.array([105,115,71],np.float32)*(1-mount)+np.array([47,77,45],np.float32)*mount;elevpal=elevpal*(1-high*.32)+np.array([106,104,86],np.float32)*high
 # WorldCover remains the dominant color information; DEM controls physical form.
 physical=(classrgb*.64+elevpal*.36)*np.clip(.95+det*.06,.94,1.06)*shd[...,None]
 # Smooth edge of DEM availability to avoid a horizontal North/South material seam.
 dem_weight=inside.astype(np.float32)*ss(.34,.48,v)
 rgb=rgb*(1-dem_weight[...,None])+physical*dem_weight[...,None]
 # Keep actual built-up/cropland differentiation visible but not map-palette loud.
 rgb[wc==50]=rgb[wc==50]*.72+np.array([120,115,106],np.float32)*.28
 rgb[wc==40]=rgb[wc==40]*.84+np.array([138,130,82],np.float32)*.16
 # Canonical coast rim: physical separation from ocean, not an outline stroke.
 mask=Image.fromarray(land.astype(np.uint8)*255,'L');ib=np.asarray(mask.filter(ImageFilter.GaussianBlur(1.3)),np.float32)/255.;wb=np.asarray(mask.filter(ImageFilter.GaussianBlur(4.7)),np.float32)/255.;rim=np.clip(1-ib,0,1)*land;shelf=np.clip(ib-wb,0,1)*land;rgb+=rim[...,None]*np.array([29,28,17],np.float32);rgb*=1-shelf[...,None]*.045
 rgba=np.zeros((H,W,4),dtype=np.uint8);rgba[...,:3]=np.clip(rgb,0,255).astype(np.uint8);rgba[...,3]=land.astype(np.uint8)*255;im=Image.fromarray(rgba,'RGBA');im=ImageEnhance.Color(im).enhance(1.10);im=ImageEnhance.Contrast(im).enhance(1.09);im=ImageEnhance.Brightness(im).enhance(1.06);im.save(OUT/'peninsula_surface_v33.png',optimize=True)
 scene=float(meta['scene_m_per_unit']);grid=[]
 for r in range(ROWS):
  sy=sh*r/(ROWS-1)
  for c in range(COLS):
   sx=sw*c/(COLS-1);emx=M[0,0]*sx+M[0,1]*sy+M[0,2];emy=M[1,0]*sx+M[1,1]*sy+M[1,2];qx,qy=tf.transform(emx,emy);grid.append([float(qx/scene),-.018,float(-qy/scene)])
 wcmd=json.loads(WC_META.read_text());md={'schema_version':'3.3','texture':'peninsula_surface_v33.png','texture_size':[W,H],'source_svg':str(SVG.relative_to(ROOT)),'worldcover_source':str(WC.relative_to(ROOT)),'worldcover_attribution':wcmd['attribution'],'worldcover_license':wcmd['license'],'svg_viewbox':[0,0,sw,sh],'grid':{'cols':COLS,'rows':ROWS,'positions':grid},'scene_m_per_unit':scene,'policy':['Canonical SVG alpha authority.','ESA WorldCover 2021 controls land-cover material distribution across the full peninsula.','Copernicus GLO-30 controls real relief where the Scene05 DEM exists.','Not a navigation or land-cover analysis product.']};(OUT/'peninsula_surface_v33.json').write_text(json.dumps(md,ensure_ascii=False,indent=2));(OUT/'peninsula_surface_v33_qa.json').write_text(json.dumps({'land_pixels':int(land.sum()),'worldcover_land_pixels':int(((wc>0)&land).sum()),'dem_shaded_land_pixels':int(inside.sum()),'classes':{str(int(x)):int(((wc==x)&land).sum()) for x in np.unique(wc)}},indent=2));print(json.dumps({'worldcover_land_pixels':int(((wc>0)&land).sum()),'dem_pixels':int(inside.sum()),'texture':[W,H]},indent=2))
if __name__=='__main__':main()
