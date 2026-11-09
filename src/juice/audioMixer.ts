// src/juice/audioMixer.ts
import {
  createCebHumStem, createCicadaStem, createNoiseStem, createPinkNoiseBuffer,
  playInfantWhimper, playIronKeyTone as triggerIronKeyTone,
  playMohiniWeeping as triggerMohiniWeeping, playYakBeraClimaxRoll, playYakBeraPulse as triggerYakBera,
} from './audioStems';

export type AudioCueId =
  | 'monsoon_light' | 'monsoon_heavy' | 'ceb_power_cut' | 'yak_bera_ritual' | 'hearth_crackle' | 'arterial_pulse';
export type StemCueId = AudioCueId;

class WebAudioMixer {
  private ctx: AudioContext | null = null;
  private masterFilter: BiquadFilterNode | null = null;
  private analyser: AnalyserNode | null = null;
  private rainGain: GainNode | null = null;
  private droneGain: GainNode | null = null;
  private cicadaGain: GainNode | null = null;
  private hearthGain: GainNode | null = null;
  private arterialTimer: ReturnType<typeof setInterval> | null = null;
  private currentCue = 'monsoon_light';
  private currentBalma = 20;
  private anchorHeld = false;

  public unlock(): void {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const AudioCtx = (typeof window !== 'undefined'
      ? (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)
      : null) || (globalThis as unknown as { AudioContext: typeof AudioContext }).AudioContext;
    if (!AudioCtx) return;
    this.ctx = new AudioCtx();
    this.masterFilter = this.ctx.createBiquadFilter();
    this.masterFilter.type = 'lowpass'; this.masterFilter.frequency.value = 14000;
    this.analyser = this.ctx.createAnalyser(); this.analyser.fftSize = 256;
    this.masterFilter.connect(this.analyser); this.analyser.connect(this.ctx.destination);

    const pinkBuf = createPinkNoiseBuffer(this.ctx);
    this.rainGain = createNoiseStem(this.ctx, this.masterFilter, pinkBuf, 950, 0.7);
    this.droneGain = createCebHumStem(this.ctx, this.masterFilter, pinkBuf);
    this.cicadaGain = createCicadaStem(this.ctx, this.masterFilter, pinkBuf);
    this.hearthGain = this.buildCrackleStem();
    this.setCue(this.currentCue, this.currentBalma);
  }

  private buildCrackleStem(): GainNode {
    const ctx = this.ctx!, buf = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate), data = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 0.25 + (Math.random() < 0.0045 ? (Math.random() * 2 - 1) * 0.95 : 0);
    }
    const src = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), gain = ctx.createGain();
    src.buffer = buf; src.loop = true; filter.type = 'bandpass'; filter.frequency.value = 2650; filter.Q.value = 2.2;
    gain.gain.value = 0.0001; src.connect(filter); filter.connect(gain); gain.connect(this.masterFilter!); src.start();
    return gain;
  }

  public setCue(cue: string, balma = 20): void {
    this.currentCue = cue; this.currentBalma = balma;
    if (!this.ctx || !this.rainGain || !this.droneGain || !this.cicadaGain || !this.hearthGain || !this.masterFilter) return;
    const now = this.ctx.currentTime, isHearth = cue === 'hearth_crackle';
    this.rainGain.gain.setTargetAtTime(cue === 'monsoon_heavy' ? 0.28 : cue === 'ceb_power_cut' ? 0.04 : isHearth ? 0.06 : 0.14, now, 0.6);
    this.droneGain.gain.setTargetAtTime((cue === 'ceb_power_cut' || cue === 'yak_bera_ritual' || cue === 'arterial_pulse' ? 0.18 : 0.05) + (balma / 100) * 0.12, now, 0.6);
    this.cicadaGain.gain.setTargetAtTime(cue === 'ceb_power_cut' || cue === 'monsoon_light' ? 0.12 : 0.02, now, 0.6);
    this.hearthGain.gain.setTargetAtTime(isHearth ? 0.26 : cue === 'arterial_pulse' ? 0.12 : 0.0001, now, 0.5);
    const cutoff = this.anchorHeld ? 16000 : balma >= 55 ? 320 : 12000 - balma * 80;
    this.masterFilter.frequency.setTargetAtTime(Math.max(320, cutoff), now, 0.4);
    this.syncArterialLoop(cue === 'arterial_pulse' || balma >= 60);
  }

  public setAnchorState(held: boolean): void {
    this.anchorHeld = held;
    if (!this.ctx || !this.masterFilter) return;
    this.masterFilter.frequency.setTargetAtTime(held ? 16000 : this.currentBalma >= 55 ? 320 : 9500, this.ctx.currentTime, 0.2);
    if (held) { triggerIronKeyTone(this.ctx, this.masterFilter); this.syncArterialLoop(false); }
    else { this.syncArterialLoop(this.currentCue === 'arterial_pulse' || this.currentBalma >= 60); }
  }

  public playYakBeraPulse(intensity = 0.7): void { if (this.ctx && this.masterFilter) triggerYakBera(this.ctx, this.masterFilter, intensity); }
  public playYakBeraClimax(): void { if (this.ctx && this.masterFilter) playYakBeraClimaxRoll(this.ctx, this.masterFilter); }
  public playMohiniWhimper(): void { if (this.ctx && this.masterFilter && !this.anchorHeld) playInfantWhimper(this.ctx, this.masterFilter); }
  public playMohiniWeeping(): void { if (this.ctx && this.masterFilter && !this.anchorHeld) triggerMohiniWeeping(this.ctx, this.masterFilter); }
  public playArterialPulse(intensity = 0.75): void {
    if (!this.ctx || !this.masterFilter || this.anchorHeld) return;
    this.playStrike(96, 36, 0.14, intensity * 0.32, 'sine', 0);
    this.playStrike(78, 30, 0.18, intensity * 0.22, 'sine', 0.135);
  }

  private playStrike(fStart: number, fEnd: number, dur: number, vol: number, type: OscillatorType = 'sine', delay = 0): void {
    const t0 = this.ctx!.currentTime + delay, osc = this.ctx!.createOscillator(), gain = this.ctx!.createGain();
    osc.type = type; osc.frequency.setValueAtTime(fStart, t0); osc.frequency.exponentialRampToValueAtTime(fEnd, t0 + dur);
    gain.gain.setValueAtTime(Math.max(0.001, vol), t0); gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain); gain.connect(this.masterFilter!); osc.start(t0); osc.stop(t0 + dur + 0.02);
  }

  private syncArterialLoop(active: boolean): void {
    if (this.arterialTimer) { clearInterval(this.arterialTimer); this.arterialTimer = null; }
    if (!active || this.anchorHeld) return;
    const intervalMs = Math.max(460, 980 - this.currentBalma * 4.5);
    const trigger = () => this.playArterialPulse(0.5 + (this.currentBalma / 100) * 0.4);
    trigger(); this.arterialTimer = setInterval(trigger, intervalMs);
  }

  public getAnalyser(): AnalyserNode | null { return this.analyser; }
  public setMasterFilterFreq(hz: number): void { if (this.ctx && this.masterFilter) this.masterFilter.frequency.setTargetAtTime(hz, this.ctx.currentTime, 0.1); }
  public init(): void { this.unlock(); }
  public previewCue(cue: string, balma = 20): void { this.unlock(); this.setCue(cue, balma); }
  public getCurrentCueId(): string { return this.currentCue; }
  public getDreamFilter(): BiquadFilterNode | null { return this.masterFilter; }
  public setDreamMuffle(muffle: boolean): void { this.setMasterFilterFreq(muffle ? 320 : 16000); }
  public setFilterParams(hz: number, _q = 1.8): void { this.setMasterFilterFreq(hz); }
  public playIronKeyTone(): void { this.setAnchorState(true); }
  public playIronKeyResonance(): void { this.playIronKeyTone(); }
}

export const audioMixer = new WebAudioMixer();
