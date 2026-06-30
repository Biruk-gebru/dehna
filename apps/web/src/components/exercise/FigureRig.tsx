'use client';

import { useRef, useEffect } from 'react';

// ─── Public types ─────────────────────────────────────────────────────────────

export type JointAngles = {
  rootY?: number;      // whole-figure translateY offset (px) — for rises/squats
  spine?: number;      // torso tilt (° from vertical, + = lean right, − = lean left)
  neck?: number;       // neck tilt relative to spine direction (+ = lean right)
  head?: number;       // head rotation on top of neck (+ = clockwise / chin tucks right)
  shoulderL?: number;  // left upper arm from vertical (− = outward/left)
  elbowL?: number;     // left forearm relative to upper arm (+ = forward/inward)
  wristL?: number;     // left hand relative to forearm
  shoulderR?: number;  // right upper arm from vertical (+ = outward/right)
  elbowR?: number;     // right forearm relative to upper arm (− = forward/inward)
  wristR?: number;
  hipL?: number;       // left thigh from vertical (− = outward/left)
  kneeL?: number;      // left shin relative to thigh
  hipR?: number;       // right thigh from vertical (+ = outward/right)
  kneeR?: number;
};

export type Pose = {
  angles: JointAngles;
  durationMs: number;  // time (ms) to reach these angles from the previous pose
};

// ─── Internals ────────────────────────────────────────────────────────────────

// Default resting angles — applied for any key not specified in a pose
const REST: Required<JointAngles> = {
  rootY: 0, spine: 0, neck: 0, head: 0,
  shoulderL: -12, elbowL: 8,  wristL: 0,
  shoulderR:  12, elbowR: -8, wristR: 0,
  hipL: -6, kneeL: 0,
  hipR:  6, kneeR: 0,
};

// How far into a transition each joint starts moving (0–1).
// Child joints start slightly after their parent → cascade effect.
const CASCADE: Record<keyof Required<JointAngles>, number> = {
  rootY: 0,
  spine: 0,    neck:  0.05,  head: 0.09,
  shoulderL: 0.03, elbowL: 0.08, wristL: 0.13,
  shoulderR: 0.03, elbowR: 0.08, wristR: 0.13,
  hipL: 0.01,  kneeL: 0.06,
  hipR: 0.01,  kneeR: 0.06,
};

// Cubic ease-in-out
function eio(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function cascadedLerp(
  from: number,
  to: number,
  t: number,      // progress within this transition [0,1]
  offset: number, // cascade offset for this joint
): number {
  const adj = offset >= 1 ? 1 : Math.max(0, Math.min(1, (t - offset) / (1 - offset)));
  return from + (to - from) * eio(adj);
}

// ─── Component ───────────────────────────────────────────────────────────────

interface Props {
  poses: Pose[];
}

export function FigureRig({ poses }: Props) {
  const rootRef      = useRef<SVGGElement>(null);
  const spineRef     = useRef<SVGGElement>(null);
  const neckRef      = useRef<SVGGElement>(null);
  const headRef      = useRef<SVGGElement>(null);
  const shoulderLRef = useRef<SVGGElement>(null);
  const elbowLRef    = useRef<SVGGElement>(null);
  const wristLRef    = useRef<SVGGElement>(null);
  const shoulderRRef = useRef<SVGGElement>(null);
  const elbowRRef    = useRef<SVGGElement>(null);
  const wristRRef    = useRef<SVGGElement>(null);
  const hipLRef      = useRef<SVGGElement>(null);
  const kneeLRef     = useRef<SVGGElement>(null);
  const hipRRef      = useRef<SVGGElement>(null);
  const kneeRRef     = useRef<SVGGElement>(null);

  useEffect(() => {
    if (!poses.length) return;
    const total = poses.reduce((s, p) => s + p.durationMs, 0);
    if (total <= 0) return;

    let rafId: number;
    let t0: number | null = null;

    const setRot = (el: SVGGElement | null, deg: number) =>
      el?.setAttribute('transform', `rotate(${deg.toFixed(3)})`);
    const setTransY = (el: SVGGElement | null, px: number) =>
      el?.setAttribute('transform', `translate(0,${px.toFixed(3)})`);

    function frame(now: number) {
      if (!t0) t0 = now;
      const ct = ((now - t0) % total) / total; // normalised cycle position [0,1)

      // Find current transition
      let acc = 0;
      let from: Required<JointAngles> = { ...REST, ...poses[poses.length - 1].angles };
      let to:   Required<JointAngles> = { ...REST, ...poses[0].angles };
      let tt = ct;

      for (let i = 0; i < poses.length; i++) {
        const frac = poses[i].durationMs / total;
        if (ct < acc + frac) {
          const prev = i === 0 ? poses[poses.length - 1] : poses[i - 1];
          from = { ...REST, ...prev.angles };
          to   = { ...REST, ...poses[i].angles };
          tt   = (ct - acc) / frac;
          break;
        }
        acc += frac;
      }

      const j = (k: keyof Required<JointAngles>) =>
        cascadedLerp(from[k] as number, to[k] as number, tt, CASCADE[k]);

      setTransY(rootRef.current, j('rootY'));
      setRot(spineRef.current,     j('spine'));
      setRot(neckRef.current,      j('neck'));
      setRot(headRef.current,      j('head'));
      setRot(shoulderLRef.current, j('shoulderL'));
      setRot(elbowLRef.current,    j('elbowL'));
      setRot(wristLRef.current,    j('wristL'));
      setRot(shoulderRRef.current, j('shoulderR'));
      setRot(elbowRRef.current,    j('elbowR'));
      setRot(wristRRef.current,    j('wristR'));
      setRot(hipLRef.current,      j('hipL'));
      setRot(kneeLRef.current,     j('kneeL'));
      setRot(hipRRef.current,      j('hipR'));
      setRot(kneeRRef.current,     j('kneeR'));

      rafId = requestAnimationFrame(frame);
    }

    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, [poses]);

  // ─── Visual constants ────────────────────────────────────────────────────
  const BONE  = 'var(--color-text-muted)';  // limb lines
  const DOT   = 'var(--color-primary)';      // joint dots
  const HEAD  = 'var(--color-text)';         // head outline
  const SW    = 3;    // bone stroke width
  const HW    = 2.5;  // hand stub stroke width

  // Bone lengths (px in SVG units)
  const SPINE   = 60;
  const NECK    = 16;
  const HEAD_R  = 20;  // head circle radius; circle center is HEAD_R above neck top
  const UA      = 38;  // upper arm
  const FA      = 32;  // forearm
  const HAND    = 8;   // small hand stub
  const THIGH   = 50;
  const SHIN    = 44;

  // ─── SVG hierarchy ──────────────────────────────────────────────────────
  //
  // Layout (before any rotation):
  //   Root pelvis:  translate(100, 178)
  //     Hips:       ±12 px either side of pelvis
  //     Spine top:  translate(0, -60) = SVG y=118
  //       Collarbone: horizontal line ±22 px
  //       Neck top:   translate(0, -16) = SVG y=102
  //         Head:     circle cy=-20 r=20 → center at SVG y=82
  //       L-shoulder: translate(-22, 0) = SVG (78, 118)
  //       R-shoulder: translate( 22, 0) = SVG (122, 118)
  //
  // Each rotation group (ref) rotates around (0,0) in its parent coordinate
  // system — the joint position — via SVG rotate(deg) set by the rAF loop.

  return (
    <svg
      viewBox="0 0 200 280"
      width="150"
      height="210"
      aria-hidden="true"
      style={{ overflow: 'visible' }}
    >
      {/* Whole-figure vertical offset (calf raises, squats) */}
      <g ref={rootRef}>
        {/* Pelvis anchor */}
        <g transform="translate(100, 178)">

          {/* ── Hip line ─────────────────────────────────────────────── */}
          <line
            x1={-12} y1={0} x2={12} y2={0}
            stroke={BONE} strokeWidth={SW} strokeLinecap="round"
          />

          {/* ── Left leg ─────────────────────────────────────────────── */}
          <g transform="translate(-12, 0)">
            <circle r={4.5} fill={DOT} />
            <g ref={hipLRef}>
              <line y2={THIGH} stroke={BONE} strokeWidth={SW} strokeLinecap="round" />
              <g transform={`translate(0,${THIGH})`}>
                <circle r={3.5} fill={DOT} />
                <g ref={kneeLRef}>
                  <line y2={SHIN} stroke={BONE} strokeWidth={SW} strokeLinecap="round" />
                  <g transform={`translate(0,${SHIN})`}>
                    <circle r={2.5} fill={DOT} />
                  </g>
                </g>
              </g>
            </g>
          </g>

          {/* ── Right leg ────────────────────────────────────────────── */}
          <g transform="translate(12, 0)">
            <circle r={4.5} fill={DOT} />
            <g ref={hipRRef}>
              <line y2={THIGH} stroke={BONE} strokeWidth={SW} strokeLinecap="round" />
              <g transform={`translate(0,${THIGH})`}>
                <circle r={3.5} fill={DOT} />
                <g ref={kneeRRef}>
                  <line y2={SHIN} stroke={BONE} strokeWidth={SW} strokeLinecap="round" />
                  <g transform={`translate(0,${SHIN})`}>
                    <circle r={2.5} fill={DOT} />
                  </g>
                </g>
              </g>
            </g>
          </g>

          {/* ── Spine (rotates whole upper body around pelvis) ───────── */}
          <g ref={spineRef}>
            <line y2={-SPINE} stroke={BONE} strokeWidth={SW} strokeLinecap="round" />

            {/* Shoulder midpoint — top of spine */}
            <g transform={`translate(0,${-SPINE})`}>

              {/* Collarbone */}
              <line
                x1={-22} y1={0} x2={22} y2={0}
                stroke={BONE} strokeWidth={SW} strokeLinecap="round"
              />

              {/* ── Neck + Head ────────────────────────────────────── */}
              <g ref={neckRef}>
                <line y2={-NECK} stroke={BONE} strokeWidth={SW} strokeLinecap="round" />
                <g transform={`translate(0,${-NECK})`}>
                  <g ref={headRef}>
                    {/* Head circle center is HEAD_R above neck top */}
                    <circle
                      cy={-HEAD_R} r={HEAD_R}
                      fill="none" stroke={HEAD} strokeWidth={2.5}
                    />
                  </g>
                </g>
              </g>

              {/* ── Left arm ───────────────────────────────────────── */}
              <g transform="translate(-22, 0)">
                <circle r={4.5} fill={DOT} />
                <g ref={shoulderLRef}>
                  <line y2={UA} stroke={BONE} strokeWidth={SW} strokeLinecap="round" />
                  <g transform={`translate(0,${UA})`}>
                    <circle r={3.5} fill={DOT} />
                    <g ref={elbowLRef}>
                      <line y2={FA} stroke={BONE} strokeWidth={SW} strokeLinecap="round" />
                      <g transform={`translate(0,${FA})`}>
                        <circle r={2.5} fill={DOT} />
                        <g ref={wristLRef}>
                          <line y2={HAND} stroke={BONE} strokeWidth={HW} strokeLinecap="round" />
                        </g>
                      </g>
                    </g>
                  </g>
                </g>
              </g>

              {/* ── Right arm ──────────────────────────────────────── */}
              <g transform="translate(22, 0)">
                <circle r={4.5} fill={DOT} />
                <g ref={shoulderRRef}>
                  <line y2={UA} stroke={BONE} strokeWidth={SW} strokeLinecap="round" />
                  <g transform={`translate(0,${UA})`}>
                    <circle r={3.5} fill={DOT} />
                    <g ref={elbowRRef}>
                      <line y2={FA} stroke={BONE} strokeWidth={SW} strokeLinecap="round" />
                      <g transform={`translate(0,${FA})`}>
                        <circle r={2.5} fill={DOT} />
                        <g ref={wristRRef}>
                          <line y2={HAND} stroke={BONE} strokeWidth={HW} strokeLinecap="round" />
                        </g>
                      </g>
                    </g>
                  </g>
                </g>
              </g>

            </g>
            {/* end shoulder midpoint group */}
          </g>
          {/* end spineRef */}

        </g>
        {/* end pelvis anchor */}
      </g>
      {/* end rootRef */}
    </svg>
  );
}
