(() => {
  window.SSKR_APP_DATA = Object.freeze({
    spots: [
      { id: "gangneung", name: "강릉 안목", region: "강원", type: "START", summary: "동해의 첫 빛과 함께 시작하는 공식 스팟", image: "/assets/memory-gangneung-v02.jpg", public: true },
      { id: "pyeongchang", name: "평창 고개", region: "강원", type: "SCENIC", summary: "능선과 굽이진 길이 만나는 산악 구간", image: "/assets/memory-pyeongchang-v02.jpg", public: true },
      { id: "goesan", name: "괴산 산막이", region: "충북", type: "MISSION", summary: "호수와 산길을 잇는 중부 미션 스팟", image: "/assets/memory-goesan-v02.jpg", public: true },
      { id: "gunsan", name: "군산 비응항", region: "전북", type: "FINISH", summary: "서해의 낙조로 하루를 닫는 피니시 스팟", image: "/assets/memory-gunsan-v02.jpg", public: true }
    ],
    memorials: window.SSKR_MEMORIAL_FIXTURE.memorials,
    notices: [
      { id: "notice-spot", date: "2027.05.18", category: "SPOT", title: "2027 공식 스팟 1차 공개", body: "공식 출발·피니시와 주요 미션 스팟 정보를 공개했습니다." },
      { id: "notice-safety", date: "2027.05.12", category: "SAFETY", title: "참가 전 안전 장비 안내", body: "헬멧과 보호 장구, 바이크 기본 점검 항목을 확인해 주세요." }
    ],
    manager: {
      heroImage: "/assets/sskr_road1.png",
      kitImage: "/participate/assets/benefit-kit.png",
      notices: [
        { id: "notice-operation", date: "05.24", category: "운영", title: "운영 일정 업데이트", body: "참가 키트와 현장 운영 일정을 확인해 주세요." },
        { id: "notice-meeting", date: "05.21", category: "집결", title: "집결 안내 변경", body: "출발지별 집결 위치와 입장 시간이 변경되었습니다." }
      ],
      guide: { published: true, image: "/assets/memory-cheongju-v02.jpg" }
    },
    past: window.SSKR_MEMORIAL_FIXTURE.memorials.filter(item => item.ownerUserId === "mock-rider-0271").map(item => ({ eventId: item.eventId, year: 2026, result: item.result, tier: "EARLY", participantNumber: item.participantNumber, memorialId: item.id }))
  });
})();
