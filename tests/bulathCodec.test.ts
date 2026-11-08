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

  it('classifies MALA_MOHINI for ocular/verbal Mohini taboo violations', () => {
    const state: RuntimeVariables = {
      tanikama: 50,
      balma: 32,
      samayam_velava: 'MADDHAMA_MIDNIGHT',
      $taboo_walked_samayam: true,
      taboo_walked_samayam: true,
      $taboo_met_eyes: true,
      taboo_met_eyes: true,
    };
    const { payload } = encodeBulathPayload(state);
    expect(payload.avatar).toBe('MALA_MOHINI');
    expect(payload.shareCode).toMatch(/^BH-MM-/);
    expect(payload.blemishes).toHaveLength(2);
    expect(payload.blemishes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'DARK_BRUISE', x: 0.50, y: 0.20 }),
        expect.objectContaining({ type: 'PINHOLE_TEAR', x: 0.50, y: 0.52 }),
      ])
    );
  });

  it('classifies RATI_MOHINI for physical/mimetic Mohini taboo violations', () => {
    const state: RuntimeVariables = {
      tanikama: 50,
      balma: 48,
      samayam_velava: 'MADDHAMA_MIDNIGHT',
      $taboo_mirrored_gesture: true,
      taboo_mirrored_gesture: true,
      $taboo_accepted_bundle: true,
      taboo_accepted_bundle: true,
    };
    const { payload } = encodeBulathPayload(state);
    expect(payload.avatar).toBe('RATI_MOHINI');
    expect(payload.shareCode).toMatch(/^BH-RM-/);
  });

  it('decodes Mohini WhatsApp codes BH-MM-0520 and BH-RM-1830', () => {
    const mmPayload = decodeBulathPayload('BH-MM-0520');
    expect(mmPayload).not.toBeNull();
    expect(mmPayload?.avatar).toBe('MALA_MOHINI');
    expect(mmPayload?.shareCode).toBe('BH-MM-0520');
    expect(mmPayload?.balma).toBe(0x20);

    const rmPayload = decodeBulathPayload('BH-RM-1830');
    expect(rmPayload).not.toBeNull();
    expect(rmPayload?.avatar).toBe('RATI_MOHINI');
    expect(rmPayload?.shareCode).toBe('BH-RM-1830');
    expect(rmPayload?.balma).toBe(0x30);
  });

  it('classifies MARU_RIRI for sensory/hearth Riri taboo violations', () => {
    const state: RuntimeVariables = {
      tanikama: 50,
      balma: 35,
      samayam_velava: 'SANDHYA_DUSK',
      $taboo_fried_pulutu: true,
      taboo_fried_pulutu: true,
      $taboo_unwashed_blood: true,
      taboo_unwashed_blood: true,
    };
    const { payload } = encodeBulathPayload(state);
    expect(payload.avatar).toBe('MARU_RIRI');
    expect(payload.casefile).toBe('CF03');
    expect(payload.shareCode).toMatch(/^BH-MR-/);
    expect(payload.blemishes).toHaveLength(2);
    expect(payload.blemishes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ tabooKey: 'taboo_fried_pulutu', type: 'DARK_BRUISE', x: 0.50, y: 0.20 }),
        expect.objectContaining({ tabooKey: 'taboo_unwashed_blood', type: 'VEIN_KNOT', x: 0.35, y: 0.38 }),
      ])
    );
  });

  it('classifies SOHON_RIRI for boundary/earth Riri taboo violations', () => {
    const state: RuntimeVariables = {
      tanikama: 60,
      balma: 40,
      samayam_velava: 'MADDHAMA_MIDNIGHT',
      $taboo_crossed_anthill: true,
      taboo_crossed_anthill: true,
      $taboo_tasted_hearth_ash: true,
      taboo_tasted_hearth_ash: true,
    };
    const { payload } = encodeBulathPayload(state);
    expect(payload.avatar).toBe('SOHON_RIRI');
    expect(payload.casefile).toBe('CF03');
    expect(payload.shareCode).toMatch(/^BH-SR-/);
    expect(payload.blemishes).toHaveLength(2);
    expect(payload.blemishes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ tabooKey: 'taboo_crossed_anthill', type: 'OILY_SHEEN', x: 0.66, y: 0.60 }),
        expect.objectContaining({ tabooKey: 'taboo_tasted_hearth_ash', type: 'STEM_ROT', x: 0.50, y: 0.79 }),
      ])
    );
  });

  it('decodes Riri Yaka WhatsApp codes BH-MR-0520 and BH-SR-1830', () => {
    const mrPayload = decodeBulathPayload('BH-MR-0520');
    expect(mrPayload).not.toBeNull();
    expect(mrPayload?.avatar).toBe('MARU_RIRI');
    expect(mrPayload?.casefile).toBe('CF03');
    expect(mrPayload?.shareCode).toBe('BH-MR-0520');
    expect(mrPayload?.balma).toBe(0x20);

    const srPayload = decodeBulathPayload('BH-SR-1830');
    expect(srPayload).not.toBeNull();
    expect(srPayload?.avatar).toBe('SOHON_RIRI');
    expect(srPayload?.casefile).toBe('CF03');
    expect(srPayload?.shareCode).toBe('BH-SR-1830');
    expect(srPayload?.balma).toBe(0x30);
  });

  it('classifies JAYASENA_YAKA for sensory/sound/gaze Mahasona taboo violations', () => {
    const state: RuntimeVariables = {
      tanikama: 50,
      balma: 35,
      samayam_velava: 'MADDHAMA_MIDNIGHT',
      $taboo_whistled_crossroads: true,
      taboo_whistled_crossroads: true,
      $taboo_carried_uncovered_meat: true,
      taboo_carried_uncovered_meat: true,
      $taboo_looked_back_snap: true,
      taboo_looked_back_snap: true,
    };
    const { payload } = encodeBulathPayload(state);
    expect(payload.avatar).toBe('JAYASENA_YAKA');
    expect(payload.casefile).toBe('CF04');
    expect(payload.shareCode).toMatch(/^BH-JY-/);
    expect(payload.blemishes).toHaveLength(3);
    expect(payload.blemishes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ tabooKey: 'taboo_whistled_crossroads', type: 'DARK_BRUISE', x: 0.50, y: 0.20 }),
        expect.objectContaining({ tabooKey: 'taboo_carried_uncovered_meat', type: 'VEIN_KNOT', x: 0.35, y: 0.38 }),
        expect.objectContaining({ tabooKey: 'taboo_looked_back_snap', type: 'PINHOLE_TEAR', x: 0.50, y: 0.52 }),
      ])
    );
  });

  it('classifies MAHA_SOHONA for physical/boundary Mahasona taboo violations', () => {
    const state: RuntimeVariables = {
      tanikama: 60,
      balma: 40,
      samayam_velava: 'MADDHAMA_MIDNIGHT',
      $taboo_stepped_ash_pot: true,
      taboo_stepped_ash_pot: true,
      $taboo_cursed_boar_shadow: true,
      taboo_cursed_boar_shadow: true,
    };
    const { payload } = encodeBulathPayload(state);
    expect(payload.avatar).toBe('MAHA_SOHONA');
    expect(payload.casefile).toBe('CF04');
    expect(payload.shareCode).toMatch(/^BH-MS-/);
    expect(payload.blemishes).toHaveLength(2);
    expect(payload.blemishes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ tabooKey: 'taboo_stepped_ash_pot', type: 'OILY_SHEEN', x: 0.66, y: 0.60 }),
        expect.objectContaining({ tabooKey: 'taboo_cursed_boar_shadow', type: 'STEM_ROT', x: 0.50, y: 0.79 }),
      ])
    );
  });

  it('decodes Mahasona WhatsApp codes BH-JY-0520 and BH-MS-1830', () => {
    const jyPayload = decodeBulathPayload('BH-JY-0520');
    expect(jyPayload).not.toBeNull();
    expect(jyPayload?.avatar).toBe('JAYASENA_YAKA');
    expect(jyPayload?.casefile).toBe('CF04');
    expect(jyPayload?.shareCode).toBe('BH-JY-0520');
    expect(jyPayload?.balma).toBe(0x20);

    const msPayload = decodeBulathPayload('BH-MS-1830');
    expect(msPayload).not.toBeNull();
    expect(msPayload?.avatar).toBe('MAHA_SOHONA');
    expect(msPayload?.casefile).toBe('CF04');
    expect(msPayload?.shareCode).toBe('BH-MS-1830');
    expect(msPayload?.balma).toBe(0x30);
  });
});
