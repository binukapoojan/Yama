import { RuntimeVariables } from './schema';

export type KaluKumaraAvatar = 'HANDUN_KUMARA' | 'VATHA_KUMARA';
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
  avatar: KaluKumaraAvatar;
  veinCountLeft: number;
  veinCountRight: number;
  balma: number;
  tanikama: number;
  blemishes: BulathBlemish[];
}

const TABOO_MAP: ReadonlyArray<{
  bit: number;
  key: string;
  type: BlemishType;
  x: number;
  y: number;
}> = [
  { bit: 1 << 0, key: 'taboo_bathed_dusk', type: 'DARK_BRUISE', x: 0.50, y: 0.20 },
  { bit: 1 << 1, key: 'taboo_hair_unbound', type: 'VEIN_KNOT', x: 0.35, y: 0.38 },
  { bit: 1 << 2, key: 'taboo_mirror_unshrouded', type: 'PINHOLE_TEAR', x: 0.50, y: 0.52 },
  { bit: 1 << 3, key: 'taboo_sweet_snacks', type: 'OILY_SHEEN', x: 0.66, y: 0.60 },
  { bit: 1 << 4, key: 'taboo_laundry', type: 'STEM_ROT', x: 0.50, y: 0.79 },
];

export function encodeBulathPayload(state: RuntimeVariables): {
  urlParam: string;
  payload: BulathHurullaPayload;
} {
  let mask = 0;
  for (const item of TABOO_MAP) {
    if (state[item.key] === true) mask |= item.bit;
  }
  const balma = Math.max(0, Math.min(100, Math.round(Number(state.balma ?? 20))));
  const tanikama = Math.max(0, Math.min(100, Math.round(Number(state.tanikama ?? 50))));

  const payload = buildPayloadFromBits(mask, balma, tanikama);
  const rawToken = `${mask}.${balma}.${tanikama}`;
  const urlParam = typeof btoa !== 'undefined' ? btoa(rawToken).replace(/=+$/, '') : rawToken;

  return { urlParam, payload };
}

export function decodeBulathPayload(input: string): BulathHurullaPayload | null {
  const cleaned = input.trim();
  const codeMatch = /^BH-(HK|VK)-([0-9A-F]{2})([0-9A-F]{2})$/i.exec(cleaned);
  if (codeMatch) {
    const mask = parseInt(codeMatch[2], 16);
    const balma = parseInt(codeMatch[3], 16);
    return buildPayloadFromBits(mask, balma, 65);
  }

  try {
    const decoded = typeof atob !== 'undefined' ? atob(cleaned) : cleaned;
    const [mStr, bStr, tStr] = decoded.split('.');
    const mask = parseInt(mStr, 10);
    const balma = parseInt(bStr, 10);
    const tanikama = parseInt(tStr, 10);
    if (Number.isNaN(mask) || Number.isNaN(balma)) return null;
    return buildPayloadFromBits(mask, balma, Number.isNaN(tanikama) ? 65 : tanikama);
  } catch {
    return null;
  }
}

function buildPayloadFromBits(mask: number, balma: number, tanikama: number): BulathHurullaPayload {
  const blemishes: BulathBlemish[] = [];
  for (const item of TABOO_MAP) {
    if ((mask & item.bit) !== 0) {
      blemishes.push({
        id: `blemish_${item.key}`,
        tabooKey: item.key,
        type: item.type,
        x: item.x,
        y: item.y,
      });
    }
  }

  const sensoryScore = (mask & 1 ? 1 : 0) + (mask & 2 ? 1 : 0) + (mask & 4 ? 1 : 0);
  const physicalScore = (mask & 8 ? 1 : 0) + (mask & 16 ? 1 : 0);
  const avatar: KaluKumaraAvatar = physicalScore > sensoryScore ? 'VATHA_KUMARA' : 'HANDUN_KUMARA';

  const prefix = avatar === 'HANDUN_KUMARA' ? 'HK' : 'VK';
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
