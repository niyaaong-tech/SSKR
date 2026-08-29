const { EVENT_STAGE } = require("./constants");

const validStages = new Set(Object.values(EVENT_STAGE));
const time = (value) => value ? new Date(value).getTime() : Number.NaN;

function resolveEventStage(event, nowInput = new Date()) {
  const warnings = [];
  const now = new Date(nowInput).getTime();

  if (event.stageOverride && validStages.has(event.stageOverride)) {
    return { stage: event.stageOverride, warnings };
  }

  const preparationAt = time(event.ridePreparationAt);
  if (Number.isFinite(preparationAt) && now >= preparationAt && !event.spotsConfirmedAt) {
    warnings.push({
      code: "SPOTS_NOT_CONFIRMED_FOR_RIDE_PREPARATION",
      severity: "WARNING",
      detail: "준비기간이 시작됐지만 공식 스팟 확정 시각이 없습니다."
    });
  }

  const eventStartAt = time(event.eventStartAt);
  const eventEndAt = time(event.eventEndAt);
  const seasonClearUntil = time(event.seasonClearUntil);
  const countdownAt = time(event.countdownAt);
  const rideCheckAt = time(event.rideCheckAt);

  if (Number.isFinite(eventEndAt) && now > eventEndAt && Number.isFinite(seasonClearUntil) && now <= seasonClearUntil) {
    return { stage: EVENT_STAGE.SEASON_CLEAR, warnings };
  }
  if (Number.isFinite(eventStartAt) && Number.isFinite(eventEndAt) && now >= eventStartAt && now <= eventEndAt) {
    return { stage: EVENT_STAGE.LIVE, warnings };
  }
  if (Number.isFinite(countdownAt) && Number.isFinite(eventStartAt) && now >= countdownAt && now < eventStartAt) {
    return { stage: EVENT_STAGE.COUNTDOWN, warnings };
  }
  if (Number.isFinite(rideCheckAt) && now >= rideCheckAt) {
    return { stage: EVENT_STAGE.RIDE_CHECK, warnings };
  }
  if (Number.isFinite(preparationAt) && now >= preparationAt) {
    return { stage: EVENT_STAGE.RIDE_PREPARATION, warnings };
  }
  if (event.spotsConfirmedAt) return { stage: EVENT_STAGE.SPOTS_CONFIRMED, warnings };
  if (event.coreConfirmedAt) return { stage: EVENT_STAGE.CORE_CONFIRMED, warnings };
  return { stage: EVENT_STAGE.PREPARING, warnings };
}

module.exports = { resolveEventStage };
