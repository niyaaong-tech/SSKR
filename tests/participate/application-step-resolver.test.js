const test = require("node:test");
const assert = require("node:assert/strict");
const { resolveApplicationStep } = require("../../server/participate/application-step-resolver");

const required = [{ code: "TERMS", required: true, accepted: true }];

test("application step is derived from persisted facts", () => {
  assert.deepEqual(resolveApplicationStep({ application: { agreements: [] } }), { step: "STEP_1", variant: "DEFAULT" });
  assert.deepEqual(resolveApplicationStep({ application: { agreements: required, participant: {} } }), { step: "STEP_2", variant: "DEFAULT" });
  assert.deepEqual(resolveApplicationStep({ application: { agreements: required, participant: { name: "라이더", phone: "01012345678" } } }), { step: "STEP_3", variant: "DEFAULT" });
});

test("payment state keeps the transaction on step 3", () => {
  assert.equal(resolveApplicationStep({ payment: { state: "PROCESSING" } }).variant, "PROCESSING");
  assert.equal(resolveApplicationStep({ payment: { state: "FAILED" } }).variant, "FAILED");
  assert.equal(resolveApplicationStep({ payment: { state: "SUCCEEDED" }, participation: null }).variant, "FINALIZING");
});
