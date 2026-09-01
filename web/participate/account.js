(() => {
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
  const PREFERENCE_KEY = "sskr.mock.pagePreferences";
  const defaults = { reduceMotion: false, textSize: "default", highContrast: false };
  let context = null;
  let shell = null;
  let root = null;
  let callbacks = null;
  let previousSurface = null;
  let closeTimer = null;

  const readPreferences = () => {
    try { return { ...defaults, ...JSON.parse(localStorage.getItem(PREFERENCE_KEY) || "{}") }; }
    catch { return { ...defaults }; }
  };
  const savePreferences = (preferences) => {
    try { localStorage.setItem(PREFERENCE_KEY, JSON.stringify(preferences)); }
    catch { /* Presentation preferences remain active for the current view. */ }
  };
  function applyPreferences(preferences) {
    document.documentElement.dataset.reduceMotion = String(preferences.reduceMotion);
    document.documentElement.dataset.textSize = preferences.textSize;
    document.documentElement.dataset.highContrast = String(preferences.highContrast);
  }
  applyPreferences(readPreferences());

  function initials(profile = {}) {
    return String(profile.name || "SSKR").trim().slice(0, 1).toUpperCase();
  }

  function closeMenu() {
    const menu = shell?.querySelector("#account-menu");
    const trigger = shell?.querySelector("#account-trigger");
    if (!menu || !trigger) return;
    menu.hidden = true;
    trigger.setAttribute("aria-expanded", "false");
  }

  function openMenu() {
    clearTimeout(closeTimer);
    const menu = shell?.querySelector("#account-menu");
    const trigger = shell?.querySelector("#account-trigger");
    if (!menu || !trigger) return;
    menu.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
  }

  function accountHeader(title, description) {
    return `<header class="account-view-header"><button type="button" class="account-back" data-account-back>← 참가 신청으로 돌아가기</button><p>SSKR ACCOUNT</p><h2 id="account-view-title" tabindex="-1">${escapeHtml(title)}</h2><span>${escapeHtml(description)}</span></header>`;
  }

  function bindBack() {
    root.querySelector("[data-account-back]")?.addEventListener("click", () => callbacks.restore(previousSurface));
  }

  function renderProfile(editing = false, message = "") {
    const profile = context.account.profile || {};
    const providerNames = (context.account.socialIdentities || []).map((item) => item.provider).join(" · ") || context.account.provider || "연결 정보 없음";
    root.innerHTML = `<div class="account-view">${accountHeader("프로필", "SSKR 운영 연락에 사용하는 Mock Account 정보입니다.")}${message ? `<p class="account-toast" role="status">${escapeHtml(message)}</p>` : ""}
      <section class="profile-card"><div class="profile-avatar">${profile.thumbnailUrl ? `<img src="${escapeHtml(profile.thumbnailUrl)}" alt="" />` : initials(profile)}</div>
      ${editing ? `<form id="profile-form" class="account-form"><label>이름<input name="name" value="${escapeHtml(profile.name)}" required /></label><label>이메일<input name="email" type="email" value="${escapeHtml(profile.email)}" required /></label><label>휴대전화<input name="phone" inputmode="tel" value="${escapeHtml(profile.phone)}" required /></label><div><button type="button" class="transaction-secondary" id="profile-cancel">취소</button><button type="submit" class="transaction-primary">저장</button></div><p class="field-error" id="profile-error" role="alert"></p></form>` : `<dl><div><dt>이름</dt><dd>${escapeHtml(profile.name)}</dd></div><div><dt>이메일</dt><dd>${escapeHtml(profile.email)}</dd></div><div><dt>휴대전화</dt><dd>${escapeHtml(profile.phone)}</dd></div><div><dt>연결된 Social Provider</dt><dd>${escapeHtml(providerNames)}</dd></div></dl><button type="button" class="transaction-primary" id="profile-edit">수정</button>`}
      </section></div>`;
    bindBack();
    root.querySelector("#profile-edit")?.addEventListener("click", () => renderProfile(true));
    root.querySelector("#profile-cancel")?.addEventListener("click", () => renderProfile(false));
    root.querySelector("#profile-form")?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const values = new FormData(event.currentTarget);
      try {
        context = await callbacks.updateProfile({ name: values.get("name"), email: values.get("email"), phone: values.get("phone") });
        update(context);
        renderProfile(false, "프로필을 저장했습니다.");
      } catch (error) { root.querySelector("#profile-error").textContent = error.message; }
    });
  }

  function renderSettings() {
    const preferences = readPreferences();
    root.innerHTML = `<div class="account-view">${accountHeader("페이지세팅", "이 브라우저의 참가 페이지 표시 방식을 조정합니다.")}<form class="preference-form" id="preference-form"><label><span><strong>모션 효과 줄이기</strong><small>화면 전환과 스크롤 움직임을 줄입니다.</small></span><input type="checkbox" name="reduceMotion" ${preferences.reduceMotion ? "checked" : ""} /></label><fieldset><legend>글자 크기</legend><label><input type="radio" name="textSize" value="default" ${preferences.textSize === "default" ? "checked" : ""} /> 기본</label><label><input type="radio" name="textSize" value="large" ${preferences.textSize === "large" ? "checked" : ""} /> 크게</label></fieldset><label><span><strong>고대비 텍스트</strong><small>본문과 구분선 대비를 높입니다.</small></span><input type="checkbox" name="highContrast" ${preferences.highContrast ? "checked" : ""} /></label></form></div>`;
    bindBack();
    root.querySelector("#preference-form").addEventListener("change", (event) => {
      const form = event.currentTarget;
      const next = { reduceMotion: form.elements.reduceMotion.checked, textSize: form.elements.textSize.value, highContrast: form.elements.highContrast.checked };
      savePreferences(next);
      applyPreferences(next);
    });
  }

  function renderMyPage() {
    const application = context.application;
    const participation = context.participation;
    const tier = context.tiers?.find((item) => item.id === application?.priceTierId);
    const relation = participation ? (participation.slotAllocation === "WAITLISTED" ? "참가 대기" : "참가 확정") : application ? `신청 ${context.surface.step?.replace("STEP_", "STEP ") || "진행 중"}` : "진행 중인 참가 없음";
    const actionLabel = participation ? "참가 페이지로 돌아가기" : application ? "신청 계속하기" : "참가 신청 보기";
    root.innerHTML = `<div class="account-view">${accountHeader("마이페이지", "현재 Account에 연결된 SSKR 관계를 요약합니다.")}<section class="mypage-summary"><p>CURRENT RELATION</p><h3>${escapeHtml(relation)}</h3><dl><div><dt>참가 유형</dt><dd>${escapeHtml(tier?.displayName || participation?.registrationTierCode || "미선택")}</dd></div><div><dt>참가자</dt><dd>${escapeHtml(application?.participant?.name || context.account.profile?.name)}</dd></div><div><dt>Participation</dt><dd>${participation ? "ACTIVE" : "없음"}</dd></div><div><dt>다음 행동</dt><dd>${escapeHtml(context.manager?.primaryTask?.title || context.surface.title || "참가 정보 확인")}</dd></div></dl><button type="button" class="transaction-primary" id="mypage-action">${actionLabel}</button></section><section class="past-participation"><p>PAST SSKR</p><h3>지난 참가와 메모리얼</h3><span>현재 Mock Account에는 표시할 과거 참가 기록이 없습니다.</span></section></div>`;
    bindBack();
    root.querySelector("#mypage-action").addEventListener("click", callbacks.resolve);
  }

  function openView(view) {
    previousSurface = callbacks.getSurface();
    closeMenu();
    callbacks.showAccount();
    if (view === "profile") renderProfile();
    else if (view === "settings") renderSettings();
    else renderMyPage();
  }

  function bindShell() {
    const trigger = shell.querySelector("#account-trigger");
    const wrapper = shell.querySelector(".account-control");
    trigger.addEventListener("click", (event) => { event.stopPropagation(); openMenu(); });
    trigger.addEventListener("keydown", (event) => { if (["Enter", " ", "ArrowDown"].includes(event.key)) { event.preventDefault(); openMenu(); shell.querySelector("[data-account-view]")?.focus(); } });
    wrapper.addEventListener("mouseenter", openMenu);
    wrapper.addEventListener("mouseleave", () => { closeTimer = setTimeout(closeMenu, 180); });
    wrapper.addEventListener("focusin", openMenu);
    wrapper.addEventListener("focusout", (event) => { if (!wrapper.contains(event.relatedTarget)) closeTimer = setTimeout(closeMenu, 0); });
    shell.querySelectorAll("[data-account-view]").forEach((button) => button.addEventListener("click", () => openView(button.dataset.accountView)));
    shell.querySelector("#account-reset-participation")?.addEventListener("click", async () => {
      closeMenu();
      if (window.confirm("참가 신청, 결제 및 참가 확정 상태를 초기화하시겠습니까? 로그인 상태와 프로필은 유지됩니다.")) await callbacks.resetParticipation();
    });
    shell.querySelector("#account-logout").addEventListener("click", async () => { closeMenu(); if (window.confirm("로그아웃하시겠습니까? 참가 신청과 결제 정보는 삭제되지 않습니다.")) await callbacks.logout(); });
  }

  function update(nextContext) {
    context = nextContext;
    const linked = context?.account?.linked === true;
    shell.hidden = !linked;
    if (!linked) { shell.innerHTML = ""; return; }
    const profile = context.account.profile || {};
    const resetControl = window.SSKR_MOCK_SESSION?.isDebug()
      ? `<button type="button" role="menuitem" id="account-reset-participation" class="account-test-action"><span>참가 설정 초기화</span><small>개발 테스트용</small></button>`
      : "";
    shell.innerHTML = `<div class="account-control"><button type="button" class="account-trigger" id="account-trigger" aria-haspopup="menu" aria-expanded="false" aria-controls="account-menu" aria-label="계정 메뉴 열기">${profile.thumbnailUrl ? `<img src="${escapeHtml(profile.thumbnailUrl)}" alt="" />` : `<span>${initials(profile)}</span>`}</button><div class="account-menu" id="account-menu" role="menu" hidden><header><strong>${escapeHtml(profile.name)}</strong><small>${escapeHtml(profile.email)}</small></header><button type="button" role="menuitem" data-account-view="profile">프로필</button><button type="button" role="menuitem" data-account-view="settings">페이지세팅</button><button type="button" role="menuitem" data-account-view="mypage">마이페이지</button><hr />${resetControl}<button type="button" role="menuitem" id="account-logout">로그아웃</button></div></div>`;
    bindShell();
  }

  function setup(options) {
    shell = options.shell;
    root = options.root;
    callbacks = options.callbacks;
  }

  document.addEventListener("click", (event) => { if (shell && !shell.contains(event.target)) closeMenu(); });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeMenu(); });

  window.SSKR_ACCOUNT_UI = Object.freeze({ setup, update });
})();
