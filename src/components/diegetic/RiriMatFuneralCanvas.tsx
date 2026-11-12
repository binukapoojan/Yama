// src/components/diegetic/RiriMatFuneralCanvas.tsx
import React, { useEffect, useState } from 'react';
import { audioMixer } from '../../juice/audioMixer';
import { juiceDirector } from '../../juice/JuiceDirector';

interface RiriMatFuneralProps { onFuneralSealed: () => void; }

const CHAKRA_NODES = [
  { id: 0, cy: 118, sinhala: 'හිස', label: 'I · Crown' }, { id: 1, cy: 200, sinhala: 'ළය', label: 'II · Heart' },
  { id: 2, cy: 282, sinhala: 'පාද', label: 'III · Feet' },
] as const;

export const RiriMatFuneralCanvas: React.FC<RiriMatFuneralProps> = ({ onFuneralSealed }) => {
  const [anointed, setAnointed] = useState<number[]>([]), [shroudFold, setShroudFold] = useState<number>(0);
  const [dragging, setDragging] = useState<boolean>(false), [knotsTied, setKnotsTied] = useState<number[]>([]);
  const allAnointed = anointed.length === 3, isShrouded = shroudFold >= 100;

  useEffect(() => {
    if (!allAnointed || isShrouded || dragging) return;
    const timer = setInterval(() => setShroudFold((f) => (f > 0 ? Math.max(0, f - 3) : 0)), 350);
    return () => clearInterval(timer);
  }, [allAnointed, isShrouded, dragging]);

  const handleAnoint = (id: number) => {
    if (anointed.includes(id)) return;
    setAnointed((p) => [...p, id]); juiceDirector.triggerHaptic('iron_grip');
    audioMixer.playYakBeraPulse(0.55); audioMixer.playArterialPulse(0.85);
  };

  const advanceShroud = (amount: number) => {
    if (!allAnointed || isShrouded) return;
    setShroudFold((p) => {
      const next = Math.min(100, p + amount);
      if (next >= 100) { setDragging(false); juiceDirector.triggerHaptic('dread_throb'); audioMixer.playYakBeraPulse(0.85); }
      return next;
    });
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragging || !allAnointed || isShrouded) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * 400;
    const distToCenter = Math.max(0, 140 - Math.abs(200 - relX));
    const pct = Math.min(100, (distToCenter / 95) * 100);
    setShroudFold((p) => {
      const next = Math.max(p, pct);
      if (next >= 95) { setDragging(false); audioMixer.playYakBeraPulse(0.85); return 100; }
      return next;
    });
  };

  const handleTieKnot = (id: number) => {
    if (!isShrouded || knotsTied.includes(id)) return;
    const next = [...knotsTied, id];
    setKnotsTied(next); juiceDirector.triggerHaptic('iron_grip');
    audioMixer.playYakBeraPulse(0.75 + next.length * 0.08);
    if (next.length === 3) { audioMixer.playYakBeraClimax(); onFuneralSealed(); }
  };

  const flapOffset = (shroudFold / 100) * 68;

  return (
    <div className="relative mx-auto flex w-full max-w-[26rem] flex-col items-center justify-center font-serif select-none">
      <div className="mb-1 text-center text-xs tracking-[0.2em] text-[#D49B27] uppercase">
        පැදුරු දානය · Surrogate Funeral Mat ෴
      </div>
      <div className="mb-2.5 text-center text-xs leading-relaxed text-[#EAE3D2]/85 italic">
        {!allAnointed
          ? `Step I · Touch the 3 pulsing blood Marma circles down the body (${anointed.length}/3 anointed)`
          : !isShrouded
            ? `Step II · Drag the side rush flaps inward (or tap them repeatedly) to wrap the corpse (${Math.round(shroudFold)}%)`
            : `Step III · Touch all 3 golden Gokkola diamond knots to seal the shroud (${knotsTied.length}/3 tied)`}
      </div>

      <svg viewBox="0 0 400 400" onPointerMove={handlePointerMove} onPointerUp={() => setDragging(false)} className="h-auto w-full touch-none">
        <rect x="64" y="44" width="272" height="312" fill="#14100C" stroke="#C8963E" strokeWidth="1.5" strokeOpacity="0.6" />
        <path d="M 200,78 C 220,78 228,100 218,122 L 234,215 L 216,314 L 184,314 L 166,215 L 182,122 C 172,100 180,78 200,78 Z" fill="#090807" stroke="#8C1D24" strokeWidth="1.3" />

        {/* Step I: 3 Blood Marma Nodes */}
        {CHAKRA_NODES.map(({ id, cy, sinhala, label }) => {
          const done = anointed.includes(id);
          return (
            <g key={id} onClick={() => handleAnoint(id)} className="cursor-pointer">
              {!done && <circle cx="200" cy={cy} r="24" fill="none" stroke="#D49B27" strokeWidth="1.2" strokeDasharray="4 3" className="animate-pulse" />}
              <circle cx="200" cy={cy} r={done ? '20' : '16'} fill={done ? '#8C1D24' : '#16120E'} stroke={done ? '#D49B27' : '#8C1D24'} strokeWidth="1.8" />
              <text x="200" y={cy + 3} textAnchor="middle" fill="#EAE3D2" fontSize="9">{done ? sinhala : label}</text>
            </g>
          );
        })}

        {/* Step II: Woven Rush Flaps */}
        <g
          onPointerDown={(e) => { if (!allAnointed || isShrouded) return; e.currentTarget.setPointerCapture?.(e.pointerId); setDragging(true); }}
          onClick={() => advanceShroud(45)}
          className={allAnointed && !isShrouded ? 'cursor-pointer' : ''}
        >
          <rect x={64 + flapOffset} y="44" width="76" height="312" fill="#1E1812" stroke={allAnointed && !isShrouded ? '#D49B27' : '#C8963E'} strokeWidth="1.6" />
          <rect x={260 - flapOffset} y="44" width="76" height="312" fill="#1E1812" stroke={allAnointed && !isShrouded ? '#D49B27' : '#C8963E'} strokeWidth="1.6" />
          {allAnointed && !isShrouded && (
            <text x="200" y="204" textAnchor="middle" fill="#D49B27" fontSize="11" className="pointer-events-none">❖ Tap or Drag Flaps Inward ❖</text>
          )}
        </g>

        {/* Step III: 3 Gokkola Funeral Knots */}
        {isShrouded &&
          CHAKRA_NODES.map(({ id, cy }) => {
            const tied = knotsTied.includes(id);
            return (
              <g key={`knot_${id}`} onClick={() => handleTieKnot(id)} className="cursor-pointer">
                <line x1="128" y1={cy} x2="272" y2={cy} stroke={tied ? '#D49B27' : '#8C1D24'} strokeWidth={tied ? '4' : '2'} strokeDasharray={tied ? 'none' : '5 4'} />
                {!tied && <circle cx="200" cy={cy} r="20" fill="none" stroke="#D49B27" strokeWidth="1.3" className="animate-ping" />}
                <polygon points={`200,${cy - 14} 216,${cy} 200,${cy + 14} 184,${cy}`} fill={tied ? '#8C1D24' : '#16120E'} stroke="#D49B27" strokeWidth="1.8" />
              </g>
            );
          })}
      </svg>
    </div>
  );
};
