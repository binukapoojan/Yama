// src/components/viewport/ScratchboardEtchPlate.tsx
import React from 'react';
import { FlowLoopId } from '../../core/schema';

interface ScratchboardEtchPlateProps {
  loopId: FlowLoopId;
}

export const ScratchboardEtchPlate: React.FC<ScratchboardEtchPlateProps> = ({ loopId }) => {
  const isCf01 = loopId === 'bodima_rain_window' || loopId === 'pahana_nil_manel' || loopId === 'mirror_dark_idle' || loopId === 'pahana_steady';
  const isCf02 = loopId === 'mohini_saree_silhouette' || loopId === 'kaduru_puddle_feet' || loopId === 'sanni_mask_torch';
  const isCf03 = loopId === 'matara_hearth_smoke' || loopId === 'wadamal_blood_hedge' || loopId === 'iron_sickle_ember' || loopId === 'peduru_funeral_mat';

  return (
    <svg
      viewBox="0 0 800 500"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      data-testid="scratchboard-etch-plate"
      data-loop={loopId}
      className="pointer-events-none absolute inset-0 h-full w-full opacity-35"
    >
      <defs>
        <pattern id="scratchHatch" width="8" height="8" patternTransform="rotate(32)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="8" stroke="#C8963E" strokeWidth="0.4" strokeOpacity="0.18" />
        </pattern>
      </defs>

      <rect width="800" height="500" fill="url(#scratchHatch)" />

      {/* CF01 · Nugegoda Boarding Annex, Bevelled Mirror & Nil Manel Lotus */}
      {isCf01 && (
        <g fill="none" strokeLinecap="round">
          <rect x="250" y="55" width="300" height="360" stroke="#3B4D7A" strokeWidth="1.2" strokeOpacity="0.45" />
          {[310, 370, 430, 490].map((x) => (
            <line key={x} x1={x} y1="55" x2={x} y2="415" stroke="#8A99AD" strokeWidth="0.8" strokeOpacity="0.28" />
          ))}
          {loopId === 'mirror_dark_idle' && (
            <path d="M 330,90 L 415,240 L 385,310 L 450,410" stroke="#8C1D24" strokeWidth="1.8" strokeOpacity="0.65" />
          )}
          <path d="M 400,395 C 365,365 355,325 400,295 C 445,325 435,365 400,395 Z" stroke="#D49B27" strokeWidth="1.4" strokeOpacity="0.55" />
        </g>
      )}

      {/* CF02 · Kandy Upper Lake Culvert, Weeping Saree Silhouette & Kaduru Masks */}
      {isCf02 && (
        <g fill="none" strokeLinecap="round">
          <path d="M 140,460 C 180,220 260,80 340,40 M 660,460 C 620,220 540,80 460,40" stroke="#3B4D7A" strokeWidth="1.4" strokeOpacity="0.45" />
          <path d="M 400,135 C 432,135 448,185 456,365 L 344,365 C 352,185 368,135 400,135 Z" stroke="#EAE3D2" strokeWidth="1.2" strokeOpacity="0.38" />
          <ellipse cx="400" cy="410" rx="140" ry="24" stroke="#D49B27" strokeWidth="1" strokeDasharray="5 4" strokeOpacity="0.45" />
        </g>
      )}

      {/* CF03 · Matara Hearth, Humbaha Termite Mound & Woven Funeral Mat */}
      {isCf03 && (
        <g fill="none" strokeLinecap="round">
          <path d="M 290,430 L 335,210 L 375,255 L 405,155 L 445,245 L 480,195 L 515,430 Z" stroke="#8C1D24" strokeWidth="1.6" strokeOpacity="0.55" />
          <path d="M 355,360 A 55,48 0 1,1 455,310" stroke="#D49B27" strokeWidth="2.2" strokeOpacity="0.6" />
          <circle cx="400" cy="120" r="28" stroke="#8C1D24" strokeWidth="1.2" strokeOpacity="0.45" />
        </g>
      )}

      {/* CF04 & CF05 · Anuradhapura Banyan Crossroads, Boar Tusk & Giraya Cutter */}
      {!isCf01 && !isCf02 && !isCf03 && (
        <g fill="none" strokeLinecap="round">
          <path d="M 80,40 C 240,120 310,260 330,460 M 720,40 C 560,120 490,260 470,460" stroke="#C8963E" strokeWidth="1.3" strokeOpacity="0.4" />
          <path d="M 320,280 L 345,175 L 400,195 L 455,175 L 480,280 Z" stroke="#8C1D24" strokeWidth="1.6" strokeOpacity="0.55" />
          <path d="M 340,210 Q 305,170 345,165 M 460,210 Q 495,170 455,165" stroke="#D49B27" strokeWidth="2" strokeOpacity="0.65" />
        </g>
      )}
    </svg>
  );
};
