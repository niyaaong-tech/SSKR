const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "../..");
test("HOME exploration preview has public routes, shared assets and valid script", () => {
  const html = fs.readFileSync(path.join(root, "web/tests/home-explore/index.html"), "utf8");
  const config = JSON.parse(fs.readFileSync(path.join(root, "vercel.json"), "utf8"));
  for (const source of ["/tests/home-explore", "/tests/home-explore/"]) {
    assert.ok(config.rewrites.some(route => route.source === source && route.destination === "/web/tests/home-explore/index.html"));
  }
  assert.match(html, /name="robots" content="noindex, nofollow"/);
  assert.equal((html.match(/data-spot="/g) || []).length, 4);
  for (const name of ["gangneung", "pyeongchang", "goesan", "gunsan"]) {
    assert.ok(fs.existsSync(path.join(root, "web/home/assets", "memory-" + name + "-v02.jpg")));
  }
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  assert.doesNotThrow(() => new vm.Script(script));
});
