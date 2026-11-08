import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadDiscoveredCompendium,
  syncRuntimeToCompendium,
  PUSKOLA_ENTRIES,
} from '../src/core/compendiumStore';

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
};

describe('Puskola Compendium Store', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('contains entries for CF01, CF02, CF03, and CF04', () => {
    const cf01 = PUSKOLA_ENTRIES.filter((e) => e.casefile === 'CF01');
    const cf02 = PUSKOLA_ENTRIES.filter((e) => e.casefile === 'CF02');
    const cf03 = PUSKOLA_ENTRIES.filter((e) => e.casefile === 'CF03');
    const cf04 = PUSKOLA_ENTRIES.filter((e) => e.casefile === 'CF04');
    expect(cf01.length).toBeGreaterThan(0);
    expect(cf02.length).toBeGreaterThan(0);
    expect(cf03.length).toBeGreaterThan(0);
    expect(cf04.length).toBeGreaterThan(0);
    expect(PUSKOLA_ENTRIES.some((e) => e.id === 'HANDUN_KUMARA')).toBe(true);
    expect(PUSKOLA_ENTRIES.some((e) => e.id === 'MALA_MOHINI')).toBe(true);
    expect(PUSKOLA_ENTRIES.some((e) => e.id === 'MARU_RIRI')).toBe(true);
    expect(PUSKOLA_ENTRIES.some((e) => e.id === 'SOHON_RIRI')).toBe(true);
    expect(PUSKOLA_ENTRIES.some((e) => e.id === 'JAYASENA_YAKA')).toBe(true);
    expect(PUSKOLA_ENTRIES.some((e) => e.id === 'MAHA_SOHONA')).toBe(true);
  });

  it('returns empty array when no compendium entries are stored', () => {
    const entries = loadDiscoveredCompendium();
    expect(entries).toEqual([]);
  });

  it('syncs discovered taboo lakunu into compendium storage', () => {
    const state = {
      taboo_bathed_dusk: true,
      taboo_hair_unbound: true,
      tanikama: 50,
      balma: 20,
    };
    const synced = syncRuntimeToCompendium(state, 'CF01', 'Dusk_Balcony_Check');
    expect(synced).toContain('taboo_bathed_dusk');
    expect(synced).toContain('taboo_hair_unbound');

    const reloaded = loadDiscoveredCompendium();
    expect(reloaded).toEqual(expect.arrayContaining(['taboo_bathed_dusk', 'taboo_hair_unbound']));
  });

  it('syncs avatar on Sastra or Outcome passages when taboos are present', () => {
    const state = {
      taboo_bathed_dusk: true,
      tanikama: 50,
      balma: 20,
    };
    const synced = syncRuntimeToCompendium(state, 'CF01', 'Outcome_Athura_Possessed');
    expect(synced).toContain('HANDUN_KUMARA');
  });
});
