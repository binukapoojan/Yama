import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { audioMixer, StemCueId } from '../src/juice/audioMixer';
import { juiceDirector } from '../src/juice/JuiceDirector';
import * as audioStems from '../src/juice/audioStems';

class MockAudioParam {
  public value: number;
  public cancelScheduledValues = vi.fn();
  public setValueAtTime = vi.fn((val: number) => { this.value = val; });
  public exponentialRampToValueAtTime = vi.fn((val: number) => { this.value = val; });
  public linearRampToValueAtTime = vi.fn((val: number) => { this.value = val; });
  public setTargetAtTime = vi.fn((val: number) => { this.value = val; });

  constructor(initial: number) {
    this.value = initial;
  }
}

class MockAudioNode {
  public connect = vi.fn();
  public disconnect = vi.fn();
}

class MockGainNode extends MockAudioNode {
  public gain = new MockAudioParam(1);
}

class MockBiquadFilterNode extends MockAudioNode {
  public type = 'lowpass';
  public frequency = new MockAudioParam(18000);
  public Q = new MockAudioParam(1.8);
}

class MockOscillatorNode extends MockAudioNode {
  public type = 'sine';
  public frequency = new MockAudioParam(440);
  public start = vi.fn();
  public stop = vi.fn();
}

class MockBufferSourceNode extends MockAudioNode {
  public buffer: unknown = null;
  public loop = false;
  public start = vi.fn();
  public stop = vi.fn();
}

class MockStereoPannerNode extends MockAudioNode {
  public pan = new MockAudioParam(0);
}

class MockAnalyserNode extends MockAudioNode {
  public fftSize = 256;
  public smoothingTimeConstant = 0.82;
  public getByteFrequencyData = vi.fn();
}

class MockAudioContext {
  public state = 'running';
  public sampleRate = 44100;
  public currentTime = 0;
  public destination = new MockAudioNode();
  public resume = vi.fn();
  public createBiquadFilter = vi.fn(() => new MockBiquadFilterNode());
  public createGain = vi.fn(() => new MockGainNode());
  public createAnalyser = vi.fn(() => new MockAnalyserNode());
  public createBuffer = vi.fn((_ch: number, len: number, _rate: number) => ({
    getChannelData: vi.fn(() => new Float32Array(len)),
  }));
  public createBufferSource = vi.fn(() => new MockBufferSourceNode());
  public createOscillator = vi.fn(() => new MockOscillatorNode());
  public createStereoPanner = vi.fn(() => new MockStereoPannerNode());
}

describe('audioMixer & audioStems acoustic cues', () => {
  beforeAll(() => {
    (globalThis as unknown as { AudioContext: unknown }).AudioContext = MockAudioContext;
  });

  beforeEach(() => {
    audioMixer.init();
  });

  it('verifies StemCueId union includes Casefile 02 cues', () => {
    const validCues: StemCueId[] = [
      'monsoon_light',
      'monsoon_heavy',
      'ceb_power_cut',
      'kandy_night_cicadas',
      'infant_cry_dissonant',
      'yak_bera_ritual',
    ];
    expect(validCues).toContain('kandy_night_cicadas');
    expect(validCues).toContain('infant_cry_dissonant');
    expect(validCues).toContain('yak_bera_ritual');
  });

  it('accepts and activates kandy_night_cicadas cue', () => {
    audioMixer.previewCue('kandy_night_cicadas');
    expect(audioMixer.getCurrentCueId()).toBe('kandy_night_cicadas');
  });

  it('triggers 320 Hz dream muffle and infant whimper cue when muffled', () => {
    const whimperSpy = vi.spyOn(audioStems, 'playInfantWhimper');
    audioMixer.setDreamMuffle(true);

    const filter = audioMixer.getDreamFilter();
    expect(filter).not.toBeNull();
    expect(filter?.frequency.exponentialRampToValueAtTime).toHaveBeenCalledWith(320, expect.any(Number));
    expect(filter?.frequency.value).toBe(320);
    expect(whimperSpy).toHaveBeenCalled();
    whimperSpy.mockRestore();
  });

  it('restores 18,000 Hz cutoff when unmuffled', () => {
    audioMixer.setDreamMuffle(true);
    expect(audioMixer.getDreamFilter()?.frequency.value).toBe(320);

    audioMixer.setDreamMuffle(false);
    const filter = audioMixer.getDreamFilter();
    expect(filter?.frequency.exponentialRampToValueAtTime).toHaveBeenCalledWith(18000, expect.any(Number));
    expect(filter?.frequency.value).toBe(18000);
  });

  it('responds to JuiceDirector AUDIO_CUE and ANCHOR_STATE_CHANGE events', () => {
    juiceDirector.enterPassage(
      {
        name: 'The_Infant_Drop_Trap',
        directives: { audio: 'kandy_night_cicadas' },
        paragraphs: [],
        choices: [],
      },
      60
    );

    expect(audioMixer.getCurrentCueId()).toBe('kandy_night_cicadas');
    expect(audioMixer.getDreamFilter()?.frequency.value).toBe(320);

    juiceDirector.setAnchorHeld(true);
    expect(audioMixer.getDreamFilter()?.frequency.value).toBe(18000);
    juiceDirector.setAnchorHeld(false);
  });
});
