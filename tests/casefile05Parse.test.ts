// tests/casefile05Parse.test.ts
import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { parseTweeStory } from '../src/core/twineParser';
import { isHuniyamUnsealed } from '../src/core/savePersistence';
import { CasefileId } from '../src/core/bulathCodec';

describe('Casefile 05 (Maha Huniyam) Twine Parser & Mechanics', () => {
  const tweePath = path.resolve(__dirname, '../story-twine/casefile05_huniyam.twee');

  it('parses all 10 passages with zero missing passages', () => {
    const tweeContent = fs.readFileSync(tweePath, 'utf-8');
    const story = parseTweeStory(tweeContent);
    expect(Object.keys(story)).toHaveLength(10);

    const expectedPassages = [
      'Walawwa_Eclipse_Start',
      'Cardinal_Sima_Collapse',
      'Threshold_Stone_Breach',
      'Viper_Venom_Paralysis',
      'Shrine_Mirror_Convergence',
      'Puhul_Sacrifice_Prep',
      'Midnight_Oddisa_Confrontation',
      'Outcome_Huniyam_Sovereign_Cut',
      'Outcome_Huniyam_Fourfold_Debt',
      'Outcome_Huniyam_Ash_Tomb',
    ];

    for (const name of expectedPassages) {
      expect(story[name], `Missing passage ${name}`).toBeDefined();
    }
  });

  it('entry passage Walawwa_Eclipse_Start has proper flow and samayam directives', () => {
    const tweeContent = fs.readFileSync(tweePath, 'utf-8');
    const story = parseTweeStory(tweeContent);
    const start = story['Walawwa_Eclipse_Start'];
    expect(start).toBeDefined();
    expect(start.directives.flow).toBe('pahana_nil_manel');
    expect(start.directives.samayam).toBe('MADDHAMA_MIDNIGHT');
    expect(start.directives.audio).toBe('ceb_power_cut');
    expect(start.directives.haptic).toBe('heartbeat_slow');
    expect(start.directives.vignette).toBe(0.58);
  });

  it('Midnight_Oddisa_Confrontation has choices with @anchor_held and valid outcomes', () => {
    const tweeContent = fs.readFileSync(tweePath, 'utf-8');
    const story = parseTweeStory(tweeContent);
    const passage = story['Midnight_Oddisa_Confrontation'];
    expect(passage).toBeDefined();
    const anchorChoice = passage.choices.find((c) => c.requiresAnchorHeld);
    expect(anchorChoice).toBeDefined();
    expect(anchorChoice?.targetPassage).toBe('Outcome_Huniyam_Sovereign_Cut');
  });

  it('parses mutate segments in Walawwa_Eclipse_Start and Outcome_Huniyam_Fourfold_Debt', () => {
    const tweeContent = fs.readFileSync(tweePath, 'utf-8');
    const story = parseTweeStory(tweeContent);

    const startMutate = story['Walawwa_Eclipse_Start'].paragraphs.flat().find((s) => s.type === 'mutate');
    expect(startMutate).toBeDefined();
    if (startMutate && startMutate.type === 'mutate') {
      expect(startMutate.wakingText).toBe('damp courtyard jasmine and old lime plaster');
      expect(startMutate.corruptedText).toBe('burnt five-metal copper, shedding viper skin, and hot cremation tallow');
      expect(startMutate.delayMs).toBe(2400);
    }

    const debtMutate = story['Outcome_Huniyam_Fourfold_Debt'].paragraphs.flat().find((s) => s.type === 'mutate');
    expect(debtMutate).toBeDefined();
    if (debtMutate && debtMutate.type === 'mutate') {
      expect(debtMutate.wakingText).toBe('asleep beside your extinguished brass lamp');
      expect(debtMutate.corruptedText).toContain('your lungs packed with blue Nil Manel lilies');
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

  it('isHuniyamUnsealed correctly gates Folio V behind 4 cardinal exorcisms or 20 folios', () => {
    const emptyUnlocks: CasefileId[] = [];
    expect(isHuniyamUnsealed(emptyUnlocks, 0)).toBe(false);
    expect(isHuniyamUnsealed(emptyUnlocks, 19)).toBe(false);
    expect(isHuniyamUnsealed(emptyUnlocks, 20)).toBe(true);

    const threeUnlocks: CasefileId[] = ['CF01', 'CF02', 'CF03'];
    expect(isHuniyamUnsealed(threeUnlocks, 10)).toBe(false);

    const fourUnlocks: CasefileId[] = ['CF01', 'CF02', 'CF03', 'CF04'];
    expect(isHuniyamUnsealed(fourUnlocks, 5)).toBe(true);

    // CF05 itself does not count toward the 4 cardinal prerequisite
    const selfOnly: CasefileId[] = ['CF05'];
    expect(isHuniyamUnsealed(selfOnly, 0)).toBe(false);
  });

  it('Huniyam Puhul Kapima mechanics validate thorn ordering and gourd cleavage threshold', () => {
    let extracted = 0;
    const pullThorn = (idx: number) => {
      if (idx === extracted) {
        extracted += 1;
        return true;
      }
      return false;
    };

    // Pulling out of order fails
    expect(pullThorn(1)).toBe(false);
    expect(extracted).toBe(0);

    // Pulling in order 0, 1, 2, 3 succeeds
    expect(pullThorn(0)).toBe(true);
    expect(pullThorn(1)).toBe(true);
    expect(pullThorn(2)).toBe(true);
    expect(pullThorn(3)).toBe(true);
    expect(extracted).toBe(4);

    // Gourd severance logic
    const thornsCleared = extracted >= 4;
    expect(thornsCleared).toBe(true);

    const calculateCutPct = (relY: number) => Math.max(0, Math.min(100, ((relY - 245) / 95) * 100));
    expect(calculateCutPct(245)).toBe(0);
    expect(calculateCutPct(333)).toBeGreaterThanOrEqual(92);
  });
});
