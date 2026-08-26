import { describe, expect, test } from 'vitest';
import { getDayContent } from './content.js';

describe('getDayContent', () => {
  test('returns only exercises tagged for the requested duration or lower', () => {
    const content = getDayContent(0, 5);
    expect(content.dayIndex).toBe(0);
    expect(content.duration).toBe(5);
    expect(content.blocks.length).toBe(6);
    expect(content.blocks.every((b) => typeof b.name === 'string')).toBe(true);
  });

  test('10-minute list is a superset of the 5-minute list', () => {
    const five = getDayContent(0, 5).blocks.map((b) => b.id);
    const ten = getDayContent(0, 10).blocks.map((b) => b.id);
    expect(ten.length).toBeGreaterThan(five.length);
    expect(five.every((id, i) => ten[i] === id)).toBe(true);
  });

  test('throws on unknown dayIndex', () => {
    expect(() => getDayContent(9, 5)).toThrow('Unknown dayIndex: 9');
  });
});
