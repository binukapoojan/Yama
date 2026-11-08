// src/core/schema.ts
export type SamayamVelava =
  | 'ALUYA_DAWN'
  | 'IRA_MUDUN_MIDDAY'
  | 'SANDHYA_DUSK'
  | 'MADDHAMA_MIDNIGHT';

export type FlowLoopId =
  // Casefile 01: Kalu Kumara (Nugegoda)
  | 'bodima_rain_window'
  | 'pahana_steady'
  | 'pahana_nil_manel'
  | 'mirror_dark_idle'
  // Casefile 02: Mala Mohini (Kandy)
  | 'kandy_mist_bamboo'
  | 'mohini_saree_silhouette'
  | 'kaduru_puddle_feet'
  | 'sanni_mask_torch'
  // Casefile 03: Riri Yaka (Matara)
  | 'matara_hearth_smoke'
  | 'wadamal_blood_hedge'
  | 'iron_sickle_ember'
  | 'peduru_funeral_mat'
  // Casefile 04: Mahasona (Anuradhapura)
  | 'thummansala_banyan_wind'
  | 'sohon_boar_silhouette'
  | 'iron_betel_cutter_ash'
  | 'dummala_vidiya_cards';

export type HapticPatternId =
  | 'heartbeat_slow'
  | 'heartbeat_panic'
  | 'dread_throb'
  | 'iron_grip';

export interface JuiceDirective {
  samayam?: SamayamVelava;
  flow?: FlowLoopId;
  audio?: string;
  haptic?: HapticPatternId;
  vignette?: number;
  balmaDelta?: number;
  tanikamaDelta?: number;
}

export interface StateMutation {
  variable: string;
  operator: '=' | '+=' | '-=';
  value: string | number | boolean;
}

export type TextSegment =
  | { type: 'plain'; text: string }
  | {
      type: 'mutate';
      id: string;
      wakingText: string;
      corruptedText: string;
      delayMs: number;
    };

export interface TwineChoice {
  label: string;
  targetPassage: string;
  mutations: StateMutation[];
  requiresAnchorHeld?: boolean;
}

export interface TwinePassage {
  name: string;
  directives: JuiceDirective;
  paragraphs: TextSegment[][];
  choices: TwineChoice[];
}

export type StoryGraph = Record<string, TwinePassage>;

export type RuntimeVariables = Record<string, string | number | boolean>;
