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

  console.log('QA_NAVIGATE_START');
  await page.goto('http://127.0.0.1:4174/?qa=1', { waitUntil: 'networkidle0', timeout: 90000 });
  await page.waitForSelector('#frame.ready', { timeout: 60000 });
  await sleep(350);
  if (errors.length) throw new Error(errors.join('\n'));
  console.log('QA_READY');

  async function state() {
    return await page.evaluate(() => (
      typeof window.__scene05V384State === 'function' ? window.__scene05V384State() : null
    ));
  }

  async function renderFrame() {
    await page.evaluate(() => {
      if (typeof window.__qaRafCallback !== 'function') throw new Error('QA RAF callback missing');
      window.__qaRafCallback(performance.now());
    });
    await sleep(180);
  }

  async function cap(t, name) {
    console.log(`CAP_START ${name} t=${t}`);
    await page.evaluate(x => { window.__scene05Timeline.pause().seek(x, false); }, t);
    await sleep(24);
    const authored = await state();
    await renderFrame();
    const rendered = await state();
    await page.screenshot({ path: `final/scene05-b/dist/${name}.png` });
    console.log(`CAP_OK ${name}`);
    return { authored, rendered };
  }

  function assertRenderedSafety(sample, label) {
    const s = sample?.rendered;
    if (!s || s.syntheticSunVisible || Math.abs(s.reflectionStrength) > .001) {
      throw new Error(`Bad rendered finale safety ${label} ${JSON.stringify(s)}`);
    }
  }

  await cap(1.5, 'b384_015_peninsula');
  await cap(4.5, 'b384_045_east_dawn');
  await cap(7.2, 'b384_072_start_dawn');
  await cap(12.0, 'b384_120_route_day');
  await cap(16.5, 'b384_165_late_day');
  await cap(18.9, 'b384_189_finish_evening');
  await cap(21.0, 'b384_210_finish_sunset');
  await cap(22.4, 'b384_224_handoff_start');
  await cap(23.4, 'b384_234_handoff_resolve');

  const first = await cap(24.4, 'b384_244_still01_message');
  const a1 = first.authored;
  if (!a1 || a1.matteOpacity < .98 || a1.mapStageOpacity > .001 || a1.sceneMarkOpacity > .001 ||
      a1.still1Opacity < .98 || a1.still2Opacity > .02 || a1.still3Opacity > .02 ||
      a1.statementOpacity < .94 || a1.syntheticSunVisible) {
    throw new Error(`Bad v3.8.4 first still ${JSON.stringify(a1)}`);
  }
  assertRenderedSafety(first, 'still01');
  console.log(`ASSERT_STILL01_OK ${JSON.stringify(first)}`);

  const cross12 = await cap(25.52, 'b384_255_still01_to_02');
  const a12 = cross12.authored;
  if (!a12 || a12.still1Opacity < .35 || a12.still1Opacity > .65 ||
      a12.still2Opacity < .35 || a12.still2Opacity > .65 || a12.still3Opacity > .02 ||
      a12.statementOpacity < .94) {
    throw new Error(`Bad v3.8.4 1->2 crossfade ${JSON.stringify(a12)}`);
  }
  assertRenderedSafety(cross12, 'cross12');
  console.log(`ASSERT_CROSS12_OK ${JSON.stringify(cross12)}`);

  const second = await cap(26.30, 'b384_260_still02_hold');
  const a2 = second.authored;
  if (!a2 || a2.still1Opacity > .02 || a2.still2Opacity < .98 || a2.still3Opacity > .02 || a2.statementOpacity < .94) {
    throw new Error(`Bad v3.8.4 second still ${JSON.stringify(a2)}`);
  }
  assertRenderedSafety(second, 'still02');
  console.log(`ASSERT_STILL02_OK ${JSON.stringify(second)}`);

  const cross23 = await cap(27.52, 'b384_275_still02_to_03');
  const a23 = cross23.authored;
  if (!a23 || a23.still1Opacity > .02 || a23.still2Opacity < .35 || a23.still2Opacity > .65 ||
      a23.still3Opacity < .35 || a23.still3Opacity > .65 || a23.statementOpacity < .94) {
    throw new Error(`Bad v3.8.4 2->3 crossfade ${JSON.stringify(a23)}`);
  }
  assertRenderedSafety(cross23, 'cross23');
  console.log(`ASSERT_CROSS23_OK ${JSON.stringify(cross23)}`);

  const third = await cap(28.10, 'b384_281_still03_hold');
  const a3 = third.authored;
  if (!a3 || a3.still1Opacity > .02 || a3.still2Opacity > .02 || a3.still3Opacity < .98 || a3.statementOpacity < .94) {
    throw new Error(`Bad v3.8.4 third still ${JSON.stringify(a3)}`);
  }
  assertRenderedSafety(third, 'still03');
  console.log(`ASSERT_STILL03_OK ${JSON.stringify(third)}`);

  const finalSample = await cap(29.50, 'b384_295_final_hold');
  const af = finalSample.authored;
  const meta = await page.evaluate(() => ({
    ready: document.querySelector('#frame').classList.contains('ready'),
    duration: window.__scene05Timeline.duration(),
    paused: window.__scene05Timeline.paused(),
    diagnostics: typeof window.__scene05Diagnostic === 'function',
    statementText: document.querySelector('#statement')?.innerText.trim() || ''
  }));
  if (!meta.ready || !meta.paused || !meta.diagnostics || meta.duration < 29.9 || meta.duration > 30.2) {
    throw new Error(`Bad v3.8.4 QA ${JSON.stringify(meta)}`);
  }
  if (!af || af.matteOpacity < .98 || !af.matteVisible || af.mapStageOpacity > .001 || af.sceneMarkOpacity > .001 ||
      af.still1Opacity > .02 || af.still2Opacity > .02 || af.still3Opacity < .98 || af.statementOpacity < .94 || af.syntheticSunVisible) {
    throw new Error(`Bad v3.8.4 final authored state ${JSON.stringify(af)}`);
  }
  assertRenderedSafety(finalSample, 'final');
  if (meta.statementText !== '해질무렵 라이딩이 마무리되면,\n현장은 축제가 되고 기억은 영원이 됩니다.') {
    throw new Error(`Bad v3.8.4 copy ${JSON.stringify(meta.statementText)}`);
  }
  console.log(`ASSERT_FINAL_OK ${JSON.stringify({ ...meta, sample: finalSample })}`);

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
  console.log(JSON.stringify({ first, cross12, second, cross23, third, final: { ...meta, sample: finalSample } }));
} finally {
  await browser.close();
}
