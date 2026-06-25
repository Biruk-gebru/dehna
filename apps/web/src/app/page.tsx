'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import { db, DEFAULT_PREFERENCES } from '@/lib/db';

export default function Home() {
  const router = useRouter();
  const done = useRef(false);

  useEffect(() => {
    db.preferences
      .get(1)
      .then((prefs) => {
        if (prefs?.onboardingCompleted && !done.current) {
          done.current = true;
          router.replace('/work');
        }
      })
      .catch(() => {});
  }, [router]);

  return (
    <OnboardingFlow
      onComplete={async ({ problemAreas, workIntervalMinutes }) => {
        done.current = true;
        const now = new Date().toISOString();
        try {
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
          // IDB unavailable — prefs won't persist but navigation still works
        }
        router.replace('/work');
      }}
    />
  );
}
