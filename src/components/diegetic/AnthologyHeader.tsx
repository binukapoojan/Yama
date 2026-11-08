// src/components/diegetic/AnthologyHeader.tsx
import React, { useState } from 'react';
import { BulathHurullaPayload, CasefileId, decodeBulathPayload } from '../../core/bulathCodec';
import { CASEFILE_META } from '../../core/savePersistence';
import { audioMixer } from '../../juice/audioMixer';
import { juiceDirector } from '../../juice/JuiceDirector';

interface AnthologyHeaderProps {
  activeCasefile: CasefileId;
  onSwitchCasefile: (nextId: CasefileId, role: 'ATHURA' | 'KATTADIYA') => void;
  onOpenCompendium: () => void;
  onApplySummons: (payload: BulathHurullaPayload) => void;
}

export const AnthologyHeader: React.FC<AnthologyHeaderProps> = ({
  activeCasefile,
  onSwitchCasefile,
  onOpenCompendium,
  onApplySummons,
}) => {
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [codeInput, setCodeInput] = useState<string>('');
  const [invalidPulse, setInvalidPulse] = useState<boolean>(false);

  const handleDecodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const decoded = decodeBulathPayload(codeInput);
    if (decoded) {
      setInvalidPulse(false);
      setDrawerOpen(false);
      setCodeInput('');
      audioMixer.playYakBeraPulse(0.85);
      onApplySummons(decoded);
    } else {
      setInvalidPulse(true);
      juiceDirector.triggerHaptic('dread_throb');
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-40 mx-auto max-w-[46rem] border-b border-[#C8963E]/15 bg-[#090807]/85 px-5 py-3.5 font-serif text-xs tracking-[0.12em] text-[#EAE3D2]/60 uppercase backdrop-blur-xs select-none">
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {(['CF01', 'CF02', 'CF03', 'CF04'] as CasefileId[]).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => { setDrawerOpen(false); onSwitchCasefile(id, 'ATHURA'); }}
              className={`cursor-pointer transition-colors ${activeCasefile === id ? 'text-[#C8963E]' : 'hover:text-[#EAE3D2]'}`}
            >
              {CASEFILE_META[id].title}
            </button>
          ))}
        </div>
        <div className="flex shrink-0 space-x-3 text-[11px]">
          <button type="button" onClick={onOpenCompendium} className="cursor-pointer text-[#C8963E]/80 hover:text-[#D49B27]">
            [Puskola]
          </button>
          <button
            type="button"
            onClick={() => setDrawerOpen((prev) => !prev)}
            className={`cursor-pointer transition-colors ${drawerOpen ? 'text-[#D49B27]' : 'text-[#EAE3D2]/45 hover:text-[#C8963E]'}`}
          >
            [Triage]
          </button>
        </div>
      </div>

      {drawerOpen && (
        <form onSubmit={handleDecodeSubmit} className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#C8963E]/20 pt-3 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="text-[#D49B27]">ශාස්ත්ර කේතය · Code:</span>
            <input
              type="text"
              value={codeInput}
              onChange={(e) => { setCodeInput(e.target.value.toUpperCase()); setInvalidPulse(false); }}
              placeholder="BH-MR-0758"
              aria-label="Bulath Hurulla Share Code"
              className={`w-36 border bg-[#14100C] px-2.5 py-1 font-serif text-xs tracking-widest text-[#EAE3D2] uppercase focus:outline-none ${
                invalidPulse ? 'border-[#8C1D24] text-[#8C1D24]' : 'border-[#C8963E]/40 focus:border-[#D49B27]'
              }`}
            />
            <button type="submit" className="cursor-pointer border border-[#C8963E]/45 bg-[#1C1611] px-2.5 py-1 text-[#D49B27] hover:border-[#D49B27]">
              [Unfold Leaf]
            </button>
          </div>
          <button
            type="button"
            onClick={() => { setDrawerOpen(false); onSwitchCasefile(activeCasefile, 'KATTADIYA'); }}
            className="cursor-pointer text-[10px] tracking-widest text-[#EAE3D2]/50 hover:text-[#C8963E]"
          >
            [Fresh Local Triage →]
          </button>
        </form>
      )}
    </header>
  );
};
