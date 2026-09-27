const test=require('node:test');
const assert=require('node:assert/strict');
const base=require('../../web/explore/places.js');
const catalog=require('../../web/app/spot-catalog.js');
const {filterPlaces,clusterPlaces}=require('../../web/app/spots.js');
const all={kind:'all',category:'all',corridor:'all',search:''};
test('APP catalog has 150 parking-backed spots, eleven starts and one finish without duplicate IDs',()=>{
 assert.equal(catalog.length,162);assert.equal(new Set(catalog.map(p=>p.id)).size,162);
 assert.equal(catalog.filter(p=>p.kind==='spot').length,150);
 assert.equal(catalog.filter(p=>p.kind==='start').length,11);
 assert.equal(catalog.filter(p=>p.kind==='finish').length,1);
 assert.ok(catalog.filter(p=>p.riderCafe).length>0);
 assert.equal(catalog.filter(p=>p.category==='food').length,23);
 for(const p of catalog){assert.ok(p.lat>33&&p.lat<39);assert.ok(p.lng>125&&p.lng<131);assert.match(p.source,/^https?:/);}
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
 for(const p of base){const copy=catalog.find(x=>x.id===p.id)||legacy.find(x=>x.id===p.id);assert.ok(copy,p.id);for(const key of Object.keys(p)){if(copy.parking&&['lat','lng','coordinateAccuracy'].includes(key))continue;assert.deepEqual(copy[key],p[key],p.id+': '+key);}}
});
test('search ignores whitespace and combines category and region filters',()=>{
 assert.equal(filterPlaces(catalog,{...all,search:'더로드1423'})[0].id,'the-road-1423');
 const results=filterPlaces(catalog,{...all,category:'food',corridor:'west'});assert.ok(results.length>0);assert.ok(results.every(p=>p.category==='food'&&p.corridor==='west'));
 assert.equal(filterPlaces(catalog,{...all,search:'존재하지않는장소xyz'}).length,0);
 assert.equal(filterPlaces(catalog,{...all,kind:'start'}).length,11);
});
test('clusters retain every point and keep selected point separate',()=>{
 const points=[{id:'a'},{id:'b'},{id:'c'}];const groups=clusterPlaces(points,()=>({x:10,y:10}),50,'b');
 assert.equal(groups.length,2);assert.equal(groups.flat().length,3);assert.ok(groups.some(g=>g.length===1&&g[0].id==='b'));
});
