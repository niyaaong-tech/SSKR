const test = require("node:test");
const assert = require("node:assert/strict");
const { MockParticipateRepository } = require("../../server/participate/mock-repository");
const { createScenario } = require("../../server/participate/mock-scenarios");
const { createTransactionService } = require("../../server/participate/transaction-service");

const make = (scenario = "b-step4", now = "2027-04-22T01:00:00Z") => {
  const repository = new MockParticipateRepository(createScenario(scenario));
  const service = createTransactionService(repository, { clock: () => Date.parse(now) });
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
  assert.equal(snapshot.event.capacityPolicy.baseUsed, 219);

  service.startPayment({ idempotencyKey: "success-1", mockOutcome: "SUCCESS" });
  snapshot = repository.exportSnapshot();
  assert.equal(snapshot.paymentAttempts.length, 1);
  assert.equal(snapshot.event.capacityPolicy.baseUsed, 219);
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

test("bike information can be changed only for an active participation before the deadline", () => {
  const active = make("c-confirmed-spots", "2027-05-20T01:00:00Z");
  active.service.saveBikeInfo({ maker: "BMW", model: "R 1250 GS", className: "Adventure" });
  assert.equal(active.repository.getParticipation().bikeInfo.model, "R 1250 GS");

  const expired = make("c-confirmed-spots", "2027-06-01T15:00:00Z");
  assert.throws(() => expired.service.saveBikeInfo({ maker: "BMW" }), { code: "BIKE_INFO_EDIT_UNAVAILABLE" });
});

test("checkout requires a second confirmation when the selected tier price changes", () => {
  const { repository, service } = make();
  const standard = repository.getPriceTiers().find((tier) => tier.code === "STANDARD");
  standard.amount = 130000;
  repository.savePriceTier(standard);
  assert.throws(() => service.prepareCheckout(), { code: "PRICE_CHANGED" });
  assert.equal(repository.getApplication().selectedPriceAmount, 130000);
  assert.equal(service.prepareCheckout().amount, 130000);
});

test("checkout revalidates capacity after participant information was saved", () => {
  const { repository, service } = make();
  const event = repository.getCurrentEvent();
  event.capacityPolicy.baseUsed = event.capacityPolicy.baseCapacity;
  repository.saveEvent(event);
  assert.throws(() => service.prepareCheckout(), { code: "BASE_CAPACITY_FULL" });
  assert.equal(repository.getCheckoutHold(), null);
});

test("platinum confirmation consumes the extra pool after base capacity is full", () => {
  const { repository, service } = make("tier-platinum-extra", "2027-05-16T01:00:00Z");
  service.saveParticipantInfo({
    priceTierId: "price-sskr-2027-platinum",
    name: "김라이더",
    phone: "01012345678",
    email: "rider0271@example.com",
    bike: {}
  });
  assert.equal(service.prepareCheckout().capacityPool, "PLATINUM_EXTRA");
  service.startPayment({ idempotencyKey: "platinum-extra", mockOutcome: "SUCCESS" });
  const snapshot = repository.exportSnapshot();
  assert.equal(snapshot.event.capacityPolicy.baseUsed, 300);
  assert.equal(snapshot.event.capacityPolicy.platinumExtraUsed, 1);
});
