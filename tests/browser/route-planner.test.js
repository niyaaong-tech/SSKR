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
async function settle(p){await p.waitForFunction(()=>![...document.querySelectorAll('.rp-operation')].some(e=>/연결 중|만드는 중|준비하고/.test(e.textContent)));}
async function capture(p,name){if(!process.env.SSKR_QA_OUTPUT)return;fs.mkdirSync(process.env.SSKR_QA_OUTPUT,{recursive:true});await p.locator('.spot-planning-area').screenshot({path:path.join(process.env.SSKR_QA_OUTPUT,name+'.png')});}

async function chooseStart(p,id='songjeong'){if(!await p.locator('[data-rp-action="change-start"]').isVisible())await p.locator('#rp-tab-route').click();await p.locator('[data-rp-action="change-start"]').click();await p.locator('[data-start-id="'+id+'"]').click();}
async function start(p,id='songjeong'){await chooseStart(p,id);await settle(p);if(await p.locator('#rp-tab-search').isVisible())await p.locator('#rp-tab-search').click();await p.waitForSelector('.rp-next .rp-place-view');}
async function addFirstRecommendation(p){await p.locator('.rp-next .rp-place-view').first().click();await p.locator('.leaflet-tooltip .spot-route-add:visible').last().click();await settle(p);}
async function save(p,title){if(title&&(await draft(p)).title){await p.locator('[data-rp-action=manage]').click();await p.locator('[data-rp-action=rename]').click();await p.locator('#rp-title').fill(title);await p.locator('[data-save-confirm]').click();}await p.locator('[data-rp-action=save]').click();if(await p.locator('#rp-title').count()){await p.locator('#rp-title').fill(title||'테스트 경로');await p.locator('[data-save-confirm]').click();}await p.waitForTimeout(100);}
async function savedTab(p){await p.locator('[data-rp-action=manage]').click();await p.waitForSelector('dialog[data-management]');}
async function tool(p,action){await p.locator('.rp-more-menu summary').click();await p.locator('[data-rp-action="'+action+'"]').click();}
async function rowAction(p,id,action){const row=p.locator('[data-waypoint="'+id+'"]');await row.locator('.rp-row-menu summary').click();await row.locator('[data-rp-action="'+action+'"]').click();await settle(p);}
async function seedPlan(p,stopIds){await p.addInitScript(()=>{const seeded=sessionStorage.getItem('qa-plan-seed');if(!seeded)return;sessionStorage.removeItem('qa-plan-seed');const state=JSON.parse(sessionStorage.getItem('sskr.route-editor'));state.plan.stopIds=JSON.parse(seeded);state.anchorId=state.plan.startId;state.selectedId=null;sessionStorage.setItem('sskr.route-editor',JSON.stringify(state));});await p.evaluate(ids=>sessionStorage.setItem('qa-plan-seed',JSON.stringify(ids)),stopIds);await p.reload();await p.waitForSelector('.route-planner:not([hidden])');await settle(p);assert.deepEqual((await draft(p)).stopIds,stopIds);}
async function autoFill(p){await p.locator('[data-rp-action=autofill]:visible').click();await settle(p);}

test('entry uses one finder, automatic gaps, map-only addition, and a separate management dialog',async()=>{
 const p=await page();await open(p);assert.equal(await p.locator('#rp-tab-places,#rp-tab-saved,#rp-insertion,.rp-sheet-toggle,.rp-expand').count(),0);assert.equal(await p.locator('[data-rp-action=save]').count(),1);assert.equal(await p.locator('[data-rp-action=autofill]').isDisabled(),true);
 const name=await p.locator('.rp-place-view strong').first().textContent();assert.doesNotMatch(name,/·/);await p.locator('.rp-place-view').first().click();assert.equal(await p.locator('.rp-place-detail [data-rp-action=add]').count(),0);await p.locator('.spot-route-add:visible').last().click();await settle(p);assert.ok((await draft(p)).startId);assert.equal(await p.locator('.rp-place-add').count(),0);await addFirstRecommendation(p);assert.equal((await draft(p)).stopIds.length,1);assert.deepEqual(p.errors,[]);await p.close();
});
test('desktop widths cap sidebars, leave remaining width to the map, and never overflow',async()=>{
 const p=await page(1180,757);await open(p);await start(p);
 for(const width of [801,900,1180,1280,1533,1920]){await p.setViewportSize({width,height:757});await p.waitForTimeout(160);const route=await p.locator('.rp-route-pane').boundingBox(),map=await p.locator('.spot-map-host').boundingBox(),right=await p.locator('.rp-discovery-pane').boundingBox();assert.ok(route.x+route.width<=map.x+1&&map.x+map.width<=right.x+1,JSON.stringify({width,route,map,right}));assert.ok(route.width<=260&&right.width<=300);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.equal(await p.locator('.spot-search input').isVisible(),true);assert.equal(await p.locator('[data-rp-action=save]').count(),1);}
 await capture(p,'route-desktop-panels');assert.deepEqual(p.errors,[]);await p.close();
});
test('automatic insertion displays the exact delta and preserves existing order across candidate clicks',async()=>{
 const p=await page();await open(p);await start(p,'gangneung');await seedPlan(p,['gangneung-market','byeongbangchi-skywalk','the-road-1423']);
 for(let i=0;i<3;i++){const before=await draft(p),id=await p.locator('.rp-next .rp-place').first().getAttribute('data-place-id');const expected=await p.evaluate(({before,id})=>{const provider=SSKR_ROUTE_PROVIDER.create();return {gap:SSKR_ROUTE_PLAN.bestInsertion(before,id,SSKR_SPOT_CATALOG,provider),stats:SSKR_ROUTE_PLAN.status(before,SSKR_SPOT_CATALOG,provider)};},{before,id});await p.locator('.rp-next .rp-place-view').first().click();assert.deepEqual((await draft(p)).stopIds,before.stopIds);assert.match(await p.locator('.rp-insertion-preview').textContent(),/추가 예정/);await p.locator('.spot-route-add:visible').last().click();await settle(p);const after=await draft(p),stops=before.stopIds.slice();stops.splice(expected.gap.at,0,id);assert.deepEqual(after.stopIds,stops);const stats=await p.evaluate(plan=>SSKR_ROUTE_PLAN.status(plan,SSKR_SPOT_CATALOG,SSKR_ROUTE_PROVIDER.create()),after);assert.ok(Math.abs(stats.distanceMeters-expected.stats.distanceMeters-expected.gap.addedDistanceMeters)<.0001);assert.ok(Math.abs(stats.durationSeconds-expected.stats.durationSeconds-expected.gap.addedDurationSeconds)<.0001);}
 assert.deepEqual(p.errors,[]);await p.close();
});
test('auto-fill applies atomically, preserves manual stops, and one undo restores the original',async()=>{
 const p=await page();await open(p);await start(p);await addFirstRecommendation(p);const before=await draft(p);await p.evaluate(()=>window.__roadDelay=350);await p.locator('[data-rp-action=autofill]').click();assert.deepEqual((await draft(p)).stopIds,before.stopIds);assert.match(await p.locator('.rp-operation').textContent(),/만드는 중/);await settle(p);const after=await draft(p);assert.equal(after.stopIds.length,10);assert.deepEqual(after.stopIds.filter(id=>before.stopIds.includes(id)),before.stopIds);assert.equal(await p.locator('.rp-preview,[data-rp-action=apply-preview]').count(),0);assert.equal(await p.locator('.rp-waypoint').count(),12);await p.locator('[data-rp-action=undo]').click();await settle(p);assert.deepEqual((await draft(p)).stopIds,before.stopIds);await p.locator('[data-rp-action=undo]').click();await settle(p);assert.equal((await draft(p)).stopIds.length,0);assert.deepEqual(p.errors,[]);await p.close();
});
test('failed and invalid generation roads preserve draft, visible roads and undo history with persistent retry',async()=>{
 const p=await page();await open(p);await start(p);const before=await draft(p),line=await p.evaluate(()=>{const a=[];__map.eachLayer(l=>{if(l instanceof L.Polyline&&!(l instanceof L.Polygon))a.push(l.getLatLngs());});return a;});
 for(const flag of ['__roadFailure','__invalidRoads','__invalidCoordinates']){await p.evaluate(flag=>window[flag]=true,flag);await autoFill(p);assert.deepEqual((await draft(p)).stopIds,before.stopIds);assert.ok(await p.locator('[data-rp-action=retry-generation]').isVisible());assert.deepEqual(await p.evaluate(()=>{const a=[];__map.eachLayer(l=>{if(l instanceof L.Polyline&&!(l instanceof L.Polygon))a.push(l.getLatLngs());});return a;}),line);await p.evaluate(flag=>window[flag]=false,flag);}
 await p.locator('[data-rp-action=retry-generation]').click();await settle(p);assert.equal((await draft(p)).stopIds.length,10);await p.locator('[data-rp-action=undo]').click();await settle(p);assert.deepEqual((await draft(p)).stopIds,before.stopIds);assert.deepEqual(p.errors,[]);await p.close();
});
test('time-limited completion never partially applies and late arrival warning stays visible',async()=>{
 const p=await page();await open(p);await start(p);const ids=await p.evaluate(()=>SSKR_ROUTE_PLAN.autoFill(JSON.parse(sessionStorage.getItem('sskr.route-editor')).plan,SSKR_SPOT_CATALOG,SSKR_ROUTE_PROVIDER.create()).stopIds.slice(0,9));await seedPlan(p,ids);await tool(p,'schedule');await p.locator('input[name=departureTime]').fill('14:00');await p.locator('input[name=breakMinutes]').fill('180');await p.locator('[data-schedule] button[type=submit]').click();await autoFill(p);assert.deepEqual((await draft(p)).stopIds,ids);assert.match(await p.locator('.rp-operation').textContent(),/일정/);assert.match(await p.locator('.rp-schedule-warning').textContent(),/다음 날|늦습니다/);assert.deepEqual(p.errors,[]);await p.close();
});
test('editing, undo and leaving cancel late auto-fill without a stale commit or toast',async()=>{
 const p=await page();await open(p);await start(p);await addFirstRecommendation(p);const id=(await draft(p)).stopIds[0];await p.evaluate(()=>window.__roadDelay=650);await p.locator('[data-rp-action=autofill]').click();await rowAction(p,id,'remove');await p.waitForTimeout(750);assert.deepEqual((await draft(p)).stopIds,[]);assert.doesNotMatch(await p.locator('.rp-notice').textContent(),/자동 완성을 적용/);
 await p.locator('[data-rp-action=autofill]').click();await p.locator('[data-rp-action=undo]').click();await settle(p);await p.waitForTimeout(750);assert.deepEqual((await draft(p)).stopIds,[id]);await p.locator('[data-rp-action=autofill]').click();await p.locator('[data-spot-mode=browse]').click();await p.waitForTimeout(750);assert.deepEqual((await draft(p)).stopIds,[id]);assert.deepEqual(p.errors,[]);await p.close();
});
test('new and load transitions cancel generation and a later result cannot overwrite a different route',async()=>{
 const p=await page();await open(p,'logged-in-no-application');await start(p);await save(p,'저장 경로');const stored=await draft(p);await p.evaluate(()=>window.__roadDelay=500);await p.locator('[data-rp-action=autofill]').click();await savedTab(p);await p.locator('[data-rp-action=new]').click();assert.equal((await draft(p)).startId,null);await p.waitForTimeout(600);assert.equal((await draft(p)).startId,null);await savedTab(p);await p.locator('[data-rp-action=load]').click();await settle(p);assert.equal((await draft(p)).id,stored.id);assert.deepEqual((await draft(p)).stopIds,stored.stopIds);assert.deepEqual(p.errors,[]);await p.close();
});
test('another combination uses the original manual baseline rather than accumulating generated stops',async()=>{
 const p=await page();await open(p);await start(p);await addFirstRecommendation(p);const original=await draft(p);await autoFill(p);for(let i=0;i<2;i++){await tool(p,'another');await settle(p);const current=await draft(p);assert.equal(current.stopIds.length,10);assert.ok(current.stopIds.includes(original.stopIds[0]));assert.equal(new Set(current.stopIds).size,10);}await rowAction(p,(await draft(p)).stopIds[0],'remove');await p.locator('.rp-more-menu summary').click();assert.equal(await p.locator('[data-rp-action=another]').isDisabled(),true);assert.deepEqual(p.errors,[]);await p.close();
});
test('route optimization immediately shortens the order while preserving endpoints and place set',async()=>{
 const p=await page();await open(p);await start(p,'gangneung');await seedPlan(p,['the-road-1423','gangneung-market','byeongbangchi-skywalk']);const before=await draft(p),stats=await p.evaluate(plan=>SSKR_ROUTE_PLAN.status(plan,SSKR_SPOT_CATALOG,SSKR_ROUTE_PROVIDER.create()),before);await tool(p,'optimize');await settle(p);const after=await draft(p),next=await p.evaluate(plan=>SSKR_ROUTE_PLAN.status(plan,SSKR_SPOT_CATALOG,SSKR_ROUTE_PROVIDER.create()),after);assert.ok(next.distanceMeters<stats.distanceMeters);assert.deepEqual([...after.stopIds].sort(),[...before.stopIds].sort());assert.equal(after.startId,before.startId);assert.equal(after.finishId,before.finishId);await p.keyboard.press('Control+z');await settle(p);assert.deepEqual((await draft(p)).stopIds,before.stopIds);assert.deepEqual(p.errors,[]);await p.close();
});
test('no-improvement optimization creates no empty undo entry',async()=>{
 const p=await page();await open(p);await start(p);await addFirstRecommendation(p);await addFirstRecommendation(p);await tool(p,'optimize');await settle(p);const optimized=await draft(p);await tool(p,'optimize');await settle(p);assert.match(await p.locator('.rp-notice').textContent(),/찾지 못/);await p.locator('[data-rp-action=undo]').click();await settle(p);assert.notDeepEqual((await draft(p)).stopIds,optimized.stopIds);assert.deepEqual(p.errors,[]);await p.close();
});
test('new, load and undo restore contents and route ownership without confirmations or recovery menus',async()=>{
 const p=await page();await open(p,'logged-in-no-application');await start(p);await addFirstRecommendation(p);await save(p,'첫 경로');const first=await draft(p);await savedTab(p);await p.locator('[data-rp-action=new]').click();assert.equal(await p.locator('dialog').count(),0);assert.equal((await draft(p)).id,null);await p.locator('[data-rp-action=undo]').click();await settle(p);assert.deepEqual(await draft(p),first);await savedTab(p);await p.locator('[data-rp-action=duplicate]').click();await settle(p);assert.equal((await draft(p)).id,null);await save(p);const second=await draft(p);assert.notEqual(second.id,first.id);await savedTab(p);await p.locator('[data-rp-action=load][data-id="'+first.id+'"]').click();await settle(p);assert.equal((await draft(p)).id,first.id);await p.locator('[data-rp-action=undo]').click();await settle(p);assert.equal((await draft(p)).id,second.id);await save(p);await savedTab(p);assert.equal(await p.locator('.rp-saved').count(),2);assert.deepEqual(p.errors,[]);await p.close();
});
test('first save, undo and resave keep the saved ID while canceling name entry changes nothing',async()=>{
 const p=await page();await open(p,'logged-in-no-application');await start(p);await addFirstRecommendation(p);await p.locator('[data-rp-action=save]').click();await p.locator('#rp-title').fill('취소할 이름');await p.keyboard.press('Escape');assert.equal((await draft(p)).title,'');await save(p,'내 경로');const saved=await draft(p);await savedTab(p);await p.locator('[data-rp-action=rename]').click();await p.locator('#rp-title').fill('변경하지 않음');await p.keyboard.press('Escape');assert.equal((await draft(p)).title,saved.title);assert.equal(await p.locator('[data-rp-action=manage]').evaluate(e=>e===document.activeElement),true);await p.locator('[data-rp-action=undo]').click();await settle(p);assert.equal((await draft(p)).id,saved.id);await save(p);assert.equal((await draft(p)).id,saved.id);await savedTab(p);assert.equal(await p.locator('.rp-saved').count(),1);await p.keyboard.press('Escape');await p.reload();await p.waitForSelector('.route-planner:not([hidden])');await settle(p);assert.equal((await draft(p)).id,saved.id);assert.deepEqual(p.errors,[]);await p.close();
});
test('guest login cancel preserves route and name; only Google can save a nonparticipant draft',async()=>{
 const p=await page();await open(p);await start(p);await save(p,'게스트 경로');await p.waitForSelector('.rp-auth');assert.equal(await p.locator('.rp-auth [data-provider=google]').isEnabled(),true);for(const name of ['naver','kakao','apple'])assert.equal(await p.locator('.rp-auth [data-provider="'+name+'"]').isDisabled(),true);await p.keyboard.press('Escape');assert.equal((await draft(p)).title,'게스트 경로');await save(p);await p.locator('.rp-auth [data-provider=google]').click();await p.waitForFunction(()=>JSON.parse(sessionStorage.getItem('sskr.route-editor')).plan.id);assert.equal((await draft(p)).stopIds.length,0);await savedTab(p);assert.equal(await p.locator('.rp-saved').count(),1);assert.deepEqual(p.errors,[]);await p.close();
});
test('search, category conditions and detail scroll survive return and desktop resizing',async()=>{
 const p=await page(390,844);await open(p);await start(p);await p.locator('.spot-search input').fill('김해');await p.waitForTimeout(250);assert.equal(await p.locator('.rp-place-results').isVisible(),true);await p.locator('.rp-place-view').first().click();await p.locator('[data-rp-action=back-detail]').click();assert.equal(await p.locator('.spot-search input').inputValue(),'김해');await p.locator('[data-action=clear]').click();await p.locator('.rp-filters summary').click();await p.locator('[data-category=nature]').click();assert.ok(await p.locator('.rp-place').count());assert.ok(await p.locator('.rp-place').evaluateAll(es=>es.every(e=>e.querySelector('em').textContent==='자연 · 전망')));await p.locator('#rp-tab-route').click();await p.setViewportSize({width:1440,height:900});await p.waitForTimeout(250);assert.equal(await p.locator('.spot-search input').isVisible(),true);assert.equal(await p.locator('[data-category=nature]').getAttribute('aria-pressed'),'true');assert.deepEqual(p.errors,[]);await p.close();
});
test('event minimum controls completion while help holds the full check-in rule',async()=>{
 const p=await page();await p.route('**/api/participate/context',async route=>{const response=await route.fetch(),body=await response.json();body.event.minimumSpotCheckins=12;await route.fulfill({response,json:body});});await open(p);await start(p);await autoFill(p);assert.equal((await draft(p)).stopIds.length,12);await p.locator('[data-rp-action=help]').click();assert.match(await p.locator('.rp-dialog').textContent(),/경유 12곳.*총 14곳/s);await p.keyboard.press('Escape');assert.equal(await p.locator('[data-rp-action=help]').evaluate(e=>e===document.activeElement),true);assert.deepEqual(p.errors,[]);await p.close();
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
   const top=Math.max(map.y,header.y+header.height),bottom=map.y+map.height;
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


test('short mobile maps keep insertion context, photo and add button clear of controls and the route summary',async()=>{
 for(const [width,height]of [[360,640],[390,664],[430,700]]){
  const p=await page(width,height);await open(p);await start(p);await p.locator('.rp-next .rp-place-view').first().click();await p.waitForTimeout(650);
  const map=await p.locator('.spot-map').boundingBox(),summary=await p.locator('.rp-map-summary').boundingBox(),controls=await p.locator('.spot-map-controls').boundingBox();
  for(const selector of ['.spot-route-add','.spot-route-context','.spot-photo-card']){
   const box=await p.locator('.leaflet-tooltip '+selector+':visible').last().boundingBox();
   assert.ok(box.x>=map.x&&box.x+box.width<=map.x+map.width+1&&box.y>=map.y&&box.y+box.height<=summary.y,JSON.stringify({width,height,box,map,summary}));
   assert.ok(box.x+box.width<=controls.x||box.x>=controls.x+controls.width||box.y+box.height<=controls.y||box.y>=controls.y+controls.height,JSON.stringify({width,height,box,controls}));
  }
  if(width===390)await capture(p,'mobile-insertion-card');assert.deepEqual(p.errors,[]);await p.close();
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



test('start changes explain the impact before applying and retain the chosen stops',async()=>{
 const p=await page();await open(p);await start(p,'sokcho');await addFirstRecommendation(p);const original=await draft(p);
 await chooseStart(p,'gwangalli');const dialog=p.locator('.rp-dialog');assert.match(await dialog.textContent(),/기존 경유지 1곳과 방문 순서를 유지/);
 const expected=await p.evaluate(plan=>{const provider=SSKR_ROUTE_PROVIDER.create();return [plan,{...plan,startId:'gwangalli'}].map(value=>SSKR_ROUTE_PLAN.status(value,SSKR_SPOT_CATALOG,provider));},original);
 for(const entry of expected)assert.ok((await dialog.textContent()).includes((entry.distanceMeters/1000).toFixed(1)+' km'));
 assert.equal((await draft(p)).startId,'sokcho');await dialog.locator('[data-cancel]').click();assert.deepEqual(await draft(p),original);
 await chooseStart(p,'gwangalli');await p.locator('.rp-dialog [data-confirm]').click();await settle(p);
 assert.equal((await draft(p)).startId,'gwangalli');assert.deepEqual((await draft(p)).stopIds,original.stopIds);
 await p.locator('[data-rp-action="undo"]').click();await settle(p);assert.deepEqual((await draft(p)).stopIds,original.stopIds);assert.equal((await draft(p)).startId,'sokcho');
 assert.deepEqual(p.errors,[]);await p.close();
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

test('repeated add clicks are single-shot and a concurrent removal cancels a stale insertion',async()=>{
 const p=await page();await open(p);await start(p);await addFirstRecommendation(p);await addFirstRecommendation(p);const before=await draft(p);await p.locator('.rp-next .rp-place-view').first().click();await p.evaluate(()=>window.__roadDelay=400);await p.locator('.spot-route-add:visible').last().dispatchEvent('click');await p.locator('.spot-route-add:visible').last().dispatchEvent('click');assert.equal(await p.locator('.spot-route-add:visible').last().isDisabled(),true);await rowAction(p,before.stopIds[0],'remove');await p.waitForTimeout(500);assert.deepEqual((await draft(p)).stopIds,before.stopIds.slice(1));await p.locator('[data-rp-action=back-detail]').click();await p.locator('.rp-next .rp-place-view').first().click();await p.locator('.spot-route-add:visible').last().dispatchEvent('click');await p.locator('.spot-route-add:visible').last().dispatchEvent('click');await settle(p);assert.equal((await draft(p)).stopIds.length,before.stopIds.length);assert.equal(new Set((await draft(p)).stopIds).size,before.stopIds.length);assert.deepEqual(p.errors,[]);await p.close();
});
test('legacy saved-list URLs open route management and browse filters survive editing',async()=>{
 const p=await page();await p.goto(base+'/app/spots?scenario=logged-in-no-application&spotKind=start&spotSearch=망');await p.waitForSelector('.spot-search');await p.locator('[data-spot-mode=plan]').click();await savedTab(p);assert.equal(new URL(p.url()).searchParams.get('tab'),'saved');await p.reload();await p.waitForSelector('dialog[data-management]');await p.keyboard.press('Escape');await p.locator('[data-spot-mode=browse]').click();const url=new URL(p.url());assert.equal(url.searchParams.has('mode'),false);assert.equal(url.searchParams.has('tab'),false);assert.equal(url.searchParams.get('spotSearch'),'망');assert.equal(url.searchParams.get('spotKind'),'start');assert.equal(await p.locator('.spot-search input').inputValue(),'망');assert.deepEqual(p.errors,[]);await p.close();
});
test('retired saved waypoint stays explicit until removed, then the original ID can be saved',async()=>{
 const p=await page();await open(p,'logged-in-no-application');await start(p);await save(p,'수정할 경로');const before=await draft(p);await p.evaluate(id=>{const key='sskr.mock.route-plans:'+encodeURIComponent('mock-rider-0271'),saved=JSON.parse(localStorage.getItem(key));saved.plans.find(x=>x.id===id).stopIds=['retired-qa-spot'];localStorage.setItem(key,JSON.stringify(saved));},before.id);await savedTab(p);await p.locator('[data-rp-action=load]').click();await settle(p);assert.deepEqual((await draft(p)).stopIds,['retired-qa-spot']);assert.equal(await p.locator('.rp-waypoint.is-missing').count(),1);await rowAction(p,'retired-qa-spot','remove');await save(p);assert.equal((await draft(p)).id,before.id);assert.deepEqual((await draft(p)).stopIds,[]);assert.deepEqual(p.errors,[]);await p.close();
});

test('schedule input cancels late generation before submit and cross-route undo restores its schedule',async()=>{
 const p=await page();await open(p,'logged-in-no-application');await start(p);await save(p,'일정 A');const first=await draft(p);await tool(p,'schedule');await p.locator('input[name=departureTime]').fill('06:30');await p.locator('input[name=breakMinutes]').fill('45');await p.locator('[data-schedule] button[type=submit]').click();
 await p.evaluate(()=>window.__roadDelay=1000);await p.locator('[data-rp-action=autofill]').click();await tool(p,'schedule');await p.locator('input[name=breakMinutes]').fill('90');await p.waitForTimeout(1100);assert.deepEqual((await draft(p)).stopIds,first.stopIds);assert.doesNotMatch(await p.locator('.rp-notice').textContent(),/자동 완성을 적용/);await p.keyboard.press('Escape');assert.deepEqual(await p.evaluate(()=>JSON.parse(sessionStorage.getItem('sskr.route-editor')).schedule),{departureTime:'06:30',breakMinutes:'45'});
 await savedTab(p);await p.locator('[data-rp-action=new]').click();assert.deepEqual(await p.evaluate(()=>JSON.parse(sessionStorage.getItem('sskr.route-editor')).schedule),{departureTime:'',breakMinutes:''});await p.locator('[data-rp-action=undo]').click();await settle(p);assert.equal((await draft(p)).id,first.id);assert.deepEqual(await p.evaluate(()=>JSON.parse(sessionStorage.getItem('sskr.route-editor')).schedule),{departureTime:'06:30',breakMinutes:'45'});assert.deepEqual(p.errors,[]);await p.close();
});
