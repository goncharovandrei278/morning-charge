export function initWorkoutState(blocks) {
  return { blocks, currentIndex: 0, status: blocks.length > 0 ? 'active' : 'complete' };
}

export function workoutReducer(state, action) {
  switch (action.type) {
    case 'PAUSE':
      if (state.status !== 'active') return state;
      return { ...state, status: 'paused' };
    case 'RESUME':
      if (state.status !== 'paused') return state;
      return { ...state, status: 'active' };
    case 'COMPLETE_BLOCK': {
      if (state.status !== 'active') return state;
      const nextIndex = state.currentIndex + 1;
      if (nextIndex >= state.blocks.length) {
        return { ...state, currentIndex: nextIndex, status: 'complete' };
      }
      return { ...state, currentIndex: nextIndex };
    }
    default:
      return state;
  }
}

export function currentBlock(state) {
  return state.blocks[state.currentIndex] ?? null;
}
