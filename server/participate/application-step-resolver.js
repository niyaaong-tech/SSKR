const { APPLICATION_STEP, PAYMENT } = require("./constants");
const { requiredAgreementsComplete } = require("./agreement-policy");

function acknowledgementComplete(application, event = {}) {
  const expectedVersion = event.participationGuideVersion || "2027.1";
  return (application?.acknowledgements || []).some((item) => item.code === "PARTICIPATION_GUIDE" && item.contentVersion === expectedVersion && item.acknowledgedAt);
}

function participantInfoComplete(application) {
  const participant = application?.participant || {};
  return Boolean(application?.priceTierId && participant.name?.trim() && participant.phone?.trim() && participant.email?.trim());
}

function resolveApplicationStep({ application, event, payment, participation }) {
  if (payment?.state === PAYMENT.SUCCEEDED && !participation) {
    return { step: APPLICATION_STEP.STEP_4, variant: "FINALIZING" };
  }
  if ([PAYMENT.PENDING, PAYMENT.PROCESSING, PAYMENT.FAILED].includes(payment?.state)) {
    const variant = payment.state === PAYMENT.FAILED ? "FAILED" : "PROCESSING";
    return { step: APPLICATION_STEP.STEP_4, variant };
  }
  if (!acknowledgementComplete(application, event)) return { step: APPLICATION_STEP.STEP_1, variant: "DEFAULT" };
  if (!requiredAgreementsComplete(application, event)) return { step: APPLICATION_STEP.STEP_2, variant: "DEFAULT" };
  if (!participantInfoComplete(application)) return { step: APPLICATION_STEP.STEP_3, variant: "DEFAULT" };
  return { step: APPLICATION_STEP.STEP_4, variant: "DEFAULT" };
}

module.exports = { acknowledgementComplete, participantInfoComplete, requiredAgreementsComplete, resolveApplicationStep };
