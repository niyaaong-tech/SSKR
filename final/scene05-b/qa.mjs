import puppeteer from 'puppeteer-core';

const executablePath = process.env.BROWSER_PATH;
if (!executablePath) throw new Error('BROWSER_PATH is required');

const browser = await puppeteer.launch({
  headless: false,
  executablePath,
  protocolTimeout: 120000,
  args: [
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--ignore-gpu-blocklist',
    '--enable-webgl',
    '--use-gl=angle',
    '--disable-background-timer-throttling',
    '--disable-renderer-backgrounding'
  ]
});

const sleep = ms => new Promise(r => setTimeout(r, ms));

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', e => errors.push(`PAGEERROR: ${e.message}`));
  page.on('console', m => { if (m.type() === 'error') errors.push(`CONSOLE: ${m.text()}`); });

  await page.goto('http://127.0.0.1:4174/?qa=1', { waitUntil: 'networkidle0', timeout: 60000 });
  await page.waitForSelector('#frame.ready', { timeout: 45000 });
  await sleep(350);
  if (errors.length) throw new Error(errors.join('\n'));

  async function cap(t, name) {
    await page.evaluate(x => {
      window.__scene05Timeline.pause().seek(x, false);
      window.__qaRafCallback(performance.now());
    }, t);
    await sleep(170);
    await page.screenshot({ path: `final/scene05-b/dist/${name}.png` });
  }

  await cap(1.5, 'b37_015_peninsula');
  await cap(4.5, 'b37_045_east_dawn');
  await cap(7.2, 'b37_072_start_dawn');
  await cap(12.0, 'b37_120_route_day');
  await cap(16.5, 'b37_165_late_day');
  await cap(18.9, 'b37_189_finish_evening');
  await cap(21.0, 'b37_210_finish_sunset');
  await cap(24.0, 'b37_240_sunset_descent');
  await cap(27.5, 'b37_275_core_message');
  await cap(29.5, 'b37_295_final_hold');

  const s = await page.evaluate(() => ({
    ready: document.querySelector('#frame').classList.contains('ready'),
    duration: window.__scene05Timeline.duration(),
    paused: window.__scene05Timeline.paused()
  }));
  if (!s.ready || !s.paused || s.duration < 29.9 || s.duration > 30.2) {
    throw new Error(`Bad v3.7 QA ${JSON.stringify(s)}`);
  }
  console.log(JSON.stringify(s));
} finally {
  await browser.close();
}
