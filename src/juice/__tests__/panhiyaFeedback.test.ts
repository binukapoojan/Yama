// src/juice/__tests__/panhiyaFeedback.test.ts
import { describe, expect, it, vi } from 'vitest';
import { playFrictionScratch } from '../audioHelpers';
import { audioMixer } from '../audioMixer';
import { hapticEngine } from '../hapticEngine';
import { juiceDirector } from '../JuiceDirector';
import { triggerStylusScratch } from '../panhiyaFeedback';
import { wardFatigue } from '../wardFatigue';

describe('Panhiya Stylus Audio-Haptic Feedback', () => {
  it('synthesizes dry fiber friction scratch without errors in Web Audio', () => {
    const mockChannelData = new Float32Array(512);
    const mockBuffer = {
      getChannelData: vi.fn(() => mockChannelData),
    };
    const mockFilter = {
      type: '',
      Q: { value: 0 },
      frequency: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    };
    const mockGain = {
      gain: {
        setValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    };
    const mockSrc = {
      buffer: null,
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    };

    const mockCtx = {
      sampleRate: 44100,
      currentTime: 1.5,
      createBuffer: vi.fn(() => mockBuffer),
      createBufferSource: vi.fn(() => mockSrc),
      createBiquadFilter: vi.fn(() => mockFilter),
      createGain: vi.fn(() => mockGain),
    } as unknown as AudioContext;

    const mockDest = {} as unknown as AudioNode;

    // Test cold stylus scratch
    playFrictionScratch(mockCtx, mockDest, 0.1, 1.0);
    expect(mockCtx.createBuffer).toHaveBeenCalled();
    expect(mockFilter.type).toBe('bandpass');
    const [coldFreq, coldTime] = mockFilter.frequency.setValueAtTime.mock.calls[0];
    expect(coldFreq).toBeGreaterThan(2800);
    expect(coldFreq).toBeLessThan(3700);
    expect(coldTime).toBe(1.5);

    expect(mockGain.gain.linearRampToValueAtTime).toHaveBeenCalledWith(
      expect.closeTo(0.24, 2),
      1.506
    );
    expect(mockSrc.start).toHaveBeenCalledWith(1.5);

    // Test heated stylus scratch (>0.5 heat)
    playFrictionScratch(mockCtx, mockDest, 0.85, 1.0);
    const [hotFreq] = mockFilter.frequency.setValueAtTime.mock.calls[1];
    expect(hotFreq).toBeGreaterThan(3900);
    expect(hotFreq).toBeLessThan(5100);
  });

  it('triggers both audioMixer and juiceDirector haptics via triggerStylusScratch', () => {
    const playScratchSpy = vi.spyOn(audioMixer, 'playStylusScratch').mockImplementation(() => {});
    const hapticSpy = vi.spyOn(juiceDirector, 'triggerHaptic').mockImplementation(() => {});

    wardFatigue.reset();
    triggerStylusScratch();

    expect(playScratchSpy).toHaveBeenCalledWith(0);
    expect(hapticSpy).toHaveBeenCalledWith('stylus_scratch');

    playScratchSpy.mockRestore();
    hapticSpy.mockRestore();
  });

  it('passes elevated thermal heat when Cold Iron Ward is held', () => {
    const playScratchSpy = vi.spyOn(audioMixer, 'playStylusScratch').mockImplementation(() => {});
    const hapticSpy = vi.spyOn(juiceDirector, 'triggerHaptic').mockImplementation(() => {});

    wardFatigue.reset();
    wardFatigue.requestHold();
    vi.spyOn(wardFatigue, 'getSnapshot').mockReturnValue({ heat: 80, scalded: false, holding: true });

    triggerStylusScratch();
    expect(playScratchSpy).toHaveBeenCalledWith(0.8);

    playScratchSpy.mockRestore();
    hapticSpy.mockRestore();
    vi.restoreAllMocks();
    wardFatigue.reset();
  });

  it('dispatches light web vibration for stylus_scratch on web platforms', async () => {
    if (!('vibrate' in navigator)) {
      (navigator as any).vibrate = vi.fn();
    }
    const vibrateSpy = vi.spyOn(navigator, 'vibrate').mockImplementation(() => true);

    await hapticEngine.trigger('stylus_scratch');
    expect(vibrateSpy).toHaveBeenCalledWith([14]);
    vibrateSpy.mockRestore();
  });
});
