'use strict';
const { createClient } = require('@supabase/supabase-js');
const { BackendError } = require('./config');
function serviceDb(cfg, env = process.env) {
  if (!env.SUPABASE_SECRET_KEY) throw new BackendError('SERVICE_NOT_CONFIGURED', '서비스 연결을 준비하고 있습니다.', 503);
  return createClient(cfg.url, env.SUPABASE_SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
}
async function call(db, action, actor = null, event = null, data = {}, version = null, id = null) {
  const { data: result, error } = await db.rpc('sskr_workflow', { p_action: action, p_actor: actor, p_event: event, p_data: data, p_version: version, p_id: id });
  if (error) {
    const known = { CONFLICT: [409,'다른 요청으로 정보가 바뀌었습니다. 다시 확인해 주세요.'], FORBIDDEN:[403,'운영 권한이 없습니다.'], NOT_FOUND:[404,'기록을 찾을 수 없습니다.'], CAPACITY_FULL:[409,'모집 정원이 찼습니다.'], INVALID_INPUT:[400,'입력 내용을 확인해 주세요.'] }[error.message];
    if (known) throw new BackendError(error.message, known[1], known[0]);
    throw new BackendError('SERVICE_STORAGE_UNAVAILABLE','저장하지 못했습니다. 입력을 유지한 채 다시 시도해 주세요.',503);
  }
  return result;
}
module.exports = { serviceDb, call };
