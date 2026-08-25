import { useEffect, useState } from 'react';
import { getAllCompletionDates } from '../storage/storage.js';
import { computeStreak } from '../engine/streak.js';

export function useStreak() {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    getAllCompletionDates().then((dates) => setStreak(computeStreak(dates)));
  }, []);

  return streak;
}
