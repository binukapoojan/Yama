// src/juice/audioStems.ts
export function createPinkNoiseBuffer(ctx: AudioContext): AudioBuffer {
  const sr = ctx.sampleRate, buf = ctx.createBuffer(1, sr * 3, sr), data = buf.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0;
  for (let i = 0; i < data.length; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.997 * b0 + white * 0.029;
    b1 = 0.985 * b1 + white * 0.032;
    b2 = 0.95 * b2 + white * 0.048;
    data[i] = (b0 + b1 + b2 + white * 0.015) * 3.5;
  }
  return buf;
}

export function createNoiseStem(ctx: AudioContext, dest: AudioNode, buf: AudioBuffer, freq: number, q: number): GainNode {
  const src = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), gain = ctx.createGain();
  src.buffer = buf; src.loop = true; bp.type = 'bandpass'; bp.frequency.value = freq; bp.Q.value = q;
  gain.gain.value = 0.0001; src.connect(bp); bp.connect(gain); gain.connect(dest); src.start();
  return gain;
}

export function createCebHumStem(ctx: AudioContext, dest: AudioNode, buf: AudioBuffer): GainNode {
  const humGain = createNoiseStem(ctx, dest, buf, 420, 0.7);
  const osc = ctx.createOscillator(), sub = ctx.createGain();
  osc.type = 'sawtooth'; osc.frequency.value = 50; sub.gain.value = 0.15;
  osc.connect(sub); sub.connect(humGain); osc.start();
  return humGain;
}

export function createCicadaStem(ctx: AudioContext, dest: AudioNode, buf: AudioBuffer): GainNode {
  const stem = createNoiseStem(ctx, dest, buf, 2400, 7.5);
  const dripFilter = ctx.createBiquadFilter(), dripGain = ctx.createGain(), dripSrc = ctx.createBufferSource();
  dripFilter.type = 'bandpass'; dripFilter.frequency.value = 1120; dripFilter.Q.value = 14; dripGain.gain.value = 0.25;
  dripSrc.buffer = buf; dripSrc.loop = true; dripSrc.connect(dripFilter); dripFilter.connect(dripGain); dripGain.connect(stem); dripSrc.start();
  return stem;
}

export function playInfantWhimper(ctx: AudioContext, dest: AudioNode): void {
  const now = ctx.currentTime, osc = ctx.createOscillator(), gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(480, now);
  osc.frequency.linearRampToValueAtTime(660, now + 0.28);
  osc.frequency.exponentialRampToValueAtTime(320, now + 0.95);
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.22, now + 0.18);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.98);
  osc.connect(gain); gain.connect(dest); osc.start(now); osc.stop(now + 1.0);
}

export function playMohiniWeeping(ctx: AudioContext, dest: AudioNode): void {
  const now = ctx.currentTime;
  [0, 0.55, 1.15].forEach((offset, i) => {
    const t0 = now + offset, dur = i === 2 ? 0.95 : 0.45;
    const carrier = ctx.createOscillator(), lfo = ctx.createOscillator(), lfoGain = ctx.createGain();
    const formant = ctx.createBiquadFilter(), env = ctx.createGain();
    carrier.type = 'sawtooth';
    carrier.frequency.setValueAtTime(i === 2 ? 540 : 590 - i * 35, t0);
    carrier.frequency.exponentialRampToValueAtTime(340, t0 + dur);
    lfo.frequency.value = 6.2; lfoGain.gain.value = 18;
    lfo.connect(carrier.frequency);
    formant.type = 'bandpass'; formant.frequency.value = 920; formant.Q.value = 4.5;
    env.gain.setValueAtTime(0.001, t0);
    env.gain.linearRampToValueAtTime(0.16, t0 + 0.08);
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    carrier.connect(formant); formant.connect(env); env.connect(dest);
    carrier.start(t0); lfo.start(t0); carrier.stop(t0 + dur + 0.02); lfo.stop(t0 + dur + 0.02);
  });
}

export function playYakBeraPulse(ctx: AudioContext, dest: AudioNode, intensity = 0.85): void {
  const now = ctx.currentTime;
  [0, 0.18].forEach((offset, idx) => {
    const t0 = now + offset, osc = ctx.createOscillator(), slap = ctx.createOscillator(), env = ctx.createGain();
    osc.type = 'triangle'; slap.type = 'square';
    osc.frequency.setValueAtTime(idx === 0 ? 112 : 84, t0);
    osc.frequency.exponentialRampToValueAtTime(34, t0 + 0.38);
    slap.frequency.setValueAtTime(290, t0); slap.frequency.exponentialRampToValueAtTime(65, t0 + 0.06);
    env.gain.setValueAtTime(0.001, t0);
    env.gain.linearRampToValueAtTime(intensity * (idx === 0 ? 0.65 : 0.95), t0 + 0.012);
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.42);
    osc.connect(env); slap.connect(env); env.connect(dest);
    osc.start(t0); slap.start(t0); osc.stop(t0 + 0.44); slap.stop(t0 + 0.07);
  });
}

export function playYakBeraClimaxRoll(ctx: AudioContext, dest: AudioNode): void {
  [0, 120, 220, 300, 365, 420].forEach((ms, i) => {
    setTimeout(() => playYakBeraPulse(ctx, dest, 0.55 + i * 0.09), ms);
  });
}

export function playIronKeyTone(ctx: AudioContext, dest: AudioNode): void {
  const now = ctx.currentTime, osc = ctx.createOscillator(), env = ctx.createGain();
  osc.type = 'triangle'; osc.frequency.setValueAtTime(528, now); osc.frequency.exponentialRampToValueAtTime(522, now + 0.35);
  env.gain.setValueAtTime(0.14, now); env.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
  osc.connect(env); env.connect(dest); osc.start(now); osc.stop(now + 0.42);
}
