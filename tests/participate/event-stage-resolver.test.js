const test = require("node:test");
const assert = require("node:assert/strict");
const { EVENT_STAGE } = require("../../server/participate/constants");
const { resolveEventStage } = require("../../server/participate/event-stage-resolver");

const base = {
  timezone: "Asia/Seoul",
  eventStartAt: "2027-06-14T06:00:00+09:00",
  eventEndAt: "2027-06-15T21:00:00+09:00",
  ridePreparationAt: "2027-05-31T00:00:00+09:00",
  rideCheckAt: "2027-06-07T00:00:00+09:00",
  countdownAt: "2027-06-13T06:00:00+09:00",
  seasonClearUntil: "2027-06-18T21:00:00+09:00"
};

test("event stage follows confirmation facts and time boundaries", () => {
  assert.equal(resolveEventStage(base, "2027-04-01T00:00:00+09:00").stage, EVENT_STAGE.PREPARING);
  assert.equal(resolveEventStage({ ...base, coreConfirmedAt: "2027-01-01T00:00:00+09:00" }, "2027-04-01T00:00:00+09:00").stage, EVENT_STAGE.CORE_CONFIRMED);
  assert.equal(resolveEventStage({ ...base, spotsConfirmedAt: "2027-02-01T00:00:00+09:00" }, "2027-04-01T00:00:00+09:00").stage, EVENT_STAGE.SPOTS_CONFIRMED);
  assert.equal(resolveEventStage(base, "2027-05-31T00:00:00+09:00").stage, EVENT_STAGE.RIDE_PREPARATION);
  assert.equal(resolveEventStage(base, "2027-06-07T00:00:00+09:00").stage, EVENT_STAGE.RIDE_CHECK);
  assert.equal(resolveEventStage(base, "2027-06-13T06:00:00+09:00").stage, EVENT_STAGE.COUNTDOWN);
  assert.equal(resolveEventStage(base, "2027-06-14T06:00:00+09:00").stage, EVENT_STAGE.LIVE);
  assert.equal(resolveEventStage(base, "2027-06-16T06:00:00+09:00").stage, EVENT_STAGE.SEASON_CLEAR);
});

test("stage override wins and preparation warns when spots are missing", () => {
  assert.equal(resolveEventStage({ ...base, stageOverride: EVENT_STAGE.LIVE }, "2027-04-01T00:00:00+09:00").stage, EVENT_STAGE.LIVE);
  const result = resolveEventStage(base, "2027-05-31T00:00:00+09:00");
  assert.equal(result.warnings[0].code, "SPOTS_NOT_CONFIRMED_FOR_RIDE_PREPARATION");
});

test("ISO timezone offsets resolve the Korean event boundary", () => {
  const result = resolveEventStage(base, "2027-06-13T21:00:00Z");
  assert.equal(result.stage, EVENT_STAGE.LIVE);
});
