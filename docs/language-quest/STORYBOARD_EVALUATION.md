# Storyboard evaluation

Evaluates the outline in [NARRATIVE_DESIGN.md](./NARRATIVE_DESIGN.md) against the owner's request (requirements R1 to R14 listed there)
and against the game as built ([DESIGN.md](./DESIGN.md)). Confidence tags: **[Certain]** checked against a source or the code,
**[Likely]** strong inference, **[Guessing]** judgement.

## 1. Verdict first

**The outline is a strong premise and a weak production plan.** [Likely]
- It nails the *idea* (language as the key that unlocks layers of the city; the notebook becoming the manuscript) and fits the game's pillars better than most "history + vocabulary" pitches.
- It does **not** yet satisfy three things you explicitly asked for: **recreational activities**, **repeated** notebook-loss recall levels, and a worked **etymology side-quest** system. [Certain]
- It is **too big for the engine and the team as specified**: 12 chapters is roughly ten times the pilot, and nothing in it budgets vocabulary, sentences or verification effort. [Likely]
- Its biggest hidden risk is **linguistic, not narrative**: time-slip scenes imply speech in Old Norse or older Danish, which neither the game's voices nor the validated content can support. [Certain, see L1]
- It is Wes Anderson but only decoratively Calvino. [Guessing, see section 4]

## 2. Requirement scorecard

Rating: **Met**, **Partly**, **Missing**.

| ID | Requirement | Rating | Evidence and gap |
| --- | --- | --- | --- |
| R1 | Tied to the country; country as world selector | **Met** | Entire plot is Danish. The *structure* (language unlocks layers; the notebook becomes the text) transfers to other countries; the *content* does not, so each country needs its own myths and layers |
| R2 | History | **Partly** | Viking/early, medieval founding, a fire, the Golden Age, 1807. Nothing after 1850: no 20th century, occupation, welfare state, modern Denmark. History arrives mostly as dialogue about events, not as something the player deduces |
| R3 | Folk tales and myths | **Met** | Gefion, nisse, Holger Danske, Andersen. Caveat: the Little Mermaid and the Emperor's New Clothes are **authored** literary tales (Andersen), not folk tales; the outline treats them as folklore. Norse pantheon and the Saxo material (Amleth) are absent |
| R4 | Territory and culture, food, recreation | **Partly** | Food: one chapter, good. **Recreation: missing** (cycling is only scenery; no Tivoli, harbour swimming, allotment gardens, hygge, football). **Territory**: Copenhagen only; Kronborg is in Helsingør, not Copenhagen [Certain]; Jutland, the islands, Bornholm, Greenland and the Faroes do not appear |
| R5 | Surreal blend of modernity, folk and history | **Met** | The strongest part: boat beside a harbour bus, nisse with a phone, Holger annoyed by tourists |
| R6 | Modern frame, epoch travel to solve puzzles | **Met** | Clear mechanism: language triggers shifts |
| R7 | Time travel as etymology; side quest | **Partly** | Named and diagrammed in one line, but **no worked example** and no rules (how a player enters, what is shown, what is rewarded). It reads as promise, not design |
| R8 | Researcher seeking the first written tale of Denmark | **Partly** | Frame is right. But (a) the profession (anthropology) is never used: he does not do fieldwork, interview, or compare; (b) "first written tale" is dissolved into "a tradition", which is a good twist but contradicts the literal quest and is not anchored to any real text (see section 3) |
| R9 | Airport start; no language; communicates differently each time | **Met** for chapter 1 | Later chapters drift: the "must work out how to communicate" constraint is not varied per scene (gesture, written sign, third-party translation by a child, a menu) |
| R10 | Short memory; notebook records everything | **Partly** | Notebook: yes. **Short memory is never a mechanic** and is contradicted in the outline's own line "he learns that he actually remembers" (sequence 16). Decide whether it is a disability that improves, a running joke, or a mechanic (for example, things not written down fade) |
| R11 | Recall levels: notebook lost after consolidation | **Partly** | One loss, at about 75 % of the story. The request describes **levels** (plural) after consolidating words. One late test also gives the player no earlier evidence of whether they are learning |
| R12 | Language is the progression mechanism | **Met** (concept) | The ladder object → word → sentence → place → history → myth → memory is sound. **No puzzle is specified** beyond a theme and a word list |
| R13 | Wes Anderson + Calvino | **Partly** | See section 4 |
| R14 | Pilot in Denmark, set in Copenhagen | **Met** | |
| (fit) | Consistent with the game's pillars | **Partly** | See section 5 |

## 3. History and folklore: accuracy check

I checked what I could with web searches (below). Nothing here replaces a historian or a native Danish editor. [Certain] on items with a source; everything else is [Likely] or unchecked.

| Claim in the outline | Status | Note |
| --- | --- | --- |
| Gefion ploughed out Zealand | Supported | In the Prose Edda (Gylfaginning); also Heimskringla ([Gefjon](https://en.wikipedia.org/wiki/Gefjon)). The myth is Icelandic-recorded, not a Danish text, and the Copenhagen fountain dates from 1908 ([Gefion Fountain](https://en.wikipedia.org/wiki/Gefion_Fountain)) |
| Holger Danske sleeps under Kronborg | Supported, with a correction | Legend of the sleeping hero in the castle casemates ([Kronborg](https://kronborg.dk/en/knowledge/holger-the-dane)). Kronborg is at Helsingør, about 45 km from Copenhagen [Likely, distance not checked]. The casemates date from 1574-76, so "under the city" is a surreal relocation, which is fine if intentional. The outline's sleeping Holger is dated to a Danish-threat trigger, which fits "he wakes when Denmark is in danger" |
| Copenhagen fires | Supported | 1728 destroyed about 28 % of the city; 1795 burned 941 houses ([1728](https://en.wikipedia.org/wiki/Copenhagen_Fire_of_1728), [1795](https://en.wikipedia.org/wiki/Copenhagen_Fire_of_1795)) |
| Bombardment of Copenhagen, Napoleonic era | Supported | British bombardment 16 Aug to 5 Sep 1807 ([Wikipedia](https://en.wikipedia.org/wiki/Battle_of_Copenhagen_(1807))) |
| Tivoli (not in outline) | Supported | Founded 1843 ([Copenhagen Card](https://copenhagencard.com/attractions/tivoli-gardens)) |
| "First written tale of Denmark" | **Opportunity** | The large Jelling stone (about 965) is often called Denmark's birth certificate; the small one has the first use of "Denmark" ([National Museum](https://en.natmus.dk/historical-knowledge/denmark/prehistoric-period-until-1050-ad/the-viking-age/the-monuments-at-jelling/the-jelling-stone/); a recent Norwegian claim that it may not be Viking Age was disputed, see [Science Norway](https://www.sciencenorway.no/archaeology-culture-history/denmarks-iconic-runestone-from-the-viking-age-may-not-actually-be-from-the-viking-age-claims-a-norwegian-archaeologist/2454268)). Saxo Grammaticus's *Gesta Danorum* (about 1200) is the first full history of Denmark and contains the Amleth tale behind *Hamlet* ([Saxo](https://en.wikipedia.org/wiki/Saxo_Grammaticus), [text](https://www.gutenberg.org/files/1150/1150-h/1150-h.htm)). A fictional manuscript anchored to these would feel earned |
| Andersen, Little Mermaid, Emperor's New Clothes | Not searched | Andersen's tales are authored literature (1830s-40s) [Likely]. Check dates and tale-to-statue links with a source before writing |
| Copenhagen's founding by Absalon (about 1167) | **Not verified** | My search returned nothing on it. Treat as unchecked [Likely] |
| "København" as "merchants' harbour" (an obvious etymology quest) | **Not verified** | Widely stated, not sourced here. Would make a very good first etymology quest if confirmed |
| 1728 fire and lost manuscripts | **Unverified but promising** | A source page I found is titled "Arni Magnusson and the Great Fire of Copenhagen 1728" ([page](http://www.germanicmythology.com/original/CopenhagenFire.html)); I did not read it. If correct, a real manuscript-loss event sits exactly where the outline puts its "fire destroys the fragment" scene |

## 4. Style: Anderson and Calvino

- **Anderson** [Likely]: strong. Deadpan, notebooks, symmetric miniature tableaux, understated absurdity, even the bakery-shopping-list gag.
- **Calvino** [Likely]: only atmospheric ("layers of the city"). *Invisible Cities* has a **structure**: a traveller describes cities to a listener, grouped by recurring themes. I recall the groups as Memory, Desire, Signs, Trading, Eyes, Names, the Dead, the Sky, Continuous and Hidden cities; check against the text before using them as chapter titles.
- **Proposal:** make each chapter an "invisible Copenhagen" with one Calvino theme, which also gives each chapter a *language* theme:
  Signs (airport, metro: reading), Names (medieval: the city's name and etymology), Memory (the fire: lost texts), Desire (food), Eyes (Emperor's clothes: describing), the Dead (Holger), Hidden (the archive). This ties literary style to learning objectives instead of decorating them.

## 5. Fit with the existing game

| Issue | Severity | Detail and options |
| --- | --- | --- |
| **L1: speech in past eras** | High | The game keeps real languages **strict**: no matching voice, no sound. No browser voice speaks Old Norse or Old Danish, and nobody has verified such content. Options: (a) past characters speak simplified modern Danish with archaic *written* forms shown as clues (recommended); (b) past scenes are written-only; (c) commission recordings. Do **not** present synthesised "Old Danish" as authentic |
| **Pillar 1 vs outline quotes** | Medium | The outline's best lines (Holger's monologue, the Andersen aphorism) are long, abstract English. In-game they must be short Danish the player can infer. Rewrite them as *scenes with gestures and objects*, keeping the English as writers' intent only |
| **Pillar 1 vs etymology** | Medium | Showing an older word form is a translation-like reveal. Make the older form an *observable clue* (an inscription on an object) the player must connect, still graded by consistency, not told |
| **Scope** | High | The pilot is 5 encounters, 15 words, about 25 minutes. 12 chapters at 4 to 5 encounters each is about 50 to 60 encounters, 150 to 200+ words and several hours [Likely, arithmetic]. Every word needs native-speaker verification (the pilot's is still unverified). Ship a vertical slice first |
| **Vocabulary budget** | High | No target lexicon, grammar sequence or sentence list. Without it chapters can't be validated (the validator already requires clue support, decoys and a finale using met words) |
| **Short memory** | Medium | Pick a role for it (see R10). A concrete option: unrecorded evidence expires between chapters |
| **Recall levels** | Medium | Needs a recall mode in the engine (notebook and dictionary hidden; unaided successes logged). Place several: after chapters 3, 6, 9 and 11, each harder, with the last the finale |
| **Twist** | Low | "The notebook is the manuscript" works and echoes familiar book-about-the-book stories, so execution carries it. Plant it early: the photocopied fragment's handwriting; the "FIRST WORD: UNKNOWN" line reappearing as the last page |
| **Duplicate line** | Trivial | In the source outline, "He learns the history." appears twice in the Copenhagen-as-antagonist passage |
| **Existing pilot** | Opportunity | The built pilot already contains an **archivist** and an **archive door**, a harbour master and a locked gate. They can become chapter 2 and plant the final archive (Act V) |

## 6. Proposed revisions (for owner approval)

1. **Add a recreation chapter** (for example Tivoli, founded 1843, or cycling and harbour life) and a **territory** beat (a ferry or train out of the city to a second place, with Kronborg and Holger as the destination rather than an underground fantasy).
2. **Anchor the manuscript** to a real text family (runic inscription tradition, Saxo and Amleth) while keeping the manuscript itself fictional. The twist then reads as "a real tradition of retelling", not just a trick.
3. **Make recall levels recurring** (four, increasing difficulty) and give the short-memory trait a mechanic.
4. **Use Calvino's structure** (one theme per chapter) as the story's backbone.
5. **Cut or merge**: combine Gefion and the Viking shoreline into one chapter; combine the fire and the bombardment into one "history" chapter with two eras; keep Andersen's tale as an optional side quest. That gives 9 chapters.
6. **Fix R9**: give each chapter a different communication constraint (written sign only, a child interpreter, a menu, a noisy market, a phone call).
7. **Add a 20th-century beat** or state clearly that modern history is out of scope.

### Suggested staging
| Stage | Content | Why |
| --- | --- | --- |
| 1: pilot (exists) | Nyhavn: water, cups, key, gate, archivist | Done; reuse as chapter 2 |
| 2: vertical slice | Airport and metro (new world layout), Nyhavn, one time-slip (shoreline) with a first etymology quest, one recall level | Tests every new mechanism once |
| 3 | Gefion/Viking, food, a first folk tale, second recall level | Content depth |
| 4 | History chapter, fairy-tale chapter, Holger, lost-notebook level | Climax |
| 5 | Archive, finale, coda | Payoff |

### Pilot slice: concrete mapping (proposal)
| Existing encounter | New narrative role |
| --- | --- |
| Quay water pump (vand) | First proof that watching works (after the airport) |
| Coffee kiosk (kop, kopper) | Plural pattern; sets up the later food chapter |
| Harbour master (jeg har / ikke en nøgle) | Negation; introduces the key as a recurring object |
| Harbour gate (porten er lukket, fordi) | First "because" sentence; the gate is where the first time-slip begins |
| Archive door (finale) | Reappears in Act V as the hidden archive; the archivist is the recurring guide |

## 7. Decisions needed from you (answered: see section 8)
1. Real or fictional first text (suggest: fictional manuscript, real tradition).
2. Past-era speech policy (suggest option (a) in L1).
3. Include recreation and a second location now or later?
4. Accept the 9-chapter cut and the staged delivery?
5. Who verifies Danish content (native speaker), and when?

## 8. Decisions log (owner answers)
1. Fictional manuscript within a real tradition: accepted.
2. Archaic forms only in etymology mode (cross-linguistic links allowed there); cross-language notebook when several languages are played: accepted. See [OPEN_WORLD_AND_QUESTS.md](./OPEN_WORLD_AND_QUESTS.md).
3. Recreation and a second location now: added to the revised map ([NARRATIVE_DESIGN.md](./NARRATIVE_DESIGN.md) section 8.1).
4. Nine chapters for now; open to LLM-driven side quests: designed with constraints ([OPEN_WORLD_AND_QUESTS.md](./OPEN_WORLD_AND_QUESTS.md) section 3).
5. All linguistic references gathered; content independent of dynamics: [CONTENT_ARCHITECTURE.md](./CONTENT_ARCHITECTURE.md). Reviewer: the owner, later.

Open concerns that the decisions do not remove:
- **LLM-generated side quests are the highest-risk item**: Danish accuracy and answer leakage. The design only works if target-language text comes from verified data (closed vocabulary and sentence bank), not from the model.
- Scope: 9 chapters plus open-ended quests is still many times the pilot. Stage it as in section 6.
- Real-time generation needs a backend or a user key; the current site appears static.
