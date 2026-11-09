// src/components/diegetic/MohiniMaskPaliyaCanvas.tsx
import React, { useEffect, useState } from 'react';
import { audioMixer } from '../../juice/audioMixer';
import { juiceDirector } from '../../juice/JuiceDirector';

interface MohiniMaskPaliyaProps { onSevered: () => void; }

const MASKS: ReadonlyArray<{
  index: number; cx: number; cy: number; stroke: string; sinhala: string; title: string; eyePath: string;
}> = [
  { index: 0, cx: 88, cy: 110, stroke: '#D49B27', sinhala: 'මල්වතු පාලිය', title: 'I · Allure', eyePath: 'M -14,-4 Q -8,-9 -2,-4 M 2,-4 Q 8,-9 14,-4' },
  { index: 1, cx: 200, cy: 84, stroke: '#8C1D24', sinhala: 'ගබ්බර පාලිය', title: 'II · Burden', eyePath: 'M -15,-6 A 5,5 0 1,0 -5,-6 M 5,-6 A 5,5 0 1,0 15,-6' },
  { index: 2, cx: 312, cy: 110, stroke: '#3B4D7A', sinhala: 'දරු පාලිය', title: 'III · Severance', eyePath: 'M -14,-4 Q -8,2 -2,-4 M 2,-4 Q 8,2 14,-4' },
];

export const MohiniMaskPaliyaCanvas: React.FC<MohiniMaskPaliyaProps> = ({ onSevered }) => {
  const [maskStage, setMaskStage] = useState<number>(0), [sliceStartY, setSliceStartY] = useState<number | null>(null);
  const [bladeY, setBladeY] = useState<number>(215), [cleaved, setCleaved] = useState<boolean>(false);

  // Active demonic upward pushback on the Ketta blade while slicing
  useEffect(() => {
    if (maskStage < 3 || cleaved) return;
    const resist = setInterval(() => {
      setBladeY((y) => (y > 215 ? Math.max(215, y - 3.5) : 215));
    }, 85);
    return () => clearInterval(resist);
  }, [maskStage, cleaved]);

  const handleMaskClick = (idx: number) => {
    if (cleaved) return;
    if (idx === maskStage) {
      const next = maskStage + 1;
      setMaskStage(next);
      juiceDirector.triggerHaptic('iron_grip');
      audioMixer.playYakBeraPulse(0.55 + idx * 0.2);
      if (next === 2) audioMixer.playMohiniWhimper();
      if (next === 3) audioMixer.playMohiniWeeping();
    } else {
      setMaskStage(0);
      juiceDirector.triggerHaptic('dread_throb');
      audioMixer.playArterialPulse(0.9);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<SVGGElement>) => {
    if (maskStage < 3 || cleaved) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setSliceStartY(e.clientY);
    setBladeY(220);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGGElement>) => {
    if (sliceStartY === null || maskStage < 3 || cleaved) return;
    const delta = Math.max(0, Math.min(130, e.clientY - sliceStartY));
    setBladeY(215 + delta);
    if (delta >= 105) {
      setCleaved(true);
      setSliceStartY(null);
      audioMixer.playYakBeraClimax();
      juiceDirector.triggerHaptic('dread_throb');
      setTimeout(() => onSevered(), 650);
    }
  };

  const stopSlice = () => { if (!cleaved) { setSliceStartY(null); setBladeY(215); } };

  return (
    <div className="relative mx-auto flex w-full max-w-[26rem] flex-col items-center justify-center font-serif select-none">
      <div className="mb-2 text-[11px] tracking-[0.18em] text-[#C8963E]/85 uppercase">
        මෝහිනී පාලිය · {maskStage < 3 ? `Don Kaduru Masks in Sequence (${maskStage}/3)` : cleaved ? 'Kesel Kanda Severed!' : 'Overpower Her Grip & Drag Blade Down!'}
      </div>
      <svg viewBox="0 0 400 400" className="h-auto w-full touch-none">
        {MASKS.map(({ index, cx, cy, stroke, sinhala, title, eyePath }) => {
          const active = maskStage > index;
          return (
            <g key={index} transform={`translate(${cx}, ${cy})`} onClick={() => handleMaskClick(index)} className="cursor-pointer transition-transform duration-500">
              <path d="M -22,-32 Q 0,-56 22,-32" fill="none" stroke={active ? stroke : '#C8963E'} strokeWidth="1.5" strokeOpacity={active ? '0.9' : '0.25'} />
              <ellipse cx="0" cy="0" rx={index === 1 ? '38' : '33'} ry="44" fill={active ? '#1C1612' : '#0B0908'} stroke={active ? stroke : '#C8963E'} strokeWidth={active ? '2' : '0.9'} strokeOpacity={active ? '0.95' : '0.35'} />
              <path d={eyePath} fill="none" stroke={active ? '#EAE3D2' : '#C8963E'} strokeWidth="1.5" strokeOpacity={active ? '0.95' : '0.3'} />
              <path d={index === 1 ? 'M -14,16 Q 0,5 14,16 M -10,15 L -8,22 M 10,15 L 8,22' : 'M -10,15 Q 0,23 10,15'} fill="none" stroke={active ? stroke : '#C8963E'} strokeWidth="1.4" strokeOpacity={active ? '0.95' : '0.3'} />
              <text x="0" y="60" textAnchor="middle" fill={active ? '#D49B27' : '#C8963E'} fontSize="10" opacity={active ? '0.95' : '0.45'}>{sinhala}</text>
              <text x="0" y="72" textAnchor="middle" fill="#EAE3D2" fontSize="8.5" opacity={active ? '0.75' : '0.35'}>{title}</text>
            </g>
          );
        })}

        {/* Mohini's Apparition Eyes Snapping Open Above the Bundle */}
        {maskStage === 3 && !cleaved && (
          <g transform="translate(200, 194)" className="animate-pulse">
            <ellipse cx="-24" cy="0" rx="11" ry="5" fill="#090807" stroke="#8C1D24" strokeWidth="1.5" />
            <circle cx="-24" cy="0" r="2.5" fill="#EAE3D2" />
            <ellipse cx="24" cy="0" rx="11" ry="5" fill="#090807" stroke="#8C1D24" strokeWidth="1.5" />
            <circle cx="24" cy="0" r="2.5" fill="#EAE3D2" />
          </g>
        )}

        <g onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={stopSlice} onPointerCancel={stopSlice} className={maskStage === 3 ? 'cursor-ns-resize' : 'opacity-35 pointer-events-none'}>
          <g transform={`translate(${cleaved ? -22 : 0}, ${cleaved ? 5 : 0})`} className="transition-transform duration-500">
            <rect x="62" y="256" width="136" height="56" rx="14" fill="#1B2618" stroke="#C8963E" strokeWidth="1.2" strokeOpacity="0.7" />
            <path d="M 94,256 L 198,256 L 198,312 L 94,312 Z" fill="#EAE3D2" fillOpacity="0.18" />
          </g>
          <g transform={`translate(${cleaved ? 22 : 0}, ${cleaved ? 5 : 0})`} className="transition-transform duration-500">
            <rect x="202" y="256" width="136" height="56" rx="14" fill="#1B2618" stroke="#C8963E" strokeWidth="1.2" strokeOpacity="0.7" />
            <path d="M 202,256 L 306,256 L 306,312 L 202,312 Z" fill="#EAE3D2" fillOpacity="0.18" />
          </g>
          <line x1="200" y1="215" x2="200" y2="348" stroke="#8C1D24" strokeWidth="1.5" strokeDasharray="4 4" />
          <g transform={`translate(200, ${bladeY})`}>
            <path d="M 0,-18 L 13,4 L 0,13 L -13,4 Z" fill="#D49B27" stroke="#090807" strokeWidth="1.5" />
            <circle cx="0" cy="0" r="3.5" fill="#8C1D24" />
          </g>
        </g>
      </svg>
    </div>
  );
};
