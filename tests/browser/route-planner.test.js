const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const net=require('node:net'),path=require('node:path'),fs=require('node:fs');
const {chromium}=require('playwright');
let server,browser,base;
// Browser-flow fixture only: production road validity is tested against generated route data.
const providerFixture=`window.SSKR_ROUTE_PROVIDER={create(){return {version:'browser-fixture',async ready(){if(window.__providerFailure)throw new Error('도로 데이터를 불러오지 못했습니다.');},summary(a,b){const p=SSKR_SPOT_CATALOG.find(p=>p.id===a),q=SSKR_SPOT_CATALOG.find(p=>p.id===b);if(!p||!q)return null;const distanceMeters=Math.hypot((p.lat-q.lat)*111000,(p.lng-q.lng)*90000)*1.2;return {distanceMeters,durationSeconds:distanceMeters/12};},async route(ids,{signal}={}){await new Promise(r=>setTimeout(r,50));if(signal?.aborted)throw new DOMException('Aborted','AbortError');const legs=ids.slice(1).map((id,i)=>{const p=SSKR_SPOT_CATALOG.find(p=>p.id===ids[i]),q=SSKR_SPOT_CATALOG.find(p=>p.id===id);return {fromId:p.id,toId:q.id,coordinates:[[p.lat,p.lng],[q.lat,q.lng]],...this.summary(p.id,q.id),status:'ok'};});return {legs,distanceMeters:legs.reduce((s,l)=>s+l.distanceMeters,0),durationSeconds:legs.reduce((s,l)=>s+l.durationSeconds,0),valid:true,version:this.version};}};}};`;
before(async()=>{
 const port=await new Promise(resolve=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const port=s.address().port;s.close(()=>resolve(port));});});base='http://127.0.0.1:'+port;
 server=spawn(process.execPath,['server/dev-server.js'],{cwd:path.resolve(__dirname,'../..'),env:{...process.env,SSKR_DEV_PORT:String(port)},stdio:['ignore','pipe','pipe'],windowsHide:true});
 await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Dev server did not start')),10000);server.stdout.on('data',b=>{if(b.toString().includes('SSKR dev server')){clearTimeout(timer);resolve();}});server.once('error',reject);});
 browser=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL||(process.platform==='win32'?'msedge':undefined)});
});
after(async()=>{await browser?.close();server?.kill();});
async function page(width=1440,height=1000){const p=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});p.errors=[];p.on('pageerror',error=>p.errors.push(error.message));
 await p.route('**/web/app/route-provider.js*',route=>route.fulfill({status:200,contentType:'application/javascript',body:providerFixture}));
 await p.route('**/web/shared/map/map.js*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('layer=root.L.layerGroup().addTo(map);','window.__map=map;layer=root.L.layerGroup().addTo(map);')});});
 return p;
}
async function open(p,scenario='guest'){await p.goto(base+'/app/spots?scenario='+scenario);await p.waitForSelector('[data-spot-mode="plan"]');try{await p.waitForFunction(()=>window.__map,null,{timeout:5000});}catch(error){throw Error(`Map did not initialize: ${JSON.stringify({errors:p.errors,mapStatus:await p.locator('.spot-map-status').textContent(),leaflet:await p.evaluate(()=>Boolean(window.L)),mapApi:await p.evaluate(()=>Boolean(window.SSKR_MAP))})}`,{cause:error});}await p.locator('[data-spot-mode="plan"]').click();await p.waitForSelector('.route-planner:not([hidden])');}
const draft=p=>p.evaluate(()=>JSON.parse(sessionStorage.getItem('sskr.route-editor')).plan);
async function settle(p){await p.waitForFunction(()=>!document.querySelector('.rp-operation')?.textContent.includes('연결하고'));}
async function capture(p,name){if(!process.env.SSKR_QA_OUTPUT)return;fs.mkdirSync(process.env.SSKR_QA_OUTPUT,{recursive:true});await p.locator('.spot-planning-area').screenshot({path:path.join(process.env.SSKR_QA_OUTPUT,name+'.png')});}
test('route creation starts with origins only, then shows nearby stops',async()=>{
 const p=await page();await open(p);
 assert.equal(await p.locator('[data-kind="start"]').getAttribute('aria-pressed'),'true');
 assert.equal(await p.locator('[data-kind="spot"]').isDisabled(),true);
 assert.equal(await p.locator('.rp-place-add').count(),0);
 await p.locator('#rp-tab-places').click();
 assert.equal(await p.locator('.rp-place-results .rp-place-add').count(),10);
 assert.equal(await p.locator('.rp-place-results .rp-place-add').first().textContent(),'출발지 선택');
 await p.locator('#rp-tab-route').click();await p.locator('#rp-start').selectOption('songjeong');
 await p.waitForSelector('.rp-next .rp-place-add');
 assert.equal(await p.locator('[data-kind="spot"]').getAttribute('aria-pressed'),'true');
 assert.equal(await p.locator('[data-kind="start"]').isDisabled(),true);
 await p.locator('#rp-tab-places').click();
 assert.match(await p.locator('.rp-section-title').last().textContent(),/출발지에서 가까운 스팟/);
 const ids=await p.locator('.rp-place-results .rp-place').evaluateAll(nodes=>nodes.slice(0,5).map(node=>node.dataset.placeId));
 const distances=await p.evaluate(ids=>ids.map(id=>{const a=SSKR_SPOT_CATALOG.find(p=>p.id==='songjeong'),b=SSKR_SPOT_CATALOG.find(p=>p.id===id);return Math.hypot((a.lat-b.lat)*111000,(a.lng-b.lng)*90000);}),ids);
 assert.deepEqual(distances,[...distances].sort((a,b)=>a-b));assert.deepEqual(p.errors,[]);await p.close();
});
test('selected route and next candidates occupy separate columns; map card opens the selected place',async()=>{
 const p=await page();await open(p);await p.locator('#rp-start').selectOption('songjeong');
 await p.waitForSelector('.rp-next .rp-place');
 const columns=await p.locator('.rp-route-grid').evaluate(el=>{const left=el.querySelector('.rp-route-selected').getBoundingClientRect(),right=el.querySelector('.rp-next').getBoundingClientRect();return {left:left.x,right:right.x};});
 assert.ok(columns.right>columns.left);
 await capture(p,'planner-recommendations');
 assert.match(await p.locator('.rp-next .rp-section-title').textContent(),/송정해수욕장|송정/);
 assert.equal(await p.locator('.sskr-map.is-route-editing .spot-list .spot-mini-card').count(),1);
 await p.locator('.sskr-map.is-route-editing .spot-list .spot-mini-select').click();
 assert.equal(await p.locator('.rp-dialog[open]').count(),1);
 assert.match(await p.locator('.rp-dialog-head').textContent(),/송정/);
 await p.locator('.rp-dialog [data-close]').click();
 await p.locator('.rp-next .rp-place-add').first().click();await settle(p);
 const current=(await draft(p)).stopIds.at(-1);
 const currentName=await p.evaluate(id=>SSKR_SPOT_CATALOG.find(place=>place.id===id).name,current);
 assert.ok((await p.locator('.rp-next .rp-section-title').textContent()).includes(currentName));
 await p.locator('.rp-next .rp-place-add').first().click();await settle(p);
 await p.locator('[data-waypoint="songjeong"] .rp-point-main').click();
 assert.match(await p.locator('.rp-next .rp-section-title').textContent(),/송정/);
 assert.equal(await p.locator('.sskr-map.is-route-editing .spot-list .spot-mini-card').count(),1);
 assert.deepEqual(p.errors,[]);await p.close();
});
test('guest plans, signs in without applying, saves and restores the route and map',async()=>{
 const p=await page();await open(p);assert.equal(await p.locator('.sskr-map.is-route-editing .spot-list').isVisible(),false);
 await p.locator('#rp-start').selectOption({index:1});await p.waitForSelector('[data-rp-action="autofill"]:enabled');await p.locator('[data-rp-action="autofill"]').click();await p.waitForSelector('.rp-preview');assert.equal(await p.locator('.rp-preview li').count(),10);
 const empty=await draft(p);assert.equal(empty.stopIds.length,0);await p.locator('[data-rp-action="apply-preview"]').click();await settle(p);const planned=await draft(p);assert.equal(planned.stopIds.length,10);
 await p.evaluate(()=>__map.setView([36.4,128],10,{animate:false}));const viewport=await p.evaluate(()=>({center:__map.getCenter(),zoom:__map.getZoom()}));await p.locator('#rp-title').fill('나의 첫 횡단');await p.locator('[data-rp-action="save"]').click();await p.waitForSelector('.rp-dialog[open]');await p.locator('.rp-dialog [data-provider="google"]').click();await p.waitForSelector('.rp-dialog',{state:'detached'});
 await p.waitForFunction(()=>JSON.parse(sessionStorage.getItem('sskr.route-editor')).plan.id);const saved=await draft(p);assert.ok(saved.id);assert.equal(saved.title,'나의 첫 횡단');assert.deepEqual(saved.stopIds,planned.stopIds);assert.deepEqual(await p.evaluate(()=>({center:__map.getCenter(),zoom:__map.getZoom()})),viewport);
 const context=await p.evaluate(()=>SSKR_PARTICIPATE_API.context());assert.equal(context.account.linked,true);assert.equal(context.participation,null);assert.equal(context.application,null);
 await p.reload();await p.waitForSelector('.route-planner:not([hidden])');await settle(p);assert.deepEqual((await draft(p)).stopIds,planned.stopIds);assert.equal(await p.locator('#rp-title').inputValue(),'나의 첫 횡단');await p.locator('#rp-tab-saved').click();assert.equal(await p.locator('.rp-saved').count(),1);await capture(p,'planner-desktop');assert.deepEqual(p.errors,[]);await p.close();
});
test('manual additions, replacement, order, undo and draft save retain precise state',async()=>{
 const p=await page();await open(p,'logged-in-no-application');await p.locator('#rp-start').selectOption({index:1});await p.waitForSelector('.rp-next .rp-place-add');await p.locator('.rp-next .rp-place-add').first().click();await settle(p);const first=(await draft(p)).stopIds[0];await p.locator('.rp-next .rp-place-add').first().click();await settle(p);const two=(await draft(p)).stopIds;
 await p.locator(`[data-rp-action="up"][data-id="${two[1]}"]`).click();await settle(p);assert.deepEqual((await draft(p)).stopIds,[two[1],first]);await p.locator('[data-rp-action="undo"]').click();await settle(p);assert.deepEqual((await draft(p)).stopIds,two);
 await p.locator(`[data-rp-action="replace"][data-id="${first}"]`).click();await p.locator('.rp-place-results .rp-place-add:enabled').first().click();await settle(p);const replaced=(await draft(p)).stopIds;assert.equal(replaced.length,2);assert.notEqual(replaced[0],first);assert.equal(replaced[1],two[1]);
 await p.locator(`[data-rp-action="remove"][data-id="${replaced[0]}"]`).click();await settle(p);assert.equal((await draft(p)).stopIds.length,1);await p.locator('[data-rp-action="save"]').click();await p.waitForFunction(()=>JSON.parse(sessionStorage.getItem('sskr.route-editor')).plan.id);await p.locator('#rp-tab-saved').click();assert.match(await p.locator('.rp-saved').textContent(),/초안/);await p.locator('[data-rp-action="duplicate"]').click();assert.equal((await draft(p)).id,null);assert.equal((await draft(p)).stopIds.length,1);await p.locator('[data-rp-action="save"]').click();await p.locator('#rp-tab-saved').click();assert.equal(await p.locator('.rp-saved').count(),2);await p.locator('[data-rp-action="delete"]').first().click();await p.locator('[data-confirm]').click();assert.equal(await p.locator('.rp-saved').count(),1);assert.deepEqual(p.errors,[]);await p.close();
});
test('mobile panels stay below the map with usable summary, half and full views',async()=>{
 for(const width of [360,390,430]){const p=await page(width,844);await open(p);await p.locator('#rp-start').selectOption({index:1});await settle(p);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);const map=await p.locator('.spot-map-host').boundingBox(),panel=await p.locator('.route-planner').boundingBox();assert.ok(panel.y>=map.y+map.height-1);assert.ok(map.height>=280);
 assert.ok(await p.locator('#rp-start').evaluate(el=>parseFloat(getComputedStyle(el).fontSize)>=16));assert.ok(await p.locator('#rp-title').evaluate(el=>parseFloat(getComputedStyle(el).fontSize)>=16));
 await p.locator('[data-size="summary"]').click();assert.equal(await p.locator('.rp-scroll').isVisible(),false);await p.locator('[data-size="half"]').click();assert.equal(await p.locator('.rp-scroll').isVisible(),true);const half=await p.locator('.route-planner').boundingBox();await p.locator('[data-size="full"]').click();const full=await p.locator('.route-planner').boundingBox();assert.ok(full.height>half.height);await capture(p,'planner-mobile-'+width);assert.deepEqual(p.errors,[]);await p.close();}
});
test('provider failure allows manual draft editing and retry; browsing resumes normally',async()=>{
 const p=await page();await p.addInitScript(()=>window.__providerFailure=true);await open(p);await p.waitForSelector('[data-rp-action="retry-provider"]');await p.locator('#rp-start').selectOption({index:1});assert.ok((await draft(p)).startId);assert.equal(await p.locator('[data-rp-action="autofill"]').isDisabled(),true);
 await p.evaluate(()=>window.__providerFailure=false);await p.locator('[data-rp-action="retry-provider"]').click();await p.waitForSelector('[data-rp-action="autofill"]:enabled');await p.locator('[data-spot-mode="browse"]').click();assert.equal(await p.locator('.route-planner').isVisible(),false);assert.equal(await p.locator('.spot-detail').isVisible(),true);assert.equal(await p.locator('.spot-list').isVisible(),true);assert.deepEqual(p.errors,[]);await p.close();
});

test('a late road response does not move the map after returning to browsing',async()=>{
 const p=await page();await p.goto(base+'/app/spots?scenario=guest');await p.waitForSelector('[data-spot-mode="plan"]');await p.waitForFunction(()=>window.__map);
 await p.evaluate(()=>{const create=SSKR_ROUTE_PROVIDER.create;SSKR_ROUTE_PROVIDER.create=()=>{const provider=create(),route=provider.route.bind(provider);provider.route=async(...args)=>{await new Promise(resolve=>window.__releaseRoad=resolve);return route(...args);};return provider;};});
 // The planner has already mounted, so remount it through the existing app navigation.
 await p.locator('a[data-app-link][href="/app/memorials"]').first().click();await p.locator('a[data-app-link][href="/app/spots"]').first().click();
 await p.locator('[data-spot-mode="plan"]').click();await p.locator('#rp-start').selectOption({index:1});await p.waitForFunction(()=>window.__releaseRoad);
 await p.locator('[data-spot-mode="browse"]').click();await p.evaluate(()=>__map.setView([35.4,128.4],10,{animate:false}));
 const before=await p.evaluate(()=>({center:__map.getCenter(),zoom:__map.getZoom()}));
 await p.evaluate(()=>__releaseRoad());await p.waitForFunction(()=>!document.querySelector('.rp-operation').textContent.includes('연결하고'));
 assert.deepEqual(await p.evaluate(()=>({center:__map.getCenter(),zoom:__map.getZoom()})),before);
 assert.equal(await p.locator('.spot-list').isVisible(),true);assert.deepEqual(p.errors,[]);await p.close();
});

test('network failures use a readable message and preserve manual editing',async()=>{
 const p=await page();await p.unroute('**/web/app/route-provider.js*');
 await p.route('**/web/shared/routes/manifest.json',route=>route.abort('failed'));
 await open(p);await p.waitForSelector('[data-rp-action="retry-provider"]');
 assert.match(await p.locator('.rp-operation').textContent(),/연결 상태를 확인/);
 assert.doesNotMatch(await p.locator('.rp-operation').textContent(),/Failed to fetch|TypeError/);
 await p.locator('#rp-start').selectOption('songjeong');assert.equal((await draft(p)).startId,'songjeong');
 assert.deepEqual(p.errors,[]);await p.close();
});

test('real road data connects a Busan start through ten stops on desktop and mobile',async()=>{
 for(const width of [1440,390]){
  const p=await page(width,900);await p.unroute('**/web/app/route-provider.js*');await open(p);
  await p.locator('#rp-start').selectOption('songjeong');await p.waitForSelector('[data-rp-action="autofill"]:enabled');
  await p.locator('[data-rp-action="autofill"]').click();await p.waitForSelector('.rp-preview');
  assert.equal(await p.locator('.rp-preview li').count(),10);await p.locator('[data-rp-action="apply-preview"]').click();
  await settle(p);assert.equal(await p.locator('[data-rp-action="retry-route"]').count(),0);
  await p.locator('[data-rp-action="fit"]').click();
  await p.waitForFunction(()=>{let count=0;__map.eachLayer(l=>{if(l instanceof L.Polyline&&!(l instanceof L.Polygon)&&l.getLatLngs().length>10)count++;});return count>=11;});
  const startVisible=await p.evaluate(()=>{const start=SSKR_SPOT_CATALOG.find(p=>p.id==='songjeong');return __map.getBounds().contains([start.lat,start.lng]);});
  assert.equal(startVisible,true);assert.equal(await p.locator('.rp-summary .is-complete').count(),1);
  const pane=await p.locator('.leaflet-sskr-routes-pane').evaluate(el=>({z:Number(getComputedStyle(el).zIndex),land:Number(getComputedStyle(el.parentElement.querySelector('.leaflet-sskr-land-pane')).zIndex),svg:el.querySelector('svg').getBoundingClientRect().width,map:el.closest('.spot-map').clientWidth}));
  assert.ok(pane.z>pane.land);assert.ok(pane.svg>=pane.map,'Route SVG must not inherit a 20px icon size');
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await capture(p,'planner-real-'+width);assert.deepEqual(p.errors,[]);await p.close();
 }
});
