import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlowLoopId, HapticPatternId, SamayamVelava, StoryGraph } from '../../src/core/schema';
import { parseTweeStory } from '../../src/core/twineParser';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '../..');
const TWEE_FILES = [
  path.join(ROOT_DIR, 'story-twine/casefile01_kalu_kumara.twee'),
  path.join(ROOT_DIR, 'story-twine/casefile02_mohini.twee'),
];
const OUT_JSON_PATH = path.join(ROOT_DIR, 'src/core/compiledStory.json');
const FLOW_DIR = path.join(ROOT_DIR, 'public/flow-loops');

const VALID_FLOWS = new Set<FlowLoopId>([
  'bodima_rain_window',
  'pahana_steady',
  'pahana_nil_manel',
  'mirror_dark_idle',
  'kandy_mist_bamboo',
  'mohini_saree_silhouette',
  'kaduru_puddle_feet',
  'sanni_mask_torch',
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
const ENTRY_PASSAGES = new Set([
  'Dusk_Balcony_Check',
  'Kattadiya_Sastra_Entry',
  'Upper_Lake_Mist_Start',
  'Kattadiya_Mohini_Entry',
]);

function validateAndCompile(): void {
  for (const filePath of TWEE_FILES) {
    if (!fs.existsSync(filePath)) {
      console.error(`[TWEE ERROR] Missing source file: ${filePath}`);
      process.exit(1);
    }
  }

  const errors: string[] = [];
  const warnings: string[] = [];
  const mergedGraph: StoryGraph = {};

  for (const filePath of TWEE_FILES) {
    const rawTwee = fs.readFileSync(filePath, 'utf-8');
    const fileName = path.basename(filePath);

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
            errors.push(`${fileName}:${lineNum}: Invalid #flow loop "${v}".`);
          }
          if (k === 'samayam' && !VALID_SAMAYAM.has((v ?? '').toUpperCase() as SamayamVelava)) {
            errors.push(`${fileName}:${lineNum}: Invalid #samayam tag "${v}".`);
          }
          if (k === 'haptic' && !VALID_HAPTICS.has(v as HapticPatternId)) {
            errors.push(`${fileName}:${lineNum}: Invalid #haptic pattern "${v}".`);
          }
        }
      } else if (trimmed.includes('[[') && !/^\[\[([^\]|]+?)(?:->|\|)([^\]]+?)\](?:\[([^\]]+)\])?\]?/.test(trimmed)) {
        errors.push(`${fileName}:${lineNum}: Malformed choice link syntax: "${trimmed}"`);
      }
    });

    const fileGraph = parseTweeStory(rawTwee);
    for (const [name, passage] of Object.entries(fileGraph)) {
      if (mergedGraph[name]) {
        errors.push(`Duplicate passage "${name}" found in ${fileName}.`);
      }
      mergedGraph[name] = passage;
    }
  }

  // 2. Structural Graph & {mutate} Token Audit
  const passageIds = new Set(Object.keys(mergedGraph));
  const incomingLinks = new Set<string>(ENTRY_PASSAGES);

  for (const [name, passage] of Object.entries(mergedGraph)) {
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

  fs.writeFileSync(OUT_JSON_PATH, JSON.stringify(mergedGraph, null, 2), 'utf-8');
  console.log(`\x1b[32m[TWEE OK]\x1b[0m Compiled ${passageIds.size} passages -> src/core/compiledStory.json`);
}

validateAndCompile();
