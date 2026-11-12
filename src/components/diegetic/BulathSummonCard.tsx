// src/components/diegetic/BulathSummonCard.tsx
import React, { useState } from 'react';
import { BulathHurullaPayload } from '../../core/bulathCodec';
import { exportBulathWarrantPng } from '../../core/bulathImageExporter';
import { PUSKOLA_ENTRIES } from '../../core/compendiumStore';
import { buildWhatsAppSummonLink } from '../../core/deepLinkRouter';
import { juiceDirector } from '../../juice/JuiceDirector';

interface BulathSummonCardProps {
  payload: BulathHurullaPayload;
  urlParam: string;
}

export const BulathSummonCard: React.FC<BulathSummonCardProps> = ({ payload, urlParam }) => {
  const [exporting, setExporting] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const avatarEntry = PUSKOLA_ENTRIES.find((e) => e.id === payload.avatar);

  const handleCopyCode = async () => {
    juiceDirector.triggerHaptic('iron_grip');
    try {
      await navigator.clipboard?.writeText(payload.shareCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { setCopied(false); }
  };

  const handleExportTalisman = async () => {
    if (exporting || typeof document === 'undefined') return;
    setExporting(true);
    juiceDirector.triggerHaptic('iron_grip');
    try {
      const blob = await exportBulathWarrantPng(payload);
      if (!blob) return;
      const fileName = `Bulath-${payload.shareCode}.png`, file = new File([blob], fileName, { type: 'image/png' });
      if (typeof navigator !== 'undefined' && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: `Bulath Summons ${payload.shareCode}`, files: [file] });
      } else {
        const url = URL.createObjectURL(blob), a = document.createElement('a');
        a.href = url; a.download = fileName; a.click(); URL.revokeObjectURL(url);
      }
    } catch {} finally { setExporting(false); }
  };

  return (
    <aside className="fixed top-16 right-6 z-40 border-l-2 border-[#8C1D24] bg-[#0D0B0A]/95 px-4 py-3.5 font-serif shadow-2xl select-none">
      <div className="flex items-center justify-between gap-4">
        <span className="text-[11px] tracking-[0.18em] text-[#D49B27] uppercase">බුලත් හුරුල්ල · {payload.shareCode}</span>
        <button type="button" onClick={handleCopyCode} className="incised-trigger cursor-pointer text-[10px] tracking-wider text-[#D49B27] uppercase">
          {copied ? 'Copied ෴' : 'Copy Mark'}
        </button>
      </div>
      <div className="mt-0.5 text-[11px] text-[#EAE3D2]/65 italic">
        {avatarEntry ? avatarEntry.sinhalaTitle : payload.avatar} ({payload.blemishes.length}/5 Lakunu)
      </div>
      <div className="mt-2.5 flex items-center gap-x-4 text-xs">
        <a href={buildWhatsAppSummonLink(urlParam, payload.shareCode)} target="_blank" rel="noreferrer" className="incised-trigger text-[#C8963E] underline underline-offset-4 hover:text-[#D49B27]">
          Dispatch via WhatsApp ❖
        </a>
        <button type="button" onClick={handleExportTalisman} disabled={exporting} className="incised-trigger cursor-pointer text-[11px] tracking-wider text-[#EAE3D2] uppercase hover:text-[#D49B27]">
          {exporting ? 'Inscribing...' : 'Save Talisman PNG ❖'}
        </button>
      </div>
    </aside>
  );
};
