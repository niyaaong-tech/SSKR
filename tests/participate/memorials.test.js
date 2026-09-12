const test = require("node:test");
const assert = require("node:assert/strict");
const { collections, create } = require("../../web/app/memorial-store");
const { canAccess, memorialAccess } = require("../../web/app/domain");

const owner = { id: "owner", linked: true };
const other = { id: "other", linked: true };
const items = [
  { id: "own-public", ownerUserId: "owner", eventTitle: "SSKR 2026", title: "공개 기록", summary: "소개", visibility: "PUBLIC", publishStatus: "PUBLISHED" },
  { id: "own-private", ownerUserId: "owner", eventTitle: "SSKR 2024", title: "개인 기록", summary: "", visibility: "PRIVATE", publishStatus: "PUBLISHED" },
  { id: "other-public", ownerUserId: "other", eventTitle: "SSKR 2025", title: "다른 기록", summary: "", visibility: "PUBLIC", publishStatus: "PUBLISHED" },
  { id: "draft", ownerUserId: "other", eventTitle: "SSKR 2027", title: "초안", summary: "", visibility: "PUBLIC", publishStatus: "DRAFT" }
];
function storage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return { getItem: (key) => values.get(key), setItem: (key, value) => values.set(key, value) };
}

test("public discovery excludes own records, private records and unpublished drafts", () => {
  assert.deepEqual(collections(items, owner).public.map((item) => item.id), ["other-public"]);
  assert.deepEqual(collections(items, owner).mine.map((item) => item.id), ["own-public", "own-private"]);
  assert.deepEqual(collections(items, {}).public.map((item) => item.id), ["own-public", "other-public"]);
  assert.equal(collections(items, { id: "owner", linked: false }).mine.length, 0);
  assert.equal(collections([], owner).public.length, 0);
});

test("own memorial routes require login but no current event participation", () => {
  for (const route of ["/app/memorials/mine", "/app/memorials/mine/own-private"]) {
    assert.deepEqual(canAccess(route, { linked: false }), { allowed: false, reason: "AUTH_REQUIRED", returnTo: route });
    assert.equal(canAccess(route, { linked: true, relation: "NONE" }).allowed, true);
  }
  assert.equal(canAccess("/app/memorials/other-public", { linked: false }).allowed, true);
});

test("ownership is required for writes even to publicly visible records", () => {
  const store = create(items, storage());
  for (const account of [{}, { id: "owner", linked: false }, other]) {
    assert.throws(() => store.update("own-public", account, { title: "변경", summary: "", visibility: "PRIVATE" }), /내 메모리얼만/);
  }
  assert.throws(() => store.update("missing", owner, {}), /내 메모리얼만/);
  assert.throws(() => store.update("draft", other, { title: "변경", summary: "", visibility: "PUBLIC" }), /내 메모리얼만/);
  assert.equal(store.all()[0].title, "공개 기록");
});

test("visibility and copy persist across reload while immutable event and ownership stay intact", () => {
  const memory = storage();
  const store = create(items, memory);
  store.update("own-public", owner, { title: "  바다로 간 하루  ", summary: "다시 보는 여정", visibility: "PRIVATE", ownerUserId: "other", eventTitle: "SSKR 2099", publishStatus: "DRAFT" });
  const restored = create(items, memory).all();
  const updated = restored.find((item) => item.id === "own-public");
  assert.equal(updated.title, "바다로 간 하루");
  assert.equal(updated.visibility, "PRIVATE");
  assert.equal(updated.ownerUserId, "owner");
  assert.equal(updated.eventTitle, "SSKR 2026");
  assert.equal(updated.publishStatus, "PUBLISHED");
  assert.equal(collections(restored, {}).public.some((item) => item.id === "own-public"), false);
  assert.equal(memorialAccess(updated, other).allowed, false);
  assert.equal(memorialAccess(updated, owner).allowed, true);
  assert.equal(collections(restored, owner).mine.length, 2);
  assert.equal(items[0].visibility, "PUBLIC");
});

test("invalid data and storage failures never report a successful save", () => {
  const store = create(items, storage());
  assert.throws(() => store.update("own-public", owner, { title: " ", summary: "", visibility: "PUBLIC" }), /제목/);
  assert.throws(() => store.update("own-public", owner, { title: "이름", summary: "가".repeat(301), visibility: "PUBLIC" }), /소개/);
  assert.throws(() => store.update("own-public", owner, { title: "이름", summary: "", visibility: "INVALID" }), /공개 범위/);
  const broken = create(items, { getItem() { return "invalid JSON"; }, setItem() { throw new Error("Quota exceeded"); } });
  assert.deepEqual(broken.all(), items);
  assert.throws(() => broken.update("own-public", owner, { title: "이름", summary: "", visibility: "PUBLIC" }), /저장하지 못했습니다/);
  const poisoned = create(items, storage({ "sskr.mock.memorials": JSON.stringify({ "own-public": { title: "이름", summary: "", visibility: "INVALID" } }) }));
  assert.deepEqual(poisoned.all(), items);
});
