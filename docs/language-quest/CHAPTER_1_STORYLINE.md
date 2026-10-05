# Chapter 1: _Skilt_ (Signs): storyline for approval

Status: **approved and built** (owner decisions: vocabulary and final sentence approved; separate pack sharing Danish progress; English-only narration; protagonist **Paul Glotty**; stylised airport). The built text differs slightly from the drafts below: the validator forbids narration that names the meaning of a taught word, so a few lines were rewritten. The authoritative text is in `src/components/tools/lingua/packs/da1.ts`.
Lens: **Signs** ([CALVINO_GUIDE.md](./CALVINO_GUIDE.md)). Place: **airport and metro**. Length target: about 20 to 25 minutes, five encounters.
All Danish below is **unverified** and listed for your review (see [CONTENT_ARCHITECTURE.md](./CONTENT_ARCHITECTURE.md)).

## 1. What this chapter must do

1. Introduce the protagonist, the notebook and the loop (observe, listen, infer, record) in a place where signs are everywhere.
2. Teach about ten words and one grammar discovery (the definite ending _-en_: _udgang → udgangen_, _metro → metroen_).
3. Plant the series hook: a station sign whose letters look **older** and a flicker of another time.
4. Be playable on its own and lead into Chapter 2 (the built Nyhavn pilot).

## 2. Story, in short

A researcher lands in Copenhagen carrying a photocopied sentence he cannot read. Every sign in the airport is in Danish; someone has
painted over the English with great care. He must get out of the building and onto the metro. Each helper he meets points at something
that has a word on it, and says that word. By the end he can ask one question, "where is the metro?", and the answer is a train that
arrives with a station sign written in older letters. The sign wobbles; the station is, for a moment, somewhere else.

## 3. Setting (three levels, as the engine requires)

| Level            | Place              | Props (pastel, flat, symmetrical, deadpan)                                             |
| ---------------- | ------------------ | -------------------------------------------------------------------------------------- |
| Low (quay level) | **Arrivals hall**  | Two hanging boards, a baggage belt, arrows on the floor, a yellow-vested man at a door |
| Middle           | **Ticket hall**    | A ticket machine, a queue that never moves, a bench with a sleeping pilot              |
| High             | **Metro platform** | A platform, a train, a station sign, a guard with a whistle                            |

Stylised, not a survey of the real terminal. The visibility rule applies: tall things (the board gantry, the station roof) stand on the far edges only.

## 4. Characters (five, as in the pilot)

| Role                        | Prop                        | Purpose                                     |
| --------------------------- | --------------------------- | ------------------------------------------- |
| The researcher (player)     | notebook, photocopy         | Silent. Notebook voice only                 |
| Board watcher (a traveller) | looks at one of two boards  | Contrast clue                               |
| Door man (airport worker)   | yellow vest, holds the door | Names the exit                              |
| Machine customer            | a card, a ticket            | Names the ticket and the metro              |
| Platform guard              | whistle, arm out            | Names the train; answers the final question |

## 5. Encounters and words

| #   | Encounter             | What the player sees                                                                                    | Words (drills)                                           | Clue kinds                | Decoy                           |
| --- | --------------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ------------------------- | ------------------------------- |
| 1   | **The Boards**        | People who just landed look at the left board; people with bags look at the right                       | _ankomst_, _afgang_                                      | contrast, action, writing | A man reads the weather on both |
| 2   | **The Door**          | The door man says one word to everyone who passes; it is also painted above the door                    | _udgang_, _dør_                                          | object, writing, gesture  | A child tries to push the wall  |
| 3   | **The Machine**       | A woman feeds a card to a machine; a small paper comes out; she names it, then names where she is going | _billet_, _metro_                                        | action, object, context   | A pigeon pecks at the coin slot |
| 4   | **The Platform**      | A train arrives, doors open; a lost tourist says one word and the guard points                          | _tog_, _hvor_                                            | action, gesture, contrast | A suitcase rolls by itself      |
| 5   | **The Sign** (finale) | The guard waits. The station sign above him is in older letters                                         | sentence: _Hvor er metroen?_ (exposure: _er_, _metroen_) | writing, context          |                                 |

Total about 10 words; grammar discovery: _-en_ ("the") on _metroen_ and (shown in the notebook) _udgangen_.

## 6. Checkpoints and on-screen story text

The new feature: **story text on screen at each checkpoint and main interaction area**, in the style of an RPG dialogue box. Draft English text below (narration is English; Danish appears only where a person speaks, and is never translated).
Narration never states what a word means; it describes what happens.

| ID      | When it shows                    | Speaker             | Draft text                                                                                                                                                                                                                                                                                                                                                |
| ------- | -------------------------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| C0      | Chapter start (full-screen card) | City card           | "In Skilt nobody asks the way. The city answers before the question: a hand painted on a wall, an arrow on the floor, a word above every door. The traveller believes he is being guided. He learns later that the signs were put up by earlier travellers, who were also lost, and that each arrow points to where its painter hoped the exit would be." |
| C1      | First control (arrivals hall)    | Notebook            | "Copenhagen Airport, 06:40. One suitcase. One notebook. One photocopied sentence nobody, including its owner, can read. Every sign is in Danish. Someone has painted over the English with great care." Objective: **Leave the airport.**                                                                                                                 |
| C1b     | After 8 seconds idle             | Notebook            | "FIRST WORD: UNKNOWN. Underlined twice."                                                                                                                                                                                                                                                                                                                  |
| E1 in   | Walk near the boards             | Narrator            | "Two boards hang above the hall. People who have just landed look at the left one. People with bags look at the right one. Nobody looks at both."                                                                                                                                                                                                         |
| E1 done | Record                           | Notebook            | "Danish appears to contain fewer vowels than necessary. I have written the same word three ways. They may all be right."                                                                                                                                                                                                                                  |
| E2 in   | Walk near the door               | Narrator            | "A man in a yellow vest holds a door open with his foot and says one word to everyone who passes. The word is also painted above the door. He seems to consider this thorough."                                                                                                                                                                           |
| E2 done | Record                           | Notebook            | "Doors, apparently, have names that are not 'door'. Or one of them is. I am not certain which." (Careful: this must not reveal either meaning; the final text will be checked.)                                                                                                                                                                           |
| (gate)  | Between levels                   | Narrator            | "The way up is a staircase of eleven steps. Each has a word. I decline to read them."                                                                                                                                                                                                                                                                     |
| E3 in   | Walk near the machine            | Narrator            | "A woman feeds a card to a machine. The machine returns a small rectangle of paper. She says its name, as one names a pet."                                                                                                                                                                                                                               |
| E3 done | Record                           | Notebook            | "The rectangle is evidently important. People hold it like an apology."                                                                                                                                                                                                                                                                                   |
| E4 in   | Walk near the platform           | Narrator            | "A train arrives. Doors open. A tourist says one short word to the guard, who raises his arm and does not say anything at all."                                                                                                                                                                                                                           |
| E4 done | Record                           | Notebook            | "The guard answers questions with his elbow. I find this more informative than most of the conversations I have had at conferences."                                                                                                                                                                                                                      |
| E5 in   | Approach the guard               | Narrator            | "The guard waits. Above him the station sign has been painted in letters I almost recognise."                                                                                                                                                                                                                                                             |
| E5 done | Sentence solved                  | Narrator            | "He lifts his arm. The train opens its doors. The last letter of the station sign wobbles, like a tooth."                                                                                                                                                                                                                                                 |
| C9      | Chapter end (card)               | Notebook, then card | "The word on the sign looked older than it did a minute ago. Notes: possibly nothing." Then: **Chapter 2 · Navn · Nyhavn.**                                                                                                                                                                                                                               |

The same lines are stored in the Notebook's **Story** tab as a log, so the player can reread them.

## 7. The on-screen story system (what I would build)

- **Dialogue box** at the bottom of the screen: speaker label, text revealed gradually, Space/Enter/tap to continue, Esc to skip all. Text appears instantly if reduced motion is on.
- **Chapter card**: full-screen at start and end, with the city card text.
- **Objective bar** at the top left ("Leave the airport"), updated at checkpoints.
- **Triggers** (data): `start`, `enter` (walk into a zone or near an encounter), `open` (open a lesson), `done` (word recorded), `end`.
- **Movement and sound pause** while a box is open; **no audio** unless the player asks (pillar 2); every beat is read once, then goes to the Story log.
- **Accessibility**: live region for screen readers, adjustable text size, never auto-advance faster than a reading speed.
- **Validator rule**: warn if a beat's text contains the English meaning of a word the player has not yet recorded (a leak check).

## 8. Technical plan (after approval)

1. Data: add `story` to the pack type (`chapter` metadata: number, lens, title word, card; `beats`; `objectives`). Content, not code.
2. Progress shared across chapters of one language (`language: "da"`), so the Nyhavn pilot becomes Chapter 2 and keeps its save.
3. New pack `da-1` for this chapter; its lexicon imports shared Danish entries so words are not duplicated.
4. Scenery: an **Airport** component on three terraces (arrivals, ticket hall, platform), pastel and flat, using the existing terrace layout helpers.
5. UI: `StoryBox`, `ObjectiveBar`, `ChapterCard`, Story log in the Notebook.
6. Validator and tests: beats are valid, triggers reference real encounters, leak check, reachability and visibility for the new layout. Engine tests stay on the template pack.
7. Browser checks for the flow, and a visibility check for the new world.
   Estimated work: one session for data and story UI, one for the airport scenery. [Guessing]

## 9. Risks

- **Narration vs "nobody translates".** The text must describe, not explain. The validator can only catch obvious leaks; you must read it.
- **Too many words too early.** Ten words in five encounters is close to the pilot's pace, but the first chapter is a learner's first contact; I would cut _dør_ if playtests show overload.
- **Danish accuracy.** _ankomst, afgang, udgang, dør, billet, metro, tog, hvor, er_ and the forms _udgangen, metroen_ are common words that I expect to be right, but the IPA, stød and sound notes are unverified. Your review is required.
- **Real airport signage** is bilingual in life. The fiction (English painted over) is a surreal choice; say if you prefer realism.

## 10. Decisions I need

1. Approve the vocabulary and the final sentence _Hvor er metroen?_ (or change them).
2. Approve the chapter as a **separate pack sharing the Danish progress** (recommended) rather than merging everything into one pack.
3. Narration in **English only** (recommended), with a possible Danish layer at higher levels later.
4. Name the protagonist, or keep him "the researcher".
5. Stylised airport (recommended) or a closer copy of the real one.
