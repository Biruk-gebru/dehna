import type { Exercise, UserPreferences } from '@/types';

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function selectRoutine(
  catalog: Exercise[],
  prefs: UserPreferences,
  recentIds: string[],
  hoursWorked: number,
): Exercise[] {
  const recent = new Set(recentIds);
  let available = catalog.filter(
    (e) => !recent.has(e.id) && (e.difficulty === 'gentle' || e.difficulty === prefs.exerciseDifficulty),
  );
  // If everything is filtered out, reset recency and try again
  if (available.length === 0) {
    available = catalog.filter((e) => e.difficulty === 'gentle' || e.difficulty === prefs.exerciseDifficulty);
  }
  // Last resort: use the full catalog
  if (available.length === 0) available = [...catalog];

  // Mandatory: one cognitive exercise
  const cognitivePool = available.filter((e) => e.type === 'cognitive');
  const cognitive = cognitivePool[Math.floor(Math.random() * cognitivePool.length)];

  // Mandatory: one eye break if flagged or 2+ hours worked
  const needsEye = prefs.problemAreas.includes('eyes') || hoursWorked >= 2;
  const eyePool = available.filter((e) => e.type === 'eye-break');
  const eyeBreak = needsEye && eyePool.length > 0
    ? eyePool[Math.floor(Math.random() * eyePool.length)]
    : null;

  const pinned = [cognitive, eyeBreak].filter(Boolean) as Exercise[];
  const pinnedIds = new Set(pinned.map((e) => e.id));

  // Weight remaining by problem area match
  const fillPool: Exercise[] = [];
  for (const ex of available) {
    if (pinnedIds.has(ex.id)) continue;
    const matches = ex.targetAreas.some((a) => prefs.problemAreas.includes(a));
    const weight = matches ? 3 : 1;
    for (let i = 0; i < weight; i++) fillPool.push(ex);
  }

  const targetSeconds = prefs.breakDurationMinutes * 60;
  let filled = [...pinned];
  let totalDur = filled.reduce((s, e) => s + e.duration, 0);
  const seen = new Set(pinnedIds);

  for (const ex of shuffle(fillPool)) {
    if (seen.has(ex.id)) continue;
    if (filled.length >= 5) break;
    if (totalDur + ex.duration <= targetSeconds + 30) {
      filled.push(ex);
      seen.add(ex.id);
      totalDur += ex.duration;
    }
  }

  // Cognitives at the end (wind-down)
  const nonCog = shuffle(filled.filter((e) => e.type !== 'cognitive'));
  const cogs = filled.filter((e) => e.type === 'cognitive');
  return [...nonCog, ...cogs];
}
