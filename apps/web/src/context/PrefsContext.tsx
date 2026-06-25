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
    db.preferences
      .get(1)
      .then((existing) => {
        if (existing) {
          setPrefs(existing);
        } else {
          const now = new Date().toISOString();
          setPrefs({ ...DEFAULT_PREFERENCES, createdAt: now, updatedAt: now });
        }
      })
      .catch(() => {
        const now = new Date().toISOString();
        setPrefs({ ...DEFAULT_PREFERENCES, createdAt: now, updatedAt: now });
      })
      .finally(() => setLoading(false));
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
