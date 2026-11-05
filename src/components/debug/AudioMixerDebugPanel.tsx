import React, { useEffect, useRef, useState } from 'react';
import { audioMixer, StemCueId } from '../../juice/audioMixer';
import { juiceDirector } from '../../juice/JuiceDirector';

const STEMS: ReadonlyArray<{ id: StemCueId; label: string }> = [
  { id: 'monsoon_light', label: 'Light Rain' },
  { id: 'monsoon_heavy', label: 'Heavy Rain' },
  { id: 'ceb_power_cut', label: '50Hz Cut' },
  { id: 'kandy_night_cicadas', label: 'Cicadas' },
  { id: 'yak_bera_ritual', label: 'Yak Bera' },
];

export const AudioMixerDebugPanel: React.FC = () => {
  const [visible, setVisible] = useState<boolean>(true);
  const [activeStem, setActiveStem] = useState<StemCueId>('monsoon_light');
  const [cutoffHz, setCutoffHz] = useState<number>(18000);
  const [resonanceQ, setResonanceQ] = useState<number>(1.8);
  const [muffled, setMuffled] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.code === 'Backquote') setVisible((v) => !v); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!visible) return;
    let raf = 0;
    const data = new Uint8Array(128);
    const draw = () => {
      const cvs = canvasRef.current, analyser = audioMixer.getAnalyser();
      if (cvs && analyser) {
        const ctx = cvs.getContext('2d');
        if (ctx) {
          analyser.getByteFrequencyData(data);
          ctx.fillStyle = '#090807';
          ctx.fillRect(0, 0, cvs.width, cvs.height);
          const barW = cvs.width / 64;
          for (let i = 0; i < 64; i++) {
            const val = data[i] / 255;
            ctx.fillStyle = i < 8 ? '#8C1D24' : muffled ? '#3B4D7A' : '#C8963E';
            ctx.fillRect(i * barW, cvs.height - val * cvs.height, barW - 1, val * cvs.height);
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [visible, muffled]);

  if (!visible) return null;

  return (
    <aside className="fixed top-4 left-4 z-50 w-80 border border-[#C8963E]/40 bg-[#0D0B0A]/95 p-4 font-mono text-xs text-[#EAE3D2] shadow-2xl backdrop-blur-md">
      <div className="mb-3 flex items-center justify-between border-b border-[#C8963E]/20 pb-2">
        <span className="tracking-wider text-[#C8963E] uppercase">WebAudio DSP Workbench</span>
        <span className="text-[10px] text-[#EAE3D2]/40">[~] Hide</span>
      </div>
      <canvas ref={canvasRef} width={288} height={64} className="mb-3 w-full border border-[#1C1813] bg-[#090807]" />
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-1.5">
          {STEMS.map((s) => (
            <button key={s.id} type="button" onClick={() => { setActiveStem(s.id); audioMixer.previewCue(s.id); }}
              className={`cursor-pointer border px-1 py-1 text-[10px] transition-colors ${
                activeStem === s.id ? 'border-[#C8963E] bg-[#C8963E]/20' : 'border-[#1C1813] bg-[#120F0C] opacity-60'
              }`}>{s.label}</button>
          ))}
        </div>
        <div>
          <div className="flex justify-between text-[11px]"><span>Low-Pass Cutoff</span><span className="text-[#C8963E]">{cutoffHz} Hz</span></div>
          <input type="range" min={120} max={18000} step={20} value={cutoffHz} onChange={(e) => {
            const hz = Number(e.target.value); setCutoffHz(hz); audioMixer.setFilterParams(hz, resonanceQ);
          }} className="mt-1 w-full accent-[#C8963E]" />
        </div>
        <div>
          <div className="flex justify-between text-[11px]"><span>Filter Resonance (Q)</span><span className="text-[#C8963E]">{resonanceQ.toFixed(1)}</span></div>
          <input type="range" min={0.5} max={8.0} step={0.1} value={resonanceQ} onChange={(e) => {
            const q = Number(e.target.value); setResonanceQ(q); audioMixer.setFilterParams(cutoffHz, q);
          }} className="mt-1 w-full accent-[#C8963E]" />
        </div>
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          <button type="button" onClick={() => {
            const next = !muffled; setMuffled(next); setCutoffHz(next ? 320 : 18000); audioMixer.setDreamMuffle(next);
          }} className="cursor-pointer border border-[#3B4D7A] bg-[#3B4D7A]/20 py-1.5 text-[10px]">
            {muffled ? 'Unmuffle' : 'Dream (320Hz)'}
          </button>
          <button type="button" onClick={() => audioMixer.playYakBeraPulse(0.95)} className="cursor-pointer border border-[#8C1D24] bg-[#8C1D24]/20 py-1.5 text-[10px]">Yak Bera</button>
          <button type="button" onClick={() => {
            juiceDirector.setAnchorHeld(true); setMuffled(false); setCutoffHz(18000);
            setTimeout(() => juiceDirector.setAnchorHeld(false), 600);
          }} className="cursor-pointer border border-[#D49B27] bg-[#D49B27]/20 py-1.5 text-[10px]">Iron Key</button>
        </div>
      </div>
    </aside>
  );
};
