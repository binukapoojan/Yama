// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PanhiyaStylusCursor } from '../PanhiyaStylusCursor';

describe('PanhiyaStylusCursor & Huya Scroll Cord', () => {
  it('tracks pointer coordinates with zero-latency translate3d and detects interactive targets', () => {
    render(
      <div>
        <button type="button" className="incised-trigger">
          ❖ Test Incised Action
        </button>
        <PanhiyaStylusCursor />
      </div>
    );

    const cursor = screen.getByTestId('panhiya-cursor');
    const btn = screen.getByRole('button', { name: /Test Incised Action/i });

    fireEvent.pointerMove(btn, { clientX: 240, clientY: 180, pointerType: 'mouse' });
    expect(cursor.style.transform).toMatch(/^translate3d\(240px,\s*180px,\s*0(?:px)?\)$/);
    expect(cursor.getAttribute('data-hovering')).toBe('true');

    fireEvent.pointerMove(document.body, { clientX: 40, clientY: 50, pointerType: 'mouse' });
    expect(cursor.style.transform).toMatch(/^translate3d\(40px,\s*50px,\s*0(?:px)?\)$/);
    expect(cursor.getAttribute('data-hovering')).toBe('false');
  });
});
