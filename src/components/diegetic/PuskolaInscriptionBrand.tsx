// src/components/diegetic/PuskolaInscriptionBrand.tsx
import React, { useEffect, useState } from 'react';
import { PUSKOLA_ENTRIES } from '../../core/compendiumStore';
import { audioMixer } from '../../juice/audioMixer';
import { juiceDirector } from '../../juice/JuiceDirector';

interface PuskolaInscriptionBrandProps {
  newlyUnlockedId: string | null;
  huniyamJustUnsealed?: boolean;
}

export const PuskolaInscriptionBrand: React.FC<PuskolaInscriptionBrandProps> = ({
  newlyUnlockedId,
  huniyamJustUnsealed = false,
}) => {
  const [activeItem, setActiveItem] = useState<{ id?: string; isEclipse?: boolean } | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!newlyUnlockedId && !huniyamJustUnsealed) return;
    setActiveItem(huniyamJustUnsealed ? { isEclipse: true } : { id: newlyUnlockedId! });
    setVisible(true);
    audioMixer.playStylusScratch();
    juiceDirector.triggerHaptic('stylus_scratch');

    const fadeTimer = setTimeout(() => setVisible(false), 2600);
    const clearTimer = setTimeout(() => setActiveItem(null), 3200);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(clearTimer);
    };
  }, [newlyUnlockedId, huniyamJustUnsealed]);

  if (!activeItem) return null;
  const entry = activeItem.id ? PUSKOLA_ENTRIES.find((e) => e.id === activeItem.id) : null;
  if (!activeItem.isEclipse && !entry) return null;

  return (
    <aside
      aria-live="polite"
      className={`pointer-events-none fixed top-16 right-6 z-40 select-none font-serif text-right transition-all duration-700 ease-out ${
        visible ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
      }`}
    >
      {activeItem.isEclipse ? (
        <div className="border-r-2 border-[#8C1D24] pr-3">
          <div className="text-[11px] tracking-[0.22em] text-[#8C1D24] uppercase">
            රාහු ග්රහණය ෴ Eclipse Warrant
          </div>
          <div className="mt-0.5 text-xs text-[#D49B27] drop-shadow-[0_0_8px_rgba(212,155,39,0.7)]">
            මහා හූනියම් සමයම ෴ The Fifth Eclipse Watch Has Unsealed
          </div>
        </div>
      ) : (
        <div className="border-r-2 border-[#C8963E]/45 pr-3">
          <div className="text-[10px] tracking-[0.24em] text-[#C8963E]/80 uppercase">
            පුස්කොළ ලකුණ ෴ Vein Inscribed
          </div>
          <div className="mt-0.5 text-xs text-[#D49B27] drop-shadow-[0_0_6px_rgba(212,155,39,0.6)]">
            {entry!.sinhalaScript} · {entry!.sinhalaTitle}
          </div>
        </div>
      )}
    </aside>
  );
};
