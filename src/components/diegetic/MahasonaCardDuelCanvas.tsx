// src/components/diegetic/MahasonaCardDuelCanvas.tsx
import React, { useEffect, useState } from 'react';
import { audioMixer } from '../../juice/audioMixer';
import { juiceDirector } from '../../juice/JuiceDirector';

interface MahasonaCardDuelProps {
  onDerisionComplete: () => void;
}

const TRUMP_CARDS = [
  { round: 0, title: 'Gothaimbara Toe', sinhala: 'ගෝඨයිම්බර පය', sigil: 'I', x: 86 },
  { round: 1, title: 'Iron Giraya', sinhala: 'යකඩ ගිරය', sigil: 'II', x: 200 },
  { round: 2, title: 'Rooster Crow', sinhala: 'කුකුළු හඬ', sigil: 'III', x: 314 },
] as const;

const DEMON_BOASTS = [
  'I · Boar-Headed Titan (වල් ඌරු වෙස්)',
  'II · Charnel Ash Hand (සොහොන් අළු අත)',
  'III · Midnight Thummansala (තුන්මන්සල යාමය)',
];

export const MahasonaCardDuelCanvas: React.FC<MahasonaCardDuelProps> = ({ onDerisionComplete }) => {
  const [round, setRound] = useState<number>(0);
  const [dragStartY, setDragStartY] = useState<number | null>(null);
  const [flareHeight, setFlareHeight] = useState<number>(0);
  const [flared, setFlared] = useState<boolean>(false);
  const [ashStrike, setAshStrike] = useState<boolean>(false);

  // Charnel wind pushes the Pandama torch down if you don't swipe fast enough
  useEffect(() => {
    if (round < 3 || flared) return;
    const wind = setInterval(() => {
      setFlareHeight((h) => (h > 0 ? Math.max(0, h - 4) : 0));
    }, 90);
    return () => clearInterval(wind);
  }, [round, flared]);

  const handlePlayCard = (cardRound: number) => {
    if (round >= 3 || flared) return;
    if (cardRound === round) {
      setRound(round + 1);
      setAshStrike(false);
      juiceDirector.triggerHaptic('iron_grip');
      audioMixer.playYakBeraPulse(0.65 + cardRound * 0.15);
    } else {
      setRound(0);
      setAshStrike(true);
      juiceDirector.triggerHaptic('dread_throb');
      audioMixer.playArterialPulse(0.95);
      setTimeout(() => setAshStrike(false), 450);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<SVGGElement>) => {
    if (round < 3 || flared) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragStartY(e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGGElement>) => {
    if (dragStartY === null || round < 3 || flared) return;
    const delta = Math.max(0, Math.min(120, dragStartY - e.clientY));
    setFlareHeight(delta);
    if (delta >= 95) {
      setFlared(true);
      setDragStartY(null);
      audioMixer.playYakBeraClimax();
      juiceDirector.triggerHaptic('dread_throb');
      setTimeout(() => onDerisionComplete(), 600);
    }
  };

  const demonScale = (1 - round * 0.18).toFixed(2);

  return (
    <div className="relative mx-auto flex w-full max-w-[26rem] flex-col items-center justify-center font-serif select-none">
      <div className="mb-2 text-[11px] tracking-[0.18em] text-[#C8963E]/85 uppercase">
        කෝලම හා කොළ සෙල්ලම · {ashStrike ? 'Anguru Atha Strike! Sequence Reset!' : `Thovil Card Derision (${round}/3) ෴`}
      </div>
      <svg viewBox="0 0 400 400" className={`h-auto w-full touch-none transition-transform duration-150 ${ashStrike ? 'scale-[1.03]' : ''}`}>
        {/* Shrinking Boar-Headed Mahasona Silhouette */}
        <g transform={`translate(200, 106) scale(${demonScale})`} className="transition-transform duration-500">
          <path d="M -72,54 L -56,-12 L -28,-48 L 0,-36 L 28,-52 L 62,-22 L 72,54 Z" fill={flared ? '#D49B27' : ashStrike ? '#2A0B0E' : '#14110D'} stroke={round === 3 ? '#D49B27' : '#8C1D24'} strokeWidth="2" />
          <path d="M -28,-22 Q -44,-42 -20,-36 M 28,-22 Q 44,-42 20,-36" fill="none" stroke="#EAE3D2" strokeWidth="2.4" />
          <circle cx="-14" cy="-16" r={ashStrike ? '5.5' : '4'} fill="#8C1D24" />
          <circle cx="14" cy="-16" r={ashStrike ? '5.5' : '4'} fill="#8C1D24" />
          <path d="M -18,14 L -6,8 L 6,14 L 18,8" fill="none" stroke="#C8963E" strokeWidth="1.2" opacity="0.65" />
        </g>

        <text x="200" y="186" textAnchor="middle" fill={ashStrike ? '#8C1D24' : '#C8963E'} fontSize="11" letterSpacing="1.3">
          {round < 3 ? DEMON_BOASTS[round] : flared ? 'මහසෝන් බල බිඳුණි · TITAN HUMBLED' : 'SWIPE TORCH UPWARD AGAINST THE WIND!'}
        </text>

        {TRUMP_CARDS.map(({ round: r, title, sinhala, sigil, x }) => {
          const played = round > r;
          return (
            <g key={r} transform={`translate(${x}, ${played ? 234 : 254})`} onClick={() => handlePlayCard(r)} className="cursor-pointer transition-transform duration-300">
              <rect x="-48" y="-40" width="96" height="80" rx="4" fill={played ? '#1E1812' : '#0E0C0A'} stroke={played ? '#D49B27' : '#C8963E'} strokeWidth={played ? '2' : '1'} />
              <rect x="-42" y="-34" width="84" height="68" fill="none" stroke="#C8963E" strokeWidth="0.5" strokeOpacity="0.4" />
              <text x="-34" y="-20" fill="#C8963E" fontSize="8" opacity="0.7">{sigil}</text>
              <text x="0" y="-4" textAnchor="middle" fill="#D49B27" fontSize="11">{sinhala}</text>
              <text x="0" y="16" textAnchor="middle" fill="#EAE3D2" fillOpacity="0.8" fontSize="9">{title}</text>
            </g>
          );
        })}

        <g onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={() => setDragStartY(null)} className={round === 3 ? 'cursor-ns-resize' : 'opacity-30 pointer-events-none'}>
          <line x1="200" y1="364" x2="200" y2="245" stroke="#D49B27" strokeWidth="1.5" strokeDasharray="4 4" />
          <circle cx="200" cy={360 - flareHeight} r={flared ? '135' : '18'} fill="#D49B27" fillOpacity={flared ? '0.35' : '0.88'} stroke="#8C1D24" strokeWidth="1.5" className="transition-all duration-150" />
          <circle cx="200" cy={360 - flareHeight} r={flared ? '70' : '7'} fill="#EAE3D2" fillOpacity={flared ? '0.5' : '0.9'} />
        </g>
      </svg>
    </div>
  );
};
