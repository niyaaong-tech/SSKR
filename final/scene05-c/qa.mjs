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

async function renderFrame(page) {
  await page.evaluate(() => {
    if (typeof window.__qaRafCallback !== 'function') throw new Error('QA RAF callback missing');
    window.__qaRafCallback(performance.now());
  });
  await sleep(160);
}

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

  async function cState() {
    return page.evaluate(() => (
      typeof window.__scene05COceanState === 'function' ? window.__scene05COceanState() : null
    ));
  }

  async function cap(t, name) {
    await page.evaluate(x => { window.__scene05Timeline.pause().seek(x, false); }, t);
    await sleep(24);
    await renderFrame(page);
    const state = await cState();
    await page.screenshot({ path: `final/scene05-c/dist/${name}.png` });
    if (!state) throw new Error(`C ocean state hook missing at ${t}`);
    if (state.version !== '0.2') throw new Error(`Wrong C ocean version ${JSON.stringify(state)}`);
    if (!Number.isFinite(state.oceanOpacity) || state.oceanOpacity < .995 || state.oceanOpacity > 1.01) {
      throw new Error(`C v0.2 ocean must be opaque ${JSON.stringify(state)}`);
    }
    if (state.legacyCloudGroupVisible || state.photoCloudVisible) {
      throw new Error(`Clouds visible in C ${JSON.stringify(state)}`);
    }
    console.log(`CAP_OK ${name} ${JSON.stringify(state)}`);
    return state;
  }

  await cap(1.5, 'c02_015_peninsula_ocean');
  await cap(4.5, 'c02_045_east_dawn_ocean');
  await cap(12.0, 'c02_120_route_day_ocean');
  await cap(16.5, 'c02_165_late_day_ocean');
  await cap(18.9, 'c02_189_finish_evening_ocean');
  await cap(21.0, 'c02_210_finish_sunset_ocean');
  await cap(24.4, 'c02_244_finale_regression');
  await cap(29.5, 'c02_295_final_hold_regression');

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
    await renderFrame(page);
    await page.screenshot({ path: `final/scene05-c/dist/${name}.png` });
    console.log(`DIAG_OK ${name}`);
  }

  await diag('full', 'c02_diag_surface_full');
  await diag('land_ocean', 'c02_diag_land_ocean');
  await diag('mask', 'c02_diag_canonical_mask');

  // Mobile portrait regression: both closing-copy paragraphs must remain one line.
  const mobile = await browser.newPage();
  await mobile.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
  await mobile.goto('http://127.0.0.1:4175/?qa=1', { waitUntil: 'networkidle0', timeout: 90000 });
  await mobile.waitForSelector('#frame.ready', { timeout: 60000 });
  await mobile.evaluate(() => { window.__scene05Timeline.pause().seek(29.5, false); });
  await sleep(24);
  await renderFrame(mobile);
  const mobileCopy = await mobile.evaluate(() => {
    const ps = [...document.querySelectorAll('#statement p')];
    return ps.map(p => {
      const r = document.createRange();
      r.selectNodeContents(p);
      return {
        text: p.textContent.trim(),
        lineBoxes: r.getClientRects().length,
        whiteSpace: getComputedStyle(p).whiteSpace,
        fontSize: getComputedStyle(p).fontSize,
        scrollWidth: p.scrollWidth,
        clientWidth: p.clientWidth
      };
    });
  });
  await mobile.screenshot({ path: 'final/scene05-c/dist/c02_mobile_finale.png' });
  if (mobileCopy.length !== 2 || mobileCopy.some(x => x.lineBoxes !== 1 || x.whiteSpace !== 'nowrap' || x.scrollWidth > x.clientWidth + 1)) {
    throw new Error(`Mobile closing copy wrapped ${JSON.stringify(mobileCopy)}`);
  }
  await mobile.close();

  if (errors.length) throw new Error(errors.join('\n'));
  console.log(`SCENE05_C_V02_QA_OK ${JSON.stringify({ meta, mobileCopy })}`);
} finally {
  await browser.close();
}
