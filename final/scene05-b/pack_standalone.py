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
      './assets/peninsula_surface_v381.png':data_uri(DIST/'assets'/'peninsula_surface_v381.png','image/png'),
      './assets/peninsula_mask_debug_v381.png':data_uri(DIST/'assets'/'peninsula_mask_debug_v381.png','image/png'),
      './assets/road_choice_overlay_v31.png':data_uri(DIST/'assets'/'road_choice_overlay_v31.png','image/png'),
      './assets/sky_dawn_v381.jpg':data_uri(DIST/'assets'/'sky_dawn_v381.jpg','image/jpeg'),
      './assets/sky_sunset_env_v381.jpg':data_uri(DIST/'assets'/'sky_sunset_env_v381.jpg','image/jpeg'),
      './assets/cloud_veil_v381.png':data_uri(DIST/'assets'/'cloud_veil_v381.png','image/png'),
      './assets/finale_still_01_v384.avif':data_uri(DIST/'assets'/'finale_still_01_v384.avif','image/avif'),
      './assets/finale_still_02_v384.avif':data_uri(DIST/'assets'/'finale_still_02_v384.avif','image/avif'),
      './assets/finale_still_03_v384.avif':data_uri(DIST/'assets'/'finale_still_03_v384.avif','image/avif'),
      './assets/peninsula_surface_v34.json':data_uri(DIST/'assets'/'peninsula_surface_v34.json','application/json'),
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
    out=DIST/'SSKR_Scene05_B_30s_Journey_v3.8.4_standalone.html'
    out.write_text(html,encoding='utf-8')
    print(out,out.stat().st_size)

if __name__=='__main__':
    main()
