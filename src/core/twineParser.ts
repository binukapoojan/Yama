import {
  FlowLoopId,
  HapticPatternId,
  JuiceDirective,
  RuntimeVariables,
  SamayamVelava,
  StateMutation,
  StoryGraph,
  TextSegment,
  TwineChoice,
  TwinePassage,
} from './schema';

const PASSAGE_HEADER_RE = /^::\s*([^\[\n]+?)(?:\s*\[([^\]]*)\])?\s*$/gm;
const CHOICE_LINE_RE = /^\[\[([^\]|]+?)(?:->|\|)([^\]]+?)\](?:\]?\[([^\]]+)\]\]?|\])\s*$/;
const MUTATE_TOKEN_RE = /\{mutate:\s*"([^"]+)"\s*->\s*"([^"]+)"(?:\s*@(\d+))?\}/g;
const SETTER_ITEM_RE = /\$([a-zA-Z0-9_]+)\s*(=|\+=|-=)\s*(true|false|-?\d+(?:\.\d+)?|"[^"]*")/g;

export function parseTweeStory(rawTwee: string): StoryGraph {
  const graph: StoryGraph = {};
  const headers: Array<{ name: string; tags: string; startIdx: number; bodyStart: number }> = [];
  let match: RegExpExecArray | null;
  PASSAGE_HEADER_RE.lastIndex = 0;

  while ((match = PASSAGE_HEADER_RE.exec(rawTwee)) !== null) {
    headers.push({ name: match[1].trim(), tags: match[2]?.trim() ?? '', startIdx: match.index, bodyStart: PASSAGE_HEADER_RE.lastIndex });
  }
  for (let i = 0; i < headers.length; i++) {
    const cur = headers[i];
    const bodyEnd = i + 1 < headers.length ? headers[i + 1].startIdx : rawTwee.length;
    graph[cur.name] = buildPassage(cur.name, cur.tags, rawTwee.slice(cur.bodyStart, bodyEnd).trim());
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
      const setter = choiceMatch[3] ?? '';
      choices.push({ label: choiceMatch[1].trim(), targetPassage: choiceMatch[2].trim(), mutations: parseMutations(setter), requiresAnchorHeld: setter.includes('@anchor_held') });
    } else {
      proseLines.push(line);
    }
  }
  const paragraphs = proseLines.join('\n').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean).map((p, idx) => parseSegments(name, idx, p));
  return { name, directives, paragraphs, choices };
}

function parseDirectives(rawTags: string): JuiceDirective {
  const d: JuiceDirective = {};
  for (const token of rawTags.split(/\s+/)) {
    if (!token.startsWith('#')) continue;
    const [k, v] = token.slice(1).split(':');
    if (!v) continue;
    if (k === 'samayam') d.samayam = v.toUpperCase() as SamayamVelava;
    if (k === 'flow') d.flow = v as FlowLoopId;
    if (k === 'audio') d.audio = v;
    if (k === 'haptic') d.haptic = v as HapticPatternId;
    if (k === 'vignette') d.vignette = parseFloat(v);
    if (k === 'balma') d.balmaDelta = parseInt(v, 10);
    if (k === 'tanikama') d.tanikamaDelta = parseInt(v, 10);
  }
  return d;
}

function parseMutations(setterBlock: string): StateMutation[] {
  const list: StateMutation[] = [];
  let m: RegExpExecArray | null;
  SETTER_ITEM_RE.lastIndex = 0;
  while ((m = SETTER_ITEM_RE.exec(setterBlock)) !== null) {
    const [, variable, operator, raw] = m;
    const value = raw === 'true' ? true : raw === 'false' ? false : raw.startsWith('"') ? raw.slice(1, -1) : Number(raw);
    list.push({ variable, operator: operator as StateMutation['operator'], value });
  }
  return list;
}

function parseSegments(passageName: string, pIdx: number, text: string): TextSegment[] {
  const segs: TextSegment[] = [];
  let last = 0, tIdx = 0, m: RegExpExecArray | null;
  MUTATE_TOKEN_RE.lastIndex = 0;
  while ((m = MUTATE_TOKEN_RE.exec(text)) !== null) {
    if (m.index > last) segs.push({ type: 'plain', text: text.slice(last, m.index) });
    segs.push({ type: 'mutate', id: `${passageName}_p${pIdx}_m${tIdx++}`, wakingText: m[1], corruptedText: m[2], delayMs: m[3] ? parseInt(m[3], 10) : 2800 });
    last = MUTATE_TOKEN_RE.lastIndex;
  }
  if (last < text.length) segs.push({ type: 'plain', text: text.slice(last) });
  return segs;
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
