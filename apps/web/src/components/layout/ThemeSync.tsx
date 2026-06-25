'use client';

import { useEffect } from 'react';
import { usePreferences } from '@/hooks/usePreferences';

export function ThemeSync() {
  const { prefs } = usePreferences();

  useEffect(() => {
    if (prefs?.theme) {
      document.documentElement.setAttribute('data-theme', prefs.theme);
    }
  }, [prefs?.theme]);

  return null;
}
