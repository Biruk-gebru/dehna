'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import type { ProblemArea } from '@/types';

export default function Home() {
  const router = useRouter();
  const done = useRef(false);

  useEffect(() => {
    import('@/lib/db')
      .then(({ db }) =>
        db.preferences.get(1).then((prefs) => {
          if (prefs?.onboardingCompleted && !done.current) {
            done.current = true;
            router.replace('/work');
          }
        }),
      )
      .catch(() => {});
  }, [router]);

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
