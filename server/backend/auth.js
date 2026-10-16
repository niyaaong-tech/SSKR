'use strict';
const { randomBytes, createCipheriv, createDecipheriv } = require('node:crypto');
const { createClient } = require('@supabase/supabase-js');
const { BackendError } = require('./config');
const { safeReturn } = require('./http');
const prefix = cfg => cfg.secure ? '__Host-sskr_session_' : 'sskr_session_';
const pkceName = cfg => cfg.secure ? '__Host-sskr_pkce' : 'sskr_pkce';
function seal(value, cfg, purpose, ttl) {
  const iv = randomBytes(12), cipher = createCipheriv('aes-256-gcm', Buffer.from(cfg.secret, 'base64'), iv);
  cipher.setAAD(Buffer.from(purpose + ':' + cfg.origin));
  const encrypted = Buffer.concat([cipher.update(JSON.stringify({ value, expires: Date.now() + ttl }), 'utf8'), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString('base64url');
}
function unseal(value, cfg, purpose) {
  try {
    const bytes = Buffer.from(value || '', 'base64url'), decipher = createDecipheriv('aes-256-gcm', Buffer.from(cfg.secret, 'base64'), bytes.subarray(0, 12));
    decipher.setAAD(Buffer.from(purpose + ':' + cfg.origin)); decipher.setAuthTag(bytes.subarray(12, 28));
    const data = JSON.parse(Buffer.concat([decipher.update(bytes.subarray(28)), decipher.final()]).toString());
    return data.expires > Date.now() ? data.value : null;
  } catch { return null; }
}
function cookies(req) { return Object.fromEntries((req.headers.cookie || '').split(';').map(v => v.trim().split(/=(.*)/s).slice(0, 2)).filter(v => v.length === 2)); }
function cookie(res, cfg, name, value, seconds) {
  const existing = res.getHeader('Set-Cookie') || [];
  res.setHeader('Set-Cookie', [...(Array.isArray(existing) ? existing : [existing]), `${name}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${seconds}${cfg.secure ? '; Secure' : ''}`]);
}
function setSession(res, cfg, session) {
  const value = session ? seal({ access_token: session.access_token, refresh_token: session.refresh_token, expires_at: session.expires_at }, cfg, 'session', 30 * 86400000) : '';
  if (value.length > 10500) throw new BackendError('SESSION_TOO_LARGE', '로그인 세션을 저장하지 못했습니다.', 503);
  for (let i = 0; i < 3; i++) cookie(res, cfg, prefix(cfg) + i, value.slice(i * 3500, (i + 1) * 3500), session && value.length > i * 3500 ? 30 * 86400 : 0);
}
function client(cfg, token, storage) {
  return createClient(cfg.url, cfg.key, { auth: { autoRefreshToken: false, persistSession: Boolean(storage), detectSessionInUrl: false, flowType: 'pkce', ...(storage ? { storage } : {}) }, ...(token ? { global: { headers: { Authorization: `Bearer ${token}` } } } : {}) });
}
async function actor(req, res, cfg, required = true, { createAuthClient = client } = {}) {
  const all = cookies(req), raw = [0, 1, 2].map(i => all[prefix(cfg) + i] || '').join('');
  let session = unseal(raw, cfg, 'session');
  if (!session) { if (raw) setSession(res, cfg, null); if (required || raw) throw new BackendError('AUTH_REQUIRED', '다시 로그인해 주세요. 작성 내용은 유지됩니다.', 401); return null; }
  let api = createAuthClient(cfg);
  if (!session.expires_at || session.expires_at < Date.now() / 1000 + 45) {
    const refreshed = await api.auth.refreshSession({ refresh_token: session.refresh_token });
    if (refreshed.error || !refreshed.data.session) {
      if (refreshed.error?.status >= 500 || refreshed.error?.name === 'AuthRetryableFetchError') throw new BackendError('AUTH_UNAVAILABLE', '인증 서버에 연결하지 못했습니다.', 503);
      setSession(res, cfg, null); throw new BackendError('AUTH_REQUIRED', '다시 로그인해 주세요. 작성 내용은 유지됩니다.', 401);
    }
    session = refreshed.data.session; setSession(res, cfg, session);
  }
  const { data, error } = await api.auth.getUser(session.access_token);
  if (error?.status >= 500 || error?.name === 'AuthRetryableFetchError') throw new BackendError('AUTH_UNAVAILABLE', '인증 서버에 연결하지 못했습니다.', 503);
  if (error || !data.user) { setSession(res, cfg, null); throw new BackendError('AUTH_REQUIRED', '다시 로그인해 주세요. 작성 내용은 유지됩니다.', 401); }
  api = createAuthClient(cfg, session.access_token);
  const checked = await api.rpc('sskr_actor');
  if (checked.error) {
    const invalid = checked.error.message === 'AUTH_REQUIRED';
    if (invalid) setSession(res, cfg, null);
    throw new BackendError(invalid ? 'AUTH_REQUIRED' : 'AUTH_UNAVAILABLE', '로그인 상태를 확인하지 못했습니다.', invalid ? 401 : 503);
  }
  const user = data.user;
  const profile=await api.rpc('sskr_profile');
  if(profile.error)throw new BackendError('PROFILE_UNAVAILABLE','계정 연락처를 불러오지 못했습니다.',503);
  return { id: user.id, db: api, token: session.access_token, account: { linked: true, id: user.id, provider: 'google',profileRevision:profile.data?.revision||0, profile: { name: String(user.user_metadata?.full_name || 'SSKR 라이더').slice(0, 100), email: user.email || '',...(profile.data?.profile||{}) } } };
}
async function login(req, res, cfg, body, { fetchImpl = fetch } = {}) {
  // signInWithOAuth only constructs a URL. Verify the provider first so an
  // unconfigured project never sends the user away from their current draft.
  let settings;
  try {
    const response = await fetchImpl(`${cfg.url}/auth/v1/settings`, {
      headers: { apikey: cfg.key }, signal: AbortSignal.timeout(5000)
    });
    if (!response.ok) throw new Error('Auth settings unavailable');
    settings = await response.json();
  } catch { throw new BackendError('LOGIN_UNAVAILABLE', '로그인 서버에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.', 503); }
  if (settings.external?.google !== true) throw new BackendError('LOGIN_NOT_CONFIGURED', 'Google 로그인 연결을 준비하고 있습니다. 작성 중인 루트는 이 탭에 유지됩니다.', 503);
  const stored = {}, storage = { getItem: key => stored[key] || null, setItem: (key, value) => { stored[key] = value; }, removeItem: key => { delete stored[key]; } };
  const nonce = randomBytes(24).toString('base64url');
  const result = await client(cfg, null, storage).auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${cfg.origin}/api/backend?resource=callback&nonce=${nonce}`, skipBrowserRedirect: true } });
  if (result.error || !result.data.url) throw new BackendError('LOGIN_UNAVAILABLE', 'Google 로그인을 시작하지 못했습니다.', 503);
  cookie(res, cfg, pkceName(cfg), seal({ stored, nonce, returnTo: safeReturn(body.returnTo) }, cfg, 'pkce', 600000), 600);
  return { ok: true, url: result.data.url };
}
async function callback(req, res, cfg, url, { createAuthClient = client } = {}) {
  const flow = unseal(cookies(req)[pkceName(cfg)], cfg, 'pkce');
  cookie(res, cfg, pkceName(cfg), '', 0);
  let target = flow?.returnTo || '/app/spots?mode=plan';
  if (!flow || flow.nonce !== url.searchParams.get('nonce') || !url.searchParams.get('code')) {
    const destination = new URL(target, cfg.origin); destination.searchParams.set('authError', 'cancelled');
    res.writeHead(303, { Location: destination.pathname + destination.search, 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' }); return res.end();
  }
  const storage = { getItem: key => flow.stored[key] || null, setItem: (key, value) => { flow.stored[key] = value; }, removeItem: key => { delete flow.stored[key]; } };
  const result = await createAuthClient(cfg, null, storage).auth.exchangeCodeForSession(url.searchParams.get('code'));
  if (result.error || !result.data.session) { const destination = new URL(target, cfg.origin); destination.searchParams.set('authError', 'expired'); target = destination.pathname + destination.search; }
  else setSession(res, cfg, result.data.session);
  res.writeHead(303, { Location: target, 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' }); res.end();
}
async function logout(req, res, cfg) {
  let current;
  try { current = await actor(req, res, cfg, false); } catch (error) { if (error.status !== 401) throw error; }
  if (current) {
    const result = await client(cfg).auth.admin.signOut(current.token, 'local');
    if (result.error && ![401, 403, 404].includes(result.error.status)) throw new BackendError('LOGOUT_FAILED', '로그아웃하지 못했습니다. 다시 시도해 주세요.', 503);
  }
  setSession(res, cfg, null);
}
module.exports = { seal, unseal, setSession, actor, login, callback, logout, client };
