const { APPLICATION_STEP, EVENT_STAGE, PARTICIPATION, PAYMENT, SLOT_ALLOCATION } = require("./constants");

function resolvePermissions({ event, participation, payment, surface, now = new Date() }) {
  const active = participation?.state === PARTICIPATION.ACTIVE;
  const confirmed = participation?.slotAllocation === SLOT_ALLOCATION.CONFIRMED;
  const beforeBikeDeadline = !event.bikeInfoDeadlineAt || new Date(now).getTime() <= new Date(event.bikeInfoDeadlineAt).getTime();
  return {
    canEditParticipantInfo: surface.mode === "MODE_B" || active,
    canEditBikeInfo: surface.mode === "MODE_B" || (active && beforeBikeDeadline),
    canStartCheckout: surface.mode === "MODE_B" && surface.step === APPLICATION_STEP.STEP_4 && surface.primaryAction?.code === "PREPARE_CHECKOUT" && surface.primaryAction?.enabled === true,
    canRetryPayment: surface.mode === "MODE_B" && payment?.state === PAYMENT.FAILED && surface.primaryAction?.enabled === true,
    canOpenSpotGuide: active,
    canOpenPreparation: active,
    canOpenRideDay: active && confirmed && event.resolvedStage === EVENT_STAGE.LIVE,
    canOpenResult: active && event.resolvedStage === EVENT_STAGE.SEASON_CLEAR,
    canOpenMemorial: active
  };
}

module.exports = { resolvePermissions };
