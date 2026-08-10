#!/usr/bin/env python3
from pathlib import Path

ROOT = Path.cwd()
src = ROOT / 'output' / 'scene05-b-v36.js'
out = ROOT / 'output' / 'scene05-b-v37.js'
text = src.read_text('utf-8')


def patch(old, new, label, count=1):
    global text
    n = text.count(old)
    if n < count:
        raise SystemExit(f'{label}: expected >= {count}, found {n}')
    text = text.replace(old, new, count)


# ---------------------------------------------------------------------------
# 1) Lightweight photographic environment assets.
# ---------------------------------------------------------------------------
patch(
"""  loadTexture('./assets/road_choice_overlay_v31.png'),
  loadJSON('./assets/peninsula_surface_v34.json'),""",
"""  loadTexture('./assets/road_choice_overlay_v31.png'),
  loadTexture('./assets/sky_dawn_v37.jpg'),
  loadTexture('./assets/sky_sunset_v37.jpg'),
  loadTexture('./assets/cloud_veil_v37.png'),
  loadJSON('./assets/peninsula_surface_v34.json'),""",
'load v37 atmosphere resources'
)
patch(
"]).then(([gltf, dawnTex, dayTex, sunsetTex, coastTex, peninsulaTex, roadOverlayTex, peninsulaMeta, data]) => {",
"]).then(([gltf, dawnTex, dayTex, sunsetTex, coastTex, peninsulaTex, roadOverlayTex, photoDawnTex, photoSunsetTex, photoCloudTex, peninsulaMeta, data]) => {",
'v37 atmosphere destructuring'
)
patch(
'let peninsulaSurfaceBounds = null;',
'''let peninsulaSurfaceBounds = null;
let photoSkySphere = null;
let photoSkyUniforms = null;
const photoCloudPlanes = [];''',
'v37 environment globals'
)

helper_anchor = 'function vec(a) { return new THREE.Vector3(a[0], a[1], a[2]); }'
helpers = r'''function buildPhotoEnvironment(dawnTex, sunsetTex, cloudTex) {
  dawnTex.wrapS = THREE.RepeatWrapping;
  dawnTex.wrapT = THREE.ClampToEdgeWrapping;
  sunsetTex.wrapS = THREE.RepeatWrapping;
  sunsetTex.wrapT = THREE.ClampToEdgeWrapping;
  dawnTex.colorSpace = THREE.SRGBColorSpace;
  sunsetTex.colorSpace = THREE.SRGBColorSpace;

  photoSkyUniforms = {
    uDawn: { value: dawnTex },
    uSunset: { value: sunsetTex },
    uMix: { value: 0 },
    uOpacity: { value: .42 },
    uIntensity: { value: .82 },
    uRotation: { value: .08 }
  };
  const skyMat = new THREE.ShaderMaterial({
    uniforms: photoSkyUniforms,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    side: THREE.BackSide,
    fog: false,
    toneMapped: false,
    vertexShader: `
      varying vec2 vUv;
      void main(){
        vUv=uv;
        gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D uDawn;
      uniform sampler2D uSunset;
      uniform float uMix;
      uniform float uOpacity;
      uniform float uIntensity;
      uniform float uRotation;
      varying vec2 vUv;
      void main(){
        vec2 uv=vec2(fract(1.0-vUv.x+uRotation),clamp(vUv.y,0.0,1.0));
        vec3 dawn=texture2D(uDawn,uv).rgb;
        vec3 sunset=texture2D(uSunset,uv).rgb;
        vec3 c=mix(dawn,sunset,smoothstep(0.0,1.0,uMix));
        float horizon=1.0-smoothstep(.0,.32,abs(vUv.y-.50));
        float warm=smoothstep(.42,1.0,uMix);
        c += vec3(.10,.035,.008)*horizon*warm*.22;
        gl_FragColor=vec4(c*uIntensity,uOpacity);
      }
    `
  });
  photoSkySphere = new THREE.Mesh(new THREE.SphereGeometry(215, 48, 24), skyMat);
  photoSkySphere.frustumCulled = false;
  photoSkySphere.renderOrder = -20;
  scene.add(photoSkySphere);

  cloudTex.wrapS = THREE.RepeatWrapping;
  cloudTex.wrapT = THREE.ClampToEdgeWrapping;
  cloudTex.colorSpace = THREE.SRGBColorSpace;
  const b = peninsulaSurfaceBounds || terrainBounds;
  const c = b ? b.getCenter(new THREE.Vector3()) : new THREE.Vector3();
  const s = b ? b.getSize(new THREE.Vector3()) : new THREE.Vector3(70, 1, 70);
  const d = Math.max(s.x, s.z, 58);
  const defs = [
    { x: -.10, z: -.08, y: 3.6, rz: -.12, scale: 1.34, tint: 0xe7eef1 },
    { x: .18, z: .10, y: 5.1, rz: .18, scale: 1.08, tint: 0xf2eee8 }
  ];
  defs.forEach((def, i) => {
    const mat = new THREE.MeshBasicMaterial({
      map: cloudTex,
      color: def.tint,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      depthTest: false,
      side: THREE.DoubleSide,
      fog: false
    });
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(d * 1.55 * def.scale, d * .66 * def.scale), mat);
    plane.rotation.x = -Math.PI / 2;
    plane.rotation.z = def.rz;
    plane.position.set(c.x + d * def.x, c.y + def.y, c.z + d * def.z);
    plane.renderOrder = 6;
    plane.userData = {
      baseX: plane.position.x,
      baseZ: plane.position.z,
      phase: i * 1.7,
      speed: .017 + i * .006
    };
    photoCloudPlanes.push(plane);
    scene.add(plane);
  });
}

'''
patch(helper_anchor, helpers + helper_anchor, 'v37 photo environment helpers')
patch(
'  buildPeninsulaSurface(peninsulaMeta, peninsulaTex);',
'  buildPeninsulaSurface(peninsulaMeta, peninsulaTex);\n  buildPhotoEnvironment(photoDawnTex, photoSunsetTex, photoCloudTex);',
'build v37 environment'
)
patch('  buildClouds(terrainBounds);', '  buildClouds(terrainBounds);\n  cloudGroup.visible = false;', 'disable legacy painted clouds')

# ---------------------------------------------------------------------------
# 2) Water polish against the current v2.6+ ocean shader.
# ---------------------------------------------------------------------------
patch(
'''      vec3 dawn=vec3(0.025,0.090,0.145);
      vec3 day=vec3(0.022,0.135,0.225);
      vec3 sunset=vec3(0.040,0.070,0.125);
      vec3 night=vec3(0.010,0.026,0.058);''',
'''      vec3 dawn=vec3(0.020,0.078,0.128);
      vec3 day=vec3(0.024,0.162,0.270);
      vec3 sunset=vec3(0.054,0.068,0.112);
      vec3 night=vec3(0.010,0.026,0.052);''',
'v37 ocean palette'
)
patch(
'float micro=sin(vUv.x*173.0+vUv.y*61.0+uTime*0.29)*sin(vUv.y*139.0-vUv.x*37.0-uTime*0.19);',
'float micro=sin(vUv.x*92.0+vUv.y*31.0+uTime*0.22)*sin(vUv.y*74.0-vUv.x*21.0-uTime*0.15);',
'v37 softer sea microstructure'
)
# v2.7 already removed the conspicuous broad sine band; keep it at zero.
patch('float path=pow(max(0.0,1.0-abs(vUv.x-sunX)*7.5),4.0);',
      'float path=pow(max(0.0,1.0-abs(vUv.x-sunX)*5.0),3.2);',
      'v37 broader sunset reflection')
patch('c+=vec3(0.98,0.47,0.18)*path*warm*(0.18+0.32*shimmer);',
      'c+=vec3(0.98,0.47,0.18)*path*warm*(0.12+0.22*shimmer);',
      'v37 restrained reflection intensity')

# ---------------------------------------------------------------------------
# 3) Refine Start / Finish graphics while retaining v3.5 choreography.
# ---------------------------------------------------------------------------
patch(
"nodeOpacity(tl, n, t, { core: .96, ring: .52, glow: .62, duration: .20 });",
"nodeOpacity(tl, n, t, { core: .94, ring: .38, glow: .46, duration: .20 });",
'v37 start pulse restraint'
)
patch(
"nodeOpacity(tl, finishNode, 18.78, { core: .94, ring: .70, glow: .62, duration: .42 });",
"nodeOpacity(tl, finishNode, 18.78, { core: .92, ring: .56, glow: .48, duration: .42 });",
'v37 finish pulse restraint'
)
patch(
"{ x: 4.8, y: 4.8, z: 4.8, duration: 1.55, ease: 'power2.out' }",
"{ x: 4.1, y: 4.1, z: 4.1, duration: 1.55, ease: 'power2.out' }",
'v37 finish wave scale'
)

# ---------------------------------------------------------------------------
# 4) Photo-sky / cloud timeline: dawn -> restrained day -> sunset reveal.
# ---------------------------------------------------------------------------
reset_anchor = '  bloom.strength = .52;'
reset_block = '''  bloom.strength = .52;
  if (photoSkyUniforms) {
    photoSkyUniforms.uMix.value = 0;
    photoSkyUniforms.uOpacity.value = .44;
    photoSkyUniforms.uIntensity.value = .78;
    photoSkyUniforms.uRotation.value = .08;
  }
  photoCloudPlanes.forEach((p, i) => { p.material.opacity = i ? .025 : .040; });'''
patch(reset_anchor, reset_block, 'v37 environment reset')

camera_anchor = "  tweenCamera(tl, 0, 3.0, introEnd, introTarget, 35.5, 'sine.inOut');"
photo_intro = camera_anchor + '''
  if (photoSkyUniforms) {
    tl.to(photoSkyUniforms.uOpacity, { value: .52, duration: 3.0, ease: 'sine.inOut' }, 0)
      .to(photoSkyUniforms.uIntensity, { value: .84, duration: 3.0, ease: 'sine.inOut' }, 0);
  }
  photoCloudPlanes.forEach((p, i) => tl.to(p.material, { opacity: i ? .040 : .065, duration: 3.2 }, .25 + i * .18));'''
patch(camera_anchor, photo_intro, 'v37 dawn photographic atmosphere')

route_anchor = "  tweenCamera(tl, 9.0, 10.0, routeRevealPos, routeRevealTarget, 37.5, 'sine.inOut');"
photo_route = '''  if (photoSkyUniforms) {
    tl.to(photoSkyUniforms.uOpacity, { value: .16, duration: 4.4, ease: 'sine.inOut' }, 9.0)
      .to(photoSkyUniforms.uMix, { value: .18, duration: 4.4, ease: 'sine.inOut' }, 9.0)
      .to(photoSkyUniforms.uIntensity, { value: .92, duration: 4.2, ease: 'sine.inOut' }, 9.0)
      .to(photoSkyUniforms.uMix, { value: .72, duration: 4.2, ease: 'sine.inOut' }, 14.6)
      .to(photoSkyUniforms.uOpacity, { value: .34, duration: 3.8, ease: 'sine.inOut' }, 15.0);
  }
  photoCloudPlanes.forEach((p, i) => {
    tl.to(p.material, { opacity: i ? .018 : .032, duration: 3.7 }, 9.1 + i * .12)
      .to(p.material, { opacity: i ? .040 : .055, duration: 3.4 }, 15.0 + i * .10);
  });
''' + route_anchor
patch(route_anchor, photo_route, 'v37 journey photo atmosphere')

finish_anchor = "  tweenCamera(tl, 19.0, 3.0, finishOverviewPos, finishOverviewTarget, 34.0, 'power2.inOut');"
photo_finish = finish_anchor + '''
  if (photoSkyUniforms) {
    tl.to(photoSkyUniforms.uMix, { value: 1.0, duration: 3.2, ease: 'sine.inOut' }, 17.0)
      .to(photoSkyUniforms.uOpacity, { value: .78, duration: 4.0, ease: 'sine.inOut' }, 17.2)
      .to(photoSkyUniforms.uIntensity, { value: .94, duration: 4.0, ease: 'sine.inOut' }, 17.2)
      .to(photoSkyUniforms.uOpacity, { value: .94, duration: 3.5, ease: 'sine.inOut' }, 21.2);
  }
  photoCloudPlanes.forEach((p, i) => tl.to(p.material, { opacity: i ? .060 : .078, duration: 3.8 }, 17.2 + i * .10));'''
patch(finish_anchor, photo_finish, 'v37 sunset photo atmosphere')

# Fade photographic cloud overlay for the core message.
message_anchor = "tl.to(statement, { opacity: .97, clipPath: 'inset(0 0% 0 0)', filter: 'blur(0px)', letterSpacing: '0em', duration: 2.3, ease: 'power2.out' }, 26.0)"
if message_anchor in text:
    patch(message_anchor, "photoCloudPlanes.forEach((p, i) => tl.to(p.material, { opacity: i ? .018 : .026, duration: 2.4 }, 25.6 + i * .08));\n  " + message_anchor, 'v37 message cloud restraint')

static_anchor = 'function showStatic(data) {'
patch(static_anchor, static_anchor + "\n  if (photoSkyUniforms) { photoSkyUniforms.uMix.value=.35; photoSkyUniforms.uOpacity.value=.20; photoSkyUniforms.uIntensity.value=.90; }\n  photoCloudPlanes.forEach((p,i)=>p.material.opacity=i?.018:.028);", 'v37 static atmosphere')

render_anchor = '  oceanUniforms.uTime.value = t;'
render_block = '''  oceanUniforms.uTime.value = t;
  if (photoSkySphere) photoSkySphere.position.copy(camera.position);
  photoCloudPlanes.forEach((p, i) => {
    const u = p.userData;
    p.position.x = u.baseX + Math.sin(t * u.speed + u.phase) * (1.3 + i * .5);
    p.position.z = u.baseZ + Math.cos(t * u.speed * .71 + u.phase) * (.9 + i * .35);
  });'''
patch(render_anchor, render_block, 'v37 environment render updates')

out.write_text('// Scene 05 B v3.7 — lightweight CC0 photographic sky/cloud resources, softer sea reflection and restrained presentation FX.\n' + text, encoding='utf-8')
print(out)
