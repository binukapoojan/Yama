// src/core/memoryScars.ts

export const SCARS_STORAGE_KEY = 'after_monsoon_memory_scars_v1';

export interface PassageMemoryScar {
  sourceEnding: string; corruptedOverride: string; marginaliaSinhala: string; marginaliaEcho: string;
}

const TRACKED_ENDINGS = new Set<string>([
  'Outcome_Athura_Possessed', 'Outcome_Athura_Mirror_Entombed', 'Outcome_Athura_Canal_Drowned', 'Outcome_Kattadiya_Vessel_Transfer',
  'Outcome_Athura_Mohini_Bound', 'Outcome_Athura_Udawattakele_Lullaby', 'Outcome_Athura_Kaduru_Sap_Veins', 'Outcome_Kattadiya_Cradle_Contagion',
  'Outcome_Athura_Riri_Drained', 'Outcome_Athura_Hearth_Cannibal', 'Outcome_Athura_Termite_Humbaha', 'Outcome_Kattadiya_Mat_Substitution',
  'Outcome_Athura_Mahasona_Struck', 'Outcome_Athura_Backwards_Cervical', 'Outcome_Athura_Biso_Kotuwa_Pilgrim', 'Outcome_Kattadiya_Boar_Mask_Fused',
]);

const s = (sourceEnding: string, corruptedOverride: string, marginaliaSinhala: string, marginaliaEcho: string): PassageMemoryScar[] => [
  { sourceEnding, corruptedOverride, marginaliaSinhala, marginaliaEcho },
];

const PASSAGE_SCAR_TABLE: Record<string, PassageMemoryScar[]> = {
  Bathroom_Bucket_Overflow: s('Outcome_Athura_Canal_Drowned', 'your own waterlogged wristwatch from the Nugegoda canal, rooted through with blooming blue water-lilies', 'පෙර භවයේ කැළල', 'Your bronchi still ache with the cold silt of the canal reeds from your last watch.'),
  Mirror_Gaze_Trap: s('Outcome_Athura_Mirror_Entombed', 'your own trapped double hammering bloody knuckles from inside the glass, mouthing: DO NOT LET HIM DRAPE THE TOWEL', 'කැඩපත් සිරකරුවා', 'Fingernail scratches on the inside of the silver backing match your own right hand.'),
  Kattadiya_Sastra_Entry: s('Outcome_Kattadiya_Vessel_Transfer', 'the reflection in your brass oil bowl is already unbraiding your grey hair with seven overlapping smiles', 'ඇදුරු බිලිගැනීම', 'The brass Pahana basin still smells of the last Kattadiya whose breath was traded for the girl.'),
  Backseat_Wet_Saree: s('Outcome_Athura_Udawattakele_Lullaby', 'a second figure sitting beside her in your own rain-soaked shirt, holding out the rotting banana stem with your hands', 'උඩවත්තකැලේ දෝංකාරය', 'Scratched into the rusted three-wheeler handlebar is the exact minute your last walk ended.'),
  Look_Into_Her_Eyes: s('Outcome_Athura_Kaduru_Sap_Veins', 'lifts along the faint hospital-strap bruises already encircling your wrists to mirror her gesture', 'කදුරු කිරි බන්ධනය', 'Bitter white Kaduru tree-latex already crusts the inner corners of your eyelids.'),
  Three_Mask_Paliya_Prep: s('Outcome_Kattadiya_Cradle_Contagion', 'the third Kaduru mask on the mat still bears torn cheek-skin along its inner wooden rim', 'පාලි ශාපය', 'Dry arterial sap stains the Kesel Kanda bark where the cleaver skidded on your previous vigil.'),
  Crimson_Hearth_Start: s('Outcome_Athura_Hearth_Cannibal', 'scorched human palm-grease—and a five-fingered blister scar burned into the iron pan handle that matches your grip', 'දර ලිපේ හළු', 'Your right palm tingles with the memory of boiling coconut oil over cold grey ashes.'),
  Termite_Mound_Shadow: s('Outcome_Athura_Termite_Humbaha', 'five purple-stained human fingernails protruding from the sealed red clay—one wearing your own ring', 'තුඹසේ හදගැස්ම', 'The red laterite mound pulses at seventy-two beats per minute—the exact cadence of your previous chest.'),
  Woven_Mat_Funeral_Prep: s('Outcome_Kattadiya_Mat_Substitution', 'the woven Pan Pedura reeds are already frayed with Polhena gravel and a snapped exorcist waist-cord', 'පැදුරු සොහොන', 'Three braided gokkola knots tighten slightly around your ankles when you step near the mat.'),
  Culvert_Pilgrim_Lantern: s('Outcome_Athura_Biso_Kotuwa_Pilgrim', 'Look closely at the hand welded to my green bottle-lamp, malli—it is wearing your own grease-stained shirt', 'තුන්මන්සල පූජකයා', 'The backward-toed pilgrim limping out of the culvert mist has your face beneath his hood.'),
  Shoulder_Ash_Strike: s('Outcome_Athura_Backwards_Cervical', 'Your cervical spine remembers the dry crack of Gothaimbara’s seal turning your chin between your shoulder blades!', 'ජයසේනගේ බෙල්ල', 'Even before the blow lands, a phantom five-fingered soot print burns beneath your shirt.'),
  Thovil_Card_Duel_Prep: s('Outcome_Kattadiya_Boar_Mask_Fused', 'real human molars are rooted deep inside the carved wooden jaw of the boar mask', 'කෝලම් වෙස්මුහුණ', 'The inside of the Kaduru-wood boar mask is still warm with Dummala pitch from your last duel.'),
};

export function loadSufferedEndings(): string[] {
  if (typeof window === 'undefined' || !window.localStorage) return [];
  try {
    const raw = window.localStorage.getItem(SCARS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch { return []; }
}

export function recordMemoryScarIfEnding(passageId: string): string[] {
  const current = loadSufferedEndings();
  if (!TRACKED_ENDINGS.has(passageId) || current.includes(passageId)) return current;
  const next = [...current, passageId];
  if (typeof window !== 'undefined' && window.localStorage) {
    try { window.localStorage.setItem(SCARS_STORAGE_KEY, JSON.stringify(next)); } catch {}
  }
  return next;
}

export function getScarForPassage(passageId: string, suffered = loadSufferedEndings()): PassageMemoryScar | null {
  const candidates = PASSAGE_SCAR_TABLE[passageId];
  if (!candidates) return null;
  return candidates.find((c) => suffered.includes(c.sourceEnding)) ?? null;
}

export function clearMemoryScars(): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem(SCARS_STORAGE_KEY);
  }
}
