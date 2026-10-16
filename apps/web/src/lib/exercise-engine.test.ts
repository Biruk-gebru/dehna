import { describe, expect, it } from 'vitest';
import exercisesData from '@/data/exercises.json';
import { selectRoutine } from './exercise-engine';
import type { Exercise, UserPreferences } from '@/types';

const catalog = exercisesData as Exercise[];
const prefs = {
  problemAreas: ['neck'], exerciseDifficulty: 'gentle', breakDurationMinutes: 5,
} as UserPreferences;

const many = (n: number, f: () => Exercise[]) => Array.from({ length: n }, f);

describe('selectRoutine', () => {
  it('always includes a mental exercise, and puts mental ones last as a wind-down', () => {
    for (const r of many(200, () => selectRoutine(catalog, prefs, [], 0.5))) {
      const firstMental = r.findIndex((e) => e.type === 'cognitive');
      expect(firstMental).toBeGreaterThanOrEqual(0);
      expect(r.slice(firstMental).every((e) => e.type === 'cognitive')).toBe(true);
    }
  });

  it('stays within the break length plus a 30 second allowance, and five moves', () => {
    for (const r of many(200, () => selectRoutine(catalog, prefs, [], 0.5))) {
      expect(r.reduce((t, e) => t + e.duration, 0)).toBeLessThanOrEqual(5 * 60 + 30);
      expect(r.length).toBeLessThanOrEqual(5);
    }
  });

  it('never repeats a recently shown exercise when there are alternatives', () => {
    const recent = selectRoutine(catalog, prefs, [], 0.5).map((e) => e.id);
    for (const r of many(100, () => selectRoutine(catalog, prefs, recent, 0.5))) {
      expect(r.some((e) => recent.includes(e.id) && e.type !== 'cognitive')).toBe(false);
    }
  });

  it('adds an eye break after two hours of work', () => {
    for (const r of many(50, () => selectRoutine(catalog, prefs, [], 2))) {
      expect(r.some((e) => e.type === 'eye-break')).toBe(true);
    }
  });

  it('favours exercises that fit the current posture', () => {
    const standingIds = new Set(catalog.filter((e) => e.id.includes('standing') || e.name.startsWith('Standing')).map((e) => e.id));
    const fits = (e: Exercise) => standingIds.has(e.id);
    const count = (withFit: boolean) => many(800, () => selectRoutine(catalog, prefs, [], 0.5, withFit ? fits : undefined))
      .flat().filter((e) => standingIds.has(e.id)).length;
    expect(count(true)).toBeGreaterThan(count(false) * 1.5);
  });
});
