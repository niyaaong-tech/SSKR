(() => {
  const session = window.SSKR_MOCK_SESSION;
  const account = window.SSKR_ACCOUNT_LINK;

  class ParticipateApiError extends Error {
    constructor(result) {
      super(result?.error?.userMessage || "현재 상태를 다시 확인해 주세요.");
      this.code = result?.error?.code || "PARTICIPATE_REQUEST_FAILED";
      this.retryable = result?.error?.retryable === true;
      this.context = result?.context || null;
    }
  }

  async function request(endpoint, payload = {}) {
    const response = await fetch(`/api/participate/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        snapshot: payload.snapshot === undefined ? session.getSnapshot() : payload.snapshot,
        mockSessionId: session.getSessionId(),
        scenario: payload.scenario || session.getScenario(),
        account: { linked: account.isAccountLinked(), provider: account.getLinkedProvider() }
      })
    });
    const result = await response.json();
    session.save(result.mockSnapshot || result.context?.mockSnapshot);
    if (!result.ok) throw new ParticipateApiError(result);
    return result;
  }

  window.SSKR_PARTICIPATE_API = Object.freeze({
    context: () => request("context"),
    application: (action, payload) => request("application", { action, ...payload }),
    checkout: () => request("checkout", { action: "PREPARE" }),
    payment: (action, payload) => request("payment", { action, ...payload }),
    mock: (action, payload) => request("mock", { action, ...payload }),
    reset() { session.reset(); }
  });
})();
