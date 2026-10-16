'use client';

import exercisesData from '@/data/exercises.json';
import { FigureRig, type Clip } from '@/components/exercise/FigureRig';
import { getClip } from '@/components/exercise/ExerciseVisual';
import { DeskAvatar } from '@/components/timer/DeskAvatar';
import type { Exercise } from '@/types';
import { useInView } from './useInView';

const byId = (id: string) => (exercisesData as Exercise[]).find((e) => e.id === id)!;

type Moment = { time: string; title: string; body: string; scene: 'sit' | 'stand' | Clip };

const DAY: Moment[] = [
  { time: '9:00', title: 'Start a focus block', body: 'Pick 25 minutes, or anything from 15 to 60. Dehna sits and works with you.', scene: 'sit' },
  { time: '9:25', title: 'The timer rings', body: 'A chime, then a short routine picked for your sore spots. Today that is your neck.', scene: getClip(byId('neck-side-tilt-01')) },
  { time: '11:40', title: 'Time to stand', body: 'Got a sit/stand desk? After a long stretch of sitting, Dehna suggests standing for a while.', scene: 'stand' },
  { time: '14:10', title: 'The afternoon slump', body: 'Screens all day are hard on the eyes. Some breaks are just for them.', scene: { ...getClip(byId('eyes-20-20-20-01')), view: undefined } }, // full body, to match the other scenes
  { time: '17:30', title: 'Done for the day', body: 'History shows how long you focused, how many breaks you took, and how long you stood.', scene: getClip(byId('cognitive-breath-counting-01')) },
];

function MomentRow({ m }: { m: Moment }) {
  const [ref, inView] = useInView<HTMLLIElement>('-15% 0px');
  return (
    <li ref={ref} className="home-moment" data-visible={inView}>
      <div className="home-moment-figure">
        {typeof m.scene === 'string'
          ? <DeskAvatar posture={m.scene === 'stand' ? 'standing' : 'sitting'} working={inView} />
          : <FigureRig clip={m.scene} static={!inView} size={170} />}
      </div>
      <div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--font-size-sm)', color: 'var(--color-primary)' }}>{m.time}</div>
        <div style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-text)', marginTop: 2 }}>{m.title}</div>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--line-height-relaxed)', marginTop: 'var(--space-2)', maxWidth: 400 }}>
          {m.body}
        </p>
      </div>
    </li>
  );
}

export function DayTimeline() {
  return (
    <section className="home-day">
      <h2 className="home-h2">A day with Dehna</h2>
      <ol className="home-moments">
        {DAY.map((m) => <MomentRow key={m.time} m={m} />)}
      </ol>
    </section>
  );
}
