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

  console.log('QA_NAVIGATE_START');
  await page.goto('http://127.0.0.1:4174/?qa=1', { waitUntil: 'networkidle0', timeout: 90000 });
  await page.waitForSelector('#frame.ready', { timeout: 60000 });
  await sleep(350);
  if (errors.length) throw new Error(errors.join('\n'));
  console.log('QA_READY');

  async function renderFrame() {
    await page.evaluate(() => {
      if (typeof window.__qaRafCallback !== 'function') throw new Error('QA RAF callback missing');
      window.__qaRafCallback(performance.now());
    });
    await sleep(180);
  }

  async function seek(t) {
    // Do not return the GSAP Timeline object to Puppeteer. Returning pause().seek()
    // makes CDP attempt to serialize the large/cyclic timeline and can hang for minutes.
    await page.evaluate(x => {
      window.__scene05Timeline.pause().seek(x, false);
    }, t);
    await renderFrame();
  }

  async function cap(t, name) {
    console.log(`CAP_START ${name} t=${t}`);
    await seek(t);
    await page.screenshot({ path: `final/scene05-b/dist/${name}.png` });
    console.log(`CAP_OK ${name}`);
  }

  // Keep the accepted v3.8.2 0-22s chapter under regression coverage.
  await cap(1.5, 'b383_015_peninsula');
  await cap(4.5, 'b383_045_east_dawn');
  await cap(7.2, 'b383_072_start_dawn');
  await cap(12.0, 'b383_120_route_day');
  await cap(16.5, 'b383_165_late_day');
  await cap(18.9, 'b383_189_finish_evening');
  await cap(21.0, 'b383_210_finish_sunset');

  // v3.8.3 focused finale QA: handoff -> clean visual hold -> message -> final hold.
  await cap(22.4, 'b383_224_handoff_start');
  await cap(23.4, 'b383_234_handoff_resolve');
  await cap(24.5, 'b383_245_matte_settled');
  const settled = await page.evaluate(() => window.__scene05V383State());
  if (
    settled.matteOpacity < .98 ||
    settled.mapStageOpacity > .001 ||
    settled.sceneMarkOpacity > .001 ||
    settled.syntheticSunVisible ||
    Math.abs(settled.reflectionStrength) > .001
  ) {
    throw new Error(`Bad v3.8.3 settled handoff ${JSON.stringify(settled)}`);
  }
  console.log(`ASSERT_SETTLED_OK ${JSON.stringify(settled)}`);

  await cap(25.25, 'b383_252_clean_sunset_hold');
  const preMessage = await page.evaluate(() => window.__scene05V383State());
  if (preMessage.statementOpacity > .05) {
    throw new Error(`v3.8.3 message appears before clean sunset hold ${JSON.stringify(preMessage)}`);
  }
  console.log(`ASSERT_PREMESSAGE_OK ${JSON.stringify(preMessage)}`);

  await cap(26.2, 'b383_262_core_message');
  await cap(29.5, 'b383_295_final_hold');

  const s = await page.evaluate(() => ({
    ready: document.querySelector('#frame').classList.contains('ready'),
    duration: window.__scene05Timeline.duration(),
    paused: window.__scene05Timeline.paused(),
    diagnostics: typeof window.__scene05Diagnostic === 'function',
    v383: typeof window.__scene05V383State === 'function' ? window.__scene05V383State() : null
  }));
  if (!s.ready || !s.paused || !s.diagnostics || s.duration < 29.9 || s.duration > 30.2) {
    throw new Error(`Bad v3.8.3 QA ${JSON.stringify(s)}`);
  }
  if (
    !s.v383 ||
    s.v383.matteOpacity < .98 ||
    !s.v383.matteVisible ||
    s.v383.mapStageOpacity > .001 ||
    s.v383.sceneMarkOpacity > .001 ||
    s.v383.statementOpacity < .94 ||
    s.v383.syntheticSunVisible ||
    Math.abs(s.v383.reflectionStrength) > .001
  ) {
    throw new Error(`Bad v3.8.3 finale state ${JSON.stringify(s.v383)}`);
  }
  console.log(`ASSERT_FINAL_OK ${JSON.stringify(s)}`);

  async function diag(mode, name) {
    console.log(`DIAG_START ${name} mode=${mode}`);
    await page.evaluate(m => {
      window.__scene05Diagnostic(m);
    }, mode);
    await renderFrame();
    await page.screenshot({ path: `final/scene05-b/dist/${name}.png` });
    console.log(`DIAG_OK ${name}`);
  }

  await diag('full', 'b383_diag_surface_full');
  await diag('south', 'b383_diag_surface_south');
  await diag('east', 'b383_diag_surface_east');
  await diag('west', 'b383_diag_surface_west');
  await diag('land', 'b383_diag_land_only');
  await diag('land_ocean', 'b383_diag_land_ocean');
  await diag('texture', 'b383_diag_texture_only');
  await diag('mask', 'b383_diag_canonical_mask');

  if (errors.length) throw new Error(errors.join('\n'));
  console.log(JSON.stringify({ settled, preMessage, final: s }));
} finally {
  await browser.close();
}
