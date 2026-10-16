'use strict';
const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const {randomUUID}=require('node:crypto');
const {fixture}=require('./workflow-fixture');
const {createFieldTests,configuration}=require('../../server/backend/field-tests');
const {distance}=require('../../server/backend/ride');
const catalog=require('../../server/data/field-test-places.json').records;
let f,service,adapter,now;
before(async()=>{f=await fixture();adapter={async rpc(name,args){try{return {data:(await f.db.query('select public.sskr_field_tests($1,$2,$3,$4,$5) result',[args.p_action,args.p_actor,JSON.stringify(args.p_data),args.p_id,args.p_revision])).rows[0].result};}catch(e){return {error:{message:e.message}};}}};now=new Date();service=createFieldTests({db:adapter,clock:()=>now});});
after(async()=>await f?.db.close());
const call=(body,id)=>service.handle(f.account(id||f.A),body);
function config(){return {title:'오후 현장 테스트',group:'walk',startAt:new Date(+now-60000).toISOString(),endAt:new Date(+now+3600000).toISOString(),startIds:['test-start-ori'],finishId:'test-walk-30',minimumSpotCheckins:10,radius:20,accuracy:35,enabled:true};}
async function setup(){const session=await call({action:'CONFIGURE',id:randomUUID(),revision:0,document:config()});const run=await call({action:'BEGIN',id:randomUUID(),sessionId:session.id,startId:'test-start-ori'});return {session,run};}
const evidence=p=>({requestId:randomUUID(),locationId:p.id,lat:p.lat,lng:p.lng,accuracy:8,capturedAt:now.toISOString()});
function point(id){return catalog.find(p=>p.id===id);}
test('65 test spots, five start roles, real source metadata and minimum 50m walking separation; public catalog isolated',async()=>{
  const data=await call({});assert.equal(data.places.length,68);
  for(const [g,n] of [['walk',30],['bus110a',20],['bus520',15]])assert.equal(data.places.filter(p=>p.group===g).length,n);
  assert.equal(data.places.filter(p=>p.startEligible).length,5);
  assert.deepEqual(data.places,catalog.toSorted((a,b)=>a.id.localeCompare(b.id)));
  const walk=catalog.filter(p=>p.group==='walk');for(let i=0;i<walk.length;i++)for(const p of walk.slice(i+1))assert.ok(distance(walk[i],p)>=50);
  for(const p of catalog){assert.ok(p.testOnly&&p.source&&p.coordinateBasis);assert.ok(Number.isFinite(p.lat)&&Number.isFinite(p.lng));}
  assert.equal(require('../../web/app/spot-catalog').filter(p=>p.id.startsWith('test-')).length,0);
  const grants=(await f.db.query("select has_function_privilege('anon','public.sskr_field_tests(text,uuid,jsonb,uuid,bigint)','EXECUTE') a,has_function_privilege('authenticated','public.sskr_field_tests(text,uuid,jsonb,uuid,bigint)','EXECUTE') b")).rows[0];assert.deepEqual(grants,{a:false,b:false});
});
test('operator-only configuration, revisions, custom hours and any test destination',async()=>{
  const doc=config();assert.equal(configuration(doc,catalog).startAt,doc.startAt);
  assert.throws(()=>configuration({...doc,finishId:'daecheon'},catalog));
  assert.throws(()=>configuration({...doc,endAt:doc.startAt},catalog));
  assert.throws(()=>configuration({...doc,startIds:['test-520-07387'],finishId:'test-520-07387'},catalog));
  assert.throws(()=>configuration({...doc,minimumSpotCheckins:30},catalog));
  await assert.rejects(()=>call({action:'CONFIGURE',id:randomUUID(),revision:0,document:doc},f.B),{code:'FORBIDDEN'});
  const {session}=await setup();await assert.rejects(()=>call({action:'CONFIGURE',id:session.id,revision:0,document:doc}),{code:'CONFLICT'});
  const other=await call({action:'CONFIGURE',id:session.id,revision:1,document:{...doc,finishId:'test-110a-13144'}});assert.equal(other.document.finishId,'test-110a-13144');
});
test('real GPS policy: distance, accuracy, timestamps, duplicate, start -> ten spots -> finish without memorial',async()=>{
  const {run}=await setup();const id=run.id,start=point('test-start-ori');
  await assert.rejects(()=>call({action:'CHECKIN',id,evidence:evidence(point('test-walk-01'))}),{code:'START_FIRST'});
  for(const [patch,reason] of [[{lat:0},'OUTSIDE_SPOT'],[{accuracy:100},'LOCATION_UNCERTAIN'],[{capturedAt:new Date(+now+60000).toISOString()},'TIME_REVIEW_REQUIRED']]){const r=await call({action:'CHECKIN',id,evidence:{...evidence(start),...patch}});assert.equal(r.document.run.visits.at(-1).reason,reason);}
  let request=evidence(start);let r=await call({action:'CHECKIN',id,evidence:request});assert.equal(r.document.run.state,'STARTED');
  const duplicate=await call({action:'CHECKIN',id,evidence:request});assert.equal(duplicate.revision,r.revision);
  await assert.rejects(()=>call({action:'CHECKIN',id,evidence:{...request,lat:0}}),{code:'IDEMPOTENCY_CONFLICT'});
  now=new Date(+now+1000);r=await call({action:'CHECKIN',id,evidence:evidence(start)});assert.equal(r.document.run.visits.at(-1).reason,'DUPLICATE_SPOT');
  now=new Date(+now+1000);r=await call({action:'CHECKIN',id,evidence:evidence(point('test-walk-30'))});assert.equal(r.document.run.visits.at(-1).reason,'MORE_SPOTS_REQUIRED');
  for(const p of catalog.filter(p=>p.group==='walk').slice(0,10)){now=new Date(+now+1000);r=await call({action:'CHECKIN',id,evidence:evidence(p)});assert.equal(r.document.run.visits.at(-1).validationStatus,'VALIDATED');}
  now=new Date(+now+1000);r=await call({action:'CHECKIN',id,evidence:evidence(point('test-walk-30'))});assert.equal(r.document.run.state,'COMPLETED');assert.equal(r.document.memorial,undefined);
  assert.equal((await f.db.query('select count(*)::int c from sskr_private.workflows')).rows[0].c,0);
  assert.equal((await call({action:'LOAD',id})).document.run.state,'COMPLETED');
});
test('owner isolation, session freeze, stop switch and concurrent request idempotency',async()=>{
  const {session,run}=await setup();
  await assert.rejects(()=>call({action:'LOAD',id:run.id},f.B),{code:'NOT_FOUND'});
  const amended={...config(),title:'변경된 설정',radius:100};await call({action:'CONFIGURE',id:session.id,revision:1,document:amended});
  assert.equal((await call({action:'LOAD',id:run.id})).document.config.radius,20);
  const request={action:'CHECKIN',id:run.id,evidence:evidence(point('test-start-ori'))};await Promise.all([call(request),call(request)]);
  assert.equal((await call({action:'LOAD',id:run.id})).document.run.visits.length,1);
  await call({action:'CONFIGURE',id:session.id,revision:2,document:{...amended,enabled:false}});
  now=new Date(+now+1000);await assert.rejects(()=>call({action:'CHECKIN',id:run.id,evidence:evidence(point('test-walk-01'))}),{code:'DISABLED'});
});
test('closed time window rejects checks even at an exact test coordinate',async()=>{
  const doc={...config(),startAt:new Date(+now+3600000).toISOString(),endAt:new Date(+now+7200000).toISOString()},session=await call({action:'CONFIGURE',id:randomUUID(),revision:0,document:doc});
  const run=await call({action:'BEGIN',id:randomUUID(),sessionId:session.id,startId:'test-start-ori'});
  const r=await call({action:'CHECKIN',id:run.id,evidence:evidence(point('test-start-ori'))});assert.equal(r.document.run.visits[0].reason,'OUTSIDE_EVENT_TIME');
});
test('BFF rejects all test APIs in business mode and requires authentication in test mode',async()=>{
  const {createHandler}=require('../../server/backend/handler');
  async function request(participationMode,account){let status,result;const handler=createHandler({getConfig:()=>({mode:'supabase',origin:'https://test.invalid',participationMode}),authService:{actor:async()=>({account})},getFieldTests:()=>service});
    await handler({method:'POST',url:'https://test.invalid/api/backend?resource=field-tests',headers:{origin:'https://test.invalid','content-type':'application/json','x-sskr-request':'1'},body:{action:'LIST'}},{writeHead:s=>status=s,end:b=>result=JSON.parse(b)});return {status,result};}
  assert.equal((await request('paid',f.account(f.A))).status,404);assert.equal((await request('test',null)).status,401);
});
