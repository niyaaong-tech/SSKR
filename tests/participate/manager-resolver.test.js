const test = require("node:test");
const assert = require("node:assert/strict");
const { resolveManager } = require("../../web/app/manager-resolver");

const source = {
  event: { title: "SSKR 2027" },
  spots: [{ id: "one", public: true }],
  memorials: [{ id: "public-one", publishStatus: "PUBLISHED", visibility: "PUBLIC", image: "/public.jpg" }],
  manager: {
    notices: [{ title: "운영 일정 업데이트" }, { title: "집결 안내 변경" }],
    guide: { published: true, image: "/guide.jpg" }
  }
};

const event = { publicTitle: "SSKR 2027", editionLabel: "2027 SEASON", resolvedStage: "SPOTS_CONFIRMED" };
const account = (linked) => ({ id: "mock-rider-0271", linked, profile: { name: "김라이더" } });
const active = {
  event,
  account: account(true),
  participation: { state: "ACTIVE", participantNumber: "#0271", registrationTierCode: "PLATINUM" },
  payment: { state: "SUCCEEDED" }
};

test("manager presents a useful public state for guests and logged-in non-participants", () => {
  const guest = resolveManager({ event, account: account(false) }, source);
  const logged = resolveManager({ event, account: account(true) }, source);
  assert.equal(guest.primaryAction.label, "참가 안내 보기");
  assert.equal(logged.primaryAction.label, "SSKR 참가하기");
  assert.equal(logged.currentEvent.status[1].value, "참가 전");
  assert.notEqual(logged.currentEvent.status[2].value, "NONE");
  assert.equal(logged.preparation, null);
});

test("manager prioritizes application and payment recovery", () => {
  const progress = resolveManager({ event, account: account(true), application: {}, surface: { step: "STEP_2" } }, source);
  const payment = resolveManager({ event, account: account(true), application: {}, surface: { step: "STEP_4" }, payment: { state: "FAILED" } }, source);
  assert.equal(progress.primaryAction.code, "CONTINUE_APPLICATION");
  assert.match(progress.currentEvent.heroCopy, /필수 동의/);
  assert.equal(payment.primaryAction.code, "RECOVER_PAYMENT");
});

test("active manager exposes start selection, preparation, kit, notices and permission-safe curation", () => {
  const model = resolveManager(active, source);
  assert.equal(model.primaryAction.code, "SELECT_START");
  assert.deepEqual([model.preparation.complete, model.preparation.total], [5, 7]);
  assert.equal(model.kit.state, "준비 중");
  assert.equal(model.notices.length, 2);
  assert.equal(model.curation.length, 3);
  assert.ok(model.curation.some((item) => item.id === "memorial"));
});

test("waiting, important change and season-clear states have explicit presentations", () => {
  const waiting = resolveManager(active, source, { variant: "waiting" });
  const important = resolveManager(active, source, { variant: "important" });
  const post = resolveManager({ ...active, event: { ...event, resolvedStage: "SEASON_CLEAR" } }, source);
  assert.equal(waiting.preparation.complete, 7);
  assert.match(waiting.currentEvent.heroTitle, /모두 마쳤습니다/);
  assert.equal(important.alert.title, "집결 안내가 변경되었습니다.");
  assert.equal(post.primaryAction.code, "VIEW_RESULT");
});

test("curation never bypasses memorial publication or visibility permissions", () => {
  const privateSource = {
    ...source,
    memorials: [{ id: "private", ownerUserId: "another", publishStatus: "PUBLISHED", visibility: "PRIVATE", image: "/private.jpg" }]
  };
  const draftSource = {
    ...source,
    memorials: [{ id: "draft", publishStatus: "DRAFT", visibility: "PUBLIC", image: "/draft.jpg" }]
  };
  assert.equal(resolveManager({ event, account: account(false) }, privateSource).curation.some((item) => item.id === "memorial"), false);
  assert.equal(resolveManager(active, draftSource).curation.some((item) => item.id === "memorial"), false);
});
