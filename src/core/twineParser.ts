import { FlowLoopId, HapticPatternId, JuiceDirective, RuntimeVariables, SamayamVelava, StateMutation, StoryGraph, TextSegment, TwineChoice, TwinePassage } from './schema';

const PASSAGE_HEADER_RE = /^::\s*([^\[\n]+?)(?:\s*\[([^\]]*)\])?\s*$/gm;
const CHOICE_LINE_RE = /^\[\[([^\]|]+?)(?:->|\|)([^\]]+?)\](?:\[([^\]]+)\])?\]?\s*$/;
const MUTATE_TOKEN_RE = /\{mutate:\s*"([^"]+)"\s*->\s*"([^"]+)"(?:\s*@(\d+))?\}/g;
const SETTER_ITEM_RE = /\$([a-zA-Z0-9_]+)\s*(=|\+=|-=)\s*(true|false|-?\d+(?:\.\d+)?|"[^"]*")/g;

export function parseTweeStory(rawTwee: string): StoryGraph {
  const graph: StoryGraph = {};
  const headers: Array<{ name: string; tags: string; startIdx: number; bodyStart: number }> = [];

  let match: RegExpExecArray | null;
  while ((match = PASSAGE_HEADER_RE.exec(rawTwee)) !== null) {
    headers.push({
      name: match[1].trim(), tags: match[2]?.trim() ?? '',
      startIdx: match.index, bodyStart: PASSAGE_HEADER_RE.lastIndex,
    });
  }

  for (let i = 0; i < headers.length; i++) {
    const current = headers[i];
    const bodyEnd = i + 1 < headers.length ? headers[i + 1].startIdx : rawTwee.length;
    graph[current.name] = buildPassage(current.name, current.tags, rawTwee.slice(current.bodyStart, bodyEnd).trim());
  }
  return graph;
}

function buildPassage(name: string, rawTags: string, rawBody: string): TwinePassage {
  const directives = parseDirectives(rawTags);
  const choices: TwineChoice[] = [];
  const proseLines: string[] = [];

  for (const line of rawBody.split(/\r?\n/)) {
    const choiceMatch = CHOICE_LINE_RE.exec(line.trim());
    if (choiceMatch) {
      const setterBlock = choiceMatch[3] ?? '';
      choices.push({
        label: choiceMatch[1].trim(), targetPassage: choiceMatch[2].trim(),
        mutations: parseMutations(setterBlock), requiresAnchorHeld: setterBlock.includes('@anchor_held'),
      });
    } else {
      proseLines.push(line);
    }
  }

  const paragraphs = proseLines.join('\n').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
    .map((para, pIdx) => parseParagraphSegments(name, pIdx, para));

  return { name, directives, paragraphs, choices };
}

function parseDirectives(rawTags: string): JuiceDirective {
  const directives: JuiceDirective = {};
  for (const token of rawTags.split(/\s+/)) {
    if (!token.startsWith('#')) continue;
    const [key, val] = token.slice(1).split(':');
    if (!val) continue;
    if (key === 'samayam') directives.samayam = val.toUpperCase() as SamayamVelava;
    else if (key === 'flow') directives.flow = val as FlowLoopId;
    else if (key === 'audio') directives.audio = val;
    else if (key === 'haptic') directives.haptic = val as HapticPatternId;
    else if (key === 'vignette') directives.vignette = parseFloat(val);
    else if (key === 'balma') directives.balmaDelta = parseInt(val, 10);
    else if (key === 'tanikama') directives.tanikamaDelta = parseInt(val, 10);
  }
  return directives;
}

function parseMutations(setterBlock: string): StateMutation[] {
  const mutations: StateMutation[] = [];
  let match: RegExpExecArray | null;
  SETTER_ITEM_RE.lastIndex = 0;
  while ((match = SETTER_ITEM_RE.exec(setterBlock)) !== null) {
    const [, variable, operator, rawVal] = match;
    const value = rawVal === 'true' ? true : rawVal === 'false' ? false : rawVal.startsWith('"') ? rawVal.slice(1, -1) : Number(rawVal);
    mutations.push({ variable, operator: operator as StateMutation['operator'], value });
  }
  return mutations;
}

function parseParagraphSegments(passageName: string, pIdx: number, text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  let lastIndex = 0, tokenIdx = 0;
  let match: RegExpExecArray | null;
  MUTATE_TOKEN_RE.lastIndex = 0;

  while ((match = MUTATE_TOKEN_RE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'plain', text: text.slice(lastIndex, match.index) });
    }
    segments.push({
      type: 'mutate', id: `${passageName}_p${pIdx}_m${tokenIdx++}`,
      wakingText: match[1], corruptedText: match[2],
      delayMs: match[3] ? parseInt(match[3], 10) : 2800,
    });
    lastIndex = MUTATE_TOKEN_RE.lastIndex;
  }
  if (lastIndex < text.length) segments.push({ type: 'plain', text: text.slice(lastIndex) });
  return segments;
}

export function applyStateMutations(state: RuntimeVariables, mutations: StateMutation[]): RuntimeVariables {
  const next = { ...state };
  for (const { variable, operator, value } of mutations) {
    if (operator === '=') next[variable] = value;
    else if (operator === '+=' && typeof value === 'number') next[variable] = Number(next[variable] ?? 0) + value;
    else if (operator === '-=' && typeof value === 'number') next[variable] = Number(next[variable] ?? 0) - value;
  }
  return next;
}
