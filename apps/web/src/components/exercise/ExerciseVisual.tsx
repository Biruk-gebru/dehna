'use client';

import type { Exercise } from '@/types';

interface Props {
  exercise: Exercise;
}

type BodyClasses = {
  head?:   string;
  torso?:  string;
  armL?:   string;
  armR?:   string;
  wristL?: string;
  wristR?: string;
  whole?:  string;
};

function getBodyClasses(id: string): BodyClasses {
  switch (id) {
    case 'back-cat-cow-01':           return { torso: 'ev-torso-cat-cow' };
    case 'back-thoracic-rotation-01': return { torso: 'ev-torso-twist' };
    case 'back-side-bend-01':         return { torso: 'ev-torso-side-bend' };
    case 'back-spinal-twist-01':      return { torso: 'ev-torso-twist' };
    case 'back-extension-01':         return { torso: 'ev-torso-back-ext' };
    case 'shoulder-rolls-01':         return { armL: 'ev-arm-l-roll', armR: 'ev-arm-r-roll' };
    case 'shoulder-cross-body-01':    return { armR: 'ev-arm-r-cross' };
    case 'shoulder-doorframe-01':     return { armL: 'ev-arm-l-lift', armR: 'ev-arm-r-lift' };
    case 'wrist-circles-01':          return { wristL: 'ev-wrist-l', wristR: 'ev-wrist-r' };
    case 'wrist-prayer-01':           return { armL: 'ev-arm-l-lift', armR: 'ev-arm-r-lift' };
    case 'general-breathing-01':      return { torso: 'ev-torso-breath' };
    case 'general-box-breathing-01':  return { torso: 'ev-torso-breath' };
  }
  if (id.startsWith('back-'))     return { torso: 'ev-torso-cat-cow' };
  if (id.startsWith('neck-'))     return { head: 'ev-head-tilt' };
  if (id.startsWith('shoulder-')) return { armL: 'ev-arm-l-roll', armR: 'ev-arm-r-roll' };
  if (id.startsWith('wrist-'))    return { wristL: 'ev-wrist-l', wristR: 'ev-wrist-r' };
  if (id.startsWith('hips-') || id.startsWith('legs-')) return { whole: 'ev-whole-squat' };
  if (id.startsWith('strength-')) return { whole: 'ev-whole-squat' };
  return { torso: 'ev-torso-breath' };
}

// ─── Eye visual ──────────────────────────────────────────────────────────────

function EyeVisual({ id }: { id: string }) {
  const isPalming = id === 'eyes-palming-01';
  const irisClass =
    id === 'eyes-20-20-20-01'    ? 'ev-iris-far'   :
    id === 'eyes-circles-01'     ? 'ev-iris-circle' :
    id === 'eyes-focus-shift-01' ? 'ev-iris-focus'  :
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

// ─── Body figure ─────────────────────────────────────────────────────────────
//
// Structure per animated limb:
//   <g transform="translate(jointX, jointY) rotate(naturalAngle)">  ← positions joint, static
//     <g className={animClass}>                                       ← CSS pivot lands at 50% 0% = joint
//       ...elements drawn from local (0,0) downward...
//     </g>
//   </g>
//
// This separates SVG positioning from CSS animation so transform-box:fill-box
// computes the bounding box from only the element's own content (no ancestor
// transforms polluting the bbox origin), placing the pivot exactly at the joint.

const C  = '#3a2c1e';  // front / near
const CB = '#6b5040';  // back / far

function BodyFigure({ classes }: { classes: BodyClasses }) {
  const headCls   = classes.head   ?? '';
  const torsoCls  = classes.torso  ?? '';
  const armLCls   = classes.armL   ?? '';
  const armRCls   = classes.armR   ?? '';
  const wristLCls = classes.wristL ?? '';
  const wristRCls = classes.wristR ?? '';
  const wholeCls  = classes.whole  ?? '';

  return (
    <svg viewBox="0 0 200 290" width="150" height="215" aria-hidden="true">
      <g className={wholeCls || undefined}>

        {/* ── Right leg (behind) — no independent animation, slight stance angle ── */}
        <g transform="translate(118,152) rotate(-3)">
          <rect x="-8" y="0" width="16" height="62" rx="8" fill={CB} />
          <g transform="translate(2,62)">
            <rect x="-7" y="0" width="14" height="54" rx="7" fill={CB} />
            <ellipse cx="1" cy="56" rx="18" ry="7" fill={CB} />
          </g>
        </g>

        {/* ── Right arm (behind) — shoulder pivot at (128,63), 6° outward angle ── */}
        <g transform="translate(128,63) rotate(6)">
          <g className={armRCls || undefined}>
            <rect x="-7" y="0" width="14" height="56" rx="7" fill={CB} />
            {/* Forearm hangs from elbow — extra group lets wrist class pivot at elbow */}
            <g transform="translate(3,56)">
              <g className={wristRCls || undefined}>
                <rect x="-6" y="0" width="12" height="44" rx="6" fill={CB} />
                <ellipse cx="1" cy="46" rx="9" ry="6" fill={CB} />
              </g>
            </g>
          </g>
        </g>

        {/* ── Torso — pivot at top-center (shoulder line) ── */}
        {/* Path defined in torso-local coords with origin at (100,63) */}
        <g transform="translate(100,63)">
          <g className={torsoCls || undefined}>
            <path
              d="M-28,0 Q-32,25 -24,47 Q-26,69 -24,89 L24,89 Q26,69 24,47 Q32,25 28,0 Q15,-4 0,-4 Q-15,-4 -28,0 Z"
              fill={C}
            />
            <path d="M-12,0 Q0,10 12,0" fill="none" stroke={CB} strokeWidth="1.5" />
          </g>
        </g>

        {/* ── Left arm (front) — shoulder pivot at (72,63), 6° outward angle ── */}
        <g transform="translate(72,63) rotate(-6)">
          <g className={armLCls || undefined}>
            <rect x="-7" y="0" width="14" height="56" rx="7" fill={C} />
            <g transform="translate(-3,56)">
              <g className={wristLCls || undefined}>
                <rect x="-6" y="0" width="12" height="44" rx="6" fill={C} />
                <ellipse cx="-1" cy="46" rx="9" ry="6" fill={C} />
              </g>
            </g>
          </g>
        </g>

        {/* ── Left leg (front) — slight stance angle ── */}
        <g transform="translate(82,152) rotate(3)">
          <rect x="-8" y="0" width="16" height="62" rx="8" fill={C} />
          <g transform="translate(-2,62)">
            <rect x="-7" y="0" width="14" height="54" rx="7" fill={C} />
            <ellipse cx="-1" cy="56" rx="18" ry="7" fill={C} />
          </g>
        </g>

        {/* ── Head + neck — pivot at bottom of group = neck base = (100,63) ── */}
        {/* With transform-origin: 50% 100% and fill-box, pivot lands at y=0 of this group */}
        <g transform="translate(100,63)">
          <g className={headCls || undefined}>
            {/* neck: spans y=-14 to y=0 — bottom at y=0 = the pivot */}
            <rect x="-6" y="-14" width="12" height="14" rx="5" fill={C} />
            {/* head: circle above neck */}
            <circle cx="0" cy="-37" r="21" fill={C} />
            {/* eyes */}
            <circle cx="-7" cy="-40" r="2.2" fill="white" opacity="0.55" />
            <circle cx="7"  cy="-40" r="2.2" fill="white" opacity="0.55" />
            {/* mouth */}
            <path d="M-6,-30 Q0,-25 6,-30" fill="none" stroke="white" strokeWidth="1.4"
                  strokeLinecap="round" opacity="0.4" />
          </g>
        </g>

      </g>
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
        <BodyFigure classes={getBodyClasses(exercise.id)} />
      )}
    </div>
  );
}
