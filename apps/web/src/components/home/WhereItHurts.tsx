'use client';

import { useState } from 'react';
import exercisesData from '@/data/exercises.json';
import { FigureRig } from '@/components/exercise/FigureRig';
import { getClip } from '@/components/exercise/ExerciseVisual';
import type { Exercise } from '@/types';
import { useInView } from './useInView';

const exercises = exercisesData as Exercise[];

// One representative move per area, picked because it reads well at a glance
const AREAS = [
  { label: 'Neck', id: 'neck-levator-scap-01' },
  { label: 'Shoulders', id: 'shoulder-doorframe-01' },
  { label: 'Back', id: 'back-cat-cow-01' },
  { label: 'Wrists', id: 'wrist-prayer-01' },
  { label: 'Hips', id: 'hips-figure-four-01' },
  { label: 'Legs', id: 'legs-calf-stretch-01' },
  { label: 'Eyes', id: 'eyes-palming-01' },
].map((a) => ({ ...a, exercise: exercises.find((e) => e.id === a.id)! }));

// Upper body on the left, lower body and eyes on the right, like an anatomy chart
const LEFT = AREAS.slice(0, 4);
const RIGHT = AREAS.slice(4);

export function WhereItHurts() {
  const [active, setActive] = useState(0);
  const [ref, inView] = useInView<HTMLElement>('100px');
  const { exercise } = AREAS[active];

  const tab = (a: (typeof AREAS)[number], side: 'left' | 'right') => {
    const i = AREAS.indexOf(a);
    return (
      <button key={a.id} type="button" role="tab" data-side={side} aria-selected={i === active} onClick={() => setActive(i)}>
        {a.label}
      </button>
    );
  };

  return (
    <section ref={ref} className="home-hurts">
      <h2 className="home-h2" style={{ textAlign: 'center' }}>Where does it hurt?</h2>
      <p style={{ textAlign: 'center', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-2)' }}>
        Pick a spot and watch the stretch for it.
      </p>
      <div className="home-anatomy" role="tablist" aria-label="Body areas">
        <div className="home-anatomy-side" data-side="left">{LEFT.map((a) => tab(a, 'left'))}</div>
        <div key={exercise.id} className="home-hurts-figure">
          <FigureRig clip={getClip(exercise)} static={!inView} size={300} />
        </div>
        <div className="home-anatomy-side" data-side="right">{RIGHT.map((a) => tab(a, 'right'))}</div>
      </div>
      <div style={{ textAlign: 'center', maxWidth: 460, margin: 'var(--space-5) auto 0' }}>
        <div style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-text)' }}>{exercise.name}</div>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--line-height-relaxed)', marginTop: 'var(--space-2)' }}>
          {exercise.steps[0]} {exercise.steps[1]}
        </p>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-3)' }}>
          {exercise.duration} seconds
        </p>
      </div>
    </section>
  );
}
