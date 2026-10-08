const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const net=require('node:net'),path=require('node:path'),fs=require('node:fs');
const {chromium}=require('playwright');
let server,browser,base;const errors=[];
before(async()=>{
 const port=await new Promise(resolve=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const port=s.address().port;s.close(()=>resolve(port));});});
 base='http://127.0.0.1:'+port;
 server=spawn(process.execPath,['server/dev-server.js'],{cwd:path.resolve(__dirname,'../..'),env:{...process.env,SSKR_DEV_PORT:String(port)},stdio:['ignore','pipe','pipe'],windowsHide:true});
 await new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(Error('Server timeout')),10000);server.stdout.on('data',b=>{if(b.toString().includes('SSKR dev server')){clearTimeout(t);resolve();}});server.once('error',reject);});
 browser=await chromium.launch({headless:true,channel:process.platform==='win32'?'msedge':undefined});
});
after(async()=>{await browser?.close();server?.kill();});
async function page(width=1440,height=1000){const p=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});p.on('pageerror',e=>errors.push(e.message));return p;}
async function open(p,url,selector){await p.goto(base+url);await p.waitForSelector(selector||'.manager-dashboard');}
async function capture(p,name){if(process.env.SSKR_QA_OUTPUT){fs.mkdirSync(process.env.SSKR_QA_OUTPUT,{recursive:true});await p.evaluate(async()=>{await Promise.all([...document.querySelectorAll('#app-main img')].map(img=>{img.loading='eager';return img.decode().catch(()=>{});}));});await p.screenshot({path:path.join(process.env.SSKR_QA_OUTPUT,name+'.png'),fullPage:true});}}
test('legacy entry redirects retain scenarios and guide remains accessible to confirmed participants',async()=>{
 const p=await page();await open(p,'/app?scenario=active');await open(p,'/app/current?scenario=active','#mode-a.is-active');assert.match(p.url(),/view=guide/);assert.match(p.url(),/scenario=active/);
 assert.equal(await p.locator('#event-subtitle').textContent(),'참가 안내');await p.locator('#primary-action').click();await p.waitForSelector('#mode-c.is-active');assert.match(await p.locator('#mode-c').textContent(),/참가가 확정/);assert.doesNotMatch(p.url(),/view=guide/);
 await open(p,'/app/memorials/mine?scenario=private-owner','.memorial-library');assert.equal(new URL(p.url()).pathname,'/app/my');
 await open(p,'/app/memorials/all?scenario=guest','.memorial-archive');assert.equal(new URL(p.url()).pathname,'/app/memorials');await p.close();
});
test('manager responsive layouts have four navigation destinations and a compact live event banner',async()=>{
 const p=await page();await open(p,'/app?scenario=guest');
 assert.equal(await p.locator('#app-nav nav a').count(),4);assert.equal(await p.locator('a[href="/app/current"]').count(),0);
 assert.equal(await p.locator('.manager-welcome .manager-primary').getAttribute('href'),'/app/spots?mode=plan');
 for(const w of [360,390,430,768,1280,1440,1920]){await p.setViewportSize({width:w,height:900});assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),String(w));assert.ok((await p.locator('.manager-event-banner').boundingBox()).height<110,String(w));if(w===390||w===1440)await capture(p,'manager-'+w);}
 await p.locator('.manager-welcome .manager-primary').click();await p.waitForSelector('.spot-workbench.is-planning');assert.equal(await p.locator('[data-spot-mode="plan"]').getAttribute('aria-pressed'),'true');await p.close();
});
test('linked nonparticipant manager reads actual saved routes and opens the saved tab',async()=>{
 const p=await page(390,844);await open(p,'/app?scenario=logged-in-no-application');
 await p.evaluate(()=>{const account={id:'mock-rider-0271',linked:true};const d=SSKR_ROUTE_PLAN;d.createStore(localStorage,SSKR_SPOT_CATALOG).save({...d.createEmpty(SSKR_SPOT_CATALOG),title:'다음 주의 바닷길'},account);});
 await p.reload();await p.waitForSelector('.manager-plan-card');assert.match(await p.locator('.manager-plan-card').textContent(),/다음 주의 바닷길/);
 await p.locator('.manager-welcome .manager-primary').click();await p.waitForSelector('#rp-tab-saved[aria-selected="true"]');assert.match(await p.locator('.rp-saved').textContent(),/다음 주의 바닷길/);await p.close();
});
test('public gallery pagination, filters and reading position survive a detail roundtrip',async()=>{
 const p=await page();await open(p,'/app/memorials?scenario=guest','.memorial-archive');assert.equal(await p.locator('.memorial-thumbnail').count(),12);
 await p.locator('[data-load-more]').click();assert.equal(await p.locator('.memorial-thumbnail').count(),24);
 const card=p.locator('.memorial-thumbnail a').nth(14);await card.scrollIntoViewIfNeeded();const y=await p.evaluate(()=>scrollY);
 await card.click();await p.waitForSelector('.memorial-detail');await p.waitForSelector('.journey-visit-photo');
 assert.equal(await p.locator('.memorial-place-photos').count(),0);assert.equal(await p.locator('.journey-map-host .spot-map').count(),1);
 await p.locator('.memorial-back').click();await p.waitForSelector('.memorial-archive');await p.waitForTimeout(200);assert.equal(await p.locator('.memorial-thumbnail').count(),24);assert.ok(Math.abs((await p.evaluate(()=>scrollY))-y)<100);
 await p.locator('[data-memorial-search]').fill('없는기록검색');assert.match(await p.locator('.memorial-empty').textContent(),/검색 결과/);
 await p.locator('[data-memorial-search]').fill('');await p.locator('[data-memorial-start]').selectOption('gangneung');assert.ok(await p.locator('.memorial-thumbnail').count()>0);
 await p.locator('.memorial-thumbnail a').first().click();await p.waitForSelector('.memorial-detail');await p.locator('.memorial-back').click();await p.waitForSelector('.memorial-archive');assert.equal(await p.locator('[data-memorial-start]').inputValue(),'gangneung');await p.close();
});
test('gallery and personal archive fit mobile and desktop, with photos loaded',async()=>{
 const p=await page();for(const [url,selector,name] of [['/app/memorials?scenario=guest','.memorial-archive','gallery'],['/app/my?scenario=private-owner','.memorial-library','my']]){
 await open(p,url,selector);for(const w of [360,390,430,768,1280,1440,1920]){await p.setViewportSize({width:w,height:900});assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),name+w);if(w===390||w===1440)await capture(p,name+'-'+w);}
 }assert.ok(await p.locator('.memorial-record-photo img').first().evaluate(img=>img.complete&&img.naturalWidth>0));await p.close();
});
test('personal record edit persists visibility and public gallery hides the private record',async()=>{
 const p=await page(390,844);await open(p,'/app/my?scenario=private-owner','.memorial-library');const edit=p.locator('.memorial-record-actions a').filter({hasText:'관리'}).first();await edit.click();await p.waitForSelector('.memorial-form');
 const id=await p.locator('.memorial-form').getAttribute('data-memorial-id');await p.locator('#memorial-title').fill('내가 간직한 하루');await p.locator('input[value="PRIVATE"]').check();await p.locator('.memorial-form button[type=submit]').click();assert.match(await p.locator('.memorial-save-status').textContent(),/저장했습니다/);
 await p.locator('.memorial-back').click();await p.waitForSelector('.memorial-library');assert.match(await p.locator('.memorial-record').first().textContent(),/내가 간직한 하루/);assert.match(await p.locator('.memorial-record').first().textContent(),/나만 보기/);
 await open(p,'/app/memorials?scenario=private-owner','.memorial-archive');await p.locator('[data-load-more]').click();await p.locator('[data-load-more]').click();assert.equal(await p.locator('a[href="/app/memorials/'+id+'"]').count(),0);
 await open(p,'/app/memorials/'+id+'?scenario=private-other','.memorial-unavailable');assert.match(await p.locator('.memorial-unavailable').textContent(),/비공개/);await p.close();
});
test('guest login returns to my records and scripts report no uncaught errors',async()=>{
 const p=await page();await open(p,'/app/my?scenario=guest','.auth-gate');await p.getByRole('button',{name:/Google로/}).click();await p.waitForSelector('.memorial-library');assert.equal(new URL(p.url()).pathname,'/app/my');await p.close();assert.deepEqual(errors,[]);
});

test('owner public detail returns to its gallery and history without a memorial remains visible',async()=>{
 const p=await page();await open(p,'/app/my?scenario=logged-in-no-application','.memorial-library');
 const ownHref=await p.locator('.memorial-record-actions a').first().getAttribute('href');
 await p.locator('#app-nav a[href="/app/memorials"]').click();await p.waitForSelector('.memorial-archive');
 while(await p.locator(`a[href="${ownHref}"]`).count()===0&&await p.locator('[data-load-more]').isVisible())await p.locator('[data-load-more]').click();
 await p.locator(`a[href="${ownHref}"]`).click();await p.waitForSelector('.memorial-detail');
 assert.equal(await p.locator('.memorial-back').getAttribute('href'),'/app/memorials');await p.locator('.memorial-back').click();await p.waitForSelector('.memorial-archive');
 let history=[];
 await p.route('**/api/participate/context',async route=>{const res=await route.fetch();const data=await res.json();data.account={...data.account,id:'no-memorial-account',linked:true};data.pastParticipations=history;await route.fulfill({response:res,json:data});});
 await open(p,'/app/my?scenario=logged-in-no-application','.memorial-library');assert.match(await p.locator('.memorial-empty').textContent(),/아직 남겨진 여정/);assert.equal(await p.locator('.memorial-record').count(),0);
 history=[{id:'past-without-memorial',ownerUserId:'no-memorial-account',eventId:'past',eventTitle:'SSKR 지난 행사',eventDate:'2026-05-23',participantNumber:'#0036',runResult:'RETIRED'}];
 await p.reload();await p.waitForSelector('.memorial-record');assert.match(await p.locator('.memorial-record').textContent(),/주행 중단/);assert.match(await p.locator('.memorial-record').textContent(),/메모리얼 없음/);assert.equal(await p.locator('.memorial-record-actions a').count(),0);await p.close();
});

test('context failure can recover and guide viewing preserves a saved application',async()=>{
 const p=await page();await p.route('**/api/participate/context',route=>route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({ok:false,error:{userMessage:'잠시 후 다시 시도해 주세요.'}})}),{times:1});
 await open(p,'/app?scenario=guest','#app-retry');assert.match(await p.locator('.access-denied').textContent(),/잠시 후/);await p.locator('#app-retry').click();await p.waitForSelector('.manager-dashboard');
 await open(p,'/app?scenario=application-step2');await p.locator('.manager-event-banner').click();await p.waitForSelector('#mode-a.is-active');assert.match(await p.title(),/참가 안내/);
 await p.locator('#primary-action').click();await p.waitForSelector('#mode-b.is-active');assert.match(await p.locator('#mode-b').textContent(),/동의/);assert.doesNotMatch(p.url(),/view=guide/);await p.close();assert.deepEqual(errors,[]);
});
