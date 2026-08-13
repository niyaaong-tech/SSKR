import puppeteer from 'puppeteer-core';

const executablePath = process.env.BROWSER_PATH;
if (!executablePath) throw new Error('BROWSER_PATH is required');

const browser = await puppeteer.launch({
  headless: false,
  executablePath,
  protocolTimeout: 120000,
  args: [
    '--no-sandbox', '--disable-dev-shm-usage', '--ignore-gpu-blocklist',
    '--enable-webgl', '--use-gl=angle', '--disable-background-timer-throttling',
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

  await page.goto('http://127.0.0.1:4175/?qa=1', { waitUntil: 'networkidle0', timeout: 90000 });
  await page.waitForSelector('#frame.ready', { timeout: 60000 });
  await sleep(350);
  if (errors.length) throw new Error(errors.join('\n'));

  async function renderFrame() {
    await page.evaluate(() => {
      if (typeof window.__qaRafCallback !== 'function') throw new Error('QA RAF callback missing');
      window.__qaRafCallback(performance.now());
    });
    await sleep(160);
  }

  async function cState() {
    return page.evaluate(() => (
      typeof window.__scene05COceanState === 'function' ? window.__scene05COceanState() : null
    ));
  }

  async function cap(t, name) {
    await page.evaluate(x => { window.__scene05Timeline.pause().seek(x, false); }, t);
    await sleep(24);
    await renderFrame();
    const state = await cState();
    await page.screenshot({ path: `final/scene05-c/dist/${name}.png` });
    if (!state) throw new Error(`C ocean state hook missing at ${t}`);
    if (state.oceanOpacity < .97) throw new Error(`C ocean opacity too low ${JSON.stringify(state)}`);
    if (state.legacyCloudGroupVisible || state.photoCloudVisible) {
      throw new Error(`Clouds visible in C ${JSON.stringify(state)}`);
    }
    console.log(`CAP_OK ${name} ${JSON.stringify(state)}`);
    return state;
  }

  await cap(1.5, 'c01_015_peninsula_ocean');
  await cap(4.5, 'c01_045_east_dawn_ocean');
  await cap(12.0, 'c01_120_route_day_ocean');
  await cap(16.5, 'c01_165_late_day_ocean');
  await cap(18.9, 'c01_189_finish_evening_ocean');
  await cap(21.0, 'c01_210_finish_sunset_ocean');
  await cap(24.4, 'c01_244_finale_regression');
  await cap(29.5, 'c01_295_final_hold_regression');

  const meta = await page.evaluate(() => ({
    ready: document.querySelector('#frame').classList.contains('ready'),
    duration: window.__scene05Timeline.duration(),
    paused: window.__scene05Timeline.paused(),
    diagnostics: typeof window.__scene05Diagnostic === 'function',
    statementText: document.querySelector('#statement')?.innerText.trim() || ''
  }));
  if (!meta.ready || !meta.paused || !meta.diagnostics || meta.duration < 29.9 || meta.duration > 30.2) {
    throw new Error(`Bad C regression state ${JSON.stringify(meta)}`);
  }

  async function diag(mode, name) {
    await page.evaluate(m => { window.__scene05Diagnostic(m); }, mode);
    await renderFrame();
    await page.screenshot({ path: `final/scene05-c/dist/${name}.png` });
    console.log(`DIAG_OK ${name}`);
  }

  await diag('full', 'c01_diag_surface_full');
  await diag('land_ocean', 'c01_diag_land_ocean');
  await diag('mask', 'c01_diag_canonical_mask');

  if (errors.length) throw new Error(errors.join('\n'));
  console.log(`SCENE05_C_QA_OK ${JSON.stringify(meta)}`);
} finally {
  await browser.close();
}
