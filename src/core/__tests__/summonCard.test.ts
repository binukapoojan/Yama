// src/core/__tests__/summonCard.test.ts
import { describe, expect, it } from 'vitest';
import { encodeBulathPayload } from '../bulathCodec';
import { PUSKOLA_ENTRIES } from '../compendiumStore';
import { buildWhatsAppSummonLink } from '../deepLinkRouter';

describe('BulathSummonCard metadata & WhatsApp summons link generation', () => {
  it('resolves matching Puskola Avatara script and valid WhatsApp URL for CF03 Maru Riri', () => {
    const { urlParam, payload } = encodeBulathPayload(
      { taboo_fried_pulutu: true, taboo_unwashed_blood: true, balma: 84 },
      'CF03'
    );
    const avatarEntry = PUSKOLA_ENTRIES.find((e) => e.id === payload.avatar);
    expect(payload.shareCode).toBe('BH-MR-0354');
    expect(avatarEntry?.sinhalaTitle).toBe('Maru Rīri Avatāra');

    const waUrl = buildWhatsAppSummonLink(urlParam, payload.shareCode);
    expect(waUrl).toContain('https://wa.me/?text=');
    expect(decodeURIComponent(waUrl)).toContain('BH-MR-0354');
  });
});
