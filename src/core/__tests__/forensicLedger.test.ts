// src/core/__tests__/forensicLedger.test.ts
import { beforeEach, describe, expect, it } from 'vitest';
import { encodeBulathPayload } from '../bulathCodec';
import { CASEFILE_AVATAR_CANDIDATES, forensicLedger } from '../forensicLedger';
import { createInitialStateForCasefile } from '../savePersistence';

describe('True Forensic Avatar Marking Ledger', () => {
  beforeEach(() => {
    forensicLedger.reset();
  });

  it('defaults isMisdiagnosed to false when no diagnosis has been explicitly etched', () => {
    const state = createInitialStateForCasefile('CF01', 'ATHURA');
    const payload = encodeBulathPayload(state, 'CF01');
    expect(forensicLedger.isMisdiagnosed(payload)).toBe(false);
  });

  it('recognizes an accurate Avatar mark on the betel leaf without penalty', () => {
    const state = createInitialStateForCasefile('CF02', 'ATHURA');
    const payload = encodeBulathPayload(state, 'CF02');

    forensicLedger.markDiagnosis('CF02', payload.avatar);
    expect(forensicLedger.getMarkedAvatar('CF02')).toBe(payload.avatar);
    expect(forensicLedger.isMisdiagnosed(payload)).toBe(false);
  });

  it('flags a misdiagnosis when the wrong Avatar candidate is etched for the casefile', () => {
    const state = createInitialStateForCasefile('CF03', 'ATHURA');
    const payload = encodeBulathPayload(state, 'CF03');
    const wrongCandidate = CASEFILE_AVATAR_CANDIDATES.CF03.find((c) => c.id !== payload.avatar)!;

    forensicLedger.markDiagnosis('CF03', wrongCandidate.id);
    expect(forensicLedger.isMisdiagnosed(payload)).toBe(true);
  });
});
