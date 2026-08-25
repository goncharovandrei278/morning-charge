import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test } from 'vitest';
import { db } from '../storage/db.js';
import { getSettings } from '../storage/storage.js';
import Settings from './Settings.jsx';

beforeEach(async () => {
  await db.completions.clear();
  await db.settings.clear();
});

describe('Settings', () => {
  test('toggling sound persists to storage', async () => {
    const user = userEvent.setup();
    render(<Settings />);
    const checkbox = await screen.findByRole('checkbox', { name: /звук/i });
    expect(checkbox).toBeChecked();

    await user.click(checkbox);

    expect(checkbox).not.toBeChecked();
    const settings = await getSettings();
    expect(settings.soundEnabled).toBe(false);
  });

  test('changing default duration persists to storage', async () => {
    const user = userEvent.setup();
    render(<Settings />);
    await user.click(await screen.findByRole('button', { name: '15 мин' }));

    const settings = await getSettings();
    expect(settings.defaultDuration).toBe(15);
  });
});
