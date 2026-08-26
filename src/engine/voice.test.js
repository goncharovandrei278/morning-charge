import { afterEach, describe, expect, test, vi } from 'vitest';
import { isSpeechSupported, speak, cancelSpeech } from './voice.js';

describe('when speechSynthesis is unavailable', () => {
  test('isSpeechSupported is false and speak/cancelSpeech do not throw', () => {
    expect(isSpeechSupported()).toBe(false);
    expect(() => speak('hello')).not.toThrow();
    expect(() => cancelSpeech()).not.toThrow();
  });
});

describe('when speechSynthesis is available', () => {
  afterEach(() => {
    delete window.speechSynthesis;
    delete window.SpeechSynthesisUtterance;
  });

  test('speak queues an utterance without cancelling prior speech', () => {
    const speakFn = vi.fn();
    const cancelFn = vi.fn();
    window.speechSynthesis = { speak: speakFn, cancel: cancelFn };
    window.SpeechSynthesisUtterance = function (text) {
      this.text = text;
    };

    expect(isSpeechSupported()).toBe(true);
    speak('Отжимания');

    expect(speakFn).toHaveBeenCalledTimes(1);
    expect(speakFn.mock.calls[0][0].text).toBe('Отжимания');
    expect(cancelFn).not.toHaveBeenCalled();
  });

  test('cancelSpeech cancels pending speech', () => {
    const cancelFn = vi.fn();
    window.speechSynthesis = { speak: vi.fn(), cancel: cancelFn };
    window.SpeechSynthesisUtterance = function (text) {
      this.text = text;
    };

    cancelSpeech();
    expect(cancelFn).toHaveBeenCalledTimes(1);
  });
});
