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

  async function renderFrame() {
    await page.evaluate(() => {
      if (typeof window.__qaRafCallback !== 'function') throw new Error('QA RAF callback missing');
      window.__qaRafCallback(performance.now());
    });
    await sleep(180);
  }

  async function cap(t, name) {
    await page.evaluate(x => {
      window.__scene05Timeline.pause().seek(x, false);
    }, t);
    await renderFrame();
    await page.screenshot({ path: `final/scene05-b/dist/${name}.png` });
  }

  await cap(1.5, 'b381_015_peninsula');
  await cap(4.5, 'b381_045_east_dawn');
  await cap(7.2, 'b381_072_start_dawn');
  await cap(12.0, 'b381_120_route_day');
  await cap(16.5, 'b381_165_late_day');
  await cap(18.9, 'b381_189_finish_evening');
  await cap(21.0, 'b381_210_finish_sunset');
  await cap(24.0, 'b381_240_matte_transition');
  await cap(27.5, 'b381_275_core_message');
  await cap(29.5, 'b381_295_final_hold');

  const s = await page.evaluate(() => ({
    ready: document.querySelector('#frame').classList.contains('ready'),
    duration: window.__scene05Timeline.duration(),
    paused: window.__scene05Timeline.paused(),
    diagnostics: typeof window.__scene05Diagnostic === 'function',
    v381: typeof window.__scene05V381State === 'function' ? window.__scene05V381State() : null
  }));
  if (!s.ready || !s.paused || !s.diagnostics || s.duration < 29.9 || s.duration > 30.2) {
    throw new Error(`Bad v3.8.1 QA ${JSON.stringify(s)}`);
  }
  if (
    !s.v381 ||
    s.v381.matteOpacity < .98 ||
    !s.v381.matteVisible ||
    s.v381.mapStageOpacity > .001 ||
    s.v381.syntheticSunVisible ||
    Math.abs(s.v381.reflectionStrength) > .001
  ) {
    throw new Error(`Bad v3.8.1 finale state ${JSON.stringify(s.v381)}`);
  }

  async function diag(mode, name) {
    await page.evaluate(m => window.__scene05Diagnostic(m), mode);
    await renderFrame();
    await page.screenshot({ path: `final/scene05-b/dist/${name}.png` });
  }

  await diag('full', 'b381_diag_surface_full');
  await diag('south', 'b381_diag_surface_south');
  await diag('east', 'b381_diag_surface_east');
  await diag('west', 'b381_diag_surface_west');
  await diag('land', 'b381_diag_land_only');
  await diag('land_ocean', 'b381_diag_land_ocean');
  await diag('texture', 'b381_diag_texture_only');
  await diag('mask', 'b381_diag_canonical_mask');

  if (errors.length) throw new Error(errors.join('\n'));
  console.log(JSON.stringify(s));
} finally {
  await browser.close();
}
