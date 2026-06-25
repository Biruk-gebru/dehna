import { db } from './db';

export async function exportData(): Promise<void> {
  const preferences = await db.preferences.toArray();
  const sessions = await db.sessions.toArray();
  const payload = { preferences, sessions, exportedAt: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dehna-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importData(file: File): Promise<void> {
  const text = await file.text();
  const data = JSON.parse(text) as {
    preferences?: unknown[];
    sessions?: unknown[];
  };
  if (Array.isArray(data.preferences)) await db.preferences.bulkPut(data.preferences as Parameters<typeof db.preferences.bulkPut>[0]);
  if (Array.isArray(data.sessions)) await db.sessions.bulkPut(data.sessions as Parameters<typeof db.sessions.bulkPut>[0]);
}

export async function clearAllData(): Promise<void> {
  await db.preferences.clear();
  await db.sessions.clear();
}
