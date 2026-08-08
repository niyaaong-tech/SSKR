#!/usr/bin/env python3
from __future__ import annotations

import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageEnhance, ImageFilter
import trimesh

ROOT=Path.cwd()
SRC=ROOT/'assets'/'scene05'/'south_korea_hero_v0.2'
OUT=ROOT/'output'/'scene05_final_v1'
MESH_W=640


def load_rgb(name):
    return np.array(Image.open(SRC/name).convert('RGB'),dtype=np.float32)


def unit(v):
    v=np.asarray(v,dtype=np.float32)
    return v/max(float(np.linalg.norm(v)),1e-8)


def save_phase(name,base,normal_xyz,sun_vec,ambient,tint,land):
    s=unit(sun_vec)
    dot=np.clip(normal_xyz[...,0]*s[0]+normal_xyz[...,1]*s[1]+normal_xyz[...,2]*s[2],0,1)
    shade=ambient+(1-ambient)*dot
    color=np.clip(base*(.58+.82*shade[...,None])*np.asarray(tint,dtype=np.float32),0,255)
    color[~land]=np.array([18,47,67],dtype=np.float32)
    img=Image.fromarray(color.astype(np.uint8)).filter(ImageFilter.GaussianBlur(radius=.12))
    img=ImageEnhance.Contrast(img).enhance(1.045)
    img.save(OUT/name,quality=95)


def main():
    OUT.mkdir(parents=True,exist_ok=True)
    meta=json.loads((SRC/'terrain_metadata.json').read_text('utf-8'))
    h16=np.array(Image.open(SRC/'height_u16.png'),dtype=np.float32)
    land=np.array(Image.open(SRC/'land_mask_precise_svg.png').convert('L'))>127
    albedo=load_rgb('albedo.png')
    slope=np.array(Image.open(SRC/'slope.png').convert('L'),dtype=np.float32)/255.0

    rh,rw=h16.shape
    max_elev=float(meta['mesh']['max_elevation_m'])
    ve=float(meta['vertical_exaggeration'])
    elevation=h16/65535.0*max_elev
    minx,miny,maxx,maxy=meta['local_bounds_m']
    px=(maxx-minx)/max(1,rw-1)
    py=(maxy-miny)/max(1,rh-1)
    gy,gx=np.gradient(elevation,py,px)

    nx=-gx*ve
    ny=np.ones_like(nx)
    nz=-gy*ve
    nrm=np.maximum(np.sqrt(nx*nx+ny*ny+nz*nz),1e-8)
    normal_xyz=np.stack([nx/nrm,ny/nrm,nz/nrm],axis=-1)

    ridge=np.clip(slope[...,None]*.13,0,.13)
    stone=np.array([145,142,132],dtype=np.float32)
    base=albedo*(1-ridge)+stone*ridge
    base=np.clip(base*1.08+5,0,255)

    save_phase('terrain_dawn_final.png',base,normal_xyz,(.98,.22,-.05),.18,(.72,.86,.96),land)
    save_phase('terrain_day_final.png',base,normal_xyz,(.28,.95,-.18),.42,(1.03,1.03,.99),land)
    save_phase('terrain_sunset_final.png',base,normal_xyz,(-.98,.19,.08),.17,(1.13,.89,.72),land)

    day=Image.open(OUT/'terrain_day_final.png').convert('RGB')
    day.save(OUT/'terrain_surface_final.png',quality=95)

    tx=-gx*ve
    ty=gy*ve
    tz=np.ones_like(tx)
    tn=np.maximum(np.sqrt(tx*tx+ty*ty+tz*tz),1e-8)
    tangent_normal=np.stack([
        (tx/tn*.5+.5)*255.0,
        (ty/tn*.5+.5)*255.0,
        (tz/tn*.5+.5)*255.0,
    ],axis=-1).clip(0,255).astype(np.uint8)
    tangent_normal[~land]=np.array([128,128,255],dtype=np.uint8)
    Image.fromarray(tangent_normal).save(OUT/'terrain_normal_final.png')

    mh=max(2,round(MESH_W*rh/rw))
    ci=np.linspace(0,rw-1,MESH_W).astype(int)
    ri=np.linspace(0,rh-1,mh).astype(int)
    q=h16[np.ix_(ri,ci)]/65535.0
    lm=land[np.ix_(ri,ci)]
    z=q*max_elev*ve
    xs=np.linspace(minx,maxx,MESH_W)
    ys=np.linspace(maxy,miny,mh)
    X,Y=np.meshgrid(xs,ys)
    scene=float(meta['scene_m_per_unit'])
    verts=np.column_stack([X.ravel()/scene,z.ravel()/scene,-Y.ravel()/scene])

    # TextureLoader flips image Y by default, so top raster row must use v=0 here.
    # This keeps the phase textures geographically aligned with the DEM mesh.
    uu=np.linspace(0,1,MESH_W)
    vv=np.linspace(0,1,mh)
    U,V=np.meshgrid(uu,vv)
    uvs=np.column_stack([U.ravel(),V.ravel()])

    faces=[]
    for r in range(mh-1):
        for c in range(MESH_W-1):
            a=r*MESH_W+c;b=a+1;d=(r+1)*MESH_W+c;e=d+1
            if lm[r,c] and lm[r+1,c] and lm[r,c+1]:faces.append([a,d,b])
            if lm[r,c+1] and lm[r+1,c] and lm[r+1,c+1]:faces.append([b,d,e])
    faces=np.asarray(faces,dtype=np.int64)
    mesh=trimesh.Trimesh(vertices=verts,faces=faces,process=False)
    mesh.visual=trimesh.visual.TextureVisuals(uv=uvs)
    mesh.remove_unreferenced_vertices()
    mesh.export(OUT/'terrain_final_uv.glb')

    out_meta={
        'schema_version':'1.2',
        'source':'South Korea Hero Terrain v0.2 derived maps',
        'mesh_width':MESH_W,
        'mesh_height':mh,
        'vertices':int(len(mesh.vertices)),
        'triangles':int(len(mesh.faces)),
        'uv':True,
        'uv_orientation':'raster top row v=0 for Three.js TextureLoader default flipY',
        'vertical_exaggeration':ve,
        'scene_m_per_unit':meta['scene_m_per_unit'],
        'phase_textures':{
            'dawn':'terrain_dawn_final.png',
            'day':'terrain_day_final.png',
            'sunset':'terrain_sunset_final.png'
        },
        'static_surface_texture':'terrain_surface_final.png',
        'normal_texture':'terrain_normal_final.png',
        'policy':'Geometry remains Copernicus DEM. Dawn/day/sunset relief is analytically baked from the same DEM normals; no invented mountain geometry or image-generation terrain.'
    }
    (OUT/'terrain_final_metadata.json').write_text(json.dumps(out_meta,indent=2),encoding='utf-8')
    print(json.dumps(out_meta,indent=2))

if __name__=='__main__':main()
