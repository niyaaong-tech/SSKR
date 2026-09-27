const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {routeCoordinates,routePlaces,safePadding,clusterPlaces}=require('../../web/shared/map/map.js');

const places=[
 {id:'start',kind:'start',name:'출발지',lat:37.7,lng:128.9,number:'출'},
 {id:'a',kind:'spot',name:'첫 스팟',lat:37.4,lng:128.4,number:41},
 {id:'b',kind:'spot',name:'둘째 스팟',lat:36.9,lng:127.8,number:52},
 {id:'finish',kind:'finish',name:'도착지',lat:36.3,lng:126.5,number:'도'},
 {id:'candidate',kind:'spot',name:'추천 스팟',lat:37.2,lng:128.1,number:70}
];
const leg=(from,to,status='ready')=>({fromId:from.id,toId:to.id,status,coordinates:[[from.lat,from.lng],[to.lat,to.lng]]});

test('route geometry omits unavailable legs instead of joining their endpoints',()=>{
 const valid=leg(places[0],places[1]);
 assert.deepEqual(routeCoordinates([valid,leg(places[1],places[2],'unavailable'),leg(places[2],places[3],'pending'),{coordinates:[[36,127],[NaN,128]]},{coordinates:[[126,36],[127,37]]}]),[valid.coordinates]);
 assert.deepEqual(routeCoordinates(null),[]);
});

test('route marker order preserves place identity and numbers only selected stops',()=>{
 const catalog=new Map(places.map(p=>[p.id,p]));
 const ordered=routePlaces(catalog,['start','b','a','b','missing','finish']);
 assert.deepEqual(ordered.map(p=>[p.id,p.number]),[['start','출'],['b',1],['a',2],['finish','도']]);
 assert.equal(catalog.get('b').number,52);
 const groups=clusterPlaces(ordered,()=>({x:10,y:10}),50,'',new Set(ordered.map(p=>p.id)));
 assert.equal(groups.length,4,'selected stops remain separately selectable at low zoom');
});

test('planner fit padding accounts for overlays without leaving a negative map area',()=>{
 const input={width:1200,height:700,mobile:false,cardHeight:80,editing:true};
 assert.deepEqual(safePadding(input),{paddingTopLeft:[20,60],paddingBottomRight:[20,30]});
 assert.deepEqual(safePadding({...input,insets:{right:340,bottom:100}}),{paddingTopLeft:[20,60],paddingBottomRight:[360,130]});
 const narrow=safePadding({...input,width:320,height:300,insets:{left:200,right:200,top:100,bottom:300}});
 assert.ok(narrow.paddingTopLeft[0]+narrow.paddingBottomRight[0]<=256);
 assert.ok(narrow.paddingTopLeft[1]+narrow.paddingBottomRight[1]<=236);
 const browse=safePadding({...input,editing:false});
 assert.ok(browse.paddingTopLeft[0]>100,'browse mode still reserves its photo-card rails');
});

function fixture(options={}){
 class Element{
  constructor(){this.style={setProperty:(key,value)=>{this.style[key]=value;},removeProperty:key=>delete this.style[key]};this.listeners={};this.attributes={};this.children=new Map();this.classes=new Set();this.classList={add:(...names)=>names.forEach(n=>this.classes.add(n)),remove:(...names)=>names.forEach(n=>this.classes.delete(n)),toggle:(n,value)=>value?this.classes.add(n):this.classes.delete(n),contains:n=>this.classes.has(n)};this.clientHeight=700;this.clientWidth=1200;}
  addEventListener(type,fn){this.listeners[type]=fn;}
  setAttribute(name,value){this.attributes[name]=value;}
  querySelector(selector){return this.children.get(selector)||null;}
  querySelectorAll(){return [];}
  contains(){return false;}
 }
 const host=new Element();
 for(const selector of ['.spot-attribution','.spot-map','.spot-map-wrap','.spot-list','.spot-list-head','.spot-card-pages','.spot-map-status','[data-result-label]','[data-result-count]','[data-card-page]','[data-in-view]','[data-action="fit"]','[data-action="previous-cards"]','[data-action="next-cards"]'])host.children.set(selector,new Element());
 host.querySelector('.spot-attribution').children.set('summary',new Element());
 const map={zoom:7,min:4,layers:[],fitCalls:[],handlers:{},setView(){return this;},setMinZoom(n){this.min=n;return this;},setMaxBounds(){return this;},getMinZoom(){return this.min;},getZoom(){return this.zoom;},getBoundsZoom(){return 7;},setZoom(n){this.zoom=n;return this;},getBounds(){return {contains:()=>true};},project:([lat,lng])=>({x:lng*100,y:lat*100}),createPane:()=>({style:{}}),on(name,fn){this.handlers[name]=fn;return this;},fitBounds(bounds,opts){this.fitCalls.push({bounds,opts});return this;},getSize(){return {x:1200,y:700};},remove(){this.removed=true;this.layers.forEach(l=>l.clearLayers?.());this.layers=[];}};
 const groups=[];
 const group=()=>{const g={children:[],addTo(m){m.layers.push(this);return this;},clearLayers(){this.children=[];return this;},getBounds(){return {isValid:()=>this.children.length>0,extend(){return this;}};}};groups.push(g);return g;};
 const leaflet={map:()=>map,latLngBounds:points=>({points}),point:points=>({add:other=>points.map((v,i)=>v+other[i])}),layerGroup:group,featureGroup:group,DomEvent:{disableClickPropagation(){},stopPropagation(){}},divIcon:opts=>opts,
  marker(point,opts){return {point,options:opts,handlers:{},bindTooltip(tip,options){this.tip=tip;this.tipOptions=options;return this;},on(name,fn){this.handlers[name]=fn;return this;},addTo(layer){layer.children.push(this);return this;}};},
  polyline(coordinates,opts){return {coordinates,options:opts,addTo(layer){(layer.children||layer.layers).push(this);return this;},setLatLngs(next){this.coordinates=next;return this;},setStyle(next){Object.assign(this.options,next);return this;}};}
 };
 const observers=[];
 class Observer{constructor(){observers.push(this);}observe(){}disconnect(){this.disconnected=true;}}
 const sandbox={L:leaflet,console,AbortController,matchMedia:()=>({matches:false}),document:{createElement:()=>new Element(),activeElement:null},IntersectionObserver:Observer,ResizeObserver:Observer,fetch:()=>new Promise(()=>{}),SSKR_MAP_INTERACTION:{bindWheel(opts){sandbox.wheel=opts;}},setTimeout,clearTimeout,requestAnimationFrame:fn=>fn(),scrollY:0};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../../web/shared/map/map.js'),'utf8'),sandbox);
 const callbacks=[];
 const api=sandbox.SSKR_MAP.mount(host,{items:places,catalog:places,onSelect:p=>callbacks.push(p.id),...options});
 return {host,map,groups,observers,api,callbacks,sandbox};
}

test('planner updates retain filtered stops and candidates without refitting the map',()=>{
 const {host,map,groups,api,callbacks}=fixture();
 api.setEditing(true);
 api.setRoute([leg(places[0],places[1]),leg(places[1],places[2],'unavailable'),leg(places[2],places[3])],{selectedIds:['start','a','b','finish'],activeId:'a'});
 api.setCandidates([places[4]]);
 const before=map.fitCalls.length;
 api.setItems([],{fit:false});
 assert.equal(groups[1].children.length,2,'failed leg is not bridged');
 assert.equal(groups[0].children.length,5,'filtered chosen places and recommendation remain on map');
 const markers=groups[0].children;
 assert.equal(markers.filter(m=>m.options.icon.className.includes('is-route-stop')).length,4);
 assert.equal(markers.filter(m=>m.options.icon.className.includes('is-route-candidate')).length,1);
 const active=markers.find(m=>m.options.icon.className.includes('is-route-active'));
 assert.equal(active.options.title,'첫 스팟');
 active.handlers.click({});
 assert.deepEqual(callbacks,['a'],'callbacks retain original place IDs');
 api.setRoute([leg(places[0],places[2])],{selectedIds:['start','b','finish']});
 assert.equal(groups[1].children.length,1,'old route segments are removed');
 assert.equal(map.fitCalls.length,before,'editing does not re-fit automatically');
 api.setInsets({right:320});
 api.fitRoute();
 assert.equal(map.fitCalls.length,before+1);
 assert.equal(map.fitCalls.at(-1).opts.paddingBottomRight[0],340);
 api.setEditing(false);
 assert.equal(groups[1].children.length,0);
 assert.equal(groups[0].children.length,0);
 assert.equal(host.classList.contains('is-route-editing'),false);
 api.setEditing(true);
 assert.equal(groups[1].children.length,1,'returning to edit restores route state');
 api.destroy();
});

test('legacy memorial routes survive edit toggles and destroy disposes planner state',()=>{
 const memorialLine=[[37.7,128.9],[36.3,126.5]];
 const {host,map,groups,api,observers,sandbox}=fixture({route:[memorialLine],cluster:false});
 assert.equal(groups[1].children.length,1);
 api.setEditing(true);
 api.setRoute([leg(places[0],places[1])],{selectedIds:['start','a','finish']});
 api.setEditing(false);
 assert.equal(groups[1].children[0].coordinates,memorialLine);
 api.setItems(places.slice(0,2));
 assert.equal(map.fitCalls.length,2,'legacy setItems still fits by default');
 api.setInsets({bottom:120});
 api.destroy();
 assert.ok(map.removed);
 assert.ok(sandbox.wheel.signal.aborted);
 assert.ok(observers.every(o=>o.disconnected));
 assert.equal(host.classList.contains('sskr-map'),false);
 assert.equal(host.style['--map-inset-bottom'],undefined);
 api.setEditing(true);api.setRoute([leg(places[0],places[1])]);api.setCandidates(places);api.setItems(places);api.fitRoute();
 assert.equal(groups[1].children.length,0,'disposed map cannot recreate overlays');
});
