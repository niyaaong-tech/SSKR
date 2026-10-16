'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),zlib=require('node:zlib');
const {create,decode,expandShape}=require('../../web/app/route-provider');
const base=require('../../web/shared/routes/manifest.json'),extra=require('../../web/shared/routes/gps/manifest.json');
test('published GPS road supplement has all directional legs and exact shared access points',()=>{
  assert.equal(extra.parentVersion,base.version);let count=0;
  for(const id of extra.placeIds){
    if(base.accessPoints[id])assert.deepEqual(extra.accessPoints[id],base.accessPoints[id]);
    const row=JSON.parse(zlib.gunzipSync(fs.readFileSync('web/shared/routes/gps/legs/'+id+'.json.gz')));assert.equal(row.version,extra.version);
    for(const target of extra.placeIds){if(id===target)continue;const i=extra.placeIds.indexOf(id),j=extra.placeIds.indexOf(target);assert.ok(extra.distances[i][j]>0);assert.ok(extra.durations[i][j]>0);assert.ok(decode(expandShape(row.legs,target)).length>=2);count++;}
  }assert.equal(count,5550);
});
test('mixed routes preserve normal metrics and connect every extra place in both directions',async()=>{
  const provider=create({supplement:'/web/shared/routes/gps',fetcher:async url=>{const b=fs.readFileSync('.'+url);return {ok:true,json:async()=>JSON.parse(b),arrayBuffer:async()=>b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength)};}});await provider.ready();
  for(const id of extra.placeIds){assert.ok(provider.summary('sokcho',id));assert.ok(provider.summary(id,'daecheon'));}
  const plan=await provider.route(['test-start-ori','test-walk-01','auraji','test-walk-30']);assert.equal(plan.valid,true);assert.ok(plan.distanceMeters>0);assert.equal(plan.legs.length,3);
  const a=base.placeIds.indexOf('sokcho'),b=base.placeIds.indexOf('auraji');assert.equal(provider.summary('sokcho','auraji').distanceMeters,base.distances[a][b]);
});
