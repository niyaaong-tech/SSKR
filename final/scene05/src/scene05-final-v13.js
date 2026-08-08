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

const $=s=>document.querySelector(s);
const frame=$('#frame'),stage=$('#three-stage'),overviewLayer=$('#overview-layer'),overview=$('#korea-overview');
const statement=$('#statement'),matchOrb=$('#match-orb'),lightWash=$('#light-wash');
const skyNight=$('#sky-night'),skyDawn=$('#sky-dawn'),skyDay=$('#sky-day'),skySunset=$('#sky-sunset');
const eastGlow=$('#east-glow'),westGlow=$('#west-glow');
const qaMode=new URLSearchParams(location.search).has('qa');
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;

const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,qaMode?1:1.5));
renderer.setSize(stage.clientWidth,stage.clientHeight,false);
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.0;
renderer.setClearColor(0,0);
stage.appendChild(renderer.domElement);

const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(32,stage.clientWidth/stage.clientHeight,.1,220);
const cam={x:15,y:52,z:61,tx:0,ty:.1,tz:-2};
function syncCamera(){camera.position.set(cam.x,cam.y,cam.z);camera.lookAt(cam.tx,cam.ty,cam.tz);camera.updateMatrixWorld(true)}
syncCamera();

const composer=new EffectComposer(renderer);
composer.addPass(new RenderPass(scene,camera));
const bloom=new UnrealBloomPass(new THREE.Vector2(stage.clientWidth,stage.clientHeight),.66,.34,.76);
composer.addPass(bloom);

const oceanMat=new THREE.MeshBasicMaterial({color:'#123247',transparent:true,opacity:.88,depthWrite:false});
const ocean=new THREE.Mesh(new THREE.PlaneGeometry(150,150),oceanMat);
ocean.rotation.x=-Math.PI/2;ocean.position.y=-.035;ocean.renderOrder=0;scene.add(ocean);

const terrainGroup=new THREE.Group(),roadHintGroup=new THREE.Group(),routeGroup=new THREE.Group(),mergedGroup=new THREE.Group(),convergenceGroup=new THREE.Group(),nodeGroup=new THREE.Group(),checkpointGroup=new THREE.Group();
scene.add(terrainGroup,roadHintGroup,routeGroup,mergedGroup,convergenceGroup,nodeGroup,checkpointGroup);

const mainLines=[],seedLines=[],convergenceLines=[],startNodes=new Map(),roadHintNetworks=[];
let mergedNetwork=null,finishNode=null,personalLine=null,personalStart=null;
let dawnTerrainMat=null,dayTerrainMat=null,sunsetTerrainMat=null;

function glowTexture(){
  const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');
  const g=x.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(255,250,230,1)');g.addColorStop(.16,'rgba(255,209,102,.95)');g.addColorStop(.45,'rgba(246,161,91,.25)');g.addColorStop(1,'rgba(246,161,91,0)');x.fillStyle=g;x.fillRect(0,0,128,128);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}
const nodeGlow=glowTexture();

function makeNode(position,radius=.15){
  const g=new THREE.Group();g.position.fromArray(position);
  const core=new THREE.Mesh(new THREE.SphereGeometry(radius,20,12),new THREE.MeshBasicMaterial({color:'#ffd166',transparent:true,opacity:0,depthWrite:false}));
  const ring=new THREE.Mesh(new THREE.RingGeometry(radius*1.45,radius*1.88,36),new THREE.MeshBasicMaterial({color:'#ffc76b',side:THREE.DoubleSide,transparent:true,opacity:0,depthWrite:false}));
  ring.rotation.x=-Math.PI/2;ring.position.y=.012;
  const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:nodeGlow,color:'#ffd6a0',transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));
  const glowScale=radius*7.6;sprite.scale.set(glowScale,glowScale,1);sprite.position.y=.04;sprite.userData.baseScale=glowScale;
  g.add(core,ring,sprite);g.userData={core,ring,sprite};return g;
}

function lineFromPoints(points,{color=0xffd166,width=3,opacity=1,order=7,depthTest=true}={}){
  const flat=[];for(const p of points)flat.push(p[0],p[1],p[2]);
  const geo=new LineGeometry();geo.setPositions(flat);
  const mat=new LineMaterial({color,linewidth:width,transparent:true,opacity,depthTest,depthWrite:false});mat.resolution.set(stage.clientWidth,stage.clientHeight);
  const line=new Line2(geo,mat);line.computeLineDistances();line.renderOrder=order;line.userData.segments=Math.max(1,points.length-1);line.userData.baseWidth=width;return line;
}
function setProgress(line,p){line.geometry.instanceCount=Math.max(0,Math.min(line.userData.segments,Math.floor(line.userData.segments*p)))}

function mergedFrom(items){
  const flat=[];for(const s of items)flat.push(...s.a,...s.b);
  const geo=new LineSegmentsGeometry();geo.setPositions(flat);
  const mat=new LineMaterial({color:0xffe1a4,linewidth:4.0,transparent:true,opacity:0,depthTest:true,depthWrite:false});mat.resolution.set(stage.clientWidth,stage.clientHeight);
  const l=new LineSegments2(geo,mat);l.computeLineDistances();l.renderOrder=9;return l;
}

function roadNetworkFrom(items,classes,{color,width,dayOpacity,sunsetOpacity}){
  const flat=[];
  for(const item of items){
    if(!classes.has(item.highway))continue;
    const pts=item.points||[];
    for(let i=0;i<pts.length-1;i++)flat.push(...pts[i],...pts[i+1]);
  }
  if(!flat.length)return null;
  const geo=new LineSegmentsGeometry();geo.setPositions(flat);
  const mat=new LineMaterial({color,linewidth:width,transparent:true,opacity:0,depthTest:true,depthWrite:false});mat.resolution.set(stage.clientWidth,stage.clientHeight);
  const lines=new LineSegments2(geo,mat);lines.computeLineDistances();lines.renderOrder=5;lines.userData={dayOpacity,sunsetOpacity};return lines;
}

function loadTexture(url){return new Promise((resolve,reject)=>new THREE.TextureLoader().load(url,t=>{t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());resolve(t)},undefined,reject))}
function loadJSON(url){return fetch(url,{cache:'no-cache'}).then(r=>{if(!r.ok)throw new Error(`${url}: ${r.status}`);return r.json()})}

Promise.all([
  new Promise((resolve,reject)=>new GLTFLoader().load('./assets/terrain_final_uv.glb',resolve,undefined,reject)),
  loadTexture('./assets/terrain_dawn_final.png'),loadTexture('./assets/terrain_day_final.png'),loadTexture('./assets/terrain_sunset_final.png'),
  loadJSON('./assets/scene05_final_data_v1.json')
]).then(([gltf,dawnTex,dayTex,sunsetTex,data])=>{
  dawnTerrainMat=new THREE.MeshBasicMaterial({map:dawnTex,color:'#ffffff',transparent:false,depthWrite:true});
  dayTerrainMat=new THREE.MeshBasicMaterial({map:dayTex,color:'#ffffff',transparent:true,opacity:0,depthWrite:false});
  sunsetTerrainMat=new THREE.MeshBasicMaterial({map:sunsetTex,color:'#ffffff',transparent:true,opacity:0,depthWrite:false});
  const dawnScene=gltf.scene;
  const dayScene=gltf.scene.clone(true);
  const sunsetScene=gltf.scene.clone(true);
  dawnScene.traverse(o=>{if(o.isMesh){o.material=dawnTerrainMat;o.renderOrder=1}});
  dayScene.traverse(o=>{if(o.isMesh){o.material=dayTerrainMat;o.renderOrder=2}});
  sunsetScene.traverse(o=>{if(o.isMesh){o.material=sunsetTerrainMat;o.renderOrder=3}});
  terrainGroup.add(dawnScene,dayScene,sunsetScene);

  const roads=data.road_hints||[];
  const major=roadNetworkFrom(roads,new Set(['motorway','trunk']),{color:0xd8e2dc,width:1.12,dayOpacity:.22,sunsetOpacity:.032});
  const primary=roadNetworkFrom(roads,new Set(['primary']),{color:0xb9c6bf,width:.82,dayOpacity:.105,sunsetOpacity:.014});
  for(const network of [major,primary])if(network){roadHintNetworks.push(network);roadHintGroup.add(network)}

  for(const r of data.main_routes){
    const main=lineFromPoints(r.points,{color:0xffd166,width:3.25,opacity:.98,order:10});main.userData.id=r.id;main.userData.startId=r.start_id;setProgress(main,0);mainLines.push(main);routeGroup.add(main);
    const tail=r.points.slice(r.convergence_from_index);const conv=lineFromPoints(tail,{color:0xffc45d,width:4.8,opacity:0,order:11});conv.userData.id=r.id;setProgress(conv,0);convergenceLines.push(conv);convergenceGroup.add(conv);
    if(r.id===data.storyboard.personal_route_id){personalLine=main;personalStart=r.start_id}
  }
  for(const s of data.start_seeds){const l=lineFromPoints(s.points,{color:0xf6a15b,width:1.65,opacity:0,order:7});l.userData.startId=s.start_id;setProgress(l,0);seedLines.push(l);roadHintGroup.add(l)}
  mergedNetwork=mergedFrom(data.merged_segments);mergedGroup.add(mergedNetwork);

  for(const s of data.starts){const n=makeNode(s.position,.145);n.name=s.id;n.scale.setScalar(0);startNodes.set(s.id,n);nodeGroup.add(n)}
  finishNode=makeNode(data.finish.position,.255);finishNode.scale.setScalar(.56);
  const fb=finishNode.userData.sprite.userData.baseScale*1.55;finishNode.userData.sprite.userData.baseScale=fb;finishNode.userData.sprite.scale.set(fb,fb,1);nodeGroup.add(finishNode);
  for(const c of data.checkpoints){const n=makeNode(c.position,.072);n.scale.setScalar(.75);checkpointGroup.add(n)}

  frame.classList.add('ready');
  if(reduceMotion&&!qaMode)showStatic();else play();
}).catch(e=>{console.error(e);$('#status').textContent='FINAL ASSET LOAD FAILED'});

function nodeOpacity(tl,n,t,{core=.95,ring=.5,glow=.55,duration=.28}={}){tl.to(n.userData.core.material,{opacity:core,duration,ease:'power2.out'},t);tl.to(n.userData.ring.material,{opacity:ring,duration,ease:'power2.out'},t);tl.to(n.userData.sprite.material,{opacity:glow,duration,ease:'power2.out'},t)}
function projectToFrame(pos){camera.updateMatrixWorld(true);const v=pos.clone().project(camera);return{x:(v.x*.5+.5)*stage.clientWidth,y:(-.5*v.y+.5)*stage.clientHeight}}

function play(){
  const tl=gsap.timeline({paused:qaMode,defaults:{ease:'power2.inOut'}});window.__scene05Timeline=tl;
  gsap.set(stage,{opacity:0});gsap.set(overviewLayer,{opacity:1});gsap.set(overview,{scale:.61,xPercent:0,yPercent:0,opacity:.18});gsap.set(statement,{opacity:0,y:16});gsap.set(matchOrb,{opacity:0,scale:0});
  gsap.set(skyNight,{opacity:1});gsap.set([skyDawn,skyDay,skySunset,eastGlow,westGlow],{opacity:0});gsap.set(lightWash,{opacity:.1});
  dayTerrainMat.opacity=0;sunsetTerrainMat.opacity=0;dawnTerrainMat.opacity=1;
  for(const n of startNodes.values()){n.scale.setScalar(0);n.userData.core.material.opacity=0;n.userData.ring.material.opacity=0;n.userData.sprite.material.opacity=0}
  mainLines.forEach(l=>{l.material.opacity=.98;l.material.linewidth=l.userData.baseWidth;setProgress(l,0)});
  roadHintNetworks.forEach(n=>n.material.opacity=0);
  seedLines.forEach(l=>{l.material.opacity=0;setProgress(l,0)});convergenceLines.forEach(l=>{l.material.opacity=0;setProgress(l,0)});mergedNetwork.material.opacity=0;
  checkpointGroup.children.forEach(n=>{n.userData.core.material.opacity=0;n.userData.ring.material.opacity=0;n.userData.sprite.material.opacity=0});
  finishNode.userData.core.material.opacity=.02;finishNode.userData.ring.material.opacity=.01;finishNode.userData.sprite.material.opacity=0;
  Object.assign(cam,{x:15,y:52,z:61,tx:0,ty:.1,tz:-2});syncCamera();oceanMat.color.set('#102b3d');oceanMat.opacity=.86;

  tl.to(overview,{opacity:.25,duration:.5,ease:'sine.out'},.16);
  tl.to(overview,{scale:1.56,xPercent:12,yPercent:-14,opacity:.34,duration:1.4,ease:'power3.inOut'},.8)
    .to(stage,{opacity:1,duration:.82,ease:'sine.inOut'},1.0)
    .to(overviewLayer,{opacity:0,duration:.52,ease:'sine.inOut'},1.7)
    .to(cam,{x:11,y:32,z:43,tx:0,ty:.1,tz:7,duration:1.4,onUpdate:syncCamera,ease:'power3.inOut'},.8)
    .to(skyNight,{opacity:.38,duration:1.15},.9).to(skyDawn,{opacity:.96,duration:1.12},.96).to(eastGlow,{opacity:.82,duration:1.0},1.05);

  [...startNodes.values()].forEach((n,i)=>{const t=2.2+i*.11;tl.to(n.scale,{x:1,y:1,z:1,duration:.27,ease:'power2.out'},t);nodeOpacity(tl,n,t,{core:1,ring:.62,glow:.76})});
  seedLines.forEach((l,i)=>{const p={v:0};tl.to(l.material,{opacity:.38,duration:.2},2.56+i*.055);tl.to(p,{v:1,duration:.55,onUpdate:()=>setProgress(l,p.v),ease:'power1.inOut'},2.62+i*.055)});

  mainLines.forEach((l,i)=>{const p={v:0};tl.to(p,{v:1,duration:1.85+i*.07,onUpdate:()=>setProgress(l,p.v),ease:'power2.inOut'},3.42+i*.08)});
  tl.to(dayTerrainMat,{opacity:1,duration:1.85,ease:'sine.inOut'},3.55).to(skyDawn,{opacity:.24,duration:1.75},3.6).to(skyDay,{opacity:.94,duration:1.8},3.62).to(eastGlow,{opacity:.16,duration:1.5},3.7);
  tl.to(oceanMat.color,{r:.12,g:.31,b:.42,duration:1.7},3.6);

  // Daylight: broad real-road context appears, but Main and merged shared trunks remain dominant.
  tl.to(skyNight,{opacity:0,duration:.6},5.2).to(skyDawn,{opacity:0,duration:.6},5.2).to(skyDay,{opacity:1,duration:.6},5.2).to(lightWash,{opacity:.05,duration:.6},5.2);
  roadHintNetworks.forEach((n,i)=>tl.to(n.material,{opacity:n.userData.dayOpacity,duration:.65,ease:'sine.out'},5.02+i*.11));
  mainLines.forEach((l,i)=>tl.to(l.material,{opacity:.84,duration:.45},5.36+i*.025));
  tl.to(mergedNetwork.material,{opacity:.82,duration:.62,ease:'power2.out'},5.48);
  checkpointGroup.children.forEach((n,i)=>{const t=5.65+(i%6)*.17;nodeOpacity(tl,n,t,{core:.62,ring:.29,glow:.25,duration:.2});tl.to(n.scale,{x:1.2,y:1.2,z:1.2,duration:.18,yoyo:true,repeat:1,ease:'sine.inOut'},t)});

  // Sunset: east Start lights deliberately yield while the west Finish becomes the only dominant beacon.
  tl.to(sunsetTerrainMat,{opacity:1,duration:1.6,ease:'sine.inOut'},7.78).to(skyDay,{opacity:.24,duration:1.6},7.78).to(skySunset,{opacity:.96,duration:1.6},7.78).to(westGlow,{opacity:.94,duration:1.45},7.85).to(eastGlow,{opacity:0,duration:1.0},7.8);
  tl.to(oceanMat.color,{r:.17,g:.18,b:.23,duration:1.55},7.8);
  for(const n of startNodes.values()){
    tl.to(n.scale,{x:.78,y:.78,z:.78,duration:.65},7.92);
    tl.to(n.userData.core.material,{opacity:.16,duration:.65},7.92);
    tl.to(n.userData.ring.material,{opacity:.055,duration:.65},7.92);
    tl.to(n.userData.sprite.material,{opacity:.035,duration:.65},7.92);
  }
  roadHintNetworks.forEach(n=>tl.to(n.material,{opacity:n.userData.sunsetOpacity,duration:.65},7.98));
  tl.to(mergedNetwork.material,{opacity:.24,duration:.65},8.0);mainLines.forEach((l,i)=>tl.to(l.material,{opacity:.38,duration:.65},8.0+i*.02));
  convergenceLines.forEach((l,i)=>{const p={v:0};tl.to(l.material,{opacity:1,duration:.24},8.06+i*.055);tl.to(p,{v:1,duration:1.18,onUpdate:()=>setProgress(l,p.v),ease:'power2.inOut'},8.1+i*.065)});
  tl.to(finishNode.scale,{x:1.72,y:1.72,z:1.72,duration:.56,ease:'power2.out'},9.1);nodeOpacity(tl,finishNode,9.08,{core:1,ring:1,glow:1,duration:.42});
  tl.to(statement,{opacity:1,y:0,duration:.6,ease:'power2.out'},9.33);

  tl.to({}, {duration:.35},10.2);

  roadHintNetworks.forEach(n=>tl.to(n.material,{opacity:0,duration:.34},10.5));seedLines.forEach(l=>tl.to(l.material,{opacity:0,duration:.34},10.5));tl.to(mergedNetwork.material,{opacity:0,duration:.36},10.5);convergenceLines.forEach(l=>tl.to(l.material,{opacity:0,duration:.36},10.52));
  checkpointGroup.children.forEach(n=>{tl.to(n.userData.core.material,{opacity:0,duration:.3},10.5);tl.to(n.userData.ring.material,{opacity:0,duration:.3},10.5);tl.to(n.userData.sprite.material,{opacity:0,duration:.3},10.5)});
  mainLines.forEach(l=>tl.to(l.material,{opacity:l===personalLine?1:.045,duration:.4},10.54));
  for(const [id,n] of startNodes){const selected=id===personalStart;tl.to(n.userData.sprite.material,{opacity:selected?.85:.02,duration:.4},10.54);tl.to(n.userData.core.material,{opacity:selected?.9:.05,duration:.4},10.54);tl.to(n.userData.ring.material,{opacity:selected?.48:.02,duration:.4},10.54);tl.to(n.scale,{x:selected?1.34:.68,y:selected?1.34:.68,z:selected?1.34:.68,duration:.4},10.54)}
  if(personalLine)tl.to(personalLine.material,{linewidth:4.4,duration:.35},10.58);
  tl.to(finishNode.userData.sprite.material,{opacity:.22,duration:.36},10.55).to(finishNode.userData.ring.material,{opacity:.38,duration:.36},10.55);

  const selected=startNodes.get(personalStart);
  if(selected){
    tl.call(()=>{const p=projectToFrame(selected.position);gsap.set(matchOrb,{left:p.x,top:p.y,opacity:0,scale:.12})},null,11.56);
    tl.to(statement,{opacity:0,y:-8,duration:.26},11.55)
      .to(matchOrb,{opacity:1,scale:1.1,duration:.28,ease:'power2.out'},11.58)
      .to(matchOrb,{scale:42,opacity:1,duration:1.1,ease:'power2.inOut'},11.66)
      .to(stage,{opacity:.015,duration:.72,ease:'sine.in'},11.88)
      .to([skySunset,skyDay],{opacity:0,duration:.7},11.88)
      .to(westGlow,{opacity:0,duration:.55},11.9);
  }
  return tl;
}

function showStatic(){
  stage.style.opacity='1';overviewLayer.style.display='none';skyNight.style.opacity='0';skyDay.style.opacity='.94';dayTerrainMat.opacity=1;sunsetTerrainMat.opacity=0;
  Object.assign(cam,{x:11,y:32,z:43,tx:0,ty:.1,tz:7});syncCamera();
  for(const n of startNodes.values()){n.scale.setScalar(1);n.userData.core.material.opacity=.8;n.userData.ring.material.opacity=.3;n.userData.sprite.material.opacity=.25}
  mainLines.forEach(l=>{setProgress(l,1);l.material.opacity=.78});roadHintNetworks.forEach(n=>n.material.opacity=n.userData.dayOpacity*.72);mergedNetwork.material.opacity=.72;statement.style.opacity='1';statement.style.transform='none';nodeOpacity(gsap.timeline(),finishNode,0,{core:1,ring:.8,glow:.8});finishNode.scale.setScalar(1.4);
}

function resize(){const w=stage.clientWidth,h=stage.clientHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);composer.setSize(w,h);bloom.setSize(w,h);[...mainLines,...seedLines,...convergenceLines].forEach(l=>l.material.resolution.set(w,h));roadHintNetworks.forEach(n=>n.material.resolution.set(w,h));if(mergedNetwork)mergedNetwork.material.resolution.set(w,h)}
addEventListener('resize',resize,{passive:true});addEventListener('keydown',e=>{if(e.code==='KeyR')location.reload()});

const clock=new THREE.Clock();
function render(){
  requestAnimationFrame(render);
  if(finishNode&&finishNode.userData.sprite.material.opacity>.2){const b=finishNode.userData.sprite.userData.baseScale||1;const p=1+Math.sin(clock.getElapsedTime()*2.2)*.04;finishNode.userData.sprite.scale.set(b*p,b*p,1)}
  composer.render();
}
render();
