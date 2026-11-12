// src/core/steamBridge.ts
import { CasefileId } from './bulathCodec';

export const STEAM_ACH_STORAGE_KEY = 'after_monsoon_steam_ach_v1';

export type SteamAchievementId =
  | 'ACH_KATTADIYA_CF01'
  | 'ACH_KATTADIYA_CF02'
  | 'ACH_KATTADIYA_CF03'
  | 'ACH_KATTADIYA_CF04'
  | 'ACH_HUNIYAM_UNSEALED'
  | 'ACH_SOVEREIGN_CUT'
  | 'ACH_PUSKOLA_INITIATE'
  | 'ACH_PUSKOLA_MASTER'
  | 'ACH_FIRST_MEMORY_SCAR'
  | 'ACH_ABYSSAL_VETERAN';

interface TauriInternals {
  invoke: (cmd: string, args?: Record<string, unknown>) => Promise<unknown>;
}

function getTauriInternals(): TauriInternals | null {
  if (typeof window === 'undefined') return null;
  const win = window as unknown as { __TAURI_INTERNALS__?: TauriInternals };
  return win.__TAURI_INTERNALS__ ?? null;
}

export function getUnlockedSteamAchievements(): SteamAchievementId[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(STEAM_ACH_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SteamAchievementId[]) : [];
  } catch {
    return [];
  }
}

export async function unlockSteamAchievement(id: SteamAchievementId): Promise<boolean> {
  const current = getUnlockedSteamAchievements();
  if (current.includes(id)) return false;

  const next = [...current, id];
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(STEAM_ACH_STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* Ignore storage quota errors */
    }
  }

  const tauri = getTauriInternals();
  if (tauri) {
    try {
      await tauri.invoke('unlock_steam_achievement', { id });
    } catch {
      /* Steam client not running or offline mode */
    }
  }
  return true;
}

export function evaluateAndSyncSteamAchievements(params: {
  passageId?: string;
  discoveredIds?: string[];
  unlockedKattadiya?: CasefileId[];
  sufferedScars?: string[];
}): SteamAchievementId[] {
  const newlyTriggered: SteamAchievementId[] = [];
  const tryUnlock = (id: SteamAchievementId) => {
    if (!getUnlockedSteamAchievements().includes(id)) {
      newlyTriggered.push(id);
      void unlockSteamAchievement(id);
    }
  };

  const kattadiya = params.unlockedKattadiya ?? [];
  if (kattadiya.includes('CF01')) tryUnlock('ACH_KATTADIYA_CF01');
  if (kattadiya.includes('CF02')) tryUnlock('ACH_KATTADIYA_CF02');
  if (kattadiya.includes('CF03')) tryUnlock('ACH_KATTADIYA_CF03');
  if (kattadiya.includes('CF04')) tryUnlock('ACH_KATTADIYA_CF04');

  const discoveredCount = params.discoveredIds?.length ?? 0;
  if (discoveredCount >= 10) tryUnlock('ACH_PUSKOLA_INITIATE');
  if (discoveredCount >= 28) tryUnlock('ACH_PUSKOLA_MASTER');
  if (kattadiya.length >= 4 || discoveredCount >= 20) tryUnlock('ACH_HUNIYAM_UNSEALED');

  if (params.passageId === 'Outcome_Huniyam_Sovereign_Cut') {
    tryUnlock('ACH_SOVEREIGN_CUT');
  }

  const scarsCount = params.sufferedScars?.length ?? 0;
  if (scarsCount >= 1) tryUnlock('ACH_FIRST_MEMORY_SCAR');
  if (scarsCount >= 8) tryUnlock('ACH_ABYSSAL_VETERAN');

  return newlyTriggered;
}

export async function toggleDesktopFullscreen(): Promise<void> {
  const tauri = getTauriInternals();
  if (tauri) {
    try { await tauri.invoke('toggle_fullscreen'); return; } catch {}
  }
  if (typeof document !== 'undefined') {
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen?.().catch(() => {});
    else await document.exitFullscreen?.().catch(() => {});
  }
}
