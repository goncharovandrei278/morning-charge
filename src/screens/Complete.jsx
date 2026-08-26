import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { recordCompletion, getAllCompletionDates } from '../storage/storage.js';
import { computeStreak, toDateString } from '../engine/streak.js';
import { pluralizeDays } from '../engine/pluralize.js';

function Complete() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const duration = Number(searchParams.get('duration')) || 0;
  const [streak, setStreak] = useState(null);

  useEffect(() => {
    async function finish() {
      await recordCompletion(toDateString(new Date()), duration);
      const dates = await getAllCompletionDates();
      setStreak(computeStreak(dates));
    }
    finish();
  }, [duration]);

  return (
    <div className="p-6 flex flex-col gap-6 items-center text-center">
      <h1 className="text-2xl font-bold">Готово!</h1>
      {streak !== null && (
        <p className="text-xl">
          Стрик: {streak} {pluralizeDays(streak)}
        </p>
      )}
      <button
        type="button"
        onClick={() => navigate('/')}
        className="bg-yellow-400 text-slate-900 font-bold py-3 px-6 rounded-full"
      >
        На главную
      </button>
    </div>
  );
}

export default Complete;
