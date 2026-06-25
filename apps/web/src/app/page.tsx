'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';

export default function Home() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    db.preferences
      .get(1)
      .then((prefs) => {
        if (prefs?.onboardingCompleted) {
          router.replace('/work');
        } else {
          setNeedsOnboarding(true);
          setReady(true);
        }
      })
      .catch(() => {
        setNeedsOnboarding(true);
        setReady(true);
      });
  }, [router]);

  if (!ready) {
    return (
      <div
        style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}
        aria-hidden="true"
      />
    );
  }

  if (needsOnboarding) {
    return <OnboardingFlow onComplete={() => router.replace('/work')} />;
  }

  return null;
}
