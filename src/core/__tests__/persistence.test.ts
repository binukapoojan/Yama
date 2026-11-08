// src/core/__tests__/persistence.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CasefileId, encodeBulathPayload } from '../bulathCodec';
import { loadDiscoveredCompendium, syncRuntimeToCompendium } from '../compendiumStore';
import {
  bindLifecycleFlush,
  CASEFILE_META,
  loadSessionSnapshot,
  resolveInitialSession,
  saveSessionSnapshot,
} from '../savePersistence';
import { StoryGraph } from '../schema';
import { parseTweeStory } from '../twineParser';

const MOCK_STORIES: Record<CasefileId, StoryGraph> = {
  CF01: parseTweeStory(':: Dusk_Balcony_Check\nCF01 Start.\n:: Kattadiya_Sastra_Entry\nCF01 Triage.\n:: Outcome_Athura_Possessed\nCF01 Possessed.'),
  CF02: parseTweeStory(':: Upper_Lake_Mist_Start\nCF02 Start.\n:: Kattadiya_Mohini_Entry\nCF02 Triage.\n:: Midnight_Kesel_Kanda_Severance\nCF02 Climax.'),
  CF03: parseTweeStory(':: Crimson_Hearth_Start\nCF03 Start.\n:: Kattadiya_Riri_Entry\nCF03 Triage.\n:: Outcome_Athura_Riri_Drained\nCF03 Drained.'),
  CF04: parseTweeStory(':: Crossroads_Midnight_Start\nCF04 Start.\n:: Kattadiya_Mahasona_Entry\nCF04 Triage.\n:: Midnight_Gothaimbara_Varama\nCF04 Climax.'),
};

function setupMockDom(search = '') {
  const store = new Map<string, string>();
  const listeners = new Map<string, Set<() => void>>();
  vi.stubGlobal('document', { visibilityState: 'visible' });
  vi.stubGlobal('window', {
    location: { search, origin: 'https://kalukumara.aftermonsoon.lk', pathname: '/' },
    localStorage: {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => store.set(k, v),
    },
    addEventListener: (evt: string, fn: () => void) => {
      if (!listeners.has(evt)) listeners.set(evt, new Set());
      listeners.get(evt)!.add(fn);
    },
    removeEventListener: (evt: string, fn: () => void) => listeners.get(evt)?.delete(fn),
  });
  return { emitWindowEvent: (evt: string) => listeners.get(evt)?.forEach((fn) => fn()) };
}

describe('savePersistence: 4-Casefile Hydration, Deep-Link Override & Lifecycle Flush', () => {
  beforeEach(() => setupMockDom(''));

  it('falls back to a fresh CF01 Athura run when storage and URL are empty or corrupted', () => {
    expect(resolveInitialSession(MOCK_STORIES)).toEqual({
      casefile: 'CF01',
      passageId: CASEFILE_META.CF01.athuraStart,
      runtimeState: { tanikama: 50, balma: 20, samayam_velava: 'SANDHYA_DUSK' },
    });
    window.localStorage.setItem('aftermonsoon_puskola_ledger_v1', '{corrupted-json');
    expect(loadSessionSnapshot(MOCK_STORIES)).toBeNull();
  });

  it('hydrates valid CF03/CF04 saves and rejects renamed or deleted Twine passages', () => {
    saveSessionSnapshot('CF04', 'Crossroads_Midnight_Start', { balma: 55, taboo_whistled_crossroads: true });
    expect(loadSessionSnapshot(MOCK_STORIES)?.casefile).toBe('CF04');

    saveSessionSnapshot('CF04', 'Deleted_Passage_Node', { balma: 90 });
    expect(loadSessionSnapshot(MOCK_STORIES)).toBeNull();
  });

  it('routes ?bulath= summons links directly to Kattadiya triage across CF03 & CF04', () => {
    saveSessionSnapshot('CF01', 'Dusk_Balcony_Check', { balma: 15 });
    const { urlParam } = encodeBulathPayload(
      { taboo_stepped_ash_pot: true, taboo_cursed_boar_shadow: true, balma: 88, tanikama: 76 },
      'CF04'
    );
    setupMockDom(`?bulath=${urlParam}`);

    const session = resolveInitialSession(MOCK_STORIES);
    expect(session.casefile).toBe('CF04');
    expect(session.passageId).toBe('Kattadiya_Mahasona_Entry');
    expect(session.runtimeState.taboo_stepped_ash_pot).toBe(true);
    expect(session.runtimeState.balma).toBe(88);
  });

  it('flushes session state on visibilitychange (hidden) and pagehide', () => {
    const { emitWindowEvent } = setupMockDom('');
    const onFlush = vi.fn();
    const unbind = bindLifecycleFlush(onFlush);
    (document as { visibilityState: string }).visibilityState = 'hidden';
    emitWindowEvent('visibilitychange');
    emitWindowEvent('pagehide');
    expect(onFlush).toHaveBeenCalledTimes(2);
    unbind();
  });
});

describe('compendiumStore: Cumulative Unlocking Across All 4 Folios (CF01-CF04)', () => {
  beforeEach(() => setupMockDom(''));

  it('accumulates Lakunu and gates all 4 demon Avatara until climax/outcome passages', () => {
    syncRuntimeToCompendium({ taboo_sweet_snacks: true, taboo_laundry: true }, 'CF01', 'Outcome_Athura_Possessed');
    syncRuntimeToCompendium({ taboo_met_eyes: true }, 'CF02', 'Midnight_Kesel_Kanda_Severance');
    syncRuntimeToCompendium({ taboo_fried_pulutu: true }, 'CF03', 'Outcome_Athura_Riri_Drained');
    const allFour = syncRuntimeToCompendium(
      { taboo_stepped_ash_pot: true, taboo_cursed_boar_shadow: true },
      'CF04',
      'Midnight_Gothaimbara_Varama'
    );

    expect(allFour).toEqual(
      expect.arrayContaining(['VATHA_KUMARA', 'MALA_MOHINI', 'MARU_RIRI', 'MAHA_SOHONA', 'taboo_stepped_ash_pot'])
    );
    expect(loadDiscoveredCompendium()).toHaveLength(10);
  });
});
