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
