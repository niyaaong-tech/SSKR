'use strict';
// Actual BFF + PostgreSQL policies. Identity and the PG boundary are explicit
// isolated fixtures; this does not claim a real card charge or device GPS test.
const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const {chromium,webkit}=require('playwright');
const {spawn}=require('node:child_process');
const net=require('node:net'),path=require('node:path'),fs=require('node:fs');
const {fixture}=require('../backend/workflow-fixture');
const {createHandler}=require('../../server/backend/handler');
let f,browser,server,base,handler;
before(async()=>{
  f=await fixture();
  const draft=require('../../server/backend/events').documentFor({...f.event,publicTitle:'2026 SSKR',isTest:true,timeMode:'MANUAL',sunlight:null,startLocationIds:[...require('../../web/app/spot-catalog').filter(p=>p.kind==='start').map(p=>p.id),...require('../../server/data/field-test-places.json').records.filter(p=>p.startEligible).map(p=>p.id)],finishLocationId:'test-walk-30'});
  const doc=(await f.db.query('select sskr_private.event_document($1) doc',[JSON.stringify(draft)])).rows[0].doc;
  await f.db.query('insert into sskr_private.event_publications(event_id,config_version,document,actor_id) values($1,2,$2,$3)',[f.E,JSON.stringify(doc),f.A]);await f.db.query('update sskr_private.event_current set current_version=2');
  await f.db.query('update sskr_private.event_drafts set document=$1,revision=2 where id=$2',[JSON.stringify(doc),f.E]);
  const ops=await f.service.operations(f.account(f.A),{action:'READ'});await f.service.operations(f.account(f.A),{action:'CONFIGURE',revision:ops.epoch,commerce:{...f.commerce,preparationNotice:"출발 전 준비 사항을 확인해 주세요.",checkinRadiusMeters:20,maxAccuracyMeters:35}});const port=await new Promise(resolve=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>resolve(p));});});base='http://127.0.0.1:'+port;
  server=spawn(process.execPath,['server/dev-server.js'],{cwd:path.resolve(__dirname,'../..'),env:{...process.env,SSKR_DEV_PORT:String(port),SSKR_BACKEND_MODE:'mock'},stdio:['ignore','pipe','pipe'],windowsHide:true});
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('startup')),10000);server.stdout.on('data',s=>{if(String(s).includes('SSKR dev server')){clearTimeout(timer);resolve();}});});
  const session=require('node:crypto').randomUUID();
  await f.db.exec(`create or replace function auth.uid() returns uuid language sql as $$select '${f.A}'::uuid$$;
    create or replace function auth.jwt() returns jsonb language sql as $$select jsonb_build_object('session_id','${session}')$$;`);
  await f.db.query('insert into auth.sessions(id,user_id) values($1,$2)',[session,f.A]);await f.db.query("insert into auth.identities(user_id,provider) values($1,'google')",[f.A]);
  const originalRPC=f.adapter.rpc.bind(f.adapter);f.adapter.rpc=async(name,args={})=>{try{if(name==='sskr_event_place_options')return {data:(await f.db.query('select public.sskr_event_place_options() result')).rows[0].result};if(name==='sskr_events')return {data:(await f.db.query('select public.sskr_events($1,$2,$3,$4) result',[args.p_action,args.p_id,JSON.stringify(args.p_document),args.p_revision])).rows[0].result};if(name==='sskr_routes')return {data:(await f.db.query('select public.sskr_routes($1,$2,$3,$4,$5,$6) result',[args.p_action,args.p_id,JSON.stringify(args.p_plan),JSON.stringify(args.p_schedule),args.p_revision,args.p_key])).rows[0].result};return originalRPC(name,args);}catch(e){return {error:{message:e.message}};}};
  handler=createHandler({readMode:()=> 'supabase',getConfig:()=>({mode:'supabase',origin:base}),authService:{actor:async()=>{const stored=(await f.adapter.rpc('sskr_profile')).data,account=f.account(f.A);return {account:{...account,profile:{...account.profile,...stored.profile},profileRevision:stored.revision},db:f.adapter};}},readPublished:async()=>f.event,getWorkflows:()=>f.service,workflowEnabled:()=>true});
  const engine=process.env.BROWSER_ENGINE==='webkit'?webkit:chromium;
  browser=await engine.launch({headless:true,...(engine===chromium?{channel:process.env.BROWSER_CHANNEL||(process.platform==='win32'?'msedge':undefined)}:{})});
});
after(async()=>{await browser?.close();server?.kill();await f?.db.close();});
async function page(width=390){
  const p=await browser.newPage({viewport:{width,height:844},locale:'ko-KR',timezoneId:'Asia/Seoul',reducedMotion:'reduce'});p.errors=[];p.on('pageerror',e=>p.errors.push(e.message));
  const intercept=async route=>{const r=route.request(),url=new URL(r.url());let status=200,headers={},body;
    const endpoint=url.pathname.split('/').at(-1);
    const req={url:r.url(),method:r.method(),headers:await r.allHeaders(),body:r.postData()||undefined,query:url.pathname.startsWith('/api/participate/')?{resource:endpoint}:undefined};
    const res={getHeader:k=>headers[k],setHeader:(k,v)=>headers[k]=v,writeHead:(s,h)=>{status=s;Object.assign(headers,h);},end:v=>body=v};
    await handler(req,res);await route.fulfill({status,headers,body:body||''});};
  await p.route('**/api/backend?*',intercept);await p.route('**/api/participate/*',intercept);
  return p;
}

test('one administration screen adds GPS locations without removing national starts or finish',async()=>{
  for(const width of [390,1440]){
    const p=await page(width);await p.goto(base+'/app/admin');await p.locator('[name=isTest]').waitFor();await p.locator('#admin-workspace').waitFor();
    assert.equal(await p.locator('[name=isTest]').isChecked(),true);
    assert.equal(await p.locator('#start-locations input').count(),16);
    assert.equal(await p.locator('[name=finishLocationId] option').count(),66);
    await p.locator('[name=isTest]').uncheck();assert.equal(await p.locator('#start-locations input').count(),11);assert.equal(await p.locator('[name=finishLocationId] option').count(),1);
    await p.locator('[name=isTest]').check();assert.equal(await p.locator('#start-locations input').count(),16);
    await p.locator('[name=start-test-start-ori]').check();await p.locator('[name=finishLocationId]').selectOption('test-walk-30');await p.reload();await p.locator('#admin-workspace').waitFor();assert.equal(await p.locator('[name=start-test-start-ori]').isChecked(),true);assert.equal(await p.locator('[name=finishLocationId]').inputValue(),'test-walk-30');
    assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    const dir=process.env.SSKR_QA_OUTPUT||'D:/sskr-qa/gps-test/unified-ui';fs.mkdirSync(dir,{recursive:true});await p.screenshot({path:path.join(dir,'admin-'+width+'.png'),fullPage:true});assert.deepEqual(p.errors,[]);await p.close();
  }
});
test('real participation restores all sixteen guide illustrations and follows configured event times',async()=>{
  for(const width of [1440,390]){
    await f.db.query("update sskr_private.workflows set document='{}' where owner_id=$1",[f.A]);
    await f.service.handle(f.account(f.A),'application',{action:'START'});
    const p=await page(width);await p.goto(base+'/participate');await p.locator('#guide-acknowledgement').waitFor();
    const output=process.env.SSKR_QA_OUTPUT||'D:/sskr-qa/participation-guide';fs.mkdirSync(output,{recursive:true});
    assert.equal(await p.locator('.notice-group').count(),4);
    assert.equal(await p.locator('.notice-visual').count(),16);
    for(const image of await p.locator('.notice-visual').all()){
      await image.scrollIntoViewIfNeeded();
      await p.waitForFunction(el=>el.complete&&el.naturalWidth>0,await image.elementHandle());
    }
    await p.evaluate(()=>{window.scrollTo(0,0);document.querySelector('.service-panel').scrollTop=0;});
    await p.screenshot({path:path.join(output,'guide-'+width+'.png'),fullPage:true});
    const body=await p.locator('.transaction-body--notice').innerText();
    assert.ok(body.includes(f.commerce.guide));
    assert.doesNotMatch(body,/일출 전까지|일몰 전/);
    assert.match(body,/지정된 출발 시각/);assert.match(body,/지정된 종료 시각/);
    assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    assert.equal(await p.locator('#acknowledgement-form [type=submit]').isDisabled(),true);
    await p.locator('#guide-acknowledgement').check();
    assert.equal(await p.locator('#acknowledgement-form [type=submit]').isEnabled(),true);
    await p.locator('#acknowledgement-form [type=submit]').click();await p.locator('#agreement-form').waitFor();
    assert.deepEqual(p.errors,[]);await p.close();
  }
  await f.db.query("update sskr_private.workflows set document='{}' where owner_id=$1",[f.A]);
});

test('participation profile uses the real API and preserves saved contacts after reload',async()=>{
  for(const width of [1440,390]){
    const p=await page(width);await p.goto(base+'/participate');
    const openProfile=async()=>{await p.locator('.account-trigger').click();await p.locator('[data-account-action=profile]').click();await p.locator('#profile-edit').waitFor();};
    await openProfile();assert.doesNotMatch(await p.locator('#mode-account').innerText(),/Mock Account|Social Provider/);
    for(const suffix of ['first','updated']){
      await p.locator('#profile-edit').click();await p.locator('#profile-form [name=name]').fill('연락처 검수');
      await p.locator('#profile-form [name=email]').fill(`${suffix}-${width}@example.invalid`);await p.locator('#profile-form [name=phone]').fill('01055556666');
      const saved=p.waitForResponse(r=>r.url().includes('resource=profile')&&r.request().method()==='POST');
      await p.locator('#profile-form [type=submit]').click();const response=await saved;assert.equal(response.status(),200);
      await p.getByText('프로필을 저장했습니다.',{exact:true}).waitFor();
    }
    await p.reload();await openProfile();assert.match(await p.locator('.profile-card').innerText(),new RegExp(`updated-${width}@example.invalid`));
    const dir=process.env.SSKR_QA_OUTPUT||'D:/sskr-qa/shared-service';fs.mkdirSync(dir,{recursive:true});
    await p.screenshot({path:path.join(dir,'profile-'+width+'.png'),fullPage:true});
    assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    await p.goto(base+'/app/profile');assert.equal(await p.locator('#profile-form [name=email]').inputValue(),`updated-${width}@example.invalid`);
    assert.deepEqual(p.errors,[]);await p.close();
  }
});

test('participant uses the ordinary manager, preparation and planner with both national and GPS places',async()=>{
  const user=f.account(f.A);await f.service.handle(user,'application',{action:'START'});await f.service.handle(user,'application',{action:'SAVE_ACKNOWLEDGEMENT',acknowledgement:{acknowledged:true}});await f.service.handle(user,'application',{action:'SAVE_AGREEMENTS',agreements:{TERMS:true,PRIVACY:true,LOCATION:true}});await f.service.handle(user,'application',{action:'SAVE_PARTICIPANT_INFO',participant:{name:'검수',email:'fixture@example.invalid',phone:'01012345678',priceTierId:'test-participation'}});
  const p=await page();await p.goto(base+'/participate');await p.locator('#confirm-test').waitFor();
  for(const width of [1440,390]){
    await p.setViewportSize({width,height:844});
    assert.deepEqual(await p.locator('.payment-summary dt').allTextContents(),['참가 이벤트','참가 유형','참가자','연락처','참가비']);
    assert.equal(await p.locator('.payment-summary dd').nth(1).textContent(),'기본 참가');
    assert.equal(await p.locator('.payment-summary dd').last().textContent(),'0원');
    assert.equal(await p.locator('#payment-action, #defer-payment, #mock-outcome').count(),0);
    assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    const dir=process.env.SSKR_QA_OUTPUT||'D:/sskr-qa/shared-service';fs.mkdirSync(dir,{recursive:true});await p.screenshot({path:path.join(dir,'confirmation-'+width+'.png'),fullPage:true});
  }
  const variants=await p.evaluate(async()=>{
    const context=await SSKR_PARTICIPATE_API.context();
    return ['READY','CLOSED'].flatMap(variant=>['paid','test'].map(participationMode=>{
      const host=document.createElement('div');SSKR_MODE_B.render(host,{...context,participationMode,surface:{...context.surface,variant,primaryAction:{enabled:variant!=='CLOSED'}}},{});
      return {variant,participationMode,labels:[...host.querySelectorAll('.payment-summary dt')].map(el=>el.textContent),payment:!!host.querySelector('#payment-action'),confirm:!!host.querySelector('#confirm-test'),disabled:host.querySelector('#confirm-test')?.disabled};
    }));
  });
  for(const variant of variants){assert.deepEqual(variant.labels,['참가 이벤트','참가 유형','참가자','연락처','참가비']);if(variant.participationMode==='test'){assert.equal(variant.payment,false);assert.equal(variant.confirm,true);assert.equal(variant.disabled,variant.variant==='CLOSED');}}
  await p.locator('#confirm-test').click();await p.getByText('참가 등록이 완료되었습니다.',{exact:false}).waitFor();assert.equal(await p.locator('.service-test-notice').count(),0);
  await p.goto(base+'/app');await p.locator('.manager-dashboard').waitFor();assert.equal(await p.locator('.manager-test-notice').count(),0);assert.ok(!/테스트|결제·키트 제공 없음/.test(await p.locator('#app-main').innerText()));
  await p.goto(base+'/app/preparation');await p.locator('[name=startLocationId]').selectOption('test-start-ori');await p.locator('[data-preparation=start] button').click();await p.locator('[data-preparation=start] [role=status]').filter({hasText:'저장'}).waitFor();assert.ok(!/테스트/.test(await p.locator('#app-main').innerText()));
  await p.getByRole('link',{name:'운영 공지 전체 보기'}).click();await p.waitForURL('**/app/notices');await p.locator('#app-main').getByRole('heading',{name:'공지',exact:true}).waitFor();
  await p.goto(base+'/app/spots?mode=plan');await p.locator('.rp-start-select').waitFor();const counts=await p.evaluate(()=>({normal:window.SSKR_SPOT_CATALOG.filter(p=>!p.testOnly).length,extra:window.SSKR_SPOT_CATALOG.filter(p=>p.testOnly).length}));assert.deepEqual(counts,{normal:212,extra:68});assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.deepEqual(p.errors,[]);await p.close();
});
test('mixed national and GPS route computes, saves and reloads through the ordinary planner',async()=>{
  const p=await page(1440);await p.goto(base+'/app/spots?mode=plan');await p.locator('.rp-start-select').click();await p.locator('[data-start-id="test-start-ori"]').click();
  for(const id of ['test-walk-01','auraji']){
    if(await p.locator('[data-rp-action=back-detail]').isVisible())await p.locator('[data-rp-action=back-detail]').click();
    const name=[...require('../../server/data/field-test-places.json').records,...require('../../web/app/spot-catalog')].find(q=>q.id===id).name;await p.locator('.spot-search input').fill(name);await p.locator('.rp-place-view[data-id="'+id+'"]').click();const add=p.locator('.rp-detail-add[data-id="'+id+'"]');await add.waitFor();await p.waitForFunction(id=>!document.querySelector('.rp-detail-add[data-id="'+id+'"]')?.disabled,id);await add.click();await p.locator('.rp-waypoints [data-waypoint="'+id+'"]').waitFor();
  }
  await p.locator('[data-rp-action="save"]').click();
  await p.waitForFunction(()=>document.body.innerText.includes('저장됨'));
  const stored=(await f.db.query('select plan from sskr_private.routes where owner_id=$1',[f.A])).rows.at(-1).plan;
  assert.equal(stored.startId,'test-start-ori');assert.equal(stored.finishId,'test-walk-30');assert.deepEqual(new Set(stored.stopIds),new Set(['test-walk-01','auraji']));assert.ok(stored.routingVersion.includes('+'));
  const dir=process.env.SSKR_QA_OUTPUT||'D:/sskr-qa/gps-test/unified-ui';await p.screenshot({path:path.join(dir,'mixed-planner.png'),fullPage:false});
  await p.reload();await p.locator('.rp-waypoints [data-waypoint="auraji"]').waitFor();assert.deepEqual(p.errors,[]);await p.close();
});
test('ordinary check-in creates a memorial visible through the same owner and public screens',async()=>{
  const p=await page();let ms=Date.parse('2099-10-16T06:05:00+09:00');f.setNow(ms);await p.addInitScript(()=>{navigator.geolocation.getCurrentPosition=resolve=>resolve(window.__gpsFixture);});await p.goto(base+'/app/ride');await p.locator('[data-checkin]').waitFor();
  const places=(await f.service.handle(f.account(f.A),'context')).event.placeCatalog,ids=['test-start-ori',...Array.from({length:9},(_,i)=>'test-walk-'+String(i+1).padStart(2,'0')),'auraji','test-walk-30'];
  for(const id of ids){ms+=60000;f.setNow(ms);const point=places.find(p=>p.id===id);await p.evaluate(({point,ms})=>{window.__gpsFixture={coords:{latitude:point.lat,longitude:point.lng,accuracy:5},timestamp:ms};},{point,ms});await p.locator('[data-checkin]').click();await p.locator('.service-visits li').nth(ids.indexOf(id)).waitFor();}
  await p.getByText('완주 기록 보기',{exact:true}).click();await p.locator('.memorial-record').first().waitFor();assert.ok(!/테스트/.test(await p.locator('#app-main').innerText()));
  const item=(await f.service.memorials(f.account(f.A))).items[0];await f.service.handle(f.account(f.A),'memorial',{eventId:f.E,revision:item.revision,values:{title:'함께 걸었던 하루',summary:'탄천을 따라 남긴 기억',visibility:'PUBLIC',publishStatus:'PUBLISHED',visitEdits:{}}});
  for(const width of [1440,390]){
    await p.setViewportSize({width,height:844});await p.goto(base+'/app/memorials/'+item.id);await p.getByRole('heading',{name:'함께 걸었던 하루',exact:true}).waitFor();
    await p.locator('.journey-log-entry[data-visit="10"]').waitFor();assert.equal(await p.locator('.journey-log-entry[data-visit]').count(),12);
    const photo=p.locator('[data-visit="10"] .journey-visit-photo');assert.equal(await photo.locator('figcaption a').count(),1,JSON.stringify(item.visits[10]));
    assert.equal(await p.locator('.memorial-time-details, [data-download], .journey-data-source').count(),0);
    assert.ok(!/테스트|NaN|Invalid Date/.test(await p.locator('.memorial-detail').innerText()));
    await p.getByText('여정 지도 보기',{exact:true}).click();await p.locator('.journey-map-host .spot-map').waitFor();
    const dir=process.env.SSKR_QA_OUTPUT||'D:/sskr-qa/shared-service';fs.mkdirSync(dir,{recursive:true});
    await p.locator('.journey-map-host').scrollIntoViewIfNeeded();await p.screenshot({path:path.join(dir,'journey-map-'+width+'.png')});
    await p.locator('.journey-map-host [data-place="10"]').click();
    const selected=p.locator('.journey-log-entry.is-selected[data-visit="10"]');await selected.locator('[data-return]').waitFor();
    const box=await selected.boundingBox();assert.ok(box.y>=0&&box.y<844,'map photo opens the selected visit in view');
    assert.match(await selected.innerText(),/아우라지/);await photo.locator('img').evaluate(img=>img.decode());
    await p.screenshot({path:path.join(dir,'journey-visit-'+width+'.png')});
    await selected.locator('[data-return]').click();assert.ok(await p.locator('.journey-map-host').evaluate(el=>{const r=el.getBoundingClientRect();return r.top<innerHeight&&r.bottom>0;}));
    await p.locator('.journey-map-host [data-action=fit]').click();assert.equal(await p.locator('.journey-log-entry.is-selected, [data-return]').count(),0);
    assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    // Closing and reopening the map must keep one viewer and the same handlers.
    await p.getByText('여정 지도 보기',{exact:true}).click();await p.getByText('여정 지도 보기',{exact:true}).click();assert.equal(await p.locator('.journey-map-host .spot-map').count(),1);
  }
  assert.equal((await f.service.memorials(null)).items.length,1);assert.deepEqual(p.errors,[]);await p.close();
});
