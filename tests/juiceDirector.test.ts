import { describe, it, expect, vi, beforeEach } from 'vitest';
import { juiceDirector } from '../src/juice/JuiceDirector';
import { TwinePassage, FlowLoopId } from '../src/core/schema';

describe('JuiceDirector protected loop & flow crossfades', () => {
  beforeEach(() => {
    juiceDirector.setAnchorHeld(false);
  });

  const createMockPassage = (flow: FlowLoopId): TwinePassage => ({
    name: 'Test_Passage',
    directives: { flow },
    paragraphs: [],
    choices: [],
  });

  it('emits kaduru_puddle_feet when anchor held for mohini_saree_silhouette', () => {
    const flowSpy = vi.fn();
    const unsub = juiceDirector.on('FLOW_CROSSFADE', flowSpy);

    juiceDirector.enterPassage(createMockPassage('mohini_saree_silhouette'), 10);
    expect(flowSpy).toHaveBeenLastCalledWith({
      loopId: 'mohini_saree_silhouette',
      isProtectedOverride: false,
    });

    juiceDirector.setAnchorHeld(true);
    expect(flowSpy).toHaveBeenLastCalledWith({
      loopId: 'kaduru_puddle_feet',
      isProtectedOverride: true,
    });

    unsub();
  });

  it('emits pahana_steady when anchor held for bodima_rain_window', () => {
    const flowSpy = vi.fn();
    const unsub = juiceDirector.on('FLOW_CROSSFADE', flowSpy);

    juiceDirector.enterPassage(createMockPassage('bodima_rain_window'), 10);
    expect(flowSpy).toHaveBeenLastCalledWith({
      loopId: 'bodima_rain_window',
      isProtectedOverride: false,
    });

    juiceDirector.setAnchorHeld(true);
    expect(flowSpy).toHaveBeenLastCalledWith({
      loopId: 'pahana_steady',
      isProtectedOverride: true,
    });

    unsub();
  });

  it('emits iron_sickle_ember when anchor held for matara_hearth_smoke (CF03)', () => {
    const flowSpy = vi.fn();
    const unsub = juiceDirector.on('FLOW_CROSSFADE', flowSpy);

    juiceDirector.enterPassage(createMockPassage('matara_hearth_smoke'), 20);
    expect(flowSpy).toHaveBeenLastCalledWith({
      loopId: 'matara_hearth_smoke',
      isProtectedOverride: false,
    });

    juiceDirector.setAnchorHeld(true);
    expect(flowSpy).toHaveBeenLastCalledWith({
      loopId: 'iron_sickle_ember',
      isProtectedOverride: true,
    });

    unsub();
  });

  it('emits iron_betel_cutter_ash when anchor held for thummansala_banyan_wind (CF04)', () => {
    const flowSpy = vi.fn();
    const unsub = juiceDirector.on('FLOW_CROSSFADE', flowSpy);

    juiceDirector.enterPassage(createMockPassage('thummansala_banyan_wind'), 20);
    expect(flowSpy).toHaveBeenLastCalledWith({
      loopId: 'thummansala_banyan_wind',
      isProtectedOverride: false,
    });

    juiceDirector.setAnchorHeld(true);
    expect(flowSpy).toHaveBeenLastCalledWith({
      loopId: 'iron_betel_cutter_ash',
      isProtectedOverride: true,
    });

    unsub();
  });

  it('restores the active passage loop when anchor is released', () => {
    const flowSpy = vi.fn();
    const unsub = juiceDirector.on('FLOW_CROSSFADE', flowSpy);

    juiceDirector.enterPassage(createMockPassage('mohini_saree_silhouette'), 10);
    juiceDirector.setAnchorHeld(true);
    juiceDirector.setAnchorHeld(false);
    expect(flowSpy).toHaveBeenLastCalledWith({
      loopId: 'mohini_saree_silhouette',
      isProtectedOverride: false,
    });

    unsub();
  });
});
