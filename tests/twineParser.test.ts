import { describe, it, expect, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { parseTweeStory, applyStateMutations } from '../src/core/twineParser';
import { juiceDirector } from '../src/juice/JuiceDirector';
import { textMutator } from '../src/juice/textMutator';
import { FlowLoopId, RuntimeVariables } from '../src/core/schema';

describe('Deterministic Engine Core (twineParser, JuiceDirector, textMutator)', () => {
  const tweeContent = fs.readFileSync(
    path.resolve(__dirname, '../story-twine/casefile01_kalu_kumara.twee'),
    'utf-8'
  );
  const story = parseTweeStory(tweeContent);

  it('parses all 21 passages into StoryGraph with zero broken references', () => {
    expect(Object.keys(story)).toHaveLength(21);
    expect(story['Dusk_Balcony_Check']).toBeDefined();
    expect(story['Balcony_Rain_Breach']).toBeDefined();
    expect(story['Louver_Latch_Safe']).toBeDefined();
    expect(story['Kattadiya_Sastra_Entry']).toBeDefined();
    expect(story['Outcome_Athura_Survived']).toBeDefined();
    expect(story['Outcome_Athura_Possessed']).toBeDefined();
    expect(story['Outcome_Kattadiya_Banished']).toBeDefined();
  });

  it('parses passage header hashtags into JuiceDirective', () => {
    const start = story['Dusk_Balcony_Check'];
    expect(start.directives.flow).toBe('bodima_rain_window');
    expect(start.directives.samayam).toBe('SANDHYA_DUSK');
    expect(start.directives.audio).toBe('monsoon_light');
    expect(start.directives.haptic).toBe('heartbeat_slow');
    expect(start.directives.vignette).toBe(0.52);
  });

  it('parses inline choices with state mutations and anchor requirements', () => {
    const start = story['Dusk_Balcony_Check'];
    expect(start.choices).toHaveLength(2);
    expect(start.choices[0].label).toBe('Step out onto the wet balcony to pull the clothes off the wire');
    expect(start.choices[0].targetPassage).toBe('Balcony_Rain_Breach');
    expect(start.choices[0].mutations).toEqual(
      expect.arrayContaining([
        { variable: 'taboo_laundry', operator: '=', value: true },
        { variable: 'taboo_bathed_dusk', operator: '=', value: true },
        { variable: 'balma', operator: '+=', value: 15 },
      ])
    );

    const mirrorTrap = story['Mirror_Gaze_Trap'];
    expect(mirrorTrap.choices[0].requiresAnchorHeld).toBe(true);
  });

  it('parses paragraphs into TextSegment[][] with mutate tokens', () => {
    const start = story['Dusk_Balcony_Check'];
    const mutateSeg = start.paragraphs
      .flat()
      .find((s) => s.type === 'mutate');

    expect(mutateSeg).toBeDefined();
    if (mutateSeg && mutateSeg.type === 'mutate') {
      expect(mutateSeg.wakingText).toBe('6:14 PM');
      expect(mutateSeg.corruptedText).toBe('6:66 PM — THE SAMAYAM WATCH');
      expect(mutateSeg.delayMs).toBe(2800);
    }
  });

  it('applyStateMutations modifies RuntimeVariables deterministically', () => {
    const init: RuntimeVariables = {
      tanikama: 10,
      balma: 10,
      samayam_velava: 'SANDHYA_DUSK',
    };
    const next = applyStateMutations(init, [
      { variable: 'taboo_laundry', operator: '=', value: true },
      { variable: 'balma', operator: '+=', value: 15 },
      { variable: 'tanikama', operator: '-=', value: 5 },
    ]);
    expect(next.taboo_laundry).toBe(true);
    expect(next.balma).toBe(25);
    expect(next.tanikama).toBe(5);
  });

  it('JuiceDirector emits events on passage entry and anchor toggle', () => {
    const flowSpy = vi.fn();
    const anchorSpy = vi.fn();
    const unsubFlow = juiceDirector.on('FLOW_CROSSFADE', flowSpy);
    const unsubAnchor = juiceDirector.on('ANCHOR_STATE_CHANGE', anchorSpy);

    juiceDirector.setAnchorHeld(false);
    juiceDirector.enterPassage(story['Dusk_Balcony_Check'], 10);
    expect(flowSpy).toHaveBeenCalledWith(
      expect.objectContaining({ loopId: 'bodima_rain_window', isProtectedOverride: false })
    );

    juiceDirector.setAnchorHeld(true);
    expect(anchorSpy).toHaveBeenCalledWith({ held: true });
    expect(flowSpy).toHaveBeenCalledWith(
      expect.objectContaining({ loopId: 'pahana_steady', isProtectedOverride: true })
    );

    unsubFlow();
    unsubAnchor();
  });

  it('textMutator handles passage morphing and anchor reversion', () => {
    vi.useFakeTimers();
    juiceDirector.setAnchorHeld(false);

    const start = story['Dusk_Balcony_Check'];
    textMutator.loadPassage(start);

    const mutateSeg = start.paragraphs.flat().find((s) => s.type === 'mutate');
    expect(mutateSeg).toBeDefined();
    const id = mutateSeg!.id;

    // Initial waking text
    let snap = textMutator.getSnapshot();
    expect(snap[id].currentText).toBe('6:14 PM');
    expect(snap[id].isCorrupted).toBe(false);

    // Fast-forward delay (2800ms) + morph duration (420ms)
    vi.advanceTimersByTime(3300);
    snap = textMutator.getSnapshot();
    expect(snap[id].isCorrupted).toBe(true);
    expect(snap[id].currentText).toBe('6:66 PM — THE SAMAYAM WATCH');

    // Holding anchor immediately snaps back to waking reality
    juiceDirector.setAnchorHeld(true);
    snap = textMutator.getSnapshot();
    expect(snap[id].isCorrupted).toBe(false);
    expect(snap[id].currentText).toBe('6:14 PM');

    juiceDirector.setAnchorHeld(false);
    vi.useRealTimers();
  });

  it('parses Casefile 02 flow loop directives into valid FlowLoopId values', () => {
    const rawTwee = `:: Passage_Bamboo [#flow:kandy_mist_bamboo]
Bamboo grove.

:: Passage_Silhouette [#flow:mohini_saree_silhouette]
White saree on the roadside.

:: Passage_Puddle [#flow:kaduru_puddle_feet]
Reflections in the puddle.

:: Passage_Torch [#flow:sanni_mask_torch]
Torchlight flickering.
`;
    const parsed = parseTweeStory(rawTwee);
    const expectedFlows: FlowLoopId[] = [
      'kandy_mist_bamboo',
      'mohini_saree_silhouette',
      'kaduru_puddle_feet',
      'sanni_mask_torch',
    ];

    expect(parsed['Passage_Bamboo'].directives.flow).toBe(expectedFlows[0]);
    expect(parsed['Passage_Silhouette'].directives.flow).toBe(expectedFlows[1]);
    expect(parsed['Passage_Puddle'].directives.flow).toBe(expectedFlows[2]);
    expect(parsed['Passage_Torch'].directives.flow).toBe(expectedFlows[3]);
  });
});
