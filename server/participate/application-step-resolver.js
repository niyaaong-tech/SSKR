const { APPLICATION_STEP, PAYMENT } = require("./constants");

function requiredAgreementsComplete(application) {
  const agreements = application?.agreements || [];
  return agreements.length > 0 && agreements.filter((item) => item.required).every((item) => item.accepted);
}

function participantInfoComplete(application) {
  const participant = application?.participant || {};
  return Boolean(participant.name?.trim() && participant.phone?.trim());
}

function resolveApplicationStep({ application, payment, participation }) {
  if (payment?.state === PAYMENT.SUCCEEDED && !participation) {
    return { step: APPLICATION_STEP.STEP_3, variant: "FINALIZING" };
  }
  if ([PAYMENT.PENDING, PAYMENT.PROCESSING, PAYMENT.FAILED].includes(payment?.state)) {
    const variant = payment.state === PAYMENT.FAILED ? "FAILED" : "PROCESSING";
    return { step: APPLICATION_STEP.STEP_3, variant };
  }
  if (!requiredAgreementsComplete(application)) return { step: APPLICATION_STEP.STEP_1, variant: "DEFAULT" };
  if (!participantInfoComplete(application)) return { step: APPLICATION_STEP.STEP_2, variant: "DEFAULT" };
  return { step: APPLICATION_STEP.STEP_3, variant: "DEFAULT" };
}

module.exports = { participantInfoComplete, requiredAgreementsComplete, resolveApplicationStep };
