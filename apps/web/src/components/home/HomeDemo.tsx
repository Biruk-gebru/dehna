'use client';

import { useEffect, useState } from 'react';
import exercisesData from '@/data/exercises.json';
import { ExerciseVisual } from '@/components/exercise/ExerciseVisual';
import { DeskAvatar } from '@/components/timer/DeskAvatar';
import type { Exercise } from '@/types';

const exercises = exercisesData as Exercise[];
const byId = (id: string) => exercises.find((e) => e.id === id)!;

type Scene = { says: string; ms: number; exercise?: Exercise; standing?: boolean };

// One loop of the product, told by the avatar itself.
const SCENES: Scene[] = [
  { says: '52 minutes without moving. My neck has opinions.', ms: 5200 },
  { says: 'Ear toward the shoulder. Slowly.', ms: 6200, exercise: byId('neck-side-tilt-01') },
  { says: 'Reach up like you mean it.', ms: 6000, exercise: byId('shoulder-overhead-reach-01') },
  { says: 'Twist, hold, breathe out.', ms: 6000, exercise: byId('back-spinal-twist-01') },
  { says: 'Better. Back to work, standing this time.', ms: 5200, standing: true },
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
    <figure className="home-stage">
      <p key={`say-${index}`} className="home-bubble" aria-live="polite">{scene.says}</p>
      <div key={index} className="home-stage-figure">
        {scene.exercise
          ? <ExerciseVisual exercise={scene.exercise} />
          : <DeskAvatar posture={scene.standing ? 'standing' : 'sitting'} working />}
      </div>
      <div className="home-stage-dots">
        {SCENES.map((s, i) => (
          <button
            key={s.says}
            type="button"
            className="home-demo-dot"
            aria-label={`Scene ${i + 1}`}
            aria-current={i === index}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </figure>
  );
}
