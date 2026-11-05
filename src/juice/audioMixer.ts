// src/juice/audioMixer.ts
import { juiceDirector } from './JuiceDirector';

export type StemCueId = 'monsoon_light' | 'monsoon_heavy' | 'ceb_power_cut';

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

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public getCurrentCueId(): StemCueId | '' {
    return this.currentCueId;
  }

  public init(): void {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
      if (held) this.playIronKeyResonance();
      else this.playYakBeraPulse(0.65);
    });
  }

  private buildProceduralStems(): void {
    if (!this.ctx || !this.dreamFilter) return;
    const sr = this.ctx.sampleRate;
    const buf = this.ctx.createBuffer(1, sr * 3, sr);
    const data = buf.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.997 * b0 + white * 0.029;
      b1 = 0.985 * b1 + white * 0.032;
      b2 = 0.950 * b2 + white * 0.048;
      data[i] = (b0 + b1 + b2 + white * 0.015) * 3.5;
    }

    const makeNoiseStem = (freq: number, q: number): GainNode => {
      const src = this.ctx!.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      const bp = this.ctx!.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = freq;
      bp.Q.value = q;
      const gain = this.ctx!.createGain();
      gain.gain.value = 0.0001;
      src.connect(bp);
      bp.connect(gain);
      gain.connect(this.dreamFilter!);
      src.start();
      return gain;
    };

    this.stems.set('monsoon_light', makeNoiseStem(1350, 0.9));
    this.stems.set('monsoon_heavy', makeNoiseStem(680, 0.5));

    const humGain = makeNoiseStem(420, 0.7);
    const humOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    humOsc.type = 'sawtooth';
    humOsc.frequency.value = 50; // 50Hz CEB transformer hum
    subGain.gain.value = 0.15;
    humOsc.connect(subGain);
    subGain.connect(humGain);
    humOsc.start();
    this.stems.set('ceb_power_cut', humGain);
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
    if (muffle) this.playYakBeraPulse(0.8);
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
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    [0, 0.24].forEach((offset, idx) => {
      const osc = this.ctx!.createOscillator();
      const env = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(idx === 0 ? 68 : 54, now + offset);
      osc.frequency.exponentialRampToValueAtTime(26, now + offset + 0.45);
      env.gain.setValueAtTime(0.001, now + offset);
      env.gain.linearRampToValueAtTime(intensity * (idx === 0 ? 0.6 : 0.9), now + offset + 0.02);
      env.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.55);
      osc.connect(env);
      env.connect(this.masterGain!);
      osc.start(now + offset);
      osc.stop(now + offset + 0.6);
    });
  }

  public playIronKeyResonance(): void {
    this.unlock();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(528, now);
    osc.frequency.exponentialRampToValueAtTime(522, now + 0.35);
    env.gain.setValueAtTime(0.14, now);
    env.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
    osc.connect(env);
    env.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.42);
  }
}

export const audioMixer = new AudioMixerEngine();
