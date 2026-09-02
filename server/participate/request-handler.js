const { buildContextDto } = require("./dto");
const { MockParticipateRepository } = require("./mock-repository");
const { createScenario } = require("./mock-scenarios");
const { DomainError, createTransactionService } = require("./transaction-service");

const allowedScenarios = new Set([
  "a-open-unlinked", "a-open-linked", "b-step1", "b-step2", "b-step2-partial-required", "b-step3", "b-step3-optional-unchecked", "b-step4", "b-processing",
  "b-failed-open", "b-failed-closed", "b-finalizing", "c-waitlisted", "c-confirmed-spots",
  "c-preparation", "c-ride-check", "c-countdown", "c-live-confirmed", "c-live-waitlisted",
  "c-season-completed", "c-season-no-show", "c-season-retired", "tier-early-ended", "tier-early-limit", "tier-standard-ended", "tier-platinum-extra",
  "guest", "logged-in-no-application", "application-step1", "application-step2", "application-step3", "application-payment", "processing", "failed", "active", "blocked"
]);

function respond(repository, options = {}) {
  return { ...buildContextDto(repository, options), mockSnapshot: repository.exportSnapshot() };
}

function normalizeAccount(input = {}, current = {}) {
  const account = {
    id: current.id || "mock-rider-0271",
    profile: current.profile || { name: "김라이더", email: "rider0271@example.com", phone: "01012345678", thumbnailUrl: null },
    socialIdentities: current.socialIdentities || [],
    blocked: current.blocked === true,
    linked: input.linked === true,
    provider: input.linked ? input.provider || current.provider || null : null
  };
  if (account.linked && account.provider && !account.socialIdentities.some((identity) => identity.provider === account.provider)) {
    account.socialIdentities.push({ provider: account.provider, providerUserId: `${account.provider}-mock-0271`, email: account.profile.email, profileImageUrl: null });
  }
  return account;
}

async function handleParticipateRequest(endpoint, body = {}, options = {}) {
  let snapshot;
  let repository;
  try {
    const scenario = allowedScenarios.has(body.scenario) ? body.scenario : "a-open-unlinked";
    snapshot = body.snapshot && body.snapshot.schemaVersion === 1 ? body.snapshot : createScenario(scenario);
    snapshot.mockSessionId = body.mockSessionId || snapshot.mockSessionId || "default";
    repository = new MockParticipateRepository(snapshot);
    repository.setAccount(normalizeAccount(body.account, repository.getUserContext().account));
    const service = createTransactionService(repository, options);

    if (endpoint === "application") {
      if (body.action === "START") service.startApplication();
      else if (body.action === "SAVE_ACKNOWLEDGEMENT") service.saveAcknowledgement(body.acknowledgement);
      else if (body.action === "SAVE_AGREEMENTS") service.saveAgreements(body.agreements);
      else if (body.action === "SAVE_PARTICIPANT_INFO") service.saveParticipantInfo(body.participant);
      else if (body.action === "EDIT_PARTICIPANT_INFO") service.editParticipantInfo();
      else if (body.action === "SAVE_BIKE_INFO") service.saveBikeInfo(body.bike);
      else throw new DomainError("ACTION_NOT_SUPPORTED", "지원하지 않는 신청 동작입니다.");
    } else if (endpoint === "checkout") {
      if (body.action !== "PREPARE") throw new DomainError("ACTION_NOT_SUPPORTED", "지원하지 않는 결제 준비 동작입니다.");
      service.prepareCheckout();
    } else if (endpoint === "payment") {
      if (body.action === "START") service.startPayment(body);
      else if (body.action === "RETRY") service.retryPayment(body);
      else if (body.action === "REFRESH") service.refreshPayment();
      else throw new DomainError("ACTION_NOT_SUPPORTED", "지원하지 않는 결제 동작입니다.");
    } else if (endpoint === "mock") {
      if (body.action === "RESET" || body.action === "SET_SCENARIO") {
        const nextScenario = allowedScenarios.has(body.scenario) ? body.scenario : "a-open-unlinked";
        const resetRepository = new MockParticipateRepository(createScenario(nextScenario));
        resetRepository.setAccount(normalizeAccount(body.account, resetRepository.getUserContext().account));
        return respond(resetRepository, options);
      }
      if (body.action === "PROMOTE_WAITLIST") service.promoteWaitlist();
      else if (body.action === "UPDATE_ACCOUNT_PROFILE") service.updateAccountProfile(body.profile);
      else if (body.action === "ADVANCE_EVENT_STAGE") {
        const event = repository.getCurrentEvent();
        event.stageOverride = body.stage;
        repository.saveEvent(event);
      } else if (body.action === "SET_REGISTRATION") {
        const event = repository.getCurrentEvent();
        event.registrationState = body.state;
        repository.saveEvent(event);
      } else if (body.action === "SET_CAPACITY") {
        const event = repository.getCurrentEvent();
        event.capacityState = body.state;
        if (event.capacityPolicy) {
          if (body.state === "FULL") event.capacityPolicy.baseUsed = event.capacityPolicy.baseCapacity;
          else if (body.state === "AVAILABLE" && event.capacityPolicy.baseUsed >= event.capacityPolicy.baseCapacity) event.capacityPolicy.baseUsed = Math.max(0, event.capacityPolicy.baseCapacity - 1);
        }
        if (typeof body.waitlistEnabled === "boolean") event.waitlistEnabled = body.waitlistEnabled;
        repository.saveEvent(event);
      } else if (body.action === "SET_CAPACITY_POLICY") {
        const event = repository.getCurrentEvent();
        event.capacityPolicy = { ...event.capacityPolicy, ...body.capacityPolicy };
        repository.saveEvent(event);
      } else if (body.action === "SET_PRICE_AMOUNT") {
        const tier = repository.getPriceTiers().find((item) => item.code === body.tierCode);
        if (!tier) throw new DomainError("TIER_NOT_FOUND", "참가 유형을 찾을 수 없습니다.");
        tier.amount = Number(body.amount);
        repository.savePriceTier(tier);
      } else if (body.action === "SET_TIER_STATE") {
        const tier = repository.getPriceTiers().find((item) => item.code === body.tierCode);
        if (!tier) throw new DomainError("TIER_NOT_FOUND", "참가 유형을 찾을 수 없습니다.");
        if (typeof body.isActive === "boolean") tier.isActive = body.isActive;
        if (body.salesStartAt) tier.salesStartAt = body.salesStartAt;
        if (body.salesEndAt) tier.salesEndAt = body.salesEndAt;
        if (Number.isFinite(Number(body.entryCount))) tier.entryCount = Number(body.entryCount);
        repository.savePriceTier(tier);
      } else if (body.action === "SET_MOCK_NOW") {
        const mock = repository.exportSnapshot().mock || {};
        mock.now = body.now;
        repository.saveMock(mock);
      } else if (body.action === "SET_PAYMENT_PROCESSING_RESULT") {
        const attempts = repository.getPaymentAttempts();
        const current = attempts[attempts.length - 1];
        if (!current || current.state !== "PROCESSING") throw new DomainError("PROCESSING_PAYMENT_NOT_FOUND", "처리 중인 결제가 없습니다.");
        current.mockResolution = body.result === "FAIL" ? "FAIL" : "SUCCESS";
        repository.savePaymentAttempt(current);
      } else if (body.action !== "PROMOTE_WAITLIST") {
        throw new DomainError("ACTION_NOT_SUPPORTED", "지원하지 않는 목업 동작입니다.");
      }
    } else if (endpoint !== "context") {
      throw new DomainError("ENDPOINT_NOT_FOUND", "요청 경로를 찾을 수 없습니다.");
    }

    return respond(repository, options);
  } catch (error) {
    repository ||= new MockParticipateRepository(snapshot || createScenario("a-open-unlinked"));
    repository.setAccount(normalizeAccount(body.account, repository.getUserContext().account));
    const context = respond(repository, options);
    return {
      ok: false,
      error: {
        code: error.code || "PARTICIPATE_REQUEST_FAILED",
        userMessage: error.userMessage || "현재 상태를 다시 확인해 주세요.",
        retryable: error.retryable === true
      },
      context,
      mockSnapshot: repository.exportSnapshot()
    };
  }
}

function createVercelHandler(endpoint) {
  return async function handler(request, response) {
    if (request.method !== "POST") {
      response.setHeader("Allow", "POST");
      return response.status(405).json({ ok: false, error: { code: "METHOD_NOT_ALLOWED", userMessage: "POST 요청만 지원합니다.", retryable: false } });
    }
    const result = await handleParticipateRequest(endpoint, request.body || {});
    return response.status(result.ok ? 200 : 400).json(result);
  };
}

module.exports = { createVercelHandler, handleParticipateRequest };
