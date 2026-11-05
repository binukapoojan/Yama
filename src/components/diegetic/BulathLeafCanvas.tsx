import React, { useRef, useState } from 'react';
import { BulathBlemish, BulathHurullaPayload } from '../../core/bulathCodec';
import { juiceDirector } from '../../juice/JuiceDirector';

interface BulathLeafCanvasProps {
  payload: BulathHurullaPayload;
  onInspectBlemish?: (blemish: BulathBlemish, discoveredIds: string[]) => void;
}

const LEAF_PATH =
  'M 200,36 C 218,88 338,145 338,265 C 338,358 265,412 200,382 C 135,412 62,358 62,265 C 62,145 182,88 200,36 Z';

export const BulathLeafCanvas: React.FC<BulathLeafCanvasProps> = ({ payload, onInspectBlemish }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [lamp, setLamp] = useState<{ x: number; y: number }>({ x: 200, y: 240 });
  const [discovered, setDiscovered] = useState<string[]>([]);

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clampedX = Math.max(40, Math.min(360, ((e.clientX - rect.left) / rect.width) * 400));
    const clampedY = Math.max(30, Math.min(450, ((e.clientY - rect.top) / rect.height) * 480));
    setLamp({ x: clampedX, y: clampedY });

    for (const b of payload.blemishes) {
      if (Math.hypot(clampedX - b.x * 400, clampedY - b.y * 480) < 34) {
        if (!discovered.includes(b.id)) {
          const next = [...discovered, b.id];
          setDiscovered(next);
          juiceDirector.triggerHaptic('iron_grip');
          onInspectBlemish?.(b, next);
        }
      }
    }
  };

  return (
    <div className="relative mx-auto flex w-full max-w-[26rem] items-center justify-center select-none">
      <svg
        ref={svgRef}
        viewBox="0 0 400 480"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          handlePointerMove(e);
        }}
        onPointerMove={handlePointerMove}
        className="h-auto w-full touch-none cursor-crosshair"
      >
        <defs>
          <radialGradient id="pahanaBacklight" cx={lamp.x} cy={lamp.y} r="105" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
            <stop offset="45%" stopColor="#D49B27" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
          <mask id="subsurfaceMask">
            <rect width="400" height="480" fill="url(#pahanaBacklight)" />
          </mask>
        </defs>

        <circle cx={lamp.x} cy={lamp.y} r="115" fill="url(#pahanaBacklight)" opacity="0.28" />
        <path d={LEAF_PATH} fill="#0E130D" stroke="#1C2419" strokeWidth="1.5" />
        <path d="M 200,382 Q 202,430 218,458" fill="none" stroke="#1C2419" strokeWidth="5" strokeLinecap="round" />

        <g mask="url(#subsurfaceMask)">
          <path d={LEAF_PATH} fill="#4A3F19" />
          <path d="M 200,40 L 200,382" stroke="#D49B27" strokeWidth="2.2" strokeOpacity="0.85" />
          {Array.from({ length: payload.veinCountLeft }).map((_, i) => {
            const y0 = 120 + i * 52;
            return <path key={`vl_${i}`} d={`M 200,${y0} Q 130,${y0 - 18} 82,${y0 - 48}`} fill="none" stroke="#C8963E" strokeWidth="1.3" strokeOpacity="0.75" />;
          })}
          {Array.from({ length: payload.veinCountRight }).map((_, i) => {
            const y0 = 132 + i * 52;
            return <path key={`vr_${i}`} d={`M 200,${y0} Q 270,${y0 - 18} 318,${y0 - 48}`} fill="none" stroke="#C8963E" strokeWidth="1.3" strokeOpacity="0.75" />;
          })}

          {payload.blemishes.map((b) => {
            const cx = b.x * 400, cy = b.y * 480;
            return (
              <g key={b.id}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={b.type === 'PINHOLE_TEAR' ? 6 : 16}
                  fill={b.type === 'PINHOLE_TEAR' ? '#090807' : b.type === 'OILY_SHEEN' ? '#3B4D7A' : '#5E1217'}
                  opacity="0.9"
                />
                <circle cx={cx} cy={cy} r="22" fill="none" stroke="#8C1D24" strokeWidth="0.8" strokeDasharray="3 3" />
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};
