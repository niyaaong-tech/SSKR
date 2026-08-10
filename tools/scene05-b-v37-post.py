#!/usr/bin/env python3
from pathlib import Path

p = Path.cwd() / 'output' / 'scene05-b-v37.js'
text = p.read_text('utf-8')
old = "tweenCamera(tl, 0, 3.0, introEnd, introTarget, 35.5, 'sine.inOut');"
new = "tweenCamera(tl, 0, 3.0, introEnd, introTarget, 38.0, 'sine.inOut');"
count = text.count(old)
if count != 1:
    raise SystemExit(f'v37 post opening FOV: expected 1, found {count}')
text = text.replace(old, new, 1)
p.write_text(text, encoding='utf-8')
print('restored approved intro framing', p)
