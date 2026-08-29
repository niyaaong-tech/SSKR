const { APPLICATION, CHECKOUT_HOLD, PARTICIPATION, PAYMENT, RUN_RESULT, SLOT_ALLOCATION } = require("./constants");

function validateState(context) {
  const warnings = [];
  const push = (code, detail, severity = "ERROR") => warnings.push({ code, severity, detail });
  const { application, checkoutHold, participation, payment } = context;

  if (payment?.state === PAYMENT.SUCCEEDED && application?.state === APPLICATION.CANCELLED && !participation) {
    push("SUCCEEDED_PAYMENT_WITH_CANCELLED_APPLICATION", "성공 결제와 취소 신청이 함께 존재합니다.");
  }
  if (payment?.state === PAYMENT.PROCESSING && checkoutHold?.state === CHECKOUT_HOLD.RELEASED) {
    push("PROCESSING_PAYMENT_WITH_RELEASED_HOLD", "처리 중 결제의 Hold가 해제되어 있습니다.");
  }
  if (participation?.state === PARTICIPATION.ACTIVE && payment?.state === PAYMENT.REFUNDED) {
    push("ACTIVE_PARTICIPATION_WITH_REFUNDED_PAYMENT", "환불 완료 결제에 활성 참가권이 남아 있습니다.");
  }
  if (!participation && context.slotAllocation === SLOT_ALLOCATION.CONFIRMED) {
    push("CONFIRMED_SLOT_WITHOUT_PARTICIPATION", "참가권 없이 확정 Slot이 존재합니다.");
  }
  if (participation?.slotAllocation === SLOT_ALLOCATION.WAITLISTED && participation.runResult === RUN_RESULT.STARTED) {
    push("WAITLISTED_RUN_STARTED", "참가 대기 상태에서 Run이 시작되었습니다.");
  }

  return { valid: warnings.length === 0, warnings };
}

module.exports = { validateState };
