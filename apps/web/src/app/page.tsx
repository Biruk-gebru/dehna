'use client';

import Link from 'next/link';
import { usePreferences } from '@/hooks/usePreferences';
import { HomeDemo } from '@/components/home/HomeDemo';
import { DeskAvatar } from '@/components/timer/DeskAvatar';

const STEPS = [
  { title: 'Focus', body: 'Pick a block, anywhere from 15 to 60 minutes, and get on with your work.' },
  { title: 'Break', body: 'A chime, then 3 to 5 minutes of stretches and eye breaks. The avatar shows you each move.' },
  { title: 'Repeat', body: 'Exercises rotate, so you are not doing the same neck tilt all afternoon.' },
];

export default function Home() {
  const { prefs } = usePreferences();
  const returning = prefs?.onboardingCompleted ?? false;
  const startHref = returning ? '/work' : '/onboarding';

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', maxWidth: 1080, width: '100%', margin: '0 auto' }}>
        <span style={{ fontWeight: 'var(--font-weight-bold)', fontSize: 'var(--font-size-lg)', color: 'var(--color-text)' }}>
          ደህና
        </span>
        <div style={{ display: 'flex', gap: 'var(--space-5)', alignItems: 'center', fontSize: 'var(--font-size-sm)' }}>
          <Link href="/exercises" className="home-link">Exercises</Link>
          <Link href={startHref} className="home-link home-link-strong">
            {returning ? 'Back to work' : 'Get started'}
          </Link>
        </div>
      </nav>

      <section className="home-hero">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <h1 style={{ fontSize: 'clamp(2.2rem, 6vw, 3.4rem)', fontWeight: 'var(--font-weight-light)', color: 'var(--color-text)', lineHeight: 1.08, letterSpacing: '-0.02em' }}>
            Move a little,<br />every half hour.
          </h1>
          <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-muted)', lineHeight: 'var(--line-height-relaxed)', maxWidth: 440 }}>
            Dehna runs a focus timer. When it rings, it walks you through a few minutes of
            stretches picked for where you hurt: neck, back, wrists, hips, eyes.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-5)', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link href={startHref} className="btn btn-primary" style={{ padding: '14px 32px' }}>
              {returning ? 'Back to work' : 'Get started'}
            </Link>
            <Link href="/exercises" className="home-link">Browse the 40 exercises →</Link>
          </div>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
            No account. Everything stays on this device.
          </p>
        </div>
        <HomeDemo />
      </section>

      <section style={{ maxWidth: 1080, width: '100%', margin: '0 auto', padding: 'var(--space-8) 24px var(--space-7)' }}>
        <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-light)', color: 'var(--color-text)', marginBottom: 'var(--space-6)' }}>
          How it works
        </h2>
        <ol style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', maxWidth: 560 }}>
          {STEPS.map((s, i) => (
            <li key={s.title} style={{ display: 'flex', gap: 'var(--space-5)' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)', paddingTop: 3 }}>
                0{i + 1}
              </span>
              <div>
                <div style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text)' }}>{s.title}</div>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--line-height-relaxed)', marginTop: 2 }}>
                  {s.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="home-desk">
        <div style={{ flexShrink: 0 }}>
          <DeskAvatar posture="standing" working />
        </div>
        <div style={{ maxWidth: 420 }}>
          <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-light)', color: 'var(--color-text)' }}>
            Got a standing desk?
          </h2>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--line-height-relaxed)', marginTop: 'var(--space-3)' }}>
            Tell Dehna and it will nudge you to stand after a long stretch of sitting, and to sit
            again before your legs tire. They are suggestions. You decide.
          </p>
        </div>
      </section>

      <footer style={{ marginTop: 'auto', padding: 'var(--space-6) 24px', textAlign: 'center', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
        ደህና means &ldquo;be well&rdquo; in Amharic.
      </footer>
    </main>
  );
}
