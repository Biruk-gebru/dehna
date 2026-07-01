'use client';

import type { Exercise } from '@/types';
import { FigureRig, type Pose } from './FigureRig';

interface Props {
  exercise: Exercise;
}

// ─── Pose sequences ───────────────────────────────────────────────────────────
// Each array defines a looping cycle: poses[last] → poses[0] → poses[1] → …
// durationMs is the time to reach that pose from the previous one.

// Default: slow breathing — shoulders rise on inhale, fall on exhale
const BREATHE: Pose[] = [
  { angles: { spine: -3, shoulderL: -16, shoulderR: 16, neck: -3 }, durationMs: 2800 }, // inhale: chest opens
  { angles: {},                                                       durationMs: 2800 }, // exhale: return
];

// ── Neck ──────────────────────────────────────────────────────────────────────

// Neck Side Tilt: ear toward shoulder, alternating — large angle so it reads clearly
const NECK_SIDE_TILT: Pose[] = [
  { angles: { neck: -30 }, durationMs: 1600 },  // tilt LEFT
  { angles: { neck: 0 },   durationMs: 700 },
  { angles: { neck: 30 },  durationMs: 1600 },  // tilt RIGHT
  { angles: { neck: 0 },   durationMs: 700 },
];

// Neck Rotation: head turns to look over each shoulder
const NECK_ROTATION: Pose[] = [
  { angles: { neck: -35, head: -8 }, durationMs: 1400 },  // look LEFT
  { angles: { neck: 0,   head: 0  }, durationMs: 700 },
  { angles: { neck: 35,  head: 8  }, durationMs: 1400 },  // look RIGHT
  { angles: { neck: 0,   head: 0  }, durationMs: 700 },
];

// Chin Tuck: head draws straight back (sagittal), gaze stays level — head tilts very slightly back
const NECK_CHIN_TUCK: Pose[] = [
  { angles: { neck: -4, head: -10, spine: -2 }, durationMs: 1000 }, // chin retracts back
  { angles: {},                                  durationMs: 800 },
];

// Upper Trapezius: neck tilts, OPPOSITE shoulder actively pulled DOWN to anchor the stretch
const NECK_UPPER_TRAP: Pose[] = [
  { angles: { neck: -28, shoulderR: -18 }, durationMs: 1700 },  // tilt L, R shoulder anchors down
  { angles: {},                            durationMs: 700 },
  { angles: { neck: 28,  shoulderL: 18  }, durationMs: 1700 },  // tilt R, L shoulder anchors down
  { angles: {},                            durationMs: 700 },
];

// Levator Scapulae: diagonal neck tilt + hand behind head (arm reaches up and over)
const NECK_LEVATOR_SCAP: Pose[] = [
  { angles: { neck: -20, head: 10, shoulderR: -60, elbowR: -65 }, durationMs: 1700 }, // R hand behind head, look L-down
  { angles: {},                                                     durationMs: 900 },
  { angles: { neck: 20, head: -10, shoulderL: 60,  elbowL: 65  }, durationMs: 1700 }, // L hand behind head, look R-down
  { angles: {},                                                     durationMs: 900 },
];

// ── Shoulders ─────────────────────────────────────────────────────────────────

// Shoulder Rolls: UP → BACK → DOWN → FORWARD — four distinct phases
const SHOULDER_ROLLS: Pose[] = [
  { angles: { shoulderL: -40, shoulderR: 40, elbowL: 5, elbowR: -5 },         durationMs: 700 }, // UP: arms rise
  { angles: { shoulderL: 20,  shoulderR: -20, elbowL: -15, elbowR: 15 },       durationMs: 700 }, // BACK: arms sweep behind
  { angles: {},                                                                  durationMs: 600 }, // DOWN: return to rest
  { angles: { shoulderL: -22, elbowL: 25, shoulderR: 22,  elbowR: -25 },       durationMs: 700 }, // FORWARD: arms swing forward
];

// Scapular Squeeze: elbows out at 90°, then pull BACK squeezing shoulder blades
const SCAPULAR_SQUEEZE: Pose[] = [
  { angles: { shoulderL: -18, elbowL: 72, shoulderR: 18, elbowR: -72 }, durationMs: 900 }, // elbows wide at 90°
  { angles: { shoulderL: 18,  elbowL: 72, shoulderR: -18, elbowR: -72 }, durationMs: 1000 }, // pull elbows BACK — blades squeeze
  { angles: {},                                                            durationMs: 700 },
];

// Cross-Body: right arm crosses body, left forearm presses it in — then switch
const CROSS_BODY: Pose[] = [
  { angles: { shoulderR: -62, elbowR: 12, shoulderL: 28, elbowL: -50 }, durationMs: 1400 }, // R crosses, L presses
  { angles: {},                                                           durationMs: 800 },
  { angles: { shoulderL: 62,  elbowL: -12, shoulderR: -28, elbowR: 50 }, durationMs: 1400 }, // L crosses, R presses
  { angles: {},                                                            durationMs: 800 },
];

// Overhead Reach: both arms genuinely overhead (>90° rotation), lean side to side
const OVERHEAD_REACH: Pose[] = [
  { angles: { shoulderL: -155, elbowL: -12, shoulderR: 155, elbowR: 12, spine: -7 }, durationMs: 1400 }, // lean LEFT
  { angles: { shoulderL: -155, elbowL: -12, shoulderR: 155, elbowR: 12, spine: 7  }, durationMs: 1400 }, // lean RIGHT
];

// Doorframe Chest Stretch: one arm makes L-shape against wall — alternating sides
const DOORFRAME: Pose[] = [
  { angles: { shoulderL: -82, elbowL: -88, shoulderR: 12, elbowR: -8 }, durationMs: 1500 }, // L arm L-shape
  { angles: {},                                                           durationMs: 900 },
  { angles: { shoulderR: 82,  elbowR: 88,  shoulderL: -12, elbowL: 8 }, durationMs: 1500 }, // R arm L-shape
  { angles: {},                                                           durationMs: 900 },
];

// ── Back ──────────────────────────────────────────────────────────────────────

// Seated Cat-Cow: Cow = spine arches, chest opens, head up; Cat = spine rounds, shoulders forward, chin drops
const CAT_COW: Pose[] = [
  { angles: { spine: -7, shoulderL: -16, shoulderR: 16, neck: -5 },              durationMs: 1700 }, // COW: arch
  { angles: { spine: 10, shoulderL: -8,  shoulderR: 8,  neck: 10, head: 6 },    durationMs: 1700 }, // CAT: round
];

// Seated Thoracic Rotation: arms cross on chest, torso rotates keeping hips still
const THORACIC_ROTATION: Pose[] = [
  { angles: { shoulderL: 28, elbowL: -60, shoulderR: -28, elbowR: 60, spine: 0  }, durationMs: 600 }, // arms crossed
  { angles: { shoulderL: 28, elbowL: -60, shoulderR: -28, elbowR: 60, spine: 18 }, durationMs: 1300 }, // rotate RIGHT
  { angles: { shoulderL: 28, elbowL: -60, shoulderR: -28, elbowR: 60, spine: 0  }, durationMs: 500 }, // center
  { angles: { shoulderL: 28, elbowL: -60, shoulderR: -28, elbowR: 60, spine: -18 }, durationMs: 1300 }, // rotate LEFT
  { angles: { shoulderL: 28, elbowL: -60, shoulderR: -28, elbowR: 60, spine: 0  }, durationMs: 500 }, // center
];

// Seated Side Bend: raise opposite arm overhead, lean sideways
const SIDE_BEND: Pose[] = [
  { angles: { spine: -15, shoulderR: 152, elbowR: 8  }, durationMs: 1500 }, // lean L, R arm overhead
  { angles: { spine: 0 },                                durationMs: 700 },
  { angles: { spine: 15,  shoulderL: -152, elbowL: -8 }, durationMs: 1500 }, // lean R, L arm overhead
  { angles: { spine: 0 },                                durationMs: 700 },
];

// Seated Spinal Twist: one hand on opposite knee, other hand on chair back, deep rotation
const SPINAL_TWIST: Pose[] = [
  { angles: { spine: -20, shoulderR: -38, elbowR: 28, shoulderL: 32, elbowL: -25 }, durationMs: 1600 }, // twist LEFT
  { angles: { spine: 0 },                                                            durationMs: 800 },
  { angles: { spine: 20,  shoulderL: 38,  elbowL: -28, shoulderR: -32, elbowR: 25 }, durationMs: 1600 }, // twist RIGHT
  { angles: { spine: 0 },                                                            durationMs: 800 },
];

// Standing Back Extension: hands on lower back, lean BACKWARD, elbows behind
const BACK_EXTENSION: Pose[] = [
  { angles: { spine: -20, shoulderL: 30, elbowL: 52, shoulderR: -30, elbowR: -52 }, durationMs: 1500 }, // arch back, hands on lower back
  { angles: { spine: 0 },                                                            durationMs: 1000 },
];

// Chest Opener: arms clasp behind back, shoulder blades squeeze, chest lifts
const CHEST_OPENER: Pose[] = [
  { angles: { shoulderL: 38, elbowL: 58, shoulderR: -38, elbowR: -58, spine: -5 }, durationMs: 1500 }, // arms behind, chest open
  { angles: {},                                                                       durationMs: 900 },
];

// Desk Forward Fold: deep forward fold, spine nearly parallel to floor, head drops, arms reach toward desk
const FORWARD_FOLD: Pose[] = [
  { angles: { spine: 58, shoulderL: -30, elbowL: 12, shoulderR: 30, elbowR: -12, neck: 25, head: 8 }, durationMs: 1900 }, // fold deep
  { angles: { spine: 0 },                                                                                durationMs: 1300 },
];

// ── Wrists / Elbows ───────────────────────────────────────────────────────────

// Wrist Circles: arms extended forward-and-out, wrists rotate in large circles
const WRIST_CIRCLES: Pose[] = [
  { angles: { shoulderL: -58, elbowL: 68, wristL: 38,  shoulderR: 58, elbowR: -68, wristR: -38 }, durationMs: 750 }, // circle out
  { angles: { shoulderL: -58, elbowL: 68, wristL: -38, shoulderR: 58, elbowR: -68, wristR: 38  }, durationMs: 750 }, // circle in
];

// Prayer Stretch: palms pressed together at chest, elbows wide, hands lower to stretch wrist flexors
const WRIST_PRAYER: Pose[] = [
  { angles: { shoulderL: -22, elbowL: 78, wristL: 14, shoulderR: 22, elbowR: -78, wristR: -14 }, durationMs: 1400 }, // palms together at chest
  { angles: { shoulderL: -14, elbowL: 82, wristL: 22, shoulderR: 14, elbowR: -82, wristR: -22 }, durationMs: 1100 }, // lower hands — stretch deepens
  { angles: {},                                                                                     durationMs: 1000 },
];

// Extensor Stretch: one arm extended, other hand presses fingers DOWN, then switch
const WRIST_EXTENSOR: Pose[] = [
  { angles: { shoulderR: 48, elbowR: -62, wristR: -42, shoulderL: -28, elbowL: 52 }, durationMs: 1500 }, // R arm out, wrist bent down, L presses
  { angles: {},                                                                         durationMs: 800 },
  { angles: { shoulderL: -48, elbowL: 62, wristL: 42, shoulderR: 28, elbowR: -52  }, durationMs: 1500 }, // L arm out, R presses
  { angles: {},                                                                         durationMs: 800 },
];

// Finger Spreads: arms lower in front (belly height), wrists spread open vs make fist — distinct from wrist circles
const FINGER_SPREADS: Pose[] = [
  { angles: { shoulderL: -28, elbowL: 52, wristL: 28,  shoulderR: 28, elbowR: -52, wristR: -28 }, durationMs: 900 }, // OPEN wide
  { angles: { shoulderL: -28, elbowL: 52, wristL: -18, shoulderR: 28, elbowR: -52, wristR: 18  }, durationMs: 900 }, // CLOSE to fist
];

// Forearm Rotation: elbows tucked at sides, forearms point forward, palms flip up → down (pronation/supination)
const FOREARM_ROTATION: Pose[] = [
  { angles: { shoulderL: -15, elbowL: 88, wristL: 48,  shoulderR: 15, elbowR: -88, wristR: -48 }, durationMs: 1100 }, // palms UP
  { angles: { shoulderL: -15, elbowL: 88, wristL: -48, shoulderR: 15, elbowR: -88, wristR: 48  }, durationMs: 1100 }, // palms DOWN
];

// ── Hips / Legs ───────────────────────────────────────────────────────────────

// Seated Hip Flexor: seated, foot slides back off chair, weight shifts forward — alternating sides
const HIP_FLEXOR: Pose[] = [
  { angles: { hipR: 14,  kneeR: 10,  spine: 5  }, durationMs: 1600 }, // R foot back, lean forward
  { angles: {},                                     durationMs: 900 },
  { angles: { hipL: -14, kneeL: -10, spine: -5 }, durationMs: 1600 }, // L foot back
  { angles: {},                                     durationMs: 900 },
];

// Figure Four Hip Stretch: seated, ankle rests on opposite knee — right hip opens wide out to the side
const FIGURE_FOUR: Pose[] = [
  { angles: { hipR: 48, kneeR: -58 }, durationMs: 1600 }, // R leg opens wide: ankle on L knee
  { angles: {},                        durationMs: 1000 },
  { angles: { hipL: -48, kneeL: 58 }, durationMs: 1600 }, // L leg opens wide
  { angles: {},                        durationMs: 1000 },
];

// Ankle Circles: seated, one foot lifted off floor, ankle traces circles
const ANKLE_CIRCLES: Pose[] = [
  { angles: { hipR: 5,  kneeR: -18, rootY: -3 }, durationMs: 550 }, // circle phase 1
  { angles: { hipR: -5, kneeR: -18, rootY: 3  }, durationMs: 550 }, // circle phase 2
];

// Standing Calf Raises: whole figure rises up onto toes, slight knee engagement
const CALF_RAISES: Pose[] = [
  { angles: { rootY: -15, kneeL: -5, kneeR: -5 }, durationMs: 950 }, // rise UP onto toes
  { angles: { rootY: 0 },                           durationMs: 800 }, // lower back down
];

// Standing Hip Circles: hula-hoop pelvis motion — 4-phase circle: L → forward → R → back
const HIP_CIRCLES: Pose[] = [
  { angles: { spine: -10, hipL: -5, hipR: 5  }, durationMs: 580 }, // lean LEFT
  { angles: { spine: 8,   hipL: -4, hipR: 4  }, durationMs: 580 }, // lean FORWARD
  { angles: { spine: 10,  hipL: 5,  hipR: -5 }, durationMs: 580 }, // lean RIGHT
  { angles: { spine: -8,  hipL: 4,  hipR: -4 }, durationMs: 580 }, // lean BACK
];

// Hamstring Desk Stretch: standing, one leg elevated on desk — leg swings forward/up, slight forward lean
const HAMSTRING_DESK: Pose[] = [
  { angles: { hipR: -58, kneeR: -8, spine: 10 }, durationMs: 1600 }, // R leg elevated forward, lean in
  { angles: {},                                   durationMs: 900 },
  { angles: { hipL: 58,  kneeL: 8,  spine: -10 }, durationMs: 1600 }, // L leg elevated
  { angles: {},                                    durationMs: 900 },
];

// Seated Leg Extension: one leg lifts and extends straight — knee straightens out
const SEATED_EXTENSION: Pose[] = [
  { angles: { hipR: 8,  kneeR: -55 }, durationMs: 1200 }, // R leg extends forward-straight
  { angles: {},                        durationMs: 800 },
  { angles: { hipL: -8, kneeL: 55  }, durationMs: 1200 }, // L leg extends
  { angles: {},                        durationMs: 800 },
];

// Standing Calf Stretch: lunge stance — front knee bends, back heel presses down
const CALF_STRETCH: Pose[] = [
  { angles: { hipL: -20, kneeL: 18, hipR: 15, kneeR: -14, spine: 6 }, durationMs: 1500 }, // L foot forward (lunge), R heel back
  { angles: {},                                                          durationMs: 800 },
  { angles: { hipR: 20,  kneeR: -18, hipL: -15, kneeL: 14, spine: -6 }, durationMs: 1500 }, // R foot forward
  { angles: {},                                                           durationMs: 800 },
];

// Seated Glute Activation: isometric squeeze — very subtle hip engagement, hold and release
const GLUTE_SQUEEZE: Pose[] = [
  { angles: { hipL: -6, hipR: 6, kneeL: -5, kneeR: 5, spine: -2 }, durationMs: 1200 }, // engage/squeeze
  { angles: {},                                                        durationMs: 900 },
];

// ─── Seated flag ─────────────────────────────────────────────────────────────

const SEATED_IDS = new Set([
  'neck-chin-tuck-01', 'neck-rotation-01', 'neck-upper-trap-01', 'neck-levator-scap-01',
  'shoulder-scapular-squeeze-01',
  'back-cat-cow-01', 'back-thoracic-rotation-01', 'back-side-bend-01', 'back-spinal-twist-01',
  'wrist-circles-01', 'wrist-prayer-01', 'wrist-extensor-01', 'wrist-finger-spreads-01', 'wrist-forearm-rotation-01',
  'hips-seated-hip-flexor-01', 'hips-figure-four-01', 'hips-ankle-circles-01',
  'legs-seated-extension-01', 'legs-glute-squeeze-01',
  'cognitive-box-breathing-01', 'cognitive-body-scan-01', 'cognitive-grounding-01', 'cognitive-breath-counting-01',
]);

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
        <FigureRig poses={getPoses(exercise.id)} seated={SEATED_IDS.has(exercise.id)} />
      )}
    </div>
  );
}
