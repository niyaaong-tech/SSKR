'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { documentFor } = require('../../server/backend/events');
const { context } = require('../../server/backend/context');
const { createHandler } = require('../../server/backend/handler');
const { routes } = require('../../server/backend/routes');
const catalog = require('../../web/app/spot-catalog');
const start = catalog.find(p => p.id === 'sokcho'), finish = catalog.find(p => p.id === 'daecheon');
const fixture = () => ({
  publicTitle: '개발 검수 행사', editionLabel: '검수 전용', description: '테스트에서만 사용하는 행사입니다.',
  timezone: 'Asia/Seoul', eventStartAt: '2027-05-15T06:00:00+09:00', eventEndAt: '2027-05-15T19:00:00+09:00',
  minimumSpotCheckins: 12, startLocationIds: ['sokcho'], finishLocationId: 'daecheon',
  sunlight: { date: '2027-05-15', timezone: 'Asia/Seoul', verification: 'REVIEWED', sourceUrl: 'https://example.invalid/review', calculationVersion: 'test-only',
    starts: [{ locationId: start.id, lat: start.lat, lng: start.lng, sunriseAt: '2027-05-15T05:20:00+09:00' }],
    finish: { locationId: finish.id, lat: finish.lat, lng: finish.lng, sunsetAt: '2027-05-15T19:20:00+09:00' }
  }
});
function response() {
  return { headers: {}, getHeader(key) { return this.headers[key]; }, setHeader(key, value) { this.headers[key] = value; }, writeHead(status, headers) { this.status = status; Object.assign(this.headers, headers); }, end(body) { this.body = JSON.parse(body); } };
}
test('event drafts accept blanks; reviewed daylight must match every place, date and coordinates', () => {
  assert.equal(documentFor({}).minimumSpotCheckins, 10);
  assert.equal(documentFor({ operatorNote: 'private', stageOverride: 'LIVE' }).operatorNote, undefined);
  assert.equal(documentFor(fixture()).sunlight.verification, 'REVIEWED');
  for (const edit of [d => { d.minimumSpotCheckins = 0; }, d => { d.minimumSpotCheckins = 10.5; }, d => { d.startLocationIds = ['auraji']; }, d => { d.sunlight.starts[0].lat += 0.01; }, d => { d.eventStartAt = '2027-05-16T06:00:00+09:00'; }, d => { d.sunlight.starts[0].sunriseAt = '2027-05-15T05:20:00'; }, d => { d.sunlight.sourceUrl = 'javascript:alert(1)'; }, d => { d.sunlight.starts.push(d.sunlight.starts[0]); }]) {
    const doc = fixture(); edit(doc); assert.throws(() => documentFor(doc));
  }
});
test('published context uses one version and never enables unimplemented payment', () => {
  const doc = { ...fixture(), id: 'event', configVersion: 3, publishedAt: '2026-10-16T00:00:00Z', operatorNote: 'secret', stageOverride: 'LIVE' };
  const result = context(null, new Date('2026-10-16T01:00:00Z'), doc);
  assert.equal(result.event.minimumSpotCheckins, 12);
  assert.equal(result.event.configVersion, 3);
  assert.match(result.event.eventDateDisplay, /2027\.05\.15/);
  assert.equal(result.event.resolvedStage, 'CORE_CONFIRMED');
  assert.equal(result.event.operatorNote, undefined); assert.equal(result.event.stageOverride, undefined);
  assert.equal(result.permissions.canStartCheckout, false); assert.equal(result.surface.primaryAction.enabled, false);
  assert.equal(context(null).event.id, null);
});
test('public event is independent of broken user sessions; storage outage never becomes mock data', async () => {
  const handler = createHandler({ getConfig: () => ({ mode: 'supabase' }), readPublished: async () => ({ ...fixture(), id: 'event', configVersion: 4 }), authService: { actor() { throw Error('must not inspect session'); } } });
  const res = response(); await handler({ url: '/api/backend?resource=event', method: 'GET', headers: {} }, res);
  assert.equal(res.status, 200); assert.equal(res.body.event.configVersion, 4); assert.equal(res.body.account, undefined);
  const failed = createHandler({ getConfig: () => ({ mode: 'supabase' }), readPublished: async () => { throw Error('offline'); } });
  const error = response(); await failed({ url: '/api/backend?resource=event', method: 'GET', headers: {} }, error);
  assert.equal(error.status, 503); assert.equal(error.body.event, undefined);
});
test('admin mutations require same-origin and revisions; public context ignores forged snapshots', async () => {
  const calls = [];
  const handler = createHandler({ getConfig: () => ({ mode: 'supabase', origin: 'https://sskr.test' }), readPublished: async () => null, authService: { async actor() { return { account: { id: 'trusted', linked: true }, db: { async rpc(name, args) { calls.push({ name, args }); return { error: { message: 'REVISION_CONFLICT' } }; } } }; } } });
  const req = { url: '/api/backend?resource=events&id=00000000-0000-4000-8000-000000000001', method: 'PUT', headers: { origin: 'https://sskr.test', 'x-sskr-request': '1', 'content-type': 'application/json', 'if-match': '"2"' }, body: { document: fixture() } };
  const res = response(); await handler(req, res); assert.equal(res.status, 412); assert.equal(calls[0].args.p_revision, 2);
  const blocked = response(); await handler({ ...req, headers: { ...req.headers, origin: 'https://evil.invalid' } }, blocked); assert.equal(blocked.status, 403); assert.equal(calls.length, 1);
  const ctx = response(); await handler({ ...req, url: '/api/backend?resource=context', method: 'POST', body: { account: { id: 'forged' }, snapshot: { event: fixture() }, mock: { now: '2027-05-15' } } }, ctx);
  assert.equal(ctx.body.account.id, 'trusted'); assert.equal(ctx.body.event.id, null);
});

test('a removed event start is a recoverable validation response, not a storage outage', async () => {
  await assert.rejects(routes({ db: { rpc: async () => ({ error: { message: 'EVENT_START_UNAVAILABLE' } }) } },
    { method: 'POST', headers: { 'idempotency-key': 'test' } }, { plan: {} }, new URL('https://sskr.test/api/backend?resource=routes')),
  error => error.code === 'EVENT_START_UNAVAILABLE' && error.status === 422);
});

test('public pages omit unpublished event assumptions and do not fall back to mock after a live failure', async () => {
  const vm = require('node:vm'), fs = require('node:fs');
  const calls = [];
  const scope = { window: {}, document: { querySelector: () => null }, fetch: async (url, options) => {
    calls.push({ url, options });
    return url.endsWith('runtime') ? { ok: true, json: async () => ({ mode: 'supabase' }) } : { ok: false };
  } };
  vm.runInNewContext(fs.readFileSync(require.resolve('../../web/shared/public-event.js'), 'utf8'), scope);
  assert.doesNotMatch(scope.window.SSKR_PUBLIC_EVENT.rulesText(context(null).event), /10|대천|총 12/);
  await assert.rejects(scope.window.SSKR_PUBLIC_EVENT.load(), /행사 정보를 불러오지 못했습니다/);
  assert.equal(calls.length, 2);
  assert.ok(calls.every(call => call.options.credentials === 'omit'));
  assert.equal(calls[1].url, '/api/backend?resource=event');
});
