import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { parseTweeStory } from '../src/core/twineParser';

describe('Casefile 03 (Riri Yaka) Twine Parser', () => {
  const tweePath = path.resolve(__dirname, '../story-twine/casefile03_riri_yaka.twee');

  it('parses exactly 18 passages with zero missing passages', () => {
    const tweeContent = fs.readFileSync(tweePath, 'utf-8');
    const story = parseTweeStory(tweeContent);
    expect(Object.keys(story)).toHaveLength(18);

    const expectedPassages = [
      'Crimson_Hearth_Start',
      'Hearth_Ember_Agas',
      'Wellside_Fish_Scales',
      'Wadamal_Hedge_Breach',
      'Termite_Mound_Shadow',
      'Kitchen_Threshold_Retreat',
      'Boiling_Pulse_Onset',
      'Red_Bull_Apparition',
      'Midnight_Arterial_Weight',
      'Outcome_Athura_Riri_Survived',
      'Outcome_Athura_Riri_Drained',
      'Kattadiya_Riri_Entry',
      'Sastra_Riri_Leaf_Check',
      'Patient_Hemorrhage_Check',
      'Woven_Mat_Funeral_Prep',
      'Midnight_Peduru_Surrender',
      'Outcome_Kattadiya_Riri_Banished',
      'Outcome_Kattadiya_Riri_Backfire',
    ];

    for (const name of expectedPassages) {
      expect(story[name]).toBeDefined();
    }
  });

  it('entry passage Crimson_Hearth_Start has proper flow and samayam directives', () => {
    const tweeContent = fs.readFileSync(tweePath, 'utf-8');
    const story = parseTweeStory(tweeContent);
    const start = story['Crimson_Hearth_Start'];
    expect(start).toBeDefined();
    expect(start.directives.flow).toBe('matara_hearth_smoke');
    expect(start.directives.samayam).toBe('SANDHYA_DUSK');
    expect(start.directives.audio).toBe('hearth_crackle');
    expect(start.directives.haptic).toBe('heartbeat_slow');
    expect(start.directives.vignette).toBe(0.52);
  });

  it('Midnight_Arterial_Weight has choices with @anchor_held', () => {
    const tweeContent = fs.readFileSync(tweePath, 'utf-8');
    const story = parseTweeStory(tweeContent);
    const passage = story['Midnight_Arterial_Weight'];
    expect(passage).toBeDefined();
    const anchorChoice = passage.choices.find(c => c.requiresAnchorHeld);
    expect(anchorChoice).toBeDefined();
    expect(anchorChoice?.targetPassage).toBe('Outcome_Athura_Riri_Survived');
  });

  it('parses mutate segments in Crimson_Hearth_Start and Midnight_Arterial_Weight', () => {
    const tweeContent = fs.readFileSync(tweePath, 'utf-8');
    const story = parseTweeStory(tweeContent);

    const startMutate = story['Crimson_Hearth_Start'].paragraphs.flat().find(s => s.type === 'mutate');
    expect(startMutate).toBeDefined();
    if (startMutate && startMutate.type === 'mutate') {
      expect(startMutate.wakingText).toBe('fried onions and curry leaves');
      expect(startMutate.corruptedText).toBe('scorched copper and raw slaughterhouse iron');
      expect(startMutate.delayMs).toBe(2500);
    }

    const weightMutate = story['Midnight_Arterial_Weight'].paragraphs.flat().find(s => s.type === 'mutate');
    expect(weightMutate).toBeDefined();
    if (weightMutate && weightMutate.type === 'mutate') {
      expect(weightMutate.wakingText).toBe('Give me the blood in the pan and the life on the mat');
      expect(weightMutate.corruptedText).toBe('By the Varama of the Sun God and the Iron Sickle, I claim only ash');
      expect(weightMutate.delayMs).toBe(2100);
    }
  });

  it('all targetPassages point to valid passages in the graph', () => {
    const tweeContent = fs.readFileSync(tweePath, 'utf-8');
    const story = parseTweeStory(tweeContent);
    for (const [name, passage] of Object.entries(story)) {
      for (const choice of passage.choices) {
        expect(
          story[choice.targetPassage],
          `Broken link in ${name} pointing to ${choice.targetPassage}`
        ).toBeDefined();
      }
    }
  });
});
