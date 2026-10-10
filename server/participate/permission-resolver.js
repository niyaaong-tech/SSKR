const { APPLICATION_STEP, EVENT_STAGE, PARTICIPATION, PAYMENT, SLOT_ALLOCATION } = require("./constants");

function resolvePermissions({ account, event, participation, payment, surface, now = new Date() }) {
  const active = participation?.state === PARTICIPATION.ACTIVE;
  const confirmed = participation?.slotAllocation === SLOT_ALLOCATION.CONFIRMED;
  const beforeBikeDeadline = !event.bikeInfoDeadlineAt || new Date(now).getTime() <= new Date(event.bikeInfoDeadlineAt).getTime();
  return {
    canEditParticipantInfo: surface.mode === "MODE_B" || active,
    canEditBikeInfo: !account?.blocked && (surface.mode === "MODE_B" || (active && confirmed && beforeBikeDeadline && ![EVENT_STAGE.LIVE, EVENT_STAGE.SEASON_CLEAR].includes(event.resolvedStage))),
    canStartCheckout: surface.mode === "MODE_B" && surface.step === APPLICATION_STEP.STEP_4 && surface.primaryAction?.code === "PREPARE_CHECKOUT" && surface.primaryAction?.enabled === true,
    canRetryPayment: surface.mode === "MODE_B" && payment?.state === PAYMENT.FAILED && surface.primaryAction?.enabled === true,
    canOpenSpotGuide: true,
    canOpenPreparation: active && confirmed,
    canOpenRideDay: active && confirmed && event.resolvedStage === EVENT_STAGE.LIVE,
    canOpenResult: active && event.resolvedStage === EVENT_STAGE.SEASON_CLEAR,
    canOpenMemorial: true
  };
}


module.exports = { resolvePermissions };
