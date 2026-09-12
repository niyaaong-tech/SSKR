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
  return { collections, create, isOwner };
});
