export function toDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function computeStreak(completionDates, today = new Date()) {
  let count = 0;
  const cursor = new Date(today);
  if (!completionDates.has(toDateString(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (completionDates.has(toDateString(cursor))) {
    count += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}
