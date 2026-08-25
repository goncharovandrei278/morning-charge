let wakeLockSentinel = null;

export function isWakeLockSupported() {
  return typeof navigator !== 'undefined' && 'wakeLock' in navigator;
}

export async function requestWakeLock() {
  if (!isWakeLockSupported()) return;
  try {
    wakeLockSentinel = await navigator.wakeLock.request('screen');
  } catch {
    wakeLockSentinel = null;
  }
}

export async function releaseWakeLock() {
  if (wakeLockSentinel) {
    await wakeLockSentinel.release();
    wakeLockSentinel = null;
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
