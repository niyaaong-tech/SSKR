'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {distance}=require('../../server/backend/ride');
const catalog=require('../../server/data/field-test-places.json').records;
test('GPS catalog adds 65 spots and five start roles with at least 50m walking separation',()=>{
  assert.equal(catalog.length,68);
  for(const [group,n] of [['walk',30],['bus110a',20],['bus520',15]])assert.equal(catalog.filter(p=>p.group===group).length,n);
  assert.equal(catalog.filter(p=>p.startEligible).length,5);
  const walk=catalog.filter(p=>p.group==='walk');for(let i=0;i<walk.length;i++)for(const p of walk.slice(i+1))assert.ok(distance(walk[i],p)>=50);
  for(const p of catalog)assert.ok(p.testOnly&&p.source&&p.coordinateBasis&&Number.isFinite(p.lat)&&Number.isFinite(p.lng));
  assert.equal(require('../../web/app/spot-catalog').filter(p=>p.testOnly).length,0);
});
test('retired field-test BFF is unavailable in every participation mode',async()=>{
  const {createHandler}=require('../../server/backend/handler');
  async function request(participationMode,account){let status,result;const handler=createHandler({getConfig:()=>({mode:'supabase',origin:'https://test.invalid',participationMode}),authService:{actor:async()=>({account})}});
    await handler({method:'POST',url:'https://test.invalid/api/backend?resource=field-tests',headers:{origin:'https://test.invalid','content-type':'application/json','x-sskr-request':'1'},body:{action:'LIST'}},{writeHead:s=>status=s,end:b=>result=JSON.parse(b)});return {status,result};}
  assert.equal((await request('paid',{id:'00000000-0000-4000-8000-000000000001'})).status,404);assert.equal((await request('test',null)).status,404);
});
