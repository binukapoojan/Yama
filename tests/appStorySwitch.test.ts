import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { parseTweeStory } from '../src/core/twineParser';
import { encodeBulathPayload } from '../src/core/bulathCodec';
import { resolveCasefileConfig } from '../src/App';
import { StoryGraph } from '../src/core/schema';

describe('App Casefile Switching', () => {
  const case01Path = path.resolve(__dirname, '../story-twine/casefile01_kalu_kumara.twee');
  const case02Path = path.resolve(__dirname, '../story-twine/casefile02_mohini.twee');
  const case01Content = fs.readFileSync(case01Path, 'utf-8');
  const case02Content = fs.readFileSync(case02Path, 'utf-8');
  const storyGraph: StoryGraph = {
    ...parseTweeStory(case01Content),
    ...parseTweeStory(case02Content),
  };

  it('merged story graph contains both Casefile 01 and Casefile 02 passages without dead links', () => {
    expect(storyGraph['Dusk_Balcony_Check']).toBeDefined();
    expect(storyGraph['Kattadiya_Sastra_Entry']).toBeDefined();
    expect(storyGraph['Upper_Lake_Mist_Start']).toBeDefined();
    expect(storyGraph['Kattadiya_Mohini_Entry']).toBeDefined();

    for (const [passageName, passage] of Object.entries(storyGraph)) {
      for (const choice of passage.choices) {
        expect(
          storyGraph[choice.targetPassage],
          `Dead link in passage "${passageName}": target "${choice.targetPassage}" does not exist in merged graph`
        ).toBeDefined();
      }
    }
  });

  describe('Casefile 02 (Mohini) resolution', () => {
    it('resolves starting passage to Upper_Lake_Mist_Start when case=02 or case=mohini', () => {
      const urls = ['?case=02', '?case=2', '?case=mohini', '?casefile=02', '?casefile=mohini'];
      for (const query of urls) {
        const config = resolveCasefileConfig(query, storyGraph);
        expect(config.isCase02).toBe(true);
        expect(config.startingPassageId).toBe('Upper_Lake_Mist_Start');
        expect(config.initialSamayam).toBe('MADDHAMA_MIDNIGHT');
      }
    });

    it('resolves starting passage to Kattadiya_Mohini_Entry when Mohini bulath code is present', () => {
      const config1 = resolveCasefileConfig('?bulath=BH-MM-0520', storyGraph);
      expect(config1.isCase02).toBe(true);
      expect(config1.incomingBulath?.avatar).toBe('MALA_MOHINI');
      expect(config1.startingPassageId).toBe('Kattadiya_Mohini_Entry');
      expect(config1.initialSamayam).toBe('MADDHAMA_MIDNIGHT');

      const encoded = encodeBulathPayload({
        taboo_walked_samayam: true,
        taboo_met_eyes: true,
        balma: 45,
        tanikama: 70,
        samayam_velava: 'MADDHAMA_MIDNIGHT',
      });
      const config2 = resolveCasefileConfig(`?bulath=${encoded.urlParam}`, storyGraph);
      expect(config2.isCase02).toBe(true);
      expect(config2.incomingBulath?.avatar).toMatch(/_MOHINI$/);
      expect(config2.startingPassageId).toBe('Kattadiya_Mohini_Entry');
    });
  });

  describe('Casefile 01 (Kalu Kumara) resolution', () => {
    it('resolves starting passage to Dusk_Balcony_Check when no params or case=01', () => {
      const urls = ['', '?', '?case=01', '?case=1', '?casefile=01'];
      for (const query of urls) {
        const config = resolveCasefileConfig(query, storyGraph);
        expect(config.isCase02).toBe(false);
        expect(config.startingPassageId).toBe('Dusk_Balcony_Check');
        expect(config.initialSamayam).toBe('SANDHYA_DUSK');
      }
    });

    it('resolves starting passage to Kattadiya_Sastra_Entry when Kalu Kumara bulath code is present', () => {
      const config1 = resolveCasefileConfig('?bulath=BH-HK-0314', storyGraph);
      expect(config1.isCase02).toBe(false);
      expect(config1.incomingBulath?.avatar).toBe('HANDUN_KUMARA');
      expect(config1.startingPassageId).toBe('Kattadiya_Sastra_Entry');
      expect(config1.initialSamayam).toBe('SANDHYA_DUSK');

      const encoded = encodeBulathPayload({
        taboo_bathed_dusk: true,
        balma: 30,
        tanikama: 55,
        samayam_velava: 'SANDHYA_DUSK',
      });
      const config2 = resolveCasefileConfig(`?bulath=${encoded.urlParam}`, storyGraph);
      expect(config2.isCase02).toBe(false);
      expect(config2.incomingBulath?.avatar).toMatch(/_KUMARA$/);
      expect(config2.startingPassageId).toBe('Kattadiya_Sastra_Entry');
    });
  });
});
