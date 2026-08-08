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

ROOT = Path.cwd()
SVG = ROOT / 'assets' / 'vector' / 'korean_peninsula_precise.svg'
TERRAIN = ROOT / 'assets' / 'scene05' / 'south_korea_hero_v0.2'
OUT = ROOT / 'output' / 'scene05_final_v1'

TEX_W = 1536
GRID_COLS = 25
GRID_ROWS = 49


def smoothstep(a, b, x):
    t = np.clip((x-a)/max(b-a, 1e-9), 0.0, 1.0)
    return t*t*(3.0-2.0*t)


def parse_svg_size(text: str) -> tuple[int, int]:
    m = re.search(r'viewBox="\s*0\s+0\s+([0-9.]+)\s+([0-9.]+)"', text)
    if not m:
        raise SystemExit('canonical SVG viewBox not found')
    return int(round(float(m.group(1)))), int(round(float(m.group(2))))


def apply_affine(matrix: np.ndarray, x: np.ndarray, y: np.ndarray):
    return (
        matrix[0,0]*x + matrix[0,1]*y + matrix[0,2],
        matrix[1,0]*x + matrix[1,1]*y + matrix[1,2],
    )


def norm01(a):
    lo=float(np.percentile(a, 2)); hi=float(np.percentile(a, 98))
    return np.clip((a-lo)/max(hi-lo, 1e-6), 0.0, 1.0)


def procedural_north(u, v):
    # Low-detail atmospheric relief only. It is intentionally not a land-cover claim.
    f1=np.sin((u*5.8 + v*1.7)*math.pi)
    f2=np.sin((u*10.7 - v*3.1)*math.pi + .7)
    f3=np.cos((u*18.0 + v*8.3)*math.pi + 1.2)
    ridge=1.0-np.abs(.55*f1+.30*f2+.15*f3)
    broad=.5+.5*np.sin((u*2.8-v*.65)*math.pi+.3)
    h=np.clip(.58*ridge+.42*broad,0,1)
    gy,gx=np.gradient(h)
    light=np.clip(.64 + (-gx*.55-gy*.85)*3.2, .42, 1.18)
    low=np.array([84.,101.,61.],dtype=np.float32)
    mid=np.array([59.,82.,52.],dtype=np.float32)
    rock=np.array([111.,108.,88.],dtype=np.float32)
    hi=smoothstep(.58,.88,h)[...,None]
    base=low[None,None,:]*(1-h[...,None]*.62)+mid[None,None,:]*(h[...,None]*.62)
    base=base*(1-hi*.22)+rock[None,None,:]*(hi*.22)
    return base*light[...,None]


def main():
    OUT.mkdir(parents=True,exist_ok=True)
    svg_text=SVG.read_text('utf-8')
    svg_w,svg_h=parse_svg_size(svg_text)
    tex_h=int(round(TEX_W*svg_h/svg_w))

    # Canonical SVG alpha is the immutable land authority.
    png=cairosvg.svg2png(bytestring=svg_text.encode('utf-8'),output_width=TEX_W,output_height=tex_h)
    svg_rgba=np.asarray(Image.open(io.BytesIO(png)).convert('RGBA'))
    land=svg_rgba[...,3]>8

    georef=json.loads((TERRAIN/'svg_georef.json').read_text('utf-8'))
    meta=json.loads((TERRAIN/'terrain_metadata.json').read_text('utf-8'))
    mat=np.asarray(georef['svg_px_to_epsg3857_matrix'],dtype=np.float64)
    local_crs=CRS.from_proj4(meta['local_crs_proj4'])
    tf=Transformer.from_crs('EPSG:3857',local_crs,always_xy=True)

    xs=(np.arange(TEX_W,dtype=np.float64)+.5)/TEX_W*svg_w
    ys=(np.arange(tex_h,dtype=np.float64)+.5)/tex_h*svg_h
    gx,gy=np.meshgrid(xs,ys)
    mx,my=apply_affine(mat,gx,gy)
    lx,ly=tf.transform(mx,my)
    u=gx/max(svg_w,1); v=gy/max(svg_h,1)

    # Northern / non-DEM context receives subdued pseudo-relief so it reads as land,
    # while South Korea receives real DEM/albedo/slope shading below.
    rgb=procedural_north(u,v)

    albedo=np.asarray(Image.open(TERRAIN/'albedo.png').convert('RGB'),dtype=np.float32)
    hill=np.asarray(Image.open(TERRAIN/'hillshade.png').convert('L'),dtype=np.float32)/255.0
    slope=np.asarray(Image.open(TERRAIN/'slope.png').convert('L'),dtype=np.float32)/255.0
    h16=np.asarray(Image.open(TERRAIN/'height_u16.png'),dtype=np.float32)
    precise=np.asarray(Image.open(TERRAIN/'land_mask_precise_svg.png').convert('L'))>127
    src_h,src_w=hill.shape
    minx,miny,maxx,maxy=meta['local_bounds_m']
    px=(lx-minx)/(maxx-minx)*(src_w-1)
    py=(maxy-ly)/(maxy-miny)*(src_h-1)
    inside=(px>=0)&(px<=src_w-1)&(py>=0)&(py<=src_h-1)
    xi=np.clip(np.rint(px).astype(np.int32),0,src_w-1)
    yi=np.clip(np.rint(py).astype(np.int32),0,src_h-1)
    src_land=precise[yi,xi]&inside&land

    src=albedo[yi,xi]
    sh=hill[yi,xi]
    sl=slope[yi,xi]
    elev=(h16[yi,xi]/65535.0)

    # Real-terrain art material. Lowlands are warmer and more varied; mountain mass
    # is deeper forest green; steep/high ridges get a restrained stone component.
    low=np.array([103.,116.,72.],dtype=np.float32)
    forest=np.array([48.,78.,47.],dtype=np.float32)
    stone=np.array([122.,119.,98.],dtype=np.float32)
    mountain=smoothstep(.10,.48,elev)
    high=smoothstep(.42,.82,elev)
    steep=smoothstep(.22,.72,sl)
    rock=np.clip(high*steep,0,1)[...,None]
    palette=low[None,None,:]*(1-mountain[...,None])+forest[None,None,:]*mountain[...,None]
    palette=palette*(1-rock*.38)+stone[None,None,:]*(rock*.38)

    src_lum=(src[...,0]*.2126+src[...,1]*.7152+src[...,2]*.0722)/255.0
    src_detail=np.clip(.80+src_lum[...,None]*.40,.78,1.18)
    # Stronger real hillshade than v2.5, but lifted shadows to avoid the black-plate look.
    relief=np.clip(.62+sh*.66,.62,1.28)[...,None]
    south=(palette*.76 + src*.24)*src_detail*relief

    # A tiny high-frequency terrain grain keeps close route-chase frames from feeling plastic.
    grain=(
        np.sin(u*math.pi*91.0+v*13.0)*.5 +
        np.sin(v*math.pi*117.0-u*17.0)*.3 +
        np.cos((u+v)*math.pi*63.0)*.2
    )
    south*=np.clip(.965+grain[...,None]*.035,.92,1.04)
    rgb[src_land]=south[src_land]

    # Canonical coastline treatment: a fine sunlit inner rim and a slightly darker
    # second band. Alpha never changes, so no holes can appear.
    mask=Image.fromarray((land.astype(np.uint8)*255),'L')
    blur1=np.asarray(mask.filter(ImageFilter.GaussianBlur(1.5)),dtype=np.float32)/255.0
    blur5=np.asarray(mask.filter(ImageFilter.GaussianBlur(5.0)),dtype=np.float32)/255.0
    inner=np.clip(1.0-blur1,0,1)*land.astype(np.float32)
    shelf=np.clip(blur1-blur5,0,1)*land.astype(np.float32)
    rgb += inner[...,None]*np.array([25.,24.,15.],dtype=np.float32)
    rgb *= (1.0-shelf[...,None]*.08)

    rgba=np.zeros((tex_h,TEX_W,4),dtype=np.uint8)
    rgba[...,:3]=np.clip(rgb,0,255).astype(np.uint8)
    rgba[...,3]=land.astype(np.uint8)*255
    tex=Image.fromarray(rgba,'RGBA')
    tex=ImageEnhance.Color(tex).enhance(1.11)
    tex=ImageEnhance.Contrast(tex).enhance(1.07)
    tex=ImageEnhance.Brightness(tex).enhance(1.08)
    tex.save(OUT/'peninsula_surface_v26.png',optimize=True)

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

    outmeta={
      'schema_version':'2.6',
      'source_svg':str(SVG.relative_to(ROOT)),
      'texture':'peninsula_surface_v26.png',
      'texture_size':[TEX_W,tex_h],
      'svg_viewbox':[0,0,svg_w,svg_h],
      'grid':{'cols':GRID_COLS,'rows':GRID_ROWS,'positions':grid},
      'scene_m_per_unit':scene_m,
      'policy':[
        'Canonical SVG alpha is the single land-coverage authority.',
        'South Korea surface uses actual DEM elevation, slope, source albedo and hillshade as the dominant relief signal.',
        'Northern pseudo-relief is low-detail atmospheric context only and is never presented as topographic data.',
        'The texture is a cinematic surface treatment, not a land-cover or navigation map.'
      ]
    }
    (OUT/'peninsula_surface_v26.json').write_text(json.dumps(outmeta,ensure_ascii=False,indent=2),encoding='utf-8')
    qa={'texture_size':[TEX_W,tex_h],'land_pixels':int(land.sum()),'south_real_terrain_pixels':int(src_land.sum()),'alpha_authority':'canonical_svg_only','grid_vertices':GRID_COLS*GRID_ROWS}
    (OUT/'peninsula_surface_v26_qa.json').write_text(json.dumps(qa,indent=2),encoding='utf-8')
    print(json.dumps(qa,indent=2))

if __name__=='__main__':
    main()
