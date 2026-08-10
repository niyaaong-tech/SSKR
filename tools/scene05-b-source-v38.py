#!/usr/bin/env python3
from pathlib import Path

ROOT = Path.cwd()
src = ROOT / 'output' / 'scene05-b-v37.js'
out = ROOT / 'output' / 'scene05-b-v38.js'
text = src.read_text('utf-8')


def patch(old: str, new: str, label: str, count: int = 1):
    global text
    found = text.count(old)
    if found < count:
        raise SystemExit(f'{label}: expected >= {count}, found {found}')
    text = text.replace(old, new, count)


# 1) v3.8 surface and coastline sampling.
patch('./assets/peninsula_surface_v36.png', './assets/peninsula_surface_v38.png', 'v38 surface texture')

patch(
    "  loadTexture('./assets/road_choice_overlay_v31.png'),\n  loadTexture('./assets/sky_dawn_v37.jpg'),",
    "  loadTexture('./assets/road_choice_overlay_v31.png'),\n  loadTexture('./assets/peninsula_mask_debug_v38.png'),\n  loadTexture('./assets/sky_dawn_v37.jpg'),",
    'load canonical mask debug texture'
)
patch(
    "]).then(([gltf, dawnTex, dayTex, sunsetTex, coastTex, peninsulaTex, roadOverlayTex, photoDawnTex, photoSunsetTex, photoCloudTex, peninsulaMeta, data]) => {",
    "]).then(([gltf, dawnTex, dayTex, sunsetTex, coastTex, peninsulaTex, roadOverlayTex, peninsulaMaskTex, photoDawnTex, photoSunsetTex, photoCloudTex, peninsulaMeta, data]) => {",
    'v38 asset destructuring'
)

patch(
    'let peninsulaSurfaceBounds = null;',
    '''let peninsulaSurfaceBounds = null;
let peninsulaMaskDebugMap = null;
const hemiLight = new THREE.HemisphereLight(0xbfd7e8, 0x344235, .82);
const sunLight = new THREE.DirectionalLight(0xffd3a0, .34);
sunLight.position.set(-28, 34, -8);
sunLight.target.position.set(0, 0, 0);
scene.add(hemiLight, sunLight, sunLight.target);''',
    'v38 spatial lighting globals'
)

patch(
    '''  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const mat = new THREE.MeshBasicMaterial({ map: texture, color: 0x9fb1a5, transparent: true, alphaTest: .012, depthWrite: true, depthTest: true, fog: true });''',
    '''  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  geo.computeVertexNormals();
  const mat = new THREE.MeshStandardMaterial({
    map: texture,
    color: 0x9fb1a5,
    roughness: .94,
    metalness: 0,
    transparent: true,
    alphaTest: .42,
    depthWrite: true,
    depthTest: true,
    fog: true
  });''',
    'v38 coastline-safe lit surface material'
)

patch(
    '  buildPeninsulaSurface(peninsulaMeta, peninsulaTex);\n  buildPhotoEnvironment(photoDawnTex, photoSunsetTex, photoCloudTex);',
    '''  peninsulaMaskTex.colorSpace = THREE.SRGBColorSpace;
  peninsulaMaskTex.generateMipmaps = false;
  peninsulaMaskTex.minFilter = THREE.NearestFilter;
  peninsulaMaskTex.magFilter = THREE.NearestFilter;
  peninsulaMaskTex.needsUpdate = true;
  peninsulaMaskDebugMap = peninsulaMaskTex;
  buildPeninsulaSurface(peninsulaMeta, peninsulaTex);
  buildPhotoEnvironment(photoDawnTex, photoSunsetTex, photoCloudTex);''',
    'v38 mask setup'
)

# 2) World-space West Sea sunset reflection.
patch(
    '  uTerrainBounds: { value: new THREE.Vector4(-34,34,-34,34) }',
    '''  uTerrainBounds: { value: new THREE.Vector4(-34,34,-34,34) },
  uSunWorld: { value: new THREE.Vector2(-20,0) },
  uSunDir: { value: new THREE.Vector2(1,0) },
  uReflectionWidth: { value: 4.0 },
  uReflectionLength: { value: 28.0 }''',
    'v38 ocean sunset uniforms'
)
patch(
    '''    uniform sampler2D uCoastMap;
    uniform vec4 uTerrainBounds;''',
    '''    uniform sampler2D uCoastMap;
    uniform vec4 uTerrainBounds;
    uniform vec2 uSunWorld;
    uniform vec2 uSunDir;
    uniform float uReflectionWidth;
    uniform float uReflectionLength;''',
    'v38 ocean shader uniforms'
)
patch(
    '''      float sunX=mix(0.82,0.16,smoothstep(1.15,2.05,uPhase));
      float path=pow(max(0.0,1.0-abs(vUv.x-sunX)*5.0),3.2);
      path*=0.35+0.65*pow(max(0.0,1.0-abs(vUv.y-0.53)*1.8),2.0);''',
    '''      vec2 rel=vWorld.xz-uSunWorld;
      vec2 sunDir=normalize(uSunDir+vec2(1e-5,0.0));
      float along=dot(rel,sunDir);
      float across=abs(rel.x*sunDir.y-rel.y*sunDir.x);
      float lane=pow(max(0.0,1.0-across/max(uReflectionWidth,.001)),2.7);
      float reach=smoothstep(-uReflectionLength*.10,0.0,along)*(1.0-smoothstep(uReflectionLength*.82,uReflectionLength,along));
      float path=lane*reach*(.60+.40*shimmer);''',
    'v38 spatial reflection lane'
)
patch(
    'c+=vec3(0.98,0.47,0.18)*path*warm*(0.12+0.22*shimmer);',
    'c+=vec3(1.00,0.42,0.11)*path*warm*(0.19+0.34*shimmer);',
    'v38 sunset reflection energy'
)

# 3) Photo sky: explicit warm horizon, cool upper sky.
patch(
    '''        float horizon=1.0-smoothstep(.0,.32,abs(vUv.y-.50));
        float warm=smoothstep(.42,1.0,uMix);
        c += vec3(.10,.035,.008)*horizon*warm*.22;''',
    '''        float hdist=abs(vUv.y-.50);
        float horizon=1.0-smoothstep(.015,.30,hdist);
        float core=1.0-smoothstep(.010,.080,hdist);
        float warm=smoothstep(.42,1.0,uMix);
        c += vec3(.24,.075,.012)*horizon*warm*.34;
        c += vec3(.52,.16,.025)*core*warm*.30;
        float upper=smoothstep(.58,.92,vUv.y);
        c=mix(c,c*vec3(.88,.96,1.08),upper*.15);''',
    'v38 spatial sunset sky'
)

# 4) Bind reflection/light direction to actual Finish geography.
patch(
    '  const finish = vec(data.finish.position);',
    '''  const finish = vec(data.finish.position);
  const westSunWorld = finish.clone().add(new THREE.Vector3(-diag * .34, diag * .055, -diag * .035));
  const reflectionDir = finish.clone().sub(westSunWorld);
  oceanUniforms.uSunWorld.value.set(westSunWorld.x, westSunWorld.z);
  oceanUniforms.uSunDir.value.set(reflectionDir.x, reflectionDir.z).normalize();
  oceanUniforms.uReflectionWidth.value = diag * .052;
  oceanUniforms.uReflectionLength.value = diag * .68;
  sunLight.target.position.copy(finish);''',
    'v38 finish-bound spatial light'
)

patch(
    '    sunSprite.position.copy(finish).add(new THREE.Vector3(-diag * .30, diag * .060, -diag * .028));',
    '    sunSprite.position.copy(finish).add(new THREE.Vector3(-diag * .34, diag * .055, -diag * .035));',
    'v38 horizon sun position'
)

patch(
    "  tl.to(scene.background, { r: .23, g: .105, b: .12, duration: 3.8, ease: 'sine.inOut' }, 25.7)",
    "  tl.to(scene.background, { r: .18, g: .15, b: .20, duration: 3.8, ease: 'sine.inOut' }, 25.7)",
    'v38 final luminous background'
)
patch(
    ".to(westGlow, { opacity: .64, duration: 3.6, ease: 'sine.inOut' }, 25.7)",
    ".to(westGlow, { opacity: .46, duration: 3.6, ease: 'sine.inOut' }, 25.7)",
    'v38 screen glow restraint'
)

return_anchor = '  return tl;'
lighting_override = r'''  // v3.8 physical light story: cool dawn -> neutral day -> low warm west sun.
  hemiLight.intensity = .82;
  hemiLight.color.setRGB(.62,.75,.88);
  hemiLight.groundColor.setRGB(.20,.25,.20);
  sunLight.intensity = .30;
  sunLight.color.setRGB(1.0,.72,.48);
  sunLight.position.set(center.x + diag * .24, center.y + diag * .58, center.z + diag * .30);

  tl.to(hemiLight, { intensity: .96, duration: 4.0, ease: 'sine.inOut' }, 5.0)
    .to(hemiLight.color, { r: .72, g: .82, b: .90, duration: 4.0 }, 5.0)
    .to(sunLight, { intensity: .48, duration: 4.0, ease: 'sine.inOut' }, 5.0)
    .to(hemiLight, { intensity: 1.10, duration: 5.0, ease: 'sine.inOut' }, 9.0)
    .to(hemiLight.color, { r: .82, g: .88, b: .91, duration: 5.0 }, 9.0)
    .to(sunLight, { intensity: .66, duration: 5.0, ease: 'sine.inOut' }, 9.0)
    .to(sunLight.color, { r: 1.0, g: .91, b: .76, duration: 5.0 }, 9.0)
    .to(hemiLight, { intensity: .82, duration: 4.0, ease: 'sine.inOut' }, 14.0)
    .to(hemiLight.color, { r: .62, g: .70, b: .80, duration: 4.0 }, 14.0)
    .to(sunLight, { intensity: 1.18, duration: 4.0, ease: 'sine.inOut' }, 14.0)
    .to(sunLight.color, { r: 1.0, g: .65, b: .35, duration: 4.0 }, 14.0)
    .to(sunLight.position, { x: westSunWorld.x, y: finish.y + diag * .12, z: westSunWorld.z, duration: 4.0, ease: 'sine.inOut' }, 14.0)
    .to(hemiLight, { intensity: .72, duration: 4.0, ease: 'sine.inOut' }, 18.0)
    .to(sunLight, { intensity: 1.42, duration: 4.0, ease: 'sine.inOut' }, 18.0)
    .to(sunLight.color, { r: 1.0, g: .50, b: .22, duration: 4.0 }, 18.0)
    .to(renderer, { toneMappingExposure: 1.02, duration: 3.6, ease: 'sine.inOut' }, 20.0)
    .to(renderer, { toneMappingExposure: 1.04, duration: 4.0, ease: 'sine.inOut' }, 24.0);

  if (typeof sunSprite !== 'undefined' && sunSprite) {
    tl.to(sunSprite.material, { opacity: .80, duration: 1.4, ease: 'sine.out' }, 19.8)
      .to(sunSprite.material, { opacity: .94, duration: 1.4, ease: 'sine.inOut' }, 21.2)
      .to(sunSprite.position, { y: finish.y + diag * .040, duration: 4.5, ease: 'sine.inOut' }, 21.4)
      .to(sunSprite.material, { opacity: .78, duration: 3.4, ease: 'sine.inOut' }, 26.0);
  }

'''
patch(return_anchor, lighting_override + return_anchor, 'v38 physical light timeline')

# 5) QA-only surface/coast diagnostic modes.
diagnostic_anchor = 'function showStatic(data) {'
diagnostics = r'''function showDiagnostic(data, mode='full') {
  if (timeline) timeline.pause();

  const groups = [
    (typeof roadChoiceGroup !== 'undefined' ? roadChoiceGroup : null),
    (typeof choiceGlowGroup !== 'undefined' ? choiceGlowGroup : null),
    (typeof choiceRouteGroup !== 'undefined' ? choiceRouteGroup : null),
    (typeof explorationGlowGroup !== 'undefined' ? explorationGlowGroup : null),
    (typeof explorationRouteGroup !== 'undefined' ? explorationRouteGroup : null),
    (typeof riderTrailGlowGroup !== 'undefined' ? riderTrailGlowGroup : null),
    (typeof riderTrailRouteGroup !== 'undefined' ? riderTrailRouteGroup : null),
    routeGlowGroup, routeGroup, seedGroup, mergedGroup, convergenceGroup,
    nodeGroup, checkpointGroup, cloudGroup, festivalGroup, fireworkGroup
  ].filter(Boolean);
  groups.forEach(g => g.visible = false);
  terrainGroup.visible = false;
  peninsulaSurfaceGroup.visible = true;

  gsap.set(overviewLayer, { opacity: 0 });
  gsap.set(statement, { opacity: 0 });
  gsap.set(sceneMark, { opacity: 0 });
  gsap.set(lightWash, { opacity: 0 });
  if (typeof dawnGrade !== 'undefined' && dawnGrade) gsap.set(dawnGrade, { opacity: 0 });
  gsap.set([skyNight, skyDawn, skyDay, skySunset, skyBluehour, eastGlow, westGlow], { opacity: 0 });

  if (photoSkySphere) photoSkySphere.visible = false;
  photoCloudPlanes.forEach(p => p.visible = false);
  if (typeof sunSprite !== 'undefined' && sunSprite) sunSprite.visible = false;

  scene.background.setRGB(.32,.37,.40);
  scene.fog.density = 0;
  renderer.toneMappingExposure = 1.0;
  hemiLight.intensity = 1.12;
  hemiLight.color.setRGB(.82,.88,.92);
  hemiLight.groundColor.setRGB(.30,.34,.29);
  sunLight.intensity = .54;
  sunLight.color.setRGB(1.0,.94,.82);

  peninsulaSurface.visible = true;
  peninsulaSurface.material.color.setRGB(1,1,1);
  peninsulaSurface.material.map = mode === 'mask' ? peninsulaMaskDebugMap : peninsulaSurface.userData.productionMap;
  peninsulaSurface.material.needsUpdate = true;

  const whole = peninsulaSurfaceBounds.clone();
  const south = terrainBounds.clone();
  const wholeCenter = whole.getCenter(new THREE.Vector3());
  const wholeSize = whole.getSize(new THREE.Vector3());
  const southCenter = south.getCenter(new THREE.Vector3());
  const southSize = south.getSize(new THREE.Vector3());

  let target = wholeCenter.clone();
  let d = Math.max(wholeSize.x, wholeSize.z);
  if (mode === 'south') {
    target = southCenter.clone();
    d = Math.max(southSize.x, southSize.z) * .76;
  } else if (mode === 'east') {
    target = southCenter.clone();
    target.x = south.max.x - southSize.x * .08;
    d = Math.max(southSize.x, southSize.z) * .46;
  } else if (mode === 'west') {
    target = southCenter.clone();
    target.x = south.min.x + southSize.x * .08;
    d = Math.max(southSize.x, southSize.z) * .46;
  }

  const landOnly = mode === 'land' || mode === 'texture' || mode === 'mask';
  ocean.visible = !landOnly;
  oceanUniforms.uPhase.value = 1.0;
  oceanUniforms.uOpacity.value = .94;

  camera.position.set(target.x + d * .025, target.y + d * 1.18, target.z + d * .10);
  camera.lookAt(target.x, target.y, target.z);
  camera.fov = 26.0;
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld(true);
  frame.classList.add('ready');
}

'''
patch(diagnostic_anchor, diagnostics + diagnostic_anchor, 'v38 QA diagnostic function')

patch(
    '  peninsulaSurface = mesh;',
    '  peninsulaSurface = mesh;\n  peninsulaSurface.userData.productionMap = texture;',
    'v38 production surface map handle'
)
patch(
    "  frame.classList.add('ready');",
    "  window.__scene05Diagnostic = mode => showDiagnostic(data, mode);\n  frame.classList.add('ready');",
    'v38 diagnostic API'
)

out.write_text(
    '// Scene 05 B v3.8 — peninsula surface overhaul, coastline sampling fix, spatial West Sea sunset and QA diagnostics.\\n'
    + text,
    encoding='utf-8'
)
print(out)
