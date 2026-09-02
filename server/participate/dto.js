const { FULFILLMENT, PAYMENT, RUN_RESULT } = require("./constants");
const { resolveEventStage } = require("./event-stage-resolver");
const { resolveCurrentEvent } = require("./current-event-resolver");
const { resolvePermissions } = require("./permission-resolver");
const { resolveSurface } = require("./surface-resolver");
const { validateState } = require("./validation");
const { getAgreementDefinitions } = require("./agreement-policy");
const { resolveRegistrationTiers } = require("./tier-policy");

const registrationLabels = { OPEN: "모집 중", NOT_OPEN: "모집 예정", CLOSED: "모집 마감", SUSPENDED: "접수 중단" };
const stageLabels = { PREPARING: "시즌 준비", CORE_CONFIRMED: "핵심 일정 확정", SPOTS_CONFIRMED: "스팟 공개", RIDE_PREPARATION: "참가 준비", RIDE_CHECK: "최종 점검", COUNTDOWN: "출발 임박", LIVE: "행사 진행 중", SEASON_CLEAR: "시즌 정리" };

function latestPayment(attempts) {
  return attempts.length ? attempts[attempts.length - 1] : { state: PAYMENT.NOT_STARTED };
}

function buildContextDto(repository, options = {}) {
  const snapshot = repository.exportSnapshot();
  const effectiveNow = options.now || snapshot.mock?.now || new Date();
  const resolvedCurrent = resolveCurrentEvent(repository.getEvents(), effectiveNow);
  const rawEvent = resolvedCurrent?.event || repository.getCurrentEvent();
  const stage = resolvedCurrent || resolveEventStage(rawEvent, effectiveNow);
  const event = { ...rawEvent, resolvedStage: stage.stage };
  const prices = repository.getPriceTiers();
  const application = repository.getApplication();
  const resolvedTiers = resolveRegistrationTiers({ event, priceTiers: prices, now: effectiveNow });
  const selectedTier = resolvedTiers.tiers.find((item) => item.id === application?.priceTierId) || resolvedTiers.tiers.find((item) => item.code === "STANDARD") || resolvedTiers.tiers[0] || null;
  const checkoutHold = repository.getCheckoutHold();
  const paymentAttempts = repository.getPaymentAttempts();
  const payment = latestPayment(paymentAttempts);
  const participation = repository.getParticipation();
  const account = repository.getUserContext().account || { linked: false, provider: null };
  const state = { account, event, application, checkoutHold, payment, participation, now: effectiveNow };
  const surface = resolveSurface(state);
  const surfaceTitles = {
    MODE_A: "참가 혜택 & 전용 서비스",
    STEP_1: "참가 전에 꼭 확인해 주세요",
    STEP_2: "참가 약관 및 필수 동의",
    STEP_3: "참가 유형 및 참가자 정보",
    STEP_4: "결제",
    WAITLISTED: "참가 대기",
    CONFIRMED: "참가 확정"
  };
  surface.title = surface.mode === "MODE_B" ? surfaceTitles[surface.step] : surface.mode === "MODE_C" ? surfaceTitles[surface.variant] : surfaceTitles.MODE_A;
  const permissions = resolvePermissions({ ...state, surface });
  const invalid = validateState({ ...state, slotAllocation: repository.exportSnapshot().slotAllocation });
  if (!invalid.valid) permissions.canOpenRideDay = false;

  return {
    ok: true,
    event: {
      id: event.id,
      seasonYear: event.seasonYear,
      editionLabel: event.editionLabel,
      publicTitle: event.publicTitle,
      category: event.category,
      description: event.description,
      resolvedStage: event.resolvedStage,
      stageLabel: stageLabels[event.resolvedStage] || "행사 준비",
      registrationState: event.registrationState,
      registrationLabel: registrationLabels[event.registrationState] || "상태 확인",
      capacityState: event.capacityState,
      waitlistEnabled: event.waitlistEnabled,
      bikeInfoDeadlineAt: event.bikeInfoDeadlineAt,
      applicationPeriodDisplay: event.applicationPeriodDisplay,
      eventDateDisplay: event.eventDateDisplay,
      capacityDisplay: event.capacityDisplay,
      capacityNote: event.capacityNote
    },
    price: selectedTier,
    tiers: resolvedTiers.tiers,
    capacity: resolvedTiers.capacity,
    agreementDocuments: getAgreementDefinitions(event),
    account,
    application,
    payment,
    paymentAttempts: paymentAttempts.map(({ id, state: paymentState, createdAt }) => ({ id, state: paymentState, createdAt })),
    checkoutHold,
    participation,
    surface,
    permissions,
    manager: null,
    services: [],
    statuses: {
      bikeInfoComplete: Boolean(participation?.bikeInfo),
      bikeInfoDeadlineAt: event.bikeInfoDeadlineAt,
      fulfillmentState: participation?.fulfillmentState || FULFILLMENT.NOT_PREPARED,
      runResult: participation?.runResult || RUN_RESULT.NOT_STARTED
    },
    warnings: [...stage.warnings, ...invalid.warnings]
  };
}

module.exports = { buildContextDto };
