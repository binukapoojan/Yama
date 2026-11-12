// src/components/diegetic/LivingPuskolaSurface.tsx
import React, { useEffect, useState } from 'react';

interface LivingPuskolaSurfaceProps {
  children: React.ReactNode;
  pageKey: string;
  balma?: number;
}

export const LivingPuskolaSurface: React.FC<LivingPuskolaSurfaceProps> = ({
  children,
  pageKey,
  balma = 20,
}) => {
  const [lightPos, setLightPos] = useState({ x: 50, y: 38 });
  const [mitePos, setMitePos] = useState({ x: 78, y: 24, fleeing: false });
  const [shadowPass, setShadowPass] = useState(false);
  const [leafFlip, setLeafFlip] = useState(false);

  useEffect(() => {
    setLeafFlip(true);
    const t = setTimeout(() => setLeafFlip(false), 220);
    return () => clearTimeout(t);
  }, [pageKey]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < (balma > 50 ? 0.65 : 0.35)) {
        setShadowPass(true);
        setTimeout(() => setShadowPass(false), 1100);
      }
    }, 9500);
    return () => clearInterval(interval);
  }, [balma]);

  useEffect(() => {
    const timer = setInterval(() => {
      setMitePos((prev) => {
        if (prev.fleeing) return { x: 14, y: 50, fleeing: false };
        return {
          x: Math.max(18, Math.min(88, prev.x + (Math.random() - 0.52) * 3.5)),
          y: Math.max(15, Math.min(85, prev.y + (Math.random() - 0.5) * 2.5)),
          fleeing: false,
        };
      });
    }, 450);
    return () => clearInterval(timer);
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * 100;
    const py = ((e.clientY - rect.top) / rect.height) * 100;
    setLightPos({ x: px, y: py });

    const dist = Math.hypot(px - mitePos.x, py - mitePos.y);
    if (dist < 18 && !mitePos.fleeing) {
      setMitePos({ x: 12, y: 50, fleeing: true });
    }
  };

  return (
    <div
      onPointerMove={handlePointerMove}
      className={`relative w-full max-w-[44rem] border-y border-[#C8963E]/45 bg-[#0E0B08] px-7 py-8 shadow-[0_35px_110px_rgba(0,0,0,0.99)] transition-all duration-300 md:px-12 ${
        leafFlip ? 'scale-y-95 opacity-80' : 'scale-y-100 opacity-100'
      }`}
      style={{
        backgroundImage: `
          radial-gradient(circle at ${lightPos.x}% ${lightPos.y}%, rgba(212,155,39,0.13) 0%, rgba(59,77,122,0.06) 38%, rgba(6,5,4,0.96) 78%),
          repeating-linear-gradient(0deg, rgba(200,150,62,0.028) 0px, rgba(200,150,62,0.028) 1px, transparent 1px, transparent 4px)
        `,
      }}
    >
      <div
        className={`pointer-events-none absolute inset-0 z-30 bg-gradient-to-r from-transparent via-[#020203]/85 to-transparent transition-transform duration-1000 ease-in-out ${
          shadowPass ? 'translate-x-full' : '-translate-x-full'
        }`}
      />

      <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
        <div className="h-4 w-4 rounded-full border border-[#C8963E]/55 bg-[#050404] shadow-inner" />
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
        <div className="h-4 w-4 rounded-full border border-[#C8963E]/55 bg-[#050404] shadow-inner" />
      </div>

      <span
        style={{ left: `${mitePos.x}%`, top: `${mitePos.y}%` }}
        className={`pointer-events-none absolute z-20 h-1 w-1.5 rounded-full bg-[#1F1610] shadow-[0_0_2px_#000] transition-all ${
          mitePos.fleeing ? 'duration-200 opacity-0' : 'duration-500 opacity-75'
        }`}
      />

      <div className="relative z-10">{children}</div>
    </div>
  );
};
