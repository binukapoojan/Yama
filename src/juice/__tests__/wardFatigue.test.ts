// src/juice/__tests__/wardFatigue.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { juiceDirector } from '../JuiceDirector';
import { wardFatigue } from '../wardFatigue';

describe('Cold Iron Ward Thermal Fatigue (Yakada Gini)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    wardFatigue.reset();
  });

  afterEach(() => {
    wardFatigue.reset();
    vi.useRealTimers();
  });

  it('engages anchor immediately on requestHold and accumulates heat over time', () => {
    const ok = wardFatigue.requestHold();
    expect(ok).toBe(true);
    expect(juiceDirector.isAnchorHeld()).toBe(true);

    vi.advanceTimersByTime(3000); // 50% of 6000ms capacity
    const snap = wardFatigue.getSnapshot();
    expect(snap.heat).toBeGreaterThanOrEqual(48);
    expect(snap.heat).toBeLessThanOrEqual(52);
    expect(snap.scalded).toBe(false);
  });

  it('scalds the player palm at 6000ms, severing the ward and locking out re-holds for 3000ms', () => {
    wardFatigue.requestHold();
    vi.advanceTimersByTime(6100);

    const scaldedSnap = wardFatigue.getSnapshot();
    expect(scaldedSnap.scalded).toBe(true);
    expect(scaldedSnap.holding).toBe(false);
    expect(juiceDirector.isAnchorHeld()).toBe(false);

    // Attempting to re-hold while scalded must fail
    expect(wardFatigue.requestHold()).toBe(false);
    expect(juiceDirector.isAnchorHeld()).toBe(false);

    // After 3000ms cooldown, scald clears and ward can be held again
    vi.advanceTimersByTime(3100);
    expect(wardFatigue.getSnapshot().scalded).toBe(false);
    expect(wardFatigue.getSnapshot().heat).toBe(0);
    expect(wardFatigue.requestHold()).toBe(true);
  });

  it('cools down smoothly when released before overheating', () => {
    wardFatigue.requestHold();
    vi.advanceTimersByTime(2400);
    expect(wardFatigue.getSnapshot().heat).toBeGreaterThan(35);

    wardFatigue.releaseHold();
    expect(juiceDirector.isAnchorHeld()).toBe(false);

    vi.advanceTimersByTime(4000);
    expect(wardFatigue.getSnapshot().heat).toBe(0);
  });

  it('vents heat when sacred mantra verses are consecrated', () => {
    wardFatigue.requestHold();
    vi.advanceTimersByTime(3000);
    const beforeVent = wardFatigue.getSnapshot().heat;
    expect(beforeVent).toBeGreaterThanOrEqual(48);

    wardFatigue.ventHeat(40);
    const afterVent = wardFatigue.getSnapshot().heat;
    expect(afterVent).toBeLessThanOrEqual(15);
  });
});
