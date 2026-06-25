'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import type { ProblemArea } from '@/types';

export default function OnboardingPage() {
  const router = useRouter();
  const done = useRef(false);

  const handleComplete = async ({
    problemAreas,
    workIntervalMinutes,
  }: {
    problemAreas: ProblemArea[];
    workIntervalMinutes: number;
  }) => {
    done.current = true;
    try {
      const { db, DEFAULT_PREFERENCES } = await import('@/lib/db');
      const now = new Date().toISOString();
      await db.preferences.put({
        ...DEFAULT_PREFERENCES,
        id: 1,
        problemAreas,
        workIntervalMinutes,
        onboardingCompleted: true,
        createdAt: now,
        updatedAt: now,
      });
    } catch {
      // IDB unavailable — navigate anyway
    }
    router.replace('/work');
  };

  return <OnboardingFlow onComplete={handleComplete} />;
}
