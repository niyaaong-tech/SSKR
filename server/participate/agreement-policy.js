const BASE_AGREEMENTS = Object.freeze([
  { code: "TERMS", title: "SSKR 참가 및 서비스 이용약관", summary: "참가 자격, 안전 책임, 운영 규칙과 취소·환불 기준을 확인합니다.", required: true },
  { code: "PRIVACY", title: "개인정보 수집·이용 동의", summary: "신청과 행사 운영에 필요한 최소 개인정보 처리 범위를 확인합니다.", required: true },
  { code: "LOCATION", title: "개인위치정보 수집·이용 동의", summary: "스팟 체크인과 주행 기록에 필요한 위치정보 처리 범위를 확인합니다.", required: true },
  { code: "MARKETING", title: "광고·마케팅 정보 수신", summary: "차기 모집, 굿즈·프로모션과 제휴 이벤트 소식을 받습니다.", required: false }
]);

const THIRD_PARTY_AGREEMENT = Object.freeze({
  code: "THIRD_PARTY",
  title: "개인정보 제3자 제공 동의",
  summary: "독립적인 제3자 제공이 필요한 행사에서만 적용됩니다.",
  required: true
});

function getAgreementDefinitions(event = {}) {
  const versions = event.agreementVersions || {};
  const items = event.requiresThirdPartyAgreement
    ? [...BASE_AGREEMENTS.slice(0, 3), THIRD_PARTY_AGREEMENT, BASE_AGREEMENTS[3]]
    : [...BASE_AGREEMENTS];
  return items.map((item) => ({ ...item, version: versions[item.code] || "2027.1" }));
}

function requiredAgreementsComplete(application, event) {
  const accepted = new Map((application?.agreements || []).map((item) => [item.code, item]));
  return getAgreementDefinitions(event).filter((item) => item.required).every((definition) => {
    const acceptance = accepted.get(definition.code);
    return acceptance?.accepted === true && acceptance.version === definition.version;
  });
}

module.exports = { BASE_AGREEMENTS, getAgreementDefinitions, requiredAgreementsComplete };
