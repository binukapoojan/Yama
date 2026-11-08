import React, { useState } from 'react';
import { audioMixer } from '../../juice/audioMixer';
import { juiceDirector } from '../../juice/JuiceDirector';

interface RiriMatFuneralProps {
  onFuneralSealed: () => void;
}

const CHAKRA_NODES: ReadonlyArray<{ id: number; cy: number; label: string }> = [
  { id: 0, cy: 118, label: 'Crown' },
  { id: 1, cy: 200, label: 'Heart' },
  { id: 2, cy: 282, label: 'Feet' },
];

export const RiriMatFuneralCanvas: React.FC<RiriMatFuneralProps> = ({ onFuneralSealed }) => {
  const [anointed, setAnointed] = useState<number[]>([]);
  const [shroudFold, setShroudFold] = useState<number>(0); // 0 to 100
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [knotsTied, setKnotsTied] = useState<number[]>([]);

  const allAnointed = anointed.length === 3;
  const isShrouded = shroudFold >= 100;

  const handleAnoint = (id: number) => {
    if (anointed.includes(id)) return;
    setAnointed((prev) => [...prev, id]);
    juiceDirector.triggerHaptic('iron_grip');
    audioMixer.playYakBeraPulse(0.55);
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
      audioMixer.playYakBeraPulse(0.8);
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
    <div className="relative mx-auto flex w-full max-w-[25rem] items-center justify-center select-none">
      <svg viewBox="0 0 400 400" className="h-auto w-full touch-none">
        {/* Base Woven Rush Sleeping Mat (Pan Pedura) */}
        <rect x="64" y="44" width="272" height="312" fill="#14110D" stroke="#C8963E" strokeWidth="1.4" strokeOpacity="0.45" />
        {Array.from({ length: 11 }).map((_, i) => (
          <line key={i} x1="64" y1={70 + i * 26} x2="336" y2={70 + i * 26} stroke="#C8963E" strokeWidth="0.5" strokeOpacity="0.2" />
        ))}

        {/* Surrogate Effigy Silhouette & 3 Rathu Kaha Diya (Blood-Lime) Nodes */}
        <path d="M 200,82 C 218,82 226,102 218,122 L 232,215 L 216,312 L 184,312 L 168,215 L 182,122 C 174,102 182,82 200,82 Z" fill="#090807" stroke="#8C1D24" strokeWidth="1" strokeOpacity="0.5" />
        {CHAKRA_NODES.map(({ id, cy }) => {
          const done = anointed.includes(id);
          return (
            <circle
              key={id}
              cx="200"
              cy={cy}
              r={done ? '18' : '13'}
              onClick={() => handleAnoint(id)}
              fill={done ? '#8C1D24' : '#16120E'}
              fillOpacity={done ? '0.88' : '0.9'}
              stroke={done ? '#D49B27' : '#8C1D24'}
              strokeWidth="1.6"
              className="cursor-pointer transition-all duration-300"
            />
          );
        })}

        {/* Folding Left & Right Woven Rush Flaps */}
        <g
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={() => setDragStartX(null)}
          className={allAnointed && !isShrouded ? 'cursor-ew-resize' : ''}
        >
          <rect x={64 + flapOffset} y="44" width="76" height="312" fill="#1E1912" stroke="#C8963E" strokeWidth="1.2" fillOpacity="0.94" />
          <rect x={260 - flapOffset} y="44" width="76" height="312" fill="#1E1912" stroke="#C8963E" strokeWidth="1.2" fillOpacity="0.94" />
        </g>

        {/* Three Gokkola Funeral Cord Ties (Unlocked once mat is rolled shut) */}
        {isShrouded &&
          CHAKRA_NODES.map(({ id, cy }) => {
            const tied = knotsTied.includes(id);
            return (
              <g key={`knot_${id}`} onClick={() => handleTieKnot(id)} className="cursor-pointer">
                <line x1="128" y1={cy} x2="272" y2={cy} stroke={tied ? '#D49B27' : '#C8963E'} strokeWidth={tied ? '4' : '1.5'} strokeDasharray={tied ? 'none' : '5 4'} />
                <polygon points={`200,${cy - 10} 212,${cy} 200,${cy + 10} 188,${cy}`} fill={tied ? '#8C1D24' : '#16120E'} stroke="#D49B27" strokeWidth="1.5" />
              </g>
            );
          })}
      </svg>
    </div>
  );
};
