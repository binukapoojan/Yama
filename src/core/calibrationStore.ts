// src/core/calibrationStore.ts

export type WickNotch = 0 | 1 | 2 | 3;

export interface LampCalibrationSettings {
  ambientNotch: WickNotch;
  whisperNotch: WickNotch;
  temperedFlicker: boolean;
  elderFolioScale: boolean;
}

export const CALIBRATION_STORAGE_KEY = 'after_monsoon_wick_calibration_v1';

const NOTCH_GAIN_MAP: Record<WickNotch, number> = {
  0: 0.0,
  1: 0.35,
  2: 0.72,
  3: 1.0,
};

const DEFAULT_SETTINGS: LampCalibrationSettings = {
  ambientNotch: 2,
  whisperNotch: 3,
  temperedFlicker: false,
  elderFolioScale: false,
};

type CalibrationListener = (settings: LampCalibrationSettings) => void;
const listeners: Set<CalibrationListener> = new Set();

export function loadCalibrationSettings(): LampCalibrationSettings {
  if (typeof window === 'undefined' || !window.localStorage) return { ...DEFAULT_SETTINGS };
  try {
    const raw = window.localStorage.getItem(CALIBRATION_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const p = JSON.parse(raw) as Partial<LampCalibrationSettings>;
    return {
      ambientNotch: ([0, 1, 2, 3].includes(p.ambientNotch as number) ? p.ambientNotch : 2) as WickNotch,
      whisperNotch: ([0, 1, 2, 3].includes(p.whisperNotch as number) ? p.whisperNotch : 3) as WickNotch,
      temperedFlicker: Boolean(p.temperedFlicker),
      elderFolioScale: Boolean(p.elderFolioScale),
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function applyCalibrationToDocument(settings: LampCalibrationSettings): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.style.setProperty('--folio-font-size', settings.elderFolioScale ? '18px' : '16px');
  root.dataset.temperedWick = settings.temperedFlicker ? 'true' : 'false';
  if (settings.temperedFlicker) root.style.setProperty('--dummala-filter', 'none');
}

export function saveCalibrationSettings(next: LampCalibrationSettings): LampCalibrationSettings {
  if (typeof window !== 'undefined' && window.localStorage) {
    try { window.localStorage.setItem(CALIBRATION_STORAGE_KEY, JSON.stringify(next)); } catch {}
  }
  applyCalibrationToDocument(next);
  listeners.forEach((fn) => fn(next));
  return next;
}

export function getNotchGain(notch: WickNotch): number {
  return NOTCH_GAIN_MAP[notch] ?? 0.72;
}

export function subscribeCalibration(fn: CalibrationListener): () => void {
  listeners.add(fn);
  const current = loadCalibrationSettings();
  applyCalibrationToDocument(current);
  fn(current);
  return () => listeners.delete(fn);
}
