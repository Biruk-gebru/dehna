'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function Home() {

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--color-bg, #edebe6)',
      }}
    >
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
            color: 'var(--color-text)',
            letterSpacing: '-0.01em',
          }}
        >
          ደህና
        </span>
        <Link
          href="/exercises"
          style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-muted)',
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
          alignItems: 'flex-start',
          padding: 'var(--space-6)',
          maxWidth: 540,
          margin: '0 auto',
          width: '100%',
          gap: 'var(--space-5)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <h1
            style={{
              fontSize: 'clamp(2.2rem, 8vw, 3.5rem)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--color-text)',
              lineHeight: 1.1,
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            Move a little.
            <br />
            Feel a lot better.
          </h1>
          <p
            style={{
              fontSize: 'var(--font-size-lg)',
              color: 'var(--color-text-muted)',
              lineHeight: 'var(--line-height-relaxed)',
              margin: 0,
              maxWidth: 400,
            }}
          >
            Guided micro-breaks for desk workers — tailored to where you ache.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
          <Link href="/onboarding" style={{ textDecoration: 'none' }}>
            <Button style={{ minWidth: 148 }}>Get started</Button>
          </Link>
          <Link
            href="/exercises"
            style={{
              fontSize: 'var(--font-size-base)',
              color: 'var(--color-primary)',
              textDecoration: 'none',
              fontWeight: 'var(--font-weight-medium)',
            }}
          >
            Browse exercises →
          </Link>
        </div>

        {/* Three plain-text feature lines — no icon grid */}
        <ul
          style={{
            listStyle: 'none',
            margin: 'var(--space-4) 0 0',
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
          }}
        >
          {[
            '40 exercises across eyes, back, neck, shoulders, wrists, and more',
            'Customise break frequency and target areas',
            'Works offline — nothing leaves your device',
          ].map((line) => (
            <li
              key={line}
              style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-muted)',
                paddingLeft: 'var(--space-4)',
                position: 'relative',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  left: 0,
                  color: 'var(--color-primary)',
                }}
              >
                –
              </span>
              {line}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
