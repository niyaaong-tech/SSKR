const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const policy = require('../../web/shared/auth/providers');

test('only Google can start a new login; unknown providers fail closed', () => {
  assert.deepEqual(policy.providers.filter(provider => provider.enabled).map(provider => provider.id), ['google']);
  for (const provider of ['naver', 'kakao', 'apple', 'mock', '', null, undefined, '__proto__']) {
    assert.equal(policy.isEnabled(provider), false);
    assert.throws(() => policy.assertEnabled(provider), { code: 'AUTH_PROVIDER_DISABLED' });
  }
  assert.doesNotThrow(() => policy.assertEnabled('google'));
});

function adapter() {
  const values = new Map();
  const window = { location: { search: '' }, SSKR_AUTH_PROVIDERS: policy, localStorage: {
    getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key)
  } };
  vm.runInNewContext(fs.readFileSync(path.resolve(__dirname, '../../web/participate/mock-auth.js'), 'utf8'), { window, URLSearchParams });
  return { auth: window.SSKR_ACCOUNT_LINK, values };
}

test('blocked provider calls cannot create or change a mock session', () => {
  const { auth, values } = adapter();
  for (const provider of ['naver', 'kakao', 'apple']) assert.throws(() => auth.linkAccount(provider), { code: 'AUTH_PROVIDER_DISABLED' });
  assert.equal(auth.isAccountLinked(), false);
  assert.equal(values.size, 0);
  auth.linkAccount('google');
  const before = [...values];
  assert.throws(() => auth.linkAccount('naver'), { code: 'AUTH_PROVIDER_DISABLED' });
  assert.deepEqual([...values], before);
  assert.equal(auth.getLinkedProvider(), 'google');
  auth.logout();
  assert.equal(auth.isAccountLinked(), false);
});

test('disabling new social logins does not destroy an existing mock account', () => {
  const { auth, values } = adapter();
  values.set('sskr.mock.accountLinked', 'true');
  values.set('sskr.mock.accountProvider', 'kakao');
  assert.equal(auth.isAccountLinked(), true);
  assert.equal(auth.getLinkedProvider(), 'kakao');
  assert.throws(() => auth.linkAccount('kakao'), { code: 'AUTH_PROVIDER_DISABLED' });
  assert.equal(auth.isAccountLinked(), true);
});
