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

  // Accepted v3.8.2 / v3.8.3 journey regression coverage.
  await cap(1.5, 'b384_015_peninsula');
  await cap(4.5, 'b384_045_east_dawn');
  await cap(7.2, 'b384_072_start_dawn');
  await cap(12.0, 'b384_120_route_day');
  await cap(16.5, 'b384_165_late_day');
  await cap(18.9, 'b384_189_finish_evening');
  await cap(21.0, 'b384_210_finish_sunset');

  // Handoff remains the accepted v3.8.3 structure.
  await cap(22.4, 'b384_224_handoff_start');
  await cap(23.4, 'b384_234_handoff_resolve');

  // First still + fixed central statement.
  await cap(24.4, 'b384_244_still01_message');
  const first = await page.evaluate(() => window.__scene05V384State());
  if (
    first.matteOpacity < .98 || first.mapStageOpacity > .001 || first.sceneMarkOpacity > .001 ||
    first.still1Opacity < .98 || first.still2Opacity > .02 || first.still3Opacity > .02 ||
    first.statementOpacity < .94 || first.syntheticSunVisible || Math.abs(first.reflectionStrength) > .001
  ) throw new Error(`Bad v3.8.4 first still ${JSON.stringify(first)}`);
  console.log(`ASSERT_STILL01_OK ${JSON.stringify(first)}`);

  // Still 01 -> Still 02 smooth crossfade after the requested 3-second exposure.
  await cap(25.52, 'b384_255_still01_to_02');
  const cross12 = await page.evaluate(() => window.__scene05V384State());
  if (
    cross12.still1Opacity < .15 || cross12.still1Opacity > .85 ||
    cross12.still2Opacity < .15 || cross12.still2Opacity > .85 ||
    cross12.still3Opacity > .02 || cross12.statementOpacity < .94
  ) throw new Error(`Bad v3.8.4 1->2 crossfade ${JSON.stringify(cross12)}`);
  console.log(`ASSERT_CROSS12_OK ${JSON.stringify(cross12)}`);

  await cap(26.05, 'b384_260_still02_hold');
  const second = await page.evaluate(() => window.__scene05V384State());
  if (second.still1Opacity > .02 || second.still2Opacity < .98 || second.still3Opacity > .02 || second.statementOpacity < .94) {
    throw new Error(`Bad v3.8.4 second still ${JSON.stringify(second)}`);
  }
  console.log(`ASSERT_STILL02_OK ${JSON.stringify(second)}`);

  // Two seconds after the second still begins, crossfade into the festival still.
  await cap(27.52, 'b384_275_still02_to_03');
  const cross23 = await page.evaluate(() => window.__scene05V384State());
  if (
    cross23.still1Opacity > .02 ||
    cross23.still2Opacity < .15 || cross23.still2Opacity > .85 ||
    cross23.still3Opacity < .15 || cross23.still3Opacity > .85 ||
    cross23.statementOpacity < .94
  ) throw new Error(`Bad v3.8.4 2->3 crossfade ${JSON.stringify(cross23)}`);
  console.log(`ASSERT_CROSS23_OK ${JSON.stringify(cross23)}`);

  await cap(28.1, 'b384_281_still03_hold');
  await cap(29.5, 'b384_295_final_hold');

  const s = await page.evaluate(() => ({
    ready: document.querySelector('#frame').classList.contains('ready'),
    duration: window.__scene05Timeline.duration(),
    paused: window.__scene05Timeline.paused(),
    diagnostics: typeof window.__scene05Diagnostic === 'function',
    v384: typeof window.__scene05V384State === 'function' ? window.__scene05V384State() : null,
    statementText: document.querySelector('#statement')?.innerText.trim() || ''
  }));
  if (!s.ready || !s.paused || !s.diagnostics || s.duration < 29.9 || s.duration > 30.2) {
    throw new Error(`Bad v3.8.4 QA ${JSON.stringify(s)}`);
  }
  if (
    !s.v384 || s.v384.matteOpacity < .98 || !s.v384.matteVisible ||
    s.v384.mapStageOpacity > .001 || s.v384.sceneMarkOpacity > .001 ||
    s.v384.still1Opacity > .02 || s.v384.still2Opacity > .02 || s.v384.still3Opacity < .98 ||
    s.v384.statementOpacity < .94 || s.v384.syntheticSunVisible || Math.abs(s.v384.reflectionStrength) > .001
  ) throw new Error(`Bad v3.8.4 final state ${JSON.stringify(s.v384)}`);
  if (s.statementText !== '해질무렵 라이딩이 마무리되면,\n현장은 축제가 되고 기억은 영원이 됩니다.') {
    throw new Error(`Bad v3.8.4 copy ${JSON.stringify(s.statementText)}`);
  }
  console.log(`ASSERT_FINAL_OK ${JSON.stringify(s)}`);

  async function diag(mode, name) {
    console.log(`DIAG_START ${name} mode=${mode}`);
    await page.evaluate(m => { window.__scene05Diagnostic(m); }, mode);
    await renderFrame();
    await page.screenshot({ path: `final/scene05-b/dist/${name}.png` });
    console.log(`DIAG_OK ${name}`);
  }

  await diag('full', 'b384_diag_surface_full');
  await diag('south', 'b384_diag_surface_south');
  await diag('east', 'b384_diag_surface_east');
  await diag('west', 'b384_diag_surface_west');
  await diag('land', 'b384_diag_land_only');
  await diag('land_ocean', 'b384_diag_land_ocean');
  await diag('texture', 'b384_diag_texture_only');
  await diag('mask', 'b384_diag_canonical_mask');

  if (errors.length) throw new Error(errors.join('\n'));
  console.log(JSON.stringify({ first, cross12, second, cross23, final: s }));
} finally {
  await browser.close();
}
