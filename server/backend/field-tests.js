'use strict';
const {BackendError}=require('./config');
const {checkin,distance}=require('./ride');
const GROUPS=['walk','bus110a','bus520'];
const uuid=value=>typeof value==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
const invalid=message=>{throw new BackendError('INVALID_INPUT',message||'테스트 설정을 확인해 주세요.');};
function configuration(input,places){
  if(!input||typeof input!=='object')invalid();
  const {title,group,startAt,endAt,finishId,startIds,minimumSpotCheckins,radius,accuracy,enabled}=input;
  if(typeof title!=='string'||!title.trim()||title.length>100||!GROUPS.includes(group)||typeof enabled!=='boolean')invalid();
  const timestamp=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})$/.test(s)&&Number.isFinite(Date.parse(s));
  if(!timestamp(startAt)||!timestamp(endAt)||Date.parse(endAt)<=Date.parse(startAt)||Date.parse(endAt)-Date.parse(startAt)>48*3600000)invalid('시작·종료 시각을 확인해 주세요. 한 테스트는 최대 48시간입니다.');
  if(!Array.isArray(startIds)||!startIds.length||new Set(startIds).size!==startIds.length||startIds.some(id=>!places.some(p=>p.id===id&&p.startEligible)))invalid('테스트 출발지를 선택해 주세요.');
  const finish=places.find(p=>p.id===finishId&&p.kind==='spot');
  if(!finish||startIds.some(id=>distance(places.find(p=>p.id===id),finish)<50))invalid('출발지와 50m 이상 떨어진 테스트 스팟을 도착지로 선택해 주세요.');
  const count=places.filter(p=>p.group===group&&p.kind==='spot'&&p.id!==finishId&&!startIds.includes(p.id)).length;
  if(!Number.isInteger(minimumSpotCheckins)||minimumSpotCheckins<1||minimumSpotCheckins>count)invalid('필요한 스팟 수가 이 코스의 방문 가능한 스팟 수를 넘습니다.');
  if(!Number.isInteger(radius)||radius<10||radius>200||!Number.isInteger(accuracy)||accuracy<5||accuracy>150)invalid('GPS 반경은 10~200m, 허용 오차는 5~150m로 지정해 주세요.');
  return {title:title.trim(),group,startAt:new Date(startAt).toISOString(),endAt:new Date(endAt).toISOString(),finishId,startIds,minimumSpotCheckins,radius,accuracy,enabled};
}
function createFieldTests({db,clock=()=>new Date()}) {
  async function rpc(action,actor,data={},id=null,revision=null){
    const {data:result,error}=await db.rpc('sskr_field_tests',{p_action:action,p_actor:actor,p_data:data,p_id:id,p_revision:revision});
    if(error){const known={FORBIDDEN:[403,'테스트 운영 권한이 없습니다.'],NOT_FOUND:[404,'테스트를 찾을 수 없습니다.'],CONFLICT:[409,'다른 화면에서 변경되었습니다. 새로고침 후 다시 시도해 주세요.'],DISABLED:[409,'관리자가 이 테스트를 중지했습니다.'],LIMIT_REACHED:[429,'테스트 기록이 많습니다. 운영자에게 문의해 주세요.']}[error.message];throw new BackendError(error.message,known?.[1]||'테스트 기록을 저장하지 못했습니다. 다시 시도해 주세요.',known?.[0]||503);}
    return result;
  }
  async function handle(account,body={}) {
    if(!account?.id)throw new BackendError('AUTH_REQUIRED','Google 로그인 후 GPS 테스트를 사용할 수 있습니다.',401);
    const actor=account.id,action=body.action||'LIST';
    if(action==='LIST')return {ok:true,...await rpc('list',actor)};
    if(action==='CONFIGURE'){
      if(!uuid(body.id)||!Number.isInteger(body.revision)||body.revision<0)invalid();
      const all=await rpc('list',actor);if(!all.operator)throw new BackendError('FORBIDDEN','테스트 운영 권한이 없습니다.',403);
      return {ok:true,...await rpc('configure',actor,configuration(body.document,all.places),body.id,body.revision)};
    }
    if(action==='LOAD'){
      if(!uuid(body.id))invalid();return {ok:true,...await rpc('load',actor,{},body.id)};
    }
    if(action==='BEGIN'){
      if(!uuid(body.id)||!uuid(body.sessionId))invalid();
      const all=await rpc('list',actor),session=all.sessions.find(s=>s.id===body.sessionId&&s.document.enabled);
      if(!session)throw new BackendError('NOT_FOUND','진행할 수 있는 테스트가 없습니다.',404);
      if(!session.document.startIds.includes(body.startId))invalid('출발지를 선택해 주세요.');
      const doc=session.document;
      const places=all.places.filter(p=>p.group===doc.group||p.id===body.startId||p.id===doc.finishId).map(p=>({...p,kind:p.id===body.startId?'start':p.id===doc.finishId?'finish':'spot'}));
      return {ok:true,...await rpc('begin',actor,{sessionId:session.id,sessionRevision:session.revision,startId:body.startId,config:doc,places,run:null},body.id)};
    }
    if(action==='CHECKIN'){
      if(!uuid(body.id)||!body.evidence||typeof body.evidence!=='object')invalid();
      // Retry CAS with a fresh document; request IDs make a lost response safe to retry.
      for(let attempt=0;attempt<3;attempt++){
        const record=await rpc('load',actor,{},body.id),doc=structuredClone(record.document),cfg=doc.config;
        const p={state:'ACTIVE',slotAllocation:'CONFIRMED',selectedStartLocationId:doc.startId};
        const repo={snapshot:doc,getParticipation:()=>p,saveParticipation:()=>{}};
        const result=checkin(repo,{event:{id:record.sessionId,publicTitle:cfg.title,configVersion:doc.sessionRevision,minimumSpotCheckins:cfg.minimumSpotCheckins,finishLocationId:cfg.finishId},commerce:{checkinRadiusMeters:cfg.radius,maxAccuracyMeters:cfg.accuracy}},body.evidence,clock(),{places:doc.places,window:{startTime:cfg.startAt,finishTime:cfg.endAt},createMemorial:false});
        if(!result)return {ok:true,...record};
        try{return {ok:true,...await rpc('checkin',actor,{document:doc,evidence:result.evidence},body.id,record.revision)};}
        catch(error){if(error.code!=='CONFLICT'||attempt===2)throw error;}
      }
    }
    invalid('지원하지 않는 테스트 요청입니다.');
  }
  return {handle};
}
module.exports={createFieldTests,configuration,GROUPS};
