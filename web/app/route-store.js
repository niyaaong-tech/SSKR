(function(root) {
  'use strict';
  const copy = value => JSON.parse(JSON.stringify(value));
  let owner = null, rows = [], failure = null, limit = 10, generation = 0;
  const backend = () => root.SSKR_BACKEND;
  const requireOwner = account => { if (!account?.linked || account.id !== owner) throw Error('다시 로그인한 뒤 저장 목록을 확인해 주세요.'); };
  function clear() { owner = null; rows = []; failure = null; generation++; }
  async function refresh(account) {
    if (!account?.linked) { clear(); return; }
    if (owner !== account.id) { clear(); owner = account.id; }
    const request = ++generation;
    try {
      const data = await backend().request('routes');
      if (request !== generation || owner !== account.id) return;
      rows = data.routes; limit = data.maxSavedRoutes; failure = null;
    } catch (error) { if (request === generation) failure = error; throw error; }
  }
  function accept(result, account) {
    if (owner !== account.id) return;
    generation++; // Invalidate list requests started before this committed mutation.
    const old = rows.find(row => row.plan.id === result.plan.id);
    if (old && old.revision > result.revision) return;
    rows = rows.filter(row => row.plan.id !== result.plan.id).concat(result).sort((a,b) => b.plan.updatedAt.localeCompare(a.plan.updatedAt));
    failure = null;
  }
  const store = {
    remote: true, clear, refresh,
    get maxSavedRoutes() { return limit; },
    list(account) { if (!account?.linked) return []; requireOwner(account); if (failure) throw failure; return copy(rows.map(row => row.plan)); },
    get(id, account) { requireOwner(account); if (failure) throw failure; const row = rows.find(row => row.plan.id === id); return row ? copy(row.plan) : null; },
    metadata(id) { const row = rows.find(row => row.plan.id === id); return row ? copy({ schedule: row.schedule, revision: row.revision }) : null; },
    async save(plan, account, options) {
      requireOwner(account);
      const headers = plan.id ? { 'If-Match': '"' + options.revision + '"' } : { 'Idempotency-Key': options.key };
      const result = await backend().request('routes' + (plan.id ? '&id=' + encodeURIComponent(plan.id) : ''), plan.id ? 'PUT' : 'POST', { plan, schedule: options.schedule }, headers);
      accept(result, account); return result;
    },
    async saveSchedule(id, schedule, account, revision) {
      requireOwner(account);
      const result = await backend().request('routes&id=' + encodeURIComponent(id), 'PATCH', { schedule }, { 'If-Match': '"' + revision + '"' });
      accept(result, account); return result;
    },
    async remove(id, account) {
      requireOwner(account); const row = rows.find(row => row.plan.id === id);
      if (!row) throw Error('저장한 루트를 찾을 수 없습니다.');
      await backend().request('routes&id=' + encodeURIComponent(id), 'DELETE', {}, { 'If-Match': '"' + row.revision + '"' });
      if (owner === account.id) { generation++; rows = rows.filter(row => row.plan.id !== id); }
    }
  };
  root.SSKR_REMOTE_ROUTES = Object.freeze(store);
})(window);
