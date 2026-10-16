'use strict';
const { resolveEventStage } = require('../participate/event-stage-resolver');
const { dateRange } = require('../participate/dto');
// No operational dates, prices, participants or notices are borrowed from mock fixtures.
function context(account, now = new Date(), published = null) {
  const value = {
    ok: true, backend: 'supabase', generatedAt: now.toISOString(),
    account: account || { linked: false, provider: null },
    event: { id: null, published: false, configVersion: null, publicTitle: 'SSKR', editionLabel: '', category: '', description: '다음 행사 일정은 준비가 끝나면 안내해 드립니다.', applicationPeriodDisplay: '안내 예정', eventDateDisplay: '안내 예정', capacityDisplay: '안내 예정', capacityNote: '', timezone: 'Asia/Seoul', minimumSpotCheckins: 10, resolvedStage: 'PREPARING', registrationState: 'NOT_OPEN', registrationLabel: '일정 안내 예정', startLocationIds: [], finishLocationId: 'daecheon', finishLocationName: '대천해수욕장' },
    application: null, checkoutHold: null, payment: { state: 'NOT_STARTED' }, paymentAttempts: [], participation: null, pastParticipations: [],
    price: null, tiers: [], capacity: null, agreementDocuments: [],
    surface: { mode: 'MODE_A', variant: 'NOT_OPEN', title: 'SSKR 참가 안내', primaryAction: { code: 'NONE', label: '일정 안내 예정', enabled: false } },
    permissions: { canOpenSpotGuide: true, canOpenMemorial: false, canStartCheckout: false, canOpenPreparation: false },
    statuses: { bikeInfoComplete: false, fulfillmentState: 'NOT_STARTED', runResult: 'NOT_STARTED' },
    warnings: [], services: [], manager: null
  };
  if (published) {
    const allowed = ['id', 'configVersion', 'publicTitle', 'editionLabel', 'description', 'timezone', 'eventStartAt', 'eventEndAt', 'applicationOpenAt', 'applicationCloseAt', 'minimumSpotCheckins', 'startLocationIds', 'finishLocationId', 'sunlight', 'publishedAt', 'coreConfirmedAt', 'spotsConfirmedAt','isTest','timeMode','placeCatalog','catalogVersion','routingVersion'];
    const event = Object.fromEntries(allowed.filter(key => Object.hasOwn(published, key)).map(key => [key, published[key]]));
    event.coreConfirmedAt ||= event.publishedAt;
    Object.assign(value.event, event, { published: true, visibility: 'PUBLIC', sunlightMode: 'REVIEWED', resolvedStage: resolveEventStage(event, now).stage, eventDateDisplay: dateRange(event.eventStartAt, event.eventEndAt, event.timezone), applicationPeriodDisplay: dateRange(event.applicationOpenAt, event.applicationCloseAt, event.timezone), registrationState: 'NOT_OPEN', registrationLabel: '참가 접수 준비 중' });
    // Publishing event information does not open the unimplemented checkout flow.
    value.surface.primaryAction.label = '참가 접수 준비 중';
  }
  return value;
}
module.exports = { context };
