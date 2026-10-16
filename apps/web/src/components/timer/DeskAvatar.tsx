'use client';

import { FigureRig, merge, type Clip, type Pose, type PoseTarget } from '@/components/exercise/FigureRig';
import type { Posture } from '@/types';

// The avatar working at its desk on the work screen. Small alternating hand
// movements read as typing; every so often it looks up and settles back.

const hands = (e: number, r: number, left = 0, right = 0): PoseTarget => ({
  armL: { e: e + left, a: 86, r, pe: 20, pa: -90, hf: 0.8, he: 80, ha: 90, pron: -90, grip: 0.55 },
  armR: { e: e + right, a: 86, r, pe: 20, pa: -90, hf: 0.8, he: 80, ha: 90, pron: -90, grip: 0.55 },
});

const FOCUSED = { brow: -0.25, pinch: 0.3, smile: 0.05, lids: 0.15 };

function workLoop(e: number, r: number, base: PoseTarget): Pose[] {
  const typing = (n: number): Pose[] => Array.from({ length: n }, (_, i) => ({
    target: merge(base, hands(e, r, i % 2 ? 3 : -2, i % 2 ? -2 : 3), { head: { nod: 6 }, face: FOCUSED }),
    durationMs: 260,
  }));
  return [
    ...typing(12),
    { target: merge(base, hands(e - 4, r - 0.04), { head: { nod: -2, turn: -10 }, torso: { flex: -3 }, face: { brow: 0.3, smile: 0.35 } }), durationMs: 1800 },
    ...typing(14),
    { target: merge(base, hands(e, r), { head: { nod: 2, tilt: 4 }, torso: { flex: 2 } }), durationMs: 1500 },
  ];
}

const SEATED_DESK: Clip = {
  seated: true, yaw: 70, shift: -8,
  props: [{ kind: 'desk', z: 20, height: 72, monitor: true }],
  poses: workLoop(58, 0.66, {}),
};

const STANDING_DESK: Clip = {
  yaw: 70, shift: -8,
  props: [{ kind: 'desk', z: 20, height: 106, monitor: true }],
  poses: workLoop(46, 0.78, {}),
};

interface DeskAvatarProps {
  posture: Posture;
  working: boolean; // false shows a still frame (idle or paused)
}

export function DeskAvatar({ posture, working }: DeskAvatarProps) {
  return <FigureRig clip={posture === 'standing' ? STANDING_DESK : SEATED_DESK} static={!working} />;
}
