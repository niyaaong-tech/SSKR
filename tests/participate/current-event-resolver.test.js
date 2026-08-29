const test = require("node:test");
const assert = require("node:assert/strict");
const { resolveCurrentEvent } = require("../../server/participate/current-event-resolver");

const event = (id, start, overrides = {}) => ({
  id,
  eventStartAt: start,
  eventEndAt: new Date(new Date(start).getTime() + 36 * 60 * 60 * 1000).toISOString(),
  seasonClearUntil: new Date(new Date(start).getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(),
  ...overrides
});

test("live and season-clear editions remain the current event", () => {
  const live = event("current", "2027-06-14T00:00:00Z");
  const next = event("next", "2028-06-14T00:00:00Z", { coreConfirmedAt: "2027-08-01T00:00:00Z" });
  assert.equal(resolveCurrentEvent([live, next], "2027-06-14T12:00:00Z").event.id, "current");
  assert.equal(resolveCurrentEvent([live, next], "2027-06-16T00:00:00Z").event.id, "current");
});

test("a publishable next edition becomes current after the prior clear window", () => {
  const prior = event("prior", "2027-06-14T00:00:00Z");
  const next = event("next", "2028-06-14T00:00:00Z", { coreConfirmedAt: "2027-08-01T00:00:00Z" });
  assert.equal(resolveCurrentEvent([prior, next], "2027-08-02T00:00:00Z").event.id, "next");
});
