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
      if (!settled) { settled = true; setLoading(false); }
    }, 3000);

    import('@/lib/db')
      .then(async ({ db, DEFAULT_PREFERENCES }) => {
        if (settled) return;

        // Mark any stale active sessions (older than 12 h) as abandoned
        const cutoff = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
        const stale = await db.sessions
          .where('status').equals('active')
          .filter((s) => s.startedAt < cutoff)
          .toArray();
        await Promise.all(
          stale.map((s) =>
            db.sessions.update(s.id as number, {
              status: 'abandoned',
              endedAt: new Date().toISOString(),
              durationMinutes: Math.floor((Date.now() - new Date(s.startedAt).getTime()) / 60000),
            }),
          ),
        );

        const existing = await db.preferences.get(1);
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        const now = new Date().toISOString();
        setPrefs(existing ?? { ...DEFAULT_PREFERENCES, createdAt: now, updatedAt: now });
        setLoading(false);
      })
      .catch(() => {
        if (!settled) { settled = true; clearTimeout(timeout); setLoading(false); }
      });

    return () => { settled = true; clearTimeout(timeout); };
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
