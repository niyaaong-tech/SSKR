const test=require('node:test');
const assert=require('node:assert/strict');
const base=require('../../web/explore/places.js');
const catalog=require('../../web/app/spot-catalog.js');
const {filterPlaces,clusterPlaces}=require('../../web/app/spots.js');
const all={kind:'all',category:'all',search:''};
test('APP catalog has 150 parking-backed spots, eleven starts and one finish without duplicate IDs',()=>{
 assert.equal(catalog.length,162);assert.equal(new Set(catalog.map(p=>p.id)).size,162);
 assert.equal(catalog.filter(p=>p.kind==='spot').length,150);
 assert.equal(catalog.filter(p=>p.kind==='start').length,11);
 assert.equal(catalog.filter(p=>p.kind==='finish').length,1);
 assert.ok(catalog.filter(p=>p.riderCafe).length>0);
 assert.ok(catalog.filter(p=>p.category==='food').length>0);
 for(const p of catalog){assert.ok(p.lat>33&&p.lat<39);assert.ok(p.lng>125&&p.lng<131);assert.match(p.source,/^https?:/);assert.ok(['cafe','food','nature','culture'].includes(p.category),p.id);}
 for(const p of catalog.filter(p=>p.kind==='spot')){
  assert.ok(p.parking,p.id);assert.equal(p.lat,p.parking.lat);assert.equal(p.lng,p.parking.lng);
  assert.match(p.parking.osm,/^https:\/\/www\.openstreetmap\.org\/(?:node|way)\/\d+$/);
  assert.ok(p.parking.distanceToPlaceMeters<=750,p.id);
  assert.ok(!p.region.startsWith('서울')&&!p.region.startsWith('경기'),p.id);
 }
 assert.ok(catalog.some(p=>p.id==='sokcho'&&p.kind==='start'));
});
test('removed source spots remain available as legacy memorial references',()=>{
 assert.equal(base.length,42);
 const legacy=globalThis.SSKR_SPOT_LEGACY||[];
 for(const p of base){const copy=catalog.find(x=>x.id===p.id)||legacy.find(x=>x.id===p.id);assert.ok(copy,p.id);for(const key of ['id','kind','name','region','lead','description','source'])assert.deepEqual(copy[key],p[key],p.id+': '+key);}
});
test('parking points are separated by at least two kilometers, including starts and finish',()=>{
 const radians=Math.PI/180;
 for(let i=0;i<catalog.length;i++)for(let j=i+1;j<catalog.length;j++){
  const a=catalog[i],b=catalog[j],lat=(a.lat-b.lat)*radians,lng=(a.lng-b.lng)*radians;
  const km=12742*Math.asin(Math.sqrt(Math.sin(lat/2)**2+Math.cos(a.lat*radians)*Math.cos(b.lat*radians)*Math.sin(lng/2)**2));
  assert.ok(km>=2,`${a.id} / ${b.id}: ${km.toFixed(3)}km`);
 }
});
test('active catalog has real photos, local WebP files and no corridor fields',()=>{
 const fs=require('node:fs'),path=require('node:path'),curation=require('../../web/app/spot-curation');
 for(const p of catalog){
  assert.ok(!('corridor' in p),p.id);assert.ok(p.image,p.id);assert.ok(p.photoCredit,p.id);
  if(p.image.startsWith('/')){assert.match(p.image,/\.webp$/);assert.ok(fs.statSync(path.resolve(__dirname,'../..',p.image.slice(1))).size>1000,p.id);}
  if(curation.photosById[p.id]){assert.equal(p.reuseStatus,'verified');assert.equal(p.photoKind,'PLACE_PHOTO');assert.match(p.photoSource,/^https:\/\/commons.wikimedia.org\/wiki\//);assert.ok(p.photoLicense);assert.ok(p.photoChanges);}
 }
});
test('saved routes retain retired IDs and require explicit repair',()=>{
 const domain=require('../../web/app/route-plan'),retired='donghae-market';
 const plan=domain.normalize({...domain.createEmpty(catalog),startId:'gangneung',stopIds:[retired]},catalog);
 assert.deepEqual(plan.stopIds,[retired]);assert.ok(domain.status(plan,catalog).issues.some(issue=>issue.code==='INVALID_STOP'&&issue.placeId===retired));
 assert.ok(globalThis.SSKR_SPOT_LEGACY.some(p=>p.id===retired));
});
test('search ignores whitespace and combines category with place-name or region search',()=>{
 assert.equal(filterPlaces(catalog,{...all,search:'더로드1423'})[0].id,'the-road-1423');
 const results=filterPlaces(catalog,{...all,category:'food',search:'충남'});assert.ok(results.length>0);assert.ok(results.every(p=>p.category==='food'&&p.region.includes('충남')));
 assert.equal(filterPlaces(catalog,{...all,search:'존재하지않는장소xyz'}).length,0);
 assert.equal(filterPlaces(catalog,{...all,kind:'start'}).length,11);
});
test('clusters retain every point and keep selected point separate',()=>{
 const points=[{id:'a'},{id:'b'},{id:'c'}];const groups=clusterPlaces(points,()=>({x:10,y:10}),50,'b');
 assert.equal(groups.length,2);assert.equal(groups.flat().length,3);assert.ok(groups.some(g=>g.length===1&&g[0].id==='b'));
});
