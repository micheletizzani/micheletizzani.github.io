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
  /** Ground, street, plaza, water, sky/fog colours of the 3D world. */
  ground: string;
  street: string;
  plaza: string;
  water: string;
  fog: string;
  /** Outline ink. */
  ink: string;
  /** Hex colours of figures' cloaks etc. */
  cloaks: string[];
  accent: string;
  light: { ambient: string; hemiSky: string; hemiGround: string; sun: string };
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

export interface NpcSpec {
  position: [number, number, number];
  color: string;
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
  /** Which sides carry windows (sandstone scenery) or which side the gable faces (nyhavn scenery). */
  faces?: ("n" | "s" | "e" | "w")[];
  /** Optional shop awning / door colour (nyhavn). */
  trim?: string;
  /** "wall" is a plain rampart (the gate wall); default "house". */
  kind?: "house" | "wall";
}

export type SceneryKey = "sandstone" | "nyhavn";

export interface WorldSpec {
  scenery: SceneryKey;
  palette: PaletteSpec;
  buildings: BuildingSpec[];
  npcs: NpcSpec[];
  signs: SignSpec[];
}

export interface LanguagePack {
  id: string;
  /** English name, e.g. "Danish". */
  name: string;
  /** Endonym, e.g. "Dansk". */
  nativeName: string;
  city: string;
  /** Where the story is set, shown on the map screen. */
  district: string;
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
}

export type Pack = LanguagePack;
