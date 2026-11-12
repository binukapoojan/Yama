// src/components/diegetic/RitualStageRouter.tsx
import React from 'react';
import { BulathHurullaPayload } from '../../core/bulathCodec';
import { HuniyamPuhulCanvas } from './HuniyamPuhulCanvas';
import { MahasonaCardDuelCanvas } from './MahasonaCardDuelCanvas';
import { MohiniMaskPaliyaCanvas } from './MohiniMaskPaliyaCanvas';
import { PideniThattuwaCanvas } from './PideniThattuwaCanvas';
import { RiriMatFuneralCanvas } from './RiriMatFuneralCanvas';

interface RitualStageRouterProps {
  passageId: string;
  payload: BulathHurullaPayload;
  onNavigate: (targetPassage: string) => void;
  children?: React.ReactNode;
}

export const RitualStageRouter: React.FC<RitualStageRouterProps> = ({ passageId, payload, onNavigate, children }) => {
  const wrap = (node: React.ReactNode) => (
    <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[34rem] flex-col justify-center px-6 py-16">
      {node}
    </div>
  );

  switch (passageId) {
    case 'Pideni_Altar_Preparation':
      return wrap(
        <PideniThattuwaCanvas
          expectedAvatar={payload.avatar === 'VATHA_KUMARA' ? 'VATHA_KUMARA' : 'HANDUN_KUMARA'}
          onConsecrated={() => onNavigate('Midnight_Samayama_Confrontation')}
        />
      );
    case 'Three_Mask_Paliya_Prep':
      return wrap(<MohiniMaskPaliyaCanvas onSevered={() => onNavigate('Midnight_Kesel_Kanda_Severance')} />);
    case 'Woven_Mat_Funeral_Prep':
      return wrap(<RiriMatFuneralCanvas onFuneralSealed={() => onNavigate('Midnight_Peduru_Surrender')} />);
    case 'Thovil_Card_Duel_Prep':
      return wrap(<MahasonaCardDuelCanvas onDerisionComplete={() => onNavigate('Midnight_Gothaimbara_Varama')} />);
    case 'Puhul_Sacrifice_Prep':
      return wrap(<HuniyamPuhulCanvas onCurseSevered={() => onNavigate('Midnight_Oddisa_Confrontation')} />);
    default:
      return <>{children}</>;
  }
};
