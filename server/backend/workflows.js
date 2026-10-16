'use strict';
const { randomUUID }=require('node:crypto');
const { BackendError }=require('./config');
const { call,serviceDb }=require('./service-db');
const { WorkflowRepository }=require('./workflow-repository');
const { createTransactionService,DomainError }=require('../participate/transaction-service');
const { buildContextDto }=require('../participate/dto');
const { context:emptyContext }=require('./context');
const { validateCommerce,eventForWorkflow }=require('./commerce');
const { createPayments,verifyPayment }=require('./payments');
const { checkin,editMemorial,publicMemorial,reviewCheckin }=require('./ride');
const actions={START:['startApplication'],SAVE_ACKNOWLEDGEMENT:['saveAcknowledgement','acknowledgement'],SAVE_AGREEMENTS:['saveAgreements','agreements'],
  SAVE_PARTICIPANT_INFO:['saveParticipantInfo','participant'],EDIT_PARTICIPANT_INFO:['editParticipantInfo'],PREVIOUS_STEP:['previousStep','fromStep'],CANCEL:['cancelApplication'],
  DEFER_PAYMENT:['deferPayment'],RESUME_PAYMENT:['resumePayment'],SAVE_BIKE_INFO:['saveBikeInfo','bike'],SAVE_START_LOCATION:['saveStartLocation','startLocationId'],
  SAVE_KIT_RECIPIENT:['saveKitRecipient','recipient'],ACKNOWLEDGE_PREPARATION:['acknowledgePreparation','version']};
function createWorkflows({db,payments=createPayments(),clock=()=>new Date(),rpc=call,testParticipation=false}={}) {
  const read=(account,event)=>rpc(db,'read',account?.id||null,event);
  function repo(s,account) {return new WorkflowRepository(s.state,eventForWorkflow(s,clock(),s.event?.isTest===true||payments.ready),account,s.history||[]);}
  function project(s,account) {
    if(!s.event||!s.commerce?.priceTiers?.length)return {...emptyContext(account,clock(),s.event),participationMode:s.event?.isTest===true?'test':'paid'};
    const r=repo(s,account),dto=buildContextDto(r,{now:clock()});
    dto.participationMode=s.event.isTest===true?'test':'paid';
    if(s.event.isTest===true){
      dto.event.refundPolicy=null;
      dto.surface.primaryAction.label=({PREPARE_CHECKOUT:'테스트 참가 확정',RETRY_PAYMENT:'테스트 참가 확정',RESUME_PAYMENT:'신청 이어하기'})[dto.surface.primaryAction.code]||dto.surface.primaryAction.label;
      for(const t of dto.tiers)t.displayAmount='0원';
      if(dto.price)dto.price.displayAmount='0원';
    }
    const p=dto.payment;
    dto.payment=Object.fromEntries(['id','state','createdAt','updatedAt','amount','failureCode'].filter(k=>Object.hasOwn(p,k)).map(k=>[k,p[k]]));
    dto.pastParticipations=dto.pastParticipations.map(p=>({...p,synthetic:false}));
    dto.event.capacityDisplay=String(s.commerce.baseCapacity+(s.commerce.extraCapacity||0))+'명';
    dto.event.capacityNote='';

    dto.event.published=true;dto.backend='supabase';dto.event.preparationNotice=s.commerce.preparationNotice;
    dto.event.participationGuide=s.commerce.guide;dto.agreementDocuments=s.commerce.agreements||[];
    dto.event.notices=(s.commerce.notices||[]).filter(n=>n.publishedAt&&Date.parse(n.publishedAt)<=+clock()).map(n=>({...n,eventId:s.event.id,category:'운영 공지',date:n.publishedAt.slice(0,10)}));
    dto.refund=s.state?.refund?{state:s.state.refund.state,requestedAt:s.state.refund.requestedAt}:null;
    dto.run=s.state?.run?{state:s.state.run.state,visits:s.state.run.visits,minimumSpotCheckins:s.state.run.rules.minimumSpotCheckins,places:s.state.run.rules.places}:null;
    return dto;
  }
  async function mutate(account,event,action,fn) {
    if(!account?.id)throw new BackendError('AUTH_REQUIRED','로그인이 필요합니다.',401);
    for(let i=0;i<5;i++) {
      const s=await read(account,event);if(!s.event)throw new BackendError('EVENT_NOT_READY','행사 정보를 준비하고 있습니다.',409);
      const r=repo(s,account),before=JSON.stringify(r.document());let metadata={},error;
      try{metadata=await fn(r,s)||{};}catch(e){if(!(e instanceof DomainError))throw e;error=new BackendError(e.code,e.userMessage);}
      if(before===JSON.stringify(r.document())){if(error)throw error;return {snapshot:s,context:project(s,account),...metadata};}
      try {
        const result=await rpc(db,'commit',account.id,s.event.id,{state:r.document(),configVersion:s.event.configVersion,action,...(metadata.evidence?{evidence:metadata.evidence}:{})},s.epoch);
        if(error){error.context=project(result,account);throw error;}
        return {snapshot:result,context:project(result,account),...metadata};
      }catch(e){if(e.code!=='CONFLICT'||i===4)throw e;}
    }
  }
  const latest=r=>r.getPaymentAttempts().at(-1);
  function expire(r) {
    const h=r.getCheckoutHold();
    if(h?.state==='HELD'&&Date.parse(h.expiresAt)<=+clock()&&latest(r)?.state!=='PROCESSING'){h.state='EXPIRED';r.saveCheckoutHold(h);}
  }
  async function createOrder(account) {
    if(!payments.ready)throw new BackendError('PAYMENT_NOT_CONFIGURED','참가 접수를 준비하고 있습니다.',503);
    const result=await mutate(account,null,'CREATE_ORDER',(r,s)=>{
      const p=latest(r);if(p?.state==='PROCESSING')throw new BackendError('PAYMENT_PENDING','결제 결과 확인 중입니다. 다시 결제하지 말고 상태를 확인해 주세요.',409);
      if(r.getParticipation()?.state==='ACTIVE')throw new BackendError('ALREADY_CONFIRMED','이미 참가가 확정되었습니다.',409);
      expire(r);
      if(p?.state==='PENDING'&&r.getCheckoutHold()?.state==='HELD')return;
      if(p?.state==='PENDING'){p.state='FAILED';r.savePaymentAttempt(p);}
      const event=r.getCurrentEvent();if(event.registrationState!=='OPEN')throw new BackendError('REGISTRATION_CLOSED','현재 접수 기간이 아닙니다.',409);
      const h=createTransactionService(r,{clock:()=>+clock()}).prepareCheckout();
      r.savePaymentAttempt({id:'sskr_'+randomUUID().replaceAll('-',''),applicationId:r.getApplication().id,eventId:event.id,
        state:'PENDING',amount:h.amount,currency:'KRW',createdAt:clock().toISOString(),holdId:h.id,
        policySnapshot:{refundPolicy:s.commerce.refundPolicy,agreements:s.commerce.agreements,configVersion:event.configVersion}});
    });
    const order=result.snapshot.state.paymentAttempts.at(-1);
    return {...result.context,checkout:{orderId:order.id,amount:order.amount,currency:'KRW',clientKey:payments.clientKey,customerKey:account.id,
      orderName:result.snapshot.event.publicTitle,environment:payments.environment}};
  }
  async function orderFor(account,id) {
    if(typeof id!=='string'||!/^sskr_[a-f0-9]{32}$/.test(id))throw new BackendError('INVALID_INPUT','결제 번호를 확인해 주세요.');
    const row=await rpc(db,'order',null,null,{},null,id);
    if(!row||row.ownerId!==account.id)throw new BackendError('NOT_FOUND','결제 내역을 찾을 수 없습니다.',404);
    const s=await read(account,row.eventId),order=s.state.paymentAttempts.find(p=>p.id===id);
    return {s,order};
  }
  async function settle(account,eventId,orderId,data) {
    return mutate(account,eventId,'PAYMENT_RESULT',r=>{
      const order=r.getPaymentAttempts().find(p=>p.id===orderId);verifyPayment(data,order);
      // Terminal successes cannot be rolled back by delayed READY/IN_PROGRESS callbacks.
      if(['REFUNDED','FAILED'].includes(order.state))return;
      if(['CANCELED','EXPIRED','ABORTED'].includes(data.status)) {
        order.state=data.status==='CANCELED'&&order.state==='SUCCEEDED'?'REFUNDED':'FAILED';
        if(r.getCheckoutHold()?.id===order.holdId){const h=r.getCheckoutHold();h.state='RELEASED';r.saveCheckoutHold(h);}
        if(order.state==='REFUNDED'){const p=r.getParticipation();if(p){p.state='CANCELLED';r.saveParticipation(p);}if(r.snapshot.refund)r.snapshot.refund.state='COMPLETED';}
      }else if(data.status==='DONE') {
        if(order.state==='SUCCEEDED')return;
        const h=r.getCheckoutHold(),a=r.getApplication();
        if(!h||h.id!==order.holdId||h.state!=='HELD')throw new BackendError('PAYMENT_REVIEW_REQUIRED','결제가 확인되었습니다. 참가 확정 복구 중이므로 다시 결제하지 마세요.',409);
        order.state='SUCCEEDED';order.paymentKey=data.paymentKey;h.state='CONSUMED';a.state='COMPLETED';
        r.saveCheckoutHold(h);r.saveApplication(a);
        r.saveParticipation({id:'participation-'+r.getCurrentEvent().id+'-'+account.id,eventId:r.getCurrentEvent().id,userId:account.id,
          state:'ACTIVE',slotAllocation:'CONFIRMED',capacityPool:h.capacityPool,registrationTierCode:r.getPriceTiers().find(p=>p.id===h.priceTierId)?.code,
          bikeInfo:a.bike,selectedStartLocationId:null,kitRecipient:null,acknowledgedNoticeVersion:null,fulfillmentState:'NOT_PREPARED',runResult:'NOT_STARTED',createdAt:clock().toISOString()});
      }else if(data.status!=='READY'&&order.state!=='SUCCEEDED')order.state='PROCESSING';
      order.updatedAt=clock().toISOString();r.savePaymentAttempt(order);
    });
  }
  async function payment(account,body) {
    if(['START','RETRY'].includes(body.action))return createOrder(account);
    const s0=body.orderId?await orderFor(account,body.orderId):{s:await read(account)};
    const order=s0.order||s0.s.state?.paymentAttempts?.at(-1);if(!order)return project(s0.s,account);
    const eventId=s0.s.event.id;
    if(body.action==='CONFIRM') {
      if(typeof body.paymentKey!=='string'||body.paymentKey.length>300)throw new BackendError('INVALID_INPUT','결제 승인 정보를 확인해 주세요.');
      if(order.state==='SUCCEEDED')return project(s0.s,account);
      await mutate(account,eventId,'PAYMENT_CONFIRMING',r=>{
        const p=latest(r),h=r.getCheckoutHold();
        if(p?.id!==order.id||!['PENDING','PROCESSING'].includes(p.state)||h?.state!=='HELD')throw new BackendError('PAYMENT_CHANGED','현재 결제 상태를 다시 확인해 주세요.',409);
        if(p.state==='PENDING'&&Date.parse(h.expiresAt)<=+clock())throw new BackendError('HOLD_EXPIRED','결제 준비 시간이 만료되었습니다. 참가비가 청구되지 않았습니다. 다시 진행해 주세요.',409);
        p.state='PROCESSING';r.savePaymentAttempt(p);
      });
      const data=await payments.confirm(order,body.paymentKey);
      return (await settle(account,eventId,order.id,data)).context;
    }
    if(body.action!=='REFRESH')throw new BackendError('INVALID_INPUT','지원하지 않는 결제 동작입니다.');
    if(['PENDING','PROCESSING','SUCCEEDED'].includes(order.state)) {
      await mutate(account,eventId,'PAYMENT_LOOKUP',r=>{const p=r.getPaymentAttempts().find(p=>p.id===order.id);p.lastCheckedAt=clock().toISOString();r.savePaymentAttempt(p);});
      const data=await payments.lookup(order.id);
      if(data)return (await settle(account,eventId,order.id,data)).context;
    }
    return project(await read(account,eventId),account);
  }
  async function handle(account,endpoint,body={}) {
    if(endpoint==='context')return project(await read(account),account);
    if(!account?.id)throw new BackendError('AUTH_REQUIRED','로그인이 필요합니다.',401);
    if(testParticipation&&['payment','checkout','refund'].includes(endpoint))throw new BackendError('PAYMENT_DEFERRED','테스트 사이트에서는 결제와 환불을 진행하지 않습니다.',409);
    if(endpoint==='application'&&body.action==='CONFIRM_TEST'){

      return (await mutate(account,null,'TEST_PARTICIPATION_CONFIRMED',r=>{
        if(r.getCurrentEvent().isTest!==true)throw new BackendError('NOT_FOUND','지원하지 않는 신청 동작입니다.',404);
        if(r.getParticipation()?.state==='ACTIVE')return;
        if(r.getCurrentEvent().registrationState!=='OPEN')throw new BackendError('REGISTRATION_CLOSED','현재 접수 기간이 아닙니다.',409);
        expire(r);
        const h=createTransactionService(r,{clock:()=>+clock()}).prepareCheckout(),a=r.getApplication();
        if(h.amount!==0)throw new BackendError('TEST_CONFIGURATION_REQUIRED','테스트 참가 설정을 확인해 주세요.',409);
        h.state='CONSUMED';a.state='COMPLETED';r.saveCheckoutHold(h);r.saveApplication(a);
        r.saveParticipation({id:'participation-'+r.getCurrentEvent().id+'-'+account.id,eventId:r.getCurrentEvent().id,userId:account.id,
          state:'ACTIVE',slotAllocation:'CONFIRMED',capacityPool:h.capacityPool,registrationTierCode:'STANDARD',confirmationSource:'TEST_NO_CHARGE',
          bikeInfo:a.bike,selectedStartLocationId:null,kitRecipient:null,acknowledgedNoticeVersion:null,fulfillmentState:'NOT_PREPARED',runResult:'NOT_STARTED',createdAt:clock().toISOString()});
      })).context;
    }
    if(['payment','checkout','refund'].includes(endpoint)&&(await read(account,body.eventId||null)).event?.isTest===true)throw new BackendError('PAYMENT_DEFERRED','현재 참가에는 결제·환불 처리가 없습니다.',409);
    if(endpoint==='payment')return payment(account,body);
    if(endpoint==='application'||endpoint==='checkout') {
      if(endpoint==='checkout'&&body.action!=='PREPARE')throw new BackendError('INVALID_INPUT','지원하지 않는 요청입니다.');
      return (await mutate(account,null,body.action,r=>{
        expire(r);const svc=createTransactionService(r,{clock:()=>+clock(),allowFailedEditing:true});
        if(endpoint==='checkout') {if(r.getCurrentEvent().registrationState!=='OPEN')throw new BackendError('REGISTRATION_CLOSED','현재 접수 기간이 아닙니다.',409);return svc.prepareCheckout();}
        const action=actions[body.action];if(!action)throw new BackendError('INVALID_INPUT','지원하지 않는 신청 동작입니다.');
        if(body.action==='START'&&r.getCurrentEvent().registrationState!=='OPEN')throw new BackendError('REGISTRATION_CLOSED','현재 접수 기간이 아닙니다.',409);
        if(body.action==='SAVE_START_LOCATION'&&['STARTED','COMPLETED'].includes(r.snapshot.run?.state))throw new BackendError('RUN_STARTED','출발 후에는 출발지를 변경할 수 없습니다.',409);
        if(body.action==='SAVE_KIT_RECIPIENT'&&r.getCurrentEvent().kitDeliveryMode!=='SHIPPING')throw new BackendError('ONSITE_KIT','이번 행사는 현장에서 키트를 수령합니다.',409);
        svc[action[0]](body[action[1]]);
      })).context;
    }
    if(endpoint==='ride')return (await mutate(account,body.eventId||null,'CHECKIN',(r,s)=>checkin(r,s,body,clock(),{places:s.event.placeCatalog||undefined,window:s.event.timeMode==='MANUAL'?{startTime:s.event.eventStartAt,finishTime:s.event.eventEndAt}:undefined}))).context;
    if(endpoint==='memorial')return (await mutate(account,body.eventId,'MEMORIAL_EDIT',r=>editMemorial(r,body.values,body.revision))).context;
    if(endpoint==='refund')return (await mutate(account,body.eventId||null,'REFUND_REQUEST',r=>{
      if(r.getParticipation()?.state!=='ACTIVE')throw new BackendError('NOT_FOUND','취소할 참가 내역이 없습니다.',404);
      if(!r.snapshot.refund)r.snapshot.refund={state:'REVIEW_REQUIRED',reason:String(body.reason||'').trim().slice(0,1000),requestedAt:clock().toISOString(),policyVersion:latest(r)?.policySnapshot?.refundPolicy?.version};
    })).context;
    throw new BackendError('NOT_FOUND','요청한 기능을 찾을 수 없습니다.',404);
  }
  async function operations(account,body) {
    const page={offset:Number.isInteger(body.offset)&&body.offset>=0?body.offset:0};
    const s=await rpc(db,'operations',account.id,body.eventId||null,page);
    if((testParticipation||s.event.isTest===true)&&['REFUND_DETAILS','REFUND_APPROVE','RECONCILE'].includes(body.action))throw new BackendError('PAYMENT_DEFERRED','이 대회에서는 결제와 환불을 진행하지 않습니다.',409);
    if(body.action==='REFUND_DETAILS'){
      const snapshot=await read({id:body.ownerId,linked:true},s.event.id),order=snapshot.state.paymentAttempts?.at(-1);
      if(!order||snapshot.state.refund?.state!=='REVIEW_REQUIRED')throw new BackendError('NOT_FOUND','검토할 환불 요청이 없습니다.',404);
      return {ok:true,amount:order.amount,policy:order.policySnapshot.refundPolicy,reason:snapshot.state.refund.reason,
        fulfillmentState:snapshot.state.participation?.fulfillmentState,createdAt:order.createdAt};
    }
    if(body.action==='CHECKIN_EVIDENCE')return {ok:true,evidence:await rpc(db,'evidence',account.id,s.event.id,{ownerId:body.ownerId},null,body.id)};
    if(body.action==='CONFIGURE') {
      if(body.revision!==s.epoch)throw new BackendError('CONFLICT','다른 요청으로 설정이 바뀌었습니다.',409);
      const c=validateCommerce(body.commerce,s.event,{testParticipation:s.event.isTest===true});if(c.enabled&&s.event.isTest!==true&&!payments.ready)throw new BackendError('PAYMENT_NOT_CONFIGURED','결제 키를 연결한 뒤 접수를 열어 주세요.',409);
      return {ok:true,...await rpc(db,'configure',account.id,s.event.id,c,s.epoch)};
    }
    if(body.action==='FULFILLMENT') {
      if(s.commerce.kitDeliveryMode!=='SHIPPING')throw new BackendError('ONSITE_KIT','현장 수령 행사에는 발송 처리를 할 수 없습니다.',409);
      if(!['PREPARING','SHIPPED','DELIVERED','RETURNED'].includes(body.state))throw new BackendError('INVALID_INPUT','발송 상태를 확인해 주세요.');
      await mutate({id:body.ownerId,linked:true},s.event.id,'FULFILLMENT_BY_'+account.id,r=>{
        const p=r.getParticipation();if(!p)throw new BackendError('NOT_FOUND','참가 내역이 없습니다.',404);p.fulfillmentState=body.state;r.saveParticipation(p);
      });
    }else if(body.action==='CHECKIN_REVIEW') {
      await mutate({id:body.ownerId,linked:true},s.event.id,'CHECKIN_REVIEW_BY_'+account.id,r=>reviewCheckin(r,body,account.id,clock()));
    }else if(body.action==='RECONCILE') {
      const owner={id:body.ownerId,linked:true},snapshot=await read(owner,s.event.id);
      const orderId=body.orderId||snapshot.state.paymentAttempts?.at(-1)?.id;
      if(orderId)await payment(owner,{action:'REFRESH',orderId});
    }else if(body.action==='PHOTO_REVIEW') {
      if(!['APPROVED','REJECTED'].includes(body.state))throw new BackendError('INVALID_INPUT','검토 결과를 선택해 주세요.');
      await mutate({id:body.ownerId,linked:true},s.event.id,'PHOTO_REVIEW_BY_'+account.id,r=>{
        const m=r.snapshot.media?.find(p=>p.id===body.id&&p.status==='READY');if(!m)throw new BackendError('NOT_FOUND','사진을 찾을 수 없습니다.',404);
        m.moderationStatus=body.state;
        for(const v of r.snapshot.memorial?.visits||[])for(const p of v.media||[])if(p.id===m.id)p.moderationStatus=body.state;
      });
    }else if(body.action==='REFUND_APPROVE') {
      const owner={id:body.ownerId,linked:true},snapshot=await read(owner,s.event.id),p=snapshot.state.paymentAttempts?.at(-1);
      if(snapshot.state.refund?.state!=='REVIEW_REQUIRED'||p?.state!=='SUCCEEDED'||body.policyVersion!==p.policySnapshot.refundPolicy.version||body.confirmed!==true)throw new BackendError('REFUND_REVIEW_REQUIRED','신청·발송 내역과 적용 환불 규정을 다시 확인해 주세요.',409);
      // Full refunds only. Partial refunds require a separate reviewed workflow.
      const data=await payments.cancel(p,'운영자 검토 후 참가 취소');await settle(owner,s.event.id,p.id,data);
    }else if(body.action&&body.action!=='READ')throw new BackendError('INVALID_INPUT','지원하지 않는 운영 동작입니다.');
    return {ok:true,...await rpc(db,'operations',account.id,s.event?.id,page),participationMode:s.event?.isTest===true?'test':'paid',paymentReady:s.event?.isTest!==true&&payments.ready,paymentEnvironment:payments.environment};
  }
  async function memorials(account) {
    const data=await rpc(db,'memorials',account?.id||null);
    if(account?.id){
      const photos=await db.rpc('sskr_memorial_media',{p_actor:account.id});
      if(photos.error)throw new BackendError('SERVICE_UNAVAILABLE','사진 기록을 불러오지 못했습니다.',503);
      for(const m of data.items.filter(m=>m.ownerUserId===account.id))for(const v of m.visits){
        const saved=new Set((v.media||[]).map(p=>p.id)),pending=(photos.data||[]).filter(p=>p.memorialId===m.id&&p.visitId===v.id&&!saved.has(p.id));
        if(pending.length){
          v.media=[...(v.media||[]),...pending.map(require('./media').mediaDto)];v.photoConsent=false;
          m.visitEdits||={};m.visitEdits[v.id]={note:v.note||'',photoConsent:false,mediaIds:v.media.map(p=>p.id)};
        }
      }
    }
    return {ok:true,items:data.items.map(m=>publicMemorial(m,account))};
  }
  async function webhook(body) {
    if(testParticipation)return {ok:true};
    const id=body?.data?.orderId;if(typeof id!=='string'||!/^sskr_[a-f0-9]{32}$/.test(id))return {ok:true};
    const row=await rpc(db,'order',null,null,{},null,id);if(!row)return {ok:true};
    // The webhook payload is only a wake-up signal. All financial facts come
    // from the authenticated PG query, including delayed or reordered events.
    const data=await payments.lookup(id);
    if(data)await settle({id:row.ownerId,linked:true},row.eventId,id,data);
    return {ok:true};
  }
  return {handle,operations,memorials,read,project,mutate,webhook};
}
function workflows(cfg){return createWorkflows({db:serviceDb(cfg),testParticipation:cfg.participationMode==='test'});}
module.exports={createWorkflows,workflows};
