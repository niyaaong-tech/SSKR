const test = require('node:test');
const assert = require('node:assert/strict');
const { gzipSync } = require('node:zlib');
const { create, decode, expandShape } = require('../../web/app/route-provider');

const shape = '_izlhA~rlgdF_{geC~ywl@_kwzCn`{nI';
const coordinates = [[38.5, -120.2], [40.7, -120.95], [43.252, -126.453]];
const copy = value => JSON.parse(JSON.stringify(value));
function fixture() {
  const manifest = {
    schemaVersion: 1, version: 'roads-test', catalogVersion: 'places-test', placeIds: ['start', 'middle', 'finish'],
    distances: [[0, 500, 1200], [650, 0, 700], [null, 800, 0]],
    durations: [[0, 50, 120], [65, 0, 70], [null, 80, 0]], accessPoints: { start: [129, 37] }
  };
  const rows = {
    start: { version: manifest.version, fromId: 'start', legs: { middle: { shape }, finish: { shape } } },
    middle: { version: manifest.version, fromId: 'middle', legs: { start: { shape }, finish: { shape } } }
  };
  const calls = [];
  const fetcher = async url => {
    calls.push(url);
    const data = url.endsWith('/manifest.json') ? manifest : rows[url.match(/\/legs\/([^/]+)\.json$/)?.[1]];
    return { ok: Boolean(data), json: async () => copy(data) };
  };
  return { manifest, rows, calls, fetcher, provider: create({ base: '/roads', fetcher }) };
}
function deferred() {
  let resolve, reject;
  const promise = new Promise((done, fail) => { resolve = done; reject = fail; });
  return { promise, resolve, reject };
}

test('decodes standard precision-six coordinates and rejects truncated/invalid strings', () => {
  assert.deepEqual(decode(shape), coordinates);
  for (const invalid of [null, 42, '_', 'a', '??!']) assert.throws(() => decode(invalid));
});

test('shared road prefixes reconstruct exact original coordinates and reject broken reference chains', async () => {
  const base=fixture();
  base.rows.start.legs.middle={shape};
  base.rows.start.legs.finish={base:'middle',prefix:17,shape:shape.slice(17)};
  assert.deepEqual((await base.provider.route(['start','finish'])).legs[0].coordinates,coordinates);
  assert.equal(expandShape({a:{shape:'abc'},b:{base:'a',prefix:3,shape:''}},'b'),'abc');
  for(const bad of [
    {a:{base:'a',prefix:0,shape:''}},
    {a:{base:'b',prefix:1,shape:''},b:{base:'a',prefix:1,shape:''}},
    {a:{base:'missing',prefix:2,shape:'x'}},
    {a:{base:'b',prefix:4,shape:'x'},b:{shape:'ab'}},
    {a:{base:'b',prefix:-1,shape:'x'},b:{shape:'ab'}}
  ])assert.throws(()=>expandShape(bad,'a'));
});

test('matrix is unavailable before ready, uses directed distances and keeps missing pairs explicit', async () => {
  const { provider, calls } = fixture();
  assert.equal(provider.summary('start', 'middle'), null);
  const [first, second] = await Promise.all([provider.ready(), provider.ready()]);
  assert.equal(first, second);
  assert.equal(calls.filter(url => url.endsWith('/manifest.json')).length, 1);
  assert.deepEqual(provider.summary('start', 'middle'), { distanceMeters: 500, durationSeconds: 50 });
  assert.deepEqual(provider.summary('middle', 'start'), { distanceMeters: 650, durationSeconds: 65 });
  assert.equal(provider.summary('finish', 'start'), null);
  assert.equal(provider.summary('missing', 'middle'), null);
  assert.equal(provider.version, 'roads-test');
  assert.equal(provider.catalogVersion, 'places-test');
  assert.deepEqual(provider.accessPoint('start'), [129, 37]);
  assert.equal(provider.accessPoint('missing'), null);
});

test('a valid ordered route loads only required origins and sums actual road legs', async () => {
  const { provider, calls } = fixture();
  const result = await provider.route(['start', 'middle', 'finish']);
  assert.equal(result.valid, true);
  assert.equal(result.version, 'roads-test');
  assert.equal(result.distanceMeters, 1200);
  assert.equal(result.durationSeconds, 120);
  assert.deepEqual(result.legs.map(leg => [leg.fromId, leg.toId, leg.status]), [['start', 'middle', 'ready'], ['middle', 'finish', 'ready']]);
  assert.deepEqual(result.legs[0].coordinates, coordinates);
  await provider.route(['start', 'finish']);
  assert.deepEqual(calls, ['/roads/manifest.json', '/roads/legs/start.json', '/roads/legs/middle.json']);
});

test('unknown or disconnected legs return unavailable without a fallback line or partial total', async () => {
  const { provider, calls } = fixture();
  const result = await provider.route(['finish', 'start', 'middle']);
  assert.equal(result.valid, false);
  assert.equal(result.distanceMeters, null);
  assert.equal(result.durationSeconds, null);
  assert.deepEqual(result.legs[0], { fromId: 'finish', toId: 'start', status: 'unavailable', coordinates: [], distanceMeters: null, durationSeconds: null });
  assert.equal(calls.includes('/roads/legs/finish.json'), false);
  assert.equal((await provider.route(['unknown', 'start'])).valid, false);
  assert.equal((await provider.route(['start'])).valid, false);
  assert.equal((await provider.route([])).valid, false);
});

test('negative matrix metrics do not become a valid road leg', async () => {
  const { manifest, provider } = fixture();
  manifest.distances[0][1] = -1;
  manifest.durations[1][2] = -1;
  await provider.ready();
  assert.equal(provider.summary('start', 'middle'), null);
  assert.equal(provider.summary('middle', 'finish'), null);
  assert.equal((await provider.route(['start', 'middle', 'finish'])).valid, false);
});

test('manifest schema, duplicate IDs and nonsquare matrices fail before becoming ready', async () => {
  for (const mutate of [m => { m.schemaVersion = 2; }, m => { m.placeIds[1] = 'start'; }, m => { m.distances[0].pop(); }, m => { m.durations.pop(); }]) {
    const { manifest, provider } = fixture(); mutate(manifest);
    await assert.rejects(provider.ready());
    assert.equal(provider.summary('start', 'middle'), null);
  }
});

test('version or origin mismatches reject rows, and corrected row fetch can be retried', async () => {
  for (const field of ['version', 'fromId']) {
    const { rows, provider, calls } = fixture(), original = rows.start[field];
    rows.start[field] = 'wrong';
    await assert.rejects(provider.route(['start', 'finish']), /새로고침/);
    rows.start[field] = original;
    assert.equal((await provider.route(['start', 'finish'])).valid, true);
    assert.equal(calls.filter(url => url.endsWith('/legs/start.json')).length, 2);
  }
});

test('manifest and origin fetch failures are retryable instead of caching rejection', async () => {
  const base = fixture(); let failManifest = true, failOrigin = true;
  const provider = create({ base: '/roads', fetcher: async url => {
    if (url.endsWith('/manifest.json') && failManifest) { failManifest = false; throw new Error('offline'); }
    if (url.endsWith('/legs/start.json') && failOrigin) { failOrigin = false; return { ok: false }; }
    return base.fetcher(url);
  } });
  await assert.rejects(provider.ready(), /offline/);
  await provider.ready();
  await assert.rejects(provider.route(['start', 'finish']), /다시 시도/);
  assert.equal((await provider.route(['start', 'finish'])).valid, true);
});

test('missing or empty geometry for distinct endpoints never reports a valid route', async () => {
  for (const invalid of [null, '', '??']) {
    const { rows, provider } = fixture();
    rows.start.legs.finish.shape = invalid;
    await assert.rejects(provider.route(['start', 'finish']));
  }
});

test('aborted old edit rejects after its shared request resolves while the new edit succeeds', async () => {
  const base = fixture(), gate = deferred(); let originCalls = 0;
  const provider = create({ base: '/roads', fetcher: async url => {
    if (url.endsWith('/legs/start.json')) { originCalls++; await gate.promise; }
    return base.fetcher(url);
  } });
  await provider.ready();
  const controller = new AbortController();
  const obsolete = provider.route(['start', 'middle', 'finish'], { signal: controller.signal });
  const obsoleteCheck = assert.rejects(obsolete, error => error.name === 'AbortError');
  await new Promise(resolve => setImmediate(resolve));
  const current = provider.route(['start', 'finish']);
  controller.abort(); gate.resolve();
  await obsoleteCheck;
  const result = await current;
  assert.equal(originCalls, 1);
  assert.equal(result.valid, true);
  assert.deepEqual(result.legs.map(leg => leg.toId), ['finish']);
  assert.equal(base.calls.includes('/roads/legs/middle.json'), false, 'obsolete edit must stop loading subsequent legs');
});

test('an already aborted request returns no route and does not fetch geometry', async () => {
  const { provider, calls } = fixture(), controller = new AbortController();
  controller.abort();
  await assert.rejects(provider.route(['start', 'finish'], { signal: controller.signal }), error => error.name === 'AbortError');
  assert.equal(calls.some(url => url.includes('/legs/')), false);
});

function compressedFixture(encode = value => gzipSync(JSON.stringify(value))) {
  const base = fixture();
  base.manifest.dataFileSuffix = '.json.gz';
  const calls = [];
  const provider = create({ base: '/roads', fetcher: async url => {
    calls.push(url);
    if (url.endsWith('/manifest.json')) return new Response(JSON.stringify(base.manifest));
    const origin = url.match(/\/legs\/([^/]+)\.json\.gz$/)?.[1];
    if (!base.rows[origin]) return new Response(null, { status: 404 });
    return new Response(encode(base.rows[origin], origin));
  } });
  return { ...base, calls, provider };
}

test('opaque gzip assets decode lazily and share a cached origin across route edits', async () => {
  const { provider, calls } = compressedFixture();
  await provider.ready();
  assert.deepEqual(calls, ['/roads/manifest.json'], 'matrix readiness must not download route geometry');
  const [first, second] = await Promise.all([
    provider.route(['start', 'middle']), provider.route(['start', 'finish'])
  ]);
  assert.equal(first.valid, true);
  assert.equal(second.valid, true);
  assert.deepEqual(first.legs[0].coordinates, coordinates);
  assert.equal(second.distanceMeters, 1200);
  await provider.route(['start', 'middle', 'finish']);
  assert.deepEqual(calls, ['/roads/manifest.json', '/roads/legs/start.json.gz', '/roads/legs/middle.json.gz']);
});

test('a CDN-decompressed gzip URL accepts UTF-8 JSON without trying to decompress it again', async () => {
  const { provider, rows, calls } = compressedFixture(value => new TextEncoder().encode(JSON.stringify(value)));
  rows.start.description = '울진 후포에서 출발하는 도로';
  const route = await provider.route(['start', 'middle', 'finish']);
  assert.equal(route.valid, true);
  assert.equal(route.distanceMeters, 1200);
  assert.deepEqual(route.legs.map(leg => leg.coordinates), [coordinates, coordinates]);
  assert.equal(calls.some(url => url.endsWith('/legs/start.json.gz')), true);
});

test('damaged gzip does not cache a failed row and the same route can retry successfully', async () => {
  let damaged = true;
  const { provider, calls } = compressedFixture(value => {
    const bytes = gzipSync(JSON.stringify(value));
    // Preserve gzip magic bytes while removing the trailer and part of the body.
    return damaged ? bytes.subarray(0, bytes.length - 12) : bytes;
  });
  const failed = await Promise.allSettled([
    provider.route(['start', 'middle']), provider.route(['start', 'finish'])
  ]);
  assert.deepEqual(failed.map(result => result.status), ['rejected', 'rejected']);
  assert.equal(calls.filter(url => url.endsWith('/legs/start.json.gz')).length, 1);
  damaged = false;
  const retried = await provider.route(['start', 'finish']);
  assert.equal(retried.valid, true);
  assert.deepEqual(retried.legs[0].coordinates, coordinates);
  assert.equal(calls.filter(url => url.endsWith('/legs/start.json.gz')).length, 2);
});

test('gzip transport still rejects malformed JSON and stale data, then permits a corrected response', async () => {
  let content = 'invalid-json';
  const { provider, calls } = compressedFixture(value => gzipSync(content === 'valid' ? JSON.stringify(value) : content));
  await assert.rejects(provider.route(['start', 'finish']), SyntaxError);
  content = JSON.stringify({ version: 'stale', fromId: 'start', legs: { finish: { shape } } });
  await assert.rejects(provider.route(['start', 'finish']), /새로고침/);
  content = 'valid';
  assert.equal((await provider.route(['start', 'finish'])).valid, true);
  assert.equal(calls.filter(url => url.endsWith('/legs/start.json.gz')).length, 3);
});
