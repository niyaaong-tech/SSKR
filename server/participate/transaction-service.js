const {
  APPLICATION,
  CHECKOUT_HOLD,
  FULFILLMENT,
  PARTICIPATION,
  PAYMENT,
  PAYMENT_OUTCOME,
  RUN_RESULT,
  SLOT_ALLOCATION
} = require("./constants");
const { participantInfoComplete, requiredAgreementsComplete } = require("./application-step-resolver");
const { evaluateCheckoutEligibility } = require("./checkout-policy");
const { AGREEMENT_DEFINITIONS } = require("./mock-scenarios");

class DomainError extends Error {
  constructor(code, userMessage, retryable = false) {
    super(userMessage);
    this.code = code;
    this.userMessage = userMessage;
    this.retryable = retryable;
  }
}

const nowIso = (clock) => new Date(clock()).toISOString();
const normalizeText = (value) => String(value || "").trim().replace(/\s+/g, " ");
const digits = (value) => String(value || "").replace(/\D/g, "");
const deterministicNumber = (userId) => {
  const fixtureNumber = String(userId).match(/(\d{1,4})$/)?.[1];
  if (fixtureNumber) return `#${fixtureNumber.padStart(4, "0")}`;
  const value = [...userId].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) % 9000, 271);
  return `#${String(value || 271).padStart(4, "0")}`;
};

function createTransactionService(repository, options = {}) {
  const clock = options.clock || (() => Date.now());
  const log = (code, detail = {}) => repository.appendLog({ code, detail, at: nowIso(clock) });
  const event = () => repository.getCurrentEvent();
  const price = () => repository.getPriceTiers().filter((item) => item.isActive).sort((a, b) => b.priority - a.priority)[0] || null;
  const user = () => repository.getUserContext();

  function startApplication() {
    if (!user().account?.linked) throw new DomainError("ACCOUNT_LINK_REQUIRED", "소셜 계정 연동이 필요합니다.");
    const current = repository.getApplication();
    if (current && [APPLICATION.DRAFT, APPLICATION.SUBMITTED, APPLICATION.COMPLETED].includes(current.state)) return current;
    const timestamp = nowIso(clock);
    const application = {
      id: `app-${event().id}-${user().mockUserId}`,
      eventId: event().id,
      userId: user().mockUserId,
      state: APPLICATION.DRAFT,
      agreements: AGREEMENT_DEFINITIONS.map((item) => ({ ...item, accepted: false, acceptedAt: null })),
      participant: { name: "", phone: "", email: "" },
      bike: { maker: "", model: "", className: "" },
      closeReasonCode: null,
      eventConfigVersion: event().configVersion,
      priceTierId: price()?.id || null,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    repository.saveApplication(application);
    log("APPLICATION_STARTED", { applicationId: application.id });
    return application;
  }

  function saveAgreements(input = {}) {
    const application = repository.getApplication();
    if (!application || application.state !== APPLICATION.DRAFT) throw new DomainError("APPLICATION_NOT_EDITABLE", "현재 신청서를 수정할 수 없습니다.");
    const acceptedCodes = new Set(Array.isArray(input) ? input : Object.entries(input).filter(([, accepted]) => accepted).map(([code]) => code));
    const timestamp = nowIso(clock);
    application.agreements = AGREEMENT_DEFINITIONS.map((definition) => ({
      ...definition,
      accepted: acceptedCodes.has(definition.code),
      acceptedAt: acceptedCodes.has(definition.code) ? timestamp : null
    }));
    if (!requiredAgreementsComplete(application)) throw new DomainError("REQUIRED_AGREEMENTS_MISSING", "모든 필수 항목에 동의해 주세요.");
    application.updatedAt = timestamp;
    repository.saveApplication(application);
    log("AGREEMENTS_SAVED", { applicationId: application.id, acceptedCount: acceptedCodes.size });
    return application;
  }

  function saveParticipantInfo(input = {}) {
    const application = repository.getApplication();
    if (!application || application.state !== APPLICATION.DRAFT) throw new DomainError("APPLICATION_NOT_EDITABLE", "현재 신청서를 수정할 수 없습니다.");
    if (!requiredAgreementsComplete(application)) throw new DomainError("AGREEMENTS_REQUIRED", "참가 조건 동의를 먼저 완료해 주세요.");
    const participant = {
      name: normalizeText(input.name),
      phone: digits(input.phone),
      email: normalizeText(input.email)
    };
    if (!participant.name) throw new DomainError("PARTICIPANT_NAME_REQUIRED", "이름을 입력해 주세요.");
    if (!/^01\d{8,9}$/.test(participant.phone)) throw new DomainError("PARTICIPANT_PHONE_INVALID", "연락 가능한 휴대전화 번호를 확인해 주세요.");
    application.participant = participant;
    application.bike = {
      maker: normalizeText(input.bike?.maker),
      model: normalizeText(input.bike?.model),
      className: normalizeText(input.bike?.className)
    };
    application.updatedAt = nowIso(clock);
    repository.saveApplication(application);
    log("PARTICIPANT_INFO_SAVED", { applicationId: application.id, bikeProvided: Boolean(application.bike.maker || application.bike.model || application.bike.className) });
    return application;
  }

  function prepareCheckout() {
    const application = repository.getApplication();
    const currentHold = repository.getCheckoutHold();
    if (currentHold?.state === CHECKOUT_HOLD.HELD) return currentHold;
    if (!requiredAgreementsComplete(application) || !participantInfoComplete(application)) throw new DomainError("APPLICATION_INCOMPLETE", "신청 정보를 먼저 완료해 주세요.");
    log("CHECKOUT_REQUESTED", { applicationId: application.id });
    const eligibility = evaluateCheckoutEligibility({ application, event: event(), participation: repository.getParticipation(), price: price() });
    if (!eligibility.allowed) {
      if (eligibility.closeApplication) {
        application.state = APPLICATION.CLOSED;
        application.closeReasonCode = eligibility.reason.code;
        application.updatedAt = nowIso(clock);
        repository.saveApplication(application);
      }
      log("CHECKOUT_DENIED", { applicationId: application.id, reason: eligibility.reason.code });
      throw new DomainError(eligibility.reason.code, eligibility.reason.message, false);
    }
    const timestamp = nowIso(clock);
    application.state = APPLICATION.SUBMITTED;
    application.updatedAt = timestamp;
    repository.saveApplication(application);
    const hold = {
      id: `hold-${application.id}-${repository.getPaymentAttempts().length + 1}`,
      applicationId: application.id,
      state: CHECKOUT_HOLD.HELD,
      slotTarget: eligibility.slotTarget,
      priceTierId: price().id,
      createdAt: timestamp,
      expiresAt: new Date(new Date(timestamp).getTime() + 15 * 60 * 1000).toISOString()
    };
    repository.saveCheckoutHold(hold);
    log("CHECKOUT_HELD", { applicationId: application.id, holdId: hold.id, slotTarget: hold.slotTarget });
    return hold;
  }

  function createParticipation(hold) {
    const existing = repository.getParticipation();
    if (existing?.state === PARTICIPATION.ACTIVE) return existing;
    const application = repository.getApplication();
    const slotAllocation = hold.slotTarget || SLOT_ALLOCATION.CONFIRMED;
    const participation = {
      id: `participation-${event().id}-${user().mockUserId}`,
      eventId: event().id,
      userId: user().mockUserId,
      state: PARTICIPATION.ACTIVE,
      slotAllocation,
      participantNumber: slotAllocation === SLOT_ALLOCATION.CONFIRMED ? deterministicNumber(user().mockUserId) : null,
      bikeInfo: application.bike && Object.values(application.bike).some(Boolean) ? application.bike : null,
      selectedStartLocationId: null,
      fulfillmentState: FULFILLMENT.NOT_PREPARED,
      runResult: RUN_RESULT.NOT_STARTED,
      createdAt: nowIso(clock)
    };
    repository.saveParticipation(participation);
    log("PARTICIPATION_CREATED", { participationId: participation.id, slotAllocation });
    return participation;
  }

  function applyPaymentResult(attempt, outcome, { deferParticipation = false } = {}) {
    const hold = repository.getCheckoutHold();
    const application = repository.getApplication();
    if (outcome === PAYMENT_OUTCOME.PROCESSING || outcome === PAYMENT_OUTCOME.PROCESSING_THEN_SUCCESS || outcome === PAYMENT_OUTCOME.PROCESSING_THEN_FAIL) {
      attempt.state = PAYMENT.PROCESSING;
      attempt.mockResolution = outcome === PAYMENT_OUTCOME.PROCESSING_THEN_FAIL ? PAYMENT_OUTCOME.FAIL : outcome === PAYMENT_OUTCOME.PROCESSING_THEN_SUCCESS ? PAYMENT_OUTCOME.SUCCESS : null;
      attempt.updatedAt = nowIso(clock);
      repository.savePaymentAttempt(attempt);
      log("PAYMENT_PROCESSING", { paymentAttemptId: attempt.id });
      return attempt;
    }
    if (outcome === PAYMENT_OUTCOME.FAIL) {
      attempt.state = PAYMENT.FAILED;
      attempt.updatedAt = nowIso(clock);
      repository.savePaymentAttempt(attempt);
      hold.state = CHECKOUT_HOLD.RELEASED;
      repository.saveCheckoutHold(hold);
      log("PAYMENT_FAILED", { paymentAttemptId: attempt.id });
      return attempt;
    }
    attempt.state = PAYMENT.SUCCEEDED;
    attempt.updatedAt = nowIso(clock);
    repository.savePaymentAttempt(attempt);
    hold.state = CHECKOUT_HOLD.CONSUMED;
    repository.saveCheckoutHold(hold);
    application.state = APPLICATION.COMPLETED;
    application.updatedAt = nowIso(clock);
    repository.saveApplication(application);
    log("PAYMENT_SUCCEEDED", { paymentAttemptId: attempt.id });
    if (!deferParticipation) createParticipation(hold);
    return attempt;
  }

  function startPayment({ idempotencyKey, mockOutcome = PAYMENT_OUTCOME.SUCCESS, deferParticipation = false } = {}) {
    if (!idempotencyKey) throw new DomainError("IDEMPOTENCY_KEY_REQUIRED", "결제 요청 식별값이 필요합니다.");
    const existing = repository.getPaymentAttempts().find((item) => item.idempotencyKey === idempotencyKey);
    if (existing) return existing;
    const hold = repository.getCheckoutHold();
    if (!hold || hold.state !== CHECKOUT_HOLD.HELD) throw new DomainError("CHECKOUT_HOLD_REQUIRED", "결제 가능 상태를 다시 확인해 주세요.", true);
    const activePrice = price();
    const timestamp = nowIso(clock);
    const attempt = {
      id: `payment-attempt-${repository.getPaymentAttempts().length + 1}`,
      applicationId: repository.getApplication().id,
      holdId: hold.id,
      state: PAYMENT.PENDING,
      amount: activePrice.amount,
      currency: activePrice.currency,
      idempotencyKey,
      mockResolution: null,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    repository.savePaymentAttempt(attempt);
    log("PAYMENT_ATTEMPT_STARTED", { paymentAttemptId: attempt.id });
    return applyPaymentResult(attempt, mockOutcome, { deferParticipation });
  }

  function retryPayment(options = {}) {
    prepareCheckout();
    return startPayment(options);
  }

  function refreshPayment() {
    const attempts = repository.getPaymentAttempts();
    const current = attempts[attempts.length - 1];
    if (!current) return null;
    if (current.state === PAYMENT.SUCCEEDED && !repository.getParticipation()) {
      createParticipation(repository.getCheckoutHold());
      return current;
    }
    if (current.state === PAYMENT.PROCESSING && current.mockResolution) {
      return applyPaymentResult(current, current.mockResolution);
    }
    return current;
  }

  function promoteWaitlist() {
    const participation = repository.getParticipation();
    if (!participation || participation.state !== PARTICIPATION.ACTIVE || participation.slotAllocation !== SLOT_ALLOCATION.WAITLISTED) {
      throw new DomainError("WAITLIST_PROMOTION_UNAVAILABLE", "승격할 참가 대기 상태가 없습니다.");
    }
    participation.slotAllocation = SLOT_ALLOCATION.CONFIRMED;
    participation.participantNumber = deterministicNumber(user().mockUserId);
    repository.saveParticipation(participation);
    log("WAITLIST_PROMOTED", { participationId: participation.id });
    return participation;
  }

  return { prepareCheckout, promoteWaitlist, refreshPayment, retryPayment, saveAgreements, saveParticipantInfo, startApplication, startPayment };
}

module.exports = { DomainError, createTransactionService, deterministicNumber };
