(() => {
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
  const initial = (profile = {}) => String(profile.name || "SSKR").trim().slice(0, 1).toUpperCase();

  function render(root, options = {}) {
    root._sskrAccountCleanup?.();
    const account = options.account || { linked: false };
    root.hidden = false;
    if (!account.linked) {
      root.innerHTML = options.showGuest === false ? "" : `<button class="shared-login-control" type="button">로그인</button>`;
      root.hidden = options.showGuest === false;
      root.querySelector(".shared-login-control")?.addEventListener("click", () => options.onLogin?.());
      return;
    }
    const profile = account.profile || {};
    root.innerHTML = `<div class="account-control"><button type="button" class="account-trigger" aria-haspopup="menu" aria-expanded="false" aria-controls="shared-account-menu" aria-label="계정 메뉴 열기">${profile.thumbnailUrl ? `<img src="${escapeHtml(profile.thumbnailUrl)}" alt="" />` : `<span>${initial(profile)}</span>`}</button><div class="account-menu" id="shared-account-menu" role="menu" hidden><header><strong>${escapeHtml(profile.name)}</strong><small>${escapeHtml(profile.email)}</small></header><button type="button" role="menuitem" data-account-action="profile">프로필</button><button type="button" role="menuitem" data-account-action="settings">페이지세팅</button><a role="menuitem" href="/app/my">마이페이지</a><hr />${options.showReset ? `<button type="button" role="menuitem" class="account-test-action" data-account-action="reset"><span>참가 설정 초기화</span><small>개발 테스트용</small></button>` : ""}<button type="button" role="menuitem" data-account-action="logout">로그아웃</button></div></div>`;
    const wrapper = root.querySelector(".account-control");
    const trigger = root.querySelector(".account-trigger");
    const menu = root.querySelector(".account-menu");
    let closeTimer;
    let clickPinned = false;
    const close = () => { clearTimeout(closeTimer); clickPinned = false; menu.hidden = true; trigger.setAttribute("aria-expanded", "false"); };
    const open = () => { clearTimeout(closeTimer); menu.hidden = false; trigger.setAttribute("aria-expanded", "true"); };
    trigger.addEventListener("click", (event) => { event.stopPropagation(); if (clickPinned) close(); else { clickPinned = true; open(); } });
    trigger.addEventListener("keydown", (event) => { if (["Enter", " ", "ArrowDown"].includes(event.key)) { event.preventDefault(); open(); menu.querySelector("[role=menuitem]")?.focus(); } });
    wrapper.addEventListener("mouseenter", open);
    wrapper.addEventListener("mouseleave", () => { if (!clickPinned) closeTimer = setTimeout(close, 180); });
    wrapper.addEventListener("focusin", open);
    wrapper.addEventListener("focusout", (event) => { if (!clickPinned && !wrapper.contains(event.relatedTarget)) closeTimer = setTimeout(close, 0); });
    root.querySelectorAll("[data-account-action]").forEach((control) => control.addEventListener("click", () => { close(); options[`on${control.dataset.accountAction[0].toUpperCase()}${control.dataset.accountAction.slice(1)}`]?.(); }));
    const outside = (event) => { if (!root.contains(event.target)) close(); };
    const escape = (event) => { if (event.key === "Escape") close(); };
    document.addEventListener("click", outside);
    document.addEventListener("keydown", escape);
    root._sskrAccountCleanup = () => { document.removeEventListener("click", outside); document.removeEventListener("keydown", escape); };
  }

  window.SSKR_ACCOUNT_CONTROL = Object.freeze({ render });
})();
