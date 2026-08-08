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


def main():
    OUT.mkdir(parents=True,exist_ok=True)
    meta=json.loads((SRC/'terrain_metadata.json').read_text('utf-8'))
    h16=np.array(Image.open(SRC/'height_u16.png'),dtype=np.float32)
    land=np.array(Image.open(SRC/'land_mask_precise_svg.png').convert('L'))>127
    albedo=load_rgb('albedo.png')
    hill=np.array(Image.open(SRC/'hillshade.png').convert('L'),dtype=np.float32)/255.0
    slope=np.array(Image.open(SRC/'slope.png').convert('L'),dtype=np.float32)/255.0
    normal=Image.open(SRC/'normal.png').convert('RGB')

    # Cinematic but restrained terrain surface: real derived hillshade provides relief,
    # while slope only nudges rocky ridges slightly cooler/brighter. No invented mountains.
    shade=np.clip(.52 + hill*.62, .45, 1.10)
    ridge=np.clip(slope[...,None]*.16,0,.16)
    stone=np.array([145,142,132],dtype=np.float32)
    surface=albedo*shade[...,None]
    surface=surface*(1-ridge)+stone*ridge
    # Slight warm-neutral lift for daylight readability, keep saturation low.
    surface=np.clip(surface*1.06+4,0,255).astype(np.uint8)
    surface[~land]=np.array([18,47,67],dtype=np.uint8)
    surf_img=Image.fromarray(surface).filter(ImageFilter.GaussianBlur(radius=.18))
    surf_img=ImageEnhance.Contrast(surf_img).enhance(1.07)
    surf_img.save(OUT/'terrain_surface_final.png',quality=95)
    normal.save(OUT/'terrain_normal_final.png')

    rh,rw=h16.shape
    mh=max(2,round(MESH_W*rh/rw))
    ci=np.linspace(0,rw-1,MESH_W).astype(int)
    ri=np.linspace(0,rh-1,mh).astype(int)
    q=h16[np.ix_(ri,ci)]/65535.0
    lm=land[np.ix_(ri,ci)]
    max_elev=float(meta['mesh']['max_elevation_m'])
    z=q*max_elev*float(meta['vertical_exaggeration'])
    minx,miny,maxx,maxy=meta['local_bounds_m']
    xs=np.linspace(minx,maxx,MESH_W)
    ys=np.linspace(maxy,miny,mh)
    X,Y=np.meshgrid(xs,ys)
    scene=float(meta['scene_m_per_unit'])
    verts=np.column_stack([X.ravel()/scene,z.ravel()/scene,-Y.ravel()/scene])

    # UVs follow raster rows/columns; top raster row maps to v=1.
    uu=np.linspace(0,1,MESH_W)
    vv=np.linspace(1,0,mh)
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
        'schema_version':'1.0',
        'source':'South Korea Hero Terrain v0.2 derived maps',
        'mesh_width':MESH_W,
        'mesh_height':mh,
        'vertices':int(len(mesh.vertices)),
        'triangles':int(len(mesh.faces)),
        'uv':True,
        'vertical_exaggeration':meta['vertical_exaggeration'],
        'scene_m_per_unit':meta['scene_m_per_unit'],
        'surface_texture':'terrain_surface_final.png',
        'normal_texture':'terrain_normal_final.png',
        'policy':'Geometry and height remain derived from Copernicus DEM; visual realism is added only through derived terrain shading/material.'
    }
    (OUT/'terrain_final_metadata.json').write_text(json.dumps(out_meta,indent=2),encoding='utf-8')
    print(json.dumps(out_meta,indent=2))

if __name__=='__main__':main()
