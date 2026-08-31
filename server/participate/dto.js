const { EVENT_STAGE, FULFILLMENT, PAYMENT, RUN_RESULT, SLOT_ALLOCATION } = require("./constants");
const { resolveEventStage } = require("./event-stage-resolver");
const { resolveCurrentEvent } = require("./current-event-resolver");
const { resolvePermissions } = require("./permission-resolver");
const { resolveSurface } = require("./surface-resolver");
const { validateState } = require("./validation");
const { getAgreementDefinitions } = require("./agreement-policy");
const { resolveRegistrationTiers } = require("./tier-policy");

const registrationLabels = { OPEN: "모집 중", NOT_OPEN: "모집 예정", CLOSED: "모집 마감", SUSPENDED: "접수 중단" };
const stageLabels = { PREPARING: "시즌 준비", CORE_CONFIRMED: "핵심 일정 확정", SPOTS_CONFIRMED: "스팟 공개", RIDE_PREPARATION: "참가 준비", RIDE_CHECK: "최종 점검", COUNTDOWN: "출발 임박", LIVE: "행사 진행 중", SEASON_CLEAR: "시즌 정리" };
const stageGuidance = {
  PREPARING: ["다음 SSKR을 준비하고 있습니다.", "시즌 핵심 일정이 확정되면 가장 먼저 알려드립니다.", "내 참가"],
  CORE_CONFIRMED: ["기본 참가 준비를 시작해 주세요.", "행사 핵심 일정과 참가 조건을 확인할 수 있습니다.", "바이크 정보"],
  SPOTS_CONFIRMED: ["공식 스팟이 공개되었습니다.", "출발지와 스팟을 살펴보고 나만의 랠리를 준비해 주세요.", "스팟 살펴보기"],
  RIDE_PREPARATION: ["랠리 준비를 시작할 시간입니다.", "준비 체크리스트와 참가 키트 상태를 확인해 주세요.", "준비 체크"],
  RIDE_CHECK: ["최종 점검이 필요합니다.", "누락된 참가 정보와 출발 준비를 확인해 주세요.", "최종 점검"],
  COUNTDOWN: ["출발이 가까워졌습니다.", "출발 정보와 중요 공지를 마지막으로 확인해 주세요.", "출발정보 확인"],
  LIVE: ["지금 SSKR를 시작하세요.", "행사 당일 안내와 랠리 서비스를 확인합니다.", "당일 서비스"],
  SEASON_CLEAR: ["이번 시즌의 기록을 확인하세요.", "참가 결과와 메모리얼이 정리되고 있습니다.", "기록 확인"]
};

function latestPayment(attempts) {
  return attempts.length ? attempts[attempts.length - 1] : { state: PAYMENT.NOT_STARTED };
}

function buildManager(event, participation) {
  let [title, description, actionLabel] = stageGuidance[event.resolvedStage] || stageGuidance.PREPARING;
  if (participation?.slotAllocation === SLOT_ALLOCATION.WAITLISTED) {
    title = event.resolvedStage === EVENT_STAGE.LIVE ? "현재 참가 대기 상태입니다." : "참가 Slot을 기다리고 있습니다.";
    description = event.resolvedStage === EVENT_STAGE.SEASON_CLEAR ? "미승격 참가자의 후속 정책은 확정되는 대로 안내합니다." : "Slot이 확보되면 같은 참가 로비에서 즉시 안내합니다.";
    actionLabel = "대기 상태 확인";
  } else if (event.resolvedStage === EVENT_STAGE.SEASON_CLEAR) {
    const labels = {
      [RUN_RESULT.COMPLETED]: ["완주 기록이 확인되었습니다.", "SSKR 2027의 기록과 메모리얼을 확인해 보세요."],
      [RUN_RESULT.NO_SHOW]: ["이번 시즌은 미참가로 기록되었습니다.", "참가권과 시즌 기록은 그대로 보존됩니다."],
      [RUN_RESULT.RETIRED]: ["리타이어 기록이 반영되었습니다.", "출발 이후의 여정도 이번 시즌의 기록으로 남습니다."],
      [RUN_RESULT.INVALIDATED]: ["결과 확인이 필요합니다.", "운영 판정과 안내 내용을 확인해 주세요."]
    };
    [title, description] = labels[participation?.runResult] || [title, description];
  }
  return {
    primaryTask: { code: `GUIDANCE_${event.resolvedStage}`, title, description, dueAt: event.bikeInfoDeadlineAt, action: { code: "OPEN_PRIMARY_SERVICE", label: actionLabel, enabled: true } },
    nextSchedule: { title: "SSKR 2027", at: event.eventStartAt },
    notices: []
  };
}

function buildServices(permissions) {
  return [
    { code: "PREPARATION", title: "참가 준비", description: "참가 정보와 준비 항목을 확인합니다.", enabled: permissions.canOpenPreparation, reason: permissions.canOpenPreparation ? null : "참가 확정 후 이용할 수 있습니다." },
    { code: "SPOT_GUIDE", title: "스팟 가이드", description: "공식 스팟과 지역 안내를 살펴봅니다.", enabled: permissions.canOpenSpotGuide, reason: permissions.canOpenSpotGuide ? null : "참가 관계 확인이 필요합니다." },
    { code: "RIDE_DAY", title: "당일 서비스", description: "행사 당일 랠리 Entrance입니다.", enabled: permissions.canOpenRideDay, reason: permissions.canOpenRideDay ? null : "확정 참가자에게 행사 당일 열립니다." },
    { code: "MEMORIAL", title: "메모리얼", description: "이번 시즌의 여정과 기록을 남깁니다.", enabled: permissions.canOpenMemorial, reason: permissions.canOpenMemorial ? null : "참가 관계 확인이 필요합니다." }
  ];
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
    manager: participation ? buildManager(event, participation) : null,
    services: participation ? buildServices(permissions) : [],
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
