'use strict';
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { PGlite } = require('@electric-sql/pglite');
const catalog = require('../../web/app/spot-catalog');
const domain = require('../../web/app/route-plan');
const manifest = require('../../web/shared/routes/manifest.json');
const A='10000000-0000-4000-8000-000000000001',B='10000000-0000-4000-8000-000000000002';
const SA='10000000-0000-4000-8000-000000000003',SB='10000000-0000-4000-8000-000000000004';
let db;
const clone = value => JSON.parse(JSON.stringify(value));
async function actor(id=A,session=SA,extra={}) {
  await db.exec('reset role');
  await db.query("select set_config('request.jwt.claims',$1,false)",[JSON.stringify({sub:id,session_id:session,...extra})]);
  await db.exec('set role authenticated');
}
async function guest(){await db.exec('reset role');await db.query("select set_config('request.jwt.claims','{}',false)");await db.exec('set role anon');}
async function events(action,id=null,document=null,revision=null) {
  return (await db.query('select public.sskr_events($1,$2,$3::jsonb,$4) result',[action,id,document===null?null:JSON.stringify(document),revision])).rows[0].result;
}
async function publicEvent(){return (await db.query('select public.sskr_public_event() result')).rows[0].result;}
function reviewed(date='2027-10-16') {
  const start=catalog.find(p=>p.id==='sokcho'),finish=catalog.find(p=>p.id==='daecheon');
  return {verification:'REVIEWED',sourceUrl:'https://astro.kasi.re.kr/kor/life/pageView/9',calculationVersion:'reviewed-test-fixture',
    starts:[{locationId:start.id,lat:start.lat,lng:start.lng,sunriseAt:date+'T06:30:00+09:00'}],
    finish:{locationId:finish.id,lat:finish.lat,lng:finish.lng,sunsetAt:date+'T18:00:00+09:00'}};
}
function document(){return {publicTitle:'검증용 행사',editionLabel:'TEST',description:'합성 개발 검증 자료',
  timezone:'Asia/Seoul',eventStartAt:'2027-10-16T06:00:00+09:00',eventEndAt:'2027-10-16T19:00:00+09:00',
  startLocationIds:['sokcho'],finishLocationId:'daecheon',sunlight:reviewed()};}
const agenda={departureTime:'07:00',breakMinutes:120,autoDeparture:false,timezone:'UTC'};
const plan=()=>({...domain.createEmpty(catalog),startId:'sokcho',stopIds:['auraji'],pinnedStopIds:[],routingVersion:manifest.version});
async function route(action,{id=null,revision=null,key=null,schedule=agenda,routePlan=plan()}={}) {
  return (await db.query('select public.sskr_routes($1,$2,$3::jsonb,$4::jsonb,$5,$6) result',[
    action,id,JSON.stringify(routePlan),JSON.stringify(schedule),revision,key])).rows[0].result;
}
before(async()=>{
  db=new PGlite();
  await db.exec(`create role anon; create role authenticated; create schema auth;
    create table auth.users(id uuid primary key,banned_until timestamptz,is_anonymous boolean default false);
    create table auth.sessions(id uuid primary key,user_id uuid references auth.users(id),not_after timestamptz);
    create table auth.identities(user_id uuid,provider text);
    create function auth.jwt() returns jsonb language sql as $$select current_setting('request.jwt.claims',true)::jsonb$$;
    create function auth.uid() returns uuid language sql as $$select (auth.jwt()->>'sub')::uuid$$;
    grant usage on schema auth to authenticated;
    grant execute on function auth.uid(),auth.jwt() to authenticated;
    insert into auth.users(id) values('${A}'),('${B}');
    insert into auth.identities(user_id,provider) values('${A}','google'),('${B}','google');
    insert into auth.sessions(id,user_id) values('${SA}','${A}'),('${SB}','${B}');`);
  for(const file of fs.readdirSync('supabase/migrations').filter(f=>f.endsWith('.sql')).sort()) {
    await db.exec(fs.readFileSync(path.join('supabase/migrations',file),'utf8'));
  }
});
after(async()=>{await db?.close();});

test('event security: no seeded operators, no draft access, and claims cannot grant an operator role',async()=>{
  assert.equal((await db.query('select count(*)::int count from sskr_private.event_operators')).rows[0].count,0);
  await guest();assert.equal(await publicEvent(),null);
  await assert.rejects(events('list'),/permission denied/);
  for(const table of ['event_operators','event_drafts','event_publications','event_current','event_audit','routes']) {
    await assert.rejects(db.query('select * from sskr_private.'+table),/permission denied/);
  }
  await assert.rejects(db.query('select sskr_private.actor()'),/permission denied/);
  await actor(B,SB,{app_metadata:{role:'admin'},user_metadata:{role:'admin'}});
  await assert.rejects(events('list'),/FORBIDDEN/);
  await assert.rejects(db.query('insert into sskr_private.event_operators(user_id) values($1)',[B]),/permission denied/);
  await actor();await assert.rejects(events('save',null,{}),/FORBIDDEN/);
  await db.exec(`reset role; insert into sskr_private.event_operators(user_id) values('${A}')`);
  await actor();const empty=await events('list');assert.deepEqual(empty,{events:[],current:null});
  const unpublished=await events('save',null,{publicTitle:'미공개 초안'});
  assert.equal(unpublished.document.minimumSpotCheckins,10);assert.equal(unpublished.document.finishLocationId,'daecheon');
  await assert.rejects(events('publish',unpublished.id,null,unpublished.revision),/INVALID_EVENT/);
  await guest();assert.equal(await publicEvent(),null);
});

test('event publication is atomic and immutable; route metadata changes only on an explicit write',async()=>{
  await actor();
  const beforeEvent=await route('save',{key:'event-route-before-publication'});assert.equal(beforeEvent.schedule.eventId,null);
  const draft=await events('save',null,document());
  assert.equal(draft.document.sunlight.eventId,draft.id);assert.equal(draft.document.sunlight.configVersion,1);
  assert.equal(draft.document.sunlight.date,'2027-10-16');
  const first=await events('publish',draft.id,null,1);
  assert.equal(first.publishedVersion,1);assert.deepEqual(await events('publish',draft.id,null,1),first);
  assert.deepEqual(await route('save',{key:'event-route-before-publication'}),beforeEvent,'unknown-outcome creation retains its original event snapshot on replay');
  await assert.rejects(route('save',{key:'event-route-before-publication',schedule:{...agenda,eventId:null,configVersion:null}}),/IDEMPOTENCY_CONFLICT/);
  await assert.rejects(db.query("select sskr_private.routes_api('list')"),/permission denied/);
  await assert.rejects(route('save',{key:'event-forged-expected-version',schedule:{...agenda,eventId:'forged',configVersion:999}}),/EVENT_CHANGED/);
  await assert.rejects(route('save',{key:'event-empty-expected-version',schedule:{...agenda,eventId:null,configVersion:null}}),/EVENT_CHANGED/);
  await guest();const exposed=await publicEvent();assert.equal(exposed.id,draft.id);assert.equal(exposed.minimumSpotCheckins,10);assert.equal(exposed.published,true);
  assert.deepEqual(Object.keys(exposed).filter(k=>/actor|audit|operator|revision|internal/i.test(k)),[]);
  await actor();
  assert.equal((await route('list')).routes.find(r=>r.plan.id===beforeEvent.plan.id).schedule.eventId,null);
  const tied=await route('schedule',{id:beforeEvent.plan.id,revision:1});assert.equal(tied.schedule.eventId,draft.id);assert.equal(tied.schedule.configVersion,1);assert.equal(tied.schedule.timezone,'Asia/Seoul');
  const nextDoc={...draft.document,publicTitle:'수정된 행사',minimumSpotCheckins:12};
  const changed=await events('save',draft.id,nextDoc,1);assert.equal(changed.revision,2);
  await assert.rejects(events('save',draft.id,nextDoc,1),/REVISION_CONFLICT/);
  await assert.rejects(events('publish',draft.id,null,1),/REVISION_CONFLICT/);
  await assert.rejects(events('save',draft.id,nextDoc),/REVISION_REQUIRED/);
  await guest();assert.equal((await publicEvent()).publicTitle,'검증용 행사');
  await actor();await events('publish',draft.id,null,2);
  assert.equal((await publicEvent()).minimumSpotCheckins,12);
  await assert.rejects(route('schedule',{id:tied.plan.id,revision:2,schedule:{...agenda,eventId:draft.id,configVersion:1}}),/EVENT_CHANGED/);
  const unchanged=(await route('list')).routes.find(r=>r.plan.id===tied.plan.id);assert.equal(unchanged.schedule.configVersion,1);
  const current=await route('schedule',{id:tied.plan.id,revision:2,schedule:{...agenda,eventId:draft.id,configVersion:2}});assert.equal(current.schedule.configVersion,2);
  await db.exec('reset role');
  const snapshots=(await db.query('select config_version,document from sskr_private.event_publications where event_id=$1 order by config_version',[draft.id])).rows;
  assert.equal(snapshots.length,2);assert.equal(snapshots[0].document.minimumSpotCheckins,10);assert.equal(snapshots[1].document.minimumSpotCheckins,12);
  const audit=(await db.query('select action,actor_id,before_document,after_document from sskr_private.event_audit where event_id=$1 order by id',[draft.id])).rows;
  assert.deepEqual(audit.map(a=>a.action),['CREATE','PUBLISH','UPDATE','PUBLISH']);assert.ok(audit.every(a=>a.actor_id===A));
  assert.equal(audit[2].before_document.document.publicTitle,'검증용 행사');assert.equal(audit[2].after_document.document.publicTitle,'수정된 행사');
  await assert.rejects(db.query('update sskr_private.event_publications set document=document where event_id=$1',[draft.id]),/EVENT_HISTORY_IMMUTABLE/);
  await assert.rejects(db.query('delete from sskr_private.event_audit where event_id=$1',[draft.id]),/EVENT_HISTORY_IMMUTABLE/);
  await actor();
});

test('an empty draft with absent or JSON-null sunlight can be completed, reviewed and published',async()=>{
  await actor();
  for(const empty of [{},{sunlight:null},{sunlight:null,eventStartAt:null,startLocationIds:[]}]) {
    let draft=await events('save',null,empty);assert.equal(draft.revision,1);
    draft=await events('save',draft.id,document(),draft.revision);
    assert.equal(draft.revision,2);assert.equal(draft.document.sunlight.verification,'REVIEWED');
    assert.equal(draft.document.sunlight.eventId,draft.id);assert.equal(draft.document.sunlight.configVersion,2);
    const published=await events('publish',draft.id,null,draft.revision);
    assert.equal(published.publishedVersion,2);assert.equal((await publicEvent()).id,draft.id);
    // Explicitly clearing a previous review must also permit a later review.
    draft=await events('save',draft.id,{...draft.document,sunlight:null},draft.revision);
    assert.equal(draft.document.sunlight,null);assert.equal((await publicEvent()).configVersion,2);
    draft=await events('save',draft.id,document(),draft.revision);
    await events('publish',draft.id,null,draft.revision);assert.equal((await publicEvent()).configVersion,4);
  }
});

test('event input rejects invalid fields, references and daylight; failed publish preserves the public version',async()=>{
  await actor();const original=await publicEvent();
  for(const invalid of [null,[],{minimumSpotCheckins:0},{minimumSpotCheckins:201},{minimumSpotCheckins:'10'},{minimumSpotCheckins:1.5},
    {timezone:'UTC'},{finishLocationId:'auraji'},{startLocationIds:['auraji']},{startLocationIds:['sokcho','sokcho']},
    {operatorNote:'must not leak'},{eventStartAt:'2027-02-30T06:00:00+09:00'},{eventStartAt:'2027-10-16T06:00'},
    {sunlight:{starts:[{operatorNote:'must not leak'}]}}]) {
    await assert.rejects(events('save',null,invalid),/INVALID_EVENT|SUNLIGHT_REVIEW_REQUIRED/);
  }
  const invalidLights=[
    doc=>{doc.sunlight.verification='CALCULATED_MOCK';},
    doc=>{doc.sunlight.starts=[];},
    doc=>{doc.sunlight.starts[0].locationId='gangneung';},
    doc=>{doc.sunlight.starts[0].lat+=.01;},
    doc=>{doc.sunlight.finish.lng+=.01;},
    doc=>{doc.sunlight.starts[0].sunriseAt='2027-10-16T06:30';},
    doc=>{doc.sunlight.starts[0].sunriseAt='2027-10-17T06:30:00+09:00';},
    doc=>{doc.sunlight.finish.sunsetAt='2027-10-16T05:00:00+09:00';},
    doc=>{doc.sunlight.sourceUrl='javascript:alert(1)';},
    doc=>{delete doc.sunlight.calculationVersion;},
    doc=>{doc.eventEndAt='2027-10-17T19:00:00+09:00';}
  ];
  for(const mutate of invalidLights) {
    const input=document();mutate(input);const draft=await events('save',null,input);
    await assert.rejects(events('publish',draft.id,null,draft.revision),/INVALID_EVENT|SUNLIGHT_REVIEW_REQUIRED/);
    assert.deepEqual(await publicEvent(),original);
  }
});

test('event starts constrain writes while old route reads, deletion and original replay remain available',async()=>{
  await actor();
  const gangneung=catalog.find(p=>p.id==='gangneung');
  const input=document();input.startLocationIds.push(gangneung.id);
  input.sunlight.starts.push({locationId:gangneung.id,lat:gangneung.lat,lng:gangneung.lng,sunriseAt:'2027-10-16T06:30:00+09:00'});
  let event=await events('save',null,input);await events('publish',event.id,null,event.revision);
  const oldPlan={...plan(),startId:gangneung.id};
  const oldSchedule={...agenda,eventId:event.id,configVersion:event.revision};
  const old=await route('save',{key:'event-removed-start-original',routePlan:oldPlan,schedule:oldSchedule});
  const deletable=await route('save',{key:'event-removed-start-delete-only',routePlan:oldPlan,schedule:oldSchedule});
  const narrowed={...event.document,startLocationIds:['sokcho'],sunlight:reviewed()};
  event=await events('save',event.id,narrowed,event.revision);await events('publish',event.id,null,event.revision);
  const expected={...agenda,eventId:event.id,configVersion:event.revision};
  assert.equal((await route('list')).routes.find(r=>r.plan.id===old.plan.id).plan.startId,gangneung.id);
  assert.deepEqual(await route('save',{key:'event-removed-start-original',routePlan:oldPlan,schedule:oldSchedule}),old);
  await assert.rejects(route('save',{key:'event-removed-start-original',routePlan:oldPlan,schedule:expected}),/IDEMPOTENCY_CONFLICT/);
  await assert.rejects(route('save',{key:'event-removed-start-new-key',routePlan:oldPlan,schedule:expected}),/EVENT_START_UNAVAILABLE/);
  await assert.rejects(route('save',{key:'event-removed-start-old-client',routePlan:oldPlan}),/EVENT_START_UNAVAILABLE/);
  await assert.rejects(route('save',{id:old.plan.id,revision:1,routePlan:oldPlan,schedule:expected}),/EVENT_START_UNAVAILABLE/);
  await assert.rejects(route('schedule',{id:old.plan.id,revision:1,schedule:expected}),/EVENT_START_UNAVAILABLE/);
  await route('delete',{id:deletable.plan.id,revision:deletable.revision});
  assert.equal((await route('list')).routes.find(r=>r.plan.id===old.plan.id).revision,1,'failed writes do not change the old route');
  const empty=await route('save',{key:'event-blank-start-draft-key',routePlan:{...plan(),startId:null,stopIds:[]},schedule:expected});
  assert.equal(empty.plan.startId,null);
  const fixed=await route('save',{id:old.plan.id,revision:1,routePlan:{...oldPlan,startId:'sokcho'},schedule:expected});assert.equal(fixed.plan.startId,'sokcho');
  await route('delete',{id:fixed.plan.id,revision:fixed.revision});
  await route('delete',{id:empty.plan.id,revision:empty.revision});
  assert.deepEqual(await route('save',{key:'event-removed-start-original',routePlan:oldPlan,schedule:oldSchedule}),old,'deleted route replay cannot recreate it');
  assert.equal((await route('list')).routes.some(r=>r.plan.id===old.plan.id),false);
});

test('copied daylight cannot be published after changing dates and revoked operators lose access immediately',async()=>{
  await actor();let draft=await events('save',null,document());
  const changed=clone(draft.document);changed.eventStartAt='2027-10-17T06:00:00+09:00';changed.eventEndAt='2027-10-17T19:00:00+09:00';
  draft=await events('save',draft.id,changed,draft.revision);assert.equal(draft.document.sunlight.verification,'UNREVIEWED');
  await assert.rejects(events('publish',draft.id,null,draft.revision),/SUNLIGHT_REVIEW_REQUIRED/);
  draft=await events('save',draft.id,{...draft.document,sunlight:reviewed('2027-10-17')},draft.revision);
  await events('publish',draft.id,null,draft.revision);assert.equal((await publicEvent()).sunlight.date,'2027-10-17');
  await db.exec(`reset role; delete from sskr_private.event_operators where user_id='${A}'`);
  await actor();await assert.rejects(events('list'),/FORBIDDEN/);
  await db.exec(`reset role; insert into sskr_private.event_operators(user_id) values('${A}'); update auth.sessions set not_after=now()-interval '1 minute' where id='${SA}'`);
  await actor();await assert.rejects(events('list'),/AUTH_REQUIRED/);
  await db.exec(`reset role; update auth.sessions set not_after=null where id='${SA}'`);
  await actor(B,SB);await assert.rejects(events('list'),/FORBIDDEN/);
  await guest();assert.ok((await publicEvent()).published);
});
