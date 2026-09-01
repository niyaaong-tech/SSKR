const test = require("node:test");
const assert = require("node:assert/strict");
const { handleParticipateRequest } = require("../../server/participate/request-handler");

test("context scenario DTO resolves mode and permissions", async () => {
  const confirmed = await handleParticipateRequest("context", { scenario: "c-live-confirmed", account: { linked: true, provider: "kakao" } });
  assert.equal(confirmed.surface.mode, "MODE_C");
  assert.equal(confirmed.permissions.canOpenRideDay, true);
  const waitlisted = await handleParticipateRequest("context", { scenario: "c-live-waitlisted", account: { linked: true, provider: "kakao" } });
  assert.equal(waitlisted.surface.mode, "MODE_C");
  assert.equal(waitlisted.permissions.canOpenRideDay, false);
});

test("application actions return canonical snapshot and restored step", async () => {
  let response = await handleParticipateRequest("application", { scenario: "a-open-linked", account: { linked: true, provider: "kakao" }, action: "START" });
  assert.equal(response.surface.step, "STEP_1");
  response = await handleParticipateRequest("application", { snapshot: response.mockSnapshot, account: response.account, action: "SAVE_ACKNOWLEDGEMENT", acknowledgement: { acknowledged: true } });
  assert.equal(response.surface.step, "STEP_2");
  const agreements = Object.fromEntries(response.application.agreements.map((item) => [item.code, true]));
  response = await handleParticipateRequest("application", { snapshot: response.mockSnapshot, account: response.account, action: "SAVE_AGREEMENTS", agreements });
  assert.equal(response.surface.step, "STEP_3");
  response = await handleParticipateRequest("application", {
    snapshot: response.mockSnapshot,
    account: response.account,
    action: "SAVE_PARTICIPANT_INFO",
    participant: { priceTierId: "price-sskr-2027-standard", name: "김라이더", phone: "010-1234-5678", email: "rider0271@example.com", bike: {} }
  });
  assert.equal(response.surface.step, "STEP_4");
});

test("retry denial preserves the server-side closed application", async () => {
  const initial = await handleParticipateRequest("context", { scenario: "b-failed-closed", account: { linked: true, provider: "kakao" } });
  const response = await handleParticipateRequest("payment", { snapshot: initial.mockSnapshot, account: initial.account, action: "RETRY", idempotencyKey: "closed-retry", mockOutcome: "SUCCESS" });
  assert.equal(response.ok, false);
  assert.equal(response.context.application.state, "CLOSED");
  assert.equal(response.context.surface.variant, "CLOSED");
  assert.equal(response.context.surface.primaryAction.enabled, false);
});

test("failed and closed scenario starts in a non-payable closed state", async () => {
  const result = await handleParticipateRequest("context", {
    scenario: "b-failed-closed",
    account: { linked: true, provider: "kakao" }
  });

  assert.equal(result.ok, true);
  assert.equal(result.application.state, "CLOSED");
  assert.equal(result.application.closeReasonCode, "REGISTRATION_CLOSED");
  assert.equal(result.surface.mode, "MODE_B");
  assert.equal(result.surface.step, "STEP_4");
  assert.equal(result.surface.variant, "CLOSED");
  assert.equal(result.permissions.canStartCheckout, false);
  assert.equal(result.permissions.canRetryPayment, false);
});

test("optional marketing consent does not block the next step", async () => {
  const result = await handleParticipateRequest("context", { scenario: "b-step3-optional-unchecked", account: { linked: true, provider: "kakao" } });
  assert.equal(result.surface.step, "STEP_3");
  assert.equal(result.application.agreements.find((item) => item.code === "MARKETING").accepted, false);
});

test("logout hides but preserves the application snapshot", async () => {
  const linked = await handleParticipateRequest("context", { scenario: "b-step4", account: { linked: true, provider: "kakao" } });
  const loggedOut = await handleParticipateRequest("context", { snapshot: linked.mockSnapshot, account: { linked: false } });
  assert.equal(loggedOut.surface.mode, "MODE_A");
  assert.equal(loggedOut.application.priceTierId, "price-sskr-2027-standard");
  const restored = await handleParticipateRequest("context", { snapshot: loggedOut.mockSnapshot, account: { linked: true, provider: "kakao" } });
  assert.equal(restored.surface.step, "STEP_4");
});

test("participation reset preserves the linked account and clears the application", async () => {
  const result = await handleParticipateRequest("mock", {
    action: "RESET",
    scenario: "a-open-linked",
    snapshot: null,
    account: { linked: true, provider: "kakao" }
  });

  assert.equal(result.account.linked, true);
  assert.equal(result.surface.mode, "MODE_A");
  assert.equal(result.application, null);
  assert.equal(result.participation, null);
});
