(() => {
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
  const steps = ["진행 방식", "필수 동의", "유형 · 정보", "결제"];
  const noticeGroups = window.SSKR_STEP1_CONTENT?.groups || [];

  function shell(context, content) {
    const current = Number(context.surface.step?.split("_")[1] || 1);
    return `
      <div class="transaction-shell transaction-shell--step-${current}">
        <header class="transaction-header">
          <div><p class="transaction-eyebrow">${escapeHtml(context.event.publicTitle)} APPLICATION</p><strong class="step-count">STEP ${current} / 4</strong></div>
          <ol class="step-indicator" aria-label="신청 진행 단계">
            ${steps.map((label, index) => `<li class="${index + 1 === current ? "is-current" : index + 1 < current ? "is-complete" : ""}"><span>${index + 1}</span>${label}</li>`).join("")}
          </ol>
        </header>
        ${content}
      </div>`;
  }

  function renderStep1(root, context, handlers) {
    const acknowledged = (context.application?.acknowledgements || []).some((item) => item.code === "PARTICIPATION_GUIDE");
    const groups = noticeGroups.map((group, groupIndex) => `
      <section class="notice-group" data-notice-group="${escapeHtml(group.key)}">
        <header><span class="notice-bullet" aria-hidden="true"></span><h3>${escapeHtml(group.title)}</h3></header>
        <div class="notice-grid">
          ${group.items.map((item) => `<figure class="notice-item" data-asset-key="${item.key}"><span class="notice-visual-frame"><img class="notice-visual" src="${escapeHtml(item.asset)}" alt="${escapeHtml(item.caption)} 삽화" loading="${groupIndex === 0 ? "eager" : "lazy"}" decoding="async" /></span><figcaption>${escapeHtml(item.caption)}</figcaption></figure>`).join("")}
        </div>
      </section>`).join("");

    root.innerHTML = shell(context, `
      <section class="transaction-body transaction-body--notice" aria-labelledby="application-title">
        <p class="step-label">STEP 1</p>
        <h2 id="application-title" tabindex="-1">참가 전에 꼭 확인해 주세요</h2>
        <p class="transaction-lead">SSKR의 하루를 안전하게 완성하기 위해 실제 진행 방식을 먼저 확인합니다.</p>
        <div class="notice-groups">${groups}</div>
        <form class="acknowledgement-form" id="acknowledgement-form">
          <label><input type="checkbox" id="guide-acknowledgement" ${acknowledged ? "checked" : ""} /><span>SSKR의 진행 방식과 위 내용을 확인했습니다.</span></label>
          <button class="transaction-primary" type="submit" ${acknowledged ? "" : "disabled"}>다음 <span aria-hidden="true">→</span></button>
        </form>
      </section>`);

    root.querySelectorAll(".notice-visual").forEach((image) => image.addEventListener("error", () => image.closest(".notice-item")?.classList.add("is-image-missing")));
    const form = root.querySelector("#acknowledgement-form");
    const checkbox = root.querySelector("#guide-acknowledgement");
    const submit = form.querySelector("button[type='submit']");
    checkbox.addEventListener("change", () => { submit.disabled = !checkbox.checked; });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (checkbox.checked) handlers.saveAcknowledgement({ acknowledged: true });
    });
  }

  function agreementRow(item) {
    const qualifier = item.required ? "필수" : "선택";
    return `<div class="agreement-row">
      <label><input type="checkbox" name="agreement" value="${escapeHtml(item.code)}" data-required="${String(item.required)}" ${item.accepted ? "checked" : ""} /><span><strong>[${qualifier}] ${escapeHtml(item.title)}</strong><small>${escapeHtml(item.summary)}</small></span></label>
      <button type="button" class="text-action" data-agreement-view="${escapeHtml(item.code)}" aria-label="${escapeHtml(item.title)} 상세 보기">보기</button>
    </div>`;
  }

  function renderStep2(root, context, handlers) {
    const agreements = context.application?.agreements || context.agreementDocuments || [];
    const required = agreements.filter((item) => item.required);
    const optional = agreements.filter((item) => !item.required);
    root.innerHTML = shell(context, `
      <section class="transaction-body" aria-labelledby="application-title">
        <p class="step-label">STEP 2</p>
        <h2 id="application-title" tabindex="-1">참가 약관 및 필수 동의</h2>
        <p class="transaction-lead">참가 진행 안내와 법률·운영상 동의를 분리해 확인합니다.</p>
        <form class="agreement-form" id="agreement-form">
          <label class="agreement-all"><input type="checkbox" id="required-agreement-all" /><span><strong>필수 항목 전체 동의</strong><small>현재 행사에서 필요한 필수 동의를 한 번에 선택합니다.</small></span></label>
          <div class="agreement-list">${required.map(agreementRow).join("")}</div>
          ${optional.length ? `<section class="optional-agreements" aria-label="선택 동의"><button class="optional-agreements-toggle" id="optional-agreements-toggle" type="button" aria-expanded="false" aria-controls="optional-agreements-panel"><span><strong>선택 항목 보기</strong><small>선택하지 않아도 다음 단계로 진행할 수 있습니다.</small></span><b aria-hidden="true">＋</b></button><div id="optional-agreements-panel" hidden><label class="agreement-all"><input type="checkbox" id="optional-agreement-all" /><span><strong>선택 항목 전체 동의</strong><small>원하는 항목만 선택할 수도 있습니다.</small></span></label><div class="agreement-list">${optional.map(agreementRow).join("")}</div></div></section>` : ""}
          <button class="transaction-primary" type="submit" disabled>다음 <span aria-hidden="true">→</span></button>
        </form>
        <dialog class="agreement-dialog" id="agreement-dialog" aria-labelledby="agreement-dialog-title"><div><p>AGREEMENT DOCUMENT</p><h3 id="agreement-dialog-title"></h3><span id="agreement-dialog-version"></span><p id="agreement-dialog-summary"></p><div class="agreement-placeholder">현재 개발 단계의 문서 영역입니다. 실제 전문은 운영 확정본으로 교체됩니다.</div><button type="button" id="agreement-dialog-close">닫기</button></div></dialog>
      </section>`);

    const form = root.querySelector("#agreement-form");
    const checks = [...root.querySelectorAll('input[name="agreement"]')];
    const requiredChecks = checks.filter((input) => input.dataset.required === "true");
    const optionalChecks = checks.filter((input) => input.dataset.required === "false");
    const requiredAll = root.querySelector("#required-agreement-all");
    const optionalAll = root.querySelector("#optional-agreement-all");
    const optionalToggle = root.querySelector("#optional-agreements-toggle");
    const optionalPanel = root.querySelector("#optional-agreements-panel");
    const submit = form.querySelector("button[type='submit']");
    const sync = () => {
      requiredAll.checked = requiredChecks.every((input) => input.checked);
      requiredAll.indeterminate = requiredChecks.some((input) => input.checked) && !requiredAll.checked;
      if (optionalAll) {
        optionalAll.checked = optionalChecks.length > 0 && optionalChecks.every((input) => input.checked);
        optionalAll.indeterminate = optionalChecks.some((input) => input.checked) && !optionalAll.checked;
      }
      submit.disabled = !requiredAll.checked;
    };
    requiredAll.addEventListener("change", () => { requiredChecks.forEach((input) => { input.checked = requiredAll.checked; }); sync(); });
    optionalAll?.addEventListener("change", () => { optionalChecks.forEach((input) => { input.checked = optionalAll.checked; }); sync(); });
    optionalToggle?.addEventListener("click", () => {
      const expanded = optionalToggle.getAttribute("aria-expanded") === "true";
      optionalToggle.setAttribute("aria-expanded", String(!expanded));
      optionalPanel.hidden = expanded;
      optionalToggle.querySelector("strong").textContent = expanded ? "선택 항목 보기" : "선택 항목 접기";
      optionalToggle.querySelector("b").textContent = expanded ? "＋" : "−";
    });
    checks.forEach((input) => input.addEventListener("change", sync));
    const dialog = root.querySelector("#agreement-dialog");
    root.querySelectorAll("[data-agreement-view]").forEach((button) => button.addEventListener("click", () => {
      const item = agreements.find((agreement) => agreement.code === button.dataset.agreementView);
      root.querySelector("#agreement-dialog-title").textContent = item.title;
      root.querySelector("#agreement-dialog-version").textContent = `문서 버전 ${item.version}`;
      root.querySelector("#agreement-dialog-summary").textContent = item.summary;
      if (typeof dialog.showModal === "function") dialog.showModal(); else dialog.setAttribute("open", "");
    }));
    root.querySelector("#agreement-dialog-close").addEventListener("click", () => { if (typeof dialog.close === "function") dialog.close(); else dialog.removeAttribute("open"); });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      handlers.saveAgreements(Object.fromEntries(checks.map((input) => [input.value, input.checked])));
    });
    sync();
  }

  function renderStep3(root, context, handlers) {
    const participant = context.application?.participant || context.account?.profile || {};
    const bike = context.application?.bike || {};
    const selectedId = context.application?.priceTierId || "";
    root.innerHTML = shell(context, `
      <section class="transaction-body" aria-labelledby="application-title">
        <p class="step-label">STEP 3</p>
        <h2 id="application-title" tabindex="-1">참가 유형 및 참가자 정보</h2>
        <p class="transaction-lead">참가 유형을 고르고 실제 운영 연락에 사용할 정보를 확인해 주세요.</p>
        <form class="participant-form" id="participant-form" novalidate>
          <fieldset class="tier-fields"><legend>참가 유형 <span>필수</span></legend><div class="tier-grid">
            ${(context.tiers || []).map((tier) => `<label class="tier-card ${tier.availability.selectable ? "" : "is-disabled"}"><input type="radio" name="priceTierId" value="${tier.id}" ${tier.id === selectedId ? "checked" : ""} ${tier.availability.selectable ? "" : "disabled"} /><span class="tier-card-head"><small>${tier.code}</small><em>${escapeHtml(tier.availability.label)}</em></span><strong>${escapeHtml(tier.displayName)}</strong><b>${escapeHtml(tier.displayAmount)}</b><span class="tier-benefits">${tier.benefits.map((benefit) => `<i>${escapeHtml(benefit)}</i>`).join("")}</span></label>`).join("")}
          </div><aside class="tier-selection-summary" id="tier-selection-summary" aria-live="polite"></aside><small class="field-error" id="tier-error"></small></fieldset>
          <fieldset class="participant-fields"><legend>참가자 정보</legend><div class="field-grid">
            <label class="field"><span>이름 <b aria-label="필수">*</b></span><input name="name" autocomplete="name" value="${escapeHtml(participant.name)}" aria-describedby="name-error" required /><small class="field-error" id="name-error"></small></label>
            <label class="field"><span>휴대전화 <b aria-label="필수">*</b></span><input name="phone" inputmode="tel" autocomplete="tel" placeholder="010-0000-0000" value="${escapeHtml(participant.phone)}" aria-describedby="phone-error" required /><small class="field-error" id="phone-error"></small></label>
            <label class="field field--wide"><span>이메일 <b aria-label="필수">*</b></span><input name="email" type="email" autocomplete="email" value="${escapeHtml(participant.email)}" aria-describedby="email-error" required /><small class="field-error" id="email-error"></small></label>
          </div></fieldset>
          <fieldset class="bike-fields"><legend>바이크 정보 <span>(선택)</span></legend><p>${escapeHtml(context.event.bikeInfoDeadlineAt?.slice(0, 10) || "행사 준비기간")}까지 보완할 수 있습니다.</p><div class="field-grid field-grid--three"><label class="field"><span>제조사</span><input name="bikeMaker" value="${escapeHtml(bike.maker)}" /></label><label class="field"><span>모델명</span><input name="bikeModel" value="${escapeHtml(bike.model)}" /></label><label class="field"><span>배기량 / 클래스</span><input name="bikeClass" value="${escapeHtml(bike.className)}" /></label></div></fieldset>
          <p class="mock-data-note">현재 정보는 Mock User Account와 개발용 신청 Snapshot에만 저장됩니다.</p>
          <button class="transaction-primary" type="submit">다음 <span aria-hidden="true">→</span></button>
        </form>
      </section>`);
    const form = root.querySelector("#participant-form");
    const summary = root.querySelector("#tier-selection-summary");
    const updateTierSummary = () => {
      const selected = context.tiers?.find((tier) => tier.id === form.elements.priceTierId.value);
      summary.innerHTML = selected
        ? `<span>선택한 참가 유형</span><strong>${escapeHtml(selected.displayName)} · ${escapeHtml(selected.displayAmount)}</strong><small>${selected.benefits.map(escapeHtml).join(" · ")} · ${escapeHtml(selected.availability.label)}</small>`
        : `<span>선택한 참가 유형</span><strong>아직 선택하지 않았습니다.</strong><small>이용 가능한 유형을 선택하면 금액과 혜택을 바로 확인할 수 있습니다.</small>`;
    };
    form.querySelectorAll('input[name="priceTierId"]').forEach((input) => input.addEventListener("change", updateTierSummary));
    updateTierSummary();
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const values = new FormData(form);
      const priceTierId = String(values.get("priceTierId") || "");
      const name = String(values.get("name") || "").trim();
      const phone = String(values.get("phone") || "").replace(/\D/g, "");
      const email = String(values.get("email") || "").trim();
      root.querySelector("#tier-error").textContent = priceTierId ? "" : "참가 유형을 선택해 주세요.";
      root.querySelector("#name-error").textContent = name ? "" : "이름을 입력해 주세요.";
      root.querySelector("#phone-error").textContent = /^01\d{8,9}$/.test(phone) ? "" : "휴대전화 번호를 확인해 주세요.";
      root.querySelector("#email-error").textContent = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "" : "이메일을 확인해 주세요.";
      if (!priceTierId || !name || !/^01\d{8,9}$/.test(phone) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
      handlers.saveParticipant({ priceTierId, name, phone, email, bike: { maker: values.get("bikeMaker"), model: values.get("bikeModel"), className: values.get("bikeClass") } });
    });
  }

  function paymentButton(context, retry = false) {
    const debug = window.SSKR_MOCK_SESSION.isDebug();
    return `${debug ? `<label class="mock-outcome"><span>QA 결제 결과</span><select id="mock-outcome"><option value="SUCCESS">성공</option><option value="FAIL">실패</option><option value="PROCESSING_THEN_SUCCESS">처리 중 → 성공</option><option value="PROCESSING_THEN_FAIL">처리 중 → 실패</option></select></label>` : ""}<button class="transaction-primary" id="payment-action" type="button" ${context.surface.primaryAction?.enabled === false ? "disabled" : ""}>${retry ? "다시 결제하기" : "결제 진행하기"} <span aria-hidden="true">→</span></button>`;
  }

  function renderStep4(root, context, handlers) {
    const variant = context.surface.variant;
    const tier = context.tiers?.find((item) => item.id === context.application?.priceTierId) || context.price;
    const participant = context.application?.participant || {};
    const summary = `<dl class="payment-summary"><div><dt>참가 이벤트</dt><dd>${escapeHtml(context.event.publicTitle)}</dd></div><div><dt>참가 유형</dt><dd>${escapeHtml(tier?.displayName)}</dd></div><div><dt>참가자</dt><dd>${escapeHtml(participant.name)}</dd></div><div><dt>연락처</dt><dd>${escapeHtml(participant.phone)}<small>${escapeHtml(participant.email)}</small></dd></div><div class="is-total"><dt>참가비</dt><dd>${escapeHtml(tier?.displayAmount)}</dd></div></dl>`;
    let content;
    if (variant === "PROCESSING") content = `<div class="state-message state-message--processing"><i aria-hidden="true"></i><h2 id="application-title" tabindex="-1">결제 완료를 확인하고 있습니다.</h2><p>처리 중에는 Checkout Hold가 유지됩니다. 중복 결제를 시작하지 않습니다.</p><button class="transaction-secondary" id="refresh-payment" type="button">현재 상태 다시 확인</button></div>`;
    else if (variant === "FAILED") content = `<div class="state-message"><span class="state-mark" aria-hidden="true">!</span><h2 id="application-title" tabindex="-1">결제가 완료되지 않았습니다.</h2><p>재시도 시 선택 Tier의 판매상태, 가격과 정원을 다시 확인합니다.</p>${summary}${paymentButton(context, true)}</div>`;
    else if (variant === "FINALIZING") content = `<div class="state-message state-message--processing"><i aria-hidden="true"></i><h2 id="application-title" tabindex="-1">결제 완료를 확인했습니다.<br />참가 정보를 준비하고 있습니다.</h2><p>같은 결제 결과를 다시 받아도 참가권은 중복 생성되지 않습니다.</p><button class="transaction-secondary" id="refresh-payment" type="button">현재 상태 다시 확인</button></div>`;
    else if (variant === "CLOSED") content = `<div class="state-message"><span class="state-mark" aria-hidden="true">!</span><h2 id="application-title" tabindex="-1">새로운 결제를 진행할 수 없습니다.</h2><p>${escapeHtml(context.surface.blockedReason?.message || "현재 모집 조건을 다시 확인해 주세요.")}</p>${summary}<button class="transaction-primary" type="button" disabled>결제 불가</button></div>`;
    else content = `<section class="transaction-body" aria-labelledby="application-title"><p class="step-label">STEP 4</p><h2 id="application-title" tabindex="-1">결제</h2><p class="transaction-lead">결제 시작 직전에 선택 Tier의 가격과 정원을 다시 확인합니다.</p>${summary}<button class="transaction-secondary edit-participant" id="edit-participant" type="button">참가 유형과 정보 수정</button><div class="payment-notice"><strong>결제 전 확인</strong><p>실제 카드정보는 입력하지 않습니다. Checkout Hold와 결제 상태 전이를 검증하는 Mock 단계입니다.</p></div>${paymentButton(context)}</section>`;
    root.innerHTML = shell(context, content);
    root.querySelector("#edit-participant")?.addEventListener("click", handlers.editParticipant);
    root.querySelector("#refresh-payment")?.addEventListener("click", handlers.refreshPayment);
    root.querySelector("#payment-action")?.addEventListener("click", () => handlers.startPayment(root.querySelector("#mock-outcome")?.value || "SUCCESS", variant === "FAILED"));
  }

  function render(root, context, handlers) {
    if (context.surface.step === "STEP_1") renderStep1(root, context, handlers);
    else if (context.surface.step === "STEP_2") renderStep2(root, context, handlers);
    else if (context.surface.step === "STEP_3") renderStep3(root, context, handlers);
    else renderStep4(root, context, handlers);
  }

  window.SSKR_MODE_B = Object.freeze({ render });
})();
