(() => {
  const data = window.SSKR_PARTICIPATE_DATA;
  if (!data) return;

  const params = new URLSearchParams(window.location.search);
  const eventStateKey = data.eventStates[params.get("event")] ? params.get("event") : data.event.status;
  const accountStateKey = data.accountStates[params.get("account")] ? params.get("account") : data.account.status;
  const eventState = data.eventStates[eventStateKey] || data.eventStates.open;
  const accountState = data.accountStates[accountStateKey] || data.accountStates.guest;
  const action = {
    label: accountState.action || eventState.action,
    href: accountState.href || eventState.href
  };

  document.documentElement.dataset.eventState = eventStateKey;
  document.documentElement.dataset.accountState = accountStateKey;
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

  const primaryAction = document.querySelector("#primary-action");
  primaryAction.href = action.href;
  primaryAction.querySelector("span").textContent = action.label;

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
})();
