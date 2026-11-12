// src/components/diegetic/MantraBreathYantra.tsx
import React from 'react';

export interface MantraVerseSpec {
  sinhala: string;
  phonetic: string;
  durationMs: number;
}

interface MantraBreathYantraProps {
  titleSinhala: string;
  titleRoman: string;
  verse: MantraVerseSpec;
  verseIndex: number;
  totalVerses: number;
  breathProgress: number;
  knotsRemaining: number;
  status: 'IDLE' | 'INHALING' | 'RESONANT' | 'RUPTURED' | 'CONSECRATED';
  onHoldStart: (e: React.PointerEvent<SVGSVGElement>) => void;
  onHoldRelease: () => void;
  onLegacyClick: () => void;
}

export const MantraBreathYantra: React.FC<MantraBreathYantraProps> = ({
  titleSinhala, titleRoman, verse, verseIndex, totalVerses, breathProgress, knotsRemaining, status, onHoldStart, onHoldRelease, onLegacyClick,
}) => {
  const breathRadius = 22 + (breathProgress / 100) * 64;
  const isResonant = status === 'RESONANT' || (breathProgress >= 58 && breathProgress <= 98);
  const isRuptured = status === 'RUPTURED';

  return (
    <div className="mx-auto flex w-full max-w-[30rem] flex-col items-center px-4 font-serif select-none">
      <div className="mb-1 flex w-full items-center justify-between border-b border-[#C8963E]/25 pb-2 text-xs tracking-[0.22em] uppercase">
        <span className="text-[#D49B27]">{titleSinhala} <span className="text-[#EAE3D2]/60">· {titleRoman}</span></span>
        <div className="flex items-center gap-2" aria-label={`Pirith Ward Knots: ${knotsRemaining}`}>
          {[0, 1, 2].map((k) => (
            <span key={k} className={`text-sm transition-all duration-300 ${k < knotsRemaining ? 'scale-100 text-[#D49B27] drop-shadow-[0_0_8px_rgba(212,155,39,0.8)]' : 'scale-75 text-[#8C1D24]/35 line-through'}`}>❖</span>
          ))}
        </div>
      </div>

      <div className="relative my-2 flex h-56 w-56 items-center justify-center">
        <svg
          viewBox="0 0 220 220" onPointerDown={onHoldStart} onPointerUp={onHoldRelease} onPointerCancel={onHoldRelease} onClick={onLegacyClick} role="button" tabIndex={0}
          aria-label={`Chant Verse ${verseIndex + 1}: ${verse.phonetic}`}
          className={`h-full w-full cursor-pointer touch-none overflow-visible transition-transform duration-100 focus:outline-none ${isRuptured ? 'translate-x-1 scale-95' : isResonant ? 'scale-[1.03]' : ''}`}
        >
          <defs>
            <radialGradient id="yantraCore" cx="110" cy="110" r="95" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={isRuptured ? '#8C1D24' : isResonant ? '#D49B27' : '#3B4D7A'} stopOpacity="0.32" />
              <stop offset="65%" stopColor="#120E0B" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#060504" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="110" cy="110" r="96" fill="url(#yantraCore)" />
          <circle cx="110" cy="110" r="90" fill="none" stroke="#C8963E" strokeWidth="0.8" strokeDasharray="3 5" strokeOpacity="0.45" />
          <polygon points="110,16 136,84 204,110 136,136 110,204 84,136 16,110 84,84" fill="none" stroke="#C8963E" strokeWidth="0.7" strokeOpacity="0.3" />
          <circle cx="110" cy="110" r="74.5" fill="none" stroke={isResonant ? '#FFF3D1' : '#D49B27'} strokeWidth="12" strokeOpacity={isResonant ? '0.38' : '0.15'} />
          <circle cx="110" cy="110" r="68" fill="none" stroke="#D49B27" strokeWidth="1" strokeDasharray="4 3" strokeOpacity="0.65" />
          <circle cx="110" cy="110" r="81" fill="none" stroke="#8C1D24" strokeWidth="1.2" strokeOpacity="0.7" />
          <circle cx="110" cy="110" r={breathRadius} fill="none" stroke={isRuptured ? '#8C1D24' : isResonant ? '#FFF3D1' : '#6883BA'} strokeWidth={isResonant ? '3.2' : '2'} />
          <circle cx="110" cy="110" r="20" fill="#14100C" stroke={isResonant ? '#D49B27' : '#C8963E'} strokeWidth="1.5" />
          <text x="110" y="115" textAnchor="middle" fill="#D49B27" fontSize="14">{status === 'CONSECRATED' ? '❖' : '෴'}</text>
        </svg>
      </div>

      <div className="space-y-1 text-center">
        <div className="text-xs tracking-[0.22em] text-[#D49B27] uppercase">
          පදය {verseIndex + 1} / {totalVerses} ·{' '}
          {isResonant
            ? '❖ Release Now in the Golden Ring to Strike Verse! ❖'
            : isRuptured
              ? 'Breath Ruptured — Pirith Knot Snapped! Try Again'
              : 'Press & Hold the Center Circle (or Spacebar), Then Release When the Ring Glows Gold'}
        </div>
        <div className="typo-carved-title text-2xl font-normal tracking-wide">{verse.sinhala}</div>
        <div className="text-sm tracking-[0.14em] text-[#EAE3D2]/80 italic">{verse.phonetic}</div>
      </div>
    </div>
  );
};
