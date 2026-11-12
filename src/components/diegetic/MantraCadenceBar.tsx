// src/components/diegetic/MantraCadenceBar.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { audioMixer } from '../../juice/audioMixer';
import { juiceDirector } from '../../juice/JuiceDirector';
import { wardFatigue } from '../../juice/wardFatigue';
import { MantraBreathYantra, MantraVerseSpec } from './MantraBreathYantra';

export type MantraKey = 'RATA_YAKUMA' | 'PATTINI_VARAMA' | 'RIRI_VARAMA' | 'GOTHAIMBARA_VARAMA';
interface MantraCadenceProps { mantraKey: MantraKey; onCompleted: (succeeded: boolean) => void; misdiagnosed?: boolean; }

const v = (sinhala: string, phonetic: string, durationMs: number): MantraVerseSpec => ({ sinhala, phonetic, durationMs });
const MANTRA_SCRIPTS: Record<MantraKey, { titleSinhala: string; titleRoman: string; verses: MantraVerseSpec[] }> = {
  RATA_YAKUMA: { titleSinhala: 'රට යකුම වරම', titleRoman: 'Rata Yakuma Warrant', verses: [
    v('ඕං නමෝ කළු කුමාර දේවතාවා', 'Ōm Namō Kalu Kumāra Dēvathāvā', 1600), v('සත් කට්ටුවේ බිසෝවරුන්ගේ අණින්', 'Sath Kattuwē Bisōwarungē Anin', 1400),
    v('මේ ආතුරයාගේ ඇඟ ලේ හැර', 'Mē Āthurayāgē Änga Lē Hära', 1200), v('පිදේනි තට්ටුවට බැස තීන්දුයි ස්වාහඃ ෴', 'Pidēni Thattuwata Bäsa Thīnduyi Swāhī ෴', 1050),
  ]},
  PATTINI_VARAMA: { titleSinhala: 'පත්තිනි සළඹ වරම', titleRoman: 'Fiery Anklet of Pattini', verses: [
    v('ඕං නමෝ මළ මෝහිනී යක්ෂණී', 'Ōm Namō Mala Mōhinī Yakshanī', 1600), v('පත්තිනි දේවියගේ ගිනි සළඹේ අණින්', 'Pattini Dēviyagē Gini Salambē Anin', 1400),
    v('මායා දරු බන්ධනය දෙකඩ කර', 'Māyā Daru Bandhanaya Dekada Kara', 1200), v('කෙසෙල් කඳට බැස තීන්දුයි ස්වාහඃ ෴', 'Kesel Kandata Bäsa Thīnduyi Swāhī ෴', 1050),
  ]},
  RIRI_VARAMA: { titleSinhala: 'රීරි යක් වරම', titleRoman: 'Rīri Yak Surrender Warrant', verses: [
    v('ඕං නමෝ ලේ විලේ උපන් රීරි යකා', 'Ōm Namō Lē Vilē Upan Rīri Yakā', 1600), v('සූර්ය දිව්ය රාජයාගේ අණින්', 'Sūrya Divya Rājayāgē Anin', 1400),
    v('ආතුර ලේ නහර හැර දමා', 'Āthura Lē Nahara Hära Damā', 1200), v('පැදුරු දානය ගෙන තීන්දුයි ස්වාහඃ ෴', 'Päduru Dānaya Gena Thīnduyi Swāhī ෴', 1050),
  ]},
  GOTHAIMBARA_VARAMA: { titleSinhala: 'ගෝඨයිම්බර වරම', titleRoman: 'Gothaimbara Decree', verses: [
    v('ඕං නමෝ ජයසේන මහසෝන් යකා', 'Ōm Namō Jayasēna Mahasōn Yakā', 1600), v('ගෝඨයිම්බර යෝධයාගේ වම් පයේ අණින්', 'Gōthaimbara Yōdhayāgē Wam Payē Anin', 1400),
    v('තුන්මන්සල අඟුරු අත අකා මකා', 'Thunmansala Anguru Atha Akā Makā', 1200), v('සොහොන් බිමට බැස තීන්දුයි ස්වාහඃ ෴', 'Sohon Bimata Bäsa Thīnduyi Swāhī ෴', 1050),
  ]},
};

export const MantraCadenceBar: React.FC<MantraCadenceProps> = ({ mantraKey, onCompleted, misdiagnosed = false }) => {
  const script = MANTRA_SCRIPTS[mantraKey];
  const [verseIdx, setVerseIdx] = useState(0), [knots, setKnots] = useState(misdiagnosed ? 1 : 3), [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'IDLE' | 'INHALING' | 'RESONANT' | 'RUPTURED' | 'CONSECRATED'>('IDLE');
  const holdingRef = useRef(false), progressRef = useRef(0), chimedRef = useRef(false);

  const ruptureKnot = useCallback(() => {
    holdingRef.current = false; progressRef.current = 0; setProgress(0); setStatus('RUPTURED');
    juiceDirector.triggerHaptic('dread_throb'); audioMixer.playArterialPulse(0.95);
    setKnots((prev) => {
      const next = prev - 1;
      if (next <= 0) onCompleted(false);
      else setTimeout(() => setStatus('IDLE'), 350);
      return next;
    });
  }, [onCompleted]);

  const consecrateVerse = useCallback(() => {
    holdingRef.current = false; progressRef.current = 0; setProgress(0);
    audioMixer.playYakBeraPulse(0.9); juiceDirector.triggerHaptic('iron_grip');
    wardFatigue.ventHeat(40);
    setVerseIdx((v) => {
      if (v + 1 >= script.verses.length) {
        setStatus('CONSECRATED'); audioMixer.playYakBeraClimax(); onCompleted(true);
        return v;
      }
      setStatus('IDLE'); return v + 1;
    });
  }, [script.verses.length, onCompleted]);

  useEffect(() => {
    const stepMs = 40;
    const timer = setInterval(() => {
      if (!holdingRef.current) return;
      const curVerse = script.verses[verseIdx];
      const duration = misdiagnosed ? curVerse.durationMs * 0.72 : curVerse.durationMs;
      const next = progressRef.current + (stepMs / duration) * 100;
      progressRef.current = next; setProgress(next);
      if (next >= 58 && !chimedRef.current) {
        chimedRef.current = true; setStatus('RESONANT'); audioMixer.playIronKeyTone();
      }
      if (next >= 100) ruptureKnot();
    }, stepMs);
    return () => clearInterval(timer);
  }, [verseIdx, script.verses, ruptureKnot, misdiagnosed]);

  const beginHold = useCallback(() => {
    if (status === 'CONSECRATED' || holdingRef.current) return;
    holdingRef.current = true; chimedRef.current = false; progressRef.current = 12;
    setProgress(12); setStatus('INHALING'); juiceDirector.setAnchorHeld(true); audioMixer.playYakBeraPulse(0.45);
  }, [status]);

  const releaseHold = useCallback(() => {
    if (!holdingRef.current) return;
    const p = progressRef.current;
    if (p >= 58 && p <= 99) consecrateVerse();
    else if (juiceDirector.isAnchorHeld() && p < 30) consecrateVerse();
    else ruptureKnot();
  }, [consecrateVerse, ruptureKnot]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => { if (e.code === 'Space' && !e.repeat) beginHold(); };
    const onKeyUp = (e: KeyboardEvent) => { if (e.code === 'Space') releaseHold(); };
    window.addEventListener('keydown', onKeyDown); window.addEventListener('keyup', onKeyUp);
    return () => { window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp); };
  }, [beginHold, releaseHold]);

  return (
    <MantraBreathYantra
      titleSinhala={script.titleSinhala} titleRoman={script.titleRoman} verse={script.verses[verseIdx]}
      verseIndex={verseIdx} totalVerses={script.verses.length} breathProgress={progress}
      knotsRemaining={knots} status={status}
      onHoldStart={(e) => { e.currentTarget.setPointerCapture?.(e.pointerId); beginHold(); }}
      onHoldRelease={releaseHold}
      onLegacyClick={() => {
        if (!holdingRef.current) {
          if (juiceDirector.isAnchorHeld()) consecrateVerse();
          else ruptureKnot();
        }
      }}
    />
  );
};
