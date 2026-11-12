// src/components/diegetic/MohiniMaskPaliyaCanvas.tsx
import React, { useEffect, useState } from 'react';
import { audioMixer } from '../../juice/audioMixer';
import { juiceDirector } from '../../juice/JuiceDirector';

interface MohiniMaskPaliyaProps { onSevered: () => void; }

const MASKS = [
  { index: 0, cx: 88, cy: 110, stroke: '#D49B27', sinhala: 'මල්වතු පාලිය', title: 'I · Allure', eyePath: 'M -14,-4 Q -8,-9 -2,-4 M 2,-4 Q 8,-9 14,-4' },
  { index: 1, cx: 200, cy: 84, stroke: '#8C1D24', sinhala: 'ගබ්බර පාලිය', title: 'II · Burden', eyePath: 'M -15,-6 A 5,5 0 1,0 -5,-6 M 5,-6 A 5,5 0 1,0 15,-6' },
  { index: 2, cx: 312, cy: 110, stroke: '#6883BA', sinhala: 'දරු පාලිය', title: 'III · Severance', eyePath: 'M -14,-4 Q -8,2 -2,-4 M 2,-4 Q 8,2 14,-4' },
] as const;

export const MohiniMaskPaliyaCanvas: React.FC<MohiniMaskPaliyaProps> = ({ onSevered }) => {
  const [maskStage, setMaskStage] = useState<number>(0), [dragging, setDragging] = useState<boolean>(false);
  const [cutProgress, setCutProgress] = useState<number>(0), [cleaved, setCleaved] = useState<boolean>(false);

  const completeSeverance = () => {
    if (cleaved) return;
    setCleaved(true); setCutProgress(100); setDragging(false);
    audioMixer.playYakBeraClimax(); juiceDirector.triggerHaptic('dread_throb'); onSevered();
  };

  useEffect(() => {
    if (maskStage < 3 || cleaved || dragging) return;
    const resist = setInterval(() => setCutProgress((p) => (p > 0 ? Math.max(0, p - 2) : 0)), 180);
    return () => clearInterval(resist);
  }, [maskStage, cleaved, dragging]);

  const handleMaskClick = (idx: number) => {
    if (cleaved) return;
    if (idx === maskStage) {
      const next = maskStage + 1;
      setMaskStage(next);
      juiceDirector.triggerHaptic('iron_grip');
      audioMixer.playYakBeraPulse(0.55 + idx * 0.2);
      if (next === 3) audioMixer.playMohiniWeeping();
    } else if (idx > maskStage) {
      juiceDirector.triggerHaptic('dread_throb');
    }
  };

  const handleBladeStrike = () => {
    if (maskStage < 3 || cleaved) return;
    juiceDirector.triggerHaptic('iron_grip'); audioMixer.playYakBeraPulse(0.8);
    setCutProgress((prev) => {
      const next = prev + 45;
      if (next >= 100) completeSeverance();
      return Math.min(100, next);
    });
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragging || maskStage < 3 || cleaved) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relY = ((e.clientY - rect.top) / rect.height) * 400;
    const pct = Math.max(0, Math.min(100, ((relY - 210) / 95) * 100));
    setCutProgress((prev) => {
      const next = Math.max(prev, pct);
      if (next >= 92) completeSeverance();
      return next;
    });
  };

  const bladeY = 215 + (cutProgress / 100) * 110;

  return (
    <div className="relative mx-auto flex w-full max-w-[26rem] flex-col items-center justify-center font-serif select-none">
      <div className="mb-1 text-center text-xs tracking-[0.2em] text-[#D49B27] uppercase">
        මෝහිනී පාලිය · Three-Mask Severance Drama ෴
      </div>
      <div className="mb-2.5 text-center text-xs leading-relaxed text-[#EAE3D2]/85 italic">
        {maskStage < 3
          ? `Step I · Touch the pulsing Kaduru mask (${MASKS[maskStage].title}) in order (${maskStage}/3 donned)`
          : `Step II · Drag the golden Ketta blade down (or tap the banana stem repeatedly) to sever the false child (${Math.round(cutProgress)}%)`}
      </div>

      <svg viewBox="0 0 400 400" onPointerMove={handlePointerMove} onPointerUp={() => setDragging(false)} className="h-auto w-full touch-none">
        {MASKS.map(({ index, cx, cy, stroke, sinhala, title, eyePath }) => {
          const active = maskStage > index, isNext = maskStage === index;
          return (
            <g key={index} transform={`translate(${cx}, ${cy})`} onClick={() => handleMaskClick(index)} className="cursor-pointer">
              {isNext && <circle cx="0" cy="0" r="48" fill="none" stroke="#D49B27" strokeWidth="1.5" strokeDasharray="5 3" className="animate-pulse" />}
              <ellipse cx="0" cy="0" rx={index === 1 ? '38' : '33'} ry="44" fill={active ? '#1C1612' : '#0B0908'} stroke={active || isNext ? stroke : '#C8963E'} strokeWidth={active || isNext ? '2.2' : '0.9'} />
              <path d={eyePath} fill="none" stroke={active ? '#EAE3D2' : '#C8963E'} strokeWidth="1.5" />
              <text x="0" y="60" textAnchor="middle" fill={active || isNext ? '#D49B27' : '#C8963E'} fontSize="10">{sinhala}</text>
              <text x="0" y="73" textAnchor="middle" fill="#EAE3D2" fontSize="9">{title}</text>
            </g>
          );
        })}

        {/* Kesel Kanda Banana Stem & Ketta Cleaver (Supports both Drag and Tap) */}
        <g
          onPointerDown={(e) => { if (maskStage < 3 || cleaved) return; e.currentTarget.setPointerCapture?.(e.pointerId); setDragging(true); }}
          onClick={handleBladeStrike}
          className={maskStage === 3 ? 'cursor-pointer' : 'opacity-35 pointer-events-none'}
        >
          <rect x="64" y="256" width="134" height="56" rx="12" fill="#1B2618" stroke="#C8963E" strokeWidth="1.4" />
          <rect x="202" y="256" width="134" height="56" rx="12" fill="#1B2618" stroke="#C8963E" strokeWidth="1.4" />
          <line x1="200" y1="210" x2="200" y2="345" stroke="#D49B27" strokeWidth="2" strokeDasharray="5 4" />
          {maskStage === 3 && !cleaved && (
            <circle cx="200" cy={bladeY} r="24" fill="none" stroke="#D49B27" strokeWidth="1.4" className="animate-ping" />
          )}
          <g transform={`translate(200, ${bladeY})`}>
            <path d="M 0,-20 L 15,5 L 0,15 L -15,5 Z" fill="#D49B27" stroke="#090807" strokeWidth="1.5" />
            <circle cx="0" cy="0" r="4" fill="#8C1D24" />
          </g>
        </g>
      </svg>
    </div>
  );
};
