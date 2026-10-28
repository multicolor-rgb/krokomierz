import Dexie, { type Table } from 'dexie';
import type { AchievementState, DayLog } from './types';

interface KV {
  key: string;
  value: unknown;
}

class KrokomierzDB extends Dexie {
  days!: Table<DayLog, string>;
  kv!: Table<KV, string>;

  constructor() {
    super('krokomierz');
    this.version(1).stores({
      days: 'date',
      kv: 'key',
    });
  }
}

export const db = new KrokomierzDB();

export async function getKV<T>(key: string, fallback: T): Promise<T> {
  try {
    const row = await db.kv.get(key);
    return row ? (row.value as T) : fallback;
  } catch {
    return fallback;
  }
}

export async function setKV(key: string, value: unknown): Promise<void> {
  await db.kv.put({ key, value });
}

export async function loadDays(limit = 400): Promise<DayLog[]> {
  const all = await db.days.orderBy('date').reverse().limit(limit).toArray();
  return all.reverse();
}

export async function saveDay(log: DayLog): Promise<void> {
  await db.days.put(log);
}

export async function loadAchievements(): Promise<Record<string, AchievementState>> {
  const rows = await db.kv.get('achievements');
  const list = (rows?.value as AchievementState[] | undefined) ?? [];
  return Object.fromEntries(list.map((a) => [a.id, a]));
}

export async function saveAchievements(map: Record<string, AchievementState>): Promise<void> {
  await setKV('achievements', Object.values(map));
}

export async function clearAll(): Promise<void> {
  await db.delete();
}
