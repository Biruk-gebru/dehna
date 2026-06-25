'use client';

import Link from 'next/link';

const PREVIEW_EXERCISES = [
  { name: 'Seated Cat-Cow',       area: 'Back',  duration: 45, dot: '#8b6a42' },
  { name: '20-20-20 Eye Break',   area: 'Eyes',  duration: 30, dot: '#5a9e8f' },
  { name: 'Neck Side Tilt',       area: 'Neck',  duration: 30, dot: '#6b7c9a' },
  { name: 'Wrist Circles',        area: 'Wrists', duration: 30, dot: '#9a6b7a' },
  { name: 'Shoulder Rolls',       area: 'Shoulders', duration: 30, dot: '#7a8a5a' },
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
              Start for free
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
          {/* Announcement pill */}
          <Link
            href="/exercises"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '7px 16px',
              backgroundColor: 'rgba(255,255,255,0.62)',
              border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: '999px',
              fontSize: '0.8125rem',
              color: '#5a5248',
              textDecoration: 'none',
              backdropFilter: 'blur(8px)',
            }}
          >
            40 guided exercises · Browse them all →
          </Link>

          {/* Heading */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 640 }}>
            <h1
              style={{
                fontSize: 'clamp(2.8rem, 10vw, 5rem)',
                fontWeight: 'var(--font-weight-bold)',
                color: '#1c1510',
                lineHeight: 1.02,
                margin: 0,
                letterSpacing: '-0.035em',
              }}
            >
              Your body needs
              <br />a break from your desk.
            </h1>
            <p
              style={{
                fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
                color: '#6b6358',
                lineHeight: 1.65,
                margin: '0 auto',
                maxWidth: 460,
              }}
            >
              Guided micro-breaks for eyes, back, neck, and wrists —
              tailored to where you ache.
            </p>
          </div>

          {/* CTA — single pill, centered */}
          <Link
            href="/onboarding"
            style={{
              display: 'inline-block',
              padding: '16px 44px',
              backgroundColor: '#d3643b',
              color: '#fff',
              fontSize: 'var(--font-size-base)',
              fontWeight: 'var(--font-weight-medium)',
              borderRadius: '999px',
              textDecoration: 'none',
            }}
          >
            Start for free
          </Link>

          {/* Product preview */}
          <div
            style={{
              width: '100%',
              maxWidth: 480,
              marginTop: 8,
            }}
          >
            {/* App chrome */}
            <div
              style={{
                backgroundColor: 'rgba(255,255,255,0.88)',
                borderRadius: '20px 20px 0 0',
                overflow: 'hidden',
                boxShadow: '0 8px 48px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.9)',
                borderBottom: 'none',
              }}
            >
              {/* Header bar */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 20px',
                  borderBottom: '1px solid #f0ede8',
                }}
              >
                <span style={{ fontWeight: 'var(--font-weight-medium)', fontSize: '0.9rem', color: '#1c1510' }}>
                  Exercises
                </span>
                <span style={{ fontSize: '0.75rem', color: '#b0a898', fontFamily: 'var(--font-mono)' }}>
                  40 total
                </span>
              </div>

              {/* Exercise rows */}
              {PREVIEW_EXERCISES.map(({ name, area, duration, dot }, i) => (
                <div
                  key={name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '13px 20px',
                    borderBottom: i < PREVIEW_EXERCISES.length - 1 ? '1px solid #f5f3ef' : 'none',
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: dot,
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 'var(--font-weight-medium)', color: '#1c1510' }}>
                      {name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#9a9088', marginTop: 2 }}>
                      {area}
                    </div>
                  </div>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: '#c0b8b0',
                    }}
                  >
                    {duration}s
                  </span>
                </div>
              ))}

              {/* Fade-out bottom */}
              <div
                style={{
                  height: 56,
                  background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.95))',
                  marginTop: -4,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
