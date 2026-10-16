import { describe, expect, it } from 'vitest';
import { suggestPosture } from './posture';

const at = (minutesIn: number, extra: Partial<Parameters<typeof suggestPosture>[0]> = {}) =>
  suggestPosture({ posture: 'sitting', minutesIn, problemAreas: [], hour: 10, ...extra });

describe('suggestPosture', () => {
  it('stays quiet until 45 minutes of sitting', () => {
    expect(at(44)).toBeNull();
    expect(at(45)?.to).toBe('standing');
  });

  it('suggests standing sooner for a sore back', () => {
    expect(at(30, { problemAreas: ['back'] })?.to).toBe('standing');
    expect(at(29, { problemAreas: ['back'] })).toBeNull();
  });

  it('nudges earlier in the after-lunch slump', () => {
    expect(at(35, { hour: 14 })?.to).toBe('standing');
    expect(at(35, { hour: 16 })).toBeNull();
  });

  it('sends people back to sitting after 30 minutes standing, 20 with sore legs', () => {
    expect(at(29, { posture: 'standing' })).toBeNull();
    expect(at(30, { posture: 'standing' })?.to).toBe('sitting');
    expect(at(20, { posture: 'standing', problemAreas: ['legs'] })?.to).toBe('sitting');
  });

  it('mentions the minutes in its message', () => {
    expect(at(52)?.message).toContain('52 min');
  });
});
