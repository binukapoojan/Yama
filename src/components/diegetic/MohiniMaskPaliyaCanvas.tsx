// src/components/diegetic/MohiniMaskPaliyaCanvas.tsx
import React, { useState } from 'react';
import { audioMixer } from '../../juice/audioMixer';
import { juiceDirector } from '../../juice/JuiceDirector';

interface MohiniMaskPaliyaProps {
  onSevered: () => void;
}

const MASKS: ReadonlyArray<{
  index: number; cx: number; cy: number; stroke: string; sinhala: string; title: string; eyePath: string;
}> = [
  { index: 0, cx: 88, cy: 110, stroke: '#D49B27', sinhala: 'මල්වතු පාලිය', title: 'I · Allure', eyePath: 'M -14,-4 Q -8,-9 -2,-4 M 2,-4 Q 8,-9 14,-4' },
  { index: 1, cx: 200, cy: 86, stroke: '#8C1D24', sinhala: 'ගබ්බර පාලිය', title: 'II · Burden', eyePath: 'M -15,-6 A 5,5 0 1,0 -5,-6 M 5,-6 A 5,5 0 1,0 15,-6' },
  { index: 2, cx: 312, cy: 110, stroke: '#3B4D7A', sinhala: 'දරු පාලිය', title: 'III · Severance', eyePath: 'M -14,-4 Q -8,2 -2,-4 M 2,-4 Q 8,2 14,-4' },
];

export const MohiniMaskPaliyaCanvas: React.FC<MohiniMaskPaliyaProps> = ({ onSevered }) => {
  const [maskStage, setMaskStage] = useState<number>(0);
  const [sliceStartY, setSliceStartY] = useState<number | null>(null);
  const [bladeY, setBladeY] = useState<number>(215);
  const [cleaved, setCleaved] = useState<boolean>(false);

  const handleMaskClick = (idx: number) => {
    if (cleaved) return;
    if (idx === maskStage) {
      setMaskStage(maskStage + 1);
      juiceDirector.triggerHaptic('iron_grip');
      audioMixer.playYakBeraPulse(0.5 + idx * 0.2);
      if (idx === 1) audioMixer.playMohiniWhimper();
    } else {
      setMaskStage(0);
      juiceDirector.triggerHaptic('dread_throb');
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
      audioMixer.playYakBeraPulse(1.0);
      juiceDirector.triggerHaptic('dread_throb');
      setTimeout(() => onSevered(), 650);
    }
  };

  const stopSlice = () => {
    if (!cleaved) { setSliceStartY(null); setBladeY(215); }
  };

  return (
    <div className="relative mx-auto flex w-full max-w-[26rem] flex-col items-center justify-center font-serif select-none">
      <div className="mb-2 text-[11px] tracking-[0.18em] text-[#C8963E]/85 uppercase">
        මෝහිනී පාලිය · {maskStage < 3 ? `Don Kaduru Masks in Sequence (${maskStage}/3)` : cleaved ? 'Kesel Kanda Severed' : 'Drag Blade Downward to Cleave Stem'}
      </div>
      <svg viewBox="0 0 400 400" className="h-auto w-full touch-none">
        {MASKS.map(({ index, cx, cy, stroke, sinhala, title, eyePath }) => {
          const active = maskStage > index;
          return (
            <g key={index} transform={`translate(${cx}, ${cy})`} onClick={() => handleMaskClick(index)} className="cursor-pointer transition-transform duration-500">
              {/* Carved Ambalangoda Cobra Crest & Ear Flanges */}
              <path d="M -22,-32 Q 0,-56 22,-32" fill="none" stroke={active ? stroke : '#C8963E'} strokeWidth="1.5" strokeOpacity={active ? '0.9' : '0.25'} />
              <ellipse cx="0" cy="0" rx={index === 1 ? '38' : '33'} ry="44" fill={active ? '#1C1612' : '#0B0908'} stroke={active ? stroke : '#C8963E'} strokeWidth={active ? '2' : '0.9'} strokeOpacity={active ? '0.95' : '0.35'} />
              <path d={eyePath} fill="none" stroke={active ? '#EAE3D2' : '#C8963E'} strokeWidth="1.5" strokeOpacity={active ? '0.95' : '0.3'} />
              <path d={index === 1 ? 'M -14,16 Q 0,5 14,16 M -10,15 L -8,22 M 10,15 L 8,22' : 'M -10,15 Q 0,23 10,15'} fill="none" stroke={active ? stroke : '#C8963E'} strokeWidth="1.4" strokeOpacity={active ? '0.95' : '0.3'} />
              <text x="0" y="60" textAnchor="middle" fill={active ? '#D49B27' : '#C8963E'} fontSize="10" opacity={active ? '0.95' : '0.45'}>{sinhala}</text>
              <text x="0" y="72" textAnchor="middle" fill="#EAE3D2" fontSize="8.5" opacity={active ? '0.75' : '0.35'}>{title}</text>
            </g>
          );
        })}

        {/* Shrouded Kesel Kanda (Banana Trunk Surrogate Infant) & Ketta Blade */}
        <g onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={stopSlice} onPointerCancel={stopSlice} className={maskStage === 3 ? 'cursor-ns-resize' : 'opacity-35 pointer-events-none'}>
          <g transform={`translate(${cleaved ? -20 : 0}, ${cleaved ? 4 : 0})`} className="transition-transform duration-500">
            <rect x="62" y="256" width="136" height="56" rx="14" fill="#1B2618" stroke="#C8963E" strokeWidth="1.2" strokeOpacity="0.7" />
            <path d="M 94,256 L 198,256 L 198,312 L 94,312 Z" fill="#EAE3D2" fillOpacity="0.18" />
            <line x1="135" y1="256" x2="135" y2="312" stroke="#D49B27" strokeWidth="1.2" strokeDasharray="3 2" />
          </g>
          <g transform={`translate(${cleaved ? 20 : 0}, ${cleaved ? 4 : 0})`} className="transition-transform duration-500">
            <rect x="202" y="256" width="136" height="56" rx="14" fill="#1B2618" stroke="#C8963E" strokeWidth="1.2" strokeOpacity="0.7" />
            <path d="M 202,256 L 306,256 L 306,312 L 202,312 Z" fill="#EAE3D2" fillOpacity="0.18" />
            <line x1="265" y1="256" x2="265" y2="312" stroke="#D49B27" strokeWidth="1.2" strokeDasharray="3 2" />
          </g>

          <line x1="200" y1="215" x2="200" y2="348" stroke="#8C1D24" strokeWidth="1.4" strokeDasharray="4 4" />
          {/* Forged Iron Plantain Knife (Ketta) */}
          <g transform={`translate(200, ${bladeY})`}>
            <path d="M 0,-16 L 12,4 L 0,12 L -12,4 Z" fill="#D49B27" stroke="#090807" strokeWidth="1.5" />
            <circle cx="0" cy="0" r="3.5" fill="#8C1D24" />
          </g>
        </g>
      </svg>
    </div>
  );
};
