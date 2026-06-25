'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import { usePreferences } from '@/hooks/usePreferences';
import type { OnboardingData } from '@/components/onboarding/OnboardingFlow';

export default function OnboardingPage() {
  const router = useRouter();
  const { prefs, loading, updatePrefs } = usePreferences();

  useEffect(() => {
    if (!loading && prefs?.onboardingCompleted) {
      router.replace('/work');
    }
  }, [loading, prefs, router]);

  if (loading || prefs?.onboardingCompleted) {
    return <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)' }} aria-hidden="true" />;
  }

  const handleComplete = async ({ problemAreas, workIntervalMinutes, exerciseDifficulty }: OnboardingData) => {
    await updatePrefs({ problemAreas, workIntervalMinutes, exerciseDifficulty, onboardingCompleted: true });
    router.replace('/work');
  };

  return <OnboardingFlow onComplete={handleComplete} />;
}
