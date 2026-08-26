import { useEffect, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useWorkoutEngine } from '../hooks/useWorkoutEngine.js';
import { getDayContent } from '../data/content.js';
import { getSettings } from '../storage/storage.js';
import Timer from '../components/Timer.jsx';
import ExerciseCard from '../components/ExerciseCard.jsx';
import VoiceIndicator from '../components/VoiceIndicator.jsx';
import { isSpeechSupported } from '../engine/voice.js';

const VALID_DURATIONS = [5, 10, 15];

function isValidDayIndex(day) {
  return Number.isInteger(day) && day >= 0 && day <= 6;
}

function isValidDuration(duration) {
  return VALID_DURATIONS.includes(duration);
}

function Workout() {
  const [searchParams] = useSearchParams();
  const dayIndex = Number(searchParams.get('day'));
  const duration = Number(searchParams.get('duration'));

  if (!isValidDayIndex(dayIndex) || !isValidDuration(duration)) {
    return <Navigate to="/" replace />;
  }

  return <WorkoutSession dayIndex={dayIndex} duration={duration} />;
}

function WorkoutSession({ dayIndex, duration }) {
  const navigate = useNavigate();
  const content = getDayContent(dayIndex, duration);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { state, block, remainingMs, pause, resume, completeRepsBlock } = useWorkoutEngine(
    content.blocks,
    { soundEnabled }
  );

  useEffect(() => {
    getSettings().then((s) => setSoundEnabled(s.soundEnabled));
  }, []);

  useEffect(() => {
    if (state.status === 'complete') {
      navigate(`/complete?duration=${duration}`, { replace: true });
    }
  }, [state.status, duration, navigate]);

  // Warn before an accidental tab close / reload discards workout progress.
  useEffect(() => {
    function handleBeforeUnload(event) {
      event.preventDefault();
      event.returnValue = '';
    }
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  if (!block) return null;

  return (
    <div className="p-6 flex flex-col gap-6">
      <VoiceIndicator active={isSpeechSupported() && soundEnabled} />
      <ExerciseCard exercise={block} />
      {block.unit === 'time' ? (
        <Timer remainingMs={remainingMs} totalMs={block.seconds * 1000} />
      ) : (
        <button
          type="button"
          onClick={completeRepsBlock}
          disabled={state.status === 'paused'}
          className="bg-yellow-400 text-slate-900 font-bold py-3 rounded-full text-lg disabled:opacity-50"
        >
          Готово
        </button>
      )}
      <button
        type="button"
        onClick={state.status === 'paused' ? resume : pause}
        className="border border-slate-400 text-slate-100 py-2 rounded-full"
      >
        {state.status === 'paused' ? 'Продолжить' : 'Пауза'}
      </button>
    </div>
  );
}

export default Workout;
