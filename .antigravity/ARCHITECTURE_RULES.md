# ANTIGRAVITY ARCHITECTURAL LAWS (STRICT COMMERCIAL ENFORCEMENT)

You are building a commercial-grade Sri Lankan folk-horror narrative experience ("After Monsoon: The Samayam Anthology"). You are strictly forbidden from generating "vibe-coded" or developer-prototype UI patterns.

## 1. BANNED "VIBE-CODED" PATTERNS (INSTANT REJECTION)
- **NO** monolithic components. No file in `src/` may exceed 120 lines of code.
- **NO** ASCII brackets or arrows on interactive elements: NEVER render `[Menu]`, `[Puskola]`, `[Triage]`, `[Copy]`, or `→` / `->` on any button or link.
- **NO** rectangular wireframe button boxes (`border border-amber-500 px-3 py-1`). Interactive elements must look like incised palm-leaf calligraphy, wax seals, brass ornaments, or fading ink.
- **NO** SaaS UI elements: Never render rounded cards, pill badges, progress bars, numeric stat readouts (`Balma: 65%`), or `<input type="range">` sliders in the player viewport.
- **NO** hardcoded narrative strings inside `.tsx` components. All story passages, choices, and state mutations MUST be loaded from `story-twine/*.twee` via `src/core/twineParser.ts`.

## 2. MANDATORY DIEGETIC & CHOREOGRAPHY RULES
- **Choreographed Ritual Intro:** The game must open with a multi-stage animated SVG ritual (striking the brass *Pahana* wick, smoke rising into the *Kundaliya* seal, and unrolling the *Puskola* wood cover) before revealing the folios.
- **Incised Calligraphy Choices:** Narrative choices in `ProseStream.tsx` must use traditional Sinhala *Kundaliya* (`෴`) and diamond (`❖`) ink marks with smooth gold-leaf hover illumination—never mechanical lines or brackets.
- **Invisible State:** Cosmological variables (`tanikama`, `balma`, `samayam_velava`, and `taboo_ledger`) must NEVER be displayed as numbers. They manifest only through `JuiceDirector.ts` (video crossfades, Biquad audio filtering, and `{mutate}` prose gaslighting).
