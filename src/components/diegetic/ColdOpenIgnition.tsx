// src/components/diegetic/ColdOpenIgnition.tsx
import React, { useEffect, useState } from 'react';
import { audioMixer } from '../../juice/audioMixer';
import { juiceDirector } from '../../juice/JuiceDirector';

interface ColdOpenIgnitionProps { onSurviveWatch: () => void; onOpenDocket: () => void; }

export const ColdOpenIgnition: React.FC<ColdOpenIgnitionProps> = ({ onSurviveWatch, onOpenDocket }) => {
  const [phase, setPhase] = useState<'UNLIT' | 'IGNITING' | 'OMEN' | 'READY'>('UNLIT');

  useEffect(() => {
    if (phase === 'UNLIT') return;
    const t1 = setTimeout(() => { setPhase('OMEN'); audioMixer.playMohiniWeeping(); audioMixer.playArterialPulse(0.95); juiceDirector.triggerHaptic('heartbeat_panic'); }, 2300);
    const t2 = setTimeout(() => { setPhase('READY'); audioMixer.playYakBeraPulse(0.75); }, 4400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [phase]);

  const handleTouchWick = () => {
    if (phase !== 'UNLIT') return;
    audioMixer.unlock(); audioMixer.setCue('ceb_power_cut', 75); audioMixer.playYakBeraClimax(); juiceDirector.triggerHaptic('dread_throb'); setPhase('IGNITING');
  };
  const isLit = phase !== 'UNLIT';
  const bgStyle = { backgroundImage: isLit
    ? 'radial-gradient(circle at 50% 44%, rgba(212,155,39,0.13) 0%, rgba(59,77,122,0.18) 34%, rgba(140,29,36,0.06) 56%, #050608 82%)'
    : 'radial-gradient(circle at 50% 46%, rgba(59,77,122,0.16) 0%, rgba(20,28,46,0.08) 38%, #050608 72%)' };

  return (
    <div
      onClick={phase === 'UNLIT' ? handleTouchWick : undefined}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050608] px-6 text-center font-serif text-[#EAE3D2] select-none transition-all duration-1000 ${phase === 'UNLIT' ? 'cursor-pointer' : ''}`}
      style={bgStyle}
    >
      <div className="animate-folio space-y-1.5">
        <div className="flex items-center justify-center gap-3 text-[10px] tracking-[0.42em] text-[#8A99AD]/80 uppercase">
          <span>☸</span><span>After Monsoon · Nocturnal Folk-Horror Anthology</span><span>☸</span>
        </div>
        <h1 className="typo-carved-title text-3xl font-normal tracking-wider md:text-4xl">කළු කුමාර සහ සමයම් පුස්කොළය</h1>
        <div className="flex items-center justify-center gap-3 pt-1 text-[11px] tracking-[0.3em] text-[#C8963E]/75 uppercase">
          <span className="h-[1px] w-16 bg-gradient-to-r from-transparent via-[#3B4D7A] to-[#C8963E]/70" />
          <span className="italic font-light text-[#8A99AD]">The Samayam Puskola</span><span>෴</span>
          <span className="h-[1px] w-16 bg-gradient-to-l from-transparent via-[#3B4D7A] to-[#C8963E]/70" />
        </div>
      </div>

      {/* Self-Etching Ornate Sävulā Pahana & Nil Manel Blue Halo */}
      <div className="relative my-4 flex h-60 w-60 items-center justify-center">
        <svg viewBox="0 0 240 260" className="h-full w-full overflow-visible">
          <defs>
            <radialGradient id="nilManelHalo" cx="120" cy="96" r="98" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={isLit ? '#D49B27' : '#5B78B8'} stopOpacity={isLit ? '0.5' : '0.38'} />
              <stop offset="42%" stopColor="#3B4D7A" stopOpacity={isLit ? '0.32' : '0.22'} />
              <stop offset="75%" stopColor="#162038" stopOpacity="0.1" /><stop offset="100%" stopColor="#050608" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="brassSheen" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6E5223" /><stop offset="50%" stopColor="#E5B85B" /><stop offset="100%" stopColor="#5A421C" />
            </linearGradient>
          </defs>
          <circle cx="120" cy="96" r="98" fill="url(#nilManelHalo)" className="animate-blue-aura" />
          <circle cx="120" cy="128" r="88" fill="none" stroke="#3B4D7A" strokeWidth="0.7" strokeDasharray="2 6" className="animate-etch" /><circle cx="120" cy="128" r="76" fill="none" stroke="#C8963E" strokeWidth="0.6" strokeDasharray="6 4" strokeOpacity="0.45" className="animate-etch" />

          {/* Dual Indigo & Gold Smoke Tendrils */}
          {isLit && (
            <g fill="none" strokeLinecap="round">
              <path d="M 120,60 C 96,34 142,14 114,-14" stroke="#6883BA" strokeWidth="1.3" className="animate-smoke" />
              <path d="M 124,64 C 146,38 102,16 128,-10" stroke="#D49B27" strokeWidth="1.1" className="animate-smoke" style={{ animationDelay: '1.3s' }} />
            </g>
          )}

          {/* Multi-Layered Cobalt-Blue & Gold Pahana Flame */}
          {isLit ? (
            <g className="animate-flame">
              <path d="M 120,32 C 140,62 136,92 120,104 C 104,92 100,62 120,32 Z" fill="#3B4D7A" fillOpacity="0.75" />
              <path d="M 120,40 C 134,64 131,88 120,98 C 109,88 106,64 120,40 Z" fill="#D49B27" /><path d="M 120,56 C 127,72 125,86 120,94 C 115,86 113,72 120,56 Z" fill="#FFF7DE" />
              <path d="M 64,96 C 69,105 68,112 64,115 C 60,112 59,105 64,96 Z" fill="#6883BA" /><path d="M 176,96 C 181,105 180,112 176,115 C 172,112 171,105 176,96 Z" fill="#6883BA" />
            </g>
          ) : (
            <g className="animate-blue-aura">
              <path d="M 120,76 C 128,88 126,98 120,102 C 114,98 112,88 120,76 Z" fill="#3B4D7A" fillOpacity="0.65" /><circle cx="120" cy="98" r="3.5" fill="#7A9AD6" /><circle cx="120" cy="99" r="2" fill="#D49B27" />
            </g>
          )}

          {/* Intricate Sri Lankan Atapattama Brass Lamp Architecture */}
          <g className="animate-etch" stroke="url(#brassSheen)" fill="#12100E">
            <path d="M 116,102 L 120,86 L 124,102 Z" strokeWidth="1.1" /><path d="M 56,114 L 184,114 L 166,126 L 74,126 Z" strokeWidth="1.5" />
            <path d="M 68,126 C 92,138 148,138 172,126 L 154,138 L 86,138 Z" fill="#181410" strokeWidth="1.3" />
            <path d="M 62,116 L 62,128 L 58,135 L 62,141 L 66,135 L 62,128" fill="#C8963E" strokeWidth="0.8" /><path d="M 178,116 L 178,128 L 174,135 L 178,141 L 182,135 L 178,128" fill="#C8963E" strokeWidth="0.8" />
            <ellipse cx="120" cy="144" rx="22" ry="5" strokeWidth="1.2" /><path d="M 108,148 C 102,164 102,176 110,192 L 130,192 C 138,176 138,164 132,148 Z" strokeWidth="1.4" />
            <ellipse cx="120" cy="170" rx="18" ry="4.5" fill="#1D1711" strokeWidth="1.2" /><ellipse cx="120" cy="196" rx="24" ry="5.5" strokeWidth="1.2" /><path d="M 86,214 C 98,198 142,198 154,214 Z" strokeWidth="1.4" /><path d="M 70,226 C 88,212 152,212 170,226 L 176,232 L 64,232 Z" strokeWidth="1.6" />
          </g>
        </svg>
      </div>

      {/* Layered Typographic Narrative Below the Lamp */}
      <div className="min-h-36 max-w-[31rem] space-y-4">
        {phase === 'UNLIT' && (
          <div className="animate-folio space-y-4">
            <p className="text-[1.08rem] leading-relaxed font-light tracking-wide text-[#D6DFEC]/75 italic">&ldquo;The six o’clock transformer on High Level Road has ruptured in a flash of bruised indigo. Kindle the brass wick before the glass behind your bed remembers your name.&rdquo;</p>
            <div className="pt-1 text-[11px] tracking-[0.34em] text-[#8A99AD] uppercase">෴ පහන දල්වන්න · Touch the Blue Wick to Kindle ෴</div>
          </div>
        )}
        {(phase === 'IGNITING' || phase === 'OMEN' || phase === 'READY') && (
          <p className="animate-folio text-[1.08rem] leading-relaxed text-[#EAE3D2]/90">
            In Sri Lanka, the hinges of the clock—six at dusk and twelve at midnight—belong to the <em className="text-[#D49B27]">Samayam</em> watches. To linger alone in <em className="text-[#8A99AD]">Tanikama</em> during these hours is to leave your door unbolted to the unseen.
          </p>
        )}
        {(phase === 'OMEN' || phase === 'READY') && (
          <p className="animate-folio text-sm leading-relaxed tracking-wider text-[#7A9AD6] italic">&ldquo;When the lamp flame bends flat into bruised Nil Manel blue and the prose mutates before your eyes, press and hold the Cold Iron Seal below.&rdquo;</p>
        )}
        {phase === 'READY' && (
          <div className="animate-folio flex flex-wrap items-center justify-center gap-12 border-t border-[#3B4D7A]/35 pt-4 text-xs tracking-[0.26em] uppercase">
            <button type="button" onClick={onSurviveWatch} className="incised-trigger cursor-pointer py-1.5 text-[#D49B27]">❖ Cross Into the Dusk Watch</button>
            <button type="button" onClick={onOpenDocket} className="incised-trigger cursor-pointer py-1.5 text-[#8A99AD]">෴ Unbind the Four Folios</button>
          </div>
        )}
      </div>
    </div>
  );
};
