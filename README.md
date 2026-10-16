# Dehna (ደህና)

ደህና means "be well" in Amharic. Dehna is a focus timer for people who sit at a desk all day. When a block ends, a cartoon desk buddy walks you through a few minutes of stretches picked for where you hurt: neck, shoulders, back, wrists, hips, legs and eyes.

Everything runs in the browser. There's no account and no server, and your history stays on your device.

```
apps/
  web/     Next.js app, installable as a PWA (this is the real product)
  mobile/  Flutter app, an early scaffold that isn't wired up yet
```

## What it does

- **Focus blocks.** Pick 15 to 60 minutes. When the timer rings you get a chime, a notification and a 3 to 5 minute break.
- **Breaks built for you.** Each break mixes stretches for the areas you picked with an eye break after long sessions, then ends on a short mental exercise. Moves rotate so you don't get the same neck tilt all afternoon. The work screen previews the next break.
- **An animated avatar.** Every one of the 40 exercises is acted out by a small 3D-rigged character, with expressions, gaze and blinking. It sits or stands at a desk while you work.
- **Sit/stand desks.** If yours can stand, Dehna suggests when to switch, based on how long you've been in one posture, your sore spots and the time of day. Breaks lean toward exercises you can do in your current posture, and History charts the split.
- **History.** Time focused, breaks taken, a streak, and sitting versus standing per day.
- **Your data.** Stored in IndexedDB. Dehna asks the browser to keep it permanently, shows the status in Settings, and has export and import. If the database ever fails to open, you get a recovery screen with a "download a copy" button. Nothing is deleted automatically.

## Running it

The web app lives in `apps/web`.

```bash
cd apps/web
npm install
npm run dev        # http://localhost:3000
npm test           # unit tests (Vitest)
npm run lint       # ESLint with the Next.js config
npm run build      # production build
```

Don't run `npm run build` while the dev server is running. They share `.next/` and the dev server ends up serving broken CSS. If styles look stale after editing `globals.css`, stop the server, delete `.next/` and start it again.

## Deploying to Vercel

1. Import the repo and set **Root Directory** to `apps/web`.
2. Turn on **Web Analytics** for the project. `@vercel/analytics` is already in the layout and sends nothing until it's enabled. It counts anonymous page views with no cookies; your sessions and stretches never leave the browser.
3. Deploy. Open Graph and share-image URLs pick up the production domain automatically.

## How the avatar works

`apps/web/src/components/exercise/FigureRig.tsx` holds a small 3D skeleton projected through a camera. Poses are targets, not raw joint angles: arms say where the hand goes relative to the shoulder, and legs say where the ankle sits on the floor. Two-bone IK places elbows and knees, hands are kept outside the body, and every value eases on a critically damped spring. The exercise clips live in `ExerciseVisual.tsx`.

## Project notes

- Next.js 16 and React 19. This Next version differs from older docs, so check `node_modules/next/dist/docs/` before relying on memory.
- Themes are CSS variables in `apps/web/src/styles/themes/`. Sand and teal is the default.
- Tests cover the posture suggestion rules, the routine picker and the pose helpers. The rendering is checked by eye, not by tests.
