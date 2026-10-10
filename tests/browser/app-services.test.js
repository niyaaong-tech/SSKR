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
async function capture(p,name,fullPage=true){if(process.env.SSKR_QA_OUTPUT){fs.mkdirSync(process.env.SSKR_QA_OUTPUT,{recursive:true});await p.evaluate(async()=>{await Promise.all([...document.querySelectorAll('#app-main img')].map(img=>{img.loading='eager';return img.decode().catch(()=>{});}));});await p.screenshot({path:path.join(process.env.SSKR_QA_OUTPUT,name+'.png'),fullPage});}}

test('participation and account gates expose Google only on desktop and mobile',async()=>{
 for(const [width,height] of [[1440,900],[390,844]]) for(const target of ['participate','my']) {
  const p=await page(width,height);
  if(target==='participate'){await open(p,'/participate?scenario=guest','#primary-action');await p.locator('#primary-action').click();}
  else await open(p,'/app/my?scenario=guest','.sskr-social-auth');
  const gate=p.locator('.sskr-social-auth');
  await gate.waitFor({state:'visible'});
  await gate.evaluate(el=>Promise.all(el.parentElement.getAnimations().map(animation=>animation.finished)));
  assert.equal(await gate.locator('[data-provider="google"]').isEnabled(),true);
  for(const id of ['naver','kakao','apple']) {
   const button=gate.locator(`[data-provider="${id}"]`);
   assert.equal(await button.isDisabled(),true);assert.match(await button.textContent(),/준비 중/);
   assert.equal(await button.evaluate(el=>getComputedStyle(el).cursor),'not-allowed');
  }
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await capture(p,`auth-${target}-${width}`);
  await gate.locator('[data-provider="google"]').focus();await p.keyboard.press('Enter');
  await p.waitForFunction(()=>SSKR_ACCOUNT_LINK.isAccountLinked());
  await p.waitForFunction(()=>!document.querySelector('.sskr-social-auth')||document.querySelector('#mode-b.is-active'));
  assert.equal(await p.evaluate(()=>SSKR_ACCOUNT_LINK.getLinkedProvider()),'google');await p.close();
 }
});

test('login retry and synthetic clicks never enable or invoke unavailable providers',async()=>{
 const p=await page();await open(p,'/app/my?scenario=guest','.sskr-social-auth');
 await p.evaluate(()=>{const old=document.querySelector('#app-social-auth');old.replaceWith(old.cloneNode(false));window.__authCalls=[];window.__disposeAuth=SSKR_SOCIAL_AUTH.mount(document.querySelector('#app-social-auth'),{onSelect:provider=>{__authCalls.push(provider);return new Promise((resolve,reject)=>{window.__authResolve=resolve;window.__authReject=reject;});}});});
 for(const result of ['failure','success']) {
  await p.locator('[data-provider="google"]').click();assert.equal(await p.locator('[data-provider]:disabled').count(),4);
  await p.evaluate(()=>{for(const button of document.querySelectorAll('[data-provider]'))button.dispatchEvent(new MouseEvent('click',{bubbles:true}));});
  assert.equal(await p.evaluate(()=>__authCalls.length),result==='failure'?1:2);
  await p.evaluate(result=>result==='failure'?__authReject(new Error('테스트 연결 실패')):__authResolve(),result);
  await p.waitForFunction(()=>!document.querySelector('[data-provider="google"]').disabled);
  assert.equal(await p.locator('[data-provider]:disabled').count(),3);
  assert.equal(await p.locator('.auth-error').isVisible(),result==='failure');
 }
 await p.evaluate(()=>{const button=document.querySelector('[data-provider="naver"]');button.disabled=false;button.dispatchEvent(new MouseEvent('click',{bubbles:true}));});
 assert.deepEqual(await p.evaluate(()=>__authCalls),['google','google']);await p.close();
});

test('a completed login from a disposed component cannot clear a new pending login',async()=>{
 const p=await page();await open(p,'/app/my?scenario=guest','.sskr-social-auth');
 await p.evaluate(()=>{const old=document.querySelector('#app-social-auth');old.replaceWith(old.cloneNode(false));const host=document.querySelector('#app-social-auth');window.__oldDispose=SSKR_SOCIAL_AUTH.mount(host,{onSelect:()=>new Promise(resolve=>window.__oldResolve=resolve)});});
 await p.locator('[data-provider="google"]').click();
 await p.evaluate(()=>{__oldDispose();SSKR_SOCIAL_AUTH.mount(document.querySelector('#app-social-auth'),{onSelect:()=>new Promise(resolve=>window.__newResolve=resolve)});});
 await p.locator('[data-provider="google"]').click();await p.evaluate(async()=>{__oldResolve();await Promise.resolve();});
 assert.equal(await p.locator('#app-social-auth').getAttribute('aria-busy'),'true');
 assert.equal(await p.locator('[data-provider]:disabled').count(),4);
 await p.evaluate(()=>__newResolve());await p.waitForFunction(()=>!document.querySelector('[data-provider="google"]').disabled);
 assert.equal(await p.locator('[data-provider]:disabled').count(),3);await p.close();
});

test('participant guide sections stay separate and reachable on short desktop and mobile screens',async()=>{
 for(const [width,height]of [[360,640],[390,844],[768,740],[1180,757],[1280,640],[1920,900]]){
  const p=await page(width,height);await open(p,'/participate?scenario=guest&view=guide','#mode-a.is-active');
  const boxes=await p.evaluate(()=>{const box=s=>{const r=document.querySelector(s).getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right}};return {guide:box('#public-event-guide h2'),tiers:box('.public-tier-grid'),benefits:box('.benefit-area'),manager:box('.manager-area'),panel:box('.service-panel'),overflow:document.documentElement.scrollWidth>innerWidth};});
  assert.ok(boxes.tiers.bottom<=boxes.benefits.top,`${width}: pricing overlaps benefits`);assert.ok(boxes.benefits.bottom<=boxes.manager.top,`${width}: benefits overlap manager`);assert.ok(boxes.guide.left>=boxes.panel.left+18);assert.ok(boxes.guide.right<=boxes.panel.right);assert.equal(boxes.overflow,false);
  await p.locator('.manager-promises').scrollIntoViewIfNeeded();assert.ok(await p.locator('.manager-promises').isVisible());await capture(p,'guide-'+width);await p.close();
 }
});

test('late preparation success or failure preserves the screen and an independently reopened form',async()=>{
 for(const outcome of ['success','failure']){
  const p=await page(1180,757);await open(p,'/app/preparation?scenario=c-preparation','.prep-page');let release,entered;const pending=new Promise(resolve=>entered=resolve),gate=new Promise(resolve=>release=resolve);
  await p.route('**/api/participate/application',async route=>{const response=outcome==='success'?await route.fetch():null;entered();await gate;if(response)await route.fulfill({response});else await route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:{code:'TEMPORARY_FAILURE',message:'잠시 후 다시 시도해 주세요.'}})});});
  for(const [name,value]of [['maker','Honda'],['model','CB500X'],['className','500cc']])await p.locator('#bike input[name='+name+']').fill(value);
  await p.locator('#bike button[type=submit]').click();await pending;assert.equal(await p.locator('#start button[type=submit]').isDisabled(),true);
  await p.locator('a[href="/app/notices"][data-app-link]').first().click();await p.waitForFunction(()=>location.pathname==='/app/notices');const noticeMarkup=await p.locator('#app-main').innerHTML();
  if(outcome==='failure'){await p.goBack();await p.waitForSelector('.prep-page');await p.locator('#bike input[name=model]').fill('이동 후 새 입력');}
  const responseDone=p.waitForResponse('**/api/participate/application');release();await responseDone;await p.waitForTimeout(150);
  if(outcome==='success'){assert.equal(new URL(p.url()).pathname,'/app/notices');assert.equal(await p.locator('#app-main').innerHTML(),noticeMarkup);assert.equal(await p.locator('#app-section-title').textContent(),'공지');const current=await p.evaluate(()=>SSKR_PARTICIPATE_API.context());assert.equal(current.participation.bikeInfo.model,'CB500X');}
  else {assert.equal(await p.locator('#bike input[name=model]').inputValue(),'이동 후 새 입력');assert.equal(await p.locator('#bike .prep-status').textContent(),'');}
  await p.close();
 }
 assert.deepEqual(errors,[]);
});

test('collapsed app navigation keeps each destination name',async()=>{
 for(const width of [900,1180,1365]){const p=await page(width,757);await open(p,'/app?scenario=guest');for(const name of ['SSKR 매니저','스팟','메모리얼','내 기록'])assert.equal(await p.locator('#app-nav').getByRole('link',{name,exact:true}).count(),1);assert.match(await p.locator('.manager-discover').textContent(),/같은 하루/);await p.close();}
});

test('About skip navigation transfers focus into the visible chapter in both reading modes',async()=>{
 for(const [width,height,motion]of [[1180,757,'no-preference'],[1180,757,'reduce'],[390,844,'no-preference']]){const p=await page(width,height);await p.emulateMedia({reducedMotion:motion});await p.goto(base+'/about/');await p.keyboard.press('Tab');assert.equal(await p.evaluate(()=>document.activeElement.className),'skip-link');await p.keyboard.press('Enter');assert.equal(await p.evaluate(()=>!!document.activeElement.closest('#chapter-01')),true);assert.equal(await p.evaluate(()=>document.activeElement.closest('.scene').inert),false);await p.keyboard.press('Tab');assert.equal(await p.evaluate(()=>document.activeElement.classList.contains('brand')),false);await p.close();}
});

test('HOME memorial text remains outside photographs at the completed chapter target',async()=>{
 for(const [width,height]of [[360,640],[390,844],[768,740],[1180,757],[1280,640],[1440,900],[1920,1080]]){
  const p=await page(width,height);await p.emulateMedia({reducedMotion:'no-preference'});await p.goto(base+'/');
  await p.locator('[data-chapter="memorial"]').evaluate(button=>button.click());await p.waitForFunction(()=>!document.querySelector('#storyIndex').classList.contains('is-travelling')&&+getComputedStyle(document.querySelector('.scene-copy-memory')).opacity>.95&&(innerWidth<=900||+getComputedStyle(document.querySelector('#storyIndex')).opacity>.95));
  const state=await p.evaluate(()=>{const text=document.querySelector('.scene-copy-memory').getBoundingClientRect(),line=document.querySelector('#journeyLine'),point=line.getPointAtLength(line.getTotalLength()*.95),lineY=new DOMPoint(point.x,point.y).matrixTransform(line.getScreenCTM()).y;const cards=[...document.querySelectorAll('.memory-card')];return {textBottom:text.bottom,lineY,visible:cards.filter(e=>+getComputedStyle(e).opacity>.5).length,overlaps:cards.filter(e=>{const r=e.getBoundingClientRect();return +getComputedStyle(e).opacity>.5&&r.left<text.right&&r.right>text.left&&r.top<text.bottom&&r.bottom>text.top;}).map(e=>e.className),indexClass:document.querySelector('#storyIndex').className,overflow:document.documentElement.scrollWidth>innerWidth};});
  assert.equal(state.visible,8);assert.deepEqual(state.overlaps,[],width+' photograph overlap');if(width>900)assert.ok(state.textBottom+12<=state.lineY,width+' route overlaps text');assert.ok(state.indexClass.includes('is-memory'));assert.equal(state.overflow,false);if(width===1180||width===390)await capture(p,'home-memorial-'+width,false);await p.close();
 }
 assert.deepEqual(errors,[]);
});

test('a new guest completes mock payment and the four preparation forms without changing the official start implicitly',async()=>{
 const p=await page(390,844);await open(p,'/participate?scenario=guest&view=guide','#mode-a.is-active');
 assert.match(await p.locator('#public-event-guide').textContent(),/경유 10곳/);
 await p.locator('#primary-action').click();await p.locator('[data-provider="google"]').click();await p.locator('#guide-acknowledgement').check();await p.locator('#acknowledgement-form button[type=submit]').click();
 await p.waitForSelector('#agreement-form');for(const checkbox of await p.locator('input[name=agreement][data-required=true]').all())await checkbox.check();await p.locator('#agreement-form button[type=submit]').click();
 await p.waitForSelector('#participant-form');await p.locator('.tier-card:not(.is-disabled)').first().click();assert.equal(await p.locator('#participant-form input[name=priceTierId]:not(:disabled)').first().isChecked(),true);await p.locator('#participant-form input[name=name]').fill('김하늘');await p.locator('#participant-form input[name=phone]').fill('010-1234-5678');await p.locator('#participant-form input[name=email]').fill('rider@example.com');await p.locator('#participant-form button[type=submit]').click();
 await p.locator('#payment-action').click();await p.waitForSelector('#mode-c.is-active');
 const confirmed=await p.evaluate(()=>SSKR_PARTICIPATE_API.context());assert.equal(confirmed.participation.slotAllocation,'CONFIRMED');assert.equal(confirmed.payment.state,'SUCCEEDED');
 await p.locator('.completion-actions a[href="/app"]').click();await p.waitForSelector('.manager-dashboard');await p.goto(base+'/app/preparation');await p.waitForSelector('.prep-page');
 for(const [name,value]of [['maker','Honda'],['model','CB500X'],['className','500cc']])await p.locator('#bike input[name='+name+']').fill(value);await p.locator('#bike button[type=submit]').click();await p.waitForFunction(()=>document.querySelector('#bike .prep-status')?.textContent==='저장했습니다.');
 await p.locator('#start select').selectOption('gangneung');await p.locator('#start button[type=submit]').click();await p.waitForFunction(()=>document.querySelector('#start .prep-status')?.textContent==='저장했습니다.');
 for(const [name,value]of [['name','김하늘'],['phone','010-1234-5678'],['postalCode','25501'],['address','강원특별자치도 강릉시 강릉대로 33']])await p.locator('#kit input[name='+name+']').fill(value);await p.locator('#kit button[type=submit]').click();await p.waitForFunction(()=>document.querySelector('#kit .prep-status')?.textContent==='저장했습니다.');
 await p.locator('#notice button[type=submit]').click();await p.waitForFunction(()=>document.querySelector('#notice .prep-status')?.textContent==='저장했습니다.');assert.equal(await p.locator('.prep-card header span').filter({hasText:'확인 완료'}).count(),4);
 const prepared=await p.evaluate(()=>SSKR_PARTICIPATE_API.context());assert.equal(prepared.participation.selectedStartLocationId,'gangneung');assert.equal(prepared.participation.kitRecipient.name,'김하늘');await capture(p,'participant-preparation');await p.close();
});

test('visit notes and local WebP photos survive preview and reload while an unpublished record stays private',async()=>{
 const p=await page(390,844);await open(p,'/app/my?scenario=private-owner','.memorial-library');await p.locator('.memorial-record-actions a').filter({hasText:'관리'}).first().click();await p.waitForSelector('.memorial-form');
 const id=await p.locator('.memorial-form').getAttribute('data-memorial-id'),row=p.locator('[data-edit-visit]').first();await row.locator('[data-visit-note]').fill('다리를 건너며 바람이 바뀌었다. 잠시 쉬어 오늘의 풍경을 기록했다.');
 await row.locator('[data-visit-photo]').setInputFiles(path.resolve(__dirname,'../../web/about/assets/SSKR_info01.webp'));await p.waitForFunction(()=>document.querySelector('.memorial-save-status')?.textContent.includes('사진을 추가했습니다.'));
 assert.equal(await row.locator('[data-photo-consent]').isChecked(),false);assert.equal(await row.locator('[data-remove-photo]').count(),1);
 await p.locator('input[name=publishStatus][value=DRAFT]').check();await p.locator('[data-preview-record]').click();await p.waitForSelector('.memorial-detail');assert.match(await p.locator('.memorial-detail').textContent(),/잠시 쉬어 오늘의 풍경/);assert.match(await p.locator('.memorial-detail').textContent(),/미발행 초안/);
 await p.locator('[data-editor-return]').click();await p.locator('.memorial-form button[type=submit]').click();await p.waitForFunction(()=>document.querySelector('.memorial-save-status')?.textContent.includes('저장했습니다.'));await p.reload();await p.waitForSelector('[data-remove-photo]');
 assert.match(await p.locator('[data-visit-note]').first().inputValue(),/풍경을 기록/);const photo=await p.evaluate(()=>{const item=SSKR_MEMORIAL_MEDIA.all()[0];return {type:item.blob.type,sourceKind:item.sourceKind};});assert.equal(photo.type,'image/webp');assert.equal(photo.sourceKind,'MOCK_UPLOAD');
 await open(p,'/app/memorials?scenario=private-owner','.memorial-archive');while(await p.locator('[data-load-more]').isVisible())await p.locator('[data-load-more]').click();assert.equal(await p.locator('a[href="/app/memorials/'+id+'"]').count(),0);await p.close();
});
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
test('linked nonparticipant manager reads actual saved routes and opens route management',async()=>{
 const p=await page(390,844);await open(p,'/app?scenario=logged-in-no-application');
 await p.evaluate(()=>{const account={id:'mock-rider-0271',linked:true};const d=SSKR_ROUTE_PLAN;d.createStore(localStorage,SSKR_SPOT_CATALOG).save({...d.createEmpty(SSKR_SPOT_CATALOG),title:'다음 주의 바닷길'},account);});
 await p.reload();await p.waitForSelector('.manager-plan-card');assert.match(await p.locator('.manager-plan-card').textContent(),/다음 주의 바닷길/);
 await p.locator('.manager-welcome .manager-primary').click();await p.waitForSelector('dialog[data-management]');assert.match(await p.locator('.rp-saved').textContent(),/다음 주의 바닷길/);await p.close();
});
test('public gallery pagination, filters and reading position survive a detail roundtrip',async()=>{
 const p=await page();await open(p,'/app/memorials?scenario=guest','.memorial-archive');assert.equal(await p.locator('.memorial-thumbnail').count(),12);
 await p.locator('[data-load-more]').click();assert.equal(await p.locator('.memorial-thumbnail').count(),24);
 const card=p.locator('.memorial-thumbnail a').nth(14);await card.scrollIntoViewIfNeeded();const y=await p.evaluate(()=>scrollY);
 await card.click();await p.waitForSelector('.memorial-detail');await p.waitForSelector('.journey-visit-photo');
 assert.equal(await p.locator('.memorial-place-photos').count(),0);assert.equal(await p.locator('.journey-map-host .spot-map').count(),0);await p.getByText('여정 지도 보기',{exact:true}).click();await p.waitForSelector('.journey-map-host .spot-map');assert.equal(await p.locator('.journey-map-host .spot-map').count(),1);
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

test('removing a saved local photo stays removed through preview, return, save and reload',async()=>{
 const p=await page(390,844);await open(p,'/app/my?scenario=private-owner','.memorial-library');
 await p.locator('.memorial-record-actions a').filter({hasText:'관리'}).first().click();await p.waitForSelector('.memorial-form');
 const row=p.locator('[data-edit-visit]').first();
 await row.locator('[data-visit-photo]').setInputFiles(path.resolve(__dirname,'../../web/about/assets/SSKR_info01.webp'));await p.waitForSelector('[data-remove-photo]');
 await p.locator('.memorial-form button[type=submit]').click();await p.waitForFunction(()=>document.querySelector('.memorial-save-status').textContent.includes('저장했습니다.'));
 await p.reload();await p.waitForSelector('[data-remove-photo]');await p.locator('[data-remove-photo]').click();
 for(let i=0;i<2;i++){await p.locator('[data-preview-record]').click();await p.waitForSelector('.memorial-detail');assert.equal(await p.locator('.memorial-detail img[src^="blob:"]').count(),0);await p.locator('[data-editor-return]').click();assert.equal(await p.locator('[data-remove-photo]').count(),0);}
 await p.locator('.memorial-form button[type=submit]').click();await p.waitForFunction(()=>document.querySelector('.memorial-save-status').textContent.includes('저장했습니다.'));await p.reload();await p.waitForSelector('.memorial-form');assert.equal(await p.locator('[data-remove-photo]').count(),0);assert.ok(await p.locator('.memorial-edit-photos img').count()>0);await p.close();
});

test('chosen private local cover is consistent for its owner and is not exposed to gallery visitors',async()=>{
 const p=await page();await open(p,'/app/my?scenario=logged-in-no-application','.memorial-library');await p.locator('.memorial-record-actions a').filter({hasText:'관리'}).first().click();await p.waitForSelector('.memorial-form');
 const id=await p.locator('.memorial-form').getAttribute('data-memorial-id'),row=p.locator('[data-edit-visit]').nth(1);
 await row.locator('[data-visit-photo]').setInputFiles(path.resolve(__dirname,'../../web/about/assets/SSKR_info01.webp'));await p.waitForSelector('[data-remove-photo]');await row.locator('input[name=coverVisitId]').check();
 await p.locator('.memorial-form button[type=submit]').click();await p.waitForFunction(()=>document.querySelector('.memorial-save-status').textContent.includes('저장했습니다.'));
 await p.locator('.memorial-back').click();await p.waitForSelector('.memorial-library');assert.match(await p.locator('.memorial-record-photo img').first().getAttribute('src'),/^blob:/);
 await p.locator('.memorial-record-photo').first().click();await p.waitForSelector('.memorial-story-cover img');assert.match(await p.locator('.memorial-story-cover img').getAttribute('src'),/^blob:/);
 await open(p,'/app/memorials/'+id+'?scenario=guest','.memorial-story-cover img');assert.doesNotMatch(await p.locator('.memorial-story-cover img').getAttribute('src'),/^blob:/);await p.close();
});

test('invalid memorial URL filters normalize without discarding valid search and start filters',async()=>{
 const p=await page();await open(p,'/app/memorials?scenario=guest&memorialStart=invalid&memorialEvent=invalid','.memorial-archive');
 assert.equal(await p.locator('[data-memorial-start]').inputValue(),'all');assert.match(await p.locator('.memorial-archive-count').textContent(),/30개/);assert.equal(new URL(p.url()).searchParams.has('memorialStart'),false);assert.equal(new URL(p.url()).searchParams.has('memorialEvent'),false);
 await p.locator('[data-memorial-start]').selectOption('gangneung');await p.locator('[data-memorial-search]').fill('능선');const count=await p.locator('.memorial-archive-count').textContent();await p.reload();await p.waitForSelector('.memorial-archive');assert.equal(await p.locator('[data-memorial-start]').inputValue(),'gangneung');assert.equal(await p.locator('[data-memorial-search]').inputValue(),'능선');assert.equal(await p.locator('.memorial-archive-count').textContent(),count);
 await p.locator('[data-memorial-search]').fill('존재하지않는기록');assert.match(await p.locator('.memorial-empty').textContent(),/검색 결과/);await p.close();
});

test('ordinary app links use the SPA while modified, download and new-window links retain native behavior',async()=>{
 const p=await page();await open(p,'/app?scenario=guest');await p.evaluate(()=>window.qaSameDocument=true);
 const link=p.locator('#app-nav a[href="/app/memorials"]');
 const popupPromise=p.context().waitForEvent('page');await link.click({modifiers:['Control']});const popup=await popupPromise;await popup.waitForLoadState();assert.equal(new URL(p.url()).pathname,'/app');assert.equal(new URL(popup.url()).pathname,'/app/memorials');await popup.close();
 const rules=await link.evaluate(a=>{const outcomes=[];for(const attrs of [{target:'_blank'},{download:'records'},{href:'https://example.com/app' }]){const copy=a.cloneNode(true);for(const [key,value]of Object.entries(attrs))copy.setAttribute(key,value);a.after(copy);const e=new MouseEvent('click',{bubbles:true,cancelable:true,button:0});document.addEventListener('click',event=>{outcomes.push(event.defaultPrevented);event.preventDefault();},{once:true});copy.dispatchEvent(e);copy.remove();}return outcomes;});assert.deepEqual(rules,[false,false,false]);
 await link.click();await p.waitForSelector('.memorial-archive');assert.equal(await p.evaluate(()=>window.qaSameDocument),true);await p.close();
});

test('narrow participation login controls never cover auth content while scrolling or zoomed',async()=>{
 for(const [width,height,zoom]of [[400,605,1],[360,640,1],[400,605,2]]){
  const p=await page(width,height);await open(p,'/participate?scenario=guest','#primary-action');
  await p.locator('#primary-action').click();await p.locator('.auth-brand').waitFor({state:'visible'});
  await p.evaluate(z=>document.documentElement.style.zoom=String(z),zoom);
  for(const selector of ['.auth-brand','.sskr-social-auth h2','[data-provider="google"]'])for(const offset of [20,48,120]){
   await p.locator(selector).evaluate((el,y)=>scrollTo({top:scrollY+el.getBoundingClientRect().top-y,behavior:'instant'}),offset);
   await p.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
   const covered=await p.locator(selector).evaluate(el=>{
    const a=el.getBoundingClientRect(),b=document.querySelector('#participate-utilities').getBoundingClientRect();
    return a.top<innerHeight&&a.bottom>0&&b.top<innerHeight&&b.bottom>0&&a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
   });assert.equal(covered,false,`${width}px zoom ${zoom}: controls overlap ${selector} at ${offset}`);
  }
  const google=p.locator('[data-provider="google"]');await google.focus();await google.scrollIntoViewIfNeeded();
  assert.equal(await google.evaluate(el=>{const r=el.getBoundingClientRect();return el.contains(document.elementFromPoint(r.left+r.width/2,r.top+r.height/2));}),true);
  await capture(p,`auth-flow-${width}-${zoom}`,false);await p.close();
 }
});

test('compact app rails reuse the original lettering and expanded menus retain the subtitle',async()=>{
 const crypto=require('node:crypto');
 const svg=fs.readFileSync(path.resolve(__dirname,'../../web/shared/brand/wordmark.svg'),'utf8').replace(/\r\n/g,'\n');
 assert.equal(crypto.createHash('sha256').update(svg).digest('hex'),'77dda6e4813e24d43b4c59ba2f93e494017f3ebc631037e2ea274de4cd3ac6df');
 for(const width of [900,1180,1365,1440,390]){
  const p=await page(width,900);await open(p,'/app?scenario=guest');
  if(width===390){await p.locator('#mobile-nav-toggle').click();await p.waitForFunction(()=>document.querySelector('#mobile-nav-toggle').getAttribute('aria-expanded')==='true');}
  const compact=p.locator('.app-brand .sskr-wordmark--compact'),full=p.locator('.app-brand .sskr-wordmark--full');
  const collapsed=width>=900&&width<=1365;
  assert.equal(await compact.isVisible(),collapsed);assert.equal(await full.isVisible(),!collapsed);
  if(collapsed){
   await p.waitForFunction(()=>document.querySelector('.app-brand use').getBBox().width>600);
   assert.equal(await compact.locator('use').getAttribute('href'),'/web/shared/brand/wordmark.svg#sskr-custom-wordmark');
   assert.equal(await compact.evaluate(el=>getComputedStyle(el).fillRule),'evenodd');
   const fits=await compact.evaluate(el=>{const r=el.getBoundingClientRect(),rail=el.closest('.app-sidebar').getBoundingClientRect();return rail.width===84&&r.left>=rail.left&&r.right<=rail.right;});assert.equal(fits,true);
  }else{await full.evaluate(img=>img.decode());assert.equal(await full.evaluate(img=>img.naturalWidth),628);}
  await p.getByRole('link',{name:'SSKR 홈',exact:true}).click();await p.waitForURL(base+'/');await p.close();
 }
});
