'use client';

import { useState, useEffect } from 'react';
import type { Exercise } from '@/types';
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
      setSecondsLeft(routine[index + 1].duration);
      setIndex(index + 1);
    }
  }

  if (!exercise) return null;

  const elapsed = 1 - secondsLeft / exercise.duration;
  const next = routine[index + 1];
  const isLast = index + 1 >= routine.length;

  return (
    <main className="break-screen">
      <header className="break-top">
        <span style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text)' }}>ደህና</span>
        {/* One segment per exercise; the current one fills as its time runs down */}
        <div className="break-progress" role="progressbar" aria-valuemin={1} aria-valuemax={routine.length} aria-valuenow={index + 1} aria-label={`Exercise ${index + 1} of ${routine.length}`}>
          {routine.map((e, i) => (
            <span key={e.id}>
              <span style={{ transform: `scaleX(${i < index ? 1 : i === index ? elapsed : 0})` }} />
            </span>
          ))}
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => onSkip(routine.slice(0, index).map((e) => e.id))}>
          Skip break
        </button>
      </header>

      <div className="break-body">
        <div className="break-stage">
          <ExerciseVisual exercise={exercise} />
        </div>

        <section className="break-info">
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
            Exercise {index + 1} of {routine.length}
          </p>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
            <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 'var(--font-weight-light)', color: 'var(--color-text)', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
              {exercise.name}
            </h1>
            <span aria-live="off" style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', color: 'var(--color-primary)' }}>
              {formatTime(secondsLeft)}
            </span>
          </div>

          <ExerciseCard exercise={exercise} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)', flexWrap: 'wrap' }}>
            <Button onClick={advance} style={{ minWidth: 200 }}>
              {isLast ? 'Done, back to work' : 'Next exercise'}
            </Button>
            {next && (
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                Up next: {next.name}
              </span>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
