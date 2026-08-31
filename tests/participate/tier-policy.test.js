const test = require("node:test");
const assert = require("node:assert/strict");
const { baseEvent, priceTiers } = require("../../server/participate/mock-scenarios");
const { resolveRegistrationTiers } = require("../../server/participate/tier-policy");

const resolve = (now, mutate = () => {}) => {
  const event = JSON.parse(JSON.stringify(baseEvent));
  const prices = JSON.parse(JSON.stringify(priceTiers));
  mutate(event, prices);
  return resolveRegistrationTiers({ event, priceTiers: prices, now }).tiers;
};
const byCode = (tiers, code) => tiers.find((tier) => tier.code === code);

test("early access respects sales dates and entry limit", () => {
  assert.equal(byCode(resolve("2027-04-10T10:00:00+09:00"), "EARLY").availability.code, "AVAILABLE");
  assert.equal(byCode(resolve("2027-04-22T10:00:00+09:00"), "EARLY").availability.code, "ENDED");
  const limited = resolve("2027-04-10T10:00:00+09:00", (_event, prices) => { prices.find((item) => item.code === "EARLY").entryCount = 50; });
  assert.equal(byCode(limited, "EARLY").availability.code, "ENTRY_LIMIT_REACHED");
});

test("standard closes while platinum remains available through the later window", () => {
  const tiers = resolve("2027-05-16T10:00:00+09:00");
  assert.equal(byCode(tiers, "STANDARD").availability.code, "ENDED");
  assert.equal(byCode(tiers, "PLATINUM").availability.code, "AVAILABLE");
});

test("platinum uses the extra pool only after base capacity is full", () => {
  const tiers = resolve("2027-05-10T10:00:00+09:00", (event) => { event.capacityPolicy.baseUsed = 300; });
  assert.equal(byCode(tiers, "STANDARD").availability.code, "BASE_CAPACITY_FULL");
  assert.equal(byCode(tiers, "PLATINUM").availability.code, "AVAILABLE");
  assert.equal(byCode(tiers, "PLATINUM").capacityPool, "PLATINUM_EXTRA");
});

test("platinum closes when both base and extra capacity are exhausted", () => {
  const tiers = resolve("2027-05-10T10:00:00+09:00", (event) => {
    event.capacityPolicy.baseUsed = 300;
    event.capacityPolicy.platinumExtraUsed = 60;
  });
  assert.equal(byCode(tiers, "PLATINUM").availability.code, "CAPACITY_FULL");
});
