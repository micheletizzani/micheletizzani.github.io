# Content architecture and linguistic accuracy

Goal (owner decision): **gather every available linguistic reference so the Danish is as accurate as possible, and structure the
game so that correcting the Danish never changes the game's dynamics or design.** The owner will review the Danish later.

## 1. The three layers

| Layer                            | What it is                                                                                                                                                                   | Changes when…                                       | Where                                              |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | -------------------------------------------------- |
| **Engine (dynamics)**            | Lesson loop, grading, evidence meter, notebook, navigation, camera, rendering. Contains no language                                                                          | The design changes                                  | `src/components/tools/lingua/*.ts(x)`, `world/`    |
| **Rules (the contract)**         | The pack types and the validator: what any content must satisfy for the dynamics to work (clue support, decoys, finale from known words, contrast, reachability, visibility) | The design changes                                  | `packs/types.ts`, `packs/validate.ts`              |
| **Content (language and story)** | Spellings, IPA, meanings, grammar notes, etymologies, clues, scenes, sentences, colours                                                                                      | A reviewer corrects Danish; a writer adds a chapter | `packs/da.ts`, `packs/el-language.ts`, `packs/el1.ts`, future story packs |

Rule of thumb: **fixing a spelling, a transcription, a meaning or a clue must need a content edit only, and the validator must tell you
whether the edit still satisfies the design.** If an edit needs a code change, that is a bug in the architecture.

### 1.1 What was done in this iteration

- Unit tests no longer use Danish or Greek: engine tests run on the template pack and on inline fixtures, so correcting real content cannot break tests of the dynamics. Content is checked only by the validator (`npm run packs:check`). [Certain: 20 tests pass.]
- Two places where the engine knew about Danish were removed: the map-screen paragraph (now `pack.intro`) and the map-water colour (now `pack.world.palette.water`).
- The pack type gained optional fields for references and history: `sources`, `etymology`, `cognates` on each word, plus `intro` on the pack (see section 3). Nothing yet reads `sources`/`etymology`/`cognates`; they are the data contract for the features in [OPEN_WORLD_AND_QUESTS.md](./OPEN_WORLD_AND_QUESTS.md).

### 1.2 Remaining couplings (known)

- **Browser end-to-end scripts** (`scripts/e2e/danish-*.mjs`, `voices.mjs`) click through real Danish content (for example they type `vand`). They are _content acceptance tests_ and will need updating when words change. Fix when it matters: register a hidden fixture pack (the template) under a query parameter and run engine e2e on it.
- **Scenery keys** (`nyhavn`, `sandstone`) are art styles, not languages, but they are named after places; a new city needs a new scenery component.
- **Map art** (`CityMapArt.tsx`) is Copenhagen-specific.
- **Spoken-guess folding** in `maruPhonetics.ts` folds æ/ø/å because recognisers return Danish spellings. It is language-aware; a new language with other special letters needs its own folding table (data, later).

### 1.3 Proposed next split (not built)

Separate _language data_ from _story data_: `language/da/` (lexicon, phonology, etymology, sources, review status) shared by every Danish story, and `story/<id>/` (encounters, world, finale, side quests) that only refer to word ids. Then a linguist can edit `language/da/` without touching any story, and a writer can build stories without touching spellings. The validator already checks the references between the two.

## 2. Accuracy workflow

Each fact about a word has a **status**, today collapsed to `verified: boolean` per word and `verification.status` per pack.

| Field                             | Needs checking against                                                                                                           |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `written` (spelling, inflection)  | Retskrivningsordbogen (official spelling), Den Danske Ordbog                                                                     |
| `sound` (IPA) and `speak`         | Den Danske Ordbog pronunciation, Danish phonetics literature, a native speaker; the phoneme descriptions in `phonology` likewise |
| `meaning`, `alsoMeaning`          | Den Danske Ordbog definitions                                                                                                    |
| `note` (grammar)                  | Retskrivningsordbogen for inflection; a grammar reference                                                                        |
| `etymology`                       | Etymological dictionaries; for Old Norse forms, the ONP and runic databases                                                      |
| Example sentences (`say`, finale) | A native reader, plus corpus evidence that the sentence is natural                                                               |

Suggested procedure for each pack:

1. Fill `sources` for each word as you check it (work name and locator only; see section 4).
2. Change `verified` to `true` only when sound and speech text were confirmed by an authoritative source or a native speaker.
3. Run `npm run packs:check`. The validator refuses a pack that says `verified` while any word is not.
4. Listen to every word with the target voice on at least two devices.
5. Record who reviewed and when, in `verification.note`.

**Honesty rule:** the notebook and Voice panel label unverified content. Keep that label until a human has checked it.
**LLM caution:** [Certain] language models, including the one that helped draft these documents, make mistakes in Danish spelling,
IPA and especially stød and etymology. Treat anything generated as a draft for the reviewer, never as a source.

## 3. Data contract for references (implemented as types)

```ts
// packs/types.ts
interface SourceRef {
  work: string;
  locator?: string;
  supports: ("spelling" | "sound" | "meaning" | "grammar" | "etymology")[];
}
interface EtymologyStep {
  language: string;
  form: string;
  period?: string;
  gloss?: string;
} // oldest first
interface LexiconEntry {
  /* existing fields */
  sources?: SourceRef[]; // what a reviewer should open
  etymology?: EtymologyStep[]; // used by etymology mode (written evidence only, never spoken)
  cognates?: string[]; // "packId:wordId", used by the cross-language notebook
}
interface LanguagePack {
  /* existing fields */ intro: string;
}
```

## 4. Reference list (to gather and cite)

I confirmed through web searches that these exist and what they cover. I have **not** read their entries for any word in the game.
Add entry-level locators yourself when you check a word.

**Modern Danish: spelling, meaning, usage**

- [Den Danske Ordbog](https://ny.ordnet.dk/ddo/) (DSL): corpus-based dictionary of Danish from 1950 to today, with a corpus of more than 1.2 billion words. Use for meaning, pronunciation notes, usage and examples.
- [Retskrivningsordbogen](https://www.dsn.dk/) (Dansk Sprognævn): the official spelling and inflection reference (published since 1955). Check the Sprognævn site for its current online edition.
- KorpusDK on [ordnet.dk](https://dsl.dk/projekter/ordnet.dk): a 56-million-word text collection for checking that a sentence is natural.

**Historical Danish**

- Ordbog over det danske Sprog (ODS), on ordnet.dk: 28 volumes (1918-56) plus supplements, covering Danish from 1700 to 1950; entries include etymology.
- Gammeldansk Ordbog (DSL): scholarly dictionary of medieval Danish, about 1100 to 1515; a preliminary version and the slip collection (nearly one million slips) are online at gammeldanskordbog.dk, and the project is still being edited ([DSL page](https://dsl.dk/diverse/sprog/ordboger-og-sprogteknologi/gammeldansk-ordbog)). I could not open the pages (blocked here), so the details come from search results.

**Etymology (Danish)**

- Niels Åge Nielsen, _Dansk etymologisk ordbog: Ordenes historie_ (Gyldendal; first published 1966, sixth edition 2010, ISBN 978-87-02-09830-3). Described as the most widely used Danish etymological dictionary, with about 13,000 headwords and literature references. See the [Danish Wikipedia entry](https://da.wikipedia.org/wiki/Dansk_etymologisk_ordbog) and a bookseller listing ([plusbog.dk](https://www.plusbog.dk/dansk-etymologisk-ordbog-niels-aage-nielsen-9788702098303)). It is a printed book: no free online version was found. Confirm the edition you can access.
- Edwin Jessen, _Dansk etymologisk Ordbog_ (1893), scanned on [Project Runeberg](https://runeberg.org/danetym/) and the Internet Archive. Free but old; use only as a lead, not as the authority.
- Den Danske Ordbog and ODS (above) both carry etymological information online.

**Old Norse and runic forms (etymology mode)**

- [ONP, Ordbog over det norrøne prosasprog](https://onp.ku.dk/onp/) (University of Copenhagen): Old Norse prose vocabulary, about 1150 to the end of the Middle Ages; free online.
- Scandinavian Runic-text Database / Samnordisk runtextdatabas ([Uppsala University](https://www.uu.se/institution/nordiska/forskning/projekt/samnordisk-runtextdatabas?languageId=1)): transliterated runic inscriptions.

**Still not located**: a corpus of spoken Danish for stød examples; a Danish source of cognates in other languages (Nielsen's dictionary likely gives them, to be checked by the reviewer). Wikipedia and Wiktionary may help to find leads but should not be cited as the authority for a transcription.

## 5. Checklist for the reviewer

- [ ] Every `written` matches Retskrivningsordbogen (including inflected forms such as plurals and the definite form).
- [ ] Every `sound` is a defensible broad IPA transcription of standard Danish; `alsoAccept` lists only real variants. Decide how to treat stød.
- [ ] `phonology` entries (descriptions, keywords) are accurate; keywords are real words the voice speaks well.
- [ ] Every `meaning` and `alsoMeaning` is right and no clue gives the answer away.
- [ ] Every `say` line and the finale sentence is natural Danish (check against corpus examples).
- [ ] Grammar notes (`note`) are correct and use no unexplained jargon.
- [ ] For each word with an `etymology`: the form, language and period are attested in a cited work.
- [ ] `sources` filled; `verified` set only where earned; `verification.note` says who and when.
