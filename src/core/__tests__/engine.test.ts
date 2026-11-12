// src/core/__tests__/engine.test.ts
import * as fs from 'node:fs';
import * as path from 'node:path';
import { describe, expect, it } from 'vitest';
import { decodeBulathPayload, encodeBulathPayload } from '../bulathCodec';
import { RuntimeVariables } from '../schema';
import { applyStateMutations, parseTweeStory } from '../twineParser';

describe('bulathCodec: Zero-Backend Bitmask & 8-Avatar Serializer (CF01-CF04)', () => {
  it('encodes & decodes CF01 (HANDUN_KUMARA & VATHA_KUMARA)', () => {
    const hk = encodeBulathPayload(
      { taboo_bathed_dusk: true, taboo_mirror_unshrouded: true, taboo_laundry: true, balma: 65, tanikama: 80 },
      'CF01'
    );
    expect(hk.payload.avatar).toBe('HANDUN_KUMARA');
    expect(hk.payload.shareCode).toBe('BH-HK-1541');
    expect(hk.payload.blemishes.map((b) => b.type)).toEqual(['DARK_BRUISE', 'PINHOLE_TEAR', 'STEM_ROT']);
    expect(decodeBulathPayload(hk.urlParam)).toEqual(hk.payload);
    expect(decodeBulathPayload('BH-HK-1541')?.avatar).toBe('HANDUN_KUMARA');

    const vk = encodeBulathPayload({ taboo_sweet_snacks: true, taboo_laundry: true, balma: 50 }, 'CF01');
    expect(vk.payload.avatar).toBe('VATHA_KUMARA');
    expect(vk.payload.shareCode).toBe('BH-VK-1832');
    expect(decodeBulathPayload('BH-VK-1832')?.avatar).toBe('VATHA_KUMARA');
  });

  it('encodes & decodes CF02 (MALA_MOHINI & RATI_MOHINI)', () => {
    const mm = encodeBulathPayload({ taboo_walked_samayam: true, taboo_met_eyes: true, balma: 60 }, 'CF02');
    expect(mm.payload.avatar).toBe('MALA_MOHINI');
    expect(mm.payload.shareCode).toBe('BH-MM-053C');
    expect(decodeBulathPayload('BH-MM-053C')?.casefile).toBe('CF02');

    const rm = encodeBulathPayload(
      { taboo_mirrored_gesture: true, taboo_accepted_bundle: true, balma: 72, tanikama: 90 },
      'CF02'
    );
    expect(rm.payload.avatar).toBe('RATI_MOHINI');
    expect(rm.payload.shareCode).toBe('BH-RM-1848');
    expect(decodeBulathPayload(rm.urlParam)?.tanikama).toBe(90);
  });

  it('encodes & decodes CF03 (MARU_RIRI & SOHON_RIRI)', () => {
    const mr = encodeBulathPayload(
      { taboo_fried_pulutu: true, taboo_unwashed_blood: true, taboo_plucked_wadamal: true, balma: 88 },
      'CF03'
    );
    expect(mr.payload.avatar).toBe('MARU_RIRI');
    expect(mr.payload.shareCode).toBe('BH-MR-0758');
    expect(decodeBulathPayload('BH-MR-0758')?.casefile).toBe('CF03');

    const sr = encodeBulathPayload({ taboo_crossed_anthill: true, taboo_tasted_hearth_ash: true, balma: 64 }, 'CF03');
    expect(sr.payload.avatar).toBe('SOHON_RIRI');
    expect(sr.payload.shareCode).toBe('BH-SR-1840');
    expect(decodeBulathPayload('BH-SR-1840')?.avatar).toBe('SOHON_RIRI');
  });

  it('encodes & decodes CF04 (JAYASENA_YAKA & MAHA_SOHONA)', () => {
    const jy = encodeBulathPayload(
      { taboo_whistled_crossroads: true, taboo_looked_back_snap: true, balma: 78, tanikama: 85 },
      'CF04'
    );
    expect(jy.payload.avatar).toBe('JAYASENA_YAKA');
    expect(jy.payload.shareCode).toBe('BH-JY-054E');
    expect(decodeBulathPayload(jy.urlParam)).toEqual(jy.payload);
    expect(decodeBulathPayload('BH-JY-054E')?.avatar).toBe('JAYASENA_YAKA');

    const ms = encodeBulathPayload(
      { taboo_stepped_ash_pot: true, taboo_cursed_boar_shadow: true, balma: 92 },
      'CF04'
    );
    expect(ms.payload.avatar).toBe('MAHA_SOHONA');
    expect(ms.payload.shareCode).toBe('BH-MS-185C');
    expect(decodeBulathPayload('BH-MS-185C')?.casefile).toBe('CF04');
    expect(decodeBulathPayload('BH-MS-185C')?.avatar).toBe('MAHA_SOHONA');
  });

  it('returns null on malformed or corrupted Bulath strings', () => {
    expect(decodeBulathPayload('not-a-valid-token')).toBeNull();
    expect(decodeBulathPayload('BH-XX-9999')).toBeNull();
  });
});

describe('twineParser: Directives, {mutate} Tokens & 4-Casefile Smoke Check', () => {
  const SAMPLE_TWEE = `
:: Test_Passage [#samayam:MADDHAMA_MIDNIGHT #flow:iron_betel_cutter_ash #audio:arterial_pulse #haptic:heartbeat_panic #vignette:0.82 #balma:15 #tanikama:-5]
The clock reads {mutate: "11:52 PM" -> "11:99 PM" @2400} at the junction.

[[Hold the iron Giraya->Safe_Node][@anchor_held $balma -= 10, $taboo_whistled_crossroads = true]]
[[Drop the cutter->Doom_Node][$balma += 25, $avatar_chosen = "MAHA_SOHONA"]]
`.trim();

  it('parses passage directives, mutate delays, and state arithmetic', () => {
    const p = parseTweeStory(SAMPLE_TWEE)['Test_Passage'];
    expect(p.directives.flow).toBe('iron_betel_cutter_ash');
    expect(p.paragraphs[0][1]).toMatchObject({ type: 'mutate', wakingText: '11:52 PM', delayMs: 2400 });
    expect(p.choices[0].requiresAnchorHeld).toBe(true);

    const next: RuntimeVariables = applyStateMutations({ balma: 30 }, p.choices[0].mutations);
    expect(next).toEqual({ balma: 20, taboo_whistled_crossroads: true });
  });

  it('compiles all 4 expanded production casefiles (99 total passages) cleanly', () => {
    const read = (f: string) => fs.readFileSync(path.resolve(__dirname, `../../../story-twine/${f}`), 'utf-8');
    expect(Object.keys(parseTweeStory(read('casefile01_kalu_kumara.twee')))).toHaveLength(24);
    expect(Object.keys(parseTweeStory(read('casefile02_mohini.twee')))).toHaveLength(25);
    expect(Object.keys(parseTweeStory(read('casefile03_riri_yaka.twee')))).toHaveLength(25);
    expect(Object.keys(parseTweeStory(read('casefile04_mahasona.twee')))).toHaveLength(25);
  });
});
