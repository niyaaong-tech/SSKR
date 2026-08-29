(() => {
  const STORAGE_KEY = "sskr.mock.accountLinked";
  const PROVIDER_KEY = "sskr.mock.accountProvider";
  const accountOverride = new URLSearchParams(window.location.search).get("mockAccount");

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
      if (accountOverride === "linked") return true;
      if (accountOverride === "unlinked") return false;
      return read(STORAGE_KEY) === "true";
    },

    getLinkedProvider() {
      return read(PROVIDER_KEY);
    },

    linkAccount(provider) {
      write(STORAGE_KEY, "true");
      write(PROVIDER_KEY, provider);
    },

    reset() {
      remove(STORAGE_KEY);
      remove(PROVIDER_KEY);
    }
  });
})();
