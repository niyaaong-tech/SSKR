import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Line2 } from 'three/examples/jsm/lines/Line2.js';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { gsap } from 'gsap';

const stage=document.querySelector('#three-stage');
const frame=document.querySelector('#frame');
const overview=document.querySelector('#korea-overview');
const overviewLayer=document.querySelector('#overview-layer');
const statement=document.querySelector('#statement');
const transitionCopy=document.querySelector('#transition-copy');
const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
renderer.setSize(stage.clientWidth,stage.clientHeight,false);
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.05;
renderer.shadowMap.enabled=false;
stage.appendChild(renderer.domElement);

const scene=new THREE.Scene();
const bg=new THREE.Color('#071019');
scene.background=bg;
scene.fog=new THREE.FogExp2('#071019',0.0135);

const camera=new THREE.PerspectiveCamera(34,stage.clientWidth/stage.clientHeight,0.1,240);
const cam={x:15,y:60,z:67,tx:1,ty:0,tz:-2};
function syncCamera(){camera.position.set(cam.x,cam.y,cam.z);camera.lookAt(cam.tx,cam.ty,cam.tz)}
syncCamera();

const composer=new EffectComposer(renderer);
composer.addPass(new RenderPass(scene,camera));
const bloom=new UnrealBloomPass(new THREE.Vector2(stage.clientWidth,stage.clientHeight),0.72,0.42,0.72);
composer.addPass(bloom);

const hemi=new THREE.HemisphereLight('#8097a1','#08100d',0.54);scene.add(hemi);
const sun=new THREE.DirectionalLight('#f6a15b',2.25);sun.position.set(34,18,-18);scene.add(sun);
const rim=new THREE.DirectionalLight('#6f9bbd',0.62);rim.position.set(-22,12,32);scene.add(rim);

const oceanMat=new THREE.MeshStandardMaterial({color:'#102b3d',roughness:.88,metalness:.02,transparent:true,opacity:.92});
const ocean=new THREE.Mesh(new THREE.PlaneGeometry(150,150),oceanMat);
ocean.rotation.x=-Math.PI/2;ocean.position.y=-.025;scene.add(ocean);

const terrainMat=new THREE.MeshStandardMaterial({color:'#263a31',roughness:.94,metalness:.01});
const routeGroup=new THREE.Group();const nodeGroup=new THREE.Group();const checkpointGroup=new THREE.Group();scene.add(routeGroup,nodeGroup,checkpointGroup);
const routeLines=[];const startNodes=new Map();let finishNode=null;let routeData=null;

function goldNode(position,radius=.16){
  const g=new THREE.Group();g.position.fromArray(position);
  const core=new THREE.Mesh(new THREE.SphereGeometry(radius,20,12),new THREE.MeshBasicMaterial({color:'#ffd166',transparent:true,opacity:.96}));
  const ring=new THREE.Mesh(new THREE.RingGeometry(radius*1.45,radius*1.82,36),new THREE.MeshBasicMaterial({color:'#ffc76b',side:THREE.DoubleSide,transparent:true,opacity:.62,depthWrite:false}));
  ring.rotation.x=-Math.PI/2;ring.position.y=.012;g.add(core,ring);return g;
}

function createRoute(r){
  const positions=[];for(const p of r.points)positions.push(p[0],p[1],p[2]);
  const geometry=new LineGeometry();geometry.setPositions(positions);geometry.instanceCount=0;
  const material=new LineMaterial({color:0xffd166,linewidth:2.7,transparent:true,opacity:.96,depthTest:true,depthWrite:false});
  material.resolution.set(stage.clientWidth,stage.clientHeight);
  const line=new Line2(geometry,material);line.renderOrder=8;line.userData={id:r.id,startId:r.start_id,segments:Math.max(1,r.points.length-1),progress:0,positions};
  routeGroup.add(line);routeLines.push(line);
  const sampleFractions=[.34,.58,.78];
  for(const f of sampleFractions){const p=r.points[Math.min(r.points.length-1,Math.floor((r.points.length-1)*f))];const m=new THREE.Mesh(new THREE.SphereGeometry(.085,14,8),new THREE.MeshBasicMaterial({color:'#ffd166',transparent:true,opacity:0,depthWrite:false}));m.position.fromArray(p);m.userData.routeId=r.id;checkpointGroup.add(m)}
  return line;
}
function setRouteProgress(line,p){line.userData.progress=p;line.geometry.instanceCount=Math.max(0,Math.min(line.userData.segments,Math.floor(line.userData.segments*p)))}

function loadJSON(url){return fetch(url,{cache:'no-cache'}).then(r=>{if(!r.ok)throw new Error(`${url}: ${r.status}`);return r.json()})}

Promise.all([
  new Promise((resolve,reject)=>new GLTFLoader().load('./assets/terrain_lod.glb',resolve,undefined,reject)),
  loadJSON('./assets/scene05_route_network_3d_v01.json')
]).then(([gltf,data])=>{
  gltf.scene.traverse(o=>{if(o.isMesh){o.material=terrainMat;o.castShadow=false;o.receiveShadow=false}});scene.add(gltf.scene);
  routeData=data;
  for(const r of data.routes)createRoute(r);
  for(const s of data.starts){const n=goldNode(s.position,.145);n.name=s.id;n.scale.setScalar(0);nodeGroup.add(n);startNodes.set(s.id,n)}
  finishNode=goldNode(data.finish.position,.245);finishNode.name=data.finish.id;finishNode.scale.setScalar(.68);finishNode.children.forEach(c=>{if(c.material)c.material.opacity=.12});nodeGroup.add(finishNode);
  frame.classList.add('ready');
  if(reduceMotion)showStatic();else play();
}).catch(err=>{
  console.error(err);document.querySelector('#status').textContent='ASSET LOAD FAILED';
});

function tweenColor(tl,time,target,to,duration){const c=new THREE.Color(to);tl.to(target,{r:c.r,g:c.g,b:c.b,duration,ease:'sine.inOut'},time)}

function play(){
  const tl=gsap.timeline({defaults:{ease:'power2.inOut'}});
  gsap.set(stage,{opacity:0});gsap.set(overviewLayer,{opacity:1});gsap.set(overview,{scale:.64,yPercent:0,opacity:.2});gsap.set(statement,{opacity:0,y:14});gsap.set(transitionCopy,{opacity:0,y:10});
  for(const n of startNodes.values())gsap.set(n.scale,{x:0,y:0,z:0});
  for(const line of routeLines){line.material.opacity=.96;setRouteProgress(line,0)}
  checkpointGroup.children.forEach(m=>m.material.opacity=0);
  if(finishNode){gsap.set(finishNode.scale,{x:.68,y:.68,z:.68});finishNode.children.forEach(c=>{if(c.material)c.material.opacity=.12})}
  Object.assign(cam,{x:15,y:60,z:67,tx:1,ty:0,tz:-2});syncCamera();

  // 0.0–2.4: peninsula overview, then a single deliberate Dolly/Zoom into South Korea.
  tl.to(overview,{scale:1.48,yPercent:-15,opacity:.34,duration:1.65,ease:'power2.inOut'},.55)
    .to(stage,{opacity:1,duration:1.05,ease:'sine.inOut'},1.18)
    .to(overviewLayer,{opacity:0,duration:.7,ease:'sine.inOut'},1.72)
    .to(cam,{x:16.5,y:43,z:49,tx:1.8,tz:-1.2,duration:1.8,onUpdate:syncCamera,ease:'power2.inOut'},.55);

  // Dawn → daylight while starts ignite north to south.
  tweenColor(tl,1.1,bg,'#0a1820',2.5);tweenColor(tl,1.1,scene.fog.color,'#0a1820',2.5);tweenColor(tl,1.1,terrainMat.color,'#31483a',2.5);tweenColor(tl,1.1,oceanMat.color,'#163a59',2.5);tweenColor(tl,1.1,sun.color,'#ffd6a0',2.1);
  tl.to(sun.position,{x:12,y:42,z:-8,duration:2.3,ease:'sine.inOut'},1.1);
  const starts=[...startNodes.values()];starts.forEach((n,i)=>tl.to(n.scale,{x:1,y:1,z:1,duration:.34,ease:'power2.out'},2.35+i*.095));

  // 3.3–5.7: five real-road journeys draw across the terrain.
  routeLines.forEach((line,i)=>{const proxy={p:0};tl.to(proxy,{p:1,duration:2.25+i*.08,ease:'power1.inOut',onUpdate:()=>setRouteProgress(line,proxy.p)},3.2+i*.10)});

  // 5.5–7.5: route network settles; small waypoint reactions reveal shared spatial structure without a game HUD.
  checkpointGroup.children.forEach((m,i)=>tl.to(m.material,{opacity:.78,duration:.18,yoyo:true,repeat:1,ease:'sine.inOut'},5.35+(i%5)*.08+Math.floor(i/5)*.12));

  // 7.4–9.2: light moves westward and one common finish becomes the strongest point.
  tweenColor(tl,6.8,bg,'#10151a',2.6);tweenColor(tl,6.8,scene.fog.color,'#10151a',2.6);tweenColor(tl,6.8,sun.color,'#ffb16f',2.6);tweenColor(tl,6.8,oceanMat.color,'#243144',2.6);
  tl.to(sun.position,{x:-34,y:15,z:10,duration:2.7,ease:'sine.inOut'},6.65);
  if(finishNode){tl.to(finishNode.scale,{x:1.36,y:1.36,z:1.36,duration:.62,ease:'power2.out'},7.72);finishNode.children.forEach((c,i)=>{if(c.material)tl.to(c.material,{opacity:i===0?1:.9,duration:.55},7.68)})}
  tl.to(statement,{opacity:1,y:0,duration:.65,ease:'power2.out'},8.55);

  // 9.8–12.0: preserve one participant path, choose its eastern start, and Dolly In toward Scene 06.
  const selected='start_n02';routeLines.forEach(line=>tl.to(line.material,{opacity:line.userData.startId===selected?1:.15,duration:.55,ease:'sine.inOut'},9.72));
  tl.to(statement,{opacity:0,y:-8,duration:.38},9.78);
  const n=startNodes.get(selected);if(n){tl.to(n.scale,{x:1.9,y:1.9,z:1.9,duration:.46,ease:'power2.out'},9.92);const p=n.position;tl.to(cam,{x:p.x+6.4,y:6.7,z:p.z+8.5,tx:p.x,ty:p.y,tz:p.z,duration:1.9,onUpdate:syncCamera,ease:'power2.inOut'},10.02)}
  tl.to(transitionCopy,{opacity:.92,y:0,duration:.48,ease:'power2.out'},10.62);
  tl.to(transitionCopy,{opacity:0,duration:.35},11.62);
  return tl;
}

function showStatic(){
  stage.style.opacity='1';overviewLayer.style.display='none';statement.style.opacity='1';statement.style.transform='none';
  Object.assign(cam,{x:16.5,y:43,z:49,tx:1.8,ty:0,tz:-1.2});syncCamera();
  for(const n of startNodes.values())n.scale.setScalar(1);for(const line of routeLines)setRouteProgress(line,1);checkpointGroup.children.forEach(m=>m.material.opacity=.35);if(finishNode){finishNode.scale.setScalar(1.25);finishNode.children.forEach(c=>{if(c.material)c.material.opacity=.9})}
}

function resize(){const w=stage.clientWidth,h=stage.clientHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);composer.setSize(w,h);bloom.setSize(w,h);routeLines.forEach(l=>l.material.resolution.set(w,h))}
window.addEventListener('resize',resize,{passive:true});
window.addEventListener('keydown',e=>{if(e.code==='KeyR')location.reload()});

const clock=new THREE.Clock();
function render(){requestAnimationFrame(render);const t=clock.getElapsedTime();if(finishNode&&finishNode.scale.x>.8){const pulse=1+Math.sin(t*2.4)*.035;finishNode.children[1].scale.setScalar(pulse)}composer.render()}
render();
