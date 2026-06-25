'use client';

import Link from 'next/link';

const FEATURES = [
  '40 exercises across eyes, back, neck, shoulders, wrists, and more',
  'Set your own break frequency and target areas',
  'Works offline — nothing leaves your device',
];

export default function Home() {
  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: '#d3643b',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Grain texture overlay */}
      <svg
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0,
          opacity: 0.09,
        }}
      >
        <filter id="lp-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.68"
            numOctaves="3"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#lp-grain)" />
      </svg>

      {/* Content above grain */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1 }}>

        {/* Nav */}
        <nav
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 'var(--space-5) var(--space-6)',
          }}
        >
          <span
            style={{
              fontWeight: 'var(--font-weight-bold)',
              fontSize: 'var(--font-size-lg)',
              color: '#fff',
              letterSpacing: '-0.01em',
            }}
          >
            ደህና
          </span>
          <Link
            href="/exercises"
            style={{
              fontSize: 'var(--font-size-sm)',
              color: 'rgba(255,255,255,0.7)',
              textDecoration: 'none',
            }}
          >
            Exercises
          </Link>
        </nav>

        {/* Hero */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: 'var(--space-6)',
            maxWidth: 560,
            width: '100%',
            margin: '0 auto',
            gap: 'var(--space-6)',
          }}
        >
          {/* Heading block */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <h1
              style={{
                fontSize: 'clamp(2.6rem, 10vw, 4.2rem)',
                fontWeight: 'var(--font-weight-bold)',
                color: '#fff',
                lineHeight: 1.05,
                margin: 0,
                letterSpacing: '-0.025em',
              }}
            >
              Move a little.
              <br />
              Feel a lot better.
            </h1>

            {/* Divider */}
            <div
              style={{
                width: 48,
                height: 2,
                backgroundColor: 'rgba(255,255,255,0.35)',
                borderRadius: 1,
              }}
            />

            <p
              style={{
                fontSize: 'var(--font-size-lg)',
                color: 'rgba(255,255,255,0.82)',
                lineHeight: 'var(--line-height-relaxed)',
                margin: 0,
                maxWidth: 380,
              }}
            >
              Guided micro-breaks for desk workers, tailored to where you ache.
            </p>
          </div>

          {/* CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)', flexWrap: 'wrap' }}>
            <Link
              href="/onboarding"
              style={{
                display: 'inline-block',
                padding: '13px 28px',
                backgroundColor: '#fff',
                color: '#b8522d',
                fontSize: 'var(--font-size-base)',
                fontWeight: 'var(--font-weight-medium)',
                borderRadius: '8px',
                textDecoration: 'none',
                transition: 'background-color 0.15s, color 0.15s',
              }}
            >
              Get started
            </Link>
            <Link
              href="/exercises"
              style={{
                fontSize: 'var(--font-size-base)',
                color: 'rgba(255,255,255,0.85)',
                textDecoration: 'none',
                fontWeight: 'var(--font-weight-medium)',
              }}
            >
              Browse exercises →
            </Link>
          </div>

          {/* Feature list */}
          <ul
            style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
            }}
          >
            {FEATURES.map((line) => (
              <li
                key={line}
                style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'rgba(255,255,255,0.6)',
                  paddingLeft: 'var(--space-4)',
                  position: 'relative',
                  lineHeight: 'var(--line-height-relaxed)',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    left: 0,
                    color: 'rgba(255,255,255,0.4)',
                  }}
                >
                  –
                </span>
                {line}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
