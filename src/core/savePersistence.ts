import { App as CapApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { BulathHurullaPayload, CasefileId } from './bulathCodec';
import { getInitialWebBulath } from './deepLinkRouter';
import { RuntimeVariables, StoryGraph } from './schema';

const STORAGE_KEY = 'aftermonsoon_puskola_ledger_v1';

export const CASEFILE_META: Record<
  CasefileId,
  { title: string; athuraStart: string; kattadiyaStart: string }
> = {
  CF01: { title: 'I · Kalu Kumara', athuraStart: 'Dusk_Balcony_Check', kattadiyaStart: 'Kattadiya_Sastra_Entry' },
  CF02: { title: 'II · Mala Mohini', athuraStart: 'Upper_Lake_Mist_Start', kattadiyaStart: 'Kattadiya_Mohini_Entry' },
  CF03: { title: 'III · Riri Yaka', athuraStart: 'Crimson_Hearth_Start', kattadiyaStart: 'Kattadiya_Riri_Entry' },
  CF04: { title: 'IV · Mahasona', athuraStart: 'Crossroads_Midnight_Start', kattadiyaStart: 'Kattadiya_Mahasona_Entry' },
};

export interface SessionSnapshot {
  version: 1;
  casefile: CasefileId;
  passageId: string;
  runtimeState: RuntimeVariables;
  updatedAt: number;
}

export function buildStateFromBulath(p: BulathHurullaPayload): RuntimeVariables {
  const s: RuntimeVariables = { tanikama: p.tanikama, balma: p.balma, samayam_velava: 'MADDHAMA_MIDNIGHT' };
  p.blemishes.forEach((b) => { s[b.tabooKey] = true; });
  return s;
}

export function saveSessionSnapshot(casefile: CasefileId, passageId: string, runtimeState: RuntimeVariables): void {
  if (typeof window === 'undefined') return;
  try {
    const payload: SessionSnapshot = { version: 1, casefile, passageId, runtimeState, updatedAt: Date.now() };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch { /* Ignore storage quota or private-browsing blocks */ }
}

export function loadSessionSnapshot(stories: Partial<Record<CasefileId, StoryGraph>>): SessionSnapshot | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<SessionSnapshot>;
    if (p.version !== 1 || !p.casefile || !p.passageId || !p.runtimeState || !stories[p.casefile]?.[p.passageId]) return null;
    return p as SessionSnapshot;
  } catch { return null; }
}

export function resolveInitialSession(stories: Partial<Record<CasefileId, StoryGraph>>): {
  casefile: CasefileId;
  passageId: string;
  runtimeState: RuntimeVariables;
} {
  const incomingBulath = getInitialWebBulath();
  if (incomingBulath) {
    return { casefile: incomingBulath.casefile, passageId: CASEFILE_META[incomingBulath.casefile].kattadiyaStart, runtimeState: buildStateFromBulath(incomingBulath) };
  }
  if (typeof window !== 'undefined') {
    const c = new URLSearchParams(window.location.search).get('case') || new URLSearchParams(window.location.search).get('casefile');
    if (c === '2' || c === '02' || c?.toLowerCase() === 'mohini') {
      return { casefile: 'CF02', passageId: CASEFILE_META.CF02.athuraStart, runtimeState: { tanikama: 50, balma: 20, samayam_velava: 'MADDHAMA_MIDNIGHT' } };
    }
    if (c === '3' || c === '03' || c?.toLowerCase() === 'riri' || c?.toLowerCase() === 'riri_yaka') {
      return { casefile: 'CF03', passageId: CASEFILE_META.CF03.athuraStart, runtimeState: { tanikama: 50, balma: 20, samayam_velava: 'SANDHYA_DUSK' } };
    }
    if (c === '4' || c === '04' || c?.toLowerCase() === 'mahasona') {
      return { casefile: 'CF04', passageId: CASEFILE_META.CF04.athuraStart, runtimeState: { tanikama: 50, balma: 20, samayam_velava: 'MADDHAMA_MIDNIGHT' } };
    }
  }
  const saved = loadSessionSnapshot(stories);
  if (saved) return { casefile: saved.casefile, passageId: saved.passageId, runtimeState: saved.runtimeState };
  return { casefile: 'CF01', passageId: CASEFILE_META.CF01.athuraStart, runtimeState: { tanikama: 50, balma: 20, samayam_velava: 'SANDHYA_DUSK' } };
}

export function bindLifecycleFlush(onFlush: () => void): () => void {
  const handleVisibility = () => { if (document.visibilityState === 'hidden') onFlush(); };
  window.addEventListener('visibilitychange', handleVisibility);
  window.addEventListener('pagehide', onFlush);
  let capHandle: { remove: () => Promise<void> } | null = null;
  if (Capacitor.isNativePlatform()) {
    CapApp.addListener('appStateChange', ({ isActive }) => { if (!isActive) onFlush(); }).then((h) => { capHandle = h; });
  }
  return () => {
    window.removeEventListener('visibilitychange', handleVisibility);
    window.removeEventListener('pagehide', onFlush);
    capHandle?.remove().catch(() => {});
  };
}
