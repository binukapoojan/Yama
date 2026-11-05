import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { parseTweeStory } from '../src/core/twineParser';

describe('Casefile 02 (Mala Mohini) Twine Parser', () => {
  const tweePath = path.resolve(__dirname, '../story-twine/casefile02_mohini.twee');

  it('parses exactly 18 passages with zero missing passages', () => {
    const tweeContent = fs.readFileSync(tweePath, 'utf-8');
    const story = parseTweeStory(tweeContent);
    expect(Object.keys(story)).toHaveLength(18);

    const expectedPassages = [
      'Upper_Lake_Mist_Start',
      'Three_Wheeler_Wait',
      'Bamboo_Culvert_Approach',
      'Cross_Road_Verge',
      'Weeping_By_The_Wall',
      'Look_Into_Her_Eyes',
      'Gaze_Down_Puddle',
      'The_Slipping_Saree_Plea',
      'The_Infant_Drop_Trap',
      'Outcome_Athura_Road_Escaped',
      'Outcome_Athura_Mohini_Bound',
      'Kattadiya_Mohini_Entry',
      'Sastra_Kaduru_Leaf_Check',
      'Patient_Catatonia_Inspection',
      'Three_Mask_Paliya_Prep',
      'Midnight_Kesel_Kanda_Severance',
      'Outcome_Kattadiya_Mohini_Cured',
      'Outcome_Kattadiya_Mohini_Failed',
    ];

    for (const name of expectedPassages) {
      expect(story[name]).toBeDefined();
    }
  });

  it('entry passage Upper_Lake_Mist_Start has proper flow and samayam directives', () => {
    const tweeContent = fs.readFileSync(tweePath, 'utf-8');
    const story = parseTweeStory(tweeContent);
    const start = story['Upper_Lake_Mist_Start'];
    expect(start).toBeDefined();
    expect(start.directives.flow).toBe('kandy_mist_bamboo');
    expect(start.directives.samayam).toBe('MADDHAMA_MIDNIGHT');
    expect(start.directives.audio).toBe('monsoon_light');
    expect(start.directives.haptic).toBe('heartbeat_slow');
    expect(start.directives.vignette).toBe(0.5);
  });

  it('The_Infant_Drop_Trap has a choice with requiresAnchorHeld === true targeting Outcome_Athura_Road_Escaped', () => {
    const tweeContent = fs.readFileSync(tweePath, 'utf-8');
    const story = parseTweeStory(tweeContent);
    const trap = story['The_Infant_Drop_Trap'];
    expect(trap).toBeDefined();
    const escapeChoice = trap.choices.find(c => c.targetPassage === 'Outcome_Athura_Road_Escaped');
    expect(escapeChoice).toBeDefined();
    expect(escapeChoice?.requiresAnchorHeld).toBe(true);
  });

  it('parses mutate segments in Upper_Lake_Mist_Start and The_Infant_Drop_Trap', () => {
    const tweeContent = fs.readFileSync(tweePath, 'utf-8');
    const story = parseTweeStory(tweeContent);

    const startMutate = story['Upper_Lake_Mist_Start'].paragraphs.flat().find(s => s.type === 'mutate');
    expect(startMutate).toBeDefined();
    if (startMutate && startMutate.type === 'mutate') {
      expect(startMutate.wakingText).toBe('a failing sodium bulb');
      expect(startMutate.corruptedText).toBe('the pale yellow glow of a funeral oil wick');
      expect(startMutate.delayMs).toBe(2700);
    }

    const trapMutate = story['The_Infant_Drop_Trap'].paragraphs.flat().find(s => s.type === 'mutate');
    expect(trapMutate).toBeDefined();
    if (trapMutate && trapMutate.type === 'mutate') {
      expect(trapMutate.wakingText).toBe('a helpless infant plunging toward the rock');
      expect(trapMutate.corruptedText).toBe('a rotting green banana stem wrapped in a funeral shroud');
      expect(trapMutate.delayMs).toBe(1900);
    }
  });

  it('all targetPassages point to valid passages in the graph', () => {
    const tweeContent = fs.readFileSync(tweePath, 'utf-8');
    const story = parseTweeStory(tweeContent);
    for (const [name, passage] of Object.entries(story)) {
      for (const choice of passage.choices) {
        expect(story[choice.targetPassage]).toBeDefined();
      }
    }
  });
});
