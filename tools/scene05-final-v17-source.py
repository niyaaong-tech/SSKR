#!/usr/bin/env python3
from pathlib import Path

ROOT=Path.cwd()
src=ROOT/'final'/'scene05'/'src'/'scene05-final-v15.js'
out=ROOT/'output'/'scene05_final_v1'/'scene05-final-v17.js'
text=src.read_text('utf-8')

# v1.7 uses the daylight terrain texture for the subtle full OSM Road Hint web.
# WebGL road fragments are disabled to avoid dash-like aliasing at national scale.
replacements={
    "{color:0xcbd6d0,width:.8,dayOpacity:.065,sunsetOpacity:.006}":"{color:0x3f5d58,width:.6,dayOpacity:0,sunsetOpacity:0}",
    "{color:0xb4c0ba,width:.56,dayOpacity:.028,sunsetOpacity:.003}":"{color:0x526b64,width:.5,dayOpacity:0,sunsetOpacity:0}",
    "*2.45":"*1.45",
    "{x:2.2,y:2.2,z:2.2":"{x:1.6,y:1.6,z:1.6",
}
for old,new in replacements.items():
    if old not in text:
        raise SystemExit(f'Expected v1.5 source token not found: {old}')
    text=text.replace(old,new,1)

banner="// Scene 05 Final v1.7 — baked continuous Road Hint texture + restrained unobscured Finish beacon.\n"
out.parent.mkdir(parents=True,exist_ok=True)
out.write_text(banner+text,encoding='utf-8')
print(out)
