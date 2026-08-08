#!/usr/bin/env python3
from __future__ import annotations

import base64
from pathlib import Path

ROOT=Path(__file__).resolve().parent
DIST=ROOT/'dist'


def data_uri(path:Path,mime:str)->str:
    return f"data:{mime};base64,"+base64.b64encode(path.read_bytes()).decode('ascii')


def main():
    html=(DIST/'index.html').read_text('utf-8')
    css=(DIST/'scene05.css').read_text('utf-8')
    js=(DIST/'app.js').read_text('utf-8')

    svg_uri=data_uri(DIST/'assets'/'korean_peninsula_precise.svg','image/svg+xml')
    glb_uri=data_uri(DIST/'assets'/'terrain_lod.glb','model/gltf-binary')
    route_uri=data_uri(DIST/'assets'/'scene05_route_network_3d_v01.json','application/json')

    js=js.replace('./assets/terrain_lod.glb',glb_uri)
    js=js.replace('./assets/scene05_route_network_3d_v01.json',route_uri)
    html=html.replace('./assets/korean_peninsula_precise.svg',svg_uri)
    html=html.replace('<link rel="stylesheet" href="./scene05.css" />',f'<style>{css}</style>')
    html=html.replace('<script type="module" src="./app.js"></script>',f'<script type="module">{js}</script>')

    if './assets/' in html or './app.js' in html or './scene05.css' in html:
        raise SystemExit('Standalone pack left external prototype asset references')

    out=DIST/'SSKR_Scene05_ThreeJS_Prototype_v0.2_standalone.html'
    out.write_text(html,encoding='utf-8')
    print(out, out.stat().st_size)

if __name__=='__main__':
    main()
