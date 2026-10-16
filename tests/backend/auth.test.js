const { test } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { config, mode } = require('../../server/backend/config');
const { seal, unseal, setSession, actor, callback } = require('../../server/backend/auth');
const { sameOrigin, safeReturn } = require('../../server/backend/http');
const { revision } = require('../../server/backend/routes');
const { login } = require('../../server/backend/auth');
const { createHandler, participate } = require('../../server/backend/handler');
const cfg = { secret: crypto.randomBytes(32).toString('base64'), secure: true, origin: 'https://sskr.example' };
test('cookies are encrypted, purpose bound, tamper resistant and expiring', () => {
  const token = seal({ refresh_token: 'private-token' }, cfg, 'session', 10000);
  assert.equal(token.includes('private-token'), false);
  assert.deepEqual(unseal(token, cfg, 'session'), { refresh_token: 'private-token' });
  assert.equal(unseal(token, cfg, 'pkce'), null);
  assert.equal(unseal(token.slice(0, 30) + 'xyz' + token.slice(33), cfg, 'session'), null);
  assert.equal(unseal(seal({}, cfg, 'session', -1), cfg, 'session'), null);
  const headers = new Map(), response = { getHeader: key => headers.get(key), setHeader: (key, value) => headers.set(key, value) };
  setSession(response, cfg, { access_token: 'a'.repeat(3000), refresh_token: 'b', expires_at: 10 });
  const cookies = headers.get('Set-Cookie'); assert.equal(cookies.length, 3);
  for (const cookie of cookies) { assert.match(cookie, /HttpOnly; SameSite=Lax/); assert.match(cookie, /Secure/); assert.ok(cookie.length < 4096); }
});
test('mode cannot silently fall back, and redirect/CSRF/revision checks reject forged values', () => {
  assert.equal(mode({}), 'mock'); assert.equal(mode({VERCEL:'1'}),'supabase'); assert.throws(()=>config({VERCEL:'1'}),/서버 연결/); assert.throws(() => config({ SSKR_BACKEND_MODE: 'supabase' }), /서버 연결/);
  assert.throws(() => mode({ SSKR_BACKEND_MODE: 'typo' }));
  assert.equal(safeReturn('//evil.example/path'), '/app/spots?mode=plan');
  assert.equal(safeReturn('/app/spots?mode=plan&scenario=active'), '/app/spots?mode=plan');
  assert.equal(safeReturn('/app/spots?mode=plan&authError=cancelled'), '/app/spots?mode=plan');
  assert.throws(() => sameOrigin({ headers: { origin: 'https://evil.example', 'x-sskr-request': '1' } }, cfg));
  assert.doesNotThrow(() => sameOrigin({ headers: { origin: cfg.origin, 'x-sskr-request': '1', 'content-type': 'application/json' } }, cfg));
  assert.equal(revision('"12"'), 12); assert.throws(() => revision('*')); assert.throws(() => revision('W/"2"'));
});
test('rejected users and revoked or blocked sessions clear cookies while transient errors preserve them',async()=>{
  const settings={...cfg,url:'https://test-project.supabase.co',key:'sb_publishable_test'};
  const token=seal({access_token:'test-access',refresh_token:'test-refresh',expires_at:Date.now()/1000+3600},settings,'session',3600000);
  for(const scenario of ['user','session','network']){
    const res=response();
    const createAuthClient=()=>({auth:{getUser:async()=>scenario==='user'?{data:{},error:{status:401}}:scenario==='network'?{data:{},error:{status:503}}:{data:{user:{id:'fixture',user_metadata:{}}},error:null}},rpc:async()=>({error:{message:'AUTH_REQUIRED'}})});
    await assert.rejects(actor({headers:{cookie:'__Host-sskr_session_0='+token}},res,settings,false,{createAuthClient}),error=>error.status===(scenario==='network'?503:401));
    if(scenario==='network')assert.equal(res.headers['Set-Cookie'],undefined);
    else {assert.equal(res.headers['Set-Cookie'].length,3);assert.ok(res.headers['Set-Cookie'].every(value=>value.includes('Max-Age=0')));}
  }
});
test('callback cancellations and failed exchanges preserve the original destination and clear PKCE state',async()=>{
  const settings={...cfg,url:'https://test-project.supabase.co',key:'sb_publishable_test'};
  const flow=seal({stored:{},nonce:'fixture-nonce',returnTo:'/participate?view=guide'},settings,'pkce',600000);
  for(const scenario of ['cancelled','expired']){
    const res=response();
    const url=new URL('/api/backend?resource=callback&nonce=fixture-nonce'+(scenario==='expired'?'&code=expired-code':''),settings.origin);
    await callback({headers:{cookie:'__Host-sskr_pkce='+flow}},res,settings,url,{createAuthClient:()=>({auth:{exchangeCodeForSession:async()=>({data:{},error:{status:400}})}})});
    assert.equal(res.status,303);assert.equal(res.headers.Location,'/participate?view=guide&authError='+scenario);
    assert.match(res.headers['Set-Cookie'][0],/^__Host-sskr_pkce=;.*Max-Age=0/);
  }
});
test('Google authorization uses PKCE and keeps the verifier in an HttpOnly cookie', async () => {
  const settings={...cfg,url:'https://test-project.supabase.co',key:'sb_publishable_test'};
  const headers=new Map(),res={getHeader:key=>headers.get(key),setHeader:(key,value)=>headers.set(key,value)};
  const result=await login({},res,settings,{returnTo:'/app/spots?mode=plan&scenario=active'}, {fetchImpl:async()=>({ok:true,json:async()=>({external:{google:true}})})});
  const url=new URL(result.url);assert.equal(url.searchParams.get('provider'),'google');
  assert.equal(url.searchParams.get('code_challenge_method'),'s256');
  assert.ok(url.searchParams.get('code_challenge'));
  const value=headers.get('Set-Cookie')[0].split(';')[0].split('=')[1];
  const flow=unseal(value,settings,'pkce');assert.equal(flow.returnTo,'/app/spots?mode=plan');
  assert.ok(Object.keys(flow.stored).some(key=>key.endsWith('code-verifier')));
  assert.match(url.searchParams.get('redirect_to'),/resource=callback&nonce=/);
  assert.match(headers.get('Set-Cookie')[0],/^__Host-sskr_pkce=/);
});
test('unconfigured OAuth stays on the current page without creating a flow cookie',async()=>{
  const res={setHeader(){throw new Error('must not set a cookie');}};
  const settings={...cfg,url:'https://test-project.supabase.co',key:'sb_publishable_test'};
  await assert.rejects(login({},res,settings,{}, {fetchImpl:async()=>({ok:true,json:async()=>({external:{google:false}})})}),error=>error.code==='LOGIN_NOT_CONFIGURED' && error.status===503);
  await assert.rejects(login({},res,settings,{}, {fetchImpl:async()=>{throw new Error('offline');}}),error=>error.code==='LOGIN_UNAVAILABLE');
});
function response() {return {headers:{},status:null,body:null,getHeader(key){return this.headers[key];},setHeader(key,value){this.headers[key]=value;},writeHead(status,headers){this.status=status;Object.assign(this.headers,headers);},end(body){this.body=body?JSON.parse(body):null;}};}
test('live configuration errors and disabled mock endpoints never disclose fixture accounts',async()=>{
  const handler=createHandler({readMode:()=> 'supabase',getConfig:()=>config({SSKR_BACKEND_MODE:'supabase'})});
  const runtime=response();await handler({url:'/api/backend?resource=runtime',method:'GET',headers:{}},runtime);assert.equal(runtime.body.mode,'supabase');
  const context=response();await handler({url:'/api/backend?resource=context',method:'POST',headers:{},body:{scenario:'active',account:{linked:true,id:'forged'}}},context);
  assert.equal(context.status,503);assert.equal(context.body.error.code,'BACKEND_CONFIG');assert.equal(context.body.account,undefined);assert.equal(context.body.mockSnapshot,undefined);
  for(const endpoint of ['mock','payment','application','checkout']) {const res=response();await participate({},res,endpoint);assert.ok([404,503].includes(res.status));assert.equal(res.body.mockSnapshot,undefined);}
});
