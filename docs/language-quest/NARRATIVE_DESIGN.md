# Language Quest: narrative design and storyboard concept

Status: **concept, not built.** The playable pilot (Nyhavn, five encounters, [DESIGN.md](./DESIGN.md)) exists; this
document describes the larger story it is meant to grow into. The outline below was supplied by the project owner (written in an
external chat session from the owner's brief) and is reproduced here in structured form. Evaluation, risks and proposed
changes are in [STORYBOARD_EVALUATION.md](./STORYBOARD_EVALUATION.md). Historical claims are not yet fact-checked in full; see the
verification table there.

## 1. The brief (requirements the story must meet)

| ID | Requirement (from the owner's request) |
| --- | --- |
| R1 | A story strongly tied to the country of the language (the country acts as the world selector) |
| R2 | Includes the country's history |
| R3 | Includes folk tales and myths |
| R4 | Explores the territory and culture, including food and recreational activities |
| R5 | A fantasy/surreal world where modernity, folk tales and historical events coexist |
| R6 | Narrative in modern time; the character travels across epochs and tales to solve puzzles |
| R7 | Time travel is also the mechanism for etymology, and can be a side quest |
| R8 | Protagonist: a researcher (anthropology, ancient history) seeking a lost manuscript with the first written tale of Denmark |
| R9 | Starts at the airport; he does not speak the language and must work out how to communicate each time |
| R10 | Short memory; everything is recorded in the notebook (hints, meanings, concepts) |
| R11 | Later "recall" levels: after words are consolidated the notebook is lost and must be found using what he learned |
| R12 | Progress requires learning words, sentences and culture (language is the mechanism, not a side subsystem) |
| R13 | Style: Wes Anderson and Calvino's *Invisible Cities* |
| R14 | Pilot in Denmark, game set in Copenhagen |

## 2. Working title and premise
**The Manuscript of Copenhagen** (tagline in the outline: *Every city remembers in a different language.*)

An anthropologist-historian lands in Copenhagen to find **The First Story**, a manuscript known only from an obscure
catalogue reference. He cannot read Danish, remembers little from one hour to the next, and suspects the manuscript is
hidden so that someone who does not understand the language cannot find it. His notebook is his external memory and
gradually becomes a map of the city "written partly in Danish, partly in history, and partly in myth".

## 3. Core narrative rule
Copenhagen has **layers**. A street corner becomes a medieval market, a harbour a Viking shoreline, a statue speaks. The
city does not travel through time; **the protagonist does, and the transitions are triggered by language**.

Progression ladder: **object → word → sentence → place → history → myth → memory.**
The player should never think "now we learn Danish history". The chain is: *I need to understand this person → I need this
word → this word appeared somewhere else → why is it here → that is why this place exists → that is what the manuscript means.*

**Copenhagen is the antagonist** in a puzzle sense: it keeps changing the question (find a manuscript → learn a word →
understand a person → go to the past → learn the myth → lose the notebook) until the player can read it. The player does
not conquer the city; the player learns to read it.

## 4. Storyboard: five acts

Format: *Sequence → setting → what happens → language function → mechanic*. Dialogue lines below are story intentions in
English; in the game every character line is in the target language only, with no translation (pillar 1).

### Act I: Arrival ("a city with no subtitles")
| # | Sequence | Beat | Language function | Mechanic |
| --- | --- | --- | --- | --- |
| 1 | Airport | Lands with a suitcase, a notebook and a photocopied fragment with one unreadable sentence. Writes "FIRST WORD: UNKNOWN". Everything around him is in Danish. First puzzle: leave the airport. | Survival words: ticket, train, door, person, direction | Observe-Sound-Meaning loop. Comic beat: he writes one word three ways; later learns they were the same word |
| 2 | Metro / Copenhagen Central | Bicycles, harbour water, cafés, bakeries. A station-sign word he already knows now looks *older*; the station disappears. | Everyday objects | First hint of layers |
| 3 | First time-shift: shoreline, c. 800-1100 | No harbour, no metro; water, boats, timber, mud. He recognises one sound from his notebook. | Words reused across time | Revelation: "modern Danish contains ghosts of older Danish" |
| 4 | Gefion | A mythological presence reshaping the land (the Zealand ploughing story). | Land, water, earth, animals, movement | Action-vocabulary puzzle; "the landscape itself is a story" |

### Act II: The city under the city
| # | Sequence | Beat | Language function | Mechanic |
| --- | --- | --- | --- | --- |
| 5 | Etymology doorways | Certain modern words briefly reveal their older forms. | Word origins | **Etymology side quests**: modern word, older form, medieval object, Viking-age meaning, back to the modern word |
| 6 | Medieval Copenhagen (Slotsholmen) | A medieval character will only answer questions asked in Danish. First physical clue to the manuscript; it is not there. Message: *"You are looking for the first story. You should first learn how the story was told."* | who, where, what, give, come, go, here, there | Moves from "what does this word mean" to "what is this person asking me" |
| 7 | The nisse | A household spirit has stolen something and returns it only if the protagonist names what it wants. | Household, food, possession | Possession/everyday-language puzzle |
| 8 | The Mermaid | The statue is sometimes empty; she walks into the harbour and speaks Danish: *the manuscript is not where you think.* | Reconstruct a sentence from learned words | Compose puzzle |
| 9 | Food chapter (market, bakery, harbour café) | Invited to a meal he cannot follow. | What is offered, what he wants, does not want, is eating | Social-language puzzle: "language is not only information, it is participation" |

### Act III: The city remembers
| # | Sequence | Beat | Language function | Mechanic |
| --- | --- | --- | --- | --- |
| 10 | The Fire | A burning Copenhagen; documents are carried away. He finds a manuscript fragment; fire destroys all but one sentence. | What is happening, where to go, what is carried, what is lost | Applied vocabulary |
| 11 | The Golden Age | A writer (never named; the player infers Hans Christian Andersen) tells him: *"Perhaps you have misunderstood what a story is."* | Description | Identity by context clues |
| 12 | Inside a fairy tale (Emperor's New Clothes) | A world governed by linguistic rules: only people who can say see, look, true, false, clothes, person can progress. | See, look, true, false, clothes, person | Can he describe what everyone refuses to describe? Language as moral mechanism |

### Act IV: The wars of memory
| # | Sequence | Beat | Language function | Mechanic |
| --- | --- | --- | --- | --- |
| 13 | Copenhagen under attack (Napoleonic-era bombardment) | Reconstruct what civilians experienced, without spectacle. Another fragment: a drawing of a sleeping warrior. | shelter, fire, night, danger, help, home, family | Practical communication |
| 14 | Holger Danske | Descends underground to a gigantic sleeping warrior; "What year is it?" "Then I have been sleeping too long." He refuses the manuscript: *"You think the first story was written down. Perhaps it was written down after it had already been forgotten."* | Memory and identity | Central reversal: the manuscript records how stories change when the language changes |
| 15 | The notebook disappears | He wakes without it: no vocabulary, notes, clues. | Recall | First memory test |
| 16 | The lost-notebook level | He recognises places through words, signs, conversations, grammar, familiar objects, repeated phrases. The notebook is found on a bakery counter, used as a shopping list, covered in flour, one page missing. | Recall under uncertainty | **Recall level**: notebook UI hidden |

### Act V: The first story
| # | Sequence | Beat | Language function | Mechanic |
| --- | --- | --- | --- | --- |
| 17 | The archive | A hidden archive under Copenhagen. Books are organised by **words**, not dates, authors or places. | Words as the index | Exploration |
| 18 | Final puzzle | Every time-journey gave one piece of a sentence. Reconstruct it from vocabulary acquired across the whole game. | Complex sentence | The existing finale structure, extended |
| 19 | The twist | The manuscript is blank, then he sees his own handwriting: his notebook has become the manuscript. The "first story" was a tradition rewritten by every generation and language; he is its latest author. The last page is one sentence he understands without writing anything down. | Mastery | Payoff |
| 20 | Coda | Normal morning; he reaches the airport, reads a word from level one at once, and answers a little old man in Danish. Cut to black. | Closure | Mirror of the opening |

## 5. Chapter map (as supplied)
| Ch | Copenhagen layer | Cultural theme | Language function |
| --- | --- | --- | --- |
| 1 | Airport to centre | Modern Copenhagen | Survival vocabulary |
| 2 | Nyhavn | Harbour life, food, bicycles | Objects, actions |
| 3 | Medieval Copenhagen | Origins of the city | Questions and directions |
| 4 | Viking / early Denmark | Landscape and mythology | Past/present connections |
| 5 | Gefion | Danish mythology | Describing actions |
| 6 | Nisse | Folk traditions | Possession, everyday language |
| 7 | Fairy-tale Copenhagen | Andersen, storytelling | Description, negation |
| 8 | Historical Copenhagen | Fire, conflict, change | Practical communication |
| 9 | Holger Danske | National myth | Memory, identity |
| 10 | The lost notebook | Modern Copenhagen | Recall |
| 11 | The archive | All epochs | Complex sentences |
| 12 | The first story | The manuscript | Final language test |

## 6. Tone and look
Precise, whimsical, melancholic, slightly absurd (not merely cute): carefully composed miniature cities, exaggerated
architectural geometry, deadpan characters, tiny absurd details, muted pastel Copenhagen, handwritten notes, old maps,
objects behaving strangely, history staged like theatre tableaux. "A museum that forgot which century it is in": a Viking
boat passes a harbour bus, a medieval merchant complains about bicycles, a nisse uses a smartphone, Holger Danske is
annoyed by tourists photographing his statue. The world never explains itself; humour is understated.
This agrees with the existing art direction (flat pastel isometric terraces; [GAME_DESIGN_DOCUMENT.md](./GAME_DESIGN_DOCUMENT.md) section 5).

## 7. Mapping to the existing engine
| Narrative element | Engine today | Needed |
| --- | --- | --- |
| Encounter chain, clues, drills, finale sentence | Built (pack data) | A chapter = one pack-sized unit (a world plus encounters) |
| Notebook as persistent record | Built (words, sounds, story tabs) | A **recall mode** that hides notebook and dictionary and records unaided success |
| Epoch layers | Not built | One scenery and palette per epoch; transitions between worlds inside one story |
| Etymology quests | Not built | A side-quest type: word, older form shown as written evidence, scene, return |
| Many chapters with carry-over vocabulary | Single pack per language | Chapters sharing one lexicon and progress; unlock rules across chapters |
| Past-era speech | Browser voices for modern Danish only | Rule for archaic speech (see evaluation, risk L1) |

## 8. Owner decisions (applied)

| # | Decision | Effect on the design |
| --- | --- | --- |
| 1 | The manuscript is **fictional, within a real tradition** | Anchor it in real text families (runic inscriptions such as Jelling; medieval chronicle tradition such as Saxo's *Gesta Danorum*) while the manuscript itself is invented. The twist ("the notebook becomes the manuscript") reads as joining a real tradition of retelling |
| 2 | Archaic forms **only in etymology mode**, to connect to modern words; cross-linguistic influence allowed there. When several languages are played, records from other languages appear in the notebook so the player can guess by etymology and similarity | Past-era characters speak modern Danish only. See [OPEN_WORLD_AND_QUESTS.md](./OPEN_WORLD_AND_QUESTS.md) sections 1 and 2 |
| 3 | Add **recreation and a second location now** | Tivoli and harbour life become a chapter; a train journey to Helsingør (Kronborg and Holger) becomes the territory beat. See the revised map below |
| 4 | The 9-chapter plan is acceptable for now; the game must be **open to side quests** that improve and test the language, ideally an open world with interactions loaded by an LLM from small instructions on the interactive elements | See [OPEN_WORLD_AND_QUESTS.md](./OPEN_WORLD_AND_QUESTS.md) section 3 |
| 5 | Include **all linguistic references** to make the Danish as accurate as possible (the owner will review later); the structure must let content change without affecting dynamics or design | See [CONTENT_ARCHITECTURE.md](./CONTENT_ARCHITECTURE.md) |

### 8.1 Revised chapter map (9 chapters, Calvino themes)
Themes follow the groups of *Invisible Cities* (see [CALVINO_GUIDE.md](./CALVINO_GUIDE.md), which also gives the style rules and a draft city card per chapter). Time-slips and etymology
are side content inside chapters; the main chain stays in modern Danish.

| Ch | Place and layer | Calvino theme | Culture | Language function | Recall level after |
| --- | --- | --- | --- | --- | --- |
| 1 | Airport and metro | Signs | Modern Copenhagen, transport | Survival words, reading signs | |
| 2 | Nyhavn (the built pilot) | Names | Harbour, bicycles, coffee; the city's name | Objects, plural, negation, "because" | R1 (short) |
| 3 | Slotsholmen, the medieval city, and the fire | Memory | Origins; a real manuscript-loss history (to be verified) | Questions, directions | |
| 4 | Market and bakery | Desire | Food: bread, pastries, open sandwiches, coffee | Offers, wants, quantities | R2 |
| 5 | Shoreline and Gefion | Thin | Myth; landscape | Actions, land and water words | |
| 6 | **Tivoli and the harbour** (new) | The Sky (and Trading) | **Recreation**: amusement, harbour swimming, cycling | Tickets, prices, games, invitations | R3 |
| 7 | Andersen's Copenhagen (the fairy-tale chapter) | Eyes | Literature; the Little Mermaid, the Emperor's New Clothes (authored tales) | Describing, true and false | |
| 8 | **The train north**: Helsingør, Kronborg, Holger Danske | The Dead | **Territory**; national myth | Time, memory, identity | R4 (the big one) |
| 9 | The archive and the first story | Hidden (coda: Continuous) | All layers | Complex sentences, finale | final |
Side quests, anywhere: the nisse (household vocabulary), more recall errands, etymology doorways, culture errands (all card-driven; see the open-world design).

### 8.2 Still open
1. Which real texts exactly anchor the manuscript (a historian should advise).
2. Exact word list per chapter (target about 15 words per 5 encounters, as in the pilot).
3. Whether the 20th century stays out of scope (the owner accepted the current plan).
4. Reviewer for Danish and for history.
