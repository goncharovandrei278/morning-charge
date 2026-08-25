import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DurationPicker from '../components/DurationPicker.jsx';
import { getSettings, saveSettings, getAllCompletionDates } from '../storage/storage.js';
import { computeStreak } from '../engine/streak.js';
import morningCharge from '../data/programs/morning-charge.json';

function todayDayIndex() {
  const jsDay = new Date().getDay(); // 0=Sunday..6=Saturday
  return jsDay === 0 ? 6 : jsDay - 1; // 0=Monday..6=Sunday
}

function Home() {
  const navigate = useNavigate();
  const [duration, setDuration] = useState(10);
  const [streak, setStreak] = useState(0);
  const dayIndex = todayDayIndex();
  const day = morningCharge.days.find((d) => d.dayIndex === dayIndex);

  useEffect(() => {
    getSettings().then((s) => setDuration(s.defaultDuration));
    getAllCompletionDates().then((dates) => setStreak(computeStreak(dates)));
  }, []);

  function handleDurationChange(next) {
    setDuration(next);
    saveSettings({ defaultDuration: next });
  }

  function handleStart() {
    navigate(`/workout?day=${dayIndex}&duration=${duration}`);
  }

  return (
    <div className="p-6 flex flex-col gap-6">
      <div>
        <p className="text-slate-400">
          Стрик: {streak} {streak === 1 ? 'день' : 'дней'}
        </p>
        <h1 className="text-2xl font-bold">{day.name}</h1>
      </div>
      <DurationPicker value={duration} onChange={handleDurationChange} />
      <button
        type="button"
        onClick={handleStart}
        className="bg-yellow-400 text-slate-900 font-bold py-3 rounded-full text-lg"
      >
        Начать
      </button>
    </div>
  );
}

export default Home;
