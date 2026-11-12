// @vitest-environment jsdom
// src/components/viewport/__tests__/ScratchboardEtchPlate.test.tsx
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ProseStream } from '../../narrative/ProseStream';
import { ScratchboardEtchPlate } from '../ScratchboardEtchPlate';

describe('ScratchboardEtchPlate SVG Scratchboard Underlay', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders CF01 Nugegoda boarding annex and mirror plates', () => {
    const { rerender } = render(<ScratchboardEtchPlate loopId="bodima_rain_window" />);
    const plate = screen.getByTestId('scratchboard-etch-plate');
    expect(plate).toBeDefined();
    expect(plate.getAttribute('data-loop')).toBe('bodima_rain_window');

    rerender(<ScratchboardEtchPlate loopId="mirror_dark_idle" />);
    expect(screen.getByTestId('scratchboard-etch-plate').getAttribute('data-loop')).toBe('mirror_dark_idle');
  });

  it('renders CF02 Kandy weeping saree silhouette plate', () => {
    render(<ScratchboardEtchPlate loopId="mohini_saree_silhouette" />);
    const plate = screen.getByTestId('scratchboard-etch-plate');
    expect(plate.getAttribute('data-loop')).toBe('mohini_saree_silhouette');
  });

  it('renders CF03 Matara hearth and funeral mat plate', () => {
    render(<ScratchboardEtchPlate loopId="matara_hearth_smoke" />);
    const plate = screen.getByTestId('scratchboard-etch-plate');
    expect(plate.getAttribute('data-loop')).toBe('matara_hearth_smoke');
  });

  it('renders CF04/CF05 crossroads and boar tusk plate', () => {
    render(<ScratchboardEtchPlate loopId="thummansala_banyan_wind" />);
    const plate = screen.getByTestId('scratchboard-etch-plate');
    expect(plate.getAttribute('data-loop')).toBe('thummansala_banyan_wind');
  });

  it('triggers choice selection via Digit1 keyboard shortcut in ProseStream', () => {
    const onSelectSpy = vi.fn();
    render(
      <ProseStream
        passage={{ name: 'T', directives: {}, paragraphs: [], choices: [{ label: 'Option 1', targetPassage: 'P1', mutations: [] }] }}
        onSelectChoice={onSelectSpy}
      />
    );
    fireEvent.keyDown(window, { code: 'Digit1' });
    expect(onSelectSpy).toHaveBeenCalledTimes(1);
  });
});
