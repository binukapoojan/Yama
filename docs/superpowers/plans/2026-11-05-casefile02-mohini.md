# Casefile 02: Mala Mohini Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Casefile 02 (Mala Mohini on Upper Lake Road, Kandy) into the folk-horror narrative engine with Google Flow loop specs, acoustic cues (night cicadas, infant cry), tactile Pirith Nula ward mechanic, 5-bit betel taboo codec aliases, avatar resolution, and story switching without touching UI components.

**Architecture:** Integrate the new narrative graph (`story-twine/casefile02_mohini.twee`) into the compiler and runtime. Map Mohini's 5 nocturnal taboos to the 5-bit betel leaf coordinates with `MALA_MOHINI` and `RATI_MOHINI` avatar resolution. Re-contextualize the tactile anchor (`IronKeyAnchor` / Spacebar) to crossfade to downward puddle gaze (`kaduru_puddle_feet`) and strip empathetic glamour. Split procedural audio stems to maintain strict `< 120` lines per file.

**Tech Stack:** TypeScript 5.7, React 19, Vite 6, Web Audio API, Vitest 5.

**Spec:** User request specification for Casefile 02: Mala Mohini (`#flow`, `#audio`, tactile mechanics, bitmask taboos, and production Twine script).

## Global Constraints

- **File length limit:** No file in `src/` may exceed 120 lines of code (enforced by `.antigravity/ARCHITECTURE_RULES.md`).
- **Zero vibe-coding:** No SaaS UI cards, progress bars, or numeric stat readouts in player viewport.
- **Narrative decoupling:** No hardcoded story text inside `.tsx` components; all story content loaded from Twine graphs.
- **Backward compatibility:** Casefile 01 (`casefile01_kalu_kumara.twee`) and existing tests must continue to compile and pass with zero regressions.

## Review Focus

1. `compile-twee-to-json.ts` must validate both casefile Twee graphs without throwing errors or orphan warnings for valid entry passages (`Upper_Lake_Mist_Start`, `Kattadiya_Mohini_Entry`).
2. Mohini taboo keys (`taboo_walked_samayam`, `taboo_answered_call`, `taboo_met_eyes`, `taboo_mirrored_gesture`, `taboo_accepted_bundle`) must map bit-for-bit to the existing 5 betel leaf blemishes and decode properly via URL tokens and WhatsApp share codes.
3. Avatar classification must correctly resolve `MALA_MOHINI` (ocular/verbal dominance) and `RATI_MOHINI` (physical/mimetic dominance) for Mohini runs while preserving `HANDUN_KUMARA` and `VATHA_KUMARA` for Casefile 01.
4. Downward Gaze ward (`@anchor_held`) in Casefile 02 must crossfade the flow backdrop from `mohini_saree_silhouette` to `kaduru_puddle_feet` rather than the room lamp (`pahana_steady`).
5. All `.ts` and `.tsx` files in `src/` must remain strictly under 120 lines.

---

### Task 1: Update Schema & Flow Loop Types

**Files:**
- Modify: `src/core/schema.ts`
- Test: `tests/twineParser.test.ts`

**Interfaces:**
- Consumes: Existing `FlowLoopId` definition in `src/core/schema.ts`
- Produces: Expanded `FlowLoopId` union including `'kandy_mist_bamboo' | 'mohini_saree_silhouette' | 'kaduru_puddle_feet' | 'sanni_mask_torch'`

- [ ] **Step 1: Write type assertion test in `tests/twineParser.test.ts`**
Add test verifying that passages tagged with `#flow:kandy_mist_bamboo`, `#flow:mohini_saree_silhouette`, `#flow:kaduru_puddle_feet`, and `#flow:sanni_mask_torch` parse their flow directives correctly.

- [ ] **Step 2: Run test to verify failure**
Run: `npm.cmd test`
Expected: Fail or type check error due to missing flow types.

- [ ] **Step 3: Update `src/core/schema.ts`**
Add the 4 new string literals to `FlowLoopId`. Ensure file remains under 120 lines.

- [ ] **Step 4: Run test to verify it passes**
Run: `npm.cmd test`
Expected: PASS

---

### Task 2: Create Casefile 02 Twine Script

**Files:**
- Create: `story-twine/casefile02_mohini.twee`
- Test: `tests/casefile02Parse.test.ts`

**Interfaces:**
- Consumes: Twine parser (`src/core/twineParser.ts`)
- Produces: 18 parsed passages with `#flow`, `#samayam`, `#audio`, `#haptic`, `#vignette`, `#balma`, `@anchor_held`, and `{mutate: "A" -> "B" @ms}`

- [ ] **Step 1: Write test for Casefile 02 parsing in `tests/casefile02Parse.test.ts`**
Verify that all 18 passages parse without errors, entry passage `Upper_Lake_Mist_Start` contains choices and directives, choice mutations parse correctly, and `@anchor_held` conditions are recognized on `The_Infant_Drop_Trap`.

- [ ] **Step 2: Run test to verify failure**
Run: `npm.cmd test`
Expected: FAIL due to missing file `story-twine/casefile02_mohini.twee`.

- [ ] **Step 3: Save `story-twine/casefile02_mohini.twee`**
Write the complete production Twine script verbatim from Section 3 of the user request.

- [ ] **Step 4: Run test to verify it passes**
Run: `npm.cmd test`
Expected: PASS

---

### Task 3: Update Twine Compiler for Multi-Casefile Compilation

**Files:**
- Modify: `story-twine/scripts/compile-twee-to-json.ts`
- Test: Run script directly via node/tsx

**Interfaces:**
- Consumes: `story-twine/casefile01_kalu_kumara.twee`, `story-twine/casefile02_mohini.twee`, `VALID_FLOWS`
- Produces: `src/core/compiledStory.json` with all passages from both casefiles verified with zero orphans and zero syntax errors.

- [ ] **Step 1: Update `compile-twee-to-json.ts`**
1. Add the 4 new loops to `VALID_FLOWS`: `'kandy_mist_bamboo'`, `'mohini_saree_silhouette'`, `'kaduru_puddle_feet'`, `'sanni_mask_torch'`.
2. Add `'Upper_Lake_Mist_Start'` and `'Kattadiya_Mohini_Entry'` to `ENTRY_PASSAGES`.
3. Support compiling both `casefile01_kalu_kumara.twee` and `casefile02_mohini.twee` into a combined graph in `compiledStory.json` (or validating both).

- [ ] **Step 2: Run compilation command to verify**
Run: `npm.cmd run sync-story`
Expected: `[TWEE OK] Compiled 35 passages -> src/core/compiledStory.json` with 0 errors and 0 orphan warnings.

---

### Task 4: Bitmask Taboos & Avatar Resolution in `bulathCodec.ts`

**Files:**
- Modify: `src/core/bulathCodec.ts`
- Test: `tests/bulathCodec.test.ts`

**Interfaces:**
- Consumes: `RuntimeVariables` with Mohini taboos (`taboo_walked_samayam`, `taboo_answered_call`, `taboo_met_eyes`, `taboo_mirrored_gesture`, `taboo_accepted_bundle`)
- Produces: `BulathHurullaPayload` with 5-bit encoding, blemish mapping, and avatars: `MALA_MOHINI`, `RATI_MOHINI`, `HANDUN_KUMARA`, `VATHA_KUMARA`

- [ ] **Step 1: Write failing tests in `tests/bulathCodec.test.ts`**
1. Test encoding with Mohini taboos (`taboo_walked_samayam`, `taboo_met_eyes`) -> resolves to `MALA_MOHINI` and share code `BH-MM-...`.
2. Test encoding with physical Mohini taboos (`taboo_mirrored_gesture`, `taboo_accepted_bundle`) -> resolves to `RATI_MOHINI` and share code `BH-RM-...`.
3. Test decoding share codes `BH-MM-0520` and `BH-RM-1830`.
4. Verify existing Kalu Kumara tests continue to pass identically.

- [ ] **Step 2: Run test to verify failure**
Run: `npm.cmd test`
Expected: FAIL on Mohini avatar classification and taboo aliases.

- [ ] **Step 3: Implement Mohini aliases & avatar resolution in `src/core/bulathCodec.ts`**
1. Add alias keys to `TABOO_MAP` (Bit 0: `taboo_walked_samayam`, Bit 1: `taboo_answered_call`, Bit 2: `taboo_met_eyes`, Bit 3: `taboo_mirrored_gesture`, Bit 4: `taboo_accepted_bundle`).
2. Implement avatar classification: if Mohini taboos are present or prefix is MM/RM, resolve to `MALA_MOHINI` / `RATI_MOHINI`.
3. Keep file under 120 lines.

- [ ] **Step 4: Run test to verify it passes**
Run: `npm.cmd test`
Expected: PASS

---

### Task 5: Flow Backdrop & Juice Director Integration

**Files:**
- Modify: `src/components/viewport/FlowBackdrop.tsx`
- Modify: `src/juice/JuiceDirector.ts`
- Test: `tests/juiceDirector.test.ts`

**Interfaces:**
- Consumes: `FLOW_CROSSFADE` events, `isAnchorHeld()`
- Produces: Appropriate protected flow loop (`kaduru_puddle_feet` for Mohini, `pahana_steady` for Kalu Kumara)

- [ ] **Step 1: Write unit test in `tests/juiceDirector.test.ts`**
Verify that when `activePassageLoop` is `'mohini_saree_silhouette'` or `'kandy_mist_bamboo'`, setting anchor held emits `FLOW_CROSSFADE` with `loopId: 'kaduru_puddle_feet'`.

- [ ] **Step 2: Run test to verify failure**
Run: `npm.cmd test`
Expected: FAIL (emits `pahana_steady` instead).

- [ ] **Step 3: Implement protected loop resolution in `JuiceDirector.ts` and add loops to `FlowBackdrop.tsx`**
1. In `JuiceDirector.ts`, define helper to resolve protected loop: if active loop is one of the Mohini road loops, return `'kaduru_puddle_feet'`; otherwise return `'pahana_steady'`.
2. In `FlowBackdrop.tsx`, add the 4 new loops to `FLOW_LOOPS`.
3. Verify both files are under 120 lines.

- [ ] **Step 4: Run test to verify it passes**
Run: `npm.cmd test`
Expected: PASS

---

### Task 6: Procedural Acoustic Cues & Stem Architecture

**Files:**
- Create: `src/juice/audioStems.ts`
- Modify: `src/juice/audioMixer.ts`
- Test: `tests/audioMixer.test.ts`

**Interfaces:**
- Consumes: Web Audio API AudioContext, JuiceDirector events
- Produces: `StemCueId` supporting `kandy_night_cicadas`, `infant_cry_dissonant`, `monsoon_light`, `monsoon_heavy`, `ceb_power_cut`, `yak_bera_ritual`

- [ ] **Step 1: Write test in `tests/audioMixer.test.ts`**
Verify audio mixer types and methods: previewing `kandy_night_cicadas`, setting dream muffle, and infant cry trigger.

- [ ] **Step 2: Run test to verify failure**
Run: `npm.cmd test`

- [ ] **Step 3: Implement `src/juice/audioStems.ts` and update `src/juice/audioMixer.ts`**
1. In `src/juice/audioStems.ts`: implement noise buffer, bandpass cicada stem (2,400 Hz) with water drips, infant cry oscillator/panner node, and 50Hz hum stem. Keep under 120 lines.
2. In `src/juice/audioMixer.ts`: wire procedural stems into the mixer and handle muffle/infant cry when `#balma > 50` and anchor is unheld. Keep under 120 lines.

- [ ] **Step 4: Run test to verify it passes**
Run: `npm.cmd test`
Expected: PASS

---

### Task 7: Engine Casefile Switching in `src/App.tsx`

**Files:**
- Modify: `src/App.tsx`
- Test: `tests/appStorySwitch.test.ts`

**Interfaces:**
- Consumes: URL query params (`case=02`, `case=mohini`, `bulath=BH-MM-...`)
- Produces: Active story graph (Casefile 01 or Casefile 02) with appropriate initial passage and state without modifying UI components.

- [ ] **Step 1: Write test for story switching logic**
Test that given URL param `?case=02` or a Mohini bulath code, the entry passage resolves to `Upper_Lake_Mist_Start` or `Kattadiya_Mohini_Entry`.

- [ ] **Step 2: Update `src/App.tsx`**
1. Import both Twee scripts or load from `compiledStory.json`.
2. Inspect `window.location.search` for `case` or Mohini bulath code.
3. Select appropriate initial passage and initial state (`MADDHAMA_MIDNIGHT` for Casefile 02).
4. Keep file under 120 lines.

- [ ] **Step 3: Run test to verify it passes**
Run: `npm.cmd test`
Expected: PASS

---

### Task 8: Full Verification & Line Count Audit

**Files:**
- All `src/` files

- [ ] **Step 1: Audit line counts for all files in `src/`**
Verify that every `.ts` and `.tsx` file in `src/` has <= 120 lines.

- [ ] **Step 2: Run story compiler**
Run: `npm.cmd run sync-story`
Verify 0 errors and 0 orphan warnings.

- [ ] **Step 3: Run full Vitest suite**
Run: `npm.cmd test`
Verify all unit tests pass.

- [ ] **Step 4: Run full project build**
Run: `npm.cmd run build`
Verify TypeScript compiles and Vite builds successfully.
