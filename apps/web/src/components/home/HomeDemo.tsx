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

// What it says when you tap it
const REACTIONS = [
  'Oh, hi!',
  "Careful, I'm mid-stretch.",
  'Your shoulders could use this too.',
  'Thanks for checking on me.',
  'Same time in half an hour?',
];

// A window and a plant so the avatar isn't floating in an empty box
function Room() {
  return (
    <svg className="home-room" viewBox="0 0 400 320" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
      <rect x="34" y="70" width="104" height="128" rx="6" style={{ fill: 'var(--color-surface)' }} opacity="0.75" />
      <rect x="44" y="80" width="40" height="52" rx="2" style={{ fill: 'var(--color-bg)' }} />
      <rect x="88" y="80" width="40" height="52" rx="2" style={{ fill: 'var(--color-bg)' }} />
      <rect x="44" y="136" width="40" height="52" rx="2" style={{ fill: 'var(--color-bg)' }} />
      <rect x="88" y="136" width="40" height="52" rx="2" style={{ fill: 'var(--color-bg)' }} />
      <path d="M338 252 q-26 -40 -6 -86 q10 34 6 86" style={{ fill: 'var(--color-primary)' }} opacity="0.35" />
      <path d="M342 252 q30 -34 18 -80 q-18 30 -18 80" style={{ fill: 'var(--color-primary)' }} opacity="0.45" />
      <path d="M340 252 q-4 -50 -30 -70 q2 40 30 70" style={{ fill: 'var(--color-primary)' }} opacity="0.3" />
      <path d="M318 250 h44 l-6 40 h-32 z" style={{ fill: 'var(--color-accent)' }} opacity="0.8" />
    </svg>
  );
}

export function HomeDemo() {
  const [index, setIndex] = useState(0);
  const [poke, setPoke] = useState<{ scene: number; n: number } | null>(null);
  const scene = SCENES[index];
  const reaction = poke?.scene === index ? REACTIONS[poke.n % REACTIONS.length] : null;

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setTimeout(() => setIndex((i) => (i + 1) % SCENES.length), scene.ms);
    return () => clearTimeout(id);
  }, [index, scene.ms]);

  return (
    <figure className="home-stage">
      <Room />
      <p key={`say-${index}-${poke?.n}`} className="home-bubble" aria-live="polite">{reaction ?? scene.says}</p>
      {/* Tapping restarts the scene, which replays the avatar's glance and smile */}
      <button
        key={`${index}-${poke?.n}`}
        type="button"
        className="home-stage-figure"
        aria-label="Say hi"
        onClick={() => setPoke((p) => ({ scene: index, n: (p?.n ?? -1) + 1 }))}
      >
        {scene.exercise
          ? <ExerciseVisual exercise={scene.exercise} />
          : <DeskAvatar posture={scene.standing ? 'standing' : 'sitting'} working />}
      </button>
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
