(() => {
  const session = window.SSKR_MOCK_SESSION;
  const account = window.SSKR_ACCOUNT_LINK;
  let initialization;
  const backend = window.SSKR_BACKEND = { mode: 'pending', account: null, async request(resource, method = 'GET', body, headers = {}) {
    const response = await fetch('/api/backend?resource=' + resource, { method, credentials: 'same-origin', headers: { 'Content-Type': 'application/json', 'X-SSKR-Request': '1', ...headers }, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new ParticipateApiError(result);
    return result;
  }, initialize() {
    if (!initialization) initialization = backend.request('runtime').then(result => { if (!['mock', 'supabase'].includes(result.mode)) throw Error('서버 설정을 확인하지 못했습니다.'); backend.mode = result.mode; return result.mode; }).catch(error => { initialization = null; throw error; });
    return initialization;
  } };

  class ParticipateApiError extends Error {
    constructor(result) {
      super(result?.error?.userMessage || "현재 상태를 다시 확인해 주세요.");
      this.code = result?.error?.code || "PARTICIPATE_REQUEST_FAILED";
      this.retryable = result?.error?.retryable === true;
      this.context = result?.context || null;
    }
  }

  async function request(endpoint, payload = {}) {
    await backend.initialize();
    if (backend.mode === 'supabase') {
      const response = await fetch(`/api/participate/${endpoint}`, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json', 'X-SSKR-Request': '1' }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new ParticipateApiError(result);
      if (result.account) backend.account = result.account;
      return result;
    }
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
    initialize: () => backend.initialize(),
    context: () => request("context"),
    application: (action, payload) => request("application", { action, ...payload }),
    checkout: () => request("checkout", { action: "PREPARE" }),
    payment: (action, payload) => request("payment", { action, ...payload }),
    mock: (action, payload) => request("mock", { action, ...payload }),
    reset() { session.reset(); }
  });
})();
