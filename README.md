# After Monsoon · The Samayam Anthology (`කළු කුමාර සහ සමයම් පුස්කොළය`)

> *A zero-backend, tactile Sri Lankan folk-horror narrative engine and ethnographic ledger built with React 19, TypeScript, Tailwind CSS v4, Web Audio API, Workbox PWA, and Capacitor 7 Android.*

---

## 1. Architectural Guardrails (`.antigravity`)

This codebase enforces strict structural constraints validated on every push via `.github/workflows/deploy.yml`:

1. **The 120-Line Ceiling:** Every `.ts`, `.tsx`, and `.css` file inside `src/` (excluding the generated `compiledStory.json`) must remain strictly **$\le$ 120 lines**.
2. **Zero-SaaS Diegetic UI:** No generic progress bars, toast notifications, or modern modal chrome. All interfaces are modeled after Sri Lankan ritual artifacts: oil-rubbed *Puskola Potha* palm-leaf manuscripts, backlit *Bulath* (betel) leaves, woven *Pan Pedura* funeral mats, and *Sataravaram* copper yantras.
3. **Zero-Backend Multiplayer Triage (`bulathCodec`):** Asynchronous two-player sessions (*Athura* victim $\rightarrow$ *Kattadiya* ritual specialist) serialize 20 taboo flags, *Balma* (demonic gaze), and *Tanikama* (pathological aloneness) into a 5-bit hexadecimal share code (`BH-XX-MMMM`) or Base64 URL parameter (`?bulath=...`) shared over WhatsApp.
4. **Procedural Web Audio DSP:** All acoustic stems—monsoon rain, 54Hz CEB transformer hum, Matara firewood/oil crackle, *Yak Bera* drum strikes, systolic-diastolic arterial pulses, and the 528Hz cold-iron ward harmonic—are synthesized in real time via `src/juice/audioMixer.ts` with zero external MP3 dependencies.

---

## 2. The Four-Demon Anthology Matrix

| Casefile | Demon & Locale | *Samayam* Watch | Sensory Avatar (`Bits 0–2`) | Physical Avatar (`Bits 3–4`) | Tactile SVG Climax Ritual & Mantra |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`CF01`** | **Kalu Kumāra** *(Nugegoda Bodima)* | `SANDHYA_DUSK` *(6:00 PM)* | `HANDUN_KUMARA` (`BH-HK-...`) | `VATHA_KUMARA` (`BH-VK-...`) | `PideniThattuwaCanvas` *(Altar Offering)* $\rightarrow$ `RATA_YAKUMA` |
| **`CF02`** | **Mala Mōhinī** *(Kandy Lake Road)* | `MADDHAMA_MIDNIGHT` *(11:45 PM)* | `MALA_MOHINI` (`BH-MM-...`) | `RATI_MOHINI` (`BH-RM-...`) | `MohiniMaskPaliyaCanvas` *(3 Masks & Banana Trunk)* $\rightarrow$ `PATTINI_VARAMA` |
| **`CF03`** | **Rīri Yakā** *(Matara Kitchen)* | `SANDHYA_DUSK` *(Lē Irabatuwa)* | `MARU_RIRI` (`BH-MR-...`) | `SOHON_RIRI` (`BH-SR-...`) | `RiriMatFuneralCanvas` *(Woven-Mat Mock Funeral)* $\rightarrow$ `RIRI_VARAMA` |
| **`CF04`** | **Mahasōnā** *(Anuradhapura Junction)* | `MADDHAMA_MIDNIGHT` *(11:52 PM)* | `JAYASENA_YAKA` (`BH-JY-...`) | `MAHA_SOHONA` (`BH-MS-...`) | `MahasonaCardDuelCanvas` *(Kōlama Card Duel & Flare)* $\rightarrow$ `GOTHAIMBARA_VARAMA` |

---

## 3. Repository Directory Structure

```text
├── .antigravity/
│   └── ARCHITECTURE_RULES.md          # 120-line ceiling & diegetic UI rules
├── .github/workflows/
│   └── deploy.yml                     # CI gatekeeper, Vitest, Firebase & Signed APK release
├── public/
│   ├── .well-known/assetlinks.json    # Android App Links SHA-256 verification
│   ├── flow-loops/*.webm              # 16 muted VP9 cinemagraph loops (<1.5MB each)
│   ├── icons/*                        # Maskable, monochrome & vector Kundaliya icons
│   └── manifest.webmanifest           # Standalone fullscreen portrait PWA spec
├── scripts/
│   └── encode-flow-loops.sh           # 2-pass FFmpeg VP9 batch encoder with 0.5s xfade
├── story-twine/
│   ├── scripts/compile-twee-to-json.ts # Build-time Twee3 validator & AST compiler
│   ├── casefile01_kalu_kumara.twee    # 17 passages (Nugegoda)
│   ├── casefile02_mohini.twee         # 18 passages (Kandy)
│   ├── casefile03_riri_yaka.twee      # 18 passages (Matara)
│   └── casefile04_mahasona.twee       # 18 passages (Anuradhapura)
└── src/
    ├── core/                          # Schema, Twee parser, Bulath codec, persistence, tests
    ├── juice/                         # Event bus, Web Audio DSP, haptics, lamp physics, mutator
    └── components/
        ├── viewport/                  # 16-loop FlowBackdrop & spring-damped ChiaroscuroMask
        ├── narrative/                 # Dual-script ProseStream & ward-locked choices
        ├── diegetic/                  # IronKeyAnchor, BulathLeaf, 4 Ritual Canvases, Compendium
        └── debug/                     # [~] Real-time FFT Acoustic Workbench
```

---

## 4. Custom Twee3 Authoring & Directive Syntax

All narrative scripts reside in `story-twine/*.twee` and are compiled via `npm run sync-story`.

### Passage Header Directives

```twee
:: Passage_Name [#samayam:MADDHAMA_MIDNIGHT #flow:iron_sickle_ember #audio:arterial_pulse #haptic:heartbeat_panic #vignette:0.84 #balma:15 #tanikama:-5]
```

- `#samayam`: `ALUYA_DAWN` | `IRA_MUDUN_MIDDAY` | `SANDHYA_DUSK` | `MADDHAMA_MIDNIGHT`
- `#flow`: One of the 16 validated `FlowLoopId` `.webm` identifiers.
- `#audio`: `monsoon_light` | `monsoon_heavy` | `ceb_power_cut` | `yak_bera_ritual` | `hearth_crackle` | `arterial_pulse`
- `#haptic`: `heartbeat_slow` | `heartbeat_panic` | `dread_throb` | `iron_grip`
- `#vignette`: Float (`0.20` to `0.95`) controlling radial chiaroscuro darkness.
- `#balma:` / `#tanikama:`: Signed integer delta applied automatically on passage entry.

### Unreliable Gaslighting Tokens (`{mutate}`)

```text
The clock reads {mutate: "6:14 PM" -> "6:66 PM" @2400} in the dark.
```

Renders the waking text first, then morphs character-by-character into the corrupted string after 2400ms unless the player holds the Cold Iron Ward (`IronKeyAnchor` / `[Spacebar]`), which locks waking reality in place.

### Ward-Gated Choices & State Mutations

```text
[[Touch the cold iron sickle and step back->Safe_Passage][@anchor_held $balma -= 10,$taboo_unwashed_blood = false]]
```

Prefixing the mutation block with `@anchor_held` disables the choice button until the player physically holds the iron ward with a second finger (or `[Spacebar]` on desktop).

---

## 5. Bulath Hurulla 5-Bit Diagnostic Specification

When an Athura player succumbs, `encodeBulathPayload()` packs their five casefile-specific taboo violations into a 5-bit integer (`0x00`–`0x1F`) mapped to five anatomical coordinates on the backlit betel leaf:

| Bit | Hex | Blemish Type & Leaf Coordinate | CF01 (Kalu Kumara) | CF02 (Mala Mohini) | CF03 (Riri Yaka) | CF04 (Mahasona) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Bit 0** | `0x01` | `DARK_BRUISE` `(0.50, 0.20)` | `taboo_bathed_dusk` | `taboo_walked_samayam` | `taboo_fried_pulutu` | `taboo_whistled_crossroads` |
| **Bit 1** | `0x02` | `VEIN_KNOT` `(0.35, 0.38)` | `taboo_hair_unbound` | `taboo_answered_call` | `taboo_unwashed_blood` | `taboo_carried_uncovered_meat` |
| **Bit 2** | `0x04` | `PINHOLE_TEAR` `(0.50, 0.52)` | `taboo_mirror_unshrouded` | `taboo_met_eyes` | `taboo_plucked_wadamal` | `taboo_looked_back_snap` |
| **Bit 3** | `0x08` | `OILY_SHEEN` `(0.66, 0.60)` | `taboo_sweet_snacks` | `taboo_mirrored_gesture` | `taboo_crossed_anthill` | `taboo_stepped_ash_pot` |
| **Bit 4** | `0x10` | `STEM_ROT` `(0.50, 0.79)` | `taboo_laundry` | `taboo_accepted_bundle` | `taboo_tasted_hearth_ash` | `taboo_cursed_boar_shadow` |

### Quick-Test Diagnostic Share Codes

Append `?bulath=<CODE>` to the local or production URL to test Kattadiya triage directly:

- **Casefile 01:** `?bulath=BH-HK-1541` (Handun Kumāra) · `?bulath=BH-VK-1832` (Vātha Kumāra)
- **Casefile 02:** `?bulath=BH-MM-053C` (Mala Mōhinī) · `?bulath=BH-RM-1848` (Rati Mōhinī)
- **Casefile 03:** `?bulath=BH-MR-0758` (Maru Rīri) · `?bulath=BH-SR-1840` (Sohon Rīri)
- **Casefile 04:** `?bulath=BH-JY-054E` (Jayasēna Yakā) · `?bulath=BH-MS-185C` (Maha Sohōnā)

---

## 6. Build, Test & Deployment Commands

| Command | Action |
| :--- | :--- |
| `npm install` | Installs React 19, Vite 6, Tailwind v4, Vitest, Workbox, and Capacitor 7. |
| `npm run sync-story` | Audits all 4 `.twee` files (71 passages) for broken links, orphans, or invalid directives and writes `src/core/compiledStory.json`. |
| `npm test` | Runs Vitest unit suites (`engine.test.ts` & `persistence.test.ts`) verifying all 8 avatars, bitmask round-trips, and lifecycle saves. |
| `npm run dev` | Compiles Twine stories and launches the Vite development server (`[~]` toggles the live FFT Acoustic Workbench; `[Spacebar]` holds the Cold Iron Ward). |
| `npm run encode-flows` | Batch-converts raw Google Flow `.mp4` renders in `raw-flow-mp4/` into seamless 2-pass VP9 `.webm` loops under 1.45 MB. |
| `npm run build` | Runs sync-story, strict `tsc -b`, and builds the offline-first Workbox PWA bundle into `dist/`. |
| `npx cap sync android` | Copies the compiled `dist/` web bundle into the native Capacitor Android project. |
