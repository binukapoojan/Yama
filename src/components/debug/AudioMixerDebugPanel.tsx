// src/components/debug/AudioMixerDebugPanel.tsx
import React, { useEffect, useRef, useState } from 'react';
import { AudioCueId, audioMixer } from '../../juice/audioMixer';

const CUES: ReadonlyArray<{ id: AudioCueId; label: string }> = [
  { id: 'monsoon_light', label: 'CF01 · Monsoon Light' },
  { id: 'monsoon_heavy', label: 'CF01/02 · Monsoon Heavy' },
  { id: 'ceb_power_cut', label: 'All · CEB Power Cut (54Hz)' },
  { id: 'yak_bera_ritual', label: 'All · Yak Bera Ritual' },
  { id: 'hearth_crackle', label: 'CF03 · Matara Hearth Crackle' },
  { id: 'arterial_pulse', label: 'CF03 · Riri Arterial Fever' },
];

export const AudioMixerDebugPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeCue, setActiveCue] = useState<AudioCueId>('monsoon_light');
  const [balma, setBalma] = useState<number>(20);
  const [cutoffHz, setCutoffHz] = useState<number>(12000);
  const [wardHeld, setWardHeld] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Backquote') {
        e.preventDefault(); audioMixer.unlock(); setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    let rafId = 0;
    const freqData = new Uint8Array(128);
    const renderFFT = () => {
      const canvas = canvasRef.current, analyser = audioMixer.getAnalyser();
      if (canvas && analyser) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          analyser.getByteFrequencyData(freqData);
          ctx.fillStyle = '#090807';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          const barW = canvas.width / 64;
          for (let i = 0; i < 64; i++) {
            const val = freqData[i] / 255, h = val * canvas.height;
            ctx.fillStyle = i < 9 ? '#8C1D24' : i < 32 ? '#C8963E' : '#D49B27';
            ctx.fillRect(i * barW, canvas.height - h, barW - 1, h);
          }
        }
      }
      rafId = requestAnimationFrame(renderFFT);
    };
    rafId = requestAnimationFrame(renderFFT);
    return () => cancelAnimationFrame(rafId);
  }, [isOpen]);

  if (!isOpen) return null;

  const triggerCue = (cue: AudioCueId, nextBalma = balma) => {
    audioMixer.unlock(); setActiveCue(cue); audioMixer.setCue(cue, nextBalma);
  };

  return (
    <aside className="fixed bottom-4 left-4 z-50 w-88 border border-[#C8963E]/45 bg-[#0D0B0A]/95 p-4 font-serif text-xs text-[#EAE3D2] shadow-2xl select-none">
      <div className="mb-2.5 flex items-center justify-between border-b border-[#C8963E]/20 pb-1.5">
        <span className="tracking-[0.18em] text-[#D49B27] uppercase">DSP Acoustic Workbench [~]</span>
        <button type="button" onClick={() => setIsOpen(false)} className="cursor-pointer text-[#EAE3D2]/50 hover:text-[#EAE3D2]">[Close]</button>
      </div>

      <canvas ref={canvasRef} width={320} height={68} className="mb-3 w-full border border-[#C8963E]/25 bg-[#090807]" />

      {/* 6 Procedural Stem Presets */}
      <div className="mb-3 grid grid-cols-2 gap-1.5">
        {CUES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => triggerCue(c.id)}
            className={`cursor-pointer border px-2 py-1 text-left text-[11px] transition-colors ${
              activeCue === c.id ? 'border-[#D49B27] bg-[#C8963E]/20 text-[#D49B27]' : 'border-[#C8963E]/20 text-[#EAE3D2]/70 hover:border-[#C8963E]/50'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Balma Dread & Master Low-Pass Sliders */}
      <div className="mb-3 space-y-2 border-y border-[#C8963E]/15 py-2.5">
        <label className="flex items-center justify-between text-[11px]">
          <span>Balma Dread ({balma}% · {balma >= 60 ? 'Arterial Loop ON' : 'Idle'})</span>
          <input type="range" min={0} max={100} value={balma} onChange={(e) => { const v = Number(e.target.value); setBalma(v); triggerCue(activeCue, v); }} className="w-28 accent-[#8C1D24]" />
        </label>
        <label className="flex items-center justify-between text-[11px]">
          <span>LPF Cutoff ({cutoffHz} Hz)</span>
          <input type="range" min={240} max={16000} step={80} value={cutoffHz} onChange={(e) => { const hz = Number(e.target.value); setCutoffHz(hz); audioMixer.setMasterFilterFreq(hz); }} className="w-28 accent-[#C8963E]" />
        </label>
      </div>

      {/* One-Shot Transient & Cold-Iron Ward Triggers */}
      <div className="grid grid-cols-3 gap-1.5 text-[10px] tracking-wider uppercase">
        <button type="button" onClick={() => { audioMixer.unlock(); audioMixer.playYakBeraPulse(0.95); }} className="cursor-pointer border border-[#C8963E]/35 py-1.5 text-[#C8963E] hover:bg-[#C8963E]/15">Yak Bera</button>
        <button type="button" onClick={() => { audioMixer.unlock(); audioMixer.playArterialPulse(0.95); }} className="cursor-pointer border border-[#8C1D24]/60 py-1.5 text-[#8C1D24] hover:bg-[#8C1D24]/15">Systole Pulse</button>
        <button type="button" onClick={() => { const next = !wardHeld; setWardHeld(next); audioMixer.setAnchorState(next); }} className={`cursor-pointer border py-1.5 ${wardHeld ? 'border-[#D49B27] bg-[#D49B27]/20 text-[#D49B27]' : 'border-[#C8963E]/35 text-[#EAE3D2]/70'}`}>
          {wardHeld ? 'Ward: 528Hz' : 'Ward: Off'}
        </button>
      </div>
    </aside>
  );
};
