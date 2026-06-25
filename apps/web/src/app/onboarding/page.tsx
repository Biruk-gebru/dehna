'use client';

import { useRouter } from 'next/navigation';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import { usePreferences } from '@/hooks/usePreferences';
import type { OnboardingData } from '@/components/onboarding/OnboardingFlow';

export default function OnboardingPage() {
  const router = useRouter();
  const { updatePrefs } = usePreferences();

  const handleComplete = async ({ problemAreas, workIntervalMinutes, exerciseDifficulty }: OnboardingData) => {
    await updatePrefs({ problemAreas, workIntervalMinutes, exerciseDifficulty, onboardingCompleted: true });
    router.replace('/work');
  };

  return <OnboardingFlow onComplete={handleComplete} />;
}
