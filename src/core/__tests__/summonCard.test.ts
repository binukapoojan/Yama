// src/core/__tests__/summonCard.test.ts
import { describe, expect, it } from 'vitest';
import { decodeBulathPayload, encodeBulathPayload } from '../bulathCodec';
import { PUSKOLA_ENTRIES } from '../compendiumStore';
import { buildWhatsAppSummonLink } from '../deepLinkRouter';
import { buildStateFromBulath, CASEFILE_META } from '../savePersistence';

describe('BulathSummonCard & Manual Share-Code Triage Drawer', () => {
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

  it('decodes manually typed lowercase/spaced share codes and routes to the correct Kattadiya passage', () => {
    const decoded = decodeBulathPayload('  bh-ms-185c  ');
    expect(decoded).not.toBeNull();
    expect(decoded?.casefile).toBe('CF04');
    expect(decoded?.avatar).toBe('MAHA_SOHONA');
    expect(CASEFILE_META[decoded!.casefile].kattadiyaStart).toBe('Kattadiya_Mahasona_Entry');

    const state = buildStateFromBulath(decoded!);
    expect(state.taboo_stepped_ash_pot).toBe(true);
    expect(state.taboo_cursed_boar_shadow).toBe(true);
    expect(state.balma).toBe(92);
  });
});
