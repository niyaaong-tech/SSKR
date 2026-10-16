'use strict';
// Explicit opt-in against the named disposable development project only.
// Auth rows below are isolated SQL fixtures, not proof of Google OAuth login.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const run = promisify(execFile);
const project = 'rdskiwnrzmrppsuwbavg';
const enabled = process.env.SSKR_REMOTE_TEST === project;
const quote = value => "'" + String(value).replaceAll("'", "''") + "'";

test('development database: concurrent quota, names, replay, revision and owner isolation', { skip: !enabled, timeout: 120000 }, async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'sskr-db-test-'));
  const users = [randomUUID(), randomUUID()], sessions = [randomUUID(), randomUUID()];
  async function sql(query) {
    const file = path.join(directory, randomUUID() + '.sql');
    await fs.writeFile(file, query);
    try {
      const { stdout } = await run(process.execPath, [path.resolve('node_modules/supabase/dist/supabase.js'), 'db', 'query', '--linked', '--project-ref', project, '--file', file, '-o', 'json'], { windowsHide: true, timeout: 25000, maxBuffer: 1024 * 1024 });
      return JSON.parse(stdout).rows;
    } catch (error) {
      // SQL contains no secrets; don't dump the child process command/environment.
      throw new Error(String(error.stderr || error.stdout || 'Remote SQL failed').slice(0, 3000));
    } finally { await fs.rm(file, { force: true }); }
  }
  const claims = index => `begin; set local role authenticated; select set_config('request.jwt.claims',${quote(JSON.stringify({ sub: users[index], session_id: sessions[index] }))},true);`;
  const plan = { ...require('../../web/app/route-plan').createEmpty(require('../../web/app/spot-catalog')), startId: 'sokcho', stopIds: ['auraji'], pinnedStopIds: ['auraji'], routingVersion: require('../../web/shared/routes/manifest.json').version };
  const schedule = { departureTime: '06:00', breakMinutes: 120, autoDeparture: true };
  const save = key => `public.sskr_routes('save',null,${quote(JSON.stringify(plan))}::jsonb,${quote(JSON.stringify(schedule))}::jsonb,null,${quote('sskr-remote-test-' + key)})`;
  const as = async (query, index = 0) => sql(`${claims(index)} ${query}; commit;`);
  try {
    for (let i = 0; i < 2; i++) await sql(`begin;
      insert into auth.users(id,aud,role,email,raw_app_meta_data,is_anonymous) values(${quote(users[i])},'authenticated','authenticated',${quote(users[i] + '@sskr-test.invalid')},'{"sskr_sql_fixture":true}',false);
      insert into auth.identities(provider_id,user_id,identity_data,provider) values(${quote(users[i])},${quote(users[i])},${quote(JSON.stringify({ sub: users[i] }))}::jsonb,'google');
      insert into auth.sessions(id,user_id,created_at,updated_at) values(${quote(sessions[i])},${quote(users[i])},now(),now()); commit;`);
    const first = (await as(`select ${save('1')} as result`))[0].result;
    assert.equal(first.plan.title, '루트 01');
    assert.equal(first.schedule.breakMinutes, 120);
    await as(`do $test$ begin for i in 2..9 loop perform public.sskr_routes('save',null,${quote(JSON.stringify(plan))}::jsonb,${quote(JSON.stringify(schedule))}::jsonb,null,'sskr-remote-test-' || i); end loop; end $test$`);
    // Independent CLI requests use distinct DB sessions. The winning transaction
    // holds the owner lock after saving so the other must wait before counting.
    const attempts = await Promise.allSettled(['10a','10b'].map(key => as(`select ${save(key)} as result; select pg_sleep(2)`)));
    assert.equal(attempts.filter(x => x.status === 'fulfilled').length, 1);
    assert.match(attempts.find(x => x.status === 'rejected').reason.message, /ROUTE_LIMIT_REACHED/);
    const list = (await as("select public.sskr_routes('list') as result"))[0].result;
    assert.equal(list.routes.length, 10);
    assert.equal(new Set(list.routes.map(row => row.plan.title)).size, 10);
    assert.deepEqual((await as(`select ${save('1')} as result`))[0].result, first);
    const update = `public.sskr_routes('schedule',${quote(first.plan.id)},null,${quote(JSON.stringify({ ...schedule, breakMinutes: 90 }))}::jsonb,1,null)`;
    const changed = (await as(`select ${update} as result`))[0].result;
    assert.equal(changed.revision, 2);
    assert.equal(changed.schedule.breakMinutes, 90);
    await assert.rejects(as(`select ${update}`), /REVISION_CONFLICT/);
    assert.equal((await as("select public.sskr_routes('list') as result", 1))[0].result.routes.length, 0);
    await assert.rejects(as(`select public.sskr_routes('delete',${quote(first.plan.id)},null,null,2,null)`, 1), /ROUTE_NOT_FOUND/);
    await assert.rejects(as('select * from sskr_private.routes'), /permission denied/);
    await as(`select public.sskr_routes('delete',${quote(first.plan.id)},null,null,2,null)`);
    const reused = (await as(`select ${save('11')} as result`))[0].result;
    assert.equal(reused.plan.title, '루트 01');
  } finally {
    try {
      // Only this test's random IDs with its explicit fixture marker are removed.
      await sql(`delete from auth.users where id in (${users.map(quote).join(',')}) and raw_app_meta_data->>'sskr_sql_fixture'='true'`);
    } finally { await fs.rm(directory, { recursive: true, force: true }); }
  }
});
