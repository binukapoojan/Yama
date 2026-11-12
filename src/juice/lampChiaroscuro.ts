// src/juice/lampChiaroscuro.ts
import { FlowLoopId } from '../core/schema';
import { juiceDirector } from './JuiceDirector';
import { spatialPanner } from './spatialPanner';

const DREAD_DRAFT_LOOPS = new Set<FlowLoopId>([
  'pahana_nil_manel',
  'mohini_saree_silhouette',
  'wadamal_blood_hedge',
  'sohon_boar_silhouette',
]);

class LampChiaroscuroController {
  private targetX = 50;
  private targetY = 42;
  private currentX = 50;
  private currentY = 42;
  private baseDarkness = 0.65;
  private isProtected = false;
  private isDraftActive = false;
  private activeLoop: FlowLoopId = 'bodima_rain_window';
  private rafId: number | null = null;
  private unsubscribers: Array<() => void> = [];

  public start(): void {
    if (this.rafId !== null || typeof window === 'undefined') return;
    window.addEventListener('pointermove', this.handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', this.handlePointerMove, { passive: true });

    this.unsubscribers.push(
      juiceDirector.on('VIGNETTE_SHIFT', ({ intensity }) => { this.baseDarkness = intensity; }),
      juiceDirector.on('ANCHOR_STATE_CHANGE', ({ held }) => { this.isProtected = held; }),
      juiceDirector.on('FLOW_CROSSFADE', ({ loopId, isProtectedOverride }) => {
        this.activeLoop = loopId;
        this.isDraftActive = DREAD_DRAFT_LOOPS.has(loopId) && !isProtectedOverride;
      })
    );

    const tick = (timestamp: number) => {
      this.updateStep(timestamp);
      this.rafId = window.requestAnimationFrame(tick);
    };
    this.rafId = window.requestAnimationFrame(tick);
  }

  private handlePointerMove = (e: PointerEvent): void => {
    const normX = e.clientX / Math.max(1, window.innerWidth);
    const normY = e.clientY / Math.max(1, window.innerHeight);
    this.targetX = Math.max(8, Math.min(92, normX * 100));
    this.targetY = Math.max(8, Math.min(92, normY * 100));
    spatialPanner.setLampPosition(normX, normY);
  };

  private updateStep(t: number): void {
    const wickJitterX = Math.sin(t * 0.0065) * 0.45 + Math.cos(t * 0.017) * 0.25;
    const wickJitterY = Math.cos(t * 0.0055) * 0.35;
    const draftPullX = this.isDraftActive && !this.isProtected ? Math.sin(t * 0.0028) * 5.8 - 4.4 : 0;

    this.currentX += (this.targetX + draftPullX - this.currentX) * 0.075;
    this.currentY += (this.targetY - this.currentY) * 0.075;

    const breathRadius = Math.sin(t * 0.004) * 1.8 + Math.cos(t * 0.013) * 0.9;
    const baseRadius = this.isProtected ? 54 : this.isDraftActive ? 28 : 40;
    const finalRadius = Math.max(20, baseRadius + breathRadius);
    const isCrimson = this.activeLoop === 'wadamal_blood_hedge';

    const root = document.documentElement.style;
    root.setProperty('--lamp-x', `${(this.currentX + wickJitterX).toFixed(2)}%`);
    root.setProperty('--lamp-y', `${(this.currentY + wickJitterY).toFixed(2)}%`);
    root.setProperty('--lamp-radius', `${finalRadius.toFixed(2)}vmax`);
    root.setProperty('--lamp-darkness', `${this.baseDarkness.toFixed(3)}`);
    root.setProperty(
      '--lamp-core-color',
      this.isProtected
        ? 'rgba(212, 155, 39, 0.16)'
        : isCrimson
          ? 'rgba(140, 29, 36, 0.20)'
          : this.isDraftActive
            ? 'rgba(59, 77, 122, 0.18)'
            : 'rgba(200, 150, 62, 0.09)'
    );
  }

  public stop(): void {
    if (typeof window !== 'undefined') {
      if (this.rafId !== null) { window.cancelAnimationFrame(this.rafId); this.rafId = null; }
      window.removeEventListener('pointermove', this.handlePointerMove);
      window.removeEventListener('pointerdown', this.handlePointerMove);
    }
    this.unsubscribers.forEach((fn) => fn());
    this.unsubscribers = [];
  }
}

export const lampChiaroscuro = new LampChiaroscuroController();
