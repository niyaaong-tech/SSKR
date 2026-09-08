const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname,'..');
const places = require('../web/explore/places.js');
test('36 unique places: five east-coast starts, thirty spots, Daecheon finish',()=>{
  assert.equal(places.length,36);assert.equal(new Set(places.map(p=>p.id)).size,36);
  assert.equal(places.filter(p=>p.kind==='start').length,5);
  assert.equal(places.filter(p=>p.kind==='spot').length,30);
  assert.deepEqual(places.filter(p=>p.kind==='finish').map(p=>p.id),['daecheon']);
});
test('place content has coordinates, photo, source and visitor guidance',()=>{
  for(const p of places){
    assert.ok(p.lat>35&&p.lat<38,p.id);assert.ok(p.lng>126&&p.lng<130,p.id);
    for(const k of ['name','region','lead','description','note','photoCredit'])assert.ok(p[k]?.length,p.id+' '+k);
    assert.equal(new URL(p.image).protocol,'https:');assert.equal(new URL(p.source).protocol,'https:');
    assert.ok(['north','central','south','west'].includes(p.corridor));
  }
});
test('both HOME gateways and production/local route entries exist',()=>{
  const home=fs.readFileSync(path.join(root,'web/home/index.html'),'utf8');
  assert.ok((home.match(/href="\/explore\/"/g)||[]).length>=2);
  const rewrites=JSON.parse(fs.readFileSync(path.join(root,'vercel.json'),'utf8')).rewrites;
  for(const route of ['/explore','/explore/'])assert.ok(rewrites.some(x=>x.source===route&&x.destination==='/web/explore/index.html'));
  const server=fs.readFileSync(path.join(root,'server/dev-server.js'),'utf8');assert.ok(server.includes('"/explore/": "web/explore/index.html"'));
});
