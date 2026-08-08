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

const frame=document.querySelector('#frame');
const stage=document.querySelector('#three-stage');
const overviewLayer=document.querySelector('#overview-layer');
const overview=document.querySelector('#korea-overview');
const statement=document.querySelector('#statement');
const matchOrb=document.querySelector('#match-orb');
const lightWash=document.querySelector('#light-wash');
const skyNight=document.querySelector('#sky-night');
const skyDawn=document.querySelector('#sky-dawn');
const skyDay=document.querySelector('#sky-day');
const skySunset=document.querySelector('#sky-sunset');
const eastGlow=document.querySelector('#east-glow');
const westGlow=document.querySelector('#west-glow');
const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const qaMode=new URLSearchParams(location.search).has('qa');

const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
renderer.setSize(stage.clientWidth,stage.clientHeight,false);
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.08;
renderer.setClearColor(0x000000,0);
stage.appendChild(renderer.domElement);

const scene=new THREE.Scene();
scene.fog=new THREE.FogExp2('#07131e',0.0105);
const camera=new THREE.PerspectiveCamera(32,stage.clientWidth/stage.clientHeight,.1,240);
const cam={x:17,y:58,z:66,tx:1,ty:.15,tz:-1.5};
function syncCamera(){camera.position.set(cam.x,cam.y,cam.z);camera.lookAt(cam.tx,cam.ty,cam.tz)}
syncCamera();

const composer=new EffectComposer(renderer);
composer.addPass(new RenderPass(scene,camera));
const bloom=new UnrealBloomPass(new THREE.Vector2(stage.clientWidth,stage.clientHeight),.72,.36,.78);
composer.addPass(bloom);

const hemi=new THREE.HemisphereLight('#8ba4b1','#07100c',.52);scene.add(hemi);
const ambient=new THREE.AmbientLight('#7d918b',.10);scene.add(ambient);
const sun=new THREE.DirectionalLight('#ffc98a',2.35);sun.position.set(35,12,-26);scene.add(sun);
const rim=new THREE.DirectionalLight('#7396b4',.76);rim.position.set(-30,12,32);scene.add(rim);
const fill=new THREE.DirectionalLight('#d5ddd7',.18);fill.position.set(-5,34,-28);scene.add(fill);

const oceanMat=new THREE.MeshPhysicalMaterial({color:'#102d43',roughness:.58,metalness:.02,transparent:true,opacity:.93,clearcoat:.14,clearcoatRoughness:.66});
const ocean=new THREE.Mesh(new THREE.PlaneGeometry(160,160),oceanMat);
ocean.rotation.x=-Math.PI/2;ocean.position.y=-.025;scene.add(ocean);

const terrainGroup=new THREE.Group();
const roadHintGroup=new THREE.Group();
const routeGroup=new THREE.Group();
const mergedGroup=new THREE.Group();
const convergenceGroup=new THREE.Group();
const nodeGroup=new THREE.Group();
const checkpointGroup=new THREE.Group();
scene.add(terrainGroup,roadHintGroup,routeGroup,mergedGroup,convergenceGroup,nodeGroup,checkpointGroup);

const mainLines=[];
const hintLines=[];
const convergenceLines=[];
const seedLines=[];
const startNodes=new Map();
let mergedNetwork=null;
let finishNode=null;
let personalLine=null;
let personalStart=null;
let data=null;

function glowTexture(){
  const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');
  const g=x.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(255,245,218,1)');g.addColorStop(.18,'rgba(255,209,102,.85)');g.addColorStop(.48,'rgba(246,161,91,.22)');g.addColorStop(1,'rgba(246,161,91,0)');x.fillStyle=g;x.fillRect(0,0,128,128);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}
const nodeGlowTexture=glowTexture();

function makeNode(position,radius=.16){
  const g=new THREE.Group();g.position.fromArray(position);
  const core=new THREE.Mesh(new THREE.SphereGeometry(radius,22,14),new THREE.MeshBasicMaterial({color:'#ffd166',transparent:true,opacity:.98}));
  const ring=new THREE.Mesh(new THREE.RingGeometry(radius*1.42,radius*1.82,40),new THREE.MeshBasicMaterial({color:'#ffc76b',side:THREE.DoubleSide,transparent:true,opacity:.55,depthWrite:false}));
  ring.rotation.x=-Math.PI/2;ring.position.y=.012;
  const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:nodeGlowTexture,color:'#ffd7a0',transparent:true,opacity:.5,depthWrite:false,blending:THREE.AdditiveBlending}));
  sprite.scale.set(radius*7,radius*7,1);sprite.position.y=.04;
  g.add(core,ring,sprite);g.userData={core,ring,sprite};return g;
}

function lineFromPoints(points,{color=0xffd166,width=2.8,opacity=1,renderOrder=7}={}){
  const flat=[];for(const p of points)flat.push(p[0],p[1],p[2]);
  const geometry=new LineGeometry();geometry.setPositions(flat);
  const material=new LineMaterial({color,linewidth:width,transparent:true,opacity,depthTest:true,depthWrite:false});
  material.resolution.set(stage.clientWidth,stage.clientHeight);
  const line=new Line2(geometry,material);line.computeLineDistances();line.renderOrder=renderOrder;line.userData.segments=Math.max(1,points.length-1);line.userData.points=points;return line;
}
function setLineProgress(line,p){line.geometry.instanceCount=Math.max(0,Math.min(line.userData.segments,Math.floor(line.userData.segments*p)))}

function createMergedNetwork(items){
  const flat=[];for(const s of items)flat.push(...s.a,...s.b);
  const geometry=new LineSegmentsGeometry();geometry.setPositions(flat);
  const material=new LineMaterial({color:0xffc768,linewidth:2.25,transparent:true,opacity:0,depthWrite:false,depthTest:true});
  material.resolution.set(stage.clientWidth,stage.clientHeight);
  const lines=new LineSegments2(geometry,material);lines.computeLineDistances();lines.renderOrder=6;return lines;
}

function loadTexture(url,color=false){
  return new Promise((resolve,reject)=>new THREE.TextureLoader().load(url,t=>{if(color)t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());resolve(t)},undefined,reject));
}
function loadJSON(url){return fetch(url,{cache:'no-cache'}).then(r=>{if(!r.ok)throw new Error(`${url}: ${r.status}`);return r.json()})}

Promise.all([
  new Promise((resolve,reject)=>new GLTFLoader().load('./assets/terrain_final_uv.glb',resolve,undefined,reject)),
  loadTexture('./assets/terrain_surface_final.png',true),
  loadTexture('./assets/terrain_normal_final.png',false),
  loadJSON('./assets/scene05_final_data_v1.json')
]).then(([gltf,surface,normal,sceneData])=>{
  data=sceneData;
  const terrainMat=new THREE.MeshStandardMaterial({map:surface,normalMap:normal,normalScale:new THREE.Vector2(.42,.42),color:'#8fa29a',roughness:.88,metalness:.015,emissive:'#06100d',emissiveIntensity:.06});
  terrainMat.userData.baseColor=terrainMat.color;
  gltf.scene.traverse(o=>{if(o.isMesh){o.material=terrainMat;o.castShadow=false;o.receiveShadow=false;o.renderOrder=1}});
  terrainGroup.add(gltf.scene);
  terrainGroup.userData.material=terrainMat;

  for(const r of data.main_routes){
    const hint=lineFromPoints(r.points,{color:0xa7b4aa,width:1.25,opacity:0,renderOrder:4});hint.userData.id=r.id;roadHintGroup.add(hint);hintLines.push(hint);
    const main=lineFromPoints(r.points,{color:0xffd166,width:3.05,opacity:.96,renderOrder:8});main.userData.id=r.id;main.userData.startId=r.start_id;setLineProgress(main,0);routeGroup.add(main);mainLines.push(main);
    const tail=r.points.slice(r.convergence_from_index);
    const conv=lineFromPoints(tail,{color:0xffc55e,width:4.25,opacity:0,renderOrder:9});conv.userData.id=r.id;setLineProgress(conv,0);convergenceGroup.add(conv);convergenceLines.push(conv);
    if(r.id===data.storyboard.personal_route_id){personalLine=main;personalStart=r.start_id}
  }
  for(const s of data.start_seeds){const l=lineFromPoints(s.points,{color:0xf6a15b,width:1.55,opacity:0,renderOrder:7});l.userData.startId=s.start_id;setLineProgress(l,0);roadHintGroup.add(l);seedLines.push(l)}
  mergedNetwork=createMergedNetwork(data.merged_segments);mergedGroup.add(mergedNetwork);

  for(const s of data.starts){const n=makeNode(s.position,.145);n.name=s.id;n.scale.setScalar(0);nodeGroup.add(n);startNodes.set(s.id,n)}
  finishNode=makeNode(data.finish.position,.24);finishNode.scale.setScalar(.54);finishNode.userData.core.material.opacity=.06;finishNode.userData.ring.material.opacity=.04;finishNode.userData.sprite.material.opacity=.02;nodeGroup.add(finishNode);

  for(const c of data.checkpoints){const n=makeNode(c.position,.075);n.scale.setScalar(.7);n.userData.core.material.opacity=0;n.userData.ring.material.opacity=0;n.userData.sprite.material.opacity=0;checkpointGroup.add(n)}

  frame.classList.add('ready');
  if(reduceMotion&&!qaMode)showStatic();else playFinalScene();
}).catch(err=>{console.error(err);document.querySelector('#status').textContent='FINAL ASSET LOAD FAILED'});

function tweenColor(tl,time,target,to,duration){const c=new THREE.Color(to);tl.to(target,{r:c.r,g:c.g,b:c.b,duration,ease:'sine.inOut'},time)}
function nodeOpacity(tl,node,time,{core=.98,ring=.55,glow=.48,duration=.35}={}){tl.to(node.userData.core.material,{opacity:core,duration,ease:'power2.out'},time);tl.to(node.userData.ring.material,{opacity:ring,duration,ease:'power2.out'},time);tl.to(node.userData.sprite.material,{opacity:glow,duration,ease:'power2.out'},time)}
function projectToFrame(position){const v=position.clone().project(camera);return {x:(v.x*.5+.5)*stage.clientWidth,y:(-.5*v.y+.5)*stage.clientHeight}}

function playFinalScene(){
  const tl=gsap.timeline({paused:qaMode,defaults:{ease:'power2.inOut'}});window.__scene05Timeline=tl;
  gsap.set(stage,{opacity:0});gsap.set(overviewLayer,{opacity:1});gsap.set(overview,{scale:.61,yPercent:0,opacity:.18});gsap.set(statement,{opacity:0,y:16});gsap.set(matchOrb,{opacity:0,scale:0});
  gsap.set([skyDawn,skyDay,skySunset,eastGlow,westGlow],{opacity:0});gsap.set(skyNight,{opacity:1});gsap.set(lightWash,{opacity:.12});
  for(const n of startNodes.values())gsap.set(n.scale,{x:0,y:0,z:0});
  mainLines.forEach(l=>{l.material.opacity=.96;setLineProgress(l,0)});hintLines.forEach(l=>l.material.opacity=0);seedLines.forEach(l=>{l.material.opacity=0;setLineProgress(l,0)});convergenceLines.forEach(l=>{l.material.opacity=0;setLineProgress(l,0)});mergedNetwork.material.opacity=0;
  checkpointGroup.children.forEach(n=>{n.userData.core.material.opacity=0;n.userData.ring.material.opacity=0;n.userData.sprite.material.opacity=0});
  Object.assign(cam,{x:17,y:58,z:66,tx:1,ty:.15,tz:-1.5});syncCamera();

  const terrainMat=terrainGroup.userData.material;
  terrainMat.color.set('#6c7c78');terrainMat.emissiveIntensity=.04;scene.fog.color.set('#07131e');scene.fog.density=.0115;
  oceanMat.color.set('#102d43');oceanMat.roughness=.62;
  sun.color.set('#f6a15b');sun.position.set(36,11,-28);sun.intensity=2.25;rim.intensity=.78;hemi.intensity=.50;fill.intensity=.15;

  // 0.0–0.8 SCALE — almost-dark peninsula, no data UI.
  tl.to(overview,{opacity:.24,duration:.55,ease:'sine.out'},.15);

  // 0.8–2.2 SOUTH KOREA HERO — the one major camera move.
  tl.to(overview,{scale:1.5,yPercent:-15,opacity:.34,duration:1.45,ease:'power3.inOut'},.8)
    .to(stage,{opacity:1,duration:.9,ease:'sine.inOut'},1.02)
    .to(overviewLayer,{opacity:0,duration:.55,ease:'sine.inOut'},1.72)
    .to(cam,{x:16.2,y:35.5,z:46.8,tx:1.4,ty:.08,tz:-1.5,duration:1.4,onUpdate:syncCamera,ease:'power3.inOut'},.8)
    .to(skyNight,{opacity:.42,duration:1.3},.9)
    .to(skyDawn,{opacity:.94,duration:1.25},.95)
    .to(eastGlow,{opacity:.82,duration:1.15},1.05);
  tweenColor(tl,.95,scene.fog.color,'#17303a',1.25);tweenColor(tl,.95,terrainMat.color,'#7c8c83',1.25);tweenColor(tl,.95,oceanMat.color,'#173b56',1.25);
  tl.to(sun.position,{x:32,y:15,z:-25,duration:1.25,ease:'sine.inOut'},.95);

  // 2.2–3.5 DAWN START — starts are visually dominant.
  const starts=[...startNodes.values()];
  starts.forEach((n,i)=>{const t=2.2+i*.115;tl.to(n.scale,{x:1,y:1,z:1,duration:.28,ease:'power2.out'},t);nodeOpacity(tl,n,t,{core:1,ring:.62,glow:.72,duration:.3})});
  seedLines.forEach((l,i)=>{const p={v:0};tl.to(l.material,{opacity:.42,duration:.26},2.65+i*.05);tl.to(p,{v:1,duration:.55,onUpdate:()=>setLineProgress(l,p.v),ease:'power1.inOut'},2.72+i*.055)});

  // 3.5–5.5 MORNING CROSSING — individual choices grow from the east.
  mainLines.forEach((l,i)=>{const p={v:0};tl.to(p,{v:1,duration:1.9+i*.08,onUpdate:()=>setLineProgress(l,p.v),ease:'power2.inOut'},3.45+i*.08)});
  tl.to(skyDawn,{opacity:.48,duration:1.75},3.55).to(skyDay,{opacity:.72,duration:1.8},3.65).to(eastGlow,{opacity:.28,duration:1.5},3.75);
  tweenColor(tl,3.55,scene.fog.color,'#8a9b98',1.8);tweenColor(tl,3.55,terrainMat.color,'#f0f2eb',1.8);tweenColor(tl,3.55,oceanMat.color,'#2b5b75',1.8);tweenColor(tl,3.55,sun.color,'#fff0d1',1.7);
  tl.to(sun.position,{x:17,y:31,z:-14,duration:1.8,ease:'sine.inOut'},3.55).to(sun,{intensity:2.75,duration:1.7},3.55).to(hemi,{intensity:.82,duration:1.7},3.55).to(fill,{intensity:.42,duration:1.7},3.55).to(rim,{intensity:.48,duration:1.7},3.55);

  // 5.5–7.8 DAYLIGHT NETWORK — maximum terrain readability and choice structure.
  tl.to(skyNight,{opacity:0,duration:.8},5.2).to(skyDawn,{opacity:.08,duration:.8},5.2).to(skyDay,{opacity:.97,duration:.85},5.2).to(lightWash,{opacity:.08,duration:.75},5.2);
  hintLines.forEach((l,i)=>tl.to(l.material,{opacity:.16+(i%2)*.025,duration:.5,ease:'sine.out'},5.15+i*.045));
  tl.to(mergedNetwork.material,{opacity:.72,duration:.75,ease:'power2.out'},5.5);
  checkpointGroup.children.forEach((n,i)=>{const t=5.65+(i%6)*.18;nodeOpacity(tl,n,t,{core:.68,ring:.34,glow:.28,duration:.22});tl.to(n.scale,{x:1.18,y:1.18,z:1.18,duration:.2,yoyo:true,repeat:1,ease:'sine.inOut'},t)});
  tl.to(scene.fog,{density:.0068,duration:.85},5.35).to(terrainMat,{emissiveIntensity:.015,duration:.7},5.35);

  // 7.8–10.2 SUNSET CONVERGENCE — network resolves into a few westbound flows.
  tl.to(skyDay,{opacity:.26,duration:1.65},7.75).to(skySunset,{opacity:.96,duration:1.65},7.75).to(westGlow,{opacity:.92,duration:1.45},7.85).to(eastGlow,{opacity:0,duration:1.1},7.8);
  tweenColor(tl,7.75,scene.fog.color,'#59474b',1.65);tweenColor(tl,7.75,terrainMat.color,'#b79a85',1.65);tweenColor(tl,7.75,oceanMat.color,'#35485a',1.65);tweenColor(tl,7.75,sun.color,'#ffad69',1.45);
  tl.to(sun.position,{x:-34,y:10,z:13,duration:1.65,ease:'sine.inOut'},7.75).to(sun,{intensity:3.25,duration:1.55},7.8).to(rim,{intensity:.72,duration:1.4},7.85).to(hemi,{intensity:.45,duration:1.45},7.85).to(fill,{intensity:.18,duration:1.45},7.85);
  tl.to(mergedNetwork.material,{opacity:.36,duration:.75},7.95);hintLines.forEach(l=>tl.to(l.material,{opacity:.055,duration:.75},8.0));
  mainLines.forEach((l,i)=>tl.to(l.material,{opacity:.46,duration:.72},8.0+i*.025));
  convergenceLines.forEach((l,i)=>{const p={v:0};tl.to(l.material,{opacity:.96,duration:.28},8.05+i*.065);tl.to(p,{v:1,duration:1.15,onUpdate:()=>setLineProgress(l,p.v),ease:'power2.inOut'},8.1+i*.07)});
  tl.to(finishNode.scale,{x:1.42,y:1.42,z:1.42,duration:.58,ease:'power2.out'},9.18);nodeOpacity(tl,finishNode,9.14,{core:1,ring:.88,glow:1,duration:.46});
  tl.to(statement,{opacity:1,y:0,duration:.62,ease:'power2.out'},9.36);

  // 10.0–10.35 CLIMAX SILENCE — intentionally almost still.
  tl.to({}, {duration:.35},10.0);

  // 10.35–11.6 PERSONAL RECALL — one person's day remains.
  hintLines.forEach(l=>tl.to(l.material,{opacity:0,duration:.42},10.32));
  seedLines.forEach(l=>tl.to(l.material,{opacity:0,duration:.42},10.32));
  tl.to(mergedNetwork.material,{opacity:0,duration:.44},10.32);
  checkpointGroup.children.forEach(n=>{tl.to(n.userData.core.material,{opacity:0,duration:.35},10.33);tl.to(n.userData.ring.material,{opacity:0,duration:.35},10.33);tl.to(n.userData.sprite.material,{opacity:0,duration:.35},10.33)});
  convergenceLines.forEach(l=>tl.to(l.material,{opacity:0,duration:.45},10.36));
  mainLines.forEach(l=>tl.to(l.material,{opacity:l===personalLine?1:.06,duration:.48},10.38));
  for(const [id,n] of startNodes){const selected=id===personalStart;tl.to(n.scale,{x:selected?1.28:.76,y:selected?1.28:.76,z:selected?1.28:.76,duration:.48},10.4);tl.to(n.userData.sprite.material,{opacity:selected?.76:.08,duration:.48},10.4)}
  tl.to(finishNode.userData.sprite.material,{opacity:.42,duration:.42},10.42).to(statement,{opacity:.96,duration:.35},10.42);
  if(personalLine)tl.to(personalLine.material,{linewidth:4.15,duration:.46},10.48);

  // 11.6–12.8 MATCH CUT — no second big 3D camera move. Start light becomes Scene 06 sun.
  const selectedNode=startNodes.get(personalStart);
  if(selectedNode){
    tl.call(()=>{
      const p=projectToFrame(selectedNode.position);
      gsap.set(matchOrb,{left:p.x,top:p.y,opacity:0,scale:.16});
    },null,11.55);
    tl.to(statement,{opacity:0,y:-8,duration:.28},11.55)
      .to(matchOrb,{opacity:1,scale:.85,duration:.34,ease:'power2.out'},11.58)
      .to(matchOrb,{scale:24,opacity:1,duration:1.12,ease:'power2.in'},11.68)
      .to(stage,{opacity:.03,duration:.8,ease:'sine.in'},11.88)
      .to([skySunset,skyDay,skyDawn],{opacity:0,duration:.72},11.86)
      .to(westGlow,{opacity:0,duration:.6},11.88);
  }
  return tl;
}

function showStatic(){
  stage.style.opacity='1';overviewLayer.style.display='none';skyDay.style.opacity='.92';skyNight.style.opacity='.05';skyDawn.style.opacity='.08';statement.style.opacity='1';statement.style.transform='none';
  Object.assign(cam,{x:16.2,y:35.5,z:46.8,tx:1.4,ty:.08,tz:-1.5});syncCamera();
  for(const n of startNodes.values()){n.scale.setScalar(1);n.userData.core.material.opacity=.85;n.userData.ring.material.opacity=.35;n.userData.sprite.material.opacity=.25}
  mainLines.forEach(l=>{setLineProgress(l,1);l.material.opacity=.82});hintLines.forEach(l=>l.material.opacity=.12);mergedNetwork.material.opacity=.5;convergenceLines.forEach(l=>setLineProgress(l,0));
  finishNode.scale.setScalar(1.25);finishNode.userData.core.material.opacity=1;finishNode.userData.ring.material.opacity=.75;finishNode.userData.sprite.material.opacity=.8;
}

function resize(){
  const w=stage.clientWidth,h=stage.clientHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);composer.setSize(w,h);bloom.setSize(w,h);
  [...mainLines,...hintLines,...convergenceLines,...seedLines].forEach(l=>l.material.resolution.set(w,h));if(mergedNetwork)mergedNetwork.material.resolution.set(w,h)
}
window.addEventListener('resize',resize,{passive:true});
window.addEventListener('keydown',e=>{if(e.code==='KeyR')location.reload()});

const clock=new THREE.Clock();
function render(){
  requestAnimationFrame(render);const t=clock.getElapsedTime();
  if(finishNode&&finishNode.userData.sprite.material.opacity>.2){const p=1+Math.sin(t*2.15)*.045;finishNode.userData.sprite.scale.setScalar(p)}
  composer.render();
}
render();
