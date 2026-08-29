const test = require("node:test");
const assert = require("node:assert/strict");
const { validateState } = require("../../server/participate/validation");

test("invalid combinations emit warnings without throwing", () => {
  const cases = [
    { application: { state: "CANCELLED" }, payment: { state: "SUCCEEDED" } },
    { payment: { state: "PROCESSING" }, checkoutHold: { state: "RELEASED" } },
    { participation: { state: "ACTIVE" }, payment: { state: "REFUNDED" } },
    { slotAllocation: "CONFIRMED" },
    { participation: { state: "ACTIVE", slotAllocation: "WAITLISTED", runResult: "STARTED" } }
  ];
  cases.forEach((state) => {
    const result = validateState(state);
    assert.equal(result.valid, false);
    assert.ok(result.warnings.length > 0);
  });
});
