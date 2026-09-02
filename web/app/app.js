(() => {
  const domain = window.SSKR_APP_DOMAIN;
  const data = window.SSKR_APP_DATA;
  const api = window.SSKR_PARTICIPATE_API;
  const auth = window.SSKR_ACCOUNT_LINK;
  const accountControl = window.SSKR_ACCOUNT_CONTROL;
  if (!domain || !data || !api || !auth || !accountControl) return;

  const root = document.querySelector("#app-main");
  const accountRoot = document.querySelector("#app-account");
  const eventAction = document.querySelector("#event-action");
  const nav = document.querySelector("#app-nav");
  const params = new URLSearchParams(location.search);
  const scenario = params.get("scenario") || "session";
  const linkedScenarios = new Set(["logged-in-no-application", "application-step1", "application-step2", "application-step3", "application-payment", "processing", "failed", "active", "past-only", "current+past", "private-owner", "private-other", "blocked"]);
  const publicScenarios = new Set(["guest", "public-memorial"]);
  let context = null;

  const esc = (value) => String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
  const pageHead = (eyebrow, title, description = "") => `<header class="page-head"><div><p>${esc(eyebrow)}</p><h1>${esc(title)}</h1></div>${description ? `<span>${esc(description)}</span>` : ""}</header>`;
  const primary = (action) => `<a class="primary-link" href="${esc(action.href)}">${esc(action.label)} <span aria-hidden="true">→</span></a>`;
  const currentAction = () => domain.currentEventAction(context);
  const relation = () => domain.currentRelation(context);

  function route(path, { replace = false } = {}) {
    const safe = domain.safeReturnTo(path);
    history[replace ? "replaceState" : "pushState"]({}, "", safe + location.search);
    renderRoute();
  }

  function bindLinks() {
    document.querySelectorAll("[data-app-link]").forEach((link) => link.addEventListener("click", (event) => { event.preventDefault(); route(link.getAttribute("href")); nav.classList.remove("is-open"); }));
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
        renderChrome(); renderRoute();
      },
      onLogout: async () => {
        if (!window.confirm("로그아웃하시겠습니까? 참가 신청과 기록은 삭제되지 않습니다.")) return;
        auth.logout(); context = await api.context(); renderChrome(); renderRoute();
      }
    });
  }

  function renderChrome() {
    const action = currentAction();
    eventAction.href = action.href;
    eventAction.innerHTML = `${esc(action.label)} <span>→</span>`;
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

  function renderHome() {
    const [title, copy] = relationCopy();
    const action = currentAction();
    const guest = !context.account.linked;
    root.innerHTML = `${pageHead("SSKR WEB APP", guest ? "길 위의 모든 SSKR" : "다시, SSKR로", "공개된 대회 정보부터 나의 참가 기록까지 하나의 흐름으로 연결합니다.")}
      <section class="hero-panel"><div><p class="eyebrow">CURRENT · 2027</p><h2>${esc(title)}</h2><p>${esc(copy)}</p>${primary(action)} ${context.participation ? `<a class="secondary-link" href="/app/preparation" data-app-link>참가 준비 보기</a>` : ""}</div></section>
      <section class="content-section"><div class="section-head"><h2>공개 스팟</h2><p>참가 여부와 관계없이 둘러볼 수 있습니다.</p></div>${cards(data.spots.slice(0,3), "spots")}</section>
      <section class="content-section"><div class="section-head"><h2>최근 메모리얼</h2><p>다른 참가자가 공개한 SSKR의 하루</p></div>${cards(data.memorials.filter((item) => item.visibility === "PUBLIC"), "memorials")}</section>`;
  }

  function renderCurrent() {
    const [title, copy] = relationCopy();
    const action = currentAction();
    const active = relation() === "ACTIVE";
    root.innerHTML = `${pageHead("CURRENT SSKR", "현재 SSKR", "현재 대회와 이 계정의 관계를 기준으로 필요한 다음 행동만 보여줍니다.")}
      <section class="hero-panel"><div><p class="eyebrow">${esc(data.event.stage)} · ${esc(data.event.date)}</p><h2>${esc(title)}</h2><p>${esc(copy)}</p>${primary(action)} ${active ? `<a class="secondary-link" href="/app/preparation" data-app-link>참가 준비</a>` : ""}</div></section>
      <div class="status-band"><div><span>현재 관계</span><strong>${esc(action.relation)}</strong><p>${esc(data.event.description)}</p></div><div><span>이벤트 상태</span><strong>${esc(context.event?.stageLabel || "스팟 공개")}</strong><p>${esc(context.event?.eventDateDisplay || data.event.date)}</p></div></div>`;
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
      const account = scenario === "private-other" ? { id: "mock-rider-other" } : context.account;
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
      <section class="content-section"><div class="section-head"><h2>현재 SSKR</h2></div><div class="status-band"><div><span>CURRENT RELATION</span><strong>${esc(currentAction().relation)}</strong><p>${esc(relationCopy()[1])}</p></div><div><span>PARTICIPANT</span><strong>${esc(active?.participantNumber || "—")}</strong><p>${esc(active?.registrationTierCode || (context.application ? "신청 진행 중" : "참가 내역 없음"))}</p></div></div></section>
      <section class="content-section"><div class="section-head"><h2>지난 참가</h2><p>${past.length ? `${past.length}개의 기록` : "기록 없음"}</p></div>${past.length ? `<div class="notice-list">${past.map((item) => `<a class="notice-item" href="/app/memorials/${esc(item.memorialId)}" data-app-link><span>${item.year}</span><div><h3>SSKR ${item.year}</h3><p>${esc(item.result)} · ${esc(item.tier)} · ${esc(item.participantNumber)}</p></div><time>메모리얼 →</time></a>`).join("")}</div>` : `<div class="empty-state"><h1>아직 지난 참가 기록이 없습니다.</h1><p>완료된 대회의 참가 및 메모리얼 기록이 이곳에 모입니다.</p></div>`}</section>`;
  }

  function renderPreparation() {
    root.innerHTML = `${pageHead("PARTICIPANT ONLY", "참가 준비", "현재 활성 참가권이 있는 계정에만 열리는 준비 정보 목업입니다.")}<div class="status-band"><div><span>참가 번호</span><strong>${esc(context.participation.participantNumber)}</strong><p>${esc(context.participation.registrationTierCode)} 참가</p></div><div><span>준비 상태</span><strong>준비 시작</strong><p>실제 물류·배송·체크인 기능은 포함하지 않습니다.</p></div></div><section class="content-section"><div class="notice-list"><div class="notice-item"><span>01</span><div><h3>바이크 기본 정보 확인</h3><p>신청 시 등록한 바이크 정보를 확인합니다.</p></div><time>확인 필요</time></div><div class="notice-item"><span>02</span><div><h3>안전 장비 준비</h3><p>헬멧과 보호 장구를 사전에 점검합니다.</p></div><time>안내</time></div></div></section>`;
  }

  function renderNotices() {
    root.innerHTML = `${pageHead("OFFICIAL NOTICE", "공지", "현재 이벤트와 APP 이용에 필요한 공개 안내입니다.")}<div class="notice-list">${data.notices.map((item) => `<article class="notice-item"><span>${esc(item.category)}</span><div><h3>${esc(item.title)}</h3><p>${esc(item.body)}</p></div><time>${esc(item.date)}</time></article>`).join("")}</div>`;
  }

  function renderAuth(returnTo) {
    const safe = domain.safeReturnTo(returnTo);
    history.replaceState({}, "", `${location.pathname}?${new URLSearchParams({ ...Object.fromEntries(params), returnTo: safe })}`);
    root.innerHTML = `<section class="auth-gate"><p class="eyebrow">SSKR ACCOUNT</p><h1>로그인이 필요한 화면입니다.</h1><p>공개 콘텐츠는 로그인 없이 이용할 수 있습니다. 개인 신청·참가·기록은 계정을 확인한 뒤 보여드립니다.</p><div class="auth-actions">${["google","naver","kakao","apple"].map((provider) => `<button type="button" data-login-provider="${provider}">${provider.toUpperCase()}로 이용하기</button>`).join("")}</div></section>`;
    root.querySelectorAll("[data-login-provider]").forEach((button) => button.addEventListener("click", async () => { auth.linkAccount(button.dataset.loginProvider); context = await api.context(); renderChrome(); route(domain.safeReturnTo(new URLSearchParams(location.search).get("returnTo")), { replace: true }); }));
  }

  function renderDenied(title, copy) { root.innerHTML = `<section class="access-denied"><p class="eyebrow">ACCESS</p><h1>${esc(title)}</h1><p>${esc(copy)}</p><a class="primary-link" href="/app" data-app-link>APP 홈으로</a></section>`; }
  function renderNotFound() { renderDenied("페이지를 찾을 수 없습니다.", "주소를 확인하거나 APP 홈에서 다시 이동해 주세요."); }

  function renderRoute() {
    const path = domain.normalizePath(location.pathname);
    const access = domain.canAccess(path, { linked: context.account.linked, relation: relation() });
    document.querySelectorAll("[data-app-link]").forEach((link) => link.classList.toggle("is-current", link.getAttribute("href") === path));
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
    bindLinks();
    root.focus({ preventScroll: true });
  }

  async function load() {
    try {
      if (linkedScenarios.has(scenario) && !auth.isAccountLinked()) auth.linkAccount("mock");
      if (publicScenarios.has(scenario) && auth.isAccountLinked()) auth.logout();
      if (scenario === "current+past") context = await api.mock("RESET", { scenario: "active", snapshot: null });
      else if (["past-only", "private-owner", "private-other"].includes(scenario)) context = await api.mock("RESET", { scenario: "logged-in-no-application", snapshot: null });
      else context = await api.context();
      renderChrome(); renderRoute();
    } catch (error) { root.innerHTML = `<section class="access-denied"><h1>SSKR APP을 불러오지 못했습니다.</h1><p>${esc(error.message)}</p><button class="primary-link" type="button" onclick="location.reload()">다시 시도</button></section>`; }
  }

  document.querySelector("#mobile-nav-toggle").addEventListener("click", (event) => { const open = nav.classList.toggle("is-open"); event.currentTarget.setAttribute("aria-expanded", String(open)); });
  window.addEventListener("popstate", renderRoute);
  bindLinks(); load();
})();
