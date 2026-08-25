import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test } from 'vitest';
import { db } from './storage/db.js';
import App from './App.jsx';

beforeEach(async () => {
  await db.completions.clear();
  await db.settings.clear();
});

describe('App', () => {
  test('renders the Home screen and bottom nav by default', async () => {
    render(<App />);
    expect(await screen.findByRole('button', { name: 'Начать' })).toBeInTheDocument();
    expect(screen.getByText('Главная')).toBeInTheDocument();
    expect(screen.getByText('Календарь')).toBeInTheDocument();
    expect(screen.getByText('Настройки')).toBeInTheDocument();
  });
});
