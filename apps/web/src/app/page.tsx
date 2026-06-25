'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePreferences } from '@/hooks/usePreferences';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';

export default function Home() {
  const router = useRouter();
  const { prefs, loading, updatePrefs } = usePreferences();

  useEffect(() => {
    if (!loading && prefs?.onboardingCompleted) {
      router.replace('/work');
    }
  }, [loading, prefs?.onboardingCompleted, router]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg, #edebe6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{ fontSize: '2rem', color: 'var(--color-text-muted, #7a746a)' }}>ደህና</span>
      </div>
    );
  }

  if (prefs?.onboardingCompleted) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg, #edebe6)',
      }} />
    );
  }

  return (
    <OnboardingFlow
      onComplete={async ({ problemAreas, workIntervalMinutes }) => {
        await updatePrefs({ problemAreas, workIntervalMinutes, onboardingCompleted: true });
        router.replace('/work');
      }}
    />
  );
}
