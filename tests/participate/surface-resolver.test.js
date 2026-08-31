const test = require("node:test");
const assert = require("node:assert/strict");
const { resolveSurface } = require("../../server/participate/surface-resolver");

const event = { registrationState: "OPEN", capacityState: "AVAILABLE", waitlistEnabled: true };
const draft = { state: "DRAFT", agreements: [] };

test("surface resolver prioritizes participation and transactions", () => {
  assert.equal(resolveSurface({ event }).mode, "MODE_A");
  assert.equal(resolveSurface({ event, application: draft }).mode, "MODE_B");
  assert.equal(resolveSurface({ event, application: { ...draft, state: "SUBMITTED" } }).mode, "MODE_B");
  assert.equal(resolveSurface({ event, application: draft, payment: { state: "PROCESSING" } }).step, "STEP_4");
  assert.equal(resolveSurface({ event, participation: { state: "ACTIVE", slotAllocation: "WAITLISTED" } }).variant, "WAITLISTED");
  assert.equal(resolveSurface({ event, participation: { state: "ACTIVE", slotAllocation: "CONFIRMED" } }).variant, "CONFIRMED");
});

test("cancelled, expired and closed applications do not resurrect", () => {
  for (const state of ["CANCELLED", "EXPIRED", "CLOSED"]) {
    assert.equal(resolveSurface({ event, application: { state } }).mode, "MODE_A");
  }
});

test("succeeded payment without participation is finalizing", () => {
  const surface = resolveSurface({ event, application: { state: "COMPLETED" }, payment: { state: "SUCCEEDED" } });
  assert.deepEqual([surface.mode, surface.step, surface.variant], ["MODE_B", "STEP_4", "FINALIZING"]);
});

test("failed payment cannot retry after its application is closed", () => {
  const surface = resolveSurface({ event: { ...event, registrationState: "CLOSED" }, application: { state: "CLOSED", closeReasonCode: "REGISTRATION_CLOSED" }, payment: { state: "FAILED" } });
  assert.deepEqual([surface.mode, surface.step, surface.variant, surface.primaryAction.enabled], ["MODE_B", "STEP_4", "CLOSED", false]);
});
