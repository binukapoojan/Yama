// @vitest-environment jsdom
// src/juice/__tests__/panhiyaDelegation.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { audioMixer } from '../audioMixer';
import { juiceDirector } from '../JuiceDirector';
import { initGlobalPanhiyaListener } from '../panhiyaFeedback';

describe('Global Delegated Panhiya Listener & Drag-Shear Cadence', () => {
  let unsub: () => void;
  let playScratchSpy: any;
  let hapticSpy: any;

  beforeEach(() => {
    playScratchSpy = vi.spyOn(audioMixer, 'playStylusScratch').mockImplementation(() => {});
    hapticSpy = vi.spyOn(juiceDirector, 'triggerHaptic').mockImplementation(() => {});
    unsub = initGlobalPanhiyaListener();
  });

  afterEach(() => {
    if (unsub) unsub();
    playScratchSpy.mockRestore();
    hapticSpy.mockRestore();
    document.body.innerHTML = '';
  });

  it('triggers scratch on pointerdown on interactive buttons', () => {
    const btn = document.createElement('button');
    btn.className = 'incised-trigger';
    document.body.appendChild(btn);

    const event = new PointerEvent('pointerdown', { bubbles: true });
    btn.dispatchEvent(event);

    expect(playScratchSpy).toHaveBeenCalledTimes(1);
    expect(hapticSpy).toHaveBeenCalledWith('stylus_scratch');
  });

  it('ignores pointerdown on disabled buttons', () => {
    const btn = document.createElement('button');
    btn.setAttribute('disabled', 'true');
    document.body.appendChild(btn);

    const event = new PointerEvent('pointerdown', { bubbles: true });
    btn.dispatchEvent(event);

    expect(playScratchSpy).not.toHaveBeenCalled();
  });

  it('throttles drag-shear cadence on pointermove with buttons === 1', () => {
    let nowTime = 1000;
    vi.spyOn(performance, 'now').mockImplementation(() => nowTime);

    // Initial click
    window.dispatchEvent(new PointerEvent('pointerdown', { clientX: 10, clientY: 10, bubbles: true }));
    expect(playScratchSpy).toHaveBeenCalledTimes(0);

    // Drag 12px immediately (t = 1000)
    window.dispatchEvent(new PointerEvent('pointermove', { clientX: 22, clientY: 10, buttons: 1, bubbles: true }));
    expect(playScratchSpy).toHaveBeenCalledTimes(1);

    // Move again immediately (t = 1020, < 75ms elapsed) -> should throttle
    nowTime = 1020;
    window.dispatchEvent(new PointerEvent('pointermove', { clientX: 35, clientY: 10, buttons: 1, bubbles: true }));
    expect(playScratchSpy).toHaveBeenCalledTimes(1);

    // Move after 80ms (t = 1085, >= 75ms elapsed and dist >= 6) -> fires
    nowTime = 1085;
    window.dispatchEvent(new PointerEvent('pointermove', { clientX: 45, clientY: 10, buttons: 1, bubbles: true }));
    expect(playScratchSpy).toHaveBeenCalledTimes(2);

    vi.restoreAllMocks();
  });

  it('removes listeners on unmount cleanup', () => {
    unsub();
    const btn = document.createElement('button');
    document.body.appendChild(btn);
    btn.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));

    expect(playScratchSpy).not.toHaveBeenCalled();
  });
});
