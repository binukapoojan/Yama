// src/juice/__tests__/spatialPanner.test.ts
import { describe, expect, it, vi } from 'vitest';
import { spatialPanner } from '../spatialPanner';

describe('Cursor-Opposite 3D Binaural Panner & Systolic Ducking', () => {
  it('pans whispers to the right (+pan) when the player holds the lamp on the left', () => {
    const snap = spatialPanner.setLampPosition(0.15, 0.5);
    expect(snap.lampX).toBe(0.15);
    expect(snap.oppositePan).toBeGreaterThan(0.5);
  });

  it('pans whispers to the left (-pan) when the player holds the lamp on the right', () => {
    const snap = spatialPanner.setLampPosition(0.88, 0.5);
    expect(snap.lampX).toBe(0.88);
    expect(snap.oppositePan).toBeLessThan(-0.5);
  });

  it('maintains a minimum stereo separation even when the lamp is dead-center', () => {
    const snap = spatialPanner.setLampPosition(0.5, 0.5);
    expect(Math.abs(snap.oppositePan)).toBeGreaterThanOrEqual(0.35);
  });

  it('ducks environmental stem gains during a systolic heartbeat pulse and ramps back up', () => {
    const setValueAtTime = vi.fn();
    const exponentialRampToValueAtTime = vi.fn();
    const cancelScheduledValues = vi.fn();
    const mockGain = {
      gain: { setValueAtTime, exponentialRampToValueAtTime, cancelScheduledValues },
    } as unknown as GainNode;
    const mockCtx = { currentTime: 2.0 } as unknown as AudioContext;

    spatialPanner.triggerSystolicDuck(mockCtx, [{ node: mockGain, baseGain: 0.25 }], 0.8);
    expect(cancelScheduledValues).toHaveBeenCalledWith(2.0);
    expect(setValueAtTime).toHaveBeenCalledWith(expect.closeTo(0.13, 2), 2.0);
    expect(exponentialRampToValueAtTime).toHaveBeenCalledWith(0.25, 2.18);
  });
});
