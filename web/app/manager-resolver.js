(function (root, factory) {
  const domain = typeof module === "object" && module.exports ? require("./domain") : root.SSKR_APP_DOMAIN;
  const api = factory(domain);
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.SSKR_MANAGER_RESOLVER = Object.freeze(api);
})(typeof globalThis !== "undefined" ? globalThis : this, (domain) => {
  const STEP_LABELS = {
    STEP_1: "진행 방식 확인",
    STEP_2: "필수 동의",
    STEP_3: "유형·정보 입력",
    STEP_4: "결제"
  };

  function action(label, href, code, enabled = true) {
    return { label, href, code, enabled };
  }

  function status(label, value, tone = "neutral") {
    return { label, value, tone };
  }

  function prepItem(label, state) {
    return { label, state };
  }

  function resolveManager(context = {}, source = {}, options = {}) {
    const relation = domain.currentRelation(context);
    const event = context.event || source.event || {};
    const participant = context.participation || null;
    const account = context.account || { linked: false };
    const variant = options.variant || "default";
    const postEvent = event.resolvedStage === "SEASON_CLEAR" || variant === "post-event";
    const important = relation === "ACTIVE" && variant === "important";
    const waiting = relation === "ACTIVE" && variant === "waiting";
    const active = relation === "ACTIVE";
    const participantAccess = {
      available: active,
      message: "참가 확정되면 SSKR 관련 안내가 제공됩니다."
    };

    let primaryAction;
    if (postEvent && active) primaryAction = action("나의 기록 확인하기", "/app/my", "VIEW_RESULT");
    else if (relation === "PAYMENT") primaryAction = action("결제 이어하기", "/participate?resumePayment=1", "RECOVER_PAYMENT");
    else if (relation === "FAILED") primaryAction = action("결제 이어하기", "/participate", "RECOVER_PAYMENT");
    else if (relation === "PROCESSING") primaryAction = action("결제 상태 확인하기", "/participate", "CHECK_PAYMENT");
    else if (["DRAFT", "STEP_1", "STEP_2", "STEP_3"].includes(relation)) primaryAction = action("참가 신청 이어하기", "/participate", "CONTINUE_APPLICATION");
    else if (active && !waiting) primaryAction = action("출발지 선택하기", "/app/current", "SELECT_START");
    else if (active) primaryAction = action("현재 SSKR 보기", "/app/current", "VIEW_CURRENT");
    else primaryAction = action(account.linked ? "SSKR 참가하기" : "참가 안내 보기", "/participate", "START_APPLICATION");

    let heroTitle = "SSKR 2027, 길 위의 하루를 준비하세요.";
    let heroCopy = "동해권 출발지 중 하나를 선택하고 집결 정보를 확인하세요.";
    if (!account.linked) {
      heroTitle = "공개된 SSKR를 먼저 둘러보세요.";
      heroCopy = "스팟과 메모리얼은 로그인 없이 확인할 수 있습니다.";
    } else if (relation === "NONE") {
      heroTitle = "이번 SSKR의 여정을 시작해 보세요.";
      heroCopy = "공개된 스팟을 둘러보고 참가 안내를 확인할 수 있습니다.";
    } else if (["DRAFT", "STEP_1", "STEP_2", "STEP_3"].includes(relation)) {
      heroTitle = "참가 신청을 이어서 완료해 주세요.";
      heroCopy = `${STEP_LABELS[context.surface?.step] || "참가 정보 확인"} 단계부터 계속할 수 있습니다.`;
    } else if (["FAILED", "PAYMENT"].includes(relation)) {
      heroTitle = "결제를 완료하면 참가가 확정됩니다.";
      heroCopy = "저장된 참가 정보를 유지한 채 결제를 다시 진행할 수 있습니다.";
    } else if (relation === "PROCESSING") {
      heroTitle = "결제 결과를 확인하고 있습니다.";
      heroCopy = "중복 결제 없이 현재 처리 상태를 확인해 주세요.";
    } else if (waiting) {
      heroTitle = "현재 필요한 참가 준비를 모두 마쳤습니다.";
      heroCopy = "다음 운영 안내를 준비하고 있습니다. 새 공지가 등록되면 이곳에서 알려드릴게요.";
    } else if (postEvent) {
      heroTitle = "완성한 SSKR의 하루를 다시 만나보세요.";
      heroCopy = "주행 결과와 시즌 메모리얼을 나의 기록에서 확인할 수 있습니다.";
    }

    const participantNumber = participant?.participantNumber || "신청 전";
    const tier = participant?.registrationTierCode === "PLATINUM" ? "PLATINUM" : participant?.registrationTierCode === "STANDARD" ? "STANDARD" : "선택 전";
    const relationLabel = active ? "참가 확정" : relation === "PROCESSING" ? "결제 확인 중" : ["FAILED", "PAYMENT"].includes(relation) ? "결제 필요" : relation === "NONE" ? (account.linked ? "참가 전" : "로그인 전") : "신청 진행 중";
    const progress = waiting ? { complete: 7, total: 7 } : active ? { complete: 5, total: 7 } : { complete: 0, total: 7 };

    const preparation = active ? {
      complete: progress.complete,
      total: progress.total,
      title: waiting ? "참가 준비 완료" : "참가 준비",
      items: waiting ? [
        prepItem("참가 신청 완료", "done"), prepItem("필수 동의 완료", "done"), prepItem("참가비 결제 완료", "done"),
        prepItem("출발지 선택 완료", "done"), prepItem("바이크 정보 확인 완료", "done"), prepItem("참가 키트 준비 완료", "done"), prepItem("최종 안내 확인 완료", "done")
      ] : [
        prepItem("참가 신청 완료", "done"), prepItem("필수 동의 완료", "done"), prepItem("참가비 결제 완료", "done"),
        prepItem("출발지 선택 진행 중", "current"), prepItem("바이크 정보 대기", "waiting"), prepItem("최종 안내 확인 대기", "waiting")
      ]
    } : null;

    const publicMemorial = (source.memorials || []).find((item) => item.visibility === "PUBLIC" && domain.memorialAccess(item, account).allowed);
    const curation = [
      (source.spots || []).some((item) => item.public) ? { id: "spots", eyebrow: "NEW SPOTS", title: "새로 공개된 스팟 4곳", copy: "이번 시즌의 출발과 미션 스팟을 먼저 둘러보세요.", href: "/app/spots", image: "/assets/memory-gangneung-v02.jpg" } : null,
      publicMemorial ? { id: "memorial", eyebrow: "MEMORIAL", title: "2026 SSKR 메모리얼", copy: "지난 참가자들이 완성한 하루를 만나보세요.", href: `/app/memorials/${publicMemorial.id}`, image: publicMemorial.image } : null,
      source.manager?.guide?.published ? { id: "guide", eyebrow: "REGION GUIDE", title: "출발 전 둘러볼 지역 가이드", copy: "동해의 아침부터 서해의 노을까지 이어지는 지역 이야기.", href: "/app/spots", image: source.manager.guide.image } : null
    ].filter(Boolean);

    return {
      relation,
      participantAccess,
      alert: important ? { title: "집결 안내가 변경되었습니다.", copy: "선택한 출발지의 집결 위치와 입장 시간을 다시 확인해 주세요.", href: "/app/notices", label: "변경 내용 확인" } : null,
      primaryAction,
      currentEvent: {
        title: event.publicTitle || source.event?.title || "SSKR 2027",
        editionLabel: event.editionLabel || "2027 SEASON",
        heroTitle,
        heroCopy,
        image: source.manager?.heroImage || "/assets/sskr_road1.png",
        status: [
          status("CURRENT EVENT", event.publicTitle || "SSKR 2027"),
          status("참가 상태", relationLabel, active ? "ok" : "neutral"),
          status("참가 번호", participantNumber),
          status("참가 유형", tier),
          status("행사까지", postEvent ? "시즌 종료" : "D-18", postEvent ? "neutral" : "accent"),
          status("준비 현황", active ? `${progress.complete} / ${progress.total}` : "참가 후 시작")
        ]
      },
      preparation,
      plan: active ? { spots: 6, plans: 1, route: "강릉 → 제천 → 태안", href: "/app/spots" } : null,
      kit: active ? { state: waiting ? "준비 완료" : "준비 중", schedule: waiting ? "배송 안내 확인 가능" : "6월 초 발송 예정", image: source.manager?.kitImage || "/participate/assets/benefit-kit.png" } : null,
      notices: (source.manager?.notices || source.notices || []).slice(0, 2),
      curation
    };
  }

  return { resolveManager };
});
