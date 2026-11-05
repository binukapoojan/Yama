import React, { useEffect, useMemo, useState } from 'react';
import rawCase01 from '../story-twine/casefile01_kalu_kumara.twee?raw';
import rawCase02 from '../story-twine/casefile02_mohini.twee?raw';
import { RuntimeVariables, SamayamVelava, StoryGraph, TwineChoice } from './core/schema';
import { applyStateMutations, parseTweeStory } from './core/twineParser';
import { BulathHurullaPayload, decodeBulathPayload } from './core/bulathCodec';
import { juiceDirector } from './juice/JuiceDirector';
import { audioMixer } from './juice/audioMixer';
import { IronKeyAnchor } from './components/diegetic/IronKeyAnchor';
import { BulathLeafCanvas } from './components/diegetic/BulathLeafCanvas';
import { ProseStream } from './components/narrative/ProseStream';
import { FlowBackdrop } from './components/viewport/FlowBackdrop';
import { ChiaroscuroMask } from './components/viewport/ChiaroscuroMask';
import { AudioMixerDebugPanel } from './components/debug/AudioMixerDebugPanel';

export function resolveCasefileConfig(search: string, storyGraph: StoryGraph) {
  const params = new URLSearchParams(search);
  const token = params.get('bulath');
  const incomingBulath: BulathHurullaPayload | null = token ? decodeBulathPayload(token) : null;
  const val = (params.get('case') ?? params.get('casefile') ?? '').toLowerCase();
  const isCase02 =
    val === '2' || val === '02' || val === 'mohini' ||
    incomingBulath?.avatar === 'MALA_MOHINI' || incomingBulath?.avatar === 'RATI_MOHINI';

  const startingPassageId = isCase02
    ? incomingBulath && storyGraph['Kattadiya_Mohini_Entry'] ? 'Kattadiya_Mohini_Entry' : 'Upper_Lake_Mist_Start'
    : incomingBulath && storyGraph['Kattadiya_Sastra_Entry'] ? 'Kattadiya_Sastra_Entry' : 'Dusk_Balcony_Check';
  const initialSamayam: SamayamVelava = isCase02 ? 'MADDHAMA_MIDNIGHT' : 'SANDHYA_DUSK';

  return { isCase02, incomingBulath, startingPassageId, initialSamayam };
}

export const App: React.FC = () => {
  const storyGraph = useMemo(() => ({ ...parseTweeStory(rawCase01), ...parseTweeStory(rawCase02) }), []);
  const { isCase02, incomingBulath, startingPassageId, initialSamayam } = useMemo(
    () => resolveCasefileConfig(typeof window !== 'undefined' ? window.location.search : '', storyGraph),
    [storyGraph]
  );

  const [currentPassageId, setCurrentPassageId] = useState<string>(startingPassageId);
  const [runtimeState, setRuntimeState] = useState<RuntimeVariables>(() => ({
    tanikama: incomingBulath?.tanikama ?? 50,
    balma: incomingBulath?.balma ?? 20,
    samayam_velava: initialSamayam,
  }));

  const activePassage =
    storyGraph[currentPassageId] ?? (isCase02 ? storyGraph['Upper_Lake_Mist_Start'] : storyGraph['Dusk_Balcony_Check']);

  useEffect(() => {
    const unlockAudio = () => audioMixer.unlock();
    window.addEventListener('pointerdown', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  useEffect(() => {
    if (activePassage) juiceDirector.enterPassage(activePassage, runtimeState.balma);
  }, [activePassage, runtimeState.balma]);

  const handleSelectChoice = (choice: TwineChoice) => {
    const nextState = applyStateMutations(runtimeState, choice.mutations);
    const target = storyGraph[choice.targetPassage];
    if (target?.directives.balmaDelta) nextState.balma += target.directives.balmaDelta;
    if (target?.directives.tanikamaDelta) nextState.tanikama += target.directives.tanikamaDelta;
    setRuntimeState(nextState);
    setCurrentPassageId(choice.targetPassage);
  };

  if (!activePassage) return null;

  return (
    <div className="relative min-h-screen w-full bg-[#090807] selection:bg-[#C8963E]/20 selection:text-[#EAE3D2]">
      <FlowBackdrop />
      <ChiaroscuroMask />
      {incomingBulath && (
        <div className="relative z-20 pt-16 pb-2">
          <BulathLeafCanvas payload={incomingBulath} />
        </div>
      )}
      <ProseStream passage={activePassage} onSelectChoice={handleSelectChoice} />
      <IronKeyAnchor />
      <AudioMixerDebugPanel />
    </div>
  );
};

export default App;
