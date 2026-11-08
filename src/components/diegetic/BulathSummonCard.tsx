// src/components/diegetic/BulathSummonCard.tsx
import React, { useState } from 'react';
import { BulathHurullaPayload } from '../../core/bulathCodec';
import { PUSKOLA_ENTRIES } from '../../core/compendiumStore';
import { buildWhatsAppSummonLink } from '../../core/deepLinkRouter';
import { CASEFILE_META } from '../../core/savePersistence';
import { juiceDirector } from '../../juice/JuiceDirector';

interface BulathSummonCardProps {
  payload: BulathHurullaPayload;
  urlParam: string;
}

const LEAF_PATH = 'M 540,260 C 572,350 780,450 780,660 C 780,820 652,915 540,862 C 428,915 300,820 300,660 C 300,450 508,350 540,260 Z';

export const BulathSummonCard: React.FC<BulathSummonCardProps> = ({ payload, urlParam }) => {
  const [exporting, setExporting] = useState<boolean>(false);
  const avatarEntry = PUSKOLA_ENTRIES.find((e) => e.id === payload.avatar);

  const handleExportTalisman = async () => {
    if (exporting || typeof document === 'undefined') return;
    setExporting(true);
    juiceDirector.triggerHaptic('iron_grip');

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080; canvas.height = 1350;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. Chiaroscuro Palm-Leaf Background & Brass Double Frame
      ctx.fillStyle = '#090807'; ctx.fillRect(0, 0, 1080, 1350);
      const glow = ctx.createRadialGradient(540, 610, 40, 540, 610, 460);
      glow.addColorStop(0, 'rgba(212, 155, 39, 0.26)'); glow.addColorStop(0.55, 'rgba(140, 29, 36, 0.14)'); glow.addColorStop(1, 'rgba(9, 8, 7, 0)');
      ctx.fillStyle = glow; ctx.fillRect(0, 0, 1080, 1350);
      ctx.strokeStyle = '#C8963E'; ctx.lineWidth = 3; ctx.strokeRect(48, 48, 984, 1254);
      ctx.strokeStyle = 'rgba(200, 150, 62, 0.35)'; ctx.lineWidth = 1.5; ctx.strokeRect(66, 66, 948, 1218);

      // 2. Bilingual Header Rubric
      ctx.textAlign = 'center'; ctx.fillStyle = '#D49B27';
      ctx.font = '600 32px "Noto Serif Sinhala", "Cormorant Garamond", Georgia, serif';
      ctx.fillText('ශාස්ත්ර බුලත් හුරුල්ල ෴ BULATH HURULLA SUMMONS', 540, 132);
      ctx.fillStyle = 'rgba(234, 227, 210, 0.72)'; ctx.font = 'italic 26px "Cormorant Garamond", Georgia, serif';
      ctx.fillText(`${CASEFILE_META[payload.casefile].title} · Samayam Forensic Warrant`, 540, 178);

      // 3. Backlit Betel Leaf Silhouette, Midrib & Blemish Coordinates
      const leaf = new Path2D(LEAF_PATH);
      ctx.fillStyle = '#241F10'; ctx.fill(leaf); ctx.strokeStyle = '#C8963E'; ctx.lineWidth = 3; ctx.stroke(leaf);
      ctx.beginPath(); ctx.moveTo(540, 268); ctx.lineTo(540, 862); ctx.strokeStyle = 'rgba(212, 155, 39, 0.75)'; ctx.lineWidth = 4; ctx.stroke();

      payload.blemishes.forEach((b) => {
        const bx = 300 + b.x * 480, by = 260 + b.y * 620;
        ctx.beginPath(); ctx.arc(bx, by, b.type === 'PINHOLE_TEAR' ? 12 : 28, 0, Math.PI * 2);
        ctx.fillStyle = b.type === 'OILY_SHEEN' ? '#3B4D7A' : '#8C1D24'; ctx.fill();
        ctx.strokeStyle = '#D49B27'; ctx.lineWidth = 2.5; ctx.stroke();
      });

      // 4. Diagnostic Share Code & Demonic Avatara Seal
      ctx.fillStyle = '#D49B27'; ctx.font = '600 68px "Cormorant Garamond", Georgia, serif'; ctx.fillText(payload.shareCode, 540, 1020);
      ctx.fillStyle = '#EAE3D2'; ctx.font = '500 30px "Noto Serif Sinhala", "Cormorant Garamond", Georgia, serif';
      ctx.fillText(avatarEntry ? `${avatarEntry.sinhalaScript} · ${avatarEntry.sinhalaTitle}` : payload.avatar, 540, 1082);
      ctx.fillStyle = 'rgba(234, 227, 210, 0.68)'; ctx.font = '24px "Cormorant Garamond", Georgia, serif';
      ctx.fillText(`Lakunu Blemishes: ${payload.blemishes.length}/5   ·   Balma Dread: ${payload.balma}%`, 540, 1140);
      ctx.fillStyle = '#C8963E'; ctx.font = '22px "Cormorant Garamond", Georgia, serif';
      ctx.fillText(`Open Triage: kalukumara.aftermonsoon.lk/?bulath=${payload.shareCode}`, 540, 1236);

      const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/png'));
      if (!blob) return;
      const fileName = `Bulath-${payload.shareCode}.png`, file = new File([blob], fileName, { type: 'image/png' });
      if (typeof navigator !== 'undefined' && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: `Bulath Summons ${payload.shareCode}`, files: [file] });
      } else {
        const url = URL.createObjectURL(blob), a = document.createElement('a');
        a.href = url; a.download = fileName; a.click(); URL.revokeObjectURL(url);
      }
    } catch { /* Ignore */ } finally { setExporting(false); }
  };

  return (
    <aside className="fixed top-16 right-6 z-40 border-l-2 border-[#8C1D24] bg-[#0D0B0A]/95 px-4 py-3.5 font-serif shadow-2xl select-none">
      <div className="text-[11px] tracking-[0.18em] text-[#D49B27] uppercase">බුලත් හුරුල්ල · {payload.shareCode}</div>
      <div className="mt-0.5 text-[11px] text-[#EAE3D2]/65 italic">
        {avatarEntry ? avatarEntry.sinhalaTitle : payload.avatar} ({payload.blemishes.length}/5 Lakunu)
      </div>
      <div className="mt-2.5 flex items-center gap-x-4 text-xs">
        <a href={buildWhatsAppSummonLink(urlParam, payload.shareCode)} target="_blank" rel="noreferrer" className="text-[#C8963E] underline underline-offset-4 hover:text-[#D49B27]">
          Dispatch via WhatsApp →
        </a>
        <button type="button" onClick={handleExportTalisman} disabled={exporting} className="cursor-pointer border border-[#C8963E]/40 bg-[#16120E] px-2.5 py-1 text-[11px] tracking-wider text-[#EAE3D2] uppercase hover:border-[#D49B27] hover:text-[#D49B27]">
          {exporting ? 'Inscribing...' : '[Save Talisman PNG ↓]'}
        </button>
      </div>
    </aside>
  );
};
