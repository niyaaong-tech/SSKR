const { EVENT_STAGE } = require("./constants");
const { resolveEventStage } = require("./event-stage-resolver");

function resolveCurrentEvent(events, nowInput = new Date()) {
  const resolved = events.map((event) => ({ event, ...resolveEventStage(event, nowInput) }));
  const active = resolved.find(({ stage }) => stage === EVENT_STAGE.LIVE || stage === EVENT_STAGE.SEASON_CLEAR);
  if (active) return active;

  const publishable = resolved
    .filter(({ event, stage }) => event.isCurrent || stage !== EVENT_STAGE.PREPARING)
    .sort((a, b) => new Date(a.event.eventStartAt) - new Date(b.event.eventStartAt));

  return publishable[0] || resolved.sort((a, b) => new Date(a.event.eventStartAt) - new Date(b.event.eventStartAt))[0] || null;
}

module.exports = { resolveCurrentEvent };
