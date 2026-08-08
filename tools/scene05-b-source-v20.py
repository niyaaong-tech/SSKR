#!/usr/bin/env python3
from pathlib import Path

ROOT=Path.cwd()
src=ROOT/'final'/'scene05-b'/'src'/'scene05-b-v20.js'
out=ROOT/'output'/'scene05-b-v20.js'
text=src.read_text('utf-8')
old="  fog: true,\n  uniforms: oceanUniforms,"
new="  fog: false,\n  uniforms: oceanUniforms,"
if old not in text:
    raise SystemExit('Expected ocean ShaderMaterial fog token not found')
text=text.replace(old,new,1)
out.parent.mkdir(parents=True,exist_ok=True)
out.write_text('// Scene 05 B v2.0 build source — ocean shader uses its own atmospheric treatment.\n'+text,encoding='utf-8')
print(out)
