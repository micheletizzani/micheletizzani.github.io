# Language Quest: full game design document

A concept document that does not depend on the current code. It describes what the game is, why each choice was made,
and how to rebuild or extend it in another engine, language or city. For the implementation see
[DESIGN.md](./DESIGN.md) (systems as built), [PACK_TEMPLATE.md](./PACK_TEMPLATE.md) (how to author content) and
[STORY_BRIEF.md](./STORY_BRIEF.md) (the one-page version for writing stories).

**Status of claims.** Things marked _Built_ exist in the prototype. _Assumption_ means a design belief that has not been
tested with learners. _Unverified_ means content or behaviour that nobody has checked on real devices or with a native speaker.

---

## 1. Concept

### 1.1 Pitch

You arrive in a city whose language you do not speak. Nobody translates. You watch what people do, listen, write the
sounds down, and decide from your own observations what each word means. A notebook keeps your evidence and guesses.
At the end you must say a whole sentence; only then does the game tell you which guesses were right.

### 1.2 Design objectives

| #   | Objective                                                              | How the design serves it                                                                                     |
| --- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| O1  | Learn sounds and a small vocabulary through inference, not instruction | Observe → Sound → Meaning loop; meanings are never stated until the finale                                   |
| O2  | Teach pronunciation honestly                                           | Phonetic notation, a phonetic dictionary, and a strict rule: never read a real language with the wrong voice |
| O3  | Make context do the teaching                                           | Observational clues of six kinds, including realistic decoys                                                 |
| O4  | Let one engine carry many languages and places                         | The language, story, art palette and world layout are data (a "pack")                                        |
| O5  | Feel like a place, not a quiz                                          | A walkable, stylised city whose colours and architecture come from where the language is spoken              |
| O6  | Work on a phone in landscape and on a desktop                          | Point-and-click only, no pointer lock, compact HUD                                                           |

### 1.3 Design pillars

1. **Discovery, not translation.** The game supplies evidence; the player supplies meaning.
2. **Nothing plays unless you ask.** Sound is always caused by a player action.
3. **Honest uncertainty.** Evidence meters measure consistency with what you noticed, never truth. Unchecked content is labelled.
4. **Data, not code, for languages.**
5. **Everything walkable is visible.** No hidden corners, no camera fights; the whole place is on screen.
6. **Quiet, minimal look.** Flat pastel shapes; the place's colours, softened.

### 1.4 Inspirations and what was taken

- _Chants of Sennar_ (Rundisket): decipherment by observation and context. Taken: the idea, the top-down third-person framing, zoom-in on interaction. Not taken: assets, story, glyph system.
- _Monument Valley_ (ustwo games): isometric floating architecture, flat pastel faces, sea backdrop, hooded character. Taken: the visual concept, adapted to a real harbour. Not taken: any asset or level geometry.
- Everything in the repository (art, glyphs, story, code) is original.

### 1.5 Audience and goals

Adult self-learners. After one story (about 20–30 minutes) a player should be able to recognise and pronounce a small
set of words (15 in the Danish pilot, 10 dictated and 5 heard in passing), connect written form to sound, infer meaning
from context, notice one or two grammar patterns, and produce one full sentence.
This is a vocabulary-and-sound primer, not a course. _Assumption:_ inferring then confirming later beats being told
immediately. The pilot has not been evaluated with learners.

---

## 2. Player experience

### 2.1 Emotional arc

Curiosity (a place with strangers who speak) → small wins (first word recorded) → tentative theories (guesses and the
evidence meter) → pattern recognition (a plural, a negation, a reason) → performance (the sentence) → reveal (verdicts).
The tone is calm and observational: no timers, no lives, no score.

### 2.2 Session flow

```
Map screen (choose language/place) → enter the place → walk → click a gold marker → camera zooms in
   → lesson sheet: Observe | Sound | Meaning (any order) → record in notebook → next encounter unlocks
   → … → finale sentence → verdicts (what was right, close, wrong) → truth for every word
```

Progress is saved per language pack in the browser; resetting is available with confirmation.

### 2.3 What the player does, by verb

| Verb                   | Where       | Result                                                                              |
| ---------------------- | ----------- | ----------------------------------------------------------------------------------- |
| Walk                   | The world   | Click/tap ground, or WASD/arrows; routes around obstacles and over stairs           |
| Look closer            | Observe tab | Flips a clue card face-down → face-up                                               |
| Listen                 | Sound tab   | Plays the word (normal or slow) only on request                                     |
| Write the sound        | Sound tab   | IPA or romanisation, via symbol keyboard; graded leniently                          |
| Say it                 | Sound tab   | Microphone; compared with the written form (browser speech recognition)             |
| Ask for a hint         | Sound tab   | Three steps: syllables → first sound → consonant skeleton                           |
| Consult the dictionary | Anywhere    | Every sound with description, confusable sounds, spelling warnings, spoken examples |
| Choose a meaning       | Meaning tab | Pick one picture card from about eight candidates                                   |
| Review                 | Notebook    | Words, Sounds, Story tabs                                                           |
| Compose                | Finale      | Build, type or say the target sentence                                              |

---

## 3. Mechanics

### 3.1 The lesson loop (per encounter)

An encounter is one place plus one person that teaches 1–4 words (drills) and may let others pass by (exposures).
Three activities, in any order; recording requires at least the sound task for each drilled word.

**Observe.** Clues start face-down. Six kinds: _object, action, gesture, writing, contrast, context_. Each clue declares
which meanings it is compatible with (`supports`) and which words it concerns (`about`). A clue that supports nothing is
a **decoy**: realistic noise. Authoring rules: at least two clues per drilled word that support the true meaning, ideally
of different kinds; at least one decoy per encounter; scene text must not contain the answer.

**Sound.** The word is shown in the pack's script. The player writes or says what they hear.

- Typed grading: strip ignored marks (stress, length, a language's special features); treat sounds in the same
  _equivalence class_ as equal; allow one slip per five sounds for IPA; romanisation must match exactly.
- Spoken grading: speech recognition set to the pack's language, compared leniently with the written form. It tests
  "said something close", not pronunciation quality (and for an invented language it only tests that something was said).
- Hints cost nothing but are tracked; after three hints or three failures the answer can be revealed and is recorded as revealed.
- The phonetic dictionary hides a game word's own transcription until its sound task is done, so it cannot be an answer key.

**Meaning.** One picture card per word. Candidates always include the truth, any "close" meaning, and every other
meaning that one of the word's clues also fits (the plausible wrong answers), padded with stable fillers. Small squares
under each card show how many noticed clues fit it. The evidence meter for the chosen guess runs
_none → untested → unsupported → conflict → suspected → probable → well supported_ by the number of distinct clue kinds
backing it. It never says "correct".

### 3.2 Progression and fairness

Encounters form a chain (each `requires` the previous). Nothing is lost by guessing wrong. The player may reveal sounds
after trying. The only ground truth is the finale. A word guessed wrongly stays wrong in the verdict, with the truth shown.

### 3.3 The finale

The player builds the target sentence from shuffled word tiles, types it, or says it. Comparison ignores case,
punctuation and diacritics (spoken: leniently). Success unlocks verdicts: each guess is marked correct, close or not quite,
and the true meaning of every word is revealed.

### 3.4 Audio policy

Sound comes only from Listen/Slowly, a word chip, a dictionary example, a chime on a correct answer, and an optional
**guide ping** (a soft tone from the direction of the next marker; off by default). Nothing plays on approach, on
opening a lesson, or on load. A global mute exists.

### 3.5 Voice honesty (a design rule, not an implementation detail)

Text-to-speech falls back to the device's default voice, which is usually English, and reads the text with that language's
rules. For a pronunciation game that teaches wrong sounds. Therefore a real language is **strict**: with no matching voice
installed the game stays silent, opens a Voice panel that names the voice in use, lets the player test and change it,
and explains how to install one. An invented language is not strict (it is an approximation by design). A player may
deliberately choose a non-native voice; the panel then says it is not native. _Unverified:_ real-device voice quality.
Native-speaker recordings are the recommended replacement for synthesis for core words.

---

## 4. World and navigation

### 4.1 Spatial concept: a stack of terraces

The place is a few flat terraces floating over a sea, at different heights, joined by stairs. In the pilot there are
three (quay, middle terrace, upper terrace) and two flights of stairs. Why: every walkable surface can be shown in an
isometric view without anything hiding anything; heights give a sense of progression (the story climbs).

### 4.2 Camera

Isometric, orthographic, fixed angle (45° azimuth, 32° elevation). Default zoom shows the whole world. Zoom in and the
camera follows the player. Opening a lesson eases the camera onto the subject and shifts it above the lesson sheet.

### 4.3 The visibility rule

**Everything the player can walk on must be visible from the camera.** Tall things (houses, a wall) stand only on the
far edges (west and north); the near edges (south and east) carry only low furniture. Furniture under 2.2 m is not
counted as hiding anything. Enforced three times: by exact ray tests in the validator, by a probe inside the running
scene, and by a browser test (98 % required, 100 % in both packs).

### 4.4 Interaction

Point-and-click/tap. Clicking a marker walks to its approach point, then opens the encounter. Why not first person or
free camera: identical on mouse and thumb, no pointer lock, a usable HUD, and it keeps attention on the scene's clues.
A marker on another terrace does not count as "nearby".

### 4.5 Layout constraints (for new places)

Three tiers (or fewer), stairs between consecutive tiers, a central piece (fountain, pump, statue) at a fixed position,
one low stall, tall buildings on the west/north edges, a gate or back wall on the highest tier. Helpers exist so these hold by construction.

---

## 5. Art direction

### 5.1 Style

Minimal indie, in the manner of isometric architectural puzzle games: flat colour faces, no outlines, soft light, simple
geometry, arches, a calm sea. Detail is sparse and meaningful: windows, a door, a sign.

### 5.2 Rendering rules

- One soft ambient light plus one sun give each box three tones (top, south face, east face). Nothing else shades.
- No tone mapping, so the colours in the data are the colours on screen.
- Terrace tops carry a paving pattern only a few percent lighter/darker than the base; sides fade into the sea.
- Figures are small hooded cloaks with a pale face and a soft blob shadow; the player is the same shape in the accent colour.
- Sea and sky are a single pastel gradient. No fog, no hard horizon.
- UI uses paper-and-ink sheets so reading text stays easy over a pale scene.

### 5.3 Colour: pastel, tied to the language

Pastel = high lightness, low-to-medium saturation. Method: list the 6–8 colours that define the place, lighten and soften
them, assign them to walls, ground, water and cloaks, and pick ink (dark version of the darkest place colour) and paper (warm light).
Use national symbols the way they appear in the place, not everywhere.

|              | Danish pack (Nyhavn)                                           | Maru pack (invented language, sandstone Copenhagen square) |
| ------------ | -------------------------------------------------------------- | ---------------------------------------------------------- |
| Walls        | rose, butter, sky blue, sage, cream                            | sand, apricot, cream, dusty rose                           |
| Water/sky    | powder blue to mist                                            | mint to white                                              |
| Accent       | soft Dannebrog red                                             | dusty rose                                                 |
| Architecture | tall narrow gabled houses, shopfronts, a crenellated back wall | flat-roofed façades, arched windows, balustrades           |
| Props        | moored boats, bicycles, planters, kiosk, pump                  | palms, stone fountain, stall                               |
| Writing      | lettering on painted signs                                     | invented carved glyphs                                     |

### 5.4 Pictograms

Clues and meaning cards use a small hand-drawn pictogram set (shapes on a 48-unit grid) recoloured by the pack's theme.
Pictures are scaffolding, not translation: some clues have none.

---

## 6. Languages, content and data

### 6.1 The pack

A pack is the whole content of one language in one city, as data: lexicon, encounters (with clues, drills, exposures),
phonology (notation, dictionary, equivalence classes), meanings, the finale sentence, interface theme, and the world
(terraces, buildings, people, signs). The engine contains no language. Adding a chapter, a language or a city means adding data.

### 6.2 Validation

Every pack passes a validator that enforces the design rules: encounter chain with one root; every drilled word has ≥2
supporting clues; decoys exist; the finale uses only words met earlier; contrast meets 7:1 for ink on paper; strict
packs declare a test phrase; terraces connect by stairs; every encounter is reachable; every walkable point is visible.
The validator is itself tested by breaking packs on purpose.

### 6.3 Packs in the pilot

- **Danish / Nyhavn** (real language). 15 words, 5 encounters: water → cup/cups → "I have (not) a key" → "the gate is closed" because → say the whole sentence.
  Target: _Jeg har brug for en nøgle, fordi porten er lukket._ _Unverified:_ IPA and phoneme descriptions were not checked by a native speaker; flagged `verified:false` and labelled in the UI.
- **Maru / Højbro Plads** (invented language). Same engine; romanisation instead of IPA; glyph writing; not strict.

### 6.4 Teaching design notes

- Start with a concrete noun that an action makes obvious (water: someone drinks).
- Then a contrast (one cup / cups) to reveal a grammatical pattern without naming it.
- Then negation by repetition with one word added.
- Then a reason clause between two halves of a sentence.
- Finish by asking the player to reuse earlier words in a new sentence.

---

## 7. Interface and accessibility

- Compact HUD: map, notebook (with word count), sounds, commands, voice, zoom, pings, mute, fullscreen.
- Every command is rebindable; typing in a field never triggers a command.
- Short landscape screens get a compact layout; the compass moves to the bottom right.
- Contrast is validated. _Not done:_ screen-reader testing, reduced-motion setting, captions for the guide ping, a dyslexia-friendly font.

---

## 8. Technology (replaceable)

Web app: Astro + React + three.js through React Three Fiber, Web Speech API (synthesis and recognition), browser local
storage, Tailwind. Pure logic (phonetic grading, evidence, navigation, validation, terrain, visibility) is separate from
rendering and unit-tested in Node. A different engine can reimplement the renderer and reuse the data and rules.
Pack file shape: see `src/components/tools/lingua/packs/types.ts`.

---

## 9. Quality assurance

| Check                                        | Tool                                                                 |
| -------------------------------------------- | -------------------------------------------------------------------- |
| Pack structure and design rules              | `npm run packs:check`; `npm run test:lingua` (20 tests)              |
| Gameplay and voice honesty in a real browser | `scripts/e2e/*.mjs` (Danish lesson, finale, Maru pack, voices)       |
| Visibility of walkable ground                | `scripts/e2e/visibility.mjs` (desktop and phone-landscape viewports) |
| Real performance                             | `?debug` overlay on the target device (fps, GPU name)                |

Testing so far used software rendering. _Unverified:_ frame rate on real phones, behaviour on real GPUs, quality of installed voices.

---

## 10. Risks and open questions

1. Danish phonetics unverified (needs a native speaker or a pronunciation dictionary).
2. Speech availability and quality vary by device; recognition exists only in some browsers and is not a pronunciation scorer.
3. IPA grading is lenient because the reference may be imperfect; it accepts some real errors.
4. Clue design quality decides whether inference is fair; the finale is the only ground truth.
5. One short story; no spaced repetition or review.
6. Learning effectiveness is unmeasured. A small study (inference-then-reveal vs. immediate gloss, delayed recall) would test the central assumption.
7. On phone-landscape the whole-world view is small; zoom-in follow mode compensates but is untested on a device.

## 11. Extension guide

| Goal                    | What to add                                                                                            |
| ----------------------- | ------------------------------------------------------------------------------------------------------ |
| New chapter             | Words, encounters after the finale encounter, a new finale                                             |
| New language, same city | A pack reusing a scenery; change colours, words, people, signs                                         |
| New city                | A scenery component (buildings, props), a map illustration, a terrace layout, a palette from the place |
| New mechanic            | New clue kinds, drill types (e.g. numbers, directions), review mode                                    |
| Better audio            | Native recordings per word, keyed by word id, preferred over synthesis                                 |

## 12. Narrative layer (planned)

A larger story (an anthropologist chasing a lost manuscript through epochs of Copenhagen, with the notebook as the central
object) is specified in [NARRATIVE_DESIGN.md](./NARRATIVE_DESIGN.md) and assessed in [STORYBOARD_EVALUATION.md](./STORYBOARD_EVALUATION.md).
It needs new engine features (epoch layers, etymology side quests, a recall mode with the notebook hidden, multi-chapter progress); none is built.

## 13. Roadmap ideas (not committed)

Review mode with spaced repetition; Danish chapter two (numbers, directions, ordering at the kiosk); a cheaper rendering
mode; reduced-motion option; a pack editor that runs the validator live; recordings by native speakers.

## 14. Glossary

| Term              | Meaning                                                         |
| ----------------- | --------------------------------------------------------------- |
| Pack              | One language in one city, as data                               |
| Encounter         | One place plus one person; teaches 1–4 words                    |
| Clue              | An observation that may support meanings; decoys support none   |
| Drill / Exposure  | A dictated word / a word heard in passing                       |
| Equivalence class | Sounds treated as one when grading leniently                    |
| Evidence meter    | How well a guess fits what you noticed (not correctness)        |
| Verdict           | The post-finale comparison of guesses with the truth            |
| Tier / Stair      | A flat terrace / the flight joining two terraces                |
| Strict            | A pack that stays silent rather than use a wrong-language voice |
