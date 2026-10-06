# Etymology mode, cross-language notebook and open-world side quests

Status: **design, not built** (only the data fields in [CONTENT_ARCHITECTURE.md](./CONTENT_ARCHITECTURE.md) section 3 exist).
Implements the owner's decisions 2 and 4 (see [NARRATIVE_DESIGN.md](./NARRATIVE_DESIGN.md) section 9).

## 1. Etymology mode

**Rule.** Archaic forms (Old Norse, Old Danish, runic) appear **only in etymology mode**, as written evidence that links an old
form to a modern word. They are never spoken by the game (there is no verified voice for them; the voice-honesty rule stays).
Cross-language links are allowed here and are the point: other languages' influence on the word is part of its story.

**How the player enters it.** A word in the world (a sign, a label, a tag on an object) _flickers_ once the player has recorded the
modern word. Interacting opens a short **time-slip scene**: the place as it was, with an object or inscription carrying the older
form. This is the side quest; the main story never requires it.

**Scene structure** (all data, from `etymology` steps):

1. Modern word the player knows.
2. The older form, shown as an inscription, label or manuscript line (written only; letters shown, no audio).
3. An object or action that fixes the old meaning (a clue, graded like any clue: consistency with evidence, not truth).
4. The player connects old form and modern word (choose the matching pair, or place letters), then returns.
5. Reward: an **etymology card** in the notebook, a new tab next to Words, Sounds and Story.

**Pillar check.** The game "never states a meaning". The older form is a _clue_, not a gloss: the player infers the link, and the
verdict arrives after the mode, as in the main loop. The card then states the verified history with its `sources`.

**Why this is also pedagogy.** Etymology gives learners an anchor for words that are hard to infer (and for spelling vs sound
mismatches). It is optional because it adds load.

**Content burden.** Every `etymology` step needs a source (the ONP, runic database, etymological dictionary). Unsourced etymology must not ship.
A worked example is deliberately left to the reviewer: an etymology I cannot source here should not appear in this repository.

## 2. Cross-language notebook

**Behaviour (owner decision).** After the player has played several languages, the **records from the other languages appear in the notebook**, so the
player can guess a meaning by etymology and similarity with languages they already worked on.

**Design.**

- A new notebook tab, **From other languages**, per word: shows the player's own earlier records (written form, the sound they typed, their guess, and, once verdicts have been revealed, the verified meaning) for words flagged as cognate (`cognates: ["packId:wordId"]`).
- A cognate is a **clue of a new kind**, `cognate`, with `supports` computed from the other word's meaning. It counts in the evidence meter as one more kind of clue. It is shown only for words the player has recorded in the other language, so it can never leak an answer they have not earned.
- **False friends are first-class.** Authors can flag a cognate link as `misleading` so the clue supports a wrong meaning on purpose, like a decoy. (Example the reviewer may verify: Danish _gift_ and German _Gift_ look the same and mean different things. I believe this is correct but have not sourced it.)
- Only the player's records are shown, never another language's full lexicon, so the discovery stays the player's.

**Data needs.** `cognates` on `LexiconEntry` (present), a `misleading` flag (to add), a notebook tab, a cross-pack progress reader (progress is stored per pack today: `language-quest-progress-v1:<id>`; reading several is straightforward).

**Constraint.** Needs at least two real languages in the game; today Danish is full and Greek is a teaser. Danish and Greek share Indo-European cognates (for example the words for water and the Greek-derived names for the alphabet), which can seed the first cross-language notebook records once both are verified.

## 3. Open-world side quests, written by an LLM from small instructions

**Owner idea.** An open world where interactions are created and loaded by an LLM from small instructions attached to the interactive elements.

### 3.1 The central design rule

**The LLM never decides what is correct in the language.** It arranges and describes; the lexicon, the sentence bank and the validator decide.
Reason [Certain]: language models make errors in Danish spelling, IPA, inflection and etymology; a pronunciation game must not teach them.

### 3.2 Interaction cards (the "small instructions")

Every interactive element in the world carries a card. The card is data, authored by a human:

```jsonc
{
  "id": "bakery-counter",
  "anchor": "bakery counter", // where it appears in the scene
  "kind": "errand", // errand | conversation | recall | etymology | culture
  "brief": "A baker asks the player to hand over what a customer wants. Practise the food words and 'jeg vil have'.", // <= 60 words
  "vocabulary": ["brød", "kaffe", "kage"], // lexicon ids the quest may use (closed list)
  "patterns": ["jeg-vil-have-NOUN"], // sentence templates from the verified sentence bank
  "difficulty": 2,
  "mustNotReveal": ["meanings of vocabulary"],
  "teaches": "pattern: wanting something",
}
```

### 3.3 What the generator produces

Input: the card, the player's notebook state (which words they have recorded and how well they recalled them), and the schema.
Output: a **structured quest** in the same JSON shape as an encounter (scene text, clues with `supports` and `about`, drills drawn from `vocabulary`, optional exposures, a reward).

**Hard constraints, enforced by code, not by the prompt:**

1. Target-language strings come **only** from the lexicon and the verified sentence bank (fill slots, never free text). The LLM writes the English-side scene and clue descriptions.
2. Every word id must exist in the lexicon and be within the card's `vocabulary`.
3. The result passes the **same validator** as hand-written encounters: at least two supporting clues per drilled word, a decoy, no answer in the scene, finale/sentence built from known words.
4. A reviewer-visible "generated" label; generated quests do not mark `verified`.
5. A deterministic fallback quest (template filled from the card) is used when generation fails or is offline.

### 3.3.1 Why this keeps the dynamics intact

The generator is just another _content author_. The engine, the validator and the loop (Observe, Sound, Meaning, Notebook) do not change. Correcting Danish content changes the lexicon and the sentence bank; cards and generator keep working.

### 3.4 Where the LLM runs (options)

| Option                                                                                                                   | Pros                                             | Cons                                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| **A. Authoring time** (recommended first): generate batches offline, validate, a human reviews, ship as ordinary content | Safe, free at runtime, reviewable, works offline | Not truly open; limited variety                                                                                 |
| **B. Runtime with the player's own API key**                                                                             | Open-ended; no server                            | Key handling, cost to player, privacy; browser calls from a static site                                         |
| **C. Runtime through a small proxy service you host**                                                                    | Control over keys, rate limits, logging          | You need a backend (the current site looks like a static GitHub Pages site [Likely: not checked]), ongoing cost |
| **D. On-device model**                                                                                                   | Private, offline                                 | Weak at Danish; quality unproven [Guessing]                                                                     |

Recommendation: start with **A**, add **B or C** only after the validator (3.3) is proven on a few hundred generated quests.

### 3.5 Quest kinds the cards can request

- **Errand**: a short task that uses 3 to 6 known words (buy, fetch, give, find).
- **Conversation**: a short exchange in which the player picks or composes replies from known words.
- **Recall**: the notebook is hidden; the player uses what they remember (see section 4).
- **Etymology**: opens an etymology scene (section 1) built from `etymology` data, not generated text.
- **Culture**: food, recreation, places (Tivoli, a bakery, a harbour bath): exposure to cultural vocabulary with a small task.

### 3.6 Risks

- **Danish errors.** Mitigated by 3.3 (closed vocabulary and sentence bank). Residual: wrong English clue text that misleads; the validator checks structure, not truth.
- **Answer leakage.** Generated scenes can state a meaning. Add an automatic leak check (the validator already warns on the target word in the scene; extend it to meanings of drilled words).
- **Quality drift and repetition.** Cap generation per card; keep a library of accepted quests.
- **Safety and cost.** Rate limits; no user free text sent to the model without need; no personal data.
- **Evaluation.** Unmeasured. Define a small acceptance test (validator pass rate; reviewer approval rate; player completion rate) before scaling.

## 4. Recall levels (notebook lost)

The owner asked for levels in which the protagonist loses the notebook and must use what he learned.
Design: a **recall mode** that hides the notebook and dictionary, keeps the world and the people, and logs unaided successes per word in progress (not in the notebook). Place four recall levels after consolidation points, increasing in difficulty, with the lost notebook found by following the dynamics the player already knows (see [NARRATIVE_DESIGN.md](./NARRATIVE_DESIGN.md)). The short-memory trait can be a mechanic here: evidence the player did not record in the notebook fades.
