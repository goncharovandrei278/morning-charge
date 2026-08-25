import { toDateString } from '../engine/streak.js';

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function ProgressCalendar({ completionDates, year, month }) {
  const total = daysInMonth(year, month);
  const days = Array.from({ length: total }, (_, i) => i + 1);
  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((day) => {
        const dateStr = toDateString(new Date(year, month, day));
        const done = completionDates.has(dateStr);
        return (
          <div
            key={dateStr}
            className={`aspect-square flex items-center justify-center rounded-full text-sm ${
              done ? 'bg-yellow-400 text-slate-900' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {day}
          </div>
        );
      })}
    </div>
  );
}

export default ProgressCalendar;
