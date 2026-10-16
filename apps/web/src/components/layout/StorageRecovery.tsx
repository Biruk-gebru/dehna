'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { deleteDatabase, exportRawData } from '@/lib/storage';

export function StorageRecovery({ error }: { error: string }) {
  const [saved, setSaved] = useState(false);
  const [failed, setFailed] = useState(false);

  const save = () => exportRawData().then(() => setSaved(true)).catch(() => setFailed(true));

  const startFresh = async () => {
    const msg = saved
      ? 'Delete the saved data on this device and start fresh? You can import your backup file afterwards.'
      : 'You have not downloaded a copy yet. Delete your history on this device anyway?';
    if (!window.confirm(msg)) return;
    await deleteDatabase();
    window.location.reload();
  };

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-6)' }}>
      <div style={{ maxWidth: 440, display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-light)', color: 'var(--color-text)' }}>
          Dehna couldn&apos;t open your saved data
        </h1>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--line-height-relaxed)' }}>
          Your history is still on this device and nothing has been deleted. This can happen when the
          browser&apos;s storage is unavailable (some private windows block it), when the disk is full, or
          when another Dehna tab is busy with the data. Closing other Dehna tabs and trying again often fixes it.
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <Button onClick={save}>{saved ? 'Copy downloaded' : 'Download a copy of my data'}</Button>
          <Button variant="outline" onClick={() => window.location.reload()}>Try again</Button>
        </div>
        {failed && (
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-error)' }}>
            The copy couldn&apos;t be read either. Your data is still untouched, so try again later.
          </p>
        )}
        <div>
          <Button variant="ghost" size="sm" onClick={startFresh}>Start fresh</Button>
        </div>
        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>{error}</p>
      </div>
    </main>
  );
}
