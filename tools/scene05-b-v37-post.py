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

# Add these tweens last so they win over older accumulated lighting tweens at the
# same timestamps. Start points must still be riding out under dawn; daylight begins
# only when participant routes launch at 9s.
anchor = '  return tl;'
if text.count(anchor) != 1:
    raise SystemExit(f'v37 post timeline return: expected 1, found {text.count(anchor)}')
polish = '''  // v3.7 final dawn hold — explicit art-direction override.
  if (typeof peninsulaSurface !== 'undefined' && peninsulaSurface) {
    tl.to(peninsulaSurface.material.color, { r: .45, g: .55, b: .62, duration: 2.7, ease: 'sine.inOut' }, 5.2)
      .to(peninsulaSurface.material.color, { r: 1.0, g: 1.0, b: .98, duration: 4.6, ease: 'sine.inOut' }, 9.0);
  }
  tl.to(renderer, { toneMappingExposure: .82, duration: 2.6, ease: 'sine.inOut' }, 5.2)
    .to(renderer, { toneMappingExposure: 1.06, duration: 4.6, ease: 'sine.inOut' }, 9.0)
    .to(oceanUniforms.uPhase, { value: .45, duration: 2.6, ease: 'sine.inOut' }, 5.2)
    .to(oceanUniforms.uPhase, { value: 1.0, duration: 4.5, ease: 'sine.inOut' }, 9.0);

'''
text = text.replace(anchor, polish + anchor, 1)
p.write_text(text, encoding='utf-8')
print('restored approved intro framing and dawn hold', p)
