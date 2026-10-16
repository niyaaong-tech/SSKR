'use strict';
const { BackendError } = require('./config');
const { client } = require('./auth');
const { revision } = require('./routes');
const catalog = require('../../web/app/spot-catalog');
const solar = require('../../web/shared/solar-times');
const fieldPlaces = require('../data/field-test-places.json').records;
const normalById = new Map(catalog.map(place => [place.id, place]));
const keys = ['publicTitle', 'editionLabel', 'description', 'timezone', 'eventStartAt', 'eventEndAt', 'applicationOpenAt', 'applicationCloseAt', 'minimumSpotCheckins', 'startLocationIds', 'finishLocationId', 'sunlight', 'coreConfirmedAt', 'spotsConfirmedAt','isTest','timeMode'];
const messages = {
  AUTH_REQUIRED: [401, '로그인한 뒤 다시 시도해 주세요.'],
  FORBIDDEN: [403, '행사 관리 권한이 없습니다.'],
  EVENT_NOT_FOUND: [404, '행사 초안을 찾을 수 없습니다.'],
  REVISION_REQUIRED: [428, '행사 초안의 저장 버전을 확인해 주세요.'],
  REVISION_CONFLICT: [412, '다른 화면에서 행사 설정이 변경되었습니다. 입력한 내용은 유지했습니다. 최신 초안을 확인해 주세요.'],
  INVALID_EVENT: [400, '행사 제목·일정·스팟 설정을 확인해 주세요.'],
  SUNLIGHT_REVIEW_REQUIRED: [422, '행사 날짜와 출발지에 맞는 일출·일몰 시각을 검토한 뒤 공개해 주세요.']
};
function errorFrom(error) {
  const known = messages[error?.message];
  return known ? new BackendError(error.message, known[1], known[0]) : new BackendError('EVENT_STORAGE_UNAVAILABLE', '행사 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.', 503);
}
const invalid = () => { throw new BackendError('INVALID_EVENT', messages.INVALID_EVENT[1]); };
const timestamp = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})$/.test(value) && Number.isFinite(Date.parse(value));
function documentFor(input, available=fieldPlaces) {
  const byId=new Map([...catalog,...available].map(place=>[place.id,place]));
  if (!input || typeof input !== 'object' || Array.isArray(input)) invalid();
  const doc = Object.fromEntries(keys.filter(key => Object.hasOwn(input, key)).map(key => [key, input[key]]));
  for (const [key, max] of [['publicTitle', 120], ['editionLabel', 80], ['description', 4000]]) {
    if (doc[key] !== undefined && (typeof doc[key] !== 'string' || doc[key].length > max)) invalid();
    if (typeof doc[key] === 'string') doc[key] = doc[key].trim();
  }
  doc.timezone ??= 'Asia/Seoul'; doc.minimumSpotCheckins ??= 10; doc.finishLocationId ??= 'daecheon'; doc.startLocationIds ??= [];
  if (doc.timezone !== 'Asia/Seoul' || (doc.isTest ? doc.finishLocationId!=='daecheon'&&!available.some(p=>p.id===doc.finishLocationId&&p.kind==='spot') : doc.finishLocationId !== 'daecheon') || !Number.isInteger(doc.minimumSpotCheckins) || doc.minimumSpotCheckins < 1 || doc.minimumSpotCheckins > 200) invalid();
  if (!Array.isArray(doc.startLocationIds) || new Set(doc.startLocationIds).size !== doc.startLocationIds.length || doc.startLocationIds.some(id => !(doc.isTest ? byId.get(id)?.kind==='start'||available.some(p=>p.id===id&&p.startEligible) : normalById.get(id)?.kind === 'start'))) invalid();
  for (const key of ['eventStartAt', 'eventEndAt', 'applicationOpenAt', 'applicationCloseAt', 'coreConfirmedAt', 'spotsConfirmedAt']) {
    if (doc[key] === '') doc[key] = null;
    if (doc[key] != null && !timestamp(doc[key])) invalid();
  }
  if (doc.eventStartAt && doc.eventEndAt && (Date.parse(doc.eventStartAt) >= Date.parse(doc.eventEndAt) || solar.dateKey(doc.eventStartAt) !== solar.dateKey(doc.eventEndAt))) invalid();
  if (doc.applicationOpenAt && doc.applicationCloseAt && Date.parse(doc.applicationOpenAt) >= Date.parse(doc.applicationCloseAt)) invalid();
  if(doc.isTest!=null&&typeof doc.isTest!=='boolean')invalid();
  if(doc.timeMode==='MANUAL'&&doc.isTest!==true)invalid();
  if(doc.timeMode && !['SOLAR','MANUAL'].includes(doc.timeMode)) invalid();
  if(doc.timeMode==='MANUAL') doc.sunlight=null;
  if (doc.sunlight != null) {
    const light = doc.sunlight;
    if (!light || typeof light !== 'object' || Array.isArray(light) || light.verification !== 'REVIEWED' || !Array.isArray(light.starts)) invalid();
    let source; try { source = new URL(light.sourceUrl); } catch { invalid(); }
    if (source.protocol !== 'https:' || source.username || source.password || typeof light.calculationVersion !== 'string' || !light.calculationVersion.trim() || light.calculationVersion.length > 120) invalid();
    const point = (item, timeKey) => {
      if (!item || typeof item !== 'object') invalid();
      return { locationId: item.locationId, lat: item.lat, lng: item.lng, [timeKey]: item[timeKey] };
    };
    doc.sunlight = { eventId: 'draft', configVersion: 1, date: light.date, timezone: light.timezone, verification: 'REVIEWED', sourceUrl: source.href, calculationVersion: light.calculationVersion.trim(), starts: light.starts.map(p => point(p, 'sunriseAt')), finish: point(light.finish, 'sunsetAt') };
    const ids = doc.sunlight.starts.map(p => p.locationId);
    if (!doc.startLocationIds.length || ids.length !== doc.startLocationIds.length || new Set(ids).size !== ids.length || ids.some(id => !doc.startLocationIds.includes(id))) invalid();
    const event = { ...doc, id: 'draft', configVersion: 1 };
    for (const id of doc.startLocationIds) if (solar.windowFor(event, byId.get(id), byId.get(doc.finishLocationId)).state !== 'REVIEWED') throw errorFrom({ message: 'SUNLIGHT_REVIEW_REQUIRED' });
  }
  return doc;
}
async function readPublished(cfg, db = client(cfg)) {
  const { data, error } = await db.rpc('sskr_public_event');
  if (error) throw errorFrom(error);
  return data;
}
async function events(actor, req, body, url) {
  const id = url.searchParams.get('id');
  if (id && !/^[\da-f]{8}(-[\da-f]{4}){3}-[\da-f]{12}$/i.test(id)) throw errorFrom({ message: 'EVENT_NOT_FOUND' });
  const publish = req.method === 'POST' && url.searchParams.get('action') === 'publish';
  const action = req.method === 'GET' ? 'list' : publish ? 'publish' : ['POST', 'PUT'].includes(req.method) ? 'save' : null;
  if (!action) throw new BackendError('METHOD_NOT_ALLOWED', '지원하지 않는 요청입니다.', 405);
  if ((publish || req.method === 'PUT') && !id || req.method === 'POST' && !publish && id || req.method === 'GET' && id) invalid();
  let available=fieldPlaces;
  if(action==='save'&&body.document?.isTest===true){const options=await actor.db.rpc('sskr_event_place_options');if(options.error)throw errorFrom(options.error);available=options.data;}
  const { data, error } = await actor.db.rpc('sskr_events', { p_action: action, p_id: id, p_document: action === 'save' ? documentFor(body.document,available) : null, p_revision: revision(req.headers['if-match']) });
  if (error) throw errorFrom(error);
  if(action==='list'){const options=await actor.db.rpc('sskr_event_place_options');if(options.error)throw errorFrom(options.error);data.placeOptions=options.data;}
  return data;
}
module.exports = { documentFor, readPublished, events };
