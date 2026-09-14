(() => {
  const model = window.SSKR_MEMORIAL_STORE;
  const domain = window.SSKR_APP_DOMAIN;
  const journey = window.SSKR_MEMORIAL_JOURNEY;
  const places = window.SSKR_SPOT_CATALOG;
  const placeById = new Map(places.map(place => [place.id, place]));
  const esc = (value) => String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
  const href = (item) => "/app/memorials/" + encodeURIComponent(item.id);
  const editHref = (item) => "/app/memorials/mine/" + encodeURIComponent(item.id);
  const arrow = '<span aria-hidden="true">→</span>';
  const badge = (item) => '<span class="memorial-visibility" data-visibility="' + esc(item.visibility) + '">' + (item.visibility === "PUBLIC" ? "공개" : "나만 보기") + "</span>";
  const link = (url, label, secondary = false) => '<a class="memorial-button' + (secondary ? " is-secondary" : "") + '" href="' + esc(url) + '" data-app-link>' + label + arrow + "</a>";

  function mount({ root, store, account, path }) {
    const all = store.all();
    const collection = model.collections(all, account);
    let disposeJourney = null;
    const sampled = model.sample(collection.public, 6);
    const query = new URLSearchParams(location.search);
    const filters = { search: query.get("memorialQuery") || "", start: query.get("memorialStart") || "all" };
    let visibleCount = 9;
    const ownLink = link("/app/memorials/mine", account.linked ? "전체 보기 · 관리" : "로그인하고 내 기록 보기");
    const head = (title, copy) => '<header class="memorial-page-head"><h2>' + esc(title) + "</h2><p>" + esc(copy) + "</p></header>";
    const back = (url, label) => '<a class="memorial-back" href="' + url + '" data-app-link>← ' + label + "</a>";
    const empty = (title, copy) => '<div class="memorial-empty"><strong>' + title + "</strong><p>" + copy + "</p></div>";
    const minePreview = () => {
      if (!account.linked) return '<div class="memorial-personal-message"><strong>내 라이딩 기록을 한곳에</strong><p>로그인하면 지난 메모리얼을 확인하고 공개 범위를 관리할 수 있습니다.</p></div>';
      if (!collection.mine.length) return empty("아직 내 메모리얼이 없습니다.", "지난 여정의 메모리얼이 생기면 이곳에 모아 보여드립니다.");
      return '<div class="memorial-mini-list">' + collection.mine.slice(0, 2).map((item) => '<a class="memorial-mini" href="' + href(item) + '" data-app-link><img src="' + esc(item.image) + '" alt="" /><div><span class="memorial-event">' + esc(item.eventTitle) + "</span><strong>" + esc(item.title) + "</strong>" + badge(item) + "</div></a>").join("") + "</div>";
    };
    const publicItems = all.filter(item => item.visibility === "PUBLIC" && item.publishStatus === "PUBLISHED");
    const routeSummary = item => `${journey.km(item.distanceMeters)}km · 스팟 ${item.spotCount}곳`;
    function thumbnail(item) {
      const cover = model.selectCover(item.visits || []);
      const photo = cover?.photo, place = placeById.get(cover?.visit.locationId);
      const chain = model.thumbnailStops(item.visits || [], cover?.visit.id);
      return `<article class="memorial-thumbnail"><a href="${href(item)}" data-app-link><div class="memorial-thumbnail-media">${photo ? `<img src="${esc(photo.url)}" alt="${esc(place?.name)}" loading="lazy" />` : '<span class="memorial-no-photo">등록된 사진이 없습니다</span>'}<div class="memorial-route-chain" aria-label="출발지부터 도착지 순서, 경유 스팟 최대 3곳 표시">${chain.map((v,i) => `<span class="memorial-chain-stop" data-role="${v.role}">${i ? '<span class="memorial-chain-arrow" aria-hidden="true">›</span>' : ''}${esc(placeById.get(v.locationId)?.name)}</span>`).join(' ')}</div><div class="memorial-thumbnail-caption"><strong>${esc(place?.name || '여정의 기록')}</strong></div></div><div class="memorial-thumbnail-copy"><span>${esc(item.ownerName)} <i>2026.05.23</i></span><h3>${esc(item.title)}</h3><p>${routeSummary(item)} <b aria-hidden="true">→</b></p></div></a></article>`;
    }
    function visitPhotos(item) {
      return `<section class="memorial-place-photos"><h3>방문한 장소의 사진</h3><div>${(item.visits || []).map(v => {
        const photo = model.selectPhoto(v), place = placeById.get(v.locationId);
        return `<figure>${photo ? `<img src="${esc(photo.url)}" alt="${esc(place?.name)}" loading="lazy" />` : '<div class="memorial-photo-empty">등록된 사진이 없습니다</div>'}<figcaption><span>${v.role === 'START' ? '출발' : v.role === 'FINISH' ? '도착' : '스팟 '+v.sequence} · ${journey.time(v.arrivedAt)}</span><strong>${esc(place?.name)}</strong>${photo?.sourceUrl ? `<a href="${esc(photo.sourceUrl)}" target="_blank" rel="noreferrer">${esc(photo.credit || '사진 출처')} ↗</a>` : ''}</figcaption></figure>`;
      }).join('')}</div></section>`;
    }
    function renderHub() {
      root.innerHTML = `<div class="memorial-hub memorial-gallery-hub"><section class="memorial-public" aria-labelledby="memorial-public-title"><header class="memorial-section-head"><div><h2 id="memorial-public-title">라이더들의 메모리얼</h2><p>2026.05.23 · 참가 200명 · 공개 기록 ${publicItems.length}개 <span class="memorial-test-label">테스트 행사</span></p></div>${link("/app/memorials/all", "전체 메모리얼 보기", true)}</header><div class="memorial-home-grid">${sampled.length ? sampled.map(thumbnail).join("") : empty("공개된 다른 라이더의 기록이 없습니다.", "공개 기록이 생기면 이곳에 표시됩니다.")}</div><p class="memorial-gallery-note">다른 라이더의 기록 ${sampled.length}개를 무작위로 골랐습니다. 썸네일을 누르면 전체 여정을 볼 수 있습니다.</p></section><section class="memorial-personal" aria-labelledby="memorial-personal-title"><div class="memorial-personal-head"><div><h2 id="memorial-personal-title">내 메모리얼</h2><p>${account.linked ? "전체 " + collection.mine.length + "개의 기록" : "나의 SSKR 아카이브"}</p></div>${ownLink}</div>${minePreview()}</section></div>`;
    }
    function archiveResults() {
      const filtered = model.filterMemorials(publicItems, filters, places);
      root.querySelector(".memorial-archive-results").innerHTML = filtered.length ? filtered.slice(0, visibleCount).map(thumbnail).join("") : empty("검색 결과가 없습니다.", "다른 이름이나 출발지로 찾아보세요.");
      root.querySelector(".memorial-archive-count").textContent = `공개 메모리얼 ${filtered.length}개`;
      const button = root.querySelector("[data-load-more]");
      button.hidden = visibleCount >= filtered.length;
      button.textContent = `메모리얼 더 보기 (${Math.min(visibleCount, filtered.length)} / ${filtered.length})`;
    }
    function renderArchive() {
      root.innerHTML = `<div class="memorial-archive">${back("/app/memorials", "메모리얼 첫 화면")}${head("전체 메모리얼", "출발지, 들른 스팟, 라이더 닉네임으로 서로 다른 여정을 찾아보세요.")}<p class="memorial-event-summary">2026년 5월 23일 · 200명 참가 · 표준 100,000원 / 얼리 50,000원 / VIP 200,000원 <span class="memorial-test-label">테스트 행사</span></p><div class="memorial-archive-controls"><label>메모리얼 검색<input type="search" data-memorial-search value="${esc(filters.search)}" placeholder="라이더, 제목, 방문 스팟" /></label><label>출발지<select data-memorial-start><option value="all">모든 출발지</option>${places.filter(p => p.kind === "start").map(p => `<option value="${p.id}"${filters.start === p.id ? " selected" : ""}>${esc(p.name)}</option>`).join("")}</select></label><output class="memorial-archive-count" aria-live="polite"></output></div><div class="memorial-archive-results"></div><div class="memorial-load-more"><button class="memorial-button is-secondary" type="button" data-load-more></button></div></div>`;
      archiveResults();
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
      root.innerHTML = `<div class="memorial-detail">${back(owner ? "/app/memorials/mine" : "/app/memorials/all", owner ? "내 메모리얼 전체 보기" : "전체 메모리얼")}<article><header class="memorial-detail-head"><div><span class="memorial-event">2026.05.23 · ${esc(item.participantNumber)} · ${esc(item.result)} <span class="memorial-test-label">테스트 행사</span></span><h2>${esc(item.title)}</h2><p>${esc(item.ownerName)}의 기록 · ${esc(placeById.get(item.startLocationId)?.name)} → 대천해수욕장</p></div>${owner ? link(editHref(item), "관리하기") : badge(item)}</header><p class="memorial-journey-intro">${esc(item.summary)}</p><dl class="memorial-journey-stats"><div><dt>주행 거리</dt><dd>${journey.km(item.distanceMeters)}<small> km</small></dd></div><div><dt>주행 시간</dt><dd>${journey.duration(item.movingSeconds)}</dd></div><div><dt>스팟 · 정차</dt><dd>${item.spotCount}곳<small> · ${journey.duration(item.stoppedSeconds)}</small></dd></div><div><dt>출발 → 도착</dt><dd>${journey.time(item.startedAt)} → ${journey.time(item.finishedAt)}</dd></div></dl><div class="memorial-journey-host"></div>${visitPhotos(item)}</article></div>`;
      disposeJourney = journey.mount(root.querySelector(".memorial-journey-host"), item, places);
    }
    function renderEditor(item) {
      if (!item || !model.isOwner(item, account) || item.publishStatus !== "PUBLISHED") return renderDenied("관리할 수 없는 메모리얼입니다.", "내가 작성한 메모리얼만 수정할 수 있습니다.");
      root.innerHTML = '<div class="memorial-editor">' + back("/app/memorials/mine", "내 메모리얼 전체 보기") + head("메모리얼 관리", "기록의 이름과 소개를 다듬고, 공개할 범위를 선택하세요.") + '<div class="memorial-editor-grid"><aside class="memorial-edit-preview" aria-label="메모리얼 미리보기"><img src="' + esc(item.image) + '" alt="" /><div><span class="memorial-event">' + esc(item.eventTitle) + ' · ' + esc(item.result) + '</span><h3 id="memorial-preview-title">' + esc(item.title) + '</h3><p id="memorial-preview-summary">' + esc(item.summary) + '</p><div id="memorial-preview-visibility">' + badge(item) + '</div></div></aside><form class="memorial-form" data-memorial-form data-memorial-id="' + esc(item.id) + '"><label for="memorial-title">제목 <span>최대 60자</span></label><input id="memorial-title" name="title" value="' + esc(item.title) + '" maxlength="60" required /><label for="memorial-summary">소개 <span>최대 300자</span></label><textarea id="memorial-summary" name="summary" maxlength="300" rows="4">' + esc(item.summary) + '</textarea><fieldset><legend>공개 범위</legend><label class="memorial-radio"><input type="radio" name="visibility" value="PUBLIC"' + (item.visibility === "PUBLIC" ? " checked" : "") + ' /><span><strong>공개</strong><small>다른 라이더도 목록에서 내 기록을 볼 수 있습니다.</small></span></label><label class="memorial-radio"><input type="radio" name="visibility" value="PRIVATE"' + (item.visibility === "PRIVATE" ? " checked" : "") + ' /><span><strong>나만 보기</strong><small>공개 목록에서 숨기고 나만 확인합니다.</small></span></label></fieldset><p class="memorial-preview-note">현재는 미리보기 단계로, 변경 내용은 이 브라우저에만 저장됩니다.</p><div class="memorial-form-actions"><button class="memorial-button" type="submit">변경 내용 저장</button><a class="memorial-button is-secondary" href="/app/memorials/mine" data-app-link>취소</a></div><p class="memorial-save-status" role="status" aria-live="polite"></p></form></div></div>';
    }
    function onClick(event) {
      if (event.target.closest("[data-load-more]")) { visibleCount += 9; archiveResults(); }
    }
    function updateFilters(event) {
      if (!event.target.matches("[data-memorial-search], [data-memorial-start]")) return;
      const nextSearch = root.querySelector("[data-memorial-search]").value;
      const nextStart = root.querySelector("[data-memorial-start]").value;
      if (nextSearch === filters.search && nextStart === filters.start) return;
      filters.search = nextSearch;
      filters.start = nextStart;
      visibleCount = 9;
      const url = new URL(location.href);
      filters.search ? url.searchParams.set("memorialQuery", filters.search) : url.searchParams.delete("memorialQuery");
      filters.start !== "all" ? url.searchParams.set("memorialStart", filters.start) : url.searchParams.delete("memorialStart");
      history.replaceState(history.state, "", url.pathname + url.search);
      archiveResults();
    }
    function onImageLoad(event) { if (event.target.tagName === "IMG" && event.target.naturalWidth) event.target.classList.add("is-loaded"); }
    function onImageError(event) {
      if (event.target.tagName === "IMG") { event.target.classList.add("is-unavailable"); event.target.alt = "사진을 불러오지 못했습니다"; }
    }
    function formValues(form) {
      return Object.fromEntries(new FormData(form));
    }
    function onInput(event) {
      updateFilters(event);
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
    else if (path === "/app/memorials/all") renderArchive();
    else if (path === "/app/memorials/mine") renderMine();
    else if (path.startsWith("/app/memorials/mine/")) renderEditor(all.find((item) => editHref(item) === path));
    else renderDetail(all.find((item) => href(item) === path || (item.publicSlug && "/app/memorials/" + item.publicSlug === path)));
    root.addEventListener("click", onClick);
    root.addEventListener("input", onInput);
    root.addEventListener("submit", onSubmit);
    root.addEventListener("change", updateFilters);
    root.addEventListener("error", onImageError, true);
    root.addEventListener("load", onImageLoad, true);
    return () => {
      disposeJourney?.();
      root.removeEventListener("change", updateFilters);
      root.removeEventListener("error", onImageError, true);
      root.removeEventListener("load", onImageLoad, true);
      root.removeEventListener("click", onClick);
      root.removeEventListener("input", onInput);
      root.removeEventListener("submit", onSubmit);
    };
  }
  window.SSKR_MEMORIALS = Object.freeze({ mount });
})();
