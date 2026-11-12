// src/components/diegetic/HuniyamPuhulCanvas.tsx
import React, { useEffect, useState } from 'react';
import { audioMixer } from '../../juice/audioMixer';
import { juiceDirector } from '../../juice/JuiceDirector';

interface HuniyamPuhulProps { onCurseSevered: () => void; }
const THORNS = [
  { id: 0, cx: 200, cy: 84, label: 'I · Crown Thorn (West)' },
  { id: 1, cx: 200, cy: 122, label: 'II · Throat Thorn (Central)' },
  { id: 2, cx: 200, cy: 162, label: 'III · Heart Thorn (South)' },
  { id: 3, cx: 200, cy: 202, label: 'IV · Spine Thorn (North)' },
] as const;

export const HuniyamPuhulCanvas: React.FC<HuniyamPuhulProps> = ({ onCurseSevered }) => {
  const [extracted, setExtracted] = useState<number>(0), [dragging, setDragging] = useState<boolean>(false);
  const [cutProgress, setCutProgress] = useState<number>(0), [severed, setSevered] = useState<boolean>(false);
  const thornsCleared = extracted >= 4;

  const completeSeverance = () => {
    if (severed) return;
    setSevered(true); setCutProgress(100); setDragging(false);
    audioMixer.playYakBeraClimax(); juiceDirector.triggerHaptic('iron_grip');
    onCurseSevered();
  };

  useEffect(() => {
    if (!thornsCleared || severed || dragging) return;
    const resist = setInterval(() => { setCutProgress((p) => (p > 0 ? Math.max(0, p - 2) : 0)); }, 180);
    return () => clearInterval(resist);
  }, [thornsCleared, severed, dragging]);

  const handlePullThorn = (idx: number) => {
    if (severed) return;
    if (idx === extracted) {
      setExtracted(extracted + 1); juiceDirector.triggerHaptic('iron_grip'); audioMixer.playYakBeraPulse(0.6 + idx * 0.1);
    } else if (idx > extracted) { juiceDirector.triggerHaptic('dread_throb'); }
  };

  const handleTapGourd = () => {
    if (!thornsCleared || severed) return;
    juiceDirector.triggerHaptic('iron_grip'); audioMixer.playYakBeraPulse(0.85);
    setCutProgress((prev) => { const next = prev + 45; if (next >= 100) completeSeverance(); return Math.min(100, next); });
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragging || !thornsCleared || severed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relY = ((e.clientY - rect.top) / rect.height) * 400;
    const pct = Math.max(0, Math.min(100, ((relY - 245) / 95) * 100));
    setCutProgress((prev) => { const next = Math.max(prev, pct); if (next >= 92) completeSeverance(); return next; });
  };

  const bladeY = 248 + (cutProgress / 100) * 104;

  return (
    <div className="relative mx-auto flex w-full max-w-[26rem] flex-col items-center justify-center font-serif select-none">
      <div className="mb-1 text-center text-xs tracking-[0.2em] text-[#D49B27] uppercase">
        පුහුල් කැපීම · Ash-Gourd &amp; Kodivina Severance ෴
      </div>
      <div className="mb-2.5 text-center text-xs leading-relaxed text-[#EAE3D2]/85 italic">
        {!thornsCleared
          ? `Step I · Touch the pulsing thorn (${THORNS[extracted]?.label}) to draw it from the wax effigy (${extracted}/4 drawn)`
          : `Step II · Drag the iron Giraya blade down (or tap the white ash-gourd repeatedly) to cleave the curse (${Math.round(cutProgress)}%)`}
      </div>

      <svg viewBox="0 0 400 400" onPointerMove={handlePointerMove} onPointerUp={() => setDragging(false)} className="h-auto w-full touch-none">
        <rect x="76" y="42" width="248" height="190" fill="#1A110D" stroke="#C8963E" strokeWidth="1.5" strokeOpacity="0.65" />
        <path d="M 200,56 C 216,56 222,74 212,92 L 228,162 L 214,220 L 186,220 L 172,162 L 188,92 C 178,74 184,56 200,56 Z" fill="#2B2118" stroke="#D49B27" strokeWidth="1.4" />

        {THORNS.map(({ id, cx, cy, label }) => {
          const pulled = extracted > id, isNext = extracted === id;
          return (
            <g key={id} onClick={() => handlePullThorn(id)} className="cursor-pointer">
              {isNext && <circle cx={cx} cy={cy} r="22" fill="none" stroke="#D49B27" strokeWidth="1.4" strokeDasharray="4 3" className="animate-pulse" />}
              <line x1={cx - 28} y1={cy} x2={cx + 28} y2={cy} stroke={pulled ? '#3B4D7A' : '#8C1D24'} strokeWidth={pulled ? '1' : '3'} strokeDasharray={pulled ? '2 4' : 'none'} />
              <circle cx={cx} cy={cy} r={pulled ? '6' : '11'} fill={pulled ? '#12100E' : '#8C1D24'} stroke="#D49B27" strokeWidth="1.4" />
              {isNext && <text x={cx + 38} y={cy + 4} fill="#D49B27" fontSize="9">{label}</text>}
            </g>
          );
        })}

        <g
          onPointerDown={(e) => {
            if (!thornsCleared || severed) return;
            e.currentTarget.setPointerCapture?.(e.pointerId); setDragging(true);
          }}
          onClick={handleTapGourd} className={thornsCleared ? 'cursor-pointer' : 'opacity-35 pointer-events-none'}
        >
          <ellipse cx="164" cy="306" rx="58" ry="40" fill="#D6DFEC" fillOpacity="0.85" stroke="#8C1D24" strokeWidth="2" />
          <ellipse cx="236" cy="306" rx="58" ry="40" fill="#D6DFEC" fillOpacity="0.85" stroke="#8C1D24" strokeWidth="2" />
          <line x1="200" y1="248" x2="200" y2="362" stroke="#8C1D24" strokeWidth="2.5" strokeDasharray="5 3" />
          {thornsCleared && !severed && <circle cx="200" cy={bladeY} r="24" fill="none" stroke="#D49B27" strokeWidth="1.5" className="animate-ping" />}
          <g transform={`translate(200, ${bladeY})`}>
            <polygon points="0,-18 16,6 0,16 -16,6" fill="#D49B27" stroke="#050608" strokeWidth="1.5" />
            <circle cx="0" cy="0" r="4" fill="#8C1D24" />
          </g>
        </g>
      </svg>
    </div>
  );
};
