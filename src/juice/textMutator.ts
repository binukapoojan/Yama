// src/juice/textMutator.ts
import { getScarForPassage } from '../core/memoryScars';
import { TwinePassage } from '../core/schema';
import { juiceDirector } from './JuiceDirector';

export interface MutatedTokenState {
  id: string;
  wakingText: string;
  corruptedText: string;
  currentText: string;
  isCorrupted: boolean;
  isMorphing: boolean;
}

type MutatorListener = (state: Record<string, MutatedTokenState>) => void;

class TextMutatorEngine {
  private tokens: Record<string, MutatedTokenState> = {};
  private corruptedTokens: Set<string> = new Set();
  private timers: Array<ReturnType<typeof setTimeout>> = [];
  private listeners: Set<MutatorListener> = new Set();
  private anchorHeld = false;

  constructor() {
    juiceDirector.on('ANCHOR_STATE_CHANGE', ({ held }) => {
      this.anchorHeld = held;
      this.syncAllTokensToAnchor();
    });
  }

  public loadPassage(passage: TwinePassage): void {
    this.clearTimers();
    this.tokens = {};
    this.corruptedTokens.clear();
    const activeScar = getScarForPassage(passage.name);
    let scarInjected = false;

    passage.paragraphs.forEach((p) => {
      p.forEach((seg) => {
        if (seg.type !== 'mutate') return;
        const corruptedText = activeScar && !scarInjected ? activeScar.corruptedOverride : seg.corruptedText;
        if (activeScar && !scarInjected) scarInjected = true;

        this.tokens[seg.id] = {
          id: seg.id, wakingText: seg.wakingText, corruptedText,
          currentText: seg.wakingText, isCorrupted: false, isMorphing: false,
        };

        const delay = Math.max(400, seg.delayMs);
        const t1 = setTimeout(() => {
          if (this.anchorHeld || !this.tokens[seg.id]) return;
          this.tokens[seg.id].isMorphing = true;
          this.emit();
        }, delay - 240);

        const t2 = setTimeout(() => {
          this.corruptedTokens.add(seg.id);
          if (this.anchorHeld || !this.tokens[seg.id]) return;
          this.tokens[seg.id].isMorphing = false;
          this.tokens[seg.id].isCorrupted = true;
          this.tokens[seg.id].currentText = corruptedText;
          this.emit();
        }, delay);

        this.timers.push(t1, t2);
      });
    });
    this.emit();
  }

  private syncAllTokensToAnchor(): void {
    Object.values(this.tokens).forEach((tok) => {
      tok.isMorphing = false;
      if (this.anchorHeld) {
        tok.currentText = tok.wakingText;
        tok.isCorrupted = false;
      } else if (this.corruptedTokens.has(tok.id)) {
        tok.currentText = tok.corruptedText;
        tok.isCorrupted = true;
      }
    });
    this.emit();
  }

  private clearTimers(): void {
    this.timers.forEach(clearTimeout);
    this.timers = [];
  }

  public getSnapshot(): Record<string, MutatedTokenState> {
    return { ...this.tokens };
  }

  public subscribe(fn: MutatorListener): () => void {
    this.listeners.add(fn);
    fn(this.getSnapshot());
    return () => this.listeners.delete(fn);
  }

  private emit(): void {
    const snap = this.getSnapshot();
    this.listeners.forEach((fn) => fn(snap));
  }
}

export const textMutator = new TextMutatorEngine();
