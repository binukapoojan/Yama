// src/App.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import rawCF01 from '../story-twine/casefile01_kalu_kumara.twee?raw'; import rawCF02 from '../story-twine/casefile02_mohini.twee?raw'; import rawCF03 from '../story-twine/casefile03_riri_yaka.twee?raw'; import rawCF04 from '../story-twine/casefile04_mahasona.twee?raw';
import { BulathLeafCanvas } from './components/diegetic/BulathLeafCanvas'; import { IronKeyAnchor } from './components/diegetic/IronKeyAnchor'; import { MahasonaCardDuelCanvas } from './components/diegetic/MahasonaCardDuelCanvas'; import { MantraCadenceBar } from './components/diegetic/MantraCadenceBar'; import { MohiniMaskPaliyaCanvas } from './components/diegetic/MohiniMaskPaliyaCanvas'; import { PideniThattuwaCanvas } from './components/diegetic/PideniThattuwaCanvas'; import { PuskolaCompendium } from './components/diegetic/PuskolaCompendium'; import { RiriMatFuneralCanvas } from './components/diegetic/RiriMatFuneralCanvas';
import { ProseStream } from './components/narrative/ProseStream'; import { ChiaroscuroMask } from './components/viewport/ChiaroscuroMask'; import { FlowBackdrop } from './components/viewport/FlowBackdrop';
import { BulathHurullaPayload, CasefileId, encodeBulathPayload } from './core/bulathCodec'; import { loadDiscoveredCompendium, syncRuntimeToCompendium } from './core/compendiumStore'; import { buildWhatsAppSummonLink, listenForBulathDeepLinks, resolveCasefileConfig } from './core/deepLinkRouter'; import { bindLifecycleFlush, buildStateFromBulath, CASEFILE_META, resolveInitialSession, saveSessionSnapshot } from './core/savePersistence';
import { RuntimeVariables, TwineChoice } from './core/schema'; import { applyStateMutations, parseTweeStory } from './core/twineParser'; import { audioMixer } from './juice/audioMixer'; import { juiceDirector } from './juice/JuiceDirector';

export { resolveCasefileConfig };

const SASTRA_NEXT: Record<string, string> = { Sastra_Vein_Deduction: 'Bedroom_Lakunu_Forensics', Sastra_Kaduru_Leaf_Check: 'Patient_Catatonia_Inspection', Sastra_Riri_Leaf_Check: 'Patient_Hemorrhage_Check', Sastra_Mahasona_Leaf_Check: 'Patient_Handprint_Forensics' };
const CLIMAX_MANTRAS: Record<string, { key: 'RATA_YAKUMA' | 'PATTINI_VARAMA' | 'RIRI_VARAMA' | 'GOTHAIMBARA_VARAMA'; win: string; lose: string }> = {
  Midnight_Samayama_Confrontation: { key: 'RATA_YAKUMA', win: 'Outcome_Kattadiya_Banished', lose: 'Outcome_Kattadiya_Backfire' },
  Midnight_Kesel_Kanda_Severance: { key: 'PATTINI_VARAMA', win: 'Outcome_Kattadiya_Mohini_Cured', lose: 'Outcome_Kattadiya_Mohini_Failed' },
  Midnight_Peduru_Surrender: { key: 'RIRI_VARAMA', win: 'Outcome_Kattadiya_Riri_Banished', lose: 'Outcome_Kattadiya_Riri_Backfire' },
  Midnight_Gothaimbara_Varama: { key: 'GOTHAIMBARA_VARAMA', win: 'Outcome_Kattadiya_Mahasona_Banished', lose: 'Outcome_Kattadiya_Mahasona_Backfire' },
};
const POSSESSED_PASSAGES = new Set(['Outcome_Athura_Possessed', 'Outcome_Athura_Mohini_Bound', 'Outcome_Athura_Riri_Drained', 'Outcome_Athura_Mahasona_Struck']);

export const App: React.FC = () => {
  const stories = useMemo(() => ({ CF01: parseTweeStory(rawCF01), CF02: parseTweeStory(rawCF02), CF03: parseTweeStory(rawCF03), CF04: parseTweeStory(rawCF04) }), []);
  const initial = useMemo(() => resolveInitialSession(stories), [stories]);
  const [casefile, setCasefile] = useState<CasefileId>(initial.casefile), [currentPassageId, setCurrentPassageId] = useState<string>(initial.passageId);
  const [runtimeState, setRuntimeState] = useState<RuntimeVariables>(initial.runtimeState);
  const [compendiumOpen, setCompendiumOpen] = useState<boolean>(false), [discoveredIds, setDiscoveredIds] = useState<string[]>(() => loadDiscoveredCompendium());
  const [sastraInspected, setSastraInspected] = useState<boolean>(false);

  const latestRef = useRef({ casefile, currentPassageId, runtimeState });
  latestRef.current = { casefile, currentPassageId, runtimeState };
  const storyGraph = stories[casefile], activePassage = storyGraph[currentPassageId];

  const applySummonsPayload = useCallback((payload: BulathHurullaPayload) => {
    const nextState = buildStateFromBulath(payload), nextPassage = CASEFILE_META[payload.casefile].kattadiyaStart;
    setCasefile(payload.casefile); setRuntimeState(nextState); setCurrentPassageId(nextPassage);
    saveSessionSnapshot(payload.casefile, nextPassage, nextState); juiceDirector.triggerHaptic('iron_grip');
  }, []);

  useEffect(() => {
    const unlock = () => audioMixer.unlock();
    ['pointerdown', 'keydown'].forEach((e) => window.addEventListener(e, unlock, { once: true }));
    const unsubDeep = listenForBulathDeepLinks(applySummonsPayload);
    const unsubFlush = bindLifecycleFlush(() => saveSessionSnapshot(latestRef.current.casefile, latestRef.current.currentPassageId, latestRef.current.runtimeState));
    return () => { unsubDeep(); unsubFlush(); };
  }, [applySummonsPayload]);

  useEffect(() => {
    if (activePassage) {
      setSastraInspected(false);
      juiceDirector.enterPassage(activePassage, Number(runtimeState.balma ?? 20));
      saveSessionSnapshot(casefile, currentPassageId, runtimeState);
      setDiscoveredIds(syncRuntimeToCompendium(runtimeState, casefile, currentPassageId));
    }
  }, [activePassage, casefile, currentPassageId, runtimeState]);

  const switchCasefile = (nextId: CasefileId, role: 'ATHURA' | 'KATTADIYA' = 'ATHURA') => {
    setCasefile(nextId);
    setRuntimeState({ tanikama: 50, balma: 20, samayam_velava: role === 'ATHURA' ? (nextId === 'CF04' || nextId === 'CF02' ? 'MADDHAMA_MIDNIGHT' : 'SANDHYA_DUSK') : 'MADDHAMA_MIDNIGHT' });
    setCurrentPassageId(role === 'ATHURA' ? CASEFILE_META[nextId].athuraStart : CASEFILE_META[nextId].kattadiyaStart);
  };

  const handleSelectChoice = (choice: TwineChoice) => {
    const nextState = applyStateMutations(runtimeState, choice.mutations), target = storyGraph[choice.targetPassage];
    if (target?.directives.balmaDelta) nextState.balma = Number(nextState.balma ?? 0) + target.directives.balmaDelta;
    if (target?.directives.tanikamaDelta) nextState.tanikama = Number(nextState.tanikama ?? 50) + target.directives.tanikamaDelta;
    setRuntimeState(nextState); setCurrentPassageId(choice.targetPassage);
  };

  if (!activePassage) return null;
  const bulath = encodeBulathPayload(runtimeState, casefile), sastraNext = SASTRA_NEXT[currentPassageId], climaxMantra = CLIMAX_MANTRAS[currentPassageId];

  return (
    <div className="relative min-h-screen w-full bg-[#090807] selection:bg-[#C8963E]/20 selection:text-[#EAE3D2]">
      <FlowBackdrop /><ChiaroscuroMask />
      <header className="fixed inset-x-0 top-0 z-40 mx-auto flex max-w-[46rem] items-center justify-between border-b border-[#C8963E]/15 px-5 py-3.5 font-serif text-xs tracking-[0.12em] text-[#EAE3D2]/60 uppercase backdrop-blur-xs">
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {(['CF01', 'CF02', 'CF03', 'CF04'] as CasefileId[]).map((id) => (
            <button key={id} type="button" onClick={() => switchCasefile(id, 'ATHURA')} className={`cursor-pointer transition-colors ${casefile === id ? 'text-[#C8963E]' : 'hover:text-[#EAE3D2]'}`}>{CASEFILE_META[id].title}</button>
          ))}
        </div>
        <div className="flex shrink-0 space-x-3 text-[11px]">
          <button type="button" onClick={() => setCompendiumOpen(true)} className="cursor-pointer text-[#C8963E]/80 hover:text-[#D49B27]">[Puskola]</button>
          <button type="button" onClick={() => switchCasefile(casefile, 'KATTADIYA')} className="cursor-pointer text-[#EAE3D2]/45 hover:text-[#C8963E]">[Triage]</button>
        </div>
      </header>
      {sastraNext ? (
        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[34rem] flex-col justify-center px-6 py-16">
          <BulathLeafCanvas payload={bulath.payload} onInspectBlemish={(b) => { setRuntimeState((prev) => ({ ...prev, [b.tabooKey]: true })); setSastraInspected(true); }} />
          <button type="button" disabled={!sastraInspected} onClick={() => setCurrentPassageId(sastraNext)} className={`mx-auto mt-6 border-b pb-1 font-serif text-sm tracking-widest uppercase transition-colors ${sastraInspected ? 'cursor-pointer border-[#C8963E]/50 text-[#EAE3D2]/85 hover:text-[#C8963E]' : 'cursor-not-allowed border-transparent text-[#EAE3D2]/30'}`}>{sastraInspected ? 'Conclude Betel Divination →' : 'Inspect Blemishes with Pahana to Conclude →'}</button>
        </div>
      ) : currentPassageId === 'Pideni_Altar_Preparation' ? (
        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[34rem] flex-col justify-center px-6 py-16"><PideniThattuwaCanvas expectedAvatar={bulath.payload.avatar === 'VATHA_KUMARA' ? 'VATHA_KUMARA' : 'HANDUN_KUMARA'} onConsecrated={() => setCurrentPassageId('Midnight_Samayama_Confrontation')} /></div>
      ) : currentPassageId === 'Three_Mask_Paliya_Prep' ? (
        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[34rem] flex-col justify-center px-6 py-16"><MohiniMaskPaliyaCanvas onSevered={() => setCurrentPassageId('Midnight_Kesel_Kanda_Severance')} /></div>
      ) : currentPassageId === 'Woven_Mat_Funeral_Prep' ? (
        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[34rem] flex-col justify-center px-6 py-16"><RiriMatFuneralCanvas onFuneralSealed={() => setCurrentPassageId('Midnight_Peduru_Surrender')} /></div>
      ) : currentPassageId === 'Thovil_Card_Duel_Prep' ? (
        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[34rem] flex-col justify-center px-6 py-16"><MahasonaCardDuelCanvas onDerisionComplete={() => setCurrentPassageId('Midnight_Gothaimbara_Varama')} /></div>
      ) : (
        <>
          {climaxMantra && <div className="relative z-20 pt-20"><MantraCadenceBar mantraKey={climaxMantra.key} onCompleted={(ok) => setCurrentPassageId(ok ? climaxMantra.win : climaxMantra.lose)} /></div>}
          <ProseStream passage={activePassage} onSelectChoice={handleSelectChoice} hideChoices={Boolean(climaxMantra)} />
        </>
      )}
      {POSSESSED_PASSAGES.has(currentPassageId) && (
        <aside className="fixed top-16 right-6 z-40 border-l border-[#8C1D24] bg-[#0D0B0A]/90 px-4 py-3 font-serif">
          <div className="text-[11px] tracking-widest text-[#8C1D24] uppercase">Bulath Hurulla · {bulath.payload.shareCode}</div>
          <a href={buildWhatsAppSummonLink(bulath.urlParam, bulath.payload.shareCode)} target="_blank" rel="noreferrer" className="mt-1.5 block text-xs text-[#C8963E] underline underline-offset-4">Dispatch Summons via WhatsApp →</a>
        </aside>
      )}
      <PuskolaCompendium isOpen={compendiumOpen} initialCasefile={casefile} discoveredIds={discoveredIds} onClose={() => setCompendiumOpen(false)} />
      <IronKeyAnchor />
    </div>
  );
};
export default App;
