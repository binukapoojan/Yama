// src/components/diegetic/mantraScripts.ts
import { MantraVerseSpec } from './MantraBreathYantra';

export type MantraKey = 'RATA_YAKUMA' | 'PATTINI_VARAMA' | 'RIRI_VARAMA' | 'GOTHAIMBARA_VARAMA';

export interface MantraScript {
  titleSinhala: string;
  titleRoman: string;
  verses: MantraVerseSpec[];
}

export const MANTRA_SCRIPTS: Record<MantraKey, MantraScript> = {
  RATA_YAKUMA: {
    titleSinhala: 'රට යකුම වරම', titleRoman: 'Rata Yakuma Warrant',
    verses: [
      { sinhala: 'ඕං නමෝ කළු කුමාර දේවතාවා', phonetic: 'Ōm Namō Kalu Kumāra Dēvathāvā', durationMs: 1750 },
      { sinhala: 'සත් කට්ටුවේ බිසෝවරුන්ගේ අණින්', phonetic: 'Sath Kattuwē Bisōwarungē Anin', durationMs: 1450 },
      { sinhala: 'මේ ආතුරයාගේ ඇඟ ලේ හැර', phonetic: 'Mē Āthurayāgē Änga Lē Hära', durationMs: 1200 },
      { sinhala: 'පිදේනි තට්ටුවට බැස තීන්දුයි ස්වාහඃ ෴', phonetic: 'Pidēni Thattuwata Bäsa Thīnduyi Swāhī ෴', durationMs: 950 },
    ],
  },
  PATTINI_VARAMA: {
    titleSinhala: 'පත්තිනි සළඹ වරම', titleRoman: 'Fiery Anklet of Pattini',
    verses: [
      { sinhala: 'ඕං නමෝ මළ මෝහිනී යක්ෂණී', phonetic: 'Ōm Namō Mala Mōhinī Yakshanī', durationMs: 1750 },
      { sinhala: 'පත්තිනි දේවියගේ ගිනි සළඹේ අණින්', phonetic: 'Pattini Dēviyagē Gini Salambē Anin', durationMs: 1450 },
      { sinhala: 'මායා දරු බන්ධනය දෙකඩ කර', phonetic: 'Māyā Daru Bandhanaya Dekada Kara', durationMs: 1200 },
      { sinhala: 'කෙසෙල් කඳට බැස තීන්දුයි ස්වාහඃ ෴', phonetic: 'Kesel Kandata Bäsa Thīnduyi Swāhī ෴', durationMs: 950 },
    ],
  },
  RIRI_VARAMA: {
    titleSinhala: 'රීරි යක් වරම', titleRoman: 'Rīri Yak Surrender Warrant',
    verses: [
      { sinhala: 'ඕං නමෝ ලේ විලේ උපන් රීරි යකා', phonetic: 'Ōm Namō Lē Vilē Upan Rīri Yakā', durationMs: 1750 },
      { sinhala: 'සූර්ය දිව්ය රාජයාගේ අණින්', phonetic: 'Sūrya Divya Rājayāgē Anin', durationMs: 1450 },
      { sinhala: 'ආතුර ලේ නහර හැර දමා', phonetic: 'Āthura Lē Nahara Hära Damā', durationMs: 1200 },
      { sinhala: 'පැදුරු දානය ගෙන තීන්දුයි ස්වාහඃ ෴', phonetic: 'Päduru Dānaya Gena Thīnduyi Swāhī ෴', durationMs: 950 },
    ],
  },
  GOTHAIMBARA_VARAMA: {
    titleSinhala: 'ගෝඨයිම්බර වරම', titleRoman: 'Gothaimbara Decree',
    verses: [
      { sinhala: 'ඕං නමෝ ජයසේන මහසෝන් යකා', phonetic: 'Ōm Namō Jayasēna Mahasōn Yakā', durationMs: 1750 },
      { sinhala: 'ගෝඨයිම්බර යෝධයාගේ වම් පයේ අණින්', phonetic: 'Gōthaimbara Yෝdhayāgē Wam Payē Anin', durationMs: 1450 },
      { sinhala: 'තුන්මන්සල අඟුරු අත අකා මකා', phonetic: 'Thunmansala Anguru Atha Akā Makā', durationMs: 1200 },
      { sinhala: 'සොහොන් බිමට බැස තීන්දුයි ස්වාහඃ ෴', phonetic: 'Sohon Bimata Bäsa Thīnduyi Swāhī ෴', durationMs: 950 },
    ],
  },
};
