import React, { useEffect, useState } from 'react';
import { juiceDirector } from '../../juice/JuiceDirector';

export const IronKeyAnchor: React.FC = () => {
  const [held, setHeld] = useState<boolean>(() => juiceDirector.isAnchorHeld());

  useEffect(() => {
    const unsub = juiceDirector.on('ANCHOR_STATE_CHANGE', ({ held: nextHeld }) => setHeld(nextHeld));

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        juiceDirector.setAnchorHeld(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        juiceDirector.setAnchorHeld(false);
      }
    };
    const handleWindowBlur = () => juiceDirector.setAnchorHeld(false);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      unsub();
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, []);

  return (
    <div className="fixed inset-x-0 bottom-6 z-20 flex justify-center pointer-events-none">
      <button
        type="button"
        aria-label="Hold Iron Talisman Ward"
        aria-pressed={held}
        onContextMenu={(e) => e.preventDefault()}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          juiceDirector.setAnchorHeld(true);
        }}
        onPointerUp={() => juiceDirector.setAnchorHeld(false)}
        onPointerCancel={() => juiceDirector.setAnchorHeld(false)}
        onLostPointerCapture={() => juiceDirector.setAnchorHeld(false)}
        className={`pointer-events-auto relative flex h-16 w-16 touch-none select-none items-center justify-center rounded-full transition-all duration-300 ease-out focus:outline-none ${
          held ? 'scale-95' : 'scale-100 hover:scale-[1.02]'
        }`}
        style={{
          background: held
            ? 'radial-gradient(circle, rgba(212, 155, 39, 0.22) 0%, rgba(16, 13, 10, 0.95) 68%, #090807 100%)'
            : 'radial-gradient(circle, rgba(28, 24, 19, 0.65) 0%, rgba(9, 8, 7, 0.96) 75%)',
          boxShadow: held
            ? 'inset 0 2px 8px rgba(0,0,0,0.9), 0 0 28px rgba(212, 155, 39, 0.28)'
            : 'inset 0 3px 10px rgba(0,0,0,0.95), 0 1px 0 rgba(200, 150, 62, 0.12)',
        }}
      >
        <svg
          viewBox="0 0 64 64"
          className={`h-14 w-14 transition-transform duration-1000 ease-out ${held ? 'rotate-45' : 'rotate-0'}`}
        >
          <circle cx="32" cy="32" r="28" fill="none" stroke="#C8963E" strokeWidth="0.75" strokeOpacity={held ? '0.85' : '0.28'} />
          <circle cx="32" cy="32" r="22" fill="none" stroke="#C8963E" strokeWidth="0.6" strokeDasharray="2 3" strokeOpacity={held ? '0.9' : '0.22'} />
          <polygon points="32,12 49,42 15,42" fill="none" stroke="#C8963E" strokeWidth="0.7" strokeOpacity={held ? '0.75' : '0.18'} />
          <polygon points="32,52 49,22 15,22" fill="none" stroke="#C8963E" strokeWidth="0.7" strokeOpacity={held ? '0.75' : '0.18'} />
          <circle cx="32" cy="32" r="3.5" fill={held ? '#D49B27' : 'none'} stroke="#C8963E" strokeWidth="0.9" strokeOpacity={held ? '1' : '0.35'} />
        </svg>
      </button>
    </div>
  );
};
