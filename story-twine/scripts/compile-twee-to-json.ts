// story-twine/scripts/compile-twee-to-json.ts
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CasefileId } from '../../src/core/bulathCodec';
import { FlowLoopId, HapticPatternId, SamayamVelava, StoryGraph } from '../../src/core/schema';
import { parseTweeStory } from '../../src/core/twineParser';

const __dirname = path.dirname(fileURLToPath(import.meta.url)), ROOT_DIR = path.resolve(__dirname, '../..');
const TWINE_DIR = path.join(ROOT_DIR, 'story-twine'), OUT_JSON_PATH = path.join(ROOT_DIR, 'src/core/compiledStory.json'), FLOW_DIR = path.join(ROOT_DIR, 'public/flow-loops');

const CASEFILE_MANIFEST: ReadonlyArray<{
  id: CasefileId;
  file: string;
  entries: readonly string[];
}> = [
  { id: 'CF01', file: 'casefile01_kalu_kumara.twee', entries: ['Dusk_Balcony_Check', 'Kattadiya_Sastra_Entry'] },
  { id: 'CF02', file: 'casefile02_mohini.twee', entries: ['Upper_Lake_Mist_Start', 'Kattadiya_Mohini_Entry'] },
  { id: 'CF03', file: 'casefile03_riri_yaka.twee', entries: ['Crimson_Hearth_Start', 'Kattadiya_Riri_Entry'] },
  { id: 'CF04', file: 'casefile04_mahasona.twee', entries: ['Crossroads_Midnight_Start', 'Kattadiya_Mahasona_Entry'] },
];

const VALID_FLOWS = new Set<FlowLoopId>([
  'bodima_rain_window', 'pahana_steady', 'pahana_nil_manel', 'mirror_dark_idle',
  'kandy_mist_bamboo', 'mohini_saree_silhouette', 'kaduru_puddle_feet', 'sanni_mask_torch',
  'matara_hearth_smoke', 'wadamal_blood_hedge', 'iron_sickle_ember', 'peduru_funeral_mat',
  'thummansala_banyan_wind', 'sohon_boar_silhouette', 'iron_betel_cutter_ash', 'dummala_vidiya_cards',
]);
const VALID_SAMAYAM = new Set<SamayamVelava>(['ALUYA_DAWN', 'IRA_MUDUN_MIDDAY', 'SANDHYA_DUSK', 'MADDHAMA_MIDNIGHT']);
const VALID_HAPTICS = new Set<HapticPatternId>(['heartbeat_slow', 'heartbeat_panic', 'dread_throb', 'iron_grip']);

function compileAnthology(): void {
  const compiledAnthology: Partial<Record<CasefileId, StoryGraph>> = {}, errors: string[] = [], warnings: string[] = [];
  let totalPassages = 0;

  for (const spec of CASEFILE_MANIFEST) {
    const filePath = path.join(TWINE_DIR, spec.file);
    if (!fs.existsSync(filePath)) {
      errors.push(`[${spec.id}] Missing source file: story-twine/${spec.file}`);
      continue;
    }

    const rawTwee = fs.readFileSync(filePath, 'utf-8');
    auditRawLines(spec.id, rawTwee, errors);

    const graph = parseTweeStory(rawTwee);
    const passageIds = new Set(Object.keys(graph));
    const reachable = new Set<string>(spec.entries);

    for (const entry of spec.entries) {
      if (!passageIds.has(entry)) errors.push(`[${spec.id}] Required entry passage ":: ${entry}" is missing in ${spec.file}.`);
    }

    for (const [name, passage] of Object.entries(graph)) {
      if (passage.directives.flow) {
        const webmPath = path.join(FLOW_DIR, `${passage.directives.flow}.webm`);
        if (!fs.existsSync(webmPath)) {
          warnings.push(`[${spec.id}:${name}] Flow video missing on disk: public/flow-loops/${passage.directives.flow}.webm`);
        }
      }
      passage.paragraphs.forEach((para, pIdx) => {
        for (const seg of para) {
          if (seg.type === 'plain' && (/\{mutate/i.test(seg.text) || /"->"/i.test(seg.text))) {
            errors.push(`[${spec.id}:${name}] Para ${pIdx + 1} has malformed {mutate} syntax: "${seg.text}"`);
          }
        }
      });
      for (const choice of passage.choices) {
        if (!passageIds.has(choice.targetPassage)) {
          errors.push(`[${spec.id}:${name}] Broken link -> "${choice.targetPassage}" does not exist in ${spec.file}.`);
        } else {
          reachable.add(choice.targetPassage);
        }
      }
    }

    for (const id of passageIds) {
      if (!reachable.has(id)) warnings.push(`[${spec.id}:${id}] Orphan passage: no incoming choice links.`);
    }

    compiledAnthology[spec.id] = graph;
    totalPassages += passageIds.size;
  }

  warnings.forEach((w) => console.warn(`\x1b[33mWARN:\x1b[0m ${w}`));
  if (errors.length > 0) {
    errors.forEach((e) => console.error(`\x1b[31mERROR:\x1b[0m ${e}`));
    process.exit(1);
  }

  fs.writeFileSync(OUT_JSON_PATH, JSON.stringify(compiledAnthology, null, 2), 'utf-8');
  console.log(`\x1b[32m[TWEE OK]\x1b[0m Validated ${CASEFILE_MANIFEST.length} casefiles (${totalPassages} passages) -> src/core/compiledStory.json`);
}

function auditRawLines(caseId: CasefileId, rawTwee: string, errors: string[]): void {
  rawTwee.split(/\r?\n/).forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('::')) {
      const tagMatch = /\[([^\]]*)\]/.exec(trimmed);
      const tags = tagMatch ? tagMatch[1].trim().split(/\s+/).filter(Boolean) : [];
      for (const tag of tags) {
        if (!tag.startsWith('#')) continue;
        const [k, v] = tag.slice(1).split(':');
        if (k === 'flow' && !VALID_FLOWS.has(v as FlowLoopId)) errors.push(`[${caseId}:L${idx + 1}] Invalid #flow "${v}".`);
        if (k === 'samayam' && !VALID_SAMAYAM.has((v ?? '').toUpperCase() as SamayamVelava)) errors.push(`[${caseId}:L${idx + 1}] Invalid #samayam "${v}".`);
        if (k === 'haptic' && !VALID_HAPTICS.has(v as HapticPatternId)) errors.push(`[${caseId}:L${idx + 1}] Invalid #haptic "${v}".`);
      }
    } else if (trimmed.includes('[[') && !/^\[\[([^\]|]+?)(?:->|\|)([^\]]+?)\](?:\[([^\]]*)\])?\]?/.test(trimmed)) {
      errors.push(`[${caseId}:L${idx + 1}] Malformed choice syntax: "${trimmed}"`);
    }
  });
}

compileAnthology();
