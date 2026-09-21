const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const net=require('node:net'),path=require('node:path');
const {chromium}=require('playwright');
let server,browser,base;
before(async()=>{
 const port=await new Promise(resolve=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const port=s.address().port;s.close(()=>resolve(port));});});
 base='http://127.0.0.1:'+port;
 server=spawn(process.execPath,['server/dev-server.js'],{cwd:path.resolve(__dirname,'../..'),env:{...process.env,SSKR_DEV_PORT:String(port)},stdio:['ignore','pipe','pipe'],windowsHide:true});
 await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Server timeout')),10000);server.stdout.on('data',b=>{if(b.toString().includes('SSKR dev server')){clearTimeout(timer);resolve();}});server.once('error',reject);});
 browser=await chromium.launch({headless:true,channel:process.platform==='win32'?'msedge':undefined});
});
after(async()=>{await browser?.close();server?.kill();});
async function openHome(p){
 // Observe rendered frames inside the test only; production has no debug overlay.
 await p.route('**/app.js*',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('const motionFrame = frameFromScroll(scrollY);','const motionFrame = frameFromScroll(scrollY); window.__homeFrame=motionFrame;')});});
 await p.goto(base);
}
async function seek(p,frame){
 await p.evaluate(f=>{const j=document.querySelector('#journey'),h=document.querySelector('#brochureStage').offsetHeight,start=j.offsetTop,max=j.offsetHeight-h;scrollTo({top:f<=180?start*f/180:start+max*(f-180)/1030,behavior:'instant'});},frame);
 await p.waitForFunction(f=>Math.abs(window.__homeFrame-f)<=1,frame);
}
const state=p=>p.evaluate(()=>({line:document.querySelector('#journeyLine').getAttribute('d'),map:document.querySelector('#mapArt').style.transform,sky:document.querySelector('.intro-sky').style.backgroundPosition,cards:[...document.querySelectorAll('.place')].map(e=>e.style.clipPath),sun:document.querySelector('.sun-orb').style.transform}));
test('HOME holds visual frames, keeps one sunrise copy and 30-frame text fades',async()=>{
 const p=await browser.newPage({viewport:{width:1440,height:900}});const errors=[];p.on('pageerror',e=>errors.push(e.message));await openHome(p);
 assert.equal(await p.locator('#introHandoffCopy').count(),0);assert.equal(await p.getByRole('heading',{name:'동틀 무렵 시작되는 하루',includeHidden:true}).count(),1);
 for(const [a,b] of [[139,167],[714,752],[1146,1194]]){await seek(p,a);const before=await state(p);await seek(p,b);assert.deepEqual(await state(p),before);}
 await seek(p,168);assert.ok(Number(await p.locator('#sceneOneCopy').evaluate(e=>e.style.opacity))>.98);
 await seek(p,183);assert.ok(Math.abs(Number(await p.locator('#sceneOneCopy').evaluate(e=>e.style.opacity))-.5)<.02);
 await seek(p,198);assert.ok(Number(await p.locator('#sceneOneCopy').evaluate(e=>e.style.opacity))<.02);
 await seek(p,180);assert.equal(await p.locator('#lineGlow').getAttribute('filterUnits'),'userSpaceOnUse');assert.equal(await p.locator('#journeyLine').evaluate(e=>Number(e.style.opacity)),1);
 assert.deepEqual(errors,[]);await p.close();
});
test('HOME riders replay deterministically and extra routes fade before the memory scene',async()=>{
 const p=await browser.newPage({viewport:{width:1440,height:900}});await openHome(p);
 assert.deepEqual(await p.locator('[data-route]').evaluateAll(es=>es.map(e=>e.querySelectorAll('.route-rider').length)),[4,3,5]);
 const positions=()=>p.locator('.route-rider').evaluateAll(es=>es.map(e=>e.getAttribute('transform')));
 await seek(p,410);const first=await positions();assert.ok(await p.locator('.route-rider').evaluateAll(es=>es.some(e=>+e.style.opacity===1)));
 await seek(p,460);assert.notDeepEqual(await positions(),first);await seek(p,410);assert.deepEqual(await positions(),first);
 await seek(p,496);assert.ok(await p.locator('.route-rider').evaluateAll(es=>es.every(e=>+e.style.opacity===0)));
 await seek(p,784);assert.equal(await p.locator('.multi-routes').evaluate(e=>Number(e.style.opacity)),0);await p.close();
});
test('HOME mobile start markers stay on screen and reduced motion remains readable',async()=>{
 const p=await browser.newPage({viewport:{width:390,height:844}});await openHome(p);await seek(p,410);
 assert.ok(await p.locator('[data-route] > circle').evaluateAll(es=>es.every(e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth;})));
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await p.close();
 const reduced=await browser.newPage({reducedMotion:'reduce'});await openHome(reduced);assert.equal(await reduced.locator('#sceneOneCopy').evaluate(e=>getComputedStyle(e).visibility),'visible');assert.equal(await reduced.locator('.multi-routes').evaluate(e=>getComputedStyle(e).display),'none');await reduced.close();
});
test('HOME routes share styles, spots appear in route order and copy overlaps stay faint',async()=>{
 const p=await browser.newPage({viewport:{width:1440,height:900}});await openHome(p);
 await seek(p,320);const weights=await p.locator('.scene-copy[data-scene]').evaluateAll(es=>es.map(e=>Number(e.style.opacity)));assert.ok(weights[0]>0&&weights[0]<.25&&weights[1]>0&&weights[1]<.25);
 const spots=()=>p.locator('[data-route] > g').evaluateAll(es=>es.map(e=>({route:e.parentElement.dataset.route,opacity:Number(e.style.opacity)})));
 await seek(p,575);assert.ok((await spots()).every(e=>e.opacity===0));
 await seek(p,630);assert.ok((await spots()).some(e=>e.route==='1'&&e.opacity>0));assert.ok((await spots()).filter(e=>e.route==='2').every(e=>e.opacity===0));
 await seek(p,690);assert.ok((await spots()).some(e=>e.route==='2'&&e.opacity>0));
 const style=selector=>p.locator(selector).first().evaluate(e=>{const s=getComputedStyle(e);return [s.stroke,s.strokeWidth,s.filter]});assert.deepEqual(await style('#journeyLine'),await style('.extra-route'));
 assert.equal(await p.locator('.intro-deck>p').evaluate(e=>getComputedStyle(e).fontSize),'20px');assert.equal(await p.locator('.scene-copy p').first().evaluate(e=>getComputedStyle(e).fontSize),'18px');await p.close();
});
test('HOME chapter buttons land on their showcase frames and select the matching scene',async()=>{
 const p=await browser.newPage({viewport:{width:1440,height:900}});await openHome(p);
 for(const [key,frame] of [['sunrise',150],['crossing',280],['route',410],['spots',730],['memorial',960],['complete',1165],['intro',0]]){
  await p.locator(`[data-chapter="${key}"]`).click();
  await p.waitForFunction(()=>!document.querySelector('#storyIndex').hasAttribute('aria-busy'),null,{timeout:10000});
  await p.waitForFunction(f=>Math.abs(window.__homeFrame-f)<=1,frame);
  assert.equal(await p.locator('[data-chapter][aria-current]').getAttribute('data-chapter'),key);
 }
 await p.close();
});
test('mobile memory route fits the viewport and coastal labels remain readable',async()=>{
 for(const width of [390,820]){
  const p=await browser.newPage({viewport:{width,height:844}});await openHome(p);await seek(p,960);
  assert.ok(await p.locator('#routeNodes > g').evaluateAll(es=>es.every(e=>{const r=e.querySelector('.spot-core').getBoundingClientRect();return r.left>=0&&r.right<=innerWidth;})));
  assert.equal(await p.locator('.route-place').first().evaluate(e=>getComputedStyle(e).fontSize),'24px');
  const label=p.locator('[data-route="2"] > text');assert.equal(await label.getAttribute('text-anchor'),'middle');
  assert.equal(await label.getAttribute('x'),await p.locator('[data-route="2"] > circle').first().getAttribute('cx'));
  assert.equal(await p.locator('#frameDebug').count(),0);await p.close();
 }
});
test('all mobile route labels enlarge and Iksan stays clear of Gunsan',async()=>{
 const p=await browser.newPage({viewport:{width:390,height:844}});await openHome(p);await seek(p,730);
 assert.ok(await p.locator('.multi-route-label').evaluateAll(es=>es.every(e=>getComputedStyle(e).fontSize==='24px')));
 const a=await p.locator('[data-node="6"] .route-place').boundingBox(),b=await p.locator('[data-node="7"] .route-place').boundingBox();
 assert.ok(a.x>=b.x+b.width||b.x>=a.x+a.width||a.y>=b.y+b.height||b.y>=a.y+a.height);
 assert.equal(await p.getByText('2027 가을',{exact:true}).count(),0);await p.close();
});
