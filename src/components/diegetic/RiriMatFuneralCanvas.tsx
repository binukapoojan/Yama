// src/components/diegetic/RiriMatFuneralCanvas.tsx
import React, { useEffect, useState } from 'react';
import { audioMixer } from '../../juice/audioMixer';
import { juiceDirector } from '../../juice/JuiceDirector';

interface RiriMatFuneralProps { onFuneralSealed: () => void; }
const CHAKRA_NODES = [
  { id: 0, cy: 118, sinhala: 'හිස', label: 'Crown' },
  { id: 1, cy: 200, sinhala: 'ළය', label: 'Heart' },
  { id: 2, cy: 282, sinhala: 'පාද', label: 'Feet' },
] as const;

export const RiriMatFuneralCanvas: React.FC<RiriMatFuneralProps> = ({ onFuneralSealed }) => {
  const [anointed, setAnointed] = useState<number[]>([]), [shroudFold, setShroudFold] = useState<number>(0);
  const [dragStartX, setDragStartX] = useState<number | null>(null), [knotsTied, setKnotsTied] = useState<number[]>([]);
  const [thrashPulse, setThrashPulse] = useState<boolean>(false);
  const allAnointed = anointed.length === 3, isShrouded = shroudFold >= 100;

  // Demonic thrashing: unrolls partial flaps or snaps a single knot if player hesitates
  useEffect(() => {
    if (!allAnointed || knotsTied.length === 3) return;
    const timer = setInterval(() => {
      if (!isShrouded && dragStartX === null && shroudFold > 0) {
        setShroudFold((f) => Math.max(0, f - 15));
      } else if (isShrouded && knotsTied.length > 0 && knotsTied.length < 3) {
        setThrashPulse(true);
        audioMixer.playArterialPulse(0.9);
        setTimeout(() => setThrashPulse(false), 260);
      }
    }, 1100);
    return () => clearInterval(timer);
  }, [allAnointed, isShrouded, dragStartX, shroudFold, knotsTied.length]);

  const handleAnoint = (id: number) => {
    if (anointed.includes(id)) return;
    setAnointed((prev) => [...prev, id]);
    juiceDirector.triggerHaptic('iron_grip');
    audioMixer.playYakBeraPulse(0.55);
    audioMixer.playArterialPulse(0.85);
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
      audioMixer.playYakBeraClimax();
      setTimeout(() => onFuneralSealed(), 550);
    }
  };

  const flapOffset = (shroudFold / 100) * 68;

  return (
    <div className="relative mx-auto flex w-full max-w-[26rem] flex-col items-center justify-center font-serif select-none">
      <div className="mb-2 text-[11px] tracking-[0.18em] text-[#C8963E]/85 uppercase">
        පැදුරු දානය · {!allAnointed ? `Anoint 3 Blood Marma Nodes (${anointed.length}/3)` : !isShrouded ? 'Drag Rush Flaps Shut Before He Thrashes!' : `Bind All 3 Gokkola Knots Fast (${knotsTied.length}/3)`}
      </div>
      <svg viewBox="0 0 400 400" className={`h-auto w-full touch-none transition-transform duration-150 ${thrashPulse ? 'translate-x-1 scale-[1.01]' : ''}`}>
        <rect x="64" y="44" width="272" height="312" fill="#14100C" stroke={thrashPulse ? '#8C1D24' : '#C8963E'} strokeWidth="1.5" strokeOpacity="0.6" />
        {Array.from({ length: 11 }).map((_, i) => (
          <line key={i} x1="64" y1={70 + i * 26} x2="336" y2={70 + i * 26} stroke="#C8963E" strokeWidth="0.6" strokeOpacity="0.22" />
        ))}

        {/* Surrogate Corpse Silhouette & Glowing Simian Eyes in the Dark */}
        <path d="M 200,78 C 220,78 228,100 218,122 L 234,215 L 216,314 L 184,314 L 166,215 L 182,122 C 172,100 180,78 200,78 Z" fill="#090807" stroke="#8C1D24" strokeWidth="1.3" strokeOpacity="0.75" />
        <circle cx="193" cy="98" r="2.2" fill="#8C1D24" /><circle cx="207" cy="98" r="2.2" fill="#8C1D24" />

        {CHAKRA_NODES.map(({ id, cy, sinhala, label }) => {
          const done = anointed.includes(id);
          return (
            <g key={id} onClick={() => handleAnoint(id)} className="cursor-pointer">
              <circle cx="200" cy={cy} r={done ? '20' : '14'} fill={done ? '#8C1D24' : '#16120E'} fillOpacity="0.92" stroke={done ? '#D49B27' : '#8C1D24'} strokeWidth="1.6" className="transition-all duration-300" />
              <text x="200" y={cy + 3} textAnchor="middle" fill="#EAE3D2" fontSize="8.5">{done ? sinhala : label}</text>
            </g>
          );
        })}

        <g onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={() => setDragStartX(null)} className={allAnointed && !isShrouded ? 'cursor-ew-resize' : ''}>
          <rect x={64 + flapOffset} y="44" width="76" height="312" fill="#1E1812" stroke="#C8963E" strokeWidth="1.3" fillOpacity="0.95" />
          <rect x={260 - flapOffset} y="44" width="76" height="312" fill="#1E1812" stroke="#C8963E" strokeWidth="1.3" fillOpacity="0.95" />
        </g>

        {isShrouded &&
          CHAKRA_NODES.map(({ id, cy }) => {
            const tied = knotsTied.includes(id);
            return (
              <g key={`knot_${id}`} onClick={() => handleTieKnot(id)} className="cursor-pointer">
                <line x1="128" y1={cy} x2="272" y2={cy} stroke={tied ? '#D49B27' : '#8C1D24'} strokeWidth={tied ? '4' : '1.8'} strokeDasharray={tied ? 'none' : '5 4'} />
                <polygon points={`200,${cy - 12} 214,${cy} 200,${cy + 12} 186,${cy}`} fill={tied ? '#8C1D24' : '#16120E'} stroke="#D49B27" strokeWidth="1.6" />
              </g>
            );
          })}
      </svg>
    </div>
  );
};
