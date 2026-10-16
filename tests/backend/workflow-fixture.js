'use strict';
const fs=require('node:fs');
const {PGlite}=require('@electric-sql/pglite');
const {createWorkflows}=require('../../server/backend/workflows');
const {call}=require('../../server/backend/service-db');
const {validateCommerce}=require('../../server/backend/commerce');
const {randomUUID}=require('node:crypto');
async function fixture({isTest=false}={}) {
  const db=new PGlite(),A=randomUUID(),B=randomUUID(),E=randomUUID();
  await db.exec(`create role anon;create role authenticated;create role service_role;create schema auth;
    create table auth.users(id uuid primary key,banned_until timestamptz,is_anonymous boolean default false);
    create table auth.sessions(id uuid primary key,user_id uuid,not_after timestamptz);create table auth.identities(user_id uuid,provider text);
    create function auth.jwt() returns jsonb language sql as $$select '{}'::jsonb$$;create function auth.uid() returns uuid language sql as $$select null::uuid$$;`);
  for(const file of fs.readdirSync('supabase/migrations').filter(f=>f.endsWith('.sql')).sort())await db.exec(fs.readFileSync('supabase/migrations/'+file,'utf8'));
  await db.query('insert into auth.users(id) values($1),($2)',[A,B]);await db.query('insert into sskr_private.event_operators(user_id) values($1)',[A]);
  const event={isTest,id:E,configVersion:1,publicTitle:'격리된 통합 테스트 행사',timezone:'Asia/Seoul',publishedAt:'2026-01-01T00:00:00Z',
    eventStartAt:'2099-10-16T06:00:00+09:00',eventEndAt:'2099-10-16T19:00:00+09:00',applicationOpenAt:'2020-01-01T00:00:00Z',applicationCloseAt:'2099-10-15T00:00:00Z',
    startLocationIds:['sokcho'],finishLocationId:'daecheon',minimumSpotCheckins:10,
    sunlight:{starts:[{locationId:'sokcho',sunriseAt:'2099-10-16T06:00:00+09:00'}],finish:{sunsetAt:'2099-10-16T19:00:00+09:00'}}};
  await db.query('insert into sskr_private.event_drafts(id,document) values($1,$2)',[E,JSON.stringify(event)]);
  await db.query('insert into sskr_private.event_publications(event_id,config_version,document,actor_id) values($1,1,$2,$3)',[E,JSON.stringify(event),A]);
  await db.query('insert into sskr_private.event_current values(true,$1,1)',[E]);
  const adapter={async rpc(name,args){try{
    if(name==='sskr_maintenance')return {data:(await db.query('select public.sskr_maintenance() result')).rows[0].result};
    if(name==='sskr_memorial_media')return {data:(await db.query('select public.sskr_memorial_media($1) result',[args.p_actor])).rows[0].result};
    if(name==='sskr_profile')return {data:(await db.query('select public.sskr_profile($1,$2) result',[args?.p_data?JSON.stringify(args.p_data):null,args?.p_revision??null])).rows[0].result};
    return {data:(await db.query('select public.sskr_workflow($1,$2,$3,$4,$5,$6) result',
    [args.p_action,args.p_actor,args.p_event,JSON.stringify(args.p_data),args.p_version,args.p_id])).rows[0].result};}catch(e){return {error:{message:e.message}};}}};
  const commerce=validateCommerce({enabled:true,baseCapacity:1,extraCapacity:0,guide:'합성 테스트 안내',guideVersion:'fixture',
    refundPolicy:{version:'fixture',text:'합성 테스트 환불 규정'},preparationNotice:'테스트 준비',preparationNoticeVersion:'fixture',
    startSelectionDeadlineAt:'2099-10-16T05:59:00+09:00',bikeInfoDeadlineAt:'2099-10-16T05:59:00+09:00',
    agreements:['TERMS','PRIVACY','LOCATION'].map(code=>({code,title:code,version:'fixture',body:'합성 테스트 약관'})),
    priceTiers:[{id:'standard',code:'STANDARD',displayName:'일반',amount:10000,salesStartAt:'2020-01-01T00:00:00Z',salesEndAt:'2099-10-15T00:00:00Z',isActive:true}]},event);
  const payments={ready:true,clientKey:'test_gck_fixture',environment:'test',confirmed:new Map(),calls:0,
    async confirm(order){this.calls++;const p={orderId:order.id,paymentKey:'private-payment-key',totalAmount:order.amount,currency:'KRW',status:'DONE'};this.confirmed.set(order.id,p);return p;},
    async lookup(id){return this.confirmed.get(id)||null;},async cancel(order){const p={...this.confirmed.get(order.id),status:'CANCELED'};this.confirmed.set(order.id,p);return p;}};
  let now=new Date();
  const service=createWorkflows({db:adapter,payments,clock:()=>now});
  const account=id=>({id,linked:true,provider:'google',profile:{name:'검수 계정',email:'fixture@example.invalid',phone:'01012345678'}});
  await service.operations(account(A),{action:'CONFIGURE',eventId:E,revision:0,commerce});
  async function application(id) {
    const user=account(id);await service.handle(user,'application',{action:'START'});
    await service.handle(user,'application',{action:'SAVE_ACKNOWLEDGEMENT',acknowledgement:{acknowledged:true}});
    await service.handle(user,'application',{action:'SAVE_AGREEMENTS',agreements:{TERMS:true,PRIVACY:true,LOCATION:true}});
    return service.handle(user,'application',{action:'SAVE_PARTICIPANT_INFO',participant:{name:'검수',email:'fixture@example.invalid',phone:'01012345678',priceTierId:'standard'}});
  }
  return {db,adapter,A,B,E,event,commerce,payments,service,account,application,setNow:value=>{now=new Date(value);},call:(...args)=>call(adapter,...args)};
}
module.exports={fixture};
