# Adding a language, a chapter or a city

Everything a language needs lives in one **pack** file. You should rarely have to touch engine code. This guide
covers: a new language (§1–§8), a new story chapter (§4), a new look for a new place (§9), and the checks to run
before you trust the result (§11).

Start from [`packs/_template.ts`](../../src/components/tools/lingua/packs/_template.ts): a complete, valid mini pack
that is under test, so it always matches the current types.

## 1. Quick start

```bash
cp src/components/tools/lingua/packs/_template.ts src/components/tools/lingua/packs/es.ts   # your language code
```

1. In `es.ts` rename `template` to `es` and replace everything marked `REPLACE`.
2. Register it in `packs/index.ts`: `import { es } from "./es"; export const PACKS = [da, maru, es];`
3. `npm run packs:check`: fix every error; decide on every warning.
4. `npm run dev`, open `/tools/maru/`, switch language on the map screen, and play it through (§11).

The language switch, saved progress (`language-quest-progress-v1:<id>`), theme and notebook all pick the pack up
automatically.

## 2. Anatomy of a pack

| Field | What it is | Rule enforced by `npm run packs:check` |
| --- | --- | --- |
| `id`, `name`, `nativeName` | identity | ids unique |
| `script` | `"latin"` (painted lettering) or `"glyph"` (invented glyphs) | |
| `speech.synth` / `speech.recog` | BCP-47 tags for the voice the player hears / the recogniser | |
| `speech.strict`, `speech.testPhrase` | for REAL languages: stay silent and explain when no voice for `synth` is installed (instead of an English voice reading it); `testPhrase` is a short, certainly-correct phrase for the voice test button | `strict` requires `testPhrase` |
| `notation` | how sounds are written (`ipa` or `romanisation`), on-screen keys, ignored marks, equivalence classes | keyboard and dictionary must cover every symbol used in `sound` (warning) |
| `phonology[]` | the phonetic dictionary: symbol, name, how to make it, real keywords | every keyword list non-empty; a symbol used by a word should have an entry (warning) |
| `meanings[]` | picture cards (use `MEANING_LIBRARY`) | each picture exists |
| `lexicon[]` | words: `written`, `sound`, true `meaning`, `pos`, notes, `verified` | meaning exists; `verified` must be true if the pack claims `verified` |
| `encounters[]` | the story chain (§4) | one root, no cycles, drilled words need ≥ 2 supporting clues, approach point not inside a building |
| `finale` | the closing sentence | words exist and were introduced; `shuffled` is a permutation of `target` |
| `ui` | interface colours | ink on paper ≥ 7:1, accent text ≥ 4.5:1 (warning) |
| `world` | scenery key, palette, buildings (also collision), people, signs | signs reference real words |
| `verification` | honest status of the content | see §7 |

## 3. Choosing the words

For a first chapter pick **concrete, observable** words that can be demonstrated on screen: a thing (water, cup,
key), a person (I), an action (have, give), a state (closed). Add one contrast pair (singular/plural, affirmative/
negated) and one linking word (because). End with a sentence that uses only words the player has met.

Avoid for a first story: words whose meaning cannot be shown (abstract nouns), irregular forms you have not
decided how to teach, and more than four new words per encounter.

## 4. Writing an encounter

An encounter is *one place, one person, one idea*. For each one write:

1. **`scene`**: what the player sees, in English, **without the target word**. The validator warns if the drilled
   word appears.
2. **`say`**: what the person says, as written text in the target language. It is spoken only when the player
   presses Listen.
3. **`drills`**: the words the player will transcribe (1–4). **`exposure`**: words heard in passing.
4. **`clues`** (the heart of the design, §5).
5. **`reveal`**: a `line` and a `discovery` shown after the encounter is recorded. These may name the pattern
   ("the ending marks more than one") but should not translate beyond what the player has already inferred.
6. **`requires`**: the previous encounter. Exactly one encounter has none.
7. **`position`** (where the person stands, in metres: x east, z south) and **`approach`** (where the player stands).
   Positions also place the numbered markers on the map screen.

Encounter ids are story **roles**: `fountain, vendor, guard, gate, archive`. The existing scenery draws a set piece
for each (a pump, a kiosk, a booth, a gate, an archive door). If your story needs different set pieces, see §9.

## 5. Designing clues

A clue is something the player may notice. Six kinds:

| Kind | Example (Danish *kopper*) |
| --- | --- |
| `object` | The tray holds a row of identical cups. |
| `action` | The child drinks from the cup. |
| `gesture` | She counts one finger, then opens her whole hand over the tray. |
| `writing` | The same word is painted on the pump, the basin and a bucket. |
| `contrast` | One cup is named, then a tray: the second word ends differently. |
| `context` | A cyclist rings a bell. (usually a decoy) |

Fields: `supports` lists the meanings the clue is **compatible with** (not just the true one), and `about` the words
it helps with. A clue with `supports: []` is a **decoy**.

Rules of thumb (the first two are validated):

- **At least two supporting clues per drilled word**, ideally of different kinds, so confidence can actually grow.
- **At least one decoy per encounter.** Real scenes are noisy.
- **Be honest in `supports`.** If "the child drinks" is compatible with both *water* and *drink*, list both. The
  candidate cards always include every meaning your clues allow, so the player has to discriminate.
- **Write the clue as an observation**, not a hint: "He pulls the gate and it does not move", not "the word means closed".
- Give each clue an icon from the picture library (`picture`).

### Worked example

```ts
{
  id: "vendor", name: "Coffee Kiosk", phase: "Connect",
  position: [-6, 0, -2], approach: [-4.1, -0.6], requires: "fountain",
  scene: "At a red kiosk the vendor lifts one steaming cup and names it, then sweeps her hand over a tray of cups and names them again with a small change.",
  say: ["En kop.", "Kopper."],
  clues: [
    { id: "v-one",   kind: "contrast", text: "One cup is lifted and named. Then a whole tray is indicated and the word ends differently.", picture: "cups",  supports: ["cup", "cups"],  about: ["kop", "kopper"] },
    { id: "v-count", kind: "gesture",  text: "She counts on her fingers: one, then she opens her whole hand over the tray.",              picture: "count", supports: ["cups", "a"],    about: ["kopper", "en"] },
    { id: "v-steam", kind: "object",   text: "Steam rises from the cup: it holds something hot to drink.",                                picture: "steam", supports: ["cup", "drink"], about: ["kop"] },
    { id: "v-tray",  kind: "object",   text: "The tray holds a row of identical cups.",                                                   picture: "tray",  supports: ["cups"],         about: ["kopper"] },
    { id: "v-bell",  kind: "context",  text: "A bicycle bell rings behind the queue.",                                                    picture: "bell",  supports: [] },
  ],
  drills: ["kop", "kopper"], exposure: ["en"],
  reveal: { line: "One cup and many cups sound almost the same.", discovery: "The second word just ends differently when there are several." },
}
```

## 6. Sounds: notation, grading and the phonetic dictionary

**Choose the notation.** `ipa` is universal and teaches the real system but is hard to type and hard to get right;
`romanisation` suits invented languages or beginners. For IPA the player gets an on-screen keyboard (`notation.keyboard`)
and the phonetic dictionary can insert symbols into the answer.

**What is graded**

- *Typed* answers → `gradeSound(sound, alsoAccept, guess, notation)`: characters in `notation.ignore` are stripped
  (stress, length, glottal stop, spaces), combining marks are removed, then sounds in the same `equivalent` class are
  merged. IPA allows one slip per five sounds; romanisation must match exactly.
- *Spoken* answers → the browser recogniser (`speech.recog`) → compared with `written` leniently. For an invented
  language the recogniser only checks that the player said something close.

**`equivalent` classes.** Use them to forgive distinctions that learners cannot hear yet or that you are not sure about:

```ts
equivalent: [["ɔ","ʌ","o","ɒ"], ["b","p"], ["d","t","ð"]]
```

The first symbol of a class is its representative. A class makes the game lenient, so every class you add accepts some real errors
(for example b≈p merges a true Danish contrast in the eyes of the grader). Tighten the classes once the data is verified.

**`alsoAccept`** lists other transcriptions you accept for one word (dialect variants, common learner notation).

**Phonetic dictionary entries.** For each sound give a plain-language `how` ("say *ee* with rounded lips"), a `spelling`
warning when letters mislead ("Danish *b d g* are not voiced like English"), `confusableWith`, and 1–3 real `keywords` the
voice can speak. If a keyword is also a game word its transcription and gloss are hidden until the sound task is done,
so keep keywords that are *not* in the story where you can.

Sounds in the dictionary are spoken as whole words by the browser voice. There is no isolated-phoneme audio.

## 7. Content verification (do not skip for real languages)

A game that teaches pronunciation must not teach the wrong thing. Treat every item below as a claim someone must check.

| Claim | Check against | Who |
| --- | --- | --- |
| spelling, meaning, grammar note | a standard dictionary (for Danish: *Retskrivningsordbogen*, *Den Danske Ordbog* at ordnet.dk) | you |
| `sound` (IPA), `alsoAccept` | a pronunciation dictionary or a native speaker | native speaker |
| phoneme descriptions and keywords | a phonetics reference for the language, or a native speaker | native speaker or phonetician |
| a voice for the language exists and reads each word correctly | listen on the target devices; set `speech.strict: true` so a missing voice is reported instead of an English one reading it | you |
| recognition accepts a correct pronunciation | try it in Chrome with a real voice | native speaker |

Set `verified: true` on a word only after its `sound` and `speak` are confirmed, then set `verification.status` to
`"verified"`. While anything is unconfirmed leave `status: "unverified"` and write what remains in
`verification.note`: the phonetic dictionary shows a banner and the notebook marks unverified words.
The validator refuses a pack that claims `verified` while a word is not.

> The shipped **Danish pack is unverified**: spellings and grammar notes are standard Danish, but its IPA and phoneme
> descriptions have not been checked. Review them before relying on the pack.

## 8. Theme: colours from the language's place

The interface and the 3D world are coloured from the pack so that the game feels like the place where the language is
spoken. Process used for Danish / Nyhavn:

1. Look at photographs and the architecture of the place; list the 6–8 colours that define it (Nyhavn: mustard, brick red,
   harbour blue, cream, orange, sage, rose, navy; the red-and-white Dannebrog; harbour teal; cobble grey).
2. Put the wall colours in `world.buildings[].color`, the ground and water in `world.palette`, figures' clothes in
   `palette.cloaks`.
   **Make every colour pastel**: lighten and soften the real colours (roughly lightness 75–90 %, saturation under 60 %).
   Flat faces on a pale sea read well; strong saturated colours look harsh without outlines. `palette.sky` is the
   background gradient (top, bottom); `palette.water` is the sea.
3. Pick **ink** (text, window glass) as a dark-ish version of the place's darkest colour and **paper** as a warm light.
   Check contrast (§2). The Danish pack uses navy ink on warm white with Danish red as the accent.
4. Set `ui.wash` low-opacity (it is no longer drawn over the scene, but the field stays in the type for now).

Do not use national symbols carelessly: use them as they appear in the real place (flags on poles at the quay), not as
decoration everywhere.

## 9. A new look: scenery, set pieces, a new city

The 3D world is drawn by a **scenery** component chosen with `pack.world.scenery`. Two exist:

- `nyhavn`: gabled, brightly painted houses along a canal, boats, flags, bicycles. (`world/Nyhavn.tsx`)
- `sandstone`: flat-roofed arched façades. (`world/Sandstone.tsx`)

**Reuse first.** A new language in Copenhagen can reuse one of these and only change colours, building list, people and signs.

**A new scenery component**

1. Create `world/<Name>.tsx` exporting `<Name>Scenery`. Render `<Sea />` and `<Terrain pattern="cobble" | "tiles" />` first (they
   draw the floating terraces and stairs from `world.tiers` / `world.stairs`), then buildings from `pack.world.buildings`
   (their `position[1]` is the terrace height), props, and `pack.world.signs` (use `<Sign sign={s} />`).
   Build from the flat primitives in `world/toon.tsx` (`Box`, `Round`, `Ball`, `Gable`) and `world/Props.tsx` (benches, lamps,
   planters, boats, a fountain). No outlines: use `lighten`/`darken` for trim. Windows and doors are flat `meshBasicMaterial`
   planes a hair in front of the wall.
2. Add your key to `SceneryKey` in `packs/types.ts` and to the conditional in `MaruWorld.tsx`.
3. **Layout.** Use `terraces({...colours})` and the `SPOTS` / `NPC_SPOTS` / `westHouses` / `archiveHouse` / `gateWall` helpers from
   `packs/layout.ts`. They already satisfy the visibility rule: tall things only on the west and north edges, only low things
   (planters, benches, a counter, the kiosk) on the south and east edges, and every set piece under 2.2 m high where it
   stands in front of something. If you draw your own layout, run `npm run packs:check` (exact ray test) and
   `node scripts/e2e/visibility.mjs` (the real scene, needs a browser): both must report at least 98 % of walkable ground visible.
4. Fixed positions (data in `packs/navgrid.ts`): the central piece at (0, 0, 2) with radius 2.4 and the kiosk at (−7.6, 0, −0.4).
5. Test with `?debug` on a phone; `window.__lq.visibility()` in the console reports what the camera sees.

**Props worth adding for a place** (Nyhavn as the example): transport (boats, bicycles), signage (flags, painted signs),
street furniture (benches, lamps, bollards), vegetation, and one food or drink stand.

**A new city (not only a new language).** The map screen (`CityMapArt.tsx`) and the terrace layout (`packs/layout.ts`) are Copenhagen-specific and are **not pack data yet**. For another city: draw a new map SVG, add a `mapArt` key to the
pack and select it in `MapScreen`, and decide whether the 30 × 25 m world is enough. This is the main extension point not yet built.

**Pictograms.** To add a picture card or clue icon: add a `PICTURES` entry (a list of `{ d, fill? }` shapes on a 48-unit grid) and,
for a meaning, a `MEANING_LIBRARY` entry in `maruPictureData.ts`. Fill tokens (`ink`, `paper`, `gold`, `accent`, `water`, `leaf`, `wood`)
recolour with the pack's theme.

**Invented scripts.** Glyph words are drawn from `language.ts` (`WORDS`, `AFFIXES`: an SVG path per word in a 32-unit box).
A new invented language adds its words there and sets `script: "glyph"`. Real scripts use `script: "latin"`.
Right-to-left or non-Latin real scripts are not supported yet.

**Interface language.** All interface text is English; learner-language support is not implemented.

## 10. Adding a chapter to an existing pack

1. Add the new words to `lexicon` (with `verified` set honestly).
2. Add encounters after the finale's encounter, or turn the old finale encounter into a normal one and move
   `finale.encounter` to the new last one. Keep exactly one root.
3. Add phoneme entries for any new sound.
4. Update `finale` (or add a second sentence for the new chapter).
5. `npm run packs:check` then play the whole chain again: saved progress from before stays valid because it stores ids only.

## 11. Before you merge: checklist

- [ ] `npm run packs:check` has no errors; every warning is either fixed or consciously accepted.
- [ ] `npm run test:lingua` passes. (The template is tested too: if you change the types, update `_template.ts`.)
- [ ] You played the whole chain on desktop **and** in landscape on a phone (or an emulator): every marker reachable, every
      lesson completable, the finale solvable, verdicts correct.
- [ ] Nothing plays until the player asks (no audio on load, approach or opening a lesson).
- [ ] You listened to every word with the target voice on at least two browsers/devices.
- [ ] `verified` flags and `verification.note` are honest; unverified content is visible as such.
- [ ] Contrast checked; text readable on the 3D scene at both zoom levels.
- [ ] The whole walkable world is on screen at zoom 1, on desktop and in phone landscape (`node scripts/e2e/visibility.mjs`).
- [ ] The palette is pastel and tied to the place.
- [ ] `?debug` shows an acceptable frame rate on a mid-range phone.
- [ ] No copyrighted assets, brand logos or real people were used. Place-inspired art is stylised, not copied.

## 12. Common mistakes (all seen while building the first packs)

| Mistake | How the validator or tests catch it |
| --- | --- |
| A drilled word with only one supporting clue | error: *need at least 2* |
| Finale uses a word no encounter introduced | error: *never introduced in an encounter* |
| `scene` contains the answer | warning: *gives the answer away* |
| Approach point inside a building | error: *approach point … inside a building* |
| A clue `about` a word that is not in that encounter | error: *not a drill/exposure word* |
| Meaning-card list missing a plausible rival | test: *meaning cards always include … every rival* |
| Pack marked verified with unchecked words | error: *pack says verified* |
| A factual note that is simply wrong (e.g. the wrong gender of a noun) | **not caught**: needs a human reviewer (§7) |

The last row is the important one: the tools check structure, not truth.
