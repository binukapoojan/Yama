// src/core/bulathImageExporter.ts
import { BulathHurullaPayload } from './bulathCodec';
import { PUSKOLA_ENTRIES } from './compendiumStore';
import { CASEFILE_META } from './savePersistence';

export async function exportBulathWarrantPng(payload: BulathHurullaPayload): Promise<Blob | null> {
  if (typeof document === 'undefined') return null;
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 880;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const meta = CASEFILE_META[payload.casefile];
  const avatarEntry = PUSKOLA_ENTRIES.find((e) => e.id === payload.avatar);

  // 1. Charcoal Obsidian Canvas & Ambient Glow
  ctx.fillStyle = '#050608';
  ctx.fillRect(0, 0, 600, 880);
  const glow = ctx.createRadialGradient(300, 420, 20, 300, 420, 320);
  glow.addColorStop(0, 'rgba(212, 155, 39, 0.24)');
  glow.addColorStop(0.55, 'rgba(140, 29, 36, 0.12)');
  glow.addColorStop(1, 'rgba(5, 6, 8, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 600, 880);

  // 2. Double Incised Gold Border
  ctx.strokeStyle = '#C8963E';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(28, 28, 544, 824);
  ctx.strokeStyle = 'rgba(200, 150, 62, 0.35)';
  ctx.lineWidth = 1;
  ctx.strokeRect(38, 38, 524, 804);

  // 3. Top Sinhala & Roman Header Rubric
  ctx.textAlign = 'center';
  ctx.fillStyle = '#8A99AD';
  ctx.font = '12px Georgia, serif';
  ctx.fillText('ගොම්මන් · GOMMAN — THE CEYLON NIGHT DOCKETS', 300, 92);

  ctx.fillStyle = '#D49B27';
  ctx.font = '26px Georgia, serif';
  ctx.fillText('සමයම් බුලත් හුරුල්ල ෴', 300, 130);

  ctx.fillStyle = '#EAE3D2';
  ctx.font = 'italic 15px Georgia, serif';
  ctx.fillText(`${meta ? meta.sinhalaTitle : 'සමයම්'} · ${meta ? meta.title : 'Warrant'}`, 300, 160);

  // 4. Betel Leaf Silhouette & Primary Venation
  ctx.beginPath();
  ctx.moveTo(300, 200);
  ctx.bezierCurveTo(320, 260, 440, 320, 440, 440);
  ctx.bezierCurveTo(440, 540, 370, 600, 300, 570);
  ctx.bezierCurveTo(230, 600, 160, 540, 160, 440);
  ctx.bezierCurveTo(160, 320, 280, 260, 300, 200);
  ctx.fillStyle = '#1D1A12';
  ctx.fill();
  ctx.strokeStyle = '#C8963E';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(300, 205);
  ctx.lineTo(300, 570);
  ctx.strokeStyle = 'rgba(212, 155, 39, 0.75)';
  ctx.lineWidth = 3;
  ctx.stroke();

  // 5. Lakunu Blemishes
  payload.blemishes.forEach((b) => {
    const bx = 160 + b.x * 280, by = 200 + b.y * 370;
    ctx.beginPath();
    ctx.arc(bx, by, b.type === 'PINHOLE_TEAR' ? 7 : 16, 0, Math.PI * 2);
    ctx.fillStyle = b.type === 'OILY_SHEEN' ? '#3B4D7A' : '#8C1D24';
    ctx.fill();
    ctx.strokeStyle = '#D49B27';
    ctx.lineWidth = 1.8;
    ctx.stroke();
  });

  // 6. Share Code & Avatar Identification
  ctx.fillStyle = '#D49B27';
  ctx.font = '600 48px Georgia, serif';
  ctx.fillText(payload.shareCode, 300, 722);

  ctx.fillStyle = '#EAE3D2';
  ctx.font = '17px Georgia, serif';
  ctx.fillText(avatarEntry ? `${avatarEntry.sinhalaTitle} · ${avatarEntry.englishGloss}` : payload.avatar, 300, 756);

  // 7. Footer Call to Action
  ctx.fillStyle = 'rgba(234, 227, 210, 0.5)';
  ctx.font = '12px Georgia, serif';
  ctx.fillText('෴ Unfold the Bulath Warrant in GOMMAN to Begin the Thovil ෴', 300, 805);

  return new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/png'));
}
