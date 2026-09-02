(() => {
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
  function render(root, context) {
    const waiting = context.surface.variant === "WAITLISTED";
    const participation = context.participation;
    const tier = context.tiers?.find((item) => item.code === participation.registrationTierCode) || context.price;
    root.innerHTML = `
      <div class="completion-shell">
        <p class="completion-eyebrow">APPLICATION COMPLETE</p>
        <span class="completion-mark" aria-hidden="true">✓</span>
        <h2 id="participant-title" tabindex="-1">${waiting ? "참가 대기 신청이 완료되었습니다." : "SSKR 2027 참가가 확정되었습니다."}</h2>
        <p>${waiting ? "참가 가능 인원이 확보되면 등록된 연락처로 안내해 드립니다." : "결제와 참가 등록이 모두 완료되었습니다. 이제 SSKR APP에서 이번 랠리를 준비할 수 있습니다."}</p>
        <dl class="completion-summary">
          <div><dt>참가 상태</dt><dd>${waiting ? "참가 대기" : "참가 확정"}</dd></div>
          <div><dt>참가 번호</dt><dd>${escapeHtml(participation.participantNumber || "배정 대기")}</dd></div>
          <div><dt>참가 유형</dt><dd>${escapeHtml(tier?.displayName || participation.registrationTierCode)}</dd></div>
          <div><dt>결제 상태</dt><dd>결제 완료</dd></div>
        </dl>
        <div class="completion-actions"><a class="transaction-primary" href="/app">SSKR APP으로 이동 <span aria-hidden="true">→</span></a><button class="transaction-secondary" id="completion-detail-toggle" type="button" aria-expanded="false" aria-controls="completion-detail">참가 신청 정보 확인</button></div>
        <div class="completion-detail" id="completion-detail" hidden><dl><div><dt>신청자</dt><dd>${escapeHtml(context.application?.participant?.name)}</dd></div><div><dt>연락처</dt><dd>${escapeHtml(context.application?.participant?.phone)}</dd></div><div><dt>이메일</dt><dd>${escapeHtml(context.application?.participant?.email)}</dd></div><div><dt>결제 금액</dt><dd>${escapeHtml(tier?.displayAmount)}</dd></div></dl></div>
      </div>`;
    root.querySelector("#completion-detail-toggle").addEventListener("click", (event) => {
      const detail = root.querySelector("#completion-detail");
      const expanded = event.currentTarget.getAttribute("aria-expanded") === "true";
      event.currentTarget.setAttribute("aria-expanded", String(!expanded));
      detail.hidden = expanded;
    });
  }

  window.SSKR_MODE_C = Object.freeze({ render });
})();
