const test = require('node:test');
const assert = require('node:assert/strict');
const planner = require('../../web/app/route-plan');

function fixture(count = 18) {
  const catalog = [
    { id: 'start', kind: 'start', name: '동해 출발', x: 0 },
    { id: 'other-start', kind: 'start', name: '부산 출발', x: -10000 },
    ...Array.from({ length: count }, (_, i) => ({ id: `spot-${i + 1}`, kind: 'spot', name: `스팟 ${i + 1}`, category: ['nature', 'cafe', 'culture', 'food'][i % 4], x: (i + 1) * 12000 })),
    { id: 'finish', kind: 'finish', name: '고정 피니시', x: (count + 1) * 12000 }
  ];
  const index = new Map(catalog.map(place => [place.id, place])), blocked = new Set();
  const provider = { summary(a, b) {
    if (!index.has(a) || !index.has(b) || blocked.has(`${a}:${b}`)) return null;
    const delta = index.get(b).x - index.get(a).x;
    // Directed road fixture: returning east requires a longer one-way detour.
    const distanceMeters = Math.abs(delta) * (delta < 0 ? 1.4 : 1);
    return { distanceMeters, durationSeconds: distanceMeters / 10 };
  } };
  return { catalog, provider, blocked, plan: { ...planner.createEmpty(catalog), startId: 'start' } };
}
function memoryStorage() {
  const data = new Map();
  return { data, getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
}
const account = { id: 'rider-1', linked: true, participant: false };

test('saved drafts retain their road-data version without copying road geometry', () => {
  const {catalog,plan}=fixture(),store=planner.createStore(memoryStorage(),catalog);
  const saved=store.save({...plan,routingVersion:'road-snapshot-123'},account);
  assert.equal(store.get(saved.id,account).routingVersion,'road-snapshot-123');
  assert.equal(saved.geometry,undefined);
  assert.throws(()=>store.save({...saved,routingVersion:42},account),/버전/);
});

test('completion requires a start, ten distinct intermediate spots and every directed road leg', () => {
  const { catalog, provider, blocked, plan } = fixture();
  assert.deepEqual(planner.orderedIds(planner.createEmpty(catalog)), ['finish']);
  assert.equal(planner.status(plan, catalog, provider).complete, false);
  plan.stopIds = Array.from({ length: 9 }, (_, i) => `spot-${i + 1}`);
  assert.equal(planner.status(plan, catalog, provider).spotCount, 9);
  plan.stopIds.push('spot-10');
  assert.deepEqual(planner.status(plan, catalog, provider), { complete: true, spotCount: 10, issues: [], distanceMeters: 228000, durationSeconds: 22800 });
  plan.stopIds.push('spot-11');
  assert.equal(planner.status(plan, catalog, provider).complete, true);
  blocked.add('spot-10:spot-11');
  const unavailable = planner.status(plan, catalog, provider);
  assert.equal(unavailable.complete, false);
  assert.equal(unavailable.distanceMeters, null);
  assert.equal(unavailable.durationSeconds, null);
  assert.ok(unavailable.issues.some(issue => issue.code === 'UNREACHABLE' && issue.fromId === 'spot-10' && issue.toId === 'spot-11'));
});

test('invalid IDs, place roles, fixed finish changes and duplicates remain explicit for repair', () => {
  const { catalog, provider, plan } = fixture();
  const input = { ...plan, startId: 'spot-1', finishId: 'other-start', stopIds: ['removed', 'start', 'spot-2', 'spot-2'] };
  assert.deepEqual(planner.normalize(input, catalog).stopIds, input.stopIds);
  const result = planner.status(input, catalog, provider);
  assert.equal(result.spotCount, 1);
  for (const code of ['INVALID_START', 'INVALID_FINISH', 'INVALID_STOP', 'DUPLICATE_STOP']) assert.ok(result.issues.some(issue => issue.code === code));
  assert.equal(result.distanceMeters, null);
  assert.throws(() => planner.normalize({ stopIds: 'spot-1' }, catalog), /경유지/);
});

test('missing or malformed routing data never produces synthetic distance totals', () => {
  const { catalog, plan } = fixture();
  plan.stopIds = ['spot-1'];
  for (const provider of [undefined, { summary: () => ({ distanceMeters: NaN, durationSeconds: 0 }) }, { summary: () => { throw new Error('offline'); } }]) {
    assert.equal(planner.status(plan, catalog, provider).distanceMeters, null);
    assert.deepEqual(planner.recommendations(plan, 'spot-1', catalog, provider), []);
    assert.deepEqual(planner.autoFill(plan, catalog, provider).stopIds, ['spot-1']);
  }
});

test('next-stop suggestions advance about one tenth from the start and follow the newly selected current spot', () => {
  const { catalog, provider, plan } = fixture();
  const first = planner.nextRecommendations(plan, plan.startId, catalog, provider);
  assert.ok(first.length > 0);
  assert.ok(['spot-1', 'spot-2', 'spot-3'].includes(first[0].placeId));
  plan.stopIds = ['spot-2', 'spot-7'];
  const fromLast = planner.nextRecommendations(plan, 'spot-7', catalog, provider);
  const fromSelected = planner.nextRecommendations(plan, 'spot-2', catalog, provider);
  assert.ok(fromLast.length > 0 && fromSelected.length > 0);
  assert.notEqual(fromLast[0].placeId, fromSelected[0].placeId);
  assert.ok(Number(fromSelected[0].placeId.split('-')[1]) < Number(fromLast[0].placeId.split('-')[1]));
  assert.deepEqual(planner.nextRecommendations({...plan,startId:null}, 'spot-7', catalog, provider), []);
});

test('recommendations use directed incoming and outgoing roads at the selected insertion position', () => {
  const { catalog, provider, blocked, plan } = fixture();
  plan.stopIds = ['spot-4', 'spot-12'];
  blocked.add('spot-4:spot-5'); blocked.add('spot-6:spot-12');
  const choices = planner.recommendations(plan, 'spot-4', catalog, provider);
  assert.equal(choices.length, 3);
  for (const choice of choices) {
    assert.ok(!['spot-4', 'spot-12', 'spot-5', 'spot-6'].includes(choice.placeId));
    const incoming = provider.summary('spot-4', choice.placeId), outgoing = provider.summary(choice.placeId, 'spot-12');
    assert.equal(choice.fromDistanceMeters, incoming.distanceMeters);
    assert.equal(choice.addedDistanceMeters, incoming.distanceMeters + outgoing.distanceMeters - provider.summary('spot-4', 'spot-12').distanceMeters);
    assert.equal(choice.durationSeconds, incoming.durationSeconds);
    assert.ok(choice.reason);
  }
  assert.ok(choices.every(item => { const n = Number(item.placeId.split('-')[1]); return n > 4 && n < 12; }), 'prefer onward places to backtracking');
  const categories = choices.map(item => catalog.find(place => place.id === item.placeId).category);
  assert.equal(new Set(categories).size, 3, 'equally convenient options should cover different themes');
  assert.deepEqual(planner.recommendations(plan, 'spot-4', catalog, provider, { limit: 0 }), []);
});

test('auto fill selects ten unique connected spots with category and road-distance spacing diversity', () => {
  const { catalog, provider, plan } = fixture(24), result = planner.autoFill(plan, catalog, provider);
  assert.equal(result.stopIds.length, 10);
  assert.equal(new Set(result.stopIds).size, 10);
  assert.equal(planner.status(result, catalog, provider).complete, true);
  assert.deepEqual(plan.stopIds, [], 'proposal must not mutate the current edit');
  const places = result.stopIds.map(id => catalog.find(place => place.id === id));
  assert.equal(new Set(places.map(place => place.category)).size, 4);
  assert.ok(Math.max(...places.map(place => place.x)) - Math.min(...places.map(place => place.x)) > 150000);
  assert.equal(result.startId, plan.startId); assert.equal(result.finishId, plan.finishId);
});

test('auto fill preserves existing relative order and variants offer another combination', () => {
  const { catalog, provider, plan } = fixture(30);
  plan.stopIds = ['spot-24', 'spot-3', 'spot-13'];
  const results = Array.from({ length: 4 }, (_, variant) => planner.autoFill(plan, catalog, provider, { variant }));
  for (const result of results) {
    assert.equal(result.stopIds.length, 10);
    assert.deepEqual(result.stopIds.filter(id => plan.stopIds.includes(id)), plan.stopIds);
  }
  assert.ok(new Set(results.map(result => result.stopIds.join(','))).size > 1);
  const full = { ...plan, stopIds: Array.from({ length: 12 }, (_, i) => `spot-${i + 1}`) };
  assert.deepEqual(planner.autoFill(full, catalog, provider).stopIds, full.stopIds);
});

test('current catalog auto-fill spans the journey for every start, including both Busan beaches', () => {
  const catalog = require('../../web/app/spot-catalog'), index = new Map(catalog.map(place => [place.id, place]));
  // Heuristic coverage fixture only, not road verification: production uses the OSM matrix.
  const provider = { summary(a, b) {
    const from = index.get(a), to = index.get(b);
    if (!from || !to) return null;
    const distanceMeters = Math.hypot((from.lat - to.lat) * 111000, (from.lng - to.lng) * 88000) * 1.32;
    return { distanceMeters, durationSeconds: distanceMeters / 10 };
  } };
  const starts = catalog.filter(place => place.kind === 'start');
  assert.ok(starts.filter(place => place.region.startsWith('부산')).length >= 2);
  for (const start of starts) {
    const result = planner.autoFill({ ...planner.createEmpty(catalog), startId: start.id }, catalog, provider);
    const places = result.stopIds.map(id => index.get(id));
    assert.equal(planner.status(result, catalog, provider).complete, true, start.name);
    assert.ok(new Set(places.map(place => place.category)).size >= 3, start.name);
    assert.ok(new Set(places.map(place => place.region.split(' · ')[0])).size >= 3, start.name);
    const direct = provider.summary(start.id, result.finishId).distanceMeters;
    const fromStart = places.map(place => provider.summary(start.id, place.id).distanceMeters);
    assert.ok(Math.min(...fromStart) < direct * 0.3, `${start.name}: include early journey stops`);
    assert.ok(Math.max(...fromStart) > direct * 0.7, `${start.name}: include late journey stops`);
    assert.ok(fromStart.filter(distance => distance < direct * 0.65).length >= 4, `${start.name}: avoid filling mostly near the finish`);
  }
});

test('insufficient connected inventory stays incomplete instead of fabricating duplicate stops', () => {
  const { catalog, provider, blocked, plan } = fixture(4);
  for (const place of catalog) blocked.add(`${place.id}:spot-4`);
  const result = planner.autoFill(plan, catalog, provider);
  assert.equal(result.stopIds.length, 3);
  assert.ok(!result.stopIds.includes('spot-4'));
  assert.ok(planner.status(result, catalog, provider).issues.some(issue => issue.code === 'MIN_STOPS'));
  assert.deepEqual(planner.autoFill(planner.createEmpty(catalog), catalog, provider).stopIds, []);
});

test('optimization keeps endpoints and membership and accepts only shorter directed routed orders', () => {
  const { catalog, provider, blocked, plan } = fixture();
  plan.stopIds = ['spot-12', 'spot-2', 'spot-7', 'spot-1'];
  const before = planner.status(plan, catalog, provider).distanceMeters, result = planner.optimize(plan, provider);
  assert.ok(planner.status(result, catalog, provider).distanceMeters < before);
  assert.deepEqual([...result.stopIds].sort(), [...plan.stopIds].sort());
  assert.equal(result.startId, plan.startId); assert.equal(result.finishId, plan.finishId);
  assert.deepEqual(plan.stopIds, ['spot-12', 'spot-2', 'spot-7', 'spot-1']);
  blocked.add('start:spot-12');
  assert.deepEqual(planner.optimize(plan, provider), plan);
});

test('linked nonparticipants can save empty and partial drafts; guests cannot persist', () => {
  const { catalog, plan } = fixture(), storage = memoryStorage(), store = planner.createStore(storage, catalog);
  for (const guest of [null, {}, { id: 'rider-1' }, { id: 'rider-1', linked: false }]) assert.throws(() => store.save(plan, guest), /로그인/);
  const empty = store.save(planner.createEmpty(catalog), account);
  assert.equal(empty.ownerUserId, account.id); assert.equal(empty.title, '나의 루트'); assert.equal(empty.startId, null);
  assert.deepEqual(empty.stopIds, []);
  const draft = store.save({ ...plan, stopIds: ['spot-1'] }, account);
  assert.ok(draft.id); assert.equal(store.list(account).length, 2); assert.equal(store.get(draft.id, account).stopIds.length, 1);
  const updated = store.save({ ...draft, title: '나만의 하루', stopIds: ['spot-1', 'spot-2'] }, account);
  assert.equal(updated.id, draft.id); assert.equal(updated.createdAt, draft.createdAt); assert.equal(store.list(account).length, 2);
  updated.stopIds.push('spot-3');
  assert.equal(store.get(draft.id, account).stopIds.length, 2, 'stored values do not share edit references');
});

test('account-scoped reads, updates and deletes cannot disclose or change another rider plan', () => {
  const { catalog, plan } = fixture(), store = planner.createStore(memoryStorage(), catalog);
  const other = { id: 'rider-2', linked: true }, saved = store.save(plan, account);
  assert.deepEqual(store.list(other), []); assert.equal(store.get(saved.id, other), null); assert.equal(store.remove(saved.id, other), false);
  assert.throws(() => store.save(saved, other), /내 루트/);
  assert.throws(() => store.save({ ...saved, ownerUserId: other.id }, other), /찾을 수 없습니다/);
  assert.equal(store.get(saved.id, account).id, saved.id);
  assert.equal(store.remove(saved.id, account), true); assert.equal(store.get(saved.id, account), null);
});

test('writes reject invalid references, duplicates and long titles without modifying existing drafts', () => {
  const { catalog, plan } = fixture(), storage = memoryStorage(), store = planner.createStore(storage, catalog);
  const saved = store.save(plan, account), before = new Map(storage.data);
  for (const patch of [{ stopIds: ['removed'] }, { stopIds: ['start'] }, { stopIds: ['spot-1', 'spot-1'] }, { startId: 'spot-1' }, { finishId: 'other-start' }, { title: '가'.repeat(61) }]) {
    assert.throws(() => store.save({ ...saved, ...patch }, account)); assert.deepEqual(storage.data, before);
  }
  assert.equal(store.save({ ...saved, stopIds: Array.from({ length: 18 }, (_, i) => `spot-${i + 1}`) }, account).stopIds.length, 18);
});

test('corrupt, future-version or mixed-owner storage is not silently reset or overwritten', () => {
  const { catalog, plan } = fixture(), storage = memoryStorage(), store = planner.createStore(storage, catalog);
  const saved = store.save(plan, account), key = [...storage.data.keys()][0];
  for (const raw of ['invalid json', JSON.stringify({ version: 99, accountId: account.id, plans: [] }), JSON.stringify({ version: 1, accountId: account.id, plans: [{ ...saved, ownerUserId: 'someone-else' }] })]) {
    storage.setItem(key, raw);
    assert.throws(() => store.list(account), /형식/); assert.throws(() => store.save(plan, account), /형식/); assert.equal(storage.getItem(key), raw);
  }
});

test('storage failures surface explicit errors and removed catalog entries remain repairable', () => {
  const { catalog, plan } = fixture(), storage = memoryStorage(), store = planner.createStore(storage, catalog);
  const saved = store.save({ ...plan, stopIds: ['spot-1'] }, account);
  const updatedStore = planner.createStore(storage, catalog.filter(place => place.id !== 'spot-1'));
  assert.deepEqual(updatedStore.get(saved.id, account).stopIds, ['spot-1']);
  assert.throws(() => updatedStore.save(saved, account), /경유할 수 없는 장소/);
  const unavailable = planner.createStore({ getItem() { throw new Error('blocked'); } }, catalog);
  assert.throws(() => unavailable.list(account), /불러오지 못했습니다/);
  const full = planner.createStore({ getItem: () => null, setItem() { throw new Error('quota'); } }, catalog);
  assert.throws(() => full.save(plan, account), /저장하지 못했습니다/);
});

test('sparse directed roads keep recommendations in the insertion corridor and auto-fill preserves manual order', () => {
  const { catalog, provider: base, plan } = fixture(18);
  const order = new Map(catalog.map(place => [place.id, place.x]));
  const isolated = new Set(['spot-5', 'spot-13']);
  const provider = { summary(a, b) {
    if (isolated.has(a) || isolated.has(b) || order.get(a) > order.get(b)) return null;
    return base.summary(a, b);
  } };
  plan.stopIds = ['spot-3', 'spot-9', 'spot-16'];
  const unchanged = structuredClone(plan);
  const choices = planner.recommendations(plan, 'spot-3', catalog, provider, { limit: 20 });
  assert.deepEqual(new Set(choices.map(choice => choice.placeId)), new Set(['spot-4', 'spot-6', 'spot-7', 'spot-8']));
  assert.equal(new Set(choices.map(choice => choice.placeId)).size, choices.length);
  for (let variant = 0; variant < 5; variant++) {
    const result = planner.autoFill(plan, catalog, provider, { variant });
    assert.equal(result.stopIds.length, 10);
    assert.equal(new Set(result.stopIds).size, 10);
    assert.deepEqual(result.stopIds.filter(id => plan.stopIds.includes(id)), plan.stopIds);
    assert.equal(result.stopIds.some(id => isolated.has(id)), false);
    assert.equal(planner.status(result, catalog, provider).complete, true);
    const route = planner.orderedIds(result);
    for (let i = 1; i < route.length; i++) assert.ok(provider.summary(route[i - 1], route[i]), `${route[i - 1]} -> ${route[i]}`);
  }
  assert.deepEqual(plan, unchanged);
});

test('optimization rejects a tempting reversal with missing or costly reverse-direction roads', () => {
  const plan = { startId: 'start', stopIds: ['a', 'b', 'c'], finishId: 'finish' };
  const distances = new Map([
    ['start:a', 10], ['a:b', 10], ['b:c', 10], ['c:finish', 10],
    ['start:b', 1], ['a:c', 1], ['c:b', 100], ['b:finish', 1],
    ['start:c', 1], ['a:finish', 1]
  ]);
  const provider = { summary(a, b) {
    const distanceMeters = distances.get(`${a}:${b}`);
    return distanceMeters == null ? null : { distanceMeters, durationSeconds: distanceMeters * 2 };
  } };
  assert.deepEqual(planner.optimize(plan, provider), plan);
  distances.set('b:a', 1);
  const shorter = planner.optimize(plan, provider);
  assert.deepEqual(shorter.stopIds, ['b', 'a', 'c']);
  assert.deepEqual(plan.stopIds, ['a', 'b', 'c']);
});

test('a disconnected partial draft saves and reloads for repair without being marked complete', () => {
  const { catalog, provider, blocked, plan } = fixture();
  const store = planner.createStore(memoryStorage(), catalog);
  plan.stopIds = ['spot-2', 'spot-7', 'spot-11'];
  blocked.add('spot-7:spot-11');
  const draft = store.save(plan, account), loaded = store.get(draft.id, account);
  assert.deepEqual(loaded.stopIds, plan.stopIds);
  assert.equal(loaded.startId, 'start');
  assert.equal(loaded.finishId, 'finish');
  const status = planner.status(loaded, catalog, provider);
  assert.equal(status.complete, false);
  assert.equal(status.distanceMeters, null);
  assert.ok(status.issues.some(issue => issue.code === 'MIN_STOPS'));
  assert.ok(status.issues.some(issue => issue.code === 'UNREACHABLE' && issue.fromId === 'spot-7' && issue.toId === 'spot-11'));
  loaded.stopIds = loaded.stopIds.filter(id => id !== 'spot-11');
  const repaired = store.save(loaded, account);
  assert.equal(repaired.id, draft.id);
  assert.equal(planner.status(repaired, catalog, provider).issues.some(issue => issue.code === 'UNREACHABLE'), false);
});
