import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { parseTweeStory } from '../src/core/twineParser';

describe('Casefile 04 (Mahasona) Twine Parser', () => {
  const tweePath = path.resolve(__dirname, '../story-twine/casefile04_mahasona.twee');

  it('parses all 22 passages with zero missing passages', () => {
    const tweeContent = fs.readFileSync(tweePath, 'utf-8');
    const story = parseTweeStory(tweeContent);
    expect(Object.keys(story)).toHaveLength(22);

    const expectedPassages = [
      'Crossroads_Midnight_Start',
      'Gravel_Meat_Parcel',
      'Banyan_Root_Culvert',
      'Shattered_Charnel_Pot',
      'Tank_Bund_Footsteps',
      'Boar_Tusk_Apparition',
      'Cemetery_Boundary_Stone',
      'Charnel_Gassima_Jolt',
      'Shoulder_Ash_Strike',
      'Outcome_Athura_Mahasona_Survived',
      'Outcome_Athura_Mahasona_Struck',
      'Kattadiya_Mahasona_Entry',
      'Sastra_Mahasona_Leaf_Check',
      'Patient_Handprint_Forensics',
      'Thovil_Card_Duel_Prep',
      'Midnight_Gothaimbara_Varama',
      'Outcome_Kattadiya_Mahasona_Banished',
      'Outcome_Kattadiya_Mahasona_Backfire',
      'Culvert_Pilgrim_Lantern',
      'Backwards_Shadow_Stride',
      'Banyan_Root_Noose',
      'Sluice_Gate_Splash',
    ];

    for (const name of expectedPassages) {
      expect(story[name]).toBeDefined();
    }
  });

  it('entry passage Crossroads_Midnight_Start has proper flow and samayam directives', () => {
    const tweeContent = fs.readFileSync(tweePath, 'utf-8');
    const story = parseTweeStory(tweeContent);
    const start = story['Crossroads_Midnight_Start'];
    expect(start).toBeDefined();
    expect(start.directives.flow).toBe('thummansala_banyan_wind');
    expect(start.directives.samayam).toBe('MADDHAMA_MIDNIGHT');
    expect(start.directives.audio).toBe('monsoon_light');
    expect(start.directives.haptic).toBe('heartbeat_slow');
    expect(start.directives.vignette).toBe(0.55);
  });

  it('Shoulder_Ash_Strike has choices with @anchor_held', () => {
    const tweeContent = fs.readFileSync(tweePath, 'utf-8');
    const story = parseTweeStory(tweeContent);
    const passage = story['Shoulder_Ash_Strike'];
    expect(passage).toBeDefined();
    const anchorChoice = passage.choices.find((c) => c.requiresAnchorHeld);
    expect(anchorChoice).toBeDefined();
    expect(anchorChoice?.targetPassage).toBe('Outcome_Athura_Mahasona_Survived');
  });

  it('parses mutate segments in Crossroads_Midnight_Start and Midnight_Gothaimbara_Varama', () => {
    const tweeContent = fs.readFileSync(tweePath, 'utf-8');
    const story = parseTweeStory(tweeContent);

    const startMutate = story['Crossroads_Midnight_Start'].paragraphs.flat().find((s) => s.type === 'mutate');
    expect(startMutate).toBeDefined();
    if (startMutate && startMutate.type === 'mutate') {
      expect(startMutate.wakingText).toBe('warm dry-zone wind');
      expect(startMutate.corruptedText).toBe('a giant holding its breath six paces behind your back');
      expect(startMutate.delayMs).toBe(2500);
    }

    const varamaMutate = story['Midnight_Gothaimbara_Varama'].paragraphs.flat().find((s) => s.type === 'mutate');
    expect(varamaMutate).toBeDefined();
    if (varamaMutate && varamaMutate.type === 'mutate') {
      expect(varamaMutate.wakingText).toBe('The giant will crush the roof beams if you mock him');
      expect(varamaMutate.corruptedText).toBe('By the kick of the warrior Gothaimbara, your head sits backwards and your warrant is void');
      expect(varamaMutate.delayMs).toBe(2100);
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
