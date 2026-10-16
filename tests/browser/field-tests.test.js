'use strict';
// Browser + actual BFF + isolated PostgreSQL. Identity and GPS are fixtures;
// real mobile GPS and site access still require an on-site test.
const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const {chromium,webkit}=require('playwright');
const {spawn}=require('node:child_process');
const net=require('node:net'),path=require('node:path'),fs=require('node:fs');
const {fixture}=require('../backend/workflow-fixture');
const {createHandler}=require('../../server/backend/handler');
const {createFieldTests}=require('../../server/backend/field-tests');
let f,browser,server,base,handler,service;
before(async()=>{
  f=await fixture();const port=await new Promise(resolve=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>resolve(p));});});base='http://127.0.0.1:'+port;
  server=spawn(process.execPath,['server/dev-server.js'],{cwd:path.resolve(__dirname,'../..'),env:{...process.env,SSKR_DEV_PORT:String(port),SSKR_BACKEND_MODE:'mock'},stdio:['ignore','pipe','pipe'],windowsHide:true});
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('startup')),10000);server.stdout.on('data',s=>{if(String(s).includes('SSKR dev server')){clearTimeout(timer);resolve();}});});
  const db={async rpc(name,args){try{return {data:(await f.db.query('select public.sskr_field_tests($1,$2,$3,$4,$5) result',[args.p_action,args.p_actor,JSON.stringify(args.p_data),args.p_id,args.p_revision])).rows[0].result};}catch(e){return {error:{message:e.message}};}}};
  service=createFieldTests({db});
  handler=createHandler({getConfig:()=>({mode:'supabase',participationMode:'test',origin:base}),authService:{actor:async()=>({account:f.account(f.A)})},getFieldTests:()=>service});
  const engine=process.env.BROWSER_ENGINE==='webkit'?webkit:chromium;
  browser=await engine.launch({headless:true,...(engine===chromium?{channel:process.platform==='win32'?'msedge':undefined}:{})});
});
after(async()=>{await browser?.close();server?.kill();await f?.db.close();});
async function page(width=390){
  const p=await browser.newPage({viewport:{width,height:844},hasTouch:width<=430,isMobile:width<=430,locale:'ko-KR',timezoneId:'Asia/Seoul',reducedMotion:'reduce'});p.errors=[];p.on('pageerror',e=>p.errors.push(e.message));
  await p.route('**/api/backend?*',async route=>{const r=route.request();let status=200,headers={},body;
    const req={url:r.url(),method:r.method(),headers:await r.allHeaders(),body:r.postData()||undefined};const res={writeHead:(s,h)=>{status=s;Object.assign(headers,h);},end:v=>body=v};
    await handler(req,res);await route.fulfill({status,headers,body:body||''});});
  await p.addInitScript(()=>{navigator.geolocation.getCurrentPosition=resolve=>resolve({coords:window.__gps,timestamp:Date.now()});});return p;
}
test('admin custom times/destination persist and controls fit mobile/tablet/desktop',async()=>{
  for(const width of [360,390,430,768,1440]){
    const p=await page(width);await p.goto(base+'/app/admin/gps');await p.locator('#config-form').waitFor();
    await p.locator('[name=title]').fill('현장 검수 '+width);await p.locator('[data-day="1"]').click();
    const tomorrow=await p.locator('[name=startAt]').inputValue();assert.match(tomorrow,/T00:00$/);
    await p.locator('[data-day="0"]').click();await p.locator('[name=finishId]').selectOption('test-walk-29');
    await p.getByRole('button',{name:'테스트 설정 저장',exact:true}).click();await p.getByText('테스트 설정을 저장했습니다.',{exact:true}).waitFor();
    const id=await p.locator('#edit-session').inputValue();await p.reload();await p.locator('#config-form').waitFor();await p.locator('#edit-session').selectOption(id);
    assert.equal(await p.locator('[name=finishId]').inputValue(),'test-walk-29');
    assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    const sizes=await p.locator('#config-form input:not([type=checkbox]),#config-form select').evaluateAll(ns=>ns.map(n=>({w:n.getBoundingClientRect().width,h:n.getBoundingClientRect().height})));assert.ok(sizes.every(s=>s.h>=44&&s.w>100));
    if([390,1440].includes(width)){fs.mkdirSync(output(),{recursive:true});await p.screenshot({path:path.join(output(),'gps-admin-'+width+'.png'),fullPage:true});}
    assert.deepEqual(p.errors,[]);await p.close();
  }
});
function output(){return process.env.SSKR_QA_OUTPUT||'D:/sskr-qa/gps-test/ui';}
test('single tap test markers, GPS checkin, reload, nearest and compact label geometry',async()=>{
  for(const width of [360,390,430,768,1440]){
    const p=await page(width);await p.goto(base+'/app/gps-test');await p.locator('#session option').first().waitFor({state:'attached'});
    await p.locator('#session').selectOption('bfc00000-0000-4000-8000-000000000001');await p.locator('#begin').click();await p.locator('#checkin').waitFor();
    const start=require('../../server/data/field-test-places.json').records.find(p=>p.id==='test-start-ori');
    await p.evaluate(p=>window.__gps={latitude:p.lat,longitude:p.lng,accuracy:8},start);await p.locator('#checkin').click();await p.getByText('체크인을 완료했습니다.',{exact:true}).waitFor();
    await p.reload();await p.locator('#checkin').waitFor();assert.match(await p.locator('#progress').textContent(),/진행 중/);
    await p.locator('.spot-pin').first().waitFor();const labels=await p.locator('.spot-pin>span').allTextContents();assert.ok(labels.length>=30);assert.ok(labels.every(s=>s==='테'));
    const target=require('../../server/data/field-test-places.json').records.find(p=>p.id==='test-walk-01');await p.locator('#place').selectOption(target.id);
    await p.evaluate(p=>window.__gps={latitude:p.lat,longitude:p.lng,accuracy:8},target);await p.locator('#checkin').click();await p.getByText('체크인을 완료했습니다.',{exact:true}).waitFor();
    assert.match(await p.locator('#progress').textContent(),/1 \/ 10/);
    await p.locator('#nearest').click();assert.notEqual(await p.locator('#place').inputValue(),target.id);
    await p.locator('.spot-map-controls [data-action=fit]').click();
    const marker=p.locator('.spot-pin[aria-label="탄천 죽전 방면 산책로 11 · 테스트 스팟"]');
    if(width<=430)await marker.tap();else await marker.click();
    await p.waitForFunction(()=>document.querySelector('#place-name').textContent==='탄천 죽전 방면 산책로 11');
    assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    const center=await p.locator('.spot-pin>span').first().evaluate(n=>{const b=n.getBoundingClientRect(),r=document.createRange();r.selectNodeContents(n);const t=r.getBoundingClientRect();return {x:Math.abs((b.left+b.right-t.left-t.right)/2),y:Math.abs((b.top+b.bottom-t.top-t.bottom)/2),w:b.width,h:b.height};});assert.ok(center.x<1.1&&center.y<2.1&&center.w<=24&&center.h<=24,JSON.stringify(center));
    if([390,1440].includes(width)){fs.mkdirSync(output(),{recursive:true});await p.screenshot({path:path.join(output(),'gps-run-'+width+'.png'),fullPage:true});}
    assert.deepEqual(p.errors,[]);await p.close();
  }
});
