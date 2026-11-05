import React, { useEffect, useMemo, useState } from 'react';
import rawTwee from '../story-twine/casefile01_kalu_kumara.twee?raw';
import { RuntimeVariables, TwineChoice } from './core/schema';
import { applyStateMutations, parseTweeStory } from './core/twineParser';
import { decodeBulathPayload } from './core/bulathCodec';
import { juiceDirector } from './juice/JuiceDirector';
import { audioMixer } from './juice/audioMixer';
import { IronKeyAnchor } from './components/diegetic/IronKeyAnchor';
import { BulathLeafCanvas } from './components/diegetic/BulathLeafCanvas';
import { ProseStream } from './components/narrative/ProseStream';
import { FlowBackdrop } from './components/viewport/FlowBackdrop';
import { ChiaroscuroMask } from './components/viewport/ChiaroscuroMask';
import { AudioMixerDebugPanel } from './components/debug/AudioMixerDebugPanel';

export const App: React.FC = () => {
  const storyGraph = useMemo(() => parseTweeStory(rawTwee), []);

  const incomingBulath = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    const token = params.get('bulath');
    return token ? decodeBulathPayload(token) : null;
  }, []);

  const [currentPassageId, setCurrentPassageId] = useState<string>(
    incomingBulath && storyGraph['Kattadiya_Sastra_Entry'] ? 'Kattadiya_Sastra_Entry' : 'Dusk_Balcony_Check'
  );
  const [runtimeState, setRuntimeState] = useState<RuntimeVariables>(() => ({
    tanikama: incomingBulath?.tanikama ?? 50,
    balma: incomingBulath?.balma ?? 20,
    samayam_velava: 'SANDHYA_DUSK',
  }));

  const activePassage = storyGraph[currentPassageId] ?? storyGraph['Dusk_Balcony_Check'];

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
