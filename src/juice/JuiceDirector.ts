// src/juice/JuiceDirector.ts
import { FlowLoopId, HapticPatternId, TwinePassage } from '../core/schema';
import { audioMixer } from './audioMixer';
import { hapticEngine } from './hapticEngine';

export type JuiceEventMap = {
  FLOW_CROSSFADE: { loopId: FlowLoopId; isProtectedOverride: boolean };
  AUDIO_CUE: { cueId: string; muffleDreamFilter: boolean };
  VIGNETTE_SHIFT: { intensity: number };
  ANCHOR_STATE_CHANGE: { held: boolean };
  PASSAGE_ENTERED: { passage: TwinePassage };
};

type Listener<K extends keyof JuiceEventMap> = (payload: JuiceEventMap[K]) => void;

const WEEPING_PASSAGES = new Set(['Three_Wheeler_Wait', 'Bamboo_Culvert_Approach', 'Weeping_By_The_Wall', 'Look_Into_Her_Eyes']);
const INFANT_PASSAGES = new Set(['Cross_Road_Verge', 'The_Slipping_Saree_Plea', 'The_Infant_Drop_Trap', 'Outcome_Athura_Mohini_Bound']);
const CLIMAX_DRUM_PASSAGES = new Set([
  'Sleep_Paralysis_Weight', 'Midnight_Samayama_Confrontation', 'The_Infant_Drop_Trap', 'Midnight_Kesel_Kanda_Severance',
  'Red_Bull_Apparition', 'Midnight_Arterial_Weight', 'Midnight_Peduru_Surrender',
  'Boar_Tusk_Apparition', 'Shoulder_Ash_Strike', 'Midnight_Gothaimbara_Varama',
]);

class JuiceDirectorEngine {
  private listeners: { [K in keyof JuiceEventMap]?: Set<Listener<any>> } = {};
  private anchorHeld = false;
  private activePassageLoop: FlowLoopId = 'bodima_rain_window';
  private activeAudioCue = 'monsoon_light';

  public on<K extends keyof JuiceEventMap>(event: K, fn: Listener<K>): () => void {
    if (!this.listeners[event]) this.listeners[event] = new Set();
    this.listeners[event]!.add(fn);
    return () => this.listeners[event]?.delete(fn);
  }

  private emit<K extends keyof JuiceEventMap>(event: K, payload: JuiceEventMap[K]): void {
    this.listeners[event]?.forEach((fn) => fn(payload));
  }

  public isAnchorHeld(): boolean { return this.anchorHeld; }
  public get baseLoop(): FlowLoopId { return this.activePassageLoop; }

  private getProtectedLoop(): FlowLoopId {
    const loop = this.baseLoop;
    if (loop.startsWith('thummansala_') || loop.startsWith('sohon_') || loop.startsWith('dummala_') || loop === 'iron_betel_cutter_ash') {
      return 'iron_betel_cutter_ash';
    }
    if (loop.startsWith('matara_') || loop.startsWith('wadamal_') || loop.startsWith('peduru_') || loop === 'iron_sickle_ember') {
      return 'iron_sickle_ember';
    }
    if (loop.startsWith('kandy_') || loop.startsWith('mohini_') || loop.startsWith('kaduru_') || loop === 'sanni_mask_torch') {
      return 'kaduru_puddle_feet';
    }
    return 'pahana_steady';
  }

  public enterPassage(passage: TwinePassage, currentBalma: number): void {
    const { directives, name } = passage;
    if (directives.flow) {
      this.activePassageLoop = directives.flow;
      this.emit('FLOW_CROSSFADE', {
        loopId: this.anchorHeld ? this.getProtectedLoop() : this.activePassageLoop,
        isProtectedOverride: this.anchorHeld,
      });
    }
    if (directives.audio) {
      this.activeAudioCue = directives.audio;
      this.emit('AUDIO_CUE', { cueId: this.activeAudioCue, muffleDreamFilter: !this.anchorHeld && currentBalma >= 50 });
    }
    audioMixer.setCue(this.activeAudioCue, currentBalma);
    if (directives.haptic) this.triggerHaptic(directives.haptic);

    if (WEEPING_PASSAGES.has(name)) setTimeout(() => audioMixer.playMohiniWeeping(), 350);
    if (INFANT_PASSAGES.has(name)) setTimeout(() => audioMixer.playMohiniWhimper(), 600);
    if (CLIMAX_DRUM_PASSAGES.has(name)) audioMixer.playYakBeraClimax();

    const calculatedVignette = directives.vignette ?? Math.min(0.88, 0.35 + currentBalma * 0.005);
    this.emit('VIGNETTE_SHIFT', {
      intensity: this.anchorHeld ? Math.max(0.25, calculatedVignette - 0.25) : calculatedVignette,
    });
    this.emit('PASSAGE_ENTERED', { passage });
  }

  public setAnchorHeld(held: boolean): void {
    if (this.anchorHeld === held) return;
    this.anchorHeld = held;
    hapticEngine.setAnchorHoldLoop(held);
    audioMixer.setAnchorState(held);
    if (held) {
      this.emit('FLOW_CROSSFADE', { loopId: this.getProtectedLoop(), isProtectedOverride: true });
      this.emit('AUDIO_CUE', { cueId: this.activeAudioCue, muffleDreamFilter: false });
    } else {
      this.emit('FLOW_CROSSFADE', { loopId: this.activePassageLoop, isProtectedOverride: false });
    }
    this.emit('ANCHOR_STATE_CHANGE', { held });
  }

  public triggerHaptic(patternId: HapticPatternId): void {
    hapticEngine.trigger(patternId);
  }
}

export const juiceDirector = new JuiceDirectorEngine();
