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
async function page(width=1440,height=1000,input={}){const p=await browser.newPage({viewport:{width,height},reducedMotion:'reduce',...input});p.errors=[];p.on('pageerror',error=>p.errors.push(error.message));
 await p.route('**/web/app/route-provider.js*',route=>route.fulfill({status:200,contentType:'application/javascript',body:providerFixture}));
 await p.route('**/web/shared/map/map.js*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('layer=root.L.layerGroup().addTo(map);','window.__map=map;layer=root.L.layerGroup().addTo(map);')});});
 return p;
}
async function open(p,scenario='guest'){await p.goto(base+'/app/spots?scenario='+scenario);await p.waitForSelector('[data-spot-mode="plan"]');try{await p.waitForFunction(()=>window.__map,null,{timeout:5000});}catch(error){throw Error(`Map did not initialize: ${JSON.stringify({errors:p.errors,mapStatus:await p.locator('.spot-map-status').textContent(),leaflet:await p.evaluate(()=>Boolean(window.L)),mapApi:await p.evaluate(()=>Boolean(window.SSKR_MAP))})}`,{cause:error});}await p.locator('[data-spot-mode="plan"]').click();await p.waitForSelector('.route-planner:not([hidden])');}
const draft=p=>p.evaluate(()=>JSON.parse(sessionStorage.getItem('sskr.route-editor')).plan);
async function settle(p){await p.waitForFunction(()=>!document.querySelector('.rp-operation')?.textContent.includes('연결 중'));}
async function capture(p,name){if(!process.env.SSKR_QA_OUTPUT)return;fs.mkdirSync(process.env.SSKR_QA_OUTPUT,{recursive:true});await p.locator('.spot-planning-area').screenshot({path:path.join(process.env.SSKR_QA_OUTPUT,name+'.png')});}

async function chooseStart(p,id='songjeong'){
 if(!await p.locator('[data-rp-action="change-start"]').isVisible())await p.locator('#rp-tab-route').click();
 await p.locator('[data-rp-action="change-start"]').click();await p.locator(`[data-start-id="${id}"]`).click();
}
async function start(p,id='songjeong'){await chooseStart(p,id);await p.waitForSelector('.rp-next .rp-place-view');await settle(p);}
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
 assert.doesNotMatch(await p.locator(`[data-waypoint="${first}"] strong`).textContent(),/ · /);
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

test('a saved retired waypoint remains visible and can be explicitly removed for repair',async()=>{
 const p=await page();await open(p,'logged-in-no-application');
 await p.evaluate(async()=>{
  const account=(await SSKR_PARTICIPATE_API.context()).account,store=SSKR_ROUTE_PLAN.createStore(localStorage,SSKR_SPOT_CATALOG);
  store.save({...SSKR_ROUTE_PLAN.createEmpty(SSKR_SPOT_CATALOG),title:'이전 장소를 담은 루트',startId:'gangneung',stopIds:['haesindang-park']},account);
  // Simulate an existing record written before the catalog retired this ID.
  const key='sskr.mock.route-plans:'+encodeURIComponent(account.id),data=JSON.parse(localStorage.getItem(key));data.plans[0].stopIds=['donghae-market'];localStorage.setItem(key,JSON.stringify(data));
 });
 await savedTab(p);await p.locator('[data-rp-action="load"]').click();await settle(p);
 assert.deepEqual((await draft(p)).stopIds,['donghae-market']);
 const row=p.locator('[data-waypoint="donghae-market"]');assert.match(await row.textContent(),/더 이상 제공되지 않는 장소/);assert.match(await p.locator('.rp-route-selected').textContent(),/현재 경유할 수 없는 장소/);
 await row.locator('.rp-point-main').click();await row.locator('[data-rp-action="remove"]').click();await settle(p);assert.deepEqual((await draft(p)).stopIds,[]);
 await save(p);await savedTab(p);await p.locator('[data-rp-action="load"]').click();assert.deepEqual((await draft(p)).stopIds,[]);assert.deepEqual(p.errors,[]);await p.close();
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

test('real roads connect ten stops, and provider failures preserve editing',async()=>{
 const p=await page();await p.unroute('**/web/app/route-provider.js*');await open(p);await start(p);await p.locator('[data-rp-action="autofill"]').click();await p.locator('[data-rp-action="apply-preview"]').click();await settle(p);assert.equal((await draft(p)).stopIds.length,10);assert.equal(await p.locator('[data-rp-action="retry-route"]').count(),0);
 await p.waitForFunction(()=>{let count=0;__map.eachLayer(l=>{if(l instanceof L.Polyline&&!(l instanceof L.Polygon)&&l.getLatLngs().length>10)count++;});return count>=11;});assert.deepEqual(p.errors,[]);await p.close();
 const failed=await page();await failed.addInitScript(()=>window.__providerFailure=true);await open(failed);await failed.waitForSelector('[data-rp-action="retry-provider"]');await chooseStart(failed);assert.equal((await draft(failed)).startId,'songjeong');await failed.evaluate(()=>window.__providerFailure=false);await failed.locator('[data-rp-action="retry-provider"]').click();await failed.waitForSelector('.rp-next .rp-place-view');await failed.locator('[data-spot-mode="browse"]').click();assert.equal(await failed.locator('.spot-detail').isVisible(),true);assert.equal(await failed.locator('.spot-toolbar').isVisible(),true);assert.deepEqual(failed.errors,[]);await failed.close();
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

test('preview route rows match summary and cannot be edited until apply or cancel',async()=>{
 const p=await page();await open(p);await start(p);await addFirstRecommendation(p);const original=await draft(p);
 await p.locator('[data-rp-action="autofill"]').click();await p.locator('.rp-preview').waitFor();
 assert.equal(await p.locator('.rp-waypoint[draggable]').count(),0);
 assert.equal(await p.locator('.rp-waypoint').count(),12);assert.equal(await p.locator('.rp-preview-origin').filter({hasText:'새 제안'}).count(),9);
 assert.equal(await p.locator('[data-rp-action="undo"]').isDisabled(),true);assert.equal(await p.locator('#rp-tab-search').isDisabled(),true);
 await p.locator('[data-rp-action="cancel-preview"]').click();assert.deepEqual((await draft(p)).stopIds,original.stopIds);assert.equal(await p.locator('.rp-waypoint').count(),3);
 assert.deepEqual(p.errors,[]);await p.close();
});

test('search is immediately editable and retains query and insertion anchor across detail and resizing',async()=>{
 const p=await page(390,844);await open(p);await start(p);await p.locator('#rp-tab-search').click();
 assert.equal(await p.locator('.spot-search input').isVisible(),true);assert.equal(await p.locator('.rp-filters').getAttribute('open'),null);
 await p.locator('.spot-search input').fill('김해');await p.waitForTimeout(300);const caption=await p.locator('.rp-anchor').textContent();
 await p.locator('.rp-place-results .rp-place-view').first().click();assert.equal(await p.locator('.rp-anchor').textContent(),caption);
 await p.locator('[data-rp-action="back-detail"]').click();assert.equal(await p.locator('.spot-search input').inputValue(),'김해');
 await p.locator('#rp-tab-route').click();await p.setViewportSize({width:1440,height:900});await p.waitForTimeout(300);
 assert.equal(await p.locator('#rp-tab-places').getAttribute('aria-selected'),'true');assert.equal(await p.locator('.rp-next').isVisible(),true);
 assert.deepEqual(p.errors,[]);await p.close();
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


test('mobile route actions scroll with the list and undo never triggers auto-fill',async()=>{
 for(const [width,height]of [[360,640],[390,664],[430,700]]){
  const p=await page(width,height);await open(p);await start(p,'sokcho');await addFirstRecommendation(p);await p.locator('#rp-tab-route').click();await p.waitForTimeout(250);
  const last=await p.locator('.rp-waypoint').last().boundingBox(),footer=await p.locator('.rp-route-footer').boundingBox();assert.ok(footer.y>=last.y+last.height);
  assert.equal(await p.locator('.rp-route-scroll').evaluate(e=>getComputedStyle(e).overflowY),'visible');assert.equal(await p.locator('.rp-route-footer').evaluate(e=>getComputedStyle(e).position),'static');
  const undo=p.locator('[data-rp-action="undo"]');await undo.click();await settle(p);assert.equal((await draft(p)).stopIds.length,0);assert.equal(await p.locator('.rp-preview').count(),0);
  await undo.click();await settle(p);assert.equal((await draft(p)).startId,null);assert.equal(await p.locator('#rp-tab-search').getAttribute('aria-selected'),'true');
  assert.deepEqual(p.errors,[]);await p.close();
 }
});

test('route overview closes the selected photo through preview, apply, fit, and resize',async()=>{
 const p=await page(390,844);await open(p);await start(p,'sokcho');await addFirstRecommendation(p);
 assert.ok(await p.locator('.leaflet-tooltip .spot-photo-card:visible').count()>0);
 await p.locator('#rp-tab-route').click();await p.locator('[data-rp-action="autofill"]').click();await p.locator('.rp-preview').waitFor();await p.waitForTimeout(400);
 assert.equal(await p.locator('.leaflet-tooltip .spot-photo-card:visible').count(),0);
 await p.locator('[data-rp-action="apply-preview"]').click();await settle(p);await p.setViewportSize({width:1440,height:900});await p.waitForTimeout(350);
 const first=(await draft(p)).stopIds[0];await p.locator(`[data-waypoint="${first}"] .rp-point-main`).click();await p.waitForTimeout(250);
 assert.ok(await p.locator('.leaflet-tooltip .spot-photo-card:visible').count()>0);
 await p.locator('[data-rp-action="fit"]').click();await p.waitForTimeout(300);assert.equal(await p.locator('.leaflet-tooltip .spot-photo-card:visible').count(),0);
 await p.setViewportSize({width:360,height:640});await p.waitForTimeout(350);assert.equal(await p.locator('.leaflet-tooltip .spot-photo-card:visible').count(),0);
 await p.locator('#rp-tab-route').click();await p.locator(`[data-waypoint="${first}"] .rp-point-main`).click();await p.waitForTimeout(350);
 const card=await p.locator('.leaflet-tooltip .spot-photo-card:visible').last().boundingBox(),map=await p.locator('.spot-map').boundingBox(),controls=await p.locator('.spot-map-controls').boundingBox();
 assert.ok(card.x>=map.x&&card.x+card.width<=map.x+map.width&&card.y>=map.y&&card.y+card.height<=map.y+map.height);
 assert.ok(!(card.x<controls.x+controls.width&&card.x+card.width>controls.x&&card.y<controls.y+controls.height&&card.y+card.height>controls.y));
 assert.deepEqual(p.errors,[]);await p.close();
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

test('first choices, saved-place badges and preview composition make the route state explicit',async()=>{
 const p=await page();await open(p);assert.match(await p.locator('.rp-destination').textContent(),/도착 대천해수욕장/);await start(p);
 assert.equal(await p.locator('[data-rp-action="auto-start"]').isVisible(),true);await p.locator('[data-rp-action="choose-stops"]').click();assert.equal(await p.locator('.rp-first-choice').count(),0);
 assert.match(await p.locator('.rp-summary').textContent(),/예상 주행.*정차·교통 제외/);
 assert.notEqual(await p.locator('.spot-pin.is-route-stop span').first().evaluate(e=>getComputedStyle(e).borderRadius),await p.locator('.spot-pin.spot:not(.is-route-stop) span').first().evaluate(e=>getComputedStyle(e).borderRadius));
 assert.match(await p.locator('.rp-next .rp-place').first().textContent(),/기준점부터.*이곳 추가 시 전체 경로/s);
 await addFirstRecommendation(p);const selected=(await draft(p)).stopIds[0];await p.locator('#rp-tab-search').click();
 const name=await p.evaluate(id=>SSKR_SPOT_CATALOG.find(x=>x.id===id).name,selected);await p.locator('.spot-search input').fill(name);await p.waitForTimeout(300);
 assert.match(await p.locator(`.rp-place[data-place-id="${selected}"] .rp-included`).textContent(),/경로 포함 · 1번째/);
 await p.locator(`.rp-place[data-place-id="${selected}"] .rp-place-view`).click();assert.match(await p.locator('.rp-place-detail .rp-included').textContent(),/1번째 경유지/);
 await p.locator('[data-rp-action="autofill"]').click();await p.locator('.rp-preview').waitFor();
 assert.match(await p.locator('.rp-change-delta').textContent(),/거리.*주행 시간/);const counts=await p.locator('.rp-theme-summary').textContent();assert.equal([...counts.matchAll(/(\d+)곳/g)].reduce((sum,m)=>sum+Number(m[1]),0),10);
 assert.match(await p.locator('.rp-summary').textContent(),/경유 10곳 충족/);assert.doesNotMatch(await p.locator('.rp-summary').textContent(),/최소 조건 충족/);
 assert.deepEqual(p.errors,[]);await p.close();
});

test('mobile long lists restore reading position, keep preview metrics consistent and preserve map on resize',async()=>{
 const p=await page(390,844);await open(p,'logged-in-no-application');await start(p,'sokcho');await p.locator('#rp-tab-search').click();
 await p.locator('.rp-place-results .rp-place-view').nth(8).scrollIntoViewIfNeeded();const before=await p.evaluate(()=>scrollY);await p.locator('.rp-place-results .rp-place-view').nth(8).click();await p.locator('[data-rp-action="back-detail"]').click();await p.waitForTimeout(200);assert.ok(Math.abs((await p.evaluate(()=>scrollY))-before)<3);
 const mapIdentity=await p.evaluate(()=>{window.__originalMap=__map;return true;});await p.locator('#rp-tab-route').click();await p.locator('[data-rp-action="autofill"]').click();await p.locator('.rp-preview').waitFor();assert.match(await p.locator('.rp-map-summary').textContent(),/미리보기.*경유 10곳/);assert.equal(await p.locator('[data-rp-action="save"]').count(),0);
 await p.locator('[data-rp-action="apply-preview"]').click();await settle(p);await p.locator('#rp-tab-route').click();assert.equal(await p.locator('.rp-waypoint').count(),12);assert.match(await p.locator('.rp-map-summary').textContent(),/경유 10곳 충족/);
 await p.locator('.rp-waypoint').last().scrollIntoViewIfNeeded();assert.ok((await p.locator('.rp-mobile-sticky').boundingBox()).y>=-1);await save(p,'모바일 페이지 루트');await savedTab(p);assert.match(await p.locator('.rp-saved h3').textContent(),/모바일 페이지 루트/);
 await p.setViewportSize({width:1440,height:900});await p.waitForTimeout(250);assert.equal(await p.locator('.rp-mobile-sticky').count(),0);assert.equal(await p.evaluate(()=>__originalMap===__map),mapIdentity);
 await p.setViewportSize({width:390,height:844});await p.waitForTimeout(250);assert.equal(await p.locator('.rp-mobile-sticky').count(),1);assert.equal(await p.evaluate(()=>__originalMap===__map),true);assert.equal((await draft(p)).stopIds.length,10);
 await p.locator('[data-spot-mode="browse"]').click();assert.equal(await p.locator('.rp-mobile-sticky').count(),0);assert.equal(await p.evaluate(()=>document.body.classList.contains('route-editor-mobile')),false);assert.deepEqual(p.errors,[]);await p.close();
});

test('mobile entry after a wide browse view frames every start instead of retaining an offshore center',async()=>{
 const p=await page(1440,900);await p.goto(base+'/app/spots?scenario=guest');await p.waitForFunction(()=>window.__map);await p.setViewportSize({width:390,height:844});await p.locator('[data-spot-mode="plan"]').click();await p.waitForTimeout(350);
 assert.ok(await p.evaluate(()=>SSKR_SPOT_CATALOG.filter(p=>p.kind==='start').every(p=>__map.getBounds().contains([p.lat,p.lng]))));assert.deepEqual(p.errors,[]);await p.close();
});
