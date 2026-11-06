import React, { useState } from 'react';
import { audioMixer } from '../../juice/audioMixer';
import { juiceDirector } from '../../juice/JuiceDirector';

interface PideniThattuwaProps {
  expectedAvatar: 'VATHA_KUMARA' | 'HANDUN_KUMARA';
  onConsecrated: () => void;
}

export const PideniThattuwaCanvas: React.FC<PideniThattuwaProps> = ({ expectedAvatar, onConsecrated }) => {
  const [consecrated, setConsecrated] = useState(false);
  const [facing, setFacing] = useState<'EAST' | 'WEST' | null>(null);

  const handleAlign = (direction: 'EAST' | 'WEST') => {
    if (consecrated) return;
    setFacing(direction);
    const target = direction === 'EAST' ? 'HANDUN_KUMARA' : 'VATHA_KUMARA';
    if (target === expectedAvatar) {
      setConsecrated(true);
      juiceDirector.triggerHaptic('iron_grip');
      audioMixer.playYakBeraPulse(0.9);
      setTimeout(() => onConsecrated(), 700);
    } else {
      juiceDirector.triggerHaptic('dread_throb');
      audioMixer.playYakBeraPulse(0.4);
    }
  };

  return (
    <div className="relative mx-auto flex w-full max-w-[25rem] flex-col items-center justify-center select-none">
      <svg viewBox="0 0 400 400" className="h-auto w-full touch-none">
        {/* Woven Gokkola & Split Bamboo Square Altar Frame */}
        <rect x="50" y="50" width="300" height="300" rx="8" fill="#120F0C" stroke="#C8963E" strokeWidth="1.8" strokeOpacity="0.7" />
        <rect x="70" y="70" width="260" height="260" fill="none" stroke="#D49B27" strokeWidth="0.8" strokeDasharray="3 3" strokeOpacity="0.5" />
        <line x1="50" y1="200" x2="350" y2="200" stroke="#C8963E" strokeWidth="0.6" strokeOpacity="0.3" />
        <line x1="200" y1="50" x2="200" y2="350" stroke="#C8963E" strokeWidth="0.6" strokeOpacity="0.3" />

        {/* East Altar (Handun Kumara - Sweetmeats & Flowers) */}
        <g onClick={() => handleAlign('EAST')} className="cursor-pointer transition-opacity duration-300">
          <circle cx="300" cy="200" r="28" fill={facing === 'EAST' ? '#2A2012' : '#090807'} stroke="#D49B27" strokeWidth="1.4" />
          <text x="300" y="204" textAnchor="middle" fill="#EAE3D2" fontSize="10" fontFamily="serif" letterSpacing="1">EAST</text>
          <text x="300" y="240" textAnchor="middle" fill="#D49B27" fontSize="9" opacity="0.8">Sweetmeats</text>
        </g>

        {/* West Altar (Vatha Kumara - Charred Pulutu) */}
        <g onClick={() => handleAlign('WEST')} className="cursor-pointer transition-opacity duration-300">
          <circle cx="100" cy="200" r="28" fill={facing === 'WEST' ? '#241214' : '#090807'} stroke="#8C1D24" strokeWidth="1.4" />
          <text x="100" y="204" textAnchor="middle" fill="#EAE3D2" fontSize="10" fontFamily="serif" letterSpacing="1">WEST</text>
          <text x="100" y="240" textAnchor="middle" fill="#8C1D24" fontSize="9" opacity="0.8">Charred Meat</text>
        </g>

        {/* Center: Clay Bali Pili Effigy */}
        <g transform="translate(200, 200)" className="pointer-events-none">
          <circle cx="0" cy="0" r="34" fill="#1C1813" stroke="#C8963E" strokeWidth="1.2" strokeOpacity={consecrated ? '1' : '0.4'} />
          <ellipse cx={facing === 'WEST' ? -8 : facing === 'EAST' ? 8 : 0} cy="0" rx="14" ry="20" fill="#2E2419" />
          <circle cx={facing === 'WEST' ? -12 : facing === 'EAST' ? 12 : 0} cy="-4" r="3" fill="#D49B27" />
        </g>
      </svg>
      <div className="mt-4 font-serif text-xs tracking-widest text-[#EAE3D2]/70 uppercase">
        {consecrated ? 'Altar Sealed · Effigy Bound' : 'Turn Effigy Face to Consecrate Altar'}
      </div>
    </div>
  );
};
