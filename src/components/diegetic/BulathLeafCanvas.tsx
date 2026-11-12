// src/components/diegetic/BulathLeafCanvas.tsx
import React, { useState } from 'react';
import { BulathBlemish, BulathHurullaPayload } from '../../core/bulathCodec';
import { CASEFILE_AVATAR_CANDIDATES, forensicLedger } from '../../core/forensicLedger';
import { audioMixer } from '../../juice/audioMixer';
import { juiceDirector } from '../../juice/JuiceDirector';

interface BulathLeafCanvasProps {
  payload: BulathHurullaPayload;
  onInspectBlemish?: (blemish: BulathBlemish, discoveredIds: string[]) => void;
  onDiagnosisMarked?: (avatarId: string, correct: boolean) => void;
}

export const BulathLeafCanvas: React.FC<BulathLeafCanvasProps> = ({ payload, onInspectBlemish, onDiagnosisMarked }) => {
  const [lamp, setLamp] = useState({ x: 200, y: 195 });
  const [discovered, setDiscovered] = useState<string[]>([]);
  const [markedId, setMarkedId] = useState<string | null>(() => forensicLedger.getMarkedAvatar(payload.casefile));

  const candidates = CASEFILE_AVATAR_CANDIDATES[payload.casefile] ?? CASEFILE_AVATAR_CANDIDATES.CF01;
  const trueCandidate = candidates.find((c) => c.id === payload.avatar) ?? candidates[0];
  const stemCurveX = trueCandidate.stemBend === 'EAST' ? 242 : 158;

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(400, ((e.clientX - rect.left) / rect.width) * 400));
    const y = Math.max(0, Math.min(420, ((e.clientY - rect.top) / rect.height) * 420));
    setLamp({ x, y });
    for (const b of payload.blemishes) {
      if (Math.hypot(x - b.x * 400, y - b.y * 420) < 45 && !discovered.includes(b.id)) {
        const next = [...discovered, b.id];
        setDiscovered(next); juiceDirector.triggerHaptic('iron_grip'); onInspectBlemish?.(b, next);
      }
    }
  };

  const handleSelectCandidate = (candidateId: string) => {
    forensicLedger.markDiagnosis(payload.casefile, candidateId);
    setMarkedId(candidateId);
    const isCorrect = candidateId === payload.avatar;
    juiceDirector.triggerHaptic(isCorrect ? 'iron_grip' : 'dread_throb');
    audioMixer.playYakBeraPulse(isCorrect ? 0.85 : 0.45);
    onDiagnosisMarked?.(candidateId, isCorrect);
  };

  return (
    <div className="relative mx-auto my-2 flex w-full max-w-[28rem] flex-col items-center font-serif select-none">
      <div className="mb-1 text-center text-xs tracking-[0.22em] text-[#D49B27] uppercase">
        බුලත් ශාස්ත්ර පරීක්ෂාව · Backlit Betel-Leaf Forensics ෴
      </div>
      <div className="mb-2 text-center text-xs leading-relaxed text-[#EAE3D2]/80 italic">
        Pass the Pahana flame across the leaf to read the petiole stem bend (East vs. West) and stained veins, then etch the true Avatāra below.
      </div>

      <svg viewBox="0 0 400 380" onPointerMove={handlePointerMove} className="h-auto w-full cursor-crosshair touch-none">
        <defs>
          <radialGradient id="pahanaBacklight" cx={lamp.x} cy={lamp.y} r="125" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#D49B27" stopOpacity="0.65" />
            <stop offset="50%" stopColor="#8C1D24" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#050608" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx={lamp.x} cy={lamp.y} r="125" fill="url(#pahanaBacklight)" />
        <path d="M 200,42 C 315,95 325,232 200,286 C 75,232 85,95 200,42 Z" fill="#131D12" fillOpacity="0.88" stroke="#C8963E" strokeWidth="1.8" />
        <path d={`M 200,48 L 200,282 Q 204,310 ${stemCurveX},328`} fill="none" stroke="#D49B27" strokeWidth="2.4" strokeLinecap="round" />
        <text x={stemCurveX} y="342" textAnchor="middle" fill="#D49B27" fontSize="9">Stem Bends {trueCandidate.stemBend}</text>

        {[105, 150, 195, 238].map((vy, idx) => {
          const w = 68 - idx * 8;
          return <path key={vy} d={`M ${200 - w},${vy - 20} Q 200,${vy} ${200 + w},${vy - 20}`} fill="none" stroke="#C8963E" strokeWidth="1.1" strokeOpacity="0.55" />;
        })}

        {payload.blemishes.map((b) => {
          const cx = b.x * 400, cy = b.y * 360, dist = Math.hypot(lamp.x - cx, lamp.y - cy), revealed = dist < 95;
          return (
            <g key={b.id}>
              <circle cx={cx} cy={cy} r={b.type === 'PINHOLE_TEAR' ? '6' : '11'} fill={b.type === 'PINHOLE_TEAR' ? '#090807' : '#8C1D24'} fillOpacity={revealed ? '0.95' : '0.45'} stroke="#D49B27" strokeWidth="1.4" />
              {revealed && <circle cx={cx} cy={cy} r="20" fill="none" stroke="#D49B27" strokeWidth="0.8" strokeDasharray="3 3" />}
            </g>
          );
        })}
      </svg>

      <div className="mt-2 w-full space-y-2 border-t border-[#C8963E]/25 pt-2.5">
        <div className="text-center text-[10px] tracking-[0.24em] text-[#C8963E]/75 uppercase">
          ශාස්ත්ර තීන්දුව · Etch Diagnosed Avatāra on the Leaf Margin
        </div>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {candidates.map((cand) => {
            const isSelected = markedId === cand.id;
            return (
              <button
                key={cand.id} type="button" aria-pressed={isSelected} onClick={() => handleSelectCandidate(cand.id)}
                className={`incised-trigger cursor-pointer border-l-2 px-3.5 py-2 text-left transition-all ${
                  isSelected ? 'border-[#D49B27] bg-[#1C150F] text-[#D49B27]' : 'border-[#C8963E]/25 bg-[#0D0A08]/80 text-[#EAE3D2]/75'
                }`}
              >
                <div className="text-sm font-normal">{isSelected ? '❖ ' : '෴ '}{cand.sinhala} · {cand.roman}</div>
                <div className="mt-0.5 text-[11px] leading-snug text-[#8A99AD]/80 italic">{cand.forensicSign}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
