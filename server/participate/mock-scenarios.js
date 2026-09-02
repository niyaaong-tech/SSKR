const {
  APPLICATION,
  CAPACITY,
  CAPACITY_POOL,
  CHECKOUT_HOLD,
  EVENT_STAGE,
  FULFILLMENT,
  PARTICIPATION,
  PAYMENT,
  REGISTRATION,
  REGISTRATION_TIER,
  RUN_RESULT,
  SLOT_ALLOCATION
} = require("./constants");
const { getAgreementDefinitions } = require("./agreement-policy");
const { clone } = require("./mock-repository");

const baseEvent = {
  id: "sskr-2027",
  seriesId: "sskr",
  seasonYear: 2027,
  name: "SUNRISE SUNSET KOREAN RALLY 2027",
  publicTitle: "SSKR 2027",
  editionLabel: "2027 SEASON",
  category: "대한민국 대표 모터사이클 로드 랠리",
  description: "아름다운 라이딩 코스와 스팟을 연결하며\n다양한 미션을 수행하는 로드 랠리 이벤트",
  timezone: "Asia/Seoul",
  eventStartAt: "2027-06-14T06:00:00+09:00",
  eventEndAt: "2027-06-15T21:00:00+09:00",
  coreConfirmedAt: "2026-08-01T09:00:00+09:00",
  spotsConfirmedAt: "2026-08-15T09:00:00+09:00",
  ridePreparationAt: "2027-05-31T00:00:00+09:00",
  rideCheckAt: "2027-06-07T00:00:00+09:00",
  countdownAt: "2027-06-13T06:00:00+09:00",
  seasonClearUntil: "2027-06-18T21:00:00+09:00",
  applicationOpenAt: "2027-04-01T09:00:00+09:00",
  applicationCloseAt: "2027-06-11T23:59:59+09:00",
  bikeInfoDeadlineAt: "2027-05-31T23:59:59+09:00",
  participationGuideVersion: "2027.1",
  agreementVersions: { TERMS: "2027.1", PRIVACY: "2027.1", LOCATION: "2027.1", MARKETING: "2027.1" },
  requiresThirdPartyAgreement: false,
  earlyAccessEnabled: true,
  registrationState: REGISTRATION.OPEN,
  capacityState: CAPACITY.AVAILABLE,
  waitlistEnabled: true,
  capacityPolicy: { baseCapacity: 300, platinumExtraCapacity: 60, baseUsed: 218, platinumExtraUsed: 0 },
  stageOverride: EVENT_STAGE.SPOTS_CONFIRMED,
  isCurrent: true,
  configVersion: 2,
  publishedAt: "2026-08-20T09:00:00+09:00",
  applicationPeriodDisplay: "2027.04.01 (목) – 06.11 (금)",
  eventDateDisplay: "2027.06.14 (토) – 06.15 (일)",
  capacityDisplay: "기본 300명",
  capacityNote: "플래티넘 추가 정원 60명"
};

const priceTiers = Object.freeze([
  {
    id: "price-sskr-2027-early", eventId: "sskr-2027", code: REGISTRATION_TIER.EARLY, displayName: "얼리액세스",
    amount: 90000, currency: "KRW", salesStartAt: "2027-04-01T09:00:00+09:00", salesEndAt: "2027-04-14T23:59:59+09:00",
    entryLimit: 50, entryCount: 36, capacityPoolId: "pool-base", benefitSetId: "benefit-standard", benefits: ["기본 참가 서비스", "시즌 굿즈 패키지"], isActive: true, priority: 30
  },
  {
    id: "price-sskr-2027-standard", eventId: "sskr-2027", code: REGISTRATION_TIER.STANDARD, displayName: "일반",
    amount: 120000, currency: "KRW", salesStartAt: "2027-04-15T00:00:00+09:00", salesEndAt: "2027-05-15T23:59:59+09:00",
    capacityPoolId: "pool-base", benefitSetId: "benefit-standard", benefits: ["기본 참가 서비스", "시즌 굿즈 패키지"], isActive: true, priority: 20
  },
  {
    id: "price-sskr-2027-platinum", eventId: "sskr-2027", code: REGISTRATION_TIER.PLATINUM, displayName: "플래티넘",
    amount: 190000, currency: "KRW", salesStartAt: "2027-04-15T00:00:00+09:00", salesEndAt: "2027-06-11T23:59:59+09:00",
    capacityPoolId: "pool-platinum", benefitSetId: "benefit-platinum", benefits: ["기본 참가 서비스", "기념 T셔츠", "시즌 사진집", "메모리얼 웹서비스"], isActive: true, priority: 10
  }
]);

const AGREEMENT_DEFINITIONS = Object.freeze(getAgreementDefinitions(baseEvent));
const makeAgreements = (accepted = false, includeOptional = false, event = baseEvent) => getAgreementDefinitions(event).map((item) => ({
  ...item,
  accepted: accepted && (item.required || includeOptional),
  acceptedAt: accepted && (item.required || includeOptional) ? "2027-04-22T10:00:00+09:00" : null
}));
const makeAcknowledgements = (acknowledged = false, event = baseEvent) => acknowledged ? [{ code: "PARTICIPATION_GUIDE", contentVersion: event.participationGuideVersion, acknowledgedAt: "2027-04-22T09:30:00+09:00" }] : [];

function baseSnapshot() {
  return {
    schemaVersion: 1,
    mockSessionId: "default",
    mockUserId: "mock-rider-0271",
    scenario: "a-open-unlinked",
    account: {
      id: "mock-rider-0271",
      linked: false,
      provider: null,
      profile: { name: "김라이더", email: "rider0271@example.com", phone: "01012345678", thumbnailUrl: null },
      socialIdentities: [],
      blocked: false
    },
    event: clone(baseEvent),
    priceTiers: clone(priceTiers),
    application: null,
    checkoutHold: null,
    paymentAttempts: [],
    participation: null,
    mock: { now: "2027-04-22T10:00:00+09:00", processingResult: "SUCCESS" },
    logs: []
  };
}

function tierByCode(code = REGISTRATION_TIER.STANDARD) { return priceTiers.find((item) => item.code === code); }

const makeApplication = ({ acknowledgement = false, agreements = false, optionalAgreement = false, participant = false, tierCode = null, state = APPLICATION.DRAFT, event = baseEvent } = {}) => {
  const tier = tierCode ? tierByCode(tierCode) : null;
  return {
    id: "app-sskr-2027-mock-rider-0271",
    eventId: "sskr-2027",
    userId: "mock-rider-0271",
    state,
    acknowledgements: makeAcknowledgements(acknowledgement, event),
    agreements: makeAgreements(agreements, optionalAgreement, event),
    participant: participant ? { name: "김라이더", phone: "01012345678", email: "rider0271@example.com" } : { name: "", phone: "", email: "" },
    bike: { maker: "", model: "", className: "" },
    closeReasonCode: null,
    eventConfigVersion: 2,
    priceTierId: tier?.id || null,
    selectedPriceAmount: tier?.amount || null,
    createdAt: "2027-04-22T09:00:00+09:00",
    updatedAt: "2027-04-22T09:00:00+09:00"
  };
};

const makeHold = (state = CHECKOUT_HOLD.HELD, slotTarget = SLOT_ALLOCATION.CONFIRMED, tierCode = REGISTRATION_TIER.STANDARD) => {
  const tier = tierByCode(tierCode);
  return {
    id: "hold-app-sskr-2027-mock-rider-0271-1", applicationId: "app-sskr-2027-mock-rider-0271", state, slotTarget,
    capacityPool: CAPACITY_POOL.BASE, priceTierId: tier.id, amount: tier.amount,
    createdAt: "2027-04-22T10:10:00+09:00", expiresAt: "2027-04-22T10:25:00+09:00"
  };
};

const makePayment = (state, id = "payment-attempt-1", tierCode = REGISTRATION_TIER.STANDARD) => {
  const tier = tierByCode(tierCode);
  return {
    id, applicationId: "app-sskr-2027-mock-rider-0271", holdId: "hold-app-sskr-2027-mock-rider-0271-1", state,
    priceTierId: tier.id, amount: tier.amount, currency: "KRW", idempotencyKey: `${id}-key`, mockResolution: null,
    createdAt: "2027-04-22T10:11:00+09:00", updatedAt: "2027-04-22T10:11:00+09:00"
  };
};

const makeParticipation = (slotAllocation = SLOT_ALLOCATION.CONFIRMED, runResult = RUN_RESULT.NOT_STARTED, tierCode = REGISTRATION_TIER.STANDARD) => ({
  id: "participation-sskr-2027-mock-rider-0271", eventId: "sskr-2027", userId: "mock-rider-0271", state: PARTICIPATION.ACTIVE,
  slotAllocation, registrationTierCode: tierCode, participantNumber: slotAllocation === SLOT_ALLOCATION.CONFIRMED ? "#0271" : null,
  bikeInfo: null, selectedStartLocationId: null, fulfillmentState: FULFILLMENT.NOT_PREPARED, runResult,
  createdAt: "2027-04-22T10:12:00+09:00"
});

function createScenario(name = "a-open-unlinked") {
  const snapshot = baseSnapshot();
  snapshot.scenario = name;
  const linked = () => {
    snapshot.account.linked = true;
    snapshot.account.provider = "kakao";
    snapshot.account.socialIdentities = [{ provider: "kakao", providerUserId: "kakao-mock-0271", email: "rider0271@example.com", profileImageUrl: null }];
  };
  const completeApplication = (state = APPLICATION.DRAFT, tierCode = REGISTRATION_TIER.STANDARD) => makeApplication({ acknowledgement: true, agreements: true, participant: true, tierCode, state });
  const paid = (slot, stage = EVENT_STAGE.SPOTS_CONFIRMED, result = RUN_RESULT.NOT_STARTED, tierCode = REGISTRATION_TIER.STANDARD) => {
    linked();
    snapshot.event.stageOverride = stage;
    snapshot.application = completeApplication(APPLICATION.COMPLETED, tierCode);
    snapshot.checkoutHold = makeHold(CHECKOUT_HOLD.CONSUMED, slot, tierCode);
    snapshot.paymentAttempts = [makePayment(PAYMENT.SUCCEEDED, "payment-attempt-1", tierCode)];
    snapshot.participation = makeParticipation(slot, result, tierCode);
  };

  switch (name) {
    case "guest": break;
    case "logged-in-no-application": linked(); break;
    case "application-step1": linked(); snapshot.application = makeApplication(); break;
    case "application-step2": linked(); snapshot.application = makeApplication({ acknowledgement: true }); break;
    case "application-step3": linked(); snapshot.application = makeApplication({ acknowledgement: true, agreements: true }); break;
    case "application-payment": linked(); snapshot.application = completeApplication(); break;
    case "processing": linked(); snapshot.application = completeApplication(APPLICATION.SUBMITTED); snapshot.checkoutHold = makeHold(); snapshot.paymentAttempts = [makePayment(PAYMENT.PROCESSING)]; break;
    case "failed": linked(); snapshot.application = completeApplication(APPLICATION.SUBMITTED); snapshot.checkoutHold = makeHold(CHECKOUT_HOLD.RELEASED); snapshot.paymentAttempts = [makePayment(PAYMENT.FAILED)]; break;
    case "active": paid(SLOT_ALLOCATION.CONFIRMED); break;
    case "blocked": linked(); snapshot.account.blocked = true; snapshot.application = completeApplication(); break;
    case "a-open-linked": linked(); break;
    case "b-step1": linked(); snapshot.application = makeApplication(); break;
    case "b-step2": linked(); snapshot.application = makeApplication({ acknowledgement: true }); break;
    case "b-step2-partial-required":
      linked(); snapshot.application = makeApplication({ acknowledgement: true }); snapshot.application.agreements[0].accepted = true; snapshot.application.agreements[0].acceptedAt = "2027-04-22T10:00:00+09:00"; break;
    case "b-step3": linked(); snapshot.application = makeApplication({ acknowledgement: true, agreements: true }); break;
    case "b-step3-optional-unchecked": linked(); snapshot.application = makeApplication({ acknowledgement: true, agreements: true, optionalAgreement: false }); break;
    case "b-step4": linked(); snapshot.application = completeApplication(); break;
    case "b-processing":
      linked(); snapshot.application = completeApplication(APPLICATION.SUBMITTED); snapshot.checkoutHold = makeHold(); snapshot.paymentAttempts = [makePayment(PAYMENT.PROCESSING)]; break;
    case "b-failed-open":
      linked(); snapshot.application = completeApplication(APPLICATION.SUBMITTED); snapshot.checkoutHold = makeHold(CHECKOUT_HOLD.RELEASED); snapshot.paymentAttempts = [makePayment(PAYMENT.FAILED)]; break;
    case "b-failed-closed":
      linked(); snapshot.event.registrationState = REGISTRATION.CLOSED; snapshot.application = completeApplication(APPLICATION.CLOSED); snapshot.application.closeReasonCode = "REGISTRATION_CLOSED";
      snapshot.checkoutHold = makeHold(CHECKOUT_HOLD.RELEASED); snapshot.paymentAttempts = [makePayment(PAYMENT.FAILED)]; break;
    case "b-finalizing":
      linked(); snapshot.application = completeApplication(APPLICATION.COMPLETED); snapshot.checkoutHold = makeHold(CHECKOUT_HOLD.CONSUMED); snapshot.paymentAttempts = [makePayment(PAYMENT.SUCCEEDED)]; break;
    case "tier-early-ended": linked(); snapshot.mock.now = "2027-04-22T10:00:00+09:00"; snapshot.application = makeApplication({ acknowledgement: true, agreements: true }); break;
    case "tier-early-limit": linked(); snapshot.mock.now = "2027-04-10T10:00:00+09:00"; snapshot.priceTiers.find((item) => item.code === REGISTRATION_TIER.EARLY).entryCount = 50; snapshot.application = makeApplication({ acknowledgement: true, agreements: true }); break;
    case "tier-standard-ended": linked(); snapshot.mock.now = "2027-05-16T10:00:00+09:00"; snapshot.application = makeApplication({ acknowledgement: true, agreements: true }); break;
    case "tier-platinum-extra": linked(); snapshot.event.capacityPolicy.baseUsed = 300; snapshot.mock.now = "2027-05-16T10:00:00+09:00"; snapshot.application = makeApplication({ acknowledgement: true, agreements: true }); break;
    case "c-waitlisted": paid(SLOT_ALLOCATION.WAITLISTED); break;
    case "c-confirmed-spots": paid(SLOT_ALLOCATION.CONFIRMED); break;
    case "c-preparation": paid(SLOT_ALLOCATION.CONFIRMED, EVENT_STAGE.RIDE_PREPARATION); break;
    case "c-ride-check": paid(SLOT_ALLOCATION.CONFIRMED, EVENT_STAGE.RIDE_CHECK); break;
    case "c-countdown": paid(SLOT_ALLOCATION.CONFIRMED, EVENT_STAGE.COUNTDOWN); break;
    case "c-live-confirmed": paid(SLOT_ALLOCATION.CONFIRMED, EVENT_STAGE.LIVE); break;
    case "c-live-waitlisted": paid(SLOT_ALLOCATION.WAITLISTED, EVENT_STAGE.LIVE); break;
    case "c-season-completed": paid(SLOT_ALLOCATION.CONFIRMED, EVENT_STAGE.SEASON_CLEAR, RUN_RESULT.COMPLETED); break;
    case "c-season-no-show": paid(SLOT_ALLOCATION.CONFIRMED, EVENT_STAGE.SEASON_CLEAR, RUN_RESULT.NO_SHOW); break;
    case "c-season-retired": paid(SLOT_ALLOCATION.CONFIRMED, EVENT_STAGE.SEASON_CLEAR, RUN_RESULT.RETIRED); break;
    case "a-open-unlinked": break;
    default: throw new Error(`Unknown mock scenario: ${name}`);
  }
  return snapshot;
}

module.exports = { AGREEMENT_DEFINITIONS, baseEvent, baseSnapshot, createScenario, makeAcknowledgements, makeAgreements, makeApplication, priceTiers };
