// src/components/narrative/ProseStream.tsx
import React, { useEffect, useState } from 'react';
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
  const [mutations, setMutations] = useState<Record<string, MutatedTokenState>>(() => textMutator.getSnapshot());
  const [visibleCount, setVisibleCount] = useState<number>(1);
  const [anchorHeld, setAnchorHeld] = useState<boolean>(() => juiceDirector.isAnchorHeld());

  useEffect(() => {
    setVisibleCount(1);
    textMutator.loadPassage(passage);
    const unsubMutator = textMutator.subscribe(setMutations);
    const unsubAnchor = juiceDirector.on('ANCHOR_STATE_CHANGE', ({ held }) => setAnchorHeld(held));

    const total = passage.paragraphs.length;
    const timers: Array<ReturnType<typeof setTimeout>> = [];
    for (let i = 1; i <= total; i++) {
      timers.push(setTimeout(() => setVisibleCount(i + 1), i * 620));
    }
    return () => { unsubMutator(); unsubAnchor(); timers.forEach(clearTimeout); };
  }, [passage]);

  const choicesReady = visibleCount > passage.paragraphs.length;
  const watchMeta = passage.directives.samayam ? SAMAYAM_LABELS[passage.directives.samayam] : null;

  return (
    <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-[38rem] flex-col justify-end px-7 pt-[32vh] pb-32 md:px-12">
      {watchMeta && (
        <div className="mb-4 flex items-center gap-x-2.5 font-serif text-xs tracking-[0.18em] text-[#C8963E]/75 uppercase">
          <span className="text-[#D49B27]">{watchMeta.sinhala}</span>
          <span>෴</span>
          <span>{watchMeta.english}</span>
        </div>
      )}

      <article className="space-y-6 font-serif text-[1.18rem] leading-[1.82] tracking-[0.01em] text-[#EAE3D2] antialiased">
        {passage.paragraphs.map((paragraph, pIdx) => {
          const isVisible = pIdx < visibleCount;
          return (
            <p
              key={`${passage.name}_p_${pIdx}`}
              className={`transition-all duration-700 ease-out ${
                isVisible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'
              }`}
            >
              {paragraph.map((seg, sIdx) => {
                if (seg.type === 'plain') return <React.Fragment key={sIdx}>{seg.text}</React.Fragment>;
                const tokenState = mutations[seg.id];
                const display = tokenState?.currentText ?? seg.wakingText;
                const isCorrupted = tokenState?.isCorrupted ?? false;
                const isMorphing = tokenState?.isMorphing ?? false;
                return (
                  <span
                    key={seg.id}
                    className={`inline transition-colors duration-500 ${
                      anchorHeld
                        ? 'text-[#D49B27] decoration-[#C8963E]/60 underline decoration-1 underline-offset-4'
                        : isMorphing ? 'text-[#8A99AD] opacity-80' : isCorrupted ? 'text-[#D6DFEC]' : 'text-[#EAE3D2]'
                    }`}
                  >
                    {display}
                  </span>
                );
              })}
            </p>
          );
        })}
      </article>

      {!hideChoices && (
        <nav aria-label="Narrative actions" className={`mt-10 space-y-4 transition-opacity duration-700 ${choicesReady ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
          {passage.choices.map((choice, idx) => {
            const lockedByWard = Boolean(choice.requiresAnchorHeld && !anchorHeld);
            return (
              <button
                key={`${passage.name}_c_${idx}`}
                type="button"
                disabled={lockedByWard}
                onClick={() => onSelectChoice(choice)}
                className={`group flex w-full items-baseline text-left font-serif text-[1.08rem] leading-relaxed transition-all duration-300 ${
                  lockedByWard ? 'cursor-not-allowed text-[#EAE3D2]/30 italic' : 'cursor-pointer text-[#EAE3D2]/85 hover:text-[#EAE3D2] focus:outline-none'
                }`}
              >
                <span className={`mr-4 inline-block h-[1px] bg-[#C8963E] transition-all duration-300 ease-out ${lockedByWard ? 'w-2 opacity-25' : 'w-4 opacity-60 group-hover:w-8 group-hover:opacity-100'}`} />
                <span>
                  {choice.label}
                  {choice.requiresAnchorHeld && (
                    <span className={`ml-2 text-xs tracking-wider uppercase not-italic ${anchorHeld ? 'text-[#D49B27]' : 'text-[#8C1D24]/80'}`}>
                      {anchorHeld ? '[යකඩ ආරක්ෂාව · Ward Locked]' : '[Hold Iron Ward / Spacebar]'}
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
