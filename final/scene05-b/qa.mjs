import puppeteer from 'puppeteer-core';
import fs from 'node:fs';

const browserPath = process.env.BROWSER_PATH || '/usr/bin/google-chrome';
const browser = await puppeteer.launch({
  executablePath: browserPath,
  headless: true,
  protocolTimeout: 300000,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist']
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  console.log('QA_NAVIGATE_START');
  await page.goto('http://127.0.0.1:4174/?qa=1', { waitUntil: 'networkidle0', timeout: 120000 });
  await page.waitForFunction(() => window.__scene05Ready && window.__scene05Timeline && window.__scene05V384State, { timeout: 120000 });
  console.log('QA_READY');

  async function renderFrame() {
    await page.evaluate(() => new Promise(resolve => {
      const cb = window.__qaRafCallback;
      if (typeof cb === 'function') cb(performance.now());
      resolve();
    }));
  }

  async function cap(t, name) {
    console.log(`CAP_START ${name} t=${t}`);
    const authored = await page.evaluate(x => {
      window.__scene05Timeline.pause().seek(x, false);
      return window.__scene05V384State();
    }, t);
    await renderFrame();
    const rendered = await page.evaluate(() => window.__scene05V384State());
    await page.screenshot({ path: `final/scene05-b/dist/${name}.png` });
    console.log(`CAP_OK ${name}`);
    return { authored, rendered };
  }

  function assertRenderedSafety(sample, label) {
    if (!sample.rendered || sample.rendered.syntheticSunVisible || sample.rendered.reflectionStrength > .001) {
      throw new Error(`Bad v3.8.4 rendered safety ${label} ${JSON.stringify(sample.rendered)}`);
    }
  }

  await cap(1.50, 'b384_015_peninsula');
  await cap(4.50, 'b384_045_east_dawn');
  await cap(7.20, 'b384_072_start_dawn');
  await cap(12.00, 'b384_120_route_day');
  await cap(16.50, 'b384_165_late_day');
  await cap(18.90, 'b384_189_finish_evening');
  await cap(21.00, 'b384_210_finish_sunset');
  await cap(22.40, 'b384_224_handoff_start');
  await cap(23.40, 'b384_234_handoff_resolve');

  const still01 = await cap(24.40, 'b384_244_still01_message');
  if (!still01.authored || still01.authored.matteOpacity < .98 || still01.authored.still1Opacity < .98 || still01.authored.still2Opacity > .02 || still01.authored.still3Opacity > .02 || still01.authored.statementOpacity < .94) {
    throw new Error(`Bad v3.8.4 still01 ${JSON.stringify(still01.authored)}`);
  }
  assertRenderedSafety(still01, 'still01');
  console.log(`ASSERT_STILL01_OK ${JSON.stringify(still01)}`);

  const cross12 = await cap(25.52, 'b384_255_still01_to_02');
  if (!cross12.authored || cross12.authored.cross12Progress < .35 || cross12.authored.cross12Progress > .65 || cross12.authored.still1Opacity < .30 || cross12.authored.still2Opacity < .30 || cross12.authored.still3Opacity > .02 || cross12.authored.statementOpacity < .94) {
    throw new Error(`Bad v3.8.4 cross12 ${JSON.stringify(cross12.authored)}`);
  }
  assertRenderedSafety(cross12, 'cross12');
  console.log(`ASSERT_CROSS12_OK ${JSON.stringify(cross12)}`);

  const still02 = await cap(26.30, 'b384_260_still02_hold');
  if (!still02.authored || still02.authored.still1Opacity > .02 || still02.authored.still2Opacity < .98 || still02.authored.still3Opacity > .02 || still02.authored.statementOpacity < .94) {
    throw new Error(`Bad v3.8.4 still02 ${JSON.stringify(still02.authored)}`);
  }
  assertRenderedSafety(still02, 'still02');
  console.log(`ASSERT_STILL02_OK ${JSON.stringify(still02)}`);

  const cross23 = await cap(27.52, 'b384_275_still02_to_03');
  if (!cross23.authored || cross23.authored.cross23Progress < .35 || cross23.authored.cross23Progress > .65 || cross23.authored.still1Opacity > .02 || cross23.authored.still2Opacity < .30 || cross23.authored.still3Opacity < .30 || cross23.authored.statementOpacity < .94) {
    throw new Error(`Bad v3.8.4 cross23 ${JSON.stringify(cross23.authored)}`);
  }
  assertRenderedSafety(cross23, 'cross23');
  console.log(`ASSERT_CROSS23_OK ${JSON.stringify(cross23)}`);

  const still03 = await cap(28.10, 'b384_281_still03_hold');
  if (!still03.authored || still03.authored.still1Opacity > .02 || still03.authored.still2Opacity > .02 || still03.authored.still3Opacity < .98 || still03.authored.statementOpacity < .94) {
    throw new Error(`Bad v3.8.4 still03 ${JSON.stringify(still03.authored)}`);
  }
  assertRenderedSafety(still03, 'still03');
  console.log(`ASSERT_STILL03_OK ${JSON.stringify(still03)}`);

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
  const normalizedStatementText = meta.statementText.split(/\n+/).map(s => s.trim()).filter(Boolean).join('\n');
  if (normalizedStatementText !== '해질무렵 라이딩이 마무리되면,\n현장은 축제가 되고 기억은 영원이 됩니다.') {
    throw new Error(`Bad v3.8.4 copy ${JSON.stringify(meta.statementText)}`);
  }
  console.log(`ASSERT_FINAL_OK ${JSON.stringify({ ...meta, normalizedStatementText, sample: finalSample })}`);

  async function diag(mode, name) {
    console.log(`DIAG_START ${name} mode=${mode}`);
    await page.evaluate(m => { window.__scene05Diagnostic(m); }, mode);
    await renderFrame();
    await page.screenshot({ path: `final/scene05-b/dist/${name}.png` });
    console.log(`DIAG_OK ${name}`);
  }
  await diag('surface', 'b384_diag_surface');
  await diag('alpha', 'b384_diag_alpha');
  await diag('coastline', 'b384_diag_coastline');
  await diag('coastzoom', 'b384_diag_coastzoom');
  console.log('QA_PASS');
} finally {
  await browser.close();
}
