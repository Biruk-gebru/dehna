'use client';

import { useState } from 'react';
import type { ProblemArea } from '@/types';
import { ProblemAreaPicker } from './ProblemAreaPicker';
import { IntervalSelector } from './IntervalSelector';
import { Button } from '@/components/ui/Button';

export interface OnboardingData {
  problemAreas: ProblemArea[];
  workIntervalMinutes: number;
  exerciseDifficulty: 'gentle' | 'moderate';
  hasStandingDesk: boolean;
}

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => Promise<void>;
}

// No welcome step: the landing page already introduces Dehna
type Step = 'areas' | 'interval' | 'desk' | 'difficulty';

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState<Step>('areas');
  const [areas, setAreas]         = useState<ProblemArea[]>(['general']);
  const [interval, setInterval]   = useState(25);
  const [difficulty, setDifficulty] = useState<'gentle' | 'moderate'>('gentle');
  const [standingDesk, setStandingDesk] = useState(false);
  const [saving, setSaving]       = useState(false);

  const save = async () => {
    setSaving(true);
    await onComplete({
      problemAreas: areas.length > 0 ? areas : ['general'],
      workIntervalMinutes: interval,
      exerciseDifficulty: difficulty,
      hasStandingDesk: standingDesk,
    });
  };

  const sharedLayout: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: 'var(--color-bg)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'var(--space-6)',
    gap: 'var(--space-7)',
  };

  if (step === 'areas') {
    return (
      <main style={sharedLayout}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text)' }}>
            What would you like to work on?
          </h2>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
            Exercises for your selected areas will be prioritized during breaks.
          </p>
        </div>
        <ProblemAreaPicker selected={areas} onChange={setAreas} />
        <Button onClick={() => setStep('interval')} disabled={areas.length === 0} style={{ minWidth: 160 }}>
          Continue →
        </Button>
      </main>
    );
  }

  if (step === 'interval') {
    return (
      <main style={sharedLayout}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text)' }}>
            How long do you want to focus?
          </h2>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
            You can change this anytime in settings.
          </p>
        </div>
        <IntervalSelector value={interval} onChange={setInterval} />
        <Button onClick={() => setStep('desk')} style={{ minWidth: 180 }}>
          Continue →
        </Button>
      </main>
    );
  }

  if (step === 'desk') {
    return (
      <main style={sharedLayout}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text)' }}>
            Can your desk go up and down?
          </h2>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
            If it can, we&apos;ll suggest when to stand and when to sit.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-4)', width: '100%', maxWidth: 340 }}>
          {([true, false] as const).map((has) => (
            <button
              key={String(has)}
              type="button"
              className={`area-card${standingDesk === has ? ' selected' : ''}`}
              onClick={() => setStandingDesk(has)}
              style={{ flex: 1 }}
            >
              <span style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)' }}>
                {has ? 'Yes' : 'No'}
              </span>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>
                {has ? 'I have a sit/stand desk' : 'I sit to work'}
              </p>
            </button>
          ))}
        </div>
        <Button onClick={() => setStep('difficulty')} style={{ minWidth: 180 }}>
          Continue →
        </Button>
      </main>
    );
  }

  return (
    <main style={sharedLayout}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text)' }}>
          How should the exercises feel?
        </h2>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
          Gentle is safe for most people. Moderate adds a bit more effort.
        </p>
      </div>
      <div style={{ display: 'flex', gap: 'var(--space-4)', width: '100%', maxWidth: 340 }}>
        {(['gentle', 'moderate'] as const).map((d) => (
          <button
            key={d}
            type="button"
            className={`area-card${difficulty === d ? ' selected' : ''}`}
            onClick={() => setDifficulty(d)}
            style={{ flex: 1 }}
          >
            <span style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)' }}>
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </span>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>
              {d === 'gentle' ? 'Low-impact, chair-friendly' : 'Slightly more demanding'}
            </p>
          </button>
        ))}
      </div>
      <Button onClick={save} disabled={saving} style={{ minWidth: 180 }}>
        {saving ? 'Saving…' : 'Start working'}
      </Button>
    </main>
  );
}
