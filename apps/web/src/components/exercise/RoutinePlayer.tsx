'use client';

import { useState, useEffect } from 'react';
import type { Exercise } from '@/types';
import { TimerRing } from '@/components/timer/TimerRing';
import { ExerciseCard } from './ExerciseCard';
import { ExerciseVisual } from './ExerciseVisual';
import { Button } from '@/components/ui/Button';
import { formatTime } from '@/lib/timer';

interface RoutinePlayerProps {
  routine: Exercise[];
  onComplete: (exerciseIds: string[]) => void;
  onSkip: (completedIds: string[]) => void;
}

export function RoutinePlayer({ routine, onComplete, onSkip }: RoutinePlayerProps) {
  const [index, setIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState<number>(routine[0]?.duration ?? 30);

  const exercise = routine[index];

  useEffect(() => {
    if (!exercise) return;
    setSecondsLeft(exercise.duration);
    const startTime = Date.now();
    const total = exercise.duration;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, total - elapsed);
      setSecondsLeft(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        advance();
      }
    }, 500);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  function advance() {
    if (index + 1 >= routine.length) {
      onComplete(routine.map((e) => e.id));
    } else {
      setIndex((i) => i + 1);
    }
  }

  if (!exercise) return null;

  const progress = secondsLeft / exercise.duration;

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-break-bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-6)',
        gap: 'var(--space-5)',
      }}
    >
      {/* Progress indicator */}
      <p
        style={{
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-text-muted)',
        }}
      >
        {index + 1} of {routine.length}
      </p>

      {/* Countdown ring */}
      <TimerRing progress={progress} size={120} strokeWidth={6}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--font-size-lg)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-text)',
          }}
        >
          {formatTime(secondsLeft)}
        </span>
      </TimerRing>

      {/* Exercise header */}
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <h1
          style={{
            fontSize: 'var(--font-size-xl)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--color-text)',
            lineHeight: 'var(--line-height-tight)',
          }}
        >
          {exercise.name}
        </h1>
        <p
          style={{
            fontSize: 'var(--font-size-base)',
            color: 'var(--color-text-muted)',
            marginTop: 'var(--space-2)',
          }}
        >
          {exercise.description}
        </p>
      </div>

      <ExerciseVisual exercise={exercise} />

      <ExerciseCard exercise={exercise} />

      <Button onClick={advance} style={{ minWidth: 200 }}>
        {index + 1 >= routine.length ? 'Done — back to work' : 'Next exercise →'}
      </Button>

      <button
        className="btn btn-ghost btn-sm"
        onClick={() => onSkip(routine.slice(0, index).map((e) => e.id))}
      >
        Skip break
      </button>
    </main>
  );
}
