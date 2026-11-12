// src/juice/wardFatigue.ts
import { audioMixer } from './audioMixer';
import { juiceDirector } from './JuiceDirector';

export interface WardFatigueSnapshot {
  heat: number; scalded: boolean; holding: boolean;
}

type FatigueListener = (snapshot: WardFatigueSnapshot) => void;

const MAX_HOLD_MS = 6000;
const COOL_NORMAL_MS = 3800;
const SCALD_LOCKOUT_MS = 3000;
const TICK_MS = 50;

class WardFatigueController {
  private heat = 0; private scalded = false; private holding = false; private warnedHighHeat = false;
  private timer: ReturnType<typeof setInterval> | null = null;
  private listeners: Set<FatigueListener> = new Set();

  private ensureLoop(): void {
    if (!this.timer) this.timer = setInterval(() => this.tick(), TICK_MS);
  }

  private tick(): void {
    if (this.holding && !this.scalded) {
      this.heat = Math.min(100, this.heat + (TICK_MS / MAX_HOLD_MS) * 100);
      if (this.heat >= 75 && !this.warnedHighHeat) {
        this.warnedHighHeat = true;
        juiceDirector.triggerHaptic('heartbeat_panic');
        audioMixer.playArterialPulse(0.65, true);
      }
      if (this.heat >= 100) this.triggerScaldRupture();
      this.emit();
      return;
    }
    if (this.heat > 0) {
      const coolWindow = this.scalded ? SCALD_LOCKOUT_MS : COOL_NORMAL_MS;
      this.heat = Math.max(0, this.heat - (TICK_MS / coolWindow) * 100);
      if (this.heat === 0 && this.scalded) {
        this.scalded = false;
        this.warnedHighHeat = false;
      }
      this.emit();
    } else if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private triggerScaldRupture(): void {
    this.holding = false;
    this.scalded = true;
    this.heat = 100;
    juiceDirector.setAnchorHeld(false);
    juiceDirector.triggerHaptic('dread_throb');
    audioMixer.playArterialPulse(1.0);
  }

  public requestHold(): boolean {
    if (this.scalded) { juiceDirector.triggerHaptic('dread_throb'); return false; }
    if (this.holding) return true;
    this.holding = true;
    juiceDirector.setAnchorHeld(true);
    this.ensureLoop();
    this.emit();
    return true;
  }

  public releaseHold(): void {
    if (!this.holding) return;
    this.holding = false;
    this.warnedHighHeat = false;
    juiceDirector.setAnchorHeld(false);
    this.ensureLoop();
    this.emit();
  }

  public ventHeat(amount = 35): void {
    this.heat = Math.max(0, this.heat - amount);
    this.emit();
  }

  public reset(): void {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
    this.heat = 0; this.scalded = false; this.holding = false; this.warnedHighHeat = false;
    juiceDirector.setAnchorHeld(false);
    this.emit();
  }

  public getSnapshot(): WardFatigueSnapshot {
    return { heat: this.heat, scalded: this.scalded, holding: this.holding };
  }

  public subscribe(fn: FatigueListener): () => void {
    this.listeners.add(fn);
    fn(this.getSnapshot());
    return () => this.listeners.delete(fn);
  }

  private emit(): void {
    const snap = this.getSnapshot();
    this.listeners.forEach((fn) => fn(snap));
  }
}

export const wardFatigue = new WardFatigueController();
