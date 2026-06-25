'use client';

import type { ProblemArea } from '@/types';

const AREAS: { id: ProblemArea; label: string }[] = [
  { id: 'back', label: 'Back' },
  { id: 'neck', label: 'Neck' },
  { id: 'shoulders', label: 'Shoulders' },
  { id: 'wrists-elbows', label: 'Wrists & Elbows' },
  { id: 'knees-hips', label: 'Knees & Hips' },
  { id: 'eyes', label: 'Eyes' },
  { id: 'legs', label: 'Legs' },
  { id: 'general', label: 'General wellness' },
];

interface ProblemAreaPickerProps {
  selected: ProblemArea[];
  onChange: (areas: ProblemArea[]) => void;
}

export function ProblemAreaPicker({ selected, onChange }: ProblemAreaPickerProps) {
  const toggle = (id: ProblemArea) => {
    if (selected.includes(id)) {
      onChange(selected.filter((a) => a !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 'var(--space-3)',
        width: '100%',
        maxWidth: 400,
      }}
    >
      {AREAS.map((area) => (
        <button
          key={area.id}
          className={`area-card${selected.includes(area.id) ? ' selected' : ''}`}
          onClick={() => toggle(area.id)}
          type="button"
          aria-pressed={selected.includes(area.id)}
        >
          <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-medium)' }}>
            {area.label}
          </span>
        </button>
      ))}
    </div>
  );
}
