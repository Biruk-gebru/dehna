'use client';

import Link from 'next/link';

const PREVIEW_EXERCISES = [
  { name: 'Seated Cat-Cow',     area: 'Back',  duration: 45, dot: '#8b6a42' },
  { name: '20-20-20 Eye Break', area: 'Eyes',  duration: 30, dot: '#5a9e8f' },
  { name: 'Neck Side Tilt',     area: 'Neck',  duration: 30, dot: '#6b7c9a' },
];

export default function Home() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #dde8e0 0%, #ede8e2 52%, #fdf7f0 100%)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      {/* Grain */}
      <svg
        aria-hidden="true"
        style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0, opacity: 0.05 }}
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
            padding: '18px 28px',
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

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Link
              href="/exercises"
              style={{
                fontSize: 'var(--font-size-sm)',
                color: '#6b6358',
                textDecoration: 'none',
                padding: '7px 14px',
              }}
            >
              Exercises
            </Link>
            <Link
              href="/onboarding"
              style={{
                fontSize: 'var(--font-size-sm)',
                fontWeight: 'var(--font-weight-medium)',
                color: '#1c1510',
                border: '1.5px solid rgba(0,0,0,0.18)',
                padding: '7px 18px',
                borderRadius: '999px',
                textDecoration: 'none',
                backgroundColor: 'rgba(255,255,255,0.5)',
              }}
            >
              Get started
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: '48px 24px 0',
            gap: 28,
          }}
        >
          {/* Heading */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 600 }}>
            <h1
              style={{
                fontSize: 'clamp(2rem, 6.5vw, 3.2rem)',
                fontWeight: 'var(--font-weight-light)',
                color: '#1c1510',
                lineHeight: 1.12,
                margin: 0,
                letterSpacing: '-0.02em',
              }}
            >
              Your body needs
              <br />a break from your desk.
            </h1>
            <p
              style={{
                fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
                color: '#6b6358',
                lineHeight: 1.7,
                margin: '0 auto',
                maxWidth: 420,
              }}
            >
              Guided micro-breaks for eyes, back, neck, and wrists,
              tailored to where you ache.
            </p>
          </div>

          {/* CTA — single pill, centered */}
          <Link
            href="/onboarding"
            style={{
              display: 'inline-block',
              padding: '15px 42px',
              backgroundColor: '#d3643b',
              color: '#fff',
              fontSize: 'var(--font-size-base)',
              fontWeight: 'var(--font-weight-medium)',
              borderRadius: '999px',
              textDecoration: 'none',
            }}
          >
            Get started
          </Link>

          {/* Product preview — secondary, compact */}
          <div style={{ width: '100%', maxWidth: 340, marginTop: 4 }}>
            <div
              style={{
                backgroundColor: 'rgba(255,255,255,0.82)',
                borderRadius: '14px',
                overflow: 'hidden',
                boxShadow: '0 4px 24px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.9)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '11px 16px',
                  borderBottom: '1px solid #f0ede8',
                }}
              >
                <span style={{ fontWeight: 'var(--font-weight-medium)', fontSize: '0.8rem', color: '#1c1510' }}>
                  A few of the exercises
                </span>
                <span style={{ fontSize: '0.7rem', color: '#b0a898', fontFamily: 'var(--font-mono)' }}>
                  40 total
                </span>
              </div>

              {PREVIEW_EXERCISES.map(({ name, area, duration, dot }, i) => (
                <div
                  key={name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 16px',
                    borderBottom: i < PREVIEW_EXERCISES.length - 1 ? '1px solid #f5f3ef' : 'none',
                  }}
                >
                  <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: dot, flexShrink: 0 }} />
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 'var(--font-weight-medium)', color: '#1c1510' }}>
                      {name}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#9a9088', marginTop: 1 }}>{area}</div>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#c0b8b0' }}>
                    {duration}s
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
