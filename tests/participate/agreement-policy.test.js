const test = require("node:test");
const assert = require("node:assert/strict");
const { getAgreementDefinitions, requiredAgreementsComplete } = require("../../server/participate/agreement-policy");

const versions = { TERMS: "1", PRIVACY: "1", LOCATION: "1", THIRD_PARTY: "1", MARKETING: "1" };

test("third-party consent exists only when the event configuration requires it", () => {
  assert.equal(getAgreementDefinitions({ agreementVersions: versions }).some((item) => item.code === "THIRD_PARTY"), false);
  const conditional = getAgreementDefinitions({ agreementVersions: versions, requiresThirdPartyAgreement: true });
  assert.equal(conditional.filter((item) => item.required).length, 4);
  assert.equal(conditional.find((item) => item.code === "THIRD_PARTY").required, true);
});

test("optional marketing consent never gates required agreement completion", () => {
  const event = { agreementVersions: versions };
  const agreements = getAgreementDefinitions(event).map((item) => ({ ...item, accepted: item.required }));
  assert.equal(requiredAgreementsComplete({ agreements }, event), true);
});
