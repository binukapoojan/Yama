import { describe, it, expect } from 'vitest';
import { extractBulathFromUrl, buildWhatsAppSummonLink } from '../src/core/deepLinkRouter';
import { encodeBulathPayload } from '../src/core/bulathCodec';

describe('Deep Link Router', () => {
  const sampleRuntime = {
    tanikama: 40,
    balma: 25,
    taboo_bathed_dusk: true,
    samayam_velava: 'SANDHYA_DUSK' as const,
  };
  const encoded = encodeBulathPayload(sampleRuntime, 'CF01');

  it('extracts and decodes Bulath payload from https URL', () => {
    const url = `https://kalukumara.aftermonsoon.lk/?bulath=${encoded.urlParam}`;
    const payload = extractBulathFromUrl(url);
    expect(payload).not.toBeNull();
    expect(payload?.casefile).toBe('CF01');
    expect(payload?.shareCode).toBe(encoded.payload.shareCode);
  });

  it('extracts and decodes Bulath payload from custom kalukumara:// scheme', () => {
    const url = `kalukumara://summon?bulath=${encoded.urlParam}`;
    const payload = extractBulathFromUrl(url);
    expect(payload).not.toBeNull();
    expect(payload?.casefile).toBe('CF01');
    expect(payload?.shareCode).toBe(encoded.payload.shareCode);
  });

  it('handles Casefile 02 (Mohini) payload correctly', () => {
    const cf02Runtime = {
      tanikama: 65,
      balma: 35,
      taboo_walked_samayam: true,
      samayam_velava: 'MADDHAMA_MIDNIGHT' as const,
    };
    const cf02Encoded = encodeBulathPayload(cf02Runtime, 'CF02');
    const url = `kalukumara://summon?bulath=${cf02Encoded.urlParam}`;
    const payload = extractBulathFromUrl(url);
    expect(payload).not.toBeNull();
    expect(payload?.casefile).toBe('CF02');
    expect(payload?.shareCode).toBe(cf02Encoded.payload.shareCode);
  });

  it('returns null on invalid URL or missing bulath param', () => {
    expect(extractBulathFromUrl('https://example.com/')).toBeNull();
    expect(extractBulathFromUrl('not-a-valid-url')).toBeNull();
  });

  it('generates a valid WhatsApp summon link with encoded URI', () => {
    const waLink = buildWhatsAppSummonLink(encoded.urlParam, encoded.payload.shareCode);
    expect(waLink).toContain('https://wa.me/?text=');
    expect(waLink).toContain(encodeURIComponent(encoded.urlParam));
    expect(waLink).toContain(encodeURIComponent(encoded.payload.shareCode));
  });
});
