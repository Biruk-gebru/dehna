'use client';

import { useEffect } from 'react';

export function ServiceWorkerReg() {
  useEffect(() => {
    // Only register in production — the SW caches aggressively and breaks HMR in dev
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  return null;
}
