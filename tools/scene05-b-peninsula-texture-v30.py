#!/usr/bin/env python3
from __future__ import annotations
import io,json,math,re
from pathlib import Path
import cairosvg,numpy as np
from PIL import Image,ImageEnhance,ImageFilter
from pyproj import CRS,Transformer
ROOT=Path.cwd();SVG=ROOT/'assets/vector/korean_peninsula_precise.svg';TERRAIN=ROOT/'assets/scene05/south_korea_hero_v0.2';OUT=ROOT/'output/scene05_final_v1';W=1792;COLS=29;ROWS=55

def ss(a,b,x):t=np.clip((x-a)/max(b-a,1e-9),0,1);return t*t*(3-2*t)
def svgsize(txt):m=re.search(r'viewBox="\s*0\s+0\s+([0-9.]+)\s+([0-9.]+)"',txt);return float(m.group(1)),float(m.group(2))
def affine(m,x,y):return m[0,0]*x+m[0,1]*y+m[0,2],m[1,0]*x+m[1,1]*y+m[1,2]
def relief(height,meta):
 h,w=height.shape;minx,miny,maxx,maxy=meta['local_bounds_m'];dx=(maxx-minx)/max(w-1,1);dy=(maxy-miny)/max(h-1,1);gy,gx=np.gradient(height,dy,dx);ve=float(meta['vertical_exaggeration']);nx=-gx*ve;ny=np.ones_like(nx);nz=-gy*ve;n=np.maximum(np.sqrt(nx*nx+ny*ny+nz*nz),1e-9);nx/=n;ny/=n;nz/=n;s=np.array([-.58,.70,-.41]);s/=np.linalg.norm(s);d=np.clip(nx*s[0]+ny*s[1]+nz*s[2],0,1);return np.clip(.48+.82*np.power(d,.78),.48,1.30)
def natural_context(H,W,u,v):
 rng=np.random.default_rng(2608)
 a=Image.fromarray(rng.integers(0,256,(80,44),dtype=np.uint8)).resize((W,H),Image.Resampling.BICUBIC).filter(ImageFilter.GaussianBlur(18))
 b=Image.fromarray(rng.integers(0,256,(190,96),dtype=np.uint8)).resize((W,H),Image.Resampling.BICUBIC).filter(ImageFilter.GaussianBlur(7))
 n1=np.asarray(a,dtype=np.float32)/255.;n2=np.asarray(b,dtype=np.float32)/255.
 topo=np.clip(.50+(n1-.5)*1.05+(n2-.5)*.32,0,1)
 # Broad east-highland cue, deliberately low detail because North is only context.
 east=ss(.56,.92,u)*(1-ss(.02,.18,v))*.18+ss(.64,.94,u)*.15
 topo=np.clip(topo+east,0,1);gy,gx=np.gradient(topo);shade=np.clip(.80+(-gx*.68-gy*.90)*5.2,.60,1.16)
 low=np.array([101.,113.,68.],np.float32);high=np.array([52.,78.,47.],np.float32);stone=np.array([117.,112.,91.],np.float32);m=ss(.40,.76,topo)[...,None];r=ss(.68,.92,topo)[...,None];rgb=low*(1-m)+high*m;rgb=rgb*(1-r*.16)+stone*r*.16;return rgb*shade[...,None]
def main():
 OUT.mkdir(parents=True,exist_ok=True);txt=SVG.read_text('utf-8');sw,sh=svgsize(txt);H=round(W*sh/sw);raw=cairosvg.svg2png(bytestring=txt.encode(),output_width=W,output_height=H);rgba=np.asarray(Image.open(io.BytesIO(raw)).convert('RGBA'));land=rgba[...,3]>8
 g=json.loads((TERRAIN/'svg_georef.json').read_text());meta=json.loads((TERRAIN/'terrain_metadata.json').read_text());M=np.asarray(g['svg_px_to_epsg3857_matrix']);tf=Transformer.from_crs('EPSG:3857',CRS.from_proj4(meta['local_crs_proj4']),always_xy=True)
 xs=(np.arange(W)+.5)/W*sw;ys=(np.arange(H)+.5)/H*sh;gx,gy=np.meshgrid(xs,ys);mx,my=affine(M,gx,gy);lx,ly=tf.transform(mx,my);u=gx/sw;v=gy/sh
 context=natural_context(H,W,u,v)
 alb_img=Image.open(TERRAIN/'albedo.png').convert('RGB');alb=np.asarray(alb_img,dtype=np.float32);blur=np.asarray(alb_img.filter(ImageFilter.GaussianBlur(11)),dtype=np.float32);detail=np.clip((alb+14)/(blur+14),.80,1.20)
 slope=np.asarray(Image.open(TERRAIN/'slope.png').convert('L'),dtype=np.float32)/255.;h16=np.asarray(Image.open(TERRAIN/'height_u16.png'),dtype=np.float32);mask=np.asarray(Image.open(TERRAIN/'land_mask_precise_svg.png').convert('L'))>127;maxe=float(meta['mesh']['max_elevation_m']);height=h16/65535.*maxe;shade=relief(height,meta)
 minx,miny,maxx,maxy=meta['local_bounds_m'];rw,rh=meta['raster_size'];px=(lx-minx)/(maxx-minx)*(rw-1);py=(maxy-ly)/(maxy-miny)*(rh-1);inside=(px>=0)&(px<=rw-1)&(py>=0)&(py<=rh-1);xi=np.clip(np.rint(px).astype(int),0,rw-1);yi=np.clip(np.rint(py).astype(int),0,rh-1);real=mask[yi,xi]&inside&land
 elev=np.clip(height[yi,xi]/maxe,0,1);sl=slope[yi,xi];shd=shade[yi,xi];det=detail[yi,xi]
 mountain=ss(.06,.43,elev);high=ss(.34,.74,elev);rock=(ss(.18,.66,sl)*ss(.38,.78,elev))[...,None]
 low=np.array([106.,116.,69.],np.float32);mid=np.array([48.,82.,48.],np.float32);deep=np.array([30.,60.,38.],np.float32);stone=np.array([128.,120.,98.],np.float32)
 south=low*(1-mountain[...,None])+mid*mountain[...,None];south=south*(1-high[...,None]*.46)+deep*(high[...,None]*.46);south=south*(1-rock*.42)+stone*rock*.42;south*=np.clip(.94+det*.07,.93,1.07);south*=shd[...,None]
 mix=real.astype(np.float32)*ss(.40,.535,v);rgb=context*(1-mix[...,None])+south*mix[...,None]
 msk=Image.fromarray(land.astype(np.uint8)*255,'L');ib=np.asarray(msk.filter(ImageFilter.GaussianBlur(1.25)),dtype=np.float32)/255.;wb=np.asarray(msk.filter(ImageFilter.GaussianBlur(4.5)),dtype=np.float32)/255.;rim=np.clip(1-ib,0,1)*land;shelf=np.clip(ib-wb,0,1)*land;rgb+=rim[...,None]*np.array([28.,27.,16.]);rgb*=1-shelf[...,None]*.045
 out=np.zeros((H,W,4),dtype=np.uint8);out[...,:3]=np.clip(rgb,0,255).astype(np.uint8);out[...,3]=land.astype(np.uint8)*255;im=Image.fromarray(out,'RGBA');im=ImageEnhance.Color(im).enhance(1.16);im=ImageEnhance.Contrast(im).enhance(1.10);im=ImageEnhance.Brightness(im).enhance(1.04);im.save(OUT/'peninsula_surface_v30.png',optimize=True)
 scene=float(meta['scene_m_per_unit']);grid=[]
 for r in range(ROWS):
  sy=sh*r/(ROWS-1)
  for c in range(COLS):
   sx=sw*c/(COLS-1);emx=M[0,0]*sx+M[0,1]*sy+M[0,2];emy=M[1,0]*sx+M[1,1]*sy+M[1,2];qx,qy=tf.transform(emx,emy);grid.append([float(qx/scene),-.018,float(-qy/scene)])
 md={'schema_version':'3.0','texture':'peninsula_surface_v30.png','texture_size':[W,H],'source_svg':str(SVG.relative_to(ROOT)),'svg_viewbox':[0,0,sw,sh],'grid':{'cols':COLS,'rows':ROWS,'positions':grid},'scene_m_per_unit':scene,'policy':['Canonical SVG alpha authority.','South Korea relief is actual DEM-derived.','North is subdued non-topographic context with stochastic texture, not synthetic ridge bands.']};(OUT/'peninsula_surface_v30.json').write_text(json.dumps(md,ensure_ascii=False,indent=2));(OUT/'peninsula_surface_v30_qa.json').write_text(json.dumps({'land_pixels':int(land.sum()),'real_south_pixels':int(real.sum()),'north_pattern':'stochastic_low_detail','dmz_transition':'soft'},indent=2));print('v30 texture',W,H)
if __name__=='__main__':main()
