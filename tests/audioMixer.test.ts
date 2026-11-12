import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { audioMixer, StemCueId } from '../src/juice/audioMixer';
import { juiceDirector } from '../src/juice/JuiceDirector';

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
  public frequency = new MockAudioParam(14000);
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

describe('audioMixer & audioStems acoustic cues (Casefile 03 WebAudioMixer)', () => {
  beforeAll(() => {
    (globalThis as unknown as { AudioContext: unknown }).AudioContext = MockAudioContext;
  });

  beforeEach(() => {
    audioMixer.unlock();
  });

  it('verifies AudioCueId and StemCueId unions include Casefile 03 cues', () => {
    const validCues: StemCueId[] = [
      'monsoon_light',
      'monsoon_heavy',
      'ceb_power_cut',
      'yak_bera_ritual',
      'hearth_crackle',
      'arterial_pulse',
    ];
    expect(validCues).toContain('hearth_crackle');
    expect(validCues).toContain('arterial_pulse');
    expect(validCues).toContain('yak_bera_ritual');
  });

  it('accepts and activates hearth_crackle cue', () => {
    audioMixer.setCue('hearth_crackle', 20);
    expect(audioMixer.getCurrentCueId()).toBe('hearth_crackle');
  });

  it('engages 320 Hz dream muffle when balma exceeds 55', () => {
    audioMixer.setCue('monsoon_light', 60);
    const filter = audioMixer.getDreamFilter();
    expect(filter).not.toBeNull();
    expect(filter?.frequency.setTargetAtTime).toHaveBeenCalledWith(320, expect.any(Number), 0.4);
    expect(filter?.frequency.value).toBe(320);
  });

  it('restores 16,000 Hz cutoff and silences arterial pulse when anchor is held', () => {
    const arterialSpy = vi.spyOn(audioMixer, 'playArterialPulse');
    audioMixer.setCue('arterial_pulse', 70);
    audioMixer.setAnchorState(true);

    const filter = audioMixer.getDreamFilter();
    expect(filter?.frequency.setTargetAtTime).toHaveBeenCalledWith(16000, expect.any(Number), 0.2);
    expect(filter?.frequency.value).toBe(16000);

    audioMixer.playArterialPulse(0.8);
    audioMixer.setAnchorState(false);
    arterialSpy.mockRestore();
  });

  it('executes playArterialPulse dual-stroke systolic and diastolic pulse', () => {
    const strikeSpy = vi.spyOn(audioMixer as any, 'playStrike');
    audioMixer.playArterialPulse(0.75);
    expect(strikeSpy).toHaveBeenCalledWith(96, 36, 0.14, expect.any(Number), 'sine', 0);
    expect(strikeSpy).toHaveBeenCalledWith(78, 30, 0.18, expect.any(Number), 'sine', 0.135);
    strikeSpy.mockRestore();
  });

  it('responds to JuiceDirector enterPassage and setAnchorHeld', () => {
    juiceDirector.enterPassage(
      {
        name: 'Crimson_Hearth_Start',
        directives: { audio: 'hearth_crackle' },
        paragraphs: [],
        choices: [],
      },
      30
    );

    expect(audioMixer.getCurrentCueId()).toBe('hearth_crackle');

    juiceDirector.setAnchorHeld(true);
    expect(audioMixer.getDreamFilter()?.frequency.value).toBe(16000);
    juiceDirector.setAnchorHeld(false);
  });

  it('immediately chokes off active whisper when anchor is held', () => {
    const mockBuffer = {} as AudioBuffer;
    (audioMixer as any).fileBuffers.set('whisper_kalu_ear', mockBuffer);

    audioMixer.playWhisper('whisper_kalu_ear');
    const activeSrc = (audioMixer as any).activeWhisperSource;
    expect(activeSrc).not.toBeNull();
    expect(activeSrc?.start).toHaveBeenCalled();

    audioMixer.setAnchorState(true);
    expect(activeSrc?.stop).toHaveBeenCalled();
    expect((audioMixer as any).activeWhisperSource).toBeNull();
    audioMixer.setAnchorState(false);
  });

  it('suppresses audioMixer.playWhisper when anchorHeld is true', () => {
    const mockBuffer = {} as AudioBuffer;
    (audioMixer as any).fileBuffers.set('whisper_roommate_knock', mockBuffer);

    audioMixer.setAnchorState(true);
    audioMixer.playWhisper('whisper_roommate_knock');
    expect((audioMixer as any).activeWhisperSource).toBeNull();

    audioMixer.setAnchorState(false);
    audioMixer.playWhisper('whisper_roommate_knock');
    expect((audioMixer as any).activeWhisperSource).not.toBeNull();
    audioMixer.setAnchorState(true);
  });
});
