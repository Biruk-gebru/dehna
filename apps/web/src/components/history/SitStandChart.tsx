'use client';

import { useState } from 'react';
import type { WorkSession } from '@/types';

// Validated with the dataviz palette checker against the card surface (#fbf9f6):
// lightness band, chroma floor, colour-blind separation and contrast all pass.
const STANDING = '#009088';
const SITTING = '#b07a2a';

type Day = { key: string; label: string; sitting: number; standing: number };

function fmt(m: number) {
  if (m < 60) return `${m}m`;
  return m % 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m / 60}h`;
}

interface Props {
  sessions: WorkSession[];
  standingMinutes: (s: WorkSession) => number;
}

/** Last seven days of tracked work, split into sitting and standing. */
export function SitStandChart({ sessions, standingMinutes }: Props) {
  const [hover, setHover] = useState<number | null>(null);

  const days: Day[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10); // same day key the history list groups by
    const tracked = sessions.filter((s) => s.startedAt.startsWith(key) && s.postures?.length);
    const standing = tracked.reduce((t, s) => t + standingMinutes(s), 0);
    const total = tracked.reduce((t, s) => t + s.durationMinutes, 0);
    return { key, label: d.toLocaleDateString([], { weekday: 'short' }), standing, sitting: Math.max(0, total - standing) };
  });

  if (!days.some((d) => d.sitting + d.standing > 0)) return null;

  const W = 560, H = 170, top = 12, base = 140;
  const max = Math.max(...days.map((d) => d.sitting + d.standing));
  const col = W / 7, bar = Math.min(34, col * 0.5);
  const y = (m: number) => (m / max) * (base - top);

  // Rounded data-end on the top segment only; segments are separated by a 2px surface gap
  const segment = (x: number, y0: number, h: number, round: boolean) => {
    if (h <= 0) return '';
    const r = round ? Math.min(4, h) : 0;
    return `M${x},${y0} v${-(h - r)} q0,${-r} ${r},${-r} h${bar - 2 * r} q${r},0 ${r},${r} v${h - r} z`;
  };

  return (
    <section style={{ marginBottom: 'var(--space-7)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 'var(--space-3)', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
        <h2 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-muted)' }}>
          Sitting and standing, last 7 days
        </h2>
        <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
          {[['Sitting', SITTING], ['Standing', STANDING]].map(([name, c]) => (
            <span key={name} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: c }} aria-hidden="true" />
              {name}
            </span>
          ))}
        </div>
      </div>

      <div style={{ position: 'relative', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)' }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Minutes sitting and standing per day for the last 7 days">
          <line x1={0} x2={W} y1={base + 0.5} y2={base + 0.5} stroke="var(--color-border)" />
          {days.map((d, i) => {
            const x = i * col + (col - bar) / 2;
            const hs = y(d.sitting), hst = y(d.standing);
            const gap = hs > 0 && hst > 0 ? 2 : 0;
            const dim = hover !== null && hover !== i ? 0.55 : 1;
            return (
              <g key={d.key} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
                {/* Full-column hit target, bigger than the bar */}
                <rect x={i * col} y={0} width={col} height={H} fill="transparent" />
                <path d={segment(x, base, hs, hst === 0)} fill={SITTING} opacity={dim} />
                <path d={segment(x, base - hs - gap, hst, true)} fill={STANDING} opacity={dim} />
                <text x={i * col + col / 2} y={H - 8} textAnchor="middle" fontSize="12" fill="var(--color-text-muted)">{d.label}</text>
              </g>
            );
          })}
        </svg>

        {hover !== null && (
          <div
            role="tooltip"
            style={{
              position: 'absolute', bottom: '100%', marginBottom: 6, left: `${((hover + 0.5) / 7) * 100}%`, transform: 'translateX(-50%)', // above the card, never over the bar
              background: 'var(--color-text)', color: 'var(--color-surface)', borderRadius: 6, padding: '6px 10px',
              fontSize: 'var(--font-size-xs)', whiteSpace: 'nowrap', pointerEvents: 'none',
            }}
          >
            {days[hover].label}: {fmt(days[hover].sitting)} sitting, {fmt(days[hover].standing)} standing
          </div>
        )}

        {/* The same numbers as a table, for screen readers */}
        <table className="sr-only">
          <caption>Minutes sitting and standing per day</caption>
          <thead><tr><th>Day</th><th>Sitting</th><th>Standing</th></tr></thead>
          <tbody>
            {days.map((d) => <tr key={d.key}><td>{d.label}</td><td>{fmt(d.sitting)}</td><td>{fmt(d.standing)}</td></tr>)}
          </tbody>
        </table>
      </div>
    </section>
  );
}
