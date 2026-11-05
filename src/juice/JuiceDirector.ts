import { FlowLoopId, HapticPatternId, TwinePassage } from '../core/schema';

export type JuiceEventMap = {
  FLOW_CROSSFADE: { loopId: FlowLoopId; isProtectedOverride: boolean };
  AUDIO_CUE: { cueId: string; muffleDreamFilter: boolean };
  VIGNETTE_SHIFT: { intensity: number };
  ANCHOR_STATE_CHANGE: { held: boolean };
  PASSAGE_ENTERED: { passage: TwinePassage };
};

type Listener<K extends keyof JuiceEventMap> = (payload: JuiceEventMap[K]) => void;

const HAPTIC_PATTERNS: Record<HapticPatternId, number[]> = {
  heartbeat_slow: [40, 120, 60, 750],
  heartbeat_panic: [50, 80, 70, 220, 50, 80, 70, 220],
  dread_throb: [120, 90, 180],
  iron_grip: [18, 35, 12],
};

class JuiceDirectorEngine {
  private listeners: { [K in keyof JuiceEventMap]?: Set<Listener<any>> } = {};
  private anchorHeld = false;
  private activePassageLoop: FlowLoopId = 'bodima_rain_window';
  private activeAudioCue = 'monsoon_light';

  public on<K extends keyof JuiceEventMap>(event: K, fn: Listener<K>): () => void {
    if (!this.listeners[event]) {
      this.listeners[event] = new Set();
    }
    this.listeners[event]!.add(fn);
    return () => this.listeners[event]?.delete(fn);
  }

  private emit<K extends keyof JuiceEventMap>(event: K, payload: JuiceEventMap[K]): void {
    this.listeners[event]?.forEach((fn) => fn(payload));
  }

  public isAnchorHeld(): boolean {
    return this.anchorHeld;
  }

  public enterPassage(passage: TwinePassage, currentBalma: number): void {
    const { directives } = passage;

    if (directives.flow) {
      this.activePassageLoop = directives.flow;
      this.emit('FLOW_CROSSFADE', {
        loopId: this.anchorHeld ? 'pahana_steady' : this.activePassageLoop,
        isProtectedOverride: this.anchorHeld,
      });
    }

    if (directives.audio) {
      this.activeAudioCue = directives.audio;
      this.emit('AUDIO_CUE', {
        cueId: this.activeAudioCue,
        muffleDreamFilter: !this.anchorHeld && currentBalma >= 50,
      });
    }

    if (directives.haptic) {
      this.triggerHaptic(directives.haptic);
    }

    const calculatedVignette = directives.vignette ?? Math.min(0.88, 0.35 + currentBalma * 0.005);
    this.emit('VIGNETTE_SHIFT', {
      intensity: this.anchorHeld ? Math.max(0.25, calculatedVignette - 0.25) : calculatedVignette,
    });

    this.emit('PASSAGE_ENTERED', { passage });
  }

  public setAnchorHeld(held: boolean): void {
    if (this.anchorHeld === held) return;
    this.anchorHeld = held;

    if (held) {
      this.triggerHaptic('iron_grip');
      this.emit('FLOW_CROSSFADE', { loopId: 'pahana_steady', isProtectedOverride: true });
      this.emit('AUDIO_CUE', { cueId: this.activeAudioCue, muffleDreamFilter: false });
    } else {
      this.emit('FLOW_CROSSFADE', { loopId: this.activePassageLoop, isProtectedOverride: false });
    }

    this.emit('ANCHOR_STATE_CHANGE', { held });
  }

  public triggerHaptic(patternId: HapticPatternId): void {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(HAPTIC_PATTERNS[patternId]);
      } catch {
        // Ignore on desktop browsers blocking vibration API
      }
    }
  }
}

export const juiceDirector = new JuiceDirectorEngine();
