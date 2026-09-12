(() => {
  const model = window.SSKR_MEMORIAL_STORE;
  const domain = window.SSKR_APP_DOMAIN;
  const esc = (value) => String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
  const href = (item) => "/app/memorials/" + encodeURIComponent(item.id);
  const editHref = (item) => "/app/memorials/mine/" + encodeURIComponent(item.id);
  const arrow = '<span aria-hidden="true">→</span>';
  const badge = (item) => '<span class="memorial-visibility" data-visibility="' + esc(item.visibility) + '">' + (item.visibility === "PUBLIC" ? "공개" : "나만 보기") + "</span>";
  const link = (url, label, secondary = false) => '<a class="memorial-button' + (secondary ? " is-secondary" : "") + '" href="' + esc(url) + '" data-app-link>' + label + arrow + "</a>";

  function mount({ root, store, account, path }) {
    const all = store.all();
    const collection = model.collections(all, account);
    let selected = 0;
    const ownLink = link("/app/memorials/mine", account.linked ? "전체 보기 · 관리" : "로그인하고 내 기록 보기");
    const head = (title, copy) => '<header class="memorial-page-head"><h2>' + esc(title) + "</h2><p>" + esc(copy) + "</p></header>";
    const back = (url, label) => '<a class="memorial-back" href="' + url + '" data-app-link>← ' + label + "</a>";
    const empty = (title, copy) => '<div class="memorial-empty"><strong>' + title + "</strong><p>" + copy + "</p></div>";
    const minePreview = () => {
      if (!account.linked) return '<div class="memorial-personal-message"><strong>내 라이딩 기록을 한곳에</strong><p>로그인하면 지난 메모리얼을 확인하고 공개 범위를 관리할 수 있습니다.</p></div>';
      if (!collection.mine.length) return empty("아직 내 메모리얼이 없습니다.", "지난 여정의 메모리얼이 생기면 이곳에 모아 보여드립니다.");
      return '<div class="memorial-mini-list">' + collection.mine.slice(0, 2).map((item) => '<a class="memorial-mini" href="' + href(item) + '" data-app-link><img src="' + esc(item.image) + '" alt="" /><div><span class="memorial-event">' + esc(item.eventTitle) + "</span><strong>" + esc(item.title) + "</strong>" + badge(item) + "</div></a>").join("") + "</div>";
    };
    function feature() {
      if (!collection.public.length) return empty("아직 공개된 메모리얼이 없습니다.", "다른 라이더가 공개한 기록이 이곳에 표시됩니다.");
      const item = collection.public[selected];
      return '<a class="memorial-feature-photo" href="' + href(item) + '" data-app-link aria-label="' + esc(item.title) + ' 메모리얼 보기"><img src="' + esc(item.image) + '" alt="" fetchpriority="high" /><span>' + esc(item.eventTitle) + ' <i aria-hidden="true"></i> ' + esc(item.result) + '</span></a><div class="memorial-feature-copy"><div class="memorial-feature-meta"><span>공개 메모리얼</span><span>' + esc(item.eventTitle) + '</span></div><div class="memorial-feature-story"><h3>' + esc(item.title) + "</h3><p>" + esc(item.summary) + '</p><span class="memorial-author">' + esc(item.ownerName) + '의 기록</span></div>' + link(href(item), "메모리얼 보기") + "</div>";
    }
    function renderHub() {
      root.innerHTML = '<div class="memorial-hub"><section class="memorial-public" aria-labelledby="memorial-public-title"><header class="memorial-section-head"><div><h2 id="memorial-public-title">라이더들의 메모리얼</h2><p>각자의 경로로 완성한 SSKR을 만나보세요.</p></div><div class="memorial-pagination">' + (collection.public.length > 1 ? '<button type="button" data-memorial-direction="-1" aria-label="이전 공개 메모리얼">←</button><span id="memorial-position" aria-live="polite">1 / ' + collection.public.length + '</span><button type="button" data-memorial-direction="1" aria-label="다음 공개 메모리얼">→</button>' : '<span>공개 기록 ' + collection.public.length + "</span>") + '</div></header><div class="memorial-feature" id="memorial-feature">' + feature() + '</div></section><section class="memorial-personal" aria-labelledby="memorial-personal-title"><div class="memorial-personal-head"><div><h2 id="memorial-personal-title">내 메모리얼</h2><p>' + (account.linked ? "전체 " + collection.mine.length + "개의 기록" : "나의 SSKR 아카이브") + "</p></div>" + ownLink + "</div>" + minePreview() + "</section></div>";
    }
    function renderMine() {
      const publicCount = collection.mine.filter((item) => item.visibility === "PUBLIC").length;
      root.innerHTML = '<div class="memorial-library">' + back("/app/memorials", "메모리얼 둘러보기") + head("내 메모리얼", "지난 SSKR의 기록을 확인하고 제목과 공개 범위를 관리하세요.") + '<div class="memorial-library-summary"><strong>전체 ' + collection.mine.length + '개</strong><span>공개 ' + publicCount + ' · 나만 보기 ' + (collection.mine.length - publicCount) + '</span></div><div class="memorial-records">' + (collection.mine.length ? collection.mine.map((item) => '<article class="memorial-record"><a class="memorial-record-photo" href="' + href(item) + '" data-app-link aria-label="' + esc(item.title) + ' 보기"><img src="' + esc(item.image) + '" alt="" /></a><div class="memorial-record-copy"><div class="memorial-record-meta"><span class="memorial-event">' + esc(item.eventTitle) + "</span>" + badge(item) + '</div><h3><a href="' + href(item) + '" data-app-link>' + esc(item.title) + "</a></h3><p>" + esc(item.summary) + '</p><span class="memorial-event">' + esc(item.result) + '</span></div><div class="memorial-record-actions">' + link(editHref(item), "관리하기") + link(href(item), "기록 보기", true) + "</div></article>").join("") : empty("아직 내 메모리얼이 없습니다.", "메모리얼이 생기면 참가 연도별로 여기서 확인할 수 있습니다.")) + "</div></div>";
    }
    function renderDenied(title, copy) {
      root.innerHTML = '<section class="memorial-unavailable">' + back("/app/memorials", "메모리얼 둘러보기") + head(title, copy) + "</section>";
    }
    function renderDetail(item) {
      const access = domain.memorialAccess(item, account);
      if (!access.allowed) return renderDenied(access.reason === "PRIVATE" ? "비공개 메모리얼입니다." : "메모리얼을 찾을 수 없습니다.", access.reason === "PRIVATE" ? "이 기록은 작성자만 확인할 수 있습니다." : "주소를 확인하고 다시 이동해 주세요.");
      const owner = model.isOwner(item, account);
      root.innerHTML = '<div class="memorial-detail">' + back(owner ? "/app/memorials/mine" : "/app/memorials", owner ? "내 메모리얼 전체 보기" : "메모리얼 둘러보기") + '<article><header class="memorial-detail-head"><div><span class="memorial-event">' + esc(item.eventTitle) + ' · ' + esc(item.result) + "</span><h2>" + esc(item.title) + "</h2><p>" + esc(item.ownerName) + '의 기록</p></div>' + (owner ? link(editHref(item), "관리하기") : "") + '</header><img class="memorial-detail-photo" src="' + esc(item.image) + '" alt="' + esc(item.title) + ' 대표 사진" /><div class="memorial-detail-description"><p>' + esc(item.summary) + "</p>" + badge(item) + "</div></article></div>";
    }
    function renderEditor(item) {
      if (!item || !model.isOwner(item, account) || item.publishStatus !== "PUBLISHED") return renderDenied("관리할 수 없는 메모리얼입니다.", "내가 작성한 메모리얼만 수정할 수 있습니다.");
      root.innerHTML = '<div class="memorial-editor">' + back("/app/memorials/mine", "내 메모리얼 전체 보기") + head("메모리얼 관리", "기록의 이름과 소개를 다듬고, 공개할 범위를 선택하세요.") + '<div class="memorial-editor-grid"><aside class="memorial-edit-preview" aria-label="메모리얼 미리보기"><img src="' + esc(item.image) + '" alt="" /><div><span class="memorial-event">' + esc(item.eventTitle) + ' · ' + esc(item.result) + '</span><h3 id="memorial-preview-title">' + esc(item.title) + '</h3><p id="memorial-preview-summary">' + esc(item.summary) + '</p><div id="memorial-preview-visibility">' + badge(item) + '</div></div></aside><form class="memorial-form" data-memorial-form data-memorial-id="' + esc(item.id) + '"><label for="memorial-title">제목 <span>최대 60자</span></label><input id="memorial-title" name="title" value="' + esc(item.title) + '" maxlength="60" required /><label for="memorial-summary">소개 <span>최대 300자</span></label><textarea id="memorial-summary" name="summary" maxlength="300" rows="4">' + esc(item.summary) + '</textarea><fieldset><legend>공개 범위</legend><label class="memorial-radio"><input type="radio" name="visibility" value="PUBLIC"' + (item.visibility === "PUBLIC" ? " checked" : "") + ' /><span><strong>공개</strong><small>다른 라이더도 목록에서 내 기록을 볼 수 있습니다.</small></span></label><label class="memorial-radio"><input type="radio" name="visibility" value="PRIVATE"' + (item.visibility === "PRIVATE" ? " checked" : "") + ' /><span><strong>나만 보기</strong><small>공개 목록에서 숨기고 나만 확인합니다.</small></span></label></fieldset><p class="memorial-preview-note">현재는 미리보기 단계로, 변경 내용은 이 브라우저에만 저장됩니다.</p><div class="memorial-form-actions"><button class="memorial-button" type="submit">변경 내용 저장</button><a class="memorial-button is-secondary" href="/app/memorials/mine" data-app-link>취소</a></div><p class="memorial-save-status" role="status" aria-live="polite"></p></form></div></div>';
    }
    function onClick(event) {
      const control = event.target.closest("[data-memorial-direction]");
      if (!control) return;
      selected = (selected + Number(control.dataset.memorialDirection) + collection.public.length) % collection.public.length;
      root.querySelector("#memorial-feature").innerHTML = feature();
      root.querySelector("#memorial-position").textContent = (selected + 1) + " / " + collection.public.length;
    }
    function formValues(form) {
      return Object.fromEntries(new FormData(form));
    }
    function onInput(event) {
      const form = event.target.closest("[data-memorial-form]");
      if (!form) return;
      const values = formValues(form);
      root.querySelector("#memorial-preview-title").textContent = values.title || "메모리얼 제목";
      root.querySelector("#memorial-preview-summary").textContent = values.summary;
      root.querySelector("#memorial-preview-visibility").innerHTML = badge(values);
      form.querySelector(".memorial-save-status").textContent = "";
    }
    function onSubmit(event) {
      const form = event.target.closest("[data-memorial-form]");
      if (!form) return;
      event.preventDefault();
      const status = form.querySelector(".memorial-save-status");
      try {
        store.update(form.dataset.memorialId, account, formValues(form));
        status.textContent = "변경 내용을 이 브라우저에 저장했습니다.";
        status.dataset.error = "false";
      } catch (error) {
        status.textContent = error.message;
        status.dataset.error = "true";
      }
    }
    if (path === "/app/memorials") renderHub();
    else if (path === "/app/memorials/mine") renderMine();
    else if (path.startsWith("/app/memorials/mine/")) renderEditor(all.find((item) => editHref(item) === path));
    else renderDetail(all.find((item) => href(item) === path || (item.publicSlug && "/app/memorials/" + item.publicSlug === path)));
    root.addEventListener("click", onClick);
    root.addEventListener("input", onInput);
    root.addEventListener("submit", onSubmit);
    return () => {
      root.removeEventListener("click", onClick);
      root.removeEventListener("input", onInput);
      root.removeEventListener("submit", onSubmit);
    };
  }
  window.SSKR_MEMORIALS = Object.freeze({ mount });
})();
