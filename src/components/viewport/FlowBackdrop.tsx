// src/components/viewport/FlowBackdrop.tsx
import React, { useEffect, useRef, useState } from 'react';
import { FlowLoopId } from '../../core/schema';
import { juiceDirector } from '../../juice/JuiceDirector';

const FLOW_LOOPS: ReadonlyArray<FlowLoopId> = [
  'bodima_rain_window', 'pahana_steady', 'pahana_nil_manel', 'mirror_dark_idle',
  'kandy_mist_bamboo', 'mohini_saree_silhouette', 'kaduru_puddle_feet', 'sanni_mask_torch',
  'matara_hearth_smoke', 'wadamal_blood_hedge', 'iron_sickle_ember', 'peduru_funeral_mat',
  'thummansala_banyan_wind', 'sohon_boar_silhouette', 'iron_betel_cutter_ash', 'dummala_vidiya_cards',
];

const RIRI_LOOPS = new Set<FlowLoopId>(['matara_hearth_smoke', 'wadamal_blood_hedge', 'iron_sickle_ember', 'peduru_funeral_mat']);
const MAHASONA_LOOPS = new Set<FlowLoopId>(['thummansala_banyan_wind', 'sohon_boar_silhouette', 'iron_betel_cutter_ash', 'dummala_vidiya_cards']);

export const FlowBackdrop: React.FC = () => {
  const [activeLoop, setActiveLoop] = useState<FlowLoopId>('bodima_rain_window');
  const [isProtected, setIsProtected] = useState<boolean>(false);
  const [vignetteIntensity, setVignetteIntensity] = useState<number>(0.55);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

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

  // Performance: only decode and play active loop (and outgoing during 1.2s crossfade).
  // Pauses all other 15 background videos to prevent hardware decoder saturation.
  useEffect(() => {
    const activeEl = videoRefs.current[activeLoop];
    if (activeEl) {
      activeEl.play().catch(() => {});
    }

    const timer = setTimeout(() => {
      Object.entries(videoRefs.current).forEach(([id, el]) => {
        if (el && id !== activeLoop) {
          el.pause();
        }
      });
    }, 1250);

    return () => clearTimeout(timer);
  }, [activeLoop]);

  const radialStop = Math.round((1 - vignetteIntensity * 0.55) * 100);
  const isRiri = RIRI_LOOPS.has(activeLoop);
  const isMahasona = MAHASONA_LOOPS.has(activeLoop);
  const tintColor = isProtected ? '#C8963E' : isRiri ? '#8C1D24' : isMahasona ? '#6E5A3B' : '#3B4D7A';

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#090807] select-none">
      <div className="relative h-[48vh] w-full overflow-hidden">
        {FLOW_LOOPS.map((loopId) => {
          const isCurrent = activeLoop === loopId;
          return (
            <video
              key={loopId}
              ref={(el) => { videoRefs.current[loopId] = el; }}
              autoPlay={isCurrent}
              loop
              muted
              playsInline
              preload={isCurrent ? 'auto' : 'none'}
              className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-1200 ease-in-out ${
                isCurrent ? 'opacity-85 scale-100' : 'opacity-0 scale-[1.02]'
              }`}
              style={{
                filter: isProtected ? 'sepia(0.18) contrast(1.08) brightness(0.92)' : 'contrast(1.15) brightness(0.78)',
                transitionProperty: 'opacity, transform, filter',
              }}
            >
              <source src={`/flow-loops/${loopId}.mp4`} type="video/mp4" />
              <source src={`/flow-loops/${loopId}.webm`} type="video/webm" />
            </video>
          );
        })}
        <div
          className="absolute inset-0 transition-all duration-1000"
          style={{
            background: `radial-gradient(circle at 50% 38%, transparent 12%, rgba(9, 8, 7, ${vignetteIntensity}) ${radialStop}%, #090807 92%), linear-gradient(to bottom, rgba(9, 8, 7, 0.25) 0%, transparent 25%, rgba(9, 8, 7, 0.88) 78%, #090807 100%)`,
          }}
        />
        <div
          className="absolute inset-0 mix-blend-color transition-all duration-1000"
          style={{ opacity: isProtected ? 0.22 : isRiri ? 0.20 : 0.16, backgroundColor: tintColor }}
        />
      </div>
    </div>
  );
};
