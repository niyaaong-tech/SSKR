(() => {
  window.SSKR_APP_DATA = Object.freeze({
    event: { id: "sskr-2027", year: 2027, title: "SSKR 2027", date: "2027.06.14 — 06.15", stage: "SPOTS CONFIRMED", description: "해가 뜨는 동해에서 해가 지는 서해까지, 스스로 설계한 하루를 완성합니다." },
    spots: [
      { id: "gangneung", name: "강릉 안목", region: "강원", type: "START", summary: "동해의 첫 빛과 함께 시작하는 공식 스팟", image: "/assets/memory-gangneung-v02.jpg", public: true },
      { id: "pyeongchang", name: "평창 고개", region: "강원", type: "SCENIC", summary: "능선과 굽이진 길이 만나는 산악 구간", image: "/assets/memory-pyeongchang-v02.jpg", public: true },
      { id: "goesan", name: "괴산 산막이", region: "충북", type: "MISSION", summary: "호수와 산길을 잇는 중부 미션 스팟", image: "/assets/memory-goesan-v02.jpg", public: true },
      { id: "gunsan", name: "군산 비응항", region: "전북", type: "FINISH", summary: "서해의 낙조로 하루를 닫는 피니시 스팟", image: "/assets/memory-gunsan-v02.jpg", public: true }
    ],
    memorials: [
      { id: "memorial-2026-0271", ownerUserId: "mock-rider-0271", participationId: "participation-sskr-2026-0271", eventId: "sskr-2026", eventTitle: "SSKR 2026", publishStatus: "PUBLISHED", visibility: "PUBLIC", publicSlug: "sunset-0271", title: "동해에서 서해까지", ownerName: "김라이더", summary: "열두 시간 동안 이어진 길과 여덟 개의 기억.", image: "/assets/memory-gunsan-v02.jpg", result: "완주" },
      { id: "memorial-2025-0118", ownerUserId: "mock-rider-0118", participationId: "participation-sskr-2025-0118", eventId: "sskr-2025", eventTitle: "SSKR 2025", publishStatus: "PUBLISHED", visibility: "PUBLIC", publicSlug: "coastline-0118", title: "능선을 넘어 바다로", ownerName: "박선셋", summary: "비와 안개를 지나 마주한 마지막 노을.", image: "/assets/memory-pyeongchang-v02.jpg", result: "완주" },
      { id: "memorial-private-owner", ownerUserId: "mock-rider-0271", participationId: "participation-sskr-2024-0271", eventId: "sskr-2024", eventTitle: "SSKR 2024", publishStatus: "PUBLISHED", visibility: "PRIVATE", publicSlug: null, title: "나만의 SSKR 기록", ownerName: "김라이더", summary: "공개하지 않은 개인 메모리얼입니다.", image: "/assets/memory-chungju-v02.jpg", result: "완주" }
    ],
    notices: [
      { id: "notice-spot", date: "2027.05.18", category: "SPOT", title: "2027 공식 스팟 1차 공개", body: "공식 출발·피니시와 주요 미션 스팟 정보를 공개했습니다." },
      { id: "notice-safety", date: "2027.05.12", category: "SAFETY", title: "참가 전 안전 장비 안내", body: "헬멧과 보호 장구, 바이크 기본 점검 항목을 확인해 주세요." }
    ],
    past: [{ eventId: "sskr-2026", year: 2026, result: "완주", tier: "STANDARD", participantNumber: "#0271", memorialId: "memorial-2026-0271" }]
  });
})();
