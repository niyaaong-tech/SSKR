const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const net=require('node:net'),path=require('node:path'),fs=require('node:fs');
const {chromium}=require('playwright');
let server,browser,base;
// Browser-flow fixture only: production road validity is tested against generated route data.
const providerFixture=`window.SSKR_ROUTE_PROVIDER={create(){return {version:'browser-fixture',async ready(){if(window.__providerFailure)throw new Error('도로 데이터를 불러오지 못했습니다.');},summary(a,b){const p=SSKR_SPOT_CATALOG.find(p=>p.id===a),q=SSKR_SPOT_CATALOG.find(p=>p.id===b);if(!p||!q)return null;const distanceMeters=Math.hypot((p.lat-q.lat)*111000,(p.lng-q.lng)*90000)*1.2;return {distanceMeters,durationSeconds:distanceMeters/12};},async route(ids,{signal}={}){await new Promise(r=>setTimeout(r,window.__roadDelay||50));if(signal?.aborted)throw new DOMException('Aborted','AbortError');if(window.__roadFailure)throw new Error('도로 정보를 불러오지 못했습니다.');const legs=ids.slice(1).map((id,i)=>{const p=SSKR_SPOT_CATALOG.find(p=>p.id===ids[i]),q=SSKR_SPOT_CATALOG.find(p=>p.id===id);return {fromId:p.id,toId:q.id,coordinates:window.__invalidCoordinates?[[999,q.lng],[q.lat,q.lng]]:[[p.lat,p.lng],[q.lat,q.lng]],...this.summary(p.id,q.id),status:'ready'};});return {legs,distanceMeters:legs.reduce((s,l)=>s+l.distanceMeters,0),durationSeconds:legs.reduce((s,l)=>s+l.durationSeconds,0),valid:!window.__invalidRoads,version:this.version};}};}};`;
before(async()=>{
 const port=await new Promise(resolve=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const port=s.address().port;s.close(()=>resolve(port));});});base='http://127.0.0.1:'+port;
 server=spawn(process.execPath,['server/dev-server.js'],{cwd:path.resolve(__dirname,'../..'),env:{...process.env,SSKR_DEV_PORT:String(port)},stdio:['ignore','pipe','pipe'],windowsHide:true});
 await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Dev server did not start')),10000);server.stdout.on('data',b=>{if(b.toString().includes('SSKR dev server')){clearTimeout(timer);resolve();}});server.once('error',reject);});
 browser=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL||(process.platform==='win32'?'msedge':undefined)});
});
after(async()=>{await browser?.close();server?.kill();});
async function page(width=1440,height=1000,input={}){const p=await browser.newPage({viewport:{width,height},reducedMotion:'reduce',...input});p.errors=[];p.on('pageerror',error=>p.errors.push(error.message));
 await p.route('**/web/app/route-provider.js*',route=>route.fulfill({status:200,contentType:'application/javascript',body:providerFixture}));
 await p.route('**/web/shared/map/map.js*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('layer=root.L.layerGroup().addTo(map);','window.__map=map;layer=root.L.layerGroup().addTo(map);')});});
 return p;
}
async function open(p,scenario='guest'){await p.goto(base+'/app/spots?scenario='+scenario);await p.waitForSelector('[data-spot-mode="plan"]');try{await p.waitForFunction(()=>window.__map,null,{timeout:5000});}catch(error){throw Error(`Map did not initialize: ${JSON.stringify({errors:p.errors,mapStatus:await p.locator('.spot-map-status').textContent(),leaflet:await p.evaluate(()=>Boolean(window.L)),mapApi:await p.evaluate(()=>Boolean(window.SSKR_MAP))})}`,{cause:error});}await p.locator('[data-spot-mode="plan"]').click();await p.waitForSelector('.route-planner:not([hidden])');}
const draft=p=>p.evaluate(()=>JSON.parse(sessionStorage.getItem('sskr.route-editor')).plan);
async function settle(p){await p.waitForFunction(()=>!document.querySelector('[data-route-generation][aria-busy=true]')&&![...document.querySelectorAll('.rp-operation')].some(e=>/연결 중|만드는 중|준비하고/.test(e.textContent)));}
async function capture(p,name){if(!process.env.SSKR_QA_OUTPUT)return;fs.mkdirSync(process.env.SSKR_QA_OUTPUT,{recursive:true});await p.locator('.spot-planning-area').screenshot({path:path.join(process.env.SSKR_QA_OUTPUT,name+'.png')});}

async function chooseStart(p,id='songjeong'){if(!await p.locator('[data-rp-action="change-start"]').isVisible())await p.locator('#rp-tab-route').click();await p.locator('[data-rp-action="change-start"]').click();await p.locator('[data-start-id="'+id+'"]').click();}
async function start(p,id='songjeong'){await chooseStart(p,id);await settle(p);if(await p.locator('#rp-tab-search').isVisible())await p.locator('#rp-tab-search').click();await p.waitForSelector('.rp-next .rp-place-view');}
async function addFirstRecommendation(p){await p.locator('.rp-next .rp-place-view').first().click();await p.locator('.leaflet-tooltip .spot-route-add:visible').last().click();await settle(p);}
async function save(p,title){if(title!=null||!(await draft(p)).title){await p.locator('#rp-route-title').fill(title||'테스트 경로');await p.locator('#rp-route-title').press('Enter');}await p.locator('[data-rp-action=save]').click();await p.waitForTimeout(100);}
async function savedTab(p){await p.locator('[data-rp-action=manage]').click();await p.waitForSelector('dialog[data-management]');}
async function tool(p,action){assert.equal(action,'optimize');await p.locator('[data-rp-action=optimize]').click();}
async function rowAction(p,id,action){const row=p.locator('[data-waypoint="'+id+'"]');if(action==='up'||action==='down'){await row.locator('[data-drag-handle]').focus();await p.keyboard.press(action==='up'?'ArrowUp':'ArrowDown');}else await row.locator('[data-rp-action="'+action+'"]').click();await settle(p);}
async function seedPlan(p,stopIds){await p.addInitScript(()=>{const seeded=sessionStorage.getItem('qa-plan-seed');if(!seeded)return;sessionStorage.removeItem('qa-plan-seed');const state=JSON.parse(sessionStorage.getItem('sskr.route-editor'));state.plan.stopIds=JSON.parse(seeded);state.anchorId=state.plan.startId;state.selectedId=null;sessionStorage.setItem('sskr.route-editor',JSON.stringify(state));});await p.evaluate(ids=>sessionStorage.setItem('qa-plan-seed',JSON.stringify(ids)),stopIds);await p.reload();await p.waitForSelector('.route-planner:not([hidden])');await settle(p);assert.deepEqual((await draft(p)).stopIds,stopIds);}
async function autoFill(p){await p.locator('[data-rp-action=autofill]:visible').click();await settle(p);}

test('entry uses one finder, automatic insertion, map-only addition, and a separate management dialog',async()=>{
 const p=await page();await open(p);assert.equal(await p.locator('#rp-tab-places,#rp-tab-saved,#rp-insertion,.rp-sheet-toggle,.rp-expand').count(),0);assert.equal(await p.locator('[data-rp-action=save]').count(),1);assert.equal(await p.locator('[data-rp-action=autofill]').isDisabled(),true);
 const name=await p.locator('.rp-place-view strong').first().textContent();assert.doesNotMatch(name,/·/);await p.locator('.rp-place-view').first().click();assert.equal(await p.locator('.rp-place-detail [data-rp-action=add]').count(),0);await p.locator('.spot-route-add:visible').last().click();await settle(p);assert.ok((await draft(p)).startId);assert.equal(await p.locator('.rp-place-add').count(),0);await addFirstRecommendation(p);assert.equal((await draft(p)).stopIds.length,1);assert.deepEqual(p.errors,[]);await p.close();
});
test('desktop widths cap sidebars, leave remaining width to the map, and never overflow',async()=>{
 const p=await page(1180,757);await open(p);await start(p);
 for(const width of [801,900,1180,1280,1533,1920]){await p.setViewportSize({width,height:757});await p.waitForTimeout(160);const route=await p.locator('.rp-route-pane').boundingBox(),map=await p.locator('.spot-map-host').boundingBox(),right=await p.locator('.rp-discovery-pane').boundingBox();assert.ok(route.x+route.width<=map.x+1&&map.x+map.width<=right.x+1,JSON.stringify({width,route,map,right}));assert.ok(route.width<=260&&right.width<=300);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.equal(await p.locator('.spot-search input').isVisible(),true);assert.equal(await p.locator('[data-rp-action=save]').count(),1);}
 await capture(p,'route-desktop-panels');assert.deepEqual(p.errors,[]);await p.close();
});
test('automatic insertion displays the exact delta and preserves existing order across candidate clicks',async()=>{
 const p=await page();await open(p);await start(p,'gangneung');await seedPlan(p,['auraji','the-road-1423','cheongpung']);
 for(let i=0;i<3;i++){const before=await draft(p),id=await p.locator('.rp-next .rp-place').first().getAttribute('data-place-id');const expected=await p.evaluate(({before,id})=>{const provider=SSKR_ROUTE_PROVIDER.create();return {gap:SSKR_ROUTE_PLAN.bestInsertion(before,id,SSKR_SPOT_CATALOG,provider),stats:SSKR_ROUTE_PLAN.status(before,SSKR_SPOT_CATALOG,provider)};},{before,id});await p.locator('.rp-next .rp-place-view').first().click();assert.deepEqual((await draft(p)).stopIds,before.stopIds);assert.match(await p.locator('.rp-insertion-preview').textContent(),/추가 예정/);await p.locator('.spot-route-add:visible').last().click();await settle(p);const after=await draft(p),stops=before.stopIds.slice();stops.splice(expected.gap.at,0,id);assert.deepEqual(after.stopIds,stops);const stats=await p.evaluate(plan=>SSKR_ROUTE_PLAN.status(plan,SSKR_SPOT_CATALOG,SSKR_ROUTE_PROVIDER.create()),after);assert.ok(Math.abs(stats.distanceMeters-expected.stats.distanceMeters-expected.gap.addedDistanceMeters)<.0001);assert.ok(Math.abs(stats.durationSeconds-expected.stats.durationSeconds-expected.gap.addedDurationSeconds)<.0001);}
 assert.deepEqual(p.errors,[]);await p.close();
});
test('auto-fill replaces unpinned stops atomically and one undo restores the original',async()=>{
 const p=await page();await open(p);await start(p);await addFirstRecommendation(p);const before=await draft(p);await p.evaluate(()=>window.__roadDelay=350);await p.locator('[data-rp-action=autofill]').click();assert.deepEqual((await draft(p)).stopIds,before.stopIds);assert.equal(await p.locator('[data-rp-action=autofill]').getAttribute('aria-busy'),'true');assert.match(await p.locator('[data-rp-action=autofill]').textContent(),/만드는 중/);assert.equal(await p.getByText('루트 만드는 중…',{exact:true}).count(),1);assert.equal(await p.locator('.rp-operation').count(),0);await settle(p);const after=await draft(p);assert.equal(after.stopIds.length,10);assert.equal(after.stopIds.some(id=>before.stopIds.includes(id)),false);assert.equal(await p.locator('.rp-preview,[data-rp-action=apply-preview]').count(),0);assert.equal(await p.locator('.rp-waypoint').count(),12);await p.locator('[data-rp-action=undo]').click();await settle(p);assert.deepEqual((await draft(p)).stopIds,before.stopIds);await p.locator('[data-rp-action=undo]').click();await settle(p);assert.equal((await draft(p)).stopIds.length,0);assert.deepEqual(p.errors,[]);await p.close();
});
test('failed and invalid generation roads preserve draft, visible roads and undo history with persistent retry',async()=>{
 const p=await page();await open(p);await start(p);const before=await draft(p),line=await p.evaluate(()=>{const a=[];__map.eachLayer(l=>{if(l instanceof L.Polyline&&!(l instanceof L.Polygon))a.push(l.getLatLngs());});return a;});
 for(const flag of ['__roadFailure','__invalidRoads','__invalidCoordinates']){await p.evaluate(flag=>window[flag]=true,flag);await autoFill(p);assert.deepEqual((await draft(p)).stopIds,before.stopIds);assert.ok(await p.locator('[data-rp-action=retry-generation]').isVisible());assert.deepEqual(await p.evaluate(()=>{const a=[];__map.eachLayer(l=>{if(l instanceof L.Polyline&&!(l instanceof L.Polygon))a.push(l.getLatLngs());});return a;}),line);await p.evaluate(flag=>window[flag]=false,flag);}
 await p.locator('[data-rp-action=retry-generation]').click();await settle(p);assert.equal((await draft(p)).stopIds.length,10);await p.locator('[data-rp-action=undo]').click();await settle(p);assert.deepEqual((await draft(p)).stopIds,before.stopIds);assert.deepEqual(p.errors,[]);await p.close();
});
test('time-limited completion applies a complete connected proposal and keeps the actual late arrival warning',async()=>{
 const p=await page();await open(p);await start(p);const ids=await p.evaluate(()=>SSKR_ROUTE_PLAN.autoFill(JSON.parse(sessionStorage.getItem('sskr.route-editor')).plan,SSKR_SPOT_CATALOG,SSKR_ROUTE_PROVIDER.create()).stopIds.slice(0,9));await seedPlan(p,ids);await p.locator('input[name=departureTime]').fill('14:00');await p.locator('input[name=breakMinutes]').fill('180');await autoFill(p);assert.equal((await draft(p)).stopIds.length,10);assert.equal(await p.locator('.rp-operation .rp-error,.rp-stop-shortage').count(),0);assert.match(await p.locator('.rp-schedule-warning').textContent(),/다음 날|늦습니다/);await p.locator('[data-rp-action=undo]').click();await settle(p);assert.deepEqual((await draft(p)).stopIds,ids);assert.deepEqual(p.errors,[]);await p.close();
});
test('editing, undo and leaving cancel late auto-fill without a stale commit or toast',async()=>{
 const p=await page();await open(p);await start(p);await addFirstRecommendation(p);const id=(await draft(p)).stopIds[0];await p.evaluate(()=>window.__roadDelay=650);await p.locator('[data-rp-action=autofill]').click();await rowAction(p,id,'remove');await p.waitForTimeout(750);assert.deepEqual((await draft(p)).stopIds,[]);assert.doesNotMatch(await p.locator('.rp-notice').textContent(),/자동 완성을 적용/);
 await p.locator('[data-rp-action=autofill]').click();await p.locator('[data-rp-action=undo]').click();await settle(p);await p.waitForTimeout(750);assert.deepEqual((await draft(p)).stopIds,[id]);await p.locator('[data-rp-action=autofill]').click();await p.locator('[data-spot-mode=browse]').click();await p.waitForTimeout(750);assert.deepEqual((await draft(p)).stopIds,[id]);assert.deepEqual(p.errors,[]);await p.close();
});
test('new and load transitions cancel generation and a later result cannot overwrite a different route',async()=>{
 const p=await page();await open(p,'logged-in-no-application');await start(p);await save(p,'저장 경로');const stored=await draft(p);await p.evaluate(()=>window.__roadDelay=500);await p.locator('[data-rp-action=autofill]').click();await savedTab(p);await p.locator('[data-rp-action=new]').click();assert.equal((await draft(p)).startId,null);await p.waitForTimeout(600);assert.equal((await draft(p)).startId,null);await savedTab(p);await p.locator('[data-rp-action=load]').click();await settle(p);assert.equal((await draft(p)).id,stored.id);assert.deepEqual((await draft(p)).stopIds,stored.stopIds);assert.deepEqual(p.errors,[]);await p.close();
});
test('reconfiguration replaces unpinned places while retaining pinned anchors and changes footer controls',async()=>{
 const p=await page();await open(p);await start(p);await addFirstRecommendation(p);const id=(await draft(p)).stopIds[0];await rowAction(p,id,'pin');assert.equal(await p.locator('[data-rp-action=another]').count(),0);await autoFill(p);
 for(let i=0;i<2;i++){const before=await draft(p);await p.locator('[data-rp-action=rebuild]').click();await settle(p);const next=await draft(p);assert.equal(next.stopIds.length,10);assert.deepEqual(next.stopIds.filter(id=>before.stopIds.includes(id)),[id]);assert.deepEqual(next.pinnedStopIds,[id]);}
 assert.equal(await p.locator('[data-rp-action=autofill]').count(),0);assert.equal(await p.locator('[data-rp-action=optimize]').isVisible(),true);assert.equal(await p.locator('.rp-more-menu [data-rp-action=optimize]').count(),0);
 await rowAction(p,(await draft(p)).stopIds.find(stop=>stop!==id),'remove');assert.equal(await p.locator('[data-rp-action=autofill]').isVisible(),true);assert.equal(await p.locator('[data-rp-action=rebuild],[data-rp-action=optimize]').count(),0);assert.deepEqual(p.errors,[]);await p.close();
});
test('route optimization immediately shortens the order while preserving endpoints and place set',async()=>{
 const p=await page();await open(p);await start(p,'gangneung');await seedPlan(p,await p.evaluate(()=>SSKR_ROUTE_PLAN.autoFill({...JSON.parse(sessionStorage.getItem('sskr.route-editor')).plan,stopIds:['cheongpung','auraji','the-road-1423']},SSKR_SPOT_CATALOG,SSKR_ROUTE_PROVIDER.create()).stopIds));const before=await draft(p),stats=await p.evaluate(plan=>SSKR_ROUTE_PLAN.status(plan,SSKR_SPOT_CATALOG,SSKR_ROUTE_PROVIDER.create()),before);await tool(p,'optimize');await settle(p);const after=await draft(p),next=await p.evaluate(plan=>SSKR_ROUTE_PLAN.status(plan,SSKR_SPOT_CATALOG,SSKR_ROUTE_PROVIDER.create()),after);assert.ok(next.distanceMeters<stats.distanceMeters);assert.deepEqual([...after.stopIds].sort(),[...before.stopIds].sort());assert.equal(after.startId,before.startId);assert.equal(after.finishId,before.finishId);await p.keyboard.press('Control+z');await settle(p);assert.deepEqual((await draft(p)).stopIds,before.stopIds);assert.deepEqual(p.errors,[]);await p.close();
});
test('no-improvement optimization creates no empty undo entry',async()=>{
 const p=await page();await open(p);await start(p);await addFirstRecommendation(p);await addFirstRecommendation(p);await autoFill(p);await tool(p,'optimize');await settle(p);const optimized=await draft(p);await tool(p,'optimize');await settle(p);assert.match(await p.locator('.rp-notice').textContent(),/찾지 못/);await p.locator('[data-rp-action=undo]').click();await settle(p);assert.notDeepEqual((await draft(p)).stopIds,optimized.stopIds);assert.deepEqual(p.errors,[]);await p.close();
});
test('new, load and undo restore contents and route ownership without confirmations or recovery menus',async()=>{
 const p=await page();await open(p,'logged-in-no-application');await start(p);await addFirstRecommendation(p);await save(p,'첫 경로');const first=await draft(p);await savedTab(p);await p.locator('[data-rp-action=new]').click();assert.equal(await p.locator('dialog').count(),0);assert.equal((await draft(p)).id,null);await p.locator('[data-rp-action=undo]').click();await settle(p);assert.deepEqual(await draft(p),first);await savedTab(p);await p.locator('[data-rp-action=duplicate]').click();await settle(p);assert.equal((await draft(p)).id,null);await save(p);const second=await draft(p);assert.notEqual(second.id,first.id);await savedTab(p);await p.locator('[data-rp-action=load][data-id="'+first.id+'"]').click();await settle(p);assert.equal((await draft(p)).id,first.id);await p.locator('[data-rp-action=undo]').click();await settle(p);assert.equal((await draft(p)).id,second.id);await save(p);await savedTab(p);assert.equal(await p.locator('.rp-saved').count(),2);assert.deepEqual(p.errors,[]);await p.close();
});
test('inline title editing preserves an automatically named ID and supports undo',async()=>{
 const p=await page();await open(p,'logged-in-no-application');await start(p);await addFirstRecommendation(p);
 await p.locator('[data-rp-action=save]').click();assert.equal(await p.locator('dialog').count(),0);assert.equal((await draft(p)).title,'루트 01');assert.ok((await draft(p)).id);
 await p.locator('#rp-route-title').fill('취소할 이름');await p.locator('#rp-route-title').press('Enter');await p.locator('[data-rp-action=undo]').click();await settle(p);assert.equal((await draft(p)).title,'루트 01');
 await save(p,'내 경로');const saved=await draft(p);await p.locator('#rp-route-title').fill('변경한 경로');await p.locator('#rp-route-title').press('Enter');assert.equal((await draft(p)).title,'변경한 경로');assert.equal((await draft(p)).id,saved.id);
 await p.locator('[data-rp-action=undo]').click();await settle(p);assert.equal((await draft(p)).title,saved.title);assert.equal((await draft(p)).id,saved.id);await save(p);await savedTab(p);assert.equal(await p.locator('.rp-saved').count(),1);assert.equal(await p.locator('[data-rp-action=rename],.rp-managed-current,#rp-title').count(),0);await p.keyboard.press('Escape');await p.reload();await p.waitForSelector('.route-planner:not([hidden])');await settle(p);assert.equal((await draft(p)).id,saved.id);assert.equal(await p.locator('#rp-route-title').inputValue(),saved.title);await p.evaluate(()=>window.__roadDelay=400);await p.locator('[data-rp-action=autofill]').click();await p.locator('#rp-route-title').fill('계산 중 이름 수정');await p.locator('#rp-route-title').press('Enter');assert.equal(await p.locator('[data-route-generation][aria-busy=true]').count(),0);assert.equal(await p.locator('[data-rp-action=save]').isEnabled(),true);await p.waitForTimeout(500);assert.equal((await draft(p)).title,'계산 중 이름 수정');assert.deepEqual((await draft(p)).stopIds,saved.stopIds);await p.locator('[data-rp-action=undo]').click();await settle(p);assert.equal((await draft(p)).title,saved.title);assert.deepEqual(p.errors,[]);await p.close();
});
test('guest login cancel preserves route and name; only Google can save a nonparticipant draft',async()=>{
 const p=await page();await open(p);await start(p);await save(p,'게스트 경로');await p.waitForSelector('.rp-auth');assert.equal(await p.locator('.rp-auth [data-provider=google]').isEnabled(),true);for(const name of ['naver','kakao','apple'])assert.equal(await p.locator('.rp-auth [data-provider="'+name+'"]').isDisabled(),true);await p.keyboard.press('Escape');assert.equal((await draft(p)).title,'게스트 경로');await save(p);await p.locator('.rp-auth [data-provider=google]').click();await p.waitForFunction(()=>JSON.parse(sessionStorage.getItem('sskr.route-editor')).plan.id);assert.equal((await draft(p)).stopIds.length,0);await savedTab(p);assert.equal(await p.locator('.rp-saved').count(),1);assert.deepEqual(p.errors,[]);await p.close();
});
test('search, category conditions and detail scroll survive return and desktop resizing',async()=>{
 const p=await page(390,844);await open(p);await start(p);await p.locator('.spot-search input').fill('김해');await p.waitForTimeout(250);assert.equal(await p.locator('.rp-place-results').isVisible(),true);await p.locator('.rp-place-view').first().click();await p.locator('[data-rp-action=back-detail]').click();assert.equal(await p.locator('.spot-search input').inputValue(),'김해');await p.locator('[data-action=clear]').click();await p.locator('[data-category=nature]').click();assert.ok(await p.locator('.rp-place').count());assert.ok(await p.locator('.rp-place').evaluateAll(es=>es.every(e=>e.querySelector('em').textContent==='자연 · 전망')));await p.locator('#rp-tab-route').click();await p.setViewportSize({width:1440,height:900});await p.waitForTimeout(250);assert.equal(await p.locator('.spot-search input').isVisible(),true);assert.equal(await p.locator('[data-category=nature]').getAttribute('aria-selected'),'true');assert.deepEqual(p.errors,[]);await p.close();
});
test('event minimum controls completion while help holds the full check-in rule',async()=>{
 const p=await page();await p.route('**/api/participate/context',async route=>{const response=await route.fetch(),body=await response.json();body.event.minimumSpotCheckins=12;await route.fulfill({response,json:body});});await open(p);await start(p);await autoFill(p);assert.equal((await draft(p)).stopIds.length,12);await p.locator('[data-rp-action=help]').click();assert.match(await p.locator('.rp-dialog').textContent(),/경유 스팟 12개.*총 14개/s);await p.keyboard.press('Escape');assert.equal(await p.locator('[data-rp-action=help]').evaluate(e=>e===document.activeElement),true);assert.deepEqual(p.errors,[]);await p.close();
});
test('map fit is distinct from undo, closes selection, and keyboard shortcut ignores input fields',async()=>{
 const p=await page();await open(p);await start(p);await addFirstRecommendation(p);const before=await draft(p);assert.equal(await p.locator('[data-rp-action=fit]').count(),0);assert.equal(await p.locator('[data-action=fit] svg').count(),1);await p.locator('[data-action=fit]').click();assert.equal(await p.locator('.spot-route-add:visible').count(),0);await p.locator('.spot-search input').fill('김해');await p.locator('.spot-search input').press('Control+z');assert.deepEqual((await draft(p)).stopIds,before.stopIds);await p.locator('[data-rp-action=help]').focus();await p.keyboard.press('Control+z');await settle(p);assert.equal((await draft(p)).stopIds.length,0);assert.deepEqual(p.errors,[]);await p.close();
});
test('hover keeps the map still and only a selected top marker exposes a fully visible action',async()=>{
 const p=await page(1280,844);await open(p);
 await p.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))));
 const id='gangneung',place=await p.evaluate(id=>SSKR_SPOT_CATALOG.find(x=>x.id===id),id);
 await p.evaluate(({lat,lng})=>{const m=__map,z=Math.max(m.getMinZoom(),9),point=m.project([lat,lng],z),size=m.getSize();m.setView(m.unproject([point.x,point.y+size.y/2-54],z),z,{animate:false});},place);
 const marker=p.locator('.spot-pin.start[title="남항진해변"]');await marker.waitFor();await p.waitForTimeout(250);
 const before=await p.evaluate(()=>__map.getCenter());await marker.hover();
 await p.waitForTimeout(100);assert.equal(await p.locator('.leaflet-tooltip .spot-route-add').count(),0);
 assert.ok(await p.evaluate(center=>__map.distance(__map.getCenter(),center)<1,before));
 await marker.click();const action=p.locator('.leaflet-tooltip .spot-route-add:visible').last();await action.waitFor();
 await p.waitForTimeout(200);const button=await action.boundingBox(),map=await p.locator('.spot-map').boundingBox();
 assert.ok(button.y>=map.y+8&&button.y+button.height<=map.y+map.height-8,JSON.stringify({button,map}));
 assert.deepEqual(p.errors,[]);await p.close();
});


test('selecting from a scrolled mobile list reveals the sticky map card and action',async()=>{
 const p=await page(390,844);await open(p);assert.equal(await p.locator('[data-rp-action="sheet"]').count(),0);
 await p.locator('.rp-place-results .rp-place-view').last().scrollIntoViewIfNeeded();await p.locator('.rp-place-results .rp-place-view').last().click();
 const action=p.locator('.leaflet-tooltip .spot-route-add:visible').last();await action.waitFor();await p.waitForTimeout(250);
 const map=await p.locator('.spot-map').boundingBox(),summary=await p.locator('.rp-map-summary').boundingBox(),card=await p.locator('.leaflet-tooltip .spot-photo-card:visible').last().boundingBox(),button=await action.boundingBox();
 assert.ok(map.y>=0&&map.y<3);for(const box of [card,button])assert.ok(box.y>=map.y&&box.y+box.height<=summary.y,JSON.stringify({box,map,summary}));
 assert.ok(button.height>=44);await action.click();await settle(p);assert.ok((await draft(p)).startId);assert.deepEqual(p.errors,[]);await p.close();
});


test('mouse and keyboard corner selections reveal the card and action on mobile and desktop',async()=>{
 for(const width of [390,1440]){
  const p=await page(width,1000);await open(p);
  const place=await p.evaluate(()=>SSKR_SPOT_CATALOG.find(x=>x.id==='gangneung'));
  for(const [x,y,keyboard] of [[.15,.24,false],[.85,.24,true],[.15,.6,true],[.85,.6,false]]){
   await p.evaluate(({place,x,y})=>{const m=__map,z=Math.max(m.getMinZoom(),11),point=m.project([place.lat,place.lng],z),size=m.getSize();m.setView(m.unproject([point.x+(0.5-x)*size.x,point.y+(0.5-y)*size.y],z),z,{animate:false});},{place,x,y});
   const marker=p.locator('.spot-pin.start[title="남항진해변"]');await marker.waitFor();await p.waitForTimeout(250);
   if(keyboard){await marker.focus();await p.keyboard.press(y>.5?'Space':'Enter');}else await marker.click();
   await p.waitForTimeout(650);
   const action=p.locator('.leaflet-tooltip .spot-route-add:visible').last();await action.waitFor();
   const map=await p.locator('.spot-map').boundingBox(),button=await action.boundingBox(),card=await p.locator('.leaflet-tooltip .spot-photo-card:visible').last().boundingBox();
   const header=await p.locator('.spot-list-head').boundingBox();
   const top=Math.max(map.y,header?header.y+header.height:map.y),bottom=map.y+map.height;
   for(const box of [button,card]){assert.ok(box.x>=map.x&&box.x+box.width<=map.x+map.width,JSON.stringify({width,x,y,keyboard,box,map}));assert.ok(box.y>=top&&box.y+box.height<=bottom,JSON.stringify({width,box,top,bottom}));}
   assert.ok(button.height>=44);
  }
  assert.ok(await p.locator('.spot-pin').evaluateAll(es=>es.every(e=>getComputedStyle(e).opacity==='1'&&getComputedStyle(e.querySelector('span')).opacity==='1')));
  assert.equal(await p.locator('.spot-pin.start:not(.is-selected) span').first().evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(182, 136, 66)');
  assert.deepEqual(p.errors,[]);await p.close();
 }
});


test('responsive workspace uses document scrolling on mobile and retains desktop panels',async()=>{
 for(const width of [360,390,430,768,1000,1280,1440,1920]){const p=await page(width,844);await open(p);await start(p);
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 if(width<=800){
  assert.equal(await p.locator('.rp-sheet-toggle,.rp-expand').count(),0);assert.equal(await p.locator('.rp-mobile-sticky').count(),1);
  assert.equal(await p.locator('[data-scroll="places"]').evaluate(e=>getComputedStyle(e).overflowY),'visible');
  const center=await p.evaluate(()=>__map.getCenter());await p.mouse.move(width/2,780);await p.mouse.wheel(0,300);await p.waitForTimeout(250);
  assert.ok(await p.evaluate(()=>scrollY)>0);assert.ok(await p.evaluate(center=>__map.distance(__map.getCenter(),center)<1,center));
  const map=await p.locator('.spot-map').boundingBox(),tabs=await p.locator('.rp-tabs').boundingBox();assert.ok(map.y>=0&&map.y<3);assert.ok(Math.abs(tabs.y-(map.y+map.height))<=2);
  assert.ok((await p.locator('.app-header').boundingBox()).y+64<=0);
  await p.locator('.rp-next .rp-place-view').first().click();assert.equal(await p.locator('.rp-place-detail').count(),1);await p.locator('[data-rp-action="back-detail"]').click();
  await p.locator('#rp-tab-search').focus();await p.evaluate(()=>dispatchEvent(new Event('resize')));await p.waitForTimeout(100);assert.equal(await p.evaluate(()=>document.activeElement.id),'rp-tab-search');await p.keyboard.press('ArrowRight');assert.equal(await p.locator('.rp-route-pane').isVisible(),true);await p.locator('#rp-tab-search').click();
  await p.locator('.spot-search input').fill('김해');await p.waitForTimeout(250);assert.ok(await p.locator('.rp-place-results .rp-place').count()>0);await p.locator('.spot-search input').fill('');await p.waitForTimeout(250);
 }else{assert.equal(await p.locator('.rp-mobile-sticky').count(),0);assert.equal(await p.locator('[data-scroll="places"]').evaluate(e=>getComputedStyle(e).overflowY),'auto');}
 assert.deepEqual(p.errors,[]);await capture(p,'workspace-'+width);await p.close();
 }
});


test('a late road response does not move the map after returning to browsing',async()=>{
 const p=await page();await p.goto(base+'/app/spots?scenario=guest');await p.waitForSelector('[data-spot-mode="plan"]');await p.waitForFunction(()=>window.__map);
 await p.evaluate(()=>{const create=SSKR_ROUTE_PROVIDER.create;SSKR_ROUTE_PROVIDER.create=()=>{const provider=create(),route=provider.route.bind(provider);provider.route=async(...args)=>{await new Promise(resolve=>window.__releaseRoad=resolve);const result=await route(...args);window.__roadDone=true;return result;};return provider;};});
 // The planner has already mounted, so remount it through the existing app navigation.
 await p.locator('a[data-app-link][href="/app/memorials"]').first().click();await p.locator('a[data-app-link][href="/app/spots"]').first().click();
 await p.locator('[data-spot-mode="plan"]').click();await chooseStart(p,'sokcho');await p.waitForFunction(()=>window.__releaseRoad);
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
 await chooseStart(p);assert.equal((await draft(p)).startId,'songjeong');
 assert.deepEqual(p.errors,[]);await p.close();
});



test('short screens keep the complete map card visible and mobile details omit duplicate names',async()=>{
 for(const [width,height] of [[360,640],[390,664],[430,700],[844,390]]){
  const p=await page(width,height);await open(p);await p.locator('.rp-place-results .rp-place-view').first().click();await p.waitForTimeout(400);
  // A previously queued bounds animation must not move the card after reveal.
  for(const delay of [0,500]){
  if(delay)await p.waitForTimeout(delay);
  const map=await p.locator('.spot-map').boundingBox(),head=await p.locator('.spot-map-controls').boundingBox();
  for(const selector of ['.spot-route-add','.spot-photo-card']){
   const box=await p.locator('.leaflet-tooltip '+selector+':visible').last().boundingBox();
   assert.ok(box.x>=map.x&&box.x+box.width<=map.x+map.width+1&&box.y>=map.y&&box.y+box.height<=map.y+map.height&&!(box.x<head.x+head.width&&box.x+box.width>head.x&&box.y<head.y+head.height&&box.y+box.height>head.y),JSON.stringify({width,height,map,head,box}));
  }
  }
  if(width<=800){assert.ok((await p.locator('.rp-mobile-sticky').boundingBox()).height<height-44);assert.equal(await p.locator('.rp-place-detail h3').isVisible(),false);}else{assert.ok(await p.locator('.spot-planning-area').evaluate(e=>e.getBoundingClientRect().bottom<=innerHeight+1));const name=await p.locator('.rp-place-detail h3').boundingBox(),photo=await p.locator('.rp-detail-image').boundingBox();assert.ok(name.y<photo.y);}
  assert.deepEqual(p.errors,[]);await p.close();
 }
});


test('short mobile maps show only photo and add button, clear of controls and the route summary',async()=>{
 for(const [width,height]of [[360,640],[390,664],[430,700]]){
  const p=await page(width,height);await open(p);await start(p);await p.locator('.rp-next .rp-place-view').first().click();await p.waitForTimeout(650);
  const map=await p.locator('.spot-map').boundingBox(),summary=await p.locator('.rp-map-summary').boundingBox(),controls=await p.locator('.spot-map-controls').boundingBox();
  assert.equal(await p.locator('.leaflet-tooltip .spot-route-context').count(),0);
  for(const selector of ['.spot-route-add','.spot-photo-card']){
   const box=await p.locator('.leaflet-tooltip '+selector+':visible').last().boundingBox();
   assert.ok(box.x>=map.x&&box.x+box.width<=map.x+map.width+1&&box.y>=map.y&&box.y+box.height<=summary.y,JSON.stringify({width,height,box,map,summary}));
   assert.ok(box.x+box.width<=controls.x||box.x>=controls.x+controls.width||box.y+box.height<=controls.y||box.y>=controls.y+controls.height,JSON.stringify({width,height,box,controls}));
  }
  if(width===390)await capture(p,'mobile-insertion-card');assert.deepEqual(p.errors,[]);await p.close();
 }
});


test('start galleries and illustrated help stay usable in narrow and short screens',async()=>{
 for(const [width,height]of [[1440,760],[390,605],[360,640]]){
  const p=await page(width,height);await open(p);
  if(width<800)await p.locator('#rp-tab-route').click();
  const button=p.locator('.rp-start-select');assert.equal(await button.isVisible(),true);
  assert.ok((await button.boundingBox()).height>=44);assert.equal(await button.innerText(),'출발지 선택');
  const presentation=await button.evaluate(el=>{const s=getComputedStyle(el),r=el.getBoundingClientRect(),next=el.closest('li').nextElementSibling.getBoundingClientRect();const lum=color=>color.match(/[\d.]+/g).slice(0,3).map(v=>{v=Number(v)/255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);const values=[lum(s.color),lum(s.backgroundColor)].sort((a,b)=>a-b);return {contrast:(values[1]+.05)/(values[0]+.05),gap:next.top-r.bottom,overflow:el.scrollWidth>el.clientWidth};});assert.ok(presentation.contrast>=4.5);assert.ok(presentation.gap>=12);assert.equal(presentation.overflow,false);
  assert.equal(await button.locator('.rp-start-select-arrow').evaluate(el=>getComputedStyle(el).animationName),'none');
  await button.focus();await p.keyboard.press('Enter');const gallery=p.locator('.rp-dialog--starts');
  assert.equal(await gallery.locator('[data-start-id] img').count(),11);
  const grid=await gallery.locator('.rp-start-options').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length);assert.equal(grid,width<600?2:3);
  assert.equal(await gallery.evaluate(el=>el.scrollHeight>el.clientHeight),true);
  if(width>1000)assert.ok((await gallery.boundingBox()).width>=800);
  await gallery.locator('[data-start-id="songjeong"]').scrollIntoViewIfNeeded();
  assert.equal(await gallery.locator('[data-close]').evaluate(el=>{const r=el.getBoundingClientRect(),d=el.closest('dialog').getBoundingClientRect();return r.top>=d.top&&r.bottom<=d.bottom;}),true);
  await gallery.locator('[data-start-id="songjeong"]').click();await settle(p);assert.equal((await draft(p)).startId,'songjeong');
  await p.locator('[data-rp-action=help]').click();const help=p.locator('.rp-dialog--help');
  assert.equal(await help.locator('.rp-help-steps img').count(),4);
  assert.equal(await help.locator('.rp-help-steps img').evaluateAll(async images=>{await Promise.all(images.map(img=>img.decode()));return images.every(img=>img.naturalWidth===480&&img.alt.length>10);}),true);
  assert.match(await help.textContent(),/경유 스팟 10개.*총 12개/s);assert.equal(await help.evaluate(el=>el.scrollHeight>el.clientHeight),true);
  await help.locator('.rp-help-notes').scrollIntoViewIfNeeded();await p.keyboard.press('Escape');
  assert.equal(await p.locator('[data-rp-action=help]').evaluate(el=>el===document.activeElement),true);
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(p.errors,[]);await p.close();
 }
});

test('finder order and one-line category tabs survive keyboard use and screen changes',async()=>{
 const p=await page(1280,900);await open(p);await start(p);
 for(const width of [1280,900,390]){
  await p.setViewportSize({width,height:844});await p.waitForTimeout(180);
  if(width<800)await p.locator('#rp-tab-search').click();
  const pane=p.locator('.rp-discovery-pane');
  const ordered=await pane.evaluate(el=>{const r=s=>el.querySelector(s).getBoundingClientRect();return r('.rp-section-title').bottom<=r('.rp-filter-slot').top+1&&r('.rp-filter-slot').bottom<=r('.rp-search-slot').top+1&&r('.rp-search-slot').bottom<=r('.rp-next,.rp-place-results').top+1;});assert.equal(ordered,true,`${width}px finder order`);
  assert.deepEqual(await pane.locator('[data-category-label]').allTextContents(),['모두','카페','맛집','자연','역사']);
  assert.equal(await pane.locator('details.rp-filters,.rp-insertion-gap').count(),0);
  assert.doesNotMatch(await pane.locator('.rp-next').textContent(),/→.*구간/);
  assert.equal(await pane.locator('[role=tab]').evaluateAll(tabs=>tabs.every(el=>Math.abs(el.getBoundingClientRect().top-tabs[0].getBoundingClientRect().top)<1)),true);
  const tabs=pane.locator('.spot-categories');assert.equal(await tabs.evaluate(el=>getComputedStyle(el).overflowX),'auto');
  await pane.locator('[data-category=all]').focus();await p.keyboard.press('ArrowRight');assert.equal(await pane.locator('[data-category=cafe]').getAttribute('aria-selected'),'true');
  await p.keyboard.press('Home');assert.equal(await pane.locator('[data-category=all]').getAttribute('aria-selected'),'true');
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 }
 assert.deepEqual(p.errors,[]);await p.close();
});

test('default browse and empty editor fill the mainland frame and cannot zoom out beyond it',async()=>{
 for(const [width,height]of [[1440,1000],[1280,720],[360,740],[390,844],[430,932]]){
  const p=await page(width,height);await p.goto(base+'/app/spots?scenario=guest');await p.waitForFunction(()=>window.__map);await p.waitForTimeout(300);assert.equal(new URL(p.url()).pathname,'/app/spots');assert.equal(await p.locator('.leaflet-tooltip').count(),0);
  for(const editing of [false,true]){
   if(editing){await p.locator('[data-spot-mode=plan]').click();await p.waitForTimeout(300);}
   const visible=await p.evaluate(()=>{const m=__map,c=m.getCenter(),size=m.getSize(),box=document.querySelector('.spot-map').getBoundingClientRect(),controls=document.querySelector('.spot-map-controls').getBoundingClientRect();return {center:[c.lat,c.lng],zoom:m.getZoom(),minimum:m.getMinZoom(),size,controls:{left:controls.left-box.left,bottom:controls.bottom-box.top},points:[[38.20,128.59],[34.30,126.53],[35.10,129.04],[37.56,126.62]].map(pos=>{const p=m.latLngToContainerPoint(pos);return {x:p.x,y:p.y,inside:p.x>=0&&p.x<=size.x&&p.y>=0&&p.y<=size.y};}),jeju:m.latLngToContainerPoint([33.38,126.53])};});
   assert.equal(visible.zoom,visible.minimum,JSON.stringify({width,editing,...visible}));
   assert.ok(visible.points.every(p=>p.inside),JSON.stringify({width,editing,...visible}));
   if(width>800){assert.ok(visible.points[0].y<visible.size.y*.18,JSON.stringify({width,editing,...visible}));assert.ok(visible.points[1].y>visible.size.y*.82,JSON.stringify({width,editing,...visible}));assert.ok(visible.jeju.y>visible.size.y,JSON.stringify({width,editing,...visible}));}
   if(editing&&width<=800)assert.ok(visible.points[0].x+13<visible.controls.left||visible.points[0].y-13>visible.controls.bottom,'Sokcho must stay clear of mobile map controls: '+JSON.stringify(visible));
   await p.locator('[data-action="zoom-out"]').click();await p.waitForTimeout(100);assert.equal(await p.evaluate(()=>__map.getZoom()),visible.minimum);
   await p.evaluate(()=>__map.panTo([33.38,126.53],{animate:false}));assert.ok(await p.evaluate(()=>__map.getBounds().contains([33.38,126.53])),'Jeju stays reachable by panning');
   await p.locator('.spot-map-controls [data-action="fit"]').click();await p.waitForTimeout(150);assert.equal(await p.evaluate(()=>__map.getZoom()),visible.minimum);assert.equal(await p.locator('.sskr-land-label.is-dokdo').count(),1);
   if(editing)await capture(p,width>800?'mainland-editor-'+width:'mainland-editor-mobile');
  }
  assert.deepEqual(p.errors,[]);await p.close();
 }
});

test('touch selection and keyboard-sized viewport preserve the route and usable map actions',async()=>{
 const p=await page(390,844,{hasTouch:true,isMobile:true,deviceScaleFactor:2});await open(p);
 await p.locator('.rp-place-results .rp-place-view').first().tap();await p.waitForTimeout(300);
 await p.locator('.leaflet-tooltip .spot-route-add:visible').last().tap();await settle(p);const original=await draft(p);
 await p.locator('#rp-tab-search').tap();await p.locator('.spot-search input').tap();await p.setViewportSize({width:390,height:430});await p.locator('.spot-search input').fill('김해');await p.waitForTimeout(300);
 assert.equal(await p.locator('.spot-search input').inputValue(),'김해');assert.equal((await draft(p)).startId,original.startId);
 assert.equal(await p.locator('.spot-planning-area').evaluate(e=>e.classList.contains('has-keyboard')),true);assert.equal(await p.locator('.rp-tabs').evaluate(e=>e.parentElement.classList.contains('spot-planning-area')),true);
 const inputBox=await p.locator('.spot-search input').boundingBox();assert.ok(inputBox.y>=44&&inputBox.y+inputBox.height<=430);
 await p.setViewportSize({width:768,height:390});await p.waitForTimeout(300);
 assert.equal(await p.locator('.spot-planning-area').evaluate(e=>e.classList.contains('has-keyboard')),false);assert.equal(await p.locator('.rp-tabs').evaluate(e=>e.parentElement.classList.contains('rp-mobile-sticky')),true);
 await p.setViewportSize({width:390,height:844});await p.locator('.rp-place-results .rp-place-view').first().tap();await p.waitForTimeout(300);
 const action=await p.locator('.leaflet-tooltip .spot-route-add:visible').last().boundingBox(),map=await p.locator('.spot-map').boundingBox();assert.ok(action.y>=map.y&&action.y+action.height<=map.y+map.height);
 assert.deepEqual(p.errors,[]);await p.close();
});



test('normal motion and session reload keep the selected action inside a short map',async()=>{
 const p=await page(844,390,{reducedMotion:'no-preference'});await open(p);await p.locator('.rp-place-results .rp-place-view').first().click();await p.waitForTimeout(800);await p.reload();await p.locator('.route-planner:not([hidden])').waitFor();
 await p.locator('.rp-place-results .rp-place-view').first().click();await p.waitForTimeout(800);
 const map=await p.locator('.spot-map').boundingBox();for(const selector of ['.spot-route-add','.spot-photo-card']){const box=await p.locator('.leaflet-tooltip '+selector+':visible').last().boundingBox();assert.ok(box.y>=map.y&&box.y+box.height<=map.y+map.height,JSON.stringify({map,box}));}
 assert.equal(await p.evaluate(()=>scrollY),0);assert.deepEqual(p.errors,[]);await p.close();
});



test('start changes apply immediately and undo retains chosen stops and pins',async()=>{
 const p=await page();await open(p);await start(p,'sokcho');await addFirstRecommendation(p);await rowAction(p,(await draft(p)).stopIds[0],'pin');const original=await draft(p);
 await chooseStart(p,'gwangalli');await settle(p);assert.equal(await p.locator('.rp-dialog').count(),0);assert.equal((await draft(p)).startId,'gwangalli');assert.deepEqual((await draft(p)).stopIds,original.stopIds);assert.deepEqual((await draft(p)).pinnedStopIds,original.pinnedStopIds);assert.equal((await draft(p)).id,original.id);
 await p.locator('[data-rp-action=undo]').click();await settle(p);assert.deepEqual(await draft(p),original);assert.deepEqual(p.errors,[]);await p.close();
});

test('mobile entry after a wide browse view frames every start instead of retaining an offshore center',async()=>{
 const p=await page(1440,900);await p.goto(base+'/app/spots?scenario=guest');await p.waitForFunction(()=>window.__map);await p.setViewportSize({width:390,height:844});await p.locator('[data-spot-mode="plan"]').click();await p.waitForTimeout(350);
 assert.ok(await p.evaluate(()=>SSKR_SPOT_CATALOG.filter(p=>p.kind==='start').every(p=>__map.getBounds().contains([p.lat,p.lng]))));assert.deepEqual(p.errors,[]);await p.close();
});


test('actual road shapes connect the completed route and provider retry preserves editing',async()=>{
 const p=await page();await p.unroute('**/web/app/route-provider.js*');await open(p);await start(p);await autoFill(p);assert.equal((await draft(p)).stopIds.length,10);await p.waitForFunction(()=>{let n=0;__map.eachLayer(l=>{if(l instanceof L.Polyline&&!(l instanceof L.Polygon)&&l.getLatLngs().length>10)n++;});return n>=11;});assert.deepEqual(p.errors,[]);await p.close();
 const failed=await page();await failed.addInitScript(()=>window.__providerFailure=true);await open(failed);await failed.waitForSelector('[data-rp-action=retry-provider]');await chooseStart(failed);assert.equal((await draft(failed)).startId,'songjeong');await failed.evaluate(()=>window.__providerFailure=false);await failed.locator('[data-rp-action=retry-provider]').click();await failed.waitForSelector('.rp-next .rp-place-view');assert.deepEqual(failed.errors,[]);await failed.close();
});
test('mobile list actions stay in document flow, reorder access works and saved transitions undo',async()=>{
 const p=await page(390,844);await open(p);await start(p);await addFirstRecommendation(p);await addFirstRecommendation(p);await p.locator('#rp-tab-route').click();const before=await draft(p);await rowAction(p,before.stopIds[0],'down');assert.deepEqual((await draft(p)).stopIds,[before.stopIds[1],before.stopIds[0]]);const handle=p.locator('[data-drag-handle="'+before.stopIds[0]+'"]');await handle.focus();await p.keyboard.press('ArrowUp');await settle(p);assert.deepEqual((await draft(p)).stopIds,before.stopIds);await p.locator('[data-rp-action=undo]').click();await settle(p);assert.deepEqual((await draft(p)).stopIds,[before.stopIds[1],before.stopIds[0]]);const last=await p.locator('.rp-waypoint').last().boundingBox(),footer=await p.locator('.rp-route-footer').boundingBox();assert.ok(footer.y>=last.y+last.height);assert.equal(await p.locator('.rp-route-scroll').evaluate(e=>getComputedStyle(e).overflowY),'visible');await capture(p,'mobile-route-list');await p.locator('[data-rp-action=manage]').click();await p.locator('[data-rp-action=new]').click();assert.equal((await draft(p)).startId,null);await p.locator('[data-rp-action=undo]').click();await settle(p);assert.equal((await draft(p)).startId,before.startId);assert.deepEqual(p.errors,[]);await p.close();
});

test('waypoints use a direct delete button while dragging, touch targets and undo remain available',async()=>{
 for(const width of [1440,390]){
  const p=await page(width,844);await open(p);await start(p);await addFirstRecommendation(p);await addFirstRecommendation(p);if(width===390)await p.locator('#rp-tab-route').click();const before=await draft(p);
  assert.equal(await p.locator('.rp-row-menu,[data-rp-action=up],[data-rp-action=down],[data-rp-action=detail]').count(),0);assert.equal(await p.locator('.rp-remove').count(),2);assert.equal(await p.locator('[data-waypoint="'+before.startId+'"] .rp-remove,[data-waypoint="'+before.finishId+'"] .rp-remove').count(),0);
  const row=p.locator('[data-waypoint="'+before.stopIds[0]+'"]'),remove=row.locator('.rp-remove'),box=await remove.boundingBox();assert.ok(box.width>=(width===390?44:32)&&box.height>=(width===390?44:32));assert.ok((await row.boundingBox()).height<=(width===390?104:78));assert.match(await remove.getAttribute('aria-label'),/스팟 삭제$/);
  if(width===1440){await row.dragTo(p.locator('[data-waypoint="'+before.stopIds[1]+'"]'),{targetPosition:{x:60,y:60}});await settle(p);assert.deepEqual((await draft(p)).stopIds,[before.stopIds[1],before.stopIds[0]]);await p.locator('[data-rp-action=undo]').click();await settle(p);}
  await remove.click();await settle(p);assert.deepEqual((await draft(p)).stopIds,[before.stopIds[1]]);await p.locator('[data-rp-action=undo]').click();await settle(p);assert.deepEqual((await draft(p)).stopIds,before.stopIds);await capture(p,width===390?'mobile-waypoint-actions':'desktop-waypoint-actions');assert.deepEqual(p.errors,[]);await p.close();
 }
});

test('repeated add clicks are single-shot and a concurrent removal cancels a stale insertion',async()=>{
 const p=await page();await open(p);await start(p);await addFirstRecommendation(p);await addFirstRecommendation(p);const before=await draft(p);await p.locator('.rp-next .rp-place-view').first().click();await p.evaluate(()=>window.__roadDelay=400);await p.locator('.spot-route-add:visible').last().dispatchEvent('click');await p.locator('.spot-route-add:visible').last().dispatchEvent('click');assert.equal(await p.locator('.spot-route-add:visible').last().isDisabled(),true);await rowAction(p,before.stopIds[0],'remove');await p.waitForTimeout(500);assert.deepEqual((await draft(p)).stopIds,before.stopIds.slice(1));await p.locator('[data-rp-action=back-detail]').click();await p.locator('.rp-next .rp-place-view').first().click();await p.locator('.spot-route-add:visible').last().dispatchEvent('click');await p.locator('.spot-route-add:visible').last().dispatchEvent('click');await settle(p);assert.equal((await draft(p)).stopIds.length,before.stopIds.length);assert.equal(new Set((await draft(p)).stopIds).size,before.stopIds.length);assert.deepEqual(p.errors,[]);await p.close();
});
test('legacy saved-list URLs open route management and browse filters survive editing',async()=>{
 const p=await page();await p.goto(base+'/app/spots?scenario=logged-in-no-application&spotKind=start&spotSearch=망');await p.waitForSelector('.spot-search');await p.locator('[data-spot-mode=plan]').click();await savedTab(p);assert.equal(new URL(p.url()).searchParams.get('tab'),'saved');await p.reload();await p.waitForSelector('dialog[data-management]');await p.keyboard.press('Escape');await p.locator('[data-spot-mode=browse]').click();const url=new URL(p.url());assert.equal(url.searchParams.has('mode'),false);assert.equal(url.searchParams.has('tab'),false);assert.equal(url.searchParams.get('spotSearch'),'망');assert.equal(url.searchParams.get('spotKind'),'start');assert.equal(await p.locator('.spot-search input').inputValue(),'망');assert.deepEqual(p.errors,[]);await p.close();
});
test('retired saved waypoint stays explicit until removed, then the original ID can be saved',async()=>{
 const p=await page();await open(p,'logged-in-no-application');await start(p);await save(p,'수정할 경로');const before=await draft(p);await p.evaluate(id=>{const key='sskr.mock.route-plans:'+encodeURIComponent('mock-rider-0271'),saved=JSON.parse(localStorage.getItem(key));saved.plans.find(x=>x.id===id).stopIds=['retired-qa-spot'];localStorage.setItem(key,JSON.stringify(saved));},before.id);await savedTab(p);await p.locator('[data-rp-action=load]').click();await settle(p);assert.deepEqual((await draft(p)).stopIds,['retired-qa-spot']);assert.equal(await p.locator('.rp-waypoint.is-missing').count(),1);await rowAction(p,'retired-qa-spot','remove');await save(p);assert.equal((await draft(p)).id,before.id);assert.deepEqual((await draft(p)).stopIds,[]);assert.deepEqual(p.errors,[]);await p.close();
});
test('known retired spots keep their name and require explicit route repair',async()=>{
 const p=await page();await open(p,'logged-in-no-application');await start(p);await save(p,'수정할 경로');const before=await draft(p);await p.evaluate(id=>{const key='sskr.mock.route-plans:'+encodeURIComponent('mock-rider-0271'),saved=JSON.parse(localStorage.getItem(key));saved.plans.find(x=>x.id===id).stopIds=['road-66'];localStorage.setItem(key,JSON.stringify(saved));},before.id);await savedTab(p);await p.locator('[data-rp-action=load]').click();await settle(p);assert.deepEqual((await draft(p)).stopIds,['road-66']);assert.equal(await p.locator('.rp-waypoint.is-missing').count(),1);assert.match(await p.locator('.rp-waypoint.is-missing strong').textContent(),/66로드카페/);assert.equal(await p.locator('.rp-waypoint.is-missing .rp-point-main').isDisabled(),true);assert.match(await p.locator('.rp-error').first().textContent(),/66로드카페/);await rowAction(p,'road-66','remove');await save(p);assert.equal((await draft(p)).id,before.id);assert.deepEqual((await draft(p)).stopIds,[]);assert.deepEqual(p.errors,[]);await p.close();
});

test('toolbar schedule changes apply immediately, cancel late generation and cross-route undo restores them',async()=>{
 const p=await page();await open(p,'logged-in-no-application');const defaults=await p.evaluate(()=>JSON.parse(sessionStorage.getItem('sskr.route-editor')).schedule);await start(p);await save(p,'일정 A');const first=await draft(p);await p.locator('input[name=departureTime]').fill('06:30');await p.locator('input[name=breakMinutes]').fill('45');
 await p.evaluate(()=>window.__roadDelay=1000);await p.locator('[data-rp-action=autofill]').click();await p.locator('input[name=breakMinutes]').fill('90');await p.waitForTimeout(1100);assert.deepEqual((await draft(p)).stopIds,first.stopIds);assert.doesNotMatch(await p.locator('.rp-notice').textContent(),/자동 완성을 적용/);assert.deepEqual(await p.evaluate(()=>JSON.parse(sessionStorage.getItem('sskr.route-editor')).schedule),{departureTime:'06:30',breakMinutes:'90'});
 await savedTab(p);await p.locator('[data-rp-action=new]').click();assert.deepEqual(await p.evaluate(()=>JSON.parse(sessionStorage.getItem('sskr.route-editor')).schedule),defaults);await p.locator('[data-rp-action=undo]').click();await settle(p);assert.equal((await draft(p)).id,first.id);assert.deepEqual(await p.evaluate(()=>JSON.parse(sessionStorage.getItem('sskr.route-editor')).schedule),{departureTime:'06:30',breakMinutes:'90'});assert.deepEqual(p.errors,[]);await p.close();
});

test('all start markers remain selectable after route setup and filters, with change actions only on selection',async()=>{
 for(const width of [1440,390]){
  const p=await page(width,844);await open(p);await start(p,'sokcho');await addFirstRecommendation(p);const original=await draft(p);
  const startCount=await p.evaluate(()=>SSKR_SPOT_CATALOG.filter(place=>place.kind==='start').length);
  assert.equal(await p.locator('.spot-pin.start').count(),startCount);
  await p.locator('.spot-search input').fill('경기');await p.waitForTimeout(350);
  assert.equal(await p.locator('.spot-pin.start').count(),startCount);
  const name=await p.evaluate(()=>{const place=SSKR_SPOT_CATALOG.find(place=>place.id==='gwangalli');__map.stop();__map.setView([place.lat,place.lng],__map.getZoom(),{animate:false});return place.name;});
  await p.waitForTimeout(200);
  const marker=p.locator('.spot-pin.start[title="'+name+'"]'),tip=p.locator('.spot-route-tooltip').filter({hasText:name});
  if(width>800){
   const before=await p.evaluate(()=>__map.getCenter());await marker.hover();await tip.waitFor({state:'visible'});
   assert.equal(await tip.locator('.spot-route-add').count(),0);assert.deepEqual(await p.evaluate(()=>__map.getCenter()),before);
  }
  await marker.click();await tip.locator('.spot-route-add').waitFor({state:'visible'});
  assert.equal(await tip.locator('.spot-route-add').textContent(),'출발지 변경');assert.deepEqual(await draft(p),original);
  await tip.locator('.spot-route-add').click();await settle(p);assert.equal(await p.locator('.rp-dialog').count(),0);
  assert.equal((await draft(p)).startId,'gwangalli');assert.deepEqual((await draft(p)).stopIds,original.stopIds);
  assert.equal(await p.locator('.spot-pin.start').count(),startCount);assert.equal(await tip.locator('.spot-route-add').count(),0);
  assert.equal(await tip.locator('.spot-route-state').count(),0);
  if(width<=800)await p.locator('#rp-tab-route').click();
  await p.locator('[data-rp-action=undo]').click();await settle(p);assert.equal((await draft(p)).startId,'sokcho');
  assert.equal(await p.locator('.spot-pin.start').count(),startCount);assert.deepEqual(p.errors,[]);await p.close();
 }
});

test('pin controls save and restore, footer tools stay side by side, and reset offers the right choices',async()=>{
 for(const width of [1440,390]){
  const p=await page(width,844);await open(p,'logged-in-no-application');await start(p);await addFirstRecommendation(p);await addFirstRecommendation(p);if(width<=800)await p.locator('#rp-tab-route').click();
  const chosen=(await draft(p)).stopIds[0],row=p.locator('[data-waypoint="'+chosen+'"]'),pin=row.locator('.rp-pin'),remove=row.locator('.rp-remove');assert.equal(await p.locator('.rp-pin').count(),2);assert.equal(await p.locator('.rp-point-number.start,.rp-point-number.finish').count(),2);
  const a=await remove.boundingBox(),b=await pin.boundingBox();assert.ok(a.y+a.height<=b.y+.5&&Math.abs(a.x-b.x)<1);const touchSize=width<=800?44:32;assert.ok(a.width>=touchSize&&a.height>=touchSize&&b.width>=touchSize&&b.height>=touchSize);
  await pin.click();assert.equal(await pin.getAttribute('aria-pressed'),'true');assert.deepEqual((await draft(p)).pinnedStopIds,[chosen]);
  const marker=p.locator('.spot-pin.is-route-pinned');assert.equal(await marker.locator('.spot-pin-lock').count(),1);assert.match(await marker.getAttribute('aria-label'),/핀고정/);
  const beforeStyle=await marker.locator('span').evaluate(e=>{const s=getComputedStyle(e);return {background:s.backgroundColor,radius:s.borderRadius};});await marker.click();
  assert.deepEqual(await marker.locator('span').evaluate(e=>{const s=getComputedStyle(e);return {background:s.backgroundColor,radius:s.borderRadius};}),beforeStyle);assert.equal(await marker.locator('span').evaluate(e=>getComputedStyle(e).outlineStyle),'solid');assert.equal(await row.locator('.rp-point-number').evaluate(e=>getComputedStyle(e).backgroundColor),beforeStyle.background);
  assert.equal(await p.locator('.leaflet-tooltip .spot-mini-number.is-route-pinned').count(),1);assert.equal(await p.locator('.leaflet-tooltip .spot-mini-pin').count(),1);assert.equal(await p.locator('.spot-route-add:visible').count(),0);
  await save(p,'핀고정 경로');const identity=await draft(p);
  await p.reload();await p.locator('.route-planner:not([hidden])').waitFor();await settle(p);if(width<=800)await p.locator('#rp-tab-route').click();assert.deepEqual((await draft(p)).pinnedStopIds,[chosen]);
  await autoFill(p);let before=await draft(p);assert.equal(before.stopIds.length,10);assert.ok(before.stopIds.includes(chosen));
  const rebuild=await p.locator('[data-rp-action=rebuild]').boundingBox(),optimize=await p.locator('[data-rp-action=optimize]').boundingBox();assert.ok(Math.abs(rebuild.y-optimize.y)<1&&rebuild.x+rebuild.width<=optimize.x);
  await tool(p,'optimize');await settle(p);assert.deepEqual([...(await draft(p)).stopIds].sort(),[...before.stopIds].sort());before=await draft(p);
  await p.locator('[data-rp-action=reset-spots]').click();assert.deepEqual(await p.locator('.rp-reset-actions button').allTextContents(),['취소','핀고정 제외','전부 초기화']);await p.locator('.rp-reset-actions [data-cancel]').click();assert.deepEqual(await draft(p),before);
  await p.locator('[data-rp-action=reset-spots]').click();await p.locator('[data-reset=keep]').click();await settle(p);assert.deepEqual((await draft(p)).stopIds,[chosen]);assert.deepEqual((await draft(p)).pinnedStopIds,[chosen]);assert.equal((await draft(p)).startId,identity.startId);assert.equal((await draft(p)).finishId,identity.finishId);assert.equal((await draft(p)).id,identity.id);
  await p.locator('[data-rp-action=undo]').click();await settle(p);assert.deepEqual((await draft(p)).stopIds,before.stopIds);assert.deepEqual((await draft(p)).pinnedStopIds,[chosen]);
  await p.locator('[data-rp-action=reset-spots]').click();await p.locator('[data-reset=all]').click();await settle(p);assert.deepEqual((await draft(p)).stopIds,[]);assert.deepEqual((await draft(p)).pinnedStopIds,[]);await p.locator('[data-rp-action=undo]').click();await settle(p);
  await rowAction(p,chosen,'pin');assert.deepEqual((await draft(p)).pinnedStopIds,[]);await p.locator('[data-rp-action=reset-spots]').click();assert.deepEqual(await p.locator('.rp-reset-actions button').allTextContents(),['취소','초기화']);await p.locator('[data-reset=all]').click();await settle(p);assert.deepEqual((await draft(p)).stopIds,[]);assert.deepEqual(p.errors,[]);await p.close();
 }
});
test('pin changes and reset confirmations invalidate a late reconfiguration without changing its route',async()=>{
 const p=await page();await open(p);await start(p);await autoFill(p);const original=await draft(p),id=original.stopIds[0];await p.evaluate(()=>window.__roadDelay=500);await p.locator('[data-rp-action=rebuild]').click();await rowAction(p,id,'pin');await p.waitForTimeout(600);assert.deepEqual((await draft(p)).stopIds,original.stopIds);assert.deepEqual((await draft(p)).pinnedStopIds,[id]);
 await p.locator('[data-rp-action=rebuild]').click();await p.locator('[data-rp-action=reset-spots]').click();await p.locator('[data-cancel]').click();await p.waitForTimeout(600);assert.deepEqual((await draft(p)).stopIds,original.stopIds);assert.deepEqual((await draft(p)).pinnedStopIds,[id]);assert.deepEqual(p.errors,[]);await p.close();
});

test('operator sunrise defaults, live schedule warnings and typed times survive start changes and reload',async()=>{
 for(const width of [1440,390]){
  const p=await page(width,844);await p.route('**/api/participate/context',async route=>{const response=await route.fetch(),body=await response.json(),catalog=require('../../web/app/spot-catalog'),e=body.event;e.startLocationIds=['gangneung','sokcho','gwangalli'];e.sunlight={eventId:e.id,date:'2027-06-14',timezone:e.timezone,configVersion:e.configVersion,verification:'REVIEWED',sourceUrl:'https://astro.kasi.re.kr/kor/life/pageView/9',calculationVersion:'operator-fixture',starts:catalog.filter(p=>p.kind==='start').map(p=>({...p,locationId:p.id,sunriseAt:'2027-06-13T21:'+({gangneung:'15',sokcho:'20'}[p.id]||'25')+':00.000Z'})),finish:{...catalog.find(p=>p.kind==='finish'),locationId:'daecheon',sunsetAt:'2027-06-14T11:00:00.000Z'}};await route.fulfill({response,json:body});});
  await open(p);assert.equal(await p.locator('[name=departureTime]').inputValue(),'06:15');assert.equal(await p.locator('[name=breakMinutes]').inputValue(),'120');assert.equal(await p.locator('.rp-more-menu,[data-rp-action=schedule]').count(),0);await start(p,'sokcho');assert.equal(await p.locator('[name=departureTime]').inputValue(),'06:20');
  const initial=await p.locator('.rp-route-summary').textContent();assert.match(initial,/(오전|오후).*도착 예상/);await p.locator('[name=breakMinutes]').fill('');await p.locator('[name=breakMinutes]').pressSequentially('90');assert.equal(await p.locator('[name=breakMinutes]').inputValue(),'90');assert.equal(await p.locator('[name=breakMinutes]').evaluate(e=>e===document.activeElement),true);assert.notEqual(await p.locator('.rp-route-summary').textContent(),initial);
  await p.locator('[data-step="15"]').click();assert.equal(await p.locator('[name=breakMinutes]').inputValue(),'105');await p.locator('[data-step="-15"]').click();assert.equal(await p.locator('[name=breakMinutes]').inputValue(),'90');await p.locator('[name=breakMinutes]').fill('0');await p.locator('[data-step="-15"]').click();assert.equal(await p.locator('[name=breakMinutes]').inputValue(),'0');
  await p.locator('[name=breakMinutes]').fill('1500');assert.match(await p.locator('.rp-event-context').textContent(),/0~1440/);assert.equal(await p.locator('[data-rp-action=autofill]').isDisabled(),true);await p.locator('[name=breakMinutes]').fill('90');await p.locator('[name=departureTime]').fill('15:00');assert.match(await p.locator('.rp-schedule-warning').textContent(),/늦습니다/);
  await p.locator('[name=departureTime]').fill('08:00');await chooseStart(p,'gwangalli');await settle(p);assert.equal(await p.locator('[name=departureTime]').inputValue(),'08:00');await p.reload();await p.locator('.route-planner:not([hidden])').waitFor();await settle(p);assert.equal(await p.locator('[name=departureTime]').inputValue(),'08:00');assert.equal(await p.locator('[name=breakMinutes]').inputValue(),'90');assert.deepEqual(p.errors,[]);await p.close();
 }
});
test('schedule toolbar wraps to two rows without overlap and keeps the map below it',async()=>{
 const p=await page();await open(p);await start(p);
 for(const width of [360,390,430,768,801,900,1280,1440,1920]){await p.setViewportSize({width,height:844});await p.waitForTimeout(200);const header=await p.locator('.rp-header').boundingBox(),fields=await p.locator('.rp-schedule-fields').boundingBox();assert.ok(header.height<=140,JSON.stringify({width,header}));assert.ok(fields.x>=header.x&&fields.x+fields.width<=header.x+header.width);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.equal(await p.locator('[data-schedule-input]').count(),2);const labels=await p.locator('[data-schedule-input]').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom};}));assert.ok(labels[0].right<=labels[1].left||labels[0].bottom<=labels[1].top,JSON.stringify({width,labels}));if(width>800){const map=await p.locator('.spot-map').boundingBox();assert.ok(map.y>=header.y+header.height+6,JSON.stringify({width,map,header}));}}
 assert.deepEqual(p.errors,[]);await p.close();
});


test('saved management prioritizes names and shows the exact event shortage without duplicate editor controls',async()=>{
 const p=await page(390,844);await p.route('**/api/participate/context',async route=>{const response=await route.fetch(),body=await response.json();body.event.minimumSpotCheckins=12;await route.fulfill({response,json:body});});await open(p,'logged-in-no-application');await start(p);await autoFill(p);await save(p,'완성된 동선');const complete=await draft(p);await savedTab(p);await p.locator('.rp-saved [data-rp-action=duplicate]').click();await settle(p);await p.locator('#rp-tab-route').click();await rowAction(p,complete.stopIds[0],'remove');await settle(p);await rowAction(p,complete.stopIds[1],'remove');await settle(p);await save(p,'조금 더 고를 동선');await savedTab(p);
 assert.equal(await p.locator('.rp-saved').count(),2);const partial=p.locator('.rp-saved').filter({has:p.getByRole('heading',{name:'조금 더 고를 동선',exact:true})});assert.match(await partial.locator('.rp-route-count').textContent(),/10 스팟 경유.*스팟 2개 부족/);assert.equal(await partial.locator('.rp-stop-shortage').evaluate(e=>getComputedStyle(e).color),'rgb(165, 73, 46)');assert.equal(await p.locator('.rp-saved').filter({has:p.getByRole('heading',{name:'완성된 동선',exact:true})}).locator('.rp-stop-shortage').count(),0);
 assert.doesNotMatch(await p.locator('dialog').textContent(),/최소 경유 수 충족|경유 10곳|계산 전 ·/);assert.equal(await p.locator('[data-rp-action=rename],.rp-managed-current').count(),0);assert.equal(await p.locator('dialog [data-rp-action=new]').count(),1);const layout=await partial.evaluate(e=>{const r=s=>e.querySelector(s).getBoundingClientRect();return r('h3').bottom<=r('.rp-route-count').top&&r('.rp-route-count').bottom<=r('.rp-saved-ends').top&&r('.rp-saved-ends').bottom<=r('.rp-saved-metrics').top&&r('.rp-saved-metrics').bottom<=r('.rp-saved-actions').top;});assert.equal(layout,true);await capture(p,'compact-route-management');assert.deepEqual(p.errors,[]);await p.close();
});


test('drag insertion opens the exact gap, supports endpoints and undo, and cancels without reordering',async()=>{
 const p=await page();await open(p);await start(p,'gangneung');for(let i=0;i<3;i++)await addFirstRecommendation(p);const before=await draft(p);await rowAction(p,before.stopIds[2],'pin');const initial=await draft(p),first=p.locator('[data-waypoint="'+before.stopIds[0]+'"]'),last=p.locator('[data-waypoint="'+before.stopIds[2]+'"]'),transfer=await p.evaluateHandle(()=>new DataTransfer());
 await capture(p,'drag-list-idle');const original=await first.boundingBox();await last.dispatchEvent('dragstart',{dataTransfer:transfer});await first.dispatchEvent('dragover',{dataTransfer:transfer,clientY:original.y+5});const slot=p.locator('.rp-drop-slot');await slot.waitFor();await p.waitForTimeout(140);assert.equal(await slot.textContent(),'여기에 놓기');assert.ok((await first.boundingBox()).y-original.y>=30);assert.equal(await slot.evaluate(e=>e.nextElementSibling.dataset.waypoint),before.stopIds[0]);await capture(p,'drag-gap-before');await slot.dispatchEvent('drop',{dataTransfer:transfer});await settle(p);assert.deepEqual((await draft(p)).stopIds,[before.stopIds[2],before.stopIds[0],before.stopIds[1]]);assert.deepEqual((await draft(p)).pinnedStopIds,initial.pinnedStopIds);assert.equal(await slot.count(),0);
 await p.locator('[data-rp-action=undo]').click();await settle(p);assert.deepEqual((await draft(p)).stopIds,before.stopIds);const firstAgain=p.locator('[data-waypoint="'+before.stopIds[0]+'"]'),finish=p.locator('[data-waypoint="'+before.finishId+'"]'),end=await finish.boundingBox();await firstAgain.dispatchEvent('dragstart',{dataTransfer:transfer});await finish.dispatchEvent('dragover',{dataTransfer:transfer,clientY:end.y+5});await slot.waitFor();assert.equal(await slot.evaluate(e=>e.nextElementSibling.dataset.waypoint),before.finishId);await slot.dispatchEvent('drop',{dataTransfer:transfer});await settle(p);assert.deepEqual((await draft(p)).stopIds,[before.stopIds[1],before.stopIds[2],before.stopIds[0]]);
 const current=await draft(p),row=p.locator('[data-waypoint="'+current.stopIds[2]+'"]'),head=p.locator('[data-waypoint="'+current.stopIds[0]+'"]'),box=await head.boundingBox();await row.dispatchEvent('dragstart',{dataTransfer:transfer});await head.dispatchEvent('dragover',{dataTransfer:transfer,clientY:box.y+5});await slot.waitFor();await row.dispatchEvent('dragend',{dataTransfer:transfer});assert.equal(await slot.count(),0);assert.deepEqual((await draft(p)).stopIds,current.stopIds);assert.deepEqual(p.errors,[]);await p.close();
});
test('untitled new routes receive unique numbered names and the tenth slot blocks only new saves',async()=>{
 const p=await page();await open(p,'logged-in-no-application');for(let i=1;i<=10;i++){await p.locator('[data-rp-action=save]').click();await p.waitForFunction(()=>JSON.parse(sessionStorage.getItem('sskr.route-editor')).plan.id);assert.equal((await draft(p)).title,'루트 '+String(i).padStart(2,'0'));if(i<10){await savedTab(p);await p.locator('[data-rp-action=new]').click();}}
 await savedTab(p);assert.equal(await p.locator('.rp-saved').count(),10);assert.ok((await p.locator('.rp-management-tools').textContent()).includes('10 / 10'));await p.locator('[data-rp-action=new]').click();await p.locator('[data-rp-action=save]').click();assert.equal((await draft(p)).id,null);assert.equal((await draft(p)).title,'');assert.match(await p.locator('.rp-notice').textContent(),/최대 10개/);await savedTab(p);await p.locator('.rp-saved [data-rp-action=load]').first().click();const saved=await draft(p);await p.locator('[data-rp-action=save]').click();assert.equal((await draft(p)).id,saved.id);await savedTab(p);assert.equal(await p.locator('.rp-saved').count(),10);assert.deepEqual(p.errors,[]);await p.close();
});
test('route count and twelve-hour arrival share a summary while margin and map-count clutter stay hidden',async()=>{
 const p=await page();await open(p);await start(p,'gangneung');await addFirstRecommendation(p);assert.equal(await p.locator('.spot-list-head').isVisible(),false);assert.equal(await p.locator('.rp-schedule-within').count(),0);assert.doesNotMatch(await p.locator('.rp-route-pane').textContent(),/마감까지.*여유/);assert.match(await p.locator('.rp-route-summary .rp-route-count').textContent(),/1 스팟 경유.*· (오전|오후) [0-9]{1,2}:[0-9]{2} 도착 예상/);
 for(const width of [360,390,430,768,801,900,1280,1440,1920]){await p.setViewportSize({width,height:900});if(width<=800)await p.locator('#rp-tab-route').click();await p.waitForTimeout(120);const layout=await p.locator('.rp-route-summary').evaluate(e=>{const a=e.querySelector('.rp-route-count>span').getBoundingClientRect(),b=e.querySelector('.rp-route-arrival').getBoundingClientRect();return {sameLine:Math.abs(a.y-b.y)<2,overflow:document.documentElement.scrollWidth>innerWidth};});assert.equal(layout.overflow,false);if(width>=900||width<=800)assert.equal(layout.sameLine,true,JSON.stringify({width,...layout}));}
 await p.locator('#rp-departure-time').fill('05:00');assert.match(await p.locator('.rp-event-context').textContent(),/출발 시각을/);assert.match(await p.locator('.rp-route-summary').textContent(),/(오전|오후).*도착 예상/);assert.deepEqual(p.errors,[]);await p.close();
});


test('map selection reveals its route row and blank or outside clicks clear all selection without changing the draft',async()=>{
 const p=await page(1440,900);await open(p);await start(p,'gangneung');await autoFill(p);const original=await draft(p),catalog=require('../../web/app/spot-catalog'),id=original.stopIds[0],name=catalog.find(x=>x.id===id).name;
 await p.locator('[data-scroll=route]').evaluate(e=>e.scrollTop=e.scrollHeight);
 await p.locator('.spot-pin[title="'+name+'"]').click();await p.waitForFunction(id=>document.querySelector('[data-waypoint="'+id+'"]')?.classList.contains('is-active'),id);await p.waitForTimeout(150);
 const row=await p.locator('[data-waypoint="'+id+'"]').boundingBox(),scroll=await p.locator('[data-scroll=route]').boundingBox();assert.ok(row.y>=scroll.y-1&&row.y+row.height<=scroll.y+scroll.height+1);await capture(p,'selected-route-row');
 const mapBox=await p.locator('.spot-map').boundingBox();await p.locator('.spot-map').click({position:{x:10,y:mapBox.height*.5}});assert.equal(await p.locator('.spot-pin.is-selected,.spot-pin.is-route-active,.rp-waypoint.is-active').count(),0);assert.equal(await p.evaluate(()=>JSON.parse(sessionStorage.getItem('sskr.route-editor')).selectedId),null);assert.deepEqual(await draft(p),original);
 await p.locator('.spot-pin[title="'+name+'"]').click();await p.locator('#rp-route-title').click();assert.equal(await p.locator('.spot-pin.is-selected,.spot-pin.is-route-active,.rp-waypoint.is-active').count(),0);assert.deepEqual(await draft(p),original);
 await p.reload();await p.locator('.route-planner:not([hidden])').waitFor();await settle(p);assert.equal(await p.locator('.spot-pin.is-selected,.spot-pin.is-route-active,.rp-waypoint.is-active').count(),0);
 await p.locator('.spot-pin[title="'+name+'"]').click();await p.locator('[data-rp-action=optimize]').click();await settle(p);assert.equal(await p.locator('.spot-pin.is-selected,.spot-pin.is-route-active,.rp-waypoint.is-active').count(),0);
 const next=await draft(p),nextName=catalog.find(x=>x.id===next.stopIds[0]).name;await p.locator('.spot-pin[title="'+nextName+'"]').click();await p.evaluate(()=>window.__roadFailure=true);await p.locator('[data-rp-action=rebuild]').click();await settle(p);assert.equal(await p.locator('.spot-pin.is-selected,.spot-pin.is-route-active,.rp-waypoint.is-active').count(),0);assert.deepEqual(await draft(p),next);assert.deepEqual(p.errors,[]);await p.close();
});

test('mobile map selection reveals the included stop and photo details still open without hiding the place',async()=>{
 const p=await page(390,844,{isMobile:true,hasTouch:true});await open(p);await start(p,'gangneung');await autoFill(p);const original=await draft(p),catalog=require('../../web/app/spot-catalog'),id=original.stopIds[2],name=catalog.find(x=>x.id===id).name;
 await p.locator('#rp-tab-search').click();await p.locator('.spot-pin[title="'+name+'"]').click();await p.waitForTimeout(150);assert.equal(await p.locator('#rp-tab-route').getAttribute('aria-selected'),'true');const row=p.locator('[data-waypoint="'+id+'"]');assert.ok(await row.isVisible());assert.equal(await row.getAttribute('class').then(c=>c.includes('is-active')),true);
 const a=await row.boundingBox(),sticky=await p.locator('.rp-mobile-sticky').boundingBox();assert.ok(a.y>=sticky.y+sticky.height-1&&a.y+a.height<=844+1);if(process.env.SSKR_QA_OUTPUT)await p.screenshot({path:path.join(process.env.SSKR_QA_OUTPUT,'mobile-selected-route-viewport.png')});await capture(p,'mobile-selected-route-row');
 await p.locator('.spot-route-tooltip .spot-photo-card').filter({hasText:name}).click();assert.equal(await p.locator('#rp-tab-search').getAttribute('aria-selected'),'true');assert.match(await p.locator('.rp-place-detail h3').textContent(),new RegExp(name));assert.deepEqual(await draft(p),original);assert.deepEqual(p.errors,[]);await p.close();
});

test('three distant real-road pins rebuild to ten stops with an honest late-arrival warning instead of a false shortage',async()=>{
 const p=await page(1440,900);await p.unroute('**/web/app/route-provider.js*');await open(p);await start(p,'uljin');
 const stops=['sutasa','anseong-cheongryongsa','andong-market','mad-brown','seomun-market','yeongamsa-site','suncheon-bay','geumseonggwan','mireuksa','seonyudo','borimsa','cheongpung'],pins=['sutasa','anseong-cheongryongsa','yeongamsa-site'];await seedPlan(p,stops);for(const id of pins)await rowAction(p,id,'pin');const before=await draft(p);assert.equal(before.stopIds.length,12);
 assert.equal(await p.locator('.spot-pin.is-route-pinned').count(),3);const pinned=p.locator('.spot-pin.is-route-pinned').first(),plain=p.locator('.spot-pin.is-route-stop.spot:not(.is-route-pinned)').first();assert.match(await pinned.getAttribute('aria-label'),/핀고정/);assert.notEqual(await pinned.locator('span').evaluate(e=>getComputedStyle(e).backgroundColor),await plain.locator('span').evaluate(e=>getComputedStyle(e).backgroundColor));
 await p.locator('[data-rp-action=rebuild]').click();await settle(p);const next=await draft(p);assert.equal(next.stopIds.length,10);assert.deepEqual(next.stopIds.filter(id=>pins.includes(id)),pins);assert.ok(next.stopIds.every(id=>pins.includes(id)||!before.stopIds.includes(id)));assert.equal(await p.locator('.rp-operation .rp-error,.rp-stop-shortage').count(),0);assert.match(await p.locator('.rp-event-context').textContent(),/도착 마감.*늦/);assert.equal(await p.locator('.spot-pin.is-route-pinned').count(),3);assert.equal(await p.locator('.spot-pin.is-selected,.rp-waypoint.is-active').count(),0);await capture(p,'three-pins-real-roads');
 await p.locator('[data-rp-action=undo]').click();await settle(p);assert.deepEqual((await draft(p)).stopIds,before.stopIds);assert.deepEqual((await draft(p)).pinnedStopIds,pins);assert.deepEqual(p.errors,[]);await p.close();
});


test('a pending addition does not resurrect or replace the selection after an outside deselect',async()=>{
 const p=await page();await open(p);await start(p);await p.locator('.rp-next .rp-place-view').first().click();const candidate=await p.evaluate(()=>JSON.parse(sessionStorage.getItem('sskr.route-editor')).selectedId);await p.evaluate(()=>window.__roadDelay=550);await p.locator('.spot-route-add:visible').click();await p.locator('#rp-route-title').click();await settle(p);assert.ok((await draft(p)).stopIds.includes(candidate));assert.equal(await p.locator('.spot-pin.is-selected,.spot-pin.is-route-active,.rp-waypoint.is-active').count(),0);assert.equal(await p.evaluate(()=>JSON.parse(sessionStorage.getItem('sskr.route-editor')).selectedId),null);assert.deepEqual(p.errors,[]);await p.close();
});
