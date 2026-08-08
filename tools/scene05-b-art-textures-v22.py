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
    low=smoothstep(.02,.28,elev)
    high=smoothstep(.40,.84,elev)
    steep=smoothstep(.25,.75,slope)
    plain=(1.0-smoothstep(.08,.34,elev))*(1.0-smoothstep(.12,.46,slope))
    rock=np.clip(steep*(.34+.66*high),0,1)

    forest=np.array([61,84,57],dtype=np.float32)
    mountain=np.array([52,72,51],dtype=np.float32)
    farmland=np.array([108,115,81],dtype=np.float32)
    stone=np.array([132,126,114],dtype=np.float32)

    procedural=forest[None,None,:]*(1-low[...,None])+mountain[None,None,:]*low[...,None]
    procedural=procedural*(1-plain[...,None]*.38)+farmland[None,None,:]*(plain[...,None]*.38)
    procedural=procedural*(1-rock[...,None]*.50)+stone[None,None,:]*(rock[...,None]*.50)

    # Preserve real source surface variation strongly enough to avoid a painted-map look.
    # The procedural layer only organizes the palette by terrain form.
    base=albedo*.56+procedural*.44
    lum=(albedo[...,0]*.2126+albedo[...,1]*.7152+albedo[...,2]*.0722)/255.0
    variation=np.clip(.94+(lum-.5)*.14,.88,1.06)
    base*=variation[...,None]

    base*=np.stack([1-.025*high,1-.010*high,1+.018*high],axis=-1)
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
    shade=ambient+(1-ambient)*np.power(dot,.76)
    color=base*(.46+1.00*shade[...,None])*np.asarray(tint,dtype=np.float32)
    color[~land]=np.array([18,47,67],dtype=np.float32)
    img=Image.fromarray(np.clip(color,0,255).astype(np.uint8),'RGB')
    img=ImageEnhance.Contrast(img).enhance(contrast)
    img=ImageEnhance.Color(img).enhance(saturation)
    img=ImageEnhance.Brightness(img).enhance(brightness)
    img=img.filter(ImageFilter.GaussianBlur(.06))
    img.save(OUT/name,quality=95)


def coast_map(land):
    mask=Image.fromarray((land.astype(np.uint8)*255),'L')
    near=np.asarray(mask.filter(ImageFilter.GaussianBlur(11)),dtype=np.float32)/255.0
    far=np.asarray(mask.filter(ImageFilter.GaussianBlur(35)),dtype=np.float32)/255.0
    water=(~land).astype(np.float32)
    band=np.clip((near*.72+far*.30)*water,0,1)
    band=np.power(band,.70)
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

    phase(base,nrm,land,(.98,.20,-.06),.18,(.72,.84,.95),'terrain_dawn_final.png',1.13,1.02,.95)
    phase(base,nrm,land,(.34,.93,-.20),.39,(1.03,1.035,1.00),'terrain_day_final.png',1.13,1.05,.99)
    phase(base,nrm,land,(-.98,.18,.08),.15,(1.14,.89,.74),'terrain_sunset_final.png',1.14,1.05,.95)
    coast_map(land)

    report={
      'schema_version':'2.3',
      'policy':'Scene 05 B naturalized terrain material pass. Geometry/coastline remain authoritative; source albedo is preserved as the majority surface signal, with restrained terrain-driven palette organization from elevation/slope. This is art direction, not land-cover classification.',
      'outputs':['terrain_dawn_final.png','terrain_day_final.png','terrain_sunset_final.png','coast_shallow.png']
    }
    (OUT/'scene05_b_art_texture_metadata.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(report,ensure_ascii=False,indent=2))

if __name__=='__main__':
    main()
