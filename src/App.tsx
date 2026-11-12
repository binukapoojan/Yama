// src/App.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import rawCF01 from '../story-twine/casefile01_kalu_kumara.twee?raw'; import rawCF02 from '../story-twine/casefile02_mohini.twee?raw';
import rawCF03 from '../story-twine/casefile03_riri_yaka.twee?raw'; import rawCF04 from '../story-twine/casefile04_mahasona.twee?raw'; import rawCF05 from '../story-twine/casefile05_huniyam.twee?raw';
import { AnthologyHeader } from './components/diegetic/AnthologyHeader'; import { BulathLeafCanvas } from './components/diegetic/BulathLeafCanvas'; import { BulathSummonCard } from './components/diegetic/BulathSummonCard';
import { IronKeyAnchor } from './components/diegetic/IronKeyAnchor'; import { PuskolaCompendium } from './components/diegetic/PuskolaCompendium';
import { RitualStageRouter } from './components/diegetic/RitualStageRouter'; import { SamayamTitleGate } from './components/diegetic/SamayamTitleGate'; import { WickCalibrationModal } from './components/diegetic/WickCalibrationModal';
import { ProseStream } from './components/narrative/ProseStream'; import { ChiaroscuroMask } from './components/viewport/ChiaroscuroMask'; import { DummalaShaderFilter } from './components/viewport/DummalaShaderFilter'; import { FlowBackdrop } from './components/viewport/FlowBackdrop';
import { BulathHurullaPayload, CasefileId, encodeBulathPayload } from './core/bulathCodec'; import { loadDiscoveredCompendium, syncRuntimeToCompendium } from './core/compendiumStore'; import { getInitialWebBulath, listenForBulathDeepLinks, resolveCasefileConfig } from './core/deepLinkRouter';
import { bindLifecycleFlush, buildStateFromBulath, CASEFILE_META, createInitialStateForCasefile, getUnlockedKattadiya, KATTADIYA_UNLOCK_PASSAGES, resolveInitialSession, saveSessionSnapshot } from './core/savePersistence';
import { RuntimeVariables, TwineChoice } from './core/schema'; import { applyStateMutations, parseTweeStory } from './core/twineParser'; import { audioMixer } from './juice/audioMixer'; import { juiceDirector } from './juice/JuiceDirector';

export { resolveCasefileConfig };

const SASTRA_NEXT: Record<string, string> = { Sastra_Vein_Deduction: 'Bedroom_Lakunu_Forensics', Sastra_Kaduru_Leaf_Check: 'Patient_Catatonia_Inspection', Sastra_Riri_Leaf_Check: 'Patient_Hemorrhage_Check', Sastra_Mahasona_Leaf_Check: 'Patient_Handprint_Forensics' };
const CLIMAX_MANTRAS: Record<string, { key: 'RATA_YAKUMA' | 'PATTINI_VARAMA' | 'RIRI_VARAMA' | 'GOTHAIMBARA_VARAMA'; win: string; lose: string }> = {
  Midnight_Samayama_Confrontation: { key: 'RATA_YAKUMA', win: 'Outcome_Kattadiya_Banished', lose: 'Outcome_Kattadiya_Backfire' },
  Midnight_Kesel_Kanda_Severance: { key: 'PATTINI_VARAMA', win: 'Outcome_Kattadiya_Mohini_Cured', lose: 'Outcome_Kattadiya_Mohini_Failed' },
  Midnight_Peduru_Surrender: { key: 'RIRI_VARAMA', win: 'Outcome_Kattadiya_Riri_Banished', lose: 'Outcome_Kattadiya_Riri_Backfire' },
  Midnight_Gothaimbara_Varama: { key: 'GOTHAIMBARA_VARAMA', win: 'Outcome_Kattadiya_Mahasona_Banished', lose: 'Outcome_Kattadiya_Mahasona_Backfire' },
  Midnight_Oddisa_Confrontation: { key: 'GOTHAIMBARA_VARAMA', win: 'Outcome_Huniyam_Sovereign_Cut', lose: 'Outcome_Huniyam_Ash_Tomb' },
};
const isPossessedEnding = (id: string) => id.startsWith('Outcome_Athura_') && !id.endsWith('_Survived') && !id.endsWith('_Escaped');

export const App: React.FC = () => {
  const stories = useMemo(() => ({ CF01: parseTweeStory(rawCF01), CF02: parseTweeStory(rawCF02), CF03: parseTweeStory(rawCF03), CF04: parseTweeStory(rawCF04), CF05: parseTweeStory(rawCF05) }), []);
  const initial = useMemo(() => resolveInitialSession(stories), [stories]);
  const [casefile, setCasefile] = useState<CasefileId>(initial.casefile), [currentPassageId, setCurrentPassageId] = useState<string>(initial.passageId);
  const [runtimeState, setRuntimeState] = useState<RuntimeVariables>(initial.runtimeState);
  const [compendiumOpen, setCompendiumOpen] = useState(false), [calibrationOpen, setCalibrationOpen] = useState(false), [discoveredIds, setDiscoveredIds] = useState<string[]>(() => loadDiscoveredCompendium());
  const [leafInspected, setLeafInspected] = useState<boolean>(false), [unlockedKattadiya, setUnlockedKattadiya] = useState<CasefileId[]>(() => getUnlockedKattadiya());
  const [gateMode, setGateMode] = useState<'COLD_OPEN' | 'LEDGER' | null>(() => (getInitialWebBulath() ? null : 'COLD_OPEN'));

  const latestRef = useRef({ casefile, currentPassageId, runtimeState, unlockedKattadiya });
  latestRef.current = { casefile, currentPassageId, runtimeState, unlockedKattadiya };
  const storyGraph = stories[casefile], activePassage = storyGraph[currentPassageId];

  const applySummonsPayload = useCallback((payload: BulathHurullaPayload) => {
    const nextState = buildStateFromBulath(payload), nextPassage = CASEFILE_META[payload.casefile].kattadiyaStart;
    setCasefile(payload.casefile); setRuntimeState(nextState); setCurrentPassageId(nextPassage); setGateMode(null);
    setUnlockedKattadiya((prev) => prev.includes(payload.casefile) ? prev : [...prev, payload.casefile]);
    saveSessionSnapshot(payload.casefile, nextPassage, nextState, [payload.casefile]); juiceDirector.triggerHaptic('iron_grip');
  }, []);

  useEffect(() => {
    const unlock = () => audioMixer.unlock();
    ['pointerdown', 'keydown'].forEach((e) => window.addEventListener(e, unlock, { once: true }));
    const unsubDeep = listenForBulathDeepLinks(applySummonsPayload);
    const unsubFlush = bindLifecycleFlush(() => saveSessionSnapshot(latestRef.current.casefile, latestRef.current.currentPassageId, latestRef.current.runtimeState, latestRef.current.unlockedKattadiya));
    return () => { unsubDeep(); unsubFlush(); };
  }, [applySummonsPayload]);

  useEffect(() => { setLeafInspected(false); }, [casefile, currentPassageId]);

  useEffect(() => {
    if (!activePassage) return;
    juiceDirector.enterPassage(activePassage, Number(runtimeState.balma ?? 20));
    const unlock = KATTADIYA_UNLOCK_PASSAGES[currentPassageId];
    const nextUnlocks = unlock && !unlockedKattadiya.includes(unlock) ? [...unlockedKattadiya, unlock] : unlockedKattadiya;
    if (nextUnlocks !== unlockedKattadiya) setUnlockedKattadiya(nextUnlocks);
    saveSessionSnapshot(casefile, currentPassageId, runtimeState, nextUnlocks);
    setDiscoveredIds(syncRuntimeToCompendium(runtimeState, casefile, currentPassageId));
  }, [activePassage, casefile, currentPassageId, runtimeState, unlockedKattadiya]);

  const switchCasefile = (nextId: CasefileId, role: 'ATHURA' | 'KATTADIYA' = 'ATHURA') => {
    setCasefile(nextId); setGateMode(null);
    setRuntimeState(createInitialStateForCasefile(nextId, role));
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
  const canConcludeDivination = leafInspected || bulath.payload.blemishes.length === 0;

  return (
    <div className="relative min-h-screen w-full bg-[#090807] selection:bg-[#C8963E]/20 selection:text-[#EAE3D2]">
      <div className="dummala-warp-target"><FlowBackdrop /></div><ChiaroscuroMask /><DummalaShaderFilter balma={Number(runtimeState.balma ?? 20)} />
      {gateMode ? (
        <SamayamTitleGate
          mode={gateMode} activeCasefile={casefile} discoveredCount={discoveredIds.length} unlockedKattadiya={unlockedKattadiya}
          onEnterDarkness={() => setGateMode(null)} onStartCasefile={switchCasefile}
          onApplySummons={applySummonsPayload} onOpenCompendium={() => setCompendiumOpen(true)} onOpenCalibration={() => setCalibrationOpen(true)}
        />
      ) : (
        <>
          <AnthologyHeader activeCasefile={casefile} kattadiyaUnlocked={unlockedKattadiya.includes(casefile)} onSwitchCasefile={switchCasefile} onOpenCompendium={() => setCompendiumOpen(true)} onOpenCalibration={() => setCalibrationOpen(true)} onApplySummons={applySummonsPayload} onOpenMenu={() => setGateMode('LEDGER')} />
          {sastraNext ? (
            <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[34rem] flex-col justify-center px-6 py-16">
              <BulathLeafCanvas payload={bulath.payload} onInspectBlemish={(b) => { setLeafInspected(true); setRuntimeState((prev) => ({ ...prev, [b.tabooKey]: true })); }} onDiagnosisMarked={() => setLeafInspected(true)} />
              <button type="button" disabled={!canConcludeDivination} onClick={() => setCurrentPassageId(sastraNext)} className={`mx-auto mt-6 border-b pb-1 font-serif text-sm tracking-widest uppercase transition-colors ${canConcludeDivination ? 'cursor-pointer border-[#C8963E]/50 text-[#EAE3D2]/85 hover:text-[#C8963E]' : 'cursor-not-allowed border-[#C8963E]/15 text-[#EAE3D2]/25'}`}>
                {canConcludeDivination ? '❖ Conclude Betel Divination' : 'Inspect Leaf Veins with Pahana to Proceed'}
              </button>
            </div>
          ) : (
            <RitualStageRouter passageId={currentPassageId} payload={bulath.payload} onNavigate={setCurrentPassageId} climaxMantra={climaxMantra}>
              <ProseStream passage={activePassage} onSelectChoice={handleSelectChoice} hideChoices={Boolean(climaxMantra)} />
            </RitualStageRouter>
          )}
          {isPossessedEnding(currentPassageId) && <BulathSummonCard payload={bulath.payload} urlParam={bulath.urlParam} />}
          <IronKeyAnchor />
        </>
      )}
      <PuskolaCompendium isOpen={compendiumOpen} initialCasefile={casefile} discoveredIds={discoveredIds} onClose={() => setCompendiumOpen(false)} />
      <WickCalibrationModal isOpen={calibrationOpen} onClose={() => setCalibrationOpen(false)} />
    </div>
  );
};
export default App;
