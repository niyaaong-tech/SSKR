import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
  EffectComposer,
  EffectPass,
  NormalPass,
  RenderPass,
  ToneMappingEffect,
  ToneMappingMode
} from 'postprocessing';
import {
  AerialPerspectiveEffect,
  PrecomputedTexturesGenerator,
  getSunDirectionECEF
} from '@takram/three-atmosphere';
import {
  CloudsEffect,
  CLOUD_SHAPE_TEXTURE_SIZE,
  CLOUD_SHAPE_DETAIL_TEXTURE_SIZE
} from '@takram/three-clouds';
import {
  DataTextureLoader,
  parseUint8Array,
  STBNLoader
} from '@takram/three-geospatial';

const $ = (s) => document.querySelector(s);
const stage = $('#stage');
const statusEl = $('#status');
const diagEl = $('#diag');
const errorBox = $('#error');

const ASSET = './assets/';
const TERRAIN_URL = ASSET + 'terrain_lod.glb';
const ALBEDO_URL = ASSET + 'albedo.png';
const CLOUD_LOCAL_URL = ASSET + 'clouds/local_weather.png';
const CLOUD_SHAPE_URL = ASSET + 'clouds/shape.bin';
const CLOUD_DETAIL_URL = ASSET + 'clouds/shape_detail.bin';
const CLOUD_TURB_URL = ASSET + 'clouds/turbulence.png';
const STBN_URL = ASSET + 'core/stbn.bin';

const CENTER_LON = THREE.MathUtils.degToRad(127.6);
const CENTER_LAT = THREE.MathUtils.degToRad(36.0);
const SCENE_M_PER_UNIT = 10000;
const MOBILE = matchMedia('(max-width: 900px)').matches || /iPhone|iPad|Android/i.test(navigator.userAgent);

function phase(text) {
  statusEl.textContent = text;
  console.log('[SSKR ENV POC]', text);
}
function fail(err) {
  console.error(err);
  statusEl.textContent = 'FAILED';
  errorBox.style.display = 'block';
  errorBox.textContent = String(err?.stack || err);
}
function loadTexture(url, { srgb = false } = {}) {
  return new Promise((resolve, reject) => {
    new THREE.TextureLoader().load(url, (t) => {
      if (srgb) t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 4;
      resolve(t);
    }, undefined, reject);
  });
}
function ecef(lon, lat, h = 0) {
  const a = 6378137.0;
  const e2 = 6.69437999014e-3;
  const sl = Math.sin(lat), cl = Math.cos(lat), so = Math.sin(lon), co = Math.cos(lon);
  const n = a / Math.sqrt(1 - e2 * sl * sl);
  return new THREE.Vector3(
    (n + h) * cl * co,
    (n + h) * cl * so,
    (n * (1 - e2) + h) * sl
  );
}
function basis(lon, lat) {
  const sl = Math.sin(lat), cl = Math.cos(lat), so = Math.sin(lon), co = Math.cos(lon);
  return {
    east: new THREE.Vector3(-so, co, 0),
    north: new THREE.Vector3(-sl * co, -sl * so, cl),
    up: new THREE.Vector3(cl * co, cl * so, sl)
  };
}
const origin = ecef(CENTER_LON, CENTER_LAT);
const B = basis(CENTER_LON, CENTER_LAT);

function localToECEF(x, y, z) {
  return origin.clone()
    .addScaledVector(B.east, x * SCENE_M_PER_UNIT)
    .addScaledVector(B.up, y * SCENE_M_PER_UNIT)
    .addScaledVector(B.north, -z * SCENE_M_PER_UNIT);
}
function enuTransform() {
  const s = SCENE_M_PER_UNIT;
  const m = new THREE.Matrix4();
  m.set(
    B.east.x * s, B.up.x * s, -B.north.x * s, origin.x,
    B.east.y * s, B.up.y * s, -B.north.y * s, origin.y,
    B.east.z * s, B.up.z * s, -B.north.z * s, origin.z,
    0, 0, 0, 1
  );
  return m;
}
async function load3D(url, size) {
  return new Promise((resolve, reject) => {
    new DataTextureLoader(THREE.Data3DTexture, parseUint8Array, {
      width: size,
      height: size,
      depth: size
    }).load(url, (t) => {
      t.format = THREE.RedFormat;
      t.minFilter = THREE.LinearFilter;
      t.magFilter = THREE.LinearFilter;
      t.wrapS = t.wrapT = t.wrapR = THREE.RepeatWrapping;
      t.colorSpace = THREE.NoColorSpace;
      t.needsUpdate = true;
      resolve(t);
    }, undefined, reject);
  });
}
async function loadCloudAssets(clouds, aerial) {
  phase('LOAD CLOUD VOLUMES');
  const local = await loadTexture(CLOUD_LOCAL_URL);
  local.minFilter = THREE.LinearMipMapLinearFilter;
  local.magFilter = THREE.LinearFilter;
  local.wrapS = local.wrapT = THREE.RepeatWrapping;
  local.colorSpace = THREE.NoColorSpace;
  local.needsUpdate = true;
  clouds.localWeatherTexture = local;

  clouds.shapeTexture = await load3D(CLOUD_SHAPE_URL, CLOUD_SHAPE_TEXTURE_SIZE);
  clouds.shapeDetailTexture = await load3D(CLOUD_DETAIL_URL, CLOUD_SHAPE_DETAIL_TEXTURE_SIZE);

  const turbulence = await loadTexture(CLOUD_TURB_URL);
  turbulence.minFilter = THREE.LinearMipMapLinearFilter;
  turbulence.magFilter = THREE.LinearFilter;
  turbulence.wrapS = turbulence.wrapT = THREE.RepeatWrapping;
  turbulence.colorSpace = THREE.NoColorSpace;
  turbulence.needsUpdate = true;
  clouds.turbulenceTexture = turbulence;

  const stbn = await new Promise((resolve, reject) => {
    new STBNLoader().load(STBN_URL, resolve, undefined, reject);
  });
  clouds.stbnTexture = stbn;
  aerial.stbnTexture = stbn;
}

async function main() {
  phase('CREATE WEBGL');
  const renderer = new THREE.WebGLRenderer({
    antialias: !MOBILE,
    depth: false,
    logarithmicDepthBuffer: false,
    powerPreference: 'high-performance'
  });
  if (!renderer.capabilities.isWebGL2) {
    throw new Error('WebGL2 is required for volumetric cloud textures.');
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, MOBILE ? 1.0 : 1.35));
  renderer.setSize(innerWidth, innerHeight);
  renderer.toneMapping = THREE.NoToneMapping;
  renderer.toneMappingExposure = 8.0;
  stage.appendChild(renderer.domElement);

  const gl = renderer.getContext();
  diagEl.textContent = `${MOBILE ? 'mobile' : 'desktop'} · ${gl.getParameter(gl.RENDERER)}`;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, innerWidth / innerHeight, 100, 2500000);
  const target = localToECEF(0, 0, -1);
  camera.position.copy(localToECEF(20, 34, 48));
  camera.up.copy(B.up);
  camera.lookAt(target);
  camera.updateMatrixWorld(true);

  phase('LOAD SSKR TERRAIN');
  const [gltf, albedo] = await Promise.all([
    new Promise((resolve, reject) => new GLTFLoader().load(TERRAIN_URL, resolve, undefined, reject)),
    loadTexture(ALBEDO_URL, { srgb: true })
  ]);

  const terrain = gltf.scene;
  terrain.matrixAutoUpdate = false;
  terrain.matrix.copy(enuTransform());
  terrain.traverse((o) => {
    if (!o.isMesh) return;
    o.material = new THREE.MeshBasicMaterial({ map: albedo, color: 0xffffff });
    o.frustumCulled = false;
  });
  scene.add(terrain);

  // Neutral geometry only: the POC is evaluating atmosphere/cloud integration, not ocean art.
  const sea = new THREE.Mesh(
    new THREE.PlaneGeometry(220, 220, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0x17394a })
  );
  sea.rotation.x = -Math.PI / 2;
  sea.position.y = -0.02;
  const seaRoot = new THREE.Group();
  seaRoot.matrixAutoUpdate = false;
  seaRoot.matrix.copy(enuTransform());
  seaRoot.add(sea);
  scene.add(seaRoot);

  phase('BUILD ATMOSPHERE LUT');
  const aerial = new AerialPerspectiveEffect(camera);
  aerial.sky = true;
  aerial.sunLight = true;
  aerial.skyLight = true;

  const normalPass = new NormalPass(scene, camera);
  aerial.normalBuffer = normalPass.texture;

  const clouds = new CloudsEffect(camera, {
    resolutionScale: MOBILE ? 0.46 : 0.68
  });
  clouds.localWeatherVelocity.set(0.0007, 0.0002);

  // Low-cost mobile profile while preserving the volumetric model.
  if (MOBILE) {
    clouds.clouds.accurateSunSkyLight = false;
    clouds.clouds.maxIterationCount = 200;
    clouds.clouds.maxIterationCountToGround = 0;
    clouds.clouds.maxIterationCountToSun = 1;
    clouds.clouds.minStepSize = 100;
    clouds.clouds.maxRayDistance = 100000;
  }

  clouds.events.addEventListener('change', (ev) => {
    if (ev.property === 'atmosphereOverlay') aerial.overlay = clouds.atmosphereOverlay;
    if (ev.property === 'atmosphereShadow') aerial.shadow = clouds.atmosphereShadow;
    if (ev.property === 'atmosphereShadowLength') aerial.shadowLength = clouds.atmosphereShadowLength;
  });

  const generator = new PrecomputedTexturesGenerator(renderer);
  await generator.update();
  Object.assign(aerial, generator.textures);
  Object.assign(clouds, generator.textures);
  await loadCloudAssets(clouds, aerial);

  phase('CREATE COMPOSER');
  const composer = new EffectComposer(renderer, {
    frameBufferType: THREE.HalfFloatType,
    multisampling: 0
  });
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(normalPass);
  composer.addPass(new EffectPass(camera, clouds, aerial));
  composer.addPass(new EffectPass(
    camera,
    new ToneMappingEffect({ mode: ToneMappingMode.AGX })
  ));

  const phases = {
    dawn: new Date('2026-04-18T20:45:00Z'),
    day: new Date('2026-04-19T03:00:00Z'),
    sunset: new Date('2026-04-19T09:30:00Z')
  };
  const sun = new THREE.Vector3();

  function setPhase(name) {
    getSunDirectionECEF(phases[name], sun);
    aerial.sunDirection.copy(sun);
    clouds.sunDirection.copy(sun);
    document.querySelectorAll('button').forEach((b) => {
      b.classList.toggle('active', b.dataset.phase === name);
    });
    phase('RUNNING · ' + name.toUpperCase());
  }
  document.querySelectorAll('button').forEach((b) => {
    b.addEventListener('click', () => setPhase(b.dataset.phase));
  });
  setPhase('dawn');

  const start = performance.now();
  renderer.setAnimationLoop((now) => {
    const az = ((now - start) / 1000) * 0.004;
    const x = 20 * Math.cos(az) - 48 * Math.sin(az);
    const z = 20 * Math.sin(az) + 48 * Math.cos(az);
    camera.position.copy(localToECEF(x, 34, z));
    camera.up.copy(B.up);
    camera.lookAt(target);
    camera.updateMatrixWorld(true);
    composer.render();
  });

  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    composer.setSize(innerWidth, innerHeight);
  });
}
main().catch(fail);
