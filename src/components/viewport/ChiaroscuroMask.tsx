import React, { useEffect } from 'react';
import { lampChiaroscuro } from '../../juice/lampChiaroscuro';

export const ChiaroscuroMask: React.FC = () => {
  useEffect(() => {
    lampChiaroscuro.start();
    return () => lampChiaroscuro.stop();
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30 select-none transition-opacity duration-700"
      style={{
        background: `
          radial-gradient(
            circle var(--lamp-radius, 40vmax) at var(--lamp-x, 50%) var(--lamp-y, 42%),
            var(--lamp-core-color, rgba(200, 150, 62, 0.09)) 0%,
            rgba(9, 8, 7, 0.35) 48%,
            rgba(9, 8, 7, var(--lamp-darkness, 0.65)) 82%,
            rgba(9, 8, 7, 0.96) 100%
          )
        `,
      }}
    />
  );
};
