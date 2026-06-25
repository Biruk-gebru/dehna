'use client';

import { useCallback, useRef } from 'react';
import type { Exercise, UserPreferences } from '@/types';
import { selectRoutine } from '@/lib/exercise-engine';
import exerciseData from '@/data/exercises.json';

const catalog = exerciseData as Exercise[];

export function useExercises(prefs: UserPreferences | null) {
  const recentIdsRef = useRef<string[]>([]);

  const generateRoutine = useCallback(
    (hoursWorked: number): Exercise[] => {
      if (!prefs) return [];
      const routine = selectRoutine(catalog, prefs, recentIdsRef.current, hoursWorked);
      // Keep last 15 IDs (roughly 3 breaks)
      recentIdsRef.current = [...recentIdsRef.current, ...routine.map((e) => e.id)].slice(-15);
      return routine;
    },
    [prefs],
  );

  return { generateRoutine };
}
