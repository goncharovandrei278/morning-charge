import { useEffect, useState } from 'react';
import { getAllCompletionDates } from '../storage/storage.js';
import { useStreak } from '../hooks/useStreak.js';
import { pluralizeDays } from '../engine/pluralize.js';
import ProgressCalendar from '../components/ProgressCalendar.jsx';

function Calendar() {
  const [completionDates, setCompletionDates] = useState(new Set());
  const streak = useStreak();
  const now = new Date();

  useEffect(() => {
    getAllCompletionDates().then(setCompletionDates);
  }, []);

  return (
    <div className="p-6 flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Календарь</h1>
      <p className="text-slate-400">
        Стрик: {streak} {pluralizeDays(streak)}
      </p>
      <ProgressCalendar completionDates={completionDates} year={now.getFullYear()} month={now.getMonth()} />
    </div>
  );
}

export default Calendar;
