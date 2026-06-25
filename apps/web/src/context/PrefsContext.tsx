'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
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

    // Bail after 3 s if IDB hangs (can happen on Safari first access).
    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true;
        setLoading(false);
      }
    }, 3000);

    import('@/lib/db')
      .then(({ db, DEFAULT_PREFERENCES }) => {
        return db.preferences.get(1).then((existing) => {
          if (settled) return;
          settled = true;
          clearTimeout(timeout);
          const now = new Date().toISOString();
          setPrefs(existing ?? { ...DEFAULT_PREFERENCES, createdAt: now, updatedAt: now });
          setLoading(false);
        });
      })
      .catch(() => {
        if (!settled) {
          settled = true;
          clearTimeout(timeout);
          setLoading(false);
        }
      });

    return () => {
      settled = true;
      clearTimeout(timeout);
    };
  }, []);

  const updatePrefs = useCallback(
    async (updates: Partial<Omit<UserPreferences, 'id' | 'createdAt'>>) => {
      const now = new Date().toISOString();
      const { db, DEFAULT_PREFERENCES } = await import('@/lib/db');
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
