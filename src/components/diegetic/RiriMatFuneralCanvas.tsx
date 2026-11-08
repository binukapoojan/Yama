// src/components/diegetic/RiriMatFuneralCanvas.tsx
import React, { useState } from 'react';
import { audioMixer } from '../../juice/audioMixer';
import { juiceDirector } from '../../juice/JuiceDirector';

interface RiriMatFuneralProps {
  onFuneralSealed: () => void;
}

const CHAKRA_NODES: ReadonlyArray<{ id: number; cy: number; sinhala: string; label: string }> = [
  { id: 0, cy: 118, sinhala: 'හිස', label: 'Crown' },
  { id: 1, cy: 200, sinhala: 'ළය', label: 'Heart' },
  { id: 2, cy: 282, sinhala: 'පාද', label: 'Feet' },
];

export const RiriMatFuneralCanvas: React.FC<RiriMatFuneralProps> = ({ onFuneralSealed }) => {
  const [anointed, setAnointed] = useState<number[]>([]);
  const [shroudFold, setShroudFold] = useState<number>(0);
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [knotsTied, setKnotsTied] = useState<number[]>([]);

  const allAnointed = anointed.length === 3;
  const isShrouded = shroudFold >= 100;

  const handleAnoint = (id: number) => {
    if (anointed.includes(id)) return;
    setAnointed((prev) => [...prev, id]);
    juiceDirector.triggerHaptic('iron_grip');
    audioMixer.playYakBeraPulse(0.55);
    audioMixer.playArterialPulse(0.8);
  };

  const handlePointerDown = (e: React.PointerEvent<SVGGElement>) => {
    if (!allAnointed || isShrouded) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragStartX(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGGElement>) => {
    if (dragStartX === null || !allAnointed || isShrouded) return;
    const delta = Math.min(100, Math.max(0, Math.abs(e.clientX - dragStartX) * 0.85));
    setShroudFold(delta);
    if (delta >= 100) {
      setDragStartX(null);
      juiceDirector.triggerHaptic('dread_throb');
      audioMixer.playYakBeraPulse(0.85);
    }
  };

  const handleTieKnot = (id: number) => {
    if (!isShrouded || knotsTied.includes(id)) return;
    const next = [...knotsTied, id];
    setKnotsTied(next);
    juiceDirector.triggerHaptic('iron_grip');
    audioMixer.playYakBeraPulse(0.75 + next.length * 0.08);
    if (next.length === 3) {
      setTimeout(() => onFuneralSealed(), 550);
    }
  };

  const flapOffset = (shroudFold / 100) * 68;

  return (
    <div className="relative mx-auto flex w-full max-w-[26rem] flex-col items-center justify-center font-serif select-none">
      <div className="mb-2 text-[11px] tracking-[0.18em] text-[#C8963E]/85 uppercase">
        පැදුරු දානය · {!allAnointed ? `Anoint 3 Marma Nodes (${anointed.length}/3)` : !isShrouded ? 'Drag Mat Flaps Inward to Shroud' : `Tie 3 Gokkola Knots (${knotsTied.length}/3)`}
      </div>
      <svg viewBox="0 0 400 400" className="h-auto w-full touch-none">
        {/* Woven Pan Pedura Sleeping Mat & Fringe */}
        <rect x="64" y="44" width="272" height="312" fill="#14100C" stroke="#C8963E" strokeWidth="1.5" strokeOpacity="0.55" />
        {Array.from({ length: 11 }).map((_, i) => (
          <line key={i} x1="64" y1={70 + i * 26} x2="336" y2={70 + i * 26} stroke="#C8963E" strokeWidth="0.6" strokeOpacity="0.22" />
        ))}

        {/* Surrogate Effigy & 3 Rathu Kaha Diya (Blood-Lime) Marma Nodes */}
        <path d="M 200,78 C 220,78 228,100 218,122 L 234,215 L 216,314 L 184,314 L 166,215 L 182,122 C 172,100 180,78 200,78 Z" fill="#090807" stroke="#8C1D24" strokeWidth="1.2" strokeOpacity="0.65" />
        {CHAKRA_NODES.map(({ id, cy, sinhala, label }) => {
          const done = anointed.includes(id);
          return (
            <g key={id} onClick={() => handleAnoint(id)} className="cursor-pointer">
              <circle cx="200" cy={cy} r={done ? '20' : '14'} fill={done ? '#8C1D24' : '#16120E'} fillOpacity={done ? '0.9' : '0.95'} stroke={done ? '#D49B27' : '#8C1D24'} strokeWidth="1.6" className="transition-all duration-300" />
              <text x="200" y={cy + 3} textAnchor="middle" fill="#EAE3D2" fontSize="8.5">{done ? sinhala : label}</text>
            </g>
          );
        })}

        {/* Folding Left & Right Woven Rush Flaps */}
        <g onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={() => setDragStartX(null)} className={allAnointed && !isShrouded ? 'cursor-ew-resize' : ''}>
          <rect x={64 + flapOffset} y="44" width="76" height="312" fill="#1E1812" stroke="#C8963E" strokeWidth="1.3" fillOpacity="0.95" />
          <rect x={260 - flapOffset} y="44" width="76" height="312" fill="#1E1812" stroke="#C8963E" strokeWidth="1.3" fillOpacity="0.95" />
        </g>

        {/* Three Gokkola Funeral Knots & Crimson Wada Mal Blossoms */}
        {isShrouded &&
          CHAKRA_NODES.map(({ id, cy }) => {
            const tied = knotsTied.includes(id);
            return (
              <g key={`knot_${id}`} onClick={() => handleTieKnot(id)} className="cursor-pointer">
                <line x1="128" y1={cy} x2="272" y2={cy} stroke={tied ? '#D49B27' : '#C8963E'} strokeWidth={tied ? '4' : '1.6'} strokeDasharray={tied ? 'none' : '5 4'} />
                <polygon points={`200,${cy - 12} 214,${cy} 200,${cy + 12} 186,${cy}`} fill={tied ? '#8C1D24' : '#16120E'} stroke="#D49B27" strokeWidth="1.6" />
                {tied && <circle cx="200" cy={cy} r="3.5" fill="#D49B27" />}
              </g>
            );
          })}
      </svg>
    </div>
  );
};
