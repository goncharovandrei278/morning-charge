export function isSpeechSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function speak(text) {
  if (!isSpeechSupported()) return;
  const utterance = new window.SpeechSynthesisUtterance(text);
  window.speechSynthesis.speak(utterance);
}

export function cancelSpeech() {
  if (!isSpeechSupported()) return;
  window.speechSynthesis.cancel();
}
