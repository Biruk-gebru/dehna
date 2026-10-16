'use client';

import type { Exercise } from '@/types';
import { FigureRig, merge, mirror, type Clip, type Pose, type PoseTarget } from './FigureRig';

interface Props {
  exercise: Exercise;
}

// ─── Clips ────────────────────────────────────────────────────────────────────
// Each clip loops through its poses. A pose only names what differs from the
// rest pose (standing or seated); the rig's spring smoothing does all the
// interpolation, so these are just targets. See FigureRig for the conventions.

const both = (arm: PoseTarget['armL']): PoseTarget => ({ armL: arm, armR: arm });

// Faces: a light effort while holding a stretch, relief when letting go.
const EFFORT: PoseTarget = { face: { brow: -0.3, pinch: 0.5, smile: -0.15, lids: 0.35 } };
const RELIEF: PoseTarget = { face: { brow: 0.15, smile: 0.55 } };
const CALM: PoseTarget = { face: { lids: 1, smile: 0.25, brow: 0.1 } };

/** One side, back to base, the other side, back to base. */
function alternate(side: PoseTarget, holdMs: number, betweenMs: number, base: PoseTarget = {}): Pose[] {
  const release = merge(base, RELIEF);
  return [
    { target: merge(base, EFFORT, side), durationMs: holdMs },
    { target: release, durationMs: betweenMs },
    { target: merge(base, EFFORT, mirror(side)), durationMs: holdMs },
    { target: release, durationMs: betweenMs },
  ];
}

const BREATHE: Clip = {
  seated: true, yaw: 25,
  poses: [
    { target: { torso: { flex: -3 }, head: { nod: -3 }, ...both({ sy: 2, sz: -1.5 }), face: { lids: 0.6, smile: 0.2 } }, durationMs: 3000 },
    { target: { face: { lids: 0.8, open: 0.45, smile: 0 } }, durationMs: 3000 }, // slow exhale
  ],
};

// ── Neck ──────────────────────────────────────────────────────────────────────

const NECK_SIDE_TILT: Clip = {
  yaw: 0,
  poses: alternate({ head: { tilt: -30 }, ...both({ sy: -1 }) }, 2200, 900),
};

const NECK_ROTATION: Clip = {
  seated: true, yaw: 12,
  poses: alternate({ head: { turn: -62 }, face: { gx: -0.8 } }, 2000, 900),
};

const NECK_CHIN_TUCK: Clip = {
  seated: true, yaw: 78,
  poses: [
    { target: merge(EFFORT, { head: { z: -4.5, nod: 6 } }), durationMs: 1800 },
    { target: merge(RELIEF, { head: { z: 1.5 } }), durationMs: 1300 },
  ],
};

// Right hand holds the seat edge, left hand rests on the right side of the head.
const NECK_UPPER_TRAP: Clip = {
  seated: true, yaw: 8,
  poses: alternate({
    head: { tilt: 30 },
    armR: { e: 6, a: 20, r: 0.98, sy: -3, grip: 0.9 },
    armL: { e: 152, a: 168, r: 0.67, pe: 120, pa: 0, hf: 0.6, he: 120, ha: 180, pron: -90 },
  }, 2400, 1100),
};

// Right hand behind the head, gaze down toward the left knee.
const NECK_LEVATOR_SCAP: Clip = {
  seated: true, yaw: 20,
  poses: alternate({
    head: { nod: 26, turn: 24, tilt: 8 },
    face: { gx: 0.5, gy: -1 },
    armR: { e: 150, a: 200, r: 0.58, pe: 115, pa: 30, hf: 0.5, he: 170, ha: 180, pron: -90 },
  }, 2400, 1100),
};

// ── Shoulders ─────────────────────────────────────────────────────────────────

const shrug = (sy: number, sz: number) => both({ sy, sz });
const ROLL_UP = shrug(7, 0), ROLL_FWD = shrug(2.5, 6), ROLL_DOWN = shrug(-2, 0), ROLL_BACK = shrug(2.5, -6);

const SHOULDER_ROLLS: Clip = {
  yaw: 40,
  poses: [
    ...[ROLL_BACK, ROLL_UP, ROLL_FWD, ROLL_DOWN, ROLL_BACK, ROLL_UP, ROLL_FWD, ROLL_DOWN],
    ...[ROLL_FWD, ROLL_UP, ROLL_BACK, ROLL_DOWN, ROLL_FWD, ROLL_UP, ROLL_BACK, ROLL_DOWN],
  ].map((target) => ({ target, durationMs: 620 })),
};

// Elbows bent to 90° at the sides, then the shoulder blades draw together.
const SQUEEZE_BASE = both({ e: 42, a: 88, r: 0.71, pe: 15, pa: -90 });
const SCAPULAR_SQUEEZE: Clip = {
  seated: true, yaw: 55,
  poses: [
    { target: merge(SQUEEZE_BASE, EFFORT, both({ sz: -5, e: 38, a: 62 }), { torso: { flex: -4 } }), durationMs: 1900 },
    { target: merge(SQUEEZE_BASE, RELIEF), durationMs: 1300 },
  ],
};

// Right arm across the chest, left forearm hooks it in close.
const CROSS_BODY: Clip = {
  yaw: 20,
  poses: alternate({
    armR: { e: 88, a: 160, r: 0.98, pe: 90, pa: -90 },
    armL: { e: 76, a: 145, r: 0.48, pe: 0, pa: 0 },
    head: { turn: 10 },
  }, 2400, 1000),
};

// Hands meet just above the head, arms beside the ears. Aiming a little forward
// (a < 180) makes the arms rise in front of the body, not sweep across the face.
const ARMS_UP = merge(both({ e: 168, a: 150, r: 0.98, pe: 90, pa: 0, grip: 0.9 }), { face: { gy: 0.8 } });
const OVERHEAD_REACH: Clip = {
  yaw: 0,
  poses: [
    { target: merge(ARMS_UP, EFFORT, { torso: { side: -13 }, head: { tilt: -4 } }), durationMs: 2200 },
    { target: merge(ARMS_UP, RELIEF), durationMs: 800 },
    { target: merge(ARMS_UP, EFFORT, { torso: { side: 13 }, head: { tilt: 4 } }), durationMs: 2200 },
    { target: merge(ARMS_UP, RELIEF), durationMs: 800 },
  ],
};

// Forearm flat on the door frame at shoulder height, step through.
const DOORFRAME: Clip = {
  yaw: 10, props: [{ kind: 'doorway' }],
  poses: alternate({
    pelvis: { z: 14 },
    torso: { twist: 10 },
    armR: { e: 132, a: -35, r: 0.71, pe: 60, pa: -35, hf: 0.6, he: 180, ha: 0, pron: 90 },
    legR: { z: 24 },
    legL: { z: 6 },
  }, 2400, 1100),
};

// ── Back ──────────────────────────────────────────────────────────────────────

const CAT_COW: Clip = {
  seated: true, yaw: 75,
  poses: [
    { target: { torso: { flex: -14 }, head: { nod: -14 }, ...both({ sz: -3, e: 36, a: 82, r: 0.86 }), face: { brow: 0.35, smile: 0.5, lids: 0.2 } }, durationMs: 2300 },
    { target: { torso: { flex: 24 }, head: { nod: 24 }, ...both({ sz: 3, e: 22, a: 70, r: 0.9 }), face: { lids: 0.85, open: 0.3, smile: 0 } }, durationMs: 2300 },
  ],
};

const ARMS_CROSSED = both({ e: 82, a: 162, r: 0.54, pe: 25, pa: 90 });
const THORACIC_ROTATION: Clip = {
  seated: true, yaw: 10,
  poses: [
    { target: ARMS_CROSSED, durationMs: 700 },
    { target: merge(ARMS_CROSSED, EFFORT, { torso: { twist: -42 }, head: { turn: -14 }, face: { gx: -0.6 } }), durationMs: 1900 },
    { target: merge(ARMS_CROSSED, RELIEF), durationMs: 700 },
    { target: merge(ARMS_CROSSED, EFFORT, { torso: { twist: 42 }, head: { turn: 14 }, face: { gx: 0.6 } }), durationMs: 1900 },
  ],
};

const SIDE_BEND: Clip = {
  seated: true, yaw: 0,
  poses: alternate({
    torso: { side: 18 },
    head: { tilt: 8 },
    armR: { e: 165, a: 130, r: 0.96, pe: 90, pa: 0, grip: 0.8 },
    armL: { e: 25, a: 20, r: 0.92 },
  }, 2400, 1000),
};

// Right hand on the outside of the left knee, left hand on the chair back.
const SPINAL_TWIST: Clip = {
  seated: true, yaw: 15,
  poses: alternate({
    torso: { twist: 42 },
    head: { turn: 25 },
    face: { gx: 0.7 },
    armR: { e: 42, a: 88, r: 1 },
    armL: { e: 48, a: -45, r: 0.85, pe: 70, pa: -90 },
  }, 2400, 1100),
};

const HANDS_LOW_BACK = both({ e: 23, a: -122, r: 0.7, pe: 80, pa: -50, hf: 0.7, he: 0, ha: 0 });
const BACK_EXTENSION: Clip = {
  yaw: 75,
  poses: [
    { target: merge(HANDS_LOW_BACK, EFFORT, { torso: { flex: -20, hinge: -6 }, head: { nod: -16 }, pelvis: { z: 3 }, face: { gy: 0.9 } }), durationMs: 2200 },
    { target: merge(HANDS_LOW_BACK, RELIEF), durationMs: 1500 },
  ],
};

const CHEST_OPENER: Clip = {
  yaw: 70,
  poses: [
    { target: merge(both({ e: 48, a: -110, r: 0.98, sz: -3 }), { torso: { flex: -6 }, head: { nod: -5 }, face: { lids: 0.5, smile: 0.45, brow: 0.2 } }), durationMs: 2600 },
    { target: merge(both({ e: 24, a: -124, r: 0.98 }), RELIEF), durationMs: 1500 },
  ],
};

// L-shape at the desk: hinge from the hips, hands on the desk, head between the arms.
const FORWARD_FOLD: Clip = {
  yaw: 80, shift: -42, props: [{ kind: 'desk', z: 84 }],
  poses: [
    { target: merge(both({ e: 162, a: 90, r: 0.97, pe: 90, pa: 0, grip: 0.6 }), { torso: { hinge: 88 }, head: { nod: 20 } }, CALM), durationMs: 4200 },
    { target: merge(both({ e: 137, a: 90, r: 0.97, pe: 90, pa: 0, grip: 0.6 }), { torso: { hinge: 75 }, head: { nod: 8 } }), durationMs: 1800 },
  ],
};

// ── Wrists / Elbows ───────────────────────────────────────────────────────────

const ARMS_FORWARD = { e: 84, a: 86, r: 0.97, pe: 90, pa: 0, hf: 1, grip: 0.8 };
const wrist = (he: number, ha: number) => merge(both({ ...ARMS_FORWARD, he, ha }), { face: { gy: -0.3 } });
const W_UP = wrist(126, 86), W_OUT = wrist(84, 44), W_DOWN = wrist(42, 86), W_IN = wrist(84, 128);
const WRIST_CIRCLES: Clip = {
  seated: true, yaw: 35,
  poses: [
    ...[W_UP, W_OUT, W_DOWN, W_IN, W_UP, W_OUT, W_DOWN, W_IN],
    ...[W_UP, W_IN, W_DOWN, W_OUT, W_UP, W_IN, W_DOWN, W_OUT],
  ].map((target) => ({ target, durationMs: 480 })),
};

const PALMS = { pe: 25, pa: 0, hf: 1, he: 172, ha: 90, pron: 180, grip: 0.5 };
const WRIST_PRAYER: Clip = {
  seated: true, yaw: 30,
  poses: [
    { target: both({ ...PALMS, e: 56, a: 124, r: 0.55 }), durationMs: 1600 },
    { target: both({ ...PALMS, e: 32, a: 127, r: 0.8 }), durationMs: 2600 },
  ],
};

// Right arm out, palm down, left hand presses the fingers down and in.
const WRIST_EXTENSOR: Clip = {
  seated: true, yaw: 30,
  poses: alternate({
    armR: { e: 85, a: 90, r: 1, hf: 1, he: 20, ha: 90, pron: -90, grip: 0.5 },
    armL: { e: 81, a: 119, r: 1, pe: 0, pa: 0, hf: 0.6, he: 90, ha: 170, grip: 0.5 },
  }, 2400, 1000),
};

const HANDS_UP = { e: 62, a: 78, r: 0.74, pe: 20, pa: -80, hf: 0.8, he: 150, ha: 90, pron: 90 };
const FINGER_SPREADS: Clip = {
  seated: true, yaw: 12,
  poses: [
    { target: both({ ...HANDS_UP, grip: 0 }), durationMs: 1400 },
    { target: both({ ...HANDS_UP, grip: 1 }), durationMs: 1400 },
  ],
};

const FOREARMS_FORWARD = { e: 70, a: 84, r: 0.7, pe: 10, pa: -90 };
const FOREARM_ROTATION: Clip = {
  seated: true, yaw: 35,
  poses: [
    { target: both({ ...FOREARMS_FORWARD, pron: 90 }), durationMs: 1500 },
    { target: both({ ...FOREARMS_FORWARD, pron: -90 }), durationMs: 1500 },
  ],
};

// ── Hips / Legs ───────────────────────────────────────────────────────────────

// Edge of the seat, right foot slides back so the knee drops below the hip.
const HIP_FLEXOR: Clip = {
  seated: true, yaw: 65,
  poses: alternate({
    pelvis: { z: 8 },
    torso: { hinge: 4 },
    legR: { x: 11, y: 8, z: 4, pitch: 50, out: 0 },
  }, 2400, 1100),
};

// Right ankle over the left knee, knee drops out, then a gentle hinge forward.
const FOUR = { legR: { x: -8, y: 56, z: 38, pitch: 0, yaw: -85, out: 80 } };
const FIGURE_FOUR: Clip = {
  seated: true, yaw: 0,
  poses: [
    { target: FOUR, durationMs: 1900 },
    { target: merge(FOUR, { torso: { hinge: 18 } }), durationMs: 2200 },
    { target: {}, durationMs: 1100 },
    { target: mirror(FOUR), durationMs: 1900 },
    { target: merge(mirror(FOUR), { torso: { hinge: 18 } }), durationMs: 2200 },
    { target: {}, durationMs: 1100 },
  ],
};

const lifted = (pitch: number, yaw: number): PoseTarget => ({ legR: { y: 18, z: 50, pitch, yaw } });
const ANKLE_LOOP = [lifted(30, 8), lifted(0, 40), lifted(-30, 8), lifted(0, -25)];
const ANKLE_CIRCLES: Clip = {
  seated: true, yaw: 50,
  poses: [
    ...[...ANKLE_LOOP, ...ANKLE_LOOP].map((target) => ({ target, durationMs: 520 })),
    { target: {}, durationMs: 700 },
    ...[...ANKLE_LOOP, ...ANKLE_LOOP].map((target) => ({ target: mirror(target), durationMs: 520 })),
    { target: {}, durationMs: 700 },
  ],
};

// Behind the chair, hands on its backrest, rising onto the toes.
const HANDS_ON_CHAIR = both({ e: 25, a: 99, r: 0.79, pe: 70, pa: -90, grip: 0.9 });
const CALF_RAISES: Clip = {
  yaw: 75, props: [{ kind: 'chair-front', z: 36 }],
  poses: [
    { target: merge(HANDS_ON_CHAIR, { pelvis: { y: 7 }, legL: { y: 13, pitch: 38 }, legR: { y: 13, pitch: 38 }, face: { brow: 0.4, smile: 0.4 } }), durationMs: 1200 },
    { target: HANDS_ON_CHAIR, durationMs: 1000 },
  ],
};

// Hands on hips; the pelvis traces a circle while the feet stay planted.
const HANDS_ON_HIPS = both({ e: 3, a: 90, r: 0.74, pe: 90, pa: -15, hf: 0.5, he: 0, ha: 180, grip: 0.6 });
const hips = (x: number, z: number) => merge(HANDS_ON_HIPS, { face: { smile: 0.7, brow: 0.2 } }, {
  pelvis: { x, z },
  torso: { side: -x * 0.9, flex: -z * 0.7 },
  legL: { x: 13 }, legR: { x: 13 },
});
const HIP_CIRCLES: Clip = {
  yaw: 30,
  poses: [
    hips(6, 0), hips(0, 6), hips(-6, 0), hips(0, -6), hips(6, 0), hips(0, 6), hips(-6, 0), hips(0, -6),
    hips(6, 0), hips(0, -6), hips(-6, 0), hips(0, 6), hips(6, 0), hips(0, -6), hips(-6, 0), hips(0, 6),
  ].map((target) => ({ target, durationMs: 650 })),
};

// Heel up on a chair seat, leg straight, hinge forward from the hips.
const HAMSTRING_DESK: Clip = {
  yaw: 80, shift: -20, props: [{ kind: 'ledge', z: 52 }],
  poses: alternate({
    torso: { hinge: 22 },
    face: { gy: -0.7 },
    legR: { x: 9, y: 50, z: 66, pitch: -55, out: 0 },
    ...both({ e: 40, a: 85, r: 0.95 }),
  }, 2600, 1100),
};

const SEATED_EXTENSION: Clip = {
  seated: true, yaw: 70,
  poses: alternate({ legR: { y: 44, z: 78, pitch: -25, out: 0 } }, 1900, 1100),
};

// Hands on the wall, right foot back with the heel down, front knee bends.
const CALF_STRETCH: Clip = {
  yaw: 80, props: [{ kind: 'wall', z: 60 }],
  poses: alternate({
    pelvis: { y: -5, z: 6 },
    torso: { hinge: 12 },
    legR: { z: -34, x: 9 },
    legL: { z: 18 },
    ...both({ e: 78, a: 90, r: 0.97, pe: 0, pa: 0, hf: 0.6, he: 180, ha: 90, pron: 90 }),
  }, 2600, 1100),
};

const GLUTE_SQUEEZE: Clip = {
  seated: true, yaw: 35,
  poses: [
    { target: { pelvis: { y: 1.5 }, torso: { flex: -3 }, head: { nod: -2 }, face: { pinch: 0.7, brow: -0.2, smile: -0.5, lids: 0.4 } }, durationMs: 1800 },
    { target: RELIEF, durationMs: 1300 },
  ],
};

// ── Mental exercises: eyes closed, brows drawn together in concentration ─────

const THINKING = { lids: 1, pinch: 0.45, brow: -0.15, smile: 0.05, gy: 0 };
const think = (face: Partial<typeof THINKING> & { open?: number }, rest: PoseTarget = {}): PoseTarget =>
  merge({ face: { ...THINKING, ...face } }, rest);

// Box breathing at its own rhythm: in, hold, out, hold, four seconds each.
const BOX_BREATHING: Clip = {
  seated: true, yaw: 25,
  poses: [
    { target: think({}, { torso: { flex: -3 }, head: { nod: -2 }, ...both({ sy: 2.5, sz: -1.5 }) }), durationMs: 4000 },
    { target: think({ pinch: 0.55 }, { torso: { flex: -3 }, head: { nod: -2 }, ...both({ sy: 2.5, sz: -1.5 }) }), durationMs: 4000 },
    { target: think({ open: 0.4, pinch: 0.35 }, { head: { nod: 3 } }), durationMs: 4000 },
    { target: think({ pinch: 0.5 }, { head: { nod: 4 } }), durationMs: 4000 },
  ],
};

const BODY_SCAN: Clip = {
  seated: true, yaw: 25,
  poses: [
    { target: think({}, { head: { nod: 3 } }), durationMs: 3200 },
    { target: think({ pinch: 0.6, brow: -0.25 }, { head: { nod: 6, tilt: 3 } }), durationMs: 2800 },
    { target: think({ pinch: 0.4 }, { head: { nod: 4, tilt: -2 } }), durationMs: 3000 },
  ],
};

const BREATH_COUNTING: Clip = {
  seated: true, yaw: 25,
  poses: [
    { target: think({}, { torso: { flex: -2 }, ...both({ sy: 1.5 }) }), durationMs: 2600 },
    { target: think({ open: 0.35, pinch: 0.35 }, { head: { nod: 3 } }), durationMs: 3200 },
  ],
};

// 5-4-3-2-1 asks you to look around, then to listen and feel with eyes closed.
const GROUNDING: Clip = {
  seated: true, yaw: 25,
  poses: [
    { target: { face: { pinch: 0.3, brow: -0.1, gx: 0.8, lids: 0.15 }, head: { turn: 25 } }, durationMs: 2600 },
    { target: { face: { pinch: 0.3, brow: -0.1, gx: -0.8, lids: 0.15 }, head: { turn: -25 } }, durationMs: 2600 },
    { target: think({ pinch: 0.5 }, { head: { tilt: 8, nod: 2 } }), durationMs: 3200 },
  ],
};

// ── Eyes: a close-up on the head and shoulders so the eyes can be read ────────

const CLOSE_UP: Clip['view'] = [-40, -140, 80, 84];
function eyeClip(poses: Pose[]): Clip;
function eyeClip(yaw: number, poses: Pose[]): Clip;
function eyeClip(a: number | Pose[], b?: Pose[]): Clip {
  return typeof a === 'number'
    ? { seated: true, yaw: a, view: CLOSE_UP, poses: b! }
    : { seated: true, yaw: 12, view: CLOSE_UP, poses: a };
}

const LOOK_FAR = eyeClip([
  { target: { head: { turn: -28, nod: -3 }, face: { gx: -0.7, gy: 0.15, lids: 0.2, smile: 0.2 } }, durationMs: 6000 },
  { target: { head: { turn: -24, nod: -2 }, face: { gx: -0.6, gy: 0.1, lids: 0.25, smile: 0.25 } }, durationMs: 5000 },
]);

// Rub the palms warm, then cup them over closed eyes.
const RUB = { e: 55, r: 0.58, pe: 20, pa: 0, hf: 1, he: 150, ha: 100, pron: 180, grip: 0.5 };
const PALMING = eyeClip([
  ...Array.from({ length: 8 }, (_, i) => ({
    target: { armL: { ...RUB, a: i % 2 ? 120 : 132 }, armR: { ...RUB, a: i % 2 ? 132 : 120 }, face: { smile: 0.4 } },
    durationMs: 180,
  })),
  {
    target: merge(both({ e: 142, a: 132, r: 0.5, pe: 40, pa: 0, hf: 1, he: 160, ha: 160, pron: -90, grip: 0.5 }), CALM, { head: { nod: 4 } }),
    durationMs: 6000,
  },
]);

// Thumb up close to the face, eyes converge on it, then relax into the distance.
// Straight in front of the face at eye height. Head-on it would hide the face,
// so this one is shot from three-quarters.
const THUMB_UP = { armR: { e: 129, a: 120, r: 0.72, pe: 10, pa: -90, hf: 1, he: 90, ha: 90, pron: 0, grip: 1 } };
const FOCUS_SHIFT = eyeClip(45, [
  { target: merge(THUMB_UP, { face: { cross: 0.8, gy: -0.15, pinch: 0.35, brow: -0.1 } }), durationMs: 2600 },
  { target: merge(THUMB_UP, { face: { cross: 0, gy: 0.1, lids: 0.15, brow: 0.1 } }), durationMs: 2600 },
]);

const gaze = (deg: number): PoseTarget => ({
  face: { gx: Math.cos(deg * Math.PI / 180), gy: Math.sin(deg * Math.PI / 180), brow: 0.3, lids: 0 },
});
const AROUND = [90, 45, 0, -45, -90, -135, 180, 135];
const EYE_CIRCLES = eyeClip([
  ...[...AROUND, ...AROUND].map((d) => ({ target: gaze(d), durationMs: 420 })),
  ...[...AROUND, ...AROUND].reverse().map((d) => ({ target: gaze(d), durationMs: 420 })),
]);

const SLOW_BLINKS = eyeClip([
  ...Array.from({ length: 4 }, () => [
    { target: { face: { lids: 1, smile: 0.2 } }, durationMs: 650 },
    { target: { face: { lids: 0.05, brow: 0.15 } }, durationMs: 750 },
  ]).flat(),
  { target: { face: { lids: 1, pinch: 0.6, brow: -0.3, smile: -0.3 } }, durationMs: 2000 },
  { target: { face: { gx: 0.6, brow: 0.2, smile: 0.3 }, head: { turn: 12 } }, durationMs: 1300 },
  { target: { face: { gx: -0.6, brow: 0.2, smile: 0.3 }, head: { turn: -12 } }, durationMs: 1300 },
]);

const EYES: Record<string, Clip> = {
  'eyes-20-20-20-01': LOOK_FAR,
  'eyes-palming-01': PALMING,
  'eyes-focus-shift-01': FOCUS_SHIFT,
  'eyes-circles-01': EYE_CIRCLES,
  'eyes-blink-01': SLOW_BLINKS,
};

const MENTAL: Record<string, Clip> = {
  'cognitive-box-breathing-01': BOX_BREATHING,
  'cognitive-body-scan-01': BODY_SCAN,
  'cognitive-grounding-01': GROUNDING,
  'cognitive-breath-counting-01': BREATH_COUNTING,
};

const CLIPS: Record<string, Clip> = {
  'neck-side-tilt-01': NECK_SIDE_TILT,
  'neck-rotation-01': NECK_ROTATION,
  'neck-chin-tuck-01': NECK_CHIN_TUCK,
  'neck-upper-trap-01': NECK_UPPER_TRAP,
  'neck-levator-scap-01': NECK_LEVATOR_SCAP,
  'shoulder-rolls-01': SHOULDER_ROLLS,
  'shoulder-scapular-squeeze-01': SCAPULAR_SQUEEZE,
  'shoulder-cross-body-01': CROSS_BODY,
  'shoulder-overhead-reach-01': OVERHEAD_REACH,
  'shoulder-doorframe-01': DOORFRAME,
  'back-cat-cow-01': CAT_COW,
  'back-thoracic-rotation-01': THORACIC_ROTATION,
  'back-side-bend-01': SIDE_BEND,
  'back-spinal-twist-01': SPINAL_TWIST,
  'back-extension-01': BACK_EXTENSION,
  'back-chest-opener-01': CHEST_OPENER,
  'back-forward-fold-01': FORWARD_FOLD,
  'wrist-circles-01': WRIST_CIRCLES,
  'wrist-prayer-01': WRIST_PRAYER,
  'wrist-extensor-01': WRIST_EXTENSOR,
  'wrist-finger-spreads-01': FINGER_SPREADS,
  'wrist-forearm-rotation-01': FOREARM_ROTATION,
  'hips-seated-hip-flexor-01': HIP_FLEXOR,
  'hips-figure-four-01': FIGURE_FOUR,
  'hips-ankle-circles-01': ANKLE_CIRCLES,
  'hips-calf-raises-01': CALF_RAISES,
  'hips-hip-circles-01': HIP_CIRCLES,
  'legs-hamstring-desk-01': HAMSTRING_DESK,
  'legs-seated-extension-01': SEATED_EXTENSION,
  'legs-calf-stretch-01': CALF_STRETCH,
  'legs-glute-squeeze-01': GLUTE_SQUEEZE,
};

export function getClip(exercise: Exercise): Clip {
  if (exercise.type === 'cognitive') return MENTAL[exercise.id] ?? BODY_SCAN;
  if (exercise.type === 'eye-break') return EYES[exercise.id] ?? LOOK_FAR;
  return CLIPS[exercise.id] ?? BREATHE;
}

// ─── Public component ─────────────────────────────────────────────────────────

export function ExerciseVisual({ exercise }: Props) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 'var(--space-2) 0',
      }}
    >
      <FigureRig clip={getClip(exercise)} />
    </div>
  );
}
