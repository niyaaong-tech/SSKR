// Exercises the real BFF handler + PostgreSQL functions + browser adapter.
// Only identity verification is injected; this is not a live Google/Supabase test.
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), net = require('node:net');
const { spawn } = require('node:child_process');
const { chromium, webkit } = require('playwright');
const { PGlite } = require('@electric-sql/pglite');
const { createHandler } = require('../../server/backend/handler');
const { context: backendContext } = require('../../server/backend/context');
const A = '00000000-0000-4000-8000-000000000001', S = '00000000-0000-4000-8000-000000000003';
let db, browser, server, base, handler, delaySave, releaseSave;
const account = { id: A, linked: true, provider: 'google', profile: { name: '서버 저장 검수', email: 'test@example.invalid' } };
before(async () => {
  const port = await new Promise(resolve => { const socket = net.createServer(); socket.listen(0,'127.0.0.1',()=>{const port=socket.address().port;socket.close(()=>resolve(port));}); });
  base = 'http://127.0.0.1:' + port;
  server = spawn(process.execPath,['server/dev-server.js'],{cwd:path.resolve(__dirname,'../..'),env:{...process.env,SSKR_DEV_PORT:String(port),SSKR_BACKEND_MODE:'mock'},windowsHide:true,stdio:['ignore','pipe','pipe']});
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Server startup timeout')),10000);server.stdout.on('data',chunk=>{if(String(chunk).includes('SSKR dev server')){clearTimeout(timer);resolve();}});server.once('error',reject);});
  db = new PGlite();
  await db.exec(`create role anon; create role authenticated; create schema auth;
    create table auth.users(id uuid primary key,banned_until timestamptz,is_anonymous boolean default false);
    create table auth.sessions(id uuid primary key,user_id uuid,not_after timestamptz);
    create table auth.identities(user_id uuid,provider text);
    create function auth.uid() returns uuid language sql as $$select '${A}'::uuid$$;
    create function auth.jwt() returns jsonb language sql as $$select '{"session_id":"${S}"}'::jsonb$$;
    insert into auth.users(id) values('${A}');insert into auth.identities values('${A}','google');insert into auth.sessions(id,user_id) values('${S}','${A}');`);
  for(const file of fs.readdirSync('supabase/migrations').filter(f=>f.endsWith('.sql')).sort()) await db.exec(fs.readFileSync('supabase/migrations/'+file,'utf8'));
  handler = createHandler({readMode:()=> 'supabase',getConfig:()=>({mode:'supabase',origin:base}),workflowEnabled:()=>false,getWorkflows:()=>({memorials:async()=>({ok:true,items:(await db.query("select public.sskr_workflow('memorials',$1) result",[A])).rows[0].result.items})}),authService:{async actor(){return {id:A,account,db:{async rpc(name,args){
    try { const response=name==='sskr_public_event'?await db.query('select public.sskr_public_event() as result'):await db.query('select public.sskr_routes($1,$2,$3::jsonb,$4::jsonb,$5,$6) as result',[args.p_action,args.p_id,JSON.stringify(args.p_plan),JSON.stringify(args.p_schedule),args.p_revision,args.p_key]);return {data:response.rows[0].result}; }
    catch(error){return {error:{message:error.message}};}
  }}};}}});
  const engine=process.env.BROWSER_ENGINE==='webkit'?webkit:chromium;
  browser=await engine.launch({headless:true,...(engine===chromium?{channel:process.env.BROWSER_CHANNEL||(process.platform==='win32'?'msedge':undefined)}:{})});
});
after(async()=>{await browser?.close();server?.kill();await db?.close();});
async function page(width=1440){
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});page.errors=[];page.on('pageerror',error=>page.errors.push(error.message));
  const api=async route=>{
    const request=route.request(),headers=await request.allHeaders();let status=200,responseHeaders={},body='';
    const req={url:request.url(),method:request.method(),headers,body:request.postData()||undefined,query:request.url().includes('/api/participate/context')?{resource:'context'}:undefined};
    const res={getHeader:key=>responseHeaders[key],setHeader:(key,value)=>{responseHeaders[key]=value;},writeHead:(value,h)=>{status=value;Object.assign(responseHeaders,h);},end:value=>{body=value||'';}};
    await handler(req,res);
    if(delaySave&&['POST','PUT'].includes(req.method)&&req.url.includes('resource=routes')){const gate=delaySave;delaySave=null;await gate;}
    await route.fulfill({status,headers:responseHeaders,body});
  };
  await page.route('**/api/backend?*',api);await page.route('**/api/participate/context',api);
  return page;
}
const draft=p=>p.evaluate(()=>JSON.parse(sessionStorage.getItem('sskr.route-editor')).plan);
async function open(p){await p.goto(base+'/app/spots?mode=plan&scenario=active');await p.waitForSelector('[data-route-title]');await p.waitForFunction(()=>!document.querySelector('.rp-operation')?.textContent.includes('준비하고'));}
test('server-backed drafts save atomically, preserve edits during responses, reload and detect conflicts',async()=>{
  const p=await page();await open(p);
  assert.equal(await p.locator('.scenario-tag').count(),0);
  await p.getByRole('button',{name:'출발지 선택',exact:true}).click();await p.locator('[data-start-id=sokcho]').click();
  await p.waitForFunction(()=>!document.querySelector('.rp-operation')?.textContent.includes('연결 중'));
  await p.locator('[data-route-title]').fill('');
  delaySave=new Promise(resolve=>{releaseSave=resolve;});
  await p.locator('[data-rp-action=save]').click();
  await p.getByText('루트를 저장하고 있어요.',{exact:true}).waitFor();
  await p.locator('[data-route-title]').fill('응답 중 바꾼 이름');releaseSave();
  await p.waitForFunction(()=>JSON.parse(sessionStorage.getItem('sskr.route-editor')).plan.id);
  let current=await draft(p);assert.equal(current.title,'응답 중 바꾼 이름');assert.equal(current.ownerUserId,A);
  assert.equal((await db.query('select plan->>\'title\' as title from sskr_private.routes')).rows[0].title,'루트 01');
  await p.locator('[data-rp-action=save]').click();await p.getByText('루트를 저장했습니다.',{exact:true}).waitFor();
  await p.getByLabel('휴게시간(분)',{exact:true}).fill('75');
  await p.waitForTimeout(700);
  const saved=(await db.query('select plan,schedule,revision from sskr_private.routes')).rows[0];assert.equal(saved.schedule.breakMinutes,75);assert.equal(saved.plan.title,current.title);
  await p.reload();await p.waitForSelector('[data-route-title]');assert.equal(await p.getByLabel('휴게시간(분)',{exact:true}).inputValue(),'75');
  const other=await page(390);await other.goto(base+'/app/spots?mode=plan&tab=saved');
  await other.locator('.rp-saved [data-rp-action=load]').click();assert.equal((await draft(other)).id,current.id);
  await other.locator('[data-route-title]').fill('다른 기기의 수정');await other.locator('[data-rp-action=save]').click();await other.getByText('루트를 저장했습니다.',{exact:true}).waitFor();
  await p.locator('[data-route-title]').fill('충돌 시 유지할 편집본');await p.locator('[data-rp-action=save]').click();await p.getByText(/다른 화면에서 이 루트가 변경되었습니다/).waitFor();
  assert.equal((await draft(p)).title,'충돌 시 유지할 편집본');
  assert.equal((await db.query('select plan->>\'title\' as title from sskr_private.routes')).rows[0].title,'다른 기기의 수정');
  assert.deepEqual(p.errors,[]);assert.deepEqual(other.errors,[]);await other.close();await p.close();
});
test('live mode exposes no mock account controls, participant records or synthetic notices',async()=>{
  const p=await page(390);await p.goto(base+'/app?scenario=active');await p.waitForSelector('.manager-dashboard');
  assert.equal(await p.locator('.manager-alert').count(),0);assert.equal(await p.locator('.manager-event-banner').count(),0);
  await p.getByRole('button',{name:'계정 메뉴 열기'}).click();assert.equal(await p.locator('[data-account-action=reset]').count(),0);
  await p.goto(base+'/app/my?scenario=private-owner');await p.getByText('아직 남겨진 여정이 없어요.',{exact:true}).waitFor();assert.equal(await p.locator('.memorial-record').count(),0);
  assert.deepEqual(p.errors,[]);await p.close();
});
test('only the current mock draft is offered for explicit migration with a new real owner',async()=>{
  const p=await page();const before=(await db.query('select count(*)::int as count from sskr_private.routes')).rows[0].count;
  await p.addInitScript(()=>{
    sessionStorage.setItem('sskr.route-editor',JSON.stringify({backend:'mock',ownerId:'mock-other',active:true,dirty:true,plan:{id:'mock-saved-id',ownerUserId:'mock-other',title:'이전 편집본',startId:'sokcho',stopIds:['auraji'],pinnedStopIds:['auraji'],finishId:'daecheon'},schedule:{departureTime:'07:00',breakMinutes:90},autoDeparture:false}));
    localStorage.setItem('sskr.mock.route-plans:mock-other','untouched');
  });
  await open(p);let value=await draft(p);assert.equal(value.id,null);assert.equal(value.title,'이전 편집본');assert.deepEqual(value.stopIds,['auraji']);
  assert.equal((await db.query('select count(*)::int as count from sskr_private.routes')).rows[0].count,before);
  await p.waitForFunction(()=>!document.querySelector('.rp-operation')?.textContent.includes('연결 중'));
  await p.locator('[data-rp-action=save]').click();await p.getByText('루트를 저장했습니다.',{exact:true}).waitFor();
  value=await draft(p);assert.equal(value.ownerUserId,A);assert.notEqual(value.id,'mock-saved-id');
  assert.equal(await p.evaluate(()=>localStorage.getItem('sskr.mock.route-plans:mock-other')),'untouched');assert.deepEqual(p.errors,[]);await p.close();
});
test('cancelled and expired OAuth returns show one notice, consume the error and allow the next login to save',async()=>{
  for(const error of ['cancelled','expired']){
    const p=await page(390);let linked=false,returnTo;
    await p.route('**/api/participate/context',route=>route.fulfill({json:backendContext(linked?account:null)}));
    await p.route('**/api/backend?resource=login',route=>{
      returnTo=route.request().postDataJSON().returnTo;linked=true;
      return route.fulfill({json:{ok:true,url:base+returnTo}});
    });
    await p.addInitScript(()=>{
      if(sessionStorage.getItem('oauth-test-initialized'))return;
      sessionStorage.setItem('oauth-test-initialized','1');
      sessionStorage.setItem('sskr.route-save-after-login',String(Date.now()));
      sessionStorage.setItem('sskr.route-editor',JSON.stringify({backend:'supabase',ownerId:null,active:true,dirty:true,plan:{title:'로그인 재시도 검수',startId:'sokcho',stopIds:['auraji'],finishId:'daecheon'},schedule:{departureTime:'07:00',breakMinutes:90},autoDeparture:false}));
    });
    const before=(await db.query('select count(*)::int as count from sskr_private.routes')).rows[0].count;
    await p.goto(base+'/app/spots?mode=plan&authError='+error);await p.waitForSelector('[data-route-title]');
    assert.match(await p.locator('[data-auth-notice]').textContent(),error==='cancelled'?/로그인이 취소되었습니다/:/로그인 연결이 만료되었습니다/);
    assert.equal(new URL(p.url()).searchParams.has('authError'),false);
    assert.equal(await p.evaluate(()=>sessionStorage.getItem('sskr.route-save-after-login')),null);
    assert.deepEqual((await draft(p)).stopIds,['auraji']);
    assert.equal((await db.query('select count(*)::int as count from sskr_private.routes')).rows[0].count,before);
    await p.locator('[data-rp-action=save]').click();await p.locator('.rp-auth [data-provider=google]').click();
    await p.getByText('루트를 저장했습니다.',{exact:true}).waitFor();
    assert.equal(new URL(returnTo,base).searchParams.has('authError'),false);assert.equal(await p.locator('[data-auth-notice]').count(),0);
    assert.equal((await db.query('select count(*)::int as count from sskr_private.routes')).rows[0].count,before+1);
    assert.equal((await draft(p)).ownerUserId,A);assert.deepEqual(p.errors,[]);await p.close();
  }
});
test('a rejected session reopens as a guest without losing the owned draft or its revision',async()=>{
  const p=await page();let state='expired';
  const catalog=require('../../web/app/spot-catalog'),domain=require('../../web/app/route-plan'),routing=require('../../web/shared/routes/manifest.json');
  const seed={...domain.createEmpty(catalog),startId:'sokcho',stopIds:['auraji'],routingVersion:routing.version};
  const stored=(await db.query('select public.sskr_routes($1,null,$2::jsonb,$3::jsonb,null,$4) as result',['save',JSON.stringify(seed),JSON.stringify({departureTime:'07:00',breakMinutes:90,autoDeparture:false}),'expired-session-test-fixture'])).rows[0].result;
  await p.route('**/api/participate/context',route=>{
    if(state==='expired'){state='guest';return route.fulfill({status:401,json:{ok:false,error:{code:'AUTH_REQUIRED',userMessage:'다시 로그인해 주세요.'}}});}
    return route.fulfill({json:backendContext(state==='linked'?account:null)});
  });
  await p.route('**/api/backend?resource=login',route=>{state='linked';return route.fulfill({json:{ok:true,url:base+route.request().postDataJSON().returnTo}});});
  await p.addInitScript(({stored,A})=>{
    if(sessionStorage.getItem('oauth-test-initialized'))return;
    sessionStorage.setItem('oauth-test-initialized','1');
    sessionStorage.setItem('sskr.route-editor',JSON.stringify({backend:'supabase',ownerId:A,active:true,dirty:true,plan:{...stored.plan,title:'만료 뒤에도 유지할 편집본'},schedule:stored.schedule,serverRevision:stored.revision}));
  },{stored,A});
  const before=(await db.query('select count(*)::int as count from sskr_private.routes')).rows[0].count;
  await open(p);assert.match(await p.locator('[data-auth-notice]').textContent(),/로그인이 만료되었습니다/);
  assert.equal((await draft(p)).id,stored.plan.id);assert.equal((await draft(p)).title,'만료 뒤에도 유지할 편집본');
  await p.reload();await p.waitForSelector('[data-route-title]');assert.equal((await draft(p)).id,stored.plan.id);
  await p.locator('[data-rp-action=save]').click();await p.locator('.rp-auth [data-provider=google]').click();
  await p.getByText('루트를 저장했습니다.',{exact:true}).waitFor();
  assert.equal((await draft(p)).id,stored.plan.id);assert.equal(await p.evaluate(()=>sessionStorage.getItem('sskr.route-relogin-owner')),null);
  assert.equal((await db.query('select count(*)::int as count from sskr_private.routes')).rows[0].count,before);
  assert.equal((await db.query('select revision from sskr_private.routes where id=$1',[stored.plan.id])).rows[0].revision,Number(stored.revision)+1);
  assert.deepEqual(p.errors,[]);await p.close();
});
test('participation OAuth cancellation and expiry keep the guide usable and allow a clean login retry',async()=>{
  for(const error of ['cancelled','expired']){
    const p=await page(390);let linked=false,returnTo;
    await p.route('**/api/participate/context',route=>route.fulfill({json:backendContext(linked?account:null)}));
    await p.route('**/api/backend?resource=login',route=>{
      returnTo=route.request().postDataJSON().returnTo;linked=true;
      return route.fulfill({json:{ok:true,url:base+returnTo}});
    });
    await p.goto(base+'/participate?view=guide&authError='+error);
    await p.getByRole('heading',{name:'다음 SSKR을 준비하고 있어요'}).waitFor();
    assert.match(await p.locator('[data-auth-notice]').textContent(),error==='cancelled'?/로그인이 취소되었습니다/:/로그인 연결이 만료되었습니다/);
    assert.equal(new URL(p.url()).searchParams.has('authError'),false);
    assert.equal(new URL(p.url()).searchParams.get('view'),'guide');
    assert.equal(await p.locator('#mode-error').isVisible(),false);
    await p.getByRole('button',{name:'로그인',exact:true}).click();
    await p.locator('#participate-social-auth [data-provider=google]').click();
    await p.waitForFunction(()=>window.SSKR_PARTICIPATE?.getContext()?.account?.linked);
    assert.equal(new URL(returnTo,base).searchParams.has('authError'),false);
    assert.equal(await p.locator('[data-auth-notice]').count(),0);
    assert.equal(await p.locator('#mode-a').isVisible(),true);assert.deepEqual(p.errors,[]);await p.close();
  }
});
test('participation recovers once from a rejected session and preserves a route draft for reauthentication',async()=>{
  const p=await page();let requests=0;
  await p.route('**/api/participate/context',route=>++requests===1
    ?route.fulfill({status:401,json:{ok:false,error:{code:'AUTH_REQUIRED',userMessage:'다시 로그인해 주세요.'}}})
    :route.fulfill({json:backendContext(null)}));
  await p.addInitScript(A=>sessionStorage.setItem('sskr.route-editor',JSON.stringify({backend:'supabase',ownerId:A,active:true,plan:{title:'기존 편집본',startId:'sokcho',stopIds:['auraji']}})),A);
  await p.goto(base+'/participate?view=guide');await p.getByRole('heading',{name:'다음 SSKR을 준비하고 있어요'}).waitFor();
  assert.equal(requests,2);assert.equal(await p.locator('#mode-error').isVisible(),false);
  assert.match(await p.locator('[data-auth-notice]').textContent(),/로그인이 만료되었습니다/);
  assert.equal(await p.evaluate(()=>sessionStorage.getItem('sskr.route-relogin-owner')),A);
  assert.equal((await draft(p)).title,'기존 편집본');assert.equal((await draft(p)).stopIds[0],'auraji');
  await p.getByRole('button',{name:'로그인',exact:true}).click();assert.equal(await p.locator('#participate-social-auth [data-provider=google]').isEnabled(),true);
  assert.deepEqual(p.errors,[]);await p.close();
});
