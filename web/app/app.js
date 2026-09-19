(() => {
  const domain = window.SSKR_APP_DOMAIN;
  const data = window.SSKR_APP_DATA;
  const api = window.SSKR_PARTICIPATE_API;
  const auth = window.SSKR_ACCOUNT_LINK;
  const accountControl = window.SSKR_ACCOUNT_CONTROL;
  const managerResolver = window.SSKR_MANAGER_RESOLVER;
  if (!domain || !data || !api || !auth || !accountControl || !managerResolver) return;

  const root = document.querySelector("#app-main");
  const accountRoot = document.querySelector("#app-account");
  const accountMeta = document.querySelector("#account-meta");
  const accountName = document.querySelector("#account-name");
  const accountNumber = document.querySelector("#account-number");
  const sectionTitle = document.querySelector("#app-section-title");
  const currentEventNavLabel = document.querySelector("#current-event-nav-label");
  const nav = document.querySelector("#app-nav");
  const params = new URLSearchParams(location.search);
  const scenario = params.get("scenario") || "session";
  const managerVariant = params.get("manager") || "default";
  const linkedScenarios = new Set(["logged-in-no-application", "application-step1", "application-step2", "application-step3", "application-payment", "processing", "failed", "active", "past-only", "current+past", "private-owner", "private-other", "blocked", "c-payment-deferred", "c-waitlisted", "c-confirmed-spots", "c-preparation", "c-ride-check", "c-countdown", "c-live-confirmed", "c-live-waitlisted", "c-season-completed", "c-season-no-show", "c-season-retired"]);
  const publicScenarios = new Set(["guest", "public-memorial"]);
  let context = null;
  let pendingRoute = null;
  let disposeSpots = null;
  let disposeMemorials = null;
  let disposeAuth = null;
  let memorialStorage;
  try { memorialStorage = window.localStorage; } catch { /* Restricted browser storage. */ }
  const memorialStore = window.SSKR_MEMORIAL_STORE.create(data.memorials, memorialStorage);
  const memorialAccount = () => scenario === "private-other" ? { ...context.account, id: "mock-rider-other" } : context.account;

  const esc = (value) => String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
  const participateHref = (href) => {
    const target = new URL(href, location.origin);
    ["scenario", "mockSession", "mockControls", "build"].forEach((key) => {
      if (params.has(key)) target.searchParams.set(key, params.get(key));
    });
    return `${target.pathname}${target.search}`;
  };
  const pageHead = (eyebrow, title, description = "") => `<header class="page-head"><div><p>${esc(eyebrow)}</p><h1>${esc(title)}</h1></div>${description ? `<span>${esc(description)}</span>` : ""}</header>`;
  const primary = (action) => `<a class="primary-link" href="${esc(participateHref(action.href))}">${esc(action.label)} <span aria-hidden="true">→</span></a>`;
  const participantAccessCopy = "참가 확정되면 SSKR 관련 안내가 제공됩니다.";
  const currentAction = () => domain.currentEventAction(context);
  const relation = () => domain.currentRelation(context);

  function navigationSearch() {
    const next = new URLSearchParams(location.search);
    next.delete("returnTo");
    const query = next.toString();
    return query ? `?${query}` : "";
  }

  function route(path, { replace = false } = {}) {
    const safe = domain.safeReturnTo(path);
    if (!context) { pendingRoute = { path: safe, replace }; return; }
    const destination = safe + navigationSearch();
    const currentPath = domain.normalizePath(location.pathname);
    if (replace) history.replaceState({}, "", destination);
    else if (safe !== currentPath) history.pushState({}, "", destination);
    renderRouteSafely();
    if (safe !== currentPath && safe.startsWith("/app/memorials")) window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }

  function handleAppLink(event) {
    const link = event.target.closest("[data-app-link]");
    if (!link) return;
    event.preventDefault();
    route(link.getAttribute("href"));
    nav.classList.remove("is-open");
    document.querySelector("#mobile-nav-toggle").setAttribute("aria-expanded", "false");
  }

  function displayAccount() {
    const nickname = data.memorials.find(item => item.ownerUserId === context.account.id)?.ownerName;
    return nickname ? { ...context.account, profile: { ...context.account.profile, name: nickname } } : context.account;
  }
  function renderAccount() {
    accountControl.render(accountRoot, {
      account: displayAccount(),
      showGuest: true,
      showReset: true,
      onLogin: () => renderAuth(domain.normalizePath(location.pathname)),
      onProfile: () => route("/app/my"),
      onSettings: () => route("/app/my"),
      onReset: async () => {
        if (!window.confirm("참가 신청, 결제 및 참가 확정 상태를 초기화하시겠습니까? 로그인 상태와 프로필은 유지됩니다.")) return;
        context = await api.mock("RESET", { scenario: "logged-in-no-application", snapshot: null });
        window.SSKR_MOCK_SESSION.replaceScenario("logged-in-no-application");
        renderChrome(); renderRouteSafely();
      },
      onLogout: async () => {
        if (!window.confirm("로그아웃하시겠습니까? 참가 신청과 기록은 삭제되지 않습니다.")) return;
        auth.logout(); context = await api.context(); renderChrome(); renderRouteSafely();
      }
    });
  }

  function renderChrome() {
    const linked = context.account.linked === true;
    accountMeta.hidden = !linked;
    accountName.textContent = linked ? displayAccount().profile?.name || "SSKR 라이더" : "";
    accountNumber.textContent = linked ? context.participation?.participantNumber || "SSKR 계정" : "";
    currentEventNavLabel.textContent = context.event?.publicTitle || "SSKR";
    renderAccount();
  }

  const eventTitle = () => context.event?.publicTitle || 'SSKR';
  const eventModel = () => window.SSKR_EVENT_VIEW.resolve(context);
  function relationCopy() { const status=eventModel()?.status;return [status?.title||'행사 안내를 준비하고 있습니다.',status?.copy||'공개된 스팟과 메모리얼을 둘러보세요.']; }
  function relationLabel() { return eventModel()?.status.label||'안내 예정'; }
  function tierLabel(code) {
    return ({ STANDARD: "일반", EARLY: "얼리액세스", PLATINUM: "플래티넘" })[code] || "선택 전";
  }

  function renderHome() {
    const model = managerResolver.resolveManager(context, { ...data, memorials: memorialStore.all() }, { variant: managerVariant });
    const statusIcon = () => `<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 3v18M3 12h18"/><circle cx="12" cy="12" r="8"/></svg>`;
    const alert = model.alert ? `<aside class="manager-alert" aria-label="중요 변경 안내"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 3 2.8 20h18.4L12 3Z"/><path d="M12 9v5M12 17h.01"/></svg><strong>${esc(model.alert.title)}</strong><p>${esc(model.alert.copy)}</p><a href="${esc(model.alert.href)}" data-app-link>${esc(model.alert.label)} →</a></aside>` : "";
    const statuses = model.currentEvent.status.map((item) => `<div class="manager-status-item" data-tone="${esc(item.tone)}"><span class="manager-status-icon">${statusIcon()}</span><div class="manager-status-copy"><span>${esc(item.label)}</span><strong>${esc(item.value)}</strong></div></div>`).join("");
    const noticePanel = `<article class="manager-notices">
      <div class="manager-card-title"><span>NOTICE</span><h2>최근 공지</h2></div>
      <ul class="manager-notice-list">${model.notices.map((item) => `<li><time>${esc(item.date)}</time><strong>${esc(item.title)}</strong></li>`).join("")}</ul>
      <a href="/app/notices" data-app-link>확인하기</a>
    </article>`;
    const workspace = model.preparation ? `
      <section class="manager-workspace" aria-label="참가 준비 현황">
        <article class="manager-prep-plan">
          <div class="manager-preparation">
            <div class="manager-progress"><div><h2>${esc(model.preparation.title)}</h2><p>현재 준비 상태를 확인하세요.</p></div><div class="manager-donut" style="--progress:${Math.round(model.preparation.complete / model.preparation.total * 100)}%"><div><strong>${model.preparation.complete}</strong><span>/ ${model.preparation.total}</span></div></div></div>
            <ul class="manager-checklist">${model.preparation.items.map((item) => `<li data-state="${esc(item.state)}"><i aria-hidden="true">${item.state === "done" ? "✓" : item.state === "current" ? "•" : ""}</i><span>${esc(item.label)}</span></li>`).join("")}</ul>
          </div>
          <div class="manager-plan">
            <div class="manager-card-title"><span>MY PLAN</span><h2>나의 계획</h2></div>
            <div class="manager-plan-route"><span>관심 스팟 ${model.plan.spots}곳 · 저장한 계획 ${model.plan.plans}개</span><strong>${esc(model.plan.route)}</strong></div>
            <a href="${esc(model.plan.href)}" data-app-link>계획 보기 →</a>
          </div>
        </article>
        <div class="manager-side-stack">
          <article class="manager-kit">
            <div class="manager-kit-copy"><p class="eyebrow">PARTICIPANT KIT</p><h2>참가 키트</h2><dl><div><dt>상태</dt><dd>${esc(model.kit.state)}</dd></div><div><dt>예정</dt><dd>${esc(model.kit.schedule)}</dd></div></dl></div>
            <img class="manager-kit-image" src="${esc(model.kit.image)}" alt="SSKR 참가 키트" />
          </article>
          ${noticePanel}
        </div>
      </section>` : `
      <section class="manager-workspace" data-participant-availability="locked" aria-label="참가 확정 후 제공되는 안내">
        <article class="manager-prep-plan">
          <div class="manager-preparation manager-participant-placeholder">
            <div class="manager-card-title"><span>PREPARATION</span><h2>참가 준비</h2></div>
            <p>${esc(model.participantAccess.message)}</p>
          </div>
          <div class="manager-plan manager-participant-placeholder">
            <div class="manager-card-title"><span>MY PLAN</span><h2>나의 계획</h2></div>
            <p>${esc(model.participantAccess.message)}</p>
          </div>
        </article>
        <div class="manager-side-stack">
          <article class="manager-kit manager-participant-placeholder">
            <div class="manager-card-title"><span>PARTICIPANT KIT</span><h2>참가 키트</h2></div>
            <p>${esc(model.participantAccess.message)}</p>
          </article>
          ${noticePanel}
        </div>
      </section>`;
    const curation = model.curation.length ? `<section class="manager-curation" aria-labelledby="manager-curation-title"><header class="manager-section-head"><h2 id="manager-curation-title">지금 둘러볼 SSKR</h2><p>공개된 스팟과 기록만 안전하게 보여드립니다.</p></header><div class="manager-curation-grid" data-count="${model.curation.length}">${model.curation.map((item) => `<a class="manager-curation-card" href="${esc(item.href)}" data-app-link><img src="${esc(item.image)}" alt="" /><div><span>${esc(item.eyebrow)}</span><h3>${esc(item.title)}</h3><p>${esc(item.copy)}</p></div></a>`).join("")}</div></section>` : "";
    const primaryHref = model.primaryAction.href.startsWith("/participate") ? participateHref(model.primaryAction.href) : model.primaryAction.href;
    root.innerHTML = `<div class="manager-dashboard">${alert}<section class="manager-hero" aria-labelledby="manager-hero-title"><div class="manager-hero-visual" style="--manager-hero-image:url('${esc(model.currentEvent.image)}')"><div class="manager-hero-copy"><p class="eyebrow">${esc(model.currentEvent.editionLabel)}</p><h2 id="manager-hero-title">${esc(model.currentEvent.heroTitle)}</h2><p>${esc(model.currentEvent.heroCopy)}</p><a class="manager-primary" href="${esc(primaryHref)}"${model.primaryAction.href.startsWith("/app") ? " data-app-link" : ""}>${esc(model.primaryAction.label)} <span aria-hidden="true">→</span></a></div></div><div class="manager-status">${statuses}</div></section>${workspace}${curation}</div>`;
  }

  function renderCurrent() {
    const model=eventModel();
    if(!model){root.innerHTML=pageHead('행사 안내','공개된 행사를 준비하고 있습니다.','스팟과 메모리얼은 계속 이용할 수 있습니다.');return;}
    const action=model.status.action;
    const cta=action?'<a class="primary-link" href="'+esc(action.href.startsWith('/participate')?participateHref(action.href):action.href)+'"'+(action.href.startsWith('/app')?' data-app-link':'')+'>'+esc(action.label)+' <span aria-hidden="true">→</span></a>':'';
    root.innerHTML=`<div class="event-page">
      ${pageHead('행사 안내',model.title,model.stage)}
      <section class="event-overview"><div><p class="eyebrow">${esc(model.category)}</p><h2>${esc(model.description||model.title)}</h2><span class="event-registration">${esc(model.registration)}</span></div></section>
      <dl class="event-facts"><div><dt>행사 일시</dt><dd>${esc(model.date)}</dd></div><div><dt>신청 기간</dt><dd>${esc(model.period)}</dd></div><div><dt>모집 정원</dt><dd>${esc(model.capacity)}</dd>${model.capacityNote?'<small>'+esc(model.capacityNote)+'</small>':''}</div></dl>
      <section class="event-account"><div><p class="eyebrow">${esc(model.status.label)}</p><h2>${esc(model.status.title)}</h2><p>${esc(model.status.copy)}</p>${model.participantNumber?'<p class="event-number">참가 번호 '+esc(model.participantNumber)+'</p>':''}</div><div class="event-actions">${cta}${!context.account.linked?'<button type="button" class="secondary-link" data-event-login>로그인</button>':''}</div></section>
      <section class="event-prices"><h2>참가 유형과 비용</h2>${model.tiers.length?'<dl>'+model.tiers.map(t=>'<div><dt>'+esc(t.name)+'</dt><dd>'+esc(t.amount)+'</dd><span>'+esc(t.availability)+'</span></div>').join('')+'</dl>':'<p>참가비 안내를 준비하고 있습니다.</p>'}<p>유형별 혜택과 신청 조건은 참가 안내에서 확인할 수 있습니다.</p></section>
      <nav class="event-resources" aria-label="공개 콘텐츠"><a href="/app/spots" data-app-link><strong>스타팅 포인트와 스팟</strong><span>출발지와 들를 장소 살펴보기 →</span></a><a href="/app/memorials" data-app-link><strong>라이더들의 메모리얼</strong><span>참가자가 남긴 여정 보기 →</span></a></nav>
    </div>`;
    root.querySelector('[data-event-login]')?.addEventListener('click',()=>renderAuth('/app/current'));
  }

  function renderSpots(id) {
    disposeSpots = window.SSKR_APP_SPOTS.mount(root, { id, participation: context.participation });
  }

  function renderMemorials() {
    disposeMemorials = window.SSKR_MEMORIALS.mount({
      root, store: memorialStore, account: memorialAccount(),
      path: domain.normalizePath(location.pathname)
    });
  }

  function renderMy() {
    const active = context.participation;
    const past = data.past.filter(item => memorialStore.all().some(memorial => memorial.id === item.memorialId && memorial.ownerUserId === memorialAccount().id));
    root.innerHTML = `${pageHead("MY SSKR", "내 기록", "현재 신청·참가 관계와 지난 시즌의 결과 및 메모리얼을 확인합니다.")}
      <section class="content-section"><div class="section-head"><h2>${esc(eventTitle())}</h2></div><div class="status-band"><div><span>현재 관계</span><strong>${esc(relationLabel())}</strong><p>${esc(relationCopy()[1])}</p></div><div><span>참가자</span><strong>${esc(active?.participantNumber || "참가 전")}</strong><p>${esc(active ? tierLabel(active.registrationTierCode) : context.application ? "신청 진행 중" : "참가 내역 없음")}</p></div></div></section>
      <section class="content-section"><div class="section-head"><h2>지난 참가</h2><p>${past.length ? `${past.length}개의 기록` : "기록 없음"}</p></div>${past.length ? `<div class="notice-list">${past.map((item) => `<a class="notice-item" href="/app/memorials/${esc(item.memorialId)}" data-app-link><span>${item.year}</span><div><h3>SSKR ${item.year}</h3><p>${esc(item.result)} · ${esc(item.tier)} · ${esc(item.participantNumber)}</p></div><time>메모리얼 →</time></a>`).join("")}</div>` : `<div class="empty-state"><h1>아직 지난 참가 기록이 없습니다.</h1><p>완료된 대회의 참가 및 메모리얼 기록이 이곳에 모입니다.</p></div>`}</section>`;
  }

  function renderPreparation() {
    root.innerHTML = `${pageHead("PARTICIPANT ONLY", "참가 준비", "현재 활성 참가권이 있는 계정에만 열리는 준비 정보입니다.")}<div class="status-band"><div><span>참가 번호</span><strong>${esc(context.participation.participantNumber)}</strong><p>${esc(tierLabel(context.participation.registrationTierCode))} 참가</p></div><div><span>준비 상태</span><strong>준비 시작</strong><p>출발 전 필요한 항목을 순서대로 확인합니다.</p></div></div><section class="content-section"><div class="notice-list"><div class="notice-item"><span>01</span><div><h3>바이크 기본 정보 확인</h3><p>신청 시 등록한 바이크 정보를 확인합니다.</p></div><time>확인 필요</time></div><div class="notice-item"><span>02</span><div><h3>안전 장비 준비</h3><p>헬멧과 보호 장구를 사전에 점검합니다.</p></div><time>안내</time></div></div></section>`;
  }

  function renderNotices() {
    root.innerHTML = `${pageHead("OFFICIAL NOTICE", "공지", "현재 이벤트와 APP 이용에 필요한 공개 안내입니다.")}<div class="notice-list">${data.notices.map((item) => `<article class="notice-item"><span>${esc(item.category)}</span><div><h3>${esc(item.title)}</h3><p>${esc(item.body)}</p></div><time>${esc(item.date)}</time></article>`).join("")}</div>`;
  }

  function renderAuth(returnTo) {
    disposeSpots?.(); disposeSpots = null;
    disposeMemorials?.(); disposeMemorials = null;
    const safe = domain.safeReturnTo(returnTo);
    const authQuery = new URLSearchParams(location.search);
    authQuery.set("returnTo", safe);
    history.replaceState({}, "", `${domain.normalizePath(location.pathname)}?${authQuery}`);
    disposeAuth?.();
    root.innerHTML = '<section class="auth-gate" aria-labelledby="auth-title"><div id="app-social-auth"></div></section>';
    disposeAuth = window.SSKR_SOCIAL_AUTH.mount(root.querySelector('#app-social-auth'), {
      note: '로그인하면 내 신청 내역과 참가 기록을 확인할 수 있습니다.',
      onSelect: async provider => {
        auth.linkAccount(provider);
        context = await api.context();
        renderChrome();
        route(safe, { replace: true });
      }
    });
  }

  function renderDenied(title, copy) { root.innerHTML = `<section class="access-denied"><p class="eyebrow">ACCESS</p><h1>${esc(title)}</h1><p>${esc(copy)}</p><a class="primary-link" href="/app" data-app-link>SSKR 매니저로</a></section>`; }
  function renderParticipantUnavailable() { root.innerHTML = `${pageHead("PARTICIPANT ONLY", "참가 준비", participantAccessCopy)}<section class="participant-availability"><p>${esc(participantAccessCopy)}</p><a class="primary-link" href="/app/current" data-app-link>${esc(eventTitle())} 확인</a></section>`; }
  function renderNotFound() { renderDenied("페이지를 찾을 수 없습니다.", "주소를 확인하거나 SSKR 매니저에서 다시 이동해 주세요."); }

  function renderFailure(error) {
    disposeSpots?.(); disposeSpots = null;
    disposeMemorials?.(); disposeMemorials = null;
    root.innerHTML = `<section class="access-denied"><p class="eyebrow">SSKR MANAGER</p><h1>화면을 표시하지 못했습니다.</h1><p>${esc(error?.message || "현재 상태를 다시 확인해 주세요.")}</p><button class="primary-link" id="app-retry" type="button">다시 시도</button></section>`;
    root.querySelector("#app-retry").addEventListener("click", () => load());
  }

  function renderRoute() {
    disposeAuth?.(); disposeAuth = null;
    disposeSpots?.(); disposeSpots = null;
    disposeMemorials?.(); disposeMemorials = null;
    const path = domain.normalizePath(location.pathname);
    const routeTitles = {
      "/app": "SSKR 매니저",
      "/app/current": context.event?.publicTitle || "SSKR",
      "/app/spots": "스팟",
      "/app/memorials": "메모리얼",
      "/app/my": "내 기록",
      "/app/preparation": "참가 준비",
      "/app/notices": "공지"
    };
    const routeRoot = path.startsWith("/app/spots/") ? "/app/spots" : path.startsWith("/app/memorials/") ? "/app/memorials" : path;
    sectionTitle.textContent = routeTitles[routeRoot] || "SSKR";
    document.title = `${sectionTitle.textContent} · SSKR`;
    const access = domain.canAccess(path, { linked: context.account.linked, relation: relation() });
    nav.querySelectorAll("[data-app-link]").forEach((link) => link.classList.toggle("is-current", link.getAttribute("href") === routeRoot));
    if (!access.allowed) {
      if (access.reason === "AUTH_REQUIRED") renderAuth(access.returnTo);
      else if (access.reason === "ACTIVE_PARTICIPATION_REQUIRED") renderParticipantUnavailable();
      else renderDenied("현재 참가자에게만 열리는 화면입니다.", participantAccessCopy);
    } else if (path === "/app") renderHome();
    else if (path === "/app/current") renderCurrent();
    else if (path === "/app/spots") renderSpots();
    else if (path.startsWith("/app/spots/")) renderSpots(path.split("/").pop());
    else if (path === "/app/memorials") renderMemorials();
    else if (path.startsWith("/app/memorials/")) renderMemorials();
    else if (path === "/app/my") renderMy();
    else if (path === "/app/preparation") renderPreparation();
    else if (path === "/app/notices") renderNotices();
    else renderNotFound();
    root.insertAdjacentHTML("beforeend", `<span class="scenario-tag">MOCK · ${esc(scenario)}</span>`);
    root.focus({ preventScroll: true });
  }

  function renderRouteSafely() {
    if (!context) { pendingRoute = { path: domain.normalizePath(location.pathname), replace: true }; return; }
    try { renderRoute(); }
    catch (error) { renderFailure(error); }
  }

  async function load() {
    try {
      if (linkedScenarios.has(scenario) && !auth.isAccountLinked()) auth.linkAccount("mock");
      if (publicScenarios.has(scenario) && auth.isAccountLinked()) auth.logout();
      if (scenario === "current+past") context = await api.mock("RESET", { scenario: "active", snapshot: null });
      else if (["past-only", "private-owner", "private-other"].includes(scenario)) context = await api.mock("RESET", { scenario: "logged-in-no-application", snapshot: null });
      else context = await api.context();
      renderChrome();
      if (pendingRoute) {
        const next = pendingRoute;
        pendingRoute = null;
        route(next.path, next);
      } else renderRouteSafely();
    } catch (error) { renderFailure(error); }
  }

  document.querySelector("#mobile-nav-toggle").addEventListener("click", (event) => { const open = nav.classList.toggle("is-open"); event.currentTarget.setAttribute("aria-expanded", String(open)); event.currentTarget.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기"); });
  document.querySelectorAll(".utility-button")[0]?.addEventListener("click", () => route("/app/notices"));
  document.querySelectorAll(".utility-button")[1]?.addEventListener("click", () => route("/app/my"));
  window.addEventListener("popstate", renderRouteSafely);
  document.addEventListener("click", handleAppLink);
  load();
})();
