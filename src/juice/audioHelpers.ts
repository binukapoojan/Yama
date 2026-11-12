// src/juice/audioHelpers.ts
export const PRELOAD_STEM_NAMES = [
  'bodima_rain_window', 'matara_hearth_smoke', 'mohini_saree_silhouette', 'sohon_boar_silhouette', 'thummansala_banyan_wind',
  'whisper_roommate_knock', 'whisper_kalu_ear', 'whisper_mohini_name', 'whisper_mohini_baby',
  'whisper_amma_courtyard', 'whisper_riri_rafters', 'whisper_pilgrim_boar', 'whisper_mahasona_neck',
] as const;

export function buildCrackleStem(ctx: AudioContext, dest: AudioNode): GainNode {
  const buf = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate), data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < data.length; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.02 * white) / 1.02;
    data[i] = last * 0.25 + (Math.random() < 0.0045 ? (Math.random() * 2 - 1) * 0.95 : 0);
  }
  const src = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), gain = ctx.createGain();
  src.buffer = buf; src.loop = true; filter.type = 'bandpass'; filter.frequency.value = 2650; filter.Q.value = 2.2;
  gain.gain.value = 0.0001; src.connect(filter); filter.connect(gain); gain.connect(dest); src.start();
  return gain;
}

export function playStrikeSynth(
  ctx: AudioContext, dest: AudioNode, fStart: number, fEnd: number, dur: number, vol: number, type: OscillatorType = 'sine', delay = 0
): void {
  const t0 = ctx.currentTime + delay, osc = ctx.createOscillator(), gain = ctx.createGain();
  osc.type = type; osc.frequency.setValueAtTime(fStart, t0); osc.frequency.exponentialRampToValueAtTime(fEnd, t0 + dur);
  gain.gain.setValueAtTime(Math.max(0.001, vol), t0); gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  osc.connect(gain); gain.connect(dest); osc.start(t0); osc.stop(t0 + dur + 0.02);
}

export function playFrictionScratch(
  ctx: AudioContext, dest: AudioNode, heat = 0, volMultiplier = 1
): void {
  const dur = 0.045 + Math.random() * 0.025;
  const length = Math.max(128, Math.floor(ctx.sampleRate * dur));
  const buf = ctx.createBuffer(1, length, ctx.sampleRate), data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    last = (last + 0.15 * white) / 1.15;
    const snag = Math.random() < 0.08 ? (Math.random() * 2 - 1) * 0.7 : 0;
    data[i] = last * 0.7 + snag;
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const baseFreq = heat > 0.5 ? 4500 : 3250;
  const jitter = (Math.random() * 0.16 - 0.08);
  const centerFreq = baseFreq * (1 + jitter);
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.Q.value = 2.8 + Math.random() * 0.6;
  const t0 = ctx.currentTime;
  filter.frequency.setValueAtTime(centerFreq, t0);
  filter.frequency.exponentialRampToValueAtTime(Math.max(100, centerFreq * 0.88), t0 + dur);
  const gain = ctx.createGain();
  const targetGain = Math.max(0.001, 0.24 * volMultiplier);
  const attack = 0.006;
  gain.gain.setValueAtTime(0.001, t0);
  gain.gain.linearRampToValueAtTime(targetGain, t0 + attack);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  src.connect(filter); filter.connect(gain); gain.connect(dest);
  src.start(t0); src.stop(t0 + dur + 0.01);
}

export function playProceduralWhisper(ctx: AudioContext, dest: AudioNode): void {
  const now = ctx.currentTime, dur = 0.65;
  const frames = Math.max(1, Math.floor(ctx.sampleRate * dur));
  const buf = ctx.createBuffer(1, frames, ctx.sampleRate), data = buf.getChannelData(0);
  for (let i = 0; i < frames; i++) {
    const env = Math.sin((i / frames) * Math.PI) * (0.65 + 0.35 * Math.sin((i / frames) * Math.PI * 4));
    data[i] = (Math.random() * 2 - 1) * env * 0.45;
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const formant1 = ctx.createBiquadFilter();
  formant1.type = 'bandpass'; formant1.frequency.setValueAtTime(780, now);
  formant1.frequency.linearRampToValueAtTime(640, now + dur); formant1.Q.value = 5.5;
  const formant2 = ctx.createBiquadFilter();
  formant2.type = 'bandpass'; formant2.frequency.setValueAtTime(1950, now);
  formant2.frequency.linearRampToValueAtTime(1620, now + dur); formant2.Q.value = 7.0;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.001, now); gain.gain.linearRampToValueAtTime(0.28, now + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
  src.connect(formant1); src.connect(formant2);
  formant1.connect(gain); formant2.connect(gain); gain.connect(dest);
  src.start(now); src.stop(now + dur + 0.02);
}
