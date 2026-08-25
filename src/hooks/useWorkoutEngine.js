import { useEffect, useReducer, useRef, useState } from 'react';
import { workoutReducer, initWorkoutState, currentBlock } from '../engine/workoutReducer.js';
import { computeRemainingMs } from '../engine/timer.js';
import { speak, cancelSpeech } from '../engine/voice.js';
import { requestWakeLock, releaseWakeLock, attachVisibilityReacquire } from '../engine/wakeLock.js';

const TICK_MS = 100;

export function useWorkoutEngine(blocks, options = {}) {
  const { soundEnabled = true } = options;
  const [state, dispatch] = useReducer(workoutReducer, blocks, initWorkoutState);
  const block = currentBlock(state);
  const blockDurationMs = block?.unit === 'time' ? block.seconds * 1000 : 0;
  const [remainingMs, setRemainingMs] = useState(blockDurationMs);
  const timingRef = useRef({ startedAt: Date.now(), pausedAccumMs: 0, pausedAt: null });
  const soundEnabledRef = useRef(soundEnabled);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    timingRef.current = { startedAt: Date.now(), pausedAccumMs: 0, pausedAt: null };
    setRemainingMs(blockDurationMs);
    if (block && soundEnabledRef.current) speak(block.name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.currentIndex]);

  useEffect(() => {
    requestWakeLock();
    const detach = attachVisibilityReacquire();
    return () => {
      detach();
      releaseWakeLock();
      cancelSpeech();
    };
  }, []);

  useEffect(() => {
    if (state.status !== 'active' || block?.unit !== 'time') return undefined;
    const interval = setInterval(() => {
      const { startedAt, pausedAccumMs } = timingRef.current;
      const remaining = computeRemainingMs(startedAt, pausedAccumMs, blockDurationMs);
      setRemainingMs(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        dispatch({ type: 'COMPLETE_BLOCK' });
      }
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [state.status, state.currentIndex, block, blockDurationMs]);

  function pause() {
    timingRef.current.pausedAt = Date.now();
    dispatch({ type: 'PAUSE' });
  }

  function resume() {
    const { pausedAt, pausedAccumMs } = timingRef.current;
    if (pausedAt) {
      timingRef.current.pausedAccumMs = pausedAccumMs + (Date.now() - pausedAt);
      timingRef.current.pausedAt = null;
    }
    dispatch({ type: 'RESUME' });
  }

  function completeRepsBlock() {
    cancelSpeech();
    dispatch({ type: 'COMPLETE_BLOCK' });
  }

  return { state, block, remainingMs, pause, resume, completeRepsBlock };
}
