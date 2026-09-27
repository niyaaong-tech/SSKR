(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SSKR_ROUTE_PLAN = Object.freeze(api);
})(typeof globalThis !== 'undefined' ? globalThis : this, () => {
  'use strict';
  const MIN_STOPS = 10;
  const STORE_VERSION = 1;
  const clone = value => JSON.parse(JSON.stringify(value));
  const listPlaces = catalog => Array.isArray(catalog) ? catalog : catalog?.places || [];
  const catalogIndex = catalog => new Map(listPlaces(catalog).map(place => [place.id, place]));
  function hash(value) {
    let result = 2166136261;
    for (const char of String(value)) { result ^= char.charCodeAt(0); result = Math.imul(result, 16777619); }
    return result >>> 0;
  }
  function catalogVersion(catalog) {
    return String(catalog?.version || `places-${hash(listPlaces(catalog).map(p => `${p.id}:${p.kind}:${p.lat}:${p.lng}`).join('|')).toString(16)}`);
  }
  function finishId(catalog) {
    const finishes = listPlaces(catalog).filter(place => place.kind === 'finish');
    if (finishes.length !== 1) throw new Error('고정 도착지 정보를 확인할 수 없습니다.');
    return finishes[0].id;
  }
  function createEmpty(catalog) {
    return { id: null, title: '', startId: null, stopIds: [], finishId: finishId(catalog), catalogVersion: catalogVersion(catalog), routingVersion: null, createdAt: null, updatedAt: null };
  }
  // Keep removed catalog IDs visible on load so the rider can repair the plan.
  // Invalid references are reported by status and rejected by the write adapter.
  function normalize(plan, catalog) {
    if (!plan || typeof plan !== 'object' || Array.isArray(plan)) throw new Error('루트 정보를 읽을 수 없습니다.');
    if (plan.stopIds != null && (!Array.isArray(plan.stopIds) || plan.stopIds.some(id => typeof id !== 'string' || !id))) throw new Error('경유지 목록을 읽을 수 없습니다.');
    if (plan.startId != null && typeof plan.startId !== 'string') throw new Error('출발지 정보를 읽을 수 없습니다.');
    if (plan.finishId != null && typeof plan.finishId !== 'string') throw new Error('도착지 정보를 읽을 수 없습니다.');
    if (plan.id != null && (typeof plan.id !== 'string' || !plan.id)) throw new Error('저장된 루트 번호를 읽을 수 없습니다.');
    if (plan.title != null && typeof plan.title !== 'string') throw new Error('루트 이름을 확인해 주세요.');
    if (plan.routingVersion != null && typeof plan.routingVersion !== 'string') throw new Error('도로 데이터 버전을 확인해 주세요.');
    const result = {
      ...createEmpty(catalog), id: plan.id || null, title: (plan.title || '').trim(), startId: plan.startId || null,
      stopIds: [...(plan.stopIds || [])], finishId: plan.finishId || finishId(catalog),
      catalogVersion: plan.catalogVersion || catalogVersion(catalog), routingVersion: plan.routingVersion || null, createdAt: plan.createdAt || null, updatedAt: plan.updatedAt || null
    };
    if (plan.ownerUserId != null) result.ownerUserId = plan.ownerUserId;
    return result;
  }
  function orderedIds(plan) { return [plan.startId, ...(plan.stopIds || []), plan.finishId].filter(Boolean); }
  function referenceIssues(plan, catalog) {
    const index = catalogIndex(catalog), issues = [], used = new Set();
    if (plan.startId && index.get(plan.startId)?.kind !== 'start') issues.push({ code: 'INVALID_START', placeId: plan.startId, message: '출발지를 다시 선택해 주세요.' });
    if (plan.finishId !== finishId(catalog)) issues.push({ code: 'INVALID_FINISH', placeId: plan.finishId, message: '도착지는 지정된 피니시로 고정됩니다.' });
    for (const id of plan.stopIds) {
      if (index.get(id)?.kind !== 'spot') issues.push({ code: 'INVALID_STOP', placeId: id, message: `${index.get(id)?.name || id}: 현재 경유할 수 없는 장소입니다. 삭제하거나 다른 스팟으로 바꿔 주세요.` });
      if (used.has(id)) issues.push({ code: 'DUPLICATE_STOP', placeId: id, message: '같은 스팟은 한 번만 추가할 수 있습니다.' });
      used.add(id);
    }
    return issues;
  }
  function leg(provider, fromId, toId) {
    if (!fromId || !toId) return null;
    if (fromId === toId) return { distanceMeters: 0, durationSeconds: 0 };
    try {
      const result = provider?.summary(fromId, toId);
      if (!result || !Number.isFinite(result.distanceMeters) || result.distanceMeters < 0 || !Number.isFinite(result.durationSeconds) || result.durationSeconds < 0) return null;
      return { distanceMeters: result.distanceMeters, durationSeconds: result.durationSeconds };
    } catch { return null; }
  }
  function totals(ids, provider) {
    let distanceMeters = 0, durationSeconds = 0;
    for (let i = 1; i < ids.length; i++) {
      const part = leg(provider, ids[i - 1], ids[i]);
      if (!part) return null;
      distanceMeters += part.distanceMeters; durationSeconds += part.durationSeconds;
    }
    return { distanceMeters, durationSeconds };
  }
  function status(value, catalog, provider) {
    const plan = normalize(value, catalog), issues = referenceIssues(plan, catalog), index = catalogIndex(catalog);
    const spotCount = new Set(plan.stopIds.filter(id => index.get(id)?.kind === 'spot')).size;
    if (!plan.startId) issues.unshift({ code: 'START_REQUIRED', message: '출발지를 선택해 주세요.' });
    if (spotCount < MIN_STOPS) issues.push({ code: 'MIN_STOPS', message: `경유 스팟 ${MIN_STOPS - spotCount}곳을 더 고르면 루트가 완성됩니다.` });
    const ids = orderedIds(plan);
    for (let i = 1; i < ids.length; i++) {
      if (!leg(provider, ids[i - 1], ids[i])) issues.push({ code: 'UNREACHABLE', fromId: ids[i - 1], toId: ids[i], message: `${index.get(ids[i - 1])?.name || '이전 장소'}에서 ${index.get(ids[i])?.name || '다음 장소'}까지의 도로를 확인할 수 없습니다. 스팟이나 순서를 바꿔 주세요.` });
    }
    const result = plan.startId && !referenceIssues(plan, catalog).length ? totals(ids, provider) : null;
    return { complete: issues.length === 0, spotCount, issues, distanceMeters: result?.distanceMeters ?? null, durationSeconds: result?.durationSeconds ?? null };
  }
  function insertionIndex(plan, anchorId) {
    if (anchorId === plan.startId) return 0;
    const selected = plan.stopIds.indexOf(anchorId);
    return selected >= 0 ? selected + 1 : plan.stopIds.length;
  }
  function categoryCounts(plan, index) {
    const counts = new Map();
    for (const id of plan.stopIds) { const category = index.get(id)?.category; if (category) counts.set(category, (counts.get(category) || 0) + 1); }
    return counts;
  }
  function rankedCandidates(plan, at, catalog, provider, variant, fillMode) {
    const index = catalogIndex(catalog), used = new Set(orderedIds(plan)), counts = categoryCounts(plan, index);
    const from = at ? plan.stopIds[at - 1] : plan.startId, to = plan.stopIds[at] || plan.finishId;
    const baseline = leg(provider, from, to), fromFinish = leg(provider, from, plan.finishId);
    const trip = totals(orderedIds(plan), provider);
    const scale = Math.max(5000, (trip?.distanceMeters || baseline?.distanceMeters || 150000) / (MIN_STOPS + 1));
    return listPlaces(catalog).filter(p => p.kind === 'spot' && !used.has(p.id)).flatMap(place => {
      const incoming = leg(provider, from, place.id), outgoing = leg(provider, place.id, to), remaining = leg(provider, place.id, plan.finishId);
      if (!incoming || !outgoing || !remaining) return [];
      const added = incoming.distanceMeters + outgoing.distanceMeters - (baseline?.distanceMeters || 0);
      const backtrack = fromFinish ? Math.max(0, remaining.distanceMeters - fromFinish.distanceMeters) : 0;
      const nearest = Math.min(Infinity, ...plan.stopIds.map(id => leg(provider, id, place.id)?.distanceMeters ?? Infinity));
      const repetition = (counts.get(place.category) || 0) * scale * 0.23;
      const crowding = Math.max(0, scale * 0.5 - nearest) * 0.7;
      const spread = fillMode ? Math.min(incoming.distanceMeters, outgoing.distanceMeters, scale * 2) * 0.52 : 0;
      const variation = variant ? (hash(`${place.id}:${at}:${variant}`) / 4294967295 - 0.5) * scale * 0.5 : 0;
      const reason = !counts.has(place.category) ? '다른 테마로 쉬어가기' : added < scale * 0.18 && !backtrack ? '큰 우회 없이 들르기' : !backtrack ? '피니시 방향으로 이어가기' : '여정에 새로운 장소 더하기';
      return [{ placeId: place.id, fromDistanceMeters: incoming.distanceMeters, addedDistanceMeters: Math.round(added), durationSeconds: incoming.durationSeconds, reason, at, score: added + backtrack * 0.65 + repetition + crowding - spread + variation }];
    }).sort((a, b) => a.score - b.score || a.placeId.localeCompare(b.placeId));
  }
  function recommendations(value, anchorId, catalog, provider, { limit = 3, variant = 0 } = {}) {
    const plan = normalize(value, catalog);
    if (!plan.startId || referenceIssues(plan, catalog).length) return [];
    const index = catalogIndex(catalog), candidates = rankedCandidates(plan, insertionIndex(plan, anchorId), catalog, provider, variant, false), selected = [];
    const count = Math.max(0, Math.min(listPlaces(catalog).length, Math.floor(Number(limit) || 0)));
    while (candidates.length && selected.length < count) {
      candidates.sort((a, b) => {
        const penalty = entry => selected.reduce((sum, item) => sum + (index.get(item.placeId)?.category === index.get(entry.placeId)?.category ? 7500 : 0) + Math.max(0, 7000 - (leg(provider, item.placeId, entry.placeId)?.distanceMeters ?? Infinity)), 0);
        return a.score + penalty(a) - b.score - penalty(b) || a.placeId.localeCompare(b.placeId);
      });
      const { score, at, ...candidate } = candidates.shift(); selected.push(candidate);
    }
    return selected;
  }
  function nextRecommendations(value, currentId, catalog, provider, { limit = 3 } = {}) {
    const plan = normalize(value, catalog), current = currentId || plan.stopIds.at(-1) || plan.startId;
    if (!plan.startId || !current || referenceIssues(plan, catalog).length) return [];
    const used = new Set(orderedIds(plan)), baseline = leg(provider, current, plan.finishId);
    if (!baseline) return [];
    const target = baseline.distanceMeters / Math.max(2, 10 - plan.stopIds.length);
    return listPlaces(catalog).filter(place => place.kind === 'spot' && !used.has(place.id) && place.id !== current)
      .flatMap(place => {
        const incoming = leg(provider, current, place.id), remaining = leg(provider, place.id, plan.finishId);
        if (!incoming || !remaining || remaining.distanceMeters >= baseline.distanceMeters) return [];
        const detour = Math.max(0, incoming.distanceMeters + remaining.distanceMeters - baseline.distanceMeters);
        const progress = baseline.distanceMeters - remaining.distanceMeters;
        const score = Math.abs(progress - target) * 1.3 + detour * 1.1 + Math.abs(incoming.distanceMeters - target) * .25;
        return [{ placeId: place.id, fromDistanceMeters: incoming.distanceMeters, addedDistanceMeters: Math.round(detour), durationSeconds: incoming.durationSeconds,
          reason: `피니시까지 ${Math.round(progress / 1000)} km 전진 · 예상 동선에서 +${Math.round(detour / 1000)} km`, score }];
      }).sort((a, b) => a.score - b.score || a.placeId.localeCompare(b.placeId))
      .slice(0, Math.max(0, Math.floor(Number(limit) || 0)))
      .map(({ score, ...entry }) => entry);
  }
  function autoFill(value, catalog, provider, { variant = 0 } = {}) {
    const plan = normalize(value, catalog);
    if (!plan.startId || referenceIssues(plan, catalog).length) return plan;
    while (plan.stopIds.length < MIN_STOPS) {
      let best = null;
      for (let at = 0; at <= plan.stopIds.length; at++) {
        const candidate = rankedCandidates(plan, at, catalog, provider, variant, true)[0];
        if (candidate && (!best || candidate.score < best.score || candidate.score === best.score && candidate.placeId < best.placeId)) best = candidate;
      }
      if (!best) break;
      plan.stopIds.splice(best.at, 0, best.placeId);
    }
    return plan;
  }
  function optimize(value, provider) {
    const plan = clone(value), initial = totals(orderedIds(plan), provider);
    if (!plan.startId || !initial) return plan;
    let current = initial.distanceMeters, improved = true, rounds = 0;
    // Directed distances: recalculate each proposed reversal rather than assuming symmetry.
    while (improved && rounds++ < 12) {
      improved = false;
      for (let i = 0; i < plan.stopIds.length - 1; i++) {
        for (let j = i + 1; j < plan.stopIds.length; j++) {
          const candidate = [...plan.stopIds.slice(0, i), ...plan.stopIds.slice(i, j + 1).reverse(), ...plan.stopIds.slice(j + 1)];
          const result = totals([plan.startId, ...candidate, plan.finishId], provider);
          if (result && result.distanceMeters + 1 < current) { plan.stopIds = candidate; current = result.distanceMeters; improved = true; }
        }
      }
    }
    return plan;
  }
  // Mock browser adapter. A production adapter must derive account identity on the server.
  function createStore(storage, catalog) {
    function accountId(account) {
      if (!account || account.linked !== true || typeof account.id !== 'string' || !account.id.trim()) throw new Error('로그인 후 루트를 저장할 수 있습니다.');
      return account.id;
    }
    const key = id => `sskr.mock.route-plans:${encodeURIComponent(id)}`;
    function read(account) {
      const id = accountId(account); let raw;
      try { if (!storage) throw new Error(); raw = storage.getItem(key(id)); }
      catch { throw new Error('저장한 루트를 불러오지 못했습니다. 브라우저 저장 공간 설정을 확인해 주세요.'); }
      if (raw == null) return { version: STORE_VERSION, accountId: id, plans: [] };
      try {
        const saved = JSON.parse(raw);
        if (saved?.version !== STORE_VERSION || saved.accountId !== id || !Array.isArray(saved.plans)) throw new Error();
        const ids = new Set();
        for (const item of saved.plans) {
          if (item.ownerUserId !== id || !item.id || ids.has(item.id) || typeof item.createdAt !== 'string' || typeof item.updatedAt !== 'string') throw new Error();
          normalize(item, catalog); ids.add(item.id);
        }
        return saved;
      } catch { throw new Error('저장한 루트 형식을 읽을 수 없습니다. 기존 데이터를 덮어쓰지 않았습니다.'); }
    }
    function write(account, saved) {
      const id = accountId(account);
      try { storage.setItem(key(id), JSON.stringify(saved)); }
      catch { throw new Error('루트를 저장하지 못했습니다. 저장 공간을 확인한 뒤 다시 시도해 주세요.'); }
    }
    function list(account) {
      return read(account).plans.map(item => normalize(item, catalog)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || a.id.localeCompare(b.id));
    }
    function get(id, account) { return list(account).find(plan => plan.id === id) || null; }
    function save(value, account) {
      const id = accountId(account), saved = read(account), plan = normalize(value, catalog), issues = referenceIssues(plan, catalog);
      if (issues.length) throw new Error(issues[0].message);
      if (plan.title.length > 60) throw new Error('루트 이름은 60자 이내로 입력해 주세요.');
      if (plan.ownerUserId && plan.ownerUserId !== id) throw new Error('내 루트만 수정할 수 있습니다. 복제한 뒤 저장해 주세요.');
      const existing = plan.id ? saved.plans.find(item => item.id === plan.id) : null;
      if (plan.id && !existing) throw new Error('수정할 루트를 찾을 수 없습니다. 내 루트에서 다시 열어 주세요.');
      const now = new Date().toISOString();
      const routeId = existing?.id || `route-${typeof globalThis.crypto?.randomUUID === 'function' ? globalThis.crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`}`;
      const result = { ...plan, id: routeId, ownerUserId: id, title: plan.title || `${catalogIndex(catalog).get(plan.startId)?.name || '나의'} 루트`, catalogVersion: catalogVersion(catalog), createdAt: existing?.createdAt || now, updatedAt: now };
      saved.plans = [...saved.plans.filter(item => item.id !== routeId), result]; write(account, saved);
      return clone(result);
    }
    function remove(id, account) {
      const saved = read(account), next = saved.plans.filter(plan => plan.id !== id);
      if (next.length === saved.plans.length) return false;
      write(account, { ...saved, plans: next }); return true;
    }
    return { list, get, save, remove };
  }
  return { MIN_STOPS, createEmpty, normalize, orderedIds, status, recommendations, nextRecommendations, autoFill, optimize, createStore };
});
