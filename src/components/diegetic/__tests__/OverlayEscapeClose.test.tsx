// @vitest-environment jsdom
// src/components/diegetic/__tests__/OverlayEscapeClose.test.tsx
import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PuskolaCompendium } from '../PuskolaCompendium';
import { WickCalibrationModal } from '../WickCalibrationModal';

describe('Overlay Escape Key Close Handling', () => {
  afterEach(() => {
    cleanup();
  });

  it('closes PuskolaCompendium when Escape key is pressed', () => {
    const onCloseSpy = vi.fn();
    render(<PuskolaCompendium isOpen={true} initialCasefile="CF01" discoveredIds={[]} onClose={onCloseSpy} />);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onCloseSpy).toHaveBeenCalledTimes(1);
  });

  it('closes WickCalibrationModal when Escape key is pressed', () => {
    const onCloseSpy = vi.fn();
    render(<WickCalibrationModal isOpen={true} onClose={onCloseSpy} />);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onCloseSpy).toHaveBeenCalledTimes(1);
  });
});
