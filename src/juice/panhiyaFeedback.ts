// src/juice/panhiyaFeedback.ts
import { audioMixer } from './audioMixer';
import { juiceDirector } from './JuiceDirector';
import { wardFatigue } from './wardFatigue';

export function triggerPanhiyaScratch(): void {
  const heat = wardFatigue.getSnapshot().heat / 100;
  audioMixer.playStylusScratch(heat);
  juiceDirector.triggerHaptic('stylus_scratch');
}

export const triggerStylusScratch = triggerPanhiyaScratch;

const INTERACTIVE_SELECTOR = 'button:not(:disabled), [role="button"], .incised-trigger, .cursor-pointer';

export function initGlobalPanhiyaListener(): () => void {
  if (typeof window === 'undefined') return () => {};
  let lastX = 0;
  let lastY = 0;
  let lastScratchTime = 0;

  const onPointerDown = (e: PointerEvent) => {
    const el = e.target instanceof Element ? e.target.closest(INTERACTIVE_SELECTOR) : null;
    if (el && !el.hasAttribute('disabled')) {
      triggerPanhiyaScratch();
    }
    lastX = e.clientX;
    lastY = e.clientY;
  };

  const onPointerMove = (e: PointerEvent) => {
    if (e.buttons !== 1) {
      lastX = e.clientX;
      lastY = e.clientY;
      return;
    }
    const dist = Math.hypot(e.clientX - lastX, e.clientY - lastY);
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (dist >= 6 && now - lastScratchTime >= 75) {
      lastScratchTime = now;
      lastX = e.clientX;
      lastY = e.clientY;
      triggerPanhiyaScratch();
    }
  };

  window.addEventListener('pointerdown', onPointerDown, { passive: true });
  window.addEventListener('pointermove', onPointerMove, { passive: true });

  return () => {
    window.removeEventListener('pointerdown', onPointerDown);
    window.removeEventListener('pointermove', onPointerMove);
  };
}
