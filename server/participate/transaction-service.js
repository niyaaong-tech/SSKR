const {
  APPLICATION,
  CAPACITY_POOL,
  CHECKOUT_HOLD,
  FULFILLMENT,
  PARTICIPATION,
  PAYMENT,
  PAYMENT_OUTCOME,
  RUN_RESULT,
  SLOT_ALLOCATION
} = require("./constants");
const { acknowledgementComplete, participantInfoComplete, requiredAgreementsComplete } = require("./application-step-resolver");
const { getAgreementDefinitions } = require("./agreement-policy");
const { evaluateCheckoutEligibility } = require("./checkout-policy");
const { findResolvedTier } = require("./tier-policy");

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
  const mockNow = repository.exportSnapshot().mock?.now;
  const clock = options.clock || (() => mockNow ? new Date(mockNow).getTime() : Date.now());
  const log = (code, detail = {}) => repository.appendLog({ code, detail, at: nowIso(clock) });
  const event = () => repository.getCurrentEvent();
  const selectedPrice = (application = repository.getApplication()) => repository.getPriceTiers().find((item) => item.id === application?.priceTierId) || null;
  const user = () => repository.getUserContext();

  function startApplication() {
    if (!user().account?.linked) throw new DomainError("ACCOUNT_LINK_REQUIRED", "소셜 계정 연동이 필요합니다.");
    const current = repository.getApplication();
    if (current && [APPLICATION.DRAFT, APPLICATION.SUBMITTED, APPLICATION.COMPLETED].includes(current.state)) return current;
    const timestamp = nowIso(clock);
    const profile = user().account?.profile || {};
    const application = {
      id: `app-${event().id}-${user().mockUserId}`,
      eventId: event().id,
      userId: user().mockUserId,
      state: APPLICATION.DRAFT,
      acknowledgements: [],
      agreements: getAgreementDefinitions(event()).map((item) => ({ ...item, accepted: false, acceptedAt: null })),
      participant: { name: profile.name || "", phone: profile.phone || "", email: profile.email || "" },
      bike: { maker: "", model: "", className: "" },
      closeReasonCode: null,
      eventConfigVersion: event().configVersion,
      priceTierId: null,
      selectedPriceAmount: null,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    repository.saveApplication(application);
    log("APPLICATION_STARTED", { applicationId: application.id });
    return application;
  }

  function saveAcknowledgement(input = {}) {
    const application = repository.getApplication();
    if (!application || application.state !== APPLICATION.DRAFT) throw new DomainError("APPLICATION_NOT_EDITABLE", "현재 신청서를 수정할 수 없습니다.");
    if (input.acknowledged !== true) throw new DomainError("ACKNOWLEDGEMENT_REQUIRED", "진행 방식과 안내 내용을 확인해 주세요.");
    const timestamp = nowIso(clock);
    application.acknowledgements = [{ code: "PARTICIPATION_GUIDE", contentVersion: event().participationGuideVersion || "2027.1", acknowledgedAt: timestamp }];
    application.updatedAt = timestamp;
    repository.saveApplication(application);
    log("PARTICIPATION_GUIDE_ACKNOWLEDGED", { applicationId: application.id, contentVersion: application.acknowledgements[0].contentVersion });
    return application;
  }

  function saveAgreements(input = {}) {
    const application = repository.getApplication();
    if (!application || application.state !== APPLICATION.DRAFT) throw new DomainError("APPLICATION_NOT_EDITABLE", "현재 신청서를 수정할 수 없습니다.");
    const acceptedCodes = new Set(Array.isArray(input) ? input : Object.entries(input).filter(([, accepted]) => accepted).map(([code]) => code));
    const timestamp = nowIso(clock);
    if (!acknowledgementComplete(application, event())) throw new DomainError("ACKNOWLEDGEMENT_REQUIRED", "참가 진행 방식 안내를 먼저 확인해 주세요.");
    application.agreements = getAgreementDefinitions(event()).map((definition) => ({
      ...definition,
      accepted: acceptedCodes.has(definition.code),
      acceptedAt: acceptedCodes.has(definition.code) ? timestamp : null
    }));
    if (!requiredAgreementsComplete(application, event())) throw new DomainError("REQUIRED_AGREEMENTS_MISSING", "모든 필수 항목에 동의해 주세요.");
    application.updatedAt = timestamp;
    repository.saveApplication(application);
    log("AGREEMENTS_SAVED", { applicationId: application.id, acceptedCount: acceptedCodes.size });
    return application;
  }

  function saveParticipantInfo(input = {}) {
    const application = repository.getApplication();
    if (!application || application.state !== APPLICATION.DRAFT) throw new DomainError("APPLICATION_NOT_EDITABLE", "현재 신청서를 수정할 수 없습니다.");
    if (!requiredAgreementsComplete(application, event())) throw new DomainError("AGREEMENTS_REQUIRED", "필수 동의를 먼저 완료해 주세요.");
    const tier = findResolvedTier({ event: event(), priceTiers: repository.getPriceTiers(), now: new Date(clock()) }, input.priceTierId);
    if (!tier) throw new DomainError("REGISTRATION_TIER_REQUIRED", "참가 유형을 선택해 주세요.");
    if (!tier.availability.selectable) throw new DomainError(tier.availability.code, `${tier.displayName}은 현재 ${tier.availability.label} 상태입니다.`);
    const participant = {
      name: normalizeText(input.name),
      phone: digits(input.phone),
      email: normalizeText(input.email)
    };
    if (!participant.name) throw new DomainError("PARTICIPANT_NAME_REQUIRED", "이름을 입력해 주세요.");
    if (!/^01\d{8,9}$/.test(participant.phone)) throw new DomainError("PARTICIPANT_PHONE_INVALID", "연락 가능한 휴대전화 번호를 확인해 주세요.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(participant.email)) throw new DomainError("PARTICIPANT_EMAIL_INVALID", "연락 가능한 이메일을 확인해 주세요.");
    application.participant = participant;
    application.priceTierId = tier.id;
    application.selectedPriceAmount = tier.amount;
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

  function editParticipantInfo() {
    const application = repository.getApplication();
    if (!application || ![APPLICATION.DRAFT, APPLICATION.SUBMITTED].includes(application.state)) throw new DomainError("APPLICATION_NOT_EDITABLE", "현재 신청서를 수정할 수 없습니다.");
    application.state = APPLICATION.DRAFT;
    application.priceTierId = null;
    application.selectedPriceAmount = null;
    application.updatedAt = nowIso(clock);
    repository.saveApplication(application);
    log("PARTICIPANT_INFO_REOPENED", { applicationId: application.id });
    return application;
  }

  function prepareCheckout() {
    const application = repository.getApplication();
    const currentHold = repository.getCheckoutHold();
    if (currentHold?.state === CHECKOUT_HOLD.HELD) return currentHold;
    if (!acknowledgementComplete(application, event()) || !requiredAgreementsComplete(application, event()) || !participantInfoComplete(application)) throw new DomainError("APPLICATION_INCOMPLETE", "신청 정보를 먼저 완료해 주세요.");
    log("CHECKOUT_REQUESTED", { applicationId: application.id });
    const currentPrice = selectedPrice(application);
    if (currentPrice && application.selectedPriceAmount !== currentPrice.amount) {
      const previousAmount = application.selectedPriceAmount;
      application.selectedPriceAmount = currentPrice.amount;
      application.updatedAt = nowIso(clock);
      repository.saveApplication(application);
      log("CHECKOUT_PRICE_CHANGED", { applicationId: application.id, previousAmount, currentAmount: currentPrice.amount });
      throw new DomainError("PRICE_CHANGED", "참가비가 변경되었습니다. 변경된 금액을 확인한 뒤 다시 진행해 주세요.", true);
    }
    const eligibility = evaluateCheckoutEligibility({ application, event: event(), participation: repository.getParticipation(), price: currentPrice, priceTiers: repository.getPriceTiers(), now: new Date(clock()) });
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
      capacityPool: eligibility.capacityPool,
      priceTierId: currentPrice.id,
      amount: currentPrice.amount,
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
    if (slotAllocation === SLOT_ALLOCATION.CONFIRMED && event().capacityPolicy) {
      const currentEvent = event();
      if (hold.capacityPool === CAPACITY_POOL.PLATINUM_EXTRA) currentEvent.capacityPolicy.platinumExtraUsed = Number(currentEvent.capacityPolicy.platinumExtraUsed || 0) + 1;
      else currentEvent.capacityPolicy.baseUsed = Number(currentEvent.capacityPolicy.baseUsed || 0) + 1;
      repository.saveEvent(currentEvent);
      const tier = selectedPrice(application);
      if (tier?.code === "EARLY") {
        tier.entryCount = Number(tier.entryCount || 0) + 1;
        repository.savePriceTier(tier);
      }
      log("CAPACITY_CONSUMED", { applicationId: application.id, capacityPool: hold.capacityPool, priceTierId: hold.priceTierId });
    }
    const participation = {
      id: `participation-${event().id}-${user().mockUserId}`,
      eventId: event().id,
      userId: user().mockUserId,
      state: PARTICIPATION.ACTIVE,
      slotAllocation,
      registrationTierCode: selectedPrice(application)?.code || null,
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
    const timestamp = nowIso(clock);
    const attempt = {
      id: `payment-attempt-${repository.getPaymentAttempts().length + 1}`,
      applicationId: repository.getApplication().id,
      holdId: hold.id,
      state: PAYMENT.PENDING,
      priceTierId: hold.priceTierId,
      amount: hold.amount,
      currency: selectedPrice()?.currency || "KRW",
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

  function updateAccountProfile(input = {}) {
    const account = user().account;
    if (!account?.linked) throw new DomainError("ACCOUNT_LINK_REQUIRED", "계정 연결이 필요합니다.");
    const profile = {
      ...account.profile,
      name: normalizeText(input.name),
      email: normalizeText(input.email),
      phone: digits(input.phone)
    };
    if (!profile.name) throw new DomainError("PROFILE_NAME_REQUIRED", "이름을 입력해 주세요.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) throw new DomainError("PROFILE_EMAIL_INVALID", "이메일을 확인해 주세요.");
    if (!/^01\d{8,9}$/.test(profile.phone)) throw new DomainError("PROFILE_PHONE_INVALID", "휴대전화 번호를 확인해 주세요.");
    account.profile = profile;
    repository.saveAccount(account);
    log("ACCOUNT_PROFILE_UPDATED", { accountId: account.id });
    return account;
  }

  function saveBikeInfo(input = {}) {
    const participation = repository.getParticipation();
    const deadline = event().bikeInfoDeadlineAt ? new Date(event().bikeInfoDeadlineAt).getTime() : Number.POSITIVE_INFINITY;
    if (participation?.state !== PARTICIPATION.ACTIVE || new Date(clock()).getTime() > deadline) throw new DomainError("BIKE_INFO_EDIT_UNAVAILABLE", "현재 바이크 정보를 수정할 수 없습니다.");
    const bike = { maker: normalizeText(input.maker), model: normalizeText(input.model), className: normalizeText(input.className) };
    participation.bikeInfo = Object.values(bike).some(Boolean) ? bike : null;
    repository.saveParticipation(participation);
    const application = repository.getApplication();
    if (application) { application.bike = bike; repository.saveApplication(application); }
    log("BIKE_INFO_UPDATED", { participationId: participation.id });
    return participation;
  }

  return { editParticipantInfo, prepareCheckout, promoteWaitlist, refreshPayment, retryPayment, saveAcknowledgement, saveAgreements, saveBikeInfo, saveParticipantInfo, startApplication, startPayment, updateAccountProfile };
}

module.exports = { DomainError, createTransactionService, deterministicNumber };
