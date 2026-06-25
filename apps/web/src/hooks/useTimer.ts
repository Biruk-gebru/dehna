'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { formatTime } from '@/lib/timer';

export type TimerState = 'idle' | 'running' | 'paused';

export interface TimerRestore {
  elapsedSeconds: number;
  state: 'running' | 'paused';
}

export interface TimerHandle {
  state: TimerState;
  elapsedSeconds: number;
  remainingSeconds: number;
  progress: number;
  formattedRemaining: string;
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
}

export function useTimer(
  intervalMinutes: number,
  onComplete: () => void,
  restore?: TimerRestore,
): TimerHandle {
  const totalSeconds = intervalMinutes * 60;

  const [state, setState] = useState<TimerState>(restore?.state ?? 'idle');
  const [elapsedSeconds, setElapsedSeconds] = useState(restore?.elapsedSeconds ?? 0);

  // Seed accumulated from restore so pause/resume math stays consistent
  const startTimeRef  = useRef<number | null>(null);
  const accumulatedRef = useRef<number>(restore?.elapsedSeconds ?? 0);
  const intervalRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCompleteRef  = useRef(onComplete);
  const totalSecondsRef = useRef(totalSeconds);

  useEffect(() => { onCompleteRef.current  = onComplete; }, [onComplete]);
  useEffect(() => { totalSecondsRef.current = totalSeconds; }, [totalSeconds]);

  const clearTick = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTick = useCallback(() => {
    clearTick();
    intervalRef.current = setInterval(() => {
      if (startTimeRef.current === null) return;
      const runSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const total = accumulatedRef.current + runSeconds;
      const cap   = totalSecondsRef.current;

      if (total >= cap) {
        clearTick();
        setElapsedSeconds(cap);
        setState('idle');
        onCompleteRef.current();
      } else {
        setElapsedSeconds(total);
      }
    }, 500);
  }, [clearTick]);

  // On mount, resume if restored in running state.
  // Returns a cleanup so React StrictMode's double-invoke tears down cleanly.
  useEffect(() => {
    if (!restore || restore.state !== 'running') return;
    startTimeRef.current = Date.now();
    startTick();
    return () => {
      clearTick();
      startTimeRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const start = useCallback(() => {
    clearTick();
    startTimeRef.current   = Date.now();
    accumulatedRef.current = 0;
    setElapsedSeconds(0);
    setState('running');
    startTick();
  }, [clearTick, startTick]);

  const pause = useCallback(() => {
    if (startTimeRef.current !== null) {
      accumulatedRef.current += Math.floor((Date.now() - startTimeRef.current) / 1000);
      startTimeRef.current = null;
    }
    clearTick();
    setState('paused');
  }, [clearTick]);

  const resume = useCallback(() => {
    startTimeRef.current = Date.now();
    setState('running');
    startTick();
  }, [startTick]);

  const stop = useCallback(() => {
    clearTick();
    startTimeRef.current   = null;
    accumulatedRef.current = 0;
    setElapsedSeconds(0);
    setState('idle');
  }, [clearTick]);

  useEffect(() => clearTick, [clearTick]);

  const remaining = Math.max(0, totalSeconds - elapsedSeconds);

  return {
    state,
    elapsedSeconds,
    remainingSeconds: remaining,
    progress: totalSeconds > 0 ? elapsedSeconds / totalSeconds : 0,
    formattedRemaining: formatTime(remaining),
    start,
    pause,
    resume,
    stop,
  };
}
