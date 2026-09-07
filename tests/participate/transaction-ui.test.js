const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const read = (name) => fs.readFileSync(path.join(__dirname, `../../web/participate/${name}`), "utf8");

test("optional agreements remain expanded and preserve independent selection", () => {
  const source = read("mode-b.js");
  assert.doesNotMatch(source, /id="optional-agreements-panel" hidden|선택 항목 보기|선택 항목 접기/);
  assert.match(source, /optionalAll/);
  assert.match(source, /submit\.disabled = !requiredAll\.checked/);
});

test("tier selection renders a live server-backed summary", () => {
  const source = read("mode-b.js");
  assert.match(source, /tier-selection-summary/);
  assert.match(source, /context\.tiers\?\.find/);
  assert.match(source, /addEventListener\("change", updateTierSummary\)/);
});

test("completion screen links to SSKR manager and omits legacy participant lobby", () => {
  const source = read("mode-c.js");
  assert.match(source, /SSKR 매니저로 이동/);
  assert.match(source, /참가 신청 정보 확인/);
  assert.doesNotMatch(source, /service-entrances|lobby-manager|edit-bike-info/);
});
