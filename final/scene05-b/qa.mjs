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
    await sleep(150);
    await page.screenshot({path:`final/scene05-b/dist/${name}.png`});
  }

  await capture(1.35,'b27_014_peninsula_texture');
  await capture(5.2,'b27_052_east_starts');
  await capture(9.2,'b27_092_local_choice');
  await capture(12.4,'b27_124_road_exploration');
  await capture(18.5,'b27_185_freedom_reveal');
  await capture(24.2,'b27_242_network_flight');
  await capture(29.8,'b27_298_finish_convergence');
  await capture(34.2,'b27_342_sunset_arrival');
  await capture(37.2,'b27_372_firework_launch');
  await capture(39.4,'b27_394_festival_finale');

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
  if(state.duration<39.7||state.duration>40.8)throw new Error(`Unexpected Scene 05 B v2.7 duration: ${state.duration}`);
  console.log(JSON.stringify(state));
}finally{
  await browser.close();
}
