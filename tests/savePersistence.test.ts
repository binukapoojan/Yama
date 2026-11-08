import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveSessionSnapshot,
  loadSessionSnapshot,
  resolveInitialSession,
  buildStateFromBulath,
} from '../src/core/savePersistence';
import { StoryGraph } from '../src/core/schema';
import { BulathHurullaPayload } from '../src/core/bulathCodec';

const storage: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => storage[key] ?? null,
  setItem: (key: string, val: string) => {
    storage[key] = val;
  },
  clear: () => {
    Object.keys(storage).forEach((k) => delete storage[k]);
  },
};

(globalThis as any).window = {
  localStorage: localStorageMock,
  location: { search: '' },
};

describe('Save Persistence & Session Hydration', () => {
  const mockStories: Record<'CF01' | 'CF02', StoryGraph> = {
    CF01: {
      Dusk_Balcony_Check: { name: 'Dusk_Balcony_Check', directives: {}, paragraphs: [], choices: [] },
      Kattadiya_Sastra_Entry: { name: 'Kattadiya_Sastra_Entry', directives: {}, paragraphs: [], choices: [] },
    },
    CF02: {
      Upper_Lake_Mist_Start: { name: 'Upper_Lake_Mist_Start', directives: {}, paragraphs: [], choices: [] },
      Kattadiya_Mohini_Entry: { name: 'Kattadiya_Mohini_Entry', directives: {}, paragraphs: [], choices: [] },
    },
  };

  beforeEach(() => {
    localStorageMock.clear();
    (globalThis as any).window.location.search = '';
  });

  it('saves session snapshot to localStorage and loads it successfully', () => {
    saveSessionSnapshot('CF01', 'Dusk_Balcony_Check', { tanikama: 40, balma: 30, taboo_laundry: true });
    const loaded = loadSessionSnapshot(mockStories);
    expect(loaded).not.toBeNull();
    expect(loaded?.casefile).toBe('CF01');
    expect(loaded?.passageId).toBe('Dusk_Balcony_Check');
    expect(loaded?.runtimeState.balma).toBe(30);
    expect(loaded?.runtimeState.taboo_laundry).toBe(true);
  });

  it('returns null if saved passage no longer exists in story graph', () => {
    saveSessionSnapshot('CF01', 'Deleted_Or_Renamed_Passage', { tanikama: 50, balma: 20 });
    const loaded = loadSessionSnapshot(mockStories);
    expect(loaded).toBeNull();
  });

  it('buildStateFromBulath sets MADDHAMA_MIDNIGHT and maps all taboo blemishes', () => {
    const payload: BulathHurullaPayload = {
      version: 1,
      casefile: 'CF01',
      avatar: 'HANDUN_KUMARA',
      tanikama: 60,
      balma: 35,
      blemishes: [
        { type: 'tear', position: 'top', tabooKey: 'taboo_laundry' },
        { type: 'fold', position: 'left', tabooKey: 'taboo_bathed_dusk' },
      ],
      shareCode: 'BH-HK-1234',
    };
    const state = buildStateFromBulath(payload);
    expect(state.samayam_velava).toBe('MADDHAMA_MIDNIGHT');
    expect(state.tanikama).toBe(60);
    expect(state.balma).toBe(35);
    expect(state.taboo_laundry).toBe(true);
    expect(state.taboo_bathed_dusk).toBe(true);
  });

  it('resolveInitialSession returns saved session if localStorage is valid', () => {
    saveSessionSnapshot('CF02', 'Upper_Lake_Mist_Start', { tanikama: 45, balma: 25 });
    const session = resolveInitialSession(mockStories);
    expect(session.casefile).toBe('CF02');
    expect(session.passageId).toBe('Upper_Lake_Mist_Start');
    expect(session.runtimeState.tanikama).toBe(45);
  });

  it('resolveInitialSession falls back to default CF01 when localStorage is empty', () => {
    const session = resolveInitialSession(mockStories);
    expect(session.casefile).toBe('CF01');
    expect(session.passageId).toBe('Dusk_Balcony_Check');
    expect(session.runtimeState.samayam_velava).toBe('SANDHYA_DUSK');
  });
});
