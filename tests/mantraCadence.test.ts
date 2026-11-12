import { describe, it, expect } from 'vitest';
import { MANTRA_SCRIPTS } from '../src/components/diegetic/mantraScripts';

describe('Mantra Cadence Steps & Timing Configuration', () => {
  const MANTRA_STEPS: Record<string, ReadonlyArray<{ sinhala: string; phonetic: string; windowMs: number }>> = {
    RATA_YAKUMA: [
      { sinhala: 'ඕං ශ්‍රී කලු කුමාර', phonetic: 'Om Shri Kalu Kumara', windowMs: 1400 },
      { sinhala: 'අමනුෂ්‍ය බල මඬුලු', phonetic: 'Amanushya Bala Madulu', windowMs: 1300 },
      { sinhala: 'දුරලමි වරමිනි', phonetic: 'Duralami Varamini', windowMs: 1200 },
      { sinhala: 'ස්වාහී ෴', phonetic: 'Swahi ෴', windowMs: 1100 },
    ],
    PATTINI_VARAMA: [
      { sinhala: 'ඕං පත්තිනි මෑණියෝ', phonetic: 'Om Pattini Maeniyo', windowMs: 1400 },
      { sinhala: 'අරුම දරු බර', phonetic: 'Aruma Daru Bara', windowMs: 1300 },
      { sinhala: 'කැපෙව්මි වරමිනි', phonetic: 'Kapewvmi Varamini', windowMs: 1200 },
      { sinhala: 'ස්වාහී ෴', phonetic: 'Swahi ෴', windowMs: 1100 },
    ],
    RIRI_VARAMA: [
      { sinhala: 'ඕං රීරි යක්ෂයා', phonetic: 'Om Riri Yakshaya', windowMs: 1350 },
      { sinhala: 'ලේ මල් පිදේනි ගෙන', phonetic: 'Le Mal Pideni Gena', windowMs: 1250 },
      { sinhala: 'පැදුරු දානය හැර', phonetic: 'Peduru Danaya Hara', windowMs: 1150 },
      { sinhala: 'ස්වාහී ෴', phonetic: 'Swahi ෴', windowMs: 1050 },
    ],
    GOTHAIMBARA_VARAMA: [
      { sinhala: 'ඕං ජයසේන මහසෝන්', phonetic: 'Om Jayasēna Mahasōn', windowMs: 1300 },
      { sinhala: 'ගෝඨයිම්බර තේජසින්', phonetic: 'Gōthaimbara Thējasin', windowMs: 1200 },
      { sinhala: 'තුන්මන්සල අළු හැර', phonetic: 'Thummansala Alu Hara', windowMs: 1100 },
      { sinhala: 'ස්වාහී ෴', phonetic: 'Swāhī ෴', windowMs: 1000 },
    ],
  };

  it('defines 4 phonetic steps for Rata Yakuma exorcism', () => {
    const steps = MANTRA_STEPS.RATA_YAKUMA;
    expect(steps).toHaveLength(4);
    expect(steps[0].sinhala).toContain('කලු කුමාර');
    expect(steps[3].sinhala).toBe('ස්වාහී ෴');
  });

  it('defines 4 phonetic steps for Pattini Varama exorcism', () => {
    const steps = MANTRA_STEPS.PATTINI_VARAMA;
    expect(steps).toHaveLength(4);
    expect(steps[0].sinhala).toContain('පත්තිනි');
    expect(steps[3].sinhala).toBe('ස්වාහී ෴');
  });

  it('defines 4 phonetic steps for Riri Varama exorcism', () => {
    const steps = MANTRA_STEPS.RIRI_VARAMA;
    expect(steps).toHaveLength(4);
    expect(steps[0].sinhala).toContain('රීරි යක්ෂයා');
    expect(steps[3].sinhala).toBe('ස්වාහී ෴');
  });

  it('defines 4 phonetic steps for Gothaimbara Varama exorcism', () => {
    const steps = MANTRA_STEPS.GOTHAIMBARA_VARAMA;
    expect(steps).toHaveLength(4);
    expect(steps[0].sinhala).toContain('ජයසේන මහසෝන්');
    expect(steps[3].sinhala).toBe('ස්වාහී ෴');
  });

  it('each step windowMs decreases sequentially to build tension', () => {
    ['RATA_YAKUMA', 'PATTINI_VARAMA', 'RIRI_VARAMA', 'GOTHAIMBARA_VARAMA'].forEach((key) => {
      const steps = MANTRA_STEPS[key];
      for (let i = 1; i < steps.length; i++) {
        expect(steps[i].windowMs).toBeLessThan(steps[i - 1].windowMs);
      }
    });
  });

  describe('Diegetic MANTRA_SCRIPTS configuration', () => {
    it('defines 4 accelerating verses for all 4 demon warrants', () => {
      const keys = ['RATA_YAKUMA', 'PATTINI_VARAMA', 'RIRI_VARAMA', 'GOTHAIMBARA_VARAMA'] as const;
      keys.forEach((key) => {
        const script = MANTRA_SCRIPTS[key];
        expect(script.titleSinhala).toBeTruthy();
        expect(script.titleRoman).toBeTruthy();
        expect(script.verses).toHaveLength(4);

        for (let i = 1; i < script.verses.length; i++) {
          expect(script.verses[i].durationMs).toBeLessThan(script.verses[i - 1].durationMs);
        }
        expect(script.verses[3].sinhala).toContain('ස්වාහඃ ෴');
      });
    });
  });
});
