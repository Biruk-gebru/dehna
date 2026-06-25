'use client';

import { useCallback } from 'react';
import { db } from '@/lib/db';
import type { BreakRecord } from '@/types';

export function useSessionHistory() {
  const startSession = useCallback(async (): Promise<number> => {
    const id = await db.sessions.add({
      startedAt: new Date().toISOString(),
      endedAt: null,
      durationMinutes: 0,
      breaks: [],
      status: 'active',
    });
    return id as number;
  }, []);

  const recordBreak = useCallback(async (sessionId: number, record: BreakRecord) => {
    const session = await db.sessions.get(sessionId);
    if (!session) return;
    await db.sessions.update(sessionId, { breaks: [...session.breaks, record] });
  }, []);

  const endSession = useCallback(async (sessionId: number) => {
    const session = await db.sessions.get(sessionId);
    if (!session) return;
    const durationMinutes = Math.floor(
      (Date.now() - new Date(session.startedAt).getTime()) / 60000,
    );
    await db.sessions.update(sessionId, {
      endedAt: new Date().toISOString(),
      durationMinutes,
      status: 'completed',
    });
  }, []);

  return { startSession, recordBreak, endSession };
}
