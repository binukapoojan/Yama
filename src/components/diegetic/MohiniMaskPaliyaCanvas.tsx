import React, { useState } from 'react';
import { audioMixer } from '../../juice/audioMixer';
import { juiceDirector } from '../../juice/JuiceDirector';

interface MohiniMaskPaliyaProps {
  onSevered: () => void;
}

const MASKS: ReadonlyArray<{ index: number; cx: number; cy: number; stroke: string; eyePath: string }> = [
  { index: 0, cx: 96, cy: 112, stroke: '#D49B27', eyePath: 'M -14,-4 Q -8,-9 -2,-4 M 2,-4 Q 8,-9 14,-4' },
  { index: 1, cx: 200, cy: 84, stroke: '#8C1D24', eyePath: 'M -15,-6 A 5,5 0 1,0 -5,-6 M 5,-6 A 5,5 0 1,0 15,-6' },
  { index: 2, cx: 304, cy: 112, stroke: '#3B4D7A', eyePath: 'M -14,-4 Q -8,2 -2,-4 M 2,-4 Q 8,2 14,-4' },
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
    if (!cleaved) {
      setSliceStartY(null);
      setBladeY(215);
    }
  };

  return (
    <div className="relative mx-auto flex w-full max-w-[25rem] items-center justify-center select-none">
      <svg viewBox="0 0 400 400" className="h-auto w-full touch-none">
        {MASKS.map(({ index, cx, cy, stroke, eyePath }) => {
          const active = maskStage > index;
          return (
            <g
              key={index} transform={`translate(${cx}, ${cy})`} onClick={() => handleMaskClick(index)}
              className="cursor-pointer transition-transform duration-500"
            >
              <ellipse cx="0" cy="0" rx={index === 1 ? '38' : '32'} ry="44"
                fill={active ? '#1C1813' : '#090807'} stroke={active ? stroke : '#C8963E'}
                strokeWidth={active ? '1.8' : '0.8'} strokeOpacity={active ? '0.95' : '0.35'} />
              <path d={eyePath} fill="none" stroke={active ? '#EAE3D2' : '#C8963E'} strokeWidth="1.4" strokeOpacity={active ? '0.9' : '0.3'} />
              <path d={index === 1 ? 'M -12,16 Q 0,6 12,16' : 'M -10,15 Q 0,22 10,15'}
                fill="none" stroke={active ? stroke : '#C8963E'} strokeWidth="1.3" strokeOpacity={active ? '0.9' : '0.3'} />
            </g>
          );
        })}

        <g
          onPointerDown={handlePointerDown} onPointerMove={handlePointerMove}
          onPointerUp={stopSlice} onPointerCancel={stopSlice}
          className={maskStage === 3 ? 'cursor-ns-resize' : 'opacity-35 pointer-events-none'}
        >
          <g transform={`translate(${cleaved ? -18 : 0}, 0)`} className="transition-transform duration-500">
            <rect x="64" y="256" width="134" height="54" rx="12" fill="#1E281B" stroke="#C8963E" strokeWidth="1" strokeOpacity="0.6" />
            <path d="M 95,256 L 198,256 L 198,310 L 95,310 Z" fill="#EAE3D2" fillOpacity="0.16" />
          </g>
          <g transform={`translate(${cleaved ? 18 : 0}, 0)`} className="transition-transform duration-500">
            <rect x="202" y="256" width="134" height="54" rx="12" fill="#1E281B" stroke="#C8963E" strokeWidth="1" strokeOpacity="0.6" />
            <path d="M 202,256 L 305,256 L 305,310 L 202,310 Z" fill="#EAE3D2" fillOpacity="0.16" />
          </g>
          <line x1="200" y1="215" x2="200" y2="345" stroke="#8C1D24" strokeWidth="1.2" strokeDasharray="4 4" />
          <circle cx="200" cy={bladeY} r="7" fill="#D49B27" stroke="#090807" strokeWidth="1.5" />
        </g>
      </svg>
    </div>
  );
};
