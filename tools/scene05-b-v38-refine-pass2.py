#!/usr/bin/env python3
from pathlib import Path

p = Path.cwd() / 'output' / 'scene05-b-v38.js'
text = p.read_text('utf-8')


def patch(old, new, label, count=1):
    global text
    n = text.count(old)
    if n < count:
        raise SystemExit(f'{label}: expected >= {count}, found {n}')
    text = text.replace(old, new, count)


# Sunset reflection should be delayed, broken and spatially broad — never a light pillar.
patch(
    '  uReflectionLength: { value: 28.0 }',
    '  uReflectionLength: { value: 28.0 },\n  uReflectionStrength: { value: 0.0 }',
    'reflection strength uniform'
)
patch(
    '    uniform float uReflectionLength;',
    '    uniform float uReflectionLength;\n    uniform float uReflectionStrength;',
    'reflection strength shader uniform'
)
patch(
    '      float path=lane*reach*(.60+.40*shimmer);',
    '''      float sparkle=.5+.5*sin(vUv.y*820.0+uTime*.45)*sin(vUv.x*560.0-uTime*.33);
      float broken=.16+.84*smoothstep(.52,.95,sparkle);
      float path=lane*reach*broken*uReflectionStrength;''',
    'broken sunset reflection'
)
patch(
    'c+=vec3(1.00,0.42,0.11)*path*warm*(0.19+0.34*shimmer);',
    'c+=vec3(1.00,0.42,0.11)*path*warm*(0.07+0.14*shimmer);',
    'restrained reflection energy'
)
patch(
    'const westSunWorld = finish.clone().add(new THREE.Vector3(-diag * .34, diag * .055, -diag * .035));',
    'const westSunWorld = finish.clone().add(new THREE.Vector3(-diag * 1.05, diag * .055, -diag * .065));',
    'distant west sun direction'
)
patch(
    'oceanUniforms.uReflectionWidth.value = diag * .052;\n  oceanUniforms.uReflectionLength.value = diag * .68;',
    'oceanUniforms.uReflectionWidth.value = diag * .095;\n  oceanUniforms.uReflectionLength.value = diag * 1.30;',
    'reflection geometry'
)

# Keep a real warm horizon band while preserving cool upper sky.
patch(
    '''        c += vec3(.24,.075,.012)*horizon*warm*.34;
        c += vec3(.52,.16,.025)*core*warm*.30;
        float upper=smoothstep(.58,.92,vUv.y);
        c=mix(c,c*vec3(.88,.96,1.08),upper*.15);''',
    '''        c += vec3(.38,.10,.015)*horizon*warm*.38;
        c += vec3(.80,.25,.040)*core*warm*.34;
        float upper=smoothstep(.58,.92,vUv.y);
        c=mix(c,c*vec3(.72,.88,1.16),upper*.25);''',
    'stronger spatial sunset contrast'
)

# Camera reaches the west horizon sooner inside the existing 22–26 second chapter.
patch(
    'const sunsetPos = finish.clone().add(new THREE.Vector3(diag * .20, diag * .095, diag * .12));',
    'const sunsetPos = finish.clone().add(new THREE.Vector3(diag * .17, diag * .070, diag * .10));',
    'lower sunset approach camera'
)
patch(
    'const sunsetTarget = finish.clone().add(new THREE.Vector3(-diag * .31, diag * .034, -diag * .028));',
    'const sunsetTarget = finish.clone().add(new THREE.Vector3(-diag * .52, diag * .030, -diag * .038));',
    'farther west sunset target'
)
patch(
    "tweenCamera(tl, 22.0, 4.0, sunsetPos, sunsetTarget, 34.0, 'power2.inOut');",
    "tweenCamera(tl, 22.0, 3.0, sunsetPos, sunsetTarget, 34.0, 'power2.out');",
    'earlier west horizon arrival'
)

# Parent the visible sun to the camera as a sky element so it cannot intersect the sea.
patch(
    '    sunSprite.position.copy(finish).add(new THREE.Vector3(-diag * .34, diag * .055, -diag * .035));',
    '''    camera.add(sunSprite);
    sunSprite.position.set(0.0, 1.12, -10.0);
    sunSprite.scale.setScalar(.38);''',
    'camera-bound horizon sun'
)
patch(
    '''  if (typeof sunSprite !== 'undefined' && sunSprite) {
    tl.to(sunSprite.material, { opacity: .58, duration: 1.8, ease: 'sine.out' }, 20.0)
      .to(sunSprite.material, { opacity: .84, duration: 1.8, ease: 'sine.inOut' }, 21.5)
      .to(sunSprite.position, { y: finish.y + diag * .043, duration: 5.2, ease: 'sine.inOut' }, 21.0)
      .to(sunSprite.material, { opacity: .52, duration: 3.0, ease: 'sine.inOut' }, 26.0);
  }''',
    '''  // v3.8 pass 2: visible sun is controlled by the final horizon override below.''',
    'remove finite-distance sun timeline'
)
patch(
    '''  if (typeof sunSprite !== 'undefined' && sunSprite) {
    tl.to(sunSprite.material, { opacity: .80, duration: 1.4, ease: 'sine.out' }, 19.8)
      .to(sunSprite.material, { opacity: .94, duration: 1.4, ease: 'sine.inOut' }, 21.2)
      .to(sunSprite.position, { y: finish.y + diag * .040, duration: 4.5, ease: 'sine.inOut' }, 21.4)
      .to(sunSprite.material, { opacity: .78, duration: 3.4, ease: 'sine.inOut' }, 26.0);
  }''',
    '''  if (typeof sunSprite !== 'undefined' && sunSprite) {
    tl.to(sunSprite.material, { opacity: .10, duration: 1.2, ease: 'sine.out' }, 21.0)
      .to(sunSprite.material, { opacity: .72, duration: 2.0, ease: 'sine.inOut' }, 22.6)
      .to(sunSprite.position, { y: 1.08, duration: 2.6, ease: 'sine.inOut' }, 22.4)
      .to(sunSprite.material, { opacity: .88, duration: 1.8, ease: 'sine.inOut' }, 24.5)
      .to(sunSprite.position, { y: 1.02, duration: 3.2, ease: 'sine.inOut' }, 25.3)
      .to(sunSprite.material, { opacity: .80, duration: 3.0, ease: 'sine.inOut' }, 27.0);
  }''',
    'final horizon sun timeline'
)

# Physical reflection fades in only as the camera approaches the actual horizon.
patch(
    '  oceanUniforms.uOpacity.value = .94;',
    '  oceanUniforms.uOpacity.value = .94;\n  oceanUniforms.uReflectionStrength.value = 0;',
    'initialize sunset reflection strength'
)
return_anchor = '  return tl;'
late_overrides = r'''  // v3.8 pass 2 — sunset readability and Finish restraint.
  tl.to(oceanUniforms.uReflectionStrength, { value: .08, duration: 1.0, ease: 'sine.inOut' }, 20.8)
    .to(oceanUniforms.uReflectionStrength, { value: .34, duration: 1.8, ease: 'sine.inOut' }, 22.2)
    .to(oceanUniforms.uReflectionStrength, { value: .62, duration: 2.0, ease: 'sine.inOut' }, 24.0)
    .to(oceanUniforms.uReflectionStrength, { value: .50, duration: 2.5, ease: 'sine.inOut' }, 27.0)
    .to(westGlow, { opacity: .23, duration: 1.8, ease: 'sine.inOut' }, 19.6)
    .to(westGlow, { opacity: .28, duration: 2.6, ease: 'sine.inOut' }, 24.0)
    .to(finishNode.userData.core.material, { opacity: .30, duration: 1.3, ease: 'sine.out' }, 20.0)
    .to(finishNode.userData.sprite.material, { opacity: .16, duration: 1.5, ease: 'sine.out' }, 20.0);

'''
patch(return_anchor, late_overrides + return_anchor, 'late sunset overrides')

# Lift the earliest peninsula read without flattening the 5–9s dawn chapter.
patch(
    '''  hemiLight.intensity = .82;
  hemiLight.color.setRGB(.62,.75,.88);''',
    '''  hemiLight.intensity = .94;
  hemiLight.color.setRGB(.67,.78,.90);
  if (typeof peninsulaSurface !== 'undefined' && peninsulaSurface) peninsulaSurface.material.color.setRGB(.80,.84,.84);
  renderer.toneMappingExposure = .92;''',
    'lift opening dawn readability'
)

# Proper unlit diagnostic material for texture/mask isolation.
patch(
    '  peninsulaSurface.userData.productionMap = texture;',
    '''  peninsulaSurface.userData.productionMap = texture;
  peninsulaSurface.userData.productionMaterial = mat;
  peninsulaSurface.userData.diagnosticMaterial = new THREE.MeshBasicMaterial({
    map: texture,
    color: 0xffffff,
    transparent: true,
    alphaTest: .42,
    depthWrite: true,
    depthTest: true,
    fog: false
  });''',
    'diagnostic material'
)
patch(
    '''  peninsulaSurface.visible = true;
  peninsulaSurface.material.color.setRGB(1,1,1);
  peninsulaSurface.material.map = mode === 'mask' ? peninsulaMaskDebugMap : peninsulaSurface.userData.productionMap;
  peninsulaSurface.material.needsUpdate = true;''',
    '''  peninsulaSurface.visible = true;
  const unlitDiagnostic = mode === 'texture' || mode === 'mask';
  peninsulaSurface.material = unlitDiagnostic
    ? peninsulaSurface.userData.diagnosticMaterial
    : peninsulaSurface.userData.productionMaterial;
  peninsulaSurface.material.color.setRGB(1,1,1);
  peninsulaSurface.material.map = mode === 'mask' ? peninsulaMaskDebugMap : peninsulaSurface.userData.productionMap;
  peninsulaSurface.material.needsUpdate = true;''',
    'unlit texture diagnostic'
)

# Center coast diagnostics on the known East starts and West Finish, not guessed axes.
patch(
    '''  } else if (mode === 'east') {
    target = southCenter.clone();
    target.x = south.max.x - southSize.x * .08;
    d = Math.max(southSize.x, southSize.z) * .46;
  } else if (mode === 'west') {
    target = southCenter.clone();
    target.x = south.min.x + southSize.x * .08;
    d = Math.max(southSize.x, southSize.z) * .46;
  }''',
    '''  } else if (mode === 'east') {
    target = average(data.starts.map(s => vec(s.position)));
    d = Math.max(southSize.x, southSize.z) * .50;
  } else if (mode === 'west') {
    target = vec(data.finish.position);
    d = Math.max(southSize.x, southSize.z) * .50;
  }''',
    'geographic coast diagnostics'
)

p.write_text(text, encoding='utf-8')
print('applied v3.8 visual refinement pass 2', p)
