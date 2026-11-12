// src/components/diegetic/RitualStageRouter.tsx
import React from 'react';
import { BulathHurullaPayload } from '../../core/bulathCodec';
import { forensicLedger } from '../../core/forensicLedger';
import { HuniyamPuhulCanvas } from './HuniyamPuhulCanvas';
import { MahasonaCardDuelCanvas } from './MahasonaCardDuelCanvas';
import { MantraCadenceBar, MantraKey } from './MantraCadenceBar';
import { MohiniMaskPaliyaCanvas } from './MohiniMaskPaliyaCanvas';
import { PideniThattuwaCanvas } from './PideniThattuwaCanvas';
import { RiriMatFuneralCanvas } from './RiriMatFuneralCanvas';

interface RitualStageRouterProps {
  passageId: string;
  payload: BulathHurullaPayload;
  onNavigate: (targetPassage: string) => void;
  climaxMantra?: { key: MantraKey; win: string; lose: string };
  children?: React.ReactNode;
}

export const RitualStageRouter: React.FC<RitualStageRouterProps> = ({ passageId, payload, onNavigate, climaxMantra, children }) => {
  const wrap = (node: React.ReactNode) => (
    <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[34rem] flex-col justify-center px-6 py-16">
      {node}
    </div>
  );

  switch (passageId) {
    case 'Pideni_Altar_Preparation': {
      const marked = forensicLedger.getMarkedAvatar('CF01');
      const expected = (marked === 'VATHA_KUMARA' || marked === 'HANDUN_KUMARA') ? marked : (payload.avatar === 'VATHA_KUMARA' ? 'VATHA_KUMARA' : 'HANDUN_KUMARA');
      return wrap(<PideniThattuwaCanvas expectedAvatar={expected} onConsecrated={() => onNavigate('Midnight_Samayama_Confrontation')} />);
    }
    case 'Three_Mask_Paliya_Prep':
      return wrap(<MohiniMaskPaliyaCanvas onSevered={() => onNavigate('Midnight_Kesel_Kanda_Severance')} />);
    case 'Woven_Mat_Funeral_Prep':
      return wrap(<RiriMatFuneralCanvas onFuneralSealed={() => onNavigate('Midnight_Peduru_Surrender')} />);
    case 'Thovil_Card_Duel_Prep':
      return wrap(<MahasonaCardDuelCanvas onDerisionComplete={() => onNavigate('Midnight_Gothaimbara_Varama')} />);
    case 'Puhul_Sacrifice_Prep':
      return wrap(<HuniyamPuhulCanvas onCurseSevered={() => onNavigate('Midnight_Oddisa_Confrontation')} />);
    default:
      return (
        <>
          {climaxMantra && (
            <div className="relative z-20 pt-20">
              <MantraCadenceBar
                mantraKey={climaxMantra.key}
                misdiagnosed={forensicLedger.isMisdiagnosed(payload)}
                onCompleted={(ok) => onNavigate(ok ? climaxMantra.win : climaxMantra.lose)}
              />
            </div>
          )}
          {children}
        </>
      );
  }
};
