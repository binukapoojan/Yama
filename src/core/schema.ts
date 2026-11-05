export type SamayamVelava = 'ALUYA_DAWN' | 'IRA_MUDUN_MIDDAY' | 'SANDHYA_DUSK' | 'MADDHAMA_MIDNIGHT';

export type FlowLoopId =
  | 'bodima_rain_window'
  | 'pahana_steady'
  | 'pahana_nil_manel'
  | 'mirror_dark_idle';

export type HapticPatternId = 'heartbeat_slow' | 'heartbeat_panic' | 'dread_throb' | 'iron_grip';

export interface JuiceDirective {
  samayam?: SamayamVelava;
  flow?: FlowLoopId;
  audio?: string;
  haptic?: HapticPatternId;
  vignette?: number;
  balmaDelta?: number;
  tanikamaDelta?: number;
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

export interface StateMutation {
  variable: string;
  operator: '=' | '+=' | '-=';
  value: boolean | number | string;
}

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

export interface RuntimeVariables {
  tanikama: number;
  balma: number;
  samayam_velava: SamayamVelava;
  [key: string]: boolean | number | string;
}
