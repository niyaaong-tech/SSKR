(() => {
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
  function render(root, context, handlers) {
    const paymentDeferred = context.surface.variant === "PAYMENT_DEFERRED";
    const waiting = context.surface.variant === "WAITLISTED";
    const participation = context.participation;
    const tier = context.tiers?.find((item) => paymentDeferred ? item.id === context.application?.priceTierId : item.code === participation?.registrationTierCode) || context.price;
    const title = paymentDeferred ? "참가 신청이 저장되었습니다." : waiting ? "참가 대기 신청이 완료되었습니다." : "SSKR 2027 참가가 확정되었습니다.";
    const description = paymentDeferred ? "신청 정보는 저장되었으며 결제만 남아 있습니다. SSKR 매니저 또는 이 화면에서 결제를 이어갈 수 있습니다." : waiting ? "참가 가능 인원이 확보되면 등록된 연락처로 안내해 드립니다." : "결제와 참가 등록이 모두 완료되었습니다. 이제 SSKR 매니저에서 이번 랠리를 준비할 수 있습니다.";
    const status = paymentDeferred ? "결제 대기" : waiting ? "참가 대기" : "참가 확정";
    const participantNumber = paymentDeferred ? "결제 후 배정" : participation?.participantNumber || "배정 대기";
    const paymentStatus = paymentDeferred ? "결제 전" : "결제 완료";
    root.innerHTML = `
      <div class="completion-shell ${paymentDeferred ? "completion-shell--payment-deferred" : ""}">
        <p class="completion-eyebrow">${paymentDeferred ? "APPLICATION SAVED" : "APPLICATION COMPLETE"}</p>
        <span class="completion-mark" aria-hidden="true">${paymentDeferred ? '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><path d="M12 7v5l3 2"/></svg>' : "✓"}</span>
        <h2 id="participant-title" tabindex="-1">${title}</h2>
        <p>${description}</p>
        <dl class="completion-summary">
          <div><dt>참가 상태</dt><dd>${status}</dd></div>
          <div><dt>참가 번호</dt><dd>${escapeHtml(participantNumber)}</dd></div>
          <div><dt>참가 유형</dt><dd>${escapeHtml(tier?.displayName || participation?.registrationTierCode)}</dd></div>
          <div><dt>결제 상태</dt><dd>${paymentStatus}</dd></div>
        </dl>
        <div class="completion-actions"><a class="transaction-primary" href="/app">SSKR 매니저로 이동 <span aria-hidden="true">→</span></a>${paymentDeferred ? '<button class="transaction-secondary completion-resume" id="resume-payment" type="button"><span aria-hidden="true">←</span> 이전 단계로 돌아가 결제하기</button>' : ""}<button class="transaction-secondary completion-detail-toggle" id="completion-detail-toggle" type="button" aria-expanded="false" aria-controls="completion-detail"><span>참가 신청 정보 확인</span><svg aria-hidden="true" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg></button></div>
        <div class="completion-detail" id="completion-detail" hidden><dl><div><dt>신청자</dt><dd>${escapeHtml(context.application?.participant?.name)}</dd></div><div><dt>연락처</dt><dd>${escapeHtml(context.application?.participant?.phone)}</dd></div><div><dt>이메일</dt><dd>${escapeHtml(context.application?.participant?.email)}</dd></div><div><dt>${paymentDeferred ? "결제 예정 금액" : "결제 금액"}</dt><dd>${escapeHtml(tier?.displayAmount)}</dd></div></dl></div>
      </div>`;
    root.querySelector("#resume-payment")?.addEventListener("click", handlers.resumePayment);
    root.querySelector("#completion-detail-toggle").addEventListener("click", (event) => {
      const detail = root.querySelector("#completion-detail");
      const expanded = event.currentTarget.getAttribute("aria-expanded") === "true";
      event.currentTarget.setAttribute("aria-expanded", String(!expanded));
      detail.hidden = expanded;
    });
  }

  window.SSKR_MODE_C = Object.freeze({ render });
})();
