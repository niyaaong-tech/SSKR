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
async function settle(p){await p.waitForFunction(()=>!document.querySelector('.rp-operation')?.textContent.includes('연결 중'));}
async function capture(p,name){if(!process.env.SSKR_QA_OUTPUT)return;fs.mkdirSync(process.env.SSKR_QA_OUTPUT,{recursive:true});await p.locator('.spot-planning-area').screenshot({path:path.join(process.env.SSKR_QA_OUTPUT,name+'.png')});}

async function start(p,id='songjeong'){if(await p.locator('#rp-start').isVisible())await p.locator('#rp-start').selectOption(id);else{await p.locator(`[data-place-id="${id}"] .rp-place-view`).click();await p.locator('.leaflet-tooltip .spot-route-add:visible').last().click();}await p.waitForSelector('.rp-next .rp-place-view');await settle(p);}
async function addFirstRecommendation(p){await p.locator('.rp-next .rp-place-view').first().click();await p.locator('.leaflet-tooltip .spot-route-add:visible').last().click();await settle(p);}
async function save(p,title){await p.locator('[data-rp-action="save"]').click();if(title)await p.locator('#rp-title').fill(title);await p.locator('[data-save-confirm]').click();}
async function savedTab(p){await p.locator('[data-rp-action="tab"][data-tab="saved"]:visible').first().click();}

test('route labels, side selection and floating map actions form one flow',async()=>{
 const p=await page();await open(p);assert.equal(await p.locator('#rp-tab-places').isDisabled(),true);assert.equal(await p.locator('#rp-tab-saved').isDisabled(),true);
 assert.equal(await p.locator('.rp-place-add,[data-rp-action="replace"]').count(),0);
 assert.equal(await p.locator('[data-rp-action="autofill"]').isDisabled(),true);
 const first=await p.locator('.rp-place-results .rp-place').first().getAttribute('data-place-id');
 const startName=await p.evaluate(id=>SSKR_SPOT_CATALOG.find(x=>x.id===id).name,first);
 assert.equal(await p.locator(`.rp-place[data-place-id="${first}"] .rp-place-view strong`).textContent(),startName.replace(/\s*·\s*/g,' '));
 assert.doesNotMatch(await p.locator(`.rp-place[data-place-id="${first}"] .rp-place-view small`).textContent(),/·/);
 await p.locator(`.rp-place[data-place-id="${first}"] .rp-place-view`).click();
 await p.waitForFunction(id=>{const x=SSKR_SPOT_CATALOG.find(p=>p.id===id);return __map.distance(__map.getCenter(),[x.lat,x.lng])<20000;},first);
 assert.equal(await p.locator('.rp-place-detail [data-rp-action="add"]').count(),0);
 assert.match(await p.locator('.leaflet-tooltip .spot-route-add:visible').last().textContent(),/출발지 설정/);
 await p.locator('.leaflet-tooltip .spot-route-add:visible').last().click();await settle(p);
 assert.equal((await draft(p)).startId,first);assert.equal(await p.locator('#rp-tab-places').isDisabled(),false);
 assert.equal(await p.locator('[data-rp-action="autofill"]').isEnabled(),true);
 assert.doesNotMatch(await p.locator('#rp-start option:checked').textContent(),/ · /);
 const next=await p.locator('.rp-next .rp-place').first().getAttribute('data-place-id');
 await p.locator('.rp-next .rp-place-view').first().click();await p.waitForFunction(id=>{const x=SSKR_SPOT_CATALOG.find(p=>p.id===id);return __map.distance(__map.getCenter(),[x.lat,x.lng])<20000;},next);
 assert.equal(await p.locator('.rp-next .rp-place-add,.rp-place-detail [data-rp-action="add"]').count(),0);
 assert.match(await p.locator('.leaflet-tooltip .spot-route-add:visible').last().textContent(),/경유지 추가/);
 await p.locator('.leaflet-tooltip .spot-route-add:visible').last().click();await settle(p);
 assert.deepEqual((await draft(p)).stopIds,[next]);assert.equal(await p.locator('[data-rp-action="replace"]').count(),0);
 await p.locator(`[data-waypoint="${next}"] .rp-point-main`).click();assert.equal(await p.locator('[data-rp-action="remove"]').count(),1);
 assert.deepEqual(p.errors,[]);await p.close();
});

test('mobile floating action remains inside the visible map above its panel',async()=>{
 const p=await page(390,844);await open(p);await p.locator('.rp-place-results .rp-place-view').first().click();
 const action=p.locator('.leaflet-tooltip .spot-route-add:visible').last();await action.waitFor();
 const box=await action.boundingBox(),map=await p.locator('.spot-map-host').boundingBox(),head=await p.locator('.spot-list-head').boundingBox();assert.ok(box.y>=head.y+head.height+8&&box.y+box.height<=map.y+map.height);
 await action.click();await settle(p);assert.equal((await draft(p)).startId!==null,true);
 await p.locator('.rp-next .rp-place-view').first().click();const stop=p.locator('.leaflet-tooltip .spot-route-add:visible').last();await stop.waitFor();const nextBox=await stop.boundingBox();assert.ok(nextBox.y>=head.y+head.height+8&&nextBox.y+nextBox.height<=map.y+map.height);
 await stop.click();await settle(p);assert.equal((await draft(p)).stopIds.length,1);
 await p.locator('#rp-tab-route').click();const row=p.locator('.rp-waypoint.is-active'),rowBox=await row.boundingBox(),controls=await row.locator('.rp-row-actions').boundingBox();assert.ok(controls.x>=rowBox.x&&controls.x+controls.width<=rowBox.x+rowBox.width&&controls.y>=rowBox.y&&controls.y+controls.height<=rowBox.y+rowBox.height);await row.scrollIntoViewIfNeeded();await capture(p,'mobile-selected-row');
 assert.deepEqual(p.errors,[]);await p.close();
});

test('desktop separates route, map and discovery; candidates never change the insertion anchor',async()=>{
 const p=await page();await open(p);assert.equal(await p.locator('[data-kind="spot"]').isDisabled(),true);await start(p);
 const rect=await p.locator('.rp-route-pane,.spot-map-host,.rp-discovery-pane').evaluateAll(es=>es.map(e=>({class:e.className,x:e.getBoundingClientRect().x,width:e.getBoundingClientRect().width})));
 const left=rect.find(r=>r.class.includes('rp-route-pane')),map=rect.find(r=>r.class.includes('spot-map-host')),right=rect.find(r=>r.class.includes('rp-discovery-pane'));
 assert.equal(left.width,260);assert.equal(right.width,300);assert.ok(left.x+260<=map.x&&map.x+map.width<=right.x);
 await p.waitForFunction(()=>document.querySelectorAll('.leaflet-tooltip .spot-photo-card').length===1);await p.locator('.leaflet-tooltip .spot-photo-card').click();assert.equal(await p.locator('.rp-place-detail').count(),1);await p.locator('[data-rp-action="back-detail"]').click();
 const candidate=await p.locator('.rp-next .rp-place').first().getAttribute('data-place-id');await p.locator('.rp-next .rp-place-view').first().click();
 assert.equal(await p.locator('.rp-place-detail').count(),1);assert.equal(await p.evaluate(()=>JSON.parse(sessionStorage.getItem('sskr.route-editor')).anchorId),'songjeong');assert.equal((await draft(p)).stopIds.length,0);
 await p.locator('[data-rp-action="back-detail"]').click();assert.match(await p.locator('.rp-anchor').textContent(),/송정/);await addFirstRecommendation(p);await settle(p);assert.equal((await draft(p)).stopIds[0],candidate);assert.equal(await p.locator('.rp-place-detail').count(),0);
 await addFirstRecommendation(p);await p.locator('[data-waypoint="songjeong"] .rp-point-main').click();await addFirstRecommendation(p);await settle(p);assert.equal((await draft(p)).stopIds[1],candidate);
 assert.deepEqual(p.errors,[]);await capture(p,'workspace-desktop');await p.close();
});

test('preview summary belongs to proposed route; guest name and route survive login and reload',async()=>{
 const p=await page();await open(p);await start(p);await p.locator('[data-rp-action="autofill"]').click();await p.waitForSelector('.rp-preview');assert.equal(await p.locator('.rp-preview li').count(),10);assert.match(await p.locator('.rp-summary').textContent(),/미리보기.*경유 10곳/);assert.equal(await p.locator('[data-rp-action="save"]').isVisible(),false);assert.equal((await draft(p)).stopIds.length,0);
 await p.locator('[data-rp-action="cancel-preview"]').click();assert.match(await p.locator('.rp-summary').textContent(),/경유 0곳/);
 await p.locator('[data-rp-action="autofill"]').click();await p.locator('[data-rp-action="apply-preview"]').click();await settle(p);const planned=await draft(p);assert.equal(planned.stopIds.length,10);
 await save(p,'나의 첫 횡단');await p.locator('.rp-dialog [data-close]').click();assert.deepEqual((await draft(p)).stopIds,planned.stopIds);assert.equal((await draft(p)).title,'나의 첫 횡단');
 await save(p);await p.locator('.rp-dialog [data-provider="google"]').click();await p.waitForFunction(()=>JSON.parse(sessionStorage.getItem('sskr.route-editor')).plan.id);
 const account=await p.evaluate(()=>SSKR_PARTICIPATE_API.context());assert.equal(account.account.linked,true);assert.equal(account.participation,null);
 await p.reload();await p.waitForSelector('.route-planner:not([hidden])');await settle(p);assert.deepEqual((await draft(p)).stopIds,planned.stopIds);assert.equal((await draft(p)).title,'나의 첫 횡단');await savedTab(p);assert.equal(await p.locator('.rp-saved').count(),1);assert.deepEqual(p.errors,[]);await p.close();
});

test('selected row edits support move, undo, remove and draft saving',async()=>{
 const p=await page();await open(p,'logged-in-no-application');await savedTab(p);await p.locator('[data-rp-action="route-tab"]').click();assert.equal(await p.locator('#rp-tab-search').getAttribute('aria-selected'),'true');await start(p);await addFirstRecommendation(p);await addFirstRecommendation(p);const two=(await draft(p)).stopIds;
 await p.locator(`[data-waypoint="${two[1]}"]`).dragTo(p.locator(`[data-waypoint="${two[0]}"]`));await settle(p);assert.deepEqual((await draft(p)).stopIds,[two[1],two[0]]);await p.locator('[data-rp-action="undo"]').click();await settle(p);
 assert.equal(await p.locator('.rp-row-actions').count(),1);await p.locator(`[data-rp-action="up"][data-id="${two[1]}"]`).click();await settle(p);assert.deepEqual((await draft(p)).stopIds,[two[1],two[0]]);await p.locator('[data-rp-action="undo"]').click();await settle(p);assert.deepEqual((await draft(p)).stopIds,two);
 await p.locator(`[data-waypoint="${two[0]}"] .rp-point-main`).click();assert.equal(await p.locator('[data-rp-action="replace"]').count(),0);await p.locator('[data-rp-action="remove"]').click();await settle(p);assert.equal((await draft(p)).stopIds.length,1);
 await save(p,'초안');await savedTab(p);assert.match(await p.locator('.rp-saved').textContent(),/초안/);await p.locator('[data-rp-action="duplicate"]').click();assert.equal((await draft(p)).id,null);assert.deepEqual(p.errors,[]);await p.close();
});

test('responsive workspace exposes first recommendation and supports sheet gestures without page overflow',async()=>{
 for(const width of [360,390,430,768,1280,1440,1920]){const p=await page(width,844);await open(p);await start(p);await p.locator('[data-scroll="places"]').evaluate(e=>e.scrollTop=0);
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 const button=await p.locator('.rp-next .rp-place-view').first().boundingBox(),pane=await p.locator('.rp-discovery-pane').boundingBox();assert.ok(button.height>=44);assert.ok(button.y>=pane.y&&button.y+button.height<=pane.y+pane.height,'first recommendation must fit');
 const wide=await p.locator('.spot-planning-area').evaluate(el=>el.classList.contains('is-wide'));if(!wide){const grip=await p.locator('.rp-sheet-toggle').boundingBox();await p.mouse.move(grip.x+grip.width/2,grip.y+10);await p.mouse.down();await p.mouse.move(grip.x+grip.width/2,grip.y-100,{steps:5});await p.mouse.up();assert.equal(await p.locator('.route-planner').getAttribute('data-sheet'),'full');await p.locator('[data-rp-action="sheet"]').last().click();assert.equal(await p.locator('.route-planner').getAttribute('data-sheet'),'summary');await p.locator('.rp-sheet-toggle').click();assert.equal(await p.locator('.route-planner').getAttribute('data-sheet'),'half');
 await p.locator('.rp-next .rp-place-view').first().click();assert.equal(await p.locator('.rp-place-detail').count(),1);await p.locator('[data-rp-action="back-detail"]').click();assert.equal(await p.locator('[data-scroll="places"]').evaluate(e=>e.scrollTop),0);
 await p.locator('#rp-tab-search').focus();await p.keyboard.press('ArrowRight');assert.equal(await p.locator('.rp-route-pane').isVisible(),true);await p.locator('#rp-tab-search').click();
 await p.locator('.rp-filters summary').click();await p.locator('.spot-search input').fill('김해');await p.waitForTimeout(250);assert.ok(await p.locator('.rp-place-results .rp-place').count()>0);await p.locator('.spot-search input').fill('');await p.waitForTimeout(250);await p.locator('.rp-filters summary').click();
 await capture(p,'workspace-portrait-'+width);await p.setViewportSize({width:844,height:width});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 }assert.deepEqual(p.errors,[]);await capture(p,'workspace-'+width);await p.close();}
});

test('real roads connect ten stops, and provider failures preserve editing',async()=>{
 const p=await page();await p.unroute('**/web/app/route-provider.js*');await open(p);await start(p);await p.locator('[data-rp-action="autofill"]').click();await p.locator('[data-rp-action="apply-preview"]').click();await settle(p);assert.equal((await draft(p)).stopIds.length,10);assert.equal(await p.locator('[data-rp-action="retry-route"]').count(),0);
 await p.waitForFunction(()=>{let count=0;__map.eachLayer(l=>{if(l instanceof L.Polyline&&!(l instanceof L.Polygon)&&l.getLatLngs().length>10)count++;});return count>=11;});assert.deepEqual(p.errors,[]);await p.close();
 const failed=await page();await failed.addInitScript(()=>window.__providerFailure=true);await open(failed);await failed.waitForSelector('[data-rp-action="retry-provider"]');await failed.locator('#rp-start').selectOption('songjeong');assert.equal((await draft(failed)).startId,'songjeong');await failed.evaluate(()=>window.__providerFailure=false);await failed.locator('[data-rp-action="retry-provider"]').click();await failed.waitForSelector('.rp-next .rp-place-view');await failed.locator('[data-spot-mode="browse"]').click();assert.equal(await failed.locator('.spot-detail').isVisible(),true);assert.equal(await failed.locator('.spot-toolbar').isVisible(),true);assert.deepEqual(failed.errors,[]);await failed.close();
});
test('a late road response does not move the map after returning to browsing',async()=>{
 const p=await page();await p.goto(base+'/app/spots?scenario=guest');await p.waitForSelector('[data-spot-mode="plan"]');await p.waitForFunction(()=>window.__map);
 await p.evaluate(()=>{const create=SSKR_ROUTE_PROVIDER.create;SSKR_ROUTE_PROVIDER.create=()=>{const provider=create(),route=provider.route.bind(provider);provider.route=async(...args)=>{await new Promise(resolve=>window.__releaseRoad=resolve);const result=await route(...args);window.__roadDone=true;return result;};return provider;};});
 // The planner has already mounted, so remount it through the existing app navigation.
 await p.locator('a[data-app-link][href="/app/memorials"]').first().click();await p.locator('a[data-app-link][href="/app/spots"]').first().click();
 await p.locator('[data-spot-mode="plan"]').click();await p.locator('#rp-start').selectOption({index:1});await p.waitForFunction(()=>window.__releaseRoad);
 await p.locator('[data-spot-mode="browse"]').click();await p.evaluate(()=>__map.setView([35.4,128.4],10,{animate:false}));
 const before=await p.evaluate(()=>({center:__map.getCenter(),zoom:__map.getZoom()}));
 await p.evaluate(()=>__releaseRoad());await p.waitForFunction(()=>window.__roadDone);
 assert.deepEqual(await p.evaluate(()=>({center:__map.getCenter(),zoom:__map.getZoom()})),before);
 assert.equal(await p.locator('.spot-list').isVisible(),true);assert.equal(await p.locator('.spot-toolbar').isVisible(),true);assert.deepEqual(p.errors,[]);await p.close();
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
