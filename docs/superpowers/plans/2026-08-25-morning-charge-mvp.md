# Morning Charge MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a working PWA MVP of "Утренняя зарядка" — pick a duration (5/10/15 min), run today's workout with voice-guided timer, track a streak, browse a calendar, and adjust settings.

**Architecture:** React SPA (Vite, HashRouter for zero-config static hosting) with three independent logic layers kept free of React/DOM so they're unit-testable in isolation: `src/data` (static exercise/program content + lookup), `src/engine` (pure timer math, workout state machine, streak math, thin browser-API wrappers for voice/wake-lock), `src/storage` (Dexie/IndexedDB persistence). React hooks and screens wire these layers together; screens are the only layer that needs manual browser verification.

**Tech Stack:** React 18, Vite 5, React Router 6 (HashRouter), Tailwind CSS 3, Dexie 4 (IndexedDB), Web Speech API, Screen Wake Lock API, vite-plugin-pwa, Vitest + @testing-library/react + fake-indexeddb for tests.

**Spec:** `docs/superpowers/specs/2026-08-25-morning-charge-mvp-design.md`

## Global Constraints

- Timer must compute elapsed/remaining time from `Date.now()` timestamps, never from an accumulating `setInterval` counter (spec §3) — survives backgrounding/tab-switch without drift.
- Wake Lock must be re-requested on `visibilitychange` when the tab returns to foreground — browsers release it automatically on backgrounding and do not restore it (spec §3).
- Voice is always an add-on to the screen, never the sole source of information; if `speechSynthesis`/`wakeLock` are unsupported, the corresponding module must no-op silently, not throw (spec §3).
- Completion dates are stored as local calendar-day strings (`YYYY-MM-DD` from the device's local time), never UTC timestamps (spec §4).
- Streak is a hard streak: one missed day resets it to 0. No freeze/forgiveness logic in MVP (spec, decisions log).
- Content scope for MVP is 7 days (one weekly cycle), not the eventual 28-day cycle (spec, decisions log).
- Duration variants (5/10/15 min) are progressive: the 10-min list is a superset of the 5-min list via each exercise's `minDuration` tag, never three separate duplicated lists (spec §1).
- Navigation uses React Router so the Android/mobile "back" gesture behaves correctly, per the approved design (spec §5).

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `vite.config.js`, `index.html`, `.gitignore`
- Create: `tailwind.config.js`, `postcss.config.js`
- Create: `src/main.jsx`, `src/App.jsx`, `src/index.css`
- Create: `src/test/setup.js`
- Create: `public/icon.svg`
- Test: `src/App.test.jsx`

**Interfaces:**
- Produces: a running Vite dev server, a passing `npm test`, a successful `npm run build` that emits a PWA manifest — every later task builds on this pipeline.

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "morning-charge",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": {
    "dexie": "^4.0.8",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.8",
    "@testing-library/react": "^16.0.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.19",
    "fake-indexeddb": "^6.0.0",
    "jsdom": "^24.1.1",
    "postcss": "^8.4.40",
    "tailwindcss": "^3.4.7",
    "vite": "^5.3.4",
    "vite-plugin-pwa": "^0.20.1",
    "vitest": "^2.0.4"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run: `npm install`
Expected: completes without errors, creates `node_modules/` and `package-lock.json`.

- [ ] **Step 3: Write `.gitignore`**

```
node_modules
dist
dist-ssr
*.local
```

- [ ] **Step 4: Write `public/icon.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <rect width="128" height="128" rx="24" fill="#0f172a"/>
  <circle cx="64" cy="64" r="36" fill="#facc15"/>
</svg>
```

- [ ] **Step 5: Write `vite.config.js`**

```js
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Утренняя зарядка',
        short_name: 'Зарядка',
        description: 'Короткие утренние комплексы упражнений',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        start_url: '/',
        icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml' }],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    globals: true,
  },
});
```

- [ ] **Step 6: Write `tailwind.config.js` and `postcss.config.js`**

`tailwind.config.js`:
```js
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {} },
  plugins: [],
};
```

`postcss.config.js`:
```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 7: Write `src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 8: Write `src/test/setup.js`**

```js
import 'fake-indexeddb/auto';
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 9: Write `index.html`**

```html
<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Утренняя зарядка</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 10: Write `src/main.jsx`**

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 11: Write the failing test `src/App.test.jsx`**

```jsx
import { render, screen } from '@testing-library/react';
import App from './App.jsx';

test('renders placeholder heading', () => {
  render(<App />);
  expect(screen.getByText('Утренняя зарядка')).toBeInTheDocument();
});
```

- [ ] **Step 12: Run test to verify it fails**

Run: `npx vitest run src/App.test.jsx`
Expected: FAIL — `src/App.jsx` does not exist yet.

- [ ] **Step 13: Write minimal `src/App.jsx`**

```jsx
function App() {
  return <h1 className="text-2xl font-bold p-4">Утренняя зарядка</h1>;
}

export default App;
```

- [ ] **Step 14: Run test to verify it passes**

Run: `npx vitest run src/App.test.jsx`
Expected: PASS

- [ ] **Step 15: Verify production build succeeds**

Run: `npm run build`
Expected: exits 0, `dist/` contains `index.html`, `manifest.webmanifest`, and a generated service worker file.

- [ ] **Step 16: Commit**

```bash
git add package.json package-lock.json vite.config.js index.html .gitignore tailwind.config.js postcss.config.js src public
git commit -m "chore: scaffold Vite+React+Tailwind+PWA project with Vitest"
```

---

## Task 2: Content Data & Loader

**Files:**
- Create: `src/data/exercises.json`
- Create: `src/data/programs/morning-charge.json`
- Create: `src/data/content.js`
- Test: `src/data/content.test.js`

**Interfaces:**
- Produces: `getDayContent(dayIndex: number, duration: 5|10|15) => { dayIndex, name, duration, blocks: Exercise[] }` where `Exercise = { id, name, bodyArea, unit: "time"|"reps", seconds?, reps?, estimatedSeconds?, mediaUrl }`. Later tasks (Workout screen, Home screen) consume `getDayContent` and the `Exercise` shape.

- [ ] **Step 1: Write `src/data/exercises.json`**

```json
[
  { "id": "jumping-jacks", "name": "Прыжки \"жумпинг джек\"", "bodyArea": "full-body", "unit": "time", "seconds": 30, "mediaUrl": "/media/jumping-jacks.png" },
  { "id": "pushup", "name": "Отжимания", "bodyArea": "chest", "unit": "reps", "reps": 10, "estimatedSeconds": 30, "mediaUrl": "/media/pushup.png" },
  { "id": "squat", "name": "Приседания", "bodyArea": "legs", "unit": "reps", "reps": 15, "estimatedSeconds": 35, "mediaUrl": "/media/squat.png" },
  { "id": "plank", "name": "Планка", "bodyArea": "core", "unit": "time", "seconds": 30, "mediaUrl": "/media/plank.png" },
  { "id": "mountain-climbers", "name": "Скалолаз", "bodyArea": "full-body", "unit": "time", "seconds": 30, "mediaUrl": "/media/mountain-climbers.png" },
  { "id": "lunges", "name": "Выпады", "bodyArea": "legs", "unit": "reps", "reps": 10, "estimatedSeconds": 35, "mediaUrl": "/media/lunges.png" },
  { "id": "shoulder-taps", "name": "Касания плеч в планке", "bodyArea": "core", "unit": "time", "seconds": 20, "mediaUrl": "/media/shoulder-taps.png" },
  { "id": "superman", "name": "Супермен", "bodyArea": "back", "unit": "time", "seconds": 25, "mediaUrl": "/media/superman.png" },
  { "id": "glute-bridge", "name": "Ягодичный мостик", "bodyArea": "legs", "unit": "reps", "reps": 15, "estimatedSeconds": 30, "mediaUrl": "/media/glute-bridge.png" },
  { "id": "bicycle-crunches", "name": "Велосипед", "bodyArea": "core", "unit": "time", "seconds": 30, "mediaUrl": "/media/bicycle-crunches.png" },
  { "id": "arm-circles", "name": "Круги руками", "bodyArea": "shoulders", "unit": "time", "seconds": 20, "mediaUrl": "/media/arm-circles.png" },
  { "id": "high-knees", "name": "Бег с высоким подниманием колен", "bodyArea": "cardio", "unit": "time", "seconds": 30, "mediaUrl": "/media/high-knees.png" },
  { "id": "side-plank", "name": "Боковая планка", "bodyArea": "core", "unit": "time", "seconds": 20, "mediaUrl": "/media/side-plank.png" },
  { "id": "cat-cow", "name": "Кошка-корова", "bodyArea": "mobility", "unit": "time", "seconds": 20, "mediaUrl": "/media/cat-cow.png" },
  { "id": "wall-sit", "name": "Стульчик у стены", "bodyArea": "legs", "unit": "time", "seconds": 30, "mediaUrl": "/media/wall-sit.png" },
  { "id": "cobra-stretch", "name": "Растяжка \"кобра\"", "bodyArea": "back", "unit": "time", "seconds": 20, "mediaUrl": "/media/cobra-stretch.png" }
]
```

- [ ] **Step 2: Write `src/data/programs/morning-charge.json`**

Each day rotates through the exercise pool with a fixed offset (deterministic, not random) so muscle-group emphasis varies day to day; `minDuration` tiers are 6/6/6 exercises giving 6 blocks at 5 min, 12 at 10 min, 18 at 15 min, matching the spec's block-count guidance.

```json
{
  "id": "morning-charge",
  "name": "Утренняя зарядка",
  "days": [
    {
      "dayIndex": 0,
      "name": "Понедельник — активный старт",
      "exercises": [
        { "exerciseId": "jumping-jacks", "minDuration": 5 },
        { "exerciseId": "pushup", "minDuration": 5 },
        { "exerciseId": "squat", "minDuration": 5 },
        { "exerciseId": "plank", "minDuration": 5 },
        { "exerciseId": "mountain-climbers", "minDuration": 5 },
        { "exerciseId": "lunges", "minDuration": 5 },
        { "exerciseId": "shoulder-taps", "minDuration": 10 },
        { "exerciseId": "superman", "minDuration": 10 },
        { "exerciseId": "glute-bridge", "minDuration": 10 },
        { "exerciseId": "bicycle-crunches", "minDuration": 10 },
        { "exerciseId": "arm-circles", "minDuration": 10 },
        { "exerciseId": "high-knees", "minDuration": 10 },
        { "exerciseId": "side-plank", "minDuration": 15 },
        { "exerciseId": "cat-cow", "minDuration": 15 },
        { "exerciseId": "wall-sit", "minDuration": 15 },
        { "exerciseId": "cobra-stretch", "minDuration": 15 },
        { "exerciseId": "jumping-jacks", "minDuration": 15 },
        { "exerciseId": "pushup", "minDuration": 15 }
      ]
    },
    {
      "dayIndex": 1,
      "name": "Вторник — верх тела и кор",
      "exercises": [
        { "exerciseId": "plank", "minDuration": 5 },
        { "exerciseId": "mountain-climbers", "minDuration": 5 },
        { "exerciseId": "lunges", "minDuration": 5 },
        { "exerciseId": "shoulder-taps", "minDuration": 5 },
        { "exerciseId": "superman", "minDuration": 5 },
        { "exerciseId": "glute-bridge", "minDuration": 5 },
        { "exerciseId": "bicycle-crunches", "minDuration": 10 },
        { "exerciseId": "arm-circles", "minDuration": 10 },
        { "exerciseId": "high-knees", "minDuration": 10 },
        { "exerciseId": "side-plank", "minDuration": 10 },
        { "exerciseId": "cat-cow", "minDuration": 10 },
        { "exerciseId": "wall-sit", "minDuration": 10 },
        { "exerciseId": "cobra-stretch", "minDuration": 15 },
        { "exerciseId": "jumping-jacks", "minDuration": 15 },
        { "exerciseId": "pushup", "minDuration": 15 },
        { "exerciseId": "squat", "minDuration": 15 },
        { "exerciseId": "plank", "minDuration": 15 },
        { "exerciseId": "mountain-climbers", "minDuration": 15 }
      ]
    },
    {
      "dayIndex": 2,
      "name": "Среда — кор и стабилизация",
      "exercises": [
        { "exerciseId": "shoulder-taps", "minDuration": 5 },
        { "exerciseId": "superman", "minDuration": 5 },
        { "exerciseId": "glute-bridge", "minDuration": 5 },
        { "exerciseId": "bicycle-crunches", "minDuration": 5 },
        { "exerciseId": "arm-circles", "minDuration": 5 },
        { "exerciseId": "high-knees", "minDuration": 5 },
        { "exerciseId": "side-plank", "minDuration": 10 },
        { "exerciseId": "cat-cow", "minDuration": 10 },
        { "exerciseId": "wall-sit", "minDuration": 10 },
        { "exerciseId": "cobra-stretch", "minDuration": 10 },
        { "exerciseId": "jumping-jacks", "minDuration": 10 },
        { "exerciseId": "pushup", "minDuration": 10 },
        { "exerciseId": "squat", "minDuration": 15 },
        { "exerciseId": "plank", "minDuration": 15 },
        { "exerciseId": "mountain-climbers", "minDuration": 15 },
        { "exerciseId": "lunges", "minDuration": 15 },
        { "exerciseId": "shoulder-taps", "minDuration": 15 },
        { "exerciseId": "superman", "minDuration": 15 }
      ]
    },
    {
      "dayIndex": 3,
      "name": "Четверг — низ тела",
      "exercises": [
        { "exerciseId": "bicycle-crunches", "minDuration": 5 },
        { "exerciseId": "arm-circles", "minDuration": 5 },
        { "exerciseId": "high-knees", "minDuration": 5 },
        { "exerciseId": "side-plank", "minDuration": 5 },
        { "exerciseId": "cat-cow", "minDuration": 5 },
        { "exerciseId": "wall-sit", "minDuration": 5 },
        { "exerciseId": "cobra-stretch", "minDuration": 10 },
        { "exerciseId": "jumping-jacks", "minDuration": 10 },
        { "exerciseId": "pushup", "minDuration": 10 },
        { "exerciseId": "squat", "minDuration": 10 },
        { "exerciseId": "plank", "minDuration": 10 },
        { "exerciseId": "mountain-climbers", "minDuration": 10 },
        { "exerciseId": "lunges", "minDuration": 15 },
        { "exerciseId": "shoulder-taps", "minDuration": 15 },
        { "exerciseId": "superman", "minDuration": 15 },
        { "exerciseId": "glute-bridge", "minDuration": 15 },
        { "exerciseId": "bicycle-crunches", "minDuration": 15 },
        { "exerciseId": "arm-circles", "minDuration": 15 }
      ]
    },
    {
      "dayIndex": 4,
      "name": "Пятница — кардио и мобильность",
      "exercises": [
        { "exerciseId": "side-plank", "minDuration": 5 },
        { "exerciseId": "cat-cow", "minDuration": 5 },
        { "exerciseId": "wall-sit", "minDuration": 5 },
        { "exerciseId": "cobra-stretch", "minDuration": 5 },
        { "exerciseId": "jumping-jacks", "minDuration": 5 },
        { "exerciseId": "pushup", "minDuration": 5 },
        { "exerciseId": "squat", "minDuration": 10 },
        { "exerciseId": "plank", "minDuration": 10 },
        { "exerciseId": "mountain-climbers", "minDuration": 10 },
        { "exerciseId": "lunges", "minDuration": 10 },
        { "exerciseId": "shoulder-taps", "minDuration": 10 },
        { "exerciseId": "superman", "minDuration": 10 },
        { "exerciseId": "glute-bridge", "minDuration": 15 },
        { "exerciseId": "bicycle-crunches", "minDuration": 15 },
        { "exerciseId": "arm-circles", "minDuration": 15 },
        { "exerciseId": "high-knees", "minDuration": 15 },
        { "exerciseId": "side-plank", "minDuration": 15 },
        { "exerciseId": "cat-cow", "minDuration": 15 }
      ]
    },
    {
      "dayIndex": 5,
      "name": "Суббота — растяжка и баланс",
      "exercises": [
        { "exerciseId": "cobra-stretch", "minDuration": 5 },
        { "exerciseId": "jumping-jacks", "minDuration": 5 },
        { "exerciseId": "pushup", "minDuration": 5 },
        { "exerciseId": "squat", "minDuration": 5 },
        { "exerciseId": "plank", "minDuration": 5 },
        { "exerciseId": "mountain-climbers", "minDuration": 5 },
        { "exerciseId": "lunges", "minDuration": 10 },
        { "exerciseId": "shoulder-taps", "minDuration": 10 },
        { "exerciseId": "superman", "minDuration": 10 },
        { "exerciseId": "glute-bridge", "minDuration": 10 },
        { "exerciseId": "bicycle-crunches", "minDuration": 10 },
        { "exerciseId": "arm-circles", "minDuration": 10 },
        { "exerciseId": "high-knees", "minDuration": 15 },
        { "exerciseId": "side-plank", "minDuration": 15 },
        { "exerciseId": "cat-cow", "minDuration": 15 },
        { "exerciseId": "wall-sit", "minDuration": 15 },
        { "exerciseId": "cobra-stretch", "minDuration": 15 },
        { "exerciseId": "jumping-jacks", "minDuration": 15 }
      ]
    },
    {
      "dayIndex": 6,
      "name": "Воскресенье — лёгкая зарядка",
      "exercises": [
        { "exerciseId": "squat", "minDuration": 5 },
        { "exerciseId": "plank", "minDuration": 5 },
        { "exerciseId": "mountain-climbers", "minDuration": 5 },
        { "exerciseId": "lunges", "minDuration": 5 },
        { "exerciseId": "shoulder-taps", "minDuration": 5 },
        { "exerciseId": "superman", "minDuration": 5 },
        { "exerciseId": "glute-bridge", "minDuration": 10 },
        { "exerciseId": "bicycle-crunches", "minDuration": 10 },
        { "exerciseId": "arm-circles", "minDuration": 10 },
        { "exerciseId": "high-knees", "minDuration": 10 },
        { "exerciseId": "side-plank", "minDuration": 10 },
        { "exerciseId": "cat-cow", "minDuration": 10 },
        { "exerciseId": "wall-sit", "minDuration": 15 },
        { "exerciseId": "cobra-stretch", "minDuration": 15 },
        { "exerciseId": "jumping-jacks", "minDuration": 15 },
        { "exerciseId": "pushup", "minDuration": 15 },
        { "exerciseId": "squat", "minDuration": 15 },
        { "exerciseId": "plank", "minDuration": 15 }
      ]
    }
  ]
}
```

- [ ] **Step 3: Write the failing test `src/data/content.test.js`**

```js
import { describe, expect, test } from 'vitest';
import { getDayContent } from './content.js';

describe('getDayContent', () => {
  test('returns only exercises tagged for the requested duration or lower', () => {
    const content = getDayContent(0, 5);
    expect(content.dayIndex).toBe(0);
    expect(content.duration).toBe(5);
    expect(content.blocks.length).toBe(6);
    expect(content.blocks.every((b) => typeof b.name === 'string')).toBe(true);
  });

  test('10-minute list is a superset of the 5-minute list', () => {
    const five = getDayContent(0, 5).blocks.map((b) => b.id);
    const ten = getDayContent(0, 10).blocks.map((b) => b.id);
    expect(ten.length).toBeGreaterThan(five.length);
    expect(five.every((id, i) => ten[i] === id)).toBe(true);
  });

  test('throws on unknown dayIndex', () => {
    expect(() => getDayContent(9, 5)).toThrow('Unknown dayIndex: 9');
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npx vitest run src/data/content.test.js`
Expected: FAIL — `src/data/content.js` does not exist yet.

- [ ] **Step 5: Write `src/data/content.js`**

```js
import exercises from './exercises.json';
import morningCharge from './programs/morning-charge.json';

const exerciseById = new Map(exercises.map((e) => [e.id, e]));

export function getDayContent(dayIndex, duration) {
  const day = morningCharge.days.find((d) => d.dayIndex === dayIndex);
  if (!day) throw new Error(`Unknown dayIndex: ${dayIndex}`);
  const blocks = day.exercises
    .filter((ref) => ref.minDuration <= duration)
    .map((ref) => {
      const exercise = exerciseById.get(ref.exerciseId);
      if (!exercise) throw new Error(`Unknown exerciseId: ${ref.exerciseId}`);
      return exercise;
    });
  return { dayIndex, name: day.name, duration, blocks };
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run src/data/content.test.js`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/data
git commit -m "feat: add exercise pool, 7-day program data, and content loader"
```

---

## Task 3: Storage Layer (Dexie)

**Files:**
- Create: `src/storage/db.js`
- Create: `src/storage/storage.js`
- Test: `src/storage/storage.test.js`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: `getSettings() => Promise<{key, userId, defaultDuration, soundEnabled}>`, `saveSettings(partial) => Promise<Settings>`, `recordCompletion(date: string, duration: number) => Promise<void>`, `getCompletionsInRange(startDate, endDate) => Promise<Completion[]>`, `getAllCompletionDates() => Promise<Set<string>>`. Consumed by streak logic, Home, Workout, Complete, Calendar, Settings screens.

- [ ] **Step 1: Write `src/storage/db.js`**

```js
import Dexie from 'dexie';

export const db = new Dexie('morning-charge-db');
db.version(1).stores({
  completions: '++id, date',
  settings: 'key',
});
```

- [ ] **Step 2: Write the failing test `src/storage/storage.test.js`**

```js
import { beforeEach, describe, expect, test } from 'vitest';
import { db } from './db.js';
import {
  getSettings,
  saveSettings,
  recordCompletion,
  getCompletionsInRange,
  getAllCompletionDates,
} from './storage.js';

beforeEach(async () => {
  await db.completions.clear();
  await db.settings.clear();
});

describe('settings', () => {
  test('getSettings creates and returns defaults on first call', async () => {
    const settings = await getSettings();
    expect(settings.defaultDuration).toBe(10);
    expect(settings.soundEnabled).toBe(true);
    expect(typeof settings.userId).toBe('string');
  });

  test('getSettings returns the same userId on repeated calls', async () => {
    const first = await getSettings();
    const second = await getSettings();
    expect(second.userId).toBe(first.userId);
  });

  test('saveSettings merges a partial update', async () => {
    await getSettings();
    const updated = await saveSettings({ defaultDuration: 15 });
    expect(updated.defaultDuration).toBe(15);
    expect(updated.soundEnabled).toBe(true);
  });
});

describe('completions', () => {
  test('recordCompletion then getAllCompletionDates returns the date', async () => {
    await recordCompletion('2026-08-25', 10);
    const dates = await getAllCompletionDates();
    expect(dates.has('2026-08-25')).toBe(true);
  });

  test('getCompletionsInRange filters by date range inclusive', async () => {
    await recordCompletion('2026-08-20', 5);
    await recordCompletion('2026-08-25', 10);
    await recordCompletion('2026-08-30', 15);
    const inRange = await getCompletionsInRange('2026-08-21', '2026-08-29');
    expect(inRange.map((c) => c.date)).toEqual(['2026-08-25']);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run src/storage/storage.test.js`
Expected: FAIL — `src/storage/storage.js` does not exist yet.

- [ ] **Step 4: Write `src/storage/storage.js`**

```js
import { db } from './db.js';

const SETTINGS_KEY = 'settings';
const DEFAULT_SETTINGS = {
  key: SETTINGS_KEY,
  userId: null,
  defaultDuration: 10,
  soundEnabled: true,
};

export async function getSettings() {
  const existing = await db.settings.get(SETTINGS_KEY);
  if (existing) return existing;
  const initial = { ...DEFAULT_SETTINGS, userId: crypto.randomUUID() };
  await db.settings.put(initial);
  return initial;
}

export async function saveSettings(partial) {
  const current = await getSettings();
  const updated = { ...current, ...partial, key: SETTINGS_KEY };
  await db.settings.put(updated);
  return updated;
}

export async function recordCompletion(date, duration) {
  await db.completions.add({ date, duration, completedAt: Date.now() });
}

export async function getCompletionsInRange(startDate, endDate) {
  return db.completions.where('date').between(startDate, endDate, true, true).toArray();
}

export async function getAllCompletionDates() {
  const all = await db.completions.toArray();
  return new Set(all.map((c) => c.date));
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/storage/storage.test.js`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/storage
git commit -m "feat: add Dexie-backed storage layer for settings and completions"
```

---

## Task 4: Streak Logic

**Files:**
- Create: `src/engine/streak.js`
- Test: `src/engine/streak.test.js`

**Interfaces:**
- Consumes: nothing from earlier tasks (pure function, takes a `Set<string>` of dates).
- Produces: `toDateString(date: Date) => string` ("YYYY-MM-DD", local time), `computeStreak(completionDates: Set<string>, today?: Date) => number`. Consumed by Home, Complete, Calendar screens.

- [ ] **Step 1: Write the failing test `src/engine/streak.test.js`**

```js
import { describe, expect, test } from 'vitest';
import { toDateString, computeStreak } from './streak.js';

describe('toDateString', () => {
  test('formats as local YYYY-MM-DD', () => {
    expect(toDateString(new Date(2026, 7, 5))).toBe('2026-08-05');
  });
});

describe('computeStreak', () => {
  test('returns 0 for no completions', () => {
    expect(computeStreak(new Set(), new Date(2026, 7, 25))).toBe(0);
  });

  test('counts consecutive days ending today', () => {
    const dates = new Set(['2026-08-25', '2026-08-24', '2026-08-23']);
    expect(computeStreak(dates, new Date(2026, 7, 25))).toBe(3);
  });

  test('does not break the streak if today is not done yet', () => {
    const dates = new Set(['2026-08-24', '2026-08-23']);
    expect(computeStreak(dates, new Date(2026, 7, 25))).toBe(2);
  });

  test('resets to 0 after a gap', () => {
    const dates = new Set(['2026-08-22', '2026-08-20']);
    expect(computeStreak(dates, new Date(2026, 7, 25))).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/engine/streak.test.js`
Expected: FAIL — `src/engine/streak.js` does not exist yet.

- [ ] **Step 3: Write `src/engine/streak.js`**

```js
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/engine/streak.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/engine/streak.js src/engine/streak.test.js
git commit -m "feat: add pure streak calculation using local calendar dates"
```

---

## Task 5: Timer Engine

**Files:**
- Create: `src/engine/timer.js`
- Test: `src/engine/timer.test.js`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: `computeElapsedMs(startedAt, pausedAccumMs, now?) => number`, `computeRemainingMs(startedAt, pausedAccumMs, blockDurationMs, now?) => number` (clamped to 0). Consumed by `useWorkoutEngine`.

- [ ] **Step 1: Write the failing test `src/engine/timer.test.js`**

```js
import { describe, expect, test } from 'vitest';
import { computeElapsedMs, computeRemainingMs } from './timer.js';

describe('computeElapsedMs', () => {
  test('is now minus startedAt minus paused time', () => {
    expect(computeElapsedMs(1000, 200, 3000)).toBe(1800);
  });
});

describe('computeRemainingMs', () => {
  test('is block duration minus elapsed', () => {
    expect(computeRemainingMs(1000, 0, 5000, 3000)).toBe(3000);
  });

  test('clamps to 0 instead of going negative', () => {
    expect(computeRemainingMs(1000, 0, 2000, 10000)).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/engine/timer.test.js`
Expected: FAIL — `src/engine/timer.js` does not exist yet.

- [ ] **Step 3: Write `src/engine/timer.js`**

```js
export function computeElapsedMs(startedAt, pausedAccumMs, now = Date.now()) {
  return now - startedAt - pausedAccumMs;
}

export function computeRemainingMs(startedAt, pausedAccumMs, blockDurationMs, now = Date.now()) {
  const elapsed = computeElapsedMs(startedAt, pausedAccumMs, now);
  return Math.max(0, blockDurationMs - elapsed);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/engine/timer.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/engine/timer.js src/engine/timer.test.js
git commit -m "feat: add Date.now()-based pure timer math"
```

---

## Task 6: Workout Reducer

**Files:**
- Create: `src/engine/workoutReducer.js`
- Test: `src/engine/workoutReducer.test.js`

**Interfaces:**
- Consumes: an array of blocks (shape from Task 2's `Exercise`), no direct code dependency.
- Produces: `initWorkoutState(blocks) => {blocks, currentIndex, status: 'active'|'paused'|'complete'}`, `workoutReducer(state, action: {type:'PAUSE'|'RESUME'|'COMPLETE_BLOCK'}) => state`, `currentBlock(state) => Exercise|null`. Consumed by `useWorkoutEngine`.

- [ ] **Step 1: Write the failing test `src/engine/workoutReducer.test.js`**

```js
import { describe, expect, test } from 'vitest';
import { initWorkoutState, workoutReducer, currentBlock } from './workoutReducer.js';

const blocks = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];

describe('initWorkoutState', () => {
  test('starts active at index 0', () => {
    const state = initWorkoutState(blocks);
    expect(state.status).toBe('active');
    expect(state.currentIndex).toBe(0);
  });

  test('starts complete for an empty block list', () => {
    const state = initWorkoutState([]);
    expect(state.status).toBe('complete');
  });
});

describe('workoutReducer', () => {
  test('COMPLETE_BLOCK advances to the next index', () => {
    const state = workoutReducer(initWorkoutState(blocks), { type: 'COMPLETE_BLOCK' });
    expect(state.currentIndex).toBe(1);
    expect(state.status).toBe('active');
  });

  test('COMPLETE_BLOCK on the last block sets status to complete', () => {
    let state = initWorkoutState(blocks);
    state = workoutReducer(state, { type: 'COMPLETE_BLOCK' });
    state = workoutReducer(state, { type: 'COMPLETE_BLOCK' });
    state = workoutReducer(state, { type: 'COMPLETE_BLOCK' });
    expect(state.status).toBe('complete');
  });

  test('PAUSE then RESUME returns to active without changing index', () => {
    let state = initWorkoutState(blocks);
    state = workoutReducer(state, { type: 'PAUSE' });
    expect(state.status).toBe('paused');
    state = workoutReducer(state, { type: 'RESUME' });
    expect(state.status).toBe('active');
    expect(state.currentIndex).toBe(0);
  });

  test('COMPLETE_BLOCK is ignored while paused', () => {
    let state = initWorkoutState(blocks);
    state = workoutReducer(state, { type: 'PAUSE' });
    state = workoutReducer(state, { type: 'COMPLETE_BLOCK' });
    expect(state.currentIndex).toBe(0);
    expect(state.status).toBe('paused');
  });
});

describe('currentBlock', () => {
  test('returns the block at currentIndex, or null when complete', () => {
    const state = initWorkoutState(blocks);
    expect(currentBlock(state)).toEqual({ id: 'a' });
    expect(currentBlock(initWorkoutState([]))).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/engine/workoutReducer.test.js`
Expected: FAIL — `src/engine/workoutReducer.js` does not exist yet.

- [ ] **Step 3: Write `src/engine/workoutReducer.js`**

```js
export function initWorkoutState(blocks) {
  return { blocks, currentIndex: 0, status: blocks.length > 0 ? 'active' : 'complete' };
}

export function workoutReducer(state, action) {
  switch (action.type) {
    case 'PAUSE':
      if (state.status !== 'active') return state;
      return { ...state, status: 'paused' };
    case 'RESUME':
      if (state.status !== 'paused') return state;
      return { ...state, status: 'active' };
    case 'COMPLETE_BLOCK': {
      if (state.status !== 'active') return state;
      const nextIndex = state.currentIndex + 1;
      if (nextIndex >= state.blocks.length) {
        return { ...state, currentIndex: nextIndex, status: 'complete' };
      }
      return { ...state, currentIndex: nextIndex };
    }
    default:
      return state;
  }
}

export function currentBlock(state) {
  return state.blocks[state.currentIndex] ?? null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/engine/workoutReducer.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/engine/workoutReducer.js src/engine/workoutReducer.test.js
git commit -m "feat: add pure workout block-sequence state machine"
```

---

## Task 7: Voice & Wake Lock Wrappers

**Files:**
- Create: `src/engine/voice.js`
- Create: `src/engine/wakeLock.js`
- Test: `src/engine/voice.test.js`
- Test: `src/engine/wakeLock.test.js`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: `isSpeechSupported()`, `speak(text: string)`, `cancelSpeech()`; `isWakeLockSupported()`, `requestWakeLock()`, `releaseWakeLock()`, `attachVisibilityReacquire() => () => void` (detach function). Consumed by `useWorkoutEngine`.

- [ ] **Step 1: Write the failing test `src/engine/voice.test.js`**

```js
import { afterEach, describe, expect, test, vi } from 'vitest';
import { isSpeechSupported, speak, cancelSpeech } from './voice.js';

describe('when speechSynthesis is unavailable', () => {
  test('isSpeechSupported is false and speak/cancelSpeech do not throw', () => {
    expect(isSpeechSupported()).toBe(false);
    expect(() => speak('hello')).not.toThrow();
    expect(() => cancelSpeech()).not.toThrow();
  });
});

describe('when speechSynthesis is available', () => {
  afterEach(() => {
    delete window.speechSynthesis;
    delete window.SpeechSynthesisUtterance;
  });

  test('speak queues an utterance without cancelling prior speech', () => {
    const speakFn = vi.fn();
    const cancelFn = vi.fn();
    window.speechSynthesis = { speak: speakFn, cancel: cancelFn };
    window.SpeechSynthesisUtterance = function (text) {
      this.text = text;
    };

    expect(isSpeechSupported()).toBe(true);
    speak('Отжимания');

    expect(speakFn).toHaveBeenCalledTimes(1);
    expect(speakFn.mock.calls[0][0].text).toBe('Отжимания');
    expect(cancelFn).not.toHaveBeenCalled();
  });

  test('cancelSpeech cancels pending speech', () => {
    const cancelFn = vi.fn();
    window.speechSynthesis = { speak: vi.fn(), cancel: cancelFn };
    window.SpeechSynthesisUtterance = function (text) {
      this.text = text;
    };

    cancelSpeech();
    expect(cancelFn).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/engine/voice.test.js`
Expected: FAIL — `src/engine/voice.js` does not exist yet.

- [ ] **Step 3: Write `src/engine/voice.js`**

```js
export function isSpeechSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function speak(text) {
  if (!isSpeechSupported()) return;
  const utterance = new window.SpeechSynthesisUtterance(text);
  window.speechSynthesis.speak(utterance);
}

export function cancelSpeech() {
  if (!isSpeechSupported()) return;
  window.speechSynthesis.cancel();
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/engine/voice.test.js`
Expected: PASS

- [ ] **Step 5: Write the failing test `src/engine/wakeLock.test.js`**

```js
import { afterEach, describe, expect, test, vi } from 'vitest';
import {
  isWakeLockSupported,
  requestWakeLock,
  releaseWakeLock,
  attachVisibilityReacquire,
} from './wakeLock.js';

describe('when wakeLock is unavailable', () => {
  test('isWakeLockSupported is false and requestWakeLock resolves without throwing', async () => {
    expect(isWakeLockSupported()).toBe(false);
    await expect(requestWakeLock()).resolves.toBeUndefined();
    const detach = attachVisibilityReacquire();
    expect(typeof detach).toBe('function');
    detach();
  });
});

describe('when wakeLock is available', () => {
  afterEach(() => {
    delete navigator.wakeLock;
  });

  test('requestWakeLock calls navigator.wakeLock.request("screen")', async () => {
    const sentinel = { release: vi.fn().mockResolvedValue(undefined) };
    const request = vi.fn().mockResolvedValue(sentinel);
    navigator.wakeLock = { request };

    await requestWakeLock();
    expect(request).toHaveBeenCalledWith('screen');

    await releaseWakeLock();
    expect(sentinel.release).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npx vitest run src/engine/wakeLock.test.js`
Expected: FAIL — `src/engine/wakeLock.js` does not exist yet.

- [ ] **Step 7: Write `src/engine/wakeLock.js`**

```js
let wakeLockSentinel = null;

export function isWakeLockSupported() {
  return typeof navigator !== 'undefined' && 'wakeLock' in navigator;
}

export async function requestWakeLock() {
  if (!isWakeLockSupported()) return;
  try {
    wakeLockSentinel = await navigator.wakeLock.request('screen');
  } catch {
    wakeLockSentinel = null;
  }
}

export async function releaseWakeLock() {
  if (wakeLockSentinel) {
    await wakeLockSentinel.release();
    wakeLockSentinel = null;
  }
}

export function attachVisibilityReacquire() {
  if (!isWakeLockSupported()) return () => {};
  const handler = () => {
    if (document.visibilityState === 'visible' && wakeLockSentinel) {
      requestWakeLock();
    }
  };
  document.addEventListener('visibilitychange', handler);
  return () => document.removeEventListener('visibilitychange', handler);
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npx vitest run src/engine/wakeLock.test.js`
Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add src/engine/voice.js src/engine/voice.test.js src/engine/wakeLock.js src/engine/wakeLock.test.js
git commit -m "feat: add voice and wake-lock wrappers with silent no-op fallback"
```

---

## Task 8: `useWorkoutEngine` Hook

**Files:**
- Create: `src/hooks/useWorkoutEngine.js`
- Test: `src/hooks/useWorkoutEngine.test.js`

**Interfaces:**
- Consumes: `workoutReducer`, `initWorkoutState`, `currentBlock` (Task 6); `computeRemainingMs` (Task 5); `speak`, `cancelSpeech` (Task 7); `requestWakeLock`, `releaseWakeLock`, `attachVisibilityReacquire` (Task 7).
- Produces: `useWorkoutEngine(blocks: Exercise[]) => { state, block, remainingMs, pause, resume, completeRepsBlock }`. Consumed by the Workout screen.

- [ ] **Step 1: Write the failing test `src/hooks/useWorkoutEngine.test.js`**

```js
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { useWorkoutEngine } from './useWorkoutEngine.js';

const blocks = [
  { id: 'time-block', unit: 'time', seconds: 1, name: 'Планка' },
  { id: 'reps-block', unit: 'reps', reps: 10, name: 'Отжимания' },
];

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useWorkoutEngine', () => {
  test('auto-advances a time block when it expires', () => {
    const { result } = renderHook(() => useWorkoutEngine(blocks));
    expect(result.current.state.currentIndex).toBe(0);

    act(() => {
      vi.advanceTimersByTime(1200);
    });

    expect(result.current.state.currentIndex).toBe(1);
    expect(result.current.block.id).toBe('reps-block');
  });

  test('a reps block only advances via completeRepsBlock', () => {
    const { result } = renderHook(() => useWorkoutEngine(blocks));

    act(() => {
      vi.advanceTimersByTime(1200);
    });
    expect(result.current.block.id).toBe('reps-block');

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current.state.currentIndex).toBe(1);

    act(() => {
      result.current.completeRepsBlock();
    });
    expect(result.current.state.status).toBe('complete');
  });

  test('pause stops a time block from advancing', () => {
    const { result } = renderHook(() => useWorkoutEngine(blocks));

    act(() => {
      result.current.pause();
    });
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.state.currentIndex).toBe(0);
    expect(result.current.state.status).toBe('paused');
  });

  test('resume lets a paused time block continue toward completion', () => {
    const { result } = renderHook(() => useWorkoutEngine(blocks));

    act(() => {
      result.current.pause();
    });
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    act(() => {
      result.current.resume();
    });
    act(() => {
      vi.advanceTimersByTime(1200);
    });

    expect(result.current.state.currentIndex).toBe(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/hooks/useWorkoutEngine.test.js`
Expected: FAIL — `src/hooks/useWorkoutEngine.js` does not exist yet.

- [ ] **Step 3: Write `src/hooks/useWorkoutEngine.js`**

```js
import { useEffect, useReducer, useRef, useState } from 'react';
import { workoutReducer, initWorkoutState, currentBlock } from '../engine/workoutReducer.js';
import { computeRemainingMs } from '../engine/timer.js';
import { speak, cancelSpeech } from '../engine/voice.js';
import { requestWakeLock, releaseWakeLock, attachVisibilityReacquire } from '../engine/wakeLock.js';

const TICK_MS = 100;

export function useWorkoutEngine(blocks) {
  const [state, dispatch] = useReducer(workoutReducer, blocks, initWorkoutState);
  const block = currentBlock(state);
  const blockDurationMs = block?.unit === 'time' ? block.seconds * 1000 : 0;
  const [remainingMs, setRemainingMs] = useState(blockDurationMs);
  const timingRef = useRef({ startedAt: Date.now(), pausedAccumMs: 0, pausedAt: null });

  useEffect(() => {
    timingRef.current = { startedAt: Date.now(), pausedAccumMs: 0, pausedAt: null };
    setRemainingMs(blockDurationMs);
    if (block) speak(block.name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.currentIndex]);

  useEffect(() => {
    requestWakeLock();
    const detach = attachVisibilityReacquire();
    return () => {
      detach();
      releaseWakeLock();
      cancelSpeech();
    };
  }, []);

  useEffect(() => {
    if (state.status !== 'active' || block?.unit !== 'time') return undefined;
    const interval = setInterval(() => {
      const { startedAt, pausedAccumMs } = timingRef.current;
      const remaining = computeRemainingMs(startedAt, pausedAccumMs, blockDurationMs);
      setRemainingMs(remaining);
      if (remaining <= 0) {
        dispatch({ type: 'COMPLETE_BLOCK' });
      }
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [state.status, state.currentIndex, block, blockDurationMs]);

  function pause() {
    timingRef.current.pausedAt = Date.now();
    dispatch({ type: 'PAUSE' });
  }

  function resume() {
    const { pausedAt, pausedAccumMs } = timingRef.current;
    if (pausedAt) {
      timingRef.current.pausedAccumMs = pausedAccumMs + (Date.now() - pausedAt);
      timingRef.current.pausedAt = null;
    }
    dispatch({ type: 'RESUME' });
  }

  function completeRepsBlock() {
    cancelSpeech();
    dispatch({ type: 'COMPLETE_BLOCK' });
  }

  return { state, block, remainingMs, pause, resume, completeRepsBlock };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/hooks/useWorkoutEngine.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useWorkoutEngine.js src/hooks/useWorkoutEngine.test.js
git commit -m "feat: add useWorkoutEngine hook wiring timer, voice, and wake lock"
```

---

## Task 9: Routing Shell & Home Screen

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/App.test.jsx` (replace Task 1's placeholder test)
- Create: `src/components/DurationPicker.jsx`
- Create: `src/screens/Home.jsx`
- Test: `src/screens/Home.test.jsx`

**Interfaces:**
- Consumes: `getSettings`, `saveSettings`, `getAllCompletionDates` (Task 3); `computeStreak` (Task 4); `src/data/programs/morning-charge.json` (Task 2).
- Produces: `<App />` rendering a `HashRouter` with routes `/`, `/workout`, `/complete`, `/calendar`, `/settings` and a bottom nav; `<Home />` screen. Later tasks add the remaining route targets.

- [ ] **Step 1: Write `src/components/DurationPicker.jsx`**

```jsx
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
```

- [ ] **Step 2: Write the failing test `src/screens/Home.test.jsx`**

```jsx
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
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run src/screens/Home.test.jsx`
Expected: FAIL — `src/screens/Home.jsx` does not exist yet, and `@testing-library/user-event` is not installed yet.

- [ ] **Step 4: Install `@testing-library/user-event`**

Run: `npm install --save-dev @testing-library/user-event`
Expected: added to `devDependencies`.

- [ ] **Step 5: Write `src/screens/Home.jsx`**

```jsx
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
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run src/screens/Home.test.jsx`
Expected: PASS

- [ ] **Step 7: Replace `src/App.test.jsx` for the routed app**

```jsx
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
```

- [ ] **Step 8: Write `src/App.jsx`**

Routes to `/workout`, `/complete`, `/calendar`, `/settings` are placeholders here — Tasks 10 and 11 replace them with real screens.

```jsx
import { HashRouter, Routes, Route, NavLink } from 'react-router-dom';
import Home from './screens/Home.jsx';

function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/workout" element={<div>Workout placeholder</div>} />
            <Route path="/complete" element={<div>Complete placeholder</div>} />
            <Route path="/calendar" element={<div>Calendar placeholder</div>} />
            <Route path="/settings" element={<div>Settings placeholder</div>} />
          </Routes>
        </main>
        <nav className="flex justify-around border-t border-slate-800 py-3">
          <NavLink to="/" end className="text-sm">
            Главная
          </NavLink>
          <NavLink to="/calendar" className="text-sm">
            Календарь
          </NavLink>
          <NavLink to="/settings" className="text-sm">
            Настройки
          </NavLink>
        </nav>
      </div>
    </HashRouter>
  );
}

export default App;
```

- [ ] **Step 9: Run the full test suite**

Run: `npx vitest run src/App.test.jsx src/screens/Home.test.jsx`
Expected: PASS

- [ ] **Step 10: Manual browser verification**

Run: `npm run dev`, open the printed local URL. Confirm: Home shows a day name, streak line, duration buttons (clicking one highlights it), and clicking "Начать" navigates to `#/workout` (placeholder text visible). Stop the dev server after checking.

- [ ] **Step 11: Commit**

```bash
git add src/App.jsx src/App.test.jsx src/components/DurationPicker.jsx src/screens/Home.jsx src/screens/Home.test.jsx package.json package-lock.json
git commit -m "feat: add routing shell and Home screen"
```

---

## Task 10: Workout & Complete Screens

**Files:**
- Modify: `src/App.jsx` (wire real `/workout` and `/complete` routes)
- Create: `src/components/ExerciseCard.jsx`
- Create: `src/components/Timer.jsx`
- Create: `src/components/VoiceIndicator.jsx`
- Create: `src/screens/Workout.jsx`
- Create: `src/screens/Complete.jsx`
- Test: `src/screens/Workout.test.jsx`
- Test: `src/screens/Complete.test.jsx`

**Interfaces:**
- Consumes: `useWorkoutEngine` (Task 8), `getDayContent` (Task 2), `recordCompletion`, `getAllCompletionDates` (Task 3), `computeStreak`, `toDateString` (Task 4), `isSpeechSupported` (Task 7).
- Produces: working `/workout` and `/complete` routes. Consumed by App routing only.

- [ ] **Step 1: Write `src/components/ExerciseCard.jsx`**

```jsx
function ExerciseCard({ exercise }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <img src={exercise.mediaUrl} alt={exercise.name} className="w-40 h-40 object-contain" />
      <h2 className="text-xl font-bold">{exercise.name}</h2>
      {exercise.unit === 'reps' && <p className="text-slate-400">{exercise.reps} повторений</p>}
    </div>
  );
}

export default ExerciseCard;
```

- [ ] **Step 2: Write `src/components/Timer.jsx`**

```jsx
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
```

- [ ] **Step 3: Write `src/components/VoiceIndicator.jsx`**

```jsx
import { isSpeechSupported } from '../engine/voice.js';

function VoiceIndicator() {
  if (!isSpeechSupported()) return null;
  return <p className="text-xs text-slate-500">🔊 Голосовой режим включён</p>;
}

export default VoiceIndicator;
```

- [ ] **Step 4: Write the failing test `src/screens/Workout.test.jsx`**

```jsx
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
```

- [ ] **Step 5: Run test to verify it fails**

Run: `npx vitest run src/screens/Workout.test.jsx`
Expected: FAIL — `src/screens/Workout.jsx` does not exist yet.

- [ ] **Step 6: Write `src/screens/Workout.jsx`**

```jsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useWorkoutEngine } from '../hooks/useWorkoutEngine.js';
import { getDayContent } from '../data/content.js';
import Timer from '../components/Timer.jsx';
import ExerciseCard from '../components/ExerciseCard.jsx';
import VoiceIndicator from '../components/VoiceIndicator.jsx';

function Workout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dayIndex = Number(searchParams.get('day'));
  const duration = Number(searchParams.get('duration'));
  const content = getDayContent(dayIndex, duration);
  const { state, block, remainingMs, pause, resume, completeRepsBlock } = useWorkoutEngine(
    content.blocks
  );

  useEffect(() => {
    if (state.status === 'complete') {
      navigate(`/complete?duration=${duration}`, { replace: true });
    }
  }, [state.status, duration, navigate]);

  if (!block) return null;

  return (
    <div className="p-6 flex flex-col gap-6">
      <VoiceIndicator />
      <ExerciseCard exercise={block} />
      {block.unit === 'time' ? (
        <Timer remainingMs={remainingMs} totalMs={block.seconds * 1000} />
      ) : (
        <button
          type="button"
          onClick={completeRepsBlock}
          className="bg-yellow-400 text-slate-900 font-bold py-3 rounded-full text-lg"
        >
          Готово
        </button>
      )}
      <button
        type="button"
        onClick={state.status === 'paused' ? resume : pause}
        className="border border-slate-400 text-slate-100 py-2 rounded-full"
      >
        {state.status === 'paused' ? 'Продолжить' : 'Пауза'}
      </button>
    </div>
  );
}

export default Workout;
```

- [ ] **Step 7: Run test to verify it passes**

Run: `npx vitest run src/screens/Workout.test.jsx`
Expected: PASS

- [ ] **Step 8: Write the failing test `src/screens/Complete.test.jsx`**

```jsx
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
```

- [ ] **Step 9: Run test to verify it fails**

Run: `npx vitest run src/screens/Complete.test.jsx`
Expected: FAIL — `src/screens/Complete.jsx` does not exist yet.

- [ ] **Step 10: Write `src/screens/Complete.jsx`**

```jsx
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { recordCompletion, getAllCompletionDates } from '../storage/storage.js';
import { computeStreak, toDateString } from '../engine/streak.js';

function Complete() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const duration = Number(searchParams.get('duration')) || 0;
  const [streak, setStreak] = useState(null);

  useEffect(() => {
    async function finish() {
      await recordCompletion(toDateString(new Date()), duration);
      const dates = await getAllCompletionDates();
      setStreak(computeStreak(dates));
    }
    finish();
  }, [duration]);

  return (
    <div className="p-6 flex flex-col gap-6 items-center text-center">
      <h1 className="text-2xl font-bold">Готово!</h1>
      {streak !== null && (
        <p className="text-xl">
          Стрик: {streak} {streak === 1 ? 'день' : 'дней'}
        </p>
      )}
      <button
        type="button"
        onClick={() => navigate('/')}
        className="bg-yellow-400 text-slate-900 font-bold py-3 px-6 rounded-full"
      >
        На главную
      </button>
    </div>
  );
}

export default Complete;
```

- [ ] **Step 11: Run test to verify it passes**

Run: `npx vitest run src/screens/Complete.test.jsx`
Expected: PASS

- [ ] **Step 12: Wire the routes into `src/App.jsx`**

```jsx
import { HashRouter, Routes, Route, NavLink } from 'react-router-dom';
import Home from './screens/Home.jsx';
import Workout from './screens/Workout.jsx';
import Complete from './screens/Complete.jsx';

function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/workout" element={<Workout />} />
            <Route path="/complete" element={<Complete />} />
            <Route path="/calendar" element={<div>Calendar placeholder</div>} />
            <Route path="/settings" element={<div>Settings placeholder</div>} />
          </Routes>
        </main>
        <nav className="flex justify-around border-t border-slate-800 py-3">
          <NavLink to="/" end className="text-sm">
            Главная
          </NavLink>
          <NavLink to="/calendar" className="text-sm">
            Календарь
          </NavLink>
          <NavLink to="/settings" className="text-sm">
            Настройки
          </NavLink>
        </nav>
      </div>
    </HashRouter>
  );
}

export default App;
```

- [ ] **Step 13: Manual browser verification**

Run: `npm run dev`. Click "Начать" from Home, confirm the exercise name/image/timer show and count down, confirm pause/resume works, confirm reps-based blocks show a "Готово" button instead of a timer, and confirm finishing the sequence lands on the Complete screen showing an updated streak, with "На главную" returning to Home. Stop the dev server after checking.

- [ ] **Step 14: Commit**

```bash
git add src/App.jsx src/components/ExerciseCard.jsx src/components/Timer.jsx src/components/VoiceIndicator.jsx src/screens/Workout.jsx src/screens/Workout.test.jsx src/screens/Complete.jsx src/screens/Complete.test.jsx
git commit -m "feat: add Workout and Complete screens"
```

---

## Task 11: Calendar & Settings Screens

**Files:**
- Modify: `src/App.jsx` (wire real `/calendar` and `/settings` routes)
- Create: `src/components/ProgressCalendar.jsx`
- Create: `src/screens/Calendar.jsx`
- Create: `src/screens/Settings.jsx`
- Test: `src/screens/Calendar.test.jsx`
- Test: `src/screens/Settings.test.jsx`

**Interfaces:**
- Consumes: `getAllCompletionDates` (Task 3), `computeStreak`, `toDateString` (Task 4), `getSettings`, `saveSettings` (Task 3), `DurationPicker` (Task 9).
- Produces: working `/calendar` and `/settings` routes — completes the MVP screen set.

- [ ] **Step 1: Write the failing test `src/screens/Calendar.test.jsx`**

```jsx
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/screens/Calendar.test.jsx`
Expected: FAIL — `src/screens/Calendar.jsx` does not exist yet.

- [ ] **Step 3: Write `src/components/ProgressCalendar.jsx`**

```jsx
import { toDateString } from '../engine/streak.js';

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function ProgressCalendar({ completionDates, year, month }) {
  const total = daysInMonth(year, month);
  const days = Array.from({ length: total }, (_, i) => i + 1);
  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((day) => {
        const dateStr = toDateString(new Date(year, month, day));
        const done = completionDates.has(dateStr);
        return (
          <div
            key={dateStr}
            className={`aspect-square flex items-center justify-center rounded-full text-sm ${
              done ? 'bg-yellow-400 text-slate-900' : 'bg-slate-800 text-slate-400'
            }`}
          >
            {day}
          </div>
        );
      })}
    </div>
  );
}

export default ProgressCalendar;
```

- [ ] **Step 4: Write `src/screens/Calendar.jsx`**

```jsx
import { useEffect, useState } from 'react';
import { getAllCompletionDates } from '../storage/storage.js';
import { computeStreak } from '../engine/streak.js';
import ProgressCalendar from '../components/ProgressCalendar.jsx';

function Calendar() {
  const [completionDates, setCompletionDates] = useState(new Set());
  const now = new Date();

  useEffect(() => {
    getAllCompletionDates().then(setCompletionDates);
  }, []);

  return (
    <div className="p-6 flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Календарь</h1>
      <p className="text-slate-400">
        Стрик: {computeStreak(completionDates)}{' '}
        {computeStreak(completionDates) === 1 ? 'день' : 'дней'}
      </p>
      <ProgressCalendar completionDates={completionDates} year={now.getFullYear()} month={now.getMonth()} />
    </div>
  );
}

export default Calendar;
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/screens/Calendar.test.jsx`
Expected: PASS

- [ ] **Step 6: Write the failing test `src/screens/Settings.test.jsx`**

```jsx
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
```

- [ ] **Step 7: Run test to verify it fails**

Run: `npx vitest run src/screens/Settings.test.jsx`
Expected: FAIL — `src/screens/Settings.jsx` does not exist yet.

- [ ] **Step 8: Write `src/screens/Settings.jsx`**

```jsx
import { useEffect, useState } from 'react';
import { getSettings, saveSettings } from '../storage/storage.js';
import DurationPicker from '../components/DurationPicker.jsx';

function Settings() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  if (!settings) return null;

  function updateDuration(defaultDuration) {
    saveSettings({ defaultDuration }).then(setSettings);
  }

  function toggleSound() {
    saveSettings({ soundEnabled: !settings.soundEnabled }).then(setSettings);
  }

  return (
    <div className="p-6 flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Настройки</h1>
      <div>
        <p className="mb-2 text-slate-400">Длительность по умолчанию</p>
        <DurationPicker value={settings.defaultDuration} onChange={updateDuration} />
      </div>
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={settings.soundEnabled} onChange={toggleSound} />
        Звук / голосовой режим
      </label>
    </div>
  );
}

export default Settings;
```

- [ ] **Step 9: Run test to verify it passes**

Run: `npx vitest run src/screens/Settings.test.jsx`
Expected: PASS

- [ ] **Step 10: Wire the routes into `src/App.jsx`**

```jsx
import { HashRouter, Routes, Route, NavLink } from 'react-router-dom';
import Home from './screens/Home.jsx';
import Workout from './screens/Workout.jsx';
import Complete from './screens/Complete.jsx';
import Calendar from './screens/Calendar.jsx';
import Settings from './screens/Settings.jsx';

function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/workout" element={<Workout />} />
            <Route path="/complete" element={<Complete />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
        <nav className="flex justify-around border-t border-slate-800 py-3">
          <NavLink to="/" end className="text-sm">
            Главная
          </NavLink>
          <NavLink to="/calendar" className="text-sm">
            Календарь
          </NavLink>
          <NavLink to="/settings" className="text-sm">
            Настройки
          </NavLink>
        </nav>
      </div>
    </HashRouter>
  );
}

export default App;
```

- [ ] **Step 11: Manual browser verification**

Run: `npm run dev`. Visit Calendar — confirm today lights up after completing a workout. Visit Settings — confirm toggling sound and changing default duration persist across a page reload (IndexedDB survives reload; re-open Home and confirm the picker shows the new default). Stop the dev server after checking.

- [ ] **Step 12: Commit**

```bash
git add src/App.jsx src/components/ProgressCalendar.jsx src/screens/Calendar.jsx src/screens/Calendar.test.jsx src/screens/Settings.jsx src/screens/Settings.test.jsx
git commit -m "feat: add Calendar and Settings screens"
```

---

## Task 12: Full Test Suite & PWA Build Verification

**Files:**
- No new files — final verification pass.

**Interfaces:**
- Consumes: the entire app built in Tasks 1-11.
- Produces: confirmation the MVP is internally consistent and deployable as a PWA.

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: all test files pass, no skipped/failing tests.

- [ ] **Step 2: Run a production build**

Run: `npm run build`
Expected: exits 0. `dist/` contains `index.html`, `manifest.webmanifest`, `icon.svg`, and a generated service worker (`sw.js` or similar from vite-plugin-pwa).

- [ ] **Step 3: Serve the production build and manually verify PWA installability**

Run: `npm run preview`, open the printed local URL in a Chromium-based browser. Open DevTools → Application → Manifest and confirm the manifest loads with name "Утренняя зарядка" and the icon renders. Confirm no console errors on Home, Workout (full flow through Complete), Calendar, and Settings. Stop the preview server after checking.

- [ ] **Step 4: Commit (only if verification uncovered fixes)**

If Steps 1-3 required any code changes to pass, stage and commit them with a message describing what was fixed. If no changes were needed, skip this step — there is nothing to commit.

---

## Deliberately Out of Scope (per spec)

AI features, user accounts, social features, calorie tracking, multiple workout types, the 28-day content cycle, streak freeze, native app store distribution, analytics beyond what's needed to check retention (self-hosted Plausible/Umami wiring is a separate follow-up, not part of this plan), and Supabase sync. These are documented in the spec and intentionally excluded here.
