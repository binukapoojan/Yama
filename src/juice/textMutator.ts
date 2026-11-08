import { TextSegment, TwinePassage } from '../core/schema';
import { juiceDirector } from './JuiceDirector';

export interface MutatedTokenState {
  id: string;
  currentText: string;
  isCorrupted: boolean;
  isMorphing: boolean;
}

type MutationSubscriber = (snapshot: Record<string, MutatedTokenState>) => void;
type MutateToken = Extract<TextSegment, { type: 'mutate' }>;

const MORPH_GLYPHS = '·:;~*+=÷';
const MORPH_STEPS = 7;
const STEP_MS = 60;

export class TextMutationController {
  private states: Record<string, MutatedTokenState> = {};
  private tokens: Map<string, MutateToken> = new Map();
  private timers: Set<ReturnType<typeof setTimeout>> = new Set();
  private subscribers: Set<MutationSubscriber> = new Set();

  constructor() {
    juiceDirector.on('ANCHOR_STATE_CHANGE', ({ held }) => {
      if (held) {
        this.clearAllTimers();
        this.revertAllToWaking();
      } else {
        this.scheduleAllPending();
      }
    });
  }

  public subscribe(fn: MutationSubscriber): () => void {
    this.subscribers.add(fn);
    fn({ ...this.states });
    return () => this.subscribers.delete(fn);
  }

  public getSnapshot(): Record<string, MutatedTokenState> {
    return { ...this.states };
  }

  public loadPassage(passage: TwinePassage): void {
    this.clearAllTimers();
    this.tokens.clear();
    this.states = {};
    for (const para of passage.paragraphs) {
      for (const seg of para) {
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
      if (!this.states[token.id]?.isCorrupted) {
        this.timers.add(setTimeout(() => this.morphToken(token, 0), token.delayMs));
      }
    });
  }

  private morphToken(token: MutateToken, step: number): void {
    if (juiceDirector.isAnchorHeld()) return this.revertAllToWaking();
    const nextStep = step + 1;
    if (nextStep >= MORPH_STEPS) {
      this.states[token.id] = { id: token.id, currentText: token.corruptedText, isCorrupted: true, isMorphing: false };
      return this.notify();
    }
    const ratio = nextStep / MORPH_STEPS;
    const len = Math.round(token.wakingText.length + (token.corruptedText.length - token.wakingText.length) * ratio);
    const rev = Math.floor(len * ratio);
    const scramble = Array.from({ length: Math.max(0, len - rev) }, (_, i) =>
      token.corruptedText[rev + i] === ' ' ? ' ' : MORPH_GLYPHS[(nextStep + i) % MORPH_GLYPHS.length]
    ).join('');

    this.states[token.id] = { id: token.id, currentText: token.corruptedText.slice(0, rev) + scramble, isCorrupted: false, isMorphing: true };
    this.notify();
    this.timers.add(setTimeout(() => this.morphToken(token, nextStep), STEP_MS));
  }

  private revertAllToWaking(): void {
    this.tokens.forEach((t) => {
      this.states[t.id] = { id: t.id, currentText: t.wakingText, isCorrupted: false, isMorphing: false };
    });
    this.notify();
  }

  private clearAllTimers(): void {
    this.timers.forEach(clearTimeout);
    this.timers.clear();
  }

  private notify(): void {
    const snap = { ...this.states };
    this.subscribers.forEach((fn) => fn(snap));
  }
}

export const textMutator = new TextMutationController();
