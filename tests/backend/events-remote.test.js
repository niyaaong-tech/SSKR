'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const fs = require('node:fs/promises'), os = require('node:os'), path = require('node:path');
const project = 'rdskiwnrzmrppsuwbavg';
const run = promisify(execFile);
const quote = value => "'" + String(value).replaceAll("'", "''") + "'";
test('development database: event roles, publication, versioned routes and rollback isolation', { skip: process.env.SSKR_REMOTE_TEST !== project, timeout: 60000 }, async () => {
  const user = randomUUID(), session = randomUUID();
  const catalog = require('../../web/app/spot-catalog');
  const start = catalog.find(p => p.id === 'sokcho'), finish = catalog.find(p => p.id === 'daecheon'), alternate = catalog.find(p => p.id === 'gangneung');
  const document = { publicTitle: '트랜잭션 검수 전용', timezone: 'Asia/Seoul', eventStartAt: '2027-05-15T06:00:00+09:00', eventEndAt: '2027-05-15T19:00:00+09:00', minimumSpotCheckins: 12, startLocationIds: ['sokcho'], finishLocationId: 'daecheon', sunlight: { date: '2027-05-15', timezone: 'Asia/Seoul', verification: 'REVIEWED', sourceUrl: 'https://example.invalid/test-only', calculationVersion: 'fixture', starts: [{ locationId: start.id, lat: start.lat, lng: start.lng, sunriseAt: '2027-05-15T05:20:00+09:00' }], finish: { locationId: finish.id, lat: finish.lat, lng: finish.lng, sunsetAt: '2027-05-15T19:20:00+09:00' } } };
  document.startLocationIds.push(alternate.id);
  document.sunlight.starts.push({ locationId: alternate.id, lat: alternate.lat, lng: alternate.lng, sunriseAt: '2027-05-15T05:20:00+09:00' });
  const plan = { ...require('../../web/app/route-plan').createEmpty(catalog), startId: 'sokcho', stopIds: ['auraji'], routingVersion: require('../../web/shared/routes/manifest.json').version };
  const alternatePlan = { ...plan, startId: alternate.id };
  const sql = `begin;
    insert into auth.users(id,aud,role,email,raw_app_meta_data,is_anonymous) values('${user}','authenticated','authenticated','${user}@sskr-event-test.invalid','{"sskr_sql_fixture":true}',false);
    insert into auth.identities(provider_id,user_id,identity_data,provider) values('${user}','${user}','{"sub":"${user}"}','google');
    insert into auth.sessions(id,user_id,created_at,updated_at) values('${session}','${user}',now(),now());
    select set_config('request.jwt.claims','{"sub":"${user}","session_id":"${session}"}',true);
    set local role authenticated;
    do $check$ begin
      begin perform public.sskr_events('list'); raise exception 'role check failed';
      exception when others then if sqlerrm <> 'FORBIDDEN' then raise; end if; end;
    end $check$;
    reset role;
    insert into sskr_private.event_operators(user_id) values('${user}');
    set local role authenticated;
    do $check$ declare saved jsonb; published jsonb; route jsonb; before_public jsonb; old_route jsonb; delete_route jsonb; old_schedule jsonb; current_schedule jsonb; narrowed jsonb; begin
      before_public := public.sskr_public_event();
      saved := public.sskr_events('save',null,'{"sunlight":null,"eventStartAt":null,"startLocationIds":[]}'::jsonb);
      if saved#>'{document,sunlight}' is distinct from 'null'::jsonb then raise exception 'empty review draft mismatch'; end if;
      if public.sskr_public_event() is distinct from before_public then raise exception 'empty draft leaked'; end if;
      saved := public.sskr_events('save',(saved->>'id')::uuid,${quote(JSON.stringify(document))}::jsonb,(saved->>'revision')::bigint);
      if saved#>>'{document,sunlight,verification}' <> 'REVIEWED'
        or saved#>'{document,sunlight,configVersion}' is distinct from saved->'revision'
        or saved#>'{document,sunlight,eventId}' is distinct from saved->'id'
      then raise exception 'empty draft review completion failed'; end if;
      if public.sskr_public_event() is distinct from before_public then raise exception 'draft leaked'; end if;
      published := public.sskr_events('publish',(saved->>'id')::uuid,null,(saved->>'revision')::bigint);
      if published->'publishedVersion' is distinct from saved->'revision' then raise exception 'completed draft publication mismatch'; end if;
      if public.sskr_public_event()->>'minimumSpotCheckins' <> '12' then raise exception 'public minimum mismatch'; end if;
      route := public.sskr_routes('save',null,${quote(JSON.stringify(plan))}::jsonb,
        jsonb_build_object('departureTime','06:00','breakMinutes',120,'autoDeparture',true,'eventId',saved->'id','configVersion',saved->'revision'),null,'event-remote-test-${user}');
      if route#>'{schedule,eventId}' is distinct from saved->'id' or route#>'{schedule,configVersion}' is distinct from saved->'revision' then raise exception 'route version mismatch'; end if;
      begin perform public.sskr_routes('schedule',(route#>>'{plan,id}')::uuid,null,'{"departureTime":"06:00","breakMinutes":90,"autoDeparture":false,"eventId":null,"configVersion":null}',(route->>'revision')::bigint);
        raise exception 'stale event accepted'; exception when others then if sqlerrm <> 'EVENT_CHANGED' then raise; end if; end;
      begin perform public.sskr_events('save',(saved->>'id')::uuid,saved->'document',(saved->>'revision')::bigint+1);
        raise exception 'stale revision accepted'; exception when others then if sqlerrm <> 'REVISION_CONFLICT' then raise; end if; end;
      old_schedule := jsonb_build_object('departureTime','06:00','breakMinutes',120,'autoDeparture',true,'eventId',saved->'id','configVersion',saved->'revision');
      old_route := public.sskr_routes('save',null,${quote(JSON.stringify(alternatePlan))}::jsonb,old_schedule,null,'event-remote-alt-${user}');
      delete_route := public.sskr_routes('save',null,${quote(JSON.stringify(alternatePlan))}::jsonb,old_schedule,null,'event-remote-del-${user}');
      narrowed := jsonb_set(jsonb_set(saved->'document','{startLocationIds}','["sokcho"]'),'{sunlight,starts}',jsonb_build_array(saved#>'{document,sunlight,starts,0}'));
      saved := public.sskr_events('save',(saved->>'id')::uuid,narrowed,(saved->>'revision')::bigint);
      published := public.sskr_events('publish',(saved->>'id')::uuid,null,(saved->>'revision')::bigint);
      current_schedule := old_schedule || jsonb_build_object('configVersion',saved->'revision');
      if public.sskr_routes('save',null,${quote(JSON.stringify(alternatePlan))}::jsonb,old_schedule,null,'event-remote-alt-${user}') is distinct from old_route then raise exception 'original replay changed'; end if;
      begin perform public.sskr_routes('save',null,${quote(JSON.stringify(alternatePlan))}::jsonb,current_schedule,null,'event-remote-alt-${user}');
        raise exception 'modified replay accepted'; exception when others then if sqlerrm <> 'IDEMPOTENCY_CONFLICT' then raise; end if; end;
      begin perform public.sskr_routes('save',null,${quote(JSON.stringify(alternatePlan))}::jsonb,current_schedule,null,'event-remote-disallowed-${user}');
        raise exception 'unpublished start created'; exception when others then if sqlerrm <> 'EVENT_START_UNAVAILABLE' then raise; end if; end;
      begin perform public.sskr_routes('save',(old_route#>>'{plan,id}')::uuid,${quote(JSON.stringify(alternatePlan))}::jsonb,current_schedule,(old_route->>'revision')::bigint);
        raise exception 'unpublished start updated'; exception when others then if sqlerrm <> 'EVENT_START_UNAVAILABLE' then raise; end if; end;
      begin perform public.sskr_routes('schedule',(old_route#>>'{plan,id}')::uuid,null,current_schedule,(old_route->>'revision')::bigint);
        raise exception 'unpublished start schedule updated'; exception when others then if sqlerrm <> 'EVENT_START_UNAVAILABLE' then raise; end if; end;
      if not exists(select 1 from jsonb_array_elements(public.sskr_routes('list')->'routes') r where r#>'{plan,id}'=old_route#>'{plan,id}' and r->'revision'=old_route->'revision') then raise exception 'old route lost'; end if;
      perform public.sskr_routes('delete',(delete_route#>>'{plan,id}')::uuid,null,null,(delete_route->>'revision')::bigint);
      route := public.sskr_routes('save',(old_route#>>'{plan,id}')::uuid,${quote(JSON.stringify(plan))}::jsonb,current_schedule,(old_route->>'revision')::bigint);
      if route#>>'{plan,startId}' <> 'sokcho' then raise exception 'allowed start repair failed'; end if;
      begin perform sskr_private.routes_api('list'); raise exception 'private route bypass allowed'; exception when insufficient_privilege then null; end;
    end $check$;
    reset role; set local role anon;
    do $check$ begin
      if public.sskr_public_event()->>'minimumSpotCheckins' <> '12' then raise exception 'public event unavailable'; end if;
      begin perform 1 from sskr_private.event_drafts; raise exception 'draft readable'; exception when insufficient_privilege then null; end;
    end $check$;
    rollback;
    select (select count(*) from auth.users where id='${user}')::integer as remaining_test_users,
      (select count(*) from sskr_private.event_operators where user_id='${user}')::integer as remaining_test_roles,
      (select count(*) from sskr_private.event_audit where actor_id='${user}')::integer as remaining_test_audits;`;
  const file = path.join(os.tmpdir(), 'sskr-event-test-' + user + '.sql');
  await fs.writeFile(file, sql);
  try {
    const { stdout } = await run(process.execPath, [path.resolve('node_modules/supabase/dist/supabase.js'), 'db', 'query', '--linked', '--project-ref', project, '--file', file, '-o', 'json'], { windowsHide: true, timeout: 45000, maxBuffer: 1024 * 1024 });
    const rows = JSON.parse(stdout).rows;
    assert.equal(rows.at(-1).remaining_test_users, 0); assert.equal(rows.at(-1).remaining_test_roles, 0); assert.equal(rows.at(-1).remaining_test_audits, 0);
  } finally { await fs.rm(file, { force: true }); }
});
