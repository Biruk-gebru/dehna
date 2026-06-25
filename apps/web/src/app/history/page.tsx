'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import type { WorkSession } from '@/types';

function fmt(minutes: number) {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function fmtDay(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
}

function calcStats(sessions: WorkSession[]) {
  const todayStr = new Date().toISOString().slice(0, 10);
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  const completed = sessions.filter((s) => s.status === 'completed');

  const todayMinutes = completed
    .filter((s) => s.startedAt.startsWith(todayStr))
    .reduce((sum, s) => sum + s.durationMinutes, 0);

  const weekMinutes = completed
    .filter((s) => new Date(s.startedAt).getTime() >= weekAgo)
    .reduce((sum, s) => sum + s.durationMinutes, 0);

  const allBreaks = sessions.flatMap((s) => s.breaks);
  const completionRate =
    allBreaks.length > 0
      ? Math.round((allBreaks.filter((b) => b.completed).length / allBreaks.length) * 100)
      : 0;

  // Streak: consecutive days going back from today
  const daySet = new Set(completed.map((s) => s.startedAt.slice(0, 10)));
  let streak = 0;
  const cur = new Date();
  while (daySet.has(cur.toISOString().slice(0, 10))) {
    streak++;
    cur.setDate(cur.getDate() - 1);
  }

  return { todayMinutes, weekMinutes, completionRate, streak };
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState<WorkSession[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSessions = useCallback(() => {
    db.sessions
      .orderBy('startedAt')
      .reverse()
      .toArray()
      .then((rows) => {
        setSessions(rows.filter((s) => s.status !== 'active'));
        setLoading(false);
      });
  }, []);

  useEffect(() => { loadSessions(); }, [loadSessions]);

  const handleDelete = useCallback(async (id: number) => {
    await db.sessions.delete(id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // Group by day
  const grouped = sessions.reduce<Record<string, WorkSession[]>>((acc, s) => {
    const day = s.startedAt.slice(0, 10);
    (acc[day] ??= []).push(s);
    return acc;
  }, {});

  const stats = calcStats(sessions);

  const labelStyle: React.CSSProperties = {
    fontSize: 'var(--font-size-xs)',
    color: 'var(--color-text-muted)',
    marginTop: 'var(--space-1)',
  };

  const valueStyle: React.CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--font-size-lg)',
    fontWeight: 'var(--font-weight-medium)',
    color: 'var(--color-text)',
  };

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)', display: 'flex', flexDirection: 'column' }}>

      {/* Nav */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid var(--color-border)' }}>
        <Link href="/" style={{ fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-base)', color: 'var(--color-text)', textDecoration: 'none', letterSpacing: '-0.01em' }}>
          ደህና
        </Link>
        <Link href="/work" style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', textDecoration: 'none' }}>
          ← Work
        </Link>
      </nav>

      <div style={{ maxWidth: 520, width: '100%', margin: '0 auto', padding: 'var(--space-7) var(--space-6)' }}>
      <h1 style={{ fontSize: 'clamp(1.6rem, 5vw, 2rem)', fontWeight: 'var(--font-weight-light)', color: 'var(--color-text)', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 'var(--space-7)' }}>
        History
      </h1>

      {/* Stats row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-7)',
          paddingBottom: 'var(--space-6)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div>
          <div style={valueStyle}>{fmt(stats.todayMinutes)}</div>
          <div style={labelStyle}>today</div>
        </div>
        <div>
          <div style={valueStyle}>{fmt(stats.weekMinutes)}</div>
          <div style={labelStyle}>this week</div>
        </div>
        <div>
          <div style={valueStyle}>{stats.completionRate}%</div>
          <div style={labelStyle}>break rate</div>
        </div>
        <div>
          <div style={valueStyle}>{stats.streak}d</div>
          <div style={labelStyle}>streak</div>
        </div>
      </div>

      {loading && (
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>Loading…</p>
      )}

      {!loading && sessions.length === 0 && (
        <div style={{ textAlign: 'center', padding: 'var(--space-9) 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)' }}>
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
            <rect x="8" y="12" width="32" height="28" rx="4" stroke="var(--color-border)" strokeWidth="2" fill="none" />
            <path d="M16 20h16M16 27h10" stroke="var(--color-border)" strokeWidth="2" strokeLinecap="round" />
            <circle cx="36" cy="12" r="6" fill="var(--color-primary)" />
            <path d="M33 12h6M36 9v6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <div>
            <p style={{ fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text)', fontSize: 'var(--font-size-base)' }}>No sessions yet</p>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-1)' }}>
              Complete a work session to see it here.
            </p>
          </div>
          <Link href="/work" className="btn btn-primary btn-sm">Start a session</Link>
        </div>
      )}

      {Object.entries(grouped).map(([day, daySessions]) => (
        <section key={day} style={{ marginBottom: 'var(--space-6)' }}>
          <h2
            style={{
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-text-muted)',
              marginBottom: 'var(--space-3)',
            }}
          >
            {fmtDay(day + 'T12:00:00')}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {daySessions.map((s) => {
              const total = s.breaks.length;
              const done = s.breaks.filter((b) => b.completed).length;
              return (
                <div
                  key={s.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--space-4)',
                    backgroundColor: 'var(--color-surface)',
                    borderRadius: 'var(--radius-md)',
                    gap: 'var(--space-3)',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text)' }}>
                      {fmtTime(s.startedAt)}
                    </span>
                    {total > 0 && (
                      <span
                        style={{
                          marginLeft: 'var(--space-3)',
                          fontSize: 'var(--font-size-xs)',
                          color: done === total ? 'var(--color-success)' : 'var(--color-text-muted)',
                        }}
                      >
                        {done}/{total} breaks
                      </span>
                    )}
                  </div>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--font-size-sm)',
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    {fmt(s.durationMinutes)}
                  </span>
                  <button
                    onClick={() => handleDelete(s.id as number)}
                    aria-label={`Delete session from ${fmtTime(s.startedAt)}`}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--color-border)',
                      fontSize: '1rem',
                      lineHeight: 1,
                      padding: '2px 4px',
                      borderRadius: 'var(--radius-sm)',
                      flexShrink: 0,
                    }}
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      ))}
      </div>
    </main>
  );
}
