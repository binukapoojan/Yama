import React, { useEffect, useMemo, useState } from 'react';
import rawCF01 from '../story-twine/casefile01_kalu_kumara.twee?raw';
import rawCF02 from '../story-twine/casefile02_mohini.twee?raw';
import { BulathLeafCanvas } from './components/diegetic/BulathLeafCanvas';
import { IronKeyAnchor } from './components/diegetic/IronKeyAnchor';
import { MohiniMaskPaliyaCanvas } from './components/diegetic/MohiniMaskPaliyaCanvas';
import { PideniThattuwaCanvas } from './components/diegetic/PideniThattuwaCanvas';
import { ProseStream } from './components/narrative/ProseStream';
import { ChiaroscuroMask } from './components/viewport/ChiaroscuroMask';
import { FlowBackdrop } from './components/viewport/FlowBackdrop';
import { CasefileId, decodeBulathPayload, encodeBulathPayload } from './core/bulathCodec';
import { RuntimeVariables, TwineChoice } from './core/schema';
import { applyStateMutations, parseTweeStory } from './core/twineParser';
import { audioMixer } from './juice/audioMixer';
import { juiceDirector } from './juice/JuiceDirector';

const CASEFILES: Record<CasefileId, { title: string; athuraStart: string; kattadiyaStart: string }> = {
  CF01: { title: 'I · Kalu Kumara (Nugegoda)', athuraStart: 'Dusk_Balcony_Check', kattadiyaStart: 'Kattadiya_Sastra_Entry' },
  CF02: { title: 'II · Mala Mohini (Kandy)', athuraStart: 'Upper_Lake_Mist_Start', kattadiyaStart: 'Kattadiya_Mohini_Entry' },
};

export function resolveCasefileConfig(search: string, _graph?: unknown) {
  const p = new URLSearchParams(search), token = p.get('bulath'), c = p.get('case') || p.get('casefile');
  const incoming = token ? decodeBulathPayload(token) : null;
  const isC2 = Boolean(c === '2' || c === '02' || c?.toLowerCase() === 'mohini' || incoming?.casefile === 'CF02' || incoming?.avatar?.endsWith('MOHINI'));
  return {
    isCase02: isC2, casefileId: (isC2 ? 'CF02' : 'CF01') as CasefileId, incomingBulath: incoming,
    startingPassageId: isC2 ? (incoming ? CASEFILES.CF02.kattadiyaStart : CASEFILES.CF02.athuraStart) : (incoming ? CASEFILES.CF01.kattadiyaStart : CASEFILES.CF01.athuraStart),
    initialSamayam: isC2 ? ('MADDHAMA_MIDNIGHT' as const) : ('SANDHYA_DUSK' as const),
  };
}

export const App: React.FC = () => {
  const init = useMemo(() => resolveCasefileConfig(typeof window !== 'undefined' ? window.location.search : ''), []);
  const incomingBulath = init.incomingBulath;
  const [casefile, setCasefile] = useState<CasefileId>(init.casefileId);
  const stories = useMemo(() => ({ CF01: parseTweeStory(rawCF01), CF02: parseTweeStory(rawCF02) }), []);
  const storyGraph = stories[casefile];
  const [currentPassageId, setCurrentPassageId] = useState<string>(init.startingPassageId);
  const [runtimeState, setRuntimeState] = useState<RuntimeVariables>(() => {
    if (!incomingBulath) return { tanikama: 50, balma: 20, samayam_velava: init.initialSamayam };
    const s: RuntimeVariables = { tanikama: incomingBulath.tanikama, balma: incomingBulath.balma, samayam_velava: 'MADDHAMA_MIDNIGHT' };
    incomingBulath.blemishes.forEach((b) => { s[b.tabooKey] = true; });
    return s;
  });
  const [copiedShare, setCopiedShare] = useState(false);
  const activePassage = storyGraph[currentPassageId];

  useEffect(() => {
    const unlock = () => audioMixer.unlock();
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
  }, []);

  useEffect(() => {
    if (activePassage) juiceDirector.enterPassage(activePassage, Number(runtimeState.balma ?? 20));
  }, [activePassage, runtimeState.balma]);

  const switchCasefile = (nextId: CasefileId, role: 'ATHURA' | 'KATTADIYA' = 'ATHURA') => {
    setCasefile(nextId);
    setRuntimeState({ tanikama: 50, balma: 20, samayam_velava: role === 'ATHURA' ? 'SANDHYA_DUSK' : 'MADDHAMA_MIDNIGHT' });
    setCurrentPassageId(role === 'ATHURA' ? CASEFILES[nextId].athuraStart : CASEFILES[nextId].kattadiyaStart);
  };

  const handleSelectChoice = (choice: TwineChoice) => {
    const next = applyStateMutations(runtimeState, choice.mutations), target = storyGraph[choice.targetPassage];
    if (target?.directives.balmaDelta) next.balma = Number(next.balma ?? 0) + target.directives.balmaDelta;
    if (target?.directives.tanikamaDelta) next.tanikama = Number(next.tanikama ?? 50) + target.directives.tanikamaDelta;
    setRuntimeState(next); setCurrentPassageId(choice.targetPassage);
  };

  if (!activePassage) return null;
  const bulath = encodeBulathPayload(runtimeState, casefile);
  const isSastra = currentPassageId === 'Sastra_Vein_Deduction' || currentPassageId === 'Sastra_Kaduru_Leaf_Check';
  const isPossessed = currentPassageId === 'Outcome_Athura_Possessed' || currentPassageId === 'Outcome_Athura_Mohini_Bound';

  return (
    <div className="relative min-h-screen w-full bg-[#090807] selection:bg-[#C8963E]/20 selection:text-[#EAE3D2]">
      <FlowBackdrop /><ChiaroscuroMask />
      <header className="fixed inset-x-0 top-0 z-40 mx-auto flex max-w-[38rem] items-center justify-between border-b border-[#C8963E]/15 px-7 py-3.5 font-serif text-xs tracking-[0.16em] text-[#EAE3D2]/60 uppercase backdrop-blur-xs">
        <div className="flex space-x-6">
          {(['CF01', 'CF02'] as CasefileId[]).map((id) => (
            <button key={id} type="button" onClick={() => switchCasefile(id, 'ATHURA')} className={`cursor-pointer transition-colors ${casefile === id ? 'text-[#C8963E]' : 'hover:text-[#EAE3D2]'}`}>{CASEFILES[id].title}</button>
          ))}
        </div>
        <button type="button" onClick={() => switchCasefile(casefile, 'KATTADIYA')} className="cursor-pointer text-[11px] text-[#EAE3D2]/45 hover:text-[#C8963E]">[Sastra Triage]</button>
      </header>
      {isSastra ? (
        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[34rem] flex-col justify-center px-6 py-16">
          <BulathLeafCanvas payload={bulath.payload} onInspectBlemish={(b) => setRuntimeState((prev) => ({ ...prev, [`inspected_${b.type}`]: true }))} />
          <button type="button" onClick={() => setCurrentPassageId(casefile === 'CF01' ? 'Bedroom_Lakunu_Forensics' : 'Patient_Catatonia_Inspection')} className="mx-auto mt-6 cursor-pointer border-b border-[#C8963E]/50 pb-1 font-serif text-sm tracking-widest text-[#EAE3D2]/85 uppercase hover:text-[#C8963E]">Conclude Betel Divination →</button>
        </div>
      ) : currentPassageId === 'Pideni_Altar_Preparation' ? (
        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[34rem] flex-col justify-center px-6 py-16">
          <PideniThattuwaCanvas expectedAvatar={bulath.payload.avatar === 'VATHA_KUMARA' ? 'VATHA_KUMARA' : 'HANDUN_KUMARA'} onConsecrated={() => setCurrentPassageId('Midnight_Samayama_Confrontation')} />
        </div>
      ) : currentPassageId === 'Three_Mask_Paliya_Prep' ? (
        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[34rem] flex-col justify-center px-6 py-16">
          <MohiniMaskPaliyaCanvas onSevered={() => setCurrentPassageId('Midnight_Kesel_Kanda_Severance')} />
        </div>
      ) : (
        <ProseStream passage={activePassage} onSelectChoice={handleSelectChoice} />
      )}
      {isPossessed && (
        <aside className="fixed top-16 right-6 z-40 border-l border-[#8C1D24] bg-[#0D0B0A]/90 px-4 py-3 font-serif">
          <div className="text-[11px] tracking-widest text-[#8C1D24] uppercase">Bulath Hurulla · {bulath.payload.shareCode}</div>
          <button type="button" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}?bulath=${bulath.urlParam}`); setCopiedShare(true); setTimeout(() => setCopiedShare(false), 2500); }} className="mt-1.5 cursor-pointer text-xs text-[#C8963E] underline underline-offset-4">{copiedShare ? 'Summons Link Copied' : 'Dispatch Exorcist Summons Link'}</button>
        </aside>
      )}
      <IronKeyAnchor />
    </div>
  );
};

export default App;
