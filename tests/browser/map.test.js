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
test('spot, memorial and public explorer keep the same map style and card dimensions',async()=>{
 const p=await page(),memorial=fixture.memorials.find(m=>m.spotCount===12);let expected;
 for(const [name,url] of [['spots','/app/spots?scenario=guest'],['memorial','/app/memorials/'+memorial.id+'?scenario=guest'],['explore','/explore/']]){await open(p,url);const current=await metrics(p);if(expected)assert.deepEqual(current,expected);else expected=current;assert.equal(await p.locator('.spot-mini-card').count(),12);assert.equal(await p.evaluate(()=>__backdrop.getMaplibreMap().getStyle().name),'SSKR Korea');await capture(p,name);if(name==='memorial'){await p.locator('[data-action="next-cards"]').click();assert.equal(await p.locator('.spot-mini-card').count(),2);assert.match(await p.locator('.spot-mini-select').last().textContent(),/대천해수욕장/);}}
 await p.close();assert.deepEqual(errors,[]);
});
test('mobile cards fill bottom rows; wheel gestures retain their original owner',async()=>{
 const p=await page(390,844),memorial=fixture.memorials.find(m=>m.spotCount===8);await open(p,'/app/memorials/'+memorial.id+'?scenario=guest');
 const rows=await p.locator('.spot-mini-card').evaluateAll(es=>es.map(e=>getComputedStyle(e).gridRowStart));assert.deepEqual([1,2,3].map(r=>rows.filter(x=>x===String(r)).length),[2,4,4]);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await p.locator('.spot-map').evaluate(e=>scrollTo(0,scrollY+e.getBoundingClientRect().top-82));await p.waitForTimeout(350);let box=await p.locator('.spot-map').boundingBox();await p.mouse.move(box.x+box.width/2,box.y+box.height*.3);let before=await p.evaluate(()=>({z:__map.getZoom(),y:scrollY}));await p.mouse.wheel(0,-120);await p.waitForTimeout(100);assert.ok(await p.evaluate(()=>__map.getZoom())>before.z);assert.equal(await p.evaluate(()=>scrollY),before.y);
 await p.waitForTimeout(350);const zoom=await p.evaluate(()=>__map.getZoom());await p.mouse.move(195,30);await p.mouse.wheel(0,60);await p.waitForTimeout(60);box=await p.locator('.spot-map').boundingBox();await p.mouse.move(box.x+box.width/2,box.y+box.height*.3);await p.mouse.wheel(0,60);await p.waitForTimeout(100);assert.equal(await p.evaluate(()=>__map.getZoom()),zoom);assert.ok(await p.evaluate(()=>scrollY)>before.y);
 await capture(p,'mobile');await p.close();assert.deepEqual(errors,[]);
});
test('maximum zoom out shows both Korean landmasses and the southern islands',async()=>{
 for(const [width,height,name] of [[1440,1000,'overview-desktop'],[390,844,'overview-mobile']]){
  const p=await page(width,height);await p.goto(base+'/app/spots?scenario=guest');await p.waitForSelector('.spot-mini-card');
  await p.waitForSelector('.leaflet-sskr-land-pane path');
  await p.evaluate(()=>__map.setView([38,128.1],__map.getMinZoom(),{animate:false}));
  const shape=await p.evaluate(()=>{
   const bounds=__map.getBounds();
   const paths=[...document.querySelectorAll('.leaflet-sskr-land-pane path')];
   return {min:__map.getMinZoom(),sizes:paths.map(e=>e.getBoundingClientRect().height),islands:[[33.38,126.53],[37.5,130.88],[37.24078,131.86956]].every(p=>bounds.contains(p)),dokdo:!!document.querySelector('.sskr-land-label.is-dokdo i')};
  });
  assert.ok(shape.min<=6);assert.ok(shape.sizes.length===2&&shape.sizes.every(h=>h>80));assert.equal(shape.islands,true);assert.equal(shape.dokdo,true);
  await capture(p,name);await p.close();
 }
 assert.deepEqual(errors,[]);
});

test('coastal map details are preserved at high zoom',async()=>{
 const p=await page();for(const id of ['daecheon','daecheon-market','gyeongju','hupo','ganwolam','muchangpo']){await open(p,'/app/spots/'+id+'?scenario=guest');const place=require('../../web/app/spot-catalog').find(p=>p.id===id);await p.evaluate(p=>__map.setView([p.lat,p.lng],14,{animate:false}),place);await p.waitForTimeout(300);await p.waitForFunction(()=>__backdrop.getMaplibreMap().getZoom()>=13&&__backdrop.getMaplibreMap().areTilesLoaded(),null,{timeout:60000});assert.ok(await p.evaluate(p=>__map.getCenter().distanceTo([p.lat,p.lng])<100,place));const counts=await p.evaluate(()=>{const g=__backdrop.getMaplibreMap();return {water:g.querySourceFeatures('openmaptiles',{sourceLayer:'water'}).length,roads:g.querySourceFeatures('openmaptiles',{sourceLayer:'transportation'}).length};});assert.ok(counts.water>0,id+' water');assert.ok(counts.roads>0,id+' roads');if(id==='daecheon')await capture(p,'coast');}await p.close();assert.deepEqual(errors,[]);
});
