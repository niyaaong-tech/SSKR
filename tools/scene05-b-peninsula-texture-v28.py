#!/usr/bin/env python3
from __future__ import annotations

import io
import json
import math
import re
from pathlib import Path

import cairosvg
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter
from pyproj import CRS, Transformer

ROOT=Path.cwd()
SVG=ROOT/'assets'/'vector'/'korean_peninsula_precise.svg'
TERRAIN=ROOT/'assets'/'scene05'/'south_korea_hero_v0.2'
OUT=ROOT/'output'/'scene05_final_v1'
TEX_W=1792
GRID_COLS=29
GRID_ROWS=55


def smoothstep(a,b,x):
    t=np.clip((x-a)/max(b-a,1e-9),0.0,1.0)
    return t*t*(3.0-2.0*t)


def parse_svg_size(text):
    m=re.search(r'viewBox="\s*0\s+0\s+([0-9.]+)\s+([0-9.]+)"',text)
    if not m:raise SystemExit('canonical SVG viewBox not found')
    return int(round(float(m.group(1)))),int(round(float(m.group(2))))


def apply_affine(m,x,y):
    return m[0,0]*x+m[0,1]*y+m[0,2],m[1,0]*x+m[1,1]*y+m[1,2]


def procedural_context(u,v):
    # Restrained, low-detail context outside the real DEM art footprint. Keep it
    # visually continuous with South Korea rather than an obvious flat/black block.
    a=np.sin((u*5.2+v*1.3)*math.pi+.35)
    b=np.sin((u*10.4-v*4.0)*math.pi+1.15)
    c=np.cos((u*18.0+v*8.6)*math.pi+.65)
    d=np.sin((u*31.0-v*12.0)*math.pi+2.1)
    field=.50+.22*a+.14*b+.09*c+.05*d
    field=np.clip(field,0,1)
    gy,gx=np.gradient(field)
    shade=np.clip(.82+(-gx*.7-gy*1.0)*3.4,.58,1.15)
    low=np.array([101.,116.,72.],dtype=np.float32)
    high=np.array([57.,82.,51.],dtype=np.float32)
    stone=np.array([121.,117.,96.],dtype=np.float32)
    mountain=smoothstep(.42,.78,field)[...,None]
    ridge=smoothstep(.68,.91,field)[...,None]
    rgb=low[None,None,:]*(1-mountain)+high[None,None,:]*mountain
    rgb=rgb*(1-ridge*.18)+stone[None,None,:]*(ridge*.18)
    return rgb*shade[...,None]


def compute_relief(height,meta):
    h,w=height.shape
    minx,miny,maxx,maxy=meta['local_bounds_m']
    dx=(maxx-minx)/max(w-1,1);dy=(maxy-miny)/max(h-1,1)
    gy,gx=np.gradient(height,dy,dx)
    ve=float(meta['vertical_exaggeration'])
    nx=-gx*ve; ny=np.ones_like(nx); nz=-gy*ve
    n=np.maximum(np.sqrt(nx*nx+ny*ny+nz*nz),1e-9)
    nx/=n;ny/=n;nz/=n
    # Two soft sun directions + ambient lift. This behaves like baked aerial relief,
    # not harsh GIS hillshade.
    s1=np.array([-.55,.72,-.42],dtype=np.float32);s1/=np.linalg.norm(s1)
    s2=np.array([.42,.82,.38],dtype=np.float32);s2/=np.linalg.norm(s2)
    d1=np.clip(nx*s1[0]+ny*s1[1]+nz*s1[2],0,1)
    d2=np.clip(nx*s2[0]+ny*s2[1]+nz*s2[2],0,1)
    shade=np.clip(.54+.68*np.power(d1,.78)+.16*np.power(d2,.9),.54,1.28)
    return shade


def main():
    OUT.mkdir(parents=True,exist_ok=True)
    svg_text=SVG.read_text('utf-8')
    svg_w,svg_h=parse_svg_size(svg_text)
    tex_h=int(round(TEX_W*svg_h/svg_w))
    raw=cairosvg.svg2png(bytestring=svg_text.encode(),output_width=TEX_W,output_height=tex_h)
    svg_rgba=np.asarray(Image.open(io.BytesIO(raw)).convert('RGBA'))
    land=svg_rgba[...,3]>8

    georef=json.loads((TERRAIN/'svg_georef.json').read_text('utf-8'))
    meta=json.loads((TERRAIN/'terrain_metadata.json').read_text('utf-8'))
    mat=np.asarray(georef['svg_px_to_epsg3857_matrix'],dtype=np.float64)
    tf=Transformer.from_crs('EPSG:3857',CRS.from_proj4(meta['local_crs_proj4']),always_xy=True)

    xs=(np.arange(TEX_W,dtype=np.float64)+.5)/TEX_W*svg_w
    ys=(np.arange(tex_h,dtype=np.float64)+.5)/tex_h*svg_h
    gx,gy=np.meshgrid(xs,ys)
    mx,my=apply_affine(mat,gx,gy)
    lx,ly=tf.transform(mx,my)
    u=gx/svg_w;v=gy/svg_h

    context=procedural_context(u,v)

    albedo_img=Image.open(TERRAIN/'albedo.png').convert('RGB')
    albedo=np.asarray(albedo_img,dtype=np.float32)
    # Remove broad satellite / source illumination and preserve only material variation.
    blur=np.asarray(albedo_img.filter(ImageFilter.GaussianBlur(12.0)),dtype=np.float32)
    detail=np.clip((albedo+12.0)/(blur+12.0),.78,1.24)
    slope=np.asarray(Image.open(TERRAIN/'slope.png').convert('L'),dtype=np.float32)/255.0
    h16=np.asarray(Image.open(TERRAIN/'height_u16.png'),dtype=np.float32)
    precise=np.asarray(Image.open(TERRAIN/'land_mask_precise_svg.png').convert('L'))>127
    max_elev=float(meta['mesh']['max_elevation_m'])
    height=h16/65535.0*max_elev
    relief=compute_relief(height,meta)

    src_h,src_w=height.shape
    minx,miny,maxx,maxy=meta['local_bounds_m']
    px=(lx-minx)/(maxx-minx)*(src_w-1)
    py=(maxy-ly)/(maxy-miny)*(src_h-1)
    inside=(px>=0)&(px<=src_w-1)&(py>=0)&(py<=src_h-1)
    xi=np.clip(np.rint(px).astype(np.int32),0,src_w-1)
    yi=np.clip(np.rint(py).astype(np.int32),0,src_h-1)
    src_land=precise[yi,xi]&inside&land

    elev=np.clip(height[yi,xi]/max(max_elev,1),0,1)
    sl=slope[yi,xi]
    sh=relief[yi,xi]
    det=detail[yi,xi]

    plain=1.0-smoothstep(.08,.30,elev)
    mountain=smoothstep(.08,.46,elev)
    high=smoothstep(.38,.76,elev)
    steep=smoothstep(.18,.65,sl)
    rock=np.clip(high*steep,0,1)[...,None]

    low=np.array([121.,132.,78.],dtype=np.float32)
    mid=np.array([61.,95.,54.],dtype=np.float32)
    deep=np.array([39.,69.,43.],dtype=np.float32)
    stone=np.array([132.,126.,104.],dtype=np.float32)
    south=low[None,None,:]*(1-mountain[...,None])+mid[None,None,:]*mountain[...,None]
    south=south*(1-high[...,None]*.34)+deep[None,None,:]*(high[...,None]*.34)
    south=south*(1-rock*.48)+stone[None,None,:]*(rock*.48)
    # Real source texture variation is subtle; actual DEM relief carries form.
    south*=np.clip(.90+det*.12,.91,1.09)
    south*=sh[...,None]
    south*=np.clip(.98+plain[...,None]*.045,.96,1.05)

    # No hard DMZ seam: phase real South relief in gradually across a broad overlap.
    south_weight=src_land.astype(np.float32)*smoothstep(.405,.515,v)
    rgb=context*(1-south_weight[...,None])+south*south_weight[...,None]

    # Fine coast rim to separate land from deep water without map-like outlines.
    mask=Image.fromarray((land.astype(np.uint8)*255),'L')
    inner_blur=np.asarray(mask.filter(ImageFilter.GaussianBlur(1.25)),dtype=np.float32)/255.0
    wide_blur=np.asarray(mask.filter(ImageFilter.GaussianBlur(4.5)),dtype=np.float32)/255.0
    rim=np.clip(1-inner_blur,0,1)*land
    shelf=np.clip(inner_blur-wide_blur,0,1)*land
    rgb+=rim[...,None]*np.array([31.,29.,16.],dtype=np.float32)
    rgb*=1-shelf[...,None]*.045

    rgba=np.zeros((tex_h,TEX_W,4),dtype=np.uint8)
    rgba[...,:3]=np.clip(rgb,0,255).astype(np.uint8)
    rgba[...,3]=land.astype(np.uint8)*255
    im=Image.fromarray(rgba,'RGBA')
    im=ImageEnhance.Color(im).enhance(1.14)
    im=ImageEnhance.Contrast(im).enhance(1.06)
    im=ImageEnhance.Brightness(im).enhance(1.12)
    im.save(OUT/'peninsula_surface_v28.png',optimize=True)

    scene_m=float(meta['scene_m_per_unit'])
    grid=[]
    for row in range(GRID_ROWS):
        sy=svg_h*row/(GRID_ROWS-1)
        for col in range(GRID_COLS):
            sx=svg_w*col/(GRID_COLS-1)
            emx=mat[0,0]*sx+mat[0,1]*sy+mat[0,2]
            emy=mat[1,0]*sx+mat[1,1]*sy+mat[1,2]
            qx,qy=tf.transform(emx,emy)
            grid.append([float(qx/scene_m),-0.018,float(-qy/scene_m)])
    m={'schema_version':'2.8','texture':'peninsula_surface_v28.png','texture_size':[TEX_W,tex_h],
       'source_svg':str(SVG.relative_to(ROOT)),'svg_viewbox':[0,0,svg_w,svg_h],
       'grid':{'cols':GRID_COLS,'rows':GRID_ROWS,'positions':grid},'scene_m_per_unit':scene_m,
       'policy':['Canonical SVG alpha is the land authority.','South Korea visual relief is actual DEM-derived.','Northern context is intentionally low-detail and smoothly blended; it is not asserted as topographic data.','Texture is cinematic aerial art, not land-cover/navigation output.']}
    (OUT/'peninsula_surface_v28.json').write_text(json.dumps(m,ensure_ascii=False,indent=2),encoding='utf-8')
    qa={'texture_size':[TEX_W,tex_h],'land_pixels':int(land.sum()),'real_south_pixels':int(src_land.sum()),'alpha_authority':'canonical_svg_only','grid_vertices':GRID_COLS*GRID_ROWS,'dmz_transition':'soft'}
    (OUT/'peninsula_surface_v28_qa.json').write_text(json.dumps(qa,indent=2),encoding='utf-8')
    print(json.dumps(qa,indent=2))

if __name__=='__main__':main()
