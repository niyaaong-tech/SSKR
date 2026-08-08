#!/usr/bin/env python3
from __future__ import annotations

import base64
from pathlib import Path

ROOT=Path(__file__).resolve().parent
DIST=ROOT/'dist'


def data_uri(path:Path,mime:str)->str:
    return f'data:{mime};base64,'+base64.b64encode(path.read_bytes()).decode('ascii')


def main():
    html=(DIST/'index.html').read_text('utf-8')
    css=(DIST/'scene05-b.css').read_text('utf-8')
    js=(DIST/'app.js').read_text('utf-8')

    replacements={
        './assets/korean_peninsula_precise.svg':data_uri(DIST/'assets'/'korean_peninsula_precise.svg','image/svg+xml'),
        './assets/terrain_final_uv.glb':data_uri(DIST/'assets'/'terrain_final_uv.glb','model/gltf-binary'),
        './assets/terrain_dawn_final.png':data_uri(DIST/'assets'/'terrain_dawn_final.png','image/png'),
        './assets/terrain_day_final.png':data_uri(DIST/'assets'/'terrain_day_final.png','image/png'),
        './assets/terrain_sunset_final.png':data_uri(DIST/'assets'/'terrain_sunset_final.png','image/png'),
        './assets/coast_shallow.png':data_uri(DIST/'assets'/'coast_shallow.png','image/png'),
        './assets/peninsula_surface_v28.png':data_uri(DIST/'assets'/'peninsula_surface_v28.png','image/png'),
        './assets/peninsula_surface_v28.json':data_uri(DIST/'assets'/'peninsula_surface_v28.json','application/json'),
        './assets/scene05_final_data_v1.json':data_uri(DIST/'assets'/'scene05_final_data_v1.json','application/json')
    }
    for old,new in replacements.items():
        html=html.replace(old,new)
        js=js.replace(old,new)
    html=html.replace('<link rel="stylesheet" href="./scene05-b.css" />',f'<style>{css}</style>')
    html=html.replace('<script type="module" src="./app.js"></script>',f'<script type="module">{js}</script>')
    for ref in ['./assets/','./app.js','./scene05-b.css']:
        if ref in html:
            raise SystemExit(f'Standalone pack left external reference: {ref}')
    out=DIST/'SSKR_Scene05_B_ArtworkPass_OneTake_v2.8_standalone.html'
    out.write_text(html,encoding='utf-8')
    print(out,out.stat().st_size)

if __name__=='__main__':
    main()
