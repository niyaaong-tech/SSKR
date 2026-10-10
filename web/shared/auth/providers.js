(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SSKR_AUTH_PROVIDERS = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, () => {
  // Opening another provider requires its verification and account-linking QA first.
  const providers = Object.freeze([
    Object.freeze({ id: 'google', label: 'Google', enabled: true }),
    Object.freeze({ id: 'naver', label: '네이버', enabled: false }),
    Object.freeze({ id: 'kakao', label: '카카오', enabled: false }),
    Object.freeze({ id: 'apple', label: 'Apple', enabled: false })
  ]);
  const isEnabled = id => providers.some(provider => provider.id === id && provider.enabled);
  function assertEnabled(id) {
    if (isEnabled(id)) return;
    const error = new Error('현재 Google로만 로그인할 수 있습니다.');
    error.code = 'AUTH_PROVIDER_DISABLED';
    throw error;
  }
  return Object.freeze({ providers, isEnabled, assertEnabled });
});
