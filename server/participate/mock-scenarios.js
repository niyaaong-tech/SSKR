const {
  APPLICATION,
  CAPACITY,
  CHECKOUT_HOLD,
  EVENT_STAGE,
  FULFILLMENT,
  PARTICIPATION,
  PAYMENT,
  REGISTRATION,
  RUN_RESULT,
  SLOT_ALLOCATION
} = require("./constants");
const { clone } = require("./mock-repository");

const AGREEMENT_DEFINITIONS = Object.freeze([
  { code: "ELIGIBILITY", title: "참가 자격", summary: "만 19세 이상이며 유효한 모터사이클 면허를 보유합니다.", required: true, version: "2027.1" },
  { code: "BIKE_REQUIREMENT", title: "바이크 조건", summary: "공도 주행이 가능한 등록·보험 상태의 바이크로 참가합니다.", required: true, version: "2027.1" },
  { code: "SAFETY_RESPONSIBILITY", title: "안전 책임", summary: "장거리 주행의 위험을 이해하고 교통법규와 안전수칙을 준수합니다.", required: true, version: "2027.1" },
  { code: "EVENT_RULES", title: "행사 운영 규칙", summary: "스팟 운영시간과 현장 스태프 안내를 따릅니다.", required: true, version: "2027.1" },
  { code: "CANCELLATION_REFUND", title: "취소·환불 핵심", summary: "키트 발송 이후에는 별도 부분환불 정책이 적용될 수 있습니다.", required: true, version: "2027.1" },
  { code: "PRIVACY", title: "개인정보 처리", summary: "신청과 행사 운영에 필요한 최소정보 처리에 동의합니다.", required: true, version: "2027.1" },
  { code: "LOCATION", title: "위치정보 처리", summary: "행사 기능 이용 시 별도 안내에 따라 위치정보가 처리될 수 있습니다.", required: true, version: "2027.1" },
  { code: "TERMS", title: "서비스 이용약관", summary: "SSKR 참가 서비스 이용약관에 동의합니다.", required: true, version: "2027.1" }
]);

const makeAgreements = (accepted = false) => AGREEMENT_DEFINITIONS.map((item) => ({ ...item, accepted, acceptedAt: accepted ? "2027-04-22T10:00:00+09:00" : null }));

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
  applicationOpenAt: "2027-04-21T09:00:00+09:00",
  applicationCloseAt: "2027-05-30T23:59:59+09:00",
  bikeInfoDeadlineAt: "2027-05-31T23:59:59+09:00",
  registrationState: REGISTRATION.OPEN,
  capacityState: CAPACITY.AVAILABLE,
  waitlistEnabled: true,
  stageOverride: EVENT_STAGE.SPOTS_CONFIRMED,
  isCurrent: true,
  configVersion: 1,
  publishedAt: "2026-08-20T09:00:00+09:00",
  applicationPeriodDisplay: "2027.04.21 (월) – 05.30 (금)",
  eventDateDisplay: "2027.06.14 (토) – 06.15 (일)",
  capacityDisplay: "300팀",
  capacityNote: "1팀 1–2인 · 바이크 1대"
};

const basePrice = {
  id: "price-sskr-2027-standard",
  eventId: "sskr-2027",
  code: "STANDARD",
  displayName: "일반 참가",
  amount: 120000,
  currency: "KRW",
  salesStartAt: baseEvent.applicationOpenAt,
  salesEndAt: baseEvent.applicationCloseAt,
  capacityPoolId: "pool-standard",
  eligibilityRule: "PUBLIC",
  benefitSetId: "benefit-standard",
  isActive: true,
  priority: 10
};

function baseSnapshot() {
  return {
    schemaVersion: 1,
    mockSessionId: "default",
    mockUserId: "mock-rider-0271",
    scenario: "a-open-unlinked",
    account: { linked: false, provider: null },
    event: clone(baseEvent),
    priceTiers: [clone(basePrice)],
    application: null,
    checkoutHold: null,
    paymentAttempts: [],
    participation: null,
    mock: { processingResult: "SUCCESS" },
    logs: []
  };
}

const makeApplication = ({ agreements = false, participant = false, state = APPLICATION.DRAFT } = {}) => ({
  id: "app-sskr-2027-mock-rider-0271",
  eventId: "sskr-2027",
  userId: "mock-rider-0271",
  state,
  agreements: makeAgreements(agreements),
  participant: participant ? { name: "김라이더", phone: "01012345678", email: "" } : { name: "", phone: "", email: "" },
  bike: { maker: "", model: "", className: "" },
  closeReasonCode: null,
  eventConfigVersion: 1,
  priceTierId: basePrice.id,
  createdAt: "2027-04-22T09:00:00+09:00",
  updatedAt: "2027-04-22T09:00:00+09:00"
});

const makeHold = (state = CHECKOUT_HOLD.HELD, slotTarget = SLOT_ALLOCATION.CONFIRMED) => ({
  id: "hold-app-sskr-2027-mock-rider-0271-1",
  applicationId: "app-sskr-2027-mock-rider-0271",
  state,
  slotTarget,
  priceTierId: basePrice.id,
  createdAt: "2027-04-22T10:10:00+09:00",
  expiresAt: "2027-04-22T10:25:00+09:00"
});

const makePayment = (state, id = "payment-attempt-1") => ({
  id,
  applicationId: "app-sskr-2027-mock-rider-0271",
  holdId: "hold-app-sskr-2027-mock-rider-0271-1",
  state,
  amount: 120000,
  currency: "KRW",
  idempotencyKey: `${id}-key`,
  mockResolution: null,
  createdAt: "2027-04-22T10:11:00+09:00",
  updatedAt: "2027-04-22T10:11:00+09:00"
});

const makeParticipation = (slotAllocation = SLOT_ALLOCATION.CONFIRMED, runResult = RUN_RESULT.NOT_STARTED) => ({
  id: "participation-sskr-2027-mock-rider-0271",
  eventId: "sskr-2027",
  userId: "mock-rider-0271",
  state: PARTICIPATION.ACTIVE,
  slotAllocation,
  participantNumber: slotAllocation === SLOT_ALLOCATION.CONFIRMED ? "#0271" : null,
  bikeInfo: null,
  selectedStartLocationId: null,
  fulfillmentState: FULFILLMENT.NOT_PREPARED,
  runResult,
  createdAt: "2027-04-22T10:12:00+09:00"
});

function createScenario(name = "a-open-unlinked") {
  const snapshot = baseSnapshot();
  snapshot.scenario = name;
  const linked = () => { snapshot.account = { linked: true, provider: "kakao" }; };
  const paid = (slot, stage = EVENT_STAGE.SPOTS_CONFIRMED, result = RUN_RESULT.NOT_STARTED) => {
    linked();
    snapshot.event.stageOverride = stage;
    snapshot.application = makeApplication({ agreements: true, participant: true, state: APPLICATION.COMPLETED });
    snapshot.checkoutHold = makeHold(CHECKOUT_HOLD.CONSUMED, slot);
    snapshot.paymentAttempts = [makePayment(PAYMENT.SUCCEEDED)];
    snapshot.participation = makeParticipation(slot, result);
  };

  switch (name) {
    case "a-open-linked": linked(); break;
    case "b-step1": linked(); snapshot.application = makeApplication(); break;
    case "b-step2": linked(); snapshot.application = makeApplication({ agreements: true }); break;
    case "b-step3": linked(); snapshot.application = makeApplication({ agreements: true, participant: true, state: APPLICATION.SUBMITTED }); break;
    case "b-processing":
      linked(); snapshot.application = makeApplication({ agreements: true, participant: true, state: APPLICATION.SUBMITTED });
      snapshot.checkoutHold = makeHold(); snapshot.paymentAttempts = [makePayment(PAYMENT.PROCESSING)]; break;
    case "b-failed-open":
      linked(); snapshot.application = makeApplication({ agreements: true, participant: true, state: APPLICATION.SUBMITTED });
      snapshot.checkoutHold = makeHold(CHECKOUT_HOLD.RELEASED); snapshot.paymentAttempts = [makePayment(PAYMENT.FAILED)]; break;
    case "b-failed-closed":
      linked(); snapshot.event.registrationState = REGISTRATION.CLOSED;
      snapshot.application = makeApplication({ agreements: true, participant: true, state: APPLICATION.CLOSED });
      snapshot.application.closeReasonCode = "REGISTRATION_CLOSED";
      snapshot.checkoutHold = makeHold(CHECKOUT_HOLD.RELEASED); snapshot.paymentAttempts = [makePayment(PAYMENT.FAILED)]; break;
    case "b-finalizing":
      linked(); snapshot.application = makeApplication({ agreements: true, participant: true, state: APPLICATION.COMPLETED });
      snapshot.checkoutHold = makeHold(CHECKOUT_HOLD.CONSUMED); snapshot.paymentAttempts = [makePayment(PAYMENT.SUCCEEDED)]; break;
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

module.exports = { AGREEMENT_DEFINITIONS, baseEvent, basePrice, createScenario, makeAgreements };
