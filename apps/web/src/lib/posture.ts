import type { Posture, ProblemArea } from '@/types';

export interface PostureSuggestion {
  to: Posture;
  message: string;
}

interface Input {
  posture: Posture;
  minutesIn: number;
  problemAreas: ProblemArea[];
  hour: number;
}

// Loosely follows Cornell's 20-8-2 guidance (sit 20, stand 8, move 2), stretched
// to fit focus blocks: long sitting stretches matter most, standing should stay
// shorter than sitting, and both bend to where the person hurts.
export function suggestPosture({ posture, minutesIn, problemAreas, hour }: Input): PostureSuggestion | null {
  const has = (a: ProblemArea) => problemAreas.includes(a);

  if (posture === 'sitting') {
    let limit = has('back') ? 30 : 45;
    if (hour >= 13 && hour < 15) limit -= 10; // the after-lunch slump is a good time to stand
    if (minutesIn < limit) return null;
    return {
      to: 'standing',
      message: has('back')
        ? `You've been sitting for ${minutesIn} min. Standing for a while takes load off your lower back.`
        : `You've been sitting for ${minutesIn} min. Want to stand for the next stretch of work?`,
    };
  }

  const limit = has('knees-hips') || has('legs') ? 20 : 30;
  if (minutesIn < limit) return null;
  return {
    to: 'sitting',
    message: `You've been standing for ${minutesIn} min. Sitting for a bit gives your legs a rest.`,
  };
}
