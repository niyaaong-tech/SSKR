(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.SSKR_APP_DOMAIN = Object.freeze(api);
})(typeof globalThis !== "undefined" ? globalThis : this, () => {
  const PERSONAL_ROUTES = new Set(["/app/my", "/app/preparation"]);
  function normalizePath(pathname = "/app") {
    const clean = String(pathname).split("?")[0].replace(/\/+$/, "") || "/app";
    return clean === "/app" || clean.startsWith("/app/") ? clean : "/app";
  }
  function safeReturnTo(value, fallback = "/app") {
    if (typeof value !== "string" || !value.startsWith("/app") || value.startsWith("//") || value.includes("://")) return fallback;
    return normalizePath(value);
  }
  function currentRelation(context = {}) {
    if (context.participation?.state === "ACTIVE") return "ACTIVE";
    if (["PENDING", "PROCESSING"].includes(context.payment?.state)) return "PROCESSING";
    if (context.payment?.state === "FAILED") return "FAILED";
    if (context.application?.paymentDeferredAt || context.surface?.variant === "PAYMENT_DEFERRED") return "PAYMENT";
    if (context.application && ["DRAFT", "SUBMITTED", "COMPLETED"].includes(context.application.state || "DRAFT")) {
      const step = context.surface?.step;
      if (step === "STEP_4") return "PAYMENT";
      if (step) return step;
      return "DRAFT";
    }
    return "NONE";
  }
  function currentEventAction(context = {}) {
    const relation = currentRelation(context);
    const actions = {
      NONE: { label: "SSKR 참가하기", href: "/participate" }, DRAFT: { label: "참가 신청 이어하기", href: "/participate" },
      STEP_1: { label: "참가 신청 이어하기", href: "/participate" }, STEP_2: { label: "참가 신청 이어하기", href: "/participate" }, STEP_3: { label: "참가 신청 이어하기", href: "/participate" },
      PAYMENT: { label: "SSKR 참가비용 결제하기", href: "/participate?resumePayment=1" }, FAILED: { label: "SSKR 참가비용 결제하기", href: "/participate" },
      PROCESSING: { label: "결제 상태 확인", href: "/participate" }, ACTIVE: { label: "현재 SSKR 보기", href: "/app/current" }
    };
    return { ...actions[relation], relation };
  }
  function canAccess(pathname, session = {}) {
    const path = normalizePath(pathname);
    if (PERSONAL_ROUTES.has(path) && !session.linked) return { allowed: false, reason: "AUTH_REQUIRED", returnTo: path };
    if (path === "/app/preparation" && session.relation !== "ACTIVE") return { allowed: false, reason: "ACTIVE_PARTICIPATION_REQUIRED", returnTo: "/app/current" };
    return { allowed: true, reason: null, returnTo: null };
  }
  function memorialAccess(memorial, account = {}) {
    if (!memorial) return { allowed: false, reason: "NOT_FOUND" };
    if (memorial.publishStatus !== "PUBLISHED") return { allowed: false, reason: "NOT_PUBLISHED" };
    if (memorial.visibility === "PUBLIC") return { allowed: true, reason: null };
    return account.linked === true && memorial.ownerUserId === account.id ? { allowed: true, reason: null } : { allowed: false, reason: "PRIVATE" };
  }
  return { PERSONAL_ROUTES, canAccess, currentEventAction, currentRelation, memorialAccess, normalizePath, safeReturnTo };
});
