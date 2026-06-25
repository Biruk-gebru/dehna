'use client';

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!promptEvent || dismissed) return null;

  const install = async () => {
    await promptEvent.prompt();
    await promptEvent.userChoice;
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
          Add to your home screen for quick access.
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <button className="btn btn-primary btn-sm" onClick={install}>
          Install
        </button>
        <button className="btn btn-ghost btn-sm" onClick={() => setDismissed(true)}>
          Not now
        </button>
      </div>
    </div>
  );
}
