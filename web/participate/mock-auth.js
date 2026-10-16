(() => {
  const STORAGE_KEY = "sskr.mock.accountLinked";
  const PROVIDER_KEY = "sskr.mock.accountProvider";
  let accountOverride = new URLSearchParams(window.location.search).get("mockAccount");

  const read = (key) => {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  };

  const write = (key, value) => {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Storage can be unavailable in restricted browsing contexts.
    }
  };

  const remove = (key) => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Keep the adapter usable even when persistent storage is unavailable.
    }
  };

  window.SSKR_ACCOUNT_LINK = Object.freeze({
    isAccountLinked() {
      if (window.SSKR_BACKEND?.mode === 'supabase') return window.SSKR_BACKEND.account?.linked === true;
      if (accountOverride === "linked") return true;
      if (accountOverride === "unlinked") return false;
      return read(STORAGE_KEY) === "true";
    },

    getLinkedProvider() {
      if (window.SSKR_BACKEND?.mode === 'supabase') return window.SSKR_BACKEND.account?.provider || null;
      return read(PROVIDER_KEY);
    },

    getSession() {
      return { linked: this.isAccountLinked(), provider: this.getLinkedProvider() };
    },

    linkAccount(provider) {
      window.SSKR_AUTH_PROVIDERS.assertEnabled(provider);
      if (window.SSKR_BACKEND?.mode === 'supabase') return window.SSKR_BACKEND.request('login', 'POST', { returnTo: location.pathname + location.search }).then(result => { location.assign(result.url); return new Promise(() => {}); });
      accountOverride = "linked";
      write(STORAGE_KEY, "true");
      write(PROVIDER_KEY, provider);
    },

    reset() {
      accountOverride = "unlinked";
      remove(STORAGE_KEY);
      remove(PROVIDER_KEY);
    },

    logout() {
      if (window.SSKR_BACKEND?.mode === 'supabase') return window.SSKR_BACKEND.request('logout', 'POST', {}).then(() => { window.SSKR_BACKEND.account = null; window.SSKR_REMOTE_ROUTES?.clear(); });
      this.reset();
    }
  });
})();
