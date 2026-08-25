function ExerciseCard({ exercise }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <img src={exercise.mediaUrl} alt={exercise.name} className="w-40 h-40 object-contain" />
      <h2 className="text-xl font-bold">{exercise.name}</h2>
      {exercise.unit === 'reps' && <p className="text-slate-400">{exercise.reps} повторений</p>}
    </div>
  );
}

export default ExerciseCard;
