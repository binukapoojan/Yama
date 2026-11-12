// src/core/__tests__/calibrationStore.test.ts
import { beforeEach, describe, expect, it } from 'vitest';
import {
  CALIBRATION_STORAGE_KEY,
  getNotchGain,
  loadCalibrationSettings,
  saveCalibrationSettings,
} from '../calibrationStore';

const storage: Record<string, string> = {};
const localStorageMock = {
  getItem: (k: string) => storage[k] ?? null,
  setItem: (k: string, v: string) => { storage[k] = v; },
  removeItem: (k: string) => { delete storage[k]; },
  clear: () => { Object.keys(storage).forEach((k) => delete storage[k]); },
};

const styleMap: Record<string, string> = {};
const datasetMap: Record<string, string> = {};

(globalThis as any).window = { localStorage: localStorageMock };
(globalThis as any).document = {
  documentElement: {
    style: {
      setProperty: (k: string, v: string) => { styleMap[k] = v; },
      getPropertyValue: (k: string) => styleMap[k] ?? '',
      removeProperty: (k: string) => { delete styleMap[k]; },
    },
    dataset: datasetMap,
  },
};

describe('Diegetic Pahana Wick Calibration Store', () => {
  beforeEach(() => {
    localStorageMock.clear();
    Object.keys(styleMap).forEach((k) => delete styleMap[k]);
    Object.keys(datasetMap).forEach((k) => delete datasetMap[k]);
  });

  it('returns balanced default wick notches when storage is empty', () => {
    const def = loadCalibrationSettings();
    expect(def.ambientNotch).toBe(2);
    expect(def.whisperNotch).toBe(3);
    expect(def.temperedFlicker).toBe(false);
    expect(def.elderFolioScale).toBe(false);
  });

  it('persists wick notches and applies Elder Folio & Tempered Wick attributes to documentElement', () => {
    saveCalibrationSettings({
      ambientNotch: 1,
      whisperNotch: 0,
      temperedFlicker: true,
      elderFolioScale: true,
    });

    expect(storage[CALIBRATION_STORAGE_KEY]).toBeDefined();
    const loaded = loadCalibrationSettings();
    expect(loaded.ambientNotch).toBe(1);
    expect(loaded.whisperNotch).toBe(0);
    expect(getNotchGain(loaded.whisperNotch)).toBe(0);
    expect(document.documentElement.style.getPropertyValue('--folio-font-size')).toBe('18px');
    expect(document.documentElement.dataset.temperedWick).toBe('true');
  });
});
