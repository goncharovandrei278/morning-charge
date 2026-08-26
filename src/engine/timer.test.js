import { describe, expect, test } from 'vitest';
import { computeElapsedMs, computeRemainingMs } from './timer.js';

describe('computeElapsedMs', () => {
  test('is now minus startedAt minus paused time', () => {
    expect(computeElapsedMs(1000, 200, 3000)).toBe(1800);
  });
});

describe('computeRemainingMs', () => {
  test('is block duration minus elapsed', () => {
    expect(computeRemainingMs(1000, 0, 5000, 3000)).toBe(3000);
  });

  test('clamps to 0 instead of going negative', () => {
    expect(computeRemainingMs(1000, 0, 2000, 10000)).toBe(0);
  });
});
