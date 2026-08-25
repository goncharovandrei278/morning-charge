const DURATIONS = [5, 10, 15];

function DurationPicker({ value, onChange }) {
  return (
    <div className="flex gap-2" role="group" aria-label="Длительность тренировки">
      {DURATIONS.map((d) => (
        <button
          key={d}
          type="button"
          onClick={() => onChange(d)}
          aria-pressed={value === d}
          className={`px-4 py-2 rounded-full border ${
            value === d
              ? 'bg-yellow-400 border-yellow-400 text-slate-900'
              : 'border-slate-400 text-slate-100'
          }`}
        >
          {d} мин
        </button>
      ))}
    </div>
  );
}

export default DurationPicker;
