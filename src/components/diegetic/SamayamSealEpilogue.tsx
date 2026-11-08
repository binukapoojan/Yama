// src/components/diegetic/SamayamSealEpilogue.tsx
import React, { useState } from 'react';
import { audioMixer } from '../../juice/audioMixer';
import { juiceDirector } from '../../juice/JuiceDirector';

const QUARTERS: ReadonlyArray<{
  id: number;
  cx: number;
  cy: number;
  deity: string;
  demonBound: string;
}> = [
  { id: 0, cx: 180, cy: 46, deity: 'නැගෙනහිර · Dhrutarāshtra (East)', demonBound: 'Binds Kalu Kumāra of Dusk' },
  { id: 1, cx: 314, cy: 180, deity: 'දකුණ · Virūdhaka (South)', demonBound: 'Binds Rīri Yakā of the Hearth' },
  { id: 2, cx: 180, cy: 314, deity: 'බස්නාහිර · Virūpāksha (West)', demonBound: 'Binds Mala Mōhinī of the Culvert' },
  { id: 3, cx: 46, cy: 180, deity: 'උතුර · Vaishravana (North)', demonBound: 'Binds Mahasōnā of the Crossroads' },
];

export const SamayamSealEpilogue: React.FC = () => {
  const [pinned, setPinned] = useState<number[]>([]);
  const isConsecrated = pinned.length === 4;

  const handlePinQuarter = (id: number) => {
    if (pinned.includes(id)) return;
    const next = [...pinned, id];
    setPinned(next);
    juiceDirector.triggerHaptic(next.length === 4 ? 'dread_throb' : 'iron_grip');
    audioMixer.playYakBeraPulse(0.65 + next.length * 0.08);
    if (next.length === 4) {
      audioMixer.setAnchorState(true);
    }
  };

  return (
    <div className="flex flex-col items-center py-2 text-center font-serif select-none">
      <div className="mb-1 text-sm font-medium tracking-wide text-[#D49B27]">
        සතරවරම් සමයම් මුද්රාව ෴ Sataravaram Warrant Seal
      </div>
      <p className="mb-5 max-w-[32rem] text-xs leading-relaxed text-[#EAE3D2]/70 italic">
        {isConsecrated
          ? 'The Four Quarters are nailed in cold iron. All twenty-eight Lakunu and eight Avatāra rest bound within the oil-blackened palm leaves.'
          : 'All 28 signs witnessed. Strike the four cardinal guardian nodes of the Yantra to drive the iron nails and seal the manuscript.'}
      </p>

      {/* Interactive Copper-Foil Sataravaram Yantra SVG */}
      <svg viewBox="0 0 360 360" className="mb-6 h-64 w-64 touch-none">
        <circle cx="180" cy="180" r="142" fill="#0D0B09" stroke="#C8963E" strokeWidth="1.2" strokeOpacity="0.45" />
        <circle cx="180" cy="180" r="106" fill="none" stroke="#C8963E" strokeWidth="0.8" strokeDasharray="4 4" strokeOpacity="0.4" />
        <rect
          x="96" y="96" width="168" height="168"
          fill="none"
          stroke={isConsecrated ? '#D49B27' : '#8C1D24'}
          strokeWidth="1.4"
          transform="rotate(45 180 180)"
        />
        <rect x="108" y="108" width="144" height="144" fill="#14110D" stroke="#C8963E" strokeWidth="1.2" />

        {/* Central Kundaliya Seal */}
        <circle
          cx="180" cy="180" r="38"
          fill={isConsecrated ? '#D49B27' : '#16120E'}
          fillOpacity={isConsecrated ? '0.22' : '0.9'}
          stroke={isConsecrated ? '#D49B27' : '#C8963E'}
          strokeWidth="1.8"
        />
        <text x="180" y="189" textAnchor="middle" fill={isConsecrated ? '#D49B27' : '#C8963E'} fontSize="28">
          ෴
        </text>

        {/* Four Cardinal Guardian Nodes (Hathara Kona) */}
        {QUARTERS.map((q) => {
          const locked = pinned.includes(q.id);
          return (
            <g key={q.id} onClick={() => handlePinQuarter(q.id)} className="cursor-pointer">
              <circle
                cx={q.cx} cy={q.cy} r={locked ? '18' : '14'}
                fill={locked ? '#D49B27' : '#16120E'}
                stroke={locked ? '#EAE3D2' : '#C8963E'}
                strokeWidth="1.6"
                className="transition-all duration-300"
              />
              <text x={q.cx} y={q.cy + 4} textAnchor="middle" fill={locked ? '#090807' : '#D49B27'} fontSize="11" fontWeight="bold">
                {locked ? '✦' : q.id + 1}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Cardinal Warrant Status & Final Anthology Colophon */}
      <div className="grid w-full max-w-[34rem] grid-cols-2 gap-2.5 text-left text-xs">
        {QUARTERS.map((q) => {
          const locked = pinned.includes(q.id);
          return (
            <div key={q.id} className={`border px-3 py-2 ${locked ? 'border-[#D49B27]/60 bg-[#1E1812]' : 'border-[#C8963E]/20 bg-[#120E0B] opacity-55'}`}>
              <div className="font-medium text-[#D49B27]">{q.deity}</div>
              <div className="text-[11px] text-[#EAE3D2]/70">{locked ? q.demonBound : 'Unpinned quarter · Tap node'}</div>
            </div>
          );
        })}
      </div>

      {isConsecrated && (
        <blockquote className="mt-6 max-w-[34rem] border-y border-[#D49B27]/40 py-3.5 text-xs leading-relaxed text-[#EAE3D2]/90">
          <div className="mb-1 text-sm text-[#D49B27]">සිද්ධිරස්තු ෴ සුභමස්තු ෴ ආරෝග්යමස්තු</div>
          “By the warrant of Lord Buddha, the Goddess Pattini, the Warrior Gothaimbara, and the Cold Iron Sickle: the dusk water of Nugegoda, the bamboo mist of Kandy, the red hearth of Matara, and the three-way crossroads of Anuradhapura are quiet. Go in waking peace.”
        </blockquote>
      )}
    </div>
  );
};
