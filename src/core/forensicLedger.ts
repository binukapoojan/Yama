// src/core/forensicLedger.ts
import { BulathHurullaPayload, CasefileId } from './bulathCodec';

export interface AvatarCandidateSpec {
  id: string;
  sinhala: string;
  roman: string;
  stemBend: 'EAST' | 'WEST';
  forensicSign: string;
}

export const CASEFILE_AVATAR_CANDIDATES: Record<CasefileId, ReadonlyArray<AvatarCandidateSpec>> = {
  CF01: [
    { id: 'HANDUN_KUMARA', sinhala: 'හඳුන් කුමාර', roman: 'Handun Kumāra', stemBend: 'EAST', forensicSign: 'Stem curves East · Oily sandalwood & sweetmeat sheen along right blade' },
    { id: 'VATHA_KUMARA', sinhala: 'වාත කුමාර', roman: 'Vātha Kumāra', stemBend: 'WEST', forensicSign: 'Stem curves West · Crushing dark-wind necrosis along left midrib' },
  ],
  CF02: [
    { id: 'MALA_MOHINI', sinhala: 'මළ මෝහිනී', roman: 'Mala Mōhinī', stemBend: 'EAST', forensicSign: 'Stem curves East · Warm arterial sap & feverish eye-lock perforation' },
    { id: 'RATI_MOHINI', sinhala: 'රති මෝහිනී', roman: 'Rati Mōhinī', stemBend: 'WEST', forensicSign: 'Stem curves West · Cold grave-cloth rot & petrified cradle tendons' },
  ],
  CF03: [
    { id: 'MARU_RIRI', sinhala: 'මරු රීරි', roman: 'Maru Rīri', stemBend: 'EAST', forensicSign: 'Stem curves East · Boiling sunset oil & acute arterial frenzy' },
    { id: 'SOHON_RIRI', sinhala: 'සොහොන් රීරි', roman: 'Sohon Rīri', stemBend: 'WEST', forensicSign: 'Stem curves West · Charnel termite-clay stasis & corpse-mat weight' },
  ],
  CF04: [
    { id: 'JAYASENA_YAKA', sinhala: 'ජයසේන යකා', roman: 'Jayasēna Yakā', stemBend: 'EAST', forensicSign: 'Stem curves East · Headless duelist shockwave & snapped cervical lock' },
    { id: 'MAHA_SOHONA', sinhala: 'මහ සොහොනා', roman: 'Maha Sōhona', stemBend: 'WEST', forensicSign: 'Stem curves West · Five-fingered charnel ash-print & boar-tusk rot' },
  ],
  CF05: [
    { id: 'JAYASENA_YAKA', sinhala: 'ඔඩ්ඩිස හූනියම්', roman: 'Oddisa Hūniyam', stemBend: 'EAST', forensicSign: 'Stem curves East · Buried Paslo five-metal copper warrant' },
    { id: 'MAHA_SOHONA', sinhala: 'මහා සොහොන් හූනියම්', roman: 'Sohon Hūniyam', stemBend: 'WEST', forensicSign: 'Stem curves West · Eclipsed graveyard tallow & viper-thorn wax' },
  ],
};

function normalize(id: string): string {
  if (id === 'JAYASENA_AVATARA') return 'JAYASENA_YAKA';
  if (id === 'RIRI_MOHINI') return 'MALA_MOHINI';
  if (id === 'SOHON_MOHINI') return 'RATI_MOHINI';
  return id;
}

class ForensicLedgerStore {
  private markedByCasefile: Partial<Record<CasefileId, string>> = {};

  public markDiagnosis(casefile: CasefileId, avatarId: string): void {
    this.markedByCasefile[casefile] = avatarId;
  }

  public getMarkedAvatar(casefile: CasefileId): string | null {
    return this.markedByCasefile[casefile] ?? null;
  }

  public isMisdiagnosed(payload: BulathHurullaPayload | { payload: BulathHurullaPayload }): boolean {
    const p = ('payload' in payload && payload.payload ? payload.payload : payload) as BulathHurullaPayload;
    const marked = this.markedByCasefile[p.casefile];
    if (!marked) return false;
    return normalize(marked) !== normalize(p.avatar);
  }

  public reset(): void {
    this.markedByCasefile = {};
  }
}

export const forensicLedger = new ForensicLedgerStore();
