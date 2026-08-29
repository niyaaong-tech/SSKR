(() => {
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
  const steps = ["조건 확인", "참가자 정보", "결제"];

  function shell(context, content) {
    const current = Number(context.surface.step?.split("_")[1] || 1);
    return `
      <div class="transaction-shell">
        <header class="transaction-header">
          <p class="transaction-eyebrow">${escapeHtml(context.event.publicTitle)} APPLICATION</p>
          <ol class="step-indicator" aria-label="신청 진행 단계">
            ${steps.map((label, index) => `<li class="${index + 1 === current ? "is-current" : index + 1 < current ? "is-complete" : ""}"><span>${index + 1}</span>${label}</li>`).join("")}
          </ol>
        </header>
        ${content}
      </div>`;
  }

  function renderStep1(root, context, handlers) {
    const agreements = context.application?.agreements || [];
    root.innerHTML = shell(context, `
      <section class="transaction-body" aria-labelledby="application-title">
        <p class="step-label">STEP 1</p>
        <h2 id="application-title" tabindex="-1">참가 조건 확인 &amp; 동의</h2>
        <p class="transaction-lead">결제 전에 랠리의 기본 조건과 안전 책임을 확인해 주세요.</p>
        <div class="condition-summary">
          <p><strong>공도 주행 가능한 바이크</strong><span>등록·보험 상태와 유효한 모터사이클 면허가 필요합니다.</span></p>
          <p><strong>장거리 라이딩 책임</strong><span>교통법규와 운영 규칙을 지키며 자신의 안전을 우선합니다.</span></p>
          <p><strong>취소·환불 기준</strong><span>키트 발송 이후에는 부분환불 정책이 적용될 수 있습니다.</span></p>
        </div>
        <form class="agreement-form" id="agreement-form">
          <label class="agreement-all"><input type="checkbox" id="agreement-all" /><span><strong>필수 항목 전체 동의</strong><small>아래 필수 동의를 한 번에 선택합니다.</small></span></label>
          <div class="agreement-list">
            ${agreements.map((item) => `
              <label class="agreement-row">
                <input type="checkbox" name="agreement" value="${escapeHtml(item.code)}" ${item.accepted ? "checked" : ""} />
                <span><strong>${escapeHtml(item.title)} <em>필수</em></strong><small>${escapeHtml(item.summary)}</small></span>
                <button type="button" class="text-action" aria-label="${escapeHtml(item.title)} 상세 보기">보기</button>
              </label>`).join("")}
          </div>
          <button class="transaction-primary" type="submit" disabled>다음 <span aria-hidden="true">→</span></button>
        </form>
      </section>`);
    const form = root.querySelector("#agreement-form");
    const all = root.querySelector("#agreement-all");
    const checks = [...root.querySelectorAll('input[name="agreement"]')];
    const submit = form.querySelector("button[type='submit']");
    const sync = () => {
      all.checked = checks.every((input) => input.checked);
      all.indeterminate = checks.some((input) => input.checked) && !all.checked;
      submit.disabled = !all.checked;
    };
    all.addEventListener("change", () => { checks.forEach((input) => { input.checked = all.checked; }); sync(); });
    checks.forEach((input) => input.addEventListener("change", sync));
    root.querySelectorAll(".text-action").forEach((button) => button.addEventListener("click", () => button.closest(".agreement-row").classList.toggle("is-open")));
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      handlers.saveAgreements(Object.fromEntries(checks.map((input) => [input.value, input.checked])));
    });
    sync();
  }

  function renderStep2(root, context, handlers) {
    const participant = context.application?.participant || {};
    const bike = context.application?.bike || {};
    root.innerHTML = shell(context, `
      <section class="transaction-body" aria-labelledby="application-title">
        <p class="step-label">STEP 2</p>
        <h2 id="application-title" tabindex="-1">참가자 정보</h2>
        <p class="transaction-lead">신청 확인에 필요한 최소 정보만 입력합니다. 바이크 정보는 참가 확정 후에도 보완할 수 있습니다.</p>
        <form class="participant-form" id="participant-form" novalidate>
          <div class="field-grid">
            <label class="field"><span>이름 <b aria-label="필수">*</b></span><input name="name" autocomplete="name" value="${escapeHtml(participant.name)}" aria-describedby="name-error" required /><small class="field-error" id="name-error"></small></label>
            <label class="field"><span>휴대전화 <b aria-label="필수">*</b></span><input name="phone" inputmode="tel" autocomplete="tel" placeholder="010-0000-0000" value="${escapeHtml(participant.phone)}" aria-describedby="phone-error" required /><small class="field-error" id="phone-error"></small></label>
          </div>
          <fieldset class="bike-fields">
            <legend>바이크 정보 <span>(선택)</span></legend>
            <p>${escapeHtml(context.event.bikeInfoDeadlineAt?.slice(0, 10) || "행사 준비기간")}까지 보완할 수 있습니다.</p>
            <div class="field-grid field-grid--three">
              <label class="field"><span>제조사</span><input name="bikeMaker" value="${escapeHtml(bike.maker)}" /></label>
              <label class="field"><span>모델명</span><input name="bikeModel" value="${escapeHtml(bike.model)}" /></label>
              <label class="field"><span>배기량 / 클래스</span><input name="bikeClass" value="${escapeHtml(bike.className)}" /></label>
            </div>
          </fieldset>
          <p class="mock-data-note">현재 입력은 실제 신청 접수가 아닌 개발용 거래 목업에만 저장됩니다.</p>
          <button class="transaction-primary" type="submit">다음 <span aria-hidden="true">→</span></button>
        </form>
      </section>`);
    const form = root.querySelector("#participant-form");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const values = new FormData(form);
      const name = String(values.get("name") || "").trim();
      const phone = String(values.get("phone") || "").replace(/\D/g, "");
      root.querySelector("#name-error").textContent = name ? "" : "이름을 입력해 주세요.";
      root.querySelector("#phone-error").textContent = /^01\d{8,9}$/.test(phone) ? "" : "휴대전화 번호를 확인해 주세요.";
      if (!name || !/^01\d{8,9}$/.test(phone)) return;
      handlers.saveParticipant({ name, phone, bike: { maker: values.get("bikeMaker"), model: values.get("bikeModel"), className: values.get("bikeClass") } });
    });
  }

  function paymentButton(context, handlers, retry = false) {
    const debug = window.SSKR_MOCK_SESSION.isDebug();
    return `
      ${debug ? `<label class="mock-outcome"><span>QA 결제 결과</span><select id="mock-outcome"><option value="SUCCESS">성공</option><option value="FAIL">실패</option><option value="PROCESSING_THEN_SUCCESS">처리 중 → 성공</option><option value="PROCESSING_THEN_FAIL">처리 중 → 실패</option></select></label>` : ""}
      <button class="transaction-primary" id="payment-action" type="button" ${context.surface.primaryAction?.enabled === false ? "disabled" : ""}>${retry ? "다시 결제하기" : "결제 진행하기"} <span aria-hidden="true">→</span></button>`;
  }

  function renderStep3(root, context, handlers) {
    const variant = context.surface.variant;
    const summary = `
      <dl class="payment-summary">
        <div><dt>참가 이벤트</dt><dd>${escapeHtml(context.event.publicTitle)}</dd></div>
        <div><dt>참가 유형</dt><dd>${escapeHtml(context.price?.displayName)}</dd></div>
        <div class="is-total"><dt>참가비</dt><dd>${escapeHtml(context.price?.displayAmount)}</dd></div>
      </dl>`;
    let content;
    if (variant === "PROCESSING") {
      content = `<div class="state-message state-message--processing"><i aria-hidden="true"></i><h2 id="application-title" tabindex="-1">결제 완료를 확인하고 있습니다.</h2><p>처리 중에는 Checkout Hold가 유지됩니다. 중복 결제를 시작하지 않습니다.</p><button class="transaction-secondary" id="refresh-payment" type="button">현재 상태 다시 확인</button></div>`;
    } else if (variant === "FAILED") {
      content = `<div class="state-message"><span class="state-mark" aria-hidden="true">!</span><h2 id="application-title" tabindex="-1">결제가 완료되지 않았습니다.</h2><p>재시도 시 현재 모집 상태와 정원을 다시 확인하고 새로운 결제 시도를 생성합니다.</p>${summary}${paymentButton(context, handlers, true)}</div>`;
    } else if (variant === "FINALIZING") {
      content = `<div class="state-message state-message--processing"><i aria-hidden="true"></i><h2 id="application-title" tabindex="-1">결제 완료를 확인했습니다.<br />참가 정보를 준비하고 있습니다.</h2><p>같은 결제 결과를 다시 받아도 참가권은 중복 생성되지 않습니다.</p><button class="transaction-secondary" id="refresh-payment" type="button">현재 상태 다시 확인</button></div>`;
    } else if (variant === "CLOSED") {
      content = `<div class="state-message"><span class="state-mark" aria-hidden="true">!</span><h2 id="application-title" tabindex="-1">새로운 결제를 진행할 수 없습니다.</h2><p>${escapeHtml(context.surface.blockedReason?.message || "현재 모집 조건을 다시 확인해 주세요.")}</p>${summary}<button class="transaction-primary" type="button" disabled>결제 불가</button></div>`;
    } else {
      content = `<section class="transaction-body" aria-labelledby="application-title"><p class="step-label">STEP 3</p><h2 id="application-title" tabindex="-1">결제</h2><p class="transaction-lead">결제 시작 직전에 모집 상태와 잔여 Slot, 적용 참가비를 서버에서 다시 확인합니다.</p>${summary}<div class="payment-notice"><strong>결제 전 확인</strong><p>실제 카드정보는 입력하지 않습니다. 이번 단계는 Checkout Hold와 결제 상태 전이를 검증하는 목업입니다.</p></div>${paymentButton(context, handlers)}</section>`;
    }
    root.innerHTML = shell(context, content);
    root.querySelector("#refresh-payment")?.addEventListener("click", handlers.refreshPayment);
    root.querySelector("#payment-action")?.addEventListener("click", () => {
      const outcome = root.querySelector("#mock-outcome")?.value || "SUCCESS";
      handlers.startPayment(outcome, variant === "FAILED");
    });
  }

  function render(root, context, handlers) {
    if (context.surface.step === "STEP_1") renderStep1(root, context, handlers);
    else if (context.surface.step === "STEP_2") renderStep2(root, context, handlers);
    else renderStep3(root, context, handlers);
  }

  window.SSKR_MODE_B = Object.freeze({ render });
})();
