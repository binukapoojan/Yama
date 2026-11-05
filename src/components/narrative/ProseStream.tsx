import React, { useEffect, useState } from 'react';
import { TwineChoice, TwinePassage } from '../../core/schema';
import { juiceDirector } from '../../juice/JuiceDirector';
import { MutatedTokenState, textMutator } from '../../juice/textMutator';

interface ProseStreamProps {
  passage: TwinePassage;
  onSelectChoice: (choice: TwineChoice) => void;
}

export const ProseStream: React.FC<ProseStreamProps> = ({ passage, onSelectChoice }) => {
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

    return () => {
      unsubMutator();
      unsubAnchor();
      timers.forEach(clearTimeout);
    };
  }, [passage]);

  const choicesReady = visibleCount > passage.paragraphs.length;

  return (
    <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-[38rem] flex-col justify-end px-7 pt-[36vh] pb-32 md:px-12">
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
                        ? 'text-[#EAE3D2] decoration-[#C8963E]/50 underline decoration-1 underline-offset-4'
                        : isMorphing
                          ? 'text-[#8A99AD] opacity-80'
                          : isCorrupted
                            ? 'text-[#D6DFEC]'
                            : 'text-[#EAE3D2]'
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

      <nav
        aria-label="Narrative actions"
        className={`mt-10 space-y-4 transition-opacity duration-700 ${
          choicesReady ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        {passage.choices.map((choice, idx) => {
          const lockedByWard = Boolean(choice.requiresAnchorHeld && !anchorHeld);
          return (
            <button
              key={`${passage.name}_c_${idx}`}
              type="button"
              disabled={lockedByWard}
              onClick={() => onSelectChoice(choice)}
              className={`group flex w-full items-baseline text-left font-serif text-[1.08rem] leading-relaxed transition-all duration-300 ${
                lockedByWard
                  ? 'cursor-not-allowed text-[#EAE3D2]/25 italic'
                  : 'cursor-pointer text-[#EAE3D2]/80 hover:text-[#EAE3D2] focus:outline-none'
              }`}
            >
              <span
                className={`mr-4 inline-block h-[1px] bg-[#C8963E] transition-all duration-300 ease-out ${
                  lockedByWard
                    ? 'w-2 opacity-20'
                    : 'w-4 opacity-60 group-hover:w-8 group-hover:opacity-100 group-active:w-10'
                }`}
              />
              <span>{choice.label}</span>
            </button>
          );
        })}
      </nav>
    </main>
  );
};
