'use client';

import { useState } from 'react';
import { db, DEFAULT_PREFERENCES } from '@/lib/db';
import type { ProblemArea } from '@/types';
import { ProblemAreaPicker } from './ProblemAreaPicker';
import { IntervalSelector } from './IntervalSelector';
import { Button } from '@/components/ui/Button';

interface OnboardingFlowProps {
  onComplete: () => void;
}

type Step = 'welcome' | 'areas' | 'interval';

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState<Step>('welcome');
  const [areas, setAreas] = useState<ProblemArea[]>(['general']);
  const [interval, setInterval] = useState(25);

  const save = async () => {
    const now = new Date().toISOString();
    await db.preferences.put({
      ...DEFAULT_PREFERENCES,
      problemAreas: areas.length > 0 ? areas : ['general'],
      workIntervalMinutes: interval,
      onboardingCompleted: true,
      createdAt: now,
      updatedAt: now,
    });
    onComplete();
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

  if (step === 'welcome') {
    return (
      <main style={sharedLayout}>
        <div style={{ textAlign: 'center' }}>
          <h1
            style={{
              fontSize: '4rem',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--color-text)',
              lineHeight: 'var(--line-height-tight)',
            }}
          >
            ደህና
          </h1>
          <p
            style={{
              fontSize: 'var(--font-size-lg)',
              color: 'var(--color-text-muted)',
              marginTop: 'var(--space-3)',
              fontWeight: 'var(--font-weight-light)',
            }}
          >
            Be well at your desk.
          </p>
        </div>
        <p
          style={{
            fontSize: 'var(--font-size-base)',
            color: 'var(--color-text-muted)',
            textAlign: 'center',
            maxWidth: 360,
            lineHeight: 'var(--line-height-relaxed)',
          }}
        >
          Short movement breaks, tailored to how your body feels — so every pause actually helps.
        </p>
        <Button onClick={() => setStep('areas')} style={{ minWidth: 180 }}>
          Get started
        </Button>
      </main>
    );
  }

  if (step === 'areas') {
    return (
      <main style={sharedLayout}>
        <div style={{ textAlign: 'center' }}>
          <h2
            style={{
              fontSize: 'var(--font-size-xl)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--color-text)',
            }}
          >
            What would you like to work on?
          </h2>
          <p
            style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-muted)',
              marginTop: 'var(--space-2)',
            }}
          >
            Exercises for your selected areas will be prioritized during breaks.
          </p>
        </div>
        <ProblemAreaPicker selected={areas} onChange={setAreas} />
        <Button
          onClick={() => setStep('interval')}
          disabled={areas.length === 0}
          style={{ minWidth: 160 }}
        >
          Continue
        </Button>
      </main>
    );
  }

  return (
    <main style={sharedLayout}>
      <div style={{ textAlign: 'center' }}>
        <h2
          style={{
            fontSize: 'var(--font-size-xl)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--color-text)',
          }}
        >
          How long do you want to focus?
        </h2>
        <p
          style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-muted)',
            marginTop: 'var(--space-2)',
          }}
        >
          You can change this anytime in settings.
        </p>
      </div>
      <IntervalSelector value={interval} onChange={setInterval} />
      <Button onClick={save} style={{ minWidth: 180 }}>
        Start working
      </Button>
    </main>
  );
}
