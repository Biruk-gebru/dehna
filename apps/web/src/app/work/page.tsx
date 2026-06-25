'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePreferences } from '@/hooks/usePreferences';
import { useTimer, type TimerRestore, type TimerState } from '@/hooks/useTimer';
import { useExercises } from '@/hooks/useExercises';
import { useSessionHistory } from '@/hooks/useSessionHistory';
import { notify, playChime, requestNotificationPermission } from '@/lib/notifications';
import { TimerRing } from '@/components/timer/TimerRing';
import { TimerDisplay } from '@/components/timer/TimerDisplay';
import { TimerControls } from '@/components/timer/TimerControls';
import { RoutinePlayer } from '@/components/exercise/RoutinePlayer';
import type { Exercise } from '@/types';

type AppMode = 'idle' | 'running' | 'paused' | 'break';

const SAVE_KEY = 'dehna-work';

type WorkSave = {
  savedAt: number;
  elapsedSeconds: number;
  timerState: 'running' | 'paused';
  appMode: 'running' | 'paused';
  workStartedAt: number;
};

function readSavedSession(): { restore: TimerRestore; appMode: 'running' | 'paused'; workStartedAt: number } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const s: WorkSave = JSON.parse(raw);
    const extraSeconds = s.timerState === 'running'
      ? Math.floor((Date.now() - s.savedAt) / 1000)
      : 0;
    const elapsed = s.elapsedSeconds + extraSeconds;
    return {
      restore: { elapsedSeconds: elapsed, state: s.timerState },
      appMode: s.appMode,
      workStartedAt: s.workStartedAt,
    };
  } catch {
    return null;
  }
}

export default function WorkPage() {
  const { prefs, loading } = usePreferences();

  // Restore from sessionStorage once on mount (lazy useState — runs before first render)
  const [saved] = useState(() => readSavedSession());

  const [mode, setMode]       = useState<AppMode>(saved?.appMode ?? 'idle');
  const [routine, setRoutine] = useState<Exercise[]>([]);
  const [sessionId, setSessionId] = useState<number | null>(null);

  const workStartRef  = useRef<number>(saved?.workStartedAt ?? 0);
  // Always-current snapshot used by the unmount cleanup to avoid stale closures
  const liveRef = useRef<{ timerState: TimerState; elapsed: number; appMode: AppMode } | null>(null);

  const { startSession, recordBreak, endSession } = useSessionHistory();
  const { generateRoutine } = useExercises(prefs);

  const handleWorkComplete = useCallback(() => {
    try { sessionStorage.removeItem(SAVE_KEY); } catch {}
    const hoursWorked = workStartRef.current
      ? (Date.now() - workStartRef.current) / 3_600_000
      : 0.5;
    const newRoutine = generateRoutine(hoursWorked);
    setRoutine(newRoutine);
    setMode('break');
    if (prefs?.soundEnabled) playChime();
    if (prefs?.notificationsEnabled) notify('Time for a break!', { body: 'A short movement break is ready.' });
  }, [generateRoutine, prefs?.soundEnabled]);

  const timer = useTimer(
    prefs?.workIntervalMinutes ?? 25,
    handleWorkComplete,
    saved?.restore,
  );

  // Keep liveRef current every render so the unmount cleanup has fresh values
  liveRef.current = { timerState: timer.state, elapsed: timer.elapsedSeconds, appMode: mode };

  // Persist on state transitions
  useEffect(() => {
    if (timer.state === 'idle' || mode === 'idle' || mode === 'break') {
      if (mode === 'idle') {
        try { sessionStorage.removeItem(SAVE_KEY); } catch {}
      }
      return;
    }
    try {
      const save: WorkSave = {
        savedAt: Date.now(),
        elapsedSeconds: timer.elapsedSeconds,
        timerState: timer.state as 'running' | 'paused',
        appMode: mode as 'running' | 'paused',
        workStartedAt: workStartRef.current,
      };
      sessionStorage.setItem(SAVE_KEY, JSON.stringify(save));
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer.state, mode]);

  // Also persist on unmount (navigation away) so elapsed time is always up-to-date
  useEffect(() => {
    return () => {
      const live = liveRef.current;
      if (!live || live.timerState === 'idle' || live.appMode === 'idle' || live.appMode === 'break') return;
      try {
        const save: WorkSave = {
          savedAt: Date.now(),
          elapsedSeconds: live.elapsed,
          timerState: live.timerState as 'running' | 'paused',
          appMode: live.appMode as 'running' | 'paused',
          workStartedAt: workStartRef.current,
        };
        sessionStorage.setItem(SAVE_KEY, JSON.stringify(save));
      } catch {}
    };
  }, []);

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
    try { sessionStorage.removeItem(SAVE_KEY); } catch {}
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
        <Link href="/" className="btn btn-ghost btn-sm">Home</Link>
        <Link href="/exercises" className="btn btn-ghost btn-sm">Exercises</Link>
        <Link href="/history" className="btn btn-ghost btn-sm">History</Link>
        <Link href="/settings" className="btn btn-ghost btn-sm">Settings</Link>
      </nav>
    </main>
  );
}
