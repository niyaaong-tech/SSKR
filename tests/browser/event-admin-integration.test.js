// Runs the admin page against the real BFF validators and migration RPCs in PGlite.
// Only Google identity/session verification and the Supabase transport are injected.
// No remote database, production endpoint or existing user browser is used.
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), net = require('node:net');
const { spawn } = require('node:child_process');
const { chromium, webkit } = require('playwright');
const { PGlite } = require('@electric-sql/pglite');
const { createHandler } = require('../../server/backend/handler');
const { readPublished } = require('../../server/backend/events');
const catalog = require('../../web/app/spot-catalog');
const operatorId = '70000000-0000-4000-8000-000000000001';
const sessionId = '70000000-0000-4000-8000-000000000002';
const account = { id: operatorId, linked: true, provider: 'google', profile: { name: '행사 운영 통합 검수', email: 'event-test@example.invalid' } };
let db, browser, server, base, handler;
const requests = [];
const rpcErrors = [];
function rpcClient(role) {
  return { async rpc(name, args = {}) {
    try {
      const result = await db.transaction(async tx => {
        await tx.exec(role === 'anon' ? 'set local role anon' : 'set local role authenticated');
        if (name === 'sskr_events') return tx.query('select public.sskr_events($1,$2,$3::jsonb,$4) as result', [args.p_action, args.p_id, args.p_document === null ? null : JSON.stringify(args.p_document), args.p_revision]);
        if (name === 'sskr_public_event') return tx.query('select public.sskr_public_event() as result');
        throw Error('Unexpected test RPC: ' + name);
      });
      return { data: result.rows[0].result };
    } catch (error) { rpcErrors.push({ name, action: args.p_action, message: error.message }); return { error: { message: error.message } }; }
  } };
}
before(async () => {
  const port = await new Promise(resolve => { const socket = net.createServer(); socket.listen(0, '127.0.0.1', () => { const value = socket.address().port; socket.close(() => resolve(value)); }); });
  base = 'http://127.0.0.1:' + port;
  server = spawn(process.execPath, ['server/dev-server.js'], { cwd: path.resolve(__dirname, '../..'), env: { ...process.env, SSKR_DEV_PORT: String(port), SSKR_BACKEND_MODE: 'mock' }, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
  await new Promise((resolve, reject) => { const timer = setTimeout(() => reject(Error('Server startup timeout')), 10000); server.stdout.on('data', chunk => { if (String(chunk).includes('SSKR dev server')) { clearTimeout(timer); resolve(); } }); server.once('error', reject); });
  db = new PGlite();
  await db.exec(`create role anon; create role authenticated; create schema auth;
    create table auth.users(id uuid primary key,banned_until timestamptz,is_anonymous boolean default false);
    create table auth.sessions(id uuid primary key,user_id uuid references auth.users(id),not_after timestamptz);
    create table auth.identities(user_id uuid,provider text);
    create function auth.uid() returns uuid language sql as $$select '${operatorId}'::uuid$$;
    create function auth.jwt() returns jsonb language sql as $$select '{"sub":"${operatorId}","session_id":"${sessionId}"}'::jsonb$$;
    grant usage on schema auth to authenticated;
    grant execute on function auth.uid(),auth.jwt() to authenticated;
    insert into auth.users(id) values('${operatorId}');
    insert into auth.identities(user_id,provider) values('${operatorId}','google');
    insert into auth.sessions(id,user_id) values('${sessionId}','${operatorId}');`);
  for (const file of fs.readdirSync('supabase/migrations').filter(file => file.endsWith('.sql')).sort()) await db.exec(fs.readFileSync(path.join('supabase/migrations', file), 'utf8'));
  await db.query('insert into sskr_private.event_operators(user_id) values($1)', [operatorId]);
  const authenticated = rpcClient('authenticated'), anonymous = rpcClient('anon');
  handler = createHandler({
    readMode: () => 'supabase', getConfig: () => ({ mode: 'supabase', origin: base }),
    authService: { async actor() { return { id: operatorId, account, db: authenticated }; } },
    readPublished: (cfg, client) => readPublished(cfg, client || anonymous)
  });
  const engine = process.env.BROWSER_ENGINE === 'webkit' ? webkit : chromium;
  browser = await engine.launch({ headless: true, ...(engine === chromium ? { channel: process.env.BROWSER_CHANNEL || (process.platform === 'win32' ? 'msedge' : undefined) } : {}) });
});
after(async () => { await browser?.close(); server?.kill(); await db?.close(); });
async function page(width = 1440) {
  const p = await browser.newPage({ viewport: { width, height: 900 }, isMobile: width < 800, hasTouch: width < 800, reducedMotion: 'reduce', locale: 'ko-KR', timezoneId: 'Asia/Seoul' });
  p.errors = []; p.on('pageerror', error => p.errors.push(error.message));
  await p.route('**/api/backend?*', async route => {
    const request = route.request(), headers = await request.allHeaders();
    let status = 200, responseHeaders = {}, body = '';
    const req = { url: request.url(), method: request.method(), headers, body: request.postData() || undefined };
    const res = { getHeader: key => responseHeaders[key], setHeader: (key, value) => { responseHeaders[key] = value; }, writeHead: (value, h) => { status = value; Object.assign(responseHeaders, h); }, end: value => { body = value || ''; } };
    await handler(req, res);
    requests.push({ method: req.method, url: req.url, status, ifMatch: headers['if-match'], body: JSON.parse(body) });
    await route.fulfill({ status, headers: responseHeaders, body });
  });
  await p.goto(base + '/app/admin');
  await p.locator('#admin-workspace').waitFor({ state: 'visible' });
  return p;
}
async function published(p) {
  return p.evaluate(async () => { const response = await fetch('/api/backend?resource=event', { cache: 'no-store' }); return { status: response.status, body: await response.json() }; });
}
async function save(p) {
  const response = p.waitForResponse(res => ['POST', 'PUT'].includes(res.request().method()) && res.url().includes('resource=events') && !res.url().includes('action=publish'));
  await p.getByRole('button', { name: '초안 저장', exact: true }).click();
  const result = await response; await p.waitForFunction(() => !document.querySelector('#save-event').textContent.includes('처리 중'));
  return { status: result.status(), body: await result.json() };
}
test('admin UI integrates empty draft, reviewed publication, public DTO and conflicting edits through the real BFF and SQL', { timeout: 120000 }, async () => {
  const primary = await page();
  assert.equal((await published(primary)).body.event.id, null);
  const blank = await save(primary);
  assert.equal(blank.status, 200); assert.equal(blank.body.revision, 1);
  assert.equal(blank.body.document.publicTitle, '');
  assert.equal(blank.body.document.eventStartAt, null);
  assert.equal(blank.body.document.eventEndAt, null);
  assert.deepEqual(blank.body.document.startLocationIds, []);
  assert.equal(blank.body.document.minimumSpotCheckins, 10);
  assert.equal(await primary.getByRole('button', { name: '검토 후 공개' }).isDisabled(), true);
  const storedBlank = (await db.query('select document,revision from sskr_private.event_drafts where id=$1', [blank.body.id])).rows[0];
  assert.equal(storedBlank.revision, 1);
  assert.equal(storedBlank.document.sunlight, null);
  assert.equal((await published(primary)).body.event.id, null, 'a saved draft is not public');

  await primary.getByLabel('행사 제목', { exact: true }).fill('행사 운영 통합 검수');
  await primary.getByLabel('회차 이름', { exact: true }).fill('합성 테스트');
  await primary.getByLabel('행사 소개', { exact: true }).fill('PGlite에서만 사용하는 통합 검수 자료입니다.');
  await primary.getByLabel('개최일', { exact: true }).fill('2027-10-16');
  await primary.getByLabel('출발 가능 시각', { exact: true }).fill('06:00');
  await primary.getByLabel('도착 마감 시각', { exact: true }).fill('19:00');
  await primary.getByLabel('최소 경유 스팟 수', { exact: false }).fill('12');
  await primary.getByRole('checkbox', { name: '속초해수욕장 강원 · 속초' }).check();
  await primary.getByLabel('속초해수욕장 일출', { exact: true }).fill('06:30');
  await primary.getByLabel('대천해수욕장 일몰', { exact: true }).fill('18:00');
  await primary.getByLabel('검토 자료 주소', { exact: true }).fill('https://example.invalid/integration-fixture');
  await primary.getByLabel('계산·자료 버전', { exact: true }).fill('synthetic-integration-fixture');
  await primary.getByLabel('개최일, 선택한 출발지의 일출과 도착지의 일몰 시각을 확인했습니다.', { exact: true }).check();
  const reviewed = await save(primary);
  assert.equal(reviewed.status, 200, JSON.stringify({ response: reviewed.body, rpcErrors })); assert.equal(reviewed.body.id, blank.body.id); assert.equal(reviewed.body.revision, 2);
  assert.equal(reviewed.body.document.sunlight.eventId, blank.body.id);
  assert.equal(reviewed.body.document.sunlight.configVersion, 2);
  assert.equal(reviewed.body.document.sunlight.date, '2027-10-16');
  assert.equal(reviewed.body.document.sunlight.verification, 'REVIEWED');
  assert.equal(reviewed.body.document.sunlight.starts[0].lat, catalog.find(place => place.id === 'sokcho').lat);
  assert.equal((await published(primary)).body.event.id, null, 'reviewed save still does not publish');
  await primary.getByRole('button', { name: '검토 후 공개' }).click();
  await primary.getByRole('dialog').waitFor();
  assert.equal((await db.query('select count(*)::int count from sskr_private.event_publications')).rows[0].count, 0);
  const publicationResponse = primary.waitForResponse(res => res.url().includes('action=publish'));
  await primary.getByRole('button', { name: '공개하기', exact: true }).click();
  const publication = await publicationResponse;
  assert.equal(publication.status(), 200);
  assert.equal((await publication.json()).publishedVersion, 2);
  await primary.getByText('행사를 공개했습니다. 공개 버전 2 설정이 참가자 화면에 적용됩니다.', { exact: true }).waitFor();
  const publicResult = await published(primary);
  assert.equal(publicResult.status, 200);
  assert.equal(publicResult.body.event.id, blank.body.id);
  assert.equal(publicResult.body.event.publicTitle, '행사 운영 통합 검수');
  assert.equal(publicResult.body.event.minimumSpotCheckins, 12);
  assert.equal(publicResult.body.event.configVersion, 2);
  assert.deepEqual(publicResult.body.event.startLocationIds, ['sokcho']);
  assert.equal(publicResult.body.event.finishLocationId, 'daecheon');
  assert.equal(publicResult.body.event.sunlight.verification, 'REVIEWED');
  assert.equal(publicResult.body.event.sunlight.configVersion, 2);
  assert.deepEqual(Object.keys(publicResult.body.event).filter(key => /operator|audit|revision|internal/i.test(key)), []);

  const secondary = await page(390);
  assert.match(await secondary.locator('#event-status').textContent(), /초안 버전 2/);
  await primary.getByLabel('행사 제목', { exact: true }).fill('먼저 저장된 운영 변경');
  const winner = await save(primary); assert.equal(winner.status, 200); assert.equal(winner.body.revision, 3);
  await secondary.getByLabel('행사 제목', { exact: true }).fill('충돌해도 보존할 입력');
  const conflict = await save(secondary);
  assert.equal(conflict.status, 412); assert.equal(conflict.body.error.code, 'REVISION_CONFLICT');
  assert.equal(await secondary.getByLabel('행사 제목', { exact: true }).inputValue(), '충돌해도 보존할 입력');
  await secondary.getByText(/다른 화면에서 초안이 변경되었습니다/).waitFor();
  await secondary.getByRole('button', { name: '목록 새로고침', exact: true }).click();
  await secondary.getByText(/목록을 갱신했습니다. 현재 입력은 그대로 유지됩니다/).waitFor();
  assert.equal(await secondary.getByLabel('행사 제목', { exact: true }).inputValue(), '충돌해도 보존할 입력');
  const current = (await db.query('select document,revision from sskr_private.event_drafts where id=$1', [blank.body.id])).rows[0];
  assert.equal(current.revision, 3); assert.equal(current.document.publicTitle, '먼저 저장된 운영 변경');
  assert.equal((await published(secondary)).body.event.publicTitle, '행사 운영 통합 검수', 'unpublished changes and conflicts do not alter the public snapshot');
  assert.equal((await published(secondary)).body.event.configVersion, 2);
  const audit = (await db.query('select action from sskr_private.event_audit where event_id=$1 order by id', [blank.body.id])).rows;
  assert.deepEqual(audit.map(row => row.action), ['CREATE', 'UPDATE', 'PUBLISH', 'UPDATE']);
  const conflictRequest = requests.find(request => request.status === 412);
  assert.equal(conflictRequest.ifMatch, '"2"');
  assert.equal(await secondary.getByRole('button', { name: '초안 저장', exact: true }).isDisabled(), true);
  assert.deepEqual(primary.errors, []); assert.deepEqual(secondary.errors, []);
  await secondary.close(); await primary.close();
});
