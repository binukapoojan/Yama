// @vitest-environment jsdom
// src/components/diegetic/__tests__/PuskolaInscriptionBrand.test.tsx
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { audioMixer } from '../../../juice/audioMixer';
import { juiceDirector } from '../../../juice/JuiceDirector';
import { PuskolaInscriptionBrand } from '../PuskolaInscriptionBrand';

describe('PuskolaInscriptionBrand Component', () => {
  beforeEach(() => {
    vi.spyOn(audioMixer, 'playStylusScratch').mockImplementation(() => {});
    vi.spyOn(juiceDirector, 'triggerHaptic').mockImplementation(() => {});
  });

  it('renders entry details when a newly unlocked entry is provided', () => {
    render(<PuskolaInscriptionBrand newlyUnlockedId="HANDUN_KUMARA" />);

    expect(screen.getByText(/Vein Inscribed/i)).toBeDefined();
    expect(screen.getByText(/හඳුන් කුමාර අවතාරය/i)).toBeDefined();
    expect(audioMixer.playStylusScratch).toHaveBeenCalled();
    expect(juiceDirector.triggerHaptic).toHaveBeenCalledWith('stylus_scratch');
  });

  it('renders eclipse unsealing notification when huniyamJustUnsealed is true', () => {
    render(<PuskolaInscriptionBrand newlyUnlockedId={null} huniyamJustUnsealed={true} />);

    expect(screen.getByText(/Eclipse Warrant/i)).toBeDefined();
    expect(screen.getByText(/The Fifth Eclipse Watch Has Unsealed/i)).toBeDefined();
  });

  it('renders null when no item is unlocked', () => {
    const { container } = render(<PuskolaInscriptionBrand newlyUnlockedId={null} huniyamJustUnsealed={false} />);
    expect(container.firstChild).toBeNull();
  });
});
