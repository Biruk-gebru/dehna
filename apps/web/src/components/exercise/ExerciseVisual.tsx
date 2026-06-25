'use client';

import type { Exercise } from '@/types';

interface Props {
  exercise: Exercise;
}

// ─── Injected keyframes + animation classes ──────────────────────────────────

const CSS = `
  @keyframes ev-iris-far {
    0%, 100% { transform: translate(0, 0) scale(1); }
    40%, 60% { transform: translate(2px, 4px) scale(0.8); }
  }
  @keyframes ev-iris-circle {
    0%   { transform: translate(0, -15px); }
    25%  { transform: translate(15px, 0); }
    50%  { transform: translate(0, 15px); }
    75%  { transform: translate(-15px, 0); }
    100% { transform: translate(0, -15px); }
  }
  @keyframes ev-iris-focus {
    0%, 100% { transform: scale(1); }
    50%       { transform: scale(0.62); }
  }
  @keyframes ev-lid-blink {
    0%, 20%, 80%, 100% { transform: scaleY(0); }
    40%, 60%           { transform: scaleY(1); }
  }
  @keyframes ev-cat-cow {
    0%, 100% { transform: rotate(-10deg); }
    50%      { transform: rotate(10deg); }
  }
  @keyframes ev-side-bend {
    0%, 100% { transform: rotate(-14deg); }
    50%      { transform: rotate(14deg); }
  }
  @keyframes ev-torso-twist {
    0%, 100% { transform: rotate(-16deg); }
    50%      { transform: rotate(16deg); }
  }
  @keyframes ev-back-ext {
    0%, 100% { transform: rotate(0deg); }
    50%      { transform: rotate(-18deg); }
  }
  @keyframes ev-head-tilt {
    0%, 100% { transform: rotate(-18deg); }
    50%      { transform: rotate(18deg); }
  }
  @keyframes ev-head-rotate {
    0%, 100% { transform: rotate(-22deg); }
    50%      { transform: rotate(22deg); }
  }
  @keyframes ev-arm-roll-l {
    0%   { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes ev-arm-roll-r {
    0%   { transform: rotate(0deg); }
    100% { transform: rotate(-360deg); }
  }
  @keyframes ev-arm-lift {
    0%, 100% { transform: rotate(0deg); }
    50%      { transform: rotate(-82deg); }
  }
  @keyframes ev-arm-cross {
    0%, 100% { transform: rotate(0deg) translateX(0); }
    50%      { transform: rotate(-30deg) translateX(14px); }
  }
  @keyframes ev-wrist-l {
    0%   { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes ev-wrist-r {
    0%   { transform: rotate(0deg); }
    100% { transform: rotate(-360deg); }
  }
  @keyframes ev-breath {
    0%, 100% { transform: scaleX(1) scaleY(1); }
    50%      { transform: scaleX(1.06) scaleY(1.04); }
  }
  @keyframes ev-squat {
    0%, 100% { transform: translateY(0); }
    50%      { transform: translateY(20px); }
  }
  @keyframes ev-calf {
    0%, 100% { transform: translateY(0); }
    50%      { transform: translateY(-10px); }
  }

  .ev-head-tilt   { animation: ev-head-tilt   2.5s ease-in-out infinite; transform-origin: 50% 100%; transform-box: fill-box; }
  .ev-head-rotate { animation: ev-head-rotate  2.5s ease-in-out infinite; transform-origin: 50% 100%; transform-box: fill-box; }

  .ev-torso-cat-cow   { animation: ev-cat-cow    3s ease-in-out infinite; transform-origin: 50% 0%; transform-box: fill-box; }
  .ev-torso-side-bend { animation: ev-side-bend  3s ease-in-out infinite; transform-origin: 50% 0%; transform-box: fill-box; }
  .ev-torso-twist     { animation: ev-torso-twist 3s ease-in-out infinite; transform-origin: 50% 0%; transform-box: fill-box; }
  .ev-torso-back-ext  { animation: ev-back-ext   3s ease-in-out infinite; transform-origin: 50% 0%; transform-box: fill-box; }
  .ev-torso-breath    { animation: ev-breath     4s ease-in-out infinite; transform-origin: 50% 0%; transform-box: fill-box; }

  .ev-arm-l-roll  { animation: ev-arm-roll-l 2.5s ease-in-out infinite; transform-origin: 50% 0%; transform-box: fill-box; }
  .ev-arm-r-roll  { animation: ev-arm-roll-r 2.5s ease-in-out infinite; transform-origin: 50% 0%; transform-box: fill-box; }
  .ev-arm-l-lift  { animation: ev-arm-lift   3s ease-in-out infinite; transform-origin: 50% 0%; transform-box: fill-box; }
  .ev-arm-r-lift  { animation: ev-arm-lift   3s ease-in-out infinite; transform-origin: 50% 0%; transform-box: fill-box; }
  .ev-arm-r-cross { animation: ev-arm-cross  3s ease-in-out infinite; transform-origin: 50% 0%; transform-box: fill-box; }
  .ev-wrist-l     { animation: ev-wrist-l    2s linear infinite;       transform-origin: 50% 100%; transform-box: fill-box; }
  .ev-wrist-r     { animation: ev-wrist-r    2s linear infinite;       transform-origin: 50% 100%; transform-box: fill-box; }

  .ev-whole-squat { animation: ev-squat 2s ease-in-out infinite; transform-origin: 50% 100%; transform-box: fill-box; }
  .ev-whole-calf  { animation: ev-calf  2s ease-in-out infinite; transform-origin: 50% 100%; transform-box: fill-box; }

  .ev-iris-far    { animation: ev-iris-far    3s ease-in-out infinite; transform-origin: 50% 50%; transform-box: fill-box; }
  .ev-iris-circle { animation: ev-iris-circle 4s linear infinite;       transform-origin: 50% 50%; transform-box: fill-box; }
  .ev-iris-focus  { animation: ev-iris-focus  3s ease-in-out infinite; transform-origin: 50% 50%; transform-box: fill-box; }
  .ev-lid-blink   { animation: ev-lid-blink   3s ease-in-out infinite; transform-origin: 50% 0%; transform-box: fill-box; }
`;

// ─── Animation class selector ────────────────────────────────────────────────

type BodyClasses = {
  head?: string;
  torso?: string;
  armL?: string;
  armR?: string;
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
    case 'wrist-circles-01':          return { armL: 'ev-wrist-l', armR: 'ev-wrist-r' };
    case 'wrist-prayer-01':           return { armL: 'ev-arm-l-lift', armR: 'ev-arm-r-lift' };
    case 'general-breathing-01':      return { torso: 'ev-torso-breath' };
    case 'general-box-breathing-01':  return { torso: 'ev-torso-breath' };
  }
  if (id.startsWith('back-'))     return { torso: 'ev-torso-cat-cow' };
  if (id.startsWith('neck-'))     return { head: 'ev-head-tilt' };
  if (id.startsWith('shoulder-')) return { armL: 'ev-arm-l-roll', armR: 'ev-arm-r-roll' };
  if (id.startsWith('wrist-'))    return { armL: 'ev-wrist-l', armR: 'ev-wrist-r' };
  if (id.startsWith('hips-') || id.startsWith('legs-')) return { whole: 'ev-whole-squat' };
  if (id.startsWith('strength-')) return { whole: 'ev-whole-squat' };
  return { torso: 'ev-torso-breath' };
}

// ─── Eye visual ──────────────────────────────────────────────────────────────

function EyeVisual({ id }: { id: string }) {
  const isPalming = id === 'eyes-palming-01';
  const irisClass =
    id === 'eyes-20-20-20-01'  ? 'ev-iris-far'    :
    id === 'eyes-circles-01'   ? 'ev-iris-circle'  :
    id === 'eyes-focus-shift-01' ? 'ev-iris-focus' :
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

      {/* Sclera */}
      <ellipse cx="120" cy="65" rx="84" ry="45" fill="white" />

      {/* Iris + pupil – animated group */}
      <g clipPath="url(#ev-eye-clip)" className={isPalming ? undefined : irisClass}>
        <circle cx="120" cy="65" r="27" fill="url(#ev-iris-g)" />
        <circle cx="120" cy="65" r="27" fill="none" stroke="#180900" strokeWidth="1.5" />
        <circle cx="120" cy="65" r="13" fill="#0e0604" />
        <circle cx="129" cy="57" r="5"  fill="white" opacity="0.6" />
        <circle cx="124" cy="73" r="2.5" fill="white" opacity="0.25" />
      </g>

      {/* Upper lid edge */}
      <path d="M36,65 Q120,18 204,65" fill="none" stroke="#9a7550" strokeWidth="2.5" strokeLinecap="round" />
      {/* Lower lid edge */}
      <path d="M36,65 Q120,106 204,65" fill="none" stroke="#9a7550" strokeWidth="2" strokeLinecap="round" />
      {/* Outer eye border */}
      <ellipse cx="120" cy="65" rx="84" ry="45" fill="none" stroke="#c5a880" strokeWidth="2" />

      {/* Blink overlay */}
      {showBlink && (
        <g clipPath="url(#ev-eye-clip)">
          <rect
            x="36" y="20"
            width="168" height="65"
            fill="#d4b898"
            className="ev-lid-blink"
          />
        </g>
      )}

      {/* Palming overlay */}
      {isPalming && (
        <>
          <ellipse cx="120" cy="65" rx="84" ry="45" fill="#d4b898" />
          {/* Left hand */}
          <ellipse cx="68"  cy="65" rx="46" ry="36" fill="#c4a47c" />
          {/* Right hand */}
          <ellipse cx="172" cy="65" rx="46" ry="36" fill="#c4a47c" />
          {/* Subtle palm crease lines */}
          <path d="M45,52 Q68,46 90,52"  fill="none" stroke="#b0905e" strokeWidth="1.2" />
          <path d="M150,52 Q172,46 195,52" fill="none" stroke="#b0905e" strokeWidth="1.2" />
        </>
      )}

      {/* Circle direction arrows */}
      {id === 'eyes-circles-01' && (
        <g stroke="#9a7550" strokeWidth="1.5" fill="none" opacity="0.4" strokeDasharray="5,3">
          <path d="M 120,20 A 45,45 0 0,1 165,65" />
          <path d="M 165,65 A 45,45 0 0,1 120,110" />
          <path d="M 120,110 A 45,45 0 0,1 75,65" />
          <path d="M 75,65 A 45,45 0 0,1 120,20" />
        </g>
      )}

      {/* Focus-shift near/far labels */}
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

// Two shades for depth: front limbs darker, back limbs lighter
const C  = '#3a2c1e';   // front / near
const CB = '#6b5040';   // back / far

function BodyFigure({ classes }: { classes: BodyClasses }) {
  const headCls  = classes.head  ?? '';
  const torsoCls = classes.torso ?? '';
  const armLCls  = classes.armL  ?? '';
  const armRCls  = classes.armR  ?? '';
  const wholeCls = classes.whole ?? '';

  return (
    <svg viewBox="0 0 200 290" width="150" height="215" aria-hidden="true">
      <g className={wholeCls || undefined}>

        {/* ── Right leg (behind) ── */}
        <g className={wholeCls ? undefined : undefined}>
          {/* upper leg */}
          <rect x="-8" y="0" width="16" height="62" rx="8" fill={CB}
                transform="translate(118,152) rotate(-4)" />
          {/* lower leg */}
          <rect x="-7" y="0" width="14" height="54" rx="7" fill={CB}
                transform="translate(114,211) rotate(2)" />
          {/* foot */}
          <ellipse cx="126" cy="268" rx="18" ry="7" fill={CB} />
        </g>

        {/* ── Right arm (behind) ── */}
        <g className={armRCls || undefined}>
          {/* upper arm */}
          <rect x="-7" y="0" width="14" height="56" rx="7" fill={CB}
                transform="translate(132,66) rotate(8)" />
          {/* forearm */}
          <rect x="-6" y="0" width="12" height="44" rx="6" fill={CB}
                transform="translate(140,120) rotate(5)" />
          {/* hand */}
          <ellipse cx="144" cy="167" rx="9" ry="6" fill={CB} />
        </g>

        {/* ── Torso ── */}
        <g className={torsoCls || undefined}>
          <path
            d="M72,63 Q68,88 76,110 Q74,132 76,152 L124,152 Q126,132 124,110 Q132,88 128,63 Q115,59 100,59 Q85,59 72,63 Z"
            fill={C}
          />
          {/* subtle collar notch for realism */}
          <path d="M88,63 Q100,73 112,63" fill="none" stroke={CB} strokeWidth="1.5" />
        </g>

        {/* ── Left arm (front) ── */}
        <g className={armLCls || undefined}>
          {/* upper arm */}
          <rect x="-7" y="0" width="14" height="56" rx="7" fill={C}
                transform="translate(68,66) rotate(-8)" />
          {/* forearm */}
          <rect x="-6" y="0" width="12" height="44" rx="6" fill={C}
                transform="translate(60,120) rotate(-5)" />
          {/* hand */}
          <ellipse cx="56" cy="167" rx="9" ry="6" fill={C} />
        </g>

        {/* ── Left leg (front) ── */}
        <g>
          {/* upper leg */}
          <rect x="-8" y="0" width="16" height="62" rx="8" fill={C}
                transform="translate(82,152) rotate(4)" />
          {/* lower leg */}
          <rect x="-7" y="0" width="14" height="54" rx="7" fill={C}
                transform="translate(86,211) rotate(-2)" />
          {/* foot */}
          <ellipse cx="74" cy="268" rx="18" ry="7" fill={C} />
        </g>

        {/* ── Head + neck ── */}
        <g className={headCls || undefined}>
          {/* neck */}
          <rect x="94" y="50" width="12" height="14" rx="5" fill={C} />
          {/* head */}
          <circle cx="100" cy="28" r="21" fill={C} />
          {/* eyes */}
          <circle cx="93" cy="25" r="2.2" fill="white" opacity="0.55" />
          <circle cx="107" cy="25" r="2.2" fill="white" opacity="0.55" />
          {/* mouth */}
          <path d="M 94,35 Q 100,40 106,35" fill="none" stroke="white" strokeWidth="1.4"
                strokeLinecap="round" opacity="0.4" />
        </g>

      </g>
    </svg>
  );
}

// ─── Public component ────────────────────────────────────────────────────────

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
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      {exercise.type === 'eye-break' ? (
        <EyeVisual id={exercise.id} />
      ) : (
        <BodyFigure classes={getBodyClasses(exercise.id)} />
      )}
    </div>
  );
}
