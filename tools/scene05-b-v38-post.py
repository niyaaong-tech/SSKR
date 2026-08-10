#!/usr/bin/env python3
from pathlib import Path

p = Path.cwd() / 'output' / 'scene05-b-v38.js'
text = p.read_text('utf-8')

# scene05-b-source-v38.py deliberately stays a patch generator. Normalize the
# generated banner to a real line break so esbuild never sees the source body as
# part of the leading // comment.
old = 'QA diagnostics.\\n'
new = 'QA diagnostics.\n'
if text.count(old) != 1:
    raise SystemExit(f'v38 banner normalization: expected 1, found {text.count(old)}')
text = text.replace(old, new, 1)

p.write_text(text, encoding='utf-8')
print('normalized v3.8 generated source', p)
