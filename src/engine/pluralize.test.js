import { describe, expect, test } from 'vitest';
import { pluralizeDays } from './pluralize.js';

describe('pluralizeDays', () => {
  test('uses "день" for 1, 21, 31', () => {
    expect(pluralizeDays(1)).toBe('день');
    expect(pluralizeDays(21)).toBe('день');
    expect(pluralizeDays(31)).toBe('день');
  });

  test('uses "дня" for 2-4, 22-24', () => {
    expect(pluralizeDays(2)).toBe('дня');
    expect(pluralizeDays(3)).toBe('дня');
    expect(pluralizeDays(4)).toBe('дня');
    expect(pluralizeDays(22)).toBe('дня');
  });

  test('uses "дней" for 0, 5-20, 25, 11-14', () => {
    expect(pluralizeDays(0)).toBe('дней');
    expect(pluralizeDays(5)).toBe('дней');
    expect(pluralizeDays(11)).toBe('дней');
    expect(pluralizeDays(12)).toBe('дней');
    expect(pluralizeDays(13)).toBe('дней');
    expect(pluralizeDays(14)).toBe('дней');
    expect(pluralizeDays(20)).toBe('дней');
    expect(pluralizeDays(25)).toBe('дней');
  });
});
