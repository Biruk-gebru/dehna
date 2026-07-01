'use client';

import type { Exercise } from '@/types';
import { FigureRig, type Pose } from './FigureRig';

interface Props {
  exercise: Exercise;
}

// ─── Pose sequences ───────────────────────────────────────────────────────────
// Each array defines a looping cycle: poses[last] → poses[0] → poses[1] → …
// durationMs is how long each pose is the active target before advancing.
// The rig's critically-damped engine (smoothDamp) handles all interpolation —
// no eased values or manual cascade offsets belong here, just target angles.

// Default: slow breathing — shoulders rise on inhale, fall on exhale
const BREATHE: Pose[] = [
  { angles: { torso: -3, lShoulder: -16, rShoulder: 16, head: -3 }, durationMs: 2800 }, // inhale: chest opens
  { angles: {},                                                      durationMs: 2800 }, // exhale: return
];

// ── Neck ──────────────────────────────────────────────────────────────────────

// Neck Side Tilt: ear toward shoulder, alternating — large angle so it reads clearly
const NECK_SIDE_TILT: Pose[] = [
  { angles: { head: -30 }, durationMs: 1600 },  // tilt LEFT
  { angles: { head: 0 },   durationMs: 700 },
  { angles: { head: 30 },  durationMs: 1600 },  // tilt RIGHT
  { angles: { head: 0 },   durationMs: 700 },
];

// Neck Rotation: head turns to look over each shoulder
const NECK_ROTATION: Pose[] = [
  { angles: { head: -34 }, durationMs: 1400 },  // look LEFT
  { angles: { head: 0   }, durationMs: 700 },
  { angles: { head: 34  }, durationMs: 1400 },  // look RIGHT
  { angles: { head: 0   }, durationMs: 700 },
];

// Chin Tuck: head draws straight back, gaze level, slight compensating torso settle
const NECK_CHIN_TUCK: Pose[] = [
  { angles: { head: -12, torso: -2 }, durationMs: 1000 }, // chin retracts back
  { angles: {},                        durationMs: 800 },
];

// Upper Trapezius: head tilts, OPPOSITE shoulder actively pulled DOWN to anchor the stretch
const NECK_UPPER_TRAP: Pose[] = [
  { angles: { head: -28, rShoulder: -18 }, durationMs: 1700 },  // tilt L, R shoulder anchors down
  { angles: {},                            durationMs: 700 },
  { angles: { head: 28,  lShoulder: 18  }, durationMs: 1700 },  // tilt R, L shoulder anchors down
  { angles: {},                            durationMs: 700 },
];

// Levator Scapulae: diagonal head tilt-down + hand reaches behind head
const NECK_LEVATOR_SCAP: Pose[] = [
  { angles: { head: -22, rShoulder: -60, rElbow: -65 }, durationMs: 1700 }, // R hand behind head, look L-down
  { angles: {},                                           durationMs: 900 },
  { angles: { head: 22,  lShoulder: 60,  lElbow: 65  }, durationMs: 1700 }, // L hand behind head, look R-down
  { angles: {},                                           durationMs: 900 },
];

// ── Shoulders ─────────────────────────────────────────────────────────────────

// Shoulder Rolls: UP → BACK → DOWN → FORWARD — four distinct phases
const SHOULDER_ROLLS: Pose[] = [
  { angles: { lShoulder: -40, rShoulder: 40, lElbow: 5, rElbow: -5 },   durationMs: 700 }, // UP: arms rise
  { angles: { lShoulder: 20,  rShoulder: -20, lElbow: -15, rElbow: 15 }, durationMs: 700 }, // BACK: arms sweep behind
  { angles: {},                                                            durationMs: 600 }, // DOWN: return to rest
  { angles: { lShoulder: -22, lElbow: 25, rShoulder: 22,  rElbow: -25 }, durationMs: 700 }, // FORWARD: arms swing forward
];

// Scapular Squeeze: elbows out at 90°, then pull BACK squeezing shoulder blades
const SCAPULAR_SQUEEZE: Pose[] = [
  { angles: { lShoulder: -18, lElbow: 72, rShoulder: 18, rElbow: -72 },  durationMs: 900 }, // elbows wide at 90°
  { angles: { lShoulder: 18,  lElbow: 72, rShoulder: -18, rElbow: -72 }, durationMs: 1000 }, // pull elbows BACK — blades squeeze
  { angles: {},                                                             durationMs: 700 },
];

// Cross-Body: right arm crosses body, left forearm presses it in — then switch
const CROSS_BODY: Pose[] = [
  { angles: { rShoulder: -62, rElbow: 12, lShoulder: 28, lElbow: -50 }, durationMs: 1400 }, // R crosses, L presses
  { angles: {},                                                           durationMs: 800 },
  { angles: { lShoulder: 62,  lElbow: -12, rShoulder: -28, rElbow: 50 }, durationMs: 1400 }, // L crosses, R presses
  { angles: {},                                                            durationMs: 800 },
];

// Overhead Reach: both arms genuinely overhead, lean side to side, torso compensates
const OVERHEAD_REACH: Pose[] = [
  { angles: { lShoulder: -155, lElbow: -12, rShoulder: 155, rElbow: 12, torso: -7 }, durationMs: 1400 }, // lean LEFT
  { angles: { lShoulder: -155, lElbow: -12, rShoulder: 155, rElbow: 12, torso: 7  }, durationMs: 1400 }, // lean RIGHT
];

// Doorframe Chest Stretch: one arm makes L-shape against wall — alternating sides
const DOORFRAME: Pose[] = [
  { angles: { lShoulder: -82, lElbow: -88, rShoulder: 12, rElbow: -8 }, durationMs: 1500 }, // L arm L-shape
  { angles: {},                                                            durationMs: 900 },
  { angles: { rShoulder: 82,  rElbow: 88,  lShoulder: -12, lElbow: 8 }, durationMs: 1500 }, // R arm L-shape
  { angles: {},                                                            durationMs: 900 },
];

// ── Back ──────────────────────────────────────────────────────────────────────

// Seated Cat-Cow: Cow = torso arches, chest opens, head lifts; Cat = torso rounds, shoulders forward, chin drops
const CAT_COW: Pose[] = [
  { angles: { torso: -7, lShoulder: -16, rShoulder: 16, head: -6 }, durationMs: 1700 }, // COW: arch
  { angles: { torso: 10, lShoulder: -8,  rShoulder: 8,  head: 14 }, durationMs: 1700 }, // CAT: round
];

// Seated Thoracic Rotation: arms cross on chest, torso rotates keeping hips still
const THORACIC_ROTATION: Pose[] = [
  { angles: { lShoulder: 28, lElbow: -60, rShoulder: -28, rElbow: 60, torso: 0  },  durationMs: 600 }, // arms crossed
  { angles: { lShoulder: 28, lElbow: -60, rShoulder: -28, rElbow: 60, torso: 18 },  durationMs: 1300 }, // rotate RIGHT
  { angles: { lShoulder: 28, lElbow: -60, rShoulder: -28, rElbow: 60, torso: 0  },  durationMs: 500 }, // center
  { angles: { lShoulder: 28, lElbow: -60, rShoulder: -28, rElbow: 60, torso: -18 }, durationMs: 1300 }, // rotate LEFT
  { angles: { lShoulder: 28, lElbow: -60, rShoulder: -28, rElbow: 60, torso: 0  },  durationMs: 500 }, // center
];

// Seated Side Bend: raise opposite arm overhead, lean sideways, head follows the lean
const SIDE_BEND: Pose[] = [
  { angles: { torso: -15, head: -7, rShoulder: 152, rElbow: 8  }, durationMs: 1500 }, // lean L, R arm overhead
  { angles: { torso: 0,   head: 0 },                                durationMs: 700 },
  { angles: { torso: 15,  head: 7,  lShoulder: -152, lElbow: -8 }, durationMs: 1500 }, // lean R, L arm overhead
  { angles: { torso: 0,   head: 0 },                                durationMs: 700 },
];

// Seated Spinal Twist: one hand on opposite knee, other hand on chair back, deep rotation
const SPINAL_TWIST: Pose[] = [
  { angles: { torso: -20, rShoulder: -38, rElbow: 28, lShoulder: 32, lElbow: -25 }, durationMs: 1600 }, // twist LEFT
  { angles: { torso: 0 },                                                            durationMs: 800 },
  { angles: { torso: 20,  lShoulder: 38,  lElbow: -28, rShoulder: -32, rElbow: 25 }, durationMs: 1600 }, // twist RIGHT
  { angles: { torso: 0 },                                                             durationMs: 800 },
];

// Standing Back Extension: hands on lower back, lean BACKWARD, elbows behind
const BACK_EXTENSION: Pose[] = [
  { angles: { torso: -20, lShoulder: 30, lElbow: 52, rShoulder: -30, rElbow: -52 }, durationMs: 1500 }, // arch back, hands on lower back
  { angles: { torso: 0 },                                                            durationMs: 1000 },
];

// Chest Opener: arms clasp behind back, shoulder blades squeeze, chest lifts
const CHEST_OPENER: Pose[] = [
  { angles: { lShoulder: 38, lElbow: 58, rShoulder: -38, rElbow: -58, torso: -5 }, durationMs: 1500 }, // arms behind, chest open
  { angles: {},                                                                      durationMs: 900 },
];

// Desk Forward Fold: deep forward fold, torso nearly parallel to floor, head drops, arms reach toward desk
const FORWARD_FOLD: Pose[] = [
  { angles: { torso: 58, lShoulder: -30, lElbow: 12, rShoulder: 30, rElbow: -12, head: 22 }, durationMs: 1900 }, // fold deep
  { angles: { torso: 0,  head: 0 },                                                            durationMs: 1300 },
];

// ── Wrists / Elbows ───────────────────────────────────────────────────────────

// Wrist Circles: arms extended forward-and-out, wrists rotate in large circles
const WRIST_CIRCLES: Pose[] = [
  { angles: { lShoulder: -58, lElbow: 68, lWrist: 38,  rShoulder: 58, rElbow: -68, rWrist: -38 }, durationMs: 750 }, // circle out
  { angles: { lShoulder: -58, lElbow: 68, lWrist: -38, rShoulder: 58, rElbow: -68, rWrist: 38  }, durationMs: 750 }, // circle in
];

// Prayer Stretch: palms pressed together at chest, elbows wide, hands lower to stretch wrist flexors
const WRIST_PRAYER: Pose[] = [
  { angles: { lShoulder: -22, lElbow: 78, lWrist: 14, rShoulder: 22, rElbow: -78, rWrist: -14 }, durationMs: 1400 }, // palms together at chest
  { angles: { lShoulder: -14, lElbow: 82, lWrist: 22, rShoulder: 14, rElbow: -82, rWrist: -22 }, durationMs: 1100 }, // lower hands — stretch deepens
  { angles: {},                                                                                     durationMs: 1000 },
];

// Extensor Stretch: one arm extended, other hand presses fingers DOWN, then switch
const WRIST_EXTENSOR: Pose[] = [
  { angles: { rShoulder: 48, rElbow: -62, rWrist: -42, lShoulder: -28, lElbow: 52 }, durationMs: 1500 }, // R arm out, wrist bent down, L presses
  { angles: {},                                                                        durationMs: 800 },
  { angles: { lShoulder: -48, lElbow: 62, lWrist: 42, rShoulder: 28, rElbow: -52  }, durationMs: 1500 }, // L arm out, R presses
  { angles: {},                                                                        durationMs: 800 },
];

// Finger Spreads: arms lower in front (belly height), wrists spread open vs make fist
const FINGER_SPREADS: Pose[] = [
  { angles: { lShoulder: -28, lElbow: 52, lWrist: 28,  rShoulder: 28, rElbow: -52, rWrist: -28 }, durationMs: 900 }, // OPEN wide
  { angles: { lShoulder: -28, lElbow: 52, lWrist: -18, rShoulder: 28, rElbow: -52, rWrist: 18  }, durationMs: 900 }, // CLOSE to fist
];

// Forearm Rotation: elbows tucked, forearms point forward, palms flip up → down
const FOREARM_ROTATION: Pose[] = [
  { angles: { lShoulder: -15, lElbow: 88, lWrist: 48,  rShoulder: 15, rElbow: -88, rWrist: -48 }, durationMs: 1100 }, // palms UP
  { angles: { lShoulder: -15, lElbow: 88, lWrist: -48, rShoulder: 15, rElbow: -88, rWrist: 48  }, durationMs: 1100 }, // palms DOWN
];

// ── Hips / Legs ───────────────────────────────────────────────────────────────

// Seated Hip Flexor: seated, foot slides back off chair, weight shifts forward — alternating sides
const HIP_FLEXOR: Pose[] = [
  { angles: { rHip: 14,  rKnee: 10,  torso: 5  }, durationMs: 1600 }, // R foot back, lean forward
  { angles: {},                                     durationMs: 900 },
  { angles: { lHip: -14, lKnee: -10, torso: -5 }, durationMs: 1600 }, // L foot back
  { angles: {},                                     durationMs: 900 },
];

// Figure Four Hip Stretch: seated, ankle rests on opposite knee — hip opens wide, ankle flexes
const FIGURE_FOUR: Pose[] = [
  { angles: { rHip: 48, rKnee: -58, rAnkle: 22 }, durationMs: 1600 }, // R leg opens wide: ankle on L knee
  { angles: {},                                     durationMs: 1000 },
  { angles: { lHip: -48, lKnee: 58, lAnkle: -22 }, durationMs: 1600 }, // L leg opens wide
  { angles: {},                                      durationMs: 1000 },
];

// Ankle Circles: seated, foot lifted, the ankle joint itself traces the circle (not the hip/knee)
const ANKLE_CIRCLES: Pose[] = [
  { angles: { rHip: 6, rKnee: -20, rAnkle: -20 }, durationMs: 480 },
  { angles: { rHip: 6, rKnee: -20, rAnkle: 20  }, durationMs: 480 },
];

// Standing Calf Raises: whole figure rises up onto toes, ankles point down, knees soften slightly
const CALF_RAISES: Pose[] = [
  { angles: { rootY: -15, lKnee: -5, rKnee: -5, lAnkle: -20, rAnkle: -20 }, durationMs: 950 }, // rise UP onto toes
  { angles: { rootY: 0 },                                                     durationMs: 800 }, // lower back down
];

// Standing Hip Circles: hula-hoop pelvis motion — 4-phase circle: L → forward → R → back
const HIP_CIRCLES: Pose[] = [
  { angles: { torso: -10, lHip: -5, rHip: 5  }, durationMs: 580 }, // lean LEFT
  { angles: { torso: 8,   lHip: -4, rHip: 4  }, durationMs: 580 }, // lean FORWARD
  { angles: { torso: 10,  lHip: 5,  rHip: -5 }, durationMs: 580 }, // lean RIGHT
  { angles: { torso: -8,  lHip: 4,  rHip: -4 }, durationMs: 580 }, // lean BACK
];

// Hamstring Desk Stretch: standing, one leg elevated on desk — leg swings forward/up, slight forward lean
const HAMSTRING_DESK: Pose[] = [
  { angles: { rHip: -58, rKnee: -8, torso: 10 }, durationMs: 1600 }, // R leg elevated forward, lean in
  { angles: {},                                    durationMs: 900 },
  { angles: { lHip: 58,  lKnee: 8,  torso: -10 }, durationMs: 1600 }, // L leg elevated
  { angles: {},                                    durationMs: 900 },
];

// Seated Leg Extension: one leg lifts and extends straight — knee straightens, toes point
const SEATED_EXTENSION: Pose[] = [
  { angles: { rHip: 8,  rKnee: -55, rAnkle: 15 }, durationMs: 1200 }, // R leg extends forward-straight
  { angles: {},                                     durationMs: 800 },
  { angles: { lHip: -8, lKnee: 55,  lAnkle: -15 }, durationMs: 1200 }, // L leg extends
  { angles: {},                                     durationMs: 800 },
];

// Standing Calf Stretch: lunge stance — front knee bends, back heel presses down (ankle dorsiflexed)
const CALF_STRETCH: Pose[] = [
  { angles: { lHip: -20, lKnee: 18, rHip: 15, rKnee: -14, rAnkle: 18, torso: 6 },  durationMs: 1500 }, // L foot forward (lunge), R heel back
  { angles: {},                                                                       durationMs: 800 },
  { angles: { rHip: 20,  rKnee: -18, lHip: -15, lKnee: 14, lAnkle: -18, torso: -6 }, durationMs: 1500 }, // R foot forward
  { angles: {},                                                                       durationMs: 800 },
];

// Seated Glute Activation: isometric squeeze — very subtle hip engagement, hold and release
const GLUTE_SQUEEZE: Pose[] = [
  { angles: { lHip: -6, rHip: 6, lKnee: -5, rKnee: 5, torso: -2 }, durationMs: 1200 }, // engage/squeeze
  { angles: {},                                                       durationMs: 900 },
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
