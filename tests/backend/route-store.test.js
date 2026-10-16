const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm'), fs = require('node:fs');
test('a late list cannot erase a committed save or leak the previous account cache',async()=>{
  let responder, release;
  const root={SSKR_BACKEND:{request:(...args)=>responder(...args)}};
  vm.runInNewContext(fs.readFileSync('web/app/route-store.js','utf8'),{window:root});
  const store=root.SSKR_REMOTE_ROUTES,account={id:'a',linked:true};
  responder=async()=>({routes:[],maxSavedRoutes:10});await store.refresh(account);
  responder=()=>new Promise(resolve=>{release=resolve;});const pending=store.refresh(account);
  responder=async(resource,method,body,headers)=>{assert.equal(method,'POST');assert.equal(headers['Idempotency-Key'],'request-1');return {plan:{id:'r1',title:'루트 01',updatedAt:'2026-10-16'},schedule:body.schedule,revision:1};};
  await store.save({id:null},account,{key:'request-1',schedule:{},revision:null});
  release({routes:[],maxSavedRoutes:10});await pending;
  assert.equal(store.list(account).length,1);
  responder=()=>new Promise(resolve=>{release=resolve;});const old=store.refresh(account);
  store.clear();release({routes:[{plan:{id:'private'}}],maxSavedRoutes:10});await old;
  assert.throws(()=>store.list({id:'b',linked:true}));
});
