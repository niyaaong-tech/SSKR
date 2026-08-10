#!/usr/bin/env python3
from pathlib import Path

p = Path.cwd() / 'output' / 'scene05-b-v36.js'
text = p.read_text('utf-8')

replacements = [
    ('vec3 day=vec3(0.018,0.105,0.185);', 'vec3 day=vec3(0.022,0.135,0.225);', 'v3.1 day ocean'),
    ("tweenCamera(tl, 0, 3.0, introEnd, introTarget, 38.0, 'sine.inOut');",
     "tweenCamera(tl, 0, 3.0, introEnd, introTarget, 35.5, 'sine.inOut');",
     'v3.5 intro FOV token'),
]
for old, new, label in replacements:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'v37 prep {label}: expected 1, found {count}')
    text = text.replace(old, new, 1)

p.write_text(text, encoding='utf-8')
print('prepared', p)
