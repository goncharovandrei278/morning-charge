import { isSpeechSupported } from '../engine/voice.js';

function VoiceIndicator() {
  if (!isSpeechSupported()) return null;
  return <p className="text-xs text-slate-500">🔊 Голосовой режим включён</p>;
}

export default VoiceIndicator;
