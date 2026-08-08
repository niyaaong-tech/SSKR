import puppeteer from 'puppeteer-core';

const executablePath=process.env.BROWSER_PATH;
if(!executablePath)throw new Error('BROWSER_PATH is required');

const browser=await puppeteer.launch({
  headless:false,
  executablePath,
  protocolTimeout:120000,
  args:[
    '--no-sandbox','--disable-dev-shm-usage','--ignore-gpu-blocklist','--enable-webgl',
    '--use-gl=angle','--disable-background-timer-throttling','--disable-renderer-backgrounding'
  ]
});

const sleep=ms=>new Promise(r=>setTimeout(r,ms));

try{
  const page=await browser.newPage();
  await page.setViewport({width:1920,height:1080,deviceScaleFactor:1});
  const errors=[];
  page.on('pageerror',e=>errors.push(`PAGEERROR: ${e.message}`));
  page.on('console',m=>{if(m.type()==='error')errors.push(`CONSOLE: ${m.text()}`)});
  await page.goto('http://127.0.0.1:4173/?qa=1',{waitUntil:'networkidle0',timeout:60000});
  await page.waitForSelector('#frame.ready',{timeout:45000});
  await sleep(300);
  if(!(await page.$('#three-stage canvas')))throw new Error('Three.js canvas missing');
  if(!(await page.evaluate(()=>Boolean(window.__scene05Timeline))))throw new Error('Final timeline unavailable');
  if(errors.length)throw new Error(errors.join('\n'));

  async function capture(time,name){
    await page.evaluate(t=>{
      window.__scene05Timeline.pause().seek(t,false);
      const render=window.__qaRafCallback;
      if(typeof render!=='function')throw new Error('QA render callback unavailable');
      render(performance.now());
    },time);
    await sleep(120);
    await page.screenshot({path:`final/scene05/dist/${name}.png`});
  }

  await capture(1.0,'final_010_scale');
  await capture(2.9,'final_029_dawn_start');
  await capture(6.7,'final_067_day_network');
  await capture(9.65,'final_096_sunset_finish');
  await capture(10.85,'final_108_personal_recall');
  await capture(12.62,'final_126_match_cut');

  const state=await page.evaluate(()=>({
    ready:document.querySelector('#frame').classList.contains('ready'),
    time:window.__scene05Timeline.time(),
    paused:window.__scene05Timeline.paused(),
    font:getComputedStyle(document.body).fontFamily,
    canvas:[document.querySelector('#three-stage canvas').width,document.querySelector('#three-stage canvas').height],
    sky:{
      night:getComputedStyle(document.querySelector('#sky-night')).opacity,
      dawn:getComputedStyle(document.querySelector('#sky-dawn')).opacity,
      day:getComputedStyle(document.querySelector('#sky-day')).opacity,
      sunset:getComputedStyle(document.querySelector('#sky-sunset')).opacity
    },
    statement:getComputedStyle(document.querySelector('#statement')).opacity,
    matchOrb:getComputedStyle(document.querySelector('#match-orb')).opacity
  }));
  if(!state.ready||!state.paused)throw new Error('Deterministic final QA state not reached');
  console.log(JSON.stringify(state));
}finally{
  await browser.close();
}
