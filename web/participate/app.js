(() => {
  const data = window.SSKR_PARTICIPATE_DATA;
  const accountLink = window.SSKR_ACCOUNT_LINK;
  const api = window.SSKR_PARTICIPATE_API;
  const modeB = window.SSKR_MODE_B;
  const modeC = window.SSKR_MODE_C;
  const accountUI = window.SSKR_ACCOUNT_UI;
  if (!data || !accountLink || !api || !modeB || !modeC || !accountUI) return;

  const SURFACE_MODES = Object.freeze({ LOADING: "MODE_LOADING", REVIEW: "MODE_A", AUTH_GATE: "MODE_AUTH", APPLICATION: "MODE_B", LOBBY: "MODE_C", ACCOUNT: "MODE_ACCOUNT", ERROR: "MODE_ERROR" });
  const views = [...document.querySelectorAll("[data-surface-mode]")];
  const primaryAction = document.querySelector("#primary-action");
  const primaryLabel = primaryAction.querySelector("span");
  const applicationRoot = document.querySelector("#mode-b");
  const lobbyRoot = document.querySelector("#mode-c");
  const accountRoot = document.querySelector("#mode-account");
  const accountShell = document.querySelector("#account-shell");
  const entryParams = new URLSearchParams(window.location.search);
  const resumePaymentOnEntry = entryParams.get("resumePayment") === "1" && entryParams.get("view") !== "guide";
  let guideOnly = entryParams.get("view") === "guide";
  let context = null;
  let surfaceMode = SURFACE_MODES.LOADING;
  let pending = false;
  let authNotice = '';
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function consumeAuthError() {
    const url = new URL(location.href);
    if (!url.searchParams.has('authError')) return;
    authNotice = url.searchParams.get('authError') === 'cancelled'
      ? '로그인이 취소되었습니다. 필요할 때 다시 로그인해 주세요.'
      : '로그인 연결이 만료되었습니다. 다시 로그인해 주세요.';
    url.searchParams.delete('authError'); entryParams.delete('authError');
    history.replaceState(history.state, '', url.pathname + url.search + url.hash);
    try { sessionStorage.removeItem('sskr.route-save-after-login'); } catch { /* Restricted storage. */ }
  }
  function showAuthNotice() {
    if (!authNotice) return;
    const active = views.find(view => !view.hidden);
    const target = active?.querySelector('#public-event-guide') || active;
    if (!target) return;
    document.querySelectorAll('[data-auth-notice]').forEach(node => node.remove());
    target.insertAdjacentHTML('afterbegin', '<p class="account-toast" data-auth-notice role="alert">' + esc(authNotice) + '</p>');
    authNotice = '';
  }
  async function resolveContext() {
    try { return await api.context(); }
    catch (error) {
      if (window.SSKR_BACKEND?.mode !== 'supabase' || error.code !== 'AUTH_REQUIRED') throw error;
      try {
        const draft = JSON.parse(sessionStorage.getItem('sskr.route-editor') || 'null');
        if (draft?.backend === 'supabase' && draft.ownerId) sessionStorage.setItem('sskr.route-relogin-owner', draft.ownerId);
        sessionStorage.removeItem('sskr.route-save-after-login');
      } catch { /* Keep authentication recovery independent of browser storage. */ }
      authNotice = '로그인이 만료되었습니다. 다시 로그인해 주세요.';
      // The rejected session cookie has been cleared by the server.
      return api.context();
    }
  }
  function renderPublicGuide(nextContext) {
    if (nextContext.backend === 'supabase' && !nextContext.event?.id) {
      document.querySelector('#public-event-guide').innerHTML='<h2>다음 SSKR을 준비하고 있어요</h2><p>행사 일정과 참가 조건이 확정되면 이 페이지에서 안내해 드립니다.</p><p>먼저 스팟을 살펴보고 나만의 루트를 만들어 보세요. Google 로그인으로 루트를 저장할 수 있습니다.</p><a href="/app/spots?mode=plan">루트 만들기 →</a>';return;
    }
    const e=nextContext.event,tiers=nextContext.tiers||[],policy=e.refundPolicy;
    let preferred='';try{preferred=sessionStorage.getItem('sskr.participate.tier.'+e.id)||'';}catch{}
    document.querySelector('#public-event-guide').innerHTML=`<h2>${esc(e.publicTitle)} 참가 안내</h2><p><strong>공식 출발 → 경유 ${e.minimumSpotCheckins}곳 이상 → ${esc(e.finishLocationName)}</strong></p><p>출발·도착을 포함해 총 ${e.minimumSpotCheckins+2}곳 이상 체크인합니다. 일출 이후 출발하고 일몰 전에 도착해야 합니다. 루트 계획의 선택 수는 실제 체크인과 별개입니다.</p><p>${esc(e.eligibilitySummary)}</p><a href="/explore/">출발지와 스팟 미리 보기 →</a><h3>참가 유형과 혜택</h3><p>모든 참가 유형에서 메모리얼을 남길 수 있습니다. 공개 탐색·루트 체험은 무료이며, 로그인하면 참가 신청 전에도 루트를 저장할 수 있습니다.</p><div class="public-tier-grid">${tiers.map(t=>`<label class="public-tier ${t.availability.selectable?'':'is-disabled'}"><input type="radio" name="publicTier" value="${esc(t.id)}" ${preferred===t.id?'checked':''} ${t.availability.selectable?'':'disabled'}><strong>${esc(t.displayName)}</strong><b>${esc(t.displayAmount)}</b><span>${esc(t.availability.label)}</span><ul>${t.benefits.map(b=>`<li>${esc(b)}</li>`).join('')}</ul></label>`).join('')}</div><p>선택한 유형은 신청 단계로 이어집니다. 정원을 먼저 확보한 뒤 결제하며, 정원이 없으면 결제를 진행하지 않습니다.</p><details><summary>취소·환불 안내</summary><p>${esc(policy?.beforeShipping||'운영 정책 공개 예정')}</p><p>${esc(policy?.afterShipping||'운영 정책 공개 예정')}</p><p>${esc(policy?.notice||'확정된 정책은 신청 전 안내합니다.')}</p></details>`;
    if(nextContext.participationMode==='test'){
      const guide=document.querySelector('#public-event-guide');guide.querySelector('details')?.remove();
      const note=guide.querySelector('.public-tier-grid')?.nextElementSibling;if(note)note.textContent='테스트 참가에는 비용이 들지 않습니다. 신청을 완료하면 참가가 확정됩니다.';
      guide.insertAdjacentHTML('afterbegin','<p class="service-test-notice"><strong>테스트 사이트 · 실제 결제 없음</strong><br>표시된 일정은 기능 검증용입니다. 정식 행사 모집과 키트 제공은 시작하지 않았습니다.</p>');
    }
    const chosen=tiers.find(t=>t.id===preferred);if(chosen)document.querySelector('#event-facts dd').innerHTML=esc(chosen.displayAmount)+(nextContext.participationMode==='test'?'<small>테스트 참가 · 청구 없음</small>':'<small>1인 기준 · 부가세 포함</small>');
    document.querySelectorAll('input[name="publicTier"]').forEach(input=>input.addEventListener('change',()=>{try{sessionStorage.setItem('sskr.participate.tier.'+e.id,input.value);}catch{}const chosen=tiers.find(t=>t.id===input.value);if(chosen){const fact=document.querySelector('#event-facts dd');fact.innerHTML=esc(chosen.displayAmount)+'<small>1인 기준 · 부가세 포함</small>';}}));
  }

  function renderMarketing() {
    const benefitGrid = document.querySelector("#benefit-grid");
    benefitGrid.innerHTML = data.benefits.map((benefit) => `<article class="benefit-card" data-key="${benefit.key}"><button class="benefit-trigger" type="button" aria-expanded="false" aria-controls="benefit-${benefit.key}" title="상세 보기"><span class="benefit-visual" aria-hidden="true"></span><span class="benefit-number">${benefit.number}</span><span class="benefit-copy"><strong>${benefit.title}</strong><small>${benefit.summary}</small></span><span class="benefit-open" aria-hidden="true">↗</span></button><div class="benefit-detail" id="benefit-${benefit.key}"><p>${benefit.description}</p><small>${benefit.details}</small></div></article>`).join("");
    const cards = [...benefitGrid.querySelectorAll(".benefit-card")];
    const resetCards = () => {
      benefitGrid.classList.remove("has-selection");
      delete benefitGrid.dataset.selectedIndex;
      cards.forEach((card) => {
        card.classList.remove("is-selected");
        card.querySelector("button").setAttribute("aria-expanded", "false");
        card.querySelector(".benefit-open").textContent = "↗";
      });
    };
    cards.forEach((card, index) => card.querySelector("button").addEventListener("click", () => {
      const close = card.classList.contains("is-selected");
      resetCards();
      if (close) return;
      benefitGrid.classList.add("has-selection");
      benefitGrid.dataset.selectedIndex = String(index + 1);
      card.classList.add("is-selected");
      card.querySelector("button").setAttribute("aria-expanded", "true");
      card.querySelector(".benefit-open").textContent = "×";
    }));
    window.addEventListener("keydown", (event) => { if (event.key === "Escape") resetCards(); });
    document.querySelector("#manager-title").textContent = data.manager.title;
    document.querySelector("#manager-description").textContent = data.manager.description;
    document.querySelector("#manager-flow").innerHTML = data.manager.steps.map((step) => `<li class="manager-step"><div class="manager-step-copy"><span>${step.phase}</span><strong>${step.title}</strong><small>${step.note}</small></div><i class="manager-visual manager-visual--${step.visual}" aria-hidden="true"></i></li>`).join("");
    document.querySelector("#manager-promises").innerHTML = data.manager.promises.map((item) => `<li class="manager-promise"><b aria-hidden="true">${item.icon}</b><span><strong>${item.title}</strong>${item.note}</span></li>`).join("");
  }

  function renderEvent(nextContext) {
    const { event, price } = nextContext;
    document.title = `${event.publicTitle || 'SSKR'} 참가${guideOnly ? ' 안내' : ''}`;
    document.documentElement.dataset.eventState = event.registrationState.toLowerCase();
    document.querySelector("#event-season").textContent = event.editionLabel;
    document.querySelector("#event-status").textContent = event.registrationLabel;
    document.querySelector("#event-category").textContent = event.category;
    document.querySelector("#event-title-line").textContent = event.publicTitle;
    document.querySelector("#event-subtitle").textContent = "참가 신청";
    document.querySelector("#event-description").textContent = event.description;
    const facts = [
      { icon: "₩", label: "참가비", value: price?.displayAmount || "확인 중", note: nextContext.participationMode==='test'?'테스트 참가 · 청구 없음':'1인 기준 · 부가세 포함' },
      { icon: "▣", label: "신청 기간", value: event.applicationPeriodDisplay, note: "선착순 마감" },
      { icon: "⚑", label: "행사 일시", value: event.eventDateDisplay, note: "당일 행사" },
      { icon: "◎", label: "모집 정원", value: event.capacityDisplay, note: event.capacityNote }
    ];
    document.querySelector("#event-facts").innerHTML = facts.map((fact) => `<div class="event-fact"><dt><i aria-hidden="true">${fact.icon}</i>${fact.label}</dt><dd>${esc(fact.value)}<small>${esc(fact.note)}</small></dd></div>`).join("");
    renderPublicGuide(nextContext);
    if(nextContext.participationMode==='test'){
      const cards={kit:['테스트 참가','결제 없이 신청하고 참가 준비까지','신청 정보와 참가 상태는 실제 계정에 저장됩니다.','테스트 참가 확정 · 공식 출발지 선택 · 바이크 정보'],finisher:['현장 체크인','출발부터 도착까지 실제 방문 기록','지정된 테스트 일정과 현장 위치에서 방문을 확인합니다.','출발 · 스팟 10개 이상 · 도착 체크인']};
      for(const [key,copy] of Object.entries(cards)){const card=document.querySelector('[data-key="'+key+'"]');if(!card)continue;card.querySelector('.benefit-copy strong').textContent=copy[0];card.querySelector('.benefit-copy small').textContent=copy[1];card.querySelector('.benefit-detail p').textContent=copy[2];card.querySelector('.benefit-detail small').textContent=copy[3];}
      const step=document.querySelectorAll('.manager-step-copy strong')[1];if(step)step.textContent='공식 출발과 루트';
    }
  }

  function focusActive(view, shouldFocus) {
    if (!shouldFocus) return;
    const heading = view.querySelector("h2");
    if (!heading) return;
    window.requestAnimationFrame(() => {
      if (window.matchMedia("(max-width: 760px)").matches && surfaceMode !== SURFACE_MODES.REVIEW) view.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
      view.scrollTop = 0;
      view.querySelector(".transaction-shell, .completion-shell, .account-view")?.scrollTo(0, 0);
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
    document.querySelectorAll(".transaction-primary, .transaction-secondary, .account-menu button").forEach((button) => {
      if (value && !button.disabled) { button.dataset.pendingDisabled = "true"; button.disabled = true; }
      else if (!value && button.dataset.pendingDisabled === "true") { button.disabled = false; delete button.dataset.pendingDisabled; }
    });
  }

  function renderContext(nextContext, options = {}) {
    context = nextContext;
    renderEvent(context);
    accountUI.update(context);
    primaryLabel.textContent = context.surface.primaryAction?.label || "신청 상태 확인";
    primaryAction.disabled = context.surface.primaryAction?.enabled === false;
    document.querySelector("#event-subtitle").textContent = guideOnly ? "참가 안내" : "참가 신청";
    if (guideOnly) showMode(SURFACE_MODES.REVIEW, options);
    else if (context.surface.mode === SURFACE_MODES.REVIEW) showMode(SURFACE_MODES.REVIEW, options);
    else if (context.surface.mode === SURFACE_MODES.APPLICATION) { modeB.render(applicationRoot, context, handlers); showMode(SURFACE_MODES.APPLICATION, options); }
    else if (context.surface.mode === SURFACE_MODES.LOBBY) { modeC.render(lobbyRoot, context, handlers); showMode(SURFACE_MODES.LOBBY, options); }
    showAuthNotice();
  }

  function renderError(error) {
    document.querySelector("#surface-error-message").textContent = error.message || "현재 상태를 다시 확인해 주세요.";
    showMode(SURFACE_MODES.ERROR);
  }

  function clearResumePaymentIntent() {
    if (!entryParams.has("resumePayment")) return;
    const url = new URL(window.location.href);
    url.searchParams.delete("resumePayment");
    window.history.replaceState(window.history.state, "", url);
  }

  async function loadInitialContext() {
    await api.initialize();
    if (window.SSKR_BACKEND?.mode === 'supabase') consumeAuthError();
    const resolved = await resolveContext();
    if (!resumePaymentOnEntry || resolved.surface.variant !== "PAYMENT_DEFERRED") {
      clearResumePaymentIntent();
      return resolved;
    }
    const resumed = await api.application("RESUME_PAYMENT");
    clearResumePaymentIntent();
    return resumed;
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

  async function requestWithoutSurfaceChange(action) {
    if (pending) throw new Error("요청을 처리하고 있습니다.");
    setPending(true);
    try {
      context = await action();
      renderEvent(context);
      accountUI.update(context);
      return context;
    } finally { setPending(false); }
  }

  async function startApplication() {
    if (!context?.surface?.primaryAction?.enabled || pending) return;
    if (guideOnly) {
      guideOnly = false; const url = new URL(location.href); url.searchParams.delete('view'); history.replaceState(history.state,'',url);
      if (context.surface.mode !== SURFACE_MODES.REVIEW) { renderContext(context); return; }
    }
    if (context.surface.primaryAction.code === "OPEN_SSKR_APP") { window.location.href = "/app"; return; }
    if (!accountLink.isAccountLinked()) { showLogin(true); return; }
    await run(() => api.application("START"));
  }

  let startAfterLogin = false;
  function showLogin(start = false) { startAfterLogin = start; showMode(SURFACE_MODES.AUTH_GATE); }
  async function completeMockAccountLink(provider) {
    await accountLink.linkAccount(provider);
    await run(async () => {
      const resolved = await resolveContext();
      const shouldStart = startAfterLogin; startAfterLogin = false;
      return shouldStart && resolved.surface.mode === SURFACE_MODES.REVIEW ? api.application("START") : resolved;
    });
  }

  const handlers = {
    saveAcknowledgement: (acknowledgement) => run(() => api.application("SAVE_ACKNOWLEDGEMENT", { acknowledgement })),
    saveAgreements: (agreements) => run(() => api.application("SAVE_AGREEMENTS", { agreements })),
    saveParticipant: (participant) => run(() => api.application("SAVE_PARTICIPANT_INFO", { participant })),
    previousStep: (fromStep) => run(() => api.application("PREVIOUS_STEP", { fromStep })),
    cancelApplication: () => { if (window.confirm("참가 신청을 취소하시겠습니까? 입력한 신청 정보는 초기화됩니다.")) run(() => api.application("CANCEL")); },
    deferPayment: () => run(() => api.application("DEFER_PAYMENT")),
    resumePayment: () => run(() => api.application("RESUME_PAYMENT")),
    editParticipant: () => run(() => api.application("EDIT_PARTICIPANT_INFO")),
    startPayment: (mockOutcome, retry) => run(async () => {
      if(context.participationMode==='test')return api.application('CONFIRM_TEST');
      if(window.SSKR_BACKEND?.mode==='supabase'){location.assign('/participate/payment.html');return context;}
      if (!retry) await api.checkout();
      return api.payment(retry ? "RETRY" : "START", { idempotencyKey: `${Date.now()}-${Math.random().toString(16).slice(2)}`, mockOutcome });
    }),
    refreshPayment: () => run(() => api.payment("REFRESH"))
  };

  accountUI.setup({
    shell: accountShell,
    root: accountRoot,
    callbacks: {
      getSurface: () => surfaceMode,
      login: () => showLogin(),
      showAccount: () => showMode(SURFACE_MODES.ACCOUNT),
      restore: (mode) => showMode(mode || context?.surface?.mode || SURFACE_MODES.REVIEW, { focus: false }),
      updateProfile: (profile) => requestWithoutSurfaceChange(() => api.mock("UPDATE_ACCOUNT_PROFILE", { profile })),
      resetParticipation: async () => {
        await run(async () => {
          const nextContext = await api.mock("RESET", { scenario: "a-open-linked", snapshot: null });
          window.SSKR_MOCK_SESSION.replaceScenario("a-open-linked");
          return nextContext;
        });
      },
      setPaymentProcessing: async () => {
        await run(async () => {
          const nextContext = await api.mock("RESET", { scenario: "b-processing", snapshot: null });
          window.SSKR_MOCK_SESSION.replaceScenario("b-processing");
          return nextContext;
        });
      },
      logout: async () => { await accountLink.logout(); try { sessionStorage.removeItem('sskr.route-relogin-owner'); } catch { /* Restricted storage. */ } await run(resolveContext); },
      resolve: () => run(resolveContext)
    }
  });

  primaryAction.addEventListener("click", startApplication);
  window.SSKR_SOCIAL_AUTH.mount(document.querySelector("#participate-social-auth"), { title: "소셜 계정으로 참여하기", note: "참가비용은 소셜 연동 확인 후 별도 절차로 결제됩니다.", onSelect: completeMockAccountLink });
  document.querySelector("#surface-retry").addEventListener("click", () => run(resolveContext));
  renderMarketing();
  showMode(SURFACE_MODES.LOADING, { focus: false });
  run(loadInitialContext, { focus: false });

  window.SSKR_PARTICIPATE = Object.freeze({
    modes: SURFACE_MODES,
    getContext: () => context,
    getSurfaceMode: () => surfaceMode,
    refresh: () => run(resolveContext),
    startApplication,
    async resetMock(scenario = "a-open-unlinked") { accountLink.reset(); api.reset(); return run(() => api.mock("RESET", { scenario, snapshot: null })); }
  });
})();
