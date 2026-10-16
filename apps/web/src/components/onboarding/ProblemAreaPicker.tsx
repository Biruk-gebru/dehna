'use client';

import type { ProblemArea } from '@/types';
import { FigureRig, type Clip } from '@/components/exercise/FigureRig';

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

// Spots on a front view of the standing avatar, as % of its 200×210 frame
const SPOTS: { id: ProblemArea; x: number; y: number }[] = [
  { id: 'eyes', x: 50, y: 20 },
  { id: 'neck', x: 50, y: 28 },
  { id: 'shoulders', x: 58, y: 30 },
  { id: 'back', x: 50, y: 40 },
  { id: 'wrists-elbows', x: 38, y: 54 },
  { id: 'knees-hips', x: 54, y: 50 },
  { id: 'legs', x: 53, y: 79 },
];

const FRONT: Clip = { yaw: 0, poses: [{ target: { face: { smile: 0.5, brow: 0.2 } }, durationMs: 1 }] };

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

  const label = (id: ProblemArea) => AREAS.find((a) => a.id === id)!.label;

  return (
    <div className="area-picker">
      <div className="area-body">
        <FigureRig clip={FRONT} static />
        {SPOTS.map((spot) => (
          <button
            key={spot.id}
            type="button"
            className="area-spot"
            style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
            aria-pressed={selected.includes(spot.id)}
            aria-label={label(spot.id)}
            title={label(spot.id)}
            onClick={() => toggle(spot.id)}
          />
        ))}
      </div>
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
    </div>
  );
}
