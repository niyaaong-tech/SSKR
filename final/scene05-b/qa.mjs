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

  async function seekAuthored(t) {
    await page.evaluate(x => {
      window.__scene05Timeline.pause().seek(x, false);
    }, t);
    // Give style recalculation a small deterministic window, but do not execute
    // the app RAF yet. DOM tween assertions should describe the authored time.
    await sleep(24);
    return await page.evaluate(() => (
      typeof window.__scene05V384State === 'function' ? window.__scene05V384State() : null
    ));
  }

  async function cap(t, name) {
    console.log(`CAP_START ${name} t=${t}`);
    const authoredState = await seekAuthored(t);
    // Render Three.js only after the authored DOM/timeline state has been sampled.
    // This prevents the QA RAF callback from contaminating timing assertions.
    await renderFrame();
    await page.screenshot({ path: `final/scene05-b/dist/${name}.png` });
    console.log(`CAP_OK ${name}`);
    return authoredState;
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
  const first = await cap(24.4, 'b384_244_still01_message');
  if (
    !first || first.matteOpacity < .98 || first.mapStageOpacity > .001 || first.sceneMarkOpacity > .001 ||
    first.still1Opacity < .98 || first.still2Opacity > .02 || first.still3Opacity > .02 ||
    first.statementOpacity < .94 || first.syntheticSunVisible || Math.abs(first.reflectionStrength) > .001
  ) throw new Error(`Bad v3.8.4 first still ${JSON.stringify(first)}`);
  console.log(`ASSERT_STILL01_OK ${JSON.stringify(first)}`);

  // Exact authored midpoint of the 25.16–25.88 still 01 -> 02 crossfade.
  const cross12 = await cap(25.52, 'b384_255_still01_to_02');
  if (
    !cross12 || cross12.still1Opacity < .35 || cross12.still1Opacity > .65 ||
    cross12.still2Opacity < .35 || cross12.still2Opacity > .65 ||
    cross12.still3Opacity > .02 || cross12.statementOpacity < .94
  ) throw new Error(`Bad v3.8.4 1->2 crossfade ${JSON.stringify(cross12)}`);
  console.log(`ASSERT_CROSS12_OK ${JSON.stringify(cross12)}`);

  // Fully settled second still, before the authored 27.16 second crossfade.
  const second = await cap(26.30, 'b384_263_still02_hold');
  if (!second || second.still1Opacity > .02 || second.still2Opacity < .98 || second.still3Opacity > .02 || second.statementOpacity < .94) {
    throw new Error(`Bad v3.8.4 second still ${JSON.stringify(second)}`);
  }
  console.log(`ASSERT_STILL02_OK ${JSON.stringify(second)}`);

  // Exact authored midpoint of the 27.16–27.88 still 02 -> 03 crossfade.
  const cross23 = await cap(27.52, 'b384_275_still02_to_03');
  if (
    !cross23 || cross23.still1Opacity > .02 ||
    cross23.still2Opacity < .35 || cross23.still2Opacity > .65 ||
    cross23.still3Opacity < .35 || cross23.still3Opacity > .65 ||
    cross23.statementOpacity < .94
  ) throw new Error(`Bad v3.8.4 2->3 crossfade ${JSON.stringify(cross23)}`);
  console.log(`ASSERT_CROSS23_OK ${JSON.stringify(cross23)}`);

  const third = await cap(28.10, 'b384_281_still03_hold');
  if (!third || third.still1Opacity > .02 || third.still2Opacity > .02 || third.still3Opacity < .98 || third.statementOpacity < .94) {
    throw new Error(`Bad v3.8.4 third still ${JSON.stringify(third)}`);
  }
  console.log(`ASSERT_STILL03_OK ${JSON.stringify(third)}`);

  const finalState = await cap(29.50, 'b384_295_final_hold');
  const s = await page.evaluate(() => ({
    ready: document.querySelector('#frame').classList.contains('ready'),
    duration: window.__scene05Timeline.duration(),
    paused: window.__scene05Timeline.paused(),
    diagnostics: typeof window.__scene05Diagnostic === 'function',
    statementText: document.querySelector('#statement')?.innerText.trim() || ''
  }));
  if (!s.ready || !s.paused || !s.diagnostics || s.duration < 29.9 || s.duration > 30.2) {
    throw new Error(`Bad v3.8.4 QA ${JSON.stringify(s)}`);
  }
  if (
    !finalState || finalState.matteOpacity < .98 || !finalState.matteVisible ||
    finalState.mapStageOpacity > .001 || finalState.sceneMarkOpacity > .001 ||
    finalState.still1Opacity > .02 || finalState.still2Opacity > .02 || finalState.still3Opacity < .98 ||
    finalState.statementOpacity < .94 || finalState.syntheticSunVisible || Math.abs(finalState.reflectionStrength) > .001
  ) throw new Error(`Bad v3.8.4 final state ${JSON.stringify(finalState)}`);
  if (s.statementText !== '해질무렵 라이딩이 마무리되면,\n현장은 축제가 되고 기억은 영원이 됩니다.') {
    throw new Error(`Bad v3.8.4 copy ${JSON.stringify(s.statementText)}`);
  }
  console.log(`ASSERT_FINAL_OK ${JSON.stringify({ ...s, v384: finalState })}`);

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
  console.log(JSON.stringify({ first, cross12, second, cross23, third, final: { ...s, v384: finalState } }));
} finally {
  await browser.close();
}
