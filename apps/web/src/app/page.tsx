'use client';

import Link from 'next/link';

const FEATURES = [
  { label: 'Eyes', desc: '5 exercises for screen fatigue' },
  { label: 'Back & neck', desc: 'Stretch and mobilise the desk posture' },
  { label: 'Wrists', desc: 'Counter repetitive strain from typing' },
];

export default function Home() {
  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: '#f5f3ef',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {/* Grain — barely visible on light bg, adds warmth */}
      <svg
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0,
          opacity: 0.045,
        }}
      >
        <filter id="lp-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.68" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#lp-grain)" />
      </svg>

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1 }}>

        {/* Nav */}
        <nav
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 'var(--space-5) var(--space-6)',
            borderBottom: '1px solid #e8e4de',
          }}
        >
          <span
            style={{
              fontWeight: 'var(--font-weight-bold)',
              fontSize: 'var(--font-size-base)',
              color: '#1c1510',
              letterSpacing: '-0.01em',
            }}
          >
            ደህና
          </span>
          <div style={{ display: 'flex', gap: 'var(--space-5)', alignItems: 'center' }}>
            <Link
              href="/exercises"
              style={{ fontSize: 'var(--font-size-sm)', color: '#7a746a', textDecoration: 'none' }}
            >
              Exercises
            </Link>
            <Link
              href="/onboarding"
              style={{
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-medium)',
                color: '#fff',
                backgroundColor: '#d3643b',
                padding: '7px 16px',
                borderRadius: '6px',
                textDecoration: 'none',
              }}
            >
              Get started
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: 'var(--space-8) var(--space-6)',
            gap: 'var(--space-6)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)', maxWidth: 540 }}>
            <h1
              style={{
                fontSize: 'clamp(2.4rem, 9vw, 4rem)',
                fontWeight: 'var(--font-weight-bold)',
                color: '#1c1510',
                lineHeight: 1.05,
                margin: 0,
                letterSpacing: '-0.03em',
              }}
            >
              Desk work is hard
              <br />
              on your body.
            </h1>
            <p
              style={{
                fontSize: 'var(--font-size-lg)',
                color: '#7a746a',
                lineHeight: 'var(--line-height-relaxed)',
                margin: 0,
                maxWidth: 400,
              }}
            >
              Dehna gives you short, guided movement breaks tailored to where you ache — eyes, back, neck, wrists.
            </p>
          </div>

          {/* CTA row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link
              href="/onboarding"
              style={{
                display: 'inline-block',
                padding: '14px 32px',
                backgroundColor: '#d3643b',
                color: '#fff',
                fontSize: 'var(--font-size-base)',
                fontWeight: 'var(--font-weight-medium)',
                borderRadius: '8px',
                textDecoration: 'none',
              }}
            >
              Start for free
            </Link>
            <Link
              href="/exercises"
              style={{
                fontSize: 'var(--font-size-base)',
                color: '#7a746a',
                textDecoration: 'none',
              }}
            >
              Browse exercises →
            </Link>
          </div>

          {/* Divider */}
          <div style={{ width: '100%', maxWidth: 480, height: 1, backgroundColor: '#e8e4de' }} />

          {/* Feature trio */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
              width: '100%',
              maxWidth: 400,
            }}
          >
            {FEATURES.map(({ label, desc }) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  gap: 'var(--space-4)',
                }}
              >
                <span
                  style={{
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: '#1c1510',
                    flexShrink: 0,
                  }}
                >
                  {label}
                </span>
                <span
                  style={{
                    flex: 1,
                    height: 1,
                    backgroundColor: '#e8e4de',
                    alignSelf: 'center',
                  }}
                />
                <span
                  style={{
                    fontSize: 'var(--font-size-sm)',
                    color: '#7a746a',
                    textAlign: 'right',
                    flexShrink: 0,
                    maxWidth: 200,
                  }}
                >
                  {desc}
                </span>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <p
            style={{
              fontSize: 'var(--font-size-xs)',
              color: '#b0a898',
              margin: 0,
            }}
          >
            Works offline · nothing leaves your device · free forever
          </p>
        </div>
      </div>
    </main>
  );
}
