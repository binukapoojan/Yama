// src/components/diegetic/AnthologyHeader.tsx
import React, { useState } from 'react';
import { BulathHurullaPayload, CasefileId, decodeBulathPayload } from '../../core/bulathCodec';
import { CASEFILE_META } from '../../core/savePersistence';
import { audioMixer } from '../../juice/audioMixer';
import { juiceDirector } from '../../juice/JuiceDirector';

interface AnthologyHeaderProps {
  activeCasefile: CasefileId;
  kattadiyaUnlocked?: boolean;
  onSwitchCasefile: (nextId: CasefileId, role: 'ATHURA' | 'KATTADIYA') => void;
  onOpenCompendium: () => void;
  onOpenCalibration?: () => void;
  onApplySummons: (payload: BulathHurullaPayload) => void;
  onOpenMenu: () => void;
}

export const AnthologyHeader: React.FC<AnthologyHeaderProps> = ({
  activeCasefile, kattadiyaUnlocked = false, onSwitchCasefile, onOpenCompendium, onOpenCalibration, onApplySummons, onOpenMenu,
}) => {
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [codeInput, setCodeInput] = useState<string>('');
  const [invalidPulse, setInvalidPulse] = useState<boolean>(false);

  const applyCodeString = (raw: string) => {
    const decoded = decodeBulathPayload(raw);
    if (decoded) {
      setInvalidPulse(false); setDrawerOpen(false); setCodeInput('');
      audioMixer.playYakBeraPulse(0.85); onApplySummons(decoded);
    } else {
      setInvalidPulse(true); juiceDirector.triggerHaptic('dread_throb');
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-40 mx-auto max-w-[46rem] border-b border-[#C8963E]/15 bg-[#060504]/85 px-6 py-4 font-serif text-xs tracking-[0.16em] text-[#EAE3D2]/55 uppercase backdrop-blur-xs select-none">
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-x-5 gap-y-1">
          {(['CF01', 'CF02', 'CF03', 'CF04'] as CasefileId[]).map((id) => (
            <button
              key={id} type="button"
              onClick={() => { setDrawerOpen(false); onSwitchCasefile(id, 'ATHURA'); }}
              className={`incised-trigger cursor-pointer ${activeCasefile === id ? 'text-[#D49B27]' : ''}`}
            >
              {CASEFILE_META[id].title}
            </button>
          ))}
        </div>
        <div className="flex shrink-0 items-center space-x-5 text-[11px]">
          <button type="button" onClick={onOpenMenu} className="incised-trigger cursor-pointer">පුස්කොළ · Folios</button>
          <button type="button" onClick={onOpenCompendium} className="incised-trigger cursor-pointer text-[#C8963E]/85">ලේඛනය · Ledger</button>
          {onOpenCalibration && (
            <button type="button" onClick={onOpenCalibration} className="incised-trigger cursor-pointer text-[#D49B27]/85">
              පහන · Wick
            </button>
          )}
          <button
            type="button" onClick={() => setDrawerOpen((prev) => !prev)}
            className={`incised-trigger cursor-pointer ${drawerOpen ? 'text-[#D49B27]' : ''}`}
          >
            ශාස්ත්ර · Divination
          </button>
        </div>
      </div>

      {drawerOpen && (
        <form onSubmit={(e) => { e.preventDefault(); applyCodeString(codeInput); }} className="animate-folio mt-3.5 flex flex-wrap items-center justify-between gap-3 border-t border-[#C8963E]/15 pt-3 text-[11px]">
          <div className="flex items-center gap-3">
            <span className="text-[#C8963E]/80">බුලත් ලකුණ · Leaf Mark:</span>
            <input
              type="text" value={codeInput}
              onChange={(e) => { setCodeInput(e.target.value.toUpperCase()); setInvalidPulse(false); }}
              placeholder="BH-MR-0758" aria-label="Bulath Hurulla Share Code"
              className={`w-32 border-b bg-transparent py-0.5 text-center font-serif text-xs tracking-widest text-[#D49B27] uppercase focus:outline-none ${
                invalidPulse ? 'border-[#8C1D24] text-[#8C1D24]' : 'border-[#C8963E]/40 focus:border-[#D49B27]'
              }`}
            />
            <button type="submit" className="incised-trigger cursor-pointer text-[#D49B27]">❖ Read Veins</button>
          </div>
          {kattadiyaUnlocked && (
            <button
              type="button"
              onClick={() => { setDrawerOpen(false); onSwitchCasefile(activeCasefile, 'KATTADIYA'); }}
              className="incised-trigger cursor-pointer text-[10px] tracking-[0.2em] text-[#EAE3D2]/50 hover:text-[#D49B27]"
            >
              ෴ Enter Exorcist Watch
            </button>
          )}
        </form>
      )}
    </header>
  );
};
