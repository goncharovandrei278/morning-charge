import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useWorkoutEngine } from '../hooks/useWorkoutEngine.js';
import { getDayContent } from '../data/content.js';
import Timer from '../components/Timer.jsx';
import ExerciseCard from '../components/ExerciseCard.jsx';
import VoiceIndicator from '../components/VoiceIndicator.jsx';

function Workout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dayIndex = Number(searchParams.get('day'));
  const duration = Number(searchParams.get('duration'));
  const content = getDayContent(dayIndex, duration);
  const { state, block, remainingMs, pause, resume, completeRepsBlock } = useWorkoutEngine(
    content.blocks
  );

  useEffect(() => {
    if (state.status === 'complete') {
      navigate(`/complete?duration=${duration}`, { replace: true });
    }
  }, [state.status, duration, navigate]);

  if (!block) return null;

  return (
    <div className="p-6 flex flex-col gap-6">
      <VoiceIndicator />
      <ExerciseCard exercise={block} />
      {block.unit === 'time' ? (
        <Timer remainingMs={remainingMs} totalMs={block.seconds * 1000} />
      ) : (
        <button
          type="button"
          onClick={completeRepsBlock}
          className="bg-yellow-400 text-slate-900 font-bold py-3 rounded-full text-lg"
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
