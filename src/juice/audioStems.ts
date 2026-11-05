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
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = freq;
  bp.Q.value = q;
  const gain = ctx.createGain();
  gain.gain.value = 0.0001;
  src.connect(bp);
  bp.connect(gain);
  gain.connect(dest);
  src.start();
  return gain;
}

export function createCebHumStem(ctx: AudioContext, dest: AudioNode, buf: AudioBuffer): GainNode {
  const humGain = createNoiseStem(ctx, dest, buf, 420, 0.7);
  const osc = ctx.createOscillator(), sub = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.value = 50;
  sub.gain.value = 0.15;
  osc.connect(sub);
  sub.connect(humGain);
  osc.start();
  return humGain;
}

export function createCicadaStem(ctx: AudioContext, dest: AudioNode, buf: AudioBuffer): GainNode {
  const stem = createNoiseStem(ctx, dest, buf, 2400, 7.5);
  const dripFilter = ctx.createBiquadFilter(), dripGain = ctx.createGain(), dripSrc = ctx.createBufferSource();
  dripFilter.type = 'bandpass';
  dripFilter.frequency.value = 1120;
  dripFilter.Q.value = 14;
  dripGain.gain.value = 0.25;
  dripSrc.buffer = buf;
  dripSrc.loop = true;
  dripSrc.connect(dripFilter);
  dripFilter.connect(dripGain);
  dripGain.connect(stem);
  dripSrc.start();
  return stem;
}

export function playInfantWhimper(ctx: AudioContext, dest: AudioNode): void {
  const now = ctx.currentTime, osc = ctx.createOscillator(), gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(460, now);
  osc.frequency.linearRampToValueAtTime(620, now + 0.3);
  osc.frequency.exponentialRampToValueAtTime(340, now + 0.9);
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.18, now + 0.2);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
  let target: AudioNode = gain;
  if (typeof ctx.createStereoPanner === 'function') {
    const panner = ctx.createStereoPanner();
    panner.pan.value = -0.75;
    gain.connect(panner);
    target = panner;
  }
  osc.connect(gain);
  target.connect(dest);
  osc.start(now);
  osc.stop(now + 0.95);
}

export function playYakBeraPulse(ctx: AudioContext, dest: AudioNode, intensity = 0.85): void {
  const now = ctx.currentTime;
  [0, 0.24].forEach((offset, idx) => {
    const osc = ctx.createOscillator(), env = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(idx === 0 ? 68 : 54, now + offset);
    osc.frequency.exponentialRampToValueAtTime(26, now + offset + 0.45);
    env.gain.setValueAtTime(0.001, now + offset);
    env.gain.linearRampToValueAtTime(intensity * (idx === 0 ? 0.6 : 0.9), now + offset + 0.02);
    env.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.55);
    osc.connect(env);
    env.connect(dest);
    osc.start(now + offset);
    osc.stop(now + offset + 0.6);
  });
}

export function playIronKeyTone(ctx: AudioContext, dest: AudioNode): void {
  const now = ctx.currentTime, osc = ctx.createOscillator(), env = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(528, now);
  osc.frequency.exponentialRampToValueAtTime(522, now + 0.35);
  env.gain.setValueAtTime(0.14, now);
  env.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
  osc.connect(env);
  env.connect(dest);
  osc.start(now);
  osc.stop(now + 0.42);
}
