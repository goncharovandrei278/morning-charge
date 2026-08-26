import { beforeEach, describe, expect, test } from 'vitest';
import { db } from './db.js';
import {
  getSettings,
  saveSettings,
  recordCompletion,
  getCompletionsInRange,
  getAllCompletionDates,
} from './storage.js';

beforeEach(async () => {
  await db.completions.clear();
  await db.settings.clear();
});

describe('settings', () => {
  test('getSettings creates and returns defaults on first call', async () => {
    const settings = await getSettings();
    expect(settings.defaultDuration).toBe(10);
    expect(settings.soundEnabled).toBe(true);
    expect(typeof settings.userId).toBe('string');
  });

  test('getSettings returns the same userId on repeated calls', async () => {
    const first = await getSettings();
    const second = await getSettings();
    expect(second.userId).toBe(first.userId);
  });

  test('saveSettings merges a partial update', async () => {
    await getSettings();
    const updated = await saveSettings({ defaultDuration: 15 });
    expect(updated.defaultDuration).toBe(15);
    expect(updated.soundEnabled).toBe(true);
  });
});

describe('completions', () => {
  test('recordCompletion then getAllCompletionDates returns the date', async () => {
    await recordCompletion('2026-08-25', 10);
    const dates = await getAllCompletionDates();
    expect(dates.has('2026-08-25')).toBe(true);
  });

  test('getCompletionsInRange filters by date range inclusive', async () => {
    await recordCompletion('2026-08-20', 5);
    await recordCompletion('2026-08-25', 10);
    await recordCompletion('2026-08-30', 15);
    const inRange = await getCompletionsInRange('2026-08-21', '2026-08-29');
    expect(inRange.map((c) => c.date)).toEqual(['2026-08-25']);
  });
});
