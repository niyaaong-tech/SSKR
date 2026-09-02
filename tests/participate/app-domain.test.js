const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { canAccess, currentEventAction, memorialAccess, safeReturnTo } = require("../../web/app/domain");

test("APP current-event CTA follows only the current application relation", () => {
  assert.equal(currentEventAction({}).label, "SSKR 참가하기");
  assert.equal(currentEventAction({ application: {}, surface: { step: "STEP_2" } }).label, "참가 신청 이어하기");
  assert.equal(currentEventAction({ application: {}, surface: { step: "STEP_4" } }).label, "SSKR 참가비용 결제하기");
  assert.equal(currentEventAction({ payment: { state: "FAILED" } }).label, "SSKR 참가비용 결제하기");
  assert.equal(currentEventAction({ payment: { state: "PROCESSING" } }).label, "결제 상태 확인");
  assert.equal(currentEventAction({ participation: { state: "ACTIVE" } }).href, "/app/current");
});

test("APP permissions keep public resources open and gate personal resources", () => {
  assert.equal(canAccess("/app/spots", { linked: false, relation: "NONE" }).allowed, true);
  assert.equal(canAccess("/app/memorials/public", { linked: false, relation: "NONE" }).allowed, true);
  assert.equal(canAccess("/app/my", { linked: false, relation: "NONE" }).reason, "AUTH_REQUIRED");
  assert.equal(canAccess("/app/preparation", { linked: true, relation: "NONE" }).reason, "ACTIVE_PARTICIPATION_REQUIRED");
  assert.equal(canAccess("/app/preparation", { linked: true, relation: "ACTIVE" }).allowed, true);
});

test("returnTo accepts only safe internal APP paths", () => {
  assert.equal(safeReturnTo("/app/my"), "/app/my");
  assert.equal(safeReturnTo("https://evil.example/app"), "/app");
  assert.equal(safeReturnTo("//evil.example/app"), "/app");
  assert.equal(safeReturnTo("/participate"), "/app");
  assert.equal(safeReturnTo("/application"), "/app");
});

test("memorial visibility is independent of the current event", () => {
  const publicItem = { publishStatus: "PUBLISHED", visibility: "PUBLIC", eventId: "sskr-2025", ownerUserId: "other" };
  const privateItem = { publishStatus: "PUBLISHED", visibility: "PRIVATE", eventId: "sskr-2024", ownerUserId: "owner" };
  assert.equal(memorialAccess(publicItem, {}).allowed, true);
  assert.equal(memorialAccess(privateItem, { id: "owner", linked: false }).reason, "PRIVATE");
  assert.equal(memorialAccess(privateItem, { id: "owner", linked: true }).allowed, true);
  assert.equal(memorialAccess(privateItem, { id: "other", linked: true }).reason, "PRIVATE");
});

test("APP navigation binds one delegated click handler and does not rebind while rendering", () => {
  const source = fs.readFileSync(path.join(__dirname, "../../web/app/app.js"), "utf8");
  assert.doesNotMatch(source, /function bindLinks|bindLinks\(\)/);
  assert.match(source, /document\.addEventListener\("click", handleAppLink\)/);
  assert.match(source, /safe !== currentPath/);
  assert.match(source, /window\.addEventListener\("popstate", renderRouteSafely\)/);
  assert.match(source, /if \(!context\).*pendingRoute/s);
});

test("APP exposes the required route and mock scenario matrix", () => {
  const source = fs.readFileSync(path.join(__dirname, "../../web/app/app.js"), "utf8");
  for (const route of ["/app/current", "/app/spots", "/app/memorials", "/app/my", "/app/preparation", "/app/notices"]) assert.match(source, new RegExp(route.replaceAll("/", "\\/")));
  for (const scenario of ["guest", "logged-in-no-application", "application-step1", "application-step2", "application-step3", "application-payment", "processing", "failed", "active", "past-only", "current+past", "public-memorial", "private-owner", "private-other", "blocked"]) assert.match(source, new RegExp(scenario.replace(/[+]/g, "\\+")));
});

test("HOME and router expose distinct participate and SSKR manager gateways", () => {
  const home = fs.readFileSync(path.join(__dirname, "../../web/home/index.html"), "utf8");
  const vercel = JSON.parse(fs.readFileSync(path.join(__dirname, "../../vercel.json"), "utf8"));
  assert.match(home, /href="\/participate"[^>]*>[^<]*<small>03 \/ PARTICIPATE/s);
  assert.match(home, /href="\/app"[^>]*>[^<]*<small>04 \/ MANAGER<\/small><strong>SSKR 매니저/s);
  assert.ok(vercel.rewrites.some((route) => route.source === "/app/:path*" && route.destination === "/web/app/index.html"));
});
