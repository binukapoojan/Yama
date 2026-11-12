// src/components/diegetic/ColdOpenIgnition.tsx
import React, { useState } from 'react';
import { audioMixer } from '../../juice/audioMixer';
import { juiceDirector } from '../../juice/JuiceDirector';

interface ColdOpenIgnitionProps {
  onSurviveWatch: () => void;
  onOpenDocket: () => void;
}

export const ColdOpenIgnition: React.FC<ColdOpenIgnitionProps> = ({
  onSurviveWatch,
  onOpenDocket,
}) => {
  const [ignited, setIgnited] = useState(false);

  const handleIgnite = () => {
    if (ignited) return;
    setIgnited(true);
    audioMixer.unlock();
    audioMixer.playYakBeraPulse(0.8);
    juiceDirector.triggerHaptic('iron_grip');
    setTimeout(() => onSurviveWatch(), 950);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#040406]/96 px-6 text-center font-serif text-[#EAE3D2] select-none">
      <div className="animate-folio max-w-[36rem] space-y-6">
        <div className="text-[11px] tracking-[0.34em] text-[#8A99AD]/80 uppercase">
          After Monsoon Presents · සන්ධ්යා සමයම් ලේඛනය
        </div>

        <div className="space-y-2">
          <h1 className="typo-carved-title text-4xl font-normal tracking-[0.14em] sm:text-5xl">
            ගොම්මන් · GOMMAN
          </h1>
          <div className="text-sm tracking-[0.28em] text-[#C8963E]/85 uppercase">
            The Ceylon Night Dockets
          </div>
        </div>

        <p className="mx-auto max-w-[28rem] text-sm leading-relaxed text-[#EAE3D2]/75 italic">
          When the evening bell fades and the monsoon rain seals the verandah, keep your coconut-oil wick lit and your Cold Iron Ward within reach.
        </p>

        {/* Interactive Brass Pahana Oil Lamp */}
        <div className="flex flex-col items-center pt-2">
          <button
            type="button"
            onClick={handleIgnite}
            aria-label="Ignite the Brass Pahana Lamp"
            className="incised-trigger group flex cursor-pointer flex-col items-center gap-3 focus:outline-none"
          >
            <svg viewBox="0 0 140 150" className="h-36 w-36 overflow-visible">
              {ignited && (
                <g className="animate-flame">
                  <ellipse cx="70" cy="46" rx="22" ry="30" fill="#D49B27" fillOpacity="0.22" />
                  <path
                    d="M 70,22 C 82,42 80,58 70,64 C 60,58 58,42 70,22 Z"
                    fill="#FFF3D1"
                    stroke="#D49B27"
                    strokeWidth="1.5"
                  />
                </g>
              )}
              <path d="M 68,64 Q 70,56 72,64" stroke="#C8963E" strokeWidth="2" fill="none" />
              <path
                d="M 32,74 Q 70,92 108,74 L 96,94 Q 70,104 44,94 Z"
                fill="#16110C"
                stroke="#D49B27"
                strokeWidth="1.8"
              />
              <line x1="70" y1="98" x2="70" y2="128" stroke="#C8963E" strokeWidth="4" />
              <ellipse cx="70" cy="112" rx="10" ry="4" fill="#16110C" stroke="#D49B27" strokeWidth="1.3" />
              <path d="M 42,136 L 98,136 L 90,128 L 50,128 Z" fill="#16110C" stroke="#D49B27" strokeWidth="1.8" />
            </svg>

            <span className="text-xs tracking-[0.26em] text-[#D49B27] uppercase">
              {ignited ? '❖ පහන දැල්වුණි · Entering the Watch ❖' : '❖ Touch the Wick to Ignite the Pahana'}
            </span>
          </button>
        </div>

        <div className="pt-4">
          <button
            type="button"
            onClick={() => {
              audioMixer.unlock();
              onOpenDocket();
            }}
            className="incised-trigger cursor-pointer text-xs tracking-[0.24em] text-[#EAE3D2]/65 uppercase"
          >
            ෴ Unroll the Five Ceylon Night Dockets
          </button>
        </div>
      </div>
    </div>
  );
};
