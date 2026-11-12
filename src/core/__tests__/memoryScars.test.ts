// src/core/__tests__/memoryScars.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { textMutator } from '../../juice/textMutator';
import {
  clearMemoryScars,
  getScarForPassage,
  loadSufferedEndings,
  recordMemoryScarIfEnding,
} from '../memoryScars';
import { TwinePassage } from '../schema';

const storage: Record<string, string> = {};
const localStorageMock = {
  getItem: (k: string) => storage[k] ?? null,
  setItem: (k: string, v: string) => { storage[k] = v; },
  removeItem: (k: string) => { delete storage[k]; },
  clear: () => { Object.keys(storage).forEach((k) => delete storage[k]); },
};

(globalThis as any).window = { localStorage: localStorageMock };

describe('Cross-Run Memory Scars (Persistent Gaslighting)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorageMock.clear();
    clearMemoryScars();
  });

  afterEach(() => {
    clearMemoryScars();
    vi.useRealTimers();
  });

  it('records gruesome endings and activates the matching mid-run passage scar on subsequent runs', () => {
    expect(loadSufferedEndings()).toHaveLength(0);
    expect(getScarForPassage('Mirror_Gaze_Trap')).toBeNull();

    recordMemoryScarIfEnding('Outcome_Athura_Mirror_Entombed');
    expect(loadSufferedEndings()).toContain('Outcome_Athura_Mirror_Entombed');

    const scar = getScarForPassage('Mirror_Gaze_Trap');
    expect(scar).not.toBeNull();
    expect(scar?.corruptedOverride).toContain('DO NOT LET HIM DRAPE THE TOWEL');
  });

  it('hijacks the {mutate} token corruptedText in textMutator when a cross-run scar is active', () => {
    recordMemoryScarIfEnding('Outcome_Athura_Biso_Kotuwa_Pilgrim');

    const mockPassage: TwinePassage = {
      name: 'Culvert_Pilgrim_Lantern',
      directives: {},
      paragraphs: [
        [
          {
            type: 'mutate',
            id: 'tok_0',
            wakingText: 'Are you riding back to the wewa village so late, malli?',
            corruptedText: 'Unwrap the roasted boar flesh on your iron frame.',
            delayMs: 1000,
          },
        ],
      ],
      choices: [],
    };

    textMutator.loadPassage(mockPassage);
    vi.advanceTimersByTime(1100);

    const snap = textMutator.getSnapshot();
    expect(snap.tok_0.isCorrupted).toBe(true);
    expect(snap.tok_0.currentText).toContain('wearing your own grease-stained shirt');
  });
});
