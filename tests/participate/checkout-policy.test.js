const test = require("node:test");
const assert = require("node:assert/strict");
const { evaluateCheckoutEligibility } = require("../../server/participate/checkout-policy");

const application = { state: "SUBMITTED" };
const price = { isActive: true };
const evaluate = (event, extra = {}) => evaluateCheckoutEligibility({ application, price, event, ...extra });

test("checkout allocation follows registration and capacity", () => {
  assert.equal(evaluate({ registrationState: "OPEN", capacityState: "AVAILABLE" }).slotTarget, "CONFIRMED");
  assert.equal(evaluate({ registrationState: "OPEN", capacityState: "LIMITED" }).slotTarget, "CONFIRMED");
  assert.equal(evaluate({ registrationState: "OPEN", capacityState: "FULL", waitlistEnabled: true }).slotTarget, "WAITLISTED");
  assert.equal(evaluate({ registrationState: "OPEN", capacityState: "FULL", waitlistEnabled: false }).reason.code, "CAPACITY_FULL");
  assert.equal(evaluate({ registrationState: "CLOSED", capacityState: "AVAILABLE" }).reason.code, "REGISTRATION_CLOSED");
  assert.equal(evaluate({ registrationState: "SUSPENDED", capacityState: "AVAILABLE" }).allowed, false);
});

test("checkout denies missing price and duplicate participation", () => {
  const missingPrice = evaluateCheckoutEligibility({ application, price: null, event: { registrationState: "OPEN", capacityState: "AVAILABLE" } });
  assert.equal(missingPrice.warnings[0].code, "ACTIVE_PRICE_TIER_MISSING");
  const duplicate = evaluate({ registrationState: "OPEN", capacityState: "AVAILABLE" }, { participation: { state: "ACTIVE" } });
  assert.equal(duplicate.reason.code, "PARTICIPATION_ALREADY_ACTIVE");
});

test("blocked users cannot begin a new checkout", () => {
  const result = evaluate({ registrationState: "OPEN", capacityState: "AVAILABLE" }, { user: { blocked: true } });
  assert.equal(result.allowed, false);
  assert.equal(result.reason.code, "USER_BLOCKED");
  assert.equal(result.closeApplication, false);
});
