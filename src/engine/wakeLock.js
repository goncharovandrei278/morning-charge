let wakeLockSentinel = null;
let generation = 0;

export function isWakeLockSupported() {
  return typeof navigator !== 'undefined' && 'wakeLock' in navigator;
}

export async function requestWakeLock() {
  if (!isWakeLockSupported()) return;
  const token = ++generation;
  try {
    const sentinel = await navigator.wakeLock.request('screen');
    if (token !== generation) {
      // A releaseWakeLock() (or a newer request) happened while this was in flight.
      // Don't let a stale sentinel overwrite the current one — release it instead.
      sentinel.release().catch(() => {});
      return;
    }
    wakeLockSentinel = sentinel;
  } catch {
    if (token === generation) wakeLockSentinel = null;
  }
}

export async function releaseWakeLock() {
  generation += 1;
  if (wakeLockSentinel) {
    const sentinel = wakeLockSentinel;
    wakeLockSentinel = null;
    await sentinel.release();
  }
}

export function attachVisibilityReacquire() {
  if (!isWakeLockSupported()) return () => {};
  const handler = () => {
    if (document.visibilityState === 'visible' && wakeLockSentinel) {
      requestWakeLock();
    }
  };
  document.addEventListener('visibilitychange', handler);
  return () => document.removeEventListener('visibilitychange', handler);
}
