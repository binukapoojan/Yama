// scripts/generate-whispers.js
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const AUDIO_DIR = path.join(ROOT_DIR, 'public/audio');

const API_KEY = process.env.FISH_API_KEY || 'sk-fish-Mw8A5Wsx30YykYzdX_vtD2-HT3NWcfJpGDBF8KuMhjM';
const ENDPOINT = 'https://api.fish.audio/v1/tts';

const WHISPERS = [
  {
    file: 'raw_roommate.mp3',
    text: "(breathless) (whispering) Mahl-lee... open the bolt quick... I'm soaked... let me in.",
  },
  {
    file: 'raw_kalu_ear.mp3',
    text: "(whispering) (slow) You are alone in the dark... un-clench your hand... drop the iron.",
  },
  {
    file: 'raw_mohini_name.mp3',
    text: "(sobbing) (whispering) Ah-neh... wait for me in the rain...",
  },
  {
    file: 'raw_mohini_baby.mp3',
    text: "(crying) (trembling) Ah-neh mahl-lee... hold my baby for one second... my hands are so cold...",
  },
  {
    file: 'raw_amma_courtyard.mp3',
    text: "(raspy) (whispering) Poo-thaa... bring the pan out into the dark...",
  },
  {
    file: 'raw_riri_rafters.mp3',
    text: "(raspy) (whispering) Warm blood on your thumb... give it to the hearth...",
  },
  {
    file: 'raw_pilgrim_boar.mp3',
    text: "(deep) (whispering) Give me the meat wrapped on your iron frame, mahl-lee...",
  },
  {
    file: 'raw_mahasona.mp3',
    text: "(deep) (raspy) Turn around... look behind your wheel...",
  },
];

async function generateAll() {
  if (!fs.existsSync(AUDIO_DIR)) {
    fs.mkdirSync(AUDIO_DIR, { recursive: true });
  }

  console.log(`Starting Fish Audio synthesis for ${WHISPERS.length} horror whisper stems...`);

  for (let i = 0; i < WHISPERS.length; i++) {
    const { file, text } = WHISPERS[i];
    const outPath = path.join(AUDIO_DIR, file);
    console.log(`[${i + 1}/${WHISPERS.length}] Synthesizing ${file}...`);
    console.log(`   Text: "${text}"`);

    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'model': 's2.1-pro-free',
        },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`API error (${res.status}): ${errText}`);
      }

      const buffer = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(outPath, buffer);
      console.log(`   ✓ Saved ${file} (${buffer.length} bytes)`);
    } catch (err) {
      console.error(`   ✗ Failed generating ${file}:`, err);
      process.exit(1);
    }

    // Small breathing pause between API requests
    await new Promise((r) => setTimeout(r, 600));
  }

  console.log('\nAll 8 raw whisper stems generated successfully!');
}

generateAll();
