(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SSKR_CHECKIN_RULES = Object.freeze(api);
})(typeof globalThis !== 'undefined' ? globalThis : this, () => {
  'use strict';
  const DEFAULT_MINIMUM_SPOT_CHECKINS = 10;
  function minimumSpotCheckins(event = {}) {
    const value = event?.minimumSpotCheckins ?? DEFAULT_MINIMUM_SPOT_CHECKINS;
    if (!Number.isSafeInteger(value) || value < 1) throw new Error('행사의 최소 경유 스팟 수는 1 이상의 정수여야 합니다.');
    return value;
  }
  // Count accepted check-ins only. This checks the count requirement, not GPS,
  // sunrise/sunset or participation eligibility. Simulated evidence is fixture-only.
  function checkinRequirement(event, visits, { startId, finishId } = {}) {
    const minimum = minimumSpotCheckins(event);
    const accepted = (visits || []).filter(v => v.validationStatus === 'VALIDATED' || event?.synthetic === true && v.validationStatus === 'SIMULATED');
    // The caller supplies visits in journey order. Only count between the valid
    // start and first matching finish; later edits/visits cannot create completion.
    const startIndex = startId ? accepted.findIndex(v => v.role === 'START' && v.locationId === startId) : -1;
    const finishIndex = startIndex >= 0 && finishId ? accepted.findIndex((v,i) => i > startIndex && v.role === 'FINISH' && v.locationId === finishId) : -1;
    const between = startIndex >= 0 ? accepted.slice(startIndex + 1,finishIndex >= 0 ? finishIndex : undefined) : [];
    const spots = new Set(between.filter(v => v.role === 'SPOT' && v.locationId && v.locationId !== startId && v.locationId !== finishId).map(v => v.locationId));
    const hasStart = startIndex >= 0, hasFinish = finishIndex >= 0;
    return { minimumSpotCheckins: minimum, spotCount: spots.size, totalCheckins: spots.size + Number(hasStart) + Number(hasFinish), hasStart, hasFinish, met: hasStart && hasFinish && spots.size >= minimum };
  }
  return { DEFAULT_MINIMUM_SPOT_CHECKINS, minimumSpotCheckins, checkinRequirement };
});
