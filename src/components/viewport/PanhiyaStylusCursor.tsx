// src/components/viewport/PanhiyaStylusCursor.tsx
import React, { useEffect, useRef, useState } from 'react';
import { initGlobalPanhiyaListener } from '../../juice/panhiyaFeedback';
import { wardFatigue, WardFatigueSnapshot } from '../../juice/wardFatigue';

const INTERACTIVE_SELECTOR = 'button, a, input, [role="button"], .incised-trigger, .cursor-pointer';

export const PanhiyaStylusCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hovering, setHovering] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);
  const [trail, setTrail] = useState<Array<{ x: number; y: number }>>([]);
  const [fatigue, setFatigue] = useState<WardFatigueSnapshot>(() => wardFatigue.getSnapshot());

  useEffect(() => wardFatigue.subscribe(setFatigue), []);

  useEffect(() => {
    const unsubGlobal = initGlobalPanhiyaListener();
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      if (cursorRef.current) cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      const target = e.target instanceof Element ? e.target : null;
      const isInteractive = Boolean(target?.closest(INTERACTIVE_SELECTOR));
      setHovering((prev) => (prev !== isInteractive ? isInteractive : prev));
      if (e.buttons === 1) setTrail((prev) => [...prev.slice(-6), { x: e.clientX, y: e.clientY }]);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      setPressed(true);
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
      setTrail([{ x: e.clientX, y: e.clientY }]);
    };
    const onPointerUp = () => {
      setPressed(false);
      clearTimerRef.current = setTimeout(() => setTrail([]), 220);
    };

    const onScroll = () => {
      const doc = document.documentElement;
      const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
      setScrollPct(Math.max(0, Math.min(100, (window.scrollY / maxScroll) * 100)));
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      unsubGlobal();
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const { heat, scalded, holding } = fatigue;
  const nibColor = scalded ? '#8C1D24' : heat >= 70 ? '#FF7A29' : holding || hovering ? '#D49B27' : '#8A99AD';
  const tiltDeg = pressed ? -2 : hovering ? -8 : -22;
  const scale = pressed ? 0.92 : hovering ? 1.08 : 1;

  return (
    <>
      {trail.length > 1 && (
        <svg aria-hidden="true" className="pointer-events-none fixed inset-0 z-[95] hidden h-full w-full [@media(pointer:fine)]:block">
          <polyline points={trail.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke={nibColor} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
        </svg>
      )}
      <div aria-hidden="true" className="pointer-events-none fixed inset-y-16 right-2.5 z-40 hidden w-3 flex-col items-center md:flex">
        <div className="h-2 w-2 rounded-full border border-[#C8963E]/60 bg-[#050608]" />
        <div className="relative h-full w-[1.5px] bg-gradient-to-b from-[#C8963E]/35 via-[#8C1D24]/45 to-[#C8963E]/35">
          <div style={{ top: `${scrollPct}%` }} className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-150">
            <svg viewBox="0 0 16 28" className="h-6 w-3.5 overflow-visible">
              <polygon points="8,1 14,14 8,27 2,14" fill="#16110C" stroke={holding ? '#D49B27' : '#C8963E'} strokeWidth="1.4" />
              <circle cx="8" cy="14" r="2.2" fill={nibColor} />
            </svg>
          </div>
        </div>
        <div className="h-2 w-2 rounded-full border border-[#C8963E]/60 bg-[#050608]" />
      </div>

      <div
        ref={cursorRef} data-testid="panhiya-cursor" data-hovering={hovering ? 'true' : 'false'} aria-hidden="true"
        style={{ transform: 'translate3d(-100px, -100px, 0)' }}
        className="pointer-events-none fixed top-0 left-0 z-[100] hidden will-change-transform [@media(pointer:fine)]:block"
      >
        <svg
          viewBox="0 0 64 64"
          style={{
            transform: `rotate(${tiltDeg}deg) scale(${scale})`, transformOrigin: '4px 4px',
            filter: `drop-shadow(0 4px 8px rgba(0,0,0,0.95)) drop-shadow(0 0 ${hovering || holding ? '10px' : '4px'} ${nibColor})`,
          }}
          className="h-12 w-12 overflow-visible transition-transform duration-150 ease-out"
        >
          {(hovering || holding || pressed) && (
            <g transform="translate(4, 4)">
              <circle cx="0" cy="0" r={pressed ? '9' : '6.5'} fill="none" stroke={nibColor} strokeWidth="1" strokeDasharray="3 2" />
              <circle cx="0" cy="0" r="2" fill="#FFF3D1" />
            </g>
          )}
          <path d="M 4,4 L 16,12 L 12,16 Z" fill={nibColor} />
          <line x1="14" y1="14" x2="46" y2="46" stroke="#18130E" strokeWidth="5.5" strokeLinecap="round" />
          <line x1="14" y1="14" x2="46" y2="46" stroke="#C8963E" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="22" cy="22" r="3.2" fill="#16110C" stroke="#D49B27" strokeWidth="1.3" />
          <circle cx="34" cy="34" r="4" fill="#8C1D24" stroke="#D49B27" strokeWidth="1.3" />
          <path d="M 44,44 C 52,42 58,48 56,56 C 48,58 42,52 44,44 Z" fill="#16110C" stroke="#D49B27" strokeWidth="1.5" />
        </svg>
      </div>
    </>
  );
};
