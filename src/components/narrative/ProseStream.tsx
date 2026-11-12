// src/components/narrative/ProseStream.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { getScarForPassage, recordMemoryScarIfEnding } from '../../core/memoryScars';
import { SamayamVelava, TwineChoice, TwinePassage } from '../../core/schema';
import { juiceDirector } from '../../juice/JuiceDirector';
import { MutatedTokenState, textMutator } from '../../juice/textMutator';

interface ProseStreamProps {
  passage: TwinePassage;
  onSelectChoice: (choice: TwineChoice) => void;
  hideChoices?: boolean;
}

const SAMAYAM_LABELS: Record<SamayamVelava, { sinhala: string; english: string }> = {
  ALUYA_DAWN: { sinhala: 'අලුයම යාමය', english: 'Aluya Dawn Watch · 05:30 AM' },
  IRA_MUDUN_MIDDAY: { sinhala: 'ඉර මුදුන් යාමය', english: 'Ira Mudun Midday Watch · 12:00 PM' },
  SANDHYA_DUSK: { sinhala: 'සන්ධ්යා යාමය', english: 'Sandhyā Dusk Watch · 06:00 PM' },
  MADDHAMA_MIDNIGHT: { sinhala: 'මධ්යම යාමය', english: 'Maddhama Midnight Watch · 12:00 AM' },
};

export const ProseStream: React.FC<ProseStreamProps> = ({ passage, onSelectChoice, hideChoices = false }) => {
  const [mutations, setMutations] = useState<Record<string, MutatedTokenState>>(() => textMutator.getSnapshot()), [visibleCount, setVisibleCount] = useState<number>(1);
  const [anchorHeld, setAnchorHeld] = useState<boolean>(() => juiceDirector.isAnchorHeld()), activeScar = useMemo(() => getScarForPassage(passage.name), [passage.name]);

  useEffect(() => {
    setVisibleCount(1);
    recordMemoryScarIfEnding(passage.name);
    textMutator.loadPassage(passage);
    const unsubMutator = textMutator.subscribe(setMutations);
    const unsubAnchor = juiceDirector.on('ANCHOR_STATE_CHANGE', ({ held }) => setAnchorHeld(held));
    const total = passage.paragraphs.length;
    const timers: Array<ReturnType<typeof setTimeout>> = [];
    for (let i = 1; i <= total; i++) timers.push(setTimeout(() => setVisibleCount(i + 1), i * 620));
    return () => { unsubMutator(); unsubAnchor(); timers.forEach(clearTimeout); };
  }, [passage]);

  const choicesReady = visibleCount > passage.paragraphs.length;
  const watchMeta = passage.directives.samayam ? SAMAYAM_LABELS[passage.directives.samayam] : null;

  useEffect(() => {
    if (!choicesReady || hideChoices) return;
    const onKey = (e: KeyboardEvent) => {
      const idx = ['Digit1', 'Digit2', 'Digit3', 'Digit4'].indexOf(e.code);
      const picked = idx >= 0 ? passage.choices[idx] : undefined;
      if (picked && (!picked.requiresAnchorHeld || juiceDirector.isAnchorHeld())) {
        e.preventDefault(); onSelectChoice(picked);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [choicesReady, hideChoices, passage.choices, onSelectChoice]);

  return (
    <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-[39rem] flex-col justify-end px-7 pt-[28vh] pb-32 md:px-12">
      {watchMeta && (
        <div className="mb-6 border-b border-[#3B4D7A]/35 pb-2.5 font-serif">
          <div className="flex items-center gap-x-3 text-xs tracking-[0.26em] text-[#8A99AD] uppercase">
            <span className="text-sm text-[#D49B27]">{watchMeta.sinhala}</span><span className="text-[#C8963E]/60">෴</span><span>{watchMeta.english}</span>
          </div>
        </div>
      )}

      <article className="space-y-6 font-serif text-[1.22rem] leading-[1.88] tracking-[0.012em] text-[#EAE3D2] antialiased">
        {passage.paragraphs.map((paragraph, pIdx) => (
          <p key={`${passage.name}_p_${pIdx}`} className={`typo-dropcap transition-all duration-700 ease-out ${pIdx < visibleCount ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'}`}>
            {paragraph.map((seg, sIdx) => {
              if (seg.type === 'plain') return <React.Fragment key={sIdx}>{seg.text}</React.Fragment>;
              const tok = mutations[seg.id], isCorrupted = tok?.isCorrupted ?? false;
              return (
                <span
                  key={seg.id} style={isCorrupted && !anchorHeld ? { textShadow: '0 0 16px rgba(91, 120, 184, 0.75)' } : undefined}
                  className={`inline transition-all duration-500 ${
                    anchorHeld ? 'text-[#D49B27] decoration-[#C8963E]/60 underline decoration-1 underline-offset-4' : tok?.isMorphing ? 'text-[#6883BA] opacity-85 italic' : isCorrupted ? 'text-[#9BB4E8] italic' : 'text-[#EAE3D2]'
                  }`}
                >
                  {tok?.currentText ?? seg.wakingText}
                </span>
              );
            })}
          </p>
        ))}
      </article>

      {activeScar && choicesReady && (
        <aside className="animate-folio mt-6 border-l border-[#8C1D24]/70 pl-3.5 font-serif text-xs leading-relaxed text-[#9BB4E8]/85 italic">
          <span className="not-italic tracking-[0.2em] text-[#B82932] uppercase">{activeScar.marginaliaSinhala} · </span>{activeScar.marginaliaEcho}
        </aside>
      )}

      {!hideChoices && (
        <nav aria-label="Narrative actions" className={`mt-9 space-y-4 border-t border-[#C8963E]/20 pt-6 transition-opacity duration-700 ${choicesReady ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
          {passage.choices.map((choice, idx) => {
            const lockedByWard = Boolean(choice.requiresAnchorHeld && !anchorHeld);
            return (
              <button
                key={`${passage.name}_c_${idx}`} type="button" disabled={lockedByWard} onClick={() => onSelectChoice(choice)}
                className={`group flex w-full items-baseline text-left font-serif text-[1.12rem] leading-relaxed transition-all duration-300 ${lockedByWard ? 'cursor-not-allowed text-[#8A99AD]/30 italic' : 'incised-trigger cursor-pointer text-[#EAE3D2]/85 focus:outline-none'}`}
              >
                <span className={`mr-3.5 text-xs transition-transform duration-300 ${lockedByWard ? 'text-[#3B4D7A]/50' : 'text-[#C8963E]/75 group-hover:translate-x-1 group-hover:text-[#D49B27]'}`}>❖</span>
                <span>
                  {choice.label}
                  {choice.requiresAnchorHeld && (
                    <span className={`ml-2.5 text-xs tracking-[0.18em] uppercase not-italic ${anchorHeld ? 'text-[#D49B27]' : 'text-[#6883BA]/85'}`}>
                      {anchorHeld ? '· යකඩ ආරක්ෂාව Anchored' : '· Hold Cold Iron Seal Below'}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </nav>
      )}
    </main>
  );
};
