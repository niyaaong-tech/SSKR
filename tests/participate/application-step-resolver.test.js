const test = require("node:test");
const assert = require("node:assert/strict");
const { resolveApplicationStep } = require("../../server/participate/application-step-resolver");

const event = {
  participationGuideVersion: "2027.1",
  agreementVersions: { TERMS: "2027.1", PRIVACY: "2027.1", LOCATION: "2027.1", MARKETING: "2027.1" }
};
const acknowledgement = [{ code: "PARTICIPATION_GUIDE", contentVersion: "2027.1", acknowledgedAt: "2027-04-22T00:00:00Z" }];
const required = ["TERMS", "PRIVACY", "LOCATION"].map((code) => ({ code, version: "2027.1", required: true, accepted: true }));

test("application step is derived from persisted facts", () => {
  assert.deepEqual(resolveApplicationStep({ event, application: { agreements: [] } }), { step: "STEP_1", variant: "DEFAULT" });
  assert.deepEqual(resolveApplicationStep({ event, application: { acknowledgements: acknowledgement, agreements: [] } }), { step: "STEP_2", variant: "DEFAULT" });
  assert.deepEqual(resolveApplicationStep({ event, application: { acknowledgements: acknowledgement, agreements: required, participant: {} } }), { step: "STEP_3", variant: "DEFAULT" });
  assert.deepEqual(resolveApplicationStep({ event, application: { acknowledgements: acknowledgement, agreements: required, priceTierId: "standard", participant: { name: "라이더", phone: "01012345678", email: "rider@example.com" } } }), { step: "STEP_4", variant: "DEFAULT" });
});

test("content and agreement version changes reopen the matching step", () => {
  const application = { acknowledgements: acknowledgement, agreements: required, priceTierId: "standard", participant: { name: "라이더", phone: "01012345678", email: "rider@example.com" } };
  assert.equal(resolveApplicationStep({ event: { ...event, participationGuideVersion: "2027.2" }, application }).step, "STEP_1");
  assert.equal(resolveApplicationStep({ event: { ...event, agreementVersions: { ...event.agreementVersions, TERMS: "2027.2" } }, application }).step, "STEP_2");
});

test("payment state keeps the transaction on step 4", () => {
  assert.deepEqual(resolveApplicationStep({ payment: { state: "PROCESSING" } }), { step: "STEP_4", variant: "PROCESSING" });
  assert.deepEqual(resolveApplicationStep({ payment: { state: "FAILED" } }), { step: "STEP_4", variant: "FAILED" });
  assert.deepEqual(resolveApplicationStep({ payment: { state: "SUCCEEDED" }, participation: null }), { step: "STEP_4", variant: "FINALIZING" });
});
