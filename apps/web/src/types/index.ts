export type ProblemArea =
  | 'back'
  | 'neck'
  | 'shoulders'
  | 'wrists-elbows'
  | 'knees-hips'
  | 'eyes'
  | 'legs'
  | 'general';

export type Theme = 'sage-coral' | 'earth-terracotta' | 'warm-clay' | 'studio';

export interface UserPreferences {
  id: 1;
  problemAreas: ProblemArea[];
  workIntervalMinutes: number;
  breakDurationMinutes: number;
  exerciseDifficulty: 'gentle' | 'moderate';
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  theme: Theme;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BreakRecord {
  startedAt: string;
  durationSeconds: number;
  exercisesShown: string[];
  completed: boolean;
}

export interface WorkSession {
  id?: number;
  startedAt: string;
  endedAt: string | null;
  durationMinutes: number;
  breaks: BreakRecord[];
  status: 'active' | 'completed' | 'abandoned';
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  targetAreas: ProblemArea[];
  duration: 30 | 45 | 60 | 90;
  difficulty: 'gentle' | 'moderate';
  type: 'stretch' | 'mobility' | 'strength' | 'cognitive' | 'eye-break';
  steps: string[];
  tips: string[];
}
