import { describe, expect, test } from 'vitest';
import { initWorkoutState, workoutReducer, currentBlock } from './workoutReducer.js';

const blocks = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];

describe('initWorkoutState', () => {
  test('starts active at index 0', () => {
    const state = initWorkoutState(blocks);
    expect(state.status).toBe('active');
    expect(state.currentIndex).toBe(0);
  });

  test('starts complete for an empty block list', () => {
    const state = initWorkoutState([]);
    expect(state.status).toBe('complete');
  });
});

describe('workoutReducer', () => {
  test('COMPLETE_BLOCK advances to the next index', () => {
    const state = workoutReducer(initWorkoutState(blocks), { type: 'COMPLETE_BLOCK' });
    expect(state.currentIndex).toBe(1);
    expect(state.status).toBe('active');
  });

  test('COMPLETE_BLOCK on the last block sets status to complete', () => {
    let state = initWorkoutState(blocks);
    state = workoutReducer(state, { type: 'COMPLETE_BLOCK' });
    state = workoutReducer(state, { type: 'COMPLETE_BLOCK' });
    state = workoutReducer(state, { type: 'COMPLETE_BLOCK' });
    expect(state.status).toBe('complete');
  });

  test('PAUSE then RESUME returns to active without changing index', () => {
    let state = initWorkoutState(blocks);
    state = workoutReducer(state, { type: 'PAUSE' });
    expect(state.status).toBe('paused');
    state = workoutReducer(state, { type: 'RESUME' });
    expect(state.status).toBe('active');
    expect(state.currentIndex).toBe(0);
  });

  test('COMPLETE_BLOCK is ignored while paused', () => {
    let state = initWorkoutState(blocks);
    state = workoutReducer(state, { type: 'PAUSE' });
    state = workoutReducer(state, { type: 'COMPLETE_BLOCK' });
    expect(state.currentIndex).toBe(0);
    expect(state.status).toBe('paused');
  });
});

describe('currentBlock', () => {
  test('returns the block at currentIndex, or null when complete', () => {
    const state = initWorkoutState(blocks);
    expect(currentBlock(state)).toEqual({ id: 'a' });
    expect(currentBlock(initWorkoutState([]))).toBeNull();
  });
});
