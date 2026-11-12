// src/components/viewport/DummalaShaderFilter.tsx
import React, { useEffect, useState } from 'react';
import { juiceDirector } from '../../juice/JuiceDirector';

interface DummalaShaderFilterProps {
  balma: number;
}

export const DummalaShaderFilter: React.FC<DummalaShaderFilterProps> = ({ balma }) => {
  const [anchorHeld, setAnchorHeld] = useState<boolean>(() => juiceDirector.isAnchorHeld());
  const [phase, setPhase] = useState<number>(0);

  useEffect(() => {
    return juiceDirector.on('ANCHOR_STATE_CHANGE', ({ held }) => setAnchorHeld(held));
  }, []);

  const activeWarp = !anchorHeld && balma >= 50;

  useEffect(() => {
    if (!activeWarp) return;
    const timer = setInterval(() => { setPhase((p) => (p + 1) % 100); }, 140);
    return () => clearInterval(timer);
  }, [activeWarp]);

  const displacementScale = activeWarp ? Number((((balma - 45) / 55) * 9.5).toFixed(2)) : 0;
  const freqX = (0.012 + Math.sin(phase * 0.15) * 0.003).toFixed(4);
  const freqY = (0.028 + Math.cos(phase * 0.12) * 0.005).toFixed(4);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.style.setProperty(
      '--dummala-filter',
      activeWarp ? 'url(#dummala-heat-haze)' : 'none'
    );
  }, [activeWarp]);

  return (
    <svg aria-hidden="true" className="pointer-events-none fixed inset-0 h-0 w-0 opacity-0">
      <defs>
        <filter id="dummala-heat-haze" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency={`${freqX} ${freqY}`}
            numOctaves={2}
            seed={14}
            result="dummalaNoise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="dummalaNoise"
            scale={displacementScale}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
};
