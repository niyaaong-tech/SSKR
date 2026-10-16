'use strict';
const { BackendError } = require('./config');
function json(res, status, body, headers = {}) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...headers });
  res.end(JSON.stringify(body));
}
function fail(res, error) {
  const known = error instanceof BackendError;
  json(res, known ? error.status : 503, { ok: false, error: { code: known ? error.code : 'BACKEND_UNAVAILABLE', userMessage: known ? error.message : '서버에 연결하지 못했습니다. 작성 내용은 유지됩니다. 잠시 후 다시 시도해 주세요.' },...(known&&error.context?{context:error.context}:{}) });
}
function sameOrigin(req, cfg) {
  if (req.headers.origin !== cfg.origin || req.headers['x-sskr-request'] !== '1' || (req.headers['sec-fetch-site'] && !['same-origin', 'none'].includes(req.headers['sec-fetch-site']))) throw new BackendError('INVALID_ORIGIN', '페이지를 새로 열고 다시 시도해 주세요.', 403);
  if (!(req.headers['content-type'] || '').startsWith('application/json')) throw new BackendError('INVALID_CONTENT_TYPE', 'JSON 요청이 필요합니다.', 415);
}
async function readBody(req) {
  const parse = text => { try { const value=JSON.parse(text); if (!value || typeof value !== 'object' || Array.isArray(value)) throw Error(); return value; } catch { throw new BackendError('INVALID_JSON', '요청 형식을 확인해 주세요.'); } };
  if (req.body !== undefined) {
    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    if (Buffer.byteLength(body) > 65536) throw new BackendError('PAYLOAD_TOO_LARGE', '요청이 너무 큽니다.', 413);
    return parse(body);
  }
  let body = '', length = 0;
  for await (const chunk of req) { length += chunk.length; if (length > 65536) throw new BackendError('PAYLOAD_TOO_LARGE', '요청이 너무 큽니다.', 413); body += chunk; }
  return body ? parse(body) : {};
}
function safeReturn(value) {
  if (typeof value !== 'string' || value.includes('\\') || /[\x00-\x20]/.test(value)) return '/app/spots?mode=plan';
  const url = new URL(value, 'https://sskr.invalid');
  if (url.origin !== 'https://sskr.invalid' || !/^\/(app(?:\/|$)|participate(?:\/|$))/.test(url.pathname)) return '/app/spots?mode=plan';
  ['scenario', 'mockAccount', 'mockSession', 'mockControls', 'authError'].forEach(key => url.searchParams.delete(key));
  return url.pathname + url.search + url.hash;
}
module.exports = { json, fail, sameOrigin, readBody, safeReturn };
