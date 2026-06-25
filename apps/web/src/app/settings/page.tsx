'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePreferences } from '@/hooks/usePreferences';
import { ProblemAreaPicker } from '@/components/onboarding/ProblemAreaPicker';
import { IntervalSelector } from '@/components/onboarding/IntervalSelector';
import { Button } from '@/components/ui/Button';
import { clearAllData, exportData, importData } from '@/lib/storage';
import type { ProblemArea, Theme } from '@/types';

const THEMES: { id: Theme; label: string; bg: string; accent: string }[] = [
  { id: 'earth-terracotta', label: 'Earth', bg: '#edebe6', accent: '#d3643b' },
  { id: 'sage-coral',       label: 'Sage',  bg: '#f8f6f2', accent: '#e84a5f' },
  { id: 'warm-clay',        label: 'Clay',  bg: '#f5efe7', accent: '#a39081' },
  { id: 'studio',           label: 'Studio',bg: '#faf5ee', accent: '#fa6a64' },
];

export default function SettingsPage() {
  const { prefs, loading, updatePrefs } = usePreferences();
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (loading || !prefs) {
    return <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)' }} aria-hidden="true" />;
  }

  const save = async (changes: Parameters<typeof updatePrefs>[0]) => {
    await updatePrefs(changes);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const handleClear = async () => {
    if (!window.confirm('Clear all data? This cannot be undone.')) return;
    await clearAllData();
    router.replace('/');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importData(file);
      window.location.reload();
    } catch {
      alert('Could not import — make sure this is a valid Dehna backup file.');
    }
  };

  const sectionStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-4)',
    paddingBottom: 'var(--space-6)',
    borderBottom: '1px solid var(--color-border)',
  };

  const headingStyle: React.CSSProperties = {
    fontSize: 'var(--font-size-base)',
    fontWeight: 'var(--font-weight-medium)',
    color: 'var(--color-text)',
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg)',
        padding: 'var(--space-7) var(--space-6)',
        maxWidth: 560,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-6)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text)' }}>
          Settings
        </h1>
        <Link href="/work" className="btn btn-ghost btn-sm">← Back</Link>
      </div>

      {/* Work interval */}
      <section style={sectionStyle}>
        <h2 style={headingStyle}>Focus interval</h2>
        <IntervalSelector
          value={prefs.workIntervalMinutes}
          onChange={(v) => save({ workIntervalMinutes: v })}
        />
      </section>

      {/* Break duration */}
      <section style={sectionStyle}>
        <h2 style={headingStyle}>Break duration</h2>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div
            style={{
              textAlign: 'center',
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--font-size-xl)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text)',
              marginBottom: 'var(--space-5)',
            }}
          >
            {prefs.breakDurationMinutes} min
          </div>
          <input
            type="range"
            className="range-input"
            min={3}
            max={15}
            step={1}
            value={prefs.breakDurationMinutes}
            onChange={(e) => save({ breakDurationMinutes: Number(e.target.value) })}
            aria-label="Break duration in minutes"
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-2)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
            <span>3 min</span>
            <span>15 min</span>
          </div>
        </div>
      </section>

      {/* Problem areas */}
      <section style={sectionStyle}>
        <h2 style={headingStyle}>Problem areas</h2>
        <ProblemAreaPicker
          selected={prefs.problemAreas as ProblemArea[]}
          onChange={(areas) => save({ problemAreas: areas })}
        />
      </section>

      {/* Difficulty */}
      <section style={sectionStyle}>
        <h2 style={headingStyle}>Exercise intensity</h2>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          {(['gentle', 'moderate'] as const).map((d) => (
            <button
              key={d}
              className={`area-card${prefs.exerciseDifficulty === d ? ' selected' : ''}`}
              onClick={() => save({ exerciseDifficulty: d })}
              type="button"
              style={{ flex: 1 }}
            >
              <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Theme */}
      <section style={sectionStyle}>
        <h2 style={headingStyle}>Theme</h2>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => save({ theme: t.id })}
              type="button"
              aria-pressed={prefs.theme === t.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-md)',
                border: `1.5px solid ${prefs.theme === t.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                background: t.bg,
                cursor: 'pointer',
                transition: 'border-color 0.15s',
                minWidth: 72,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: t.accent,
                }}
              />
              <span style={{ fontSize: 'var(--font-size-xs)', color: '#403b33', fontWeight: 'var(--font-weight-medium)' }}>
                {t.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Notifications */}
      <section style={sectionStyle}>
        <h2 style={headingStyle}>Notifications</h2>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            maxWidth: 400,
          }}
        >
          <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text)' }}>
            Notify when break starts
          </span>
          <input
            type="checkbox"
            checked={prefs.notificationsEnabled}
            onChange={(e) => save({ notificationsEnabled: e.target.checked })}
            style={{ width: 18, height: 18, accentColor: 'var(--color-primary)', cursor: 'pointer' }}
          />
        </label>
      </section>

      {/* Data */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <h2 style={headingStyle}>Data</h2>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <Button variant="outline" size="sm" onClick={exportData}>
            Export backup
          </Button>
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            Import backup
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: 'none' }}
          />
        </div>
        <div style={{ marginTop: 'var(--space-2)' }}>
          <Button variant="ghost" size="sm" onClick={handleClear}>
            Clear all data
          </Button>
        </div>
      </section>

      {saved && (
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-success)', marginTop: 'var(--space-2)' }}>
          Saved.
        </p>
      )}
    </main>
  );
}
