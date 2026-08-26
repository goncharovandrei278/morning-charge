import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, test } from 'vitest';
import { db } from '../storage/db.js';
import Complete from './Complete.jsx';

beforeEach(async () => {
  await db.completions.clear();
  await db.settings.clear();
});

function renderComplete() {
  return render(
    <MemoryRouter initialEntries={['/complete?duration=10']}>
      <Routes>
        <Route path="/complete" element={<Complete />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Complete', () => {
  test('records a completion and shows the updated streak', async () => {
    renderComplete();
    expect(await screen.findByText('Стрик: 1 день')).toBeInTheDocument();
    const dates = await import('../storage/storage.js').then((m) => m.getAllCompletionDates());
    expect(dates.size).toBe(1);
  });
});
