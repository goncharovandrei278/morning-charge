import exercises from './exercises.json';
import morningCharge from './programs/morning-charge.json';

const exerciseById = new Map(exercises.map((e) => [e.id, e]));

export function getDayContent(dayIndex, duration) {
  const day = morningCharge.days.find((d) => d.dayIndex === dayIndex);
  if (!day) throw new Error(`Unknown dayIndex: ${dayIndex}`);
  const blocks = day.exercises
    .filter((ref) => ref.minDuration <= duration)
    .map((ref) => {
      const exercise = exerciseById.get(ref.exerciseId);
      if (!exercise) throw new Error(`Unknown exerciseId: ${ref.exerciseId}`);
      return exercise;
    });
  return { dayIndex, name: day.name, duration, blocks };
}
