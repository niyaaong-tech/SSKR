const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const vm=require('node:vm');
const root=path.resolve(__dirname,'../..');
const data=require('../../data/fixtures/memorial-event.json');
const catalog=require('../../web/app/spot-catalog');
const {decode,gpx}=require('../../web/app/memorial-journey');
const {collections,sample,filterMemorials}=require('../../web/app/memorial-store');
const routes=data.runSessions.map(run=>JSON.parse(fs.readFileSync(path.join(root,run.trackUrl))));
const distance=(a,b)=>Math.hypot((a[0]-b[0])*88000,(a[1]-b[1])*111000);
test('synthetic event has 200 distinct paid participants and exactly 30 public memorials',()=>{
  assert.equal(data.synthetic,true);assert.equal(data.event.id,'sskr-2026-may');
  assert.match(data.event.startsAt,/2026-05-22T20:00/);
  for(const rows of [data.users,data.applications,data.payments,data.participations]){assert.equal(rows.length,200);assert.equal(new Set(rows.map(x=>x.id)).size,200);}
  assert.equal(data.memorials.length,30);assert.equal(new Set(data.memorials.map(m=>m.ownerUserId)).size,30);
  assert.ok(data.memorials.every(m=>m.publishStatus==='PUBLISHED'&&m.visibility==='PUBLIC'&&m.synthetic));
  const own=collections(data.memorials,{id:'mock-rider-0271',linked:true});assert.equal(own.mine.length,1);assert.equal(own.public.length,29);assert.equal(own.mine[0].runSessionId,data.runSessions[0].id);
  assert.equal(data.participations.filter(p=>p.runDataStatus==='OUTSIDE_FIXTURE_SCOPE'&&p.runResult===null).length,170);
});
test('price snapshots and application-payment-participation relationships reconcile',()=>{
  const users=new Map(data.users.map(x=>[x.id,x])),apps=new Map(data.applications.map(x=>[x.id,x])),payments=new Map(data.payments.map(x=>[x.id,x])),tiers=new Map(data.priceTiers.map(x=>[x.id,x]));
  assert.deepEqual(data.priceTiers.map(t=>[t.label,t.amount,t.quantity]),[['얼리',50000,50],['표준',100000,120],['VIP',200000,30]]);
  for(const p of data.participations){const app=apps.get(p.applicationId),payment=payments.get(p.paymentId),tier=tiers.get(p.priceTierId);assert.ok(users.has(p.userId));assert.equal(app.userId,p.userId);assert.equal(app.eventId,p.eventId);assert.equal(payment.applicationId,app.id);assert.equal(payment.amount,tier.amount);assert.equal(payment.state,'SUCCEEDED');assert.equal(payment.provider,'SYNTHETIC');assert.ok(Date.parse(payment.paidAt)<Date.parse(data.event.startsAt));}
  for(const tier of data.priceTiers)assert.equal(data.participations.filter(p=>p.priceTierId===tier.id).length,tier.quantity);
  assert.equal(data.payments.reduce((n,p)=>n+p.amount,0),20500000);
});
test('30 distinct road journeys use existing five starts, actual catalog spots and the same finish',()=>{
  const locations=new Map(catalog.map(p=>[p.id,p]));assert.equal(new Set(data.memorials.map(m=>m.visitedLocationIds.join(','))).size,30);
  assert.equal(new Set(routes.map(r=>crypto.createHash('sha256').update(r.legs.map(l=>l.shape).join('|')).digest('hex'))).size,30);
  assert.equal(new Set(data.memorials.map(m=>m.startLocationId)).size,5);
  for(const m of data.memorials){assert.equal(locations.get(m.startLocationId).kind,'start');assert.equal(m.finishLocationId,'daecheon');assert.ok(m.visitedLocationIds.every(id=>locations.has(id)));assert.equal(m.spotCount,m.visitedLocationIds.length-2);assert.equal(m.coverLocationId&&m.visitedLocationIds.includes(m.coverLocationId),true);}
});
test('road geometry, checkins, per-vertex timing and totals form continuous feasible journeys',()=>{
  for(const r of routes){
    assert.equal(r.synthetic,true);assert.equal(r.provenance.isRecordedGPS,false);assert.equal(r.provenance.historicalRoadSnapshot,false);assert.equal(r.provenance.request.costing,'motorcycle');assert.equal(r.provenance.request.costing_options.motorcycle.exclude_highways,true);
    assert.equal(r.summary.has_highway,false);assert.equal(r.summary.has_ferry,false);assert.equal(r.summary.has_toll,false);
    assert.equal(r.visits.length,r.legs.length+1);assert.ok(r.sampleCount>5000);assert.ok(Date.parse(r.finishedAt)<=Date.parse(data.event.endsAt));
    assert.equal(r.distanceMeters,r.legs.reduce((n,l)=>n+l.distanceMeters,0));assert.equal(r.movingSeconds,r.legs.reduce((n,l)=>n+l.durationSeconds,0));assert.equal(r.stoppedSeconds,r.visits.reduce((n,c)=>n+c.durationSeconds,0));assert.equal(Date.parse(r.finishedAt)-Date.parse(r.startedAt),r.elapsedSeconds*1000);
    r.legs.forEach((l,i)=>{const coords=decode(l.shape),from=r.visits[i],to=r.visits[i+1];assert.equal(l.fromVisitId,from.id);assert.equal(l.toVisitId,to.id);assert.equal(l.fromLocationId,from.locationId);assert.equal(l.toLocationId,to.locationId);assert.equal(l.startedAt,from.departedAt);assert.equal(l.endedAt,to.arrivedAt);assert.equal(l.elapsedSeconds.length,coords.length);assert.equal(l.elapsedSeconds[0],0);assert.equal(l.elapsedSeconds.at(-1),l.durationSeconds);assert.ok(distance(coords[0],from.coordinate)<5);assert.ok(distance(coords.at(-1),to.coordinate)<5);assert.ok(coords.every(p=>p[0]>126&&p[0]<130&&p[1]>35&&p[1]<39));for(let j=1;j<coords.length;j++){assert.ok(l.elapsedSeconds[j]>=l.elapsedSeconds[j-1]);assert.ok(distance(coords[j-1],coords[j])<3000, 'OSM straight tunnel/road edge must stay bounded');}assert.ok(to.snapDistanceMeters<=1500);assert.equal(to.cumulativeDistanceMeters,from.cumulativeDistanceMeters+l.distanceMeters);});
  }
});
test('public DTO excludes payment details and remains linked to the import fixture',()=>{
  const context={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'web/app/data/memorial-index.js'),'utf8'),context);const dto=context.window.SSKR_MEMORIAL_FIXTURE;
  assert.equal(dto.memorials.length,30);assert.equal(dto.payments,undefined);assert.equal(dto.users,undefined);assert.deepEqual(JSON.parse(JSON.stringify(dto.memorials)),data.memorials);
  for(const m of data.memorials){const run=data.runSessions.find(r=>r.id===m.runSessionId);assert.equal(run.participationId,m.participationId);assert.equal(run.distanceMeters,m.distanceMeters);}
});
test('sampling and discovery preserve privacy, distinct records and place search',()=>{
  const publicItems=collections(data.memorials,{id:'mock-rider-0271',linked:true}).public;
  const chosen=sample(publicItems,6,()=>.3);assert.equal(chosen.length,6);assert.equal(new Set(chosen.map(m=>m.id)).size,6);assert.ok(!chosen.some(m=>m.ownerUserId==='mock-rider-0271'));assert.equal(sample([],6).length,0);
  assert.equal(filterMemorials(data.memorials,{start:'gangneung'},catalog).length,6);
  assert.equal(filterMemorials(data.memorials,{search:'노을 수집가'},catalog).length,1);
  assert.ok(filterMemorials(data.memorials,{search:'말티재'},catalog).length>0);
  assert.equal(filterMemorials(data.memorials,{search:'존재하지않는장소'},catalog).length,0);
  assert.equal(filterMemorials([{...data.memorials[0],visibility:'PRIVATE'}],{},catalog).length,0);
});
test('GPX exports contain route samples, UTC times and explicit synthetic provenance',()=>{
  const r=routes[0],xml=gpx(r,'<테스트 & 기록>');assert.match(xml,/SYNTHETIC TEST DATA/);assert.match(xml,/Not recorded GPS/);assert.match(xml,/&lt;테스트 &amp; 기록&gt;/);assert.equal((xml.match(/<trkpt /g)||[]).length,r.sampleCount);assert.equal((xml.match(/<trkseg>/g)||[]).length,r.legs.length);assert.ok(xml.includes(r.startedAt));assert.ok(xml.includes(r.finishedAt));
});

test('nicknames are unique and all visit counts from three through twelve are represented',()=>{
  assert.equal(new Set(data.users.map(u=>u.displayName)).size,200);
  assert.ok(data.users.every(u=>!u.displayName.includes('테스트 라이더')));
  for(let n=3;n<=12;n++)assert.ok(data.memorials.some(m=>m.spotCount===n));
});
test('unified visits, event locations and media keep relational integrity and mixed photo cases',()=>{
  const {selectPhoto,selectCover}=require('../../web/app/memorial-store');
  const visits=new Map(data.visits.map(v=>[v.id,v])),assets=new Map(data.mediaAssets.map(a=>[a.id,a])),locations=new Map(data.eventLocations.map(p=>[p.id,p]));
  assert.equal(data.schemaVersion,2);
  for(const v of data.visits){assert.equal(locations.get(v.eventLocationId).locationId,v.locationId);assert.equal(locations.get(v.eventLocationId).role,v.role);}
  for(const link of data.visitMedia){const visit=visits.get(link.visitId),asset=assets.get(link.mediaAssetId);assert.equal(asset.locationId,visit.locationId);assert.equal(asset.synthetic,true);assert.equal(asset.originalSourceKind,'PLACE_REFERENCE');}
  let uploaded=0,fallback=0;
  for(const m of data.memorials){
    assert.equal(m.visits.length,m.spotCount+2);assert.equal(m.visits[0].role,'START');assert.equal(m.visits.at(-1).role,'FINISH');
    const cover=selectCover(m.visits);assert.equal(cover.photo.id,m.coverMediaAssetId);assert.equal(cover.visit.locationId,m.coverLocationId);assert.equal(cover.photo.url,m.image);
    const hasUpload=m.visits.some(v=>selectPhoto(v)?.sourceKind==='USER_UPLOAD');
    if(hasUpload){uploaded++;assert.equal(cover.photo.sourceKind,'USER_UPLOAD');assert.ok(m.visits.some(v=>selectPhoto(v)?.sourceKind==='PLACE_REFERENCE'));}else fallback++;
    for(const v of m.visits){assert.ok(visits.has(v.id));for(const a of v.media)assert.equal(a.visibility,'PUBLIC');}
  }
  assert.ok(uploaded>0&&fallback>0);
});
test('photo selection excludes private, pending, rejected and unconsented uploads',()=>{
  const {selectPhoto,selectCover,thumbnailStops}=require('../../web/app/memorial-store');
  const base={id:'place',url:'place.jpg',sourceKind:'PLACE_REFERENCE',status:'READY',moderationStatus:'APPROVED',visibility:'PUBLIC'};
  const upload={...base,id:'upload',url:'rider.jpg',sourceKind:'USER_UPLOAD'};
  for(const change of [{visibility:'PRIVATE'},{status:'PROCESSING'},{moderationStatus:'REJECTED'},{url:''}])assert.equal(selectPhoto({media:[{...upload,...change}],placePhoto:base}).id,'place');
  assert.equal(selectPhoto({media:[upload],placePhoto:base}).id,'upload');
  assert.equal(selectPhoto({media:[upload],photoConsent:false,placePhoto:base}).id,'place');
  assert.equal(selectPhoto({media:[],placePhoto:null}),null);assert.equal(selectCover([]),null);
  for(const m of data.memorials){const chain=thumbnailStops(m.visits);assert.equal(chain.length,5);assert.equal(chain[0].role,'START');assert.equal(chain.at(-1).role,'FINISH');assert.equal(chain.filter(v=>v.role==='SPOT').length,3);for(let i=1;i<chain.length;i++)assert.ok(chain[i].sequence>chain[i-1].sequence);}
});
test('mobile map cards fill complete bottom rows and only the top row may be partial',()=>{
  const {cardSlots}=require('../../web/shared/map/map');
  for(let count=1;count<=12;count++){
    const slots=cardSlots(count,true),rows=Math.ceil(count/4);
    assert.equal(new Set(slots.map(p=>p.row+':'+p.column)).size,count);
    assert.ok(slots.every(p=>p.row>=1&&p.row<=3&&p.column>=1&&p.column<=4));
    for(let row=1;row<=rows;row++)assert.equal(slots.filter(p=>p.row===row).length,row===1?(count%4||4):4);
  }
});
