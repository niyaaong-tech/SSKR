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
  await page.goto('http://127.0.0.1:4174/?qa=1',{waitUntil:'networkidle0',timeout:60000});
  await page.waitForSelector('#frame.ready',{timeout:45000});
  await sleep(350);
  if(!(await page.$('#three-stage canvas')))throw new Error('Three.js canvas missing');
  if(!(await page.evaluate(()=>Boolean(window.__scene05Timeline))))throw new Error('Scene 05 B timeline unavailable');
  if(errors.length)throw new Error(errors.join('\n'));

  async function capture(time,name){
    await page.evaluate(t=>{
      window.__scene05Timeline.pause().seek(t,false);
      const render=window.__qaRafCallback;
      if(typeof render!=='function')throw new Error('QA render callback unavailable');
      render(performance.now());
    },time);
    await sleep(140);
    await page.screenshot({path:`final/scene05-b/dist/${name}.png`});
  }

  await capture(3.0,'b_030_high_altitude');
  await capture(9.0,'b_090_east_starts');
  await capture(16.0,'b_160_route_chase');
  await capture(24.0,'b_240_crane_reveal');
  await capture(32.0,'b_320_day_network');
  await capture(40.0,'b_400_westward_sweep');
  await capture(47.0,'b_470_finish_descent');
  await capture(51.0,'b_510_sunset_hold');
  await capture(55.0,'b_550_blue_hour');
  await capture(58.5,'b_585_fireworks');

  const state=await page.evaluate(()=>({
    ready:document.querySelector('#frame').classList.contains('ready'),
    time:window.__scene05Timeline.time(),
    duration:window.__scene05Timeline.duration(),
    paused:window.__scene05Timeline.paused(),
    canvas:[document.querySelector('#three-stage canvas').width,document.querySelector('#three-stage canvas').height],
    sky:{
      night:getComputedStyle(document.querySelector('#sky-night')).opacity,
      dawn:getComputedStyle(document.querySelector('#sky-dawn')).opacity,
      day:getComputedStyle(document.querySelector('#sky-day')).opacity,
      sunset:getComputedStyle(document.querySelector('#sky-sunset')).opacity,
      bluehour:getComputedStyle(document.querySelector('#sky-bluehour')).opacity
    },
    statement:getComputedStyle(document.querySelector('#statement')).opacity
  }));
  if(!state.ready||!state.paused)throw new Error('Deterministic Scene 05 B QA state not reached');
  if(state.duration<59.8||state.duration>61.0)throw new Error(`Unexpected Scene 05 B duration: ${state.duration}`);
  console.log(JSON.stringify(state));
}finally{
  await browser.close();
}
