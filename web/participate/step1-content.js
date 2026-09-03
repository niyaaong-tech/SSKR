(() => {
  const groups = [
    {
      key: "route-information",
      title: "제공되는 경유지와 경로 정보를 사전에 확인해야 합니다.",
      items: [
        { key: "STEP1_1_1", asset: "./assets/SSKR_pic1-1.png", caption: "경유지 스팟 정보를 제공합니다" },
        { key: "STEP1_1_2", asset: "./assets/SSKR_pic1-2.png", caption: "정해진 주행 루트는 없습니다" },
        { key: "STEP1_1_3", asset: "./assets/SSKR_pic1-3.png", caption: "내비게이션은 별도 서비스를 이용하세요" },
        { key: "STEP1_1_4", asset: "./assets/SSKR_pic1-4.png", caption: "현장 도로상황 변수에 유의해야 합니다" }
      ]
    },
    {
      key: "self-directed-day",
      title: "하루의 주행은 스스로 완성해야 합니다.",
      items: [
        { key: "STEP1_2_1", asset: "./assets/SSKR_pic2-1.png", caption: "일출 전까지 출발지에 도착해야 합니다" },
        { key: "STEP1_2_2", asset: "./assets/SSKR_pic2-2.png", caption: "자신이 경로를 설정합니다" },
        { key: "STEP1_2_3", asset: "./assets/SSKR_pic2-3.png", caption: "도착 장소를 직접 기록합니다" },
        { key: "STEP1_2_4", asset: "./assets/SSKR_pic2-4.png", caption: "일몰 전까지 목적지에 도착합니다" }
      ]
    },
    {
      key: "non-competitive",
      title: "목적지에 더 빨리 도착하거나 더 많은 스팟을 경유하는 것은 SSKR의 목표가 아닙니다.",
      items: [
        { key: "STEP1_3_1", asset: "./assets/SSKR_pic3-1.png", caption: "너무 빠른 도착은 권장하지 않습니다" },
        { key: "STEP1_3_2", asset: "./assets/SSKR_pic3-2.png", caption: "승패 판정이나 참가자 순위 산정은 없습니다" },
        { key: "STEP1_3_3", asset: "./assets/SSKR_pic3-3.png", caption: "자신에게 의미 있는 스팟을 골라 체크인하세요" },
        { key: "STEP1_3_4", asset: "./assets/SSKR_pic3-4.png", caption: "좋은 기억으로 남을 수 있는 주행 계획을 추천합니다" }
      ]
    },
    {
      key: "safety-first",
      title: "무엇보다 안전이 최우선입니다.",
      items: [
        { key: "STEP1_4_1", asset: "./assets/SSKR_pic4-1.png", caption: "스팟 체크인은 주행을 멈춘 상태에서만 가능합니다" },
        { key: "STEP1_4_2", asset: "./assets/SSKR_pic4-2.png", caption: "사전 예정 경유지를 임의로 변경해서 주행해도 됩니다" },
        { key: "STEP1_4_3", asset: "./assets/SSKR_pic4-3.png", caption: "GPS나 체크인 기기에 문제가 있어도 차후 기록을 보완할 수 있습니다" },
        { key: "STEP1_4_4", asset: "./assets/SSKR_pic4-4.png", caption: "사정상 주행을 중단해도 괜찮습니다." }
      ]
    }
  ];

  if (typeof module !== "undefined" && module.exports) module.exports = { groups };
  if (typeof window !== "undefined") window.SSKR_STEP1_CONTENT = Object.freeze({ groups });
})();
