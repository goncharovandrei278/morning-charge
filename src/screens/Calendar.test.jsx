import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test } from 'vitest';
import { db } from '../storage/db.js';
import { recordCompletion } from '../storage/storage.js';
import { toDateString } from '../engine/streak.js';
import Calendar from './Calendar.jsx';

beforeEach(async () => {
  await db.completions.clear();
  await db.settings.clear();
});

describe('Calendar', () => {
  test('marks today as done after a completion is recorded', async () => {
    await recordCompletion(toDateString(new Date()), 10);
    render(<Calendar />);
    expect(await screen.findByText('Стрик: 1 день')).toBeInTheDocument();
  });
});
