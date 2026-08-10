#!/usr/bin/env python3
from pathlib import Path

p = Path.cwd() / 'output' / 'scene05-b-v38.js'
text = p.read_text('utf-8')


def patch(old: str, new: str, label: str, count: int = 1):
    global text
    found = text.count(old)
    if found != count:
        raise SystemExit(f'{label}: expected {count}, found {found}')
    text = text.replace(old, new, count)


# scene05-b-source-v38.py deliberately stays a patch generator. Normalize the
# generated banner to a real line break so esbuild never sees the source body as
# part of the leading // comment.
patch('QA diagnostics.\\n', 'QA diagnostics.\n', 'v38 banner normalization')

# ---------------------------------------------------------------------------
# Run82 visual QA showed that the first world-space sunset implementation read as
# a solid laser/spotlight. Make the sea reflection camera-relative, broken by water
# ripples and significantly less emissive. Also remove the old UV-space white path
# that was visible as a diagonal streak even during dawn/day.
# ---------------------------------------------------------------------------
patch(
    '''  uSunDir: { value: new THREE.Vector2(1,0) },
  uReflectionWidth: { value: 4.0 },''',
    '''  uSunDir: { value: new THREE.Vector2(1,0) },
  uCameraXZ: { value: new THREE.Vector2(20,0) },
  uReflectionWidth: { value: 4.0 },''',
    'v38 camera-relative reflection uniform'
)
patch(
    '''    uniform vec2 uSunDir;
    uniform float uReflectionWidth;''',
    '''    uniform vec2 uSunDir;
    uniform vec2 uCameraXZ;
    uniform float uReflectionWidth;''',
    'v38 camera-relative reflection shader uniform'
)
patch(
    '''      vec2 rel=vWorld.xz-uSunWorld;
      vec2 sunDir=normalize(uSunDir+vec2(1e-5,0.0));
      float along=dot(rel,sunDir);
      float across=abs(rel.x*sunDir.y-rel.y*sunDir.x);
      float lane=pow(max(0.0,1.0-across/max(uReflectionWidth,.001)),2.7);
      float reach=smoothstep(-uReflectionLength*.10,0.0,along)*(1.0-smoothstep(uReflectionLength*.82,uReflectionLength,along));
      float path=lane*reach*(.60+.40*shimmer);''',
    '''      vec2 rel=vWorld.xz-uSunWorld;
      vec2 viewRay=normalize((uCameraXZ-uSunWorld)+vec2(1e-5,0.0));
      float along=dot(rel,viewRay);
      float across=abs(rel.x*viewRay.y-rel.y*viewRay.x);
      float travel=clamp(along/max(uReflectionLength,.001),0.0,1.0);
      float width=uReflectionWidth*mix(.52,1.10,travel);
      float lane=exp(-pow(across/max(width,.001),2.0)*2.25);
      float reach=smoothstep(0.0,uReflectionLength*.075,along)*(1.0-smoothstep(uReflectionLength*.70,uReflectionLength,along));
      float rippleA=.5+.5*sin(vWorld.x*5.3+vWorld.z*8.7+uTime*.46);
      float rippleB=.5+.5*sin(vWorld.x*12.1-vWorld.z*6.2-uTime*.33);
      float broken=smoothstep(.48,.80,rippleA*.58+rippleB*.42);
      float path=lane*reach*(.10+.90*broken)*(.32+.68*shimmer);''',
    'v38 broken sea reflection path'
)
patch(
    'c+=vec3(1.00,0.42,0.11)*path*warm*(0.19+0.34*shimmer);',
    'c+=vec3(1.00,0.40,0.085)*path*warm*(0.070+0.115*shimmer);',
    'v38 reflection energy restraint'
)
patch(
    'c+=vec3(0.80,0.88,0.92)*path*(1.0-warm)*0.06;',
    'c+=vec3(0.80,0.88,0.92)*path*(1.0-warm)*0.0;',
    'remove legacy dawn/day reflection streak'
)

# Lower the apparent sun to the horizon and make the reflected lane wider but less
# intense. Direction itself is now updated from the actual camera each frame.
patch(
    '''  const westSunWorld = finish.clone().add(new THREE.Vector3(-diag * .34, diag * .055, -diag * .035));
  const reflectionDir = finish.clone().sub(westSunWorld);
  oceanUniforms.uSunWorld.value.set(westSunWorld.x, westSunWorld.z);
  oceanUniforms.uSunDir.value.set(reflectionDir.x, reflectionDir.z).normalize();
  oceanUniforms.uReflectionWidth.value = diag * .052;
  oceanUniforms.uReflectionLength.value = diag * .68;''',
    '''  const westSunWorld = finish.clone().add(new THREE.Vector3(-diag * .34, diag * .028, -diag * .035));
  oceanUniforms.uSunWorld.value.set(westSunWorld.x, westSunWorld.z);
  oceanUniforms.uReflectionWidth.value = diag * .072;
  oceanUniforms.uReflectionLength.value = diag * .62;''',
    'v38 low horizon camera-relative sunset'
)
patch(
    'sunSprite.position.copy(finish).add(new THREE.Vector3(-diag * .34, diag * .055, -diag * .035));',
    'sunSprite.position.copy(finish).add(new THREE.Vector3(-diag * .34, diag * .028, -diag * .035));',
    'v38 lower visible sun body'
)
patch(
    ".to(sunSprite.position, { y: finish.y + diag * .040, duration: 4.5, ease: 'sine.inOut' }, 21.4)",
    ".to(sunSprite.position, { y: finish.y + diag * .018, duration: 4.5, ease: 'sine.inOut' }, 21.4)",
    'v38 sun settles on horizon'
)
patch(
    '  oceanUniforms.uTime.value = t;',
    '  oceanUniforms.uTime.value = t;\n  oceanUniforms.uCameraXZ.value.set(camera.position.x, camera.position.z);',
    'v38 reflection follows camera'
)

# ---------------------------------------------------------------------------
# The first diagnostic pass used the same tight camera for full-peninsula views,
# so the mandatory whole-peninsula surface QA was cropped. Give whole/mask/land
# modes a genuinely near-orthographic overview while retaining the tighter regional
# South/East/West crops.
# ---------------------------------------------------------------------------
patch(
    '''  camera.position.set(target.x + d * .025, target.y + d * 1.18, target.z + d * .10);
  camera.lookAt(target.x, target.y, target.z);
  camera.fov = 26.0;''',
    '''  const wholeDiagnostic = mode === 'full' || mode === 'land' || mode === 'land_ocean' || mode === 'texture' || mode === 'mask';
  const diagnosticLift = wholeDiagnostic ? 1.68 : 1.18;
  const diagnosticZ = wholeDiagnostic ? .035 : .10;
  camera.position.set(target.x + d * .012, target.y + d * diagnosticLift, target.z + d * diagnosticZ);
  camera.lookAt(target.x, target.y, target.z);
  camera.fov = wholeDiagnostic ? 32.0 : 26.0;''',
    'v38 full-surface diagnostic framing'
)

p.write_text(text, encoding='utf-8')
print('normalized and refined v3.8 generated source', p)
