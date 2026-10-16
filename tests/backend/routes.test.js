const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { PGlite } = require('@electric-sql/pglite');
const catalog = require('../../web/app/spot-catalog');
const domain = require('../../web/app/route-plan');
const routing = require('../../web/shared/routes/manifest.json');
let db;
const A = '00000000-0000-4000-8000-000000000001', B = '00000000-0000-4000-8000-000000000002';
const SA = '00000000-0000-4000-8000-000000000003', SB = '00000000-0000-4000-8000-000000000004';
const agenda = { departureTime: '06:00', breakMinutes: 120, autoDeparture: true };
const plan = () => ({ ...domain.createEmpty(catalog), startId: 'sokcho', stopIds: ['auraji'], pinnedStopIds: ['auraji'], routingVersion: routing.version });
async function actor(id = A, session = SA) {
  await db.query("select set_config('request.jwt.claims',$1,false)", [JSON.stringify({ sub: id, session_id: session })]);
}
async function rpc(action, options = {}) {
  const result = await db.query('select public.sskr_routes($1,$2,$3::jsonb,$4::jsonb,$5,$6) as result', [action, options.id || null, options.plan ? JSON.stringify(options.plan) : null, options.schedule ? JSON.stringify(options.schedule) : null, options.revision || null, options.key || null]);
  return result.rows[0].result;
}
const create = (key, value = plan()) => rpc('save', { key: 'test-request-key-' + key, plan: value, schedule: agenda });
before(async () => {
  db = new PGlite();
  await db.exec(`create role anon; create role authenticated; create role service_role;
    create schema auth;
    create table auth.users(id uuid primary key,banned_until timestamptz,is_anonymous boolean default false);
    create table auth.sessions(id uuid primary key,user_id uuid references auth.users(id),not_after timestamptz);
    create table auth.identities(user_id uuid, provider text);
    create function auth.jwt() returns jsonb language sql as $$ select current_setting('request.jwt.claims',true)::jsonb $$;
    create function auth.uid() returns uuid language sql as $$ select (auth.jwt()->>'sub')::uuid $$;
    grant usage on schema auth to authenticated;
    grant execute on function auth.uid(),auth.jwt() to authenticated;
    insert into auth.users(id) values('${A}'),('${B}');
    insert into auth.identities(user_id,provider) values('${A}','google'),('${B}','google');
    insert into auth.sessions(id,user_id) values('${SA}','${A}'),('${SB}','${B}');`);
  for (const file of fs.readdirSync('supabase/migrations').filter(f => f.endsWith('.sql')).sort()) await db.exec(fs.readFileSync('supabase/migrations/' + file, 'utf8'));
  await actor(); await db.exec('set role authenticated');
});
after(async () => { await db?.close(); });
test('route transaction, quota, names, replay, revision and isolation', async () => {
  const one = await create('1');
  assert.equal(one.plan.title, '루트 01'); assert.equal(one.plan.ownerUserId, A); assert.deepEqual(one.plan.pinnedStopIds, ['auraji']);
  assert.equal(one.schedule.breakMinutes, 120); assert.equal(one.schedule.eventId, null);
  assert.deepEqual(await create('1'), one);
  await assert.rejects(create('1', { ...plan(), title: 'changed' }), /IDEMPOTENCY_CONFLICT/);
  for (let n = 2; n <= 9; n++) await create(String(n));
  const attempts = await Promise.allSettled([create('10a'), create('10b')]);
  assert.equal(attempts.filter(v => v.status === 'fulfilled').length, 1);
  assert.match(attempts.find(v => v.status === 'rejected').reason.message, /ROUTE_LIMIT_REACHED/);
  const list = await rpc('list'); assert.equal(list.routes.length, 10); assert.equal(new Set(list.routes.map(r => r.plan.title)).size, 10);
  const updated = await rpc('save', { id: one.plan.id, plan: { ...one.plan, title: '변경한 루트' }, schedule: { ...agenda, breakMinutes: 90 }, revision: 1 });
  assert.equal(updated.revision, 2); assert.equal(updated.schedule.breakMinutes, 90);
  await assert.rejects(rpc('save', { id: one.plan.id, plan: one.plan, schedule: agenda, revision: 1 }), /REVISION_CONFLICT/);
  await assert.rejects(rpc('schedule', { id: one.plan.id, schedule: { ...agenda, breakMinutes: -1 }, revision: 2 }), /INVALID_SCHEDULE/);
  assert.equal((await rpc('list')).routes.find(r => r.plan.id === one.plan.id).revision, 2);
  const scheduled = await rpc('schedule', { id: one.plan.id, schedule: agenda, revision: 2 }); assert.equal(scheduled.revision, 3);
  await actor(B, SB); assert.equal((await rpc('list')).routes.length, 0);
  await assert.rejects(rpc('delete', { id: one.plan.id, revision: 3 }), /ROUTE_NOT_FOUND/);
  await assert.rejects(db.query('select * from sskr_private.routes'), /permission denied/);
  await assert.rejects(db.query("insert into sskr_private.settings values(true,99,'fake','fake','fake')"), /permission denied/);
  const b = await create('1'); assert.equal(b.plan.title, '루트 01');
  await actor(); await rpc('delete', { id: one.plan.id, revision: 3 });
  const again = await create('11'); assert.equal(again.plan.title, '루트 01');
  assert.deepEqual(await create('1'), one); assert.equal((await rpc('list')).routes.length, 10, 'replaying deleted request does not recreate a row');
});
test('invalid references and versions are rejected without replacing old stops', async () => {
  await actor(B, SB);
  await assert.rejects(create('bad-id', { ...plan(), stopIds: ['retired-place'] }), /INVALID_REFERENCE/);
  await assert.rejects(create('duplicate', { ...plan(), stopIds: ['auraji', 'auraji'] }), /INVALID_REFERENCE/);
  await assert.rejects(create('bad-pin', { ...plan(), pinnedStopIds: ['sokcho'] }), /INVALID_REFERENCE/);
  await assert.rejects(create('bad-version', { ...plan(), routingVersion: 'old' }), /CATALOG_CHANGED/);
  await assert.rejects(create('bad-finish', { ...plan(), finishId: 'auraji' }), /INVALID_PLAN/);
  const draft = await create('empty', { ...plan(), startId: null, stopIds: [], pinnedStopIds: [], ownerUserId: A });
  assert.equal(draft.plan.ownerUserId, B); assert.equal(draft.plan.stopIds.length, 0);
});
test('anonymous, revoked, expired and blocked sessions cannot access routes', async () => {
  await actor(A, SB); await assert.rejects(rpc('list'), /AUTH_REQUIRED/);
  await actor(A, SA); await db.exec(`reset role; update auth.users set banned_until=now()+interval '1 day' where id='${A}'; set role authenticated`);
  await assert.rejects(rpc('list'), /AUTH_REQUIRED/);
  await db.exec(`reset role; update auth.users set banned_until=null where id='${A}'; delete from auth.sessions where id='${SA}'; set role authenticated`);
  await assert.rejects(rpc('list'), /AUTH_REQUIRED/);
  await db.exec('reset role; set role anon'); await assert.rejects(rpc('list'), /permission denied/);
});
