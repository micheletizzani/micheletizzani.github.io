# Character design: Paul Glotty and the "Living Characters"

Status: **proposal for approval, not built.** Source material: the owner's character sheet ("Paul Glotty, The Scholar (Revised)": front, two 3/4 views, "on the move") with a floating book and an eye-in-a-glyph-wheel emblem, a 10-second animation, and the owner's NPC concept ("The Living Characters").

## 1. What the references show

**Paul (sheet and video).**

- A near-black flat silhouette with no face: a brimmed hat, a small pointed nose, a short coat, thin legs, a walking staff.
- Two colour accents against the dark: a **scarf** that is the only saturated element (blue, magenta, gold gradient, covered in glyphs and sparkles of many scripts) and a **brown notebook and pencil** on a belt, with a small pouch.
- Poses: front, 3/4 (staff in hand), "on the move" (a bundle on a stick over the shoulder, the scarf streaming behind and leaving a ribbon of light).
- The video adds motion: the scarf flutters, he takes the pencil and writes in the notebook, he walks across pale dunes and the scarf trails a rainbow ribbon.
- Props floating around him: a small open book, an eye inside a wheel of letters (the "researcher's eye" emblem).

**NPCs (owner's concept).** Five archetypes that are letterforms brought to life: Gatekeeper (Q), Elder (Omega), Messenger (k or lambda), Merchant (hiragana a), Towering Scholar (T or gamma). Interactions: phonetic marks float around a speaker; when Paul learns an NPC's vocabulary, colour awakens inside the NPC's silhouette.

## 2. Honest assessment

- **It fits the art direction.** Flat dark silhouettes with one luminous accent suit the pastel, flat, outline-free isometric world: the characters will read clearly against pale terraces. [Likely]
- **The images are AI-generated concept art, not usable assets.** The video's captions are garbled ("The Gone is Consoverved a VIEW", "3/4 MEUAR"), and generated glyphs are not real writing. The characters must be **redrawn as vectors by us**, and the scarf glyphs must come from real scripts and real recorded words. [Certain for the garbled text, which I saw in the video frames]
- **Provenance:** check the terms of the generator you used before using its output commercially; we only treat it as reference. I cannot verify the terms.
- **Letterform NPCs cost design effort per language.** Each language world needs its own letters and silhouettes. I recommend authoring them as data plus a small library of hand-drawn archetype shapes, not generating silhouettes automatically from font outlines (automatic outlines would look inconsistent and need font files). [Guessing]
- **Colour awakening must not be the only signal** (colour-blind players) and must not hint at truth: it shows how much of a person's vocabulary the player has _recorded_, not whether the guesses are right.
- **Floating phonetic marks must not be an answer key.** They may show only generic marks (accents, diacritics) during speech, never the transcription of the target word.
- **Q is not a natural Danish letter** (it occurs only in foreign words) [Likely]. The archetypes should therefore take their letters from each language's own alphabet.

## 3. Paul Glotty: redesign spec

| Element             | Spec                                                                                                                                           |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Silhouette          | Solid near-black (#2b2a36), slightly textured by a subtle noise, hat with a band, pointed nose, short coat, two thin legs; no face, no outline |
| Scarf               | The only saturated element: gradient teal, magenta, gold; its pattern is **real glyphs** from the scripts in the player's notebook             |
| Notebook and pencil | Brown notebook and pencil on the belt; the pencil comes out when the player records a word                                                     |
| Pouch and staff     | Small leather pouch on the belt; walking staff in the right hand                                                                               |
| Emblem              | The eye-in-a-glyph-wheel as the game's logo and notebook cover, not a world prop                                                               |
| Palette             | Dark body #2b2a36, hat band #55506a, notebook #8a6a4a, pouch #6d5a48, scarf gradient #3fa7c9, #d9558c, #f2b84b                                 |

**Poses and motion (from the video).**

- _Idle:_ slow breathing sway, scarf lifts and settles.
- _Walk:_ body bob, scarf streams opposite to travel direction and leaves a short fading ribbon.
- _Write:_ when a word is recorded, the pencil moves across the notebook for about one second.
- _Look closer:_ hat tilts toward the thing studied.
- _Travel_ (bundle-on-staff pose): used on the map and for time-slips, not in normal walking.
- Reduced motion: scarf and ribbon static.

**Scarf as progress (new mechanic, optional).**

- Scarf length and glow grow with the number of words recorded; the glyphs on it are the **written forms of recorded words** in their own script, so the player carries a visible record of the language.
- It is purely a _display of what was recorded_ (same honesty rule as the notebook): it never says what is correct.
- Across languages it combines scripts (Danish Latin letters, an invented glyph, later others), which supports the cross-language notebook.

## 4. NPCs: "The Living Characters"

**Rule.** An NPC is a silhouette whose shape comes from a letter of the **language's own script**, chosen to fit an archetype. The letter is part of the character's body (head, tail, arms), not a mask.

| Archetype        | Role in play                                                 | Shape idea                                                                           | Letter (concept, any script) |
| ---------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------ | ---------------------------- |
| Gatekeeper       | Questions travellers, guards a gate or door                  | Round body, one aperture that glows when it speaks, a tail or slash as cane or staff | Q (Latin), O with a slash    |
| Elder / Scribe   | Holds old roots and archaic forms; hosts etymology mode      | Hunched arch on wide feet, a lantern shaped like an accent mark                      | Omega (Greek)                |
| Messenger        | Carries messages, fast travel between districts              | Very tall and thin, long angled limbs, scroll in the cross-stroke                    | k (Latin), lambda (Greek)    |
| Merchant         | Trades phrases and idioms for the notebook                   | Flowing loops, ribbon garments, wide sloping hat                                     | hiragana a (Japanese)        |
| Towering Scholar | Grammar purist: silent until addressed in the right register | Rigid vertical body with a flat cantilevered head like a roof                        | T (Latin), gamma (Greek)     |

**Danish proposal** (letters from the Danish alphabet: a, b, ..., z plus the three letters æ, ø, å [Certain]):

| Archetype        | Danish letter | Why                                                                             |
| ---------------- | ------------- | ------------------------------------------------------------------------------- |
| Gatekeeper       | Ø             | A circle (body, glowing aperture) with a slash (the staff or the bar of a gate) |
| Elder            | Å             | A ring above an A: the ring is the lantern                                      |
| Messenger        | k             | Tall and angular; also the first letter of København (Copenhagen)               |
| Merchant         | Æ             | Two joined bowls: stall awning and apron                                        |
| Towering Scholar | T             | A rigid post with a flat head                                                   |

**Chapter 1 (airport) casting** (proposal): door man = Ø (the Gatekeeper), ticket-machine woman = Æ (Merchant), platform guard = T (Towering: "waits until you speak"), tourist = k (Messenger, asks the question), boards watcher = Å (Elder, watches the boards).

**Other worlds.** The archetypes stay, the letters change: a Greek world uses Omega and Gamma; a Japanese world uses hiragana; the invented language (Maru) uses its own glyphs. Authoring an NPC is data: `{ archetype, letter, tint }` plus the shape library.

**Interaction ideas, with rules.**

1. _Speech marks._ While a line is playing (only after the player asks to listen) small abstract marks (accents, macrons, umlauts) drift around the speaker's head. Rule: decorative, never the transcription of the word being taught.
2. _Awakening._ Colour fills a silhouette in proportion to how many of the words this NPC taught have been **recorded**. At the finale and verdicts it may complete. Rule: not the only indicator (the Notebook still lists words); not tied to correctness.
3. _Name glow._ The glyph aperture glows when the NPC can be spoken to (replaces the gold marker's role as a character cue; the marker stays for interaction).

## 5. How it would be built

- **Rendering:** characters as camera-facing **2D billboard layers** (body, hat, scarf, notebook) drawn from SVG path data into canvas textures at the device pixel ratio, mirrored for left/right facing, animated with transforms. The isometric camera never rotates, so a fixed 3/4 sprite is enough; the sheet's 3/4 views become the single base view. [Likely]
- **Scarf:** a ribbon mesh with a canvas texture (gradient plus glyph text) and a vertex wave, plus a short trail of fading quads.
- **Data:** extend `NpcSpec` with `archetype`, `letter`, `tint`, `taughtWords` (to compute awakening); Paul gets a `CharacterStyle` (palette, scarf gradient) in the shared theme.
- **Files:** a `world/characters/` folder (shape library, `Paul`, `LetterFolk`, `Scarf`), no change to the engine's rules, pack data only gains optional fields (content stays separate from dynamics).
- **Tests:** validator checks that every NPC has an archetype and a letter present in the pack's script notes; the visibility probe ignores characters (already `noOcclude`); a screenshot check for each archetype.

## 6. Phases

1. **Paul** (billboard, scarf, idle and walk, notebook pose), replacing the current cone figure. Screenshots on desktop and phone landscape.
2. **The five archetypes** as shapes plus Danish letters; chapter 1 casting; tint and aperture glow.
3. **Awakening** from recorded words; scarf as progress.
4. **Speech marks** tied to the Listen action.
5. Poses from the video: write, look, travel.

## 7. Risks

- Legibility of dark silhouettes at about 50 pixels tall on a phone: needs a test on a real device.
- Letter shapes may read as costumes, not letters; we must iterate on the five shapes visually.
- Time: five hand-built silhouettes, each needing a tidy vector path, is the main cost.
- Provenance of the reference art (see section 2).

## 8. Decisions needed

1. Approve the billboard-sprite approach (instead of 3D extruded letters).
2. Approve the Danish letter set (Ø, Å, k, Æ, T) and the chapter 1 casting.
3. Approve "scarf as progress" (a display of recorded words) or keep the scarf decorative.
4. Start with Paul only (phase 1), then the NPCs?
5. Keep the gold interaction marker, or replace it with the glowing aperture?
