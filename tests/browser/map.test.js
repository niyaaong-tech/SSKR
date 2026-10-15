const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const net=require('node:net'),path=require('node:path'),fs=require('node:fs');
const {chromium,webkit}=require('playwright');
const {measureBox,assertCenteredText,assertTextFits,assertSameSize,recordGeometry}=require('./ui-geometry.cjs');
const engine=process.env.BROWSER_ENGINE==='webkit'?webkit:chromium;
const fixture=require('../../data/fixtures/memorial-event.json');
let server,browser,base;
before(async()=>{
 const port=await new Promise(resolve=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const port=s.address().port;s.close(()=>resolve(port));});});
 base='http://127.0.0.1:'+port;
 server=spawn(process.execPath,['server/dev-server.js'],{cwd:path.resolve(__dirname,'../..'),env:{...process.env,SSKR_DEV_PORT:String(port)},stdio:['ignore','pipe','pipe'],windowsHide:true});
 await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Dev server did not start')),10000);server.stdout.on('data',b=>{if(b.toString().includes('SSKR dev server')){clearTimeout(timer);resolve();}});server.once('error',reject);server.once('exit',code=>{clearTimeout(timer);reject(Error('Dev server exited '+code));});});
 browser=await engine.launch({headless:true,...(engine===chromium?{channel:process.env.BROWSER_CHANNEL||(process.platform==='win32'?'msedge':undefined)}:{})});
});
after(async()=>{await browser?.close();server?.kill();});
const errors=[];
async function page(width=1440,height=1000,input={}){const p=await browser.newPage({viewport:{width,height},...input,reducedMotion:'reduce'});p.on('pageerror',e=>errors.push(e.message));
 // Observe map state without adding test globals to production code.
 await p.route('**/web/shared/map/map.js*',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace('layer=root.L.layerGroup().addTo(map);','window.__map=map;layer=root.L.layerGroup().addTo(map);').replace('backdrop=root.L.maplibreGL','backdrop=window.__backdrop=root.L.maplibreGL')});});return p;
}
async function open(p,url){await p.goto(base+url);if(url.startsWith('/app/memorials/')){await p.waitForSelector('.memorial-detail');await p.getByText('여정 지도 보기',{exact:true}).click();}await p.waitForSelector('.spot-mini-card');await p.waitForFunction(()=>window.__backdrop?.getMaplibreMap().isStyleLoaded()&&window.__backdrop?.getMaplibreMap().areTilesLoaded(),null,{timeout:60000});assert.equal(await p.locator('.spot-map-status').textContent(),'');assert.ok(await p.evaluate(()=>__backdrop.getMaplibreMap().querySourceFeatures('openmaptiles',{sourceLayer:'sskr_land'}).length));}
const metrics=p=>p.locator('.spot-mini-select').first().evaluate(e=>{const s=getComputedStyle(e),caption=getComputedStyle(e.querySelector('strong'));return {width:s.width,height:s.height,radius:s.borderRadius,font:caption.fontSize,color:caption.color};});
async function capture(p,name){if(!process.env.SSKR_QA_OUTPUT)return;const dir=path.join(require('./ui-evidence.cjs').output(),process.env.SSKR_QA_PHASE||process.env.SSKR_QA_RUN_ID||'checks','screenshots',process.env.BROWSER_ENGINE||'chromium');fs.mkdirSync(dir,{recursive:true});const file=path.join(dir,name+'.png');if(fs.existsSync(file))throw Error('Screenshot evidence already exists: '+file);const target=p.locator(".spot-workspace");await target.screenshot({path:file});}
async function terrainCovers(p,coordinates){return p.evaluate(([lat,lng])=>{const path=document.querySelector('.leaflet-sskr-base-land-pane path'),point=__map.latLngToContainerPoint([lat,lng]),box=document.querySelector('.spot-map').getBoundingClientRect();const local=new DOMPoint(box.left+point.x,box.top+point.y).matrixTransform(path.getScreenCTM().inverse());return path.isPointInFill(local)&&getComputedStyle(path).fillOpacity==='1';},coordinates);}
test('spot, memorial and public explorer keep the same map style and card dimensions',async()=>{
 const p=await page(),memorial=fixture.memorials.find(m=>m.spotCount===12);let expected;
 for(const [name,url] of [['spots','/app/spots?scenario=guest'],['memorial','/app/memorials/'+memorial.id+'?scenario=guest'],['explore','/explore/']]){await open(p,url);const current=await metrics(p);if(expected)assert.deepEqual(current,expected);else expected=current;assert.equal(await p.locator('.spot-mini-card').count(),12);assert.equal(await p.evaluate(()=>__backdrop.getMaplibreMap().getStyle().name),'SSKR Korea');
  await p.locator('.spot-mini-select').first().click();await p.locator('.leaflet-tooltip .spot-photo-card').last().waitFor();
  const photo=await p.locator('.leaflet-tooltip .spot-photo-card').last().evaluate(e=>{const r=e.getBoundingClientRect(),caption=e.querySelector('strong').getBoundingClientRect();return {height:r.height,top:r.top,bottom:r.bottom,captionTop:caption.top,captionBottom:caption.bottom};});
  assert.ok(photo.height>=80&&photo.captionTop>=photo.top&&photo.captionBottom<=photo.bottom,name+' tooltip photo and caption must fill the card');
  await capture(p,name);if(name==='memorial'){await p.locator('[data-action="next-cards"]').click();assert.equal(await p.locator('.spot-mini-card').count(),2);assert.match(await p.locator('.spot-mini-select').last().textContent(),/대천해수욕장/);}}
 await p.close();assert.deepEqual(errors,[]);
});
test('mobile cards fill bottom rows; wheel gestures retain their original owner',async()=>{
 const p=await page(390,844),memorial=fixture.memorials.find(m=>m.spotCount===10);await open(p,'/app/memorials/'+memorial.id+'?scenario=guest');
 const rows=await p.locator('.spot-mini-card').evaluateAll(es=>es.map(e=>getComputedStyle(e).gridRowStart));assert.deepEqual([1,2,3].map(r=>rows.filter(x=>x===String(r)).length),[4,4,4]);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await p.locator('.spot-map').evaluate(e=>scrollTo(0,scrollY+e.getBoundingClientRect().top-82));await p.waitForTimeout(350);let box=await p.locator('.spot-map').boundingBox();await p.mouse.move(box.x+box.width/2,box.y+box.height*.3);let before=await p.evaluate(()=>({z:__map.getZoom(),y:scrollY}));await p.mouse.wheel(0,-120);await p.waitForTimeout(100);assert.ok(await p.evaluate(()=>__map.getZoom())>before.z);assert.equal(await p.evaluate(()=>scrollY),before.y);
 await p.waitForTimeout(350);const zoom=await p.evaluate(()=>__map.getZoom());await p.mouse.move(195,30);await p.mouse.wheel(0,60);await p.waitForTimeout(60);box=await p.locator('.spot-map').boundingBox();await p.mouse.move(box.x+box.width/2,box.y+box.height*.3);await p.mouse.wheel(0,60);await p.waitForTimeout(100);assert.equal(await p.evaluate(()=>__map.getZoom()),zoom);assert.ok(await p.evaluate(()=>scrollY)>before.y);
 await capture(p,'mobile');await p.close();assert.deepEqual(errors,[]);
});
test('overview zoom stops at the spot layout and panning stays within Korean territory',async()=>{
 for(const [width,height,name,floor] of [[1440,1000,'overview-desktop',6],[390,844,'overview-mobile',5]]){
  const p=await page(width,height);await p.goto(base+'/app/spots?scenario=guest');await p.waitForSelector('.spot-mini-card');
  await p.waitForSelector('.leaflet-sskr-land-pane path');
  const min=await p.evaluate(()=>__map.getMinZoom());
  assert.ok(min>=floor&&min<=9,`${name} minimum zoom ${min}`);
  await p.evaluate(()=>__map.setZoom(4,{animate:false}));
  assert.equal(await p.evaluate(()=>__map.getZoom()),min);
  await p.evaluate(()=>__map.setZoom(Math.max(__map.getMinZoom(),9),{animate:false}));
  for(const [direction,lat,lng] of [['north',50,128],['south',25,127],['east',37,140],['west',36,115]]){
   await p.evaluate(([lat,lng])=>__map.panTo([lat,lng],{animate:false}),[lat,lng]);
   const bounds=await p.evaluate(()=>{const b=__map.getBounds();return {north:b.getNorth(),south:b.getSouth(),east:b.getEast(),west:b.getWest()};});
   assert.ok(bounds.north<=43.08&&bounds.south>=33.04&&bounds.east<=131.97&&bounds.west>=124.25,`${name} ${direction}: ${JSON.stringify(bounds)}`);
  }
  assert.ok(await p.locator('.sskr-land-label.is-dokdo').count());
  await capture(p,name);await p.close();
 }
 assert.deepEqual(errors,[]);
});

const numberSize = width => width <= 800 ? 18 : 20;
function assertNumberBadge(metrics, width, label = 'number badge') {
 assert.equal(metrics.box.width,numberSize(width),label+' width');
 assert.equal(metrics.box.height,numberSize(width),label+' height');
 assert.equal(metrics.fontSize,width<=800?9:10,label+' font');
 assert.equal(metrics.padding.top,1,label+' baseline inset');
 assert.deepEqual([metrics.padding.right,metrics.padding.bottom,metrics.padding.left],[0,0,0],label+' padding');
 assertCenteredText(metrics,{xTolerance:.1,yTolerance:.6,label});assertTextFits(metrics,{label});
}
function assertClusterBadge(metrics,width){
 assert.equal(metrics.box.height,numberSize(width),'cluster height');
 assert.equal(metrics.fontSize,width<=800?9:10,'cluster font');
 assert.deepEqual(metrics.padding,{top:1,right:3,bottom:0,left:3},'cluster padding');
 const extraWidth=metrics.box.width-metrics.border.left-metrics.border.right-metrics.padding.left-metrics.padding.right-metrics.text.width;
 assert.ok(extraWidth>=-.5&&extraWidth<=1,'cluster has unexplained horizontal whitespace: '+JSON.stringify(metrics));
 assertCenteredText(metrics,{xTolerance:.1,yTolerance:.6,label:'cluster'});assertTextFits(metrics,{label:'cluster'});
}

test('UI geometry: compact cluster labels center real text and retain touch expansion',async()=>{
 for(const [width,height,url]of [[1440,900],[360,760],[390,844],[430,844],[800,844],[801,900],[1440,900,'/explore/'],[390,844,'/explore/']]){
  const mobile=width<=800,p=await page(width,height,{isMobile:mobile,hasTouch:mobile});
  try{
   await open(p,url||'/app/spots?scenario=guest');const grouped=p.locator('.spot-pin.cluster').first(),badge=grouped.locator('span');
   assert.match(await grouped.textContent(),/^\d+스팟$/);assert.match(await grouped.getAttribute('aria-label'),/스팟 묶음 확대$/);assert.equal(await p.locator('.spot-pin.is-route-stop').count(),0);
   const metrics=await measureBox(badge);assertClusterBadge(metrics,width);
   const hit=await grouped.boundingBox();assert.equal(hit.width,48);assert.equal(hit.height,30);
   assert.ok(Math.abs(metrics.box.x+metrics.box.width/2-hit.x-hit.width/2)<.1&&Math.abs(metrics.box.y+metrics.box.height/2-hit.y-hit.height/2)<.1,'visual label must stay on its geographic anchor');
   const plain=p.locator('.spot-pin.spot:not(.cluster)>span').first();
   const styles=await Promise.all([plain,badge].map(el=>el.evaluate(e=>{const s=getComputedStyle(e);return {background:s.backgroundColor,color:s.color,radius:s.borderRadius};})));
   assert.ok(styles.every(s=>s.radius!=='50%'));assert.notEqual(styles[0].background,styles[1].background);
   const lum=color=>color.match(/[\d.]+/g).slice(0,3).map(v=>{v=Number(v)/255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
   assert.ok(styles.every(s=>(lum(s.background)+.05)/(lum(s.color)+.05)>=4.5));
   const original=await badge.textContent(),samples=[];
   try{for(const text of ['2스팟','23스팟','200스팟']){await badge.evaluate((e,text)=>e.textContent=text,text);const sample=await measureBox(badge);assertClusterBadge(sample,width);samples.push(sample);}}
   finally{await badge.evaluate((e,text)=>e.textContent=text,original);}
   await recordGeometry(p,'cluster-'+width+(url?'-public':''),{metrics,hit,samples});await capture(p,'cluster-'+width+(url?'-public':''));
   const zoom=await p.evaluate(()=>__map.getZoom());if(mobile)await grouped.tap();else await grouped.click();await p.waitForFunction(z=>__map.getZoom()>z&&!__map._animatingZoom,zoom);assert.equal(await p.locator('.spot-pin.is-route-stop').count(),0);
  }finally{await p.close();}
 }
 assert.deepEqual(errors,[]);
});

test('UI geometry: one two and three digit map and photo badges use matching compact centered boxes',async()=>{
 const spots=require('../../web/app/spot-catalog').filter(p=>p.kind==='spot');
 for(const [width,height]of [[1440,1000],[390,844],[360,540]]){
  const p=await page(width,height,{isMobile:width<=800,hasTouch:width<=800});
  try{for(const id of [spots[0].id,spots[11].id,spots.at(-1).id]){
   await open(p,'/app/spots/'+id+'?scenario=guest');await p.waitForFunction(()=>window.__map&&!__map._animatingZoom&&document.querySelector('.spot-pin.is-selected>span'));
   const marker=await measureBox(p.locator('.spot-pin.is-selected>span'));assertNumberBadge(marker,width,'map '+id);
   const photo=await measureBox(p.locator('.spot-mini-number:visible').filter({hasText:new RegExp('^'+marker.textContent+'$')}).first());assertNumberBadge(photo,width,'photo '+id);assertSameSize(marker,photo);
   await recordGeometry(p,'number-'+width+'-'+id,{marker,photo});
   if(id===spots.at(-1).id)await capture(p,'number-marker-'+width);
  }}finally{await p.close();}
 }
 assert.deepEqual(errors,[]);
});

test('UI geometry: badge assertions reject oversized insets miscentering and inconsistent photo sizes',async()=>{
 const cases=[
  {name:'oversized map padding',selector:'.spot-pin.is-selected>span',css:'padding:8px!important;width:34px!important;height:34px!important',check:assertNumberBadge},
  {name:'horizontal text offset',selector:'.spot-pin.is-selected>span',css:'padding-left:6px!important',check:assertNumberBadge},
  {name:'vertical text offset',selector:'.spot-pin.is-selected>span',css:'padding-top:6px!important',check:assertNumberBadge},
  {name:'oversized photo badge',selector:'.spot-mini-number',css:'width:26px!important;height:26px!important',check:assertNumberBadge}
 ];
 for(const width of [390,1440]){
  const p=await page(width,844);const detections=[];
  try{
   await open(p,'/app/spots/'+require('../../web/app/spot-catalog').filter(s=>s.kind==='spot').at(-1).id+'?scenario=guest');
   const marker=p.locator('.spot-pin.is-selected>span');assertNumberBadge(await measureBox(marker),width);
   for(const item of cases){
    const style=await p.addStyleTag({content:'.sskr-map '+item.selector+'{'+item.css+'}'});
    try{const target=p.locator(item.selector+':visible').first(),metrics=await measureBox(target);assert.throws(()=>item.check(metrics,width,item.name),error=>error.code==='ERR_ASSERTION',item.name+' must be detected');detections.push({name:item.name,metrics});}
    finally{await style.evaluate(e=>e.remove());}
    assertNumberBadge(await measureBox(marker),width,'restored map');
   }
   await open(p,'/app/spots?scenario=guest');const cluster=p.locator('.spot-pin.cluster>span').first();assertClusterBadge(await measureBox(cluster),width);
   const style=await p.addStyleTag({content:'.sskr-map .spot-pin.cluster>span{width:48px!important;height:30px!important;padding:6px!important}'});
   try{const metrics=await measureBox(cluster);assert.throws(()=>assertClusterBadge(metrics,width),error=>error.code==='ERR_ASSERTION','old cluster box must be rejected');detections.push({name:'oversized cluster',metrics});}
   finally{await style.evaluate(e=>e.remove());}
   assertClusterBadge(await measureBox(cluster),width);await recordGeometry(p,'negative-badges-'+width,{detections});
  }finally{await p.close();}
 }
 assert.deepEqual(errors,[]);
});

test('coastal map details are preserved at high zoom',async()=>{
 const p=await page();for(const id of ['daecheon','jangho','gyeongju','hupo','ganwolam','muchangpo']){await open(p,'/app/spots/'+id+'?scenario=guest');const place=require('../../web/app/spot-catalog').find(p=>p.id===id);await p.evaluate(p=>__map.setView([p.lat,p.lng],14,{animate:false}),place);await p.waitForTimeout(300);await p.waitForFunction(()=>__backdrop.getMaplibreMap().getZoom()>=13&&__backdrop.getMaplibreMap().areTilesLoaded(),null,{timeout:60000});assert.ok(await p.evaluate(p=>__map.getCenter().distanceTo([p.lat,p.lng])<100,place));const counts=await p.evaluate(()=>{const g=__backdrop.getMaplibreMap();return {water:g.querySourceFeatures('openmaptiles',{sourceLayer:'water'}).length,roads:g.querySourceFeatures('openmaptiles',{sourceLayer:'transportation'}).length};});assert.ok(counts.water>0,id+' water');assert.ok(counts.roads>0,id+' roads');if(id==='daecheon')await capture(p,'coast');}await p.close();assert.deepEqual(errors,[]);
});

test('South Korean terrain remains visible in the gap before vector tiles reach their minimum zoom',async()=>{
 const p=await page(390,430);await p.goto(base+'/app/spots?scenario=guest');await p.waitForSelector('.leaflet-sskr-base-land-pane path');
 await p.locator('[data-spot-mode="plan"]').click();
 // Exercise the shared terrain fallback below the tighter APP overview limit.
 await p.waitForTimeout(250);await p.evaluate(()=>{__map.setMinZoom(4);__map.setZoom(5.75,{animate:false});});await p.waitForFunction(()=>__backdrop.getMaplibreMap().isStyleLoaded()&&__backdrop.getMaplibreMap().areTilesLoaded());
 const gap=await p.evaluate(()=>{const gl=__backdrop.getMaplibreMap();return {leaflet:__map.getZoom(),vector:gl.getZoom(),minimum:gl.getStyle().sources.openmaptiles.minzoom,features:gl.querySourceFeatures('openmaptiles',{sourceLayer:'sskr_land'}).length};});
 assert.equal(gap.leaflet,5.75);assert.ok(gap.vector<gap.minimum);assert.equal(gap.features,0,'the regression must exercise terrain without vector tiles');
 for(const zoom of [5.5,5.75,6,8.25,5.75]){
  await p.evaluate(zoom=>__map.setView([36.5,128],zoom,{animate:false}),zoom);await p.waitForTimeout(150);assert.ok(await terrainCovers(p,[36.5,128]),'projected inland coordinates must stay on visible terrain at zoom '+zoom);
 }
 const layers=await p.evaluate(()=>{const gl=__backdrop.getMaplibreMap(),land=document.querySelector('.leaflet-sskr-base-land-pane'),tiles=gl.getCanvas().closest('.leaflet-pane');return {land:+getComputedStyle(land).zIndex,tiles:+getComputedStyle(tiles).zIndex,background:gl.getPaintProperty('background','background-opacity'),sea:getComputedStyle(document.querySelector('.spot-map')).backgroundColor};});
 assert.ok(layers.land<layers.tiles);assert.equal(layers.background,0);assert.equal(layers.sea,'rgb(188, 211, 212)');
 await capture(p,'mobile-terrain-gap');await p.setViewportSize({width:1440,height:900});await p.waitForTimeout(300);assert.equal(await p.locator('.leaflet-sskr-base-land-pane path').getAttribute('fill-opacity'),'1');
 assert.deepEqual(errors,[]);await p.close();
});

test('failed detail tiles preserve terrain and map actions, and reconnecting retries the failed view',async()=>{
 const p=await page(390,844);let failed=0;await p.route('**/api/map-tile?*',route=>{failed++;return route.fulfill({status:502,contentType:'text/plain',body:'Map tile unavailable'});});
 await p.goto(base+'/app/spots?scenario=guest');await p.waitForSelector('.leaflet-sskr-base-land-pane path');await p.locator('[data-spot-mode="plan"]').click();
 await p.evaluate(()=>__map.setView([36.5,128],8.25,{animate:false}));await p.waitForTimeout(500);assert.ok(failed>0);
 assert.match(await p.locator('.spot-map-status').textContent(),/기본 지형/);assert.ok(await terrainCovers(p,[36.5,128]));
 assert.equal(await p.locator('.leaflet-sskr-base-land-pane path').getAttribute('fill-opacity'),'1');assert.equal(await p.evaluate(()=>__backdrop.getMaplibreMap().querySourceFeatures('openmaptiles',{sourceLayer:'sskr_land'}).length),0);
 await p.locator('#rp-tab-search').click();
 await p.locator('.rp-place-results .rp-place-view').first().click();await p.locator('.leaflet-tooltip .spot-route-add:visible').last().waitFor();await capture(p,'mobile-terrain-failed-tiles');
 await p.unroute('**/api/map-tile?*');await p.evaluate(()=>dispatchEvent(new Event('online')));
 await p.waitForFunction(()=>{const gl=__backdrop.getMaplibreMap();return gl.areTilesLoaded()&&gl.querySourceFeatures('openmaptiles',{sourceLayer:'sskr_land'}).length>0;},null,{timeout:60000});
 assert.equal(await p.locator('.leaflet-sskr-base-land-pane path').getAttribute('fill-opacity'),'1');assert.equal(await p.locator('.spot-map-status').textContent(),'');await capture(p,'mobile-terrain-restored');assert.deepEqual(errors,[]);await p.close();
});

test('a failed WebGL initialization leaves a usable explorer, route planner and navigation',async()=>{
 for(const [width,height]of [[1180,757],[390,664]]){
  const p=await page(width,height);
  await p.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /webgl/i.test(type)?null:original.call(this,type,...args);};});
  await p.goto(base+'/explore/#gangneung');await p.waitForSelector('.spot-mini-card');await p.waitForSelector('.leaflet-sskr-base-land-pane path');
  await p.getByRole('link',{name:/이 출발지로 루트 계획/}).click();
  await p.waitForSelector('.route-planner');assert.match(await p.locator('.spot-map-status').textContent(),/기본 지형/);assert.equal(await p.locator('.leaflet-maplibre-gl').count(),0);
  await p.locator('[data-action="zoom-in"]').click();await p.locator('[data-action="fit"]').click();await p.locator('.rp-place-view').first().click();await p.waitForSelector('.spot-route-action-wrap');
  await p.evaluate(()=>{const link=document.querySelector('#app-nav a[href="/app"]');link.click();});await p.waitForSelector('.manager-dashboard');await p.evaluate(()=>document.querySelector('#app-nav a[href="/app/spots"]').click());await p.waitForSelector('.spot-map');
  assert.ok(await p.locator('.leaflet-sskr-base-land-pane path').count());assert.deepEqual(errors,[]);await p.close();
 }
});

test('leaving an actively zooming map never updates its removed pane',async()=>{
 for(const motion of ['no-preference','reduce'])for(const [width,height]of [[1180,757],[390,664]]){
  const p=await page(width,height);await p.emulateMedia({reducedMotion:motion});await p.goto(base+'/app/spots?scenario=guest');await p.waitForSelector('.leaflet-sskr-base-land-pane path');await p.waitForFunction(()=>window.__map&&!__map._animatingZoom);
  // Begin Leaflet's real transition synchronously so fast navigation cannot miss it.
  await p.evaluate(()=>__map._animateZoom(__map.getCenter(),Math.min(__map.getMaxZoom(),__map.getZoom()+1),true));await p.evaluate(()=>document.querySelector('#app-nav a[href="/app"]').click());await p.waitForSelector('.manager-dashboard');await p.waitForTimeout(350);assert.deepEqual(errors,[],`${width} ${motion}: removed zoom callbacks`);await p.close();
 }
});


test('mobile editor keeps vector geography aligned with Leaflet markers across layout and viewport changes',async()=>{
 const p=await page(390,844,{isMobile:true,hasTouch:true});await open(p,'/app/spots?scenario=guest');
 async function aligned(label){
  await p.waitForFunction(()=>window.__backdrop&&!__map._animatingZoom&&__backdrop.getMaplibreMap().isStyleLoaded());
  await p.waitForTimeout(350);
  await p.waitForFunction(()=>{const gl=__backdrop.getMaplibreMap(),r=gl.getCanvas().getBoundingClientRect(),b=document.querySelector('.spot-map').getBoundingClientRect();return [[38.2,128.6],[36.5,128],[34.6,127.5],[33.38,126.53]].every(([lat,lng])=>{const a=__map.latLngToContainerPoint([lat,lng]),c=gl.project([lng,lat]);return Math.hypot(b.left+a.x-r.left-c.x*r.width/gl.transform.width,b.top+a.y-r.top-c.y*r.height/gl.transform.height)<2;});},null,{timeout:5000}).catch(()=>{});
  const positions=await p.evaluate(()=>{
   const gl=__backdrop.getMaplibreMap(),canvas=gl.getCanvas(),rect=canvas.getBoundingClientRect(),panel=document.querySelector('.spot-map').getBoundingClientRect();
   return [[38.2,128.6],[36.5,128],[34.6,127.5],[33.38,126.53]].map(([lat,lng])=>{
    const leaf=__map.latLngToContainerPoint([lat,lng]),vector=gl.project([lng,lat]);
    return {lat,lng,leaf:[panel.left+leaf.x,panel.top+leaf.y],vector:[rect.left+vector.x*rect.width/gl.transform.width,rect.top+vector.y*rect.height/gl.transform.height],canvas:[rect.width,rect.height],panel:[panel.width,panel.height],leafSize:[__map.getSize().x,__map.getSize().y],container:[gl.getContainer().clientWidth,gl.getContainer().clientHeight],size:[gl.transform.width,gl.transform.height],leafZoom:__map.getZoom(),vectorZoom:gl.getZoom()};
   });
  });
  assert.ok(positions.every(p=>Math.hypot(p.leaf[0]-p.vector[0],p.leaf[1]-p.vector[1])<2),label+' '+JSON.stringify(positions));
 }
 await aligned('browse');await p.locator('[data-spot-mode="plan"]').click();await aligned('editor');
 for(const [width,height]of [[390,664],[430,932],[844,390],[390,844],[1440,900],[390,844]]){
  await p.setViewportSize({width,height});await aligned(width+'x'+height);
 }
 await p.reload();await p.waitForSelector('.route-planner');await aligned('restored editor');
 await p.evaluate(()=>scrollTo(0,500));await aligned('scrolled sticky map');
 await capture(p,'mobile-map-aligned');assert.deepEqual(errors,[]);await p.close();
});
