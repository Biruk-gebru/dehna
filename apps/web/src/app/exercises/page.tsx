'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import exercisesData from '@/data/exercises.json';
import { ExerciseVisual } from '@/components/exercise/ExerciseVisual';
import type { Exercise } from '@/types';

const exercises = exercisesData as Exercise[];

// ─── Config ──────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  'eye-break': 'Eye break',
  stretch:     'Stretch',
  mobility:    'Mobility',
  strength:    'Strength',
  cognitive:   'Cognitive',
};

const TYPE_COLORS: Record<string, string> = {
  'eye-break': '#5a9e8f',
  stretch:     '#c05a2a',
  mobility:    '#7a6040',
  strength:    '#9a3820',
  cognitive:   '#5a7a5e',
};

const AREA_LABELS: Record<string, string> = {
  back:           'Back',
  neck:           'Neck',
  shoulders:      'Shoulders',
  'wrists-elbows': 'Wrists',
  eyes:           'Eyes',
  'knees-hips':   'Hips',
  legs:           'Legs',
  general:        'General',
};

const ALL_TYPES = Object.keys(TYPE_LABELS);
const ALL_AREAS = Object.keys(AREA_LABELS);

// ─── ExerciseDetail (expanded card body) ─────────────────────────────────────

function ExerciseDetail({ exercise }: { exercise: Exercise }) {
  return (
    <div>
      {/* Animation */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          padding: 'var(--space-4) 0',
          backgroundColor: 'var(--color-break-bg, #d6e1c7)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--space-4)',
        }}
      >
        <ExerciseVisual exercise={exercise} />
      </div>

      {/* Steps */}
      <ol
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
        }}
      >
        {exercise.steps.map((step, i) => (
          <li
            key={i}
            style={{
              display: 'flex',
              gap: 'var(--space-3)',
              fontSize: 'var(--font-size-sm)',
              lineHeight: 'var(--line-height-relaxed)',
              color: 'var(--color-text)',
            }}
          >
            <span
              style={{
                flexShrink: 0,
                fontWeight: 'var(--font-weight-medium)',
                color: TYPE_COLORS[exercise.type] ?? 'var(--color-primary)',
                width: 18,
              }}
            >
              {i + 1}.
            </span>
            {step}
          </li>
        ))}
      </ol>

      {exercise.tips.length > 0 && (
        <p
          style={{
            marginTop: 'var(--space-4)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-muted)',
            lineHeight: 'var(--line-height-relaxed)',
            borderTop: '1px solid var(--color-border)',
            paddingTop: 'var(--space-3)',
          }}
        >
          {exercise.tips[0]}
        </p>
      )}
    </div>
  );
}

// ─── ExerciseTile ─────────────────────────────────────────────────────────────

function ExerciseTile({ exercise, open, onToggle }: {
  exercise: Exercise;
  open: boolean;
  onToggle: () => void;
}) {
  const typeColor = TYPE_COLORS[exercise.type] ?? 'var(--color-primary)';
  const areaText = exercise.targetAreas
    .map((a) => AREA_LABELS[a] ?? a)
    .join(', ');

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        border: open ? `1.5px solid ${typeColor}40` : '1.5px solid transparent',
        transition: 'border-color 0.2s',
      }}
    >
      {/* Header row — always visible */}
      <button
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`exercise-detail-${exercise.id}`}
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          alignItems: 'start',
          width: '100%',
          padding: 'var(--space-4) var(--space-5)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          gap: 'var(--space-3)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
          <span
            style={{
              fontWeight: 'var(--font-weight-medium)',
              fontSize: 'var(--font-size-base)',
              color: 'var(--color-text)',
              lineHeight: 1.3,
            }}
          >
            {exercise.name}
          </span>
          <span
            style={{
              fontSize: 'var(--font-size-sm)',
              color: 'var(--color-text-muted)',
            }}
          >
            {areaText}
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 'var(--space-1)',
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontSize: 'var(--font-size-sm)',
              color: typeColor,
              fontWeight: 'var(--font-weight-medium)',
            }}
          >
            {TYPE_LABELS[exercise.type]}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-muted)',
            }}
          >
            {exercise.duration}s
          </span>
        </div>
      </button>

      {/* Expanded detail */}
      {open && (
        <div
          id={`exercise-detail-${exercise.id}`}
          role="region"
          aria-label={exercise.name}
          style={{
            padding: '0 var(--space-5) var(--space-5)',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          <div style={{ paddingTop: 'var(--space-4)' }}>
            <ExerciseDetail exercise={exercise} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ExercisesPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [query, setQuery]               = useState('');
  const [openId, setOpenId]             = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return exercises.filter((e) => {
      if (selectedType && e.type !== selectedType) return false;
      if (selectedArea && !e.targetAreas.includes(selectedArea as never)) return false;
      if (q && !e.name.toLowerCase().includes(q) && !e.description.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [selectedType, selectedArea, query]);

  function toggleType(t: string) {
    setSelectedType((prev) => (prev === t ? null : t));
    setOpenId(null);
  }
  function toggleArea(a: string) {
    setSelectedArea((prev) => (prev === a ? null : a));
    setOpenId(null);
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg, #edebe6)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Nav */}
      <nav
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '18px 24px',
          borderBottom: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-bg)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <Link
          href="/"
          style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-base)', color: 'var(--color-text)', textDecoration: 'none', letterSpacing: '-0.01em' }}
        >
          ደህና
        </Link>
        <Link
          href="/"
          style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', textDecoration: 'none' }}
        >
          ← Home
        </Link>
      </nav>

      <div style={{ padding: 'var(--space-4) var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', maxWidth: 600, margin: '0 auto', width: '100%' }}>

        <h1 style={{ fontSize: 'clamp(1.6rem, 5vw, 2rem)', fontWeight: 'var(--font-weight-light)', color: 'var(--color-text)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
          Exercises
        </h1>

        {/* Search */}
        <input
          type="search"
          placeholder="Search exercises…"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpenId(null); }}
          style={{
            width: '100%',
            padding: 'var(--space-3) var(--space-4)',
            fontSize: 'var(--font-size-base)',
            color: 'var(--color-text)',
            backgroundColor: 'var(--color-surface)',
            border: '1.5px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />

        {/* Type filter */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', overflowX: 'auto', paddingBottom: '2px', scrollbarWidth: 'none' }}>
          {ALL_TYPES.map((t) => {
            const active = selectedType === t;
            return (
              <button
                key={t}
                onClick={() => toggleType(t)}
                aria-pressed={active}
                style={{
                  padding: '6px 14px',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: active ? 'var(--font-weight-medium)' : 'var(--font-weight-regular)',
                  backgroundColor: active ? TYPE_COLORS[t] : 'var(--color-surface)',
                  color: active ? 'white' : 'var(--color-text-muted)',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s, color 0.15s',
                  flexShrink: 0,
                }}
              >
                {TYPE_LABELS[t]}
              </button>
            );
          })}
        </div>

        {/* Area filter */}
        <div style={{ display: 'flex', gap: 'var(--space-2)', overflowX: 'auto', paddingBottom: '2px', scrollbarWidth: 'none' }}>
          {ALL_AREAS.map((a) => {
            const active = selectedArea === a;
            return (
              <button
                key={a}
                onClick={() => toggleArea(a)}
                aria-pressed={active}
                style={{
                  padding: '4px 10px',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: active ? 'var(--font-weight-medium)' : 'var(--font-weight-regular)',
                  backgroundColor: active ? 'var(--color-text)' : 'transparent',
                  color: active ? 'var(--color-bg, #edebe6)' : 'var(--color-text-muted)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s, color 0.15s',
                  flexShrink: 0,
                }}
              >
                {AREA_LABELS[a]}
              </button>
            );
          })}
        </div>

        {/* Result count */}
        <p
          style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-muted)',
            margin: 0,
          }}
        >
          {filtered.length} of {exercises.length} exercises
        </p>

        {/* Exercise list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {filtered.map((ex) => (
            <ExerciseTile
              key={ex.id}
              exercise={ex}
              open={openId === ex.id}
              onToggle={() => setOpenId((prev) => (prev === ex.id ? null : ex.id))}
            />
          ))}
          {filtered.length === 0 && (
            <p
              style={{
                textAlign: 'center',
                color: 'var(--color-text-muted)',
                fontSize: 'var(--font-size-sm)',
                padding: 'var(--space-8) 0',
              }}
            >
              No exercises match those filters.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
