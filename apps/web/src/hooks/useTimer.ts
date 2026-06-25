'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { formatTime } from '@/lib/timer';

export type TimerState = 'idle' | 'running' | 'paused';

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

export function useTimer(intervalMinutes: number, onComplete: () => void): TimerHandle {
  const totalSeconds = intervalMinutes * 60;

  const [state, setState] = useState<TimerState>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const startTimeRef = useRef<number | null>(null);
  const accumulatedRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCompleteRef = useRef(onComplete);
  const totalSecondsRef = useRef(totalSeconds);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    totalSecondsRef.current = totalSeconds;
  }, [totalSeconds]);

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
      const cap = totalSecondsRef.current;

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

  const start = useCallback(() => {
    clearTick();
    startTimeRef.current = Date.now();
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
    startTimeRef.current = null;
    accumulatedRef.current = 0;
    setElapsedSeconds(0);
    setState('idle');
  }, [clearTick]);

  useEffect(() => {
    return clearTick;
  }, [clearTick]);

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
