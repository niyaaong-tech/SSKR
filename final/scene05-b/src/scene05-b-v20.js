import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { gsap } from 'gsap';

const $ = s => document.querySelector(s);
const frame = $('#frame');
const stage = $('#three-stage');
const overviewLayer = $('#overview-layer');
const statement = $('#statement');
const lightWash = $('#light-wash');
const sceneMark = $('.scene-mark');
const skyNight = $('#sky-night');
const skyDawn = $('#sky-dawn');
const skyDay = $('#sky-day');
const skySunset = $('#sky-sunset');
const skyBluehour = $('#sky-bluehour');
const eastGlow = $('#east-glow');
const westGlow = $('#west-glow');
const qaMode = new URLSearchParams(location.search).has('qa');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, qaMode ? 1 : 1.5));
renderer.setSize(stage.clientWidth, stage.clientHeight, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.02;
renderer.setClearColor(0x000000, 0);
stage.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x122331, 0.0105);

const camera = new THREE.PerspectiveCamera(34, stage.clientWidth / stage.clientHeight, 0.1, 260);
const cam = { x: 14, y: 55, z: 66, tx: 0, ty: 0, tz: 0, fov: 34 };
function syncCamera() {
  camera.position.set(cam.x, cam.y, cam.z);
  camera.lookAt(cam.tx, cam.ty, cam.tz);
  camera.fov = cam.fov;
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld(true);
}
syncCamera();

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(stage.clientWidth, stage.clientHeight), 0.58, 0.36, 0.80);
composer.addPass(bloom);

const oceanUniforms = {
  uTime: { value: 0 },
  uPhase: { value: 0 },
  uOpacity: { value: 0.94 }
};
const oceanMat = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  fog: true,
  uniforms: oceanUniforms,
  vertexShader: `
    uniform float uTime;
    varying vec2 vUv;
    varying float vWave;
    void main(){
      vUv=uv;
      vec3 p=position;
      float w1=sin((p.x+uTime*0.34)*0.24)*0.035;
      float w2=sin((p.y-uTime*0.21)*0.31)*0.025;
      float w3=sin((p.x+p.y+uTime*0.16)*0.13)*0.018;
      vWave=w1+w2+w3;
      p.z+=vWave;
      gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform float uPhase;
    uniform float uOpacity;
    varying vec2 vUv;
    varying float vWave;
    vec3 phaseColor(float p){
      vec3 dawn=vec3(0.035,0.125,0.190);
      vec3 day=vec3(0.035,0.235,0.360);
      vec3 sunset=vec3(0.080,0.105,0.165);
      vec3 night=vec3(0.015,0.038,0.075);
      if(p<1.0)return mix(dawn,day,smoothstep(0.0,1.0,p));
      if(p<2.0)return mix(day,sunset,smoothstep(1.0,2.0,p));
      return mix(sunset,night,smoothstep(2.0,3.0,p));
    }
    void main(){
      vec3 base=phaseColor(uPhase);
      float micro=sin(vUv.x*210.0+uTime*0.42)*sin(vUv.y*170.0-uTime*0.34);
      float broad=sin(vUv.x*41.0+vUv.y*35.0+uTime*0.13);
      float shimmer=0.5+0.5*micro;
      float sunX=mix(0.82,0.16,smoothstep(1.15,2.05,uPhase));
      float path=pow(max(0.0,1.0-abs(vUv.x-sunX)*7.5),4.0);
      path*=0.35+0.65*pow(max(0.0,1.0-abs(vUv.y-0.53)*1.8),2.0);
      float warm=smoothstep(1.35,2.25,uPhase)*(1.0-smoothstep(2.45,3.0,uPhase));
      vec3 c=base;
      c+=vec3(0.015,0.035,0.050)*(broad*0.5+0.5);
      c+=vec3(0.025,0.045,0.060)*shimmer*0.16;
      c+=vec3(0.98,0.47,0.18)*path*warm*(0.18+0.32*shimmer);
      c+=vec3(0.80,0.88,0.92)*path*(1.0-warm)*0.06;
      float edge=0.94+0.06*smoothstep(0.0,0.35,vUv.y);
      gl_FragColor=vec4(c*edge,uOpacity);
    }
  `
});
const ocean = new THREE.Mesh(new THREE.PlaneGeometry(160, 160, 120, 120), oceanMat);
ocean.rotation.x = -Math.PI / 2;
ocean.position.y = -0.055;
ocean.renderOrder = 0;
scene.add(ocean);

const terrainGroup = new THREE.Group();
const routeGlowGroup = new THREE.Group();
const routeGroup = new THREE.Group();
const seedGroup = new THREE.Group();
const mergedGroup = new THREE.Group();
const convergenceGroup = new THREE.Group();
const nodeGroup = new THREE.Group();
const checkpointGroup = new THREE.Group();
const cloudGroup = new THREE.Group();
const festivalGroup = new THREE.Group();
const fireworkGroup = new THREE.Group();
scene.add(terrainGroup, routeGlowGroup, routeGroup, seedGroup, mergedGroup, convergenceGroup, nodeGroup, checkpointGroup, cloudGroup, festivalGroup, fireworkGroup);

const routePairs = [];
const seedLines = [];
const convergenceLines = [];
const startNodes = new Map();
const checkpointNodes = [];
const cloudSprites = [];
const fireworkBursts = [];
const launchLines = [];
let mergedNetwork = null;
let finishNode = null;
let dawnTerrainMat = null;
let dayTerrainMat = null;
let sunsetTerrainMat = null;
let nightTerrainMat = null;
let heroRoute = null;
let terrainBounds = null;
let timeline = null;

function loadTexture(url) {
  return new Promise((resolve, reject) => new THREE.TextureLoader().load(url, t => {
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    resolve(t);
  }, undefined, reject));
}
function loadJSON(url) {
  return fetch(url, { cache: 'no-cache' }).then(r => {
    if (!r.ok) throw new Error(`${url}: ${r.status}`);
    return r.json();
  });
}

function glowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,250,230,1)');
  g.addColorStop(.15, 'rgba(255,209,102,.94)');
  g.addColorStop(.42, 'rgba(246,161,91,.22)');
  g.addColorStop(1, 'rgba(246,161,91,0)');
  x.fillStyle = g;
  x.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const nodeGlow = glowTexture();

function cloudTexture() {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 256;
  const x = c.getContext('2d');
  x.clearRect(0, 0, c.width, c.height);
  const puffs = [
    [110,145,92,.34],[175,118,108,.42],[252,132,122,.46],[330,113,99,.36],[394,146,82,.28],
    [138,172,76,.25],[224,170,92,.33],[304,169,90,.31],[365,168,62,.22]
  ];
  for (const [cx,cy,r,a] of puffs) {
    const g = x.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, `rgba(245,249,250,${a})`);
    g.addColorStop(.42, `rgba(224,234,237,${a*.72})`);
    g.addColorStop(1, 'rgba(205,220,226,0)');
    x.fillStyle = g;
    x.fillRect(cx-r, cy-r, r*2, r*2);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const cloudTex = cloudTexture();

function makeNode(position, radius = .15) {
  const g = new THREE.Group();
  g.position.fromArray(position);
  const core = new THREE.Mesh(new THREE.SphereGeometry(radius, 18, 12), new THREE.MeshBasicMaterial({ color: '#ffd166', transparent: true, opacity: 0, depthTest: false, depthWrite: false }));
  const ring = new THREE.Mesh(new THREE.RingGeometry(radius * 1.45, radius * 1.88, 32), new THREE.MeshBasicMaterial({ color: '#ffc76b', side: THREE.DoubleSide, transparent: true, opacity: 0, depthTest: false, depthWrite: false }));
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = .012;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: nodeGlow, color: '#ffd6a0', transparent: true, opacity: 0, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending }));
  const glowScale = radius * 7.2;
  sprite.scale.set(glowScale, glowScale, 1);
  sprite.position.y = .04;
  sprite.userData.baseScale = glowScale;
  core.renderOrder = 14; ring.renderOrder = 14; sprite.renderOrder = 15;
  g.add(core, ring, sprite);
  g.userData = { core, ring, sprite };
  return g;
}

function lineFromPoints(points, { color = 0xffd166, width = 3, opacity = 1, order = 7, depthTest = true } = {}) {
  const flat = [];
  for (const p of points) flat.push(p[0], p[1], p[2]);
  const geo = new LineGeometry();
  geo.setPositions(flat);
  const mat = new LineMaterial({ color, linewidth: width, transparent: true, opacity, depthTest, depthWrite: false });
  mat.resolution.set(stage.clientWidth, stage.clientHeight);
  const line = new Line2(geo, mat);
  line.computeLineDistances();
  line.renderOrder = order;
  line.userData.segments = Math.max(1, points.length - 1);
  line.userData.baseWidth = width;
  return line;
}
function setProgress(line, p) {
  line.geometry.instanceCount = Math.max(0, Math.min(line.userData.segments, Math.floor(line.userData.segments * p)));
}

function mergedFrom(items) {
  const flat = [];
  for (const s of items) flat.push(...s.a, ...s.b);
  const geo = new LineSegmentsGeometry();
  geo.setPositions(flat);
  const mat = new LineMaterial({ color: 0xffe0a0, linewidth: 3.5, transparent: true, opacity: 0, depthTest: true, depthWrite: false });
  mat.resolution.set(stage.clientWidth, stage.clientHeight);
  const l = new LineSegments2(geo, mat);
  l.computeLineDistances();
  l.renderOrder = 9;
  return l;
}

function vec(a) { return new THREE.Vector3(a[0], a[1], a[2]); }
function average(points) {
  const v = new THREE.Vector3();
  points.forEach(p => v.add(vec(p)));
  return v.multiplyScalar(1 / Math.max(1, points.length));
}
function pointAt(points, f) {
  return vec(points[Math.min(points.length - 1, Math.max(0, Math.floor((points.length - 1) * f)))]);
}
function chasePose(points, f, diag, sideSign = 1) {
  const i = Math.min(points.length - 2, Math.max(0, Math.floor((points.length - 2) * f)));
  const p = vec(points[i]);
  const q = vec(points[i + 1]);
  const dir = q.clone().sub(p).setY(0).normalize();
  const side = new THREE.Vector3(-dir.z, 0, dir.x).multiplyScalar(diag * .055 * sideSign);
  const pos = p.clone().addScaledVector(dir, -diag * .11).add(side);
  pos.y += diag * .115;
  const target = p.clone().addScaledVector(dir, diag * .055);
  target.y += diag * .012;
  return { pos, target };
}

function tweenCamera(tl, time, duration, pos, target, fov, ease = 'power2.inOut') {
  tl.to(cam, {
    x: pos.x, y: pos.y, z: pos.z,
    tx: target.x, ty: target.y, tz: target.z,
    fov,
    duration,
    ease,
    onUpdate: syncCamera
  }, time);
}
function nodeOpacity(tl, n, t, { core = .95, ring = .46, glow = .52, duration = .34 } = {}) {
  tl.to(n.userData.core.material, { opacity: core, duration, ease: 'power2.out' }, t);
  tl.to(n.userData.ring.material, { opacity: ring, duration, ease: 'power2.out' }, t);
  tl.to(n.userData.sprite.material, { opacity: glow, duration, ease: 'power2.out' }, t);
}

function buildClouds(bounds) {
  const center = bounds.getCenter(new THREE.Vector3());
  const size = bounds.getSize(new THREE.Vector3());
  const d = Math.max(size.x, size.z);
  const specs = [
    [-.58,.10,.38,1.20,.30],[-.42,.06,-.54,1.05,.24],[-.18,.13,.58,.88,.20],[.18,.08,-.60,1.08,.22],
    [.46,.12,.50,1.10,.24],[.58,.07,-.26,.92,.18],[-.64,.20,-.05,.76,.14],[.68,.19,.16,.80,.15],
    [-.08,.28,.74,.66,.12],[.28,.24,-.76,.74,.12]
  ];
  specs.forEach((s, i) => {
    const mat = new THREE.SpriteMaterial({ map: cloudTex, color: i % 3 === 0 ? 0xeaf1f2 : 0xf4f6f5, transparent: true, opacity: 0, depthWrite: false, depthTest: true });
    const sp = new THREE.Sprite(mat);
    sp.position.set(center.x + s[0] * d, center.y + s[1] * d, center.z + s[2] * d);
    const w = d * s[3] * .34;
    sp.scale.set(w, w * .48, 1);
    sp.userData = { baseX: sp.position.x, baseY: sp.position.y, baseZ: sp.position.z, phase: i * .83, speed: .022 + (i % 4) * .006, targetOpacity: s[4] };
    cloudSprites.push(sp);
    cloudGroup.add(sp);
  });
}

function seededRandom(seed) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
    return ((x >>> 0) % 100000) / 100000;
  };
}
function makeFireworkBurst(origin, color, seed, count = 130) {
  const rand = seededRandom(seed);
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const a = rand() * Math.PI * 2;
    const elev = (rand() * .78 + .18) * Math.PI * .5;
    const r = .72 + rand() * .38;
    positions[i * 3] = Math.cos(a) * Math.cos(elev) * r;
    positions[i * 3 + 1] = Math.sin(elev) * r * (.78 + rand() * .32) - .12;
    positions[i * 3 + 2] = Math.sin(a) * Math.cos(elev) * r;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({ color, size: .12, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false, sizeAttenuation: true });
  const pts = new THREE.Points(geo, mat);
  pts.position.copy(origin);
  pts.scale.setScalar(.02);
  pts.renderOrder = 30;
  fireworkGroup.add(pts);
  fireworkBursts.push(pts);
  return pts;
}

function buildFestival(finish, diag) {
  const cluster = new THREE.Group();
  cluster.position.copy(finish);
  const rand = seededRandom(4205);
  for (let i = 0; i < 22; i++) {
    const r = .12 + rand() * .42;
    const a = rand() * Math.PI * 2;
    const m = new THREE.MeshBasicMaterial({ color: i % 4 === 0 ? 0xffc977 : 0xf4d9aa, transparent: true, opacity: 0, depthTest: false, depthWrite: false });
    const dot = new THREE.Mesh(new THREE.SphereGeometry(.026 + rand() * .022, 7, 5), m);
    dot.position.set(Math.cos(a) * r, .045 + rand() * .09, Math.sin(a) * r);
    dot.userData.baseOpacity = .25 + rand() * .55;
    cluster.add(dot);
  }
  festivalGroup.add(cluster);

  const origins = [
    finish.clone().add(new THREE.Vector3(-diag * .025, diag * .135, .0)),
    finish.clone().add(new THREE.Vector3(diag * .035, diag * .165, -diag * .015)),
    finish.clone().add(new THREE.Vector3(-diag * .055, diag * .195, -diag * .02)),
    finish.clone().add(new THREE.Vector3(diag * .065, diag * .215, .018 * diag))
  ];
  const colors = [0xffd8a0, 0xfff0cc, 0xffb66f, 0xffdfae];
  origins.forEach((o, i) => {
    const burst = makeFireworkBurst(o, colors[i], 8041 + i * 73, 118 + i * 14);
    const launch = lineFromPoints([[finish.x, finish.y + .08, finish.z], [o.x, o.y, o.z]], { color: i === 2 ? 0xffc18a : 0xffe6c4, width: 1.05, opacity: 0, order: 28, depthTest: false });
    setProgress(launch, 0);
    launchLines.push(launch);
    fireworkGroup.add(launch);
  });
  return cluster;
}

function animateFirework(tl, i, t, scale) {
  const launch = launchLines[i];
  const burst = fireworkBursts[i];
  const p = { v: 0 };
  tl.to(launch.material, { opacity: .74, duration: .14 }, t)
    .to(p, { v: 1, duration: .58, ease: 'power2.in', onUpdate: () => setProgress(launch, p.v) }, t)
    .to(launch.material, { opacity: 0, duration: .20 }, t + .54)
    .to(burst.material, { opacity: .96, duration: .10 }, t + .57)
    .to(burst.scale, { x: scale, y: scale, z: scale, duration: .58, ease: 'power2.out' }, t + .57)
    .to(burst.material, { opacity: 0, duration: 1.08, ease: 'power1.in' }, t + 1.02);
}

Promise.all([
  new Promise((resolve, reject) => new GLTFLoader().load('./assets/terrain_final_uv.glb', resolve, undefined, reject)),
  loadTexture('./assets/terrain_dawn_final.png'),
  loadTexture('./assets/terrain_day_final.png'),
  loadTexture('./assets/terrain_sunset_final.png'),
  loadJSON('./assets/scene05_final_data_v1.json')
]).then(([gltf, dawnTex, dayTex, sunsetTex, data]) => {
  dawnTerrainMat = new THREE.MeshBasicMaterial({ map: dawnTex, color: '#d8e1e2', transparent: false, depthWrite: true, fog: true });
  dayTerrainMat = new THREE.MeshBasicMaterial({ map: dayTex, color: '#eef0e8', transparent: true, opacity: 0, depthWrite: false, fog: true });
  sunsetTerrainMat = new THREE.MeshBasicMaterial({ map: sunsetTex, color: '#f1d7c5', transparent: true, opacity: 0, depthWrite: false, fog: true });
  nightTerrainMat = new THREE.MeshBasicMaterial({ map: sunsetTex, color: '#405269', transparent: true, opacity: 0, depthWrite: false, fog: true });

  const dawnScene = gltf.scene;
  const dayScene = gltf.scene.clone(true);
  const sunsetScene = gltf.scene.clone(true);
  const nightScene = gltf.scene.clone(true);
  dawnScene.traverse(o => { if (o.isMesh) { o.material = dawnTerrainMat; o.renderOrder = 1; } });
  dayScene.traverse(o => { if (o.isMesh) { o.material = dayTerrainMat; o.renderOrder = 2; } });
  sunsetScene.traverse(o => { if (o.isMesh) { o.material = sunsetTerrainMat; o.renderOrder = 3; } });
  nightScene.traverse(o => { if (o.isMesh) { o.material = nightTerrainMat; o.renderOrder = 4; } });
  terrainGroup.add(dawnScene, dayScene, sunsetScene, nightScene);
  terrainBounds = new THREE.Box3().setFromObject(dawnScene);
  buildClouds(terrainBounds);

  heroRoute = data.main_routes.find(r => r.id === 'route_start_n02') || data.main_routes[0];
  for (const r of data.main_routes) {
    const glow = lineFromPoints(r.points, { color: 0xffb94f, width: 7.2, opacity: 0, order: 8, depthTest: false });
    const core = lineFromPoints(r.points, { color: 0xffd166, width: 2.75, opacity: 0, order: 10, depthTest: true });
    setProgress(glow, 0); setProgress(core, 0);
    routePairs.push({ id: r.id, startId: r.start_id, points: r.points, glow, core });
    routeGlowGroup.add(glow); routeGroup.add(core);

    const tail = r.points.slice(r.convergence_from_index);
    const conv = lineFromPoints(tail, { color: 0xffc764, width: 4.4, opacity: 0, order: 11, depthTest: true });
    setProgress(conv, 0);
    convergenceLines.push(conv);
    convergenceGroup.add(conv);
  }

  for (const s of data.start_seeds) {
    const l = lineFromPoints(s.points, { color: 0xf4b062, width: 1.35, opacity: 0, order: 7, depthTest: true });
    setProgress(l, 0); seedLines.push(l); seedGroup.add(l);
  }
  mergedNetwork = mergedFrom(data.merged_segments);
  mergedGroup.add(mergedNetwork);

  for (const s of data.starts) {
    const n = makeNode(s.position, .13);
    n.name = s.id;
    n.scale.setScalar(0);
    startNodes.set(s.id, n);
    nodeGroup.add(n);
  }
  finishNode = makeNode(data.finish.position, .24);
  finishNode.scale.setScalar(.5);
  const fb = finishNode.userData.sprite.userData.baseScale * 1.75;
  finishNode.userData.sprite.userData.baseScale = fb;
  finishNode.userData.sprite.scale.set(fb, fb, 1);
  nodeGroup.add(finishNode);

  for (const c of data.checkpoints) {
    const n = makeNode(c.position, .062);
    n.scale.setScalar(.72);
    checkpointNodes.push(n);
    checkpointGroup.add(n);
  }

  const boundsSize = terrainBounds.getSize(new THREE.Vector3());
  const diag = Math.max(boundsSize.x, boundsSize.z);
  buildFestival(vec(data.finish.position), diag);

  frame.classList.add('ready');
  if (reduceMotion && !qaMode) showStatic(data);
  else play(data);
}).catch(e => {
  console.error(e);
  $('#status').textContent = 'SCENE 05 B ASSET LOAD FAILED';
});

function play(data) {
  const tl = gsap.timeline({ paused: qaMode, defaults: { ease: 'power2.inOut' } });
  timeline = tl;
  window.__scene05Timeline = tl;

  const bounds = terrainBounds;
  const center = bounds.getCenter(new THREE.Vector3());
  const size = bounds.getSize(new THREE.Vector3());
  const diag = Math.max(size.x, size.z);
  const starts = data.starts.map(s => vec(s.position));
  const northStart = starts[0];
  const southStart = starts[starts.length - 1];
  const eastAvg = average(starts);
  const finish = vec(data.finish.position);
  const route = heroRoute.points;
  const chaseA = chasePose(route, .16, diag, 1);
  const chaseB = chasePose(route, .43, diag, -1);
  const chaseC = chasePose(route, .68, diag, 1);

  const highPos = center.clone().add(new THREE.Vector3(diag * .26, diag * .78, diag * .92));
  const highTarget = center.clone().add(new THREE.Vector3(0, diag * .01, 0));
  const eastNorthPos = northStart.clone().add(new THREE.Vector3(diag * .16, diag * .28, diag * .30));
  const eastSouthPos = southStart.clone().add(new THREE.Vector3(diag * .14, diag * .24, diag * .25));
  const cranePos = center.clone().add(new THREE.Vector3(diag * .18, diag * .48, diag * .42));
  const networkA = center.clone().add(new THREE.Vector3(diag * .34, diag * .34, diag * .20));
  const networkB = center.clone().add(new THREE.Vector3(-diag * .18, diag * .30, -diag * .28));
  const westSweep = finish.clone().add(new THREE.Vector3(diag * .30, diag * .33, diag * .37));
  const finishDesc = finish.clone().add(new THREE.Vector3(diag * .075, diag * .17, diag * .20));
  const bluePos = finish.clone().add(new THREE.Vector3(diag * .05, diag * .12, diag * .24));
  const skyTarget = finish.clone().add(new THREE.Vector3(0, diag * .19, -diag * .01));

  gsap.set(overviewLayer, { opacity: 0 });
  gsap.set(stage, { opacity: 1 });
  gsap.set(statement, { opacity: 0, y: 18 });
  gsap.set(sceneMark, { opacity: .24 });
  gsap.set(lightWash, { opacity: .08 });
  gsap.set(skyNight, { opacity: 1 });
  gsap.set(skyDawn, { opacity: .12 });
  gsap.set([skyDay, skySunset, skyBluehour, eastGlow, westGlow], { opacity: 0 });

  dawnTerrainMat.opacity = 1;
  dayTerrainMat.opacity = 0;
  sunsetTerrainMat.opacity = 0;
  nightTerrainMat.opacity = 0;
  oceanUniforms.uPhase.value = 0;
  oceanUniforms.uOpacity.value = .94;
  scene.fog.density = .0105;
  scene.fog.color.set(0x122331);
  bloom.strength = .56;

  for (const n of startNodes.values()) {
    n.scale.setScalar(0);
    n.userData.core.material.opacity = 0;
    n.userData.ring.material.opacity = 0;
    n.userData.sprite.material.opacity = 0;
  }
  routePairs.forEach(p => {
    p.core.material.opacity = 0; p.glow.material.opacity = 0;
    setProgress(p.core, 0); setProgress(p.glow, 0);
  });
  seedLines.forEach(l => { l.material.opacity = 0; setProgress(l, 0); });
  convergenceLines.forEach(l => { l.material.opacity = 0; setProgress(l, 0); });
  mergedNetwork.material.opacity = 0;
  checkpointNodes.forEach(n => {
    n.userData.core.material.opacity = 0;
    n.userData.ring.material.opacity = 0;
    n.userData.sprite.material.opacity = 0;
  });
  finishNode.userData.core.material.opacity = .01;
  finishNode.userData.ring.material.opacity = .01;
  finishNode.userData.sprite.material.opacity = 0;
  festivalGroup.traverse(o => { if (o.material) o.material.opacity = 0; });
  cloudSprites.forEach(s => s.material.opacity = 0);
  launchLines.forEach(l => { l.material.opacity = 0; setProgress(l, 0); });
  fireworkBursts.forEach(b => { b.material.opacity = 0; b.scale.setScalar(.02); });

  Object.assign(cam, { x: highPos.x, y: highPos.y, z: highPos.z, tx: highTarget.x, ty: highTarget.y, tz: highTarget.z, fov: 35 });
  syncCamera();

  // 0–6s: high-altitude approach. The shot starts directly in 3D, never as a cutaway map plate.
  tweenCamera(tl, 0, 6.0, center.clone().add(new THREE.Vector3(diag * .20, diag * .56, diag * .68)), center.clone().add(new THREE.Vector3(diag * .04, 0, diag * .04)), 33.5, 'power1.inOut');
  tl.to(skyNight, { opacity: .48, duration: 5.2, ease: 'sine.inOut' }, .5)
    .to(skyDawn, { opacity: .82, duration: 4.8, ease: 'sine.inOut' }, .8)
    .to(eastGlow, { opacity: .44, duration: 4.2, ease: 'sine.out' }, 1.3)
    .to(scene.fog, { density: .0075, duration: 5.4, ease: 'sine.inOut' }, .6);
  tl.to(scene.fog.color, { r: .075, g: .145, b: .18, duration: 5.0 }, .8);
  cloudSprites.forEach((s, i) => tl.to(s.material, { opacity: s.userData.targetOpacity * .72, duration: 2.8 }, 1.2 + i * .13));

  // 6–12s: descend to the East Coast and truck along the Start geography.
  tweenCamera(tl, 6.0, 3.0, eastNorthPos, northStart.clone().add(new THREE.Vector3(0, .35, 0)), 30.5, 'power2.inOut');
  tweenCamera(tl, 9.0, 3.0, eastSouthPos, southStart.clone().add(new THREE.Vector3(0, .25, 0)), 29.5, 'sine.inOut');
  tl.to(eastGlow, { opacity: .84, duration: 3.0 }, 6.0).to(skyDawn, { opacity: .98, duration: 2.0 }, 6.2);
  [...startNodes.values()].forEach((n, i) => {
    const t = 6.8 + i * .48;
    tl.to(n.scale, { x: 1, y: 1, z: 1, duration: .42, ease: 'power2.out' }, t);
    nodeOpacity(tl, n, t, { core: .95, ring: .48, glow: .58, duration: .36 });
  });
  seedLines.forEach((l, i) => {
    const p = { v: 0 };
    const t = 9.2 + i * .40;
    tl.to(l.material, { opacity: .22, duration: .28 }, t)
      .to(p, { v: 1, duration: 1.1, ease: 'power1.inOut', onUpdate: () => setProgress(l, p.v) }, t + .08);
  });

  // 12–20s: chase one real-road-grounded route into the interior.
  tweenCamera(tl, 12.0, 2.6, chaseA.pos, chaseA.target, 27.5, 'power2.inOut');
  tweenCamera(tl, 14.6, 2.8, chaseB.pos, chaseB.target, 26.0, 'sine.inOut');
  tweenCamera(tl, 17.4, 2.6, chaseC.pos, chaseC.target, 27.0, 'sine.inOut');
  const heroPair = routePairs.find(p => p.id === heroRoute.id) || routePairs[0];
  if (heroPair) {
    const p = { v: 0 };
    tl.to(heroPair.core.material, { opacity: .96, duration: .35 }, 11.9)
      .to(heroPair.glow.material, { opacity: .20, duration: .42 }, 11.9)
      .to(p, { v: 1, duration: 7.2, ease: 'power1.inOut', onUpdate: () => { setProgress(heroPair.core, p.v); setProgress(heroPair.glow, p.v); } }, 12.0);
  }
  tl.to(dayTerrainMat, { opacity: .62, duration: 6.0, ease: 'sine.inOut' }, 14.0)
    .to(skyDay, { opacity: .58, duration: 5.8, ease: 'sine.inOut' }, 14.0)
    .to(skyNight, { opacity: .12, duration: 5.0 }, 14.4)
    .to(oceanUniforms.uPhase, { value: .70, duration: 6.0, ease: 'sine.inOut' }, 14.0);

  // 18–30s: other routes build while the camera cranes up and reveals the national choice structure.
  routePairs.filter(p => p !== heroPair).forEach((pair, i) => {
    const prog = { v: 0 };
    const t = 18.4 + i * 1.05;
    tl.to(pair.core.material, { opacity: .90, duration: .42 }, t)
      .to(pair.glow.material, { opacity: .14, duration: .48 }, t)
      .to(prog, { v: 1, duration: 7.2 + i * .35, ease: 'power1.inOut', onUpdate: () => { setProgress(pair.core, prog.v); setProgress(pair.glow, prog.v); } }, t + .08);
  });
  tweenCamera(tl, 20.0, 8.0, cranePos, center.clone().add(new THREE.Vector3(0, .3, 0)), 35.5, 'power2.inOut');
  tl.to(dayTerrainMat, { opacity: 1, duration: 5.4 }, 20.0)
    .to(skyDay, { opacity: 1, duration: 4.8 }, 20.0)
    .to(skyDawn, { opacity: 0, duration: 4.8 }, 20.0)
    .to(eastGlow, { opacity: .08, duration: 4.2 }, 20.0)
    .to(oceanUniforms.uPhase, { value: 1.0, duration: 4.5 }, 20.0)
    .to(scene.fog, { density: .0047, duration: 5.0 }, 20.0)
    .to(scene.fog.color, { r: .33, g: .43, b: .46, duration: 5.0 }, 20.0);
  tl.to(mergedNetwork.material, { opacity: .66, duration: 2.4, ease: 'sine.out' }, 24.2);

  // 28–36s: diagonal network flight. Checkpoints react only while the camera is in the dense daylight chapter.
  tweenCamera(tl, 28.0, 4.0, networkA, center.clone().add(new THREE.Vector3(diag * .06, .2, diag * .02)), 33.0, 'sine.inOut');
  tweenCamera(tl, 32.0, 4.0, networkB, center.clone().add(new THREE.Vector3(-diag * .08, .15, -diag * .04)), 31.5, 'sine.inOut');
  checkpointNodes.forEach((n, i) => {
    const t = 28.2 + (i % 6) * .82 + Math.floor(i / 6) * .38;
    nodeOpacity(tl, n, t, { core: .52, ring: .20, glow: .15, duration: .24 });
    tl.to(n.scale, { x: 1.18, y: 1.18, z: 1.18, duration: .22, yoyo: true, repeat: 1, ease: 'sine.inOut' }, t);
  });
  cloudSprites.forEach((s, i) => tl.to(s.material, { opacity: s.userData.targetOpacity * .48, duration: 2.6 }, 27.0 + i * .06));
  tl.to(lightWash, { opacity: .045, duration: 2.0 }, 29.0);

  // 36–44s: westward sweep. Camera, route hierarchy and light all resolve toward the same direction.
  tweenCamera(tl, 36.0, 8.0, westSweep, finish.clone().add(new THREE.Vector3(0, .25, 0)), 30.0, 'power2.inOut');
  tl.to(sunsetTerrainMat, { opacity: 1, duration: 7.0, ease: 'sine.inOut' }, 36.0)
    .to(dayTerrainMat, { opacity: .18, duration: 7.0, ease: 'sine.inOut' }, 36.0)
    .to(skySunset, { opacity: .94, duration: 6.4 }, 36.0)
    .to(skyDay, { opacity: .24, duration: 6.4 }, 36.0)
    .to(westGlow, { opacity: .88, duration: 5.6 }, 36.2)
    .to(oceanUniforms.uPhase, { value: 2.0, duration: 6.5, ease: 'sine.inOut' }, 36.0)
    .to(scene.fog, { density: .0064, duration: 6.0 }, 36.0)
    .to(scene.fog.color, { r: .29, g: .20, b: .22, duration: 6.0 }, 36.0);
  for (const n of startNodes.values()) {
    tl.to(n.userData.core.material, { opacity: .10, duration: 3.0 }, 37.0)
      .to(n.userData.ring.material, { opacity: .025, duration: 3.0 }, 37.0)
      .to(n.userData.sprite.material, { opacity: .018, duration: 3.0 }, 37.0)
      .to(n.scale, { x: .72, y: .72, z: .72, duration: 3.0 }, 37.0);
  }
  routePairs.forEach((pair, i) => {
    tl.to(pair.core.material, { opacity: .42, duration: 3.2 }, 38.0 + i * .05)
      .to(pair.glow.material, { opacity: .07, duration: 3.2 }, 38.0 + i * .05);
  });
  tl.to(mergedNetwork.material, { opacity: .20, duration: 3.0 }, 38.0);
  convergenceLines.forEach((l, i) => {
    const p = { v: 0 };
    const t = 39.0 + i * .42;
    tl.to(l.material, { opacity: .95, duration: .35 }, t)
      .to(p, { v: 1, duration: 4.5, ease: 'power2.inOut', onUpdate: () => setProgress(l, p.v) }, t + .08);
  });

  // 44–49s: descend into the west finish and let sea reflection dominate the frame.
  tweenCamera(tl, 44.0, 5.0, finishDesc, finish.clone().add(new THREE.Vector3(0, .18, 0)), 27.5, 'power2.inOut');
  tl.to(finishNode.scale, { x: 1.55, y: 1.55, z: 1.55, duration: 2.2, ease: 'power2.out' }, 44.5);
  nodeOpacity(tl, finishNode, 44.4, { core: .98, ring: .72, glow: .82, duration: 1.1 });
  tl.to(statement, { opacity: 1, y: 0, duration: 1.1, ease: 'power2.out' }, 45.2);
  tl.to(bloom, { strength: .70, duration: 2.5 }, 44.5);

  // 49–52s: sunset hold. After almost fifty seconds of camera motion, stillness becomes the climax punctuation.
  tweenCamera(tl, 49.0, 3.0, finishDesc.clone().add(new THREE.Vector3(-diag * .008, diag * .006, -diag * .004)), finish.clone().add(new THREE.Vector3(0, .16, 0)), 27.5, 'sine.inOut');
  routePairs.forEach(pair => {
    tl.to(pair.core.material, { opacity: .10, duration: 2.3 }, 49.4)
      .to(pair.glow.material, { opacity: .018, duration: 2.3 }, 49.4);
  });
  convergenceLines.forEach(l => tl.to(l.material, { opacity: .18, duration: 2.3 }, 49.4));
  tl.to(mergedNetwork.material, { opacity: 0, duration: 1.8 }, 49.4);
  checkpointNodes.forEach(n => {
    tl.to(n.userData.core.material, { opacity: 0, duration: 1.4 }, 49.4);
    tl.to(n.userData.ring.material, { opacity: 0, duration: 1.4 }, 49.4);
    tl.to(n.userData.sprite.material, { opacity: 0, duration: 1.4 }, 49.4);
  });

  // 50–56s: sunset sinks into blue hour. Terrain and sky darken continuously; there is no editorial cut.
  tweenCamera(tl, 52.0, 4.0, bluePos, finish.clone().add(new THREE.Vector3(0, diag * .035, -diag * .01)), 30.5, 'sine.inOut');
  tl.to(skyBluehour, { opacity: .98, duration: 5.2, ease: 'sine.inOut' }, 50.4)
    .to(skySunset, { opacity: .18, duration: 5.2 }, 50.4)
    .to(skyNight, { opacity: .46, duration: 5.2 }, 50.4)
    .to(westGlow, { opacity: .18, duration: 4.6 }, 50.6)
    .to(nightTerrainMat, { opacity: .88, duration: 5.0 }, 50.5)
    .to(sunsetTerrainMat, { opacity: .24, duration: 5.0 }, 50.5)
    .to(oceanUniforms.uPhase, { value: 3.0, duration: 5.0, ease: 'sine.inOut' }, 50.5)
    .to(scene.fog, { density: .0080, duration: 4.8 }, 50.5)
    .to(scene.fog.color, { r: .055, g: .075, b: .12, duration: 4.8 }, 50.5)
    .to(statement, { opacity: 0, y: -9, duration: .9 }, 51.2)
    .to(sceneMark, { opacity: .12, duration: 1.2 }, 51.0);
  festivalGroup.traverse(o => {
    if (o.material) tl.to(o.material, { opacity: o.userData.baseOpacity || .42, duration: 1.8, ease: 'sine.out' }, 51.3 + Math.random() * .5);
  });
  cloudSprites.forEach((s, i) => tl.to(s.material, { opacity: s.userData.targetOpacity * .30, duration: 3.5 }, 51.0 + i * .05));

  // 55–60s: reframe upward and end on a believable finish-festival night sky.
  tweenCamera(tl, 55.0, 5.0, bluePos.clone().add(new THREE.Vector3(0, -diag * .01, 0)), skyTarget, 33.5, 'power2.inOut');
  animateFirework(tl, 0, 55.55, diag * .055);
  animateFirework(tl, 1, 56.55, diag * .060);
  animateFirework(tl, 2, 57.55, diag * .068);
  animateFirework(tl, 3, 58.55, diag * .074);
  tl.to(bloom, { strength: .82, duration: 2.0 }, 56.0).to(bloom, { strength: .58, duration: 1.2 }, 59.0);
  tl.to(finishNode.userData.sprite.material, { opacity: .24, duration: 4.0 }, 55.2)
    .to(finishNode.userData.ring.material, { opacity: .18, duration: 4.0 }, 55.2)
    .to(finishNode.userData.core.material, { opacity: .46, duration: 4.0 }, 55.2);

  tl.to({}, { duration: .15 }, 59.85);
  return tl;
}

function showStatic(data) {
  stage.style.opacity = '1';
  overviewLayer.style.display = 'none';
  skyNight.style.opacity = '.05';
  skyDay.style.opacity = '.94';
  skyDawn.style.opacity = '0';
  dayTerrainMat.opacity = 1;
  dawnTerrainMat.opacity = .25;
  sunsetTerrainMat.opacity = 0;
  nightTerrainMat.opacity = 0;
  oceanUniforms.uPhase.value = 1;
  const bounds = terrainBounds;
  const center = bounds.getCenter(new THREE.Vector3());
  const size = bounds.getSize(new THREE.Vector3());
  const d = Math.max(size.x, size.z);
  Object.assign(cam, { x: center.x + d * .16, y: center.y + d * .44, z: center.z + d * .42, tx: center.x, ty: center.y, tz: center.z, fov: 34 });
  syncCamera();
  for (const n of startNodes.values()) {
    n.scale.setScalar(1);
    n.userData.core.material.opacity = .65;
    n.userData.ring.material.opacity = .22;
    n.userData.sprite.material.opacity = .16;
  }
  routePairs.forEach(p => {
    setProgress(p.core, 1); setProgress(p.glow, 1);
    p.core.material.opacity = .76; p.glow.material.opacity = .10;
  });
  mergedNetwork.material.opacity = .48;
  cloudSprites.forEach(s => s.material.opacity = s.userData.targetOpacity * .40);
  statement.style.opacity = '1'; statement.style.transform = 'none';
}

function resize() {
  const w = stage.clientWidth, h = stage.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
  composer.setSize(w, h);
  bloom.setSize(w, h);
  routePairs.forEach(p => { p.core.material.resolution.set(w, h); p.glow.material.resolution.set(w, h); });
  seedLines.forEach(l => l.material.resolution.set(w, h));
  convergenceLines.forEach(l => l.material.resolution.set(w, h));
  launchLines.forEach(l => l.material.resolution.set(w, h));
  if (mergedNetwork) mergedNetwork.material.resolution.set(w, h);
}
addEventListener('resize', resize, { passive: true });
addEventListener('keydown', e => { if (e.code === 'KeyR') location.reload(); });

const clock = new THREE.Clock();
function render() {
  requestAnimationFrame(render);
  const t = qaMode && timeline ? timeline.time() : clock.getElapsedTime();
  oceanUniforms.uTime.value = t;
  cloudSprites.forEach((s, i) => {
    const u = s.userData;
    s.position.x = u.baseX + Math.sin(t * u.speed + u.phase) * .75;
    s.position.z = u.baseZ + Math.cos(t * u.speed * .72 + u.phase) * .48;
    s.position.y = u.baseY + Math.sin(t * u.speed * .51 + u.phase) * .16;
  });
  if (finishNode && finishNode.userData.sprite.material.opacity > .16) {
    const b = finishNode.userData.sprite.userData.baseScale || 1;
    const p = 1 + Math.sin(t * 1.8) * .025;
    finishNode.userData.sprite.scale.set(b * p, b * p, 1);
  }
  composer.render();
}
render();
