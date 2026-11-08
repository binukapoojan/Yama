// src/components/diegetic/MantraCadenceBar.tsx
import React, { useEffect, useRef, useState } from 'react';
import { audioMixer } from '../../juice/audioMixer';
import { juiceDirector } from '../../juice/JuiceDirector';

export type MantraKey = 'RATA_YAKUMA' | 'PATTINI_VARAMA' | 'RIRI_VARAMA' | 'GOTHAIMBARA_VARAMA';

interface MantraCadenceProps {
  mantraKey: MantraKey;
  onCompleted: (success: boolean) => void;
}

const MANTRA_STEPS: Record<MantraKey, ReadonlyArray<{ sinhala: string; phonetic: string; windowMs: number }>> = {
  RATA_YAKUMA: [
    { sinhala: 'ඕං ශ්රී කළු කුමාර', phonetic: 'Om Shri Kalu Kumāra', windowMs: 1600 },
    { sinhala: 'අමනුෂ්ය බල මඬුලු', phonetic: 'Amanushya Bala Madulu', windowMs: 1450 },
    { sinhala: 'දුරලමි වරමිනි', phonetic: 'Duralami Varamini', windowMs: 1350 },
    { sinhala: 'ස්වාහී ෴', phonetic: 'Swāhī ෴', windowMs: 1250 },
  ],
  PATTINI_VARAMA: [
    { sinhala: 'ඕං පත්තිනි මෑණියෝ', phonetic: 'Om Pattini Maeniyō', windowMs: 1600 },
    { sinhala: 'අරුම දරු බර', phonetic: 'Aruma Daru Bara', windowMs: 1450 },
    { sinhala: 'කැපෙව්මි වරමිනි', phonetic: 'Kapewmi Varamini', windowMs: 1350 },
    { sinhala: 'ස්වාහී ෴', phonetic: 'Swāhī ෴', windowMs: 1250 },
  ],
  RIRI_VARAMA: [
    { sinhala: 'ඕං රීරි යක්ෂයා', phonetic: 'Om Rīri Yakshayā', windowMs: 1550 },
    { sinhala: 'ලේ මල් පිදේනි ගෙන', phonetic: 'Lē Mal Pidēni Gena', windowMs: 1400 },
    { sinhala: 'පැදුරු දානය හැර', phonetic: 'Peduru Dānaya Hara', windowMs: 1300 },
    { sinhala: 'ස්වාහී ෴', phonetic: 'Swāhī ෴', windowMs: 1200 },
  ],
  GOTHAIMBARA_VARAMA: [
    { sinhala: 'ඕං ජයසේන මහසෝන්', phonetic: 'Om Jayasēna Mahasōn', windowMs: 1500 },
    { sinhala: 'ගෝඨයිම්බර තේජසින්', phonetic: 'Gōthaimbara Thējasin', windowMs: 1350 },
    { sinhala: 'තුන්මන්සල අළු හැර', phonetic: 'Thummansala Alu Hara', windowMs: 1250 },
    { sinhala: 'ස්වාහී ෴', phonetic: 'Swāhī ෴', windowMs: 1150 },
  ],
};

export const MantraCadenceBar: React.FC<MantraCadenceProps> = ({ mantraKey, onCompleted }) => {
  const steps = MANTRA_STEPS[mantraKey];
  const [started, setStarted] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [failed, setFailed] = useState<boolean>(false);
  const animRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(performance.now());
  const currentStep = steps[currentIndex];

  useEffect(() => {
    setStarted(false); setCurrentIndex(0); setProgress(0); setFailed(false);
  }, [mantraKey]);

  useEffect(() => {
    if (!started || failed) return;
    startTimeRef.current = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const pct = Math.min(100, (elapsed / currentStep.windowMs) * 100);
      setProgress(pct);
      if (pct >= 100) {
        setFailed(true);
        juiceDirector.triggerHaptic('dread_throb');
        audioMixer.playYakBeraPulse(0.95);
        setTimeout(() => onCompleted(false), 450);
        return;
      }
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [started, currentIndex, currentStep, failed, onCompleted]);

  const handleTapSyllable = () => {
    if (failed) return;
    if (animRef.current) cancelAnimationFrame(animRef.current);
    if (!started) setStarted(true);

    juiceDirector.triggerHaptic('iron_grip');
    audioMixer.playYakBeraPulse(0.7 + currentIndex * 0.1);
    if (mantraKey === 'RIRI_VARAMA' || mantraKey === 'GOTHAIMBARA_VARAMA') {
      audioMixer.playArterialPulse(0.85);
    }
    if (currentIndex + 1 >= steps.length) {
      onCompleted(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setProgress(0);
    }
  };

  return (
    <div className="relative mx-auto flex w-full max-w-[28rem] flex-col items-center justify-center p-6 font-serif select-none">
      <div className="mb-3 text-[11px] tracking-[0.2em] text-[#C8963E]/85 uppercase">
        මන්ත්ර උච්චාරණය · Mantra Cadence ({currentIndex + 1}/{steps.length}) ෴
      </div>
      <div className="relative mb-5 h-1.5 w-full overflow-hidden border border-[#C8963E]/30 bg-[#16120E]">
        <div className="h-full transition-none" style={{ width: `${failed ? 100 : started ? progress : 0}%`, backgroundColor: failed ? '#8C1D24' : '#D49B27' }} />
      </div>
      <button type="button" onClick={handleTapSyllable} disabled={failed} className="group relative flex w-full cursor-pointer flex-col items-center justify-center border border-[#C8963E]/40 bg-[#16120E] px-4 py-6 transition-colors hover:border-[#D49B27] hover:bg-[#1E1712]">
        <span className="text-2xl font-medium tracking-wide text-[#D49B27] transition-transform group-hover:scale-105">
          {failed ? 'මන්ත්රය බිඳුණි · Cadence Broken' : currentStep.sinhala}
        </span>
        <span className="mt-1 text-xs tracking-[0.16em] text-[#EAE3D2]/65 uppercase">
          {failed ? 'The ritual warrant slipped' : currentStep.phonetic}
        </span>
        <span className="mt-3 text-[10px] tracking-widest text-[#C8963E]/60 uppercase">
          {started ? '[ යක් බෙර තාලයට තට්ටු කරන්න · Strike Before Bar Fills ]' : '[ පළමු පදය තට්ටු කර අරඹන්න · Tap First Foot to Begin Invocation ]'}
        </span>
      </button>
    </div>
  );
};
