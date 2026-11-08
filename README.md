# After Monsoon · The Samayam Anthology (`කළු කුමාර සහ සමයම් පුස්කොළය`)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![CI/CD](https://github.com/binukapoojan/Yama/actions/workflows/deploy.yml/badge.svg)](https://github.com/binukapoojan/Yama/actions/workflows/deploy.yml)
[![Tests](https://img.shields.io/badge/Tests-87%20Passed-brightgreen.svg)]()
[![React 19](https://img.shields.io/badge/React-19.0-61dafb.svg?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8.svg?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-6.0-646cff.svg?logo=vite&logoColor=white)](https://vitejs.dev)
[![Capacitor](https://img.shields.io/badge/Capacitor-7_Android-119EFF.svg?logo=capacitor&logoColor=white)](https://capacitorjs.com)
[![PWA](https://img.shields.io/badge/PWA-Offline--First-orange.svg)]()

> *An offline-first, zero-backend, tactile Sri Lankan folk-horror narrative engine and ethnographic ledger.*
> Built with **React 19**, **TypeScript**, **Tailwind CSS v4**, **Web Audio API DSP**, **Workbox PWA**, and **Capacitor 7 Android**.

---

## 📖 Overview & Ethnographic Lore

Set against the suffocating humidity and monsoonal downpours of contemporary Sri Lanka, **After Monsoon** is an interactive folk-horror anthology rooted in ancient Sinhala demonological belief systems (*Yaksha Upattiya*, *Tovil*, and *Shanthikarma*).

In Sinhala demonology, malevolent entities do not manifest at random—they rule specific cosmic transition windows known as **Samayam** (`සමයං`). When vulnerable mortals (*Athura*) break sacred taboos (*Kilutu*, *Pulutu*, unwashed evening bathing, midnight crossroads whistling), demonic gazes (*Balma*) take root, inducing states of morbid psychological isolation (*Tanikama*).

**After Monsoon** eschews generic video game UI conventions in favor of **authentic, diegetic ritual instruments**:
- **Palm-Leaf Manuscripts (*Puskola Potha*):** Weathered scriptures and ink-rubbed leaves form the narrative stream.
- **Cold Iron Ward (*Yaka Kada*):** Grounding yourself with cold iron prevents psychological mutation and ward-locks waking reality.
- **The Backlit Betel Leaf (*Bulath Hurulla*):** An anatomical five-point diagnosis ledger revealing taboo rot.
- **Interactive SVG Climax Rituals:** Full tactile enactments of ancient counter-rituals (*Rata Yakuma*, *Pattini Varama*, *Riri Varama*, and *Gothaimbara Varama*).

---

## 🏛️ Architectural Guardrails (`.antigravity`)

This codebase is governed by strict architectural principles enforced on every commit and verified via GitHub Actions (`.github/workflows/deploy.yml`):

1. **The 120-Line Ceiling:** Every single `.ts`, `.tsx`, and `.css` file in `src/` (excluding the generated `compiledStory.json`) must strictly remain **$\le$ 120 lines**. Complex behaviors are decomposed into focused, single-responsibility modules.
2. **Zero-SaaS Diegetic UI:** Absolutely no generic toast popups, modern modals, flat progress bars, or stock banners. Every piece of UI exists as an in-world physical object: oil lamps with realistic flicker dynamics, woven funeral mats, copper yantras, and betel leaves.
3. **Zero-Backend Asynchronous Co-Op (`bulathCodec`):** Two-player triage sessions (*Athura* victim $\rightarrow$ *Kattadiya* exorcist specialist) encode 20 taboo flags, demonic gaze (*Balma*), and aloneness (*Tanikama*) into a compact 5-bit hex code (`BH-XX-MMMM`) or Base64 deep link (`?bulath=...`) shareable over messaging platforms (WhatsApp, Signal, SMS) without any database or backend server.
4. **Procedural Web Audio DSP (Zero MP3 Dependencies):** All soundscapes—monsoon downpours, 54Hz Ceylon Electricity Board (CEB) transformer buzz, firewood crackle, *Yak Bera* drum strikes, pounding arterial pulses, and 528Hz cold-iron resonance—are synthesized in real-time via `src/juice/audioMixer.ts` using the Web Audio API.

---

## 👹 The Four-Demon Anthology Matrix

| Casefile | Demon & Locale | *Samayam* Watch | Sensory Avatar (`Bits 0–2`) | Physical Avatar (`Bits 3–4`) | Tactile Climax Ritual & Mantra |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`CF01`** | **Kalu Kumāra** *(Nugegoda Bodima)* | `SANDHYA_DUSK` *(6:00 PM)* | `HANDUN_KUMARA` (`BH-HK-...`) | `VATHA_KUMARA` (`BH-VK-...`) | `PideniThattuwaCanvas` *(Altar Offering)* $\rightarrow$ `RATA_YAKUMA` |
| **`CF02`** | **Mala Mōhinī** *(Kandy Lake Road)* | `MADDHAMA_MIDNIGHT` *(11:45 PM)* | `MALA_MOHINI` (`BH-MM-...`) | `RATI_MOHINI` (`BH-RM-...`) | `MohiniMaskPaliyaCanvas` *(3 Masks & Banana Trunk)* $\rightarrow$ `PATTINI_VARAMA` |
| **`CF03`** | **Rīri Yakā** *(Matara Kitchen)* | `SANDHYA_DUSK` *(Lē Irabatuwa)* | `MARU_RIRI` (`BH-MR-...`) | `SOHON_RIRI` (`BH-SR-...`) | `RiriMatFuneralCanvas` *(Woven-Mat Mock Funeral)* $\rightarrow$ `RIRI_VARAMA` |
| **`CF04`** | **Mahasōnā** *(Anuradhapura Junction)* | `MADDHAMA_MIDNIGHT` *(11:52 PM)* | `JAYASENA_YAKA` (`BH-JY-...`) | `MAHA_SOHONA` (`BH-MS-...`) | `MahasonaCardDuelCanvas` *(Kōlama Card Duel & Flare)* $\rightarrow$ `GOTHAIMBARA_VARAMA` |

---

## 🕹️ Controls & Keybindings

| Input | Action | Diegetic Meaning |
| :--- | :--- | :--- |
| **`[Spacebar]`** *(Hold)* / **Touch Anchor** | Cold Iron Ward | Clutches the iron key; stabilizes waking reality and locks demonic text mutations in place. |
| **`[~]`** / **Tilde** | FFT Acoustic Workbench | Real-time Web Audio spectrum analyzer & procedural audio oscillator monitor. |
| **Mouse / Touch Drag** | Ritual Interactivity | Arrange offering baskets, draw protective chalk circles, and play Kolam cards. |

---

## 📂 Repository Directory Structure

```text
.
├── .antigravity/                      # Architecture rules & 120-line ceiling specs
├── .github/workflows/
│   └── deploy.yml                     # CI/CD: 120-line linter, Vitest, PWA & Android build
├── android/                           # Capacitor 7 native Android studio project
├── public/
│   ├── .well-known/assetlinks.json    # Android App Links SHA-256 verification
│   ├── flow-loops/                    # 16 cinematic cinemagraph loops (.webm & .mp4 fallback)
│   ├── icons/                         # Maskable & monochrome PWA icons (Kundaliya motif)
│   └── manifest.webmanifest           # Standalone fullscreen PWA manifest
├── scripts/
│   ├── generate-icons.js              # Sharp-based icon generator for Android & Web
│   └── generate-icons.sh              # Shell wrapper for asset generation
├── story-twine/
│   ├── scripts/compile-twee-to-json.ts # Build-time Twee3 AST validator & compiler
│   ├── casefile01_kalu_kumara.twee    # 17 passages (Nugegoda Bodima)
│   ├── casefile02_mohini.twee         # 18 passages (Kandy Lake Road)
│   ├── casefile03_riri_yaka.twee      # 18 passages (Matara Kitchen)
│   └── casefile04_mahasona.twee       # 18 passages (Anuradhapura Crossroads)
├── tests/                             # Vitest test suites (87 unit & integration tests)
└── src/
    ├── core/                          # State machines, Twee parser, Bulath codec, persistence
    ├── juice/                         # Web Audio DSP, haptic dispatch, lamp physics, mutators
    └── components/
        ├── viewport/                  # FlowBackdrop (video loops) & ChiaroscuroMask
        ├── narrative/                 # Dual-script ProseStream & ward-locked choices
        ├── diegetic/                  # IronKeyAnchor, BulathLeaf, 4 Ritual Canvases, Compendium
        └── debug/                     # Real-time FFT Acoustic Workbench
```

---

## 📜 Custom Twee3 Authoring Directives

All narrative passages are written in clean Twee3 syntax in `story-twine/*.twee` and compiled into `src/core/compiledStory.json` via `npm run sync-story`:

### Passage Header Directives

```twee
:: Passage_Name [#samayam:MADDHAMA_MIDNIGHT #flow:iron_sickle_ember #audio:arterial_pulse #haptic:heartbeat_panic #vignette:0.84 #balma:15 #tanikama:-5]
```

- `#samayam`: `ALUYA_DAWN` | `IRA_MUDUN_MIDDAY` | `SANDHYA_DUSK` | `MADDHAMA_MIDNIGHT`
- `#flow`: One of 16 validated `FlowLoopId` cinemagraph loops.
- `#audio`: `monsoon_light` | `monsoon_heavy` | `ceb_power_cut` | `yak_bera_ritual` | `hearth_crackle` | `arterial_pulse`
- `#haptic`: `heartbeat_slow` | `heartbeat_panic` | `dread_throb` | `iron_grip`
- `#vignette`: Float (`0.20` to `0.95`) controlling chiaroscuro shadow density.
- `#balma:` / `#tanikama:`: Integer state deltas applied on passage entry.

### Dynamic Gaslighting Mutators (`{mutate}`)

```text
The wall clock reads {mutate: "6:14 PM" -> "6:66 PM" @2400} through the steam.
```

Displays the grounding text first, then dynamically corrupts character-by-character into the nightmare string after 2400ms unless the player holds the **Cold Iron Ward** (`[Spacebar]` / touch).

---

## 🍃 Bulath Hurulla 5-Bit Diagnostic Specification

When an *Athura* (victim) succumbs to possession, `encodeBulathPayload()` encodes their taboo violations into a 5-bit integer (`0x00`–`0x1F`) mapped to 5 anatomical blemish coordinates on the backlit betel leaf:

| Bit | Hex | Blemish & Leaf Coordinate | CF01 (Kalu Kumāra) | CF02 (Mala Mōhinī) | CF03 (Rīri Yakā) | CF04 (Mahasōnā) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Bit 0** | `0x01` | `DARK_BRUISE` `(0.50, 0.20)` | `taboo_bathed_dusk` | `taboo_walked_samayam` | `taboo_fried_pulutu` | `taboo_whistled_crossroads` |
| **Bit 1** | `0x02` | `VEIN_KNOT` `(0.35, 0.38)` | `taboo_hair_unbound` | `taboo_answered_call` | `taboo_unwashed_blood` | `taboo_carried_uncovered_meat` |
| **Bit 2** | `0x04` | `PINHOLE_TEAR` `(0.50, 0.52)` | `taboo_mirror_unshrouded` | `taboo_met_eyes` | `taboo_plucked_wadamal` | `taboo_looked_back_snap` |
| **Bit 3** | `0x08` | `OILY_SHEEN` `(0.66, 0.60)` | `taboo_sweet_snacks` | `taboo_mirrored_gesture` | `taboo_crossed_anthill` | `taboo_stepped_ash_pot` |
| **Bit 4** | `0x10` | `STEM_ROT` `(0.50, 0.79)` | `taboo_laundry` | `taboo_accepted_bundle` | `taboo_tasted_hearth_ash` | `taboo_cursed_boar_shadow` |

### Quick-Test Diagnostic Deep Links

Test Kattadiya triage directly with sample payload codes:

- **Casefile 01:** `?bulath=BH-HK-1541` (Handun Kumāra) · `?bulath=BH-VK-1832` (Vātha Kumāra)
- **Casefile 02:** `?bulath=BH-MM-053C` (Mala Mōhinī) · `?bulath=BH-RM-1848` (Rati Mōhinī)
- **Casefile 03:** `?bulath=BH-MR-0758` (Maru Rīri) · `?bulath=BH-SR-1840` (Sohon Rīri)
- **Casefile 04:** `?bulath=BH-JY-054E` (Jayasēna Yakā) · `?bulath=BH-MS-185C` (Maha Sohōnā)

---

## 🛠️ Getting Started & Build Commands

### Prerequisites
- [Node.js](https://nodejs.org) (v20 or v22 recommended)
- `npm` v10+

### Installation & Development

```bash
# 1. Clone the repository
git clone https://github.com/binukapoojan/Yama.git
cd Yama

# 2. Install dependencies
npm install

# 3. Compile Twine story scripts and launch development server
npm run dev
```

### Testing & Verification

```bash
# Run Vitest test suite (15 test suites, 87 passing tests)
npm test

# Run strict TypeScript and Vite production build
npm run build
```

### Mobile Development (Capacitor Android)

```bash
# Sync web build to Android project
npm run cap:sync

# Open in Android Studio
npm run cap:open

# Assemble debug APK
npm run apk:debug
```

---

## 📄 License

This project is open-source and released under the [MIT License](LICENSE).

---

*“සැඳෑ සමයම ඉක්ම ගිය කල, පිරිසිදු නොවී දොර අගුලු නොදමන්න.”*  
*(When dusk passes, do not leave the door unbolted without cleansing.)*
