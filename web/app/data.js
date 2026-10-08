(() => {
  window.SSKR_APP_DATA = Object.freeze({
    memorials: window.SSKR_MEMORIAL_FIXTURE.memorials,
    notices: [
      { id: "notice-spot", date: "2027.05.18", category: "SPOT", title: "2027 공식 스팟 1차 공개", body: "공식 출발·피니시와 주요 미션 스팟 정보를 공개했습니다." },
      { id: "notice-safety", date: "2027.05.12", category: "SAFETY", title: "참가 전 안전 장비 안내", body: "헬멧과 보호 장구, 바이크 기본 점검 항목을 확인해 주세요." }
    ]
  });
})();
