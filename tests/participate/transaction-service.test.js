const test = require("node:test");
const assert = require("node:assert/strict");
const { MockParticipateRepository } = require("../../server/participate/mock-repository");
const { createScenario } = require("../../server/participate/mock-scenarios");
const { createTransactionService } = require("../../server/participate/transaction-service");

const make = (scenario = "b-step3") => {
  const repository = new MockParticipateRepository(createScenario(scenario));
  const service = createTransactionService(repository, { clock: () => Date.parse("2027-04-22T01:00:00Z") });
  return { repository, service };
};

test("payment success consumes hold, completes application and creates one participation", () => {
  const { repository, service } = make();
  service.prepareCheckout();
  service.startPayment({ idempotencyKey: "success-1", mockOutcome: "SUCCESS" });
  let snapshot = repository.exportSnapshot();
  assert.equal(snapshot.checkoutHold.state, "CONSUMED");
  assert.equal(snapshot.paymentAttempts[0].state, "SUCCEEDED");
  assert.equal(snapshot.application.state, "COMPLETED");
  assert.equal(snapshot.participation.state, "ACTIVE");

  service.startPayment({ idempotencyKey: "success-1", mockOutcome: "SUCCESS" });
  snapshot = repository.exportSnapshot();
  assert.equal(snapshot.paymentAttempts.length, 1);
  assert.equal(snapshot.participation.id, "participation-sskr-2027-mock-rider-0271");
});

test("payment failure releases hold and retry creates a new attempt", () => {
  const { repository, service } = make();
  service.prepareCheckout();
  service.startPayment({ idempotencyKey: "failed-1", mockOutcome: "FAIL" });
  assert.equal(repository.getCheckoutHold().state, "RELEASED");
  service.retryPayment({ idempotencyKey: "retry-1", mockOutcome: "SUCCESS" });
  assert.equal(repository.getPaymentAttempts().length, 2);
  assert.equal(repository.getParticipation().state, "ACTIVE");
});

test("processing payment keeps its hold and refresh can complete it", () => {
  const { repository, service } = make();
  service.prepareCheckout();
  service.startPayment({ idempotencyKey: "processing-1", mockOutcome: "PROCESSING_THEN_SUCCESS" });
  assert.equal(repository.getCheckoutHold().state, "HELD");
  assert.equal(repository.getPaymentAttempts()[0].state, "PROCESSING");
  service.refreshPayment();
  assert.equal(repository.getPaymentAttempts()[0].state, "SUCCEEDED");
  assert.equal(repository.getParticipation().state, "ACTIVE");
});

test("retry after registration closes is denied and closes the application", () => {
  const { repository, service } = make("b-failed-open");
  const event = repository.getCurrentEvent();
  event.registrationState = "CLOSED";
  repository.saveEvent(event);
  assert.throws(() => service.retryPayment({ idempotencyKey: "retry-closed", mockOutcome: "SUCCESS" }), { code: "REGISTRATION_CLOSED" });
  assert.equal(repository.getApplication().state, "CLOSED");
  assert.equal(repository.getPaymentAttempts().length, 1);
});

test("bike information remains optional through participation creation", () => {
  const { repository, service } = make();
  repository.snapshot.application.bike = { maker: "", model: "", className: "" };
  service.prepareCheckout();
  service.startPayment({ idempotencyKey: "no-bike", mockOutcome: "SUCCESS" });
  assert.equal(repository.getParticipation().bikeInfo, null);
});
