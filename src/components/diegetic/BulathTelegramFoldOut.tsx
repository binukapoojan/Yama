// src/components/diegetic/BulathTelegramFoldOut.tsx
import React, { useState } from 'react';
import { BulathHurullaPayload, decodeBulathPayload } from '../../core/bulathCodec';
import { PUSKOLA_ENTRIES } from '../../core/compendiumStore';
import { audioMixer } from '../../juice/audioMixer';
import { juiceDirector } from '../../juice/JuiceDirector';

interface BulathTelegramFoldOutProps {
  onApplySummons: (payload: BulathHurullaPayload) => void;
}

const PRESET_SHEAVES = [
  { label: 'Kalu Kumāra', code: 'BH-HK-1541' },
  { label: 'Mala Mōhinī', code: 'BH-RM-1848' },
  { label: 'Rīri Yakā', code: 'BH-MR-0758' },
  { label: 'Mahasōnā', code: 'BH-MS-185C' },
] as const;

export const BulathTelegramFoldOut: React.FC<BulathTelegramFoldOutProps> = ({ onApplySummons }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [rawCode, setRawCode] = useState<string>('');
  const [invalidPulse, setInvalidPulse] = useState<boolean>(false);

  const decodedPreview = rawCode.trim().length >= 6 ? decodeBulathPayload(rawCode) : null;
  const avatarEntry = decodedPreview ? PUSKOLA_ENTRIES.find((e) => e.id === decodedPreview.avatar) : null;

  const handleCommence = (e: React.FormEvent) => {
    e.preventDefault();
    const target = decodedPreview ?? decodeBulathPayload(rawCode);
    if (target) {
      setInvalidPulse(false);
      audioMixer.unlock();
      audioMixer.playYakBeraClimax();
      onApplySummons(target);
    } else {
      setInvalidPulse(true);
      juiceDirector.triggerHaptic('dread_throb');
    }
  };

  return (
    <div className="pt-3 font-serif text-xs select-none">
      <button
        type="button"
        onClick={() => { setIsOpen((p) => !p); juiceDirector.triggerHaptic('iron_grip'); }}
        className="incised-trigger flex w-full cursor-pointer items-center justify-between py-2 text-left text-xs tracking-[0.22em] text-[#C8963E]/85 uppercase"
      >
        <span>෴ බුලත් හුරුල්ල · Unfold a Received Bulath Summons Sheaf</span>
        <span className="text-[#D49B27]">{isOpen ? '▴' : '▾'}</span>
      </button>

      {isOpen && (
        <form onSubmit={handleCommence} className="animate-folio mt-3 space-y-4 border-l border-[#8C1D24]/50 pl-4">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <div className="flex items-baseline gap-3">
              <span className="text-xs tracking-[0.18em] text-[#EAE3D2]/60 uppercase">Inscribed Mark:</span>
              <input
                type="text"
                value={rawCode}
                onChange={(e) => { setRawCode(e.target.value.toUpperCase()); setInvalidPulse(false); }}
                placeholder="BH-MR-0758"
                aria-label="Bulath Hurulla Share Code"
                className={`w-36 border-b bg-transparent py-1 text-center font-serif text-sm tracking-[0.22em] text-[#D49B27] uppercase focus:outline-none ${
                  invalidPulse ? 'border-[#8C1D24] text-[#8C1D24]' : 'border-[#C8963E]/45 focus:border-[#D49B27]'
                }`}
              />
            </div>

            <div className="flex flex-wrap items-center gap-4 text-[11px] tracking-wider text-[#EAE3D2]/45">
              <span>Known Sheaves:</span>
              {PRESET_SHEAVES.map((q) => (
                <button
                  key={q.code}
                  type="button"
                  onClick={() => { setRawCode(q.code); setInvalidPulse(false); audioMixer.playYakBeraPulse(0.6); }}
                  className="incised-trigger cursor-pointer text-[#C8963E]/80 italic"
                >
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          {decodedPreview ? (
            <div className="flex flex-wrap items-center justify-between gap-4 border-y border-[#8C1D24]/40 py-2.5">
              <div className="text-xs text-[#EAE3D2]/85 italic">
                <span className="not-italic text-[#D49B27]">{avatarEntry?.sinhalaScript ?? decodedPreview.avatar}</span>
                {' · '}{decodedPreview.blemishes.length} Lakunu Veins Stained
              </div>
              <button type="submit" className="incised-trigger cursor-pointer text-xs tracking-[0.24em] text-[#D49B27] uppercase">
                ❖ Lay Sheaf Before the Pahana
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between text-[11px] text-[#EAE3D2]/45 italic">
              <span>{invalidPulse ? 'The leaf veins do not match any known Samayam mark.' : 'Inscribe the ten-character mark from an afflicted friend’s leaf.'}</span>
              <button type="submit" className="incised-trigger cursor-pointer not-italic tracking-[0.2em] text-[#C8963E] uppercase">
                ❖ Examine Leaf
              </button>
            </div>
          )}
        </form>
      )}
    </div>
  );
};
