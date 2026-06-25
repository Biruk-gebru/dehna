'use client';

import { useState, useEffect, useCallback } from 'react';
import { db, DEFAULT_PREFERENCES } from '@/lib/db';
import type { UserPreferences } from '@/types';

export function usePreferences() {
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
      if (existing) {
        const updated = { ...existing, ...updates, updatedAt: now };
        await db.preferences.put(updated);
        setPrefs(updated);
      } else {
        const base = { ...DEFAULT_PREFERENCES, createdAt: now, updatedAt: now };
        const fresh = { ...base, ...updates };
        await db.preferences.put(fresh);
        setPrefs(fresh);
      }
    },
    [],
  );

  return { prefs, loading, updatePrefs };
}
