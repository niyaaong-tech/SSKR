'use strict';
const { BackendError } = require('./config');
const messages = {
  AUTH_REQUIRED: [401, '다시 로그인해 주세요. 작성 내용은 유지됩니다.'],
  EVENT_CHANGED: [409, '행사 설정이 변경되었습니다. 입력한 내용은 유지했습니다. 최신 일정을 확인한 뒤 다시 저장해 주세요.'],
  EVENT_START_UNAVAILABLE: [422, '현재 행사에서 선택할 수 없는 출발지입니다. 기존 루트는 유지했습니다. 출발지를 변경한 뒤 저장해 주세요.'],
  ROUTE_NOT_FOUND: [404, '저장한 루트를 찾을 수 없습니다.'],
  REVISION_REQUIRED: [428, '저장된 버전을 확인한 뒤 다시 시도해 주세요.'],
  REVISION_CONFLICT: [412, '다른 화면에서 이 루트가 변경되었습니다. 현재 편집본을 유지했습니다. 저장 목록에서 최신 버전을 확인해 주세요.'],
  ROUTE_LIMIT_REACHED: [409, '저장 가능한 루트 수를 채웠습니다. 기존 루트를 삭제한 뒤 다시 저장해 주세요.'],
  IDEMPOTENCY_REQUIRED: [400, '저장 요청 식별자가 필요합니다.'],
  IDEMPOTENCY_CONFLICT: [409, '이전 저장 요청과 내용이 다릅니다. 저장 목록을 확인해 주세요.'],
  INVALID_PLAN: [400, '루트 입력값을 확인해 주세요.'],
  INVALID_REFERENCE: [422, '더 이상 사용할 수 없는 스팟이 있습니다. 표시된 스팟을 수정해 주세요.'],
  CATALOG_CHANGED: [409, '스팟·도로 정보가 변경되었습니다. 편집본을 보관한 뒤 페이지를 새로 열어 주세요.'],
  INVALID_SCHEDULE: [400, '출발 시각과 휴게시간(0–1440분)을 확인해 주세요.']
};
function revision(header) {
  if (header === undefined) return null;
  if (!/^"[1-9][0-9]{0,14}"$/.test(header)) throw new BackendError('INVALID_REVISION', '저장 버전 형식이 올바르지 않습니다.');
  return Number(header.slice(1, -1));
}
async function routes(actor, req, body, url) {
  const action = ({ GET: 'list', POST: 'save', PUT: 'save', PATCH: 'schedule', DELETE: 'delete' })[req.method];
  if (!action) throw new BackendError('METHOD_NOT_ALLOWED', '지원하지 않는 요청입니다.', 405);
  const id = url.searchParams.get('id');
  if (id && !/^[\da-f]{8}(-[\da-f]{4}){3}-[\da-f]{12}$/i.test(id)) throw new BackendError('ROUTE_NOT_FOUND', '루트를 찾을 수 없습니다.', 404);
  if ((req.method === 'POST' && id) || (['PUT', 'PATCH', 'DELETE'].includes(req.method) && !id)) throw new BackendError('INVALID_PLAN', '저장 대상을 확인해 주세요.');
  const { data, error } = await actor.db.rpc('sskr_routes', { p_action: action, p_id: id, p_plan: body.plan || null, p_schedule: body.schedule || null, p_revision: revision(req.headers['if-match']), p_key: req.headers['idempotency-key'] || null });
  if (error) {
    const known = messages[error.message];
    if (known) throw new BackendError(error.message, known[1], known[0]);
    throw new BackendError('ROUTE_STORAGE_UNAVAILABLE', '저장 서버에 연결하지 못했습니다. 작성 내용은 유지됩니다.', 503);
  }
  return data;
}
module.exports = { routes, revision };
