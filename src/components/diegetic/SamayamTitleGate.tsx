// src/components/diegetic/SamayamTitleGate.tsx
import React, { useEffect, useState } from 'react';
import { BulathHurullaPayload, CasefileId, decodeBulathPayload } from '../../core/bulathCodec';
import { CASEFILE_META } from '../../core/savePersistence';
import { audioMixer } from '../../juice/audioMixer';
import { juiceDirector } from '../../juice/JuiceDirector';

interface SamayamTitleGateProps {
  mode: 'COLD_OPEN' | 'LEDGER';
  activeCasefile: CasefileId;
  discoveredCount: number;
  onEnterDarkness: () => void;
  onStartCasefile: (id: CasefileId, role: 'ATHURA' | 'KATTADIYA') => void;
  onApplySummons: (payload: BulathHurullaPayload) => void;
  onOpenCompendium: () => void;
}

const WATCH_INDEX: Record<CasefileId, { sinhala: string; time: string; place: string; omen: string }> = {
  CF01: { sinhala: 'කළු කුමාර', time: '06:14 PM · Sandhyā Dusk', place: 'Nugegoda Bodima', omen: 'The Prince of Wet Hair & Unshrouded Mirrors' },
  CF02: { sinhala: 'මළ මෝහිනී', time: '11:46 PM · Maddhama Midnight', place: 'Upper Lake Road, Kandy', omen: 'The Weeping Woman & The Shrouded Infant' },
  CF03: { sinhala: 'රීරි යකා', time: '06:08 PM · Lē Irabatuwa', place: 'Matara Firewood Kitchen', omen: 'The Blood-Drinker of the Red Sunset Hearth' },
  CF04: { sinhala: 'මහසෝනා', time: '11:52 PM · Thummansala Watch', place: 'Anuradhapura Crossroads', omen: 'The Boar-Headed Titan of the Charnel Ash' },
};

export const SamayamTitleGate: React.FC<SamayamTitleGateProps> = ({
  mode, activeCasefile, discoveredCount, onEnterDarkness, onStartCasefile, onApplySummons, onOpenCompendium,
}) => {
  const [beat, setBeat] = useState<0 | 1 | 2>(mode === 'LEDGER' ? 2 : 0);
  const [corrupted, setCorrupted] = useState<boolean>(false);
  const [codeInput, setCodeInput] = useState<string>('');
  const [invalidCode, setInvalidCode] = useState<boolean>(false);

  useEffect(() => { if (mode === 'LEDGER') setBeat(2); }, [mode]);
  useEffect(() => {
    if (beat !== 1) return;
    const t = setTimeout(() => {
      setCorrupted(true); audioMixer.playMohiniWeeping(); audioMixer.playArterialPulse(0.95); juiceDirector.triggerHaptic('heartbeat_panic');
    }, 2600);
    return () => clearTimeout(t);
  }, [beat]);

  const handleIgniteBeat0 = () => {
    audioMixer.unlock(); audioMixer.setCue('ceb_power_cut', 75); audioMixer.playYakBeraClimax(); juiceDirector.triggerHaptic('dread_throb'); setBeat(1);
  };
  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault(); const decoded = decodeBulathPayload(codeInput);
    if (decoded) {
      setInvalidCode(false); audioMixer.unlock(); audioMixer.playYakBeraClimax(); onApplySummons(decoded);
    } else { setInvalidCode(true); juiceDirector.triggerHaptic('dread_throb'); }
  };

  if (beat === 0) {
    return (
      <div onClick={handleIgniteBeat0} className="fixed inset-0 z-50 flex cursor-pointer flex-col items-center justify-center bg-[#050404] px-6 text-center font-serif text-[#EAE3D2] select-none">
        <div className="mb-3 text-[10px] tracking-[0.35em] text-[#8C1D24] uppercase">සමයම් වේලාව · Sound & Headphones Required</div>
        <h1 className="mb-8 text-2xl tracking-widest text-[#D49B27] uppercase md:text-3xl">කළු කුමාර සහ සමයම් පුස්කොළය</h1>
        <div className="relative my-6 flex items-center justify-center">
          <span className="absolute h-20 w-20 animate-ping rounded-full bg-[#8C1D24]/30 duration-1000" /><span className="h-3.5 w-3.5 rounded-full bg-[#8C1D24] shadow-[0_0_36px_12px_rgba(140,29,36,0.75)]" />
        </div>
        <p className="mt-6 max-w-[24rem] text-sm leading-relaxed text-[#EAE3D2]/65 italic">In Sri Lanka, 6:00 PM dusk and 12:00 AM midnight are the Samayam watches—the hours when the boundary between the living and the Yakku dissolves.</p>
        <span className="mt-10 border-b border-[#8C1D24]/60 pb-1 text-xs tracking-[0.26em] text-[#D49B27] uppercase">[ අඳුරට පිවිසෙන්න · Touch the Dark to Enter the Watch ]</span>
      </div>
    );
  }

  if (beat === 1) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050404] px-6 text-center font-serif text-[#EAE3D2] select-none">
        <div className="max-w-[30rem] space-y-6">
          <div className="text-xs tracking-[0.28em] text-[#8C1D24] uppercase">තනිකම සහ බැල්ම · The Law of Tanikama</div>
          <p className="text-lg leading-relaxed text-[#EAE3D2]/90">Never bathe after the 6:00 PM temple bell. Never answer a weeping voice on a lonely road. Never fry meat at red sunset. Never look back when a branch snaps at a three-way crossroads.</p>
          <p className={`text-base leading-relaxed transition-colors duration-700 ${corrupted ? 'text-[#8C1D24] font-semibold' : 'text-[#C8963E]/80 italic'}`}>
            {corrupted ? '“THEY ARE ALREADY STANDING BEHIND YOUR CHAIR. HOLD THE COLD IRON WARD AT THE BOTTOM OF THE SCREEN OR SURRENDER YOUR BREATH.”' : 'When the oil lamp flickers and your own thoughts begin to lie to you, only cold iron can anchor waking reality.'}
          </p>
          <div className="flex flex-wrap justify-center gap-6 pt-6 text-xs tracking-[0.22em] uppercase">
            <button type="button" onClick={() => { audioMixer.playYakBeraClimax(); onEnterDarkness(); }} className="cursor-pointer border border-[#8C1D24] bg-[#1A090B] px-6 py-3 text-[#EAE3D2] shadow-[0_0_30px_rgba(140,29,36,0.4)] hover:border-[#D49B27]">[ Survive the Watch Now → ]</button>
            <button type="button" onClick={() => setBeat(2)} className="cursor-pointer py-3 text-[#C8963E]/70 hover:text-[#D49B27]">[ Choose Casefile / Exorcist Triage ]</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#060504]/98 px-6 py-10 font-serif text-[#EAE3D2] select-none">
      <div className="my-auto w-full max-w-[38rem] space-y-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[#8C1D24]/40 pb-3">
          <span className="text-xs tracking-[0.25em] text-[#8C1D24] uppercase">සමයම් යාම හතර · The Four Samayam Casefiles</span>
          <div className="flex gap-4 text-[11px] tracking-widest uppercase">
            <button type="button" onClick={onOpenCompendium} className="cursor-pointer text-[#C8963E]/80 hover:text-[#D49B27]">[Puskola {discoveredCount}/28]</button>
            <button type="button" onClick={onEnterDarkness} className="cursor-pointer text-[#D49B27] hover:underline">[Resume Watch →]</button>
          </div>
        </div>
        <div className="divide-y divide-[#C8963E]/15">
          {(['CF01', 'CF02', 'CF03', 'CF04'] as CasefileId[]).map((id) => (
            <div key={id} className="flex flex-col justify-between gap-2 py-3 sm:flex-row sm:items-center">
              <div>
                <div className={`text-base font-medium ${activeCasefile === id ? 'text-[#D49B27]' : 'text-[#EAE3D2]'}`}>{CASEFILE_META[id].title} <span className="ml-1.5 text-sm text-[#8C1D24]">· {WATCH_INDEX[id].sinhala}</span></div>
                <div className="text-xs text-[#EAE3D2]/60 italic">{WATCH_INDEX[id].omen}</div>
                <div className="text-[10px] tracking-widest text-[#C8963E]/55 uppercase">{WATCH_INDEX[id].time} · {WATCH_INDEX[id].place}</div>
              </div>
              <div className="flex shrink-0 gap-3 self-end sm:self-center text-[11px] tracking-widest uppercase">
                <button type="button" onClick={() => onStartCasefile(id, 'ATHURA')} className="cursor-pointer border border-[#C8963E]/35 bg-[#120E0B] px-3 py-1 text-[#EAE3D2] hover:border-[#D49B27] hover:text-[#D49B27]">[Victim →]</button>
                <button type="button" onClick={() => onStartCasefile(id, 'KATTADIYA')} className="cursor-pointer border border-[#8C1D24]/45 bg-[#160A0C] px-3 py-1 text-[#8C1D24] hover:border-[#D49B27] hover:text-[#D49B27]">[Exorcist]</button>
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={handleCodeSubmit} className="flex flex-wrap items-center justify-between gap-2 border-t border-[#C8963E]/20 pt-4 text-xs">
          <span className="text-[11px] tracking-widest text-[#EAE3D2]/55 uppercase">Enter Friend&apos;s Bulath Summons Code:</span>
          <div className="flex items-center gap-2">
            <input type="text" value={codeInput} onChange={(e) => { setCodeInput(e.target.value.toUpperCase()); setInvalidCode(false); }} placeholder="BH-MR-0758" className={`w-32 border-b bg-transparent px-1 py-0.5 text-center text-xs tracking-widest text-[#EAE3D2] uppercase focus:outline-none ${invalidCode ? 'border-[#8C1D24] text-[#8C1D24]' : 'border-[#C8963E]/40 focus:border-[#D49B27]'}`} />
            <button type="submit" className="cursor-pointer text-[11px] tracking-widest text-[#D49B27] uppercase hover:underline">[Unfold →]</button>
          </div>
        </form>
      </div>
    </div>
  );
};
