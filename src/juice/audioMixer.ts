// src/juice/audioMixer.ts
import { buildCrackleStem, playFrictionScratch, playProceduralWhisper, playStrikeSynth, PRELOAD_STEM_NAMES } from './audioHelpers';
import { createCebHumStem, createCicadaStem, createNoiseStem, createPinkNoiseBuffer, playInfantWhimper, playIronKeyTone as triggerIronKeyTone, playMohiniWeeping as triggerMohiniWeeping, playYakBeraClimaxRoll, playYakBeraPulse as triggerYakBera } from './audioStems';
import { getNotchGain, subscribeCalibration } from '../core/calibrationStore';
import { spatialPanner } from './spatialPanner';

export type AudioCueId = 'monsoon_light' | 'monsoon_heavy' | 'ceb_power_cut' | 'yak_bera_ritual' | 'hearth_crackle' | 'arterial_pulse';
export type StemCueId = AudioCueId;

class WebAudioMixer {
  private ctx: AudioContext | null = null; private masterFilter: BiquadFilterNode | null = null; private analyser: AnalyserNode | null = null;
  private rainGain: GainNode | null = null; private droneGain: GainNode | null = null; private cicadaGain: GainNode | null = null; private hearthGain: GainNode | null = null;
  private fileBuffers: Map<string, AudioBuffer> = new Map(); private activeFileSource: AudioBufferSourceNode | null = null; private activeWhisperSource: AudioBufferSourceNode | null = null;
  private fileGain: GainNode | null = null; private arterialTimer: ReturnType<typeof setInterval> | null = null;
  private currentCue = 'monsoon_light'; private currentBalma = 20; private anchorHeld = false;
  private ambientScale = 0.72; private whisperScale = 1.0;

  constructor() {
    subscribeCalibration((s) => {
      this.ambientScale = getNotchGain(s.ambientNotch); this.whisperScale = getNotchGain(s.whisperNotch);
      if (this.ctx) this.setCue(this.currentCue, this.currentBalma);
    });
  }

  public unlock(): void {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const AudioCtx = (typeof window !== 'undefined' ? (window.AudioContext || (window as any).webkitAudioContext) : null) || (globalThis as any).AudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx(); this.ctx = ctx;
    const masterFilter = ctx.createBiquadFilter(); this.masterFilter = masterFilter; masterFilter.type = 'lowpass'; masterFilter.frequency.value = 14000;
    const analyser = ctx.createAnalyser(); this.analyser = analyser; analyser.fftSize = 256;
    masterFilter.connect(analyser); analyser.connect(ctx.destination);
    const pinkBuf = createPinkNoiseBuffer(ctx);
    this.rainGain = createNoiseStem(ctx, masterFilter, pinkBuf, 950, 0.7); this.droneGain = createCebHumStem(ctx, masterFilter, pinkBuf);
    this.cicadaGain = createCicadaStem(ctx, masterFilter, pinkBuf); this.hearthGain = buildCrackleStem(ctx, masterFilter);
    const fileGain = ctx.createGain(); this.fileGain = fileGain; fileGain.gain.value = 0.65; fileGain.connect(masterFilter);
    this.preloadStems(PRELOAD_STEM_NAMES); this.setCue(this.currentCue, this.currentBalma);
  }

  private preloadStems(names: readonly string[]): void {
    if (typeof fetch === 'undefined' || !this.ctx) return;
    names.forEach((n) => fetch(`/audio/${n}.mp3`).then((r) => r.ok ? r.arrayBuffer() : Promise.reject()).then((ab) => this.ctx!.decodeAudioData(ab)).then((b) => this.fileBuffers.set(n, b)).catch(() => {}));
  }

  public setCue(cue: string, balma = 20): void {
    this.currentCue = cue; this.currentBalma = balma;
    if (!this.ctx || !this.rainGain || !this.droneGain || !this.cicadaGain || !this.hearthGain || !this.masterFilter) return;
    const now = this.ctx.currentTime, isHearth = cue === 'hearth_crackle', amb = this.ambientScale;
    this.rainGain.gain.setTargetAtTime((cue === 'monsoon_heavy' ? 0.28 : cue === 'ceb_power_cut' ? 0.04 : isHearth ? 0.06 : 0.14) * amb, now, 0.6);
    this.droneGain.gain.setTargetAtTime(((cue === 'ceb_power_cut' || cue === 'yak_bera_ritual' || cue === 'arterial_pulse' ? 0.18 : 0.05) + (balma / 100) * 0.12) * amb, now, 0.6);
    this.cicadaGain.gain.setTargetAtTime((cue === 'ceb_power_cut' || cue === 'monsoon_light' ? 0.12 : 0.02) * amb, now, 0.6);
    this.hearthGain.gain.setTargetAtTime((isHearth ? 0.26 : cue === 'arterial_pulse' ? 0.12 : 0.0001) * amb, now, 0.5);

    const stemKey = cue === 'monsoon_light' || cue === 'monsoon_heavy' ? 'bodima_rain_window' : cue === 'hearth_crackle' ? 'matara_hearth_smoke' : cue;
    if (this.fileBuffers.has(stemKey) && this.fileGain) {
      try { this.activeFileSource?.stop(); } catch {}
      const src = this.ctx.createBufferSource(); src.buffer = this.fileBuffers.get(stemKey)!; src.loop = true;
      src.connect(this.fileGain); src.start(); this.activeFileSource = src;
    }
    const cutoff = this.anchorHeld ? 16000 : balma >= 55 ? 320 : 12000 - balma * 80;
    this.masterFilter.frequency.setTargetAtTime(Math.max(320, cutoff), now, 0.4);
    this.syncArterialLoop(cue === 'arterial_pulse' || balma >= 60);
  }

  public setAnchorState(held: boolean): void {
    this.anchorHeld = held;
    if (!this.ctx || !this.masterFilter) return;
    this.masterFilter.frequency.setTargetAtTime(held ? 16000 : this.currentBalma >= 55 ? 320 : 9500, this.ctx.currentTime, 0.2);
    if (held) {
      try { this.activeWhisperSource?.stop(); this.activeWhisperSource = null; } catch {}
      triggerIronKeyTone(this.ctx, this.masterFilter); this.syncArterialLoop(false);
    } else {
      this.syncArterialLoop(this.currentCue === 'arterial_pulse' || this.currentBalma >= 60);
    }
  }

  public playWhisper(stemName: string, fallback?: () => void): void {
    if (this.anchorHeld || this.whisperScale <= 0.001) return;
    const buf = this.fileBuffers.get(stemName);
    if (this.ctx && this.masterFilter && buf) {
      try { this.activeWhisperSource?.stop(); } catch {}
      const src = this.ctx.createBufferSource(), g = this.ctx.createGain(); src.buffer = buf; g.gain.value = this.whisperScale;
      src.connect(g); g.connect(spatialPanner.getDestination(this.ctx, this.masterFilter)); src.start(); this.activeWhisperSource = src;
    } else {
      if (this.ctx && this.masterFilter) playProceduralWhisper(this.ctx, spatialPanner.getDestination(this.ctx, this.masterFilter)); if (fallback) fallback();
    }
  }

  public playYakBeraPulse(i = 0.7): void { if (this.ctx && this.masterFilter) triggerYakBera(this.ctx, this.masterFilter, i * this.ambientScale); }
  public playYakBeraClimax(): void { if (this.ctx && this.masterFilter) playYakBeraClimaxRoll(this.ctx, this.masterFilter); }
  public playMohiniWhimper(): void { if (this.ctx && this.masterFilter && !this.anchorHeld && this.whisperScale > 0.001) playInfantWhimper(this.ctx, spatialPanner.getDestination(this.ctx, this.masterFilter) as BiquadFilterNode); }
  public playMohiniWeeping(): void { if (this.ctx && this.masterFilter && !this.anchorHeld && this.whisperScale > 0.001) triggerMohiniWeeping(this.ctx, spatialPanner.getDestination(this.ctx, this.masterFilter) as BiquadFilterNode); }
  public playArterialPulse(intensity = 0.75, force = false): void {
    if (!this.ctx || !this.masterFilter || (this.anchorHeld && !force)) return;
    this.playStrike(96, 36, 0.14, intensity * 0.32, 'sine', 0);
    this.playStrike(78, 30, 0.18, intensity * 0.22, 'sine', 0.135);
    const rain = this.currentCue === 'monsoon_heavy' ? 0.28 : this.currentCue === 'ceb_power_cut' ? 0.04 : 0.14;
    const cicada = this.currentCue === 'ceb_power_cut' || this.currentCue === 'monsoon_light' ? 0.12 : 0.02;
    spatialPanner.triggerSystolicDuck(this.ctx, [{ node: this.rainGain, baseGain: rain * this.ambientScale }, { node: this.cicadaGain, baseGain: cicada * this.ambientScale }], intensity);
  }
  private playStrike(fStart: number, fEnd: number, dur: number, vol: number, type: OscillatorType = 'sine', delay = 0): void { if (this.ctx && this.masterFilter) playStrikeSynth(this.ctx, this.masterFilter, fStart, fEnd, dur, vol, type, delay); }
  private syncArterialLoop(active: boolean): void {
    if (this.arterialTimer) { clearInterval(this.arterialTimer); this.arterialTimer = null; }
    if (!active || this.anchorHeld) return;
    this.arterialTimer = setInterval(() => this.playArterialPulse(0.5 + (this.currentBalma / 100) * 0.4), Math.max(460, 980 - this.currentBalma * 4.5));
  }
  public playIronKeyTone(): void { this.setAnchorState(true); } public playIronKeyResonance(): void { this.playIronKeyTone(); }
  public playStylusScratch(heat = 0): void { if (this.ctx && this.masterFilter) playFrictionScratch(this.ctx, this.masterFilter, heat, this.ambientScale); }
  public getAnalyser(): AnalyserNode | null { return this.analyser; } public getCurrentCueId(): string { return this.currentCue; }
  public getDreamFilter(): BiquadFilterNode | null { return this.masterFilter; } public init(): void { this.unlock(); }
  public previewCue(cue: string, balma = 20): void { this.unlock(); this.setCue(cue, balma); }
  public setMasterFilterFreq(hz: number): void { if (this.ctx && this.masterFilter) this.masterFilter.frequency.setTargetAtTime(hz, this.ctx.currentTime, 0.1); }
  public setDreamMuffle(m: boolean): void { this.setMasterFilterFreq(m ? 320 : 16000); } public setFilterParams(hz: number): void { this.setMasterFilterFreq(hz); }
}

export const audioMixer = new WebAudioMixer();
