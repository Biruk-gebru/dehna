import Dexie from 'dexie';
import { db } from './db';

export async function exportData(): Promise<void> {
  download({ preferences: await db.preferences.toArray(), sessions: await db.sessions.toArray() });
}

/**
 * Exports straight from whatever database is on disk, without the app's schema.
 * Opening Dexie with no declared version works even when the normal open fails
 * (e.g. a newer app version left a higher schema), so data can always be rescued.
 * The file has the same shape as a normal backup, so Import backup accepts it.
 */
export async function exportRawData(): Promise<void> {
  const raw = new Dexie('dehna');
  await raw.open();
  const has = (name: string) => raw.tables.some((t) => t.name === name);
  download({
    preferences: has('preferences') ? await raw.table('preferences').toArray() : [],
    sessions: has('sessions') ? await raw.table('sessions').toArray() : [],
  });
  raw.close();
}

export async function deleteDatabase(): Promise<void> {
  await Dexie.delete('dehna');
}

function download(data: { preferences: unknown[]; sessions: unknown[] }): void {
  const payload = { ...data, exportedAt: new Date().toISOString() };
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

/**
 * Asks the browser to keep this site's data instead of treating it as cache it
 * may evict under storage pressure (or, in Safari, after a week without a visit).
 * Chrome decides silently, Firefox asks the user, so call this right after a click.
 */
export async function requestPersistentStorage(): Promise<boolean> {
  if (!navigator.storage?.persist) return false;
  if (await navigator.storage.persisted()) return true;
  return navigator.storage.persist();
}

export async function isStoragePersistent(): Promise<boolean> {
  return (await navigator.storage?.persisted?.()) ?? false;
}

export async function clearAllData(): Promise<void> {
  await db.preferences.clear();
  await db.sessions.clear();
}
