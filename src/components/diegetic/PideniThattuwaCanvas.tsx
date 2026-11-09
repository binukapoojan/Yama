// src/components/diegetic/PideniThattuwaCanvas.tsx
import React, { useEffect, useState } from 'react';
import { audioMixer } from '../../juice/audioMixer';
import { juiceDirector } from '../../juice/JuiceDirector';

interface PideniThattuwaProps { expectedAvatar: 'VATHA_KUMARA' | 'HANDUN_KUMARA'; onConsecrated: () => void; }
const CORNER_LAMPS = [{ id: 0, x: 58, y: 58 }, { id: 1, x: 342, y: 58 }, { id: 2, x: 58, y: 342 }, { id: 3, x: 342, y: 342 }] as const;

export const PideniThattuwaCanvas: React.FC<PideniThattuwaProps> = ({ expectedAvatar, onConsecrated }) => {
  const [consecrated, setConsecrated] = useState(false), [facing, setFacing] = useState<'EAST' | 'WEST' | null>(null);
  const [litLamps, setLitLamps] = useState<number[]>([0, 1, 2, 3]), [dreadFlash, setDreadFlash] = useState(false);

  useEffect(() => {
    if (consecrated) return;
    const timer = setInterval(() => setLitLamps((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev)), 2400);
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
    const target = direction === 'EAST' ? 'HANDUN_KUMARA' : 'VATHA_KUMARA';
    if (target === expectedAvatar && litLamps.length >= 3) {
      setFacing(direction); setConsecrated(true); setDreadFlash(false);
      juiceDirector.triggerHaptic('iron_grip');
      audioMixer.playYakBeraClimax();
      setTimeout(() => onConsecrated(), 700);
    } else {
      setFacing(direction); setDreadFlash(true);
      setLitLamps((prev) => prev.slice(1));
      juiceDirector.triggerHaptic('dread_throb');
      audioMixer.playArterialPulse(0.95);
      setTimeout(() => { setFacing(null); setDreadFlash(false); }, 420);
    }
  };

  const headShift = facing === 'WEST' ? -12 : facing === 'EAST' ? 12 : 0;

  return (
    <div className="relative mx-auto flex w-full max-w-[26rem] flex-col items-center justify-center font-serif select-none">
      <div className="mb-2 text-[11px] tracking-[0.18em] text-[#C8963E]/85 uppercase">
        පිදේනි තට්ටුව · Keep Corner Lamps Lit ({litLamps.length}/4) &amp; Turn Effigy ෴
      </div>
      <svg viewBox="0 0 400 400" className={`h-auto w-full touch-none transition-transform duration-150 ${dreadFlash ? 'scale-[1.02]' : 'scale-100'}`}>
        <rect x="48" y="48" width="304" height="304" rx="6" fill={dreadFlash ? '#22090C' : '#120E0B'} stroke={dreadFlash ? '#8C1D24' : '#C8963E'} strokeWidth="2" strokeOpacity="0.8" />
        <rect x="64" y="64" width="272" height="272" fill="none" stroke="#D49B27" strokeWidth="0.9" strokeDasharray="4 3" strokeOpacity="0.5" />
        {[138, 262].map((pos) => (
          <g key={pos} stroke="#C8963E" strokeWidth="0.8" strokeOpacity="0.25">
            <line x1="64" y1={pos} x2="336" y2={pos} /><line x1={pos} y1="64" x2={pos} y2="336" />
          </g>
        ))}

        {/* 4 Corner Vilakkuwa Oil Wicks (Click to relight when wind blows them out) */}
        {CORNER_LAMPS.map((c) => {
          const isLit = litLamps.includes(c.id);
          return (
            <g key={c.id} onClick={() => handleRelightLamp(c.id)} className="cursor-pointer">
              <circle cx={c.x} cy={c.y} r="14" fill="#1A140F" stroke={isLit ? '#D49B27' : '#8C1D24'} strokeWidth="1.4" />
              <circle cx={c.x} cy={c.y} r={isLit ? '6' : '2.5'} fill={isLit ? '#D49B27' : '#3A2E25'} />
            </g>
          );
        })}

        {/* North (Nil Manel) & South (Dummala) */}
        <g opacity="0.75">
          <circle cx="200" cy="98" r="23" fill="#101520" stroke="#3B4D7A" strokeWidth="1.2" />
          <text x="200" y="101" textAnchor="middle" fill="#8A99AD" fontSize="8.5">නිල් මානෙල්</text>
          <circle cx="200" cy="302" r="23" fill="#1B130E" stroke="#C8963E" strokeWidth="1.2" />
          <text x="200" y="305" textAnchor="middle" fill="#D49B27" fontSize="8.5">දුම්මල</text>
        </g>

        {/* East Altar (Handun Kumara) */}
        <g onClick={() => handleAlign('EAST')} className="cursor-pointer">
          <circle cx="302" cy="200" r="32" fill={facing === 'EAST' ? '#2C2111' : '#0D0B09'} stroke="#D49B27" strokeWidth="1.6" />
          <text x="302" y="196" textAnchor="middle" fill="#D49B27" fontSize="10">නැගෙනහිර</text>
          <text x="302" y="209" textAnchor="middle" fill="#EAE3D2" fontSize="10" letterSpacing="1">EAST</text>
          <text x="302" y="246" textAnchor="middle" fill="#D49B27" fontSize="9">Sweetmeats</text>
        </g>

        {/* West Altar (Vatha Kumara) */}
        <g onClick={() => handleAlign('WEST')} className="cursor-pointer">
          <circle cx="98" cy="200" r="32" fill={facing === 'WEST' ? '#281114' : '#0D0B09'} stroke="#8C1D24" strokeWidth="1.6" />
          <text x="98" y="196" textAnchor="middle" fill="#8C1D24" fontSize="10">බස්නාහිර</text>
          <text x="98" y="209" textAnchor="middle" fill="#EAE3D2" fontSize="10" letterSpacing="1">WEST</text>
          <text x="98" y="246" textAnchor="middle" fill="#8C1D24" fontSize="9">Charred Meat</text>
        </g>

        {/* Center: Sculpted Clay Bali Pili Effigy */}
        <g transform="translate(200, 200)" className="pointer-events-none">
          <circle cx="0" cy="0" r="42" fill="#17130E" stroke={consecrated ? '#D49B27' : dreadFlash ? '#8C1D24' : '#C8963E'} strokeWidth="1.6" />
          <path d="M -20,30 C -22,8 22,8 20,30 Z" fill="#261E16" stroke="#C8963E" strokeWidth="0.9" />
          <g transform={`translate(${headShift}, -4)`} className="transition-transform duration-200">
            <polygon points="-14,-14 -7,-26 0,-18 7,-26 14,-14" fill="#C8963E" opacity="0.85" />
            <ellipse cx="0" cy="0" rx="14" ry="17" fill="#2E2419" stroke="#C8963E" strokeWidth="1" />
            <circle cx="-5" cy="-2" r={dreadFlash ? '3.5' : '2.2'} fill={consecrated ? '#D49B27' : '#8C1D24'} />
            <circle cx="5" cy="-2" r={dreadFlash ? '3.5' : '2.2'} fill={consecrated ? '#D49B27' : '#8C1D24'} />
            <path d={dreadFlash ? 'M -7,9 Q 0,2 7,9' : 'M -5,8 L 5,8'} fill="none" stroke="#8C1D24" strokeWidth="1.5" />
          </g>
          {consecrated && <path d="M 0,-22 L -4,4 L 4,14 L -2,34" fill="none" stroke="#D49B27" strokeWidth="2.2" />}
        </g>
      </svg>
      <div className="mt-2 text-center text-xs tracking-widest text-[#EAE3D2]/75 uppercase">
        {consecrated ? 'Altar Sealed · Effigy Bound' : dreadFlash ? 'The Effigy Resisted! Check Lamps & Avatar Quarter' : 'Turn Effigy Face to Consecrate Altar'}
      </div>
    </div>
  );
};
