const {
  APPLICATION,
  CAPACITY,
  PARTICIPATION,
  PAYMENT,
  REGISTRATION,
  SLOT_ALLOCATION,
  SURFACE_MODE
} = require("./constants");
const { resolveApplicationStep } = require("./application-step-resolver");

function resolveModeAAction(event) {
  if (event.registrationState === REGISTRATION.OPEN) {
    if (event.capacityState === CAPACITY.FULL) {
      if (event.waitlistEnabled) return { code: "START_APPLICATION", label: "참가 대기 신청하기", enabled: true };
      return { code: "NONE", label: "모집 마감", enabled: false };
    }
    return { code: "START_APPLICATION", label: "신청 계속하기", enabled: true };
  }
  const labels = {
    [REGISTRATION.NOT_OPEN]: "신청 예정",
    [REGISTRATION.CLOSED]: "신청 종료",
    [REGISTRATION.SUSPENDED]: "접수 일시중단"
  };
  return { code: "NONE", label: labels[event.registrationState] || "신청 상태 확인", enabled: false };
}

function resolveSurface(context) {
  const { account, application, event, payment, participation } = context;
  if (account?.linked === false) {
    return {
      mode: SURFACE_MODE.MODE_A,
      gate: null,
      step: null,
      variant: event.registrationState === REGISTRATION.OPEN ? "OPEN" : event.registrationState,
      statusCode: event.registrationState,
      primaryAction: resolveModeAAction(event),
      blockedReason: null
    };
  }
  if (participation?.state === PARTICIPATION.ACTIVE) {
    const variant = participation.slotAllocation === SLOT_ALLOCATION.WAITLISTED ? "WAITLISTED" : "CONFIRMED";
    return {
      mode: SURFACE_MODE.MODE_C,
      gate: null,
      step: null,
      variant,
      statusCode: variant,
      primaryAction: { code: "OPEN_PRIMARY_SERVICE", label: variant === "WAITLISTED" ? "참가 대기 상태 확인" : "내 참가 준비하기", enabled: true },
      blockedReason: null
    };
  }

  if (payment?.state === PAYMENT.SUCCEEDED && !participation) {
    return {
      mode: SURFACE_MODE.MODE_B,
      gate: null,
      ...resolveApplicationStep(context),
      statusCode: "FINALIZING",
      primaryAction: { code: "REFRESH_CONTEXT", label: "현재 상태 다시 확인", enabled: true },
      blockedReason: null
    };
  }

  if (application?.state === APPLICATION.CLOSED && payment?.state === PAYMENT.FAILED) {
    return {
      mode: SURFACE_MODE.MODE_B,
      gate: null,
      step: "STEP_4",
      variant: "CLOSED",
      statusCode: application.closeReasonCode || "APPLICATION_CLOSED",
      primaryAction: { code: "NONE", label: "결제 불가", enabled: false },
      blockedReason: { code: application.closeReasonCode || "APPLICATION_CLOSED", message: "현재 모집 조건에서는 새로운 결제를 시작할 수 없습니다." }
    };
  }

  const activeApplication = application && [APPLICATION.DRAFT, APPLICATION.SUBMITTED, APPLICATION.COMPLETED].includes(application.state);
  const activePayment = payment && [PAYMENT.PENDING, PAYMENT.PROCESSING, PAYMENT.FAILED].includes(payment.state);
  if (activeApplication || activePayment) {
    const stepState = resolveApplicationStep(context);
    const actions = {
      STEP_1: { code: "SAVE_ACKNOWLEDGEMENT", label: "다음", enabled: true },
      STEP_2: { code: "SAVE_AGREEMENTS", label: "다음", enabled: true },
      STEP_3: { code: "SAVE_PARTICIPANT_INFO", label: "다음", enabled: true },
      STEP_4: { code: payment?.state === PAYMENT.FAILED ? "RETRY_PAYMENT" : "PREPARE_CHECKOUT", label: payment?.state === PAYMENT.FAILED ? "다시 결제하기" : "결제 진행하기", enabled: payment?.state !== PAYMENT.PROCESSING }
    };
    return {
      mode: SURFACE_MODE.MODE_B,
      gate: null,
      ...stepState,
      statusCode: stepState.variant,
      primaryAction: actions[stepState.step],
      blockedReason: null
    };
  }

  return {
    mode: SURFACE_MODE.MODE_A,
    gate: null,
    step: null,
    variant: event.registrationState === REGISTRATION.OPEN ? "OPEN" : event.registrationState,
    statusCode: event.registrationState,
    primaryAction: resolveModeAAction(event),
    blockedReason: null
  };
}

module.exports = { resolveModeAAction, resolveSurface };
