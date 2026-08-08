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
  await page.goto('http://127.0.0.1:4173/',{waitUntil:'networkidle0',timeout:60000});
  await page.waitForSelector('#frame.ready',{timeout:30000});
  const canvas=await page.$('#three-stage canvas');
  if(!canvas)throw new Error('Three.js canvas was not created');
  if(errors.length)throw new Error(errors.join('\n'));

  await sleep(3400);
  await page.screenshot({path:'prototype/scene05/dist/keyframe_034s.png'});
  await sleep(3600);
  await page.screenshot({path:'prototype/scene05/dist/keyframe_070s.png'});
  await sleep(1900);
  await page.screenshot({path:'prototype/scene05/dist/keyframe_089s.png'});
  await sleep(1800);
  await page.screenshot({path:'prototype/scene05/dist/keyframe_107s.png'});

  const state=await page.evaluate(()=>({
    ready:document.querySelector('#frame')?.classList.contains('ready'),
    overviewOpacity:getComputedStyle(document.querySelector('#overview-layer')).opacity,
    canvasOpacity:getComputedStyle(document.querySelector('#three-stage')).opacity,
    statementOpacity:getComputedStyle(document.querySelector('#statement')).opacity,
    transitionOpacity:getComputedStyle(document.querySelector('#transition-copy')).opacity,
    fontFamily:getComputedStyle(document.body).fontFamily,
    canvasSize:[document.querySelector('#three-stage canvas')?.width,document.querySelector('#three-stage canvas')?.height]
  }));
  if(!state.ready)throw new Error('Scene did not reach ready state');
  console.log(JSON.stringify(state));
}finally{
  await browser.close();
}
