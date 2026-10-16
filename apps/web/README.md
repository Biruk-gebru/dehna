# Dehna web app

The Next.js app behind Dehna. See the [root README](../../README.md) for what it does and how to deploy it.

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # Vitest
npm run lint    # ESLint
npm run build   # stop the dev server first, they share .next/
```

## Where things are

| Path | What's there |
|---|---|
| `src/app/` | Routes: landing, onboarding, work, exercises, history, settings |
| `src/components/exercise/` | The avatar rig (`FigureRig.tsx`), exercise clips (`ExerciseVisual.tsx`) and the break player |
| `src/components/timer/` | Work screen pieces: desk avatar, posture toggle, suggestion card |
| `src/components/home/` | Landing page sections |
| `src/lib/` | Routine picking, posture suggestions, storage, the Dexie database |
| `src/hooks/` | Timer, posture, preferences, session history |
| `src/data/exercises.json` | The 40 exercises: steps, tips, areas, durations |
| `src/styles/` | Global styles and the theme variables |
