import { useEffect, useState } from 'react';

function ExerciseCard({ exercise }) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [exercise.id]);

  return (
    <div className="flex flex-col items-center gap-3">
      {imageFailed ? (
        <div
          className="w-40 h-40 rounded-full bg-slate-800 text-slate-100 flex items-center justify-center text-4xl font-bold"
          aria-hidden="true"
        >
          {exercise.name.charAt(0)}
        </div>
      ) : (
        <img
          src={exercise.mediaUrl}
          alt={exercise.name}
          className="w-40 h-40 object-contain"
          onError={() => setImageFailed(true)}
        />
      )}
      <h2 className="text-xl font-bold">{exercise.name}</h2>
      {exercise.unit === 'reps' && <p className="text-slate-400">{exercise.reps} повторений</p>}
    </div>
  );
}

export default ExerciseCard;
