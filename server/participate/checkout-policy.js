const { APPLICATION, CAPACITY, CLOSE_REASON, PARTICIPATION, REGISTRATION, SLOT_ALLOCATION } = require("./constants");
const { findResolvedTier } = require("./tier-policy");

function evaluateCheckoutEligibility({ application, event, participation, price, priceTiers, user, now = new Date() }) {
  const deny = (code, message, closeApplication = true) => ({
    allowed: false,
    slotTarget: SLOT_ALLOCATION.NONE,
    closeApplication,
    reason: { code, message },
    warnings: []
  });

  if (!event) return deny(CLOSE_REASON.EVENT_UNAVAILABLE, "현재 신청 가능한 이벤트가 없습니다.");
  if (user?.blocked === true) return deny("USER_BLOCKED", "현재 계정으로는 새로운 결제를 진행할 수 없습니다.", false);
  if (participation?.state === PARTICIPATION.ACTIVE) return deny("PARTICIPATION_ALREADY_ACTIVE", "이미 현재 이벤트 참가권을 보유하고 있습니다.", false);
  if (!application || ![APPLICATION.DRAFT, APPLICATION.SUBMITTED].includes(application.state)) {
    return deny("APPLICATION_NOT_PAYABLE", "결제를 진행할 수 있는 신청 상태가 아닙니다.", false);
  }
  if (event.registrationState === REGISTRATION.CLOSED) return deny(CLOSE_REASON.REGISTRATION_CLOSED, "신청 접수가 종료되었습니다.");
  if (event.registrationState === REGISTRATION.SUSPENDED) return deny(CLOSE_REASON.REGISTRATION_SUSPENDED, "신청 접수가 일시 중단되었습니다.", false);
  if (event.registrationState !== REGISTRATION.OPEN) return deny(CLOSE_REASON.EVENT_UNAVAILABLE, "아직 신청을 시작할 수 없습니다.", false);
  const selectedPrice = price || (priceTiers || []).find((item) => item.id === application.priceTierId);
  if (!selectedPrice?.isActive) {
    const result = deny("PRICE_TIER_UNAVAILABLE", "현재 적용 가능한 참가비를 확인할 수 없습니다.", false);
    result.warnings.push({ code: "ACTIVE_PRICE_TIER_MISSING", severity: "ERROR", detail: "활성 Price Tier가 없습니다." });
    return result;
  }

  if (event.capacityPolicy && priceTiers) {
    const tier = findResolvedTier({ event, priceTiers, now }, application.priceTierId);
    if (!tier) return deny("REGISTRATION_TIER_REQUIRED", "참가 유형을 다시 선택해 주세요.", false);
    if (!tier.availability.selectable) return deny(tier.availability.code, `${tier.displayName}은 현재 ${tier.availability.label} 상태입니다.`, false);
    return { allowed: true, slotTarget: SLOT_ALLOCATION.CONFIRMED, capacityPool: tier.capacityPool, tier, closeApplication: false, reason: null, warnings: [] };
  }

  if (event.capacityState === CAPACITY.FULL && !event.waitlistEnabled) return deny(CLOSE_REASON.CAPACITY_FULL, "모집 정원이 모두 찼습니다.");

  return {
    allowed: true,
    slotTarget: event.capacityState === CAPACITY.FULL ? SLOT_ALLOCATION.WAITLISTED : SLOT_ALLOCATION.CONFIRMED,
    capacityPool: null,
    tier: null,
    closeApplication: false,
    reason: null,
    warnings: []
  };
}

module.exports = { evaluateCheckoutEligibility };
