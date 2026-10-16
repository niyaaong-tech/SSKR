'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {fixture}=require('./workflow-fixture');
const {createWorkflows}=require('../../server/backend/workflows');
test('test participation confirms atomically without a payment, enforces capacity, and disables financial endpoints',async()=>{
  const f=await fixture({isTest:true});
  try{
    const service=createWorkflows({db:f.adapter,testParticipation:true,payments:{ready:false},clock:()=>new Date('2026-10-16T00:00:00Z')});
    const s=await service.operations(f.account(f.A),{action:'READ'});
    await service.operations(f.account(f.A),{action:'CONFIGURE',revision:s.epoch,commerce:{...f.commerce,priceTiers:[],refundPolicy:{}}});
    const user=f.account(f.A);
    await assert.rejects(service.handle(user,'application',{action:'CONFIRM_TEST'}),e=>e.code==='APPLICATION_INCOMPLETE');
    for(const id of [f.A,f.B]){
      const a=f.account(id);
      await service.handle(a,'application',{action:'START'});
      await service.handle(a,'application',{action:'SAVE_ACKNOWLEDGEMENT',acknowledgement:{acknowledged:true}});
      await service.handle(a,'application',{action:'SAVE_AGREEMENTS',agreements:{TERMS:true,PRIVACY:true,LOCATION:true}});
      await service.handle(a,'application',{action:'SAVE_PARTICIPANT_INFO',participant:{name:'검수',phone:'01012345678',email:'fixture@example.invalid',priceTierId:'test-participation'}});
    }
    const results=await Promise.allSettled([f.A,f.B].map(id=>service.handle(f.account(id),'application',{action:'CONFIRM_TEST'})));
    assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
    const confirmed=results.find(r=>r.status==='fulfilled').value;
    assert.equal(confirmed.participation.state,'ACTIVE');assert.equal(confirmed.payment.state,'NOT_STARTED');assert.equal(confirmed.surface.mode,'MODE_C');
    const winner=results[0].status==='fulfilled'?f.A:f.B;
    const repeat=await service.handle(f.account(winner),'application',{action:'CONFIRM_TEST'});
    assert.equal(repeat.participation.participantNumber,confirmed.participation.participantNumber);
    assert.equal((await f.db.query('select count(*)::int n from sskr_private.payment_orders')).rows[0].n,0);
    for(const endpoint of ['payment','checkout','refund'])await assert.rejects(service.handle(user,endpoint,{action:'START'}),e=>e.code==='PAYMENT_DEFERRED');
    for(const action of ['RECONCILE','REFUND_DETAILS','REFUND_APPROVE'])await assert.rejects(service.operations(user,{action}),e=>e.code==='PAYMENT_DEFERRED');
    assert.deepEqual(await service.webhook({data:{orderId:'anything'}}),{ok:true});
    assert.equal((await f.service.handle(f.account(winner),'application',{action:'CONFIRM_TEST'})).participation.id,confirmed.participation.id,'event flag works independently of deployment mode');
  }finally{await f.db.close();}
});
