export function computeElapsedMs(startedAt, pausedAccumMs, now = Date.now()) {
  return now - startedAt - pausedAccumMs;
}

export function computeRemainingMs(startedAt, pausedAccumMs, blockDurationMs, now = Date.now()) {
  const elapsed = computeElapsedMs(startedAt, pausedAccumMs, now);
  return Math.max(0, blockDurationMs - elapsed);
}
