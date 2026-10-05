# Language Quest: game design document

Status: implemented prototype. This document says what exists, what is assumed, and what is not verified.
Last updated with the Danish/Nyhavn pack and the multi-language pack architecture.

## 1. One-paragraph pitch

You step into a city whose language you do not speak. Nobody translates. You look at what people are doing, listen
to what they say, write the sounds down, and decide, from your own observations, what each word means. A notebook
keeps your evidence, your guesses and how well your guesses fit what you saw; a phonetic dictionary explains every
sound with real words you can hear. At the end you must say a whole sentence, and only then does the game tell you
which guesses were right.

## 2. Pillars

1. **Discovery, not translation.** The game never states a meaning. It supplies evidence and lets you decide.
2. **Nothing plays unless you ask.** Sound is always the result of a click or key press by the player.
3. **Be honest about uncertainty.** Evidence meters measure _consistency with what you noticed_, never truth.
   Content that has not been checked by a human is labelled as such in the UI.
4. **Data, not code, for languages.** A new language, city or chapter is a data file ([PACK_TEMPLATE.md](./PACK_TEMPLATE.md)).
5. **Playable on a phone in landscape**, with the same learning loop as on a desktop.

Inspiration for the observational-decipherment idea: games such as _Chants of Sennar_. Everything here (art,
glyphs, story, code) is original; no assets were copied.

## 3. Audience and learning goals

Adult self-learners using the Study Hub. After one story (about 20–30 minutes) a player should be able to:

- recognise and pronounce a small set of words (the Danish pack has 15: ten are dictated, five are heard in passing),
- connect a written form to a sound, using IPA or a romanisation,
- infer a word's meaning from context (objects, actions, gestures, writing, contrasts),
- notice a grammatical pattern (a plural ending, a negation word, a reason clause),
- produce one full sentence.

This is a vocabulary-and-sound primer, not a course. **Assumption to test:** that choosing a meaning from
observations and then being told the truth at the end produces better retention than being told the meaning
immediately. The design is motivated by that idea; the prototype has not been evaluated with learners.

## 4. Core loop

```
walk (click/tap)  →  click a gold marker  →  camera zooms in  →  lesson sheet
                                                         │
        ┌────────────────────────────────────────────────┤
        │   Observe        Sound                 Meaning │  any order
        │   look closer    listen · write/say    pick a  │
        │   at clues       · hints · dictionary  meaning │
        └───────────────┬────────────────────────────────┘
                        ▼
          Record in notebook  →  next encounter unlocks  →  …  →  final sentence  →  verdicts
```

A story is a chain of **encounters** (5 in the pilot). Each encounter teaches 1–4 words. The last one asks for a sentence
built from words learned earlier.

## 5. Systems

### 5.1 Navigation and camera

- **Layered world.** The place is a stack of flat terraces floating over the sea (quay → terrace → upper terrace), joined
  by two flights of stairs. Heights are data (`world.tiers`, `world.stairs`); walking, pathfinding and the validator all
  read the same terrain.
- **Isometric orthographic camera** (45° azimuth, 32° elevation, defined once in `maruCamera.ts`). By default the zoom is
  chosen so the _whole_ world is on screen, tall roofs included; the +/- buttons and the wheel zoom in, and then the camera
  follows the explorer. Click/tap the ground to walk (height-aware A*); WASD/arrows move relative to the screen.
- **Everything walkable must be visible.** Tall things (houses, the gate wall) stand only on the far edges (west and
  north); the near edges (south and east) carry only low furniture. The validator checks this with exact ray tests
  (`packs/visibility.ts`); `scripts/e2e/visibility.mjs` checks it again in the real scene (98 % required, 100 % today).
  Furniture lower than 2.2 m is not counted: it hides a strip of floor, not a place.
- Clicking a marker walks to the encounter's approach point, then opens it. A marker on another terrace is not "nearby".
- While a lesson is open the camera eases in on the subject and shifts so it sits above the lesson sheet.
- Why point-and-click: it works identically with a mouse and a thumb, needs no pointer lock, and keeps the HUD usable.

### 5.2 Observe: observational hints

Each encounter lists **clues** of six kinds: _object, action, gesture, writing, contrast, context_. Clues start
face-down; the player chooses to "look closer". A clue carries:

- `supports`: the meanings it is compatible with (an empty list makes it a **decoy**: realistic noise),
- `about`: the words it helps with.

Authoring rules (enforced by the validator): every drilled word needs at least two clues that support its true
meaning, ideally of different kinds; each encounter should contain a decoy; scene text must not contain the answer.

### 5.3 Sound: write or say what you hear

- The word is shown in the pack's script (glyphs or lettering) with a **Listen** and a **Slowly** button.
- The player writes the sound in the pack's notation (IPA for Danish, romanisation for Maru) with an on-screen
  symbol keyboard, or says it into the microphone.
- **Typed** answers are graded by `gradeSound`: ignored marks (stress, length, stød) are stripped, sounds in the same
  _equivalence class_ count as one, and IPA allows one slip per five sounds. Romanisation must match exactly.
- **Spoken** answers use the browser's speech recogniser (set to the pack's `recog` language) and are compared with the
  _written_ form, leniently. The recogniser is trained on a real language, so for an invented language this only
  tests that the player said something close; it is not a pronunciation score.
- **Hints** (Alt+H) go in three steps: syllable count → first sound with a real keyword → consonant skeleton. After three
  hints or three failed tries the player may reveal the answer and move on (it is recorded as revealed).
- **Phonetic dictionary**: every sound of the language, a plain description, a spelling-vs-sound warning, confusable
  sounds and real example words that the voice can speak. A game word's own transcription and meaning stay hidden
  until its sound task is done, so the dictionary cannot be used as an answer key.

### 5.4 Meaning and the notebook

- For each word the player picks one **picture card** from about eight candidates. The candidates always include the truth, any
  "close" meaning, and every other meaning that one of the word's clues also fits (the plausible wrong answers), then
  stable fillers.
- Under each card, small squares show how many of the clues the player has noticed fit that meaning. This is scaffolding,
  not a verdict.
- The **evidence meter** for the chosen guess: _none → untested → unsupported → conflict → suspected → probable → well
  supported_, from the number of distinct clue kinds that back it.
- The notebook has three tabs: **Words** (written form, sound, guess, noticed clues, grammar note once learned), **Sounds**
  (the phonetic dictionary) and **Story** (what happened in each place).
- After the finale the notebook marks every guess correct / close / not quite and reveals the truth for each word.

### 5.5 The finale

The player assembles, types or says the target sentence. Typed and built sentences are compared with the written
form (case, punctuation and diacritics ignored); spoken ones leniently. Success unlocks the verdicts.

### 5.6 Audio policy

Sound is produced only by: Listen/Slowly, a word chip, a dictionary example, a correct-answer chime, and the optional
**guide ping** (a soft tone from the direction of the next marker, **off by default**). Nothing plays on approach, on
opening a lesson or on load. A global mute exists. Voices come from the browser, so quality varies by device.

**Voice honesty.** A pronunciation game must not teach the wrong sounds. If no voice for the pack's language is installed,
browsers silently fall back to their default voice (usually English) and read the text with its sound rules. A _strict_ pack
(`speech.strict`, set for Danish) therefore stays **silent** and opens the Voice panel, which names the voice in use,
lets the player test and change it, and lists install steps for the player's platform. Voices load asynchronously, so a
press that arrives before the list is ready waits for it instead of guessing. An invented language is not strict: it is
read by the nearest voice as an approximation. A player may deliberately pick another voice; the panel then says it is not native.

## 6. Progression and fairness

- Encounters unlock in a chain (`requires`). Locked markers explain why.
- Nothing is lost by exploring: hints are free, wrong answers have no penalty, revealing is allowed.
- Progress is saved per language in `localStorage` (`language-quest-progress-v1:<pack>`). It stores only what the
  player did and believes, never answers.
- A "Reset progress" button (with confirmation) is in the Commands panel.

## 7. Art direction

The look is a minimal indie style in the manner of _Monument Valley_ (the concept, not its assets): isometric
architecture floating over a calm sea, **flat pastel faces with no outlines**, soft light, simple shapes and arches.

- **Flat shading.** Lambert materials under one soft ambient light and one sun give every box three tones (top, south
  face, east face). No outlines, no halftone, no textures on walls. Colours are not tone-mapped (`<Canvas flat>`), so
  the pastels on screen are the pastels in the pack.
- **Terraces** have a paved top (cobbles or inlaid tiles, only a few percent lighter or darker than the base) and
  sides that fade into the sea, with arched openings on the two faces the camera sees.
- **Figures** are small hooded cloaks with a pale face and a blob shadow; the player is the same shape in the accent colour.
- **Sea and sky** are one pastel gradient; there is no fog and no hard horizon.
- **UI** keeps the paper-and-ink sheets so text stays readable (contrast checked by the validator).
- **Palette rule.** Pastel means high lightness and low-to-medium saturation (the Danish wall colours are the real
  Nyhavn colours lightened and softened). Each pack keeps its own palette, tied to the place and the language.

|              | Danish pack                                                                                                                              | Maru pack                                                         |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Place        | Nyhavn, Copenhagen                                                                                                                       | Højbro Plads, Copenhagen                                          |
| Scenery key  | `nyhavn`                                                                                                                                 | `sandstone`                                                       |
| Architecture | tall narrow gabled houses in mustard, brick red, harbour blue, orange, sage, rose and navy; white window frames; shopfronts with awnings | flat-roofed sandstone façades with arched windows and balustrades |
| Palette      | pastel Nyhavn: powder blue sea, blush and cream cobbles, house colours in rose, butter, sky blue, sage; a soft Dannebrog red             | pastel sandstone: sand, apricot, mint water, dusty rose           |
| Props        | moored wooden boats, Dannebrog flags, bicycles, a red kiosk, a brass water pump                                                          | palms, a stone fountain, a market stall                           |
| Writing      | Latin lettering (painted signs)                                                                                                          | invented glyphs (carved reliefs)                                  |

The Nyhavn look follows the real place (the 17th-century harbour known for its rows of brightly painted houses)
but is stylised, not surveyed.

## 8. Architecture

```
            packs/*.ts  ──────────────  data only: lexicon, clues, encounters, phonology, theme, world
                │  (validated by packs/validate.ts, tested in scripts/tests)
                ▼
 MaruExpedition (shell) ── progress.ts (save, evidence, candidates, verdicts)
   │        │       │
   │        │       └── Lesson · Notebook · PhoneticDictionary · Finale   (React sheets, CSS variables from pack.ui)
   │        └────────── maruAudio.ts (speech, sound), maruPhonetics.ts (grading)
   ▼
 MaruWorld (R3F canvas) ── world/{Nyhavn,Sandstone,Terrain,Sea,Props,shared,toon}.tsx   (scenery chosen by pack.world.scenery)
                       └── maruTerrain.ts (tiers, stairs), maruNav.ts (height-aware A*), maruCamera.ts, markers, bubbles
```

Key decisions:

- **A pack is the only source of language content.** The engine contains no Danish and no Maru.
- **Encounter ids are story roles** (`fountain, vendor, guard, gate, archive`). Scenery components attach set pieces to
  them. A pack with different scenery can use other ids.
- **Colours are CSS variables** set from `pack.ui`, so a pack re-themes every sheet without touching components.
- **Pure logic is separated** (`maruPhonetics`, `maruNav`, `progress`, `packs/validate`) so it can be unit-tested in
  Node without a browser.
- Rendering is three.js through React Three Fiber (already a dependency). No extra engine was added.

## 9. Mobile and accessibility

- Layouts adapt to short landscape screens (`max-height: 480px`): compact HUD, sheets up to 90% of the height.
- Touch: tap to walk, tap a marker, a large **Look closer** button when something is in range; no virtual joystick.
- Keyboard: every command is rebindable (saved in the browser); typing in a field never triggers a command.
- Colour contrast of each pack's ink on paper is checked by the validator (7:1 target).
- Not yet done: screen-reader testing, a reduced-motion setting, captions for the pings, a dyslexia-friendly font option.

## 10. Testing

| What                                                         | How                                                                                                                                                                                             |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pack structure and design rules                              | `npm run packs:check` and `scripts/tests/packs.test.ts` (the validator is itself tested by breaking packs on purpose)                                                                           |
| Sound grading, evidence meter, candidate cards, verdicts, A* | `npm run test:lingua`                                                                                                                                                                           |
| Gameplay in a browser                                        | `scripts/e2e/*.mjs` (Playwright; needs a browser, see the header of each file): the Danish lesson flow, the finale and verdicts, the Maru pack. Run manually; not part of `npm run test:lingua` |

## 11. Known limitations and open questions

1. **Danish phonetics are unverified.** Spellings and grammar notes are standard Danish, but every IPA transcription and
   phoneme description was written without a pronunciation dictionary or a native speaker. They are flagged
   `verified: false` and labelled in the UI. This must be reviewed before the pack is trusted (see PACK_TEMPLATE §7).
2. **Real-device performance is untested.** Development used software rendering (about 5 fps). Use `?debug` on the real
   device to read fps and the GPU name. Outlines roughly double the geometry; a cheaper mode for phones is a likely next step.
3. **Speech depends on the device.** The game cannot ship a Danish voice; the player's system must provide one (the Voice panel
   explains how). Even a Danish synthetic voice can mispronounce words and should be checked against a native speaker. Recordings
   of the core words by a native speaker would be better than synthesis and are the recommended next step.
   Other speech limits: Synthesis quality varies; recognition exists in Chrome and Edge only, needs HTTPS or
   localhost and microphone permission, and is not a pronunciation scorer.
4. **IPA grading is lenient by design** because the reference may be imperfect: stops are merged (b≈p, d≈t≈ð, g≈k) and
   rounded back vowels are one class. This accepts some real errors. Tighten the classes once the data is verified.
5. **Evidence is only as good as the clue design.** A clue that fits several meanings is realistic but can mislead; the
   finale is the only ground truth.
6. **Single story.** Five encounters, one sentence. No spaced repetition, no review of earlier words after the story.
7. Learning effectiveness is **unmeasured**.

## 12. Roadmap ideas (not committed)

- Review mode that re-tests earlier words in new contexts (spaced repetition hooks into the Study Hub's existing SRS).
- A second chapter for Danish (numbers, directions, ordering at the kiosk).
- A cheaper rendering mode and a reduced-motion option.
- A pack editor page that runs the validator live.
- Real recordings from native speakers, replacing speech synthesis for core words.

## 13. Glossary

| Term              | Meaning                                                                       |
| ----------------- | ----------------------------------------------------------------------------- |
| Pack              | One language in one city: lexicon, story, phonology, theme and world as data  |
| Encounter         | One place and one person; teaches 1–4 words                                   |
| Clue              | An observation that may support one or more meanings; decoys support none     |
| Drill             | A word the player must transcribe                                             |
| Exposure          | A word heard in passing, not dictated                                         |
| Equivalence class | Sounds treated as identical when grading leniently                            |
| Evidence meter    | How well the chosen guess fits the clues the player noticed (not correctness) |
| Verdict           | The post-finale comparison of the player's guesses with the truth             |
