#!/usr/bin/env python3
import re
from pathlib import Path

ROOT = Path.cwd()
src = ROOT / 'output' / 'scene05-b-v38.js'
out = ROOT / 'output' / 'scene05-b-v381.js'
text = src.read_text('utf-8')


def fail(label: str, detail: str) -> None:
    message = f'{label}: {detail}'
    print(f'::error title=Scene 05 B v3.8.1 patch::{message}')
    raise SystemExit(message)


def patch(old: str, new: str, label: str, count: int = 1):
    global text
    found = text.count(old)
    if found != count:
        fail(label, f'expected {count}, found {found}')
    text = text.replace(old, new, count)


def patch_re(pattern: str, repl: str, label: str, count: int = 1):
    global text
    text2, found = re.subn(pattern, repl, text, count=count)
    if found != count:
        fail(label, f'expected regex {count}, found {found}')
    text = text2


# ---------------------------------------------------------------------------
# 1) Higher-resolution canonical peninsula surface and photographic environment.
# ---------------------------------------------------------------------------
patch('./assets/peninsula_surface_v38.png', './assets/peninsula_surface_v381.png', 'v381 surface path')
patch('./assets/peninsula_mask_debug_v38.png', './assets/peninsula_mask_debug_v381.png', 'v381 mask path')
patch('./assets/sky_dawn_v37.jpg', './assets/sky_dawn_v381.jpg', 'v381 dawn path')
patch('./assets/sky_sunset_v37.jpg', './assets/sky_sunset_env_v381.jpg', 'v381 sunset environment path')
patch('./assets/cloud_veil_v37.png', './assets/cloud_veil_v381.png', 'v381 transparent cloud slot')

patch(
    "  loadTexture('./assets/cloud_veil_v381.png'),\n  loadJSON('./assets/peninsula_surface_v34.json'),",
    "  loadTexture('./assets/cloud_veil_v381.png'),\n  loadTexture('./assets/west_sunset_matte_v381.jpg'),\n  loadJSON('./assets/peninsula_surface_v34.json'),",
    'load v381 finale matte'
)
patch(
    "]).then(([gltf, dawnTex, dayTex, sunsetTex, coastTex, peninsulaTex, roadOverlayTex, peninsulaMaskTex, photoDawnTex, photoSunsetTex, photoCloudTex, peninsulaMeta, data]) => {",
    "]).then(([gltf, dawnTex, dayTex, sunsetTex, coastTex, peninsulaTex, roadOverlayTex, peninsulaMaskTex, photoDawnTex, photoSunsetTex, photoCloudTex, finaleMatteTex, peninsulaMeta, data]) => {",
    'v381 matte destructuring'
)

# v3.8 used a binary cutoff. v3.8.1 preserves the canonical SVG's high-resolution
# anti-alias coverage, with extrapolated land RGB underneath to avoid a dark fringe.
patch('    alphaTest: .42,', '    alphaTest: .08,', 'v381 antialiased canonical coast cutoff')

# Earlier passes changed the shallow-water RGB and strength more than once. Match the
# semantic shader expression instead of one historical color literal, and preserve
# its currently tuned RGB while reducing only the coastline-band strength.
patch_re(
    r'base=mix\(base,(vec3\([^\n;]+?\)),coast\*[0-9.]+\*coastDay\);',
    r'base=mix(base,\1,coast*0.045*coastDay);',
    'v381 shallow water restraint'
)

# The sunset panorama is now a photographic environment. Do not paint a second
# synthetic orange horizon over it.
patch(
    '''        float hdist=abs(vUv.y-.50);
        float horizon=1.0-smoothstep(.015,.30,hdist);
        float core=1.0-smoothstep(.010,.080,hdist);
        float warm=smoothstep(.42,1.0,uMix);
        c += vec3(.24,.075,.012)*horizon*warm*.34;
        c += vec3(.52,.16,.025)*core*warm*.30;
        float upper=smoothstep(.58,.92,vUv.y);
        c=mix(c,c*vec3(.88,.96,1.08),upper*.15);''',
    '''        // v3.8.1: visible horizon color is carried by the photographic source.
        // No synthetic warm band is added here.''',
    'remove synthetic v38 sky horizon'
)

# ---------------------------------------------------------------------------
# 2) Finale matte: one photograph supplies sky + real sun + sea + real reflection.
#    This is intentionally screen-projected 2D matte work, not a synthetic 3D sun.
# ---------------------------------------------------------------------------
patch(
    'const photoCloudPlanes = [];',
    '''const photoCloudPlanes = [];
let finaleMatte = null;
let finaleMatteMaterial = null;''',
    'v381 finale globals'
)

helper_anchor = 'function buildPhotoEnvironment(dawnTex, sunsetTex, cloudTex) {'
helpers = r'''function buildFinaleMatte(texture) {
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;

  finaleMatteMaterial = new THREE.MeshBasicMaterial({
    map: texture,
    color: 0xffffff,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    depthTest: false,
    side: THREE.DoubleSide,
    fog: false,
    toneMapped: false
  });
  finaleMatte = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), finaleMatteMaterial);
  finaleMatte.frustumCulled = false;
  finaleMatte.renderOrder = 90;
  scene.add(finaleMatte);
  syncFinaleMatte();
}

function syncFinaleMatte() {
  if (!finaleMatte) return;
  const distance = 1.15;
  const h = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov * .5)) * distance;
  const w = h * camera.aspect;
  const dir = new THREE.Vector3();
  camera.getWorldDirection(dir);
  finaleMatte.position.copy(camera.position).addScaledVector(dir, distance);
  finaleMatte.quaternion.copy(camera.quaternion);
  finaleMatte.scale.set(w * .5, h * .5, 1);
}

'''
patch(helper_anchor, helpers + helper_anchor, 'v381 finale matte helpers')

patch(
    '  buildPhotoEnvironment(photoDawnTex, photoSunsetTex, photoCloudTex);',
    '  buildPhotoEnvironment(photoDawnTex, photoSunsetTex, photoCloudTex);\n  buildFinaleMatte(finaleMatteTex);',
    'build v381 finale matte'
)

# The old sprite sun is the exact cause of the floating-in-front-of-the-sea error.
patch(
    '  sunSprite = new THREE.Sprite(sunMat);',
    '  sunSprite = new THREE.Sprite(sunMat);\n  sunSprite.visible = false;',
    'disable synthetic sun sprite'
)

# Keep the old ocean while it is still an aerial map surface, but its synthetic
# sunset reflection lane is disabled permanently. The photographic matte supplies
# the visible final reflection from the same exposure as the sun and sky.
patch(
    '  oceanUniforms.uCameraXZ.value.set(camera.position.x, camera.position.z);',
    '''  oceanUniforms.uCameraXZ.value.set(camera.position.x, camera.position.z);
  oceanUniforms.uReflectionStrength.value = 0.0;
  syncFinaleMatte();''',
    'disable synthetic reflection and sync matte'
)

# The v3.8 westGlow was a screen-space substitute for atmospheric sunset. It should
# no longer compete with the photographic plate.
patch(
    ".to(westGlow, { opacity: .46, duration: 3.6, ease: 'sine.inOut' }, 25.7)",
    ".to(westGlow, { opacity: .08, duration: 3.6, ease: 'sine.inOut' }, 25.7)",
    'v381 west glow restraint'
)

# Crossfade only after Finish convergence. Existing 22-26s camera descent remains
# visible underneath the plate so the transition reads as aerial map -> real west sea.
return_anchor = '  return tl;'
matte_timeline = r'''  if (finaleMatteMaterial) {
    finaleMatteMaterial.opacity = 0;
    finaleMatte.visible = true;
    tl.to(finaleMatteMaterial, { opacity: .06, duration: .55, ease: 'sine.inOut' }, 21.95)
      .to(finaleMatteMaterial, { opacity: .28, duration: 1.15, ease: 'sine.inOut' }, 22.50)
      .to(finaleMatteMaterial, { opacity: .66, duration: 1.45, ease: 'sine.inOut' }, 23.65)
      .to(finaleMatteMaterial, { opacity: 1.0, duration: 1.45, ease: 'sine.inOut' }, 25.10);
  }

  window.__scene05V381State = () => ({
    matteOpacity: finaleMatteMaterial ? finaleMatteMaterial.opacity : -1,
    matteVisible: !!(finaleMatte && finaleMatte.visible),
    syntheticSunVisible: !!(typeof sunSprite !== 'undefined' && sunSprite && sunSprite.visible),
    reflectionStrength: oceanUniforms.uReflectionStrength ? oceanUniforms.uReflectionStrength.value : -1
  });
'''
patch(return_anchor, matte_timeline + return_anchor, 'v381 matte timeline')

# Surface diagnostic mode must never be hidden behind the final photographic plate.
patch(
    '  if (photoSkySphere) photoSkySphere.visible = false;',
    '  if (photoSkySphere) photoSkySphere.visible = false;\n  if (finaleMatte) finaleMatte.visible = false;',
    'hide matte in coast diagnostics'
)

out.write_text(
    '// Scene 05 B v3.8.1 — high-resolution canonical coastline + photographic coastal matte finale.\n' + text,
    encoding='utf-8'
)
print(out)
