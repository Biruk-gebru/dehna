'use client';

import type { Exercise } from '@/types';

interface Props {
  exercise: Exercise;
}

type BodyClasses = {
  head?:  string;
  torso?: string;
  armL?:  string;
  armR?:  string;
  whole?: string;
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
    case 'wrist-circles-01':          return { armL: 'ev-wrist-l',    armR: 'ev-wrist-r' };
    case 'wrist-prayer-01':           return { armL: 'ev-arm-l-lift', armR: 'ev-arm-r-lift' };
    case 'general-breathing-01':      return { torso: 'ev-torso-breath' };
    case 'general-box-breathing-01':  return { torso: 'ev-torso-breath' };
  }
  if (id.startsWith('back-'))     return { torso: 'ev-torso-cat-cow' };
  if (id.startsWith('neck-'))     return { head: 'ev-head-tilt' };
  if (id.startsWith('shoulder-')) return { armL: 'ev-arm-l-roll', armR: 'ev-arm-r-roll' };
  if (id.startsWith('wrist-'))    return { armL: 'ev-wrist-l',    armR: 'ev-wrist-r' };
  if (id.startsWith('hips-') || id.startsWith('legs-')) return { whole: 'ev-whole-squat' };
  if (id.startsWith('strength-')) return { whole: 'ev-whole-squat' };
  return { torso: 'ev-torso-breath' };
}

// ─── Eye visual ──────────────────────────────────────────────────────────────

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

// ─── Body figure ──────────────────────────────────────────────────────────────
//
// Each limb is a single continuous tapered path — no segmented sub-groups.
// This eliminates the visible joint gaps that made the figure look like a puppet.
//
// Animation structure: outer <g> positions + angles the limb in SVG space;
// inner <g> carries the CSS animation class. The inner group has no SVG
// transform, so transform-box:fill-box computes a clean bounding box with
// origin at (0,0) = the joint attachment point.
//
// Tapered arm path (local coords, y=0 at shoulder, y=112 at wrist):
//   M-9,0 Q-11,56 -4.5,112 L4.5,112 Q11,56 9,0 Z
//   → 18 px wide at shoulder, 9 px at wrist, slight outward belly curve.
//
// Tapered leg path (local coords, y=0 at hip, y=116 at ankle):
//   M-10,0 Q-11,58 -6,116 L6,116 Q11,58 10,0 Z
//   → 20 px wide at hip, 12 px at ankle.

const C  = '#3a2c1e';  // front / near limbs
const CB = '#6b5040';  // back / far limbs

function BodyFigure({ classes }: { classes: BodyClasses }) {
  const headCls  = classes.head  ?? '';
  const torsoCls = classes.torso ?? '';
  const armLCls  = classes.armL  ?? '';
  const armRCls  = classes.armR  ?? '';
  const wholeCls = classes.whole ?? '';

  return (
    <svg viewBox="0 0 200 290" width="150" height="215" aria-hidden="true" style={{ overflow: 'visible' }}>
      <g className={wholeCls || undefined}>

        {/* ── Right leg (behind) ── */}
        <g transform="translate(116,152) rotate(-4)">
          <path d="M-10,0 Q-11,58 -6,116 L6,116 Q11,58 10,0 Z" fill={CB} />
          <ellipse cx="0" cy="119" rx="15" ry="6" fill={CB} />
        </g>

        {/* ── Right arm (behind) — pivot at shoulder (128,63) ── */}
        <g transform="translate(128,63) rotate(-7)">
          <g className={armRCls || undefined}>
            <path d="M-9,0 Q-11,56 -4.5,112 L4.5,112 Q11,56 9,0 Z" fill={CB} />
            <ellipse cx="0" cy="114" rx="7" ry="4.5" fill={CB} />
          </g>
        </g>

        {/* ── Torso — pivot at shoulder-line top-center ── */}
        <g transform="translate(100,63)">
          <g className={torsoCls || undefined}>
            <path
              d="M-28,0 Q-32,25 -24,47 Q-26,69 -24,89 L24,89 Q26,69 24,47 Q32,25 28,0 Q15,-4 0,-4 Q-15,-4 -28,0 Z"
              fill={C}
            />
            <path d="M-12,0 Q0,10 12,0" fill="none" stroke={CB} strokeWidth="1.5" />
          </g>
        </g>

        {/* ── Left arm (front) — pivot at shoulder (72,63) ── */}
        <g transform="translate(72,63) rotate(7)">
          <g className={armLCls || undefined}>
            <path d="M-9,0 Q-11,56 -4.5,112 L4.5,112 Q11,56 9,0 Z" fill={C} />
            <ellipse cx="0" cy="114" rx="7" ry="4.5" fill={C} />
          </g>
        </g>

        {/* ── Left leg (front) ── */}
        <g transform="translate(84,152) rotate(4)">
          <path d="M-10,0 Q-11,58 -6,116 L6,116 Q11,58 10,0 Z" fill={C} />
          <ellipse cx="0" cy="119" rx="15" ry="6" fill={C} />
        </g>

        {/* ── Head + neck — pivot at neck base = (100,63) ── */}
        {/* Bounding box: x=-22..22, y=-59..0  → 50% 100% lands at (0,0) = neck-shoulder junction */}
        <g transform="translate(100,63)">
          <g className={headCls || undefined}>
            <rect x="-6" y="-15" width="12" height="15" rx="5" fill={C} />
            <circle cx="0" cy="-37" r="22" fill={C} />
            <circle cx="-7" cy="-40" r="2.5" fill="white" opacity="0.6" />
            <circle cx="7"  cy="-40" r="2.5" fill="white" opacity="0.6" />
            <path d="M-5,-30 Q0,-25 5,-30" fill="none" stroke="white" strokeWidth="1.5"
                  strokeLinecap="round" opacity="0.45" />
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
