const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("the participation reset remains visible for every linked account before launch", () => {
  const source = fs.readFileSync(path.join(__dirname, "../../web/participate/account.js"), "utf8");

  assert.match(source, /id="account-reset-participation"/);
  assert.doesNotMatch(source, /resetControl\s*=\s*window\.SSKR_MOCK_SESSION.*isDebug/);
});
