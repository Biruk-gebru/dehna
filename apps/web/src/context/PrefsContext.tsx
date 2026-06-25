'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { db, DEFAULT_PREFERENCES } from '@/lib/db';
import type { UserPreferences } from '@/types';

interface PrefsContextValue {
  prefs: UserPreferences | null;
  loading: boolean;
  updatePrefs: (updates: Partial<Omit<UserPreferences, 'id' | 'createdAt'>>) => Promise<void>;
}

const PrefsContext = createContext<PrefsContextValue | null>(null);

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let settled = false;

    const resolve = (existing?: UserPreferences) => {
      if (settled) return;
      settled = true;
      const now = new Date().toISOString();
      setPrefs(existing ?? { ...DEFAULT_PREFERENCES, createdAt: now, updatedAt: now });
      setLoading(false);
    };

    // Safari's IndexedDB can hang silently on first access; bail after 3 s.
    const timeout = setTimeout(() => resolve(), 3000);

    db.preferences
      .get(1)
      .then((existing) => resolve(existing))
      .catch(() => resolve())
      .finally(() => clearTimeout(timeout));

    return () => {
      settled = true;
      clearTimeout(timeout);
    };
  }, []);

  const updatePrefs = useCallback(
    async (updates: Partial<Omit<UserPreferences, 'id' | 'createdAt'>>) => {
      const now = new Date().toISOString();
      const existing = await db.preferences.get(1);
      const base = existing ?? { ...DEFAULT_PREFERENCES, createdAt: now };
      const updated = { ...base, ...updates, updatedAt: now };
      await db.preferences.put(updated);
      setPrefs(updated);
    },
    [],
  );

  return (
    <PrefsContext.Provider value={{ prefs, loading, updatePrefs }}>
      {children}
    </PrefsContext.Provider>
  );
}

export function usePreferences() {
  const ctx = useContext(PrefsContext);
  if (!ctx) throw new Error('usePreferences must be used inside PrefsProvider');
  return ctx;
}
