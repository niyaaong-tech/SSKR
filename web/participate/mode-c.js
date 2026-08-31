(() => {
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
  const fulfillmentLabels = { NOT_PREPARED: "키트 준비 전", PREPARING: "키트 준비 중", SHIPPED: "참가 키트 발송", DELIVERED: "키트 배송 완료", RETURN_REQUESTED: "반품 요청", RETURNED: "반품 완료" };
  const resultLabels = { NOT_STARTED: "주행 전", STARTED: "주행 시작", COMPLETED: "완주", NO_SHOW: "미참가", RETIRED: "리타이어", INVALIDATED: "기록 무효" };

  function render(root, context, handlers) {
    const waiting = context.surface.variant === "WAITLISTED";
    const participation = context.participation;
    const task = context.manager.primaryTask;
    const bike = participation.bikeInfo || context.application?.bike || {};
    root.innerHTML = `
      <div class="lobby-shell">
        <header class="participant-header">
          <div><p>${escapeHtml(context.event.publicTitle)}</p><h2 id="participant-title" tabindex="-1">${waiting ? "참가 대기" : "참가 확정"}</h2></div>
          <div class="participant-identity"><span>${waiting ? "WAITLIST" : escapeHtml(participation.participantNumber)}</span><small>${escapeHtml(context.event.stageLabel)}</small></div>
        </header>
        <section class="primary-guidance" aria-labelledby="guidance-title">
          <p>지금 가장 중요한 안내</p>
          <h3 id="guidance-title">${escapeHtml(task.title)}</h3>
          <div><span>${escapeHtml(task.description)}</span><button type="button" ${task.action.enabled === false ? "disabled" : ""}>${escapeHtml(task.action.label)} <b aria-hidden="true">→</b></button></div>
        </section>
        <section class="service-entrances" aria-labelledby="entrance-title">
          <header><h3 id="entrance-title">참가 서비스</h3><p>현재 단계에서 필요한 입구를 우선합니다.</p></header>
          <div class="entrance-list">
            ${context.services.map((service, index) => `<button class="entrance ${index === 0 ? "is-primary" : ""}" type="button" ${service.enabled ? "" : "disabled"}><span>${String(index + 1).padStart(2, "0")}</span><strong>${escapeHtml(service.title)}</strong><small>${escapeHtml(service.enabled ? service.description : service.reason)}</small><b aria-hidden="true">↗</b></button>`).join("")}
          </div>
        </section>
        <section class="lobby-manager" aria-labelledby="lobby-manager-title">
          <div><p>SSKR 매니저</p><h3 id="lobby-manager-title">${escapeHtml(task.title)}</h3><span>${escapeHtml(task.description)}</span></div>
          <dl>
            <div><dt>바이크 정보</dt><dd>${context.statuses.bikeInfoComplete ? "등록 완료" : "등록 필요"}${context.permissions.canEditBikeInfo ? ` <button type="button" class="inline-edit" id="edit-bike-info">수정</button>` : ""}</dd></div>
            <div><dt>키트</dt><dd>${escapeHtml(fulfillmentLabels[context.statuses.fulfillmentState])}</dd></div>
            <div><dt>시즌 결과</dt><dd>${escapeHtml(resultLabels[context.statuses.runResult])}</dd></div>
          </dl>
        </section>
        ${context.permissions.canEditBikeInfo ? `<form class="lobby-bike-form" id="lobby-bike-form" hidden><p>바이크 정보</p><div><label>제조사<input name="maker" value="${escapeHtml(bike.maker)}" /></label><label>모델명<input name="model" value="${escapeHtml(bike.model)}" /></label><label>배기량 / 클래스<input name="className" value="${escapeHtml(bike.className)}" /></label></div><button type="submit">저장</button></form>` : ""}
        ${window.SSKR_MOCK_SESSION.isDebug() && waiting ? `<button class="mock-promote" id="mock-promote" type="button">QA · 참가 확정으로 승격</button>` : ""}
      </div>`;
    root.querySelector("#mock-promote")?.addEventListener("click", handlers.promoteWaitlist);
    root.querySelector("#edit-bike-info")?.addEventListener("click", () => { const form = root.querySelector("#lobby-bike-form"); form.hidden = !form.hidden; });
    root.querySelector("#lobby-bike-form")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const values = new FormData(event.currentTarget);
      handlers.saveBikeInfo({ maker: values.get("maker"), model: values.get("model"), className: values.get("className") });
    });
  }

  window.SSKR_MODE_C = Object.freeze({ render });
})();
