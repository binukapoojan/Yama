import { RuntimeVariables } from './schema';

export type AvatarType = 'HANDUN_KUMARA' | 'VATHA_KUMARA' | 'MALA_MOHINI' | 'RATI_MOHINI';
export type KaluKumaraAvatar = AvatarType;
export type CasefileId = 'CF01' | 'CF02';
export type BlemishType = 'DARK_BRUISE' | 'VEIN_KNOT' | 'PINHOLE_TEAR' | 'OILY_SHEEN' | 'STEM_ROT';

export interface BulathBlemish {
  id: string;
  tabooKey: string;
  type: BlemishType;
  x: number;
  y: number;
}

export interface BulathHurullaPayload {
  shareCode: string;
  avatar: AvatarType;
  veinCountLeft: number;
  veinCountRight: number;
  balma: number;
  tanikama: number;
  blemishes: BulathBlemish[];
}

const TABOO_MAP: ReadonlyArray<{
  bit: number; key: string; alias: string; type: BlemishType; x: number; y: number;
}> = [
  { bit: 1 << 0, key: 'taboo_bathed_dusk', alias: 'taboo_walked_samayam', type: 'DARK_BRUISE', x: 0.50, y: 0.20 },
  { bit: 1 << 1, key: 'taboo_hair_unbound', alias: 'taboo_answered_call', type: 'VEIN_KNOT', x: 0.35, y: 0.38 },
  { bit: 1 << 2, key: 'taboo_mirror_unshrouded', alias: 'taboo_met_eyes', type: 'PINHOLE_TEAR', x: 0.50, y: 0.52 },
  { bit: 1 << 3, key: 'taboo_sweet_snacks', alias: 'taboo_mirrored_gesture', type: 'OILY_SHEEN', x: 0.66, y: 0.60 },
  { bit: 1 << 4, key: 'taboo_laundry', alias: 'taboo_accepted_bundle', type: 'STEM_ROT', x: 0.50, y: 0.79 },
];

const AVATAR_TO_PREFIX: Record<AvatarType, string> = {
  HANDUN_KUMARA: 'HK', VATHA_KUMARA: 'VK', MALA_MOHINI: 'MM', RATI_MOHINI: 'RM',
};
const PREFIX_TO_AVATAR: Record<string, AvatarType> = {
  HK: 'HANDUN_KUMARA', VK: 'VATHA_KUMARA', MM: 'MALA_MOHINI', RM: 'RATI_MOHINI',
};

export function encodeBulathPayload(state: RuntimeVariables): {
  urlParam: string;
  payload: BulathHurullaPayload;
} {
  const has = (k: string) => state[k] === true || state[`$${k}`] === true;
  let mask = 0;
  for (const item of TABOO_MAP) if (has(item.key) || has(item.alias)) mask |= item.bit;
  const isMohini = TABOO_MAP.some((item) => has(item.alias));
  const balma = Math.max(0, Math.min(100, Math.round(Number(state.balma ?? 20))));
  const tanikama = Math.max(0, Math.min(100, Math.round(Number(state.tanikama ?? 50))));

  const payload = buildPayloadFromBits(mask, balma, tanikama, isMohini);
  const rawToken = `${mask}.${balma}.${tanikama}${isMohini ? '.M' : ''}`;
  const urlParam = typeof btoa !== 'undefined' ? btoa(rawToken).replace(/=+$/, '') : rawToken;
  return { urlParam, payload };
}

export function decodeBulathPayload(input: string): BulathHurullaPayload | null {
  const cleaned = input.trim();
  const codeMatch = /^BH-(HK|VK|MM|RM)-([0-9A-F]{2})([0-9A-F]{2})$/i.exec(cleaned);
  if (codeMatch) {
    const p = codeMatch[1].toUpperCase();
    const mask = parseInt(codeMatch[2], 16), balma = parseInt(codeMatch[3], 16);
    return buildPayloadFromBits(mask, balma, 65, p === 'MM' || p === 'RM', PREFIX_TO_AVATAR[p]);
  }
  try {
    const decoded = typeof atob !== 'undefined' ? atob(cleaned) : cleaned;
    const [mStr, bStr, tStr, mFlag] = decoded.split('.');
    const mask = parseInt(mStr, 10), balma = parseInt(bStr, 10), tanikama = parseInt(tStr, 10);
    if (Number.isNaN(mask) || Number.isNaN(balma)) return null;
    return buildPayloadFromBits(mask, balma, Number.isNaN(tanikama) ? 65 : tanikama, mFlag === 'M');
  } catch {
    return null;
  }
}

function buildPayloadFromBits(
  mask: number, balma: number, tanikama: number, isMohini = false, forcedAvatar?: AvatarType
): BulathHurullaPayload {
  const blemishes: BulathBlemish[] = [];
  for (const item of TABOO_MAP) {
    if ((mask & item.bit) !== 0) {
      const tabooKey = isMohini ? item.alias : item.key;
      blemishes.push({ id: `blemish_${tabooKey}`, tabooKey, type: item.type, x: item.x, y: item.y });
    }
  }
  const sensoryScore = (mask & 1 ? 1 : 0) + (mask & 2 ? 1 : 0) + (mask & 4 ? 1 : 0);
  const physicalScore = (mask & 8 ? 1 : 0) + (mask & 16 ? 1 : 0);
  const avatar: AvatarType = forcedAvatar ?? (isMohini
    ? physicalScore > sensoryScore ? 'RATI_MOHINI' : 'MALA_MOHINI'
    : physicalScore > sensoryScore ? 'VATHA_KUMARA' : 'HANDUN_KUMARA');

  const prefix = AVATAR_TO_PREFIX[avatar];
  const hexMask = (mask & 0x1f).toString(16).toUpperCase().padStart(2, '0');
  const hexBalma = Math.min(255, balma).toString(16).toUpperCase().padStart(2, '0');

  return {
    shareCode: `BH-${prefix}-${hexMask}${hexBalma}`,
    avatar,
    veinCountLeft: 3 + (mask & 0x03),
    veinCountRight: 3 + ((mask >> 2) & 0x03),
    balma,
    tanikama,
    blemishes,
  };
}
