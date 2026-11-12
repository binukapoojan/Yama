import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { parseTweeStory } from '../src/core/twineParser';

describe('Casefile 02 (Mala Mohini) Twine Parser', () => {
  const tweePath = path.resolve(__dirname, '../story-twine/casefile02_mohini.twee');

  it('parses exactly 25 passages with zero missing passages', () => {
    const tweeContent = fs.readFileSync(tweePath, 'utf-8');
    const story = parseTweeStory(tweeContent);
    expect(Object.keys(story)).toHaveLength(25);

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
      'Outcome_Athura_Udawattakele_Lullaby',
      'Outcome_Athura_Kaduru_Sap_Veins',
      'Kattadiya_Mohini_Entry',
      'Sastra_Kaduru_Leaf_Check',
      'Patient_Catatonia_Inspection',
      'Three_Mask_Paliya_Prep',
      'Midnight_Kesel_Kanda_Severance',
      'Outcome_Kattadiya_Mohini_Cured',
      'Outcome_Kattadiya_Mohini_Failed',
      'Outcome_Kattadiya_Cradle_Contagion',
      'Culvert_Whisper_Echo',
      'False_Tuk_Headlight',
      'Backseat_Wet_Saree',
      'Sanctuary_Stone_Steps',
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
      expect(startMutate.wakingText).toBe('a dying orange sodium vapor tube');
      expect(startMutate.corruptedText).toBe('the sputtering tallow wick of a cemetery lantern');
      expect(startMutate.delayMs).toBe(2600);
    }

    const trapMutate = story['The_Infant_Drop_Trap'].paragraphs.flat().find(s => s.type === 'mutate');
    expect(trapMutate).toBeDefined();
    if (trapMutate && trapMutate.type === 'mutate') {
      expect(trapMutate.wakingText).toBe('a tiny, shivering newborn skull');
      expect(trapMutate.corruptedText).toBe('a hacked, sap-bleeding green banana trunk swarming with black ants');
      expect(trapMutate.delayMs).toBe(1850);
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
