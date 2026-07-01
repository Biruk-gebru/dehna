'use client';

import { useRef, useEffect } from 'react';

// ─── Public types ─────────────────────────────────────────────────────────────

export type JointAngles = {
  rootY?: number;   // whole-figure vertical offset (px) — rises/squats
  torso?: number;   // pelvis→shoulder tilt (+ = lean/rotate right)
  head?: number;    // neck+head rotation relative to torso (+ = tilt/turn right)
  lShoulder?: number; lElbow?: number; lWrist?: number;
  rShoulder?: number; rElbow?: number; rWrist?: number;
  lHip?: number; lKnee?: number; lAnkle?: number;
  rHip?: number; rKnee?: number; rAnkle?: number;
};

export type Pose = {
  angles: JointAngles;
  durationMs: number; // time (ms) this pose is "held" as the active target before advancing
};

// ─── Critically damped interpolation (Unity SmoothDamp) ──────────────────────
// No overshoot, no oscillation — the correct alternative to CSS easing curves
// or underdamped springs for natural-looking joint motion.

function smoothDamp(
  current: number,
  target: number,
  velocity: number,
  smoothTime: number,
  dt: number,
): [number, number] {
  const d = Math.min(dt, smoothTime * 0.5);
  const omega = 2.0 / smoothTime;
  const x = omega * d;
  const exp = 1.0 / (1.0 + x + 0.48 * x * x + 0.235 * x * x * x);
  const change = current - target;
  const temp = (velocity + omega * change) * d;
  return [target + (change + temp) * exp, (velocity - omega * temp) * exp];
}

const REST: Required<JointAngles> = {
  rootY: 0, torso: 0, head: 0,
  lShoulder: -12, lElbow: 8,  lWrist: 0,
  rShoulder:  12, rElbow: -8, rWrist: 0,
  lHip: -6, lKnee: 0, lAnkle: 0,
  rHip:  6, rKnee: 0, rAnkle: 0,
};

// Seconds-to-target per joint. Core moves first (short); extremities trail
// (long) — this alone produces natural cascading motion, no manual offsets.
const SMOOTH_TIME: Record<keyof Required<JointAngles>, number> = {
  rootY: 0.34,
  torso: 0.32, head: 0.38,
  lShoulder: 0.36, lElbow: 0.44, lWrist: 0.52,
  rShoulder: 0.36, rElbow: 0.44, rWrist: 0.52,
  lHip: 0.34, lKnee: 0.40, lAnkle: 0.46,
  rHip: 0.34, rKnee: 0.40, rAnkle: 0.46,
};

const JOINT_KEYS = Object.keys(SMOOTH_TIME) as (keyof Required<JointAngles>)[];

// ─── Component ───────────────────────────────────────────────────────────────

interface Props {
  poses: Pose[];
  seated?: boolean;
}

export function FigureRig({ poses, seated }: Props) {
  const rootRef      = useRef<SVGGElement>(null);
  const torsoRef      = useRef<SVGGElement>(null);
  const headRef      = useRef<SVGGElement>(null);
  const shoulderLRef = useRef<SVGGElement>(null);
  const elbowLRef    = useRef<SVGGElement>(null);
  const wristLRef    = useRef<SVGGElement>(null);
  const shoulderRRef = useRef<SVGGElement>(null);
  const elbowRRef    = useRef<SVGGElement>(null);
  const wristRRef    = useRef<SVGGElement>(null);
  const hipLRef      = useRef<SVGGElement>(null);
  const kneeLRef     = useRef<SVGGElement>(null);
  const ankleLRef    = useRef<SVGGElement>(null);
  const hipRRef      = useRef<SVGGElement>(null);
  const kneeRRef     = useRef<SVGGElement>(null);
  const ankleRRef    = useRef<SVGGElement>(null);

  useEffect(() => {
    if (!poses.length) return;
    const total = poses.reduce((s, p) => s + p.durationMs, 0);
    if (total <= 0) return;

    // Per-joint { pos, vel } state — persists across frames, drives smoothDamp
    const state: Record<string, { pos: number; vel: number }> = {};
    for (const k of JOINT_KEYS) state[k] = { pos: REST[k], vel: 0 };

    let rafId: number;
    let prevNow: number | null = null;
    let t0: number | null = null;

    const setRot = (el: SVGGElement | null, deg: number) =>
      el?.setAttribute('transform', `rotate(${deg.toFixed(3)})`);
    const setTransY = (el: SVGGElement | null, px: number) =>
      el?.setAttribute('transform', `translate(0,${px.toFixed(3)})`);

    function frame(now: number) {
      if (!t0) t0 = now;
      if (prevNow === null) prevNow = now;
      const dt = Math.min((now - prevNow) / 1000, 0.05);
      prevNow = now;

      const ct = ((now - t0) % total) / total; // normalised cycle position [0,1)

      // Find the pose whose window contains ct — its angles are this instant's target
      let acc = 0;
      let target: Required<JointAngles> = { ...REST, ...poses[0].angles };
      for (let i = 0; i < poses.length; i++) {
        const frac = poses[i].durationMs / total;
        if (ct < acc + frac) {
          target = { ...REST, ...poses[i].angles };
          break;
        }
        acc += frac;
      }

      // Barely-perceptible idle breathing so the figure is never frozen at rest
      const breathTorso = Math.sin(now * 0.001) * 0.35;
      const breathHead  = Math.sin(now * 0.0013 + 0.7) * 0.25;

      for (const k of JOINT_KEYS) {
        const s = state[k];
        let t = target[k];
        if (k === 'torso') t += breathTorso;
        if (k === 'head')  t += breathHead;
        const [p, v] = smoothDamp(s.pos, t, s.vel, SMOOTH_TIME[k], dt);
        s.pos = p;
        s.vel = v;
      }

      setTransY(rootRef.current, state.rootY.pos);
      setRot(torsoRef.current,     state.torso.pos);
      setRot(headRef.current,      state.head.pos);
      setRot(shoulderLRef.current, state.lShoulder.pos);
      setRot(elbowLRef.current,    state.lElbow.pos);
      setRot(wristLRef.current,    state.lWrist.pos);
      setRot(shoulderRRef.current, state.rShoulder.pos);
      setRot(elbowRRef.current,    state.rElbow.pos);
      setRot(wristRRef.current,    state.rWrist.pos);
      setRot(hipLRef.current,      state.lHip.pos);
      setRot(kneeLRef.current,     state.lKnee.pos);
      setRot(ankleLRef.current,    state.lAnkle.pos);
      setRot(hipRRef.current,      state.rHip.pos);
      setRot(kneeRRef.current,     state.rKnee.pos);
      setRot(ankleRRef.current,    state.rAnkle.pos);

      rafId = requestAnimationFrame(frame);
    }

    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, [poses]);

  // ─── Visual constants ────────────────────────────────────────────────────
  const BONE  = 'var(--color-text-muted)';  // limb lines
  const DOT   = 'var(--color-primary)';      // joint dots
  const HEAD  = 'var(--color-text)';         // head outline

  // Bone lengths (px in SVG units) — weight tapers down the chain
  const TORSO   = 60;
  const NECK    = 16;
  const HEAD_R  = 20;
  const UA      = 38;  // upper arm
  const FA      = 32;  // forearm
  const HAND    = 8;
  const THIGH   = 50;
  const SHIN    = 44;
  const FOOT    = 14;

  // ─── SVG hierarchy — kinematic chain, legs mirrored via scale(-1,1) ─────
  //
  //   Root pelvis:  translate(100, 178)
  //     Torso rotation group (rotates whole upper body + drags shoulder/head)
  //       Spine bone → shoulder line at local (0,-60)
  //         Head group (neck + head circle)
  //         L/R arm chains: shoulder → elbow → wrist → hand
  //     L/R leg chains, each mirrored with scale(side,1) so a single
  //     positive hip angle spreads both legs outward symmetrically —
  //     without mirroring, both legs would rotate the same direction
  //     and overlap.

  const Leg = ({
    side, hipRef, kneeRef, ankleRef,
  }: {
    side: 1 | -1;
    hipRef: React.RefObject<SVGGElement | null>;
    kneeRef: React.RefObject<SVGGElement | null>;
    ankleRef: React.RefObject<SVGGElement | null>;
  }) => (
    <g transform={`translate(${side * 12}, 0)`}>
      <circle r={4.5} fill={DOT} />
      <g transform={`scale(${side}, 1)`}>
        <g ref={hipRef}>
          <line y2={THIGH} stroke={BONE} strokeWidth={3} strokeLinecap="round" />
          <g transform={`translate(0,${THIGH})`}>
            <circle r={3.5} fill={DOT} />
            <g ref={kneeRef}>
              <line y2={SHIN} stroke={BONE} strokeWidth={2.7} strokeLinecap="round" />
              <g transform={`translate(0,${SHIN})`}>
                <circle r={2.5} fill={DOT} />
                <g ref={ankleRef}>
                  <line x2={FOOT} y2={2} stroke={BONE} strokeWidth={2.2} strokeLinecap="round" />
                  <circle cx={FOOT} cy={2} r={1.8} fill={DOT} />
                </g>
              </g>
            </g>
          </g>
        </g>
      </g>
    </g>
  );

  const Arm = ({
    side, shoulderRef, elbowRef, wristRef,
  }: {
    side: 1 | -1;
    shoulderRef: React.RefObject<SVGGElement | null>;
    elbowRef: React.RefObject<SVGGElement | null>;
    wristRef: React.RefObject<SVGGElement | null>;
  }) => (
    <g transform={`translate(${side * 22}, 0)`}>
      <circle r={4.5} fill={DOT} />
      <g ref={shoulderRef}>
        <line y2={UA} stroke={BONE} strokeWidth={3} strokeLinecap="round" />
        <g transform={`translate(0,${UA})`}>
          <circle r={3.5} fill={DOT} />
          <g ref={elbowRef}>
            <line y2={FA} stroke={BONE} strokeWidth={2.6} strokeLinecap="round" />
            <g transform={`translate(0,${FA})`}>
              <circle r={2.5} fill={DOT} />
              <g ref={wristRef}>
                <line y2={HAND} stroke={BONE} strokeWidth={1.9} strokeLinecap="round" />
              </g>
            </g>
          </g>
        </g>
      </g>
    </g>
  );

  return (
    <svg
      viewBox="0 0 200 280"
      width="150"
      height="210"
      aria-hidden="true"
      style={{ overflow: 'visible' }}
    >
      {/* Chair — drawn behind the figure at low opacity for seated exercises */}
      {seated && (
        <g opacity={0.28} fill="none" stroke={BONE} strokeWidth={3} strokeLinecap="round">
          <line x1={68}  y1={178} x2={68}  y2={230} />
          <line x1={132} y1={178} x2={132} y2={230} />
          <line x1={64}  y1={178} x2={136} y2={178} />
          <path d="M 68,178 Q 66,140 76,118 Q 82,104 100,102 Q 118,104 124,118 Q 134,140 132,178"
                strokeWidth={4} />
          <line x1={68}  y1={230} x2={56}  y2={252} />
          <line x1={132} y1={230} x2={144} y2={252} />
        </g>
      )}

      {/* Whole-figure vertical offset (calf raises, squats) */}
      <g ref={rootRef}>
        {/* Pelvis anchor */}
        <g transform="translate(100, 178)">

          {/* Hip line */}
          <line
            x1={-12} y1={0} x2={12} y2={0}
            stroke={BONE} strokeWidth={3} strokeLinecap="round"
          />

          <Leg side={-1} hipRef={hipLRef} kneeRef={kneeLRef} ankleRef={ankleLRef} />
          <Leg side={1}  hipRef={hipRRef} kneeRef={kneeRRef} ankleRef={ankleRRef} />

          {/* Torso — rotates whole upper body around pelvis */}
          <g ref={torsoRef}>
            <line y2={-TORSO} stroke={BONE} strokeWidth={3} strokeLinecap="round" />

            <g transform={`translate(0,${-TORSO})`}>
              <line x1={-22} y1={0} x2={22} y2={0} stroke={BONE} strokeWidth={3} strokeLinecap="round" />

              {/* Neck + head — single joint drives the whole neck/head sub-chain */}
              <g ref={headRef}>
                <line y2={-NECK} stroke={BONE} strokeWidth={3} strokeLinecap="round" />
                <g transform={`translate(0,${-NECK})`}>
                  <circle cy={-HEAD_R} r={HEAD_R} fill="none" stroke={HEAD} strokeWidth={2.5} />
                </g>
              </g>

              <Arm side={-1} shoulderRef={shoulderLRef} elbowRef={elbowLRef} wristRef={wristLRef} />
              <Arm side={1}  shoulderRef={shoulderRRef} elbowRef={elbowRRef} wristRef={wristRRef} />
            </g>
          </g>

        </g>
      </g>
    </svg>
  );
}
