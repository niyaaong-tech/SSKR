const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("the participation reset remains visible for every linked account before launch", () => {
  const source = fs.readFileSync(path.join(__dirname, "../../web/participate/account.js"), "utf8");

  assert.match(source, /id="account-reset-participation"/);
  assert.doesNotMatch(source, /resetControl\s*=\s*window\.SSKR_MOCK_SESSION.*isDebug/);
});

test("account menu supports toggle, fresh return resolution, and APP my page", () => {
  const source = fs.readFileSync(path.join(__dirname, "../../web/participate/account.js"), "utf8");
  assert.match(source, /aria-expanded.*=== "true".*closeMenu\(\).*openMenu\(\)/s);
  assert.match(source, /data-account-back.*callbacks\.resolve/s);
  assert.match(source, /href="\/app\/my"/);
});

test("participate and APP load the same account control component", () => {
  const participate = fs.readFileSync(path.join(__dirname, "../../web/participate/index.html"), "utf8");
  const app = fs.readFileSync(path.join(__dirname, "../../web/app/index.html"), "utf8");
  const shared = fs.readFileSync(path.join(__dirname, "../../web/shared/account-control.js"), "utf8");
  assert.match(participate, /\/web\/shared\/account-control\.js/);
  assert.match(app, /\/web\/shared\/account-control\.js/);
  assert.match(shared, /clickPinned/);
  assert.match(shared, /event\.key === "Escape"/);
});
