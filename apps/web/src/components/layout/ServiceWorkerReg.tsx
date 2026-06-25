'use client';

import { useEffect } from 'react';

export function ServiceWorkerReg() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    if (process.env.NODE_ENV !== 'production') {
      // Unregister any SW left over from a previous dev session — they
      // intercept HMR WebSocket connections and cause the infinite loading spinner.
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((r) => r.unregister());
      });
      return;
    }

    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }, []);

  return null;
}
