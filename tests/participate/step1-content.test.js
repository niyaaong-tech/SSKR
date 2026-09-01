const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { groups } = require("../../web/participate/step1-content");

test("step 1 contains four groups and sixteen uniquely addressed illustrations", () => {
  assert.equal(groups.length, 4);
  assert.deepEqual(groups.map((group) => group.items.length), [4, 4, 4, 4]);
  assert.equal(new Set(groups.flatMap((group) => group.items.map((item) => item.key))).size, 16);
  const assets = groups.flatMap((group) => group.items.map((item) => item.asset));
  assert.equal(new Set(assets).size, 16);
  assert.equal(assets.every((asset) => /^\.\/assets\/participation-guide-[1-4]-[1-4]\.png$/.test(asset)), true);
  assets.forEach((asset) => {
    const file = path.resolve(__dirname, "../../web/participate", asset);
    const png = fs.readFileSync(file);
    assert.equal(png.readUInt32BE(16), 621);
    assert.equal(png.readUInt32BE(20), 621);
  });
});

test("step 1 content keeps the canonical group titles", () => {
  assert.deepEqual(groups.map((group) => group.title), [
    "제공되는 경유지와 경로 정보를 사전에 확인해야 합니다.",
    "하루의 주행은 스스로 완성해야 합니다.",
    "목적지에 더 빨리 도착하거나 더 많은 스팟을 경유하는 것은 SSKR의 목표가 아닙니다.",
    "무엇보다 안전이 최우선입니다."
  ]);
});
