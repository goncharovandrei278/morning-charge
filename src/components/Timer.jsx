function Timer({ remainingMs, totalMs }) {
  const seconds = Math.ceil(remainingMs / 1000);
  const progress = totalMs > 0 ? 1 - remainingMs / totalMs : 0;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-4xl font-mono">{seconds}с</div>
      <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-yellow-400"
          style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
        />
      </div>
    </div>
  );
}

export default Timer;
