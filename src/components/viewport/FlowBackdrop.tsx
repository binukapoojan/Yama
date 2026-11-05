import React, { useEffect, useState } from 'react';
import { FlowLoopId } from '../../core/schema';
import { juiceDirector } from '../../juice/JuiceDirector';

const FLOW_LOOPS: FlowLoopId[] = [
  'bodima_rain_window',
  'pahana_steady',
  'pahana_nil_manel',
  'mirror_dark_idle',
  'kandy_mist_bamboo',
  'mohini_saree_silhouette',
  'kaduru_puddle_feet',
  'sanni_mask_torch',
];

export const FlowBackdrop: React.FC = () => {
  const [activeLoop, setActiveLoop] = useState<FlowLoopId>('bodima_rain_window');
  const [isProtected, setIsProtected] = useState<boolean>(false);
  const [vignetteIntensity, setVignetteIntensity] = useState<number>(0.55);

  useEffect(() => {
    const unsubFlow = juiceDirector.on('FLOW_CROSSFADE', ({ loopId, isProtectedOverride }) => {
      setActiveLoop(loopId);
      setIsProtected(isProtectedOverride);
    });

    const unsubVignette = juiceDirector.on('VIGNETTE_SHIFT', ({ intensity }) => {
      setVignetteIntensity(intensity);
    });

    return () => {
      unsubFlow();
      unsubVignette();
    };
  }, []);

  const radialStop = Math.round((1 - vignetteIntensity * 0.55) * 100);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#090807] select-none"
    >
      <div className="relative h-[48vh] w-full overflow-hidden">
        {FLOW_LOOPS.map((loopId) => {
          const isCurrent = activeLoop === loopId;
          return (
            <video
              key={loopId}
              src={`/flow-loops/${loopId}.webm`}
              autoPlay
              loop
              muted
              playsInline
              className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-1200 ease-in-out ${
                isCurrent ? 'opacity-85 scale-100' : 'opacity-0 scale-[1.02]'
              }`}
              style={{
                filter: isProtected
                  ? 'sepia(0.18) contrast(1.08) brightness(0.92)'
                  : 'contrast(1.15) brightness(0.78)',
                transitionProperty: 'opacity, transform, filter',
              }}
            />
          );
        })}

        <div
          className="absolute inset-0 transition-all duration-1000"
          style={{
            background: `
              radial-gradient(circle at 50% 38%, transparent 12%, rgba(9, 8, 7, ${vignetteIntensity}) ${radialStop}%, #090807 92%),
              linear-gradient(to bottom, rgba(9, 8, 7, 0.25) 0%, transparent 25%, rgba(9, 8, 7, 0.88) 78%, #090807 100%)
            `,
          }}
        />

        <div
          className="absolute inset-0 mix-blend-color transition-opacity duration-1000"
          style={{
            opacity: isProtected ? 0.22 : 0.14,
            backgroundColor: isProtected ? '#C8963E' : '#3B4D7A',
          }}
        />
      </div>
    </div>
  );
};
