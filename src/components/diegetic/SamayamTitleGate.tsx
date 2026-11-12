// src/components/diegetic/SamayamTitleGate.tsx
import React, { useEffect, useState } from 'react';
import { BulathHurullaPayload, CasefileId } from '../../core/bulathCodec';
import { CASEFILE_META, isHuniyamUnsealed } from '../../core/savePersistence';
import { audioMixer } from '../../juice/audioMixer';
import { triggerStylusScratch } from '../../juice/panhiyaFeedback';
import { BulathTelegramFoldOut } from './BulathTelegramFoldOut';
import { CasefileAccordionFolio, DOCKET_FOLIOS } from './CasefileAccordionFolio';
import { ColdOpenIgnition } from './ColdOpenIgnition';
import { LivingPuskolaSurface } from './LivingPuskolaSurface';

interface SamayamTitleGateProps {
  mode: 'COLD_OPEN' | 'LEDGER';
  activeCasefile: CasefileId;
  discoveredCount: number;
  unlockedKattadiya?: CasefileId[];
  onEnterDarkness: () => void;
  onStartCasefile: (id: CasefileId, role: 'ATHURA' | 'KATTADIYA') => void;
  onApplySummons: (payload: BulathHurullaPayload) => void;
  onOpenCompendium: () => void;
  onOpenCalibration?: () => void;
}

export const SamayamTitleGate: React.FC<SamayamTitleGateProps> = ({
  mode, activeCasefile, discoveredCount, unlockedKattadiya = [],
  onEnterDarkness, onStartCasefile, onApplySummons, onOpenCompendium, onOpenCalibration,
}) => {
  const [showFolios, setShowFolios] = useState<boolean>(mode === 'LEDGER');
  const [openFolio, setOpenFolio] = useState<CasefileId>(activeCasefile);

  useEffect(() => {
    if (mode === 'LEDGER') setShowFolios(true);
  }, [mode]);

  if (!showFolios) {
    return (
      <ColdOpenIgnition
        onSurviveWatch={() => { audioMixer.playYakBeraClimax(); onEnterDarkness(); }}
        onOpenDocket={() => { audioMixer.playYakBeraPulse(0.75); setShowFolios(true); }}
      />
    );
  }

  const huniyamOpen = isHuniyamUnsealed(unlockedKattadiya, discoveredCount);
  const visibleFolios = DOCKET_FOLIOS.filter((s) => s.id !== 'CF05' || huniyamOpen);
  const remainingCardinal = Math.max(0, 4 - unlockedKattadiya.filter((c) => c !== 'CF05').length);
  const remainingFolios = Math.max(0, 20 - discoveredCount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#040406]/96 px-4 py-10 font-serif text-[#EAE3D2] select-none">
      <LivingPuskolaSurface pageKey={openFolio} balma={55}>
        <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-[#C8963E]/25 pb-5">
          <div>
            <div className="text-[10px] tracking-[0.32em] text-[#8A99AD]/75 uppercase">සමයම් පුස්කොළ පොත · The Four Watches</div>
            <h2 className="typo-carved-title mt-1 text-2xl font-normal tracking-wide">Select a Samayam Folio ෴</h2>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-xs tracking-[0.2em] uppercase">
            {onOpenCalibration && (
              <button type="button" onClick={onOpenCalibration} className="incised-trigger cursor-pointer text-[#C8963E]/85">
                පහන · Wick
              </button>
            )}
            <button type="button" onClick={() => { triggerStylusScratch(); onOpenCompendium(); }} className="incised-trigger cursor-pointer text-[#C8963E]/85">
              ලේඛනය · Puskola ({discoveredCount}/28)
            </button>
            <button type="button" onClick={() => { triggerStylusScratch(); onEnterDarkness(); }} className="incised-trigger cursor-pointer text-[#D49B27]">
              ❖ Resume {CASEFILE_META[activeCasefile].title}
            </button>
          </div>
        </div>

        <div className="divide-y divide-[#C8963E]/15">
          {visibleFolios.map((spec) => (
            <CasefileAccordionFolio
              key={spec.id}
              spec={spec}
              isExpanded={openFolio === spec.id}
              isActive={activeCasefile === spec.id}
              kattadiyaUnlocked={unlockedKattadiya.includes(spec.id)}
              onToggle={() => {
                setOpenFolio(spec.id);
                audioMixer.playYakBeraPulse(0.5);
                triggerStylusScratch();
              }}
              onSelectRole={onStartCasefile}
            />
          ))}
          {!huniyamOpen && (
            <div className="py-3.5 text-center text-xs tracking-[0.16em] text-[#8C1D24]/75 italic">
              රාහු ග්රහණය · Fifth Watch Sealed ({remainingCardinal} Cardinal Exorcisms or {remainingFolios} Folios Remain)
            </div>
          )}
        </div>

        <BulathTelegramFoldOut onApplySummons={onApplySummons} />
      </LivingPuskolaSurface>
    </div>
  );
};
