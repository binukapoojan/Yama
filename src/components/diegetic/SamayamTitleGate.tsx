// src/components/diegetic/SamayamTitleGate.tsx
import React, { useState } from 'react';
import { BulathHurullaPayload, CasefileId, decodeBulathPayload } from '../../core/bulathCodec';
import { CASEFILE_META } from '../../core/savePersistence';
import { audioMixer } from '../../juice/audioMixer';
import { juiceDirector } from '../../juice/JuiceDirector';

interface SamayamTitleGateProps {
  activeCasefile: CasefileId;
  activePassageId: string;
  discoveredCount: number;
  onResumeWatch: () => void;
  onStartCasefile: (id: CasefileId, role: 'ATHURA' | 'KATTADIYA') => void;
  onApplySummons: (payload: BulathHurullaPayload) => void;
  onOpenCompendium: () => void;
}

const FOLIO_DETAILS: Record<CasefileId, { sinhala: string; locale: string; watch: string; desc: string }> = {
  CF01: { sinhala: 'I · කළු කුමාර', locale: 'Nugegoda Annex', watch: 'Sandhyā Dusk · 6:00 PM', desc: 'Wet hair, unshrouded mirrors, and bruised Nil Manel petals in the monsoon blackout.' },
  CF02: { sinhala: 'II · මළ මෝහිනී', locale: 'Upper Lake Road, Kandy', watch: 'Maddhama Midnight · 11:45 PM', desc: 'A weeping figure in white by the bamboo culvert holding a shrouded infant bundle.' },
  CF03: { sinhala: 'III · රීරි යකා', locale: 'Matara Firewood Kitchen', watch: 'Lē Irabatuwa · 6:00 PM', desc: 'Salted seer fish frying at red sunset, unwashed blood, and the woven funeral mat.' },
  CF04: { sinhala: 'IV · මහසෝනා', locale: 'Anuradhapura Crossroads', watch: 'Maddhama Midnight · 11:52 PM', desc: 'A snapped bicycle chain at the three-way cemetery junction and the five-fingered ash strike.' },
};

export const SamayamTitleGate: React.FC<SamayamTitleGateProps> = ({
  activeCasefile, activePassageId, discoveredCount, onResumeWatch, onStartCasefile, onApplySummons, onOpenCompendium,
}) => {
  const [lampLit, setLampLit] = useState<boolean>(false);
  const [codeInput, setCodeInput] = useState<string>('');
  const [invalidCode, setInvalidCode] = useState<boolean>(false);

  const handleLightPahana = () => {
    audioMixer.unlock(); audioMixer.playYakBeraPulse(0.85); juiceDirector.triggerHaptic('iron_grip'); setLampLit(true);
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const decoded = decodeBulathPayload(codeInput);
    if (decoded) {
      setInvalidCode(false); audioMixer.playYakBeraPulse(0.9); onApplySummons(decoded);
    } else {
      setInvalidCode(true); juiceDirector.triggerHaptic('dread_throb');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#090807]/95 px-5 py-10 font-serif text-[#EAE3D2] select-none">
      {!lampLit ? (
        <div className="my-auto flex max-w-[28rem] flex-col items-center text-center">
          <div className="mb-2 text-xs tracking-[0.25em] text-[#C8963E]/75 uppercase">After Monsoon · Folk-Horror Anthology</div>
          <h1 className="mb-1 text-3xl font-medium tracking-wide text-[#D49B27]">කළු කුමාර සහ සමයම් පුස්කොළය</h1>
          <div className="mb-6 text-sm tracking-[0.18em] text-[#EAE3D2]/65 uppercase">The Samayam Puskola Anthology ෴</div>
          <button type="button" onClick={handleLightPahana} className="group relative my-4 flex h-36 w-36 cursor-pointer items-center justify-center focus:outline-none">
            <svg viewBox="0 0 120 120" className="h-full w-full">
              <circle cx="60" cy="60" r="52" fill="none" stroke="#C8963E" strokeWidth="0.8" strokeDasharray="3 3" strokeOpacity="0.45" />
              <path d="M 34,76 Q 60,94 86,76 L 76,66 L 44,66 Z" fill="#18130E" stroke="#C8963E" strokeWidth="1.4" />
              <line x1="60" y1="66" x2="60" y2="98" stroke="#C8963E" strokeWidth="3" />
              <path d="M 44,98 L 76,98" stroke="#C8963E" strokeWidth="2" />
              <path d="M 60,34 C 68,48 66,60 60,64 C 54,60 52,48 60,34 Z" fill="#D49B27" className="opacity-45 transition-all duration-500 group-hover:scale-110 group-hover:opacity-100" />
            </svg>
          </button>
          <button type="button" onClick={handleLightPahana} className="mt-2 cursor-pointer border-y border-[#C8963E]/45 px-6 py-2.5 text-xs tracking-[0.22em] text-[#D49B27] uppercase transition-colors hover:border-[#D49B27] hover:bg-[#16120E]">
            [ පහන දල්වන්න · Strike Match & Light Pahana ]
          </button>
          <p className="mt-6 max-w-[22rem] text-xs leading-relaxed text-[#EAE3D2]/45 italic">
            Wear headphones in darkness. When the oil-lamp flame bends flat, hold the Cold Iron Ward (or Spacebar) to anchor waking sight.
          </p>
        </div>
      ) : (
        <div className="my-auto w-full max-w-[44rem] border-y-2 border-[#C8963E]/45 bg-[#120E0B] px-6 py-8 shadow-[0_0_80px_rgba(0,0,0,0.95)] md:px-10">
          <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2 border-b border-[#C8963E]/25 pb-4">
            <div>
              <div className="text-lg font-medium text-[#D49B27]">සමයම් පුස්කොළ පොත ෴ The Samayam Folios</div>
              <div className="text-[11px] tracking-[0.16em] text-[#EAE3D2]/55 uppercase">Choose a Casefile Watch or Unfold a Kattadiya Summons</div>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <button type="button" onClick={onOpenCompendium} className="cursor-pointer text-[#C8963E] hover:text-[#D49B27]">
                [Puskola Ledger · {discoveredCount}/28]
              </button>
              <button type="button" onClick={onResumeWatch} className="cursor-pointer border border-[#D49B27]/60 bg-[#1E1710] px-3 py-1 text-[11px] tracking-widest text-[#D49B27] uppercase hover:bg-[#D49B27]/20">
                [Resume · {CASEFILE_META[activeCasefile].title} ({activePassageId.replace(/_/g, ' ')})]
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {(['CF01', 'CF02', 'CF03', 'CF04'] as CasefileId[]).map((id) => {
              const f = FOLIO_DETAILS[id];
              return (
                <div key={id} className="flex flex-col justify-between border border-[#C8963E]/25 bg-[#0D0A08] p-4 transition-colors hover:border-[#C8963E]/60">
                  <div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-base font-medium text-[#D49B27]">{f.sinhala}</span>
                      <span className="text-[10px] tracking-widest text-[#C8963E]/75 uppercase">{f.watch}</span>
                    </div>
                    <div className="mt-0.5 text-xs tracking-wider text-[#EAE3D2]/85 uppercase">{CASEFILE_META[id].title} · {f.locale}</div>
                    <p className="mt-2 text-xs leading-relaxed text-[#EAE3D2]/60 italic">{f.desc}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-[#C8963E]/15 pt-2.5 text-[11px] tracking-wider uppercase">
                    <button type="button" onClick={() => onStartCasefile(id, 'ATHURA')} className="cursor-pointer text-[#EAE3D2]/85 hover:text-[#D49B27]">[Enter Watch (Athura) →]</button>
                    <button type="button" onClick={() => onStartCasefile(id, 'KATTADIYA')} className="cursor-pointer text-[#C8963E]/70 hover:text-[#D49B27]">[Triage (Kattadiya)]</button>
                  </div>
                </div>
              );
            })}
          </div>
          <form onSubmit={handleCodeSubmit} className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#C8963E]/25 pt-4 text-xs">
            <span className="text-[#C8963E]/85">බුලත් හුරුල්ල කේතය · Have a friend's Bulath Summons Code?</span>
            <div className="flex items-center gap-2">
              <input type="text" value={codeInput} onChange={(e) => { setCodeInput(e.target.value.toUpperCase()); setInvalidCode(false); }} placeholder="BH-MR-0758" aria-label="Menu Bulath Share Code" className={`w-36 border bg-[#090807] px-2.5 py-1 text-xs tracking-widest text-[#EAE3D2] uppercase focus:outline-none ${invalidCode ? 'border-[#8C1D24] text-[#8C1D24]' : 'border-[#C8963E]/40 focus:border-[#D49B27]'}`} />
              <button type="submit" className="cursor-pointer border border-[#C8963E]/50 bg-[#1A140E] px-3 py-1 text-[11px] tracking-widest text-[#D49B27] uppercase hover:border-[#D49B27]">[Unfold Summons →]</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
