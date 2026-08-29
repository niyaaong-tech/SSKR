const { buildContextDto } = require("./dto");
const { MockParticipateRepository } = require("./mock-repository");
const { createScenario } = require("./mock-scenarios");
const { DomainError, createTransactionService } = require("./transaction-service");

const allowedScenarios = new Set([
  "a-open-unlinked", "a-open-linked", "b-step1", "b-step2", "b-step3", "b-processing",
  "b-failed-open", "b-failed-closed", "b-finalizing", "c-waitlisted", "c-confirmed-spots",
  "c-preparation", "c-ride-check", "c-countdown", "c-live-confirmed", "c-live-waitlisted",
  "c-season-completed", "c-season-no-show", "c-season-retired"
]);

function respond(repository, options = {}) {
  return { ...buildContextDto(repository, options), mockSnapshot: repository.exportSnapshot() };
}

function normalizeAccount(input = {}) {
  return { linked: input.linked === true, provider: input.linked ? input.provider || null : null };
}

async function handleParticipateRequest(endpoint, body = {}, options = {}) {
  let snapshot;
  let repository;
  try {
    const scenario = allowedScenarios.has(body.scenario) ? body.scenario : "a-open-unlinked";
    snapshot = body.snapshot && body.snapshot.schemaVersion === 1 ? body.snapshot : createScenario(scenario);
    snapshot.mockSessionId = body.mockSessionId || snapshot.mockSessionId || "default";
    repository = new MockParticipateRepository(snapshot);
    repository.setAccount(normalizeAccount(body.account));
    const service = createTransactionService(repository, options);

    if (endpoint === "application") {
      if (body.action === "START") service.startApplication();
      else if (body.action === "SAVE_AGREEMENTS") service.saveAgreements(body.agreements);
      else if (body.action === "SAVE_PARTICIPANT_INFO") service.saveParticipantInfo(body.participant);
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
        resetRepository.setAccount(normalizeAccount(body.account));
        return respond(resetRepository, options);
      }
      if (body.action === "PROMOTE_WAITLIST") service.promoteWaitlist();
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
        if (typeof body.waitlistEnabled === "boolean") event.waitlistEnabled = body.waitlistEnabled;
        repository.saveEvent(event);
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
    repository.setAccount(normalizeAccount(body.account));
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
