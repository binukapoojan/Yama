import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { HapticPatternId } from '../core/schema';

const WEB_VIBRATE_PATTERNS: Record<HapticPatternId, number[]> = {
  heartbeat_slow: [40, 120, 60, 750],
  heartbeat_panic: [50, 80, 70, 220, 50, 80, 70, 220],
  dread_throb: [120, 90, 180],
  iron_grip: [18, 35, 12],
  stylus_scratch: [14],
};

class HapticController {
  private readonly isNative = Capacitor.isNativePlatform();
  private anchorPulseTimer: ReturnType<typeof setInterval> | null = null;
  private stepTimers: Set<ReturnType<typeof setTimeout>> = new Set();

  public async trigger(patternId: HapticPatternId): Promise<void> {
    this.clearSequenceTimers();

    if (!this.isNative) {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(WEB_VIBRATE_PATTERNS[patternId]);
        } catch {
          // Ignore on desktop browsers
        }
      }
      return;
    }

    try {
      switch (patternId) {
        case 'stylus_scratch':
          await Haptics.impact({ style: ImpactStyle.Light });
          break;
        case 'iron_grip':
          await Haptics.impact({ style: ImpactStyle.Medium });
          break;
        case 'dread_throb':
          await Haptics.notification({ type: NotificationType.Warning });
          this.scheduleNativeImpact(140, ImpactStyle.Heavy);
          break;
        case 'heartbeat_slow':
          await Haptics.impact({ style: ImpactStyle.Light });
          this.scheduleNativeImpact(135, ImpactStyle.Heavy);
          break;
        case 'heartbeat_panic':
          await Haptics.impact({ style: ImpactStyle.Medium });
          this.scheduleNativeImpact(95, ImpactStyle.Heavy);
          this.scheduleNativeImpact(340, ImpactStyle.Medium);
          this.scheduleNativeImpact(435, ImpactStyle.Heavy);
          break;
      }
    } catch {
      // Fallback if device lacks actuator
    }
  }

  public setAnchorHoldLoop(held: boolean): void {
    if (this.anchorPulseTimer) {
      clearInterval(this.anchorPulseTimer);
      this.anchorPulseTimer = null;
    }
    if (!held) return;

    this.trigger('iron_grip');
    this.anchorPulseTimer = setInterval(() => {
      if (this.isNative) {
        Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
      } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(14);
        } catch {}
      }
    }, 1400);
  }

  private scheduleNativeImpact(delayMs: number, style: ImpactStyle): void {
    const t = setTimeout(() => {
      Haptics.impact({ style }).catch(() => {});
    }, delayMs);
    this.stepTimers.add(t);
  }

  private clearSequenceTimers(): void {
    this.stepTimers.forEach(clearTimeout);
    this.stepTimers.clear();
  }
}

export const hapticEngine = new HapticController();
