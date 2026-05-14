import { useState, useEffect, useCallback } from 'react';

const PROFILES_KEY = 'sim_profiles';
const ACTIVE_KEY = 'sim_active_profile';
const LEGACY_SYMBOLS_KEY = 'sim_symbols';
const LEGACY_CONFIG_KEY = 'sim_config';

const DEFAULT_CONFIG = { contribution: 100, duration: '1Y' };

// Unique id — crypto.randomUUID on modern browsers, simple fallback otherwise.
const genId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
};

// Normalize a config object to the current shape, dropping any legacy fields (e.g. startDate).
const normalizeConfig = (raw) => ({
  contribution: raw?.contribution ?? DEFAULT_CONFIG.contribution,
  duration: raw?.duration ?? DEFAULT_CONFIG.duration,
});

// Load profiles + active id from localStorage, migrating from the legacy keys if needed.
const loadInitialState = () => {
  let profiles = null;
  try {
    const savedProfiles = localStorage.getItem(PROFILES_KEY);
    if (savedProfiles) {
      const parsed = JSON.parse(savedProfiles);
      if (Array.isArray(parsed) && parsed.length > 0) {
        profiles = parsed;
      }
    }
  } catch {
    profiles = null;
  }

  // Migration: build a "Default" profile from legacy keys.
  if (!profiles) {
    let legacySymbols = [];
    let legacyConfig = {};
    try {
      const s = localStorage.getItem(LEGACY_SYMBOLS_KEY);
      if (s) legacySymbols = JSON.parse(s) || [];
    } catch {
      legacySymbols = [];
    }
    try {
      const c = localStorage.getItem(LEGACY_CONFIG_KEY);
      if (c) legacyConfig = JSON.parse(c) || {};
    } catch {
      legacyConfig = {};
    }

    profiles = [{
      id: genId(),
      name: 'Default',
      symbols: Array.isArray(legacySymbols) ? legacySymbols : [],
      config: normalizeConfig(legacyConfig),
    }];
    // NOTE: legacy keys are NOT removed here — this initializer must stay PURE
    // (read-only). React StrictMode double-invokes state initializers in dev;
    // a write here would cause the second invocation to see empty data.
    // Cleanup happens in a mount-time useEffect below.
  }

  // Resolve active id, falling back to the first profile if missing/corrupt.
  let activeProfileId = localStorage.getItem(ACTIVE_KEY);
  if (!activeProfileId || !profiles.some(p => p.id === activeProfileId)) {
    activeProfileId = profiles[0].id;
  }

  return { profiles, activeProfileId };
};

export function useProfiles() {
  const [{ profiles, activeProfileId }, setState] = useState(loadInitialState);

  // One-time cleanup of legacy keys. The pure initializer has already built the
  // profiles from this legacy data; removeItem is idempotent so a StrictMode
  // double-invoke of this effect is harmless.
  useEffect(() => {
    localStorage.removeItem(LEGACY_SYMBOLS_KEY);
    localStorage.removeItem(LEGACY_CONFIG_KEY);
  }, []);

  // Persist on change.
  useEffect(() => {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    localStorage.setItem(ACTIVE_KEY, activeProfileId);
  }, [activeProfileId]);

  const activeProfile =
    profiles.find(p => p.id === activeProfileId) || profiles[0];

  const setActiveProfile = useCallback((id) => {
    setState(prev =>
      prev.profiles.some(p => p.id === id)
        ? { ...prev, activeProfileId: id }
        : prev
    );
  }, []);

  const createProfile = useCallback((name) => {
    const id = genId();
    const newProfile = {
      id,
      name: name && name.trim() ? name.trim() : 'New Profile',
      symbols: [],
      config: { ...DEFAULT_CONFIG },
    };
    setState(prev => ({
      profiles: [...prev.profiles, newProfile],
      activeProfileId: id,
    }));
  }, []);

  const renameProfile = useCallback((id, name) => {
    if (!name || !name.trim()) return;
    setState(prev => ({
      ...prev,
      profiles: prev.profiles.map(p =>
        p.id === id ? { ...p, name: name.trim() } : p
      ),
    }));
  }, []);

  const deleteProfile = useCallback((id) => {
    setState(prev => {
      if (prev.profiles.length <= 1) return prev; // never remove the last profile
      const remaining = prev.profiles.filter(p => p.id !== id);
      const activeProfileId =
        prev.activeProfileId === id ? remaining[0].id : prev.activeProfileId;
      return { profiles: remaining, activeProfileId };
    });
  }, []);

  // Shallow-merge a patch into the active profile.
  // `patch` may be an object or a function (currentProfile) => patchObject.
  const updateActiveProfile = useCallback((patch) => {
    setState(prev => ({
      ...prev,
      profiles: prev.profiles.map(p => {
        if (p.id !== prev.activeProfileId) return p;
        const resolved = typeof patch === 'function' ? patch(p) : patch;
        return { ...p, ...resolved };
      }),
    }));
  }, []);

  return {
    profiles,
    activeProfile,
    activeProfileId,
    setActiveProfile,
    createProfile,
    renameProfile,
    deleteProfile,
    updateActiveProfile,
  };
}

export default useProfiles;
