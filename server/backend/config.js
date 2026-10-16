'use strict';
class BackendError extends Error {
  constructor(code, message, status = 400) { super(message); this.code = code; this.status = status; }
}
function mode(env = process.env) {
  const value = env.SSKR_BACKEND_MODE || (env.VERCEL ? 'supabase' : 'mock');
  if (!['mock', 'supabase'].includes(value)) throw new BackendError('BACKEND_CONFIG', '서버 설정을 확인하고 있습니다.', 503);
  return value;
}
function config(env = process.env) {
  const backendMode = mode(env);
  if (backendMode === 'mock') return { mode: backendMode };
  const { SUPABASE_URL: url, SUPABASE_PUBLISHABLE_KEY: key, SSKR_SESSION_SECRET: secret, SSKR_APP_ORIGIN: origin } = env;
  if (!url || !key || !secret || Buffer.from(secret, 'base64').length !== 32 || !origin) throw new BackendError('BACKEND_CONFIG', '서버 연결을 준비하고 있습니다. 잠시 후 다시 시도해 주세요.', 503);
  const target = new URL(origin);
  if (target.origin !== origin || (target.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(target.hostname))) throw new BackendError('BACKEND_CONFIG', '서버 주소 설정을 확인하고 있습니다.', 503);
  if (new URL(url).protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(new URL(url).hostname)) throw new BackendError('BACKEND_CONFIG', '인증 서버 설정을 확인하고 있습니다.', 503);
  const participationMode=env.SSKR_PARTICIPATION_MODE||'paid';
  if(!['paid','test'].includes(participationMode))throw new BackendError('BACKEND_CONFIG','참가 설정을 확인하고 있습니다.',503);
  return { mode: backendMode, url, key, secret, origin, participationMode, secure: target.protocol === 'https:' };
}
module.exports = { BackendError, mode, config };
