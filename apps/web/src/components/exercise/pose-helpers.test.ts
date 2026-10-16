import { describe, expect, it } from 'vitest';
import { merge, mirror } from './FigureRig';

describe('mirror', () => {
  it('swaps sides and flips lateral values', () => {
    const m = mirror({ armR: { e: 150 }, legL: { z: 20 }, torso: { side: 12, twist: -30, flex: 5 }, head: { tilt: 8 }, face: { gx: 0.6, gy: 0.2 } });
    expect(m.armL).toEqual({ e: 150 });
    expect(m.armR).toBeUndefined();
    expect(m.legR).toEqual({ z: 20 });
    expect(m.torso).toEqual({ side: -12, twist: 30, flex: 5 });
    expect(m.head).toEqual({ tilt: -8 });
    expect(m.face).toEqual({ gx: -0.6, gy: 0.2 });
  });

  it('is its own inverse', () => {
    const t = { torso: { side: 10 }, armL: { a: 90 }, face: { gx: 0.3 } };
    expect(mirror(mirror(t))).toMatchObject(t);
  });
});

describe('merge', () => {
  it('merges per group, later targets winning', () => {
    expect(merge({ face: { smile: 0.2, brow: 0.1 } }, { face: { smile: 0.9 } }, { head: { nod: 4 } }))
      .toEqual({ face: { smile: 0.9, brow: 0.1 }, head: { nod: 4 } });
  });
});
