const { CAPACITY_POOL, REGISTRATION_TIER } = require("./constants");

const toTime = (value) => value ? new Date(value).getTime() : null;
const displayAmount = (amount) => new Intl.NumberFormat("ko-KR").format(amount) + "원";

function capacitySnapshot(event = {}) {
  const policy = event.capacityPolicy || {};
  const baseCapacity = Math.max(0, Number(policy.baseCapacity || 0));
  const platinumExtraCapacity = Math.max(0, Number(policy.platinumExtraCapacity || 0));
  const baseUsed = Math.max(0, Number(policy.baseUsed || 0));
  const platinumExtraUsed = Math.max(0, Number(policy.platinumExtraUsed || 0));
  return {
    baseCapacity,
    platinumExtraCapacity,
    baseUsed,
    platinumExtraUsed,
    baseRemaining: Math.max(0, baseCapacity - baseUsed),
    platinumExtraRemaining: Math.max(0, platinumExtraCapacity - platinumExtraUsed)
  };
}

function status(code, label, selectable = false) { return { code, label, selectable }; }

function resolveTier(price, event, now, capacity) {
  const current = new Date(now).getTime();
  const starts = toTime(price.salesStartAt);
  const ends = toTime(price.salesEndAt);
  let availability;

  if (!price.isActive || (price.code === REGISTRATION_TIER.EARLY && event.earlyAccessEnabled === false)) availability = status("INACTIVE", "운영하지 않음");
  else if (starts && current < starts) availability = status("UPCOMING", "판매 예정");
  else if (ends && current > ends) availability = status("ENDED", "판매 종료");
  else if (price.code === REGISTRATION_TIER.EARLY && Number(price.entryCount || 0) >= Number(price.entryLimit || 0)) availability = status("ENTRY_LIMIT_REACHED", "선착순 마감");
  else if ([REGISTRATION_TIER.EARLY, REGISTRATION_TIER.STANDARD].includes(price.code) && capacity.baseRemaining <= 0) availability = status("BASE_CAPACITY_FULL", "기본 정원 마감");
  else if (price.code === REGISTRATION_TIER.PLATINUM && capacity.baseRemaining + capacity.platinumExtraRemaining <= 0) availability = status("CAPACITY_FULL", "플래티넘 정원 마감");
  else availability = status("AVAILABLE", "신청 가능", true);

  const remaining = price.code === REGISTRATION_TIER.EARLY
    ? Math.min(capacity.baseRemaining, Math.max(0, Number(price.entryLimit || 0) - Number(price.entryCount || 0)))
    : price.code === REGISTRATION_TIER.STANDARD
      ? capacity.baseRemaining
      : capacity.baseRemaining + capacity.platinumExtraRemaining;

  return {
    id: price.id,
    code: price.code,
    displayName: price.displayName,
    amount: price.amount,
    currency: price.currency,
    displayAmount: displayAmount(price.amount),
    salesStartAt: price.salesStartAt,
    salesEndAt: price.salesEndAt,
    benefits: price.benefits || [],
    availability,
    remaining,
    capacityPool: capacity.baseRemaining > 0 ? CAPACITY_POOL.BASE : CAPACITY_POOL.PLATINUM_EXTRA
  };
}

function resolveRegistrationTiers({ event, priceTiers = [], now = new Date() }) {
  const capacity = capacitySnapshot(event);
  const order = { EARLY: 1, STANDARD: 2, PLATINUM: 3 };
  const tiers = priceTiers.map((price) => resolveTier(price, event, now, capacity)).sort((a, b) => (order[a.code] || 99) - (order[b.code] || 99));
  return { capacity, tiers };
}

function findResolvedTier(context, priceTierId) {
  return resolveRegistrationTiers(context).tiers.find((tier) => tier.id === priceTierId) || null;
}

module.exports = { capacitySnapshot, findResolvedTier, resolveRegistrationTiers };
