import { TextSegment, TwinePassage } from '../core/schema';
import { juiceDirector } from './JuiceDirector';

export interface MutatedTokenState {
  id: string;
  currentText: string;
  isCorrupted: boolean;
  isMorphing: boolean;
}

type MutationSubscriber = (snapshot: Record<string, MutatedTokenState>) => void;
const MORPH_GLYPHS = '·:;~*+=÷';
const MORPH_DURATION_MS = 420, MORPH_STEPS = 7;

export class TextMutationController {
  private states: Record<string, MutatedTokenState> = {};
  private tokens: Map<string, Extract<TextSegment, { type: 'mutate' }>> = new Map();
  private timers: Set<ReturnType<typeof setTimeout>> = new Set();
  private subscribers: Set<MutationSubscriber> = new Set();
  private unsubscribeAnchor: () => void;

  constructor() {
    this.unsubscribeAnchor = juiceDirector.on('ANCHOR_STATE_CHANGE', ({ held }) => {
      if (held) { this.clearAllTimers(); this.revertAllToWaking(); }
      else { this.scheduleAllPending(); }
    });
  }

  public subscribe(fn: MutationSubscriber): () => void {
    this.subscribers.add(fn);
    fn(this.getSnapshot());
    return () => this.subscribers.delete(fn);
  }

  public getSnapshot(): Record<string, MutatedTokenState> {
    return { ...this.states };
  }

  public loadPassage(passage: TwinePassage): void {
    this.clearAllTimers();
    this.tokens.clear();
    this.states = {};

    for (const paragraph of passage.paragraphs) {
      for (const seg of paragraph) {
        if (seg.type === 'mutate') {
          this.tokens.set(seg.id, seg);
          this.states[seg.id] = { id: seg.id, currentText: seg.wakingText, isCorrupted: false, isMorphing: false };
        }
      }
    }
    this.notify();
    if (!juiceDirector.isAnchorHeld()) this.scheduleAllPending();
  }

  private scheduleAllPending(): void {
    this.tokens.forEach((token) => {
      if (this.states[token.id]?.isCorrupted) return;
      this.timers.add(setTimeout(() => this.morphToken(token), token.delayMs));
    });
  }

  private morphToken(token: Extract<TextSegment, { type: 'mutate' }>): void {
    if (juiceDirector.isAnchorHeld()) return;
    const stepTime = Math.floor(MORPH_DURATION_MS / MORPH_STEPS);
    let step = 0;

    const runStep = () => {
      if (juiceDirector.isAnchorHeld()) { this.revertAllToWaking(); return; }
      if (++step >= MORPH_STEPS) {
        this.states[token.id] = { id: token.id, currentText: token.corruptedText, isCorrupted: true, isMorphing: false };
        this.notify();
        return;
      }
      const ratio = step / MORPH_STEPS;
      const targetLen = Math.round(token.wakingText.length + (token.corruptedText.length - token.wakingText.length) * ratio);
      const revealCount = Math.floor(targetLen * ratio);
      const prefix = token.corruptedText.slice(0, revealCount);
      const scramble = Array.from({ length: Math.max(0, targetLen - revealCount) }, (_, i) =>
        token.corruptedText[revealCount + i] === ' ' ? ' ' : MORPH_GLYPHS[(step + i) % MORPH_GLYPHS.length]
      ).join('');

      this.states[token.id] = { id: token.id, currentText: prefix + scramble, isCorrupted: false, isMorphing: true };
      this.notify();
      this.timers.add(setTimeout(runStep, stepTime));
    };

    runStep();
  }

  private revertAllToWaking(): void {
    this.tokens.forEach((token) => {
      this.states[token.id] = { id: token.id, currentText: token.wakingText, isCorrupted: false, isMorphing: false };
    });
    this.notify();
  }

  private clearAllTimers(): void {
    this.timers.forEach((t) => clearTimeout(t));
    this.timers.clear();
  }

  private notify(): void {
    const snap = this.getSnapshot();
    this.subscribers.forEach((fn) => fn(snap));
  }

  public dispose(): void {
    this.clearAllTimers();
    this.unsubscribeAnchor();
  }
}

export const textMutator = new TextMutationController();
