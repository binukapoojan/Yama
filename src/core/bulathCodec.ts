// src/core/bulathCodec.ts
import { RuntimeVariables } from './schema';

export type CasefileId = 'CF01' | 'CF02' | 'CF03' | 'CF04' | 'CF05';
export type DemonAvatar =
  | 'HANDUN_KUMARA' | 'VATHA_KUMARA' | 'MALA_MOHINI' | 'RATI_MOHINI'
  | 'MARU_RIRI' | 'SOHON_RIRI' | 'JAYASENA_YAKA' | 'MAHA_SOHONA';
export type BlemishType = 'DARK_BRUISE' | 'VEIN_KNOT' | 'PINHOLE_TEAR' | 'OILY_SHEEN' | 'STEM_ROT';

export interface BulathBlemish {
  id: string; tabooKey: string; type: BlemishType; x: number; y: number;
}

export interface BulathHurullaPayload {
  casefile: CasefileId; shareCode: string; avatar: DemonAvatar;
  veinCountLeft: number; veinCountRight: number; balma: number; tanikama: number; blemishes: BulathBlemish[];
}

const BLEMISH_SLOTS: ReadonlyArray<{
  bit: number; keys: Record<CasefileId, string>; type: BlemishType; x: number; y: number;
}> = [
  { bit: 1 << 0, keys: { CF01: 'taboo_bathed_dusk', CF02: 'taboo_walked_samayam', CF03: 'taboo_fried_pulutu', CF04: 'taboo_whistled_crossroads', CF05: 'taboo_whistled_crossroads' }, type: 'DARK_BRUISE', x: 0.50, y: 0.20 },
  { bit: 1 << 1, keys: { CF01: 'taboo_hair_unbound', CF02: 'taboo_answered_call', CF03: 'taboo_unwashed_blood', CF04: 'taboo_carried_uncovered_meat', CF05: 'taboo_unwashed_blood' }, type: 'VEIN_KNOT', x: 0.35, y: 0.38 },
  { bit: 1 << 2, keys: { CF01: 'taboo_mirror_unshrouded', CF02: 'taboo_met_eyes', CF03: 'taboo_plucked_wadamal', CF04: 'taboo_looked_back_snap', CF05: 'taboo_looked_back_snap' }, type: 'PINHOLE_TEAR', x: 0.50, y: 0.52 },
  { bit: 1 << 3, keys: { CF01: 'taboo_sweet_snacks', CF02: 'taboo_mirrored_gesture', CF03: 'taboo_crossed_anthill', CF04: 'taboo_stepped_ash_pot', CF05: 'taboo_stepped_ash_pot' }, type: 'OILY_SHEEN', x: 0.66, y: 0.60 },
  { bit: 1 << 4, keys: { CF01: 'taboo_laundry', CF02: 'taboo_accepted_bundle', CF03: 'taboo_tasted_hearth_ash', CF04: 'taboo_cursed_boar_shadow', CF05: 'taboo_cursed_boar_shadow' }, type: 'STEM_ROT', x: 0.50, y: 0.79 },
];

export function encodeBulathPayload(
  state: RuntimeVariables,
  casefile?: CasefileId
): { urlParam: string; payload: BulathHurullaPayload } & BulathHurullaPayload {
  const has = (k: string) => state[k] === true || state[`$${k}`] === true;
  const resolved = casefile ?? (
    BLEMISH_SLOTS.some((s) => has(s.keys.CF04)) ? 'CF04' :
    BLEMISH_SLOTS.some((s) => has(s.keys.CF03)) ? 'CF03' :
    BLEMISH_SLOTS.some((s) => has(s.keys.CF02)) ? 'CF02' : 'CF01'
  );
  let mask = 0;
  for (const slot of BLEMISH_SLOTS) {
    if (has(slot.keys[resolved])) mask |= slot.bit;
  }
  const balma = Math.max(0, Math.min(100, Math.round(Number(state.balma ?? 20))));
  const tanikama = Math.max(0, Math.min(100, Math.round(Number(state.tanikama ?? 50))));

  const payload = buildPayloadFromBits(resolved, mask, balma, tanikama);
  const rawToken = `${resolved}.${mask}.${balma}.${tanikama}`;
  const urlParam = typeof btoa !== 'undefined' ? btoa(rawToken).replace(/=+$/, '') : rawToken;
  return { urlParam, payload, ...payload };
}

export function decodeBulathPayload(input: string): BulathHurullaPayload | null {
  const cleaned = input.trim();
  const codeMatch = /^BH-(HK|VK|MM|RM|MR|SR|JY|MS)-([0-9A-F]{2})([0-9A-F]{2})$/i.exec(cleaned);
  if (codeMatch) {
    const p = codeMatch[1].toUpperCase();
    const casefile: CasefileId =
      p === 'MM' || p === 'RM' ? 'CF02' : p === 'MR' || p === 'SR' ? 'CF03' : p === 'JY' || p === 'MS' ? 'CF04' : 'CF01';
    return buildPayloadFromBits(casefile, parseInt(codeMatch[2], 16), parseInt(codeMatch[3], 16), 65);
  }
  try {
    const decoded = typeof atob !== 'undefined' ? atob(cleaned) : cleaned;
    const parts = decoded.split('.');
    const hasPrefix = ['CF01', 'CF02', 'CF03', 'CF04', 'CF05'].includes(parts[0]);
    const casefile: CasefileId = hasPrefix ? (parts[0] as CasefileId) : 'CF01';
    const [mStr, bStr, tStr] = hasPrefix ? parts.slice(1) : parts;
    const mask = parseInt(mStr, 10), balma = parseInt(bStr, 10), tanikama = parseInt(tStr, 10);
    if (Number.isNaN(mask) || Number.isNaN(balma)) return null;
    return buildPayloadFromBits(casefile, mask, balma, Number.isNaN(tanikama) ? 65 : tanikama);
  } catch {
    return null;
  }
}

function buildPayloadFromBits(casefile: CasefileId, mask: number, balma: number, tanikama: number): BulathHurullaPayload {
  const blemishes: BulathBlemish[] = [];
  for (const slot of BLEMISH_SLOTS) {
    if ((mask & slot.bit) !== 0) {
      const tabooKey = slot.keys[casefile];
      blemishes.push({ id: `blemish_${tabooKey}`, tabooKey, type: slot.type, x: slot.x, y: slot.y });
    }
  }
  const sensoryScore = (mask & 1 ? 1 : 0) + (mask & 2 ? 1 : 0) + (mask & 4 ? 1 : 0);
  const physicalScore = (mask & 8 ? 1 : 0) + (mask & 16 ? 1 : 0);
  const isPhysical = physicalScore > sensoryScore;

  const avatarMap: Record<CasefileId, [DemonAvatar, DemonAvatar]> = {
    CF01: ['HANDUN_KUMARA', 'VATHA_KUMARA'], CF02: ['MALA_MOHINI', 'RATI_MOHINI'],
    CF03: ['MARU_RIRI', 'SOHON_RIRI'], CF04: ['JAYASENA_YAKA', 'MAHA_SOHONA'],
    CF05: ['JAYASENA_YAKA', 'MAHA_SOHONA'],
  };
  const avatar = avatarMap[casefile][isPhysical ? 1 : 0];
  const prefixMap: Record<DemonAvatar, string> = {
    HANDUN_KUMARA: 'HK', VATHA_KUMARA: 'VK', MALA_MOHINI: 'MM', RATI_MOHINI: 'RM',
    MARU_RIRI: 'MR', SOHON_RIRI: 'SR', JAYASENA_YAKA: 'JY', MAHA_SOHONA: 'MS',
  };
  const hexMask = (mask & 0x1f).toString(16).toUpperCase().padStart(2, '0');
  const hexBalma = Math.min(255, balma).toString(16).toUpperCase().padStart(2, '0');

  return {
    casefile, shareCode: `BH-${prefixMap[avatar]}-${hexMask}${hexBalma}`, avatar,
    veinCountLeft: 3 + (mask & 0x03), veinCountRight: 3 + ((mask >> 2) & 0x03), balma, tanikama, blemishes,
  };
}
