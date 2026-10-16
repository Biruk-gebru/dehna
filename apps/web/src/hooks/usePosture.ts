'use client';

import { useCallback, useState } from 'react';
import type { Posture } from '@/types';

const KEY = 'dehna-posture';
const STALE_MS = 12 * 60 * 60 * 1000;

type Stored = { posture: Posture; since: number; snoozedUntil?: number };

function load(): Stored {
  const fresh: Stored = { posture: 'sitting', since: Date.now() };
  if (typeof window === 'undefined') return fresh;
  try {
    const s: Stored = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    // A posture from yesterday says nothing about how long you've been in it now
    return s && Date.now() - s.since < STALE_MS ? s : fresh;
  } catch {
    return fresh;
  }
}

const SNOOZE_MS = 20 * 60 * 1000;

function save(s: Stored) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
}

/** Current sitting/standing posture and when it started, kept across reloads. */
export function usePosture() {
  const [state, setState] = useState<Stored>(load);

  const setPosture = useCallback((posture: Posture) => {
    const next = { posture, since: Date.now() };
    setState(next);
    save(next);
  }, []);

  // "Not now" on a suggestion: hold off for a while before asking again
  const snooze = useCallback(() => {
    setState((s) => {
      const next = { ...s, snoozedUntil: Date.now() + SNOOZE_MS };
      save(next);
      return next;
    });
  }, []);

  return { posture: state.posture, since: state.since, snoozedUntil: state.snoozedUntil ?? 0, setPosture, snooze };
}
