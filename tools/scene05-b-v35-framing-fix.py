#!/usr/bin/env python3
from pathlib import Path

ROOT = Path.cwd()
path = ROOT / 'output' / 'scene05-b-v35.js'
text = path.read_text('utf-8')


def patch(old, new, label):
    global text
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected exactly 1 match, found {count}')
    text = text.replace(old, new, 1)


patch(
"""  const introStart = center.clone().add(new THREE.Vector3(diag * .02, diag * 1.12, diag * .88));
  const introEnd = center.clone().add(new THREE.Vector3(diag * .035, diag * 1.00, diag * .80));
  const introTarget = center.clone().add(new THREE.Vector3(0, diag * .015, 0));
""",
"""  // v3.5 framing fix: the opening establishes the full canonical peninsula,
  // not the South-Korea-only DEM bounds used by the journey chapter.
  const introBounds = (typeof peninsulaSurface !== 'undefined' && peninsulaSurface)
    ? new THREE.Box3().setFromObject(peninsulaSurface)
    : bounds;
  const introCenter = introBounds.getCenter(new THREE.Vector3());
  const introSize = introBounds.getSize(new THREE.Vector3());
  const introDiag = Math.max(introSize.x, introSize.z);
  const introStart = introCenter.clone().add(new THREE.Vector3(introDiag * .01, introDiag * 1.62, introDiag * .34));
  const introEnd = introCenter.clone().add(new THREE.Vector3(introDiag * .015, introDiag * 1.48, introDiag * .30));
  const introTarget = introCenter.clone().add(new THREE.Vector3(0, introDiag * .006, 0));
""",
'full peninsula intro bounds'
)

patch(
"""    fov: 37.0
  });
  syncCamera();

  // 0-3s — centered peninsula.
  tweenCamera(tl, 0, 3.0, introEnd, introTarget, 35.5, 'sine.inOut');
""",
"""    fov: 39.5
  });
  syncCamera();

  // 0-3s — full Korean peninsula centered with restrained movement.
  tweenCamera(tl, 0, 3.0, introEnd, introTarget, 38.0, 'sine.inOut');
""",
'intro FOV'
)

patch(
"""  if (typeof sunSprite !== 'undefined' && sunSprite) {
    tl.to(sunSprite.material, { opacity: .58, duration: 1.8, ease: 'sine.out' }, 20.0)
      .to(sunSprite.material, { opacity: .84, duration: 1.8, ease: 'sine.inOut' }, 21.5)
      .to(sunSprite.position, { y: finish.y + diag * .043, duration: 5.2, ease: 'sine.inOut' }, 21.0)
      .to(sunSprite.material, { opacity: .52, duration: 3.0, ease: 'sine.inOut' }, 26.0);
  }
""",
"""  // The old procedural Sun sprite reads as a floating light orb from the lowered
  // west-coast camera. Keep it hidden until the dedicated sunset asset pass.
  if (typeof sunSprite !== 'undefined' && sunSprite) {
    sunSprite.material.opacity = 0;
  }
""",
'remove floating sunset placeholder'
)

patch(
"""  for (const n of startNodes.values()) {
    tl.to(n.userData.core.material, { opacity: 0, duration: 1.6 }, 20.5)
      .to(n.userData.ring.material, { opacity: 0, duration: 1.6 }, 20.5)
      .to(n.userData.sprite.material, { opacity: 0, duration: 1.6 }, 20.5);
  }

  // 22-26s — descend toward the west-coast horizon.
""",
"""  for (const n of startNodes.values()) {
    tl.to(n.userData.core.material, { opacity: 0, duration: 1.6 }, 20.5)
      .to(n.userData.ring.material, { opacity: 0, duration: 1.6 }, 20.5)
      .to(n.userData.sprite.material, { opacity: 0, duration: 1.6 }, 20.5);
  }

  // The Finish beat ends before the sunset/message chapter. Do not leave a large
  // HUD-like glow in the lowered coastal shot.
  tl.to(finishNode.userData.core.material, { opacity: 0, duration: 1.25, ease: 'sine.inOut' }, 23.35)
    .to(finishNode.userData.sprite.material, { opacity: 0, duration: 1.25, ease: 'sine.inOut' }, 23.35)
    .to(finishNode.userData.ring.material, { opacity: 0, duration: .9 }, 23.35);
  festivalGroup.traverse(o => {
    if (o.material) tl.to(o.material, { opacity: 0, duration: 1.35, ease: 'sine.inOut' }, 23.45);
  });

  // 22-26s — descend toward the west-coast horizon.
""",
'fade Finish lights before core message'
)

path.write_text(text, encoding='utf-8')
print(path)
