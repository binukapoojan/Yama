// @vitest-environment jsdom
// src/core/__tests__/steamBridge.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  evaluateAndSyncSteamAchievements,
  getUnlockedSteamAchievements,
  STEAM_ACH_STORAGE_KEY,
  unlockSteamAchievement,
} from '../steamBridge';

describe('Tauri v2 & Steamworks Achievement Bridge', () => {
  beforeEach(() => {
    window.localStorage.removeItem(STEAM_ACH_STORAGE_KEY);
    delete (window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__;
  });

  afterEach(() => {
    window.localStorage.removeItem(STEAM_ACH_STORAGE_KEY);
    delete (window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__;
  });

  it('unlocks achievements idempotently and invokes Tauri IPC when running in desktop wrapper', async () => {
    const invokeMock = vi.fn().mockResolvedValue(true);
    (window as unknown as { __TAURI_INTERNALS__: { invoke: typeof invokeMock } }).__TAURI_INTERNALS__ = {
      invoke: invokeMock,
    };

    const first = await unlockSteamAchievement('ACH_KATTADIYA_CF01');
    const second = await unlockSteamAchievement('ACH_KATTADIYA_CF01');

    expect(first).toBe(true);
    expect(second).toBe(false);
    expect(invokeMock).toHaveBeenCalledTimes(1);
    expect(invokeMock).toHaveBeenCalledWith('unlock_steam_achievement', { id: 'ACH_KATTADIYA_CF01' });
    expect(getUnlockedSteamAchievements()).toEqual(['ACH_KATTADIYA_CF01']);
  });

  it('evaluates Kattadiya lineages, Huniyam unsealing, and Sovereign Cut finale achievements', () => {
    const triggered = evaluateAndSyncSteamAchievements({
      passageId: 'Outcome_Huniyam_Sovereign_Cut',
      unlockedKattadiya: ['CF01', 'CF02', 'CF03', 'CF04'],
      discoveredIds: Array.from({ length: 12 }, (_, i) => `ID_${i}`),
      sufferedScars: ['Outcome_Athura_Mirror_Entombed'],
    });

    expect(triggered).toContain('ACH_KATTADIYA_CF01');
    expect(triggered).toContain('ACH_HUNIYAM_UNSEALED');
    expect(triggered).toContain('ACH_SOVEREIGN_CUT');
    expect(triggered).toContain('ACH_PUSKOLA_INITIATE');
    expect(triggered).toContain('ACH_FIRST_MEMORY_SCAR');
  });
});
