'use strict';
const { mode, config, BackendError } = require('./config');
const { json, fail, readBody, sameOrigin } = require('./http');
const auth = require('./auth');
const { routes } = require('./routes');
const { context } = require('./context');
const eventService = require('./events');
const { workflows } = require('./workflows');
const {serviceDb}=require('./service-db');
const {createMedia}=require('./media');
function createHandler({ readMode = mode, getConfig = config, authService = auth, readPublished = eventService.readPublished, getWorkflows = workflows, getFieldTests = cfg => require('./field-tests').createFieldTests({db:serviceDb(cfg)}), workflowEnabled = () => !!process.env.SUPABASE_SECRET_KEY } = {}) {
return async function handler(req, res) {
  try {
    const url = new URL(req.url, 'http://localhost');
    const resource = req.query?.resource || url.searchParams.get('resource');
    if (resource === 'runtime' && req.method === 'GET') return json(res, 200, { ok: true, mode: readMode() });
    const cfg = getConfig();
    if (cfg.mode !== 'supabase') throw new BackendError('BACKEND_NOT_ENABLED', '실제 서버 연결 전입니다.', 503);
    if (resource === 'event' && req.method === 'GET') return json(res, 200, { ok: true, event: context(null, new Date(), await readPublished(cfg)).event });
    if (resource === 'callback' && req.method === 'GET') return await authService.callback(req, res, cfg, url);
    if(resource==='payment-webhook'&&req.method==='POST') {
      try{return json(res,200,await getWorkflows(cfg).webhook(await readBody(req)));}
      catch{return json(res,503,{ok:false,error:{code:'PAYMENT_RETRY_REQUIRED',userMessage:'결제 결과 확인을 다시 시도해 주세요.'}});}
    }
    if(resource==='photo'&&req.method==='GET') {
      const current=await authService.actor(req,res,cfg,false),db=serviceDb(cfg);
      const bytes=await createMedia(db,getWorkflows(cfg)).image(current?.account,url.searchParams.get('id'));
      res.writeHead(200,{'Content-Type':'image/webp','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'});return res.end(bytes);
    }
    const mutation = !['GET', 'HEAD'].includes(req.method);
    if (mutation) sameOrigin(req, cfg);
    const body = mutation ? await readBody(req) : {};
    if(resource==='field-tests') {
      if(cfg.participationMode!=='test')throw new BackendError('NOT_FOUND','요청한 기능을 찾을 수 없습니다.',404);
      if(req.method!=='POST')throw new BackendError('METHOD_NOT_ALLOWED','POST 요청만 지원합니다.',405);
      const current=await authService.actor(req,res,cfg);
      return json(res,200,await getFieldTests(cfg).handle(current.account,body));
    }
    if (resource === 'login' && req.method === 'POST') return json(res, 200, await authService.login(req, res, cfg, body));
    if (resource === 'logout' && req.method === 'POST') { await authService.logout(req, res, cfg); return json(res, 200, { ok: true }); }
    if(resource==='profile'&&req.method==='POST'){
      const current=await authService.actor(req,res,cfg),account=await require('./profile').saveProfile(current,body);
      return json(res,200,workflowEnabled()?await getWorkflows(cfg).handle(account,'context'):context(account,new Date(),await readPublished(cfg,current.db)));
    }
    if(resource==='media'&&req.method==='POST') {
      const current=await authService.actor(req,res,cfg);return json(res,200,await createMedia(serviceDb(cfg),getWorkflows(cfg)).handle(current.account,body));
    }
    if (resource === 'context' && ['POST', 'GET'].includes(req.method)) {
      const current = await authService.actor(req, res, cfg, false);
      if(workflowEnabled())return json(res,200,await getWorkflows(cfg).handle(current?.account,'context'));
      return json(res, 200, context(current?.account, new Date(), await readPublished(cfg, current?.db)));
    }
    if(['application','checkout','payment','operations','ride','memorial','memorials','refund'].includes(resource)) {
      if(resource!=='memorials'&&req.method!=='POST')throw new BackendError('METHOD_NOT_ALLOWED','POST 요청만 지원합니다.',405);
      const current=await authService.actor(req,res,cfg,resource!=='memorials');
      const service=getWorkflows(cfg);
      const data=resource==='operations'?await service.operations(current.account,body):resource==='memorials'?await service.memorials(current?.account):await service.handle(current.account,resource,body);
      return json(res,200,data);
    }
    if (resource === 'events') {
      const current = await authService.actor(req, res, cfg);
      const data = await eventService.events(current, req, body, url);
      return json(res, 200, { ok: true, ...data }, data.revision ? { ETag: `"${data.revision}"` } : {});
    }
    if (resource === 'routes') {
      const current = await authService.actor(req, res, cfg);
      const data = await routes(current, req, body, url);
      return json(res, 200, { ok: true, ...data }, data.revision ? { ETag: `"${data.revision}"` } : {});
    }
    throw new BackendError('NOT_FOUND', '요청한 기능을 찾을 수 없습니다.', 404);
  } catch (error) { fail(res, error); }
};
}
const handler = createHandler();
async function participate(req, res, endpoint) {
  if (!['context','application','checkout','payment'].includes(endpoint)) return json(res,404,{ok:false,error:{code:'NOT_FOUND',userMessage:'요청한 기능을 찾을 수 없습니다.'}});
  req.query = { ...req.query, resource: endpoint };
  return handler(req, res);
}
module.exports = { handler, participate, createHandler };
