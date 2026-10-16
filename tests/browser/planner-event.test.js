// Isolated public-event/browser contract. No real Google session or user data is used.
const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const net=require('node:net'),path=require('node:path'),fs=require('node:fs');
const {chromium,webkit}=require('playwright');
const {context:backendContext}=require('../../server/backend/context');
const catalog=require('../../web/app/spot-catalog');
const A='00000000-0000-4000-8000-000000000001',R='00000000-0000-4000-8000-000000000002';
const account={id:A,linked:true,provider:'google',profile:{name:'일정 검수',email:'test@example.invalid'}};
let server,browser,base;
const fixtureProvider=`window.SSKR_ROUTE_PROVIDER={create(){return {version:'event-fixture',async ready(){},summary(){return {distanceMeters:12000,durationSeconds:900}},async route(ids){const legs=ids.slice(1).map((id,i)=>({fromId:ids[i],toId:id,coordinates:ids.slice(i,i+2).map(id=>{const p=SSKR_SPOT_CATALOG.find(p=>p.id===id);return [p.lat,p.lng]}),distanceMeters:12000,durationSeconds:900,status:'ready'}));return {legs,distanceMeters:legs.length*12000,durationSeconds:legs.length*900,valid:true,version:this.version}}}}};`;
function event(version=1,minute='10'){
 const e={id:'event-test',configVersion:version,publicTitle:'일정 검수 행사',timezone:'Asia/Seoul',eventStartAt:'2027-06-14T06:00:00+09:00',eventEndAt:'2027-06-14T20:00:00+09:00',applicationOpenAt:'2027-01-01T00:00:00+09:00',applicationCloseAt:'2027-06-01T00:00:00+09:00',minimumSpotCheckins:10,startLocationIds:catalog.filter(p=>p.kind==='start').map(p=>p.id),finishLocationId:'daecheon',publishedAt:'2027-01-01T00:00:00Z'};
 e.sunlight={eventId:e.id,date:'2027-06-14',timezone:e.timezone,configVersion:version,verification:'REVIEWED',sourceUrl:'https://example.invalid/reviewed-sunlight',calculationVersion:'test-reviewed',starts:catalog.filter(p=>p.kind==='start').map(p=>({locationId:p.id,lat:p.lat,lng:p.lng,sunriseAt:'2027-06-13T21:'+minute+':00Z'})),finish:{locationId:'daecheon',lat:catalog.find(p=>p.id==='daecheon').lat,lng:catalog.find(p=>p.id==='daecheon').lng,sunsetAt:'2027-06-14T10:00:00Z'}};
 return e;
}
before(async()=>{
 const port=await new Promise(resolve=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const port=s.address().port;s.close(()=>resolve(port));});});base='http://127.0.0.1:'+port;
 server=spawn(process.execPath,['server/dev-server.js'],{cwd:path.resolve(__dirname,'../..'),env:{...process.env,SSKR_DEV_PORT:String(port),SSKR_BACKEND_MODE:'mock'},stdio:['ignore','pipe','pipe'],windowsHide:true});
 await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Dev server did not start')),10000);server.stdout.on('data',b=>{if(b.toString().includes('SSKR dev server')){clearTimeout(timer);resolve();}});server.once('error',reject);});
 const engine=process.env.BROWSER_ENGINE==='webkit'?webkit:chromium;browser=await engine.launch({headless:true,...(engine===chromium?{channel:process.env.BROWSER_CHANNEL||(process.platform==='win32'?'msedge':undefined)}:{})});
});
after(async()=>{await browser?.close();server?.kill();});
async function fixture({width=1440,automatic=true,linked=true,restore=true}={}){
 const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const state={event:event(),calls:[],contexts:0,failNext:false};
 const schedule={departureTime:automatic?'06:10':'07:45',breakMinutes:90,autoDeparture:automatic,eventId:'event-test',configVersion:1,timezone:'Asia/Seoul'};
 const plan={id:linked?R:null,ownerUserId:linked?A:null,title:'일정 변경 보존',startId:'sokcho',stopIds:['auraji','cheongnyeongpo'],pinnedStopIds:['auraji'],finishId:'daecheon',createdAt:'2026-10-16T00:00:00Z',updatedAt:'2026-10-16T00:00:00Z'};
 state.row={plan,schedule,revision:1};
 if(restore)await page.addInitScript(value=>{if(sessionStorage.getItem('event-fixture-seeded'))return;sessionStorage.setItem('event-fixture-seeded','true');sessionStorage.setItem('sskr.route-editor',JSON.stringify(value));},{backend:'supabase',ownerId:linked?A:null,serverRevision:linked?1:null,active:true,dirty:false,autoDeparture:automatic,plan,schedule});
 await page.route('**/web/app/route-provider.js*',route=>route.fulfill({contentType:'application/javascript',body:fixtureProvider}));
 await page.route('**/api/participate/context',route=>{state.contexts++;return route.fulfill({json:backendContext(linked?account:null,new Date('2027-02-01'),state.event)});});
 await page.route('**/api/backend?*',async route=>{
  const request=route.request(),url=new URL(request.url()),resource=url.searchParams.get('resource');
  if(resource==='runtime')return route.fulfill({json:{ok:true,mode:'supabase'}});
  if(resource==='routes'&&request.method()==='GET')return route.fulfill({json:{ok:true,routes:linked?[state.row]:[],maxSavedRoutes:10}});
  if(resource==='routes'&&['PUT','POST','PATCH'].includes(request.method())){
   const body=request.postDataJSON();state.calls.push({method:request.method(),...body});
   if(state.failNext){state.failNext=false;state.event=event(2,'40');return route.fulfill({status:409,json:{ok:false,error:{code:'EVENT_CHANGED',userMessage:'행사 정보가 변경됐습니다. 일정을 확인한 뒤 다시 저장해 주세요.'}}});}
   state.row={plan:{...(body.plan||state.row.plan),id:R,ownerUserId:A,updatedAt:new Date().toISOString()},schedule:{...body.schedule,eventId:state.event.id,configVersion:state.event.configVersion,timezone:state.event.timezone},revision:state.row.revision+1};
   return route.fulfill({json:{ok:true,...state.row}});
  }
  throw Error('Unexpected backend request '+request.method()+' '+resource);
 });
 await page.goto(base+'/app/spots?mode=plan');await page.waitForSelector('[data-route-title]');await page.waitForFunction(()=>!document.querySelector('.rp-operation')?.textContent.includes('준비하고')&&!document.querySelector('.rp-operation')?.textContent.includes('연결 중'));
 return {page,state,errors};
}
const draft=page=>page.evaluate(()=>JSON.parse(sessionStorage.getItem('sskr.route-editor')));
async function focusRefresh(page,state){const before=state.contexts;await page.evaluate(()=>window.dispatchEvent(new Event('focus')));await page.waitForFunction(()=>document.querySelector('[data-event-review]'));assert.ok(state.contexts>before);}

test('published event refresh updates only automatic time and preserves route, pins and stored event metadata until save',async()=>{
 for(const width of [390,1440]){
  const {page:p,state,errors}=await fixture({width});
  try{
   const before=(await draft(p)).plan;state.event=event(2,'30');state.event.minimumSpotCheckins=12;
   await focusRefresh(p,state);assert.equal(await p.getByLabel('예상 출발 시각',{exact:true}).inputValue(),'06:30');assert.equal(await p.getByLabel('휴게시간(분)',{exact:true}).inputValue(),'90');
   assert.deepEqual((await draft(p)).plan,before);assert.equal((await draft(p)).schedule.configVersion,1);assert.match(await p.locator('.rp-stop-shortage').textContent(),/10개 부족/);
   if(process.env.SSKR_EVENT_QA_OUTPUT){fs.mkdirSync(process.env.SSKR_EVENT_QA_OUTPUT,{recursive:true});await p.screenshot({path:path.join(process.env.SSKR_EVENT_QA_OUTPUT,'event-review-'+width+'.png'),fullPage:width<=800});}
   await p.getByLabel('휴게시간(분)',{exact:true}).fill('75');await p.waitForTimeout(650);assert.equal(state.calls.length,0,'unreviewed event must not be silently acknowledged by schedule autosave');
   await p.locator('[data-rp-action=save]').click();await p.getByText('루트를 저장했습니다.',{exact:true}).waitFor();
   assert.equal(state.calls.at(-1).schedule.configVersion,2);assert.equal(state.calls.at(-1).schedule.departureTime,'06:30');assert.equal((await draft(p)).schedule.configVersion,2);assert.equal(await p.locator('[data-event-review]').count(),0);
   await p.reload();await p.waitForSelector('[data-route-title]');assert.equal(await p.getByLabel('휴게시간(분)',{exact:true}).inputValue(),'75');assert.deepEqual((await draft(p)).plan.stopIds,before.stopIds);assert.deepEqual((await draft(p)).plan.pinnedStopIds,before.pinnedStopIds);assert.deepEqual(errors,[]);
  }finally{await p.close();}
 }
});

test('manual departure survives event refresh, remote schedule loading and authoritative save metadata',async()=>{
 const {page:p,state,errors}=await fixture({automatic:false,restore:false});
 try{
  await p.locator('[data-rp-action=manage]').click();await p.locator('.rp-saved [data-rp-action=load]').click();
  assert.equal((await draft(p)).schedule.configVersion,1);assert.equal(await p.getByLabel('예상 출발 시각',{exact:true}).inputValue(),'07:45');
  state.event=event(2,'50');await focusRefresh(p,state);assert.equal(await p.getByLabel('예상 출발 시각',{exact:true}).inputValue(),'07:45');assert.equal(await p.getByLabel('휴게시간(분)',{exact:true}).inputValue(),'90');
  await p.locator('[data-rp-action=save]').click();await p.getByText('루트를 저장했습니다.',{exact:true}).waitFor();
  assert.deepEqual(Object.fromEntries(['eventId','configVersion','timezone'].map(key=>[key,state.calls.at(-1).schedule[key]])),{eventId:'event-test',configVersion:2,timezone:'Asia/Seoul'});
  assert.equal((await draft(p)).autoDeparture,false);assert.equal((await draft(p)).schedule.configVersion,2);assert.deepEqual(errors,[]);
 }finally{await p.close();}
});

test('stale reviewed sunlight clears automatic departure for guests without discarding their route',async()=>{
 const {page:p,state,errors}=await fixture({linked:false,width:390});
 try{
  const before=(await draft(p)).plan;state.event=event(2,'50');state.event.sunlight.configVersion=1;
  await focusRefresh(p,state);assert.equal(await p.getByLabel('예상 출발 시각',{exact:true}).inputValue(),'');assert.equal(await p.getByLabel('휴게시간(분)',{exact:true}).inputValue(),'90');
  assert.deepEqual((await draft(p)).plan,before);assert.equal(await p.locator('.rp-route-arrival').count(),0);assert.ok(await p.locator('[data-rp-action=autofill]').isDisabled());assert.deepEqual(errors,[]);
 }finally{await p.close();}
});

test('event version conflict refreshes context and preserves edits before a deliberate retry',async()=>{
 const {page:p,state,errors}=await fixture();
 try{
  await p.locator('[data-route-title]').fill('충돌 후 유지할 이름');const before=(await draft(p)).plan;state.failNext=true;
  await p.locator('[data-rp-action=save]').click();await p.getByText('행사 정보가 변경됐습니다. 일정을 확인한 뒤 다시 저장해 주세요.',{exact:true}).waitFor();
  assert.equal(await p.getByLabel('예상 출발 시각',{exact:true}).inputValue(),'06:40');assert.deepEqual((await draft(p)).plan,before);assert.equal((await draft(p)).schedule.configVersion,1);
  await p.locator('[data-rp-action=save]').click();await p.getByText('루트를 저장했습니다.',{exact:true}).waitFor();assert.equal(state.calls.length,2);assert.equal(state.calls[1].schedule.configVersion,2);assert.equal((await draft(p)).schedule.configVersion,2);assert.deepEqual(errors,[]);
 }finally{await p.close();}
});

test('published start restrictions filter the finder, gallery and map while preserving excluded saved starts for repair',async()=>{
 const {page:p,state,errors}=await fixture({width:390});
 try{
  const before=(await draft(p)).plan;state.event=event(2,'40');state.event.startLocationIds=['gangneung','songjeong'];
  await focusRefresh(p,state);
  await p.locator('[data-event-start]').waitFor();assert.deepEqual((await draft(p)).plan,before);assert.ok(await p.locator('[data-rp-action=save]').isDisabled());assert.ok(await p.locator('[data-rp-action=autofill]').isDisabled());
  // Route markers keep the saved starting point visible for an explicit repair.
  const markerNames=await p.locator('.spot-pin').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('aria-label')));
  assert.ok(markerNames.some(name=>name?.includes('속초해수욕장')&&name.includes('경로 포함')));
  assert.ok(!markerNames.some(name=>name?.includes('망상해변')));
  await p.getByLabel('휴게시간(분)',{exact:true}).fill('75');await p.waitForTimeout(650);assert.equal(state.calls.length,0);
  await p.locator('[data-rp-action=change-start]').click();assert.deepEqual(await p.locator('[data-start-id]').evaluateAll(nodes=>nodes.map(n=>n.dataset.startId)),['gangneung','songjeong']);
  await p.locator('[data-start-id=gangneung]').click();assert.equal((await draft(p)).plan.startId,'gangneung');assert.deepEqual((await draft(p)).plan.stopIds,before.stopIds);assert.deepEqual((await draft(p)).plan.pinnedStopIds,before.pinnedStopIds);
  assert.equal(await p.locator('[data-event-start]').count(),0);assert.equal(await p.locator('[data-rp-action=save]').isDisabled(),false);
  await p.locator('[data-rp-action=save]').click();await p.getByText('루트를 저장했습니다.',{exact:true}).waitFor();assert.equal(state.calls.at(-1).plan.startId,'gangneung');
  // A new route offers the same public start set in the finder and map.
  await p.locator('[data-rp-action=manage]').click();await p.locator('[data-rp-action=new]').click();
  await p.locator('#rp-tab-search').click();assert.deepEqual(await p.locator('.rp-place-view[data-id]').evaluateAll(nodes=>nodes.map(n=>n.dataset.id)),['gangneung','songjeong']);
  const newMarkerNames=await p.locator('.spot-pin').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('aria-label')));assert.ok(!newMarkerNames.some(name=>name?.includes('속초해수욕장')));
  assert.deepEqual(errors,[]);
 }finally{await p.close();}
});
