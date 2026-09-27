const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),{gunzipSync}=require('node:zlib');
const catalog=require('../../web/app/spot-catalog');
const domain=require('../../web/app/route-plan'),{create,expandShape}=require('../../web/app/route-provider');
const base=path.resolve(__dirname,'../../web/shared/routes');
const read=name=>JSON.parse(fs.readFileSync(path.join(base,name),'utf8'));
const fetcher=async url=>{const bytes=fs.readFileSync(path.join(base,url.replace('/routes/','')));return new Response(bytes,{status:200});};

test('published road rows and directed matrix describe the same catalog and graph',()=>{
 const manifest=read('manifest.json'),validation=read('validation.json');
 assert.equal(manifest.version,validation.version);assert.equal(manifest.dataFileSuffix,'.json.gz');
 assert.deepEqual(manifest.placeIds,catalog.map(p=>p.id));
 assert.match(manifest.source.sha256,/^[a-f0-9]{64}$/);assert.match(manifest.source.snapshot,/^20\d\d-/);
 assert.equal(manifest.license,'ODbL-1.0');assert.equal(manifest.accessPolicy.minReachableEdges,50);
 let count=0;
 for(let i=0;i<catalog.length;i++){
  const place=catalog[i],access=manifest.accessPoints[place.id];
  assert.ok(access);if(access.status==='ready'){assert.ok(access.wayId>0);assert.ok(access.snapDistanceMeters<=manifest.accessPolicy.maxSnapMeters);}
  if(place.kind==='finish')continue;
  const row=JSON.parse(gunzipSync(fs.readFileSync(path.join(base,'legs',place.id+'.json.gz'))));
  assert.equal(row.version,manifest.version);assert.equal(row.fromId,place.id);
  for(let j=0;j<catalog.length;j++){
   const target=catalog[j];if(target.kind==='start'||i===j)continue;
   const metric=manifest.distances[i][j],leg=row.legs[target.id];
   if(metric===null){assert.equal(leg,undefined);assert.ok(validation.unavailable[place.id][target.id]);}
   else{assert.ok(metric>=0);assert.ok(manifest.durations[i][j]>=0);assert.ok(expandShape(row.legs,target.id).length>8);count++;}
  }
 }
 assert.equal(count,validation.routeCount);assert.ok(count>18000,'Most catalog pairs must connect through verified roads');
});

test('all ten starts produce ten connected real-road stops with continuous access endpoints',async()=>{
 const provider=create({base:'/routes',fetcher});await provider.ready();
 for(const start of catalog.filter(p=>p.kind==='start')){
  const plan=domain.autoFill({...domain.createEmpty(catalog),startId:start.id},catalog,provider);
  assert.equal(plan.stopIds.length,10,start.id);assert.equal(new Set(plan.stopIds).size,10);
  assert.equal(domain.status(plan,catalog,provider).complete,true,start.id);
  const route=await provider.route(domain.orderedIds(plan));assert.equal(route.valid,true,start.id);
  assert.equal(route.legs.length,11);assert.ok(route.distanceMeters>100000&&route.distanceMeters<1000000);
  for(const leg of route.legs){
   assert.ok(leg.coordinates.length>2,'Road geometry must not be a straight substitute');
   for(const [id,coordinate] of [[leg.fromId,leg.coordinates[0]],[leg.toId,leg.coordinates.at(-1)]]){
    const access=provider.accessPoint(id);
    assert.ok(Math.hypot((coordinate[0]-access.lat)*111000,(coordinate[1]-access.lng)*90000)<60,id+' route endpoint');
   }
  }
 }
});

test('places without a confirmed road approach remain explicitly unavailable',async()=>{
 const provider=create({base:'/routes',fetcher});await provider.ready();
 const unresolved=catalog.filter(p=>provider.accessPoint(p.id)?.status==='unavailable');
 assert.ok(unresolved.length>0);
 for(const p of unresolved){
  const result=await provider.route(['gangneung',p.id,'daecheon']);
  assert.equal(result.valid,false);assert.equal(result.distanceMeters,null);
  assert.ok(result.legs.every(leg=>leg.status==='unavailable'&&leg.coordinates.length===0));
 }
});
