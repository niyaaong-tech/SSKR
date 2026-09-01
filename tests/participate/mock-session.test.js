const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function loadMockSession(search) {
  const storage = new Map();
  const window = {
    location: { search, href: `http://127.0.0.1:8080/participate/${search}` },
    localStorage: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, String(value)),
      removeItem: (key) => storage.delete(key)
    }
  };
  window.history = {
    state: null,
    replaceState: (_state, _title, url) => { window.location.href = String(url); }
  };
  const source = fs.readFileSync(path.join(__dirname, "../../web/participate/mock-session.js"), "utf8");
  vm.runInNewContext(source, { window, URL, URLSearchParams });
  return { session: window.SSKR_MOCK_SESSION, window };
}

test("an explicit mock reset can replace the query scenario for the active session", () => {
  const { session, window } = loadMockSession("?scenario=c-confirmed-spots&mockSession=qa-reset&mockControls=1");
  assert.equal(session.getScenario(), "c-confirmed-spots");

  session.save({ schemaVersion: 1, scenario: "a-open-linked" });
  session.replaceScenario("a-open-linked");

  assert.equal(session.getScenario(), "a-open-linked");
  assert.equal(session.getSnapshot().scenario, "a-open-linked");
  assert.equal(session.isDebug(), true);
  assert.match(window.location.href, /scenario=a-open-linked/);
});
