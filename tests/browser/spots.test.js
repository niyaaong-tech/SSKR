const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const net = require('node:net');
const path = require('node:path');
const { chromium } = require('playwright');

let server, browser, base;
before(async () => {
  const port = await new Promise(resolve => {
    const socket = net.createServer();
    socket.listen(0, '127.0.0.1', () => {
      const port = socket.address().port;
      socket.close(() => resolve(port));
    });
  });
  base = `http://127.0.0.1:${port}`;
  server = spawn(process.execPath, ['server/dev-server.js'], {
    cwd: path.resolve(__dirname, '../..'),
    env: { ...process.env, SSKR_DEV_PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(Error('Dev server did not start')), 10000);
    server.stdout.on('data', data => {
      if (data.toString().includes('SSKR dev server')) { clearTimeout(timer); resolve(); }
    });
    server.once('error', reject);
    server.once('exit', code => { clearTimeout(timer); reject(Error(`Dev server exited ${code}`)); });
  });
  browser = await chromium.launch({
    headless: true,
    channel: process.env.BROWSER_CHANNEL || (process.platform === 'win32' ? 'msedge' : undefined)
  });
});
after(async () => { await browser?.close(); server?.kill(); });

async function page(width = 1440, height = 1000) {
  const p = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
  p.errors = [];
  p.on('pageerror', error => p.errors.push(error.message));
  await p.route('**/web/shared/map/map.js*', async route => {
    const response = await route.fetch();
    await route.fulfill({ response, body: (await response.text()).replace(
      'layer=root.L.layerGroup().addTo(map);',
      'window.__map=map;layer=root.L.layerGroup().addTo(map);'
    ) });
  });
  return p;
}
async function open(p, url = '/app/spots?scenario=guest') {
  await p.goto(base + url);
  await p.waitForFunction(() => window.__map);
  await p.locator('.spot-mini-card').first().waitFor();
}
const resultIds = p => p.locator('.spot-mini-select').evaluateAll(elements => elements.map(e => e.dataset.place));
async function assertPhoto(p) {
  await p.waitForFunction(() => [...document.querySelectorAll('.leaflet-tooltip .spot-photo-card')].some(e => {
    const image = e.querySelector('img');
    return e.getBoundingClientRect().height >= 80 && image?.complete && image.naturalWidth > 0;
  }));
  const photo = p.locator('.leaflet-tooltip .spot-photo-card:visible').last();
  const geometry = await photo.evaluate(e => {
    const card = e.getBoundingClientRect(), caption = e.querySelector('strong').getBoundingClientRect();
    return { card: card.toJSON(), caption: caption.toJSON(), text: e.querySelector('strong').textContent };
  });
  assert.ok(geometry.text.trim());
  assert.ok(geometry.caption.top >= geometry.card.top && geometry.caption.bottom <= geometry.card.bottom);
}

test('browse hover and keyboard selection display real photos and captions at every supported width', async () => {
  for (const width of [360, 390, 430, 768, 1280, 1440, 1920]) {
    const p = await page(width, 844);
    await open(p, '/app/spots/yesan-market?scenario=guest');
    assert.ok(await p.locator('.spot-mode-switch button').evaluateAll(elements => elements.every(e => {
      const range = document.createRange();
      range.selectNodeContents(e);
      return range.getClientRects().length === 1 && e.getBoundingClientRect().height >= 44;
    })));
    await p.locator('.spot-map').scrollIntoViewIfNeeded();
    await assertPhoto(p);
    await p.evaluate(() => __map.fire('click'));
    const marker = p.locator('.spot-pin[title="예산시장"]');
    await marker.hover();
    const center = await p.evaluate(() => ({ center: __map.getCenter(), zoom: __map.getZoom() }));
    await assertPhoto(p);
    assert.deepEqual(await p.evaluate(() => ({ center: __map.getCenter(), zoom: __map.getZoom() })), center);
    assert.equal(await p.locator('.spot-route-add').count(), 0);
    await marker.focus();
    await p.keyboard.press('Enter');
    await assertPhoto(p);
    assert.equal(await p.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    assert.deepEqual(p.errors, []);
    await p.close();
  }
});

test('combined search, category and place kind survive reload and shared links', async () => {
  const p = await page();
  await open(p);
  await p.locator('[data-category="food"]').click();
  await p.locator('.spot-search input').fill('충남');
  await p.waitForFunction(() => new URL(location.href).searchParams.get('spotSearch') === '충남');
  const ids = await resultIds(p), url = p.url();
  assert.equal(ids.length, 3);
  assert.equal(new URL(url).searchParams.get('spotCategory'), 'food');
  await p.reload();
  await p.waitForFunction(() => window.__map);
  assert.deepEqual(await resultIds(p), ids);
  assert.equal(await p.locator('[data-category="food"]').getAttribute('aria-pressed'), 'true');
  const shared = await page();
  await shared.goto(url);
  await shared.waitForFunction(() => window.__map);
  assert.deepEqual(await resultIds(shared), ids);
  await p.locator('[data-action="clear"]').click();
  await p.locator('[data-kind="all"]').click();
  await p.reload();
  await p.waitForFunction(() => window.__map);
  assert.equal(await p.locator('[data-kind="all"]').getAttribute('aria-pressed'), 'true');
  assert.equal(new URL(p.url()).searchParams.has('spotSearch'), false);
  assert.deepEqual(p.errors, []);
  assert.deepEqual(shared.errors, []);
  await shared.close();
  await p.close();
});

test('pagination and an empty map viewport remain recoverable without losing search conditions', async () => {
  const p = await page();
  await open(p);
  const first = await resultIds(p);
  await p.locator('[data-action="next-cards"]').click();
  assert.equal((await resultIds(p)).length, 12);
  assert.ok((await resultIds(p)).every(id => !first.includes(id)));
  await p.locator('[data-action="previous-cards"]').click();
  assert.deepEqual(await resultIds(p), first);
  await p.evaluate(() => __map.setView([33.4, 126.5], 11, { animate: false }));
  await p.locator('.spot-list-empty [data-action="fit"]').waitFor();
  assert.equal(await p.locator('.spot-mini-card').count(), 0);
  await p.locator('.spot-list-empty [data-action="fit"]').click();
  await p.locator('.spot-mini-card').first().waitFor();
  assert.deepEqual(await resultIds(p), first);
  assert.deepEqual(p.errors, []);
  await p.close();
});

test('empty search can be reset and browsing filters return after route editing', async () => {
  const p = await page(390, 844);
  await open(p);
  await p.locator('[data-category="cafe"]').click();
  await p.locator('.spot-search input').fill('충남');
  await p.waitForFunction(() => new URL(location.href).searchParams.get('spotSearch') === '충남');
  const ids = await resultIds(p);
  await p.locator('[data-spot-mode="plan"]').click();
  assert.ok(await p.evaluate(() => SSKR_SPOT_CATALOG.filter(place => place.kind === 'start').every(place =>
    __map.getBounds().contains([place.lat, place.lng])
  )), 'all starts must be visible when entering the editor from a filtered map');
  await p.locator('[data-spot-mode="browse"]').click();
  assert.deepEqual(await resultIds(p), ids);
  assert.equal(await p.locator('.spot-search input').inputValue(), '충남');
  assert.equal(await p.locator('[data-category="cafe"]').getAttribute('aria-pressed'), 'true');
  await p.locator('.spot-search input').fill('없는장소xyz');
  await p.waitForSelector('.spot-detail-empty [data-action="reset"]');
  assert.equal(await p.locator('.spot-mini-card').count(), 0);
  await p.locator('.spot-detail-empty [data-action="reset"]').click();
  assert.equal(await p.locator('.spot-mini-card').count(), 12);
  assert.equal(await p.locator('.spot-search input').inputValue(), '');
  assert.equal(await p.locator('[data-category="all"]').getAttribute('aria-pressed'), 'true');
  assert.equal(new URL(p.url()).searchParams.has('spotCategory'), false);
  assert.deepEqual(p.errors, []);
  await p.close();
});
