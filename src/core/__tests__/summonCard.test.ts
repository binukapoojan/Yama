// src/core/__tests__/summonCard.test.ts
import { describe, expect, it } from 'vitest';
import { CasefileId, decodeBulathPayload, encodeBulathPayload } from '../bulathCodec';
import { PUSKOLA_ENTRIES } from '../compendiumStore';
import { buildWhatsAppSummonLink } from '../deepLinkRouter';
import { buildStateFromBulath, CASEFILE_META } from '../savePersistence';

describe('BulathSummonCard & 4-Casefile Triage Code Drawer', () => {
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

  it('decodes all 4 Triage Drawer preset codes into their exact Casefile and Kattadiya passage', () => {
    const presets: Array<{ code: string; expectedCase: CasefileId; expectedPassage: string; blemishes: number }> = [
      { code: 'BH-HK-1541', expectedCase: 'CF01', expectedPassage: 'Kattadiya_Sastra_Entry', blemishes: 3 },
      { code: 'BH-RM-1848', expectedCase: 'CF02', expectedPassage: 'Kattadiya_Mohini_Entry', blemishes: 2 },
      { code: 'BH-MR-0758', expectedCase: 'CF03', expectedPassage: 'Kattadiya_Riri_Entry', blemishes: 3 },
      { code: 'BH-MS-185C', expectedCase: 'CF04', expectedPassage: 'Kattadiya_Mahasona_Entry', blemishes: 2 },
    ];

    for (const item of presets) {
      const decoded = decodeBulathPayload(`  ${item.code.toLowerCase()}  `);
      expect(decoded).not.toBeNull();
      expect(decoded?.casefile).toBe(item.expectedCase);
      expect(decoded?.blemishes).toHaveLength(item.blemishes);
      expect(CASEFILE_META[decoded!.casefile].kattadiyaStart).toBe(item.expectedPassage);

      const hydratedState = buildStateFromBulath(decoded!);
      expect(hydratedState.samayam_velava).toBe('MADDHAMA_MIDNIGHT');
    }
  });
});
