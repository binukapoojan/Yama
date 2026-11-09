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

const FOLIO_DETAILS: Record<CasefileId, { num: string; sinhala: string; locale: string; watch: string; desc: string }> = {
  CF01: { num: 'I', sinhala: 'කළු කුමාර', locale: 'Nugegoda Annex', watch: 'Sandhyā Dusk · 6:00 PM', desc: 'Wet hair, unshrouded mirrors, and bruised Nil Manel petals in the monsoon blackout.' },
  CF02: { num: 'II', sinhala: 'මළ මෝහිනී', locale: 'Upper Lake Road, Kandy', watch: 'Maddhama Midnight · 11:45 PM', desc: 'A weeping figure in white by the bamboo culvert holding a shrouded infant bundle.' },
  CF03: { num: 'III', sinhala: 'රීරි යකා', locale: 'Matara Firewood Kitchen', watch: 'Lē Irabatuwa · 6:00 PM', desc: 'Salted seer fish frying at red sunset, unwashed blood, and the woven funeral mat.' },
  CF04: { num: 'IV', sinhala: 'මහසෝනා', locale: 'Anuradhapura Crossroads', watch: 'Maddhama Midnight · 11:52 PM', desc: 'A snapped bicycle chain at the three-way cemetery junction and the five-fingered ash strike.' },
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
    e.preventDefault(); const decoded = decodeBulathPayload(codeInput);
    if (decoded) { setInvalidCode(false); audioMixer.playYakBeraPulse(0.9); onApplySummons(decoded); }
    else { setInvalidCode(true); juiceDirector.triggerHaptic('dread_throb'); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#090807] px-4 py-8 font-serif text-[#EAE3D2] select-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 42%, rgba(200,150,62,0.11) 0%, rgba(140,29,36,0.05) 38%, #090807 78%)' }}>
      {!lampLit ? (
        <div className="my-auto flex max-w-[32rem] flex-col items-center px-4 text-center">
          <div className="mb-3 text-[11px] tracking-[0.32em] text-[#C8963E]/80 uppercase">After Monsoon · Folk-Horror Anthology</div>
          <h1 className="mb-2 text-3xl leading-snug font-medium tracking-wide text-[#D49B27] md:text-4xl">කළු කුමාර සහ සමයම් පුස්කොළය</h1>
          <div className="mb-8 flex items-center gap-3 text-xs tracking-[0.24em] text-[#EAE3D2]/65 uppercase">
            <span className="h-[1px] w-8 bg-[#C8963E]/40" /><span>The Samayam Puskola Anthology ෴</span><span className="h-[1px] w-8 bg-[#C8963E]/40" />
          </div>
          <button type="button" onClick={handleLightPahana} className="group relative my-2 flex h-44 w-44 cursor-pointer items-center justify-center focus:outline-none">
            <svg viewBox="0 0 160 160" className="h-full w-full overflow-visible">
              <defs><radialGradient id="wickHalo" cx="80" cy="48" r="54" gradientUnits="userSpaceOnUse"><stop offset="0%" stopColor="#D49B27" stopOpacity="0.45" /><stop offset="55%" stopColor="#8C1D24" stopOpacity="0.15" /><stop offset="100%" stopColor="#090807" stopOpacity="0" /></radialGradient></defs>
              <circle cx="80" cy="48" r="54" fill="url(#wickHalo)" className="transition-transform duration-700 group-hover:scale-125" /><circle cx="80" cy="80" r="68" fill="none" stroke="#C8963E" strokeWidth="0.75" strokeDasharray="3 4" strokeOpacity="0.4" /><circle cx="80" cy="80" r="58" fill="none" stroke="#C8963E" strokeWidth="0.5" strokeOpacity="0.25" />
              <path d="M 80,22 C 91,40 89,56 80,62 C 71,56 69,40 80,22 Z" fill="#D49B27" className="opacity-80 transition-all duration-500 group-hover:scale-110 group-hover:opacity-100" /><path d="M 80,32 C 85,43 84,53 80,58 C 76,53 75,43 80,32 Z" fill="#FFF3D1" opacity="0.9" />
              <path d="M 38,66 L 122,66 L 106,82 C 90,90 70,90 54,82 Z" fill="#1B140E" stroke="#D49B27" strokeWidth="1.5" /><path d="M 73,86 L 87,86 L 84,122 L 76,122 Z" fill="#1B140E" stroke="#C8963E" strokeWidth="1.3" />
              <ellipse cx="80" cy="102" rx="12" ry="4" fill="#1B140E" stroke="#C8963E" strokeWidth="1.2" /><path d="M 52,132 C 62,122 98,122 108,132 Z" fill="#1B140E" stroke="#D49B27" strokeWidth="1.5" />
            </svg>
          </button>
          <button type="button" onClick={handleLightPahana} className="mt-4 cursor-pointer border-y border-[#C8963E]/55 bg-[#14100C]/80 px-7 py-3 text-xs tracking-[0.2em] whitespace-nowrap text-[#D49B27] uppercase transition-all hover:border-[#D49B27] hover:bg-[#1E1710] hover:shadow-[0_0_25px_rgba(212,155,39,0.2)]">
            [ පහන දල්වන්න · Strike Match & Light Pahana ]
          </button>
          <p className="mt-6 max-w-[24rem] text-xs leading-relaxed text-[#EAE3D2]/50 italic">
            Wear headphones in darkness. When the oil-lamp flame bends flat, hold the Cold Iron Ward (or Spacebar) to anchor waking sight.
          </p>
        </div>
      ) : (
        <div className="my-auto w-full max-w-[46rem] border-y-2 border-[#C8963E]/55 bg-[#120E0B] px-6 py-7 shadow-[0_25px_90px_rgba(0,0,0,0.98)] md:px-10" style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(200,150,62,0.025) 0px, rgba(200,150,62,0.025) 1px, transparent 1px, transparent 4px)' }}>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[#C8963E]/25 pb-4">
            <div className="flex items-center gap-3.5">
              <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-[#C8963E]/60 bg-[#090807] shadow-inner" />
              <div>
                <div className="text-lg font-medium tracking-wide text-[#D49B27]">සමයම් පුස්කොළ පොත ෴ The Samayam Folios</div>
                <div className="text-[10px] tracking-[0.2em] text-[#EAE3D2]/55 uppercase">Select a Casefile Watch or Unfold a Kattadiya Summons</div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <button type="button" onClick={onOpenCompendium} className="cursor-pointer border border-[#C8963E]/35 bg-[#090807] px-3 py-1.5 text-[11px] tracking-wider text-[#C8963E] uppercase hover:border-[#D49B27] hover:text-[#D49B27]">[Puskola · {discoveredCount}/28]</button>
              <button type="button" onClick={onResumeWatch} title={`Passage: ${activePassageId}`} className="cursor-pointer border border-[#D49B27]/70 bg-[#22190F] px-3.5 py-1.5 text-[11px] tracking-widest text-[#D49B27] uppercase hover:bg-[#D49B27]/25">[Resume {CASEFILE_META[activeCasefile].title} →]</button>
            </div>
          </div>
          <div className="divide-y divide-[#C8963E]/20 border-y border-[#C8963E]/25">
            {(['CF01', 'CF02', 'CF03', 'CF04'] as CasefileId[]).map((id) => {
              const f = FOLIO_DETAILS[id], isCurrent = activeCasefile === id;
              return (
                <div key={id} className={`flex flex-col justify-between gap-3 py-3.5 pl-3.5 pr-2 transition-colors md:flex-row md:items-center ${isCurrent ? 'border-l-2 border-l-[#D49B27] bg-[#19130E]/90' : 'border-l-2 border-l-transparent hover:bg-[#16110C]/60'}`}>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-baseline gap-x-2.5">
                      <span className="text-xs font-semibold tracking-widest text-[#C8963E]">{f.num} ·</span>
                      <span className="text-base font-medium text-[#D49B27]">{f.sinhala}</span>
                      <span className="text-xs tracking-wider text-[#EAE3D2]/90 uppercase">· {f.locale}</span>
                      <span className="text-[10px] tracking-[0.15em] text-[#C8963E]/75 uppercase">[{f.watch}]</span>
                    </div>
                    <p className="text-xs leading-relaxed text-[#EAE3D2]/60 italic">{f.desc}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 self-end md:self-center">
                    <button type="button" onClick={() => onStartCasefile(id, 'ATHURA')} className="cursor-pointer border border-[#C8963E]/45 bg-[#0D0A08] px-3 py-1.5 text-[11px] tracking-wider whitespace-nowrap text-[#EAE3D2] uppercase hover:border-[#D49B27] hover:text-[#D49B27]">[Enter Watch →]</button>
                    <button type="button" onClick={() => onStartCasefile(id, 'KATTADIYA')} className="cursor-pointer px-2 py-1.5 text-[11px] tracking-wider whitespace-nowrap text-[#C8963E]/75 uppercase hover:text-[#D49B27]">[Triage]</button>
                  </div>
                </div>
              );
            })}
          </div>
          <form onSubmit={handleCodeSubmit} className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
            <span className="text-[#C8963E]/85">බුලත් හුරුල්ල කේතය · Unfold a Friend&apos;s Bulath Summons Code:</span>
            <div className="flex items-center gap-2">
              <input type="text" value={codeInput} onChange={(e) => { setCodeInput(e.target.value.toUpperCase()); setInvalidCode(false); }} placeholder="BH-MR-0758" aria-label="Menu Bulath Share Code" className={`w-36 border bg-[#090807] px-2.5 py-1.5 text-xs tracking-widest text-[#EAE3D2] uppercase focus:outline-none ${invalidCode ? 'border-[#8C1D24] text-[#8C1D24]' : 'border-[#C8963E]/40 focus:border-[#D49B27]'}`} />
              <button type="submit" className="cursor-pointer border border-[#C8963E]/50 bg-[#1A140E] px-3.5 py-1.5 text-[11px] tracking-widest whitespace-nowrap text-[#D49B27] uppercase hover:border-[#D49B27]">[Unfold Summons →]</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
