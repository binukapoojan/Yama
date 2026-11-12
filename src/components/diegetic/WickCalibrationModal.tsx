// src/components/diegetic/WickCalibrationModal.tsx
import React, { useEffect, useState } from 'react';
import { LampCalibrationSettings, loadCalibrationSettings, saveCalibrationSettings, WickNotch } from '../../core/calibrationStore';
import { audioMixer } from '../../juice/audioMixer';
import { juiceDirector } from '../../juice/JuiceDirector';
import { LivingPuskolaSurface } from './LivingPuskolaSurface';

interface WickCalibrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NOTCH_LABELS: ReadonlyArray<{ notch: WickNotch; sinhala: string; roman: string }> = [
  { notch: 0, sinhala: 'නිවුණු', roman: 'Quenched' },
  { notch: 1, sinhala: 'අඩු දැල්ල', roman: 'Low Ember' },
  { notch: 2, sinhala: 'මධ්යම', roman: 'Steady Wick' },
  { notch: 3, sinhala: 'පූර්ණ', roman: 'Full Draught' },
];

export const WickCalibrationModal: React.FC<WickCalibrationModalProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState<LampCalibrationSettings>(() => loadCalibrationSettings());

  useEffect(() => {
    if (isOpen) setSettings(loadCalibrationSettings());
  }, [isOpen]);

  if (!isOpen) return null;

  const update = (patch: Partial<LampCalibrationSettings>, previewWhisper = false) => {
    const next = saveCalibrationSettings({ ...settings, ...patch });
    setSettings(next);
    audioMixer.unlock();
    juiceDirector.triggerHaptic('iron_grip');
    if (previewWhisper) audioMixer.playMohiniWhimper();
    else audioMixer.playYakBeraPulse(0.6);
  };

  const renderWickRow = (titleSinhala: string, titleRoman: string, current: WickNotch, onSelect: (n: WickNotch) => void) => (
    <div className="space-y-2.5 border-b border-[#C8963E]/15 py-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-base text-[#D49B27]">
          {titleSinhala} <span className="text-xs tracking-[0.18em] text-[#EAE3D2]/75 uppercase">· {titleRoman}</span>
        </span>
        <span className="text-xs tracking-[0.2em] text-[#8A99AD] italic">
          {NOTCH_LABELS[current].sinhala} · {NOTCH_LABELS[current].roman}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-3 pt-1">
        {NOTCH_LABELS.map(({ notch, roman }) => {
          const active = current === notch, lit = notch <= current && current > 0;
          return (
            <button
              key={notch} type="button" aria-pressed={active} onClick={() => onSelect(notch)}
              className={`incised-trigger flex cursor-pointer flex-col items-center gap-1.5 border-b py-2 text-center transition-all ${
                active ? 'border-[#D49B27] text-[#D49B27]' : 'border-[#C8963E]/20 text-[#EAE3D2]/45'
              }`}
            >
              <svg viewBox="0 0 28 32" className="h-6 w-6 overflow-visible">
                {notch > 0 && (
                  <path
                    d={`M 14,${20 - notch * 4.5} C 18,18 17,23 14,25 C 11,23 10,18 14,${20 - notch * 4.5} Z`}
                    fill={lit ? '#D49B27' : '#3B4D7A'} fillOpacity={lit ? '0.9' : '0.35'}
                  />
                )}
                <path d="M 6,26 L 22,26 L 19,30 L 9,30 Z" fill="#16110C" stroke="#C8963E" strokeWidth="1.2" />
              </svg>
              <span className="text-[10px] tracking-[0.18em] uppercase">{roman}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div role="dialog" aria-label="Pahana Wick Calibration" className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#040406]/95 px-4 py-10 font-serif text-[#EAE3D2] select-none">
      <LivingPuskolaSurface pageKey="wick_calibration" balma={35}>
        <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-[#C8963E]/30 pb-4">
          <div>
            <div className="text-[10px] tracking-[0.32em] text-[#8A99AD]/75 uppercase">පහන් තිර සීරුමාරුව · Sanctuary Vessel Adjustment</div>
            <h2 className="typo-carved-title mt-0.5 text-2xl font-normal tracking-wide">Trim the Pahana Wick ෴</h2>
          </div>
          <button type="button" onClick={onClose} className="incised-trigger cursor-pointer text-xs tracking-[0.22em] text-[#D49B27] uppercase">
            ❖ Seal Vessel &amp; Return
          </button>
        </div>
        {renderWickRow('වර්ෂා සහ බෙර හඬ', 'Monsoon & Yak Bera Resonance', settings.ambientNotch, (n) => update({ ambientNotch: n }, false))}
        {renderWickRow('සමයම් කෙඳිරිලි', 'Binaural Whispers & Weeping', settings.whisperNotch, (n) => update({ whisperNotch: n }, true))}
        <div className="space-y-3.5 pt-4 text-xs">
          <button
            type="button" aria-pressed={settings.temperedFlicker}
            onClick={() => update({ temperedFlicker: !settings.temperedFlicker })}
            className="incised-trigger flex w-full cursor-pointer items-baseline justify-between gap-4 text-left"
          >
            <div>
              <div className="tracking-[0.18em] text-[#D49B27] uppercase">දුම්මල ආරක්ෂාව · Tempered Dummala Flame (Photosensitivity &amp; Motion Guard)</div>
              <p className="mt-0.5 text-[#EAE3D2]/60 italic">Suppresses sudden resin flashbangs, violent screen tremors, and heat-haze distortion.</p>
            </div>
            <span className="shrink-0 tracking-[0.2em] text-[#C8963E] uppercase">{settings.temperedFlicker ? '❖ Tempered' : '෴ Unfettered'}</span>
          </button>
          <button
            type="button" aria-pressed={settings.elderFolioScale}
            onClick={() => update({ elderFolioScale: !settings.elderFolioScale })}
            className="incised-trigger flex w-full cursor-pointer items-baseline justify-between gap-4 pt-2 text-left"
          >
            <div>
              <div className="tracking-[0.18em] text-[#D49B27] uppercase">ලොකු අකුරු පුස්කොළය · Elder Folio Engraving (Handheld &amp; Deck Scale)</div>
              <p className="mt-0.5 text-[#EAE3D2]/60 italic">Enlarges incised Sinhala and English manuscript typography across all watches.</p>
            </div>
            <span className="shrink-0 tracking-[0.2em] text-[#C8963E] uppercase">{settings.elderFolioScale ? '❖ Elder Folio' : '෴ Standard'}</span>
          </button>
        </div>
      </LivingPuskolaSurface>
    </div>
  );
};
