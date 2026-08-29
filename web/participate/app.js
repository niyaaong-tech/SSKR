(() => {
  const data = window.SSKR_PARTICIPATE_DATA;
  const accountLink = window.SSKR_ACCOUNT_LINK;
  const api = window.SSKR_PARTICIPATE_API;
  const modeB = window.SSKR_MODE_B;
  const modeC = window.SSKR_MODE_C;
  if (!data || !accountLink || !api || !modeB || !modeC) return;

  const SURFACE_MODES = Object.freeze({ LOADING: "MODE_LOADING", REVIEW: "MODE_A", AUTH_GATE: "MODE_AUTH", APPLICATION: "MODE_B", LOBBY: "MODE_C", ERROR: "MODE_ERROR" });
  const views = [...document.querySelectorAll("[data-surface-mode]")];
  const primaryAction = document.querySelector("#primary-action");
  const primaryLabel = primaryAction.querySelector("span");
  const applicationRoot = document.querySelector("#mode-b");
  const lobbyRoot = document.querySelector("#mode-c");
  let context = null;
  let surfaceMode = SURFACE_MODES.LOADING;
  let pending = false;

  function renderMarketing() {
    const benefitGrid = document.querySelector("#benefit-grid");
    benefitGrid.innerHTML = data.benefits.map((benefit) => `<article class="benefit-card" data-key="${benefit.key}"><button class="benefit-trigger" type="button" aria-expanded="false" aria-controls="benefit-${benefit.key}"><span class="benefit-visual" aria-hidden="true"></span><span class="benefit-number">${benefit.number}</span><span class="benefit-copy"><strong>${benefit.title}</strong><small>${benefit.summary}</small></span><span class="benefit-open" aria-hidden="true">＋</span></button><div class="benefit-detail" id="benefit-${benefit.key}"><p>${benefit.description}</p><small>${benefit.details}</small></div></article>`).join("");
    const cards = [...benefitGrid.querySelectorAll(".benefit-card")];
    const resetCards = () => {
      benefitGrid.classList.remove("has-selection");
      cards.forEach((card) => { card.classList.remove("is-selected"); card.style.order = ""; card.querySelector("button").setAttribute("aria-expanded", "false"); });
    };
    cards.forEach((card) => card.querySelector("button").addEventListener("click", () => {
      const close = card.classList.contains("is-selected");
      resetCards();
      if (close) return;
      benefitGrid.classList.add("has-selection");
      card.classList.add("is-selected");
      card.style.order = "-1";
      card.querySelector("button").setAttribute("aria-expanded", "true");
    }));
    window.addEventListener("keydown", (event) => { if (event.key === "Escape") resetCards(); });
    document.querySelector("#manager-title").textContent = data.manager.title;
    document.querySelector("#manager-description").textContent = data.manager.description;
    document.querySelector("#manager-flow").innerHTML = data.manager.steps.map((step) => `<li class="manager-step"><div class="manager-step-copy"><span>${step.phase}</span><strong>${step.title}</strong><small>${step.note}</small></div><i class="manager-visual manager-visual--${step.visual}" aria-hidden="true"></i></li>`).join("");
    document.querySelector("#manager-promises").innerHTML = data.manager.promises.map((item) => `<li class="manager-promise"><b aria-hidden="true">${item.icon}</b><span><strong>${item.title}</strong>${item.note}</span></li>`).join("");
  }

  function renderEvent(nextContext) {
    const { event, price } = nextContext;
    document.documentElement.dataset.eventState = event.registrationState.toLowerCase();
    document.querySelector("#event-season").textContent = event.editionLabel;
    document.querySelector("#event-status").textContent = event.registrationLabel;
    document.querySelector("#event-category").textContent = event.category;
    document.querySelector("#event-title-line").textContent = event.publicTitle;
    document.querySelector("#event-subtitle").textContent = "참가 신청";
    document.querySelector("#event-description").textContent = event.description;
    const facts = [
      { icon: "₩", label: "참가비", value: price?.displayAmount || "확인 중", note: "1인 기준 · 부가세 포함" },
      { icon: "▣", label: "신청 기간", value: event.applicationPeriodDisplay, note: "선착순 마감" },
      { icon: "⚑", label: "행사 일시", value: event.eventDateDisplay, note: "1박 2일" },
      { icon: "◎", label: "모집 정원", value: event.capacityDisplay, note: event.capacityNote }
    ];
    document.querySelector("#event-facts").innerHTML = facts.map((fact) => `<div class="event-fact"><dt><i aria-hidden="true">${fact.icon}</i>${fact.label}</dt><dd>${fact.value}<small>${fact.note}</small></dd></div>`).join("");
  }

  function focusActive(view, shouldFocus) {
    if (!shouldFocus) return;
    const heading = view.querySelector("h2");
    if (!heading) return;
    window.requestAnimationFrame(() => {
      if (window.matchMedia("(max-width: 760px)").matches && surfaceMode !== SURFACE_MODES.REVIEW) view.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
      heading.focus({ preventScroll: true });
    });
  }

  function showMode(nextMode, { focus = true } = {}) {
    surfaceMode = nextMode;
    document.documentElement.dataset.surfaceMode = surfaceMode;
    views.forEach((view) => {
      const active = view.dataset.surfaceMode === surfaceMode;
      view.hidden = !active;
      view.classList.toggle("is-active", active);
      view.setAttribute("aria-hidden", String(!active));
      if (active) focusActive(view, focus);
    });
  }

  function setPending(value) {
    pending = value;
    document.documentElement.dataset.requestPending = String(value);
    primaryAction.disabled = value || context?.surface?.primaryAction?.enabled === false;
    document.querySelectorAll(".transaction-primary, .transaction-secondary, .mock-promote").forEach((button) => { if (value) button.disabled = true; });
  }

  function renderContext(nextContext, options = {}) {
    context = nextContext;
    renderEvent(context);
    primaryLabel.textContent = context.surface.primaryAction?.label || "신청 상태 확인";
    primaryAction.disabled = context.surface.primaryAction?.enabled === false;
    if (context.surface.mode === SURFACE_MODES.REVIEW) showMode(SURFACE_MODES.REVIEW, options);
    else if (context.surface.mode === SURFACE_MODES.APPLICATION) { modeB.render(applicationRoot, context, handlers); showMode(SURFACE_MODES.APPLICATION, options); }
    else if (context.surface.mode === SURFACE_MODES.LOBBY) { modeC.render(lobbyRoot, context, handlers); showMode(SURFACE_MODES.LOBBY, options); }
  }

  function renderError(error) {
    document.querySelector("#surface-error-message").textContent = error.message || "현재 상태를 다시 확인해 주세요.";
    showMode(SURFACE_MODES.ERROR);
  }

  async function run(action, { focus = true } = {}) {
    if (pending) return;
    setPending(true);
    try {
      renderContext(await action(), { focus });
    } catch (error) {
      if (error.context?.surface) renderContext(error.context, { focus: false });
      else renderError(error);
      const active = views.find((view) => !view.hidden);
      if (active && !active.querySelector(".request-error")) active.insertAdjacentHTML("afterbegin", `<p class="request-error" role="alert">${error.message || "현재 상태를 다시 확인해 주세요."}</p>`);
    } finally { setPending(false); }
  }

  async function startApplication() {
    if (!context?.surface?.primaryAction?.enabled || pending) return;
    if (!accountLink.isAccountLinked()) { showMode(SURFACE_MODES.AUTH_GATE); return; }
    await run(() => api.application("START"));
  }

  async function completeMockAccountLink(provider) {
    accountLink.linkAccount(provider);
    await run(async () => {
      const resolved = await api.context();
      return resolved.surface.mode === SURFACE_MODES.REVIEW ? api.application("START") : resolved;
    });
  }

  const handlers = {
    saveAgreements: (agreements) => run(() => api.application("SAVE_AGREEMENTS", { agreements })),
    saveParticipant: (participant) => run(() => api.application("SAVE_PARTICIPANT_INFO", { participant })),
    startPayment: (mockOutcome, retry) => run(async () => {
      if (!retry) await api.checkout();
      return api.payment(retry ? "RETRY" : "START", { idempotencyKey: `${Date.now()}-${Math.random().toString(16).slice(2)}`, mockOutcome });
    }),
    refreshPayment: () => run(() => api.payment("REFRESH")),
    promoteWaitlist: () => run(() => api.mock("PROMOTE_WAITLIST"))
  };

  primaryAction.addEventListener("click", startApplication);
  document.querySelectorAll("[data-provider]").forEach((button) => button.addEventListener("click", () => completeMockAccountLink(button.dataset.provider)));
  document.querySelector("#surface-retry").addEventListener("click", () => run(() => api.context()));
  renderMarketing();
  showMode(SURFACE_MODES.LOADING, { focus: false });
  run(() => api.context(), { focus: false });

  window.SSKR_PARTICIPATE = Object.freeze({
    modes: SURFACE_MODES,
    getContext: () => context,
    getSurfaceMode: () => surfaceMode,
    refresh: () => run(() => api.context()),
    startApplication,
    async resetMock(scenario = "a-open-unlinked") { accountLink.reset(); api.reset(); return run(() => api.mock("RESET", { scenario, snapshot: null })); }
  });
})();
