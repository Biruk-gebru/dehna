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
  lShoulder: -20, lElbow: 36, lWrist: -6,
  rShoulder:  20, rElbow: -36, rWrist: 6,
  lHip: -8, lKnee: -6, lAnkle: -18,
  rHip:  8, rKnee: 6,  rAnkle: 18,
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
  /** Render the neutral rest pose with no motion at all — used for cognitive exercises. */
  static?: boolean;
}

export function FigureRig({ poses, seated, static: isStatic }: Props) {
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
    if (isStatic) return; // frozen at REST — set once below, no rAF loop
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
  }, [poses, isStatic]);

  // ─── Visual constants ────────────────────────────────────────────────────
  const BONE = '#3a332d';  // dark warm charcoal — limb lines
  const JT   = '#9a8e82';  // muted warm gray — joint dots, chair

  // Bone lengths (px in SVG units)
  const NECK    = 8;
  const HEAD_R  = 20;
  const UA      = 46;  // upper arm — reaches down to roughly hip height
  const FA      = 40;  // forearm — bends back in toward centerline
  const HAND    = 8;
  const THIGH   = 50;
  const SHIN    = 44;
  const FOOT    = 13;

  const rot = (deg: number) => `rotate(${deg})`;

  // ─── SVG hierarchy — kinematic chain, legs mirrored via scale(-1,1) ─────
  //
  // No separate spine/collarbone bone is drawn: arms hang directly from the
  // neck point and their shoulder→elbow→wrist bend forms the torso's visual
  // silhouette (matching the reference figure). Legs mirror via scale(side,1)
  // so one positive hip angle spreads both legs outward symmetrically.

  const Leg = ({
    side, hipRef, kneeRef, ankleRef,
  }: {
    side: 1 | -1;
    hipRef: React.RefObject<SVGGElement | null>;
    kneeRef: React.RefObject<SVGGElement | null>;
    ankleRef: React.RefObject<SVGGElement | null>;
  }) => (
    <g transform={`translate(${side * 9}, 0)`}>
      <circle r={4} fill={JT} />
      <g transform={`scale(${side}, 1)`}>
        <g ref={hipRef} transform={rot(REST[side === -1 ? 'lHip' : 'rHip'])}>
          <line y2={THIGH} stroke={BONE} strokeWidth={3} strokeLinecap="round" />
          <g transform={`translate(0,${THIGH})`}>
            <circle r={3.2} fill={JT} />
            <g ref={kneeRef} transform={rot(REST[side === -1 ? 'lKnee' : 'rKnee'])}>
              <line y2={SHIN} stroke={BONE} strokeWidth={2.7} strokeLinecap="round" />
              <g transform={`translate(0,${SHIN})`}>
                <circle r={2.4} fill={JT} />
                <g ref={ankleRef} transform={rot(REST[side === -1 ? 'lAnkle' : 'rAnkle'])}>
                  <line x2={FOOT} y2={2} stroke={BONE} strokeWidth={2.2} strokeLinecap="round" />
                  <circle cx={FOOT} cy={2} r={1.6} fill={JT} />
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
    <g transform={`translate(${side * 3}, 0)`}>
      <g ref={shoulderRef} transform={rot(REST[side === -1 ? 'lShoulder' : 'rShoulder'])}>
        <line y2={UA} stroke={BONE} strokeWidth={3} strokeLinecap="round" />
        <g transform={`translate(0,${UA})`}>
          <circle r={3} fill={JT} />
          <g ref={elbowRef} transform={rot(REST[side === -1 ? 'lElbow' : 'rElbow'])}>
            <line y2={FA} stroke={BONE} strokeWidth={2.6} strokeLinecap="round" />
            <g transform={`translate(0,${FA})`}>
              <circle r={2.6} fill={JT} />
              <g ref={wristRef} transform={rot(REST[side === -1 ? 'lWrist' : 'rWrist'])}>
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
      {/* Office chair — drawn behind the figure at low opacity */}
      {seated && (
        <g opacity={0.32}>
          {/* seat cushion */}
          <rect x={63} y={172} width={74} height={9} rx={4} fill={JT} opacity={0.55} />
          {/* curved backrest */}
          <path
            d="M 70,172 Q 67,132 78,108 Q 85,92 100,90 Q 115,92 122,108 Q 133,132 130,172"
            fill="none" stroke={JT} strokeWidth={4} strokeLinecap="round"
          />
          <path
            d="M 75,170 Q 73,132 82,111 Q 88,98 100,96 Q 112,98 118,111 Q 127,132 125,170 Z"
            fill={JT} opacity={0.12}
          />
          {/* armrests */}
          <line x1={63} y1={158} x2={48} y2={158} stroke={JT} strokeWidth={2.5} strokeLinecap="round" />
          <line x1={137} y1={158} x2={152} y2={158} stroke={JT} strokeWidth={2.5} strokeLinecap="round" />
          <line x1={63} y1={158} x2={63} y2={172} stroke={JT} strokeWidth={2} strokeLinecap="round" />
          <line x1={137} y1={158} x2={137} y2={172} stroke={JT} strokeWidth={2} strokeLinecap="round" />
          {/* central column */}
          <line x1={100} y1={181} x2={100} y2={210} stroke={JT} strokeWidth={3} strokeLinecap="round" />
          {/* star base + casters */}
          {[-28, -14, 0, 14, 28].map((dx) => (
            <g key={dx}>
              <line
                x1={100} y1={210} x2={100 + dx} y2={216 + Math.abs(dx) * 0.08}
                stroke={JT} strokeWidth={2.2} strokeLinecap="round"
              />
              <circle cx={100 + dx} cy={217 + Math.abs(dx) * 0.08} r={2} fill={JT} />
            </g>
          ))}
        </g>
      )}

      {/* Whole-figure vertical offset (calf raises, squats) */}
      <g ref={rootRef}>
        {/* Pelvis anchor */}
        <g transform="translate(100, 178)">

          <Leg side={-1} hipRef={hipLRef} kneeRef={kneeLRef} ankleRef={ankleLRef} />
          <Leg side={1}  hipRef={hipRRef} kneeRef={kneeRRef} ankleRef={ankleRRef} />

          {/* Torso — rotates the whole upper body around the pelvis. No drawn
              spine bone: arms hang from the neck point and their own bend
              implies the torso silhouette. */}
          <g ref={torsoRef} transform={rot(REST.torso)}>
            <g transform={`translate(0,${-72})`}>
              <Arm side={-1} shoulderRef={shoulderLRef} elbowRef={elbowLRef} wristRef={wristLRef} />
              <Arm side={1}  shoulderRef={shoulderRRef} elbowRef={elbowRRef} wristRef={wristRRef} />

              {/* Neck + head with face — single joint drives the sub-chain */}
              <g ref={headRef} transform={rot(REST.head)}>
                <line y2={-NECK} stroke={BONE} strokeWidth={3} strokeLinecap="round" />
                <circle r={3} fill={JT} />
                <g transform={`translate(0,${-NECK})`}>
                  <circle cy={-HEAD_R} r={HEAD_R} fill="none" stroke={BONE} strokeWidth={3} />
                  <circle cx={-6} cy={-HEAD_R - 3} r={1.6} fill={BONE} />
                  <circle cx={6}  cy={-HEAD_R - 3} r={1.6} fill={BONE} />
                  <path
                    d={`M -5,${-HEAD_R + 6} Q 0,${-HEAD_R + 10} 5,${-HEAD_R + 6}`}
                    fill="none" stroke={BONE} strokeWidth={1.6} strokeLinecap="round"
                  />
                </g>
              </g>
            </g>
          </g>

        </g>
      </g>
    </svg>
  );
}
