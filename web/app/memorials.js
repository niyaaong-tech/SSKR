(() => {
  const model = window.SSKR_MEMORIAL_STORE;
  const domain = window.SSKR_APP_DOMAIN;
  const journey = window.SSKR_MEMORIAL_JOURNEY;
  const places = [...window.SSKR_SPOT_CATALOG, ...(window.SSKR_SPOT_LEGACY || [])];
  const placeById = new Map(places.map(place => [place.id, place]));
  const esc = (value) => String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
  const href = (item) => "/app/memorials/" + encodeURIComponent(item.id);
  const editHref = (item) => "/app/memorials/mine/" + encodeURIComponent(item.id);
  const arrow = '<span aria-hidden="true">→</span>';
  const badge = (item) => '<span class="memorial-visibility" data-visibility="' + esc(item.visibility) + '">' + (item.visibility === "PUBLIC" ? "공개" : "나만 보기") + "</span>";
  const link = (url, label, secondary = false) => '<a class="memorial-button' + (secondary ? " is-secondary" : "") + '" href="' + esc(url) + '" data-app-link>' + label + arrow + "</a>";

  const archivePositions = new Map();
  const collectionPaths = new Map();
  function mount({ root, store, account, path, history = [], event = {} }) {
    const all = store.all();
    const accountKey = JSON.stringify([account.id, account.linked]);
    if (path === '/app/my' || path === '/app/memorials') collectionPaths.set(accountKey, path);
    let disposeJourney = null;
    const query = new URLSearchParams(location.search);
    const filters = { search: query.get('memorialQuery') || '', start: query.get('memorialStart') || 'all', event: query.get('memorialEvent') || 'all' };
    const cacheKey = () => JSON.stringify([account.id,account.linked,filters]);
    let visibleCount = archivePositions.get(cacheKey())?.count || 12;
    let restoreFrame;
    const head = (title, copy) => '<header class="memorial-page-head"><h2>' + esc(title) + "</h2><p>" + esc(copy) + "</p></header>";
    const back = (url, label) => '<a class="memorial-back" href="' + url + '" data-app-link>← ' + label + "</a>";
    const empty = (title, copy) => '<div class="memorial-empty"><strong>' + title + "</strong><p>" + copy + "</p></div>";
    const publicItems = all.filter(item => item.visibility === "PUBLIC" && item.publishStatus === "PUBLISHED").sort((a,b)=>String(b.publishedAt||'').localeCompare(String(a.publishedAt||''))||a.id.localeCompare(b.id));
    const date = value => value && Number.isFinite(Date.parse(value)) ? new Date(value).toLocaleDateString('ko-KR',{timeZone:event.timezone||'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}) : '날짜 미정';
    const testBadge = item => item.synthetic ? '<span class="memorial-test-label">테스트 기록</span>' : '';
    const placeName = id => window.SSKR_MAP.formatPlaceText(placeById.get(id)?.name || '장소 정보 없음');
    const routeSummary = item => `${journey.km(item.distanceMeters)}km · 스팟 ${item.spotCount}곳`;
    function thumbnail(item) {
      const cover=model.selectCover(item.visits||[]),photo=cover?.photo;
      return '<article class="memorial-thumbnail"><a href="'+href(item)+'" data-app-link><div class="memorial-thumbnail-media">'+(photo?'<img src="'+esc(photo.url)+'" alt="'+esc(placeName(cover.visit.locationId))+'" loading="lazy" />':'<span class="memorial-no-photo">등록된 사진이 없습니다</span>')+'</div><div class="memorial-thumbnail-copy"><span>'+esc(item.ownerName)+' · '+date(item.startedAt)+'</span><h3>'+esc(item.title)+'</h3><p>'+esc(placeName(item.startLocationId))+' → '+esc(placeName(item.finishLocationId))+'</p><footer><span>'+routeSummary(item)+'</span>'+testBadge(item)+'</footer></div></a></article>';
    }
    function archiveResults() {
      const filtered = model.filterMemorials(publicItems, filters, places);
      root.querySelector(".memorial-archive-results").innerHTML = filtered.length ? filtered.slice(0, visibleCount).map(thumbnail).join("") : publicItems.length ? empty("검색 결과가 없습니다.", "다른 이름이나 출발지로 찾아보세요.") : empty("공개된 메모리얼이 아직 없어요.", "라이더들이 공개한 여정이 이곳에 모입니다.");
      root.querySelector(".memorial-archive-count").textContent = `공개 메모리얼 ${filtered.length}개`;
      const button = root.querySelector("[data-load-more]");
      button.hidden = visibleCount >= filtered.length;
      button.textContent = `메모리얼 더 보기 (${Math.min(visibleCount, filtered.length)} / ${filtered.length})`;
    }
    function renderArchive() {
      const events=[...new Map(publicItems.map(item=>[item.eventId,item.eventTitle])).entries()];
      const starts=[...new Set(publicItems.map(item=>item.startLocationId))];
      root.innerHTML='<div class="memorial-archive"><header class="memorial-gallery-head"><div>'+head('라이더들의 메모리얼','같은 하루, 서로 다른 길. 사진과 기록으로 여정을 만나보세요.')+'</div>'+link('/app/my','내 기록',true)+'</header><div class="memorial-archive-controls"><label>기록 검색<input type="search" data-memorial-search value="'+esc(filters.search)+'" placeholder="라이더, 제목, 방문 스팟" /></label>'+(events.length>1?'<label>행사<select data-memorial-event><option value="all">모든 행사</option>'+events.map(([id,title])=>'<option value="'+esc(id)+'"'+(filters.event===id?' selected':'')+'>'+esc(title)+'</option>').join('')+'</select></label>':'')+'<label>출발지<select data-memorial-start><option value="all">모든 출발지</option>'+starts.map(id=>'<option value="'+esc(id)+'"'+(filters.start===id?' selected':'')+'>'+esc(placeName(id))+'</option>').join('')+'</select></label></div><output class="memorial-archive-count" aria-live="polite"></output><div class="memorial-archive-results"></div><div class="memorial-load-more"><button class="memorial-button is-secondary" type="button" data-load-more></button></div></div>';
      archiveResults();
      const saved=archivePositions.get(cacheKey());
      if(saved) restoreFrame=requestAnimationFrame(()=>window.scrollTo({top:saved.y,behavior:'instant'}));
    }
    function renderMine() {
      const rows=model.historyRows(history,all,account),groups=new Map();
      rows.forEach(row=>{if(!groups.has(row.eventId))groups.set(row.eventId,[]);groups.get(row.eventId).push(row);});
      const result=row=>row.result||({COMPLETED:'완주',NO_SHOW:'미참가',RETIRED:'주행 중단',INVALIDATED:'기록 무효'})[row.runResult]||'결과 확인 중';
      root.innerHTML='<div class="memorial-library">'+head('내 기록','달렸던 길과 머물렀던 순간을 모았습니다.')+'<div class="memorial-library-summary"><strong>지난 참가 '+rows.length+'회</strong><span>메모리얼 '+rows.filter(row=>row.memorial).length+'개</span></div>'+(rows.length?[...groups.values()].map(group=>'<section class="memorial-season"><h3>'+esc(group[0].eventTitle)+'</h3><div class="memorial-records">'+group.map(row=>{const item=row.memorial;return '<article class="memorial-record">'+(item?'<a class="memorial-record-photo" href="'+href(item)+'" data-app-link><img src="'+esc(model.selectCover(item.visits||[])?.photo?.url||item.image)+'" alt="'+esc(item.title)+'" loading="lazy" /></a>':'<div class="memorial-no-photo">메모리얼 없음</div>')+'<div class="memorial-record-copy"><div class="memorial-record-meta"><span>'+date(row.eventDate)+' · '+esc(result(row))+'</span>'+testBadge(row)+'</div><h4>'+esc(item?.title||row.eventTitle)+'</h4><p>'+esc(item?.summary||'참가 결과가 보관되어 있습니다. 등록된 메모리얼은 없습니다.')+'</p>'+(item?badge(item):'')+'</div><div class="memorial-record-actions">'+(item?link(href(item),'기록 보기')+link(editHref(item),'관리',true):'<span>'+esc(row.participantNumber||'')+'</span>')+'</div></article>';}).join('')+'</div></section>').join(''):empty('아직 남겨진 여정이 없어요.','지난 참가와 메모리얼이 생기면 이곳에 모입니다.')+link('/app/memorials','메모리얼 둘러보기',true))+'</div>';
    }
    function renderDenied(title, copy) {
      root.innerHTML = '<section class="memorial-unavailable">' + back("/app/memorials", "메모리얼 둘러보기") + head(title, copy) + "</section>";
    }
    function renderDetail(item) {
      const access=domain.memorialAccess(item,account);
      if(!access.allowed)return renderDenied(access.reason==='PRIVATE'?'비공개 메모리얼입니다.':'메모리얼을 찾을 수 없습니다.',access.reason==='PRIVATE'?'이 기록은 작성자만 확인할 수 있습니다.':'주소를 확인하고 다시 이동해 주세요.');
      const owner=model.isOwner(item,account);
      const returnPath=collectionPaths.get(accountKey) || (owner?'/app/my':'/app/memorials');
      root.innerHTML='<div class="memorial-detail">'+back(returnPath,returnPath==='/app/my'?'내 기록':'메모리얼 목록')+'<article><header class="memorial-detail-head"><div><span class="memorial-event">'+esc(item.eventTitle)+' · '+date(item.startedAt)+' · '+esc(item.result)+' '+testBadge(item)+'</span><h2>'+esc(item.title)+'</h2><p>'+esc(item.ownerName)+'의 기록 · '+esc(placeName(item.startLocationId))+' → '+esc(placeName(item.finishLocationId))+'</p></div>'+(owner?link(editHref(item),'기록 관리',true):'')+'</header><p class="memorial-journey-intro">'+esc(item.summary)+'</p><dl class="memorial-journey-stats"><div><dt>달린 거리</dt><dd>'+journey.km(item.distanceMeters)+'<small> km</small></dd></div><div><dt>방문한 스팟</dt><dd>'+item.spotCount+'<small>곳</small></dd></div></dl><details class="memorial-time-details"><summary>주행 시간과 출발·도착</summary><p>주행 '+journey.duration(item.movingSeconds)+' · 정차 '+journey.duration(item.stoppedSeconds)+' · '+journey.time(item.startedAt)+' → '+journey.time(item.finishedAt)+'</p></details><div class="memorial-journey-host"></div></article></div>';
      disposeJourney=journey.mount(root.querySelector('.memorial-journey-host'),item,places);
    }
    function renderEditor(item) {
      if (!item || !model.isOwner(item, account) || item.publishStatus !== "PUBLISHED") return renderDenied("관리할 수 없는 메모리얼입니다.", "내가 작성한 메모리얼만 수정할 수 있습니다.");
      root.innerHTML = '<div class="memorial-editor">' + back("/app/my", "내 기록") + head("메모리얼 관리", "기록의 이름과 소개를 다듬고, 공개할 범위를 선택하세요.") + '<div class="memorial-editor-grid"><aside class="memorial-edit-preview" aria-label="메모리얼 미리보기"><img src="' + esc(item.image) + '" alt="" /><div><span class="memorial-event">' + esc(item.eventTitle) + ' · ' + esc(item.result) + '</span><h3 id="memorial-preview-title">' + esc(item.title) + '</h3><p id="memorial-preview-summary">' + esc(item.summary) + '</p><div id="memorial-preview-visibility">' + badge(item) + '</div></div></aside><form class="memorial-form" data-memorial-form data-memorial-id="' + esc(item.id) + '"><label for="memorial-title">제목 <span>최대 60자</span></label><input id="memorial-title" name="title" value="' + esc(item.title) + '" maxlength="60" required /><label for="memorial-summary">소개 <span>최대 300자</span></label><textarea id="memorial-summary" name="summary" maxlength="300" rows="4">' + esc(item.summary) + '</textarea><fieldset><legend>공개 범위</legend><label class="memorial-radio"><input type="radio" name="visibility" value="PUBLIC"' + (item.visibility === "PUBLIC" ? " checked" : "") + ' /><span><strong>공개</strong><small>다른 라이더도 목록에서 내 기록을 볼 수 있습니다.</small></span></label><label class="memorial-radio"><input type="radio" name="visibility" value="PRIVATE"' + (item.visibility === "PRIVATE" ? " checked" : "") + ' /><span><strong>나만 보기</strong><small>공개 목록에서 숨기고 나만 확인합니다.</small></span></label></fieldset><p class="memorial-preview-note">현재는 미리보기 단계로, 변경 내용은 이 브라우저에만 저장됩니다.</p><div class="memorial-form-actions"><button class="memorial-button" type="submit">변경 내용 저장</button><a class="memorial-button is-secondary" href="/app/my" data-app-link>취소</a></div><p class="memorial-save-status" role="status" aria-live="polite"></p></form></div></div>';
    }
    function onClick(event) {
      if (event.target.closest("[data-load-more]")) { visibleCount += 12; archiveResults(); }
    }
    function updateFilters(event) {
      if (!event.target.matches("[data-memorial-search], [data-memorial-start], [data-memorial-event]")) return;
      const nextSearch = root.querySelector("[data-memorial-search]").value;
      const nextStart = root.querySelector("[data-memorial-start]").value;
      const nextEvent=root.querySelector('[data-memorial-event]')?.value||'all';
      if (nextSearch === filters.search && nextStart === filters.start && nextEvent === filters.event) return;
      filters.event=nextEvent;
      filters.search = nextSearch;
      filters.start = nextStart;
      visibleCount = 12;
      const url = new URL(location.href);
      filters.search ? url.searchParams.set("memorialQuery", filters.search) : url.searchParams.delete("memorialQuery");
      filters.start !== "all" ? url.searchParams.set("memorialStart", filters.start) : url.searchParams.delete("memorialStart");
      filters.event !== 'all' ? url.searchParams.set('memorialEvent',filters.event) : url.searchParams.delete('memorialEvent');
      window.history.replaceState(window.history.state, "", url.pathname + url.search);
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
    if (path === "/app/memorials") renderArchive();
    else if (path === "/app/my") renderMine();
    else if (path.startsWith("/app/memorials/mine/")) renderEditor(all.find((item) => editHref(item) === path));
    else renderDetail(all.find((item) => href(item) === path || (item.publicSlug && "/app/memorials/" + item.publicSlug === path)));
    root.addEventListener("click", onClick);
    root.addEventListener("input", onInput);
    root.addEventListener("submit", onSubmit);
    root.addEventListener("change", updateFilters);
    root.addEventListener("error", onImageError, true);
    root.addEventListener("load", onImageLoad, true);
    return () => {
      if(path === "/app/memorials") archivePositions.set(cacheKey(),{count:visibleCount,y:window.scrollY});
      cancelAnimationFrame(restoreFrame);
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
