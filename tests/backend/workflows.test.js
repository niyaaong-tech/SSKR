'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {randomUUID}=require('node:crypto');
const {fixture}=require('./workflow-fixture');
const catalog=require('../../web/app/spot-catalog');
const {sanitizePhoto}=require('../../server/backend/media');
const {createMedia}=require('../../server/backend/media');
const sharp=require('sharp');
test('real workflow: private tables, last-slot race, spoofed identity, duplicate approval, recovery and refund',async t=>{
  const f=await fixture();t.after(()=>f.db.close());const {A,B,E,service:s,account:a}=f;
  for(const role of ['anon','authenticated']){
    await f.db.exec('set role '+role);
    await assert.rejects(f.db.query("select public.sskr_workflow('read')"),/permission denied/);
    await assert.rejects(f.db.query('select * from sskr_private.workflows'),/permission denied/);
    await f.db.exec('reset role');
  }
  await assert.rejects(s.operations(a(B),{action:'READ'}),e=>e.code==='FORBIDDEN');
  await Promise.all([f.application(A),f.application(B)]);
  const attempts=await Promise.allSettled([s.handle(a(A),'payment',{action:'START',account:{id:B}}),s.handle(a(B),'payment',{action:'START'})]);
  assert.equal(attempts.filter(x=>x.status==='fulfilled').length,1);
  const index=attempts.findIndex(x=>x.status==='fulfilled'),owner=index?B:A,other=index?A:B,order=attempts[index].value.checkout;
  assert.equal(order.amount,10000);
  await assert.rejects(s.handle(a(other),'payment',{action:'CONFIRM',orderId:order.orderId,paymentKey:'fake'}),e=>e.code==='NOT_FOUND');
  const first=await s.handle(a(owner),'payment',{action:'CONFIRM',orderId:order.orderId,paymentKey:'private-payment-key',amount:1});
  assert.equal(first.participation.state,'ACTIVE');assert.equal(first.participation.participantNumber,1);
  assert.ok(!JSON.stringify(first).includes('private-payment-key'));
  await s.handle(a(owner),'payment',{action:'CONFIRM',orderId:order.orderId,paymentKey:'replayed'});assert.equal(f.payments.calls,1);
  await s.handle(a(owner),'refund',{reason:'테스트 취소'});
  const review=await s.operations(a(A),{action:'REFUND_DETAILS',eventId:E,ownerId:owner});assert.equal(review.amount,10000);assert.equal(review.policy.text,'합성 테스트 환불 규정');
  await assert.rejects(s.operations(a(A),{action:'FULFILLMENT',eventId:E,ownerId:owner,state:'SHIPPED'}),e=>e.code==='ONSITE_KIT');
  await s.operations(a(A),{action:'REFUND_APPROVE',eventId:E,ownerId:owner,confirmed:true,policyVersion:'fixture'});
  assert.equal((await s.handle(a(owner),'context')).participation.state,'CANCELLED');
  assert.equal((await s.handle(a(owner),'context')).payment.state,'REFUNDED');
  const second=await s.handle(a(other),'payment',{action:'START'});
  const originalConfirm=f.payments.confirm.bind(f.payments);
  f.payments.confirm=async order=>{await originalConfirm(order);throw Object.assign(Error('network'),{code:'PAYMENT_PENDING'});};
  await assert.rejects(s.handle(a(other),'payment',{action:'CONFIRM',orderId:second.checkout.orderId,paymentKey:'key'}),e=>e.code==='PAYMENT_PENDING');
  assert.equal((await s.handle(a(other),'payment',{action:'REFRESH'})).participation.state,'ACTIVE');
  assert.equal((await s.handle(a(other),'context')).participation.participantNumber,2);
});
test('checkin ledger: N excludes endpoints, duplicate replay, uncertain location, old rules, private/public withdrawal',async t=>{
  const f=await fixture();t.after(()=>f.db.close());const a=f.account(f.A),s=f.service;
  await f.application(f.A);const checkout=(await s.handle(a,'payment',{action:'START'})).checkout;
  await s.handle(a,'payment',{action:'CONFIRM',orderId:checkout.orderId,paymentKey:'key'});
  await s.handle(a,'application',{action:'SAVE_START_LOCATION',startLocationId:'sokcho'});
  let ms=Date.parse('2099-10-16T06:01:00+09:00');
  const input=(id,extra={})=>{ms+=60000;f.setNow(ms);const p=catalog.find(x=>x.id===id);return {requestId:randomUUID(),locationId:id,lat:p.lat,lng:p.lng,accuracy:10,capturedAt:new Date(ms).toISOString(),...extra};};
  const start=input('sokcho');await s.handle(a,'ride',start);await s.handle(a,'ride',start);
  const changed={...f.event,configVersion:2,minimumSpotCheckins:1};
  await f.db.query('insert into sskr_private.event_publications(event_id,config_version,document,actor_id) values($1,2,$2,$3)',[f.E,JSON.stringify(changed),f.A]);
  await f.db.query('update sskr_private.event_current set current_version=2');
  await assert.rejects(s.handle(a,'ride',{...start,lat:0}),e=>e.code==='IDEMPOTENCY_CONFLICT');
  assert.equal((await s.handle(a,'context')).run.visits.length,1);
  const bad=await s.handle(a,'ride',input('auraji',{accuracy:500}));assert.equal(bad.run.visits.at(-1).reason,'LOCATION_UNCERTAIN');
  const premature=await s.handle(a,'ride',input('daecheon'));assert.equal(premature.run.state,'STARTED');assert.equal(premature.run.visits.at(-1).reason,'MORE_SPOTS_REQUIRED');
  assert.equal(premature.run.minimumSpotCheckins,10,'the started run keeps the ten-spot rule after a one-spot publication');
  for(const p of catalog.filter(p=>p.kind==='spot').slice(0,10))await s.handle(a,'ride',input(p.id));
  const done=await s.handle(a,'ride',input('daecheon'));assert.equal(done.run.state,'COMPLETED');
  const owner=(await s.memorials(a)).items;assert.equal(owner.length,1);assert.equal(owner[0].spotCount,10);assert.equal(owner[0].visits.length,12);
  assert.ok(owner[0].places.find(p=>p.id==='auraji').image);assert.equal(owner[0].visits.find(v=>v.locationId==='auraji').placePhoto.sourceUrl,catalog.find(p=>p.id==='auraji').source);
  assert.equal((await s.memorials(null)).items.length,0);
  const objects=new Map();let uploadPath;
  const storage={async createSignedUploadUrl(path){uploadPath=path;return {data:{signedUrl:'https://fixture.invalid/upload'}};},async download(path){return {data:objects.has(path)?new Blob([objects.get(path)]):null,error:objects.has(path)?null:Error('missing')};},async upload(path,bytes){objects.set(path,bytes);return {};},async remove(paths){paths.forEach(p=>objects.delete(p));return {};}};
  f.adapter.storage={from:()=>storage};const media=createMedia(f.adapter,s),visit=owner[0].visits[0];
  const reservation=await media.handle(a,{action:'RESERVE',eventId:f.E,visitId:visit.id,type:'image/jpeg',size:300});
  objects.set(uploadPath,await sharp({create:{width:30,height:20,channels:3,background:'green'}}).jpeg().toBuffer());
  const final=await media.handle(a,{action:'FINALIZE',eventId:f.E,id:reservation.id});assert.equal(final.photo.moderationStatus,'PENDING');
  const recovered=(await s.memorials(a)).items[0];assert.equal(recovered.visits[0].media[0].id,reservation.id,'an uploaded photo remains available after closing the editor before saving');
  assert.equal(recovered.visits[0].photoConsent,false);
  await assert.rejects(media.image(null,reservation.id),e=>e.code==='NOT_FOUND');
  await assert.rejects(media.image(f.account(f.B),reservation.id),e=>e.code==='NOT_FOUND');
  assert.ok((await media.image(a,reservation.id)).length);
  const edits={[visit.id]:{note:'도착 사진',photoConsent:true,mediaIds:[reservation.id]}};
  await s.handle(a,'memorial',{eventId:f.E,revision:1,values:{title:'내 완주',summary:'기록',visibility:'PUBLIC',publishStatus:'PUBLISHED',visitEdits:edits}});
  await assert.rejects(media.image(null,reservation.id),e=>e.code==='NOT_FOUND','consent alone does not bypass moderation');
  await s.operations(a,{action:'PHOTO_REVIEW',eventId:f.E,ownerId:a.id,id:reservation.id,state:'APPROVED'});
  assert.ok((await media.image(null,reservation.id)).length);
  const publicItems=(await s.memorials(null)).items;assert.equal(publicItems.length,1);assert.ok(publicItems.every(m=>m.visits.every(v=>!Object.hasOwn(v,'lat')&&!Object.hasOwn(v,'lng'))));assert.ok(!JSON.stringify(publicItems).includes('accuracy'));
  await assert.rejects(s.handle(f.account(f.B),'memorial',{eventId:f.E,values:{title:'다른 사람 수정',summary:'',visibility:'PUBLIC'}}),e=>e.code==='NOT_FOUND');
  await assert.rejects(s.handle(a,'memorial',{eventId:f.E,revision:1,values:{title:'오래된 편집',summary:'',visibility:'PUBLIC'}}),e=>e.code==='CONFLICT');
  await s.handle(a,'memorial',{eventId:f.E,revision:2,values:{title:'내 완주',summary:'기록',visibility:'PRIVATE'}});
  assert.equal((await s.memorials(null)).items.length,0);
  await assert.rejects(media.image(null,reservation.id),e=>e.code==='NOT_FOUND','withdrawal revokes a previously shared image URL');
  const evidence=await f.db.query('select count(*)::int n from sskr_private.checkin_evidence');assert.equal(evidence.rows[0].n,14);
});
test('photo derivative strips EXIF; SVG and corrupt files are rejected',async()=>{
  const original=await sharp({create:{width:20,height:30,channels:3,background:'red'}}).jpeg().withExif({IFD0:{Artist:'Private GPS owner'}}).toBuffer();
  const safe=await sanitizePhoto(original),meta=await sharp(safe).metadata();assert.equal(meta.format,'webp');assert.equal(meta.exif,undefined);
  await assert.rejects(sanitizePhoto(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"/>')),e=>e.code==='INVALID_PHOTO');
  await assert.rejects(sanitizePhoto(Buffer.from('invalid')),e=>e.code==='INVALID_PHOTO');
});

test('failed photo reservations do not consume visit quota; maintenance cannot remove a ready photo',async t=>{
  const f=await fixture();t.after(()=>f.db.close());const a=f.account(f.A),s=f.service;
  await s.mutate(a,f.E,'TEST_FIXTURE',r=>{r.snapshot.memorial={id:'fixture',ownerUserId:a.id,visits:[{id:'visit'}]};});
  let fail=true;const removed=[];
  f.adapter.storage={from:()=>({createSignedUploadUrl:async()=>fail?{error:Error('offline')}:{data:{signedUrl:'https://fixture.invalid/upload'}},remove:async paths=>{removed.push(...paths);return {};}})};
  const media=createMedia(f.adapter,s);
  for(let i=0;i<6;i++)await assert.rejects(media.handle(a,{action:'RESERVE',eventId:f.E,visitId:'visit',size:100,type:'image/jpeg'}),e=>e.code==='STORAGE_UNAVAILABLE');
  fail=false;const uploaded=await media.handle(a,{action:'RESERVE',eventId:f.E,visitId:'visit',size:100,type:'image/jpeg'});
  await s.mutate(a,f.E,'TEST_FIXTURE',r=>{for(const m of r.snapshot.media)m.createdAt='2020-01-01T00:00:00Z';r.snapshot.media.find(m=>m.id===uploaded.id).status='READY';});
  const inventory=(await f.adapter.rpc('sskr_maintenance')).data;
  assert.equal(inventory.photos.length,6);
  await assert.rejects(media.cleanup(a,{eventId:f.E,id:uploaded.id}),e=>e.code==='PHOTO_CHANGED');
  for(const p of inventory.photos)await media.cleanup(a,p);
  assert.equal(removed.length,12);assert.equal((await f.adapter.rpc('sskr_maintenance')).data.photos.length,0);
});
test('offline replay requires operator evidence review, preserves raw evidence, and cannot waive ordering',async t=>{
  const f=await fixture();t.after(()=>f.db.close());const a=f.account(f.A),s=f.service;
  await f.application(f.A);const o=(await s.handle(a,'payment',{action:'START'})).checkout;
  await s.handle(a,'payment',{action:'CONFIRM',orderId:o.orderId,paymentKey:'k'});
  await s.handle(a,'application',{action:'SAVE_START_LOCATION',startLocationId:'sokcho'});
  f.setNow('2099-10-16T06:20:00+09:00');const place=catalog.find(p=>p.id==='sokcho');
  const body={requestId:randomUUID(),locationId:'sokcho',lat:place.lat,lng:place.lng,accuracy:10,capturedAt:'2099-10-16T06:01:00+09:00'};
  const result=await s.handle(a,'ride',body);assert.equal(result.run.state,'NOT_STARTED');assert.equal(result.run.visits[0].reason,'TIME_REVIEW_REQUIRED');
  await s.handle(a,'ride',body);assert.equal((await s.handle(a,'context')).run.visits.length,1);
  await assert.rejects(s.operations(f.account(f.B),{action:'CHECKIN_REVIEW',ownerId:f.A,id:body.requestId,state:'VALIDATED',note:'허위 권한으로 승인 요청'}),e=>e.code==='FORBIDDEN');
  const raw=await s.operations(a,{action:'CHECKIN_EVIDENCE',ownerId:f.A,id:body.requestId});assert.equal(raw.evidence.lat,body.lat);
  await s.operations(a,{action:'CHECKIN_REVIEW',ownerId:f.A,id:body.requestId,state:'VALIDATED',note:'격리 테스트에서 원본 시각과 현장 근거를 확인함'});
  assert.equal((await s.handle(a,'context')).run.state,'STARTED');
  assert.equal((await s.operations(a,{action:'CHECKIN_EVIDENCE',ownerId:f.A,id:body.requestId})).evidence.validationStatus,'REVIEW_REQUIRED');
  await assert.rejects(f.db.query('update sskr_private.checkin_evidence set document=\'{}\''),/EVENT_HISTORY_IMMUTABLE/);
});
test('financial webhook ignores forged status, unknown orders, replay and reordered delivery',async t=>{
  const f=await fixture();t.after(()=>f.db.close());const a=f.account(f.A),s=f.service;
  await f.application(f.A);const o=(await s.handle(a,'payment',{action:'START'})).checkout;
  await s.webhook({data:{orderId:o.orderId,status:'DONE',totalAmount:10000}});
  assert.equal((await s.handle(a,'context')).participation,null);
  await s.handle(a,'payment',{action:'CONFIRM',orderId:o.orderId,paymentKey:'key'});
  await s.webhook({data:{orderId:o.orderId,status:'CANCELED'}});assert.equal((await s.handle(a,'context')).participation.state,'ACTIVE');
  await s.webhook({data:{orderId:'sskr_'+randomUUID().replaceAll('-',''),status:'DONE'}});
  const before=(await s.handle(a,'context')).participation.id;
  await s.webhook({data:{orderId:o.orderId,status:'READY'}});assert.equal((await s.handle(a,'context')).participation.id,before);
});

test('public notices hide drafts and future publications while operations retains both',async t=>{
  const f=await fixture();t.after(()=>f.db.close());const a=f.account(f.A),s=f.service;
  const snapshot=await s.operations(a,{action:'READ'});
  await s.operations(a,{action:'CONFIGURE',eventId:f.E,revision:snapshot.epoch,commerce:{...f.commerce,notices:[
    {id:'draft',title:'초안',body:'미공개',publishedAt:null},{id:'public',title:'공개 안내',body:'참가자 안내',publishedAt:'2026-01-01T00:00:00Z'},
    {id:'future',title:'예정 공지',body:'예약',publishedAt:'2099-01-01T00:00:00Z'}]}});
  assert.deepEqual((await s.handle(null,'context')).event.notices.map(n=>n.id),['public']);
  assert.equal((await s.operations(a,{action:'READ'})).commerce.notices.length,3);
});


test('memorial catalog photos support old snapshots and preserve event photo overrides',()=>{
  const {publicMemorial}=require('../../server/backend/ride');
  const item={ownerUserId:'owner',places:[{id:'auraji',name:'행사 당시 이름'}],visits:[{id:'visit',locationId:'auraji',role:'SPOT',sequence:1,checkedInAt:'2026-10-16T00:00:00Z',lat:37,lng:127,photoConsent:false,media:[]}]};
  const original=catalog.find(p=>p.id==='auraji');
  const old=publicMemorial(item,null);assert.equal(old.visits[0].placePhoto.url,original.image);assert.equal(old.visits[0].placePhoto.sourceUrl,original.source);assert.equal(old.visits[0].lat,undefined);
  item.places[0]={...item.places[0],image:'https://example.invalid/event.webp',source:'https://example.invalid/source',photoCredit:'행사 사진'};
  const custom=publicMemorial(item,null).visits[0].placePhoto;assert.equal(custom.url,item.places[0].image);assert.equal(custom.credit,'행사 사진');
  item.places[0].image=null;assert.equal(publicMemorial(item,null).visits[0].placePhoto,undefined,'an intentionally removed photo is not restored');
});
