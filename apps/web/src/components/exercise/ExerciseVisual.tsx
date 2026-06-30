'use client';

import type { Exercise } from '@/types';
import { FigureRig, type Pose } from './FigureRig';

interface Props {
  exercise: Exercise;
}

// ─── Pose sequences ───────────────────────────────────────────────────────────
// Each array defines a looping cycle: poses[last] → poses[0] → poses[1] → …
// durationMs is the time to reach that pose from the previous one.

// Default: slow breathing used for any exercise without a specific animation yet
const BREATHE: Pose[] = [
  { angles: { spine: 2, shoulderL: -14, shoulderR: 14 }, durationMs: 2600 },
  { angles: {},                                           durationMs: 2600 },
];

// ── Neck ──────────────────────────────────────────────────────────────────────

const NECK_SIDE_TILT: Pose[] = [
  { angles: { neck: -22 }, durationMs: 1400 },
  { angles: { neck: 0 },   durationMs: 900 },
  { angles: { neck: 22 },  durationMs: 1400 },
  { angles: { neck: 0 },   durationMs: 900 },
];

const NECK_ROTATION: Pose[] = [
  { angles: { neck: -28 }, durationMs: 1300 },
  { angles: { neck: 0 },   durationMs: 800 },
  { angles: { neck: 28 },  durationMs: 1300 },
  { angles: { neck: 0 },   durationMs: 800 },
];

const NECK_CHIN_TUCK: Pose[] = [
  { angles: { head: 14 },  durationMs: 900 },
  { angles: { head: 0 },   durationMs: 700 },
];

const NECK_UPPER_TRAP: Pose[] = [
  { angles: { neck: -20, shoulderR: 14 }, durationMs: 1400 },
  { angles: { neck: 0 },                  durationMs: 800 },
  { angles: { neck: 20, shoulderL: -14 }, durationMs: 1400 },
  { angles: { neck: 0 },                  durationMs: 800 },
];

const NECK_LEVATOR_SCAP: Pose[] = [
  { angles: { neck: -18, head: 12 },  durationMs: 1500 },
  { angles: { neck: 0, head: 0 },     durationMs: 900 },
  { angles: { neck: 18, head: -12 },  durationMs: 1500 },
  { angles: { neck: 0, head: 0 },     durationMs: 900 },
];

// ── Shoulders ─────────────────────────────────────────────────────────────────

// Shoulder roll: arms sweep back (inward) then forward (outward)
const SHOULDER_ROLLS: Pose[] = [
  { angles: { shoulderL: 8,   elbowL: 25, shoulderR: -8,  elbowR: -25 }, durationMs: 900 },
  { angles: { shoulderL: -12, elbowL: 8,  shoulderR: 12,  elbowR: -8  }, durationMs: 600 },
  { angles: { shoulderL: -45, elbowL: -5, shoulderR: 45,  elbowR: 5   }, durationMs: 900 },
  { angles: { shoulderL: -12, elbowL: 8,  shoulderR: 12,  elbowR: -8  }, durationMs: 600 },
];

// Scapular squeeze: elbows pull back, shoulders retract
const SCAPULAR_SQUEEZE: Pose[] = [
  { angles: { shoulderL: -5, elbowL: 35, shoulderR: 5, elbowR: -35 }, durationMs: 1100 },
  { angles: {},                                                         durationMs: 800 },
];

// Cross-body: right arm crosses to the left
const CROSS_BODY: Pose[] = [
  { angles: { shoulderR: -55, elbowR: 25 }, durationMs: 1200 },
  { angles: {},                              durationMs: 900 },
];

// Overhead reach: both arms lift, slight side-to-side sway
const OVERHEAD_REACH: Pose[] = [
  { angles: { shoulderL: -88, elbowL: -8,  shoulderR: 88,  elbowR: 8,  spine: -5 }, durationMs: 1300 },
  { angles: { shoulderL: -88, elbowL: -8,  shoulderR: 88,  elbowR: 8,  spine: 5  }, durationMs: 1300 },
];

// Doorframe: left arm up and out at 90° (L-shape)
const DOORFRAME: Pose[] = [
  { angles: { shoulderL: -82, elbowL: -85, shoulderR: 12, elbowR: -8 }, durationMs: 1400 },
  { angles: {},                                                           durationMs: 900 },
  { angles: { shoulderR: 82,  elbowR: 85,  shoulderL: -12, elbowL: 8 }, durationMs: 1400 },
  { angles: {},                                                           durationMs: 900 },
];

// ── Back ──────────────────────────────────────────────────────────────────────

const CAT_COW: Pose[] = [
  { angles: { spine: 10  }, durationMs: 1400 },
  { angles: { spine: -10 }, durationMs: 1400 },
];

const THORACIC_ROTATION: Pose[] = [
  { angles: { spine: -16 }, durationMs: 1200 },
  { angles: { spine: 0 },   durationMs: 700 },
  { angles: { spine: 16 },  durationMs: 1200 },
  { angles: { spine: 0 },   durationMs: 700 },
];

const SIDE_BEND: Pose[] = [
  { angles: { spine: -14, shoulderL: -68, elbowL: 0 },  durationMs: 1400 },
  { angles: { spine: 0 },                                durationMs: 700 },
  { angles: { spine: 14,  shoulderR: 68,  elbowR: 0 },  durationMs: 1400 },
  { angles: { spine: 0 },                                durationMs: 700 },
];

const SPINAL_TWIST: Pose[] = [
  { angles: { spine: -16, shoulderR: -40, elbowR: 20 }, durationMs: 1400 },
  { angles: { spine: 0 },                               durationMs: 800 },
  { angles: { spine: 16,  shoulderL: 40,  elbowL: -20 }, durationMs: 1400 },
  { angles: { spine: 0 },                               durationMs: 800 },
];

const BACK_EXTENSION: Pose[] = [
  { angles: { spine: -12, shoulderL: -8, shoulderR: 8 }, durationMs: 1200 },
  { angles: { spine: 0 },                                durationMs: 900 },
];

const CHEST_OPENER: Pose[] = [
  { angles: { shoulderL: 16, elbowL: 40, shoulderR: -16, elbowR: -40 }, durationMs: 1300 },
  { angles: {},                                                           durationMs: 900 },
];

const FORWARD_FOLD: Pose[] = [
  { angles: { spine: 22, shoulderL: -5, elbowL: 20, shoulderR: 5, elbowR: -20 }, durationMs: 1500 },
  { angles: { spine: 0 },                                                          durationMs: 1000 },
];

// ── Wrists / Elbows ───────────────────────────────────────────────────────────

// Arms extended forward (elbows bent in), wrists oscillate
const WRIST_CIRCLES: Pose[] = [
  { angles: { shoulderL: -45, elbowL: 60, wristL: 35, shoulderR: 45, elbowR: -60, wristR: -35 }, durationMs: 900 },
  { angles: { shoulderL: -45, elbowL: 60, wristL: -35, shoulderR: 45, elbowR: -60, wristR: 35 }, durationMs: 900 },
];

const WRIST_PRAYER: Pose[] = [
  { angles: { shoulderL: -30, elbowL: 60, wristL: 15, shoulderR: 30, elbowR: -60, wristR: -15 }, durationMs: 1400 },
  { angles: {},                                                                                     durationMs: 1000 },
];

const WRIST_EXTENSOR: Pose[] = [
  { angles: { shoulderR: 45, elbowR: -60, wristR: -35 }, durationMs: 1200 },
  { angles: { shoulderR: 45, elbowR: -60, wristR: 35  }, durationMs: 1200 },
];

const FINGER_SPREADS: Pose[] = [
  { angles: { shoulderL: -30, elbowL: 55, wristL: 22, shoulderR: 30, elbowR: -55, wristR: -22 }, durationMs: 800 },
  { angles: { shoulderL: -30, elbowL: 55, wristL: -22, shoulderR: 30, elbowR: -55, wristR: 22 }, durationMs: 800 },
];

const FOREARM_ROTATION: Pose[] = [
  { angles: { shoulderL: -32, elbowL: 55, wristL: 38, shoulderR: 32, elbowR: -55, wristR: -38 }, durationMs: 1100 },
  { angles: { shoulderL: -32, elbowL: 55, wristL: -38, shoulderR: 32, elbowR: -55, wristR: 38 }, durationMs: 1100 },
];

// ── Hips / Legs ───────────────────────────────────────────────────────────────

const HIP_FLEXOR: Pose[] = [
  { angles: { hipR: -12, kneeR: 8, spine: 3 },  durationMs: 1500 },
  { angles: {},                                   durationMs: 900 },
  { angles: { hipL: 12,  kneeL: -8, spine: -3 }, durationMs: 1500 },
  { angles: {},                                   durationMs: 900 },
];

const FIGURE_FOUR: Pose[] = [
  { angles: { hipR: 20, kneeR: -30 }, durationMs: 1500 },
  { angles: {},                       durationMs: 1000 },
];

const ANKLE_CIRCLES: Pose[] = [
  { angles: { hipR: -8, kneeR: -12, rootY: -4 }, durationMs: 700 },
  { angles: { hipR: -8, kneeR: -12, rootY: 4  }, durationMs: 700 },
];

const CALF_RAISES: Pose[] = [
  { angles: { rootY: -10, kneeL: -4, kneeR: -4 }, durationMs: 1000 },
  { angles: { rootY: 0 },                          durationMs: 800 },
];

const HIP_CIRCLES: Pose[] = [
  { angles: { spine: 6,  hipL: -8, hipR: 4 },  durationMs: 700 },
  { angles: { spine: -6, hipL: 4,  hipR: -8 }, durationMs: 700 },
];

const HAMSTRING_DESK: Pose[] = [
  { angles: { hipR: -42, kneeR: 5,  spine: 8 },  durationMs: 1500 },
  { angles: {},                                   durationMs: 900 },
  { angles: { hipL: 42,  kneeL: -5, spine: -8 }, durationMs: 1500 },
  { angles: {},                                   durationMs: 900 },
];

const SEATED_EXTENSION: Pose[] = [
  { angles: { kneeR: -30 }, durationMs: 1100 },
  { angles: {},              durationMs: 700 },
];

const CALF_STRETCH: Pose[] = [
  { angles: { hipL: -10, kneeL: 8, spine: 5 },  durationMs: 1400 },
  { angles: {},                                  durationMs: 800 },
  { angles: { hipR: 10,  kneeR: -8, spine: -5 }, durationMs: 1400 },
  { angles: {},                                  durationMs: 800 },
];

const GLUTE_SQUEEZE: Pose[] = [
  { angles: { hipL: -3, hipR: 3, kneeL: -4, kneeR: 4 }, durationMs: 900 },
  { angles: {},                                           durationMs: 700 },
];

// ─── Pose selector ───────────────────────────────────────────────────────────

function getPoses(id: string): Pose[] {
  switch (id) {
    // Neck
    case 'neck-side-tilt-01':      return NECK_SIDE_TILT;
    case 'neck-rotation-01':       return NECK_ROTATION;
    case 'neck-chin-tuck-01':      return NECK_CHIN_TUCK;
    case 'neck-upper-trap-01':     return NECK_UPPER_TRAP;
    case 'neck-levator-scap-01':   return NECK_LEVATOR_SCAP;
    // Shoulders
    case 'shoulder-rolls-01':          return SHOULDER_ROLLS;
    case 'shoulder-scapular-squeeze-01': return SCAPULAR_SQUEEZE;
    case 'shoulder-cross-body-01':     return CROSS_BODY;
    case 'shoulder-overhead-reach-01': return OVERHEAD_REACH;
    case 'shoulder-doorframe-01':      return DOORFRAME;
    // Back
    case 'back-cat-cow-01':          return CAT_COW;
    case 'back-thoracic-rotation-01': return THORACIC_ROTATION;
    case 'back-side-bend-01':        return SIDE_BEND;
    case 'back-spinal-twist-01':     return SPINAL_TWIST;
    case 'back-extension-01':        return BACK_EXTENSION;
    case 'back-chest-opener-01':     return CHEST_OPENER;
    case 'back-forward-fold-01':     return FORWARD_FOLD;
    // Wrists
    case 'wrist-circles-01':         return WRIST_CIRCLES;
    case 'wrist-prayer-01':          return WRIST_PRAYER;
    case 'wrist-extensor-01':        return WRIST_EXTENSOR;
    case 'wrist-finger-spreads-01':  return FINGER_SPREADS;
    case 'wrist-forearm-rotation-01': return FOREARM_ROTATION;
    // Hips / Legs
    case 'hips-seated-hip-flexor-01': return HIP_FLEXOR;
    case 'hips-figure-four-01':       return FIGURE_FOUR;
    case 'hips-ankle-circles-01':     return ANKLE_CIRCLES;
    case 'hips-calf-raises-01':       return CALF_RAISES;
    case 'hips-hip-circles-01':       return HIP_CIRCLES;
    case 'legs-hamstring-desk-01':    return HAMSTRING_DESK;
    case 'legs-seated-extension-01':  return SEATED_EXTENSION;
    case 'legs-calf-stretch-01':      return CALF_STRETCH;
    case 'legs-glute-squeeze-01':     return GLUTE_SQUEEZE;
    // Cognitive / unspecified → gentle breathing
    default: return BREATHE;
  }
}

// ─── Eye visual (unchanged) ───────────────────────────────────────────────────

function EyeVisual({ id }: { id: string }) {
  const isPalming = id === 'eyes-palming-01';
  const irisClass =
    id === 'eyes-20-20-20-01'    ? 'ev-iris-far'    :
    id === 'eyes-circles-01'     ? 'ev-iris-circle'  :
    id === 'eyes-focus-shift-01' ? 'ev-iris-focus'   :
    'ev-iris-far';
  const showBlink = id === 'eyes-blink-01';

  return (
    <svg viewBox="0 0 240 130" width="220" height="120" aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        <clipPath id="ev-eye-clip">
          <ellipse cx="120" cy="65" rx="84" ry="45" />
        </clipPath>
        <radialGradient id="ev-iris-g" cx="42%" cy="38%" r="58%">
          <stop offset="0%"   stopColor="#9c6830" />
          <stop offset="55%"  stopColor="#5c3510" />
          <stop offset="100%" stopColor="#1f0c04" />
        </radialGradient>
      </defs>
      <ellipse cx="120" cy="65" rx="84" ry="45" fill="white" />
      <g clipPath="url(#ev-eye-clip)" className={isPalming ? undefined : irisClass}>
        <circle cx="120" cy="65" r="27" fill="url(#ev-iris-g)" />
        <circle cx="120" cy="65" r="27" fill="none" stroke="#180900" strokeWidth="1.5" />
        <circle cx="120" cy="65" r="13" fill="#0e0604" />
        <circle cx="129" cy="57" r="5"  fill="white" opacity="0.6" />
        <circle cx="124" cy="73" r="2.5" fill="white" opacity="0.25" />
      </g>
      <path d="M36,65 Q120,18 204,65"  fill="none" stroke="#9a7550" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M36,65 Q120,106 204,65" fill="none" stroke="#9a7550" strokeWidth="2"   strokeLinecap="round" />
      <ellipse cx="120" cy="65" rx="84" ry="45" fill="none" stroke="#c5a880" strokeWidth="2" />
      {showBlink && (
        <g clipPath="url(#ev-eye-clip)">
          <rect x="36" y="20" width="168" height="65" fill="#d4b898" className="ev-lid-blink" />
        </g>
      )}
      {isPalming && (
        <>
          <ellipse cx="120" cy="65" rx="84" ry="45" fill="#d4b898" />
          <ellipse cx="68"  cy="65" rx="46" ry="36" fill="#c4a47c" />
          <ellipse cx="172" cy="65" rx="46" ry="36" fill="#c4a47c" />
          <path d="M45,52 Q68,46 90,52"   fill="none" stroke="#b0905e" strokeWidth="1.2" />
          <path d="M150,52 Q172,46 195,52" fill="none" stroke="#b0905e" strokeWidth="1.2" />
        </>
      )}
      {id === 'eyes-circles-01' && (
        <g stroke="#9a7550" strokeWidth="1.5" fill="none" opacity="0.4" strokeDasharray="5,3">
          <path d="M 120,20 A 45,45 0 0,1 165,65" />
          <path d="M 165,65 A 45,45 0 0,1 120,110" />
          <path d="M 120,110 A 45,45 0 0,1 75,65" />
          <path d="M 75,65 A 45,45 0 0,1 120,20" />
        </g>
      )}
      {id === 'eyes-focus-shift-01' && (
        <>
          <text x="12"  y="18" fontSize="10" fill="#9a7550" fontFamily="sans-serif">near</text>
          <text x="196" y="18" fontSize="10" fill="#9a7550" fontFamily="sans-serif" textAnchor="end">far</text>
        </>
      )}
    </svg>
  );
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
      {exercise.type === 'eye-break' ? (
        <EyeVisual id={exercise.id} />
      ) : (
        <FigureRig poses={getPoses(exercise.id)} />
      )}
    </div>
  );
}
