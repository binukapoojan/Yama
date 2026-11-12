// src/components/diegetic/CasefileAccordionFolio.tsx
import React from 'react';
import { CasefileId } from '../../core/bulathCodec';
import { triggerStylusScratch } from '../../juice/panhiyaFeedback';

export interface DocketFolioSpec {
  id: CasefileId; numeral: string; sinhala: string; roman: string;
  watch: string; locale: string; omen: string; ritual: string;
}

export const DOCKET_FOLIOS: ReadonlyArray<DocketFolioSpec> = [
  {
    id: 'CF01', numeral: 'I', sinhala: 'කළු කුමාර', roman: 'Kalu Kumāra',
    watch: 'Sandhyā Dusk · 6:14 PM', locale: 'Nugegoda Boarding Annex',
    omen: 'Wet hair left unbound after the six o’clock bell, an unshrouded dressing mirror facing the pillow, and bruised Nil Manel petals inside the mosquito net.',
    ritual: 'Consecrate the nine-square Pideni Thattuwa tray and turn the clay Bali Pili effigy toward the true Avatar.',
  },
  {
    id: 'CF02', numeral: 'II', sinhala: 'මළ මෝහිනී', roman: 'Mala Mōhinī',
    watch: 'Maddhama Midnight · 11:46 PM', locale: 'Upper Lake Road, Kandy',
    omen: 'A barefoot woman in an unpinned white saree weeping beside the bamboo culvert, holding out a shivering bundle that smells of poisonous Kaduru sap.',
    ritual: 'Dance the three Ambalangoda Kaduru-wood masks in sequence and cleave the surrogate Kesel Kanda stem.',
  },
  {
    id: 'CF03', numeral: 'III', sinhala: 'රීරි යකා', roman: 'Rīri Yakā',
    watch: 'Lē Irabatuwa Sunset · 6:08 PM', locale: 'Matara Firewood Kitchen',
    omen: 'Salted seer fish fried at red sunset without casting the ember tribute, a nicked thumb by the well, and a macaque-jawed shadow in the smoke rafters.',
    ritual: 'Anoint the three Marma nodes with crimson turmeric-lime water and bind the Pan Pedura mock funeral mat.',
  },
  {
    id: 'CF04', numeral: 'IV', sinhala: 'මහසෝනා', roman: 'Mahasōnā',
    watch: 'Thummansala Watch · 11:52 PM', locale: 'Anuradhapura Tank Crossroads',
    omen: 'A slipped bicycle chain beside a shattered exorcism ash-pot, a pilgrim whose toes point backward, and a five-fingered charcoal strike between the shoulders.',
    ritual: 'Humble the boar-headed titan in three comic Kōlama card trumps and hurl the Dummala resin fire-cloud.',
  },
  {
    id: 'CF05', numeral: 'V', sinhala: 'මහා හූනියම්', roman: 'Maha Hūniyam',
    watch: 'Rāhu Grahanaya · Midnight Eclipse', locale: 'Ancestral Walawwa Sanctuary',
    omen: 'A blood-eclipse over the roof tiles, four severed boundary lamps in the courtyard, and a five-metal Yantra effigy buried under the threshold stone.',
    ritual: 'Extract the four cardinal venomous Kaduru thorns and cleave the white ash-gourd and buried Yantra with the cold iron Giraya.',
  },
];

interface CasefileAccordionFolioProps {
  spec: DocketFolioSpec; isExpanded: boolean; isActive: boolean;
  kattadiyaUnlocked?: boolean; onToggle: () => void;
  onSelectRole: (id: CasefileId, role: 'ATHURA' | 'KATTADIYA') => void;
}

export const CasefileAccordionFolio: React.FC<CasefileAccordionFolioProps> = ({
  spec, isExpanded, isActive, kattadiyaUnlocked = false, onToggle, onSelectRole,
}) => {
  return (
    <div className={`border-b border-[#C8963E]/20 py-4 transition-colors ${isExpanded ? 'bg-[#14100C]/70 px-5' : 'px-2 hover:bg-[#120E0A]/40'}`}>
      <button
        type="button" onClick={onToggle} aria-expanded={isExpanded}
        className="flex w-full cursor-pointer flex-wrap items-baseline justify-between gap-2 text-left select-none focus:outline-none"
      >
        <div className="flex flex-wrap items-baseline gap-x-3">
          <span className="text-xs tracking-[0.25em] text-[#C8963E]/70">{spec.numeral}</span>
          <span className="text-lg font-normal text-[#D49B27]">{spec.sinhala}</span>
          <span className="text-sm tracking-[0.14em] text-[#EAE3D2]/85 uppercase">· {spec.roman}</span>
          {isActive && <span className="ml-2 text-[10px] tracking-[0.22em] text-[#8C1D24] uppercase">❖ Current Watch</span>}
        </div>
        <span className="text-[11px] tracking-[0.18em] text-[#C8963E]/60 uppercase">{spec.locale} · {spec.watch}</span>
      </button>

      {isExpanded && (
        <div className="animate-folio mt-3.5 space-y-3 border-l border-[#C8963E]/35 pl-4">
          <p className="text-sm leading-relaxed text-[#EAE3D2]/80">{spec.omen}</p>
          {kattadiyaUnlocked && (
            <p className="text-xs leading-relaxed text-[#C8963E]/85 italic">ශාස්ත්ර පිළිවෙත · {spec.ritual}</p>
          )}
          <div className="flex flex-wrap items-center gap-8 pt-2 text-xs tracking-[0.22em] uppercase">
            <button type="button" onClick={() => { triggerStylusScratch(); onSelectRole(spec.id, 'ATHURA'); }} className="incised-trigger cursor-pointer text-[#D49B27]">
              ❖ Witness the Watch (Athura)
            </button>
            {kattadiyaUnlocked ? (
              <button type="button" onClick={() => { triggerStylusScratch(); onSelectRole(spec.id, 'KATTADIYA'); }} className="incised-trigger cursor-pointer text-[#8C1D24] hover:text-[#D49B27]">
                ෴ Perform the Exorcism (Kattadiya)
              </button>
            ) : (
              <span className="text-[11px] tracking-[0.18em] text-[#8A99AD]/40 italic normal-case">
                ශාස්ත්ර මුද්රාව · Exorcist Lineage Sealed (Survive the Watch to Unbind)
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
