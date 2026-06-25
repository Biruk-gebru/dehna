'use client';

import { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePreferences } from '@/hooks/usePreferences';
import { useTimer } from '@/hooks/useTimer';
import { useExercises } from '@/hooks/useExercises';
import { useSessionHistory } from '@/hooks/useSessionHistory';
import { notify, playChime, requestNotificationPermission } from '@/lib/notifications';
import { TimerRing } from '@/components/timer/TimerRing';
import { TimerDisplay } from '@/components/timer/TimerDisplay';
import { TimerControls } from '@/components/timer/TimerControls';
import { RoutinePlayer } from '@/components/exercise/RoutinePlayer';
import type { Exercise } from '@/types';

type AppMode = 'idle' | 'running' | 'paused' | 'break';

export default function WorkPage() {
  const { prefs, loading } = usePreferences();
  const [mode, setMode] = useState<AppMode>('idle');
  const [routine, setRoutine] = useState<Exercise[]>([]);
  const [sessionId, setSessionId] = useState<number | null>(null);

  const workStartRef = useRef<number>(0);

  const { startSession, recordBreak, endSession } = useSessionHistory();
  const { generateRoutine } = useExercises(prefs);

  const handleWorkComplete = useCallback(() => {
    const hoursWorked = (Date.now() - workStartRef.current) / 3600000;
    const newRoutine = generateRoutine(hoursWorked);
    setRoutine(newRoutine);
    setMode('break');
    if (prefs?.soundEnabled) playChime();
    notify('Time for a break!', { body: 'A short movement break is ready.' });
  }, [generateRoutine]);

  const timer = useTimer(prefs?.workIntervalMinutes ?? 25, handleWorkComplete);

  const handleStart = useCallback(async () => {
    await requestNotificationPermission();
    const id = await startSession();
    setSessionId(id);
    workStartRef.current = Date.now();
    timer.start();
    setMode('running');
  }, [startSession, timer]);

  const handlePause = useCallback(() => {
    timer.pause();
    setMode('paused');
  }, [timer]);

  const handleResume = useCallback(() => {
    timer.resume();
    setMode('running');
  }, [timer]);

  const handleStop = useCallback(async () => {
    timer.stop();
    if (sessionId !== null) {
      await endSession(sessionId);
      setSessionId(null);
    }
    setMode('idle');
  }, [timer, sessionId, endSession]);

  const handleBreakComplete = useCallback(
    async (exerciseIds: string[]) => {
      if (sessionId !== null) {
        await recordBreak(sessionId, {
          startedAt: new Date().toISOString(),
          durationSeconds: routine.reduce((s, e) => s + e.duration, 0),
          exercisesShown: exerciseIds,
          completed: true,
        });
      }
      workStartRef.current = Date.now();
      timer.start();
      setMode('running');
    },
    [sessionId, recordBreak, routine, timer],
  );

  const handleBreakSkip = useCallback(
    async (completedIds: string[]) => {
      if (sessionId !== null) {
        await recordBreak(sessionId, {
          startedAt: new Date().toISOString(),
          durationSeconds: 0,
          exercisesShown: routine.map((e) => e.id),
          completed: false,
        });
      }
      workStartRef.current = Date.now();
      timer.start();
      setMode('running');
    },
    [sessionId, recordBreak, routine, timer],
  );

  if (loading || !prefs) {
    return <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)' }} aria-hidden="true" />;
  }

  if (mode === 'break') {
    return (
      <RoutinePlayer
        routine={routine}
        onComplete={handleBreakComplete}
        onSkip={handleBreakSkip}
      />
    );
  }

  const timerLabel =
    mode === 'idle' ? 'ready when you are' : mode === 'paused' ? 'paused' : 'remaining';

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-7)',
        padding: 'var(--space-6)',
      }}
    >
      <TimerRing progress={timer.progress} size={240}>
        <TimerDisplay formattedTime={timer.formattedRemaining} label={timerLabel} />
      </TimerRing>

      <TimerControls
        mode={mode}
        onStart={handleStart}
        onPause={handlePause}
        onResume={handleResume}
        onStop={handleStop}
      />

      <nav
        style={{
          position: 'fixed',
          bottom: 'var(--space-5)',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 'var(--space-3)',
        }}
      >
        <Link href="/" className="btn btn-ghost btn-sm">
          Home
        </Link>
        <Link href="/exercises" className="btn btn-ghost btn-sm">
          Exercises
        </Link>
        <Link href="/history" className="btn btn-ghost btn-sm">
          History
        </Link>
        <Link href="/settings" className="btn btn-ghost btn-sm">
          Settings
        </Link>
      </nav>
    </main>
  );
}
