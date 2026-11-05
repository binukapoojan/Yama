\# ANTIGRAVITY ARCHITECTURAL LAWS (STRICT ENFORCEMENT)



You are building a commercial-grade, atmospheric folk-horror narrative engine ("Casefile 01: Kalu Kumara"). You are strictly forbidden from generating "vibe-coded" UI patterns.



\## 1. BANNED PATTERNS (INSTANT REJECTION)

\- \*\*NO\*\* monolithic components. No file in `src/` may exceed 120 lines of code.

\- \*\*NO\*\* SaaS UI elements: Never render rounded border cards (`rounded-xl border p-4`), pill badges, progress bars, numeric stat readouts (`Tanikama: 65%`), or HTML `<input type="range">` sliders in the player viewport.

\- \*\*NO\*\* hardcoded narrative strings inside `.tsx` components. All story passages, choices, and state mutations MUST be loaded from `story-twine/casefile01\\\_kalu\\\_kumara.twee` via `src/core/twineParser.ts`.

\- \*\*NO\*\* `lucide-react` or generic icon libraries in the game UI.



\## 2. MANDATORY DIEGETIC \& JUICE RULES

\- \*\*Invisible State:\*\* Cosmological variables (`tanikama`, `balma`, `samayam\\\_velava`, and `taboo\\\_ledger`) must NEVER be displayed as numbers to the player. They may only manifest through `src/juice/JuiceDirector.ts` (shifting the active Google Flow `.webm` loop, altering ambient audio low-pass filters, or mutating words in the prose).

\- \*\*Typography \& Pacing:\*\* Narrative text in `ProseStream.tsx` must render stagger-by-paragraph with deliberate pacing, sitting directly over the dark vignette canvas without borders or boxes.

\- \*\*Unreliable Text Mutator (`src/juice/textMutator.ts`):\*\* Support inline syntax `{mutate: "initial text" -> "corrupted text"}` inside Twine passages. When rendered, display `"initial text"` first, then silently cross-fade the characters into `"corrupted text"` after 2,800ms while the player is reading the next line.

\- \*\*Tactile Anchor (`src/components/diegetic/IronKeyAnchor.tsx`):\*\* A minimal, frameless recessed brass touch-zone at the bottom center of the viewport. Holding it (PointerDown or Spacebar) dispatches `ANCHOR\\\_HELD` to `JuiceDirector`, which suppresses `textMutator` illusions and stabilizes the audio/video state.

