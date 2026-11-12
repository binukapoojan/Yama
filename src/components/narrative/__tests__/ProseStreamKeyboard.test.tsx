// @vitest-environment jsdom
// src/components/narrative/__tests__/ProseStreamKeyboard.test.tsx
import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TwinePassage } from '../../../core/schema';
import { juiceDirector } from '../../../juice/JuiceDirector';
import { ProseStream } from '../ProseStream';

describe('ProseStream Keyboard Digit 1-4 Choice Incision', () => {
  const mockPassage: TwinePassage = {
    name: 'Test_Passage',
    directives: {},
    paragraphs: [],
    choices: [
      { label: 'First Choice', targetPassage: 'Target_1', mutations: [] },
      { label: 'Second Choice (Anchored)', targetPassage: 'Target_2', mutations: [], requiresAnchorHeld: true },
    ],
  };

  it('selects choice 1 when Digit1 key is pressed', () => {
    const onSelectSpy = vi.fn();
    render(<ProseStream passage={mockPassage} onSelectChoice={onSelectSpy} />);

    fireEvent.keyDown(window, { code: 'Digit1' });
    expect(onSelectSpy).toHaveBeenCalledWith(mockPassage.choices[0]);
  });

  it('prevents selecting anchored choice 2 via Digit2 when Cold Iron Ward is not held', () => {
    const onSelectSpy = vi.fn();
    juiceDirector.setAnchorHeld(false);
    render(<ProseStream passage={mockPassage} onSelectChoice={onSelectSpy} />);

    fireEvent.keyDown(window, { code: 'Digit2' });
    expect(onSelectSpy).not.toHaveBeenCalled();
  });

  it('allows selecting anchored choice 2 via Digit2 when Cold Iron Ward is held', () => {
    const onSelectSpy = vi.fn();
    juiceDirector.setAnchorHeld(true);
    render(<ProseStream passage={mockPassage} onSelectChoice={onSelectSpy} />);

    fireEvent.keyDown(window, { code: 'Digit2' });
    expect(onSelectSpy).toHaveBeenCalledWith(mockPassage.choices[1]);
    juiceDirector.setAnchorHeld(false);
  });
});
