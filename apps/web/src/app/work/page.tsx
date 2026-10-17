'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePreferences } from '@/hooks/usePreferences';
import { useTimer, type TimerRestore, type TimerState } from '@/hooks/useTimer';
import { useExercises } from '@/hooks/useExercises';
import { useSessionHistory } from '@/hooks/useSessionHistory';
import { usePosture } from '@/hooks/usePosture';
import { notify, playChime, requestNotificationPermission } from '@/lib/notifications';
import { requestPersistentStorage } from '@/lib/storage';
import { TimerRing } from '@/components/timer/TimerRing';
import { TimerDisplay } from '@/components/timer/TimerDisplay';
import { TimerControls } from '@/components/timer/TimerControls';
import { PostureToggle } from '@/components/timer/PostureToggle';
import { DeskAvatar } from '@/components/timer/DeskAvatar';
import { PostureSuggestionCard } from '@/components/timer/PostureSuggestionCard';
import { suggestPosture } from '@/lib/posture';
import { RoutinePlayer } from '@/components/exercise/RoutinePlayer';
import type { Exercise, Posture } from '@/types';

type AppMode = 'idle' | 'running' | 'paused' | 'break';

const SAVE_KEY = 'dehna-work';

const NAV = [
  { href: '/', label: 'Home', icon: <path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" /> },
  { href: '/exercises', label: 'Exercises', icon: <><circle cx="12" cy="5" r="2" /><path d="M12 7v6M6 10l6 1 6-1M9 21l3-8 3 8" /></> },
  { href: '/history', label: 'History', icon: <path d="M5 20V12M12 20V5M19 20v-9" /> },
  { href: '/settings', label: 'Settings', icon: <><circle cx="12" cy="12" r="3" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" /></> },
];

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

  const { startSession, recordBreak, recordPosture, endSession } = useSessionHistory();
  const { posture, since, snoozedUntil, setPosture, snooze } = usePosture();
  const hasDesk = prefs?.hasStandingDesk ?? false;

  // Re-check the posture suggestion every 30 s
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!hasDesk) return;
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, [hasDesk]);
  const { pickRoutine, markShown } = useExercises(prefs);
  const breakPosture = hasDesk ? posture : 'sitting';

  // The coming break is picked when a focus block starts (and re-picked if the
  // posture changes), so the screen can preview it
  const inBlock = mode === 'running' || mode === 'paused';
  const upcoming = useMemo(
    () => (inBlock ? pickRoutine((prefs?.workIntervalMinutes ?? 25) / 60, breakPosture) : null),
    [inBlock, breakPosture, pickRoutine, prefs?.workIntervalMinutes],
  );
  const upcomingRef = useRef<Exercise[] | null>(null);
  useEffect(() => { upcomingRef.current = upcoming; }, [upcoming]);

  const handleWorkComplete = useCallback(() => {
    try { sessionStorage.removeItem(SAVE_KEY); } catch {}
    const hoursWorked = workStartRef.current
      ? (Date.now() - workStartRef.current) / 3_600_000
      : 0.5;
    const newRoutine = upcomingRef.current ?? pickRoutine(hoursWorked, breakPosture);
    markShown(newRoutine);
    setRoutine(newRoutine);
    setMode('break');
    if (prefs?.soundEnabled) playChime();
    if (prefs?.notificationsEnabled) notify('Time for a break!', { body: 'A short movement break is ready.' });
  }, [pickRoutine, markShown, prefs?.soundEnabled, prefs?.notificationsEnabled, breakPosture]);

  const timer = useTimer(
    prefs?.workIntervalMinutes ?? 25,
    handleWorkComplete,
    saved?.restore,
  );

  // Keep liveRef current after every render so the unmount cleanup has fresh values
  useEffect(() => {
    liveRef.current = { timerState: timer.state, elapsed: timer.elapsedSeconds, appMode: mode };
  });

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
    requestPersistentStorage().catch(() => {}); // keep history safe from automatic cleanup
    const id = await startSession();
    setSessionId(id);
    if (hasDesk) await recordPosture(id, posture);
    workStartRef.current = Date.now();
    timer.start();
    setMode('running');
  }, [startSession, timer, hasDesk, recordPosture, posture]);

  const handlePosture = useCallback((next: Posture) => {
    if (next === posture) return;
    setPosture(next);
    if (sessionId !== null) recordPosture(sessionId, next);
  }, [posture, setPosture, sessionId, recordPosture]);

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
    async () => {
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

  const suggestion = hasDesk && now >= snoozedUntil
    ? suggestPosture({
        posture,
        minutesIn: Math.floor((now - since) / 60_000),
        problemAreas: prefs.problemAreas,
        hour: new Date(now).getHours(),
      })
    : null;

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
        gap: 'var(--space-5)',
        padding: 'var(--space-6) var(--space-6) var(--space-5)',
      }}
    >
      {/* The auto margins here and on the nav centre the content in any spare
          height, and let the nav follow it when the screen is too short. */}
      <div style={{ marginTop: 'auto' }}>
        <DeskAvatar posture={hasDesk ? posture : 'sitting'} working={mode === 'running'} />
      </div>

      <TimerRing progress={timer.progress} size={200}>
        <TimerDisplay formattedTime={timer.formattedRemaining} label={timerLabel} />
      </TimerRing>

      {upcoming && upcoming.length > 0 && (
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', textAlign: 'center', maxWidth: 320 }}>
          Next break: {upcoming.slice(0, 2).map((e) => e.name).join(', ')}
          {upcoming.length > 2 && ` and ${upcoming.length - 2} more`}
        </p>
      )}

      {hasDesk && <PostureToggle posture={posture} onChange={handlePosture} />}

      {suggestion && (
        <PostureSuggestionCard
          suggestion={suggestion}
          onAccept={() => handlePosture(suggestion.to)}
          onDismiss={snooze}
        />
      )}

      <TimerControls
        mode={mode}
        onStart={handleStart}
        onPause={handlePause}
        onResume={handleResume}
        onStop={handleStop}
      />

      <nav className="work-nav">
        {NAV.map(({ href, label, icon }) => (
          <Link key={href} href={href} className="work-nav-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {icon}
            </svg>
            {label}
          </Link>
        ))}
      </nav>
    </main>
  );
}
