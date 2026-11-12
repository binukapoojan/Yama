// src/components/diegetic/PuskolaCompendium.tsx
import React, { useEffect, useState } from 'react';
import { CasefileId } from '../../core/bulathCodec';
import { getEntriesByCasefile } from '../../core/compendiumStore';
import { CASEFILE_META } from '../../core/savePersistence';
import { audioMixer } from '../../juice/audioMixer';
import { juiceDirector } from '../../juice/JuiceDirector';
import { LivingPuskolaSurface } from './LivingPuskolaSurface';

interface PuskolaCompendiumProps {
  isOpen: boolean; initialCasefile: CasefileId; discoveredIds: string[]; onClose: () => void;
}

const CASE_TABS: CasefileId[] = ['CF01', 'CF02', 'CF03', 'CF04'];
const CATEGORY_SIGIL: Record<string, string> = {
  AVATARA: 'M 12,2 L 15,9 L 22,12 L 15,15 L 12,22 L 9,15 L 2,12 L 9,9 Z',
  LAKUNU: 'M 12,4 C 17,9 19,15 12,20 C 5,15 7,9 12,4 Z',
};

export const PuskolaCompendium: React.FC<PuskolaCompendiumProps> = ({
  isOpen, initialCasefile, discoveredIds, onClose,
}) => {
  const [activeTab, setActiveTab] = useState<CasefileId>(initialCasefile);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const entries = getEntriesByCasefile(activeTab);
  const discoveredSet = new Set(discoveredIds);

  const handleSelectTab = (tab: CasefileId) => {
    setActiveTab(tab); audioMixer.playYakBeraPulse(0.45); juiceDirector.triggerHaptic('iron_grip');
  };

  return (
    <div role="dialog" aria-label="Puskola Potha Compendium" className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#040406]/95 px-4 py-10 font-serif text-[#EAE3D2] select-none">
      <LivingPuskolaSurface pageKey={activeTab} balma={45}>
        <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-[#C8963E]/30 pb-4">
          <div>
            <div className="text-[10px] tracking-[0.32em] text-[#8A99AD]/75 uppercase">සමයම් පුස්කොළ ලේඛනය · Etched Talipot Archive</div>
            <h2 className="typo-carved-title mt-0.5 text-2xl font-normal tracking-wide">පුස්කොළ පොත ෴ The Puskola Ledger</h2>
          </div>
          <div className="flex items-center gap-6 text-xs tracking-[0.22em] uppercase">
            <span className="text-[#C8963E]/70">Inscribed: {discoveredIds.length} / 28</span>
            <button type="button" onClick={onClose} className="incised-trigger cursor-pointer text-[#D49B27]">❖ Tie Cord &amp; Close</button>
          </div>
        </div>

        <div className="my-4 flex flex-wrap gap-x-7 gap-y-2 border-b border-[#C8963E]/15 pb-3 text-xs tracking-[0.2em] uppercase">
          {CASE_TABS.map((id) => (
            <button
              key={id} type="button" onClick={() => handleSelectTab(id)}
              className={`incised-trigger cursor-pointer pb-1 transition-all ${activeTab === id ? 'border-b border-[#D49B27] text-[#D49B27]' : 'text-[#EAE3D2]/45 hover:text-[#EAE3D2]/80'}`}
            >
              {CASEFILE_META[id].title}
            </button>
          ))}
        </div>

        <div className="max-h-[58vh] divide-y divide-[#C8963E]/15 overflow-y-auto pr-2">
          {entries.map((entry) => {
            const unlocked = discoveredSet.has(entry.id);
            const sigilPath = CATEGORY_SIGIL[entry.category] ?? CATEGORY_SIGIL.LAKUNU;
            return (
              <div key={entry.id} className="group flex items-start gap-4 py-3.5 transition-colors hover:bg-[#16110C]/50">
                <svg viewBox="0 0 24 24" className="mt-1 h-5 w-5 shrink-0">
                  <path d={sigilPath} fill="none" stroke={unlocked ? '#D49B27' : '#3B4D7A'} strokeWidth="1.3" strokeOpacity={unlocked ? '0.9' : '0.35'} className={unlocked ? 'transition-transform duration-500 group-hover:rotate-45' : ''} />
                </svg>
                {unlocked ? (
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-baseline gap-x-2.5">
                      <span className="text-base text-[#D49B27]">{entry.sinhalaScript}</span>
                      <span className="text-xs tracking-[0.16em] text-[#EAE3D2]/90 uppercase">· {entry.sinhalaTitle}</span>
                      <span className="text-[10px] tracking-[0.22em] text-[#8A99AD]/70 uppercase">({entry.category})</span>
                    </div>
                    <p className="text-xs leading-relaxed text-[#EAE3D2]/70 italic">{entry.inscription}</p>
                  </div>
                ) : (
                  <div className="space-y-1 opacity-40">
                    <div className="text-sm tracking-[0.28em] text-[#6883BA] blur-[0.6px]">░░░░ ශාස්ත්ර රහස්ය ලකුණ ░░░░</div>
                    <p className="text-[11px] tracking-wider text-[#EAE3D2]/40 italic">Uninscribed palm vein — witness this omen or inspect its blemish under the Pahana flame.</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </LivingPuskolaSurface>
    </div>
  );
};
