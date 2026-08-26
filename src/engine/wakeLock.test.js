import { afterEach, describe, expect, test, vi } from 'vitest';
import {
  isWakeLockSupported,
  requestWakeLock,
  releaseWakeLock,
  attachVisibilityReacquire,
} from './wakeLock.js';

describe('when wakeLock is unavailable', () => {
  test('isWakeLockSupported is false and requestWakeLock resolves without throwing', async () => {
    expect(isWakeLockSupported()).toBe(false);
    await expect(requestWakeLock()).resolves.toBeUndefined();
    const detach = attachVisibilityReacquire();
    expect(typeof detach).toBe('function');
    detach();
  });
});

describe('when wakeLock is available', () => {
  afterEach(() => {
    delete navigator.wakeLock;
  });

  test('requestWakeLock calls navigator.wakeLock.request("screen")', async () => {
    const sentinel = { release: vi.fn().mockResolvedValue(undefined) };
    const request = vi.fn().mockResolvedValue(sentinel);
    navigator.wakeLock = { request };

    await requestWakeLock();
    expect(request).toHaveBeenCalledWith('screen');

    await releaseWakeLock();
    expect(sentinel.release).toHaveBeenCalledTimes(1);
  });
});
