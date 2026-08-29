(() => {
  const data = window.SSKR_PARTICIPATE_DATA;
  const accountLink = window.SSKR_ACCOUNT_LINK;
  if (!data || !accountLink) return;

  const SURFACE_MODES = Object.freeze({
    REVIEW: "MODE_A",
    AUTH_GATE: "MODE_AUTH",
    APPLICATION: "MODE_B"
  });

  const relationState = {
    application: "NONE",
    participation: "NONE"
  };

  let surfaceMode = SURFACE_MODES.REVIEW;
  const params = new URLSearchParams(window.location.search);
  const eventStateKey = data.eventStates[params.get("event")] ? params.get("event") : data.event.status;
  const eventState = data.eventStates[eventStateKey] || data.eventStates.open;

  document.documentElement.dataset.eventState = eventStateKey;
  document.querySelector("#event-season").textContent = data.event.edition;
  document.querySelector("#event-status").textContent = eventState.label;
  document.querySelector("#event-category").textContent = data.event.category;
  document.querySelector("#event-title-line").textContent = data.event.title;
  document.querySelector("#event-subtitle").textContent = data.event.subtitle;
  document.querySelector("#event-description").textContent = data.event.description;

  const facts = [
    { icon: "₩", label: "참가비", value: data.event.fee, note: data.event.feeNote },
    { icon: "▣", label: "신청 기간", value: data.event.applicationPeriod, note: data.event.applicationNote },
    { icon: "⚑", label: "행사 일시", value: data.event.eventDate, note: data.event.eventDateNote },
    { icon: "◎", label: "모집 정원", value: data.event.capacity, note: data.event.capacityNote }
  ];
  document.querySelector("#event-facts").innerHTML = facts.map((fact) => `
    <div class="event-fact">
      <dt><i aria-hidden="true">${fact.icon}</i>${fact.label}</dt>
      <dd>${fact.value}<small>${fact.note}</small></dd>
    </div>
  `).join("");

  const surfaceViews = [...document.querySelectorAll("[data-surface-mode]")];
  const primaryAction = document.querySelector("#primary-action");

  const renderSurfaceMode = (nextMode, { focus = true } = {}) => {
    surfaceMode = nextMode;
    document.documentElement.dataset.surfaceMode = surfaceMode;

    surfaceViews.forEach((view) => {
      const active = view.dataset.surfaceMode === surfaceMode;
      view.hidden = !active;
      view.classList.toggle("is-active", active);
      view.setAttribute("aria-hidden", String(!active));
    });

    primaryAction.querySelector("span").textContent = "신청 계속하기";

    if (!focus) return;
    const activeView = surfaceViews.find((view) => view.dataset.surfaceMode === surfaceMode);
    const heading = activeView?.querySelector("h2");
    if (!activeView || !heading) return;
    window.requestAnimationFrame(() => {
      if (window.matchMedia("(max-width: 760px)").matches && surfaceMode !== SURFACE_MODES.REVIEW) {
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        activeView.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
      }
      heading.focus({ preventScroll: true });
    });
  };

  const startApplication = () => {
    if (!accountLink.isAccountLinked()) {
      renderSurfaceMode(SURFACE_MODES.AUTH_GATE);
      return;
    }

    relationState.application = "DRAFT";
    renderSurfaceMode(SURFACE_MODES.APPLICATION);
  };

  const completeMockAccountLink = (provider) => {
    accountLink.linkAccount(provider);
    relationState.application = "DRAFT";
    renderSurfaceMode(SURFACE_MODES.APPLICATION);
  };

  primaryAction.addEventListener("click", startApplication);
  document.querySelectorAll("[data-provider]").forEach((button) => {
    button.addEventListener("click", () => completeMockAccountLink(button.dataset.provider));
  });

  const benefitGrid = document.querySelector("#benefit-grid");
  benefitGrid.innerHTML = data.benefits.map((benefit) => `
    <article class="benefit-card" data-key="${benefit.key}">
      <button class="benefit-trigger" type="button" aria-expanded="false" aria-controls="benefit-${benefit.key}">
        <span class="benefit-visual" aria-hidden="true"></span>
        <span class="benefit-number">${benefit.number}</span>
        <span class="benefit-copy"><strong>${benefit.title}</strong><small>${benefit.summary}</small></span>
        <span class="benefit-open" aria-hidden="true">＋</span>
      </button>
      <div class="benefit-detail" id="benefit-${benefit.key}">
        <p>${benefit.description}</p>
        <small>${benefit.details}</small>
      </div>
    </article>
  `).join("");

  const cards = [...benefitGrid.querySelectorAll(".benefit-card")];
  const resetCards = () => {
    benefitGrid.classList.remove("has-selection");
    cards.forEach((card) => {
      card.classList.remove("is-selected");
      card.style.order = "";
      card.querySelector("button").setAttribute("aria-expanded", "false");
    });
  };
  const selectCard = (card) => {
    const close = card.classList.contains("is-selected");
    resetCards();
    if (close) return;
    benefitGrid.classList.add("has-selection");
    card.classList.add("is-selected");
    card.style.order = "-1";
    card.querySelector("button").setAttribute("aria-expanded", "true");
  };
  cards.forEach((card) => card.querySelector("button").addEventListener("click", () => selectCard(card)));
  window.addEventListener("keydown", (event) => { if (event.key === "Escape") resetCards(); });

  document.querySelector("#manager-title").textContent = data.manager.title;
  document.querySelector("#manager-description").textContent = data.manager.description;
  document.querySelector("#manager-flow").innerHTML = data.manager.steps.map((step) => `
    <li class="manager-step">
      <div class="manager-step-copy"><span>${step.phase}</span><strong>${step.title}</strong><small>${step.note}</small></div>
      <i class="manager-visual manager-visual--${step.visual}" aria-hidden="true"></i>
    </li>
  `).join("");
  document.querySelector("#manager-promises").innerHTML = data.manager.promises.map((item) => `
    <li class="manager-promise"><b aria-hidden="true">${item.icon}</b><span><strong>${item.title}</strong>${item.note}</span></li>
  `).join("");

  renderSurfaceMode(SURFACE_MODES.REVIEW, { focus: false });

  window.SSKR_PARTICIPATE = Object.freeze({
    modes: SURFACE_MODES,
    getSurfaceMode: () => surfaceMode,
    getRelationState: () => ({ ...relationState }),
    startApplication,
    resetMockAccount() {
      accountLink.reset();
      relationState.application = "NONE";
      renderSurfaceMode(SURFACE_MODES.REVIEW, { focus: false });
    }
  });
})();
