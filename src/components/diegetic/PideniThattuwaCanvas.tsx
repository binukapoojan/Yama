// src/components/diegetic/PideniThattuwaCanvas.tsx
import React, { useState } from 'react';
import { audioMixer } from '../../juice/audioMixer';
import { juiceDirector } from '../../juice/JuiceDirector';

interface PideniThattuwaProps {
  expectedAvatar: 'VATHA_KUMARA' | 'HANDUN_KUMARA';
  onConsecrated: () => void;
}

const CORNER_LAMPS = [
  { x: 56, y: 56 }, { x: 344, y: 56 }, { x: 56, y: 344 }, { x: 344, y: 344 },
] as const;

export const PideniThattuwaCanvas: React.FC<PideniThattuwaProps> = ({ expectedAvatar, onConsecrated }) => {
  const [consecrated, setConsecrated] = useState(false);
  const [facing, setFacing] = useState<'EAST' | 'WEST' | null>(null);
  const [wrongPulse, setWrongPulse] = useState(false);

  const handleAlign = (direction: 'EAST' | 'WEST') => {
    if (consecrated) return;
    setFacing(direction);
    const target = direction === 'EAST' ? 'HANDUN_KUMARA' : 'VATHA_KUMARA';
    if (target === expectedAvatar) {
      setConsecrated(true);
      setWrongPulse(false);
      juiceDirector.triggerHaptic('iron_grip');
      audioMixer.playYakBeraPulse(0.95);
      setTimeout(() => onConsecrated(), 700);
    } else {
      setWrongPulse(true);
      juiceDirector.triggerHaptic('dread_throb');
      audioMixer.playYakBeraPulse(0.4);
    }
  };

  const headShift = facing === 'WEST' ? -10 : facing === 'EAST' ? 10 : 0;

  return (
    <div className="relative mx-auto flex w-full max-w-[26rem] flex-col items-center justify-center font-serif select-none">
      <div className="mb-2 text-[11px] tracking-[0.2em] text-[#C8963E]/85 uppercase">
        පිදේනි තට්ටුව · Pideni Thattuwa Consecration ෴
      </div>
      <svg viewBox="0 0 400 400" className="h-auto w-full touch-none">
        <defs>
          <radialGradient id="pideniGlow" cx="200" cy="200" r="165" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={consecrated ? '#D49B27' : '#C8963E'} stopOpacity={consecrated ? '0.28' : '0.12'} />
            <stop offset="100%" stopColor="#090807" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="200" cy="200" r="175" fill="url(#pideniGlow)" />

        {/* Woven Gokkola & Split Bamboo 9-Grid Frame (Navagraha Kotuwa) */}
        <rect x="48" y="48" width="304" height="304" rx="6" fill="#120E0B" stroke="#C8963E" strokeWidth="2" strokeOpacity="0.75" />
        <rect x="64" y="64" width="272" height="272" fill="none" stroke="#D49B27" strokeWidth="0.9" strokeDasharray="4 3" strokeOpacity="0.55" />
        {[138, 262].map((pos) => (
          <g key={pos} stroke="#C8963E" strokeWidth="0.8" strokeOpacity="0.28">
            <line x1="64" y1={pos} x2="336" y2={pos} />
            <line x1={pos} y1="64" x2={pos} y2="336" />
          </g>
        ))}

        {/* 4 Corner Vilakkuwa (Coconut-Shell Oil Wicks) */}
        {CORNER_LAMPS.map((c, idx) => (
          <g key={idx}>
            <circle cx={c.x} cy={c.y} r="9" fill="#1A140F" stroke="#C8963E" strokeWidth="1.2" />
            <circle cx={c.x} cy={c.y} r={consecrated ? '5' : '3.5'} fill="#D49B27" />
          </g>
        ))}

        {/* North (Nil Manel Petals) & South (Dummala Resin Bowl) */}
        <g opacity="0.75">
          <circle cx="200" cy="98" r="24" fill="#101520" stroke="#3B4D7A" strokeWidth="1.2" />
          <text x="200" y="96" textAnchor="middle" fill="#8A99AD" fontSize="9">නිල් මානෙල්</text>
          <text x="200" y="108" textAnchor="middle" fill="#EAE3D2" fontSize="8" opacity="0.65">Nil Manel</text>
          <circle cx="200" cy="302" r="24" fill="#1B130E" stroke="#C8963E" strokeWidth="1.2" />
          <text x="200" y="300" textAnchor="middle" fill="#D49B27" fontSize="9">දුම්මල</text>
          <text x="200" y="312" textAnchor="middle" fill="#EAE3D2" fontSize="8" opacity="0.65">Dummala</text>
        </g>

        {/* East Altar (Handun Kumara - Sweet Kevum & Sandalwood) */}
        <g onClick={() => handleAlign('EAST')} className="cursor-pointer">
          <circle cx="302" cy="200" r="32" fill={facing === 'EAST' ? '#2C2111' : '#0D0B09'} stroke="#D49B27" strokeWidth={facing === 'EAST' ? '2.2' : '1.4'} />
          <text x="302" y="195" textAnchor="middle" fill="#D49B27" fontSize="10">නැගෙනහිර</text>
          <text x="302" y="208" textAnchor="middle" fill="#EAE3D2" fontSize="10" letterSpacing="1">EAST</text>
          <text x="302" y="246" textAnchor="middle" fill="#D49B27" fontSize="9" opacity="0.85">Sweetmeats</text>
        </g>

        {/* West Altar (Vatha Kumara - Charred Pulutu Meat) */}
        <g onClick={() => handleAlign('WEST')} className="cursor-pointer">
          <circle cx="98" cy="200" r="32" fill={facing === 'WEST' ? '#281114' : '#0D0B09'} stroke="#8C1D24" strokeWidth={facing === 'WEST' ? '2.2' : '1.4'} />
          <text x="98" y="195" textAnchor="middle" fill="#8C1D24" fontSize="10">බස්නාහිර</text>
          <text x="98" y="208" textAnchor="middle" fill="#EAE3D2" fontSize="10" letterSpacing="1">WEST</text>
          <text x="98" y="246" textAnchor="middle" fill="#8C1D24" fontSize="9" opacity="0.85">Charred Meat</text>
        </g>

        {/* Center: Sculpted Clay Bali Pili Effigy of Kalu Kumara */}
        <g transform="translate(200, 200)" className="pointer-events-none">
          <circle cx="0" cy="0" r="42" fill="#17130E" stroke={consecrated ? '#D49B27' : '#C8963E'} strokeWidth={consecrated ? '2' : '1.2'} />
          <path d="M -20,30 C -22,8 22,8 20,30 Z" fill="#261E16" stroke="#C8963E" strokeWidth="0.9" />
          <g transform={`translate(${headShift}, -4)`} className="transition-transform duration-300">
            <polygon points="-14,-14 -7,-26 0,-18 7,-26 14,-14" fill="#C8963E" opacity="0.85" />
            <ellipse cx="0" cy="0" rx="14" ry="17" fill="#2E2419" stroke="#C8963E" strokeWidth="1" />
            <circle cx="-5" cy="-2" r="2.2" fill={consecrated ? '#D49B27' : '#8C1D24'} />
            <circle cx="5" cy="-2" r="2.2" fill={consecrated ? '#D49B27' : '#8C1D24'} />
          </g>
          {consecrated && <path d="M 0,-22 L -4,4 L 4,14 L -2,34" fill="none" stroke="#D49B27" strokeWidth="2" />}
        </g>
      </svg>
      <div className="mt-2 text-center text-xs tracking-widest text-[#EAE3D2]/75 uppercase">
        {consecrated ? 'Altar Sealed · Effigy Bound' : wrongPulse ? 'Wrong Quarter · Consult the Betel Leaf' : 'Turn Effigy Face to Consecrate Altar'}
      </div>
    </div>
  );
};
