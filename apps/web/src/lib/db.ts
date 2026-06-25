import Dexie, { type Table } from 'dexie';
import type { UserPreferences, WorkSession, Exercise } from '@/types';

class DehnaDatabase extends Dexie {
  preferences!: Table<UserPreferences>;
  sessions!: Table<WorkSession>;
  exercises!: Table<Exercise>;

  constructor() {
    super('dehna');
    this.version(1).stores({
      preferences: 'id',
      sessions: '++id, startedAt, status',
      exercises: 'id, *targetAreas, difficulty, type',
    });
  }
}

export const db = new DehnaDatabase();

export const DEFAULT_PREFERENCES: Omit<UserPreferences, 'createdAt' | 'updatedAt'> = {
  id: 1,
  problemAreas: ['general'],
  workIntervalMinutes: 25,
  breakDurationMinutes: 5,
  exerciseDifficulty: 'gentle',
  soundEnabled: false,
  notificationsEnabled: true,
  theme: 'earth-terracotta',
  onboardingCompleted: false,
};
