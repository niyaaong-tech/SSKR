#!/usr/bin/env python3
from pathlib import Path

p = Path.cwd() / 'output' / 'scene05-b-v36.js'
text = p.read_text('utf-8')
old = 'vec3 day=vec3(0.018,0.105,0.185);'
new = 'vec3 day=vec3(0.022,0.135,0.225);'
if text.count(old) != 1:
    raise SystemExit(f'v37 prep: expected current v3.1 day-ocean token once, found {text.count(old)}')
text = text.replace(old, new, 1)
p.write_text(text, encoding='utf-8')
print('prepared', p)
