'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePreferences } from '@/hooks/usePreferences';
import { ProblemAreaPicker } from '@/components/onboarding/ProblemAreaPicker';
import { IntervalSelector } from '@/components/onboarding/IntervalSelector';
import { Button } from '@/components/ui/Button';
import { clearAllData } from '@/lib/storage';
import type { ProblemArea } from '@/types';

export default function SettingsPage() {
  const { prefs, loading, updatePrefs } = usePreferences();
  const router = useRouter();
  const [saved, setSaved] = useState(false);

  if (loading || !prefs) {
    return <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)' }} aria-hidden="true" />;
  }

  const save = async (changes: Parameters<typeof updatePrefs>[0]) => {
    await updatePrefs(changes);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClear = async () => {
    if (!window.confirm('Clear all data? This cannot be undone.')) return;
    await clearAllData();
    router.replace('/');
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg)',
        display: 'flex',
        flexDirection: 'column',
        padding: 'var(--space-7) var(--space-6)',
        maxWidth: 560,
        margin: '0 auto',
        gap: 'var(--space-7)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1
          style={{
            fontSize: 'var(--font-size-xl)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--color-text)',
          }}
        >
          Settings
        </h1>
        <Link href="/work" className="btn btn-ghost btn-sm">
          ← Back
        </Link>
      </div>

      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <h2 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text)' }}>
          Focus interval
        </h2>
        <IntervalSelector
          value={prefs.workIntervalMinutes}
          onChange={(v) => save({ workIntervalMinutes: v })}
        />
      </section>

      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <h2 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text)' }}>
          Problem areas
        </h2>
        <ProblemAreaPicker
          selected={prefs.problemAreas as ProblemArea[]}
          onChange={(areas) => save({ problemAreas: areas })}
        />
      </section>

      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <h2 style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text)' }}>
          Theme
        </h2>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          {(['earth-terracotta', 'sage-coral', 'warm-clay', 'studio'] as const).map((t) => (
            <button
              key={t}
              className={`area-card${prefs.theme === t ? ' selected' : ''}`}
              onClick={() => save({ theme: t })}
              type="button"
              style={{ minWidth: 120 }}
            >
              <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                {t.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              </span>
            </button>
          ))}
        </div>
      </section>

      {saved && (
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-success)' }}>
          Saved.
        </p>
      )}

      <div style={{ marginTop: 'auto' }}>
        <Button variant="ghost" size="sm" onClick={handleClear}>
          Clear all data
        </Button>
      </div>
    </main>
  );
}
