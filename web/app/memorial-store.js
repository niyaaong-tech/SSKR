(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.SSKR_MEMORIAL_STORE = Object.freeze(api);
})(typeof globalThis !== "undefined" ? globalThis : this, () => {
  const STORAGE_KEY = "sskr.mock.memorials";
  const isOwner = (item, account = {}) => Boolean(item && account.linked === true && account.id && item.ownerUserId === account.id);
  const sort = (items) => [...items].sort((a, b) => b.eventTitle.localeCompare(a.eventTitle, "ko", { numeric: true }));
  function collections(items, account = {}) {
    const published = items.filter((item) => item.publishStatus === "PUBLISHED");
    return {
      public: sort(published.filter((item) => item.visibility === "PUBLIC" && !isOwner(item, account))),
      mine: sort(published.filter((item) => isOwner(item, account)))
    };
  }
  function editableValues(values) {
    const title = typeof values?.title === "string" ? values.title.trim() : "";
    const summary = typeof values?.summary === "string" ? values.summary.trim() : "";
    if (!title || title.length > 60) throw new Error("제목은 1자 이상, 60자 이내로 입력해 주세요.");
    if (summary.length > 300) throw new Error("소개는 300자 이내로 입력해 주세요.");
    if (!["PUBLIC", "PRIVATE"].includes(values?.visibility)) throw new Error("공개 범위를 선택해 주세요.");
    return { title, summary, visibility: values.visibility };
  }
  // Preview adapter only. Production writes must authenticate ownership on the server.
  function create(items, storage) {
    const base = items.map((item) => ({ ...item }));
    function read() {
      try {
        const saved = JSON.parse(storage?.getItem(STORAGE_KEY) || "{}");
        return saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {};
      } catch { return {}; }
    }
    function all() {
      const saved = read();
      return base.map((item) => {
        try {
          return Object.hasOwn(saved, item.id) ? { ...item, ...editableValues(saved[item.id]) } : { ...item };
        } catch { return { ...item }; }
      });
    }
    function update(id, account, values) {
      const item = base.find((entry) => entry.id === id);
      if (!isOwner(item, account) || item.publishStatus !== "PUBLISHED") throw new Error("내 메모리얼만 수정할 수 있습니다.");
      const patch = editableValues(values);
      try {
        if (!storage) throw new Error("Storage unavailable");
        storage.setItem(STORAGE_KEY, JSON.stringify({ ...read(), [id]: patch }));
      } catch { throw new Error("저장하지 못했습니다. 브라우저의 저장 공간 설정을 확인하고 다시 시도해 주세요."); }
      return { ...item, ...patch };
    }
    return { all, update };
  }
  function sample(items, count = 6, random = Math.random) {
    const pool = [...items];
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    return pool.slice(0, Math.max(0, count));
  }
  function filterMemorials(items, { search = "", start = "all" } = {}, places = []) {
    const normalize = value => String(value).replace(/\s/g, "").toLowerCase();
    const names = new Map(places.map(place => [place.id, place.name]));
    const query = normalize(search);
    return items.filter(item => item.publishStatus === "PUBLISHED" && item.visibility === "PUBLIC" && (start === "all" || item.startLocationId === start) && (!query || normalize([item.title, item.ownerName, ...(item.visitedLocationIds || []).map(id => names.get(id) || id)].join(" ")).includes(query)));
  }
  function isPublicPhoto(photo) {
    return Boolean(photo?.url && photo.status === "READY" && photo.moderationStatus === "APPROVED" && photo.visibility === "PUBLIC");
  }
  function selectPhoto(visit) {
    const uploads = (visit.photoConsent === false ? [] : visit.media || []).filter(photo => photo.sourceKind === "USER_UPLOAD" && isPublicPhoto(photo));
    uploads.sort((a,b) => (a.sortOrder || 0) - (b.sortOrder || 0) || a.id.localeCompare(b.id));
    return uploads[0] || (isPublicPhoto(visit.placePhoto) ? visit.placePhoto : null);
  }
  function selectCover(visits) {
    const candidates = visits.map(visit => ({ visit, photo: selectPhoto(visit) })).filter(entry => entry.photo);
    candidates.sort((a,b) => Number(b.photo.sourceKind === "USER_UPLOAD") - Number(a.photo.sourceKind === "USER_UPLOAD") || Number(b.visit.role === "SPOT") - Number(a.visit.role === "SPOT") || a.visit.sequence - b.visit.sequence);
    return candidates[0] || null;
  }
  function thumbnailStops(visits, featuredVisitId) {
    const ordered = [...visits].sort((a,b) => a.sequence - b.sequence);
    if (ordered.length <= 5) return ordered;
    const middle = ordered.slice(1,-1);
    const featured = middle.find(v=>v.id===featuredVisitId && v!==middle[0] && v!==middle.at(-1));
    const selected = [middle[0], featured || middle[Math.floor((middle.length-1)/2)], middle.at(-1)].sort((a,b)=>a.sequence-b.sequence);
    return [ordered[0], ...selected, ordered.at(-1)];
  }
  return { collections, create, isOwner, sample, filterMemorials, isPublicPhoto, selectPhoto, selectCover, thumbnailStops };
});
