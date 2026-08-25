import { describe, expect, test } from 'vitest';
import { toDateString, computeStreak } from './streak.js';

describe('toDateString', () => {
  test('formats as local YYYY-MM-DD', () => {
    expect(toDateString(new Date(2026, 7, 5))).toBe('2026-08-05');
  });
});

describe('computeStreak', () => {
  test('returns 0 for no completions', () => {
    expect(computeStreak(new Set(), new Date(2026, 7, 25))).toBe(0);
  });

  test('counts consecutive days ending today', () => {
    const dates = new Set(['2026-08-25', '2026-08-24', '2026-08-23']);
    expect(computeStreak(dates, new Date(2026, 7, 25))).toBe(3);
  });

  test('does not break the streak if today is not done yet', () => {
    const dates = new Set(['2026-08-24', '2026-08-23']);
    expect(computeStreak(dates, new Date(2026, 7, 25))).toBe(2);
  });

  test('resets to 0 after a gap', () => {
    const dates = new Set(['2026-08-22', '2026-08-20']);
    expect(computeStreak(dates, new Date(2026, 7, 25))).toBe(0);
  });
});
