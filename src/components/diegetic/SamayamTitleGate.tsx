// src/components/diegetic/SamayamTitleGate.tsx
import React, { useState } from 'react';
import { BulathHurullaPayload, CasefileId, decodeBulathPayload } from '../../core/bulathCodec';
import { CASEFILE_META } from '../../core/savePersistence';
import { audioMixer } from '../../juice/audioMixer';
import { juiceDirector } from '../../juice/JuiceDirector';

interface SamayamTitleGateProps {
  mode: 'COLD_OPEN' | 'LEDGER';
  activeCasefile: CasefileId;
  discoveredCount: number;
  onEnterDarkness: () => void;
  onStartCasefile: (id: CasefileId, role: 'ATHURA' | 'KATTADIYA') => void;
  onApplySummons: (payload: BulathHurullaPayload) => void;
  onOpenCompendium: () => void;
}

const WATCH_INDEX: Record<CasefileId, { sinhala: string; time: string; place: string }> = {
  CF01: { sinhala: 'කළු කුමාර', time: '06:14 PM · Sandhyā Watch', place: 'Nugegoda Bodima' },
  CF02: { sinhala: 'මළ මෝහිනී', time: '11:46 PM · Maddhama Watch', place: 'Upper Lake Road, Kandy' },
  CF03: { sinhala: 'රීරි යකා', time: '06:08 PM · Lē Irabatuwa', place: 'Matara Firewood Kitchen' },
  CF04: { sinhala: 'මහසෝනා', time: '11:52 PM · Thummansala Watch', place: 'Anuradhapura Tank Bund' },
};

export const SamayamTitleGate: React.FC<SamayamTitleGateProps> = ({
  mode, activeCasefile, discoveredCount, onEnterDarkness, onStartCasefile, onApplySummons, onOpenCompendium,
}) => {
  const [codeInput, setCodeInput] = useState<string>('');
  const [invalidCode, setInvalidCode] = useState<boolean>(false);

  const handleColdStrike = () => {
    audioMixer.unlock(); audioMixer.playYakBeraPulse(0.95); juiceDirector.triggerHaptic('dread_throb'); onEnterDarkness();
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault(); const decoded = decodeBulathPayload(codeInput);
    if (decoded) {
      setInvalidCode(false); audioMixer.unlock(); audioMixer.playYakBeraPulse(0.9); onApplySummons(decoded);
    } else {
      setInvalidCode(true); juiceDirector.triggerHaptic('dread_throb');
    }
  };

  if (mode === 'COLD_OPEN') {
    return (
      <div onClick={handleColdStrike} className="fixed inset-0 z-50 flex cursor-pointer flex-col items-center justify-center bg-[#060504] px-6 font-serif text-[#EAE3D2] select-none">
        <div className="relative mb-10 flex items-center justify-center">
          <span className="absolute h-16 w-16 animate-ping rounded-full bg-[#8C1D24]/20 duration-1000" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#D49B27] shadow-[0_0_28px_8px_rgba(212,155,39,0.55)]" />
        </div>
        <p className="max-w-[23rem] text-center text-base leading-relaxed tracking-wide text-[#EAE3D2]/75 italic">
          &ldquo;The 6:00 PM transformer on High Level Road just blew. Do not look into the mirror until the wick catches.&rdquo;
        </p>
        <span className="mt-10 text-[11px] tracking-[0.28em] text-[#8C1D24]/90 uppercase">
          [ අඳුරට පිවිසෙන්න · Touch the Dark to Strike a Match ]
        </span>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#070605]/98 px-6 py-10 font-serif text-[#EAE3D2] select-none">
      <div className="w-full max-w-[34rem] space-y-7">
        <div className="flex items-baseline justify-between border-b border-[#8C1D24]/35 pb-3">
          <span className="text-xs tracking-[0.25em] text-[#8C1D24] uppercase">සමයම් යාමය · The Samayam Watches</span>
          <div className="flex gap-4 text-[11px] tracking-widest uppercase">
            <button type="button" onClick={onOpenCompendium} className="cursor-pointer text-[#C8963E]/70 hover:text-[#D49B27]">[Puskola {discoveredCount}/28]</button>
            <button type="button" onClick={onEnterDarkness} className="cursor-pointer text-[#EAE3D2]/60 hover:text-[#EAE3D2]">[Return to Dark ×]</button>
          </div>
        </div>

        <div className="divide-y divide-[#C8963E]/10">
          {(['CF01', 'CF02', 'CF03', 'CF04'] as CasefileId[]).map((id) => {
            const w = WATCH_INDEX[id], active = activeCasefile === id;
            return (
              <div key={id} className="flex items-center justify-between py-3.5">
                <div>
                  <div className={`text-base ${active ? 'text-[#D49B27]' : 'text-[#EAE3D2]/80'}`}>
                    {CASEFILE_META[id].title} <span className="ml-1.5 text-sm text-[#8C1D24]">{w.sinhala}</span>
                  </div>
                  <div className="text-[11px] tracking-widest text-[#EAE3D2]/40 uppercase">{w.time} · {w.place}</div>
                </div>
                <div className="flex gap-4 text-[11px] tracking-widest uppercase">
                  <button type="button" onClick={() => onStartCasefile(id, 'ATHURA')} className="cursor-pointer text-[#EAE3D2]/75 hover:text-[#D49B27]">[Victim →]</button>
                  <button type="button" onClick={() => onStartCasefile(id, 'KATTADIYA')} className="cursor-pointer text-[#8C1D24]/85 hover:text-[#D49B27]">[Exorcist]</button>
                </div>
              </div>
            );
          })}
        </div>

        <form onSubmit={handleCodeSubmit} className="flex items-center justify-between border-t border-[#C8963E]/15 pt-4 text-xs">
          <span className="text-[11px] tracking-widest text-[#EAE3D2]/45 uppercase">Bulath Warrant:</span>
          <div className="flex items-center gap-2">
            <input
              type="text" value={codeInput}
              onChange={(e) => { setCodeInput(e.target.value.toUpperCase()); setInvalidCode(false); }}
              placeholder="BH-MR-0758"
              className={`w-32 border-b bg-transparent px-1 py-0.5 text-center text-xs tracking-widest text-[#EAE3D2] uppercase focus:outline-none ${invalidCode ? 'border-[#8C1D24] text-[#8C1D24]' : 'border-[#C8963E]/40 focus:border-[#D49B27]'}`}
            />
            <button type="submit" className="cursor-pointer text-[11px] tracking-widest text-[#C8963E] uppercase hover:text-[#D49B27]">[Unfold →]</button>
          </div>
        </form>
      </div>
    </div>
  );
};
