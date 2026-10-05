/**
 * Language pack: everything the game needs to teach one language in one city.
 * The engine (world, lessons, notebook, dictionary) reads ONLY from a pack, so adding a language or a
 * story chapter means adding data, not code. See docs/language-quest/PACK_TEMPLATE.md.
 */

export type MeaningId = string;
export type WordId = string;
export type EncounterId = string;
/** Key into the picture library (maruPictures.tsx): a pictogram for an object, action or idea. */
export type PictureId = string;

/** A candidate meaning shown as a picture card in the notebook. The same library serves every language. */
export interface Meaning {
  id: MeaningId;
  label: string;
  picture: PictureId;
}

export type PartOfSpeech = "noun" | "verb" | "pron" | "adj" | "conj" | "adv" | "prep" | "det";

/** Where a fact about a word comes from, so that a reviewer can check it. Names and identifiers only: never invent a reference. */
export interface SourceRef {
  /** Short name of the reference work or person, e.g. "Den Danske Ordbog". */
  work: string;
  /** Entry, page, headword or URL the reviewer can open. */
  locator?: string;
  /** What it backs: spelling, pronunciation, meaning, grammar or etymology. */
  supports: ("spelling" | "sound" | "meaning" | "grammar" | "etymology")[];
}

/** One step in a word's history, shown only in etymology mode. Older forms are written evidence, never spoken. */
export interface EtymologyStep {
  /** Language of the form, as a name or code ("Old Norse", "Old English", "German"). */
  language: string;
  form: string;
  /** Approximate period, e.g. "c. 1100". Leave empty if not known. */
  period?: string;
  /** What it meant or referred to then. */
  gloss?: string;
}

export interface LexiconEntry {
  id: WordId;
  /** How the word is written in the world (spelling for alphabetic scripts; for glyph scripts the romanisation the glyph renderer draws). */
  written: string;
  /** What the player transcribes in the sound task, in `pack.notation` (IPA for Danish, romanisation for Maru). */
  sound: string;
  /** Other transcriptions accepted as correct (variants, common learner notation). */
  alsoAccept?: string[];
  /** Text sent to speech synthesis if it should differ from `written`. */
  speak?: string;
  /** The true meaning. The game never reveals it directly; it is checked against the player's hypothesis. */
  meaning: MeaningId;
  /** Meanings counted as "close but incomplete" (e.g. "door" for "gate"). */
  alsoMeaning?: MeaningId[];
  pos: PartOfSpeech;
  /** Grammar note revealed in the notebook once the word is recorded. */
  note?: string;
  /** True only after a native speaker / authoritative dictionary confirmed `sound` and `speak`. */
  verified?: boolean;
  /** References a reviewer can use to check this entry. Empty until someone adds them. */
  sources?: SourceRef[];
  /** History of the word (oldest first), used by etymology mode and the cross-language notebook. */
  etymology?: EtymologyStep[];
  /** Ids of related words in other packs ("cognates"), as "packId:wordId". Drives the cross-language notebook. */
  cognates?: string[];
}

/**
 * What the player can observe that helps contextualise a word. Each clue is tagged with the meanings it is
 * compatible with; the notebook computes confidence from the clues the player actually noticed.
 */
export type ClueKind = "object" | "action" | "gesture" | "writing" | "contrast" | "context";

export interface Clue {
  id: string;
  kind: ClueKind;
  /** One or two sentences, no target-language words that give the answer away. */
  text: string;
  picture: PictureId;
  /** Meanings this clue is compatible with. An empty list makes it a decoy (noticing it teaches nothing). */
  supports: MeaningId[];
  /** Words this clue is about (used to group clues in the notebook). */
  about?: WordId[];
}

export interface Encounter {
  id: EncounterId;
  name: string;
  /** Short phase label for the HUD, e.g. "Observe", "Connect". */
  phase: string;
  /** Ground position in metres (x east, z south). Also drives the map screen. */
  position: [number, number, number];
  /** Where the player stands when studying this encounter. */
  approach: [number, number];
  /** Encounter that must be completed first (the story's dependency chain). */
  requires?: EncounterId;
  /** Scene description. Must not contain the target words. */
  scene: string;
  /** What the NPC says, in the target language, as written text. Spoken only when the player asks to listen. */
  say: string[];
  clues: Clue[];
  /** Words the player must transcribe (the sound task). */
  drills: WordId[];
  /** Words that appear in `say` and are heard but not dictated (function words, repeats). */
  exposure?: WordId[];
  /** Shown after completion. */
  reveal: { line: string; discovery: string };
}

/** One entry of the phonetic dictionary. */
export interface PhonemeEntry {
  symbol: string;
  kind: "vowel" | "consonant" | "prosody";
  /** e.g. "close front rounded vowel" */
  name: string;
  /** Plain-language articulation / contrast note. */
  how: string;
  /** Real words of the language that contain the sound; `speak` plays them. */
  keywords: { written: string; sound: string; gloss?: string }[];
  /** Spelling-to-sound warning for learners. */
  spelling?: string;
  /** Sounds that this one is commonly confused with. */
  confusableWith?: string[];
}

export interface Notation {
  kind: "ipa" | "romanisation";
  label: string;
  /** Short help text under the input field. */
  help: string;
  /** Symbols on the on-screen keyboard, in display order. */
  keyboard: string[];
  /** Characters ignored when grading (stress marks, length, glottal stop...). */
  ignore: string;
  /** Groups of symbols treated as the same sound when grading leniently (e.g. ["ɔ","ʌ","o"]). */
  equivalent?: string[][];
}

/** Sentence the player must produce in the final encounter. */
export interface Finale {
  encounter: EncounterId;
  prompt: string;
  /** Word ids in the correct order. */
  target: WordId[];
  /** Word ids in the order they are offered. */
  shuffled: WordId[];
  /** Plain-English meaning, revealed on success. */
  translation: string;
  successLine: string;
}

export interface PaletteSpec {
  /** Colours of the 3D world. Pastel, flat and tied to the place (see docs/language-quest/PACK_TEMPLATE.md §8). */
  ground: string;
  street: string;
  plaza: string;
  /** The sea around the floating terraces. */
  water: string;
  /** Background gradient behind the scene, top to bottom. Also the colour distant things fade into. */
  sky: [string, string];
  fog: string;
  /** Colour of fine detail: window glass, shadows of openings. */
  ink: string;
  /** Hex colours of figures' cloaks etc. */
  cloaks: string[];
  accent: string;
  light: { ambient: string; hemiSky: string; hemiGround: string; sun: string };
  /** Relative strength of the ambient light and the sun (default 0.5 each). Lower ambient and higher sun give a moodier, higher-contrast scene. */
  ambientLevel?: number;
  sunLevel?: number;
  /** Colour of lit windows and lamps: the warm light that makes a dusky scene feel inhabited (default a warm amber). */
  glow?: string;
}

export interface UiSpec {
  ink: string;
  inkSoft: string;
  paper: string;
  paperDeep: string;
  accent: string;
  accentText: string;
  gold: string;
  good: string;
  muted: string;
  /** Corner wash over the scene, as an rgba() string. */
  wash: string;
  halftone: string;
}

/** The five kinds of "living character": silhouettes built from the shape of a letter of the language's own script. */
export type Archetype = "gatekeeper" | "elder" | "messenger" | "merchant" | "scholar";

export interface NpcSpec {
  position: [number, number, number];
  color: string;
  /** Draw this person as a letterform silhouette. Without it the person is a plain cloaked figure. */
  archetype?: Archetype;
  /** The letter the silhouette is built from (for example "Ø"). Used for descriptions; the shape comes from `archetype`. */
  letter?: string;
  /** The encounter this person gives (their letter opening glows while it is the next step). */
  encounter?: EncounterId;
  scale?: number;
  facing?: number;
  tool?: "key" | "spear" | "cup" | "none";
}

export interface SignSpec {
  /** Word ids written on the sign; drawn as glyphs or lettering depending on `pack.script`. */
  words?: WordId[];
  /** Decorative lettering that is not a lexicon word (a street or shop name). Ignored by glyph scripts. */
  text?: string;
  position: [number, number, number];
  rotationY?: number;
  width?: number;
}

export interface BuildingSpec {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
  roof: string;
  /** Position[1] is the height of the terrace the building stands on. */
  /** Which sides carry windows (sandstone scenery) or which side the gable faces (nyhavn scenery). */
  faces?: ("n" | "s" | "e" | "w")[];
  /** Optional shop awning / door colour (nyhavn). */
  trim?: string;
  /** "wall" is a plain rampart (the gate wall); default "house". */
  kind?: "house" | "wall";
}

export type SceneryKey = "sandstone" | "nyhavn" | "airport";

/**
 * A flat terrace floating above the sea. Terraces are stacked in height and joined by stairs, and are laid out so
 * that every walkable surface is visible from the isometric camera: tall things stand only on the far edges
 * (smaller x and smaller z), never on the near edges.
 */
export interface Tier {
  id: string;
  /** Extent in metres: [min, max]. x is east, z is south. */
  x: [number, number];
  z: [number, number];
  /** Height of the walking surface. */
  y: number;
  /** Colour of the walking surface and of the side walls (the walls fade towards the sea). */
  color: string;
  side: string;
}

/** A ramp (drawn as steps) between two heights. `y0` is at the smaller coordinate of `axis`, `y1` at the larger. */
export interface Stair {
  axis: "x" | "z";
  x: [number, number];
  z: [number, number];
  y0: number;
  y1: number;
  color?: string;
}

export interface WorldSpec {
  scenery: SceneryKey;
  tiers: Tier[];
  stairs: Stair[];
  palette: PaletteSpec;
  buildings: BuildingSpec[];
  npcs: NpcSpec[];
  signs: SignSpec[];
}

/**
 * A piece of story text shown on screen like an RPG dialogue box. Beats describe what happens; they never translate:
 * `validate.ts` warns when a beat names the meaning of a word the pack teaches.
 */
export interface StoryBeat {
  /** Unique within the language (prefix it with the pack id). Remembered as "seen". */
  id: string;
  /**
   * start: when the player first enters the chapter. enter: when they come near an encounter. done: when an encounter is
   * recorded (the finale encounter counts when its sentence is solved). end: after the finale, as a closing card.
   */
  trigger: "start" | "enter" | "done" | "end";
  encounter?: EncounterId;
  /** Who is speaking, shown as the label of the box. */
  speaker: string;
  text: string;
  /** "card" is a full-screen chapter card instead of a bottom dialogue box. */
  kind?: "box" | "card";
  /** Title line of a card. */
  title?: string;
  /** Updates the objective bar when this beat is shown. */
  objective?: string;
}

export interface Story {
  /** The lead character, used in the data only so that writers can keep names consistent. */
  protagonist: string;
  beats: StoryBeat[];
}

export interface LanguagePack {
  id: string;
  /** Packs of one language share the player's progress (words, notes, guesses). Defaults to `id`. Encounter ids must be unique across them. */
  language?: string;
  /** Position of this pack in the language's story, shown on the map screen. */
  chapter?: { number: number; title: string };
  /** English name, e.g. "Danish". */
  name: string;
  /** Endonym, e.g. "Dansk". */
  nativeName: string;
  city: string;
  /** Where the story is set, shown on the map screen. */
  district: string;
  /** The map-screen paragraph: who the player is and what to do. Written per pack so the engine has no language-specific text. */
  intro: string;
  script: "latin" | "glyph";
  speech: {
    /** BCP-47 tag for speech synthesis (what the player hears). */
    synth: string;
    /** BCP-47 tag for speech recognition (what the player says). Use the nearest real language for invented ones. */
    recog: string;
    rate?: number;
    /**
     * Real languages should set this: without a voice for `synth` the game stays silent (and explains how to install
     * one) instead of letting the browser read the text with its default, usually English, voice.
     */
    strict?: boolean;
    /** A short, certainly-correct phrase used by the voice test button. Required when `strict`. */
    testPhrase?: string;
  };
  notation: Notation;
  phonology: PhonemeEntry[];
  meanings: Meaning[];
  lexicon: LexiconEntry[];
  encounters: Encounter[];
  finale: Finale;
  ui: UiSpec;
  world: WorldSpec;
  /** What a human must still check before this pack is trusted (shown in the dictionary). */
  verification: { status: "verified" | "unverified"; note: string };
  /** Sources used for the content. */
  sources: string[];
  /** Story text shown at checkpoints. Optional: a pack without it plays as before. */
  story?: Story;
}

export type Pack = LanguagePack;
