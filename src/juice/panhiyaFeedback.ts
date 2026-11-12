// src/juice/panhiyaFeedback.ts
import { audioMixer } from './audioMixer';
import { juiceDirector } from './JuiceDirector';
import { wardFatigue } from './wardFatigue';

export function triggerStylusScratch(): void {
  const heat = wardFatigue.getSnapshot().heat / 100;
  audioMixer.playStylusScratch(heat);
  juiceDirector.triggerHaptic('stylus_scratch');
}
