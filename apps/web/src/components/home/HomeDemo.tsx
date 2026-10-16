'use client';

import { useEffect, useState } from 'react';
import exercisesData from '@/data/exercises.json';
import { ExerciseVisual } from '@/components/exercise/ExerciseVisual';
import { DeskAvatar } from '@/components/timer/DeskAvatar';
import type { Exercise } from '@/types';

const exercises = exercisesData as Exercise[];
const byId = (id: string) => exercises.find((e) => e.id === id)!;

type Scene = { title: string; caption: string; ms: number; exercise?: Exercise; standing?: boolean };

// One loop of the product: focus, a short break, then back to work.
const SCENES: Scene[] = [
  { title: 'Focus', caption: 'You work. Dehna keeps the time.', ms: 5000 },
  { title: 'Neck side tilt', caption: 'The timer rings and the break begins.', ms: 6200, exercise: byId('neck-side-tilt-01') },
  { title: 'Overhead reach', caption: 'A few moves, picked for where you ache.', ms: 6000, exercise: byId('shoulder-overhead-reach-01') },
  { title: 'Seated spinal twist', caption: 'Each one shown, step by step.', ms: 6000, exercise: byId('back-spinal-twist-01') },
  { title: 'Back to work', caption: 'Standing this time, if your desk allows.', ms: 5000, standing: true },
];

export function HomeDemo() {
  const [index, setIndex] = useState(0);
  const scene = SCENES[index];

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setTimeout(() => setIndex((i) => (i + 1) % SCENES.length), scene.ms);
    return () => clearTimeout(id);
  }, [index, scene.ms]);

  return (
    <figure className="home-demo">
      <div key={index} className="home-demo-stage">
        {scene.exercise
          ? <ExerciseVisual exercise={scene.exercise} />
          : <DeskAvatar posture={scene.standing ? 'standing' : 'sitting'} working />}
      </div>
      <figcaption style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
        <div aria-live="polite">
          <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text)' }}>
            {scene.title}
          </div>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', marginTop: 2 }}>
            {scene.caption}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0, paddingBottom: 6 }}>
          {SCENES.map((s, i) => (
            <button
              key={s.title}
              type="button"
              className="home-demo-dot"
              aria-label={`Show ${s.title}`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      </figcaption>
    </figure>
  );
}
