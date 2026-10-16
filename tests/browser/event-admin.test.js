// Browser UI contract with API stubs; these tests do not assert live DB or Google integration.
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), net = require('node:net');
const { spawn } = require('node:child_process');
const { chromium, webkit } = require('playwright');
const catalog = require('../../web/app/spot-catalog');
let browser, server, base;
const eventId = '00000000-0000-4000-8000-000000000017';
const fixture = () => ({ publicTitle: 'SSKR 운영 검수 행사', editionLabel: '개발 검수', description: '운영 게시용이 아닌 테스트 자료입니다.', timezone: 'Asia/Seoul', eventStartAt: '2027-04-17T06:00:00+09:00', eventEndAt: '2027-04-17T19:00:00+09:00', minimumSpotCheckins: 10, startLocationIds: ['sokcho'], finishLocationId: 'daecheon', sunlight: null });
before(async () => {
  const port = await new Promise(resolve => { const socket = net.createServer(); socket.listen(0, '127.0.0.1', () => { const value = socket.address().port; socket.close(() => resolve(value)); }); });
  base = 'http://127.0.0.1:' + port;
  server = spawn(process.execPath, ['server/dev-server.js'], { cwd: path.resolve(__dirname, '../..'), env: { ...process.env, SSKR_DEV_PORT: String(port), SSKR_BACKEND_MODE: 'mock' }, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
  await new Promise((resolve, reject) => { const timer = setTimeout(() => reject(Error('Server startup timeout')), 10000); server.stdout.on('data', chunk => { if (String(chunk).includes('SSKR dev server')) { clearTimeout(timer); resolve(); } }); server.once('error', reject); });
  const engine = process.env.BROWSER_ENGINE === 'webkit' ? webkit : chromium;
  browser = await engine.launch({ headless: true, ...(engine === chromium ? { channel: process.env.BROWSER_CHANNEL || (process.platform === 'win32' ? 'msedge' : undefined) } : {}) });
});
after(async () => { await browser?.close(); server?.kill(); });
async function page(handler, width = 1440) {
  const p = await browser.newPage({ viewport: { width, height: 900 }, isMobile: width < 800, hasTouch: width < 800, locale: 'ko-KR', timezoneId: 'Asia/Seoul', reducedMotion: 'reduce' });
  p.errors = []; p.on('pageerror', error => p.errors.push(error.message));
  await p.route('**/api/backend?*', handler);
  await p.goto(base + '/app/admin');
  return p;
}
async function fillBasics(p) {
  await p.getByLabel('행사 제목', { exact: true }).fill('SSKR 운영 검수 행사');
  await p.getByLabel('회차 이름', { exact: true }).fill('개발 검수');
  await p.getByLabel('개최일', { exact: true }).fill('2027-04-17');
  await p.getByLabel('출발 가능 시각', { exact: true }).fill('06:00');
  await p.getByLabel('도착 마감 시각', { exact: true }).fill('19:00');
  await p.getByRole('checkbox', { name: '속초해수욕장 강원 · 속초' }).check();
}
test('event admin saves a draft separately, verifies location times, and explicitly publishes the saved revision', async () => {
  let record = null, current = null;
  const mutations = [];
  const p = await page(async route => {
    const req = route.request();
    if (req.method() === 'GET') return route.fulfill({ json: { ok: true, events: record ? [record] : [], current } });
    mutations.push({ method: req.method(), headers: await req.allHeaders(), url: req.url(), body: req.postDataJSON() });
    if (req.url().includes('action=publish')) {
      current = { id: eventId, configVersion: 1 }; record = { ...record, revision: record.revision + 1, publishedVersion: 1 };
      return route.fulfill({ json: { ok: true, id: eventId, revision: record.revision, publishedVersion: 1, publishedAt: new Date().toISOString() } });
    }
    record = { id: eventId, revision: (record?.revision || 0) + 1, document: { ...req.postDataJSON().document, applicationOpenAt: '2027-03-01T00:00:00+09:00', applicationCloseAt: '2027-04-01T00:00:00+09:00', coreConfirmedAt: '2027-02-01T00:00:00+09:00', spotsConfirmedAt: '2027-02-02T00:00:00+09:00' }, publishedVersion: null, updatedAt: new Date().toISOString() };
    return route.fulfill({ json: { ok: true, ...record } });
  });
  await p.getByRole('button', { name: '초안 저장', exact: true }).waitFor();
  assert.equal(await p.getByLabel('행사 제목', { exact: true }).inputValue(), '');
  assert.equal(await p.getByLabel('개최일', { exact: true }).inputValue(), '');
  assert.equal(await p.locator('.start-option').count(), 11);
  await fillBasics(p); await p.getByRole('button', { name: '초안 저장', exact: true }).click();
  await p.getByText('초안을 저장했습니다. 공개 전까지 참가자 화면에는 반영되지 않습니다.', { exact: true }).waitFor();
  assert.equal(record.document.sunlight, null);
  assert.equal(await p.getByRole('button', { name: '검토 후 공개' }).isDisabled(), true);
  await p.getByLabel('속초해수욕장 일출', { exact: true }).fill('05:48');
  await p.getByLabel('대천해수욕장 일몰', { exact: true }).fill('19:08');
  await p.getByLabel('검토 자료 주소', { exact: true }).fill('https://example.org/solar-review');
  await p.getByLabel('개최일, 선택한 출발지의 일출과 도착지의 일몰 시각을 확인했습니다.', { exact: true }).check();
  await p.getByRole('button', { name: '초안 저장', exact: true }).click();
  await p.getByRole('button', { name: '검토 후 공개' }).waitFor({ state: 'visible' });
  await p.waitForFunction(() => !document.querySelector('#publish-event').disabled);
  assert.equal(record.document.eventStartAt, '2027-04-17T06:00:00+09:00');
  assert.equal(record.document.sunlight.starts[0].sunriseAt, '2027-04-17T05:48:00+09:00');
  assert.equal(record.document.sunlight.finish.locationId, 'daecheon');
  assert.equal(record.document.sunlight.calculationVersion, 'manual-review');
  assert.equal(record.document.sunlight.starts[0].lat, catalog.find(place => place.id === 'sokcho').lat);
  assert.equal(mutations[1].headers['if-match'], '"1"');
  assert.equal(mutations[1].headers['x-sskr-request'], '1');
  for (const key of ['applicationOpenAt', 'applicationCloseAt', 'coreConfirmedAt', 'spotsConfirmedAt']) assert.equal(mutations[1].body.document[key], record.document[key]);
  await p.getByRole('button', { name: '검토 후 공개' }).click();
  await p.getByRole('dialog').waitFor();
  assert.equal(mutations.length, 2);
  await p.getByRole('button', { name: '취소', exact: true }).click();
  assert.equal(mutations.length, 2);
  await p.getByRole('button', { name: '검토 후 공개' }).click();
  await p.getByRole('button', { name: '공개하기', exact: true }).click();
  await p.getByText('행사를 공개했습니다. 공개 버전 1 설정이 참가자 화면에 적용됩니다.', { exact: true }).waitFor();
  assert.equal(mutations[2].headers['if-match'], '"2"');
  assert.deepEqual(mutations[2].body, {});
  assert.equal(await p.locator('#event-badge').textContent(), '현재 공개 행사');
  await p.getByLabel('개최일', { exact: true }).fill('2027-04-18');
  assert.equal(await p.locator('[name=reviewed]').isChecked(), false);
  assert.equal(await p.getByRole('button', { name: '검토 후 공개' }).isDisabled(), true);
  assert.deepEqual(p.errors, []); await p.close();
});
test('event admin keeps conflicting edits when refreshing the event list and renders titles as text', async () => {
  let revision = 1;
  const title = '<img src=x onerror=alert(1)> 다른 운영자의 초안';
  const p = await page(route => {
    if (route.request().method() === 'GET') return route.fulfill({ json: { ok: true, events: [{ id: eventId, revision, document: { ...fixture(), publicTitle: title }, publishedVersion: null }] } });
    revision = 2;
    return route.fulfill({ status: 412, json: { ok: false, error: { userMessage: '<script>충돌</script>' } } });
  });
  await p.getByLabel('행사 제목', { exact: true }).fill('보존할 편집본');
  await p.getByRole('button', { name: '초안 저장', exact: true }).click();
  await p.getByText(/다른 화면에서 초안이 변경되었습니다/).waitFor();
  assert.equal(await p.getByLabel('행사 제목', { exact: true }).inputValue(), '보존할 편집본');
  await p.getByRole('button', { name: '목록 새로고침', exact: true }).click();
  await p.getByText(/목록을 갱신했습니다. 현재 입력은 그대로 유지됩니다/).waitFor();
  assert.equal(await p.getByLabel('행사 제목', { exact: true }).inputValue(), '보존할 편집본');
  assert.equal(await p.locator('.event-row img').count(), 0);
  await p.locator('.event-row').click(); await p.getByRole('button', { name: '취소', exact: true }).click();
  assert.equal(await p.getByLabel('행사 제목', { exact: true }).inputValue(), '보존할 편집본');
  await p.locator('.event-row').click(); await p.getByRole('button', { name: '불러오기', exact: true }).click();
  assert.equal(await p.getByLabel('행사 제목', { exact: true }).inputValue(), title);
  assert.match(await p.locator('#event-status').textContent(), /버전 2/);
  assert.deepEqual(p.errors, []); await p.close();
});
test('event admin saves an incomplete draft without inventing dates, times or start locations', async () => {
  let record = null;
  const documents = [];
  const p = await page(route => {
    if (route.request().method() === 'GET') return route.fulfill({ json: { ok: true, events: record ? [record] : [] } });
    const data = route.request().postDataJSON().document; documents.push(data);
    record = { id: eventId, revision: (record?.revision || 0) + 1, document: data, publishedVersion: null, updatedAt: new Date().toISOString() };
    return route.fulfill({ json: { ok: true, ...record } });
  });
  await p.getByRole('button', { name: '초안 저장', exact: true }).click();
  await p.getByText('초안을 저장했습니다. 공개 전까지 참가자 화면에는 반영되지 않습니다.', { exact: true }).waitFor();
  assert.equal(documents.length, 1);
  assert.equal(documents[0].publicTitle, '');
  assert.equal(documents[0].editionLabel, '');
  assert.equal(documents[0].eventStartAt, null);
  assert.equal(documents[0].eventEndAt, null);
  assert.deepEqual(documents[0].startLocationIds, []);
  assert.equal(documents[0].sunlight, null);
  assert.equal(await p.locator('.event-row strong').textContent(), '이름 없는 행사');
  assert.equal(await p.getByRole('button', { name: '검토 후 공개' }).isDisabled(), true);
  await p.getByLabel('개최일', { exact: true }).fill('2027-04-17');
  await p.getByRole('button', { name: '초안 저장', exact: true }).click();
  await p.getByText(/날짜·시각을 모두 입력하지 않은 일정은 이 브라우저에만 보관했습니다/).waitFor();
  assert.equal(documents.length, 2);
  assert.equal(documents[1].eventStartAt, null);
  assert.equal(documents[1].eventEndAt, null);
  assert.equal(await p.getByLabel('개최일', { exact: true }).inputValue(), '2027-04-17');
  await p.reload();
  await p.getByText('이전에 작성하던 초안을 복원했습니다. 저장 전 내용을 확인하세요.', { exact: true }).waitFor();
  assert.equal(await p.getByLabel('개최일', { exact: true }).inputValue(), '2027-04-17');
  await p.getByLabel('도착 마감 시각', { exact: true }).fill('19:00');
  await p.getByRole('button', { name: '초안 저장', exact: true }).click();
  await p.getByText('초안을 저장했습니다. 공개 전까지 참가자 화면에는 반영되지 않습니다.', { exact: true }).waitFor();
  assert.equal(documents[2].eventStartAt, null);
  assert.equal(documents[2].eventEndAt, '2027-04-17T19:00:00+09:00');
  await p.reload();
  await p.getByLabel('개최일', { exact: true }).waitFor();
  assert.equal(await p.getByLabel('개최일', { exact: true }).inputValue(), '2027-04-17');
  assert.equal(await p.getByLabel('출발 가능 시각', { exact: true }).inputValue(), '');
  assert.equal(await p.getByRole('button', { name: '검토 후 공개' }).isDisabled(), true);
  assert.deepEqual(p.errors, []); await p.close();
});
test('event admin requires a real authorized account and preserves editing on 403', async () => {
  let status = 401;
  const p = await page(route => route.fulfill(status === 200 ? { json: { ok: true, events: [] } } : { status, json: { ok: false, error: { userMessage: '권한 없음' } } }));
  await p.getByRole('button', { name: 'Google로 로그인', exact: true }).waitFor();
  assert.equal(await p.locator('#admin-workspace').isVisible(), false);
  status = 403; await p.getByRole('button', { name: '다시 확인', exact: true }).click();
  await p.getByText(/행사 운영 권한이 있는 계정만 사용할 수 있습니다/).waitFor();
  assert.equal(await p.getByRole('button', { name: 'Google로 로그인', exact: true }).isVisible(), false);
  status = 200; await p.getByRole('button', { name: '다시 확인', exact: true }).click();
  await fillBasics(p); status = 403;
  await p.getByRole('button', { name: '초안 저장', exact: true }).click();
  await p.getByText(/행사 운영 권한이 있는 계정만 사용할 수 있습니다/).waitFor();
  assert.equal(await p.getByLabel('행사 제목', { exact: true }).inputValue(), 'SSKR 운영 검수 행사');
  assert.equal(await p.getByRole('button', { name: '초안 저장', exact: true }).isDisabled(), true);
  assert.deepEqual(p.errors, []); await p.close();
});
test('event admin mobile and desktop controls keep 44px targets and avoid horizontal overflow', async () => {
  for (const width of [360, 390, 1440]) {
    const p = await page(route => route.fulfill({ json: { ok: true, events: [] } }), width);
    await fillBasics(p);
    for (const checkbox of await p.locator('.start-option input').all()) await checkbox.check();
    await p.evaluate(() => document.fonts.ready);
    const geometry = await p.evaluate(() => ({
      viewport: innerWidth, width: document.documentElement.scrollWidth,
      fields: [...document.querySelectorAll('.field input:not([type=checkbox])')].filter(node => node.getBoundingClientRect().height).map(node => ({ name: node.name, height: node.getBoundingClientRect().height, width: node.getBoundingClientRect().width })),
      buttons: [...document.querySelectorAll('button')].filter(node => node.getBoundingClientRect().height).map(node => ({ text: node.textContent, height: node.getBoundingClientRect().height })),
      timeTop: document.querySelector('[name=startTime]').getBoundingClientRect().top,
      endTop: document.querySelector('[name=endTime]').getBoundingClientRect().top,
      sunriseRows: [...document.querySelectorAll('.sunrise-grid input')].map(node => ({ top: node.getBoundingClientRect().top, bottom: node.getBoundingClientRect().bottom }))
    }));
    assert.ok(geometry.width <= geometry.viewport, JSON.stringify(geometry));
    assert.ok(geometry.fields.every(field => field.height >= 44 && field.width >= 90), JSON.stringify(geometry));
    assert.ok(await p.locator('[name=isTest]').evaluate(e=>e.closest('label').getBoundingClientRect().height>=44));
    assert.ok(geometry.buttons.every(button => button.height >= 44), JSON.stringify(geometry));
    assert.ok(Math.abs(geometry.timeTop - geometry.endTop) < 1, JSON.stringify(geometry));
    for (let i = 0; i < geometry.sunriseRows.length - 1; i += 2) assert.ok(Math.abs(geometry.sunriseRows[i].top - geometry.sunriseRows[i + 1].top) < 1, JSON.stringify(geometry));
    if (process.env.SSKR_QA_OUTPUT) {
      fs.mkdirSync(process.env.SSKR_QA_OUTPUT, { recursive: true });
      const name = 'event-admin-' + (process.env.BROWSER_ENGINE || 'chromium') + '-' + width;
      await p.screenshot({ path: path.join(process.env.SSKR_QA_OUTPUT, name + '.png'), fullPage: true });
      fs.writeFileSync(path.join(process.env.SSKR_QA_OUTPUT, name + '.json'), JSON.stringify(geometry, null, 2));
    }
    assert.deepEqual(p.errors, []); await p.close();
  }
});
