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
  const linkedScenarios = new Set(["logged-in-no-application", "application-step1", "application-step2", "application-step3", "application-payment", "processing", "failed", "active", "past-only", "current+past", "private-owner", "private-other", "blocked", "c-waitlisted", "c-confirmed-spots", "c-preparation", "c-ride-check", "c-countdown", "c-live-confirmed", "c-live-waitlisted", "c-season-completed", "c-season-no-show", "c-season-retired"]);
  const publicScenarios = new Set(["guest", "public-memorial"]);
  let context = null;
  let pendingRoute = null;

  const esc = (value) => String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
  const pageHead = (eyebrow, title, description = "") => `<header class="page-head"><div><p>${esc(eyebrow)}</p><h1>${esc(title)}</h1></div>${description ? `<span>${esc(description)}</span>` : ""}</header>`;
  const primary = (action) => `<a class="primary-link" href="${esc(action.href)}">${esc(action.label)} <span aria-hidden="true">→</span></a>`;
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
  }

  function handleAppLink(event) {
    const link = event.target.closest("[data-app-link]");
    if (!link) return;
    event.preventDefault();
    route(link.getAttribute("href"));
    nav.classList.remove("is-open");
    document.querySelector("#mobile-nav-toggle").setAttribute("aria-expanded", "false");
  }

  function renderAccount() {
    accountControl.render(accountRoot, {
      account: context.account,
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
    accountName.textContent = linked ? context.account.profile?.name || "SSKR 라이더" : "";
    accountNumber.textContent = linked ? context.participation?.participantNumber || "SSKR 계정" : "";
    currentEventNavLabel.textContent = context.event?.publicTitle || "현재 SSKR";
    renderAccount();
  }

  function cards(items, kind) {
    return `<div class="resource-grid">${items.map((item) => `<article class="resource-card"><a href="/app/${kind}/${esc(item.id)}" data-app-link><img src="${esc(item.image)}" alt="" /><div class="resource-copy"><span>${esc(item.type || item.eventTitle || item.region)}</span><strong>${esc(item.name || item.title)}</strong><p>${esc(item.summary)}</p></div></a></article>`).join("")}</div>`;
  }

  function relationCopy() {
    const map = {
      NONE: ["아직 이번 SSKR 신청 내역이 없습니다.", "공개된 스팟과 메모리얼을 둘러본 뒤 참가를 결정할 수 있습니다."],
      STEP_1: ["참가 신청을 시작했습니다.", "진행 방식 확인부터 이어서 완료해 주세요."], STEP_2: ["참가 약관을 확인할 차례입니다.", "필수 동의를 완료하면 참가 유형을 선택할 수 있습니다."],
      STEP_3: ["참가 유형과 정보를 입력할 차례입니다.", "참가자 정보를 확인하면 결제 단계로 이동합니다."], PAYMENT: ["참가 정보 입력을 완료했습니다.", "참가비용 결제를 완료하면 참가가 확정됩니다."],
      PROCESSING: ["결제 결과를 확인하고 있습니다.", "중복 결제 없이 현재 처리 상태를 확인할 수 있습니다."], FAILED: ["결제가 완료되지 않았습니다.", "현재 참가 조건을 다시 확인하고 결제를 재시도할 수 있습니다."],
      ACTIVE: ["SSKR 2027 참가가 확정되었습니다.", "현재 SSKR와 참가 준비 화면에서 이번 랠리를 준비하세요."]
    };
    return map[relation()] || map.NONE;
  }
  function relationLabel() {
    const labels = { NONE: "참가 전", DRAFT: "신청 진행 중", STEP_1: "신청 진행 중", STEP_2: "필수 동의 진행 중", STEP_3: "참가 정보 입력 중", PAYMENT: "결제 필요", PROCESSING: "결제 확인 중", FAILED: "결제 필요", ACTIVE: "참가 확정" };
    return labels[relation()] || "상태 확인";
  }
  function tierLabel(code) {
    return ({ STANDARD: "일반", EARLY: "얼리액세스", PLATINUM: "플래티넘" })[code] || "선택 전";
  }

  function renderHome() {
    const model = managerResolver.resolveManager(context, data, { variant: managerVariant });
    const statusIcon = () => `<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 3v18M3 12h18"/><circle cx="12" cy="12" r="8"/></svg>`;
    const alert = model.alert ? `<aside class="manager-alert" aria-label="중요 변경 안내"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 3 2.8 20h18.4L12 3Z"/><path d="M12 9v5M12 17h.01"/></svg><strong>${esc(model.alert.title)}</strong><p>${esc(model.alert.copy)}</p><a href="${esc(model.alert.href)}" data-app-link>${esc(model.alert.label)} →</a></aside>` : "";
    const statuses = model.currentEvent.status.map((item) => `<div class="manager-status-item" data-tone="${esc(item.tone)}"><span class="manager-status-icon">${statusIcon()}</span><div class="manager-status-copy"><span>${esc(item.label)}</span><strong>${esc(item.value)}</strong></div></div>`).join("");
    const preparation = model.preparation ? `
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
          <article class="manager-notices">
            <div class="manager-card-title"><span>NOTICE</span><h2>최근 공지</h2></div>
            <ul class="manager-notice-list">${model.notices.map((item) => `<li><time>${esc(item.date)}</time><strong>${esc(item.title)}</strong></li>`).join("")}</ul>
            <a href="/app/notices" data-app-link>확인하기</a>
          </article>
        </div>
      </section>` : "";
    const curation = model.curation.length ? `<section class="manager-curation" aria-labelledby="manager-curation-title"><header class="manager-section-head"><h2 id="manager-curation-title">지금 둘러볼 SSKR</h2><p>공개된 스팟과 기록만 안전하게 보여드립니다.</p></header><div class="manager-curation-grid" data-count="${model.curation.length}">${model.curation.map((item) => `<a class="manager-curation-card" href="${esc(item.href)}" data-app-link><img src="${esc(item.image)}" alt="" /><div><span>${esc(item.eyebrow)}</span><h3>${esc(item.title)}</h3><p>${esc(item.copy)}</p></div></a>`).join("")}</div></section>` : "";
    root.innerHTML = `<div class="manager-dashboard">${alert}<section class="manager-hero" aria-labelledby="manager-hero-title"><div class="manager-hero-visual" style="--manager-hero-image:url('${esc(model.currentEvent.image)}')"><div class="manager-hero-copy"><p class="eyebrow">${esc(model.currentEvent.editionLabel)}</p><h2 id="manager-hero-title">${esc(model.currentEvent.heroTitle)}</h2><p>${esc(model.currentEvent.heroCopy)}</p><a class="manager-primary" href="${esc(model.primaryAction.href)}"${model.primaryAction.href.startsWith("/app") ? " data-app-link" : ""}>${esc(model.primaryAction.label)} <span aria-hidden="true">→</span></a></div></div><div class="manager-status">${statuses}</div></section>${preparation}${curation}</div>`;
  }

  function renderCurrent() {
    const [title, copy] = relationCopy();
    const action = currentAction();
    const active = relation() === "ACTIVE";
    root.innerHTML = `${pageHead("CURRENT SSKR", "현재 SSKR", "현재 대회와 이 계정의 관계를 기준으로 필요한 다음 행동만 보여줍니다.")}
      <section class="hero-panel"><div><p class="eyebrow">${esc(data.event.stage)} · ${esc(data.event.date)}</p><h2>${esc(title)}</h2><p>${esc(copy)}</p>${primary(action)} ${active ? `<a class="secondary-link" href="/app/preparation" data-app-link>참가 준비</a>` : ""}</div></section>
      <div class="status-band"><div><span>현재 관계</span><strong>${esc(relationLabel())}</strong><p>${esc(data.event.description)}</p></div><div><span>이벤트 상태</span><strong>${esc(context.event?.stageLabel || "스팟 공개")}</strong><p>${esc(context.event?.eventDateDisplay || data.event.date)}</p></div></div>`;
  }

  function renderSpots(id) {
    if (id) {
      const spot = data.spots.find((item) => item.id === id);
      if (!spot) return renderNotFound();
      root.innerHTML = `<a class="back-link" href="/app/spots" data-app-link>← 스팟 목록</a>${pageHead(spot.type, spot.name, spot.summary)}<section class="memorial-hero" style="background-image:url('${esc(spot.image)}')"><div><p class="eyebrow">${esc(spot.region)} · PUBLIC SPOT</p><h1>${esc(spot.name)}</h1><p>${esc(spot.summary)}. 실제 주행 경로와 방문 여부는 참가자가 직접 결정합니다.</p></div></section><dl class="detail-list"><div><dt>공개 범위</dt><dd>전체 공개</dd></div><div><dt>스팟 유형</dt><dd>${esc(spot.type)}</dd></div>${context.participation ? `<div><dt>참가자 확장</dt><dd>현재 참가와 연결된 상세 안내를 확인할 수 있습니다.</dd></div>` : ""}</dl>`;
      return;
    }
    root.innerHTML = `${pageHead("PUBLIC SPOTS", "스팟", "공식 스팟의 성격과 지역 정보를 공개 범위 안에서 확인합니다. GPS 추적이나 체크인은 포함하지 않습니다.")}${cards(data.spots, "spots")}`;
  }

  function renderMemorials(id) {
    if (id) {
      const memorial = data.memorials.find((item) => item.id === id || item.publicSlug === id);
      const account = scenario === "private-other" ? { ...context.account, id: "mock-rider-other" } : context.account;
      const access = domain.memorialAccess(memorial, account);
      if (!access.allowed) return renderDenied(access.reason === "PRIVATE" ? "비공개 메모리얼입니다." : "메모리얼을 찾을 수 없습니다.", "이 메모리얼은 소유자만 확인할 수 있습니다.");
      root.innerHTML = `<a class="back-link" href="/app/memorials" data-app-link>← 메모리얼 목록</a><section class="memorial-hero" style="background-image:url('${esc(memorial.image)}')"><div><p class="eyebrow">${esc(memorial.eventTitle)} · ${esc(memorial.result)}</p><h1>${esc(memorial.title)}</h1><p>${esc(memorial.summary)}</p><span>${esc(memorial.ownerName)}</span></div></section><dl class="detail-list"><div><dt>기록 이벤트</dt><dd>${esc(memorial.eventTitle)}</dd></div><div><dt>공개 상태</dt><dd>${esc(memorial.visibility)}</dd></div><div><dt>참가 결과</dt><dd>${esc(memorial.result)}</dd></div></dl>`;
      return;
    }
    const visible = data.memorials.filter((item) => domain.memorialAccess(item, context.account).allowed);
    root.innerHTML = `${pageHead("MEMORIAL ARCHIVE", "메모리얼", "현재 대회가 아닌 각 기록의 이벤트 연도와 맥락을 그대로 보존합니다.")}${cards(visible, "memorials")}`;
  }

  function renderMy() {
    const active = context.participation;
    const past = scenario === "past-only" || scenario === "current+past" || active ? data.past : [];
    root.innerHTML = `${pageHead("MY SSKR", "내 기록", "현재 신청·참가 관계와 지난 시즌의 결과 및 메모리얼을 확인합니다.")}
      <section class="content-section"><div class="section-head"><h2>현재 SSKR</h2></div><div class="status-band"><div><span>현재 관계</span><strong>${esc(relationLabel())}</strong><p>${esc(relationCopy()[1])}</p></div><div><span>참가자</span><strong>${esc(active?.participantNumber || "참가 전")}</strong><p>${esc(active ? tierLabel(active.registrationTierCode) : context.application ? "신청 진행 중" : "참가 내역 없음")}</p></div></div></section>
      <section class="content-section"><div class="section-head"><h2>지난 참가</h2><p>${past.length ? `${past.length}개의 기록` : "기록 없음"}</p></div>${past.length ? `<div class="notice-list">${past.map((item) => `<a class="notice-item" href="/app/memorials/${esc(item.memorialId)}" data-app-link><span>${item.year}</span><div><h3>SSKR ${item.year}</h3><p>${esc(item.result)} · ${esc(item.tier)} · ${esc(item.participantNumber)}</p></div><time>메모리얼 →</time></a>`).join("")}</div>` : `<div class="empty-state"><h1>아직 지난 참가 기록이 없습니다.</h1><p>완료된 대회의 참가 및 메모리얼 기록이 이곳에 모입니다.</p></div>`}</section>`;
  }

  function renderPreparation() {
    root.innerHTML = `${pageHead("PARTICIPANT ONLY", "참가 준비", "현재 활성 참가권이 있는 계정에만 열리는 준비 정보입니다.")}<div class="status-band"><div><span>참가 번호</span><strong>${esc(context.participation.participantNumber)}</strong><p>${esc(tierLabel(context.participation.registrationTierCode))} 참가</p></div><div><span>준비 상태</span><strong>준비 시작</strong><p>출발 전 필요한 항목을 순서대로 확인합니다.</p></div></div><section class="content-section"><div class="notice-list"><div class="notice-item"><span>01</span><div><h3>바이크 기본 정보 확인</h3><p>신청 시 등록한 바이크 정보를 확인합니다.</p></div><time>확인 필요</time></div><div class="notice-item"><span>02</span><div><h3>안전 장비 준비</h3><p>헬멧과 보호 장구를 사전에 점검합니다.</p></div><time>안내</time></div></div></section>`;
  }

  function renderNotices() {
    root.innerHTML = `${pageHead("OFFICIAL NOTICE", "공지", "현재 이벤트와 APP 이용에 필요한 공개 안내입니다.")}<div class="notice-list">${data.notices.map((item) => `<article class="notice-item"><span>${esc(item.category)}</span><div><h3>${esc(item.title)}</h3><p>${esc(item.body)}</p></div><time>${esc(item.date)}</time></article>`).join("")}</div>`;
  }

  function renderAuth(returnTo) {
    const safe = domain.safeReturnTo(returnTo);
    const authQuery = new URLSearchParams(location.search);
    authQuery.set("returnTo", safe);
    history.replaceState({}, "", `${domain.normalizePath(location.pathname)}?${authQuery}`);
    root.innerHTML = `<section class="auth-gate"><p class="eyebrow">SSKR ACCOUNT</p><h1>로그인이 필요한 화면입니다.</h1><p>공개 콘텐츠는 로그인 없이 이용할 수 있습니다. 개인 신청·참가·기록은 계정을 확인한 뒤 보여드립니다.</p><div class="auth-actions">${["google","naver","kakao","apple"].map((provider) => `<button type="button" data-login-provider="${provider}">${provider.toUpperCase()}로 이용하기</button>`).join("")}</div></section>`;
    root.querySelectorAll("[data-login-provider]").forEach((button) => button.addEventListener("click", async () => {
      button.disabled = true;
      try {
        auth.linkAccount(button.dataset.loginProvider);
        context = await api.context();
        renderChrome();
        route(domain.safeReturnTo(new URLSearchParams(location.search).get("returnTo")), { replace: true });
      } catch (error) { renderFailure(error); }
    }));
  }

  function renderDenied(title, copy) { root.innerHTML = `<section class="access-denied"><p class="eyebrow">ACCESS</p><h1>${esc(title)}</h1><p>${esc(copy)}</p><a class="primary-link" href="/app" data-app-link>SSKR 매니저로</a></section>`; }
  function renderNotFound() { renderDenied("페이지를 찾을 수 없습니다.", "주소를 확인하거나 SSKR 매니저에서 다시 이동해 주세요."); }

  function renderFailure(error) {
    root.innerHTML = `<section class="access-denied"><p class="eyebrow">SSKR MANAGER</p><h1>화면을 표시하지 못했습니다.</h1><p>${esc(error?.message || "현재 상태를 다시 확인해 주세요.")}</p><button class="primary-link" id="app-retry" type="button">다시 시도</button></section>`;
    root.querySelector("#app-retry").addEventListener("click", () => load());
  }

  function renderRoute() {
    const path = domain.normalizePath(location.pathname);
    const routeTitles = {
      "/app": "SSKR 매니저",
      "/app/current": context.event?.publicTitle || "현재 SSKR",
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
      else renderDenied("현재 참가자에게만 열리는 화면입니다.", "참가 확정 후 준비 정보를 확인할 수 있습니다.");
    } else if (path === "/app") renderHome();
    else if (path === "/app/current") renderCurrent();
    else if (path === "/app/spots") renderSpots();
    else if (path.startsWith("/app/spots/")) renderSpots(path.split("/").pop());
    else if (path === "/app/memorials") renderMemorials();
    else if (path.startsWith("/app/memorials/")) renderMemorials(path.split("/").pop());
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
