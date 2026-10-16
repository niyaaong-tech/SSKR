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
  f=await fixture();const port=await new Promise(resolve=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>resolve(p));});});base='http://127.0.0.1:'+port;
  server=spawn(process.execPath,['server/dev-server.js'],{cwd:path.resolve(__dirname,'../..'),env:{...process.env,SSKR_DEV_PORT:String(port),SSKR_BACKEND_MODE:'mock'},stdio:['ignore','pipe','pipe'],windowsHide:true});
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('startup')),10000);server.stdout.on('data',s=>{if(String(s).includes('SSKR dev server')){clearTimeout(timer);resolve();}});});
  const session=require('node:crypto').randomUUID();
  await f.db.exec(`create or replace function auth.uid() returns uuid language sql as $$select '${f.A}'::uuid$$;
    create or replace function auth.jwt() returns jsonb language sql as $$select jsonb_build_object('session_id','${session}')$$;`);
  await f.db.query('insert into auth.sessions(id,user_id) values($1,$2)',[session,f.A]);await f.db.query("insert into auth.identities(user_id,provider) values($1,'google')",[f.A]);
  handler=createHandler({readMode:()=> 'supabase',getConfig:()=>({mode:'supabase',origin:base}),authService:{actor:async()=>{const stored=(await f.adapter.rpc('sskr_profile')).data,account=f.account(f.A);return {account:{...account,profile:{...account.profile,...stored.profile},profileRevision:stored.revision},db:f.adapter};}},readPublished:async()=>f.event,getWorkflows:()=>f.service,workflowEnabled:()=>true});
  const engine=process.env.BROWSER_ENGINE==='webkit'?webkit:chromium;
  browser=await engine.launch({headless:true,...(engine===chromium?{channel:process.platform==='win32'?'msedge':undefined}:{})});
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
test('application uses published guide and legal text, preserves progress on reload, and opens actual checkout page',async()=>{
  const p=await page();await f.service.handle(f.account(f.A),'application',{action:'START'});
  await p.goto(base+'/participate');await p.getByText('합성 테스트 안내',{exact:true}).waitFor();
  await p.locator('#guide-acknowledgement').check();await p.locator('#acknowledgement-form [type=submit]').click();
  await p.locator('[data-agreement-view=TERMS]').click();await p.getByText('합성 테스트 약관',{exact:true}).waitFor();
  await p.locator('#agreement-dialog-close').click();await p.locator('#required-agreement-all').check();await p.locator('#agreement-form [type=submit]').click();
  await p.reload();await p.locator('input[name=name]').waitFor();
  assert.equal((await f.service.handle(f.account(f.A),'context')).surface.step,'STEP_3');
  // Complete fields through the same HTTP BFF; form interaction has already
  // covered saved step transitions and real legal documents above.
  await p.evaluate(async()=>{await window.SSKR_PARTICIPATE_API.application('SAVE_PARTICIPANT_INFO',{participant:{name:'검수',email:'fixture@example.invalid',phone:'01012345678',priceTierId:'standard'}});});
  await p.reload();await p.locator('#payment-action').waitFor();assert.equal(await p.locator('.payment-notice').textContent(),'결제 전 확인결제 수단을 선택한 뒤 참가비를 확인해 주세요. 결제가 확인되면 참가가 확정됩니다.');
  await p.route('https://js.tosspayments.com/**',route=>route.fulfill({contentType:'text/javascript',body:'window.TossPayments=()=>({widgets:()=>({setAmount:async()=>{},renderPaymentMethods:async()=>{},renderAgreement:async()=>{},requestPayment:async()=>{}})});'}));
  await p.locator('#payment-action').click();await p.waitForURL('**/participate/payment.html');await p.getByRole('button',{name:'결제하기',exact:true}).waitFor();
  assert.match(await p.locator('#payment-status').textContent(),/테스트 결제 · 10,000원/);assert.deepEqual(p.errors,[]);await p.close();
});
test('operations settings and participant preparation fit mobile and desktop, without mock account data',async()=>{
  const checkout=(await f.service.handle(f.account(f.A),'payment',{action:'START'})).checkout;
  await f.service.handle(f.account(f.A),'payment',{action:'CONFIRM',orderId:checkout.orderId,paymentKey:'test'});
  for(const width of [360,390,430,1440]){
    const p=await page(width);await p.goto(base+'/app/admin/operations');await p.getByRole('button',{name:'접수 설정 저장'}).waitFor();
    assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    if([390,1440].includes(width)){const dir=process.env.SSKR_QA_OUTPUT||'D:/sskr-qa/service-workflows';fs.mkdirSync(dir,{recursive:true});await p.screenshot({path:path.join(dir,'operations-'+width+'.png')});}
    await p.goto(base+'/app/preparation');await p.locator('select[name=startLocationId]').waitFor();await p.locator('select[name=startLocationId]').selectOption('sokcho');await p.locator('[data-preparation=start] button').click();
    await p.locator('[data-preparation=start] [role=status]').filter({hasText:'저장'}).waitFor();
    assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.equal(await p.locator('.scenario-tag').count(),0);
    if([390,1440].includes(width)){const dir=process.env.SSKR_QA_OUTPUT||'D:/sskr-qa/service-workflows';fs.mkdirSync(dir,{recursive:true});await p.evaluate(()=>{document.activeElement.blur();window.scrollTo(0,0);});await p.screenshot({path:path.join(dir,'preparation-'+width+'.png'),fullPage:true});}
    assert.deepEqual(p.errors,[]);await p.close();
  }
});
test('real memorial archive is empty instead of showing synthetic riders',async()=>{
  const p=await page();await p.goto(base+'/app/memorials');await p.getByText('공개된 메모리얼이 아직 없어요.',{exact:true}).waitFor();
  assert.equal(await p.locator('.memorial-test-label').count(),0);assert.deepEqual(p.errors,[]);await p.close();
});

test('account contacts persist and published operations notices appear without leaking drafts',async()=>{
  const p=await page();await p.goto(base+'/app/profile');await p.locator('#profile-form').waitFor();
  await p.locator('[name=name]').fill('연락처 검수');await p.locator('[name=email]').fill('contact@example.invalid');await p.locator('[name=phone]').fill('01055556666');
  await p.getByRole('button',{name:'계정 정보 저장'}).click();await p.getByText('계정 정보를 저장했습니다.',{exact:true}).waitFor();
  await p.reload();assert.equal(await p.locator('[name=email]').inputValue(),'contact@example.invalid');
  await p.goto(base+'/app/admin/operations');await p.getByRole('button',{name:'공지 추가'}).click();
  await p.locator('[name=notice-title]').fill('검수 공지');await p.locator('[name=notice-body]').fill('공개된 운영 안내입니다.');await p.locator('[name=notice-published]').fill('2026-01-01T09:00');
  await p.getByRole('button',{name:'접수 설정 저장'}).click();
  try{await p.getByText('접수 설정을 저장했습니다.',{exact:true}).waitFor({timeout:5000});}catch(error){throw Error(await p.locator('#operations-status').textContent()+'; invalid='+JSON.stringify(await p.locator(':invalid').evaluateAll(nodes=>nodes.map(n=>({name:n.name,message:n.validationMessage}))))+'; errors='+p.errors.join(';'));}
  await p.goto(base+'/app/notices');await p.getByRole('heading',{name:'검수 공지',exact:true}).waitFor();assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  assert.deepEqual(p.errors,[]);await p.close();
});

test('ride check-ins create twelve real visits, and memorial edits survive reload and public withdrawal',async()=>{
  const catalog=require('../../web/app/spot-catalog');
  const p=await page();let ms=Date.parse('2099-10-16T06:05:00+09:00');f.setNow(ms);
  await p.addInitScript(()=>{navigator.geolocation.getCurrentPosition=resolve=>resolve(window.__gpsFixture);});
  await p.goto(base+'/app/ride');await p.locator('[data-checkin]').waitFor();
  const visits=['sokcho',...catalog.filter(p=>p.kind==='spot').slice(0,10).map(p=>p.id),'daecheon'];
  for(const id of visits){
    ms+=60000;f.setNow(ms);const point=catalog.find(p=>p.id===id);
    await p.evaluate(({point,ms})=>window.__gpsFixture={coords:{latitude:point.lat,longitude:point.lng,accuracy:10},timestamp:ms},{point,ms});
    await p.locator('[data-checkin]').click();
    await p.locator('.service-visits li').filter({hasText:point.name}).getByText('체크인 완료',{exact:true}).waitFor();
  }
  assert.equal(await p.locator('.service-visits li').count(),12);
  await p.getByRole('link',{name:'완주 기록 보기'}).click();await p.getByRole('link',{name:'관리',exact:true}).click();
  await p.locator('#memorial-title').fill('실제 흐름 검수 기록');await p.locator('#memorial-summary').fill('체크인으로 만든 여정');
  await p.locator('input[name=visibility][value=PUBLIC]').check();await p.locator('input[name=publishStatus][value=PUBLISHED]').check();
  await p.locator('[data-visit-note]').first().fill('출발 기록');await p.getByRole('button',{name:'변경 내용 저장',exact:true}).click();
  await p.getByText('변경 내용을 저장했습니다.',{exact:true}).waitFor();
  await p.reload();assert.equal(await p.locator('#memorial-title').inputValue(),'실제 흐름 검수 기록');
  assert.equal(await p.locator('[data-visit-note]').first().inputValue(),'출발 기록');
  assert.equal((await f.service.memorials(null)).items.length,1);
  await p.locator('input[name=visibility][value=PRIVATE]').check();await p.getByRole('button',{name:'변경 내용 저장',exact:true}).click();
  await p.getByText('변경 내용을 저장했습니다.',{exact:true}).waitFor();assert.equal((await f.service.memorials(null)).items.length,0);
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.deepEqual(p.errors,[]);await p.close();
});

test('test participation uses the real workflow without checkout, persists confirmation, and hides refunds',async()=>{
  const {createWorkflows}=require('../../server/backend/workflows');
  f.service=createWorkflows({db:f.adapter,testParticipation:true,payments:{ready:false},clock:()=>new Date('2026-10-16T00:00:00Z')});
  await f.db.query("update sskr_private.workflows set document='{}' where owner_id=$1",[f.A]);
  const s=await f.service.operations(f.account(f.A),{action:'READ'});
  await f.service.operations(f.account(f.A),{action:'CONFIGURE',revision:s.epoch,commerce:{...f.commerce,baseCapacity:100,priceTiers:[],refundPolicy:{}}});
  await f.service.handle(f.account(f.A),'application',{action:'START'});
  const p=await page();await p.goto(base+'/participate');
  await p.locator('#guide-acknowledgement').check();await p.locator('#acknowledgement-form [type=submit]').click();
  await p.locator('#required-agreement-all').check();await p.locator('#agreement-form [type=submit]').click();
  assert.equal(await p.locator('[name=priceTierId]').isChecked(),true);await p.locator('[name=name]').fill('테스트 참가자');
  await p.locator('[name=phone]').fill('01012345678');await p.locator('[name=email]').fill('fixture@example.invalid');
  await p.locator('#participant-form [type=submit]').click();await p.locator('#confirm-test').waitFor();
  assert.equal(await p.locator('#payment-action').count(),0);
  const output=process.env.SSKR_QA_OUTPUT||'D:/sskr-qa/service-workflows';fs.mkdirSync(output,{recursive:true});
  await p.screenshot({path:path.join(output,'test-participation-390.png'),fullPage:true});
  await p.locator('#confirm-test').click();await p.getByText('테스트 참가 · 결제 없음',{exact:true}).waitFor();await p.locator('.completion-actions a[href="/app"]').click();await p.waitForURL('**/app');
  await p.locator('.manager-dashboard').waitFor();
  await p.reload();await p.locator('.manager-dashboard').waitFor();assert.equal((await f.service.handle(f.account(f.A),'context')).participation.state,'ACTIVE');
  await p.goto(base+'/app/preparation');await p.getByText('결제와 실제 키트 제공은 진행하지 않습니다.').waitFor();
  assert.equal(await p.locator('[data-refund]').count(),0);assert.deepEqual(p.errors,[]);
  await p.goto(base+'/app/admin/operations');await p.getByText(/테스트 참가 · 결제 없음/).waitFor();
  assert.equal(await p.locator('[name=STANDARD-amount]').count(),0);assert.equal(await p.locator('[name=refundText]').count(),0);
  await p.locator('form [type=submit]').click();await p.getByText('접수 설정을 저장했습니다.',{exact:true}).waitFor();
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await p.close();
});
