// src/components/diegetic/IronKeyAnchor.tsx
import React, { useEffect, useState } from 'react';
import { audioMixer } from '../../juice/audioMixer';
import { juiceDirector } from '../../juice/JuiceDirector';
import { wardFatigue, WardFatigueSnapshot } from '../../juice/wardFatigue';

export const IronKeyAnchor: React.FC = () => {
  const [snap, setSnap] = useState<WardFatigueSnapshot>(() => wardFatigue.getSnapshot());

  useEffect(() => {
    const unsubFatigue = wardFatigue.subscribe(setSnap);
    const unsubJuice = juiceDirector.on('ANCHOR_STATE_CHANGE', ({ held }) => {
      if (!held && wardFatigue.getSnapshot().holding) wardFatigue.releaseHold();
    });
    return () => { unsubFatigue(); unsubJuice(); };
  }, []);

  useEffect(() => {
    const isTyping = (el: EventTarget | null) => el instanceof HTMLElement && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA');
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && !isTyping(e.target)) {
        e.preventDefault(); audioMixer.unlock(); wardFatigue.requestHold();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isTyping(e.target)) {
        e.preventDefault(); wardFatigue.releaseHold();
      }
    };
    window.addEventListener('keydown', handleKeyDown); window.addEventListener('keyup', handleKeyUp);
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
  }, []);

  const { heat, scalded, holding } = snap;
  const isCritical = heat >= 72 && !scalded;

  const ironStroke = scalded ? '#6E3538' : heat >= 75 ? '#FF7A29' : heat >= 40 ? '#B82932' : holding ? '#D49B27' : '#8A99AD';
  const glowFilter = scalded ? 'drop-shadow(0 0 10px rgba(140, 29, 36, 0.75))' : heat >= 70 ? 'drop-shadow(0 0 18px rgba(255, 106, 36, 0.9))' : heat >= 35 ? 'drop-shadow(0 0 14px rgba(184, 41, 50, 0.75))' : holding ? 'drop-shadow(0 0 14px rgba(212, 155, 39, 0.65))' : 'none';

  return (
    <div className="fixed inset-x-0 bottom-5 z-40 flex flex-col items-center justify-center pointer-events-none select-none font-serif">
      <button
        type="button" disabled={scalded} aria-pressed={holding} aria-label="Hold Cold Iron Ward"
        onPointerDown={(e) => { e.currentTarget.setPointerCapture?.(e.pointerId); audioMixer.unlock(); wardFatigue.requestHold(); }}
        onPointerUp={() => wardFatigue.releaseHold()} onPointerCancel={() => wardFatigue.releaseHold()}
        style={{ filter: glowFilter }}
        className={`pointer-events-auto group flex flex-col items-center gap-1.5 px-6 py-2 transition-transform duration-100 focus:outline-none ${
          scalded ? 'cursor-not-allowed opacity-70' : isCritical ? 'cursor-pointer translate-x-0.5 scale-105' : holding ? 'cursor-pointer scale-105' : 'cursor-pointer opacity-80 hover:opacity-100'
        }`}
      >
        <svg viewBox="0 0 180 44" className="h-9 w-40 overflow-visible">
          {(heat >= 55 || scalded) && (
            <g fill="none" stroke={scalded ? '#8A99AD' : '#FF7A29'} strokeWidth="1" strokeOpacity="0.65">
              <path d="M 65,12 C 60,4 70,-2 64,-10" className="animate-smoke" />
              <path d="M 115,12 C 120,4 110,-2 116,-10" className="animate-smoke" style={{ animationDelay: '0.9s' }} />
            </g>
          )}
          <circle cx="34" cy="22" r="14" fill="#0B0908" stroke={ironStroke} strokeWidth="2.2" />
          <circle cx="34" cy="22" r="6" fill="none" stroke={ironStroke} strokeWidth="1.2" strokeDasharray="3 2" />
          <path d="M 48,15 L 54,29 M 52,15 L 48,29" stroke="#D49B27" strokeWidth="1.6" />
          <line x1="48" y1="22" x2="152" y2="22" stroke={ironStroke} strokeWidth="3.2" strokeLinecap="round" />
          <path d="M 128,22 L 128,35 L 136,35 L 136,27 L 144,27 L 144,37 L 152,37 L 152,22" fill="none" stroke={ironStroke} strokeWidth="2.4" />
        </svg>
        <span className={`text-[11px] tracking-[0.24em] uppercase transition-colors duration-300 ${
          scalded ? 'text-[#B82932] italic' : isCritical ? 'text-[#FF7A29]' : holding ? 'text-[#D49B27]' : 'text-[#8A99AD]/75 group-hover:text-[#D49B27]'
        }`}>
          {scalded ? 'යකඩ ගිනි · Palm Scalded — Let the Iron Cool' : isCritical ? '❖ Iron Blistering — Release Soon ❖' : holding ? '❖ යකඩ ආරක්ෂාව · Cold Iron Anchored ❖' : 'යකඩ ආරක්ෂාව · Hold Cold Iron Seal'}
        </span>
      </button>
    </div>
  );
};
