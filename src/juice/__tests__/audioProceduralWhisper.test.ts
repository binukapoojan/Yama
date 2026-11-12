// src/juice/__tests__/audioProceduralWhisper.test.ts
import { describe, expect, it, vi } from 'vitest';
import * as audioHelpers from '../audioHelpers';
import { playProceduralWhisper } from '../audioHelpers';
import { audioMixer } from '../audioMixer';

describe('Dual-Formant Procedural Whisper Fallback', () => {
  it('synthesizes two-syllable glottal whisper through dual formant filters', () => {
    const mockChannelData = new Float32Array(512);
    const mockBuffer = { getChannelData: vi.fn(() => mockChannelData) };
    const formant1 = {
      type: '',
      Q: { value: 0 },
      frequency: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
    };
    const formant2 = {
      type: '',
      Q: { value: 0 },
      frequency: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
    };
    const mockGain = {
      gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(),
    };
    const mockSrc = { buffer: null, connect: vi.fn(), start: vi.fn(), stop: vi.fn() };

    let filterCount = 0;
    const mockCtx = {
      sampleRate: 44100,
      currentTime: 3.0,
      createBuffer: vi.fn(() => mockBuffer),
      createBufferSource: vi.fn(() => mockSrc),
      createBiquadFilter: vi.fn(() => {
        filterCount++;
        return filterCount === 1 ? formant1 : formant2;
      }),
      createGain: vi.fn(() => mockGain),
    } as unknown as AudioContext;

    const mockDest = {} as unknown as AudioNode;

    playProceduralWhisper(mockCtx, mockDest);

    expect(mockCtx.createBuffer).toHaveBeenCalled();
    expect(formant1.type).toBe('bandpass');
    expect(formant1.frequency.setValueAtTime).toHaveBeenCalledWith(780, 3.0);
    expect(formant2.frequency.setValueAtTime).toHaveBeenCalledWith(1950, 3.0);
    expect(mockGain.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0.28, 3.08);
    expect(mockSrc.start).toHaveBeenCalledWith(3.0);
  });

  it('triggers procedural whisper when stem audio buffer is absent from disk', () => {
    const whisperSpy = vi.spyOn(audioHelpers, 'playProceduralWhisper').mockImplementation(() => {});
    const fallbackSpy = vi.fn();

    audioMixer.playWhisper('whisper_oddisa_gate', fallbackSpy);
    expect(fallbackSpy).toHaveBeenCalled();

    whisperSpy.mockRestore();
  });
});
