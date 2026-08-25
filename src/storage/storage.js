import { db } from './db.js';

const SETTINGS_KEY = 'settings';
const DEFAULT_SETTINGS = {
  key: SETTINGS_KEY,
  userId: null,
  defaultDuration: 10,
  soundEnabled: true,
};

export async function getSettings() {
  const existing = await db.settings.get(SETTINGS_KEY);
  if (existing) return existing;
  const initial = { ...DEFAULT_SETTINGS, userId: crypto.randomUUID() };
  await db.settings.put(initial);
  return initial;
}

export async function saveSettings(partial) {
  const current = await getSettings();
  const updated = { ...current, ...partial, key: SETTINGS_KEY };
  await db.settings.put(updated);
  return updated;
}

export async function recordCompletion(date, duration) {
  await db.completions.add({ date, duration, completedAt: Date.now() });
}

export async function getCompletionsInRange(startDate, endDate) {
  return db.completions.where('date').between(startDate, endDate, true, true).toArray();
}

export async function getAllCompletionDates() {
  const all = await db.completions.toArray();
  return new Set(all.map((c) => c.date));
}
