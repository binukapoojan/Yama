// src/juice/audioMixer.ts
import { juiceDirector } from './JuiceDirector';
import * as stems from './audioStems';

export type StemCueId =
  | 'monsoon_light' | 'monsoon_heavy' | 'ceb_power_cut'
  | 'kandy_night_cicadas' | 'infant_cry_dissonant' | 'yak_bera_ritual';

class AudioMixerEngine {
  private ctx: AudioContext | null = null;
  private dreamFilter: BiquadFilterNode | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private stems: Map<StemCueId, GainNode> = new Map();
  private currentCueId: StemCueId | '' = '';
  private isMuffled = false;

  public unlock(): void {
    if (!this.ctx) this.init();
    if (this.ctx?.state === 'suspended') this.ctx.resume();
  }

  public getAnalyser(): AnalyserNode | null { return this.analyser; }
  public getCurrentCueId(): StemCueId | '' { return this.currentCueId; }
  public getDreamFilter(): BiquadFilterNode | null { return this.dreamFilter; }

  public init(): void {
    if (this.ctx) return;
    const AudioCtx = typeof window !== 'undefined'
      ? (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)
      : (globalThis as unknown as { AudioContext: typeof AudioContext }).AudioContext;
    if (!AudioCtx) return;
    this.ctx = new AudioCtx();

    this.dreamFilter = this.ctx.createBiquadFilter();
    this.dreamFilter.type = 'lowpass';
    this.dreamFilter.frequency.value = 18000;
    this.dreamFilter.Q.value = 1.8;
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.85;
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.82;

    this.dreamFilter.connect(this.masterGain);
    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);
    this.buildProceduralStems();

    juiceDirector.on('AUDIO_CUE', ({ cueId, muffleDreamFilter }) => {
      this.previewCue((cueId as StemCueId) || 'monsoon_light');
      this.setDreamMuffle(muffleDreamFilter);
    });
    juiceDirector.on('ANCHOR_STATE_CHANGE', ({ held }) => {
      this.setDreamMuffle(held ? false : this.isMuffled);
      if (held) this.playIronKeyTone();
      else this.playYakBeraPulse(0.65);
    });
  }

  private buildProceduralStems(): void {
    if (!this.ctx || !this.dreamFilter) return;
    const buf = stems.createPinkNoiseBuffer(this.ctx);
    this.stems.set('monsoon_light', stems.createNoiseStem(this.ctx, this.dreamFilter, buf, 1350, 0.9));
    this.stems.set('monsoon_heavy', stems.createNoiseStem(this.ctx, this.dreamFilter, buf, 680, 0.5));
    this.stems.set('ceb_power_cut', stems.createCebHumStem(this.ctx, this.dreamFilter, buf));
    this.stems.set('kandy_night_cicadas', stems.createCicadaStem(this.ctx, this.dreamFilter, buf));
    this.stems.set('infant_cry_dissonant', stems.createNoiseStem(this.ctx, this.dreamFilter, buf, 540, 3.2));
    this.stems.set('yak_bera_ritual', stems.createNoiseStem(this.ctx, this.dreamFilter, buf, 180, 2.0));
  }

  public previewCue(nextCueId: StemCueId, crossfadeSec = 1.8): void {
    this.unlock();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    this.stems.forEach((gain, id) => {
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(Math.max(0.0001, gain.gain.value), now);
      gain.gain.exponentialRampToValueAtTime(id === nextCueId ? 0.75 : 0.0001, now + crossfadeSec);
    });
    this.currentCueId = nextCueId;
  }

  public setDreamMuffle(muffle: boolean): void {
    this.isMuffled = muffle;
    this.setFilterParams(muffle ? 320 : 18000, muffle ? 2.4 : 1.0, muffle ? 1.5 : 0.35);
    if (muffle && this.ctx && this.masterGain) {
      stems.playInfantWhimper(this.ctx, this.masterGain);
      stems.playYakBeraPulse(this.ctx, this.masterGain, 0.8);
    }
  }

  public setFilterParams(hz: number, q: number, rampSec = 0.12): void {
    this.unlock();
    if (!this.ctx || !this.dreamFilter) return;
    const now = this.ctx.currentTime;
    this.dreamFilter.frequency.cancelScheduledValues(now);
    this.dreamFilter.frequency.setValueAtTime(Math.max(60, this.dreamFilter.frequency.value), now);
    this.dreamFilter.frequency.exponentialRampToValueAtTime(Math.max(60, hz), now + rampSec);
    this.dreamFilter.Q.setTargetAtTime(q, now, 0.05);
  }

  public playYakBeraPulse(intensity = 0.85): void {
    this.unlock();
    if (this.ctx && this.masterGain) stems.playYakBeraPulse(this.ctx, this.masterGain, intensity);
  }

  public playIronKeyTone(): void {
    this.unlock();
    if (this.ctx && this.masterGain) stems.playIronKeyTone(this.ctx, this.masterGain);
  }

  public playIronKeyResonance(): void { this.playIronKeyTone(); }
}

export const audioMixer = new AudioMixerEngine();
