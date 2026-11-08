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
  const case03Path = path.resolve(__dirname, '../story-twine/casefile03_riri_yaka.twee');
  const case04Path = path.resolve(__dirname, '../story-twine/casefile04_mahasona.twee');
  const case01Content = fs.readFileSync(case01Path, 'utf-8');
  const case02Content = fs.readFileSync(case02Path, 'utf-8');
  const case03Content = fs.readFileSync(case03Path, 'utf-8');
  const case04Content = fs.readFileSync(case04Path, 'utf-8');
  const storyGraph: StoryGraph = {
    ...parseTweeStory(case01Content),
    ...parseTweeStory(case02Content),
    ...parseTweeStory(case03Content),
    ...parseTweeStory(case04Content),
  };

  it('merged story graph contains Casefile 01, Casefile 02, Casefile 03, and Casefile 04 passages without dead links', () => {
    expect(storyGraph['Dusk_Balcony_Check']).toBeDefined();
    expect(storyGraph['Kattadiya_Sastra_Entry']).toBeDefined();
    expect(storyGraph['Upper_Lake_Mist_Start']).toBeDefined();
    expect(storyGraph['Kattadiya_Mohini_Entry']).toBeDefined();
    expect(storyGraph['Crimson_Hearth_Start']).toBeDefined();
    expect(storyGraph['Kattadiya_Riri_Entry']).toBeDefined();
    expect(storyGraph['Crossroads_Midnight_Start']).toBeDefined();
    expect(storyGraph['Kattadiya_Mahasona_Entry']).toBeDefined();

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

  describe('Casefile 03 (Riri Yaka) resolution', () => {
    it('resolves starting passage to Crimson_Hearth_Start when case=03 or case=riri', () => {
      const urls = ['?case=03', '?case=3', '?case=riri', '?casefile=03', '?casefile=riri'];
      for (const query of urls) {
        const config = resolveCasefileConfig(query, storyGraph);
        expect(config.casefileId).toBe('CF03');
        expect(config.startingPassageId).toBe('Crimson_Hearth_Start');
        expect(config.initialSamayam).toBe('SANDHYA_DUSK');
      }
    });

    it('resolves starting passage to Kattadiya_Riri_Entry when Riri Yaka bulath code is present', () => {
      const config1 = resolveCasefileConfig('?bulath=BH-MR-0520', storyGraph);
      expect(config1.casefileId).toBe('CF03');
      expect(config1.incomingBulath?.avatar).toBe('MARU_RIRI');
      expect(config1.startingPassageId).toBe('Kattadiya_Riri_Entry');
      expect(config1.initialSamayam).toBe('SANDHYA_DUSK');

      const encoded = encodeBulathPayload({
        taboo_fried_pulutu: true,
        taboo_unwashed_blood: true,
        balma: 45,
        tanikama: 70,
        samayam_velava: 'SANDHYA_DUSK',
      });
      const config2 = resolveCasefileConfig(`?bulath=${encoded.urlParam}`, storyGraph);
      expect(config2.casefileId).toBe('CF03');
      expect(config2.incomingBulath?.avatar).toMatch(/_RIRI$/);
      expect(config2.startingPassageId).toBe('Kattadiya_Riri_Entry');
    });
  });

  describe('Casefile 04 (Mahasona) resolution', () => {
    it('resolves starting passage to Crossroads_Midnight_Start when case=04 or case=mahasona', () => {
      const urls = ['?case=04', '?case=4', '?case=mahasona', '?casefile=04', '?casefile=mahasona'];
      for (const query of urls) {
        const config = resolveCasefileConfig(query, storyGraph);
        expect(config.isCase04).toBe(true);
        expect(config.casefileId).toBe('CF04');
        expect(config.startingPassageId).toBe('Crossroads_Midnight_Start');
        expect(config.initialSamayam).toBe('MADDHAMA_MIDNIGHT');
      }
    });

    it('resolves starting passage to Kattadiya_Mahasona_Entry when Mahasona bulath code is present', () => {
      const config1 = resolveCasefileConfig('?bulath=BH-JY-0520', storyGraph);
      expect(config1.isCase04).toBe(true);
      expect(config1.casefileId).toBe('CF04');
      expect(config1.incomingBulath?.avatar).toBe('JAYASENA_YAKA');
      expect(config1.startingPassageId).toBe('Kattadiya_Mahasona_Entry');
      expect(config1.initialSamayam).toBe('MADDHAMA_MIDNIGHT');

      const config2 = resolveCasefileConfig('?bulath=BH-MS-1830', storyGraph);
      expect(config2.isCase04).toBe(true);
      expect(config2.casefileId).toBe('CF04');
      expect(config2.incomingBulath?.avatar).toBe('MAHA_SOHONA');
      expect(config2.startingPassageId).toBe('Kattadiya_Mahasona_Entry');

      const encoded = encodeBulathPayload({
        taboo_whistled_crossroads: true,
        taboo_carried_uncovered_meat: true,
        balma: 45,
        tanikama: 70,
        samayam_velava: 'MADDHAMA_MIDNIGHT',
      });
      const config3 = resolveCasefileConfig(`?bulath=${encoded.urlParam}`, storyGraph);
      expect(config3.isCase04).toBe(true);
      expect(config3.casefileId).toBe('CF04');
      expect(config3.startingPassageId).toBe('Kattadiya_Mahasona_Entry');
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
