#!/usr/bin/env python3
from pathlib import Path
import base64, tarfile, tempfile, hashlib
ROOT=Path(__file__).resolve().parent
parts=sorted((ROOT/'parts').glob('part_*.b64'))
if not parts:
    raise SystemExit('No snapshot parts found')
b64=''.join(p.read_text('ascii').strip() for p in parts)
raw=base64.b64decode(b64)
sha=hashlib.sha256(raw).hexdigest()
expected='88f9e32b3fcd0b590f1b6a541c4cc0423e35928149c0cde70c91c29dcc7566bc'
if sha != expected:
    raise SystemExit(f'SHA256 mismatch: {sha}')
out=ROOT.parent/'workspace'
out.mkdir(parents=True,exist_ok=True)
with tempfile.NamedTemporaryFile(suffix='.tar.gz') as tmp:
    tmp.write(raw); tmp.flush()
    with tarfile.open(tmp.name,'r:gz') as tf:
        tf.extractall(out)
print('restored:',out)
