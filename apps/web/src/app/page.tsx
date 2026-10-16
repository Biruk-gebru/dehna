'use client';

import Link from 'next/link';
import { usePreferences } from '@/hooks/usePreferences';
import { HomeDemo } from '@/components/home/HomeDemo';
import { WhereItHurts } from '@/components/home/WhereItHurts';
import { DayTimeline } from '@/components/home/DayTimeline';
import { useInView } from '@/components/home/useInView';
import { FigureRig, type Clip, type Pose } from '@/components/exercise/FigureRig';

const WAVE_ARM = { e: 158, a: 10, r: 0.85, pe: 90, pa: -90, hf: 1, pron: 90, grip: 0.2 };
const WAVE: Clip = {
  yaw: 10,
  poses: [
    ...[0, 1, 0, 1, 0, 1].map((i): Pose => ({
      target: { armR: { ...WAVE_ARM, he: 165, ha: i ? 40 : -20 }, face: { smile: 0.9, brow: 0.4 }, head: { tilt: i ? 4 : -2 } },
      durationMs: 340,
    })),
    { target: { face: { smile: 0.6, brow: 0.2 } }, durationMs: 2200 },
  ],
};

function Wave() {
  const [ref, inView] = useInView<HTMLDivElement>();
  return <div ref={ref}><FigureRig clip={WAVE} static={!inView} size={180} /></div>;
}

export default function Home() {
  const { prefs } = usePreferences();
  const returning = prefs?.onboardingCompleted ?? false;
  const startHref = returning ? '/work' : '/onboarding';
  const startLabel = returning ? 'Back to work' : 'Get started';

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)', display: 'flex', flexDirection: 'column' }}>
      <nav className="home-nav">
        <span style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-size-lg)', color: 'var(--color-text)' }}>
          ደህና
        </span>
        <div style={{ display: 'flex', gap: 'var(--space-5)', alignItems: 'center', fontSize: 'var(--font-size-sm)' }}>
          <Link href="/exercises" className="home-link">Exercises</Link>
          <Link href={startHref} className="home-link home-link-strong">{startLabel}</Link>
        </div>
      </nav>

      <section className="home-hero">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <h1 className="home-h1">
            A desk buddy who <em>gets you moving.</em>
          </h1>
          <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-muted)', lineHeight: 'var(--line-height-relaxed)', maxWidth: 430 }}>
            Dehna works next to you. Every half hour it stops, stretches, and brings you along
            for two to five minutes: neck, back, wrists, eyes. Then it&apos;s back to work.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-5)', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link href={startHref} className="btn btn-primary" style={{ padding: '14px 32px' }}>{startLabel}</Link>
            <Link href="/exercises" className="home-link">See all 40 moves →</Link>
          </div>
        </div>
        <HomeDemo />
      </section>

      <WhereItHurts />
      <DayTimeline />

      <section className="home-close">
        <Wave />
        <div>
          <h2 className="home-h2">Free, and it stays on your device.</h2>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--line-height-relaxed)', maxWidth: 420, marginTop: 'var(--space-3)' }}>
            No account, no sign-up, no tracking. Your sessions live in this browser and you can
            export or wipe them from Settings whenever you like.
          </p>
          <Link href={startHref} className="btn btn-primary" style={{ padding: '14px 32px', marginTop: 'var(--space-5)' }}>
            {startLabel}
          </Link>
        </div>
      </section>

      <footer style={{ padding: 'var(--space-6) 24px', textAlign: 'center', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
        ደህና means &ldquo;be well&rdquo; in Amharic.
      </footer>
    </main>
  );
}
