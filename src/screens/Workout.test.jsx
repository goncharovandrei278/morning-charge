import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { getDayContent } from '../data/content.js';
import Workout from './Workout.jsx';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

function renderWorkout(query) {
  return render(
    <MemoryRouter initialEntries={[`/workout${query}`]}>
      <Routes>
        <Route path="/workout" element={<Workout />} />
        <Route path="/complete" element={<div>Complete Screen</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Workout', () => {
  test('shows the first exercise of the requested day and duration', () => {
    renderWorkout('?day=0&duration=5');
    expect(screen.getByText('Прыжки "жумпинг джек"')).toBeInTheDocument();
  });

  test('navigates to /complete once all blocks finish', () => {
    renderWorkout('?day=0&duration=5');
    // Day 0 at 5 min mixes time-based and reps-based blocks (see Task 2 data):
    // advance the fake clock past a block's duration for time blocks, click
    // "Готово" for reps blocks, walking the exact sequence from content.js.
    const { blocks } = getDayContent(0, 5);
    for (const b of blocks) {
      if (b.unit === 'time') {
        act(() => {
          vi.advanceTimersByTime((b.seconds + 1) * 1000);
        });
      } else {
        fireEvent.click(screen.getByRole('button', { name: 'Готово' }));
      }
    }
    expect(screen.getByText('Complete Screen')).toBeInTheDocument();
  });
});
