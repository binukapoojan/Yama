// src/components/diegetic/PuskolaCompendium.tsx
import React, { useEffect, useState } from 'react';
import { CasefileId } from '../../core/bulathCodec';
import { PUSKOLA_ENTRIES } from '../../core/compendiumStore';
import { juiceDirector } from '../../juice/JuiceDirector';
import { SamayamSealEpilogue } from './SamayamSealEpilogue';

interface PuskolaCompendiumProps {
  isOpen: boolean; initialCasefile: CasefileId; discoveredIds: string[]; onClose: () => void;
}
type FolioTab = CasefileId | 'SEAL';
const FOLIO_META: Record<CasefileId, { sinhala: string; roman: string }> = {
  CF01: { sinhala: 'පළමු පත්ඉරුව · කළු කුමාර', roman: 'Folio I · Kalu Kumāra' },
  CF02: { sinhala: 'දෙවන පත්ඉරුව · මළ මෝහිනී', roman: 'Folio II · Mala Mōhinī' },
  CF03: { sinhala: 'තුන්වන පත්ඉරුව · රීරි යකා', roman: 'Folio III · Rīri Yakā' },
  CF04: { sinhala: 'සිව්වන පත්ඉරුව · මහසෝනා', roman: 'Folio IV · Mahasōnā' },
};

export const PuskolaCompendium: React.FC<PuskolaCompendiumProps> = ({
  isOpen, initialCasefile, discoveredIds, onClose,
}) => {
  const [activeFolio, setActiveFolio] = useState<FolioTab>(initialCasefile);
  const totalCount = PUSKOLA_ENTRIES.length, allDiscovered = discoveredIds.length >= totalCount;

  useEffect(() => { setActiveFolio(initialCasefile); }, [initialCasefile]);
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.code === 'Escape' && isOpen) onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  const folioEntries = PUSKOLA_ENTRIES.filter((e) => e.casefile === activeFolio);
  const avatars = folioEntries.filter((e) => e.category === 'AVATARA'), lakunuList = folioEntries.filter((e) => e.category === 'LAKUNU');

  return (
    <div role="dialog" aria-label="Puskola Potha Ethnographic Ledger" onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#090807]/90 px-4 py-10 backdrop-blur-xs select-none">
      <div onClick={(e) => e.stopPropagation()}
        className="relative max-h-[85vh] w-full max-w-[46rem] overflow-y-auto border-y border-[#C8963E]/40 bg-[#16120E] px-8 py-9 font-serif text-[#EAE3D2] shadow-[0_25px_70px_rgba(0,0,0,0.95)]"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(200,150,62,0.03) 0px, rgba(200,150,62,0.03) 1px, transparent 1px, transparent 4px)' }}>
        <div className="mb-8 flex items-center justify-between border-b border-[#C8963E]/25 pb-4">
          <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-[#C8963E]/50 bg-[#090807] shadow-inner" />
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-center">
            {(['CF01', 'CF02', 'CF03', 'CF04'] as CasefileId[]).map((id) => (
              <button key={id} type="button" onClick={() => { setActiveFolio(id); juiceDirector.triggerHaptic('iron_grip'); }}
                className={`cursor-pointer transition-colors ${activeFolio === id ? 'text-[#D49B27]' : 'text-[#EAE3D2]/40 hover:text-[#EAE3D2]/75'}`}>
                <div className="text-[13px] font-medium tracking-wide">{FOLIO_META[id].sinhala}</div>
                <div className="mt-0.5 text-[10px] tracking-[0.16em] uppercase">{FOLIO_META[id].roman}</div>
              </button>
            ))}
            <button type="button" disabled={!allDiscovered} onClick={() => { setActiveFolio('SEAL'); juiceDirector.triggerHaptic('dread_throb'); }}
              className={`transition-colors ${activeFolio === 'SEAL' ? 'text-[#D49B27]' : allDiscovered ? 'cursor-pointer text-[#C8963E] hover:text-[#D49B27]' : 'cursor-not-allowed text-[#EAE3D2]/20'}`}>
              <div className="text-[13px] font-medium tracking-wide">සමයම් මුද්රාව ෴</div>
              <div className="mt-0.5 text-[10px] tracking-[0.16em] uppercase">{allDiscovered ? 'V · Consecration Seal' : `Seal (${discoveredIds.length}/${totalCount})`}</div>
            </button>
          </div>
          <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-[#C8963E]/50 bg-[#090807] shadow-inner" />
        </div>

        {activeFolio === 'SEAL' ? <SamayamSealEpilogue /> : (
          <>
            <section className="mb-8 space-y-5">
              <div className="flex items-baseline justify-between border-b border-[#C8963E]/15 pb-1.5 text-[11px] tracking-[0.2em] text-[#C8963E]/85 uppercase">
                <span>I · Avatāra Manifestations</span><span className="text-xs tracking-normal text-[#C8963E]">යක්ෂ අවතාර ෴</span>
              </div>
              {avatars.map((entry) => {
                const unlocked = discoveredIds.includes(entry.id);
                return (
                  <div key={entry.id} className="border-l border-[#C8963E]/30 pl-4">
                    <div className="flex flex-wrap items-baseline gap-x-2.5 text-base font-medium text-[#EAE3D2]">
                      <span className="text-[#D49B27]">{entry.sinhalaScript}</span><span className="text-xs text-[#C8963E]/60">෴</span><span>{entry.sinhalaTitle}</span>
                      <span className="text-sm font-normal italic text-[#C8963E]/85">— {unlocked ? entry.englishGloss : 'අදෘශ්යමාන අවතාරය · Unwitnessed'}</span>
                    </div>
                    <p className={`mt-1.5 text-sm leading-relaxed ${unlocked ? 'text-[#EAE3D2]/80' : 'text-[#EAE3D2]/25 italic'}`}>
                      {unlocked ? entry.inscription : '· · · Un-inked palm leaf incision. Witness this manifestation during the Samayam watch to rub dummala soot into the script. · · ·'}
                    </p>
                  </div>
                );
              })}
            </section>
            <section className="space-y-4">
              <div className="flex items-baseline justify-between border-b border-[#C8963E]/15 pb-1.5 text-[11px] tracking-[0.2em] text-[#C8963E]/85 uppercase">
                <span>II · Sastra Bulath Lakunu</span><span className="text-xs tracking-normal text-[#C8963E]">ශාස්ත්ර බුලත් ලකුණු ෴</span>
              </div>
              {lakunuList.map((entry) => {
                const unlocked = discoveredIds.includes(entry.id);
                return (
                  <div key={entry.id} className="border-b border-[#C8963E]/10 pb-3.5 last:border-none">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <div className={`flex items-baseline gap-x-2 text-[15px] ${unlocked ? 'text-[#EAE3D2]' : 'text-[#EAE3D2]/30'}`}>
                        <span className={unlocked ? 'text-[#D49B27]' : ''}>{entry.sinhalaScript}</span><span className="text-xs text-[#C8963E]/45">·</span><span>{entry.sinhalaTitle}</span>
                      </div>
                      <span className="text-xs italic text-[#C8963E]/70">{unlocked ? entry.englishGloss : 'නොකැළැල් නහරය · Unblemished Vein'}</span>
                    </div>
                    {unlocked && <p className="mt-1 text-xs leading-relaxed text-[#EAE3D2]/70">{entry.inscription}</p>}
                  </div>
                );
              })}
            </section>
          </>
        )}
        <div className="mt-8 text-center">
          <button type="button" onClick={onClose} className="cursor-pointer text-xs tracking-[0.22em] text-[#C8963E]/70 uppercase hover:text-[#D49B27]">[පුස්කොළ පොත වසන්න · Close Puskola Folio]</button>
        </div>
      </div>
    </div>
  );
};
