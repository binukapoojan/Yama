import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlowLoopId, HapticPatternId, SamayamVelava, StoryGraph } from '../../src/core/schema';
import { parseTweeStory } from '../../src/core/twineParser';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '../..');
const TWEE_PATH = path.join(ROOT_DIR, 'story-twine/casefile01_kalu_kumara.twee');
const OUT_JSON_PATH = path.join(ROOT_DIR, 'src/core/compiledStory.json');
const FLOW_DIR = path.join(ROOT_DIR, 'public/flow-loops');

const VALID_FLOWS = new Set<FlowLoopId>([
  'bodima_rain_window',
  'pahana_steady',
  'pahana_nil_manel',
  'mirror_dark_idle',
]);
const VALID_SAMAYAM = new Set<SamayamVelava>([
  'ALUYA_DAWN',
  'IRA_MUDUN_MIDDAY',
  'SANDHYA_DUSK',
  'MADDHAMA_MIDNIGHT',
]);
const VALID_HAPTICS = new Set<HapticPatternId>([
  'heartbeat_slow',
  'heartbeat_panic',
  'dread_throb',
  'iron_grip',
]);
const ENTRY_PASSAGES = new Set(['Dusk_Balcony_Check', 'Kattadiya_Sastra_Entry']);

function validateAndCompile(): void {
  if (!fs.existsSync(TWEE_PATH)) {
    console.error(`[TWEE ERROR] Missing source file: ${TWEE_PATH}`);
    process.exit(1);
  }

  const rawTwee = fs.readFileSync(TWEE_PATH, 'utf-8');
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Raw Line-Level Syntax Audit (Unclosed brackets & invalid header tags)
  rawTwee.split(/\r?\n/).forEach((line, idx) => {
    const lineNum = idx + 1;
    const trimmed = line.trim();
    if (trimmed.startsWith('::')) {
      const tagMatch = /\[([^\]]*)\]/.exec(trimmed);
      const rawTags = tagMatch ? tagMatch[1].trim().split(/\s+/).filter(Boolean) : [];
      for (const tag of rawTags) {
        if (!tag.startsWith('#')) continue;
        const [k, v] = tag.slice(1).split(':');
        if (k === 'flow' && !VALID_FLOWS.has(v as FlowLoopId)) {
          errors.push(`Line ${lineNum}: Invalid #flow loop "${v}".`);
        }
        if (k === 'samayam' && !VALID_SAMAYAM.has((v ?? '').toUpperCase() as SamayamVelava)) {
          errors.push(`Line ${lineNum}: Invalid #samayam tag "${v}".`);
        }
        if (k === 'haptic' && !VALID_HAPTICS.has(v as HapticPatternId)) {
          errors.push(`Line ${lineNum}: Invalid #haptic pattern "${v}".`);
        }
      }
    } else if (trimmed.includes('[[') && !/^\[\[([^\]|]+?)(?:->|\|)([^\]]+?)\](?:\[([^\]]+)\])?\]?/.test(trimmed)) {
      errors.push(`Line ${lineNum}: Malformed choice link syntax: "${trimmed}"`);
    }
  });

  // 2. Structural Graph & {mutate} Token Audit
  const graph: StoryGraph = parseTweeStory(rawTwee);
  const passageIds = new Set(Object.keys(graph));
  const incomingLinks = new Set<string>(ENTRY_PASSAGES);

  for (const [name, passage] of Object.entries(graph)) {
    if (passage.directives.flow) {
      const videoFile = path.join(FLOW_DIR, `${passage.directives.flow}.webm`);
      if (!fs.existsSync(videoFile)) {
        warnings.push(`[${name}] Flow video not yet on disk: public/flow-loops/${passage.directives.flow}.webm`);
      }
    }

    passage.paragraphs.forEach((para, pIdx) => {
      for (const seg of para) {
        if (seg.type === 'plain' && (/\{mutate/i.test(seg.text) || /"->"/i.test(seg.text))) {
          errors.push(`[${name}] Paragraph ${pIdx + 1} has malformed {mutate: "A" -> "B"} syntax: "${seg.text}"`);
        }
      }
    });

    for (const choice of passage.choices) {
      if (!passageIds.has(choice.targetPassage)) {
        errors.push(`[${name}] Broken choice link -> "${choice.targetPassage}" (target passage does not exist).`);
      } else {
        incomingLinks.add(choice.targetPassage);
      }
    }
  }

  for (const id of passageIds) {
    if (!incomingLinks.has(id)) {
      warnings.push(`[${id}] Orphan passage: no incoming choice links point to this passage.`);
    }
  }

  warnings.forEach((w) => console.warn(`\x1b[33mWARN:\x1b[0m ${w}`));
  if (errors.length > 0) {
    errors.forEach((e) => console.error(`\x1b[31mERROR:\x1b[0m ${e}`));
    process.exit(1);
  }

  fs.writeFileSync(OUT_JSON_PATH, JSON.stringify(graph, null, 2), 'utf-8');
  console.log(`\x1b[32m[TWEE OK]\x1b[0m Compiled ${passageIds.size} passages -> src/core/compiledStory.json`);
}

validateAndCompile();
