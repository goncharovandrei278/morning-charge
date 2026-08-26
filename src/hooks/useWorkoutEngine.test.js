import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { useWorkoutEngine } from './useWorkoutEngine.js';

const blocks = [
  { id: 'time-block', unit: 'time', seconds: 1, name: 'Планка' },
  { id: 'reps-block', unit: 'reps', reps: 10, name: 'Отжимания' },
];

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useWorkoutEngine', () => {
  test('auto-advances a time block when it expires', () => {
    const { result } = renderHook(() => useWorkoutEngine(blocks));
    expect(result.current.state.currentIndex).toBe(0);

    act(() => {
      vi.advanceTimersByTime(1200);
    });

    expect(result.current.state.currentIndex).toBe(1);
    expect(result.current.block.id).toBe('reps-block');
  });

  test('a reps block only advances via completeRepsBlock', () => {
    const { result } = renderHook(() => useWorkoutEngine(blocks));

    act(() => {
      vi.advanceTimersByTime(1200);
    });
    expect(result.current.block.id).toBe('reps-block');

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current.state.currentIndex).toBe(1);

    act(() => {
      result.current.completeRepsBlock();
    });
    expect(result.current.state.status).toBe('complete');
  });

  test('pause stops a time block from advancing', () => {
    const { result } = renderHook(() => useWorkoutEngine(blocks));

    act(() => {
      result.current.pause();
    });
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.state.currentIndex).toBe(0);
    expect(result.current.state.status).toBe('paused');
  });

  test('resume lets a paused time block continue toward completion', () => {
    const { result } = renderHook(() => useWorkoutEngine(blocks));

    act(() => {
      result.current.pause();
    });
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    act(() => {
      result.current.resume();
    });
    act(() => {
      vi.advanceTimersByTime(1200);
    });

    expect(result.current.state.currentIndex).toBe(1);
  });
});
