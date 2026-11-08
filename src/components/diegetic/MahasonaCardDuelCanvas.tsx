// src/components/diegetic/MahasonaCardDuelCanvas.tsx
import React, { useState } from 'react';
import { audioMixer } from '../../juice/audioMixer';
import { juiceDirector } from '../../juice/JuiceDirector';

interface MahasonaCardDuelProps {
  onDerisionComplete: () => void;
}

const TRUMP_CARDS = [
  { round: 0, title: 'Gothaimbara Toe', sinhala: 'ගෝඨයිම්බර පය', x: 86 },
  { round: 1, title: 'Iron Giraya', sinhala: 'යකඩ ගිරය', x: 200 },
  { round: 2, title: 'Rooster Crow', sinhala: 'කුකුළු හඬ', x: 314 },
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

  const handlePlayCard = (cardRound: number) => {
    if (round >= 3 || flared) return;
    if (cardRound === round) {
      setRound(round + 1);
      juiceDirector.triggerHaptic('iron_grip');
      audioMixer.playYakBeraPulse(0.6 + cardRound * 0.15);
    } else {
      setRound(0);
      juiceDirector.triggerHaptic('dread_throb');
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
      audioMixer.playYakBeraPulse(1.0);
      juiceDirector.triggerHaptic('dread_throb');
      setTimeout(() => onDerisionComplete(), 600);
    }
  };

  const demonScale = (1 - round * 0.18).toFixed(2);

  return (
    <div className="relative mx-auto flex w-full max-w-[25rem] items-center justify-center select-none">
      <svg viewBox="0 0 400 400" className="h-auto w-full touch-none font-serif">
        <g transform={`translate(200, 108) scale(${demonScale})`} className="transition-transform duration-500">
          <path d="M -68,52 L -54,-18 L -28,-48 L 0,-36 L 28,-48 L 54,-18 L 68,52 Z" fill={flared ? '#D49B27' : '#14110D'} stroke={round === 3 ? '#D49B27' : '#8C1D24'} strokeWidth="1.8" />
          <path d="M -26,-22 Q -38,-38 -20,-34 M 26,-22 Q 38,-38 20,-34" fill="none" stroke="#EAE3D2" strokeWidth="2" />
          <circle cx="-14" cy="-16" r="3.5" fill="#8C1D24" /><circle cx="14" cy="-16" r="3.5" fill="#8C1D24" />
        </g>
        <text x="200" y="188" textAnchor="middle" fill="#C8963E" fontSize="11" letterSpacing="1.5">
          {round < 3 ? DEMON_BOASTS[round] : flared ? 'මහසෝන් බල බිඳුණි · TITAN HUMBLED' : 'SWIPE TORCH UPWARD TO HURL DUMMALA FIRE'}
        </text>
        {TRUMP_CARDS.map(({ round: r, title, sinhala, x }) => {
          const played = round > r;
          return (
            <g key={r} transform={`translate(${x}, ${played ? 236 : 254})`} onClick={() => handlePlayCard(r)} className="cursor-pointer transition-transform duration-300">
              <rect x="-46" y="-38" width="92" height="76" rx="4" fill={played ? '#1E1812' : '#0E0C0A'} stroke={played ? '#D49B27' : '#C8963E'} strokeWidth={played ? '1.8' : '0.9'} />
              <text x="0" y="-6" textAnchor="middle" fill="#D49B27" fontSize="11">{sinhala}</text>
              <text x="0" y="14" textAnchor="middle" fill="#EAE3D2" fillOpacity="0.75" fontSize="9">{title}</text>
            </g>
          );
        })}
        <g onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={() => setDragStartY(null)} className={round === 3 ? 'cursor-ns-resize' : 'opacity-30 pointer-events-none'}>
          <circle cx="200" cy={358 - flareHeight} r={flared ? '130' : '16'} fill="#D49B27" fillOpacity={flared ? '0.35' : '0.85'} className="transition-all duration-300" />
          <line x1="200" y1="358" x2="200" y2="245" stroke="#D49B27" strokeWidth="1.4" strokeDasharray="4 4" />
        </g>
      </svg>
    </div>
  );
};
