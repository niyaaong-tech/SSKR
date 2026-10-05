const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const net=require('node:net'),path=require('node:path'),fs=require('node:fs');
const {chromium}=require('playwright');
const fixture=require('../../data/fixtures/memorial-event.json');
let server,browser,base;
before(async()=>{
 const port=await new Promise(resolve=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const port=s.address().port;s.close(()=>resolve(port));});});
 base='http://127.0.0.1:'+port;
 server=spawn(process.execPath,['server/dev-server.js'],{cwd:path.resolve(__dirname,'../..'),env:{...process.env,SSKR_DEV_PORT:String(port)},stdio:['ignore','pipe','pipe'],windowsHide:true});
 await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Dev server did not start')),10000);server.stdout.on('data',b=>{if(b.toString().includes('SSKR dev server')){clearTimeout(timer);resolve();}});server.once('error',reject);server.once('exit',code=>{clearTimeout(timer);reject(Error('Dev server exited '+code));});});
 browser=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL||(process.platform==='win32'?'msedge':undefined)});
});
after(async()=>{await browser?.close();server?.kill();});
const errors=[];
async function page(width=1440,height=1000){const p=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});p.on('pageerror',e=>errors.push(e.message));
 // Observe map state without adding test globals to production code.
 await p.route('**/web/shared/map/map.js*',async r=>{const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace('layer=root.L.layerGroup().addTo(map);','window.__map=map;layer=root.L.layerGroup().addTo(map);').replace('const backdrop=root.L.maplibreGL','const backdrop=window.__backdrop=root.L.maplibreGL')});});return p;
}
async function open(p,url){await p.goto(base+url);await p.waitForSelector('.spot-mini-card');await p.waitForFunction(()=>window.__backdrop?.getMaplibreMap().isStyleLoaded()&&window.__backdrop?.getMaplibreMap().areTilesLoaded(),null,{timeout:60000});assert.equal(await p.locator('.spot-map-status').textContent(),'');assert.ok(await p.evaluate(()=>__backdrop.getMaplibreMap().querySourceFeatures('openmaptiles',{sourceLayer:'sskr_land'}).length));}
const metrics=p=>p.locator('.spot-mini-select').first().evaluate(e=>{const s=getComputedStyle(e),caption=getComputedStyle(e.querySelector('strong'));return {width:s.width,height:s.height,radius:s.borderRadius,font:caption.fontSize,color:caption.color};});
async function capture(p,name){if(!process.env.SSKR_QA_OUTPUT)return;fs.mkdirSync(process.env.SSKR_QA_OUTPUT,{recursive:true});await p.locator('.spot-workspace').screenshot({path:path.join(process.env.SSKR_QA_OUTPUT,name+'.png')});}
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
 const p=await page(390,844),memorial=fixture.memorials.find(m=>m.spotCount===8);await open(p,'/app/memorials/'+memorial.id+'?scenario=guest');
 const rows=await p.locator('.spot-mini-card').evaluateAll(es=>es.map(e=>getComputedStyle(e).gridRowStart));assert.deepEqual([1,2,3].map(r=>rows.filter(x=>x===String(r)).length),[2,4,4]);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await p.locator('.spot-map').evaluate(e=>scrollTo(0,scrollY+e.getBoundingClientRect().top-82));await p.waitForTimeout(350);let box=await p.locator('.spot-map').boundingBox();await p.mouse.move(box.x+box.width/2,box.y+box.height*.3);let before=await p.evaluate(()=>({z:__map.getZoom(),y:scrollY}));await p.mouse.wheel(0,-120);await p.waitForTimeout(100);assert.ok(await p.evaluate(()=>__map.getZoom())>before.z);assert.equal(await p.evaluate(()=>scrollY),before.y);
 await p.waitForTimeout(350);const zoom=await p.evaluate(()=>__map.getZoom());await p.mouse.move(195,30);await p.mouse.wheel(0,60);await p.waitForTimeout(60);box=await p.locator('.spot-map').boundingBox();await p.mouse.move(box.x+box.width/2,box.y+box.height*.3);await p.mouse.wheel(0,60);await p.waitForTimeout(100);assert.equal(await p.evaluate(()=>__map.getZoom()),zoom);assert.ok(await p.evaluate(()=>scrollY)>before.y);
 await capture(p,'mobile');await p.close();assert.deepEqual(errors,[]);
});
test('overview zoom stops at the spot layout and panning stays within Korean territory',async()=>{
 for(const [width,height,name,floor] of [[1440,1000,'overview-desktop',7],[390,844,'overview-mobile',6.5]]){
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

test('coastal map details are preserved at high zoom',async()=>{
 const p=await page();for(const id of ['daecheon','haesindang-park','gyeongju','hupo','ganwolam','muchangpo']){await open(p,'/app/spots/'+id+'?scenario=guest');const place=require('../../web/app/spot-catalog').find(p=>p.id===id);await p.evaluate(p=>__map.setView([p.lat,p.lng],14,{animate:false}),place);await p.waitForTimeout(300);await p.waitForFunction(()=>__backdrop.getMaplibreMap().getZoom()>=13&&__backdrop.getMaplibreMap().areTilesLoaded(),null,{timeout:60000});assert.ok(await p.evaluate(p=>__map.getCenter().distanceTo([p.lat,p.lng])<100,place));const counts=await p.evaluate(()=>{const g=__backdrop.getMaplibreMap();return {water:g.querySourceFeatures('openmaptiles',{sourceLayer:'water'}).length,roads:g.querySourceFeatures('openmaptiles',{sourceLayer:'transportation'}).length};});assert.ok(counts.water>0,id+' water');assert.ok(counts.roads>0,id+' roads');if(id==='daecheon')await capture(p,'coast');}await p.close();assert.deepEqual(errors,[]);
});

test('South Korean terrain remains visible in the gap before vector tiles reach their minimum zoom',async()=>{
 const p=await page(390,844);await p.goto(base+'/app/spots?scenario=guest');await p.waitForSelector('.leaflet-sskr-base-land-pane path');
 await p.locator('[data-spot-mode="plan"]').click();
 await p.evaluate(()=>__map.setZoom(6.75,{animate:false}));await p.waitForFunction(()=>__backdrop.getMaplibreMap().isStyleLoaded()&&__backdrop.getMaplibreMap().areTilesLoaded());
 const gap=await p.evaluate(()=>{const gl=__backdrop.getMaplibreMap();return {leaflet:__map.getZoom(),vector:gl.getZoom(),minimum:gl.getStyle().sources.openmaptiles.minzoom,features:gl.querySourceFeatures('openmaptiles',{sourceLayer:'sskr_land'}).length};});
 assert.equal(gap.leaflet,6.75);assert.ok(gap.vector<gap.minimum);assert.equal(gap.features,0,'the regression must exercise terrain without vector tiles');
 for(const zoom of [6.5,6.75,7,8.25,6.75]){
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
 await p.locator('.rp-place-results .rp-place-view').first().click();await p.locator('.leaflet-tooltip .spot-route-add:visible').last().waitFor();await capture(p,'mobile-terrain-failed-tiles');
 await p.unroute('**/api/map-tile?*');await p.evaluate(()=>dispatchEvent(new Event('online')));
 await p.waitForFunction(()=>{const gl=__backdrop.getMaplibreMap();return gl.areTilesLoaded()&&gl.querySourceFeatures('openmaptiles',{sourceLayer:'sskr_land'}).length>0;},null,{timeout:60000});
 assert.equal(await p.locator('.leaflet-sskr-base-land-pane path').getAttribute('fill-opacity'),'1');assert.equal(await p.locator('.spot-map-status').textContent(),'');await capture(p,'mobile-terrain-restored');assert.deepEqual(errors,[]);await p.close();
});
