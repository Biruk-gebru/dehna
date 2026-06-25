'use client';

import { useCallback, useRef } from 'react';
import type { Exercise, UserPreferences } from '@/types';
import { selectRoutine } from '@/lib/exercise-engine';
import exerciseData from '@/data/exercises.json';

const catalog = exerciseData as Exercise[];
const RECENT_KEY = 'dehna-recent-exercises';

function loadRecent(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(sessionStorage.getItem(RECENT_KEY) ?? '[]');
  } catch { return []; }
}

function saveRecent(ids: string[]): void {
  try { sessionStorage.setItem(RECENT_KEY, JSON.stringify(ids)); } catch {}
}

export function useExercises(prefs: UserPreferences | null) {
  const recentIdsRef = useRef<string[]>(loadRecent());

  const generateRoutine = useCallback(
    (hoursWorked: number): Exercise[] => {
      if (!prefs) return [];
      const routine = selectRoutine(catalog, prefs, recentIdsRef.current, hoursWorked);
      recentIdsRef.current = [...recentIdsRef.current, ...routine.map((e) => e.id)].slice(-15);
      saveRecent(recentIdsRef.current);
      return routine;
    },
    [prefs],
  );

  return { generateRoutine };
}
