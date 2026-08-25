import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, test } from 'vitest';
import { db } from '../storage/db.js';
import Home from './Home.jsx';

beforeEach(async () => {
  await db.completions.clear();
  await db.settings.clear();
});

function renderHome() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/workout" element={<div>Workout Screen</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Home', () => {
  test('shows today\'s program name and a Start button', async () => {
    renderHome();
    expect(await screen.findByRole('button', { name: 'Начать' })).toBeInTheDocument();
  });

  test('clicking Start navigates to the workout screen', async () => {
    const user = userEvent.setup();
    renderHome();
    await user.click(await screen.findByRole('button', { name: 'Начать' }));
    expect(screen.getByText('Workout Screen')).toBeInTheDocument();
  });
});
