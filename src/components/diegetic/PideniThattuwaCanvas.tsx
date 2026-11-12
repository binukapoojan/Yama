// src/components/diegetic/PideniThattuwaCanvas.tsx
import React, { useEffect, useState } from 'react';
import { audioMixer } from '../../juice/audioMixer';
import { juiceDirector } from '../../juice/JuiceDirector';

interface PideniThattuwaProps { expectedAvatar: 'VATHA_KUMARA' | 'HANDUN_KUMARA'; onConsecrated: () => void; }
const CORNER_LAMPS = [
  { id: 0, x: 58, y: 58, label: 'NW' }, { id: 1, x: 342, y: 58, label: 'NE' },
  { id: 2, x: 58, y: 342, label: 'SW' }, { id: 3, x: 342, y: 342, label: 'SE' },
] as const;

export const PideniThattuwaCanvas: React.FC<PideniThattuwaProps> = ({ expectedAvatar, onConsecrated }) => {
  const [consecrated, setConsecrated] = useState(false), [facing, setFacing] = useState<'EAST' | 'WEST' | null>(null);
  const [litLamps, setLitLamps] = useState<number[]>([0, 1, 2, 3]), [dreadFlash, setDreadFlash] = useState(false);
  const requiredDirection = expectedAvatar === 'HANDUN_KUMARA' ? 'EAST' : 'WEST', lampsReady = litLamps.length >= 3;

  useEffect(() => {
    if (consecrated) return;
    const timer = setInterval(() => setLitLamps((prev) => (prev.length > 2 ? prev.slice(0, -1) : prev)), 3800);
    return () => clearInterval(timer);
  }, [consecrated]);

  const handleRelightLamp = (id: number) => {
    if (consecrated || litLamps.includes(id)) return;
    setLitLamps((prev) => [...prev, id]);
    juiceDirector.triggerHaptic('iron_grip');
    audioMixer.playYakBeraPulse(0.45);
  };

  const handleAlign = (direction: 'EAST' | 'WEST') => {
    if (consecrated) return;
    if (!lampsReady) { setLitLamps([0, 1, 2, 3]); juiceDirector.triggerHaptic('iron_grip'); return; }
    const target = direction === 'EAST' ? 'HANDUN_KUMARA' : 'VATHA_KUMARA';
    if (target === expectedAvatar) {
      setFacing(direction); setConsecrated(true); setDreadFlash(false);
      juiceDirector.triggerHaptic('iron_grip'); audioMixer.playYakBeraClimax(); onConsecrated();
    } else {
      setFacing(direction); setDreadFlash(true); juiceDirector.triggerHaptic('dread_throb');
      audioMixer.playArterialPulse(0.95); setTimeout(() => { setFacing(null); setDreadFlash(false); }, 400);
    }
  };

  const headShift = facing === 'WEST' ? -12 : facing === 'EAST' ? 12 : 0;

  return (
    <div className="relative mx-auto flex w-full max-w-[26rem] flex-col items-center justify-center font-serif select-none">
      <div className="mb-1 text-center text-xs tracking-[0.2em] text-[#D49B27] uppercase">
        පිදේනි තට්ටුව · Nine-Square Offering Tray ෴
      </div>
      <div className="mb-2.5 text-center text-xs leading-relaxed text-[#EAE3D2]/85 italic">
        {!lampsReady
          ? `Step I · Touch the darkened corner wicks to relight the altar (${litLamps.length}/4 lit)`
          : `Step II · Touch the pulsing ${requiredDirection} quarter to turn the clay effigy toward ${expectedAvatar === 'HANDUN_KUMARA' ? 'Handun Kumāra (Sweetmeats)' : 'Vātha Kumāra (Charred Meat)'}`}
      </div>

      <svg viewBox="0 0 400 400" className={`h-auto w-full touch-none transition-transform duration-150 ${dreadFlash ? 'scale-[1.02]' : 'scale-100'}`}>
        <rect x="48" y="48" width="304" height="304" rx="4" fill={dreadFlash ? '#22090C' : '#120E0B'} stroke={dreadFlash ? '#8C1D24' : '#C8963E'} strokeWidth="2" strokeOpacity="0.8" />
        {[138, 262].map((pos) => (
          <g key={pos} stroke="#C8963E" strokeWidth="0.8" strokeOpacity="0.25">
            <line x1="64" y1={pos} x2="336" y2={pos} /><line x1={pos} y1="64" x2={pos} y2="336" />
          </g>
        ))}

        {/* 4 Corner Vilakkuwa Oil Wicks */}
        {CORNER_LAMPS.map((c) => {
          const isLit = litLamps.includes(c.id);
          return (
            <g key={c.id} onClick={() => handleRelightLamp(c.id)} className="cursor-pointer">
              {!isLit && <circle cx={c.x} cy={c.y} r="20" fill="none" stroke="#D49B27" strokeWidth="1.2" strokeDasharray="3 3" className="animate-spin" />}
              <circle cx={c.x} cy={c.y} r="14" fill="#1A140F" stroke={isLit ? '#D49B27' : '#8C1D24'} strokeWidth="1.5" />
              <circle cx={c.x} cy={c.y} r={isLit ? '6' : '3'} fill={isLit ? '#D49B27' : '#5A2A2E'} />
            </g>
          );
        })}

        {/* East Altar (Handun Kumara) */}
        <g onClick={() => handleAlign('EAST')} className="cursor-pointer">
          {lampsReady && requiredDirection === 'EAST' && (
            <circle cx="302" cy="200" r="40" fill="none" stroke="#D49B27" strokeWidth="1.5" strokeDasharray="4 3" className="animate-pulse" />
          )}
          <circle cx="302" cy="200" r="32" fill={facing === 'EAST' ? '#2C2111' : '#0D0B09'} stroke="#D49B27" strokeWidth="1.8" />
          <text x="302" y="196" textAnchor="middle" fill="#D49B27" fontSize="10">නැගෙනහිර</text>
          <text x="302" y="209" textAnchor="middle" fill="#EAE3D2" fontSize="10" letterSpacing="1">EAST</text>
          <text x="302" y="246" textAnchor="middle" fill="#D49B27" fontSize="9">Sweetmeats</text>
        </g>

        {/* West Altar (Vatha Kumara) */}
        <g onClick={() => handleAlign('WEST')} className="cursor-pointer">
          {lampsReady && requiredDirection === 'WEST' && (
            <circle cx="98" cy="200" r="40" fill="none" stroke="#D49B27" strokeWidth="1.5" strokeDasharray="4 3" className="animate-pulse" />
          )}
          <circle cx="98" cy="200" r="32" fill={facing === 'WEST' ? '#281114' : '#0D0B09'} stroke="#8C1D24" strokeWidth="1.8" />
          <text x="98" y="196" textAnchor="middle" fill="#8C1D24" fontSize="10">බස්නාහිර</text>
          <text x="98" y="209" textAnchor="middle" fill="#EAE3D2" fontSize="10" letterSpacing="1">WEST</text>
          <text x="98" y="246" textAnchor="middle" fill="#8C1D24" fontSize="9">Charred Meat</text>
        </g>

        {/* Center Clay Bali Pili Effigy */}
        <g transform="translate(200, 200)" className="pointer-events-none">
          <circle cx="0" cy="0" r="42" fill="#17130E" stroke={consecrated ? '#D49B27' : '#C8963E'} strokeWidth="1.6" />
          <g transform={`translate(${headShift}, -4)`} className="transition-transform duration-200">
            <ellipse cx="0" cy="0" rx="14" ry="17" fill="#2E2419" stroke="#C8963E" strokeWidth="1" />
            <circle cx="-5" cy="-2" r="2.5" fill={consecrated ? '#D49B27' : '#8C1D24'} />
            <circle cx="5" cy="-2" r="2.5" fill={consecrated ? '#D49B27' : '#8C1D24'} />
          </g>
        </g>
      </svg>
    </div>
  );
};
