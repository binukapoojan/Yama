import { describe, it, expect } from 'vitest';
import { encodeBulathPayload, decodeBulathPayload } from '../src/core/bulathCodec';
import { RuntimeVariables } from '../src/core/schema';

describe('Bulath Hurulla Codec', () => {
  it('encodes and decodes runtime state losslessly via URL token', () => {
    const state: RuntimeVariables = {
      tanikama: 70,
      balma: 45,
      samayam_velava: 'SANDHYA_DUSK',
      taboo_laundry: true,
      taboo_bathed_dusk: true,
    };

    const { urlParam, payload } = encodeBulathPayload(state);
    expect(urlParam).toBeDefined();
    expect(payload.balma).toBe(45);
    expect(payload.tanikama).toBe(70);
    expect(payload.blemishes.map((b) => b.tabooKey)).toEqual(
      expect.arrayContaining(['taboo_bathed_dusk', 'taboo_laundry'])
    );

    const decoded = decodeBulathPayload(urlParam);
    expect(decoded).not.toBeNull();
    expect(decoded?.balma).toBe(45);
    expect(decoded?.tanikama).toBe(70);
    expect(decoded?.shareCode).toBe(payload.shareCode);
    expect(decoded?.blemishes.length).toBe(2);
  });

  it('decodes direct WhatsApp share codes', () => {
    // BH-HK-153E -> mask 0x15 (21), balma 0x3E (62)
    const payload = decodeBulathPayload('BH-HK-153E');
    expect(payload).not.toBeNull();
    expect(payload?.balma).toBe(62);
    expect(payload?.avatar).toBe('HANDUN_KUMARA');
    expect(payload?.shareCode).toBe('BH-HK-153E');
  });

  it('classifies VATHA_KUMARA when physical taboos outnumber sensory taboos', () => {
    const state: RuntimeVariables = {
      tanikama: 40,
      balma: 30,
      samayam_velava: 'MADDHAMA_MIDNIGHT',
      taboo_sweet_snacks: true,
      taboo_laundry: true,
    };
    const { payload } = encodeBulathPayload(state);
    expect(payload.avatar).toBe('VATHA_KUMARA');
    expect(payload.shareCode).toMatch(/^BH-VK-/);
  });
});
