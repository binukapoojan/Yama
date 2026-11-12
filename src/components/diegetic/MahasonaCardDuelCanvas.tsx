// src/components/diegetic/MahasonaCardDuelCanvas.tsx
import React, { useEffect, useState } from 'react';
import { audioMixer } from '../../juice/audioMixer';
import { juiceDirector } from '../../juice/JuiceDirector';

interface MahasonaCardDuelProps { onDerisionComplete: () => void; }

const TRUMP_CARDS = [
  { round: 0, title: 'Gothaimbara Toe', sinhala: 'ගෝඨයිම්බර පය', sigil: 'I', x: 86 },
  { round: 1, title: 'Iron Giraya', sinhala: 'යකඩ ගිරය', sigil: 'II', x: 200 },
  { round: 2, title: 'Rooster Crow', sinhala: 'කුකුළු හඬ', sigil: 'III', x: 314 },
] as const;

export const MahasonaCardDuelCanvas: React.FC<MahasonaCardDuelProps> = ({ onDerisionComplete }) => {
  const [round, setRound] = useState<number>(0), [dragging, setDragging] = useState<boolean>(false);
  const [flareProgress, setFlareProgress] = useState<number>(0), [flared, setFlared] = useState<boolean>(false);

  const triggerFlareComplete = () => {
    if (flared) return;
    setFlared(true); setFlareProgress(100); setDragging(false);
    audioMixer.playYakBeraClimax(); juiceDirector.triggerHaptic('dread_throb'); onDerisionComplete();
  };

  useEffect(() => {
    if (round < 3 || flared || dragging) return;
    const wind = setInterval(() => setFlareProgress((h) => (h > 0 ? Math.max(0, h - 2) : 0)), 180);
    return () => clearInterval(wind);
  }, [round, flared, dragging]);

  const handlePlayCard = (cardRound: number) => {
    if (round >= 3 || flared) return;
    if (cardRound === round) {
      setRound(round + 1);
      juiceDirector.triggerHaptic('iron_grip');
      audioMixer.playYakBeraPulse(0.65 + cardRound * 0.15);
    } else if (cardRound > round) {
      juiceDirector.triggerHaptic('dread_throb');
    }
  };

  const handleTorchTap = () => {
    if (round < 3 || flared) return;
    juiceDirector.triggerHaptic('iron_grip'); audioMixer.playYakBeraPulse(0.85);
    setFlareProgress((prev) => {
      const next = prev + 45;
      if (next >= 100) triggerFlareComplete();
      return Math.min(100, next);
    });
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragging || round < 3 || flared) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relY = ((e.clientY - rect.top) / rect.height) * 400;
    const pct = Math.max(0, Math.min(100, ((360 - relY) / 95) * 100));
    setFlareProgress((prev) => {
      const next = Math.max(prev, pct);
      if (next >= 92) triggerFlareComplete();
      return next;
    });
  };

  const demonScale = (1 - round * 0.18).toFixed(2);
  const torchY = 360 - (flareProgress / 100) * 110;

  return (
    <div className="relative mx-auto flex w-full max-w-[26rem] flex-col items-center justify-center font-serif select-none">
      <div className="mb-1 text-center text-xs tracking-[0.2em] text-[#D49B27] uppercase">
        කෝලම හා කොළ සෙල්ලම · Thovil Card Derision ෴
      </div>
      <div className="mb-2.5 text-center text-xs leading-relaxed text-[#EAE3D2]/85 italic">
        {round < 3
          ? `Step I · Touch the pulsing trump card (${TRUMP_CARDS[round].sigil} · ${TRUMP_CARDS[round].title}) to humble Mahasōnā (${round}/3 won)`
          : `Step II · Drag the golden Pandama torch upward (or tap it repeatedly) to hurl the Dummala fire-cloud (${Math.round(flareProgress)}%)`}
      </div>

      <svg viewBox="0 0 400 400" onPointerMove={handlePointerMove} onPointerUp={() => setDragging(false)} className="h-auto w-full touch-none">
        {/* Shrinking Boar-Headed Mahasona Silhouette */}
        <g transform={`translate(200, 102) scale(${demonScale})`} className="transition-transform duration-500">
          <path d="M -72,54 L -56,-12 L -28,-48 L 0,-36 L 28,-52 L 62,-22 L 72,54 Z" fill={flared ? '#D49B27' : '#14110D'} stroke={round === 3 ? '#D49B27' : '#8C1D24'} strokeWidth="2" />
          <path d="M -28,-22 Q -44,-42 -20,-36 M 28,-22 Q 44,-42 20,-36" fill="none" stroke="#EAE3D2" strokeWidth="2.4" />
          <circle cx="-14" cy="-16" r="4" fill="#8C1D24" /><circle cx="14" cy="-16" r="4" fill="#8C1D24" />
        </g>

        {/* 3 Rigged Kolama Trump Cards */}
        {TRUMP_CARDS.map(({ round: r, title, sinhala, sigil, x }) => {
          const played = round > r, isNext = round === r;
          return (
            <g key={r} transform={`translate(${x}, ${played ? 228 : 248})`} onClick={() => handlePlayCard(r)} className="cursor-pointer transition-transform duration-300">
              {isNext && <rect x="-53" y="-45" width="106" height="90" rx="6" fill="none" stroke="#D49B27" strokeWidth="1.6" strokeDasharray="5 3" className="animate-pulse" />}
              <rect x="-48" y="-40" width="96" height="80" rx="4" fill={played ? '#1E1812' : '#0E0C0A'} stroke={played || isNext ? '#D49B27' : '#C8963E'} strokeWidth={played || isNext ? '2' : '1'} />
              <text x="-34" y="-20" fill="#D49B27" fontSize="10">{sigil}</text>
              <text x="0" y="-2" textAnchor="middle" fill="#D49B27" fontSize="11">{sinhala}</text>
              <text x="0" y="18" textAnchor="middle" fill="#EAE3D2" fontSize="9">{title}</text>
            </g>
          );
        })}

        {/* Step II: Pandama Torch & Dummala Fire-Cloud */}
        <g
          onPointerDown={(e) => { if (round < 3 || flared) return; e.currentTarget.setPointerCapture?.(e.pointerId); setDragging(true); }}
          onClick={handleTorchTap}
          className={round === 3 ? 'cursor-pointer' : 'opacity-30 pointer-events-none'}
        >
          <line x1="200" y1="364" x2="200" y2="245" stroke="#D49B27" strokeWidth="2" strokeDasharray="5 4" />
          {round === 3 && !flared && (
            <circle cx="200" cy={torchY} r="26" fill="none" stroke="#D49B27" strokeWidth="1.5" className="animate-ping" />
          )}
          <circle cx="200" cy={torchY} r={flared ? '135' : '18'} fill="#D49B27" fillOpacity={flared ? '0.35' : '0.9'} stroke="#8C1D24" strokeWidth="1.6" />
          <circle cx="200" cy={torchY} r={flared ? '70' : '7'} fill="#EAE3D2" />
        </g>
      </svg>
    </div>
  );
};
