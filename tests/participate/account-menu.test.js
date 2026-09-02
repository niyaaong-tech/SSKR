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

test("participate review keeps account space clear and exposes one shared benefit hint", () => {
  const html = fs.readFileSync(path.join(__dirname, "../../web/participate/index.html"), "utf8");
  const script = fs.readFileSync(path.join(__dirname, "../../web/participate/app.js"), "utf8");
  const styles = fs.readFileSync(path.join(__dirname, "../../web/participate/styles.css"), "utf8");

  assert.doesNotMatch(html, /참가하면 누릴 수 있는 특별한 경험/);
  assert.equal((html.match(/카드를 선택하면 상세 내용을 확인할 수 있습니다\./g) || []).length, 1);
  assert.match(script, /class="benefit-open" aria-hidden="true">↗/);
  assert.doesNotMatch(script, /<span>상세 보기<\/span>/);
  assert.doesNotMatch(script, /style\.order/);
  assert.match(script, /dataset\.selectedIndex = String\(index \+ 1\)/);
  assert.match(styles, /\.benefit-heading \{[^}]*padding-right:/s);
  assert.match(styles, /\.benefit-visual \{[^}]*background-size: cover;/s);
  assert.match(styles, /benefit-kit\.png/);
  assert.match(styles, /data-selected-index="3"[^}]*repeat\(2,minmax\(58px,\.55fr\)\) minmax\(0,4\.5fr\) minmax\(58px,\.55fr\)/);
});
