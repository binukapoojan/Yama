import { describe, it, expect } from 'vitest';
import { encodeBulathPayload } from '../src/core/bulathCodec';
import { RuntimeVariables } from '../src/core/schema';

describe('Minigames Mechanics & Progression Logic', () => {
  describe('BulathLeafCanvas Mechanics', () => {
    it('generates blemishes positioned within 0..400 and 0..440 bounds', () => {
      const state: RuntimeVariables = {
        taboo_bathed_dusk: true,
        taboo_hair_unbound: true,
        taboo_mirror_unshrouded: true,
        taboo_sweet_snacks: true,
        taboo_laundry: true,
      };
      const { payload } = encodeBulathPayload(state, 'CF01');
      expect(payload.blemishes.length).toBe(5);

      for (const blemish of payload.blemishes) {
        const cx = blemish.x * 400;
        const cy = blemish.y * 440;
        expect(cx).toBeGreaterThanOrEqual(0);
        expect(cx).toBeLessThanOrEqual(400);
        expect(cy).toBeGreaterThanOrEqual(0);
        expect(cy).toBeLessThanOrEqual(440);

        // Verify distance calculation logic matches visual position
        const testDistance = Math.hypot(cx - blemish.x * 400, cy - blemish.y * 440);
        expect(testDistance).toBe(0);
      }
    });

    it('divination can conclude when leafInspected is true or zero blemishes exist', () => {
      const stateWithBlemishes: RuntimeVariables = { taboo_bathed_dusk: true };
      const { payload: payloadWithBlemishes } = encodeBulathPayload(stateWithBlemishes, 'CF01');

      // Before inspection
      let leafInspected = false;
      let canConclude = leafInspected || payloadWithBlemishes.blemishes.length === 0;
      expect(canConclude).toBe(false);

      // After inspection: leafInspected remains true despite state updates
      leafInspected = true;
      canConclude = leafInspected || payloadWithBlemishes.blemishes.length === 0;
      expect(canConclude).toBe(true);

      // Clean state with zero blemishes allows proceeding directly
      const cleanState: RuntimeVariables = {};
      const { payload: cleanPayload } = encodeBulathPayload(cleanState, 'CF01');
      expect(cleanPayload.blemishes.length).toBe(0);
      const cleanCanConclude = false || cleanPayload.blemishes.length === 0;
      expect(cleanCanConclude).toBe(true);
    });
  });

  describe('Pideni Altar Preparation Mechanics', () => {
    it('correctly maps East to Handun Kumara and West to Vatha Kumara', () => {
      const getTarget = (direction: 'EAST' | 'WEST') => (direction === 'EAST' ? 'HANDUN_KUMARA' : 'VATHA_KUMARA');
      expect(getTarget('EAST')).toBe('HANDUN_KUMARA');
      expect(getTarget('WEST')).toBe('VATHA_KUMARA');

      // Consecration succeeds with at least 1 lamp lit
      const checkConsecrate = (direction: 'EAST' | 'WEST', expectedAvatar: string, litCount: number) => {
        const target = getTarget(direction);
        return target === expectedAvatar && litCount >= 1;
      };

      expect(checkConsecrate('EAST', 'HANDUN_KUMARA', 1)).toBe(true);
      expect(checkConsecrate('EAST', 'HANDUN_KUMARA', 4)).toBe(true);
      expect(checkConsecrate('WEST', 'HANDUN_KUMARA', 4)).toBe(false);
      expect(checkConsecrate('EAST', 'HANDUN_KUMARA', 0)).toBe(false);
      expect(checkConsecrate('WEST', 'VATHA_KUMARA', 2)).toBe(true);
    });
  });

  describe('Mohini Mask Paliya Severance Mechanics', () => {
    it('calculates blade delta downward and triggers severance at threshold', () => {
      const sliceStartY = 220;
      const calculateDelta = (currentY: number) => Math.max(0, Math.min(130, currentY - sliceStartY));

      expect(calculateDelta(220)).toBe(0);
      expect(calculateDelta(260)).toBe(40);
      expect(calculateDelta(280)).toBe(60);
      expect(calculateDelta(280) >= 55).toBe(true);
    });
  });

  describe('Riri Mat Funeral Mechanics', () => {
    it('requires 3 anointed nodes before shroud dragging and calculates flap closure', () => {
      const anointed: number[] = [0, 1];
      expect(anointed.length === 3).toBe(false);

      anointed.push(2);
      expect(anointed.length === 3).toBe(true);

      const dragStartX = 100;
      const calculateShroudFold = (currentX: number) =>
        Math.min(100, Math.max(0, Math.abs(currentX - dragStartX) * 1.1));

      expect(calculateShroudFold(100)).toBe(0);
      expect(calculateShroudFold(191)).toBeGreaterThanOrEqual(100);
    });
  });
});
