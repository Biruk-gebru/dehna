'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'dehna-install-dismissed-at';
const QUIET_MS = 21 * 24 * 60 * 60 * 1000; // "Not now" holds for three weeks
const HIDDEN_ON = ['/', '/onboarding'];

function recentlyDismissed() {
  try {
    return Date.now() - Number(localStorage.getItem(DISMISS_KEY) ?? 0) < QUIET_MS;
  } catch {
    return false;
  }
}

export function InstallPrompt() {
  const pathname = usePathname();
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  // Only worth offering once someone has actually used the timer
  const [hasFinishedSession, setHasFinishedSession] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
    };
    const installed = () => setDismissed(true);
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installed);
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installed);
    };
  }, []);

  // Re-checked on navigation, so it can appear after the first session ends
  useEffect(() => {
    if (!promptEvent || recentlyDismissed()) return;
    import('@/lib/db')
      .then(({ db }) => db.sessions.where('status').equals('completed').count())
      .then((n) => setHasFinishedSession(n > 0))
      .catch(() => {});
  }, [promptEvent, pathname]);

  if (!promptEvent || dismissed || !hasFinishedSession || HIDDEN_ON.includes(pathname) || recentlyDismissed()) return null;

  const install = async () => {
    await promptEvent.prompt();
    await promptEvent.userChoice;
    setDismissed(true);
  };

  const notNow = () => {
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch {}
    setDismissed(true);
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 'var(--space-5)',
        left: 'var(--space-5)',
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-4)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-4)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.07)',
        maxWidth: 300,
        zIndex: 50,
      }}
    >
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text)' }}>
          Install Dehna
        </p>
        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>
          Opens in its own window, one click from your dock or home screen.
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <button className="btn btn-primary btn-sm" onClick={install}>
          Install
        </button>
        <button className="btn btn-ghost btn-sm" onClick={notNow}>
          Not now
        </button>
      </div>
    </div>
  );
}
