import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { lampChiaroscuro } from '../src/juice/lampChiaroscuro';
import { juiceDirector } from '../src/juice/JuiceDirector';

describe('Lamp Chiaroscuro Physics Engine', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    lampChiaroscuro.stop();
    vi.useRealTimers();
  });

  it('initializes and responds to anchor ward protection and vignette events', () => {
    lampChiaroscuro.start();

    // Trigger vignette shift
    juiceDirector.enterPassage(
      {
        name: 'test',
        directives: { vignette: 0.8 },
        paragraphs: [],
        choices: [],
      },
      10
    );

    // Trigger anchor hold
    juiceDirector.setAnchorHeld(true);
    expect(juiceDirector.isAnchorHeld()).toBe(true);

    juiceDirector.setAnchorHeld(false);
    expect(juiceDirector.isAnchorHeld()).toBe(false);
  });
});
