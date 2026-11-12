// @vitest-environment jsdom
// src/core/__tests__/bulathImageExporter.test.ts
import { describe, expect, it, vi } from 'vitest';
import { BulathHurullaPayload } from '../bulathCodec';
import { exportBulathWarrantPng } from '../bulathImageExporter';

describe('Bulath Warrant PNG Exporter (GOMMAN)', () => {
  const samplePayload: BulathHurullaPayload = {
    casefile: 'CF01',
    shareCode: 'BH-HK-1541',
    avatar: 'HANDUN_KUMARA',
    veinCountLeft: 4,
    veinCountRight: 3,
    tanikama: 40,
    balma: 25,
    blemishes: [
      { id: 'taboo_bathed_dusk', tabooKey: 'taboo_bathed_dusk', x: 0.5, y: 0.15, type: 'DARK_BRUISE' },
    ],
  };

  it('renders canvas with GOMMAN brand headers and returns a blob', async () => {
    const fillTextMock = vi.fn();
    const fillRectMock = vi.fn();
    const strokeRectMock = vi.fn();

    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'canvas') {
        return {
          width: 0,
          height: 0,
          getContext: () => ({
            fillStyle: '',
            strokeStyle: '',
            lineWidth: 0,
            font: '',
            textAlign: '',
            fillRect: fillRectMock,
            strokeRect: strokeRectMock,
            fillText: fillTextMock,
            createRadialGradient: () => ({ addColorStop: vi.fn() }),
            fill: vi.fn(),
            stroke: vi.fn(),
            beginPath: vi.fn(),
            moveTo: vi.fn(),
            lineTo: vi.fn(),
            bezierCurveTo: vi.fn(),
            arc: vi.fn(),
          }),
          toBlob: (cb: (b: Blob | null) => void) => cb(new Blob(['mock_png'], { type: 'image/png' })),
        } as unknown as HTMLCanvasElement;
      }
      return originalCreateElement(tag);
    });

    const blob = await exportBulathWarrantPng(samplePayload);
    expect(blob).not.toBeNull();
    expect(fillTextMock).toHaveBeenCalledWith('ගොම්මන් · GOMMAN — THE CEYLON NIGHT DOCKETS', 300, 92);
    expect(fillTextMock).toHaveBeenCalledWith('BH-HK-1541', 300, 722);
    expect(fillTextMock).toHaveBeenCalledWith(
      '෴ Unfold the Bulath Warrant in GOMMAN to Begin the Thovil ෴',
      300,
      805
    );
  });
});
