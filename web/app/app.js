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
  const nav = document.querySelector("#app-nav");
  const params = new URLSearchParams(location.search);
  const scenario = params.get("scenario") || "session";
  const linkedScenarios = new Set(["logged-in-no-application", "application-step1", "application-step2", "application-step3", "application-payment", "processing", "failed", "active", "past-only", "current+past", "private-owner", "private-other", "blocked", "c-payment-deferred", "c-confirmed-spots", "c-preparation", "c-ride-check", "c-countdown", "c-live-confirmed", "c-season-completed", "c-season-no-show", "c-season-retired"]);
  const publicScenarios = new Set(["guest", "public-memorial"]);
  let context = null;
  let pendingRoute = null;
  let disposeSpots = null;
  let disposeMemorials = null;
  let disposeAuth = null;
  let disposePreparation = null;
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
    const target = new URL(path, location.origin);
    const search = new URLSearchParams(navigationSearch());
    ['mode','tab'].forEach(key=>search.delete(key));
    target.searchParams.forEach((value,key)=>search.set(key,value));
    const destination = safe + (search.size ? '?' + search : '');
    const currentPath = domain.normalizePath(location.pathname);
    if (replace) history.replaceState({}, "", destination);
    else if (destination !== location.pathname + location.search) history.pushState({}, "", destination);
    renderRouteSafely();
    if (safe !== currentPath) window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }

  function handleAppLink(event) {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest("[data-app-link]");
    if (!link || link.hasAttribute('download') || link.target && link.target.toLowerCase() !== '_self') return;
    const destination = new URL(link.href, location.href);
    if (destination.origin !== location.origin || !/^\/app(?:\/|$)/.test(destination.pathname)) return;
    event.preventDefault();
    route(link.getAttribute("href"));
    nav.classList.remove("is-open");
    document.querySelector("#mobile-nav-toggle").setAttribute("aria-expanded", "false");
  }

  function displayAccount() {
    return context.account;
  }
  function renderAccount() {
    accountControl.render(accountRoot, {
      account: displayAccount(),
      showGuest: true,
      showReset: true,
      onLogin: () => renderAuth(domain.normalizePath(location.pathname)),
      onProfile: () => route("/app/profile"),
      onSettings: () => route("/app/profile"),
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
    renderAccount();
  }

  const eventTitle = () => context.event?.publicTitle || 'SSKR';

  function renderHome() {
    let plans = [], planError = '';
    if (context.account.linked) {
      try { plans = window.SSKR_ROUTE_PLAN.createStore(window.localStorage, window.SSKR_SPOT_CATALOG).list(context.account); }
      catch (error) { planError = error.message; }
    }
    const model = managerResolver.resolveManager(context, { plans, notices: data.notices });
    const appLink = (url,label,cls='manager-link') => '<a class="'+cls+'" href="'+esc(url.startsWith('/participate')?participateHref(url):url)+'"'+(url.startsWith('/app')?' data-app-link':'')+'>'+esc(label)+' <span aria-hidden="true">↗</span></a>';
    const planCards = model.plans.map(item=>'<article class="manager-plan-card"><span>경유 '+item.stopIds.length+'곳 · '+(item.stopIds.length>=window.SSKR_CHECKIN_RULES.minimumSpotCheckins(context.event)?'최소 경유 수 충족':'초안')+'</span><h3>'+esc(item.title||'이름 없는 루트')+'</h3><p>'+esc(window.SSKR_MAP.formatPlaceText(window.SSKR_SPOT_CATALOG.find(p=>p.id===item.startId)?.name||'출발지 미정'))+' → '+esc(window.SSKR_SPOT_CATALOG.find(p=>p.id===item.finishId)?.name||'도착지 확인 필요')+'</p>'+appLink('/app/spots?mode=plan&tab=saved','저장 목록에서 열기')+'</article>').join('');
    root.innerHTML = '<div class="manager-dashboard">'+
      (model.alert?'<aside class="manager-alert"><strong>'+esc(model.alert.title)+'</strong><p>'+esc(model.alert.body)+'</p>'+appLink('/app/notices','공지 확인')+'</aside>':'')+
      '<section class="manager-welcome"><div><p class="eyebrow">'+esc(model.label)+'</p><h2>'+esc(model.title)+'</h2><p>'+esc(model.copy)+'</p></div>'+(model.primaryAction?appLink(model.primaryAction.href,model.primaryAction.label,'manager-primary'):'')+'</section>'+
      (model.banner?'<a class="manager-event-banner" href="'+esc(participateHref(model.banner.href))+'"><strong>'+esc(model.banner.title)+' 참가안내</strong><span>'+esc(model.banner.status)+' · 일정과 참가 조건 확인</span><b aria-hidden="true">→</b></a>':'')+
      '<div class="manager-columns"><div><section class="manager-section"><header><div><p class="eyebrow">MY ROUTES</p><h2>다음 여정</h2></div>'+appLink('/app/spots?mode=plan','루트 만들기')+'</header>'+
      (planError?'<p role="alert">'+esc(planError)+'</p>':planCards||'<div class="manager-empty"><h3>'+(model.linked?'아직 저장한 루트가 없어요.':'어떤 길로 달려볼까요?')+'</h3><p>'+(model.linked?'출발지와 마음에 드는 스팟을 골라 하루를 그려보세요.':'로그인 없이 루트를 만들어볼 수 있어요. 로그인하면 참가 신청 전에도 저장할 수 있습니다.')+'</p></div>')+
      (model.planCount>3?appLink('/app/spots?mode=plan&tab=saved','저장 루트 '+model.planCount+'개 보기'):'')+'</section>'+
      (model.preparation.length?'<section class="manager-section"><header><h2>참가 준비</h2>'+appLink('/app/preparation','준비 확인')+'</header><dl class="manager-preparation-list">'+model.preparation.map(row=>'<div><dt>'+esc(row.label)+'</dt><dd>'+esc(row.key==='start'?(window.SSKR_MAP.formatPlaceText(window.SSKR_SPOT_CATALOG.find(p=>p.id===row.value)?.name||row.value)):row.value)+'</dd></div>').join('')+'</dl></section>':'')+'</div>'+
      '<aside><section class="manager-section manager-notices"><header><h2>최근 공지</h2>'+appLink('/app/notices','전체 보기')+'</header>'+(model.notices.length?'<ul>'+model.notices.map(item=>'<li><time>'+esc(item.date)+'</time><a href="/app/notices" data-app-link>'+esc(item.title)+'</a></li>').join('')+'</ul>':'<p>새로운 공지가 등록되면 알려드릴게요.</p>')+'</section><a class="manager-discover" href="/app/memorials" data-app-link><span>RIDERS’ STORIES</span><h2>다른 라이더의 하루</h2><p>같은 하루에 남긴 서로 다른 사진과 기록을 만나보세요.</p><b>메모리얼 둘러보기 ↗</b></a></aside></div></div>';
  }

  function renderSpots(id) {
    disposeSpots = window.SSKR_APP_SPOTS.mount(root, {
      id, participation: context.participation,
      getAccount: () => context.account,
      getEvent: () => context.event,
      getParticipation: () => context.participation,
      onLogin: async provider => {
        auth.linkAccount(provider);
        if (publicScenarios.has(scenario)) window.SSKR_MOCK_SESSION.replaceScenario("logged-in-no-application");
        context = await api.context();
        renderChrome();
        return context.account;
      }
    });
  }

  function renderMemorials() {
    disposeMemorials = window.SSKR_MEMORIALS.mount({
      root, store: memorialStore, account: memorialAccount(),
      history: context.pastParticipations || [],
      event: window.SSKR_MEMORIAL_FIXTURE.event,
      path: domain.normalizePath(location.pathname)
    });
  }

  function renderMy() { renderMemorials(); }

  function renderPreparation() {
    disposePreparation=window.SSKR_PREPARATION.mount(root,context,{notices:data.notices,onUpdate:contextUpdater()});
  }

  function contextUpdater() {
    const accountId=context.account.id,linked=context.account.linked,participationId=context.participation?.id;
    return next=>{if(context.account.id!==accountId||context.account.linked!==linked||auth.isAccountLinked()!==linked||context.participation?.id!==participationId)return false;context=next;renderChrome();return true;};
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
        if (publicScenarios.has(scenario)) window.SSKR_MOCK_SESSION.replaceScenario("logged-in-no-application");
        context = await api.context();
        renderChrome();
        route(safe, { replace: true });
      }
    });
  }

  function renderDenied(title, copy) { root.innerHTML = `<section class="access-denied"><p class="eyebrow">ACCESS</p><h1>${esc(title)}</h1><p>${esc(copy)}</p><a class="primary-link" href="/app" data-app-link>SSKR 매니저로</a></section>`; }
  function renderParticipantUnavailable() { root.innerHTML = `${pageHead("PARTICIPANT ONLY", "참가 준비", participantAccessCopy)}<section class="participant-availability"><p>${esc(participantAccessCopy)}</p><a class="primary-link" href="/app" data-app-link>${esc(eventTitle())} 확인</a></section>`; }
  function renderNotFound() { renderDenied("페이지를 찾을 수 없습니다.", "주소를 확인하거나 SSKR 매니저에서 다시 이동해 주세요."); }

  function renderFailure(error) {
    disposePreparation?.(); disposePreparation = null;
    disposeSpots?.(); disposeSpots = null;
    disposeMemorials?.(); disposeMemorials = null;
    root.innerHTML = `<section class="access-denied"><p class="eyebrow">SSKR MANAGER</p><h1>화면을 표시하지 못했습니다.</h1><p>${esc(error?.message || "현재 상태를 다시 확인해 주세요.")}</p><button class="primary-link" id="app-retry" type="button">다시 시도</button></section>`;
    root.querySelector("#app-retry").addEventListener("click", () => load());
  }

  function renderRoute() {
    disposePreparation?.(); disposePreparation = null;
    disposeAuth?.(); disposeAuth = null;
    disposeSpots?.(); disposeSpots = null;
    disposeMemorials?.(); disposeMemorials = null;
    const path = domain.normalizePath(location.pathname);
    if (path === '/app/current') { location.replace(participateHref('/participate?view=guide')); return; }
    if (path === '/app/memorials/all' || path === '/app/memorials/mine') { route(path.endsWith('/mine')?'/app/my':'/app/memorials',{replace:true}); return; }
    const routeTitles = {
      "/app": "SSKR 매니저",
      "/app/spots": "스팟",
      "/app/memorials": "메모리얼",
      "/app/my": "내 기록",
      "/app/profile": "내 계정",
      "/app/preparation": "참가 준비",
      "/app/notices": "공지"
    };
    const routeRoot = path.startsWith("/app/memorials/mine/") ? "/app/my" : path.startsWith("/app/spots/") ? "/app/spots" : path.startsWith("/app/memorials/") ? "/app/memorials" : path;
    sectionTitle.textContent = routeTitles[routeRoot] || "SSKR";
    document.title = `${sectionTitle.textContent} · SSKR`;
    const access = domain.canAccess(path, { linked: context.account.linked, relation: relation() });
    nav.querySelectorAll("[data-app-link]").forEach((link) => link.classList.toggle("is-current", link.getAttribute("href") === routeRoot));
    if (!access.allowed) {
      if (access.reason === "AUTH_REQUIRED") renderAuth(access.returnTo);
      else if (access.reason === "ACTIVE_PARTICIPATION_REQUIRED") renderParticipantUnavailable();
      else renderDenied("현재 참가자에게만 열리는 화면입니다.", participantAccessCopy);
    } else if (path === "/app") renderHome();
    else if (path === "/app/spots") renderSpots();
    else if (path.startsWith("/app/spots/")) renderSpots(path.split("/").pop());
    else if (path === "/app/memorials") renderMemorials();
    else if (path.startsWith("/app/memorials/")) renderMemorials();
    else if (path === "/app/my") renderMy();
    else if (path === "/app/preparation") renderPreparation();
    else if (path === "/app/profile") disposePreparation=window.SSKR_PREPARATION.profile(root,context,contextUpdater());
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
      try { await window.SSKR_MEMORIAL_MEDIA.read(); } catch { /* Reading existing records must work without upload storage. */ }
      if (linkedScenarios.has(scenario) && !auth.isAccountLinked()) auth.linkAccount("google");
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
  document.querySelectorAll(".utility-button")[1]?.addEventListener("click", () => route("/app/profile"));
  window.addEventListener("popstate", renderRouteSafely);
  document.addEventListener("click", handleAppLink);
  load();
})();
