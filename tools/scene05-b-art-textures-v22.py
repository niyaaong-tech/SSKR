#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageEnhance, ImageFilter

ROOT=Path.cwd()
SRC=ROOT/'assets'/'scene05'/'south_korea_hero_v0.2'
OUT=ROOT/'output'/'scene05_final_v1'


def smoothstep(a,b,x):
    t=np.clip((x-a)/max(b-a,1e-6),0.0,1.0)
    return t*t*(3.0-2.0*t)


def unit(v):
    a=np.asarray(v,dtype=np.float32)
    return a/max(float(np.linalg.norm(a)),1e-8)


def material_base(height,slope,albedo,land):
    elev=height/max(float(height.max()),1.0)
    low=smoothstep(.02,.25,elev)
    high=smoothstep(.38,.82,elev)
    steep=smoothstep(.22,.72,slope)
    plain=(1.0-smoothstep(.08,.32,elev))*(1.0-smoothstep(.10,.42,slope))
    rock=np.clip(steep*(.40+.60*high),0,1)

    forest=np.array([54,88,50],dtype=np.float32)
    mountain=np.array([45,72,46],dtype=np.float32)
    farmland=np.array([101,121,73],dtype=np.float32)
    stone=np.array([128,121,105],dtype=np.float32)

    base=forest[None,None,:]*(1-low[...,None])+mountain[None,None,:]*low[...,None]
    base=base*(1-plain[...,None]*.55)+farmland[None,None,:]*(plain[...,None]*.55)
    base=base*(1-rock[...,None]*.64)+stone[None,None,:]*(rock[...,None]*.64)

    # Reuse real/source albedo only as low-amplitude material variation; do not turn the scene into satellite imagery.
    lum=(albedo[...,0]*.2126+albedo[...,1]*.7152+albedo[...,2]*.0722)/255.0
    variation=np.clip(.86+(lum-.5)*.32, .76, 1.10)
    base*=variation[...,None]

    # Gentle elevation cooling keeps mountain masses distinct without fake snow.
    base*=np.stack([1-.04*high,1-.015*high,1+.025*high],axis=-1)
    base[~land]=np.array([18,47,67],dtype=np.float32)
    return np.clip(base,0,255)


def normals(height,meta):
    h,w=height.shape
    minx,miny,maxx,maxy=meta['local_bounds_m']
    px=(maxx-minx)/max(1,w-1)
    py=(maxy-miny)/max(1,h-1)
    gy,gx=np.gradient(height,py,px)
    ve=float(meta['vertical_exaggeration'])
    nx=-gx*ve; ny=np.ones_like(nx); nz=-gy*ve
    n=np.maximum(np.sqrt(nx*nx+ny*ny+nz*nz),1e-8)
    return np.stack([nx/n,ny/n,nz/n],axis=-1)


def phase(base,nrm,land,sun,ambient,tint,name,contrast,saturation,brightness):
    s=unit(sun)
    dot=np.clip(nrm[...,0]*s[0]+nrm[...,1]*s[1]+nrm[...,2]*s[2],0,1)
    # Filmic terrain light: retain ambient detail while giving ridgelines directional shape.
    shade=ambient+(1-ambient)*np.power(dot,.78)
    color=base*(.52+.92*shade[...,None])*np.asarray(tint,dtype=np.float32)
    color[~land]=np.array([18,47,67],dtype=np.float32)
    img=Image.fromarray(np.clip(color,0,255).astype(np.uint8),'RGB')
    img=ImageEnhance.Contrast(img).enhance(contrast)
    img=ImageEnhance.Color(img).enhance(saturation)
    img=ImageEnhance.Brightness(img).enhance(brightness)
    img=img.filter(ImageFilter.GaussianBlur(.08))
    img.save(OUT/name,quality=95)


def coast_map(land):
    # A soft coastal influence mask for the separate procedural ocean plane.
    # It is not bathymetry; it only gives the coast a readable shallow-water art band.
    mask=Image.fromarray((land.astype(np.uint8)*255),'L')
    near=np.asarray(mask.filter(ImageFilter.GaussianBlur(13)),dtype=np.float32)/255.0
    far=np.asarray(mask.filter(ImageFilter.GaussianBlur(42)),dtype=np.float32)/255.0
    water=(~land).astype(np.float32)
    band=np.clip((near*.78+far*.38)*water,0,1)
    band=np.power(band,.62)
    Image.fromarray((band*255).astype(np.uint8),'L').save(OUT/'coast_shallow.png')


def main():
    meta=json.loads((SRC/'terrain_metadata.json').read_text('utf-8'))
    h16=np.asarray(Image.open(SRC/'height_u16.png'),dtype=np.float32)
    land=np.asarray(Image.open(SRC/'land_mask_precise_svg.png').convert('L'))>127
    slope=np.asarray(Image.open(SRC/'slope.png').convert('L'),dtype=np.float32)/255.0
    albedo=np.asarray(Image.open(SRC/'albedo.png').convert('RGB'),dtype=np.float32)
    max_elev=float(meta['mesh']['max_elevation_m'])
    height=h16/65535.0*max_elev
    nrm=normals(height,meta)
    base=material_base(height,slope,albedo,land)

    phase(base,nrm,land,(.98,.20,-.06),.19,(.70,.83,.95),'terrain_dawn_final.png',1.12,1.06,.96)
    phase(base,nrm,land,(.34,.93,-.20),.40,(1.04,1.06,1.00),'terrain_day_final.png',1.12,1.15,1.00)
    phase(base,nrm,land,(-.98,.18,.08),.16,(1.17,.87,.70),'terrain_sunset_final.png',1.13,1.10,.96)
    coast_map(land)

    report={
      'schema_version':'2.2',
      'policy':'Scene 05 B art-directed terrain material pass. Geometry/coastline remain authoritative; forest/plain/rock separation is procedural from elevation/slope/source albedo variation and is not a land-cover claim.',
      'outputs':['terrain_dawn_final.png','terrain_day_final.png','terrain_sunset_final.png','coast_shallow.png']
    }
    (OUT/'scene05_b_art_texture_metadata.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(report,ensure_ascii=False,indent=2))

if __name__=='__main__':
    main()
