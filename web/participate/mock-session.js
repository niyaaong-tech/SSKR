(() => {
  const SESSION_KEY = "sskr.mock.participateSession";
  const SCENARIO_KEY = "sskr.mock.participateScenario";
  const params = new URLSearchParams(window.location.search);
  const queryScenario = params.get("scenario");
  const sessionId = params.get("mockSession") || "default";
  const sessionKey = `${SESSION_KEY}.${sessionId}`;
  const scenarioKey = `${SCENARIO_KEY}.${sessionId}`;

  const parse = (value) => {
    try { return value ? JSON.parse(value) : null; }
    catch { return null; }
  };
  const read = (key) => {
    try { return window.localStorage.getItem(key); }
    catch { return null; }
  };
  const write = (key, value) => {
    try { window.localStorage.setItem(key, value); }
    catch { /* The app remains usable without persistent browser storage. */ }
  };
  const remove = (key) => {
    try { window.localStorage.removeItem(key); }
    catch { /* Ignore restricted storage contexts. */ }
  };

  window.SSKR_MOCK_SESSION = Object.freeze({
    getSessionId() { return sessionId; },
    getScenario() { return queryScenario || read(scenarioKey) || "a-open-unlinked"; },
    getSnapshot() {
      const snapshot = parse(read(sessionKey));
      if (queryScenario && snapshot?.scenario !== queryScenario) return null;
      return snapshot?.schemaVersion === 1 ? snapshot : null;
    },
    save(snapshot) {
      if (!snapshot) return;
      write(sessionKey, JSON.stringify(snapshot));
      write(scenarioKey, snapshot.scenario || this.getScenario());
    },
    reset() { remove(sessionKey); remove(scenarioKey); },
    isDebug() { return params.get("mockControls") === "1" || Boolean(queryScenario); }
  });
})();
