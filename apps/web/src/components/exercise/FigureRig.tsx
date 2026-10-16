'use client';

import { useEffect, useState } from 'react';

// ─── Public types ─────────────────────────────────────────────────────────────
//
// The figure is a 3D skeleton projected through a fixed camera. Poses are
// authored as targets, not raw joint angles: arms say where the hand goes
// relative to the shoulder, legs say where the ankle is on the floor, and
// two-bone IK places elbows and knees. Feet therefore stay planted while the
// pelvis moves, and hands land where the instructions put them.
//
// World axes: x toward the figure's left, y up, z out of the figure's chest.
// Lateral values (pelvis.x, torso.side/twist, head.tilt/turn) are positive
// toward the figure's left. Arm and leg values are side-relative, so the same
// numbers on armL and armR give a symmetric pose.

type ArmParams = {
  e: number;    // hand direction from the shoulder: 0 hanging down, 90 horizontal, 180 overhead
  a: number;    // azimuth: 0 out to the side, 90 forward, 180 across the body, -90 behind
  r: number;    // reach as a fraction of arm length (1 = straight)
  pe: number;   // elbow pole direction, same (e, a) convention
  pa: number;
  he: number;   // absolute hand direction, blended in by hf
  ha: number;
  hf: number;   // 0 = hand continues the forearm, 1 = hand points along (he, ha)
  pron: number; // forearm rotation: 0 thumb forward, +90 palm out/up, -90 palm in/down
  grip: number; // 0 fingers spread, 0.7 relaxed, 1 fist
  sy: number;   // shoulder shrug (up +)
  sz: number;   // shoulder protraction (forward +)
};

type LegParams = {
  x: number;     // ankle distance out from the midline
  y: number;     // ankle height above the floor (6 = foot flat)
  z: number;     // ankle position forward of the pelvis rest point
  pitch: number; // foot angle: 0 flat, + toes down (heel up), - toes up
  yaw: number;   // toe turn-out, - turns the foot inward
  out: number;   // knee direction: 0 forward, + rotates the knee outward
};

type FaceParams = {
  brow: number;  // + raised (warm, surprised), - lowered (focused)
  pinch: number; // 0..1 inner brow ends drawn down: effort, concentration
  smile: number; // -1 pressed lips .. 0 neutral .. 1 smile
  open: number;  // 0..1 mouth opening, e.g. a slow exhale
  lids: number;  // 0 open .. 1 closed
  gx: number;    // gaze, -1..1: + toward the figure's left
  gy: number;    // gaze, -1..1: + up
};

type BodyParams = {
  pelvis: { x: number; y: number; z: number };
  torso: { hinge: number; flex: number; side: number; twist: number };
  head: { nod: number; tilt: number; turn: number; z: number };
  face: FaceParams;
  armL: ArmParams; armR: ArmParams;
  legL: LegParams; legR: LegParams;
};

export type PoseTarget = { [G in keyof BodyParams]?: Partial<BodyParams[G]> };

export type Pose = {
  target: PoseTarget;
  durationMs: number; // how long this pose stays the active target before the next
};

export type Prop =
  | { kind: 'desk'; z: number; height?: number; monitor?: boolean }
  | { kind: 'ledge'; z: number }
  | { kind: 'wall'; z: number }
  | { kind: 'chair-front'; z: number } // a chair in front, facing away so its backrest is nearest
  | { kind: 'doorway' };

export type Clip = {
  poses: Pose[];
  seated?: boolean;
  yaw?: number;   // camera angle in degrees: 0 front, 90 right side
  props?: Prop[];
  shift?: number; // horizontal framing offset for wide poses
};

// ─── Pose authoring helpers ──────────────────────────────────────────────────

const NEGATE: Partial<Record<keyof BodyParams, string[]>> = {
  pelvis: ['x'],
  torso: ['side', 'twist'],
  head: ['tilt', 'turn'],
  face: ['gx'],
};

/** The same pose on the other side of the body. */
export function mirror(t: PoseTarget): PoseTarget {
  const out: PoseTarget = { armL: t.armR, armR: t.armL, legL: t.legR, legR: t.legL };
  for (const g of ['pelvis', 'torso', 'head', 'face'] as const) {
    const src = t[g] as Record<string, number> | undefined;
    if (!src) continue;
    const copy: Record<string, number> = { ...src };
    for (const k of NEGATE[g] ?? []) if (k in copy) copy[k] = -copy[k];
    (out as Record<string, unknown>)[g] = copy;
  }
  return out;
}

/** Shallow per-group merge, later targets win. */
export function merge(...targets: PoseTarget[]): PoseTarget {
  const out: Record<string, Record<string, number>> = {};
  for (const t of targets) {
    for (const [g, v] of Object.entries(t)) if (v) out[g] = { ...out[g], ...v };
  }
  return out as PoseTarget;
}

// ─── Rest poses ──────────────────────────────────────────────────────────────

const ARM_REST: ArmParams = {
  e: 7, a: -5, r: 0.97, pe: 60, pa: -90,
  he: 0, ha: 0, hf: 0, pron: 0, grip: 0.7, sy: 0, sz: 0,
};

const STANDING: BodyParams = {
  pelvis: { x: 0, y: 0, z: 0 },
  torso: { hinge: 0, flex: 0, side: 0, twist: 0 },
  head: { nod: 0, tilt: 0, turn: 0, z: 0 },
  face: { brow: 0, pinch: 0, smile: 0.3, open: 0, lids: 0.1, gx: 0, gy: 0 },
  armL: ARM_REST, armR: ARM_REST,
  legL: { x: 10, y: 6, z: 0, pitch: 0, yaw: 8, out: 4 },
  legR: { x: 10, y: 6, z: 0, pitch: 0, yaw: 8, out: 4 },
};

// Hands rest on the middle of the thighs (the collision step settles them on top)
const SEATED_ARM: ArmParams = { ...ARM_REST, e: 29, a: 104, r: 0.8, pe: 50, pa: -70 };
const SEATED_LEG: LegParams = { x: 12, y: 6, z: 40, pitch: 0, yaw: 6, out: 6 };

const SEATED: BodyParams = {
  ...STANDING,
  armL: SEATED_ARM, armR: SEATED_ARM,
  legL: SEATED_LEG, legR: SEATED_LEG,
};

type Flat = Record<string, number>;

function flatten(p: BodyParams | PoseTarget, into: Flat = {}): Flat {
  for (const [g, v] of Object.entries(p)) {
    for (const [k, n] of Object.entries((v ?? {}) as Record<string, number>)) into[`${g}.${k}`] = n;
  }
  return into;
}

function targetFlat(rest: BodyParams, t: PoseTarget): Flat {
  return flatten(t, flatten(rest));
}

// Seconds-to-target. The trunk leads and the hands trail a little behind,
// which gives a natural cascade without hand-tuned offsets.
function smoothTimeFor(key: string): number {
  if (key.startsWith('pelvis')) return 0.5;
  if (key.startsWith('torso')) return 0.55;
  if (key.startsWith('head')) return 0.5;
  if (key.startsWith('face')) return 0.35;
  if (key.startsWith('leg')) return 0.48;
  if (/\.(he|ha|hf|pron|grip)$/.test(key)) return 0.55;
  return 0.46;
}

// Critically damped spring (Unity SmoothDamp): no overshoot, eases in and out.
function smoothDamp(current: number, target: number, velocity: number, smoothTime: number, dt: number): [number, number] {
  const omega = 2 / smoothTime;
  const x = omega * dt;
  const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  const change = current - target;
  const temp = (velocity + omega * change) * dt;
  return [target + (change + temp) * exp, (velocity - omega * temp) * exp];
}

// ─── Vector math ─────────────────────────────────────────────────────────────

type V = [number, number, number];
type M = [V, V, V]; // rows

const RAD = Math.PI / 180;
const add = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a: V, s: number): V => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a: V, b: V) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V, b: V): V => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a: V) => Math.hypot(a[0], a[1], a[2]);
const norm = (a: V): V => { const l = len(a); return l < 1e-9 ? [0, -1, 0] : mul(a, 1 / l); };
const lerp = (a: V, b: V, t: number): V => add(a, mul(sub(b, a), t));

const apply = (m: M, v: V): V => [dot(m[0], v), dot(m[1], v), dot(m[2], v)];
const matMul = (a: M, b: M): M => {
  const col = (j: number): V => [b[0][j], b[1][j], b[2][j]];
  return a.map((row) => [dot(row, col(0)), dot(row, col(1)), dot(row, col(2))]) as M;
};
const rotX = (deg: number): M => { const c = Math.cos(deg * RAD), s = Math.sin(deg * RAD); return [[1, 0, 0], [0, c, -s], [0, s, c]]; };
const rotY = (deg: number): M => { const c = Math.cos(deg * RAD), s = Math.sin(deg * RAD); return [[c, 0, s], [0, 1, 0], [-s, 0, c]]; };
const rotZ = (deg: number): M => { const c = Math.cos(deg * RAD), s = Math.sin(deg * RAD); return [[c, -s, 0], [s, c, 0], [0, 0, 1]]; };
const chain = (...ms: M[]) => ms.reduce(matMul);

/** Unit direction for (e, a) on a body side (s = +1 left, -1 right). */
const dirOf = (e: number, a: number, s: number): V => [
  s * Math.sin(e * RAD) * Math.cos(a * RAD),
  -Math.cos(e * RAD),
  Math.sin(e * RAD) * Math.sin(a * RAD),
];

/** Two-bone IK. Returns the middle joint (elbow/knee) and the reached end point. */
function solveIK(root: V, target: V, l1: number, l2: number, pole: V): [V, V] {
  const toT = sub(target, root);
  const u = norm(toT);
  const d = Math.min(Math.max(len(toT), Math.abs(l1 - l2) + 0.01), l1 + l2 - 0.01);
  const along = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, l1 * l1 - along * along));
  let p = sub(pole, mul(u, dot(pole, u)));
  if (len(p) < 1e-4) p = cross(u, [1, 0, 0]);
  p = norm(p);
  return [add(root, add(mul(u, along), mul(p, h))), add(root, mul(u, d))];
}

// ─── Body dimensions (SVG units, floor at y = 0) ─────────────────────────────

const STAND_HIP = 87.8;
const SEAT_HIP = 47;
const HIP_W = 7;
const LUMBAR = 22;
const CHEST = 25;
const SHOULDER_W = 15;
const UPPER_ARM = 28;
const FOREARM = 25;
const THIGH = 42;
const SHIN = 40;

const SKIN = '#d9a07c';
const SKIN_SHADE = '#c18663';
const PALM = '#efc6a6';
const MOUTH = '#8a4a3a';
const CHEEK = 'rgba(226, 112, 92, 0.28)';
const HAIR = '#2f231c';
const SHIRT = 'var(--color-primary, #d3643b)';
const PANTS = '#3e4756';
const SHOE = '#2a2522';
// A touch darker, so a sleeve crossing in front of the chest doesn't vanish into it
const SLEEVE = 'color-mix(in srgb, var(--color-primary, #d3643b) 90%, #000)';
const SHADOW = 'rgba(40, 30, 20, 0.10)';
const PROP_TOP = '#dcd2c4';
const PROP_FRONT = '#c7b9a8';
const PROP_SIDE = '#b5a593';
const PROP_LINE = '#a39380';

const PITCH = 10; // camera looks slightly down so seats and desks read as surfaces

// ─── Drawing primitives ──────────────────────────────────────────────────────

type P2 = [number, number];
type Prim =
  | { k: 'line'; pts: P2[]; w: number; c: string; d: number }
  | { k: 'circle'; at: P2; r: number; c: string; d: number }
  | { k: 'ellipse'; at: P2; rx: number; ry: number; c: string; d: number }
  | { k: 'poly'; pts: P2[]; c: string; d: number; w?: number } // w rounds the corners
  | { k: 'curve'; from: P2; ctrl: P2; to: P2; w: number; c: string; d: number };

type Camera = { yaw: number; shift: number };

function makeProjector(cam: Camera) {
  const cy = Math.cos(cam.yaw * RAD), sy = Math.sin(cam.yaw * RAD);
  const cp = Math.cos(PITCH * RAD), sp = Math.sin(PITCH * RAD);
  return (p: V): { at: P2; z: number } => {
    const x1 = p[0] * cy + p[2] * sy;
    const z1 = -p[0] * sy + p[2] * cy;
    const y2 = p[1] * cp - z1 * sp;
    const z2 = p[1] * sp + z1 * cp;
    return { at: [x1 + cam.shift, -y2], z: z2 };
  };
}

type Projector = ReturnType<typeof makeProjector>;

function line(proj: Projector, pts: V[], w: number, c: string, bias = 0): Prim {
  const pp = pts.map(proj);
  return { k: 'line', pts: pp.map((p) => p.at), w, c, d: pp.reduce((s, p) => s + p.z, 0) / pp.length + bias };
}

/**
 * A limb segment split into short pieces, each depth-sorted on its own. One long
 * piece sorts by its midpoint, so an arm crossing the torso flips in front of or
 * behind it all at once; short pieces sort where they actually are.
 */
function limb(proj: Projector, a: V, b: V, w: number, c: string, bias = 0, pieces = 3): Prim[] {
  return Array.from({ length: pieces }, (_, i) => line(proj, [lerp(a, b, i / pieces), lerp(a, b, (i + 1) / pieces)], w, c, bias));
}

type Capsule = [V, V, number]; // segment start, end, radius

function closestOnSegment(p: V, a: V, b: V): V {
  const ab = sub(b, a);
  const t = Math.max(0, Math.min(1, dot(sub(p, a), ab) / Math.max(dot(ab, ab), 1e-9)));
  return add(a, mul(ab, t));
}

/** Moves p out to the surface of any capsule it is inside, plus clearance. */
function keepOutside(p: V, capsules: Capsule[], clearance: number, fallback: V): V {
  let out = p;
  for (let pass = 0; pass < 2; pass++) {
    for (const [a, b, r] of capsules) {
      const q = closestOnSegment(out, a, b);
      const away = sub(out, q);
      const d = len(away);
      if (d < r + clearance) out = add(q, mul(d > 1e-6 ? mul(away, 1 / d) : fallback, r + clearance));
    }
  }
  return out;
}

function circle(proj: Projector, at: V, r: number, c: string, bias = 0): Prim {
  const p = proj(at);
  return { k: 'circle', at: p.at, r, c, d: p.z + bias };
}

/** Axis-aligned box with back faces culled and simple face shading. */
function box(proj: Projector, cam: Camera, min: V, max: V): Prim[] {
  const [x0, y0, z0] = min, [x1, y1, z1] = max;
  const faces: { n: V; pts: V[]; c: string }[] = [
    { n: [0, 1, 0], c: PROP_TOP, pts: [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]] },
    { n: [0, 0, 1], c: PROP_FRONT, pts: [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]] },
    { n: [0, 0, -1], c: PROP_FRONT, pts: [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]] },
    { n: [1, 0, 0], c: PROP_SIDE, pts: [[x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0]] },
    { n: [-1, 0, 0], c: PROP_SIDE, pts: [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]] },
  ];
  const facing = (n: V) => {
    const z1n = -n[0] * Math.sin(cam.yaw * RAD) + n[2] * Math.cos(cam.yaw * RAD);
    return n[1] * Math.sin(PITCH * RAD) + z1n * Math.cos(PITCH * RAD) > 0.01;
  };
  return faces.filter((f) => facing(f.n)).map((f) => {
    const pp = f.pts.map(proj);
    return { k: 'poly' as const, pts: pp.map((p) => p.at), c: f.c, d: pp.reduce((s, p) => s + p.z, 0) / 4 };
  });
}

// Office chair facing +z, its seat centred near z.
function chairPrims(proj: Projector, cam: Camera, z: number): Prim[] {
  const at = (x: number, y: number, dz: number): V => [x, y, z + dz];
  const prims: Prim[] = [
    ...box(proj, cam, [-19, 37, z - 15], [19, 41, z + 22]),
    ...box(proj, cam, [-17, 56, z - 20], [17, 96, z - 16]),
    line(proj, [at(0, 40, -15), at(0, 58, -18)], 4, PROP_LINE),
    line(proj, [at(0, 37, 3), at(0, 9, 3)], 4.5, PROP_LINE),
  ];
  for (let i = 0; i < 5; i++) {
    const ang = (90 + i * 72) * RAD;
    const foot = at(Math.cos(ang) * 22, 4, 3 + Math.sin(ang) * 22);
    prims.push(line(proj, [at(0, 9, 3), foot], 3.2, PROP_LINE));
    prims.push(circle(proj, [foot[0], 2.4, foot[2]], 2.4, PROP_LINE));
  }
  return prims;
}

function propPrims(proj: Projector, cam: Camera, prop: Prop): Prim[] {
  switch (prop.kind) {
    case 'desk': {
      const top = prop.height ?? 74;
      const z0 = prop.z, z1 = prop.z + 42;
      const legs: V[] = [[-42, 0, z0 + 3], [42, 0, z0 + 3], [-42, 0, z1 - 3], [42, 0, z1 - 3]];
      const prims = [
        ...legs.map((p) => line(proj, [p, [p[0], top - 4, p[2]]], 3.5, PROP_LINE)),
        ...box(proj, cam, [-46, top - 4, z0], [46, top, z1]),
      ];
      if (prop.monitor) {
        const mz = z0 + 30;
        prims.push(line(proj, [[0, top, mz + 2], [0, top + 12, mz + 2]], 3.5, PROP_LINE));
        prims.push(...box(proj, cam, [-20, top + 10, mz - 1], [20, top + 36, mz + 2]));
      }
      return prims;
    }
    case 'ledge':
      return box(proj, cam, [-18, 0, prop.z], [18, 46, prop.z + 30]);
    case 'wall':
      return box(proj, cam, [-70, 0, prop.z], [70, 176, prop.z + 6]);
    case 'chair-front':
      return chairPrims(proj, cam, prop.z);
    case 'doorway':
      return [
        ...box(proj, cam, [-45, 0, -10], [-38, 186, 2]),
        ...box(proj, cam, [38, 0, -10], [45, 186, 2]),
        ...box(proj, cam, [-45, 186, -10], [45, 193, 2]),
      ];
  }
}

// ─── Skeleton → primitives ───────────────────────────────────────────────────

function buildBody(f: Flat, seated: boolean, proj: Projector, blink: number): Prim[] {
  const g = (k: string) => f[k];
  const prims: Prim[] = [];
  const colliders: Capsule[] = [];

  const P: V = [g('pelvis.x'), (seated ? SEAT_HIP : STAND_HIP) + g('pelvis.y'), g('pelvis.z')];
  const hinge = rotX(g('torso.hinge'));
  const twist = g('torso.twist'), side = g('torso.side'), flex = g('torso.flex');
  const R1 = chain(hinge, rotY(twist * 0.4), rotZ(-side * 0.5), rotX(flex * 0.5));
  const R2 = chain(hinge, rotY(twist), rotZ(-side), rotX(flex));

  const M = add(P, apply(R1, [0, LUMBAR, 0]));
  const C = add(M, apply(R2, [0, CHEST, 0])); // neck base

  // Trunk: pants block at the hips, a capsule along the curved spine that gives
  // the body its depth side-on, and one smooth outline for its width head-on.
  prims.push(line(proj, [add(P, [-HIP_W, 0, 0]), add(P, [HIP_W, 0, 0])], 16, PANTS, -8)); // always under the shirt hem
  prims.push(line(proj, [add(P, apply(hinge, [0, 8, 0])), M, add(C, apply(R2, [0, -7, 0]))], 24, SHIRT, -4));
  const torsoEdge = (x: number): V[] => [
    add(P, apply(hinge, [x * 14, 2, 0])),
    add(M, apply(R1, [x * 12.5, 0, 0])),
    add(C, apply(R2, [x * 15, -14, 0])),
    add(C, apply(R2, [x * 16, -6, 0])),
    add(C, apply(R2, [x * 12, -1, 0])),
  ];
  const outline = [...torsoEdge(1), ...torsoEdge(-1).reverse()].map(proj);
  prims.push({ k: 'poly', pts: outline.map((q) => q.at), c: SHIRT, w: 5, d: outline.reduce((t, q) => t + q.z, 0) / outline.length - 3.95 });

  const shoulder = (s: number, arm: string): V =>
    add(C, apply(R2, [s * SHOULDER_W, -3 + g(`${arm}.sy`), g(`${arm}.sz`)]));
  const SL = shoulder(1, 'armL'), SR = shoulder(-1, 'armR');
  prims.push(line(proj, [SL, SR], 12, SHIRT, -3));

  // Head: neck, then a hair disc behind a slightly smaller face disc. Turning
  // the head slides the face toward the look direction and shows hair behind.
  const Rh = chain(R2, rotY(g('head.turn')), rotZ(-g('head.tilt')), rotX(g('head.nod')));
  const neckTop = add(add(C, apply(R2, [0, 0, g('head.z')])), apply(Rh, [0, 6, 0]));
  const Hc = add(neckTop, apply(Rh, [0, 11, 1]));
  prims.push(line(proj, [add(C, apply(R2, [0, -2, 0])), neckTop], 8.5, SKIN, -1));
  const faceC = add(Hc, apply(Rh, [0, -1.2, 2]));
  const face = circle(proj, faceC, 11.4, SKIN);
  const faceD = face.d;
  // Hair sits behind the face unless the head is turned away from the camera.
  const awayFromCamera = proj(add(faceC, apply(Rh, [0, 0, 1]))).z - proj(faceC).z < -0.3;
  const hair = circle(proj, add(Hc, apply(Rh, [0, 2.2, -2.4])), 13, HAIR);
  prims.push({ ...hair, d: faceD + (awayFromCamera ? 0.01 : -0.01) }, face);
  const facing = (local: V) => {
    const p = add(Hc, apply(Rh, local));
    const n = norm(sub(p, faceC));
    return proj(add(faceC, n)).z - proj(faceC).z;
  };
  const headPt = (local: V) => add(Hc, apply(Rh, local));
  const at = (local: V) => proj(headPt(local)).at;
  // Features use their true depth (never below the face disc) so hair tufts and
  // hands sort against them correctly from any angle.
  const depthOf = (local: V) => Math.max(faceD + 0.5, proj(headPt(local)).z);

  // Ears sit just behind the face disc, so they peek out head-on and turn into
  // view in profile. The nose matches the face, so it only shows in profile.
  for (const s of [1, -1]) {
    const ear = circle(proj, headPt([s * 11.2, 0.2, 0]), 2.7, SKIN);
    prims.push(ear);
    // The inner ear only shows once the ear turns toward the camera
    if (proj(headPt([s * 13, 0.2, 0])).z - ear.d > 1) {
      prims.push({ ...circle(proj, headPt([s * 11.6, 0.2, 0.3]), 1.2, SKIN_SHADE), d: ear.d + 0.01 });
    }
  }
  prims.push(circle(proj, headPt([0, -1.4, 11.8]), 1.9, SKIN));

  // Side-swept haircut: overlapping tufts along the hairline give a soft,
  // uneven outline instead of a helmet.
  const tufts: [V, number][] = [
    [[-4.5, 10.4, 5], 4.2], [[0.5, 11.4, 4.6], 4.4], [[5, 10.6, 3.8], 4],
    [[8.8, 8, 2], 3],
  ];
  // Fringe tufts overlap the face only when it faces the camera; side-on they
  // just round out the hair's outline from behind the face.
  const faceTowardCamera = proj(add(faceC, apply(Rh, [0, 0, 1]))).z - proj(faceC).z;
  tufts.forEach(([local, r], i) => {
    const tuft = circle(proj, headPt(local), r, HAIR);
    const d = awayFromCamera ? faceD + 0.02 : i < 3 && faceTowardCamera > 0.45 ? tuft.d : faceD - 0.005;
    prims.push({ ...tuft, d });
  });
  const brow = g('face.brow'), pinch = g('face.pinch'), smile = g('face.smile');
  const closed = Math.max(blink, g('face.lids'));

  const gx = g('face.gx') * 1.3, gy = g('face.gy') * 1.1;
  for (const s of [1, -1]) {
    const eye: V = [s * 4.2 + gx, 0.6 + gy, 10.3];
    if (facing(eye) <= 0.2) continue;
    if (closed > 0.75) {
      // Closed lids curve down slightly, like a relaxed sleeping eye
      prims.push({ k: 'curve', from: at([s * 4.2 - 1.6, 0.6, 10.2]), ctrl: at([s * 4.2, -0.4, 10.4]), to: at([s * 4.2 + 1.6, 0.6, 10.2]), w: 1.1, c: HAIR, d: depthOf(eye) });
    } else {
      prims.push({ k: 'ellipse', at: at(eye), rx: 1.5, ry: Math.max(0.3, 1.6 * (1 - closed)), c: HAIR, d: depthOf(eye) });
    }
    if (facing([s * 6.4, -2.6, 9.2]) > 0.3) {
      prims.push({ k: 'ellipse', at: at([s * 6.4, -2.6, 9.2]), rx: 2.3, ry: 1.4, c: CHEEK, d: depthOf([s * 6.4, -2.6, 9.2]) - 0.1 });
    }
    // Brows: height carries mood, the inner end dropping reads as effort
    const inner: V = [s * 2.1, 4.1 + brow * 1.2 - pinch * 1.1, 10.1];
    const outer: V = [s * 6.3, 3.8 + brow * 1.4 + pinch * 0.5, 9.1];
    const mid: V = [s * 4.2, 4.6 + brow * 1.4, 10];
    prims.push({ k: 'curve', from: at(inner), ctrl: at(mid), to: at(outer), w: 1.3, c: HAIR, d: depthOf(mid) });
  }

  if (facing([0, -4.6, 10.6]) > 0.35) {
    const open = g('face.open');
    const width = 1.9 + Math.max(0, smile) * 0.7 - open * 0.6;
    if (open > 0.15) {
      prims.push({ k: 'ellipse', at: at([0, -5, 10.4]), rx: width * 0.75, ry: 0.5 + open * 1.4, c: MOUTH, d: depthOf([0, -5, 10.4]) });
    } else {
      // Corners lift with a smile and press down a little with effort
      const corner = -4.8 + smile * 0.6;
      prims.push({ k: 'curve', from: at([-width, corner, 10.3]), ctrl: at([0, -4.8 - smile * 1.8, 10.6]), to: at([width, corner, 10.3]), w: 1.3, c: SKIN_SHADE, d: depthOf([0, -4.8, 10.6]) });
    }
  }

  // Legs: ankles live in world space so planted feet stay put.
  for (const [s, leg] of [[1, 'legL'], [-1, 'legR']] as const) {
    const H = add(P, [s * HIP_W, 0, 0]);
    const A: V = [s * g(`${leg}.x`), g(`${leg}.y`), g(`${leg}.z`)];
    const out = g(`${leg}.out`) * RAD;
    const [K, Ar] = solveIK(H, A, THIGH, SHIN, norm([s * Math.sin(out), 0.25, Math.cos(out)]));
    prims.push(...limb(proj, H, K, 13, PANTS));
    prims.push(...limb(proj, K, Ar, 11, PANTS));
    colliders.push([H, K, 6.5], [K, Ar, 5.5]);

    const pitch = g(`${leg}.pitch`) * RAD, yaw = g(`${leg}.yaw`) * RAD;
    const fd: V = [s * Math.sin(yaw) * Math.cos(pitch), -Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch)];
    const sole = add(Ar, [0, -2.5, 0]);
    prims.push(line(proj, [sub(sole, mul(fd, 2.5)), add(sole, mul(fd, 10))], 7.5, SHOE, 0.05));
  }

  // Hands can rest on the body but not sink into it: the chest, head, thighs
  // and shins push a hand target back out to their surface before the arm solves.
  colliders.push([P, M, 11.5], [M, add(C, apply(R2, [0, -6, 0])), 11.5], [Hc, Hc, 12]);

  // Arms
  const chestFwd = apply(R2, [0, 0, 1]);
  const chestUp = apply(R2, [0, 1, 0]);
  for (const [s, arm, S] of [[1, 'armL', SL], [-1, 'armR', SR]] as const) {
    const reach = (UPPER_ARM + FOREARM) * g(`${arm}.r`);
    const T = keepOutside(add(S, mul(apply(R2, dirOf(g(`${arm}.e`), g(`${arm}.a`), s)), reach)), colliders, 5, chestFwd);
    const pole = apply(R2, dirOf(g(`${arm}.pe`), g(`${arm}.pa`), s));
    const [E, W] = solveIK(S, T, UPPER_ARM, FOREARM, pole);

    // The sleeve reuses the upper arm's first two pieces exactly, so each sleeve
    // piece sorts with (just above) the skin piece it covers.
    prims.push(...limb(proj, S, E, 8.5, SKIN, 0, 4));
    prims.push(...limb(proj, S, lerp(S, E, 0.5), 10.5, SLEEVE, 0.05, 2));
    prims.push(...limb(proj, E, W, 7.5, SKIN));

    const follow = norm(sub(W, E));
    const absolute = apply(R2, dirOf(g(`${arm}.he`), g(`${arm}.ha`), s));
    const hd = norm(lerp(follow, absolute, g(`${arm}.hf`)));
    let b0 = sub(chestFwd, mul(hd, dot(chestFwd, hd)));
    if (len(b0) < 0.2) b0 = sub(chestUp, mul(hd, dot(chestUp, hd)));
    b0 = norm(b0);
    const b1 = mul(cross(b0, hd), s);
    const pron = g(`${arm}.pron`) * RAD;
    const thumbDir = add(mul(b0, Math.cos(pron)), mul(b1, Math.sin(pron)));

    const grip = g(`${arm}.grip`);
    const palmLen = 2 + 4.5 * (1 - grip);
    const base = add(W, mul(hd, 1.5));
    const tip = add(base, mul(hd, palmLen));
    // The palm is lighter than the back of the hand, which makes forearm rotation read.
    const palmN = mul(cross(thumbDir, hd), -s);
    const palmShows = proj(add(base, palmN)).z - proj(base).z > 0.15;
    const palm = line(proj, [base, tip], 8, palmShows ? PALM : SKIN, 0.1);
    prims.push(palm);
    prims.push(circle(proj, add(add(W, mul(hd, 2.5)), mul(thumbDir, 3.8)), 2.1, SKIN));

    // Spread fingers fan out in screen space from the end of the palm.
    const spread = Math.max(0, 1 - grip / 0.4);
    if (spread > 0.02) {
      const a2 = proj(base).at, b2 = proj(tip).at;
      const dx = b2[0] - a2[0], dy = b2[1] - a2[1];
      const base2 = Math.atan2(dy, dx);
      for (const k of [-1.5, -0.5, 0.5, 1.5]) {
        const ang = base2 + k * 17 * spread * RAD;
        const l = 7 * spread;
        prims.push({
          k: 'line', w: 2.4, c: palm.c, d: palm.d + 0.01,
          pts: [b2, [b2[0] + Math.cos(ang) * l, b2[1] + Math.sin(ang) * l]],
        });
      }
    }
  }

  return prims;
}

function render(f: Flat, clip: Clip, blink: number): Prim[] {
  const cam: Camera = { yaw: clip.yaw ?? 0, shift: clip.shift ?? 0 };
  const proj = makeProjector(cam);
  const bySortedDepth = (a: Prim, b: Prim) => a.d - b.d;

  const shadowAt = proj([f['pelvis.x'], 0, f['pelvis.z'] + (clip.seated ? 20 : 0)]);
  const shadow: Prim = { k: 'ellipse', at: shadowAt.at, rx: 36, ry: 36 * Math.sin(PITCH * RAD), c: SHADOW, d: 0 };

  const props: Prim[] = [];
  if (clip.seated) props.push(...chairPrims(proj, cam, 0));
  for (const p of clip.props ?? []) props.push(...propPrims(proj, cam, p));

  return [
    shadow,
    ...props.sort(bySortedDepth),
    ...buildBody(f, !!clip.seated, proj, blink).sort(bySortedDepth),
  ];
}

// ─── Component ───────────────────────────────────────────────────────────────

interface Props {
  clip: Clip;
  /** Show the first pose (or rest) with no motion at all, e.g. for cognitive exercises. */
  static?: boolean;
}

export function FigureRig({ clip, static: isStatic }: Props) {
  const rest = clip.seated ? SEATED : STANDING;
  const [prims, setPrims] = useState<Prim[]>(() =>
    render(targetFlat(rest, clip.poses[0]?.target ?? {}), clip, 0),
  );

  useEffect(() => {
    const restPose = clip.seated ? SEATED : STANDING;
    const targets = clip.poses.map((p) => targetFlat(restPose, p.target));
    const total = clip.poses.reduce((s, p) => s + p.durationMs, 0);
    if (isStatic || total <= 0) {
      setPrims(render(targets[0] ?? flatten(restPose), clip, 0));
      return;
    }

    const state: Record<string, { pos: number; vel: number }> = {};
    for (const [k, v] of Object.entries(flatten(restPose))) state[k] = { pos: v, vel: 0 };

    let rafId: number;
    let prev: number | null = null;
    let t0: number | null = null;
    let nextBlinkAt: number | null = null;
    let blinkAt = -1e9;
    let doubleBlink = false;

    function frame(now: number) {
      t0 ??= now;
      const dt = Math.min((now - (prev ?? now)) / 1000, 0.05);
      prev = now;

      let t = (now - t0) % total;
      let i = 0;
      while (t >= clip.poses[i].durationMs) t -= clip.poses[i++].durationMs;
      const target = targets[i];

      for (const k in state) {
        const s = state[k];
        [s.pos, s.vel] = smoothDamp(s.pos, target[k], s.vel, smoothTimeFor(k), dt);
      }

      // Breathing and a slow weight shift layered on top so the figure never freezes.
      const breath = Math.sin((now / 4200) * Math.PI * 2);
      const f: Flat = {};
      for (const k in state) f[k] = state[k].pos;
      f['torso.flex'] -= breath * 1.1;
      f['armL.sy'] += breath * 0.7;
      f['armR.sy'] += breath * 0.7;
      if (!clip.seated) f['pelvis.x'] += Math.sin((now / 6100) * Math.PI * 2) * 0.8;
      // A foot travelling along the floor lifts, so repositioning reads as a step, not a slide.
      for (const leg of ['legL', 'legR']) {
        const speed = Math.hypot(state[`${leg}.x`].vel, state[`${leg}.z`].vel);
        f[`${leg}.y`] += Math.min(8, speed * 0.15);
      }

      // Open each clip with a quick glance and smile at the viewer
      const sinceStart = now - t0;
      if (sinceStart < 1800) {
        const w = Math.sin((sinceStart / 1800) * Math.PI);
        const toCamera = Math.max(-55, Math.min(55, -(clip.yaw ?? 0) - f['torso.twist']));
        f['head.turn'] += (toCamera - f['head.turn']) * w * 0.8;
        // The eyes cover whatever the head turn leaves
        f['face.gx'] += (Math.max(-1, Math.min(1, (toCamera - f['head.turn']) / 30)) - f['face.gx']) * w;
        f['face.gy'] += (0 - f['face.gy']) * w;
        f['face.smile'] += (0.9 - f['face.smile']) * w;
        f['face.brow'] += (0.5 - f['face.brow']) * w;
      }

      // Blinks on an irregular rhythm, now and then a double blink
      nextBlinkAt ??= now + 1200;
      if (now >= nextBlinkAt) {
        blinkAt = now;
        doubleBlink = Math.random() < 0.2;
        nextBlinkAt = now + 2400 + Math.random() * 3600;
      }
      const lidPulse = (x: number) => (x >= 0 && x < 170 ? Math.sin((x / 170) * Math.PI) : 0);
      const blink = lidPulse(now - blinkAt) + (doubleBlink ? lidPulse(now - blinkAt - 280) : 0);

      setPrims(render(f, clip, blink));
      rafId = requestAnimationFrame(frame);
    }

    rafId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafId);
  }, [clip, isStatic]);

  return (
    <svg viewBox="-100 -192 200 210" width="200" height="210" aria-hidden="true" style={{ overflow: 'visible' }}>
      {prims.map((p, i) => {
        switch (p.k) {
          case 'line':
            return (
              <polyline
                key={i}
                points={p.pts.map((q) => `${q[0].toFixed(2)},${q[1].toFixed(2)}`).join(' ')}
                style={{ fill: 'none', stroke: p.c }}
                strokeWidth={p.w}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            );
          case 'circle':
            return <circle key={i} cx={p.at[0]} cy={p.at[1]} r={p.r} style={{ fill: p.c }} />;
          case 'ellipse':
            return <ellipse key={i} cx={p.at[0]} cy={p.at[1]} rx={p.rx} ry={p.ry} style={{ fill: p.c }} />;
          case 'curve':
            return (
              <path
                key={i}
                d={`M${p.from[0].toFixed(2)},${p.from[1].toFixed(2)} Q${p.ctrl[0].toFixed(2)},${p.ctrl[1].toFixed(2)} ${p.to[0].toFixed(2)},${p.to[1].toFixed(2)}`}
                style={{ fill: 'none', stroke: p.c }}
                strokeWidth={p.w}
                strokeLinecap="round"
              />
            );
          case 'poly':
            return (
              <polygon
                key={i}
                points={p.pts.map((q) => `${q[0].toFixed(2)},${q[1].toFixed(2)}`).join(' ')}
                style={{ fill: p.c, stroke: p.c }}
                strokeWidth={p.w ?? 0.8}
                strokeLinejoin="round"
              />
            );
        }
      })}
    </svg>
  );
}
