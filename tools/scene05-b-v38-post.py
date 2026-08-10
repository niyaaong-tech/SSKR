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
# Sunset reflection: camera-relative, soft, and explicitly time-gated. Run82 was
# a solid beam, run84 became a shader grid, run85 became clean but too faint and
# appeared too early. The final pass keeps it absent through Finish convergence,
# then lets a restrained warm water path emerge only during the west-coast descent.
# ---------------------------------------------------------------------------
patch(
    '''  uSunDir: { value: new THREE.Vector2(1,0) },
  uReflectionWidth: { value: 4.0 },
  uReflectionLength: { value: 28.0 }''',
    '''  uSunDir: { value: new THREE.Vector2(1,0) },
  uCameraXZ: { value: new THREE.Vector2(20,0) },
  uReflectionWidth: { value: 4.0 },
  uReflectionLength: { value: 28.0 },
  uReflectionStrength: { value: 0.0 }''',
    'v38 camera-relative reflection uniforms'
)
patch(
    '''    uniform vec2 uSunDir;
    uniform float uReflectionWidth;
    uniform float uReflectionLength;''',
    '''    uniform vec2 uSunDir;
    uniform vec2 uCameraXZ;
    uniform float uReflectionWidth;
    uniform float uReflectionLength;
    uniform float uReflectionStrength;''',
    'v38 reflection shader uniforms'
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
      float width=uReflectionWidth*mix(.60,1.22,travel);
      float lane=exp(-pow(across/max(width,.001),2.0)*1.75);
      float reach=smoothstep(0.0,uReflectionLength*.08,along)*(1.0-smoothstep(uReflectionLength*.68,uReflectionLength,along));
      float path=lane*reach*(.34+.66*shimmer)*uReflectionStrength;''',
    'v38 soft time-gated sea reflection path'
)
patch(
    'c+=vec3(1.00,0.42,0.11)*path*warm*(0.19+0.34*shimmer);',
    'c+=vec3(1.00,0.40,0.085)*path*warm*(0.070+0.120*shimmer);',
    'v38 reflection energy'
)
patch(
    'c+=vec3(0.80,0.88,0.92)*path*(1.0-warm)*0.06;',
    'c+=vec3(0.80,0.88,0.92)*path*(1.0-warm)*0.0;',
    'remove legacy dawn/day reflection streak'
)

# Put the visible sun on the final sea horizon. Its XZ still comes from Finish
# geography; only the elevation is corrected from actual run85 framing.
patch(
    '''  const westSunWorld = finish.clone().add(new THREE.Vector3(-diag * .34, diag * .055, -diag * .035));
  const reflectionDir = finish.clone().sub(westSunWorld);
  oceanUniforms.uSunWorld.value.set(westSunWorld.x, westSunWorld.z);
  oceanUniforms.uSunDir.value.set(reflectionDir.x, reflectionDir.z).normalize();
  oceanUniforms.uReflectionWidth.value = diag * .052;
  oceanUniforms.uReflectionLength.value = diag * .68;''',
    '''  const westSunWorld = finish.clone().add(new THREE.Vector3(-diag * .34, diag * .070, -diag * .035));
  oceanUniforms.uSunWorld.value.set(westSunWorld.x, westSunWorld.z);
  oceanUniforms.uReflectionWidth.value = diag * .088;
  oceanUniforms.uReflectionLength.value = diag * .60;
  oceanUniforms.uReflectionStrength.value = 0.0;''',
    'v38 horizon camera-relative sunset'
)
patch(
    'sunSprite.position.copy(finish).add(new THREE.Vector3(-diag * .34, diag * .055, -diag * .035));',
    'sunSprite.position.copy(finish).add(new THREE.Vector3(-diag * .34, diag * .070, -diag * .035));',
    'v38 visible sun body on horizon'
)
patch(
    ".to(sunSprite.position, { y: finish.y + diag * .040, duration: 4.5, ease: 'sine.inOut' }, 21.4)",
    ".to(sunSprite.position, { y: finish.y + diag * .070, duration: 4.5, ease: 'sine.inOut' }, 21.4)",
    'v38 sun settles at horizon'
)
patch(
    '  oceanUniforms.uTime.value = t;',
    '  oceanUniforms.uTime.value = t;\n  oceanUniforms.uCameraXZ.value.set(camera.position.x, camera.position.z);',
    'v38 reflection follows camera'
)

# Reflection is not a Finish effect. It appears only once the camera commits to the
# west horizon (22–30s), and peaks gently around the message/hold.
patch(
    '  return tl;',
    '''  tl.to(oceanUniforms.uReflectionStrength, { value: .0, duration: .01 }, 0.0)
    .to(oceanUniforms.uReflectionStrength, { value: .10, duration: 1.2, ease: 'sine.inOut' }, 21.6)
    .to(oceanUniforms.uReflectionStrength, { value: .62, duration: 2.2, ease: 'sine.inOut' }, 22.8)
    .to(oceanUniforms.uReflectionStrength, { value: .82, duration: 2.0, ease: 'sine.inOut' }, 25.0)
    .to(oceanUniforms.uReflectionStrength, { value: .72, duration: 3.0, ease: 'sine.inOut' }, 27.0);
  return tl;''',
    'v38 sunset reflection timing'
)

# ---------------------------------------------------------------------------
# Mandatory QA framing: whole peninsula for full/land/ocean/texture/mask; tighter
# regional crops for South/East/West coast inspection.
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
print('normalized and finalized v3.8 sunset source', p)
