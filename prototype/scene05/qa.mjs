import puppeteer from 'puppeteer-core';

const executablePath=process.env.BROWSER_PATH;
if(!executablePath)throw new Error('BROWSER_PATH is required');

const browser=await puppeteer.launch({
  headless:false,
  executablePath,
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
  await page.waitForSelector('#frame.ready',{timeout:30000});
  await page.waitForFunction(()=>window.__scene05Timeline,{timeout:30000});
  const canvas=await page.$('#three-stage canvas');
  if(!canvas)throw new Error('Three.js canvas was not created');
  if(errors.length)throw new Error(errors.join('\n'));

  async function capture(time,name){
    await page.evaluate(t=>{
      const tl=window.__scene05Timeline;
      if(!tl)throw new Error('Scene timeline is unavailable');
      tl.pause().seek(t,false);
    },time);
    await sleep(300);
    await page.screenshot({path:`prototype/scene05/dist/${name}.png`});
  }

  await capture(3.4,'keyframe_034s');
  await capture(7.0,'keyframe_070s');
  await capture(8.9,'keyframe_089s');
  await capture(10.7,'keyframe_107s');

  const state=await page.evaluate(()=>({
    ready:document.querySelector('#frame')?.classList.contains('ready'),
    overviewOpacity:getComputedStyle(document.querySelector('#overview-layer')).opacity,
    canvasOpacity:getComputedStyle(document.querySelector('#three-stage')).opacity,
    statementOpacity:getComputedStyle(document.querySelector('#statement')).opacity,
    transitionOpacity:getComputedStyle(document.querySelector('#transition-copy')).opacity,
    fontFamily:getComputedStyle(document.body).fontFamily,
    timelineTime:window.__scene05Timeline?.time(),
    timelinePaused:window.__scene05Timeline?.paused(),
    canvasSize:[document.querySelector('#three-stage canvas')?.width,document.querySelector('#three-stage canvas')?.height]
  }));
  if(!state.ready||!state.timelinePaused)throw new Error('Deterministic QA state was not reached');
  console.log(JSON.stringify(state));
}finally{
  await browser.close();
}
